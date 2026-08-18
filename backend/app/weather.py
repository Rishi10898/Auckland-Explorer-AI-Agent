# Purpose of this file 
# The purpose of this file is to obtain current weather from OpenWeather and return useful weather information to the rest of the application.
# imports os and requests modules to handle environment variables and HTTP requests respectively.
import os
import requests

# Declaring a function get_auckland_weather that takes latitude and longitude as input parameters and returns a dictionary containing weather information.
# It is set to return a dictionary with string keys and values of any type because it makes it easy for the AI model to process.
def get_auckland_weather(lat: float, lon: float) -> dict:
    # Read and/or declareing the OpenWeather API key from the environment variable.
    api_key = os.getenv("OPEN_WEATHER_API_KEY") # In this way we can keep the API key secure and not hardcode it into the codebase.

    # Stop if the API key hasn't been configured.
    if not api_key:
        return {
            "status": "error",
            "error_code": "WEATHER_API_KEY_MISSING",
            "message": "Weather API key is not configured."
        } # Showing an error message if the API key is missing, which helps in debugging and ensures that the application doesn't proceed with an invalid state.

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
        response = requests.get(url, timeout=5) # Setting a timeout of 5 seconds to avoid hanging indefinitely if the API is unresponsive.

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
        # Doesn't invent weather when OpenWeather fails.
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