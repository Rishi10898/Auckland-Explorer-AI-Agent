"""Fetch minimal current-weather context from OpenWeather.

Purpose: help rank weather-sensitive outings without generating conditions.
Workflow: backend-only coordinates -> timed provider call -> safe data fields;
errors omit details that could expose API keys or user location.
"""
import requests

from app.config import settings

OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"


def get_auckland_weather(lat: float, lon: float) -> dict:
    """Return current weather values or a sanitized unavailable status."""
    api_key = settings.open_weather_api_key
    if not api_key:
        return {
            "status": "error",
            "error_code": "WEATHER_API_KEY_MISSING",
            "message": "Weather API key is not configured.",
        }

    try:
        response = requests.get(
            OPENWEATHER_URL,
            params={
                "lat": lat,
                "lon": lon,
                "appid": api_key,
                "units": "metric",
            },
            timeout=5,
        )
        response.raise_for_status()
        data = response.json()
        weather = data["weather"][0]
        current = data["main"]
        return {
            "status": "success",
            "condition": weather["main"],
            "description": weather["description"],
            "temperature_celsius": current["temp"],
            "feels_like_celsius": current["feels_like"],
            "humidity_percentage": current["humidity"],
            "wind_speed_mps": data.get("wind", {}).get("speed"),
        }
    except requests.RequestException:
        return {
            "status": "error",
            "error_code": "WEATHER_API_UNAVAILABLE",
            "message": "Current weather is unavailable.",
        }
    except (KeyError, IndexError, TypeError, ValueError):
        return {
            "status": "error",
            "error_code": "WEATHER_DATA_INVALID",
            "message": "OpenWeather returned invalid weather data.",
        }
