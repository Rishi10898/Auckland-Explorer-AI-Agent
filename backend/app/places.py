import requests
from app.config import settings

def get_auckland_places() -> dict:
    """
    WHAT: Queries TomTom Category Search with an expanded scope of categories.
    HOW: Sends an HTTP GET request containing parks, beaches, restaurants, malls, and hotels.
    WHY: Expands the data pool so Gemini AI can choose from indoor OR outdoor options.
    """
    api_key = getattr(settings, "TOMTOM_API_KEY", None)
    
    if not api_key:
        return {"status": "error", "message": "TomTom API key is missing from configuration."}

    # Central Auckland coordinates
    lat = -36.8485
    lon = 174.7633
    radius = 15000  # Bumped to 15km to catch large regional parks and destination malls
    
    # WHAT: An expanded comma-separated list of TomTom categories.
    # WHY: Allows a single API call to gather a diverse mix of indoor and outdoor spots.
    category_list = [
        "BEACH",
        "PARK_RECREATION_AREA",
        "NATIONAL_PARK",
        "NATURAL_FEATURE",
        "SHOPPING_CENTER",
        "RESTAURANT",
        "HOTEL_MOTEL"
    ]
    category_query = ",".join(category_list)
    
    url = f"https://api.tomtom.com/search/2/categorySearch/{category_query}.json"
    
    params = {
        "key": api_key,
        "lat": lat,
        "lon": lon,
        "radius": radius,
        "limit": 10  # Increased to 10 so we get a good mix of different choices
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
                
                # Get the specific classification string (e.g., "RESTAURANT" or "BEACH")
                classifications = poi.get("classifications", [{}])
                poi_type = classifications[0].get("code", "POINT_OF_INTEREST")
                
                clean_places.append({
                    "name": poi.get("name", "Unknown Location"),
                    "category": poi_type,
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
            return {
                "status": "error",
                "message": f"TomTom API error code: {response.status_code}"
            }
            
    except Exception as e:
        return {
            "status": "error",
            "message": f"Network exception during TomTom lookup: {str(e)}"
        }