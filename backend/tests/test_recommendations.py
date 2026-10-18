"""Test candidate validation, provider order, and privacy-preserving prompts.

Workflow: replace upstream clients with mocks -> exercise provider/selection
logic -> verify trusted coordinates stay out of AI input and response records.
"""
import asyncio
import json
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch

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


class ProviderHTTPError(Exception):
    def __init__(self, status_code, message="sensitive response body"):
        super().__init__(message)
        self.status_code = status_code
        self.response = SimpleNamespace(status_code=status_code)


class RecommendationTests(unittest.TestCase):
    def test_provider_http_errors_keep_safe_status_categories(self):
        expected = {
            400: "invalid_request",
            401: "authentication",
            403: "permission",
            404: "not_found",
            408: "timeout",
            410: "gone",
            429: "quota",
            503: "unavailable",
        }

        for status, category in expected.items():
            with self.subTest(status=status):
                error = ProviderHTTPError(status)
                self.assertEqual(ai._provider_http_status(error), status)
                self.assertEqual(ai._provider_error_category(error), category)

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

    def test_provider_failure_logs_status_and_falls_back_without_details(self):
        settings = SimpleNamespace(
            gemini_api_keys=("key-one",),
            nvidia_api_key="nvidia-key",
        )
        failure = ai.ProviderError(
            "gone",
            exception_type="ClientError",
            http_status=410,
        )

        with (
            patch.object(ai, "settings", settings),
            patch.object(ai, "_generate_gemini_text", side_effect=failure),
            patch.object(
                ai,
                "_generate_nvidia_text",
                return_value='{"summary":"ok","recommendations":[]}',
            ),
            self.assertLogs("auckland_explorer.ai", level="WARNING") as logs,
        ):
            result = ai._generate_text("prompt")

        self.assertEqual(result[1], "nvidia")
        joined_logs = "\n".join(logs.output)
        self.assertIn("Gemini provider failed", joined_logs)
        self.assertIn("category=gone", joined_logs)
        self.assertIn("exception=ClientError", joined_logs)
        self.assertIn("http_status=410", joined_logs)
        self.assertNotIn("sensitive response body", joined_logs)
        self.assertNotIn("key-one", joined_logs)

    def test_gone_gemini_resource_skips_rotation_and_falls_back(self):
        settings = SimpleNamespace(
            gemini_api_keys=("key-one", "key-two", "key-three"),
            nvidia_api_key="nvidia-key",
        )
        with (
            patch.object(ai, "settings", settings),
            patch.object(
                ai,
                "_generate_gemini_text",
                side_effect=ai.ProviderError(
                    "gone",
                    exception_type="ClientError",
                    http_status=410,
                ),
            ) as gemini,
            patch.object(
                ai,
                "_generate_nvidia_text",
                return_value='{"summary":"ok","recommendations":[]}',
            ) as nvidia,
        ):
            result = ai._generate_text("prompt")

        self.assertEqual(result[1], "nvidia")
        gemini.assert_called_once_with("key-one", "prompt")
        nvidia.assert_called_once_with("prompt")

    def test_not_found_gemini_slot_can_fall_through_to_next_project(self):
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
                    ai.ProviderError(
                        "not_found",
                        exception_type="ClientError",
                        http_status=404,
                    ),
                    '{"summary":"ok","recommendations":[]}',
                ],
            ) as gemini,
            patch.object(ai, "_generate_nvidia_text") as nvidia,
        ):
            result = ai._generate_text("prompt")

        self.assertEqual(result[1], "gemini")
        self.assertEqual(gemini.call_count, 2)
        nvidia.assert_not_called()

    def test_missing_model_without_fallback_has_a_specific_error(self):
        settings = SimpleNamespace(
            gemini_api_keys=("key-one",),
            nvidia_api_key="",
        )
        with (
            patch.object(ai, "settings", settings),
            patch.object(
                ai,
                "_generate_gemini_text",
                side_effect=ai.ProviderError("not_found"),
            ),
        ):
            with self.assertRaises(ai.RecommendationError) as error:
                ai._generate_text("prompt")

        self.assertEqual(error.exception.code, "AI_RESOURCE_NOT_FOUND")

    def test_nvidia_gone_response_is_logged_and_reported_safely(self):
        settings = SimpleNamespace(gemini_api_keys=(), nvidia_api_key="nvidia-key")
        with (
            patch.object(ai, "settings", settings),
            patch.object(
                ai,
                "_generate_nvidia_text",
                side_effect=ai.ProviderError(
                    "gone",
                    exception_type="APIStatusError",
                    http_status=410,
                ),
            ),
            self.assertLogs("auckland_explorer.ai", level="WARNING") as logs,
        ):
            with self.assertRaises(ai.RecommendationError) as error:
                ai._generate_text("prompt")

        self.assertEqual(
            error.exception.code,
            "AI_PROVIDER_RESOURCE_GONE",
        )
        joined_logs = "\n".join(logs.output)
        self.assertIn("NVIDIA provider failed", joined_logs)
        self.assertIn("category=gone", joined_logs)
        self.assertIn("exception=APIStatusError", joined_logs)
        self.assertIn("http_status=410", joined_logs)
        self.assertNotIn("nvidia-key", joined_logs)

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

    def test_gemini_client_without_close_method_returns_response(self):
        client = SimpleNamespace(
            models=SimpleNamespace(
                generate_content=Mock(
                    return_value=SimpleNamespace(text='{"summary":"ok"}')
                )
            )
        )
        settings = SimpleNamespace(gemini_model="gemini-2.5-flash")

        with (
            patch.object(ai, "settings", settings),
            patch.object(
                ai.genai,
                "Client",
                return_value=client,
            ) as create_client,
        ):
            text = ai._generate_gemini_text("key", "prompt")

        self.assertEqual(text, '{"summary":"ok"}')
        self.assertEqual(
            create_client.call_args.kwargs["http_options"].api_version,
            "v1",
        )

    def test_gemini_cleanup_error_does_not_mask_success(self):
        client = SimpleNamespace(
            models=SimpleNamespace(
                generate_content=Mock(
                    return_value=SimpleNamespace(text='{"summary":"ok"}')
                )
            ),
            close=Mock(side_effect=RuntimeError("sensitive cleanup detail")),
        )
        settings = SimpleNamespace(gemini_model="gemini-2.5-flash")

        with (
            patch.object(ai, "settings", settings),
            patch.object(ai.genai, "Client", return_value=client),
            self.assertLogs("auckland_explorer.ai", level="WARNING") as logs,
        ):
            text = ai._generate_gemini_text("key", "prompt")

        self.assertEqual(text, '{"summary":"ok"}')
        self.assertIn("cleanup failed", logs.output[0])
        self.assertIn("exception=RuntimeError", logs.output[0])
        self.assertNotIn("sensitive cleanup detail", logs.output[0])

    def test_gemini_cleanup_error_does_not_mask_provider_failure(self):
        provider_error = ProviderHTTPError(403)
        client = SimpleNamespace(
            models=SimpleNamespace(
                generate_content=Mock(side_effect=provider_error)
            ),
            close=Mock(side_effect=RuntimeError("sensitive cleanup detail")),
        )
        settings = SimpleNamespace(gemini_model="gemini-2.5-flash")

        with (
            patch.object(ai, "settings", settings),
            patch.object(ai.genai, "Client", return_value=client),
            self.assertLogs("auckland_explorer.ai", level="WARNING"),
            self.assertRaises(ai.ProviderError) as error,
        ):
            ai._generate_gemini_text("key", "prompt")

        self.assertEqual(error.exception.category, "permission")
        self.assertEqual(error.exception.exception_type, "ProviderHTTPError")
        self.assertEqual(error.exception.http_status, 403)
        self.assertIs(error.exception.__cause__, provider_error)
        self.assertNotIn("sensitive response body", str(error.exception))

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

    def test_prompt_uses_at_most_five_candidates_per_category(self):
        preferences = UserPreferences(
            categories=[
                "BEACH",
                "PARK_RECREATION_AREA",
                "TOURIST_ATTRACTION",
            ]
        )
        candidates_by_category = {
            category: [
                {
                    **candidate(f"{category}-{index}"),
                    "category": category,
                    "latitude": -36.8485 + index * 0.0003,
                    "longitude": 174.7633,
                }
                for index in range(8)
            ]
            for category in preferences.categories
        }
        captured = {}

        def generate_text(prompt):
            candidate_data = json.loads(
                prompt.split(
                    "VERIFIED TOMTOM CANDIDATES "
                    "(only these IDs may be recommended):\n",
                    1,
                )[1].split("\n\nRules:", 1)[0]
            )
            captured["candidates"] = candidate_data
            return (
                json.dumps(
                    {
                        "summary": "Nearby options.",
                        "recommendations": [
                            {
                                "candidate_id": candidate_data[0]["candidate_id"],
                                "relevance_rationale": "A nearby option.",
                            }
                        ],
                    }
                ),
                "gemini",
            )

        def search_places(target_category, **_kwargs):
            return {
                "status": "success",
                "places": candidates_by_category[target_category],
            }

        with (
            patch.object(
                ai,
                "get_auckland_weather",
                return_value={"status": "unavailable"},
            ),
            patch.object(
                ai,
                "get_auckland_places",
                side_effect=search_places,
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
                    user_prompt="Find something nearby",
                    lat=-36.8485,
                    lon=174.7633,
                    user_preferences=preferences,
                )
            )

        self.assertEqual(result["provider"], "gemini")
        self.assertEqual(place_search.call_count, 3)
        self.assertEqual(len(captured["candidates"]), 15)
        for category in preferences.categories:
            with self.subTest(category=category):
                self.assertEqual(
                    sum(
                        place["category"] == category
                        for place in captured["candidates"]
                    ),
                    ai.MAX_CANDIDATES_PER_CATEGORY,
                )


if __name__ == "__main__":
    unittest.main()
