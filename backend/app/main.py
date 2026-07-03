"""Auckland Explorer API entrypoint.

Provides live weather, cloud-hosted AI recommendations via gpt-oss-120b, 
Safeswim water quality reports, and explicit secondary route telemetry tracking.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional
import asyncio

from app.ai import get_cloud_destination_match, get_ai_synthesis
from pydantic import BaseModel

class SynthesisRequest(BaseModel):
    prompt: str

# Clean, singular import architecture mapping directly to your modules
from app.places import get_auckland_places
from app.transport import get_transit_options
from app.weather import (
    get_auckland_weather, 
    safeswim_background_scheduler, 
    match_closest_auckland_beach, 
    fetch_specific_beach_profile
)

# --- START UP / SHUTDOWN LIFESPAN MANAGEMENT ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fire up background scheduler task immediately on boot loop execution
    bg_task = asyncio.create_task(safeswim_background_scheduler())
    yield
    bg_task.cancel()  # Clean up resource when server exits gracefully

app = FastAPI(lifespan=lifespan)
__all__ = ["app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PHASE 1: CHAT DISCOVERY & CLOUD AI RECOMMENDATION ---
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
    
    # 2. Extract context parameters & weather matching
    weather_data = get_auckland_weather()
    
    # Intelligently route broad categories to keep TomTom places queries optimized
    vibe_lower = vibe.lower()
    ai_chosen_category = "BEACH" if "beach" in vibe_lower or "swim" in vibe_lower else "PARK"
    
    # Fetch real nearby location options relative to user's real GPS positioning
    live_places = get_auckland_places(target_category=ai_chosen_category, lat=lat, lon=lon)
    places_list = live_places.get("places", [])
    
    if not places_list:
        raise HTTPException(status_code=404, detail="No matching places found near your coordinates.")

    # 3. Call your Cloud Model (gpt-oss-120b) to match the vibe string to the best physical option
    recommended_destination = get_cloud_destination_match(user_vibe=vibe, nearby_places=places_list)

    # 4. Process Safeswim Protection Layer data points
    safeswim_report = {
        "status": "Skipped",
        "message": f"Environmental tracking is not active for category: {ai_chosen_category}"
    }
    
    if ai_chosen_category == "BEACH":
        matched_beach = match_closest_auckland_beach(
            recommended_destination.get("latitude", lat), 
            recommended_destination.get("longitude", lon)
        )
        
        if matched_beach:
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

    # Notice: Transit options are NOT fetched here. Phase 1 remains light, fast, and secure.
    return {
        "status": "success",
        "live_auckland_weather": weather_data,
        "category": ai_chosen_category,
        "recommended_place": recommended_destination,
        "safeswim_environmental_report": safeswim_report
    }


# --- PHASE 2: TELEMETRY TRACKING ON CONFIRMATION ---
@app.get("/api/transit-tracking")
async def get_live_tracking(user_lat: float, user_lon: float, dest_lat: float, dest_lon: float):
    """
    Fired strictly when the user clicks 'Confirm Destination' in your chat app.
    Connects to the Auckland Transport pipeline to extract true live statuses.
    """
    transit_options = await get_transit_options(
        user_lat=user_lat, 
        user_lon=user_lon, 
        dest_lat=dest_lat, 
        dest_lon=dest_lon
    )
    return {
        "status": "tracking",
        "transit_options": transit_options
    }