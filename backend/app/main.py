"""Auckland Explorer API entrypoint.

Provides a health-check and a mock recommendation endpoint used for
testing routing and response shape before AI integration.
"""
from fastapi import FastAPI, HTTPException
from app.weather import get_auckland_weather
from app.ai import get_ai_decision
from app.places import get_auckland_places

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Auckland Explorer API is running!"}

@app.get("/api/recommend")
def get_recommendation(budget: float = 0.0, vibe: str = "relaxing outdoor walk", lat: float = -36.8485, lon: float = 174.7633):
    
    # 1. Geofencing Enforcement Check
    # Bounding box coordinates for Greater Auckland region (including all suburbs)
    MIN_LAT, MAX_LAT = -37.3000, -36.3000
    MIN_LON, MAX_LON = 174.2000, 175.3000
    
    if not (MIN_LAT <= lat <= MAX_LAT and MIN_LON <= lon <= MAX_LON):
        raise HTTPException(
            status_code=400, 
            detail="Access Denied: This service is strictly exclusive to the Greater Auckland region and its suburbs."
        )
    
    # 2. Fetch live metrics from OpenWeatherMap
    weather_data = get_auckland_weather()
    weather_condition = weather_data.get("condition", "Clouds")
    
    # 3. Feed the metrics into your local LangChain + Gemma 2:2b model
    ai_chosen_category = get_ai_decision(
        user_budget=budget, 
        weather_condition=weather_condition, 
        user_vibe=vibe
    )
    
    # 4. Query TomTom using Gemma's category and the validated suburb coordinates
    live_places = get_auckland_places(
        target_category=ai_chosen_category,
        lat=lat,
        lon=lon
    )
    
    return {
        "status": "success",
        "input_received": {
            "budget": budget,
            "vibe_provided": vibe,
            "coordinates_used": {
                "latitude": lat,
                "longitude": lon
            }
        },
        "live_auckland_weather": weather_data,
        "ai_engine_decision": {
            "selected_category": ai_chosen_category
        },
        "live_auckland_places": live_places
    }