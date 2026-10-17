from pydantic import BaseModel, Field, AnyHttpUrl
from typing import Optional


"""Validation schemas for Auckland Explorer API requests and responses.

Pydantic uses these models to validate input values and shape API output.
"""


# Restrict supplied coordinates to the Auckland service area.
class GeolocationCoordinates(BaseModel):
    """A user's location, with latitude and longitude bounds validated on input."""

    latitude: float = Field(..., ge=-37.3000, le=-36.3000)
    longitude: float = Field(..., ge=174.4000, le=175.3000)


# Describe one place selected to match the user's request.
class DestinationMatchItem(BaseModel):
    """A recommended place with its explanation, council link, and optional coordinates."""

    place_name: str
    category: str
    relevance_rationale: str
    auckland_council_url: AnyHttpUrl
    latitude: Optional[float] = None
    longitude: Optional[float] = None


# Provide transit guidance when it is available for a recommendation.
class TransportInfo(BaseModel):
    """Transport mode, route details, and optional planning or live-status links."""

    mode: str
    route: Optional[str] = None
    status: Optional[str] = None
    fare: Optional[str] = None
    budget_fit: Optional[str] = None
    journey_planner_url: Optional[AnyHttpUrl] = None
    realtime_url: Optional[AnyHttpUrl] = None


# Assemble the user-facing result from recommendations and supporting context.
class DestinationMatchResponse(BaseModel):
    """API response containing destination matches and optional transport and safety details."""

    cultural_greeting: str
    summary: str
    recommended_destinations: list[DestinationMatchItem]
    transport: Optional[TransportInfo] = None
    environmental_safety_notice: Optional[str] = None


# Define the data needed to generate personalized destination suggestions.
class ChatRequest(BaseModel):
    """Incoming chat request with a location, intent, and optional preferences."""

    coordinates: GeolocationCoordinates
    user_intent_prompt: str
    user_preferences: dict = {}