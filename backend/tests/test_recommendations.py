"""Test candidate validation, provider order, and privacy-preserving prompts.

Workflow: replace upstream clients with mocks -> exercise provider/selection
logic -> verify trusted coordinates stay out of AI input and response records.
"""
import asyncio
import json
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from app import ai
from app.schemas import UserPreferences


def candidate(candidate_id="beach-1"):
    return {
        "candidate_id": candidate_id,
        "name": "Mission Bay",
        "category": "BEACH",
        "address": "Mission Bay, Auckland",
        "distance_meters": 250,
        "latitude": -36.8485,
        "longitude": 174.77,
    }


class RecommendationTests(unittest.TestCase):
    def test_provider_order_uses_each_gemini_project_once(self):
        settings = SimpleNamespace(
            gemini_api_keys=("key-one", "key-two", "key-three"),
            nvidia_api_key="nvidia-key",
        )
        with (
            patch.object(ai, "settings", settings),
            patch.object(
                ai,
                "_generate_gemini_text",
                side_effect=[
                    ai.ProviderError("unavailable"),
                    ai.ProviderError("authentication"),
                    '{"summary":"ok","recommendations":[]}',
                ],
            ) as gemini,
            patch.object(ai, "_generate_nvidia_text") as nvidia,
        ):
            result = ai._generate_text("prompt")

        self.assertEqual(result[1], "gemini")
        self.assertEqual(
            [call.args[0] for call in gemini.call_args_list],
            ["key-one", "key-two", "key-three"],
        )
        nvidia.assert_not_called()

    def test_quota_does_not_rotate_or_fall_through(self):
        settings = SimpleNamespace(
            gemini_api_keys=("key-one", "key-two", "key-three"),
            nvidia_api_key="nvidia-key",
        )
        with (
            patch.object(ai, "settings", settings),
            patch.object(
                ai,
                "_generate_gemini_text",
                side_effect=ai.ProviderError("quota"),
            ) as gemini,
            patch.object(ai, "_generate_nvidia_text") as nvidia,
        ):
            with self.assertRaises(ai.RecommendationError) as error:
                ai._generate_text("prompt")

        self.assertEqual(error.exception.code, "AI_QUOTA_EXCEEDED")
        gemini.assert_called_once_with("key-one", "prompt")
        nvidia.assert_not_called()

    def test_unavailable_gemini_projects_fall_back_to_nvidia(self):
        settings = SimpleNamespace(
            gemini_api_keys=("key-one", "key-two", "key-three"),
            nvidia_api_key="nvidia-key",
        )
        with (
            patch.object(ai, "settings", settings),
            patch.object(
                ai,
                "_generate_gemini_text",
                side_effect=ai.ProviderError("unavailable"),
            ) as gemini,
            patch.object(
                ai,
                "_generate_nvidia_text",
                return_value='{"summary":"ok","recommendations":[]}',
            ) as nvidia,
        ):
            result = ai._generate_text("prompt")

        self.assertEqual(result[1], "nvidia")
        self.assertEqual(gemini.call_count, 3)
        nvidia.assert_called_once_with("prompt")

    def test_malformed_gemini_response_falls_back_to_nvidia(self):
        settings = SimpleNamespace(
            gemini_api_keys=("key-one", "key-two", "key-three"),
            nvidia_api_key="nvidia-key",
        )
        with (
            patch.object(ai, "settings", settings),
            patch.object(
                ai,
                "_generate_gemini_text",
                side_effect=ai.ProviderError("malformed_response"),
            ),
            patch.object(
                ai,
                "_generate_nvidia_text",
                return_value='{"summary":"ok","recommendations":[]}',
            ) as nvidia,
        ):
            result = ai._generate_text("prompt")

        self.assertEqual(result[1], "nvidia")
        nvidia.assert_called_once_with("prompt")

    def test_prompt_excludes_user_and_place_coordinates(self):
        place = candidate()
        prompt = ai._recommendation_prompt(
            "Find a beach",
            UserPreferences(categories=["BEACH"]),
            {"status": "success", "temperature_celsius": 18},
            [place],
        )

        self.assertNotIn(str(place["latitude"]), prompt)
        self.assertNotIn(str(place["longitude"]), prompt)
        self.assertNotIn(place["address"], prompt)
        self.assertIn('"distance_meters": 250', prompt)
        self.assertIn(place["candidate_id"], prompt)

    def test_model_cannot_add_unknown_or_duplicate_candidates(self):
        place = candidate()
        invalid_responses = (
            {
                "summary": "Nearby",
                "recommendations": [
                    {"candidate_id": "invented", "relevance_rationale": "Nice"}
                ],
            },
            {
                "summary": "Nearby",
                "recommendations": [
                    {"candidate_id": "beach-1", "relevance_rationale": "First"},
                    {"candidate_id": "beach-1", "relevance_rationale": "Again"},
                ],
            },
        )
        for data in invalid_responses:
            with self.subTest(data=data):
                with self.assertRaises(ai.RecommendationError) as error:
                    ai._parse_model_response(json.dumps(data), [place])
                self.assertEqual(error.exception.code, "AI_INVALID_RESPONSE")

    def test_model_cannot_return_an_empty_summary(self):
        with self.assertRaises(ai.RecommendationError) as error:
            ai._parse_model_response(
                json.dumps({"summary": "  ", "recommendations": []}),
                [candidate()],
            )

        self.assertEqual(error.exception.code, "AI_INVALID_RESPONSE")

    def test_output_uses_verified_place_name_and_coordinates(self):
        place = candidate()
        response = json.dumps(
            {
                "summary": "Try this nearby beach.",
                "recommendations": [
                    {
                        "candidate_id": "beach-1",
                        "place_name": "Invented name",
                        "latitude": 0,
                        "longitude": 0,
                        "relevance_rationale": "It is nearby.",
                    }
                ],
            }
        )
        summary, recommendations = ai._parse_model_response(response, [place])

        self.assertEqual(summary, "Try this nearby beach.")
        self.assertEqual(recommendations[0].place_name, "Mission Bay")
        self.assertEqual(recommendations[0].latitude, place["latitude"])
        self.assertEqual(recommendations[0].longitude, place["longitude"])
        self.assertEqual(recommendations[0].distance_meters, 250)
        self.assertTrue(str(recommendations[0].directions_url).startswith("https://"))

    def test_location_lookup_is_capped_and_origin_is_not_in_prompt(self):
        place = candidate()
        captured = {}

        def generate_text(prompt):
            captured["prompt"] = prompt
            return (
                json.dumps(
                    {
                        "summary": "A nearby option.",
                        "recommendations": [
                            {
                                "candidate_id": "beach-1",
                                "relevance_rationale": "A close waterfront walk.",
                            }
                        ],
                    }
                ),
                "gemini",
            )

        with (
            patch.object(
                ai,
                "get_auckland_weather",
                return_value={"status": "success", "condition": "Clear"},
            ),
            patch.object(
                ai,
                "get_auckland_places",
                return_value={"status": "success", "places": [place]},
            ) as place_search,
            patch.object(ai, "_generate_text", side_effect=generate_text),
            patch.object(
                ai,
                "get_transport_info",
                new=AsyncMock(return_value={"mode": "walk"}),
            ),
        ):
            result = asyncio.run(
                ai.generate_location_recommendations(
                    user_prompt="Find a beach",
                    lat=-36.8485,
                    lon=174.7633,
                    user_preferences=UserPreferences(
                        categories=["BEACH"],
                        radius_meters=2000,
                    ),
                )
            )

        self.assertEqual(result["provider"], "gemini")
        self.assertEqual(result["recommendations"][0].place_name, "Mission Bay")
        self.assertEqual(place_search.call_args.kwargs["radius_meters"], 5000)
        self.assertNotIn("-36.8485", captured["prompt"])
        self.assertNotIn("174.7633", captured["prompt"])


if __name__ == "__main__":
    unittest.main()
