import asyncio
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.ai import get_ai_synthesis, get_cloud_destination_match
from app.places import get_auckland_places
from app.transport import get_transit_options
from app.weather import (
    fetch_specific_beach_profile,
    get_auckland_weather,
    match_closest_auckland_beach,
    safeswim_background_scheduler,
)


class SynthesisRequest(BaseModel):
    prompt: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    bg_task = asyncio.create_task(safeswim_background_scheduler())
    yield
    bg_task.cancel()


app = FastAPI(lifespan=lifespan)
__all__ = ["app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/recommend")
async def get_recommendation(
    vibe: str = "beach visit swim",
    lat: float = -36.8485,
    lon: float = 174.7633,
    mode: str = "bus",
    radius_meters: int = 10000
):
    # 1. Geofence Check
    MIN_LAT, MAX_LAT = -37.3000, -36.3000
    MIN_LON, MAX_LON = 174.2000, 175.3000
    if not (MIN_LAT <= lat <= MAX_LAT and MIN_LON <= lon <= MAX_LON):
        raise HTTPException(
            status_code=400, 
            detail="Access Denied: Area outside Greater Auckland region."
        )

    # 2. Context Gathering
    weather_data = get_auckland_weather()
    vibe_lower = vibe.lower()
    category = "BEACH" if ("beach" in vibe_lower or "swim" in vibe_lower) else "PARK_RECREATION_AREA"

    places_list: Optional[List[Dict[str, Any]]] = None
    try:
        live_places = get_auckland_places(
            target_category=category, 
            lat=lat, 
            lon=lon, 
            radius_meters=radius_meters
        )
        places_list = live_places.get("places", [])
    except Exception:
        places_list = None

    # 3. AI Destination Recommendation
    recommended_destination = get_cloud_destination_match(
        user_vibe=vibe,
        user_lat=lat,
        user_lon=lon,
        mode=mode,
        radius_meters=radius_meters,
        nearby_places=places_list
    )

    # 4. Safeswim Water Quality Matching
    dest_lat = recommended_destination.get("latitude", lat)
    dest_lon = recommended_destination.get("longitude", lon)
    dest_name = recommended_destination.get("name", "").lower()

    safeswim_report: Dict[str, Any] = {
        "status": "Skipped",
        "message": "Environmental tracking is not active for this category."
    }

    if "beach" in dest_name or "bay" in dest_name or "cove" in dest_name or "swim" in vibe_lower:
        matched_beach = match_closest_auckland_beach(dest_lat, dest_lon)
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

    # 5. Get Transit Routes
    transit_options = await get_transit_options(
        user_lat=lat,
        user_lon=lon,
        dest_lat=dest_lat,
        dest_lon=dest_lon
    )

    return {
        "status": "success",
        "chosen_radius_meters": radius_meters,
        "live_auckland_weather": weather_data,
        "recommended_place": recommended_destination,
        "transit_options": transit_options,
        "safeswim_environmental_report": safeswim_report,
        "mode_requested": mode
    }


@app.post("/api/synthesis")
async def summarize_trip(request: SynthesisRequest):
    synthesis = get_ai_synthesis(request.prompt)
    return {"status": "success", "synthesis": synthesis}


@app.get("/api/transit-tracking")
async def get_live_tracking(user_lat: float, user_lon: float, dest_lat: float, dest_lon: float):
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