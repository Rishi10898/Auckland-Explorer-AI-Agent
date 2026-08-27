from pydantic import BaseModel, Field, AnyHttpUrl
from typing import Optional


class GeolocationCoordinates(BaseModel):
    latitude: float = Field(..., ge=-37.3000, le=-36.3000)
    longitude: float = Field(..., ge=174.4000, le=175.3000)


class DestinationMatchItem(BaseModel):
    place_name: str
    category: str
    relevance_rationale: str
    auckland_council_url: AnyHttpUrl
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class TransportInfo(BaseModel):
    mode: str
    route: Optional[str] = None
    status: Optional[str] = None
    fare: Optional[str] = None
    budget_fit: Optional[str] = None
    journey_planner_url: Optional[AnyHttpUrl] = None
    realtime_url: Optional[AnyHttpUrl] = None


class DestinationMatchResponse(BaseModel):
    cultural_greeting: str
    summary: str
    recommended_destinations: list[DestinationMatchItem]
    transport: Optional[TransportInfo] = None
    environmental_safety_notice: Optional[str] = None


class ChatRequest(BaseModel):
    coordinates: GeolocationCoordinates
    user_intent_prompt: str
    user_preferences: dict = {}