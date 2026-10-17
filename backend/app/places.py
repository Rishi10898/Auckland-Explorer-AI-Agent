"""Search nearby destinations through TomTom Places Search.

Purpose: adapt TomTom results to a small, verified candidate contract.
Workflow: category + backend-only origin -> bounded search -> validated
coordinates and opaque IDs consumed by AI selection and the frontend map.
"""
import hashlib
from typing import Any

import requests

from app.config import settings

CATEGORY_SEARCH_TERMS = {
    "BEACH": "beach",
    "PARK_RECREATION_AREA": "park",
    "TOURIST_ATTRACTION": "tourist attraction",
}


def get_auckland_places(
    target_category: str,
    lat: float,
    lon: float,
    radius_meters: int = 5000,
) -> dict[str, Any]:
    """Return nearby candidates or a sanitized, machine-readable error."""
    if target_category not in CATEGORY_SEARCH_TERMS:
        return {
            "status": "error",
            "error_code": "PLACES_CATEGORY_INVALID",
            "message": "Place category is not supported.",
        }
    if not settings.tomtom_api_key:
        return {
            "status": "error",
            "error_code": "PLACES_API_KEY_MISSING",
            "message": "TomTom API key is not configured.",
        }

    url = (
        "https://api.tomtom.com/search/2/categorySearch/"
        f"{CATEGORY_SEARCH_TERMS[target_category]}.json"
    )
    params = {
        "key": settings.tomtom_api_key,
        "lat": round(lat, 6),
        "lon": round(lon, 6),
        "radius": min(max(int(radius_meters), 1), 5000),
        "limit": 10,
    }

    try:
        response = requests.get(url, params=params, timeout=8)
        response.raise_for_status()
        data = response.json()
        raw_results = data.get("results", [])
        if not isinstance(raw_results, list):
            raise ValueError("Unexpected results shape.")

        places = []
        for item in raw_results:
            poi = item.get("poi", {})
            position = item.get("position", {})
            address = item.get("address", {})
            name = poi.get("name")
            place_lat = position.get("lat")
            place_lon = position.get("lon")
            if (
                not isinstance(name, str)
                or not name.strip()
                or not isinstance(place_lat, (int, float))
                or not isinstance(place_lon, (int, float))
                or abs(place_lat) > 90
                or abs(place_lon) > 180
            ):
                continue

            key = f"{name.strip().casefold()}:{place_lat:.6f}:{place_lon:.6f}"
            candidate_id = hashlib.sha256(key.encode("utf-8")).hexdigest()[:16]
            places.append(
                {
                    "candidate_id": candidate_id,
                    "name": name.strip(),
                    "category": target_category,
                    "address": address.get("freeformAddress"),
                    "distance_meters": item.get("distance"),
                    "latitude": float(place_lat),
                    "longitude": float(place_lon),
                }
            )

        return {"status": "success", "places": places}
    except requests.RequestException:
        # Exception messages may contain the query URL and TomTom API key.
        return {
            "status": "error",
            "error_code": "PLACES_API_UNAVAILABLE",
            "message": "TomTom Places Search is unavailable.",
        }
    except (AttributeError, TypeError, ValueError):
        return {
            "status": "error",
            "error_code": "PLACES_DATA_INVALID",
            "message": "TomTom returned invalid place data.",
        }
