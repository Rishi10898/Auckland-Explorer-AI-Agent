import os
import requests


def get_auckland_weather(lat: float, lon: float) -> dict:
    """
    Gets current weather from OpenWeather
    using the user's actual coordinates.
    """

    # Read the OpenWeather API key from the environment.
    api_key = os.getenv("OPEN_WEATHER_API_KEY")

    # Stop if the API key hasn't been configured.
    if not api_key:
        return {
            "status": "error",
            "error_code": "WEATHER_API_KEY_MISSING",
            "message": "Weather API key is not configured."
        }

    # Build the OpenWeather current-weather API request.
    url = (
        "https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}"
        f"&lon={lon}"
        f"&appid={api_key}"
        "&units=metric"
    )

    try:
        # Send the request to OpenWeather.
        response = requests.get(url, timeout=10)

        # Raise an exception for HTTP errors.
        response.raise_for_status()

        # Convert JSON returned by OpenWeather into a Python dictionary.
        data = response.json()

        # Extract only the information our application needs.
        return {
            "status": "success",
            "condition": data["weather"][0]["main"],
            "description": data["weather"][0]["description"],
            "temperature_celsius": data["main"]["temp"],
            "feels_like_celsius": data["main"]["feels_like"],
            "humidity_percentage": data["main"]["humidity"],
            "wind_speed_mps": data.get("wind", {}).get("speed", 0)
        }

    except requests.RequestException as exc:
        # Do NOT invent weather when OpenWeather fails.
        return {
            "status": "error",
            "error_code": "WEATHER_API_UNAVAILABLE",
            "message": str(exc)
        }

    except (KeyError, ValueError) as exc:
        # Handle unexpected/malformed API responses.
        return {
            "status": "error",
            "error_code": "WEATHER_DATA_INVALID",
            "message": str(exc)
        }