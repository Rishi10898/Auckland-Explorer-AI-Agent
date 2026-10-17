"""Test HTTP behavior and conservative Safeswim status handling.

Workflow: issue local TestClient requests with mocked services -> assert the
documented API contract, safe errors, and warning/unknown behavior.
"""
import asyncio
import unittest
from unittest.mock import AsyncMock, Mock, patch

import httpx
from fastapi.testclient import TestClient

from app import main
from app.beaches import (
    SAFESWIM_SOURCE,
    UNVERIFIED_NOTICE,
    _notice_from_data,
    fetch_realtime_environmental_alerts,
)
from app.ai import RecommendationError
from app.schemas import DestinationMatchItem, GeolocationCoordinates


class SafetyTests(unittest.IsolatedAsyncioTestCase):
    def test_missing_safeswim_description_is_unverified(self):
        result = _notice_from_data({"unexpected": "payload"})
        self.assertEqual(result["status"], "unverified")
        self.assertEqual(result["notice"], UNVERIFIED_NOTICE)
        self.assertEqual(result["source"], SAFESWIM_SOURCE)

    def test_unsafe_safeswim_description_is_warning(self):
        result = _notice_from_data(
            {"alert": {"description": "Unsafe swimming: water quality warning."}}
        )
        self.assertEqual(result["status"], "warning")
        self.assertIn("Unsafe swimming", result["notice"])

    async def test_service_failure_is_unverified_and_does_not_log_coordinates(self):
        client = AsyncMock()
        client.__aenter__.return_value = client
        client.get.side_effect = httpx.ConnectError("upstream unavailable")
        coordinates = GeolocationCoordinates(
            latitude=-36.8485,
            longitude=174.7633,
        )

        with (
            patch("app.beaches.httpx.AsyncClient", return_value=client),
            self.assertLogs("auckland_explorer.services", level="WARNING") as logs,
        ):
            result = await fetch_realtime_environmental_alerts(coordinates)

        self.assertEqual(result["status"], "unverified")
        self.assertNotIn("-36.8485", "\n".join(logs.output))
        self.assertNotIn("174.7633", "\n".join(logs.output))


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(main.app)

    def test_health_and_staging_frontend_routes(self):
        self.assertEqual(self.client.get("/health").json(), {"status": "ok"})
        self.assertEqual(self.client.get("/").status_code, 200)
        self.assertEqual(self.client.get("/chat.html").status_code, 200)

    def test_request_validation_rejects_unsupported_radius(self):
        response = self.client.post(
            "/api/chat",
            json={
                "coordinates": {"latitude": -36.8485, "longitude": 174.7633},
                "user_intent_prompt": "Find a park",
                "user_preferences": {
                    "categories": ["PARK_RECREATION_AREA"],
                    "radius_meters": 10000,
                },
            },
        )
        self.assertEqual(response.status_code, 422)

    def test_chat_response_preserves_contract_and_safety_status(self):
        destination = DestinationMatchItem(
            candidate_id="park-1",
            place_name="Auckland Domain",
            category="PARK_RECREATION_AREA",
            relevance_rationale="A central park.",
            directions_url="https://www.google.com/maps/dir/?api=1",
            distance_meters=250,
            latitude=-36.8606,
            longitude=174.7785,
        )
        with (
            patch(
                "app.main.fetch_realtime_environmental_alerts",
                new=AsyncMock(
                    return_value={
                        "notice": "Unsafe swimming warning.",
                        "status": "warning",
                        "source": SAFESWIM_SOURCE,
                    }
                ),
            ),
            patch(
                "app.main.generate_location_recommendations",
                new=AsyncMock(
                    return_value={
                        "summary": "A nearby park.",
                        "recommendations": [destination],
                        "transport": None,
                        "provider": "gemini",
                    }
                ),
            ),
        ):
            response = self.client.post(
                "/api/chat",
                json={
                    "coordinates": {"latitude": -36.8485, "longitude": 174.7633},
                    "user_intent_prompt": "Find a park",
                    "user_preferences": {
                        "categories": ["PARK_RECREATION_AREA"],
                        "transport_mode": "walk",
                        "radius_meters": 2000,
                    },
                },
            )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["summary"], "A nearby park.")
        self.assertEqual(payload["recommended_destinations"][0]["place_name"], "Auckland Domain")
        self.assertEqual(payload["environmental_safety_status"], "warning")
        self.assertEqual(payload["ai_provider"], "gemini")

    def test_quota_failure_is_a_clear_503(self):
        with (
            patch(
                "app.main.fetch_realtime_environmental_alerts",
                new=AsyncMock(
                    return_value={
                        "notice": UNVERIFIED_NOTICE,
                        "status": "unverified",
                        "source": SAFESWIM_SOURCE,
                    }
                ),
            ),
            patch(
                "app.main.generate_location_recommendations",
                new=AsyncMock(side_effect=RecommendationError("AI_QUOTA_EXCEEDED")),
            ),
        ):
            response = self.client.post(
                "/api/chat",
                json={
                    "coordinates": {"latitude": -36.8485, "longitude": 174.7633},
                    "user_intent_prompt": "Find a park",
                },
            )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["detail"]["error_code"], "AI_QUOTA_EXCEEDED")
        self.assertIn("quota", response.json()["detail"]["message"].lower())


if __name__ == "__main__":
    unittest.main()
