import requests
from app.config import settings

def get_auckland_places(target_category: str) -> dict:
    """
    WHAT: Queries TomTom's Category Search API.
    HOW: Translates the AI's strict keyword into a search term TomTom understands.
    WHY: Resolves the empty list [] bug by aligning AI tokens with TomTom's database terms.
    """
    api_key = getattr(settings, "TOMTOM_API_KEY", None)
    if not api_key:
        return {"status": "error", "message": "TomTom API key is missing."}

    # --- ADD THIS TRANSLATION DICTIONARY RIGHT HERE ---
    # Maps our strict AI tokens to the best native TomTom search strings
    tomtom_keyword_map = {
        "BEACH": "beach",
        "PARK_RECREATION_AREA": "park",  # Translates our long token to TomTom's preferred 'park'
        "SHOPPING_CENTER": "shopping center",
        "RESTAURANT": "restaurant",
        "HOTEL_MOTEL": "hotel"
    }
    
    # Get the translated search term (fallback to the original string if not found)
    search_term = tomtom_keyword_map.get(target_category, target_category)

    lat = -36.8485
    lon = 174.7633
    radius = 15000  # 15km search radius
    
    # Use the translated search_term in the URL instead of the strict AI token
    url = f"https://api.tomtom.com/search/2/categorySearch/{search_term}.json"
    
    params = {
        "key": api_key,
        "lat": lat,
        "lon": lon,
        "radius": radius,
        "limit": 5
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
                
            return {
                "status": "success",
                "places": clean_places
            }
        else:
            return {"status": "error", "message": f"TomTom error: {response.status_code}"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}