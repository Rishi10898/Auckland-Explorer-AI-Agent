"""Auckland Explorer API entrypoint.

Provides live weather, AI category decision filtering, Safeswim water 
quality reports, and Auckland Transport multi-modal route tracking.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional
import asyncio

from app.weather import (
    get_auckland_weather, 
    safeswim_background_scheduler, 
    match_closest_auckland_beach, 
    fetch_specific_beach_profile
)
from app.ai import get_ai_decision
from app.places import get_auckland_places
# Import our new transport service module layer
from app.transport import get_transit_options

# --- START UP / SHUTDOWN LIFESPAN MANAGEMENT ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fire up background scheduler task task immediately on boot loop execution
    bg_task = asyncio.create_task(safeswim_background_scheduler())
    yield
    bg_task.cancel() # Clean up resource when server exits gracefully

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/recommend")
async def get_recommendation(
    budget: float = 0.0, 
    vibe: str = "beach visit swim", 
    lat: float = -36.8485, 
    lon: float = 174.7633,
    destination_name: Optional[str] = None
):
    # 1. Geofence Boundary Check
    MIN_LAT, MAX_LAT = -37.3000, -36.3000
    MIN_LON, MAX_LON = 174.2000, 175.3000
    if not (MIN_LAT <= lat <= MAX_LAT and MIN_LON <= lon <= MAX_LON):
        raise HTTPException(status_code=400, detail="Access Denied: Area outside Greater Auckland region.")
    
    # 2. Extract context parameters
    weather_data = get_auckland_weather()
    weather_condition = weather_data.get("condition", "Clouds")
    
    ai_chosen_category = get_ai_decision(user_budget=budget, weather_condition=weather_condition, user_vibe=vibe)
    live_places = get_auckland_places(target_category=ai_chosen_category, lat=lat, lon=lon)
    
    # 3. Process Dynamic Safeswim Integration Pipeline
    safeswim_report = {
        "status": "Skipped",
        "message": f"Environmental tracking is not active for category: {ai_chosen_category}"
    }
    
    if ai_chosen_category == "BEACH":
        matched_beach = None
        
        if destination_name:
            from app.weather import SAFESWIM_GLOBAL_LOCATIONS
            normalized_search = destination_name.lower().strip()
            for loc in SAFESWIM_GLOBAL_LOCATIONS:
                if normalized_search in loc.get("name", "").lower():
                    matched_beach = loc
                    break
        
        if not matched_beach:
            matched_beach = match_closest_auckland_beach(lat, lon)
        
        is_close_match = False
        if matched_beach:
            pos = matched_beach.get("position", [0, 0])
            approx_dist = (lat - pos[0])**2 + (lon - pos[1])**2
            if approx_dist < 0.0025:  
                is_close_match = True

        if matched_beach and is_close_match:
            slug = matched_beach.get("slug")
            state = matched_beach.get("state", {})
            
            if slug and isinstance(slug, str):
                detailed_info = await fetch_specific_beach_profile(slug)
                safeswim_report = {
                    "source": "Safeswim Official API",
                    "beach_name": matched_beach.get("name"),
                    "water_quality": state.get("quality", "UNKNOWN"),
                    "patrolled": matched_beach.get("patrolled", False),
                    "description": detailed_info.get("description"),
                    "facilities_found": detailed_info.get("facilities"),
                    "active_hazards": detailed_info.get("hazards")
                }
            else:
                safeswim_report = {
                    "source": "Local System Guard",
                    "beach_name": matched_beach.get("name"),
                    "water_quality": state.get("quality", "UNKNOWN"),
                    "patrolled": matched_beach.get("patrolled", False),
                    "description": "Live status verified. Detailed profile data adjusting.",
                    "facilities_found": ["Ocean Access"],
                    "active_hazards": ["General Coastal Water Hazards"]
                }
        else:
            safeswim_report = {
                "source": "Local System Guard",
                "beach_name": "Local Coastal Area",
                "water_quality": "UNMONITORED",
                "patrolled": False,
                "description": "This coastal spot or recreation area is not actively tracked on the Safeswim network.",
                "facilities_found": ["Scenic Viewpoint", "Walking Path"],
                "active_hazards": ["Unmonitored Open Water"]
            }
# 4. Process Dynamic Auckland Transport Route Generation Pipeline
    dest_lat, dest_lon = lat, lon
    places_list = live_places.get("places", [])
    if places_list:
        dest_lat = places_list[0].get("latitude", lat)
        dest_lon = places_list[0].get("longitude", lon)

    transit_options = await get_transit_options(
        user_lat=lat, 
        user_lon=lon, 
        dest_lat=dest_lat, 
        dest_lon=dest_lon
    )

    # 5. NEW: Let the AI evaluate the transit trade-offs
    from app.ai import analyze_transit_options_with_ai
    transit_analysis = analyze_transit_options_with_ai(transit_options, vibe)

    # 6. Compile final aggregate payload map
    return {
        "status": "success",
        "live_auckland_weather": weather_data,
        "ai_engine_decision": {
            "selected_category": ai_chosen_category,
            "transit_recommendation": transit_analysis  # Adds the AI's smart pick here
        },
        "safeswim_environmental_report": safeswim_report,
        "live_auckland_places": live_places,
        "at_transit_options": transit_options
    }