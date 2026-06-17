import requests
from app.config import settings

def get_auckland_places(target_category: str, lat: float, lon: float) -> dict:
    """
    WHAT: Queries TomTom's Category Search API using real-time coordinates.
    HOW: Rounds lat/lon to 6 decimal places to prevent TomTom 400 bad request crashes.
    WHY: Resolves the Internal Server Error bug by handling coordinate precision safely.
    """
    api_key = getattr(settings, "TOMTOM_API_KEY", None)
    if not api_key:
        return {"status": "error", "message": "TomTom API key is missing."}

    # --- FIX: Clean and safely format coordinate precision ---
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
    radius = 15000  # 15km search radius
    
    url = f"https://api.tomtom.com/search/2/categorySearch/{search_term}.json"
    
    # Use the cleaned, rounded coordinates here
    params = {
        "key": api_key,
        "lat": clean_lat,
        "lon": clean_lon,
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
                
            return {"status": "success", "places": clean_places}
        else:
            # Print the exact error to your terminal console so you can see it
            print(f"TomTom API Rejected Request: Status {response.status_code} - {response.text}")
            return {"status": "error", "message": f"TomTom error: {response.status_code}"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}