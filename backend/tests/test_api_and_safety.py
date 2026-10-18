"""Test external adapters using deterministic mock responses.

Workflow: mock TomTom/OpenWeather -> verify normalized results, request limits,
and safe errors that do not expose API credentials.
"""
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch
import requests
from app import places, weather


# Tests for place-search normalization and request limits.
class PlaceAdapterTests(unittest.TestCase):
    def test_candidate_data_has_stable_ids_and_rejects_invalid_coordinates(self):
        settings = SimpleNamespace(tomtom_api_key="not-a-real-key")
        payload = {
            "results": [
                {
                    "poi": {"name": "Mission Bay"},
                    "position": {"lat": -36.8485, "lon": 174.8303},
                    "address": {"freeformAddress": "Auckland"},
                    "distance": 400,
                },
                {
                    "poi": {"name": "Invalid"},
                    "position": {"lat": 999, "lon": 174},
                },
            ]
        }
        response = Mock()
        response.json.return_value = payload
        response.raise_for_status.return_value = None

        # Fake the provider response to avoid network calls and API usage.
        with (
            patch.object(places, "settings", settings),
            patch("app.places.requests.get", return_value=response) as request,
        ):
            first = places.get_auckland_places("BEACH", -36.84, 174.8, 9000)
            second = places.get_auckland_places("BEACH", -36.84, 174.8, 5000)

        self.assertEqual(first["status"], "success")
        self.assertEqual(len(first["places"]), 1)
        self.assertEqual(
            first["places"][0]["candidate_id"],
            second["places"][0]["candidate_id"],
        )
        self.assertEqual(request.call_args.kwargs["params"]["radius"], 5000)
        self.assertEqual(request.call_args.kwargs["timeout"], 8)

    def test_tomtom_error_does_not_return_exception_url_or_key(self):
        settings = SimpleNamespace(tomtom_api_key="sensitive-test-key")

        with (
            patch.object(places, "settings", settings),
            patch(
                "app.places.requests.get",
                side_effect=requests.Timeout(
                    "https://example.test?key=sensitive-test-key"
                ),
            ),
        ):
            result = places.get_auckland_places("BEACH", -36.84, 174.8)

        self.assertEqual(result["error_code"], "PLACES_API_UNAVAILABLE")
        self.assertNotIn("sensitive-test-key", result["message"])

    def test_weather_error_does_not_return_credential_bearing_url(self):
        # Weather failures must not expose the API key in returned messages.
        settings = SimpleNamespace(open_weather_api_key="sensitive-weather-key")

        with (
            patch.object(weather, "settings", settings),
            patch(
                "app.weather.requests.get",
                side_effect=requests.Timeout(
                    "https://example.test?appid=sensitive-weather-key"
                ),
            ),
        ):
            result = weather.get_auckland_weather(-36.84, 174.8)

        self.assertEqual(result["error_code"], "WEATHER_API_UNAVAILABLE")
        self.assertNotIn("sensitive-weather-key", result["message"])

if __name__ == "__main__":
    unittest.main()