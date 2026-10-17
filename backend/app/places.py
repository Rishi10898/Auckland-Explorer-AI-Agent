"""Find nearby Auckland places through TomTom's Places Search API.

This module gives the application a small, consistent place-search interface:
it translates app categories into TomTom search terms, requests nearby results,
and returns only the fields the rest of the application needs. Errors are
returned as structured data so the caller can choose a fallback (for example,
Gemini Search) rather than having this module decide how to recover.
"""

import os
import requests
from typing import Any, Dict


def get_auckland_places(
    target_category: str,
    lat: float,
    lon: float,
    radius_meters: int = 10000
) -> Dict[str, Any]:
    """Return nearby places matching ``target_category`` around a coordinate.

    Args:
        target_category: The application's category identifier, such as
            ``BEACH`` or ``RESTAURANT``.
        lat: Latitude of the search center.
        lon: Longitude of the search center.
        radius_meters: Maximum distance from the center to search.

    Returns:
        A dictionary with ``status`` set to ``success`` and a simplified list
        of places, or ``status`` set to ``error`` with a machine-readable error
        code and message. This lets the caller handle failures consistently.
    """

    # Read credentials from the environment so secrets are not hard-coded.
    api_key = os.getenv("TOMTOM_API_KEY")

    # Fail early with a structured error if the service is not configured.
    if not api_key:
        return {
            "status": "error",
            "error_code": "PLACES_API_KEY_MISSING",
            "message": "TomTom API key is not configured."
        }

    # Translate app-specific category IDs to terms understood by TomTom.
    category_map = {
        "BEACH": "beach",
        "PARK_RECREATION_AREA": "park",
        "SHOPPING_CENTER": "shopping center",
        "RESTAURANT": "restaurant",
        "HOTEL_MOTEL": "hotel"
    }

    # Unknown categories are passed through, allowing callers to use a
    # TomTom search term directly when it is not listed in category_map.
    search_term = category_map.get(
        target_category,
        target_category
    )

    # Build TomTom's category-search endpoint for the selected term.
    url = (
        "https://api.tomtom.com/search/2/categorySearch/"
        f"{search_term}.json"
    )

    # Search parameters: credentials, rounded center coordinates, radius,
    # and a cap on the number of returned results.
    params = {
        "key": api_key,
        "lat": round(lat, 6),
        "lon": round(lon, 6),
        "radius": radius_meters,
        "limit": 10
    }

    try:
        # Request nearby places. The timeout prevents a slow service from
        # blocking the application indefinitely.
        response = requests.get(
            url,
            params=params,
            timeout=10
        )

        # Convert non-success HTTP responses into RequestException errors.
        response.raise_for_status()

        # Decode the JSON payload and get its result records.
        data = response.json()

        results = data.get("results", [])

        places = []

        # Keep only the fields used by the app, instead of exposing TomTom's
        # full response format to the rest of the codebase.
        for item in results:

            poi = item.get("poi", {})
            address = item.get("address", {})
            position = item.get("position", {})

            place_lat = position.get("lat")
            place_lon = position.get("lon")
            if place_lat is None or place_lon is None:
                # A place without coordinates cannot be shown or mapped.
                continue
            places.append({
                "name": poi.get("name"),
                "category": target_category,
                "address": address.get("freeformAddress"),
                "distance_meters": item.get("distance"),
                "latitude": place_lat,
                "longitude": place_lon
            })

        # Return the same success shape even when TomTom finds no matches.
        return {
            "status": "success",
            "places": places
        }

    except requests.RequestException as exc:
        # Network, timeout, and HTTP errors are reported to the caller, which
        # can activate the Gemini Search fallback if appropriate.
        return {
            "status": "error",
            "error_code": "PLACES_API_UNAVAILABLE",
            "message": str(exc)
        }

    except (KeyError, ValueError) as exc:
        # Report invalid or malformed response data separately from a
        # transport failure so the caller can distinguish the cause.
        return {
            "status": "error",
            "error_code": "PLACES_DATA_INVALID",
            "message": str(exc)
        }