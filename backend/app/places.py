import os
import requests
from typing import Any, Dict


def get_auckland_places(
    target_category: str,
    lat: float,
    lon: float,
    radius_meters: int = 10000
) -> Dict[str, Any]:
    """
    Gets real nearby places from TomTom.
    """

    # Read the TomTom API key from the environment.
    api_key = os.getenv("TOMTOM_API_KEY")

    # Stop if the API key is missing.
    if not api_key:
        return {
            "status": "error",
            "error_code": "PLACES_API_KEY_MISSING",
            "message": "TomTom API key is not configured."
        }

    # Translate our application's categories into TomTom search terms.
    category_map = {
        "BEACH": "beach",
        "PARK_RECREATION_AREA": "park",
        "SHOPPING_CENTER": "shopping center",
        "RESTAURANT": "restaurant",
        "HOTEL_MOTEL": "hotel"
    }

    # Use the mapped category, or use the supplied category directly.
    search_term = category_map.get(
        target_category,
        target_category
    )

    # Build TomTom's category-search URL.
    url = (
        "https://api.tomtom.com/search/2/categorySearch/"
        f"{search_term}.json"
    )

    # Data sent to TomTom.
    params = {
        "key": api_key,
        "lat": round(lat, 6),
        "lon": round(lon, 6),
        "radius": radius_meters,
        "limit": 10
    }

    try:
        # Request real places from TomTom.
        response = requests.get(
            url,
            params=params,
            timeout=10
        )

        # Raise an exception if TomTom returns an HTTP error.
        response.raise_for_status()

        # Convert TomTom's response to Python data.
        data = response.json()

        results = data.get("results", [])

        places = []

        # Convert TomTom's complex response into our simpler structure.
        for item in results:

            poi = item.get("poi", {})
            address = item.get("address", {})
            position = item.get("position", {})

            places.append({
                "name": poi.get("name"),
                "category": target_category,
                "address": address.get("freeformAddress"),
                "distance_meters": item.get("distance"),
                "latitude": position.get("lat"),
                "longitude": position.get("lon")
            })

        return {
            "status": "success",
            "places": places
        }

    except requests.RequestException as exc:
        # Report the failure to ai.py.
        # ai.py can then activate the Gemini Search fallback.
        return {
            "status": "error",
            "error_code": "PLACES_API_UNAVAILABLE",
            "message": str(exc)
        }

    except (KeyError, ValueError) as exc:
        # Handle malformed responses.
        return {
            "status": "error",
            "error_code": "PLACES_DATA_INVALID",
            "message": str(exc)
        }