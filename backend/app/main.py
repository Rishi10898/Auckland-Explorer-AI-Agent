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


# --- REQUEST & RESPONSE SCHEMAS ---
class ChatRequest(BaseModel):
    message: str
    user_lat: float = -36.8485
    user_lon: float = 174.7633
    mode: str = "bus"
    radius_meters: int = 10000
    stage: str = "recommend"  # 'recommend' or 'confirm'


class SynthesisRequest(BaseModel):
    prompt: str


# --- LIFESPAN BACKGROUND WORKERS ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initiate Safeswim background monitor loop
    bg_task = asyncio.create_task(safeswim_background_scheduler())
    yield
    bg_task.cancel()  # Gracefully shut down on exit


app = FastAPI(lifespan=lifespan)
__all__ = ["app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- CONVERSATIONAL CHAT API ENDPOINT ---
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Primary Conversational Endpoint:
    Engages in dialogue, recommends options across Tāmaki Makaurau with cultural/amenity snippets,
    and only generates transit links upon explicit user decision/confirmation.
    """
    # 1. Geofence Boundary Check (Greater Tāmaki Makaurau area)
    MIN_LAT, MAX_LAT = -37.3000, -36.3000
    MIN_LON, MAX_LON = 174.2000, 175.3000
    if not (MIN_LAT <= request.user_lat <= MAX_LAT and MIN_LON <= request.user_lon <= MAX_LON):
        raise HTTPException(
            status_code=400,
            detail="Access Denied: Location lies outside Greater Tāmaki Makaurau region."
        )

    # 2. Extract Context Parameters & Weather
    weather_data = get_auckland_weather()
    vibe_lower = request.message.lower()
    category = "BEACH" if ("beach" in vibe_lower or "swim" in vibe_lower) else "PARK_RECREATION_AREA"

    # 3. Soft Context Gathering from TomTom
    places_list: Optional[List[Dict[str, Any]]] = None
    try:
        live_places = get_auckland_places(
            target_category=category,
            lat=request.user_lat,
            lon=request.user_lon,
            radius_meters=request.radius_meters
        )
        places_list = live_places.get("places", [])
    except Exception:
        places_list = None

    # 4. Conversational AI Decision Engine (Hugging Face OSS-120B)
    ai_result = get_cloud_destination_match(
        user_vibe=request.message,
        user_lat=request.user_lat,
        user_lon=request.user_lon,
        mode=request.mode,
        radius_meters=request.radius_meters,
        conversation_stage=request.stage,
        nearby_places=places_list
    )

    # 5. Conditional Transit Fetching (Only generated if confirmed)
    transit_data: List[Dict[str, Any]] = []
    if ai_result.get("show_transit_links") or request.stage == "confirm":
        recommended_places = ai_result.get("recommended_places", [])
        if recommended_places:
            primary_choice = recommended_places[0]
            transit_data = await get_transit_options(
                user_lat=request.user_lat,
                user_lon=request.user_lon,
                dest_lat=primary_choice.get("latitude", request.user_lat),
                dest_lon=primary_choice.get("longitude", request.user_lon)
            )

    # 6. Environmental Safeswim Protection Layer (Beach verification)
    safeswim_report: Dict[str, Any] = {
        "status": "Skipped",
        "message": "Water safety monitoring inactive for this query category."
    }

    recommended_places = ai_result.get("recommended_places", [])
    if recommended_places:
        top_spot = recommended_places[0]
        spot_name = top_spot.get("name", "").lower()
        
        if "beach" in spot_name or "bay" in spot_name or "cove" in spot_name or "swim" in vibe_lower:
            matched_beach = match_closest_auckland_beach(
                top_spot.get("latitude", request.user_lat),
                top_spot.get("longitude", request.user_lon)
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

    return {
        "status": "success",
        "chat_response": ai_result.get("conversational_response"),
        "recommended_places": recommended_places,
        "follow_up_question": ai_result.get("follow_up_question"),
        "show_transit_links": ai_result.get("show_transit_links", False),
        "transit_options": transit_data,
        "safeswim_report": safeswim_report,
        "weather": weather_data
    }


# --- LEGACY / DIRECT COMPATIBILITY ENDPOINT ---
@app.get("/api/recommend")
async def get_recommendation(
    vibe: str = "beach visit swim",
    lat: float = -36.8485,
    lon: float = 174.7633,
    mode: str = "bus",
    radius_meters: int = 10000
):
    """Direct lookup wrapper mapping directly to the conversational chat pipeline."""
    return await chat_endpoint(
        ChatRequest(
            message=vibe,
            user_lat=lat,
            user_lon=lon,
            mode=mode,
            radius_meters=radius_meters,
            stage="recommend"
        )
    )


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