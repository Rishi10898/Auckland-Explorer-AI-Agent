import requests
from typing import Any, Dict
from app.config import settings


def get_auckland_places(
    target_category: str, 
    lat: float, 
    lon: float, 
    radius_meters: int = 10000
) -> Dict[str, Any]:
    """
    Queries TomTom's Category Search API using real-time coordinates and radius.
    """
    api_key = getattr(settings, "TOMTOM_API_KEY", None)
    if not api_key:
        return {"status": "error", "message": "TomTom API key is missing."}

    clean_lat = round(lat, 6)
    clean_lon = round(lon, 6)

    tomtom_keyword_map = {
        "BEACH": "beach",
        "PARK_RECREATION_AREA": "park",
        "SHOPPING_CENTER": "shopping center",
        "RESTAURANT": "restaurant",
        "HOTEL_MOTEL": "hotel"
    }

    search_term = tomtom_keyword_map.get(target_category, target_category)

    url = f"https://api.tomtom.com/search/2/categorySearch/{search_term}.json"

    params = {
        "key": api_key,
        "lat": clean_lat,
        "lon": clean_lon,
        "radius": radius_meters,
        "limit": 10
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])

            clean_places = []
            for item in results:
                poi = item.get("poi", {})
                address = item.get("address", {})
                position = item.get("position", {})

                clean_places.append({
                    "name": poi.get("name", "Unknown Location"),
                    "category": target_category,
                    "formatted_address": address.get("freeformAddress", "Auckland, NZ"),
                    "distance_meters": item.get("distance", 0),
                    "latitude": position.get("lat"),
                    "longitude": position.get("lon")
                })

            return {"status": "success", "places": clean_places}
        else:
            return {"status": "error", "message": f"TomTom error: {response.status_code}"}

    except Exception as e:
        return {"status": "error", "message": str(e)}