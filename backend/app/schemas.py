"""Validated request/response contracts for the chat API.

Purpose: constrain user input and model-selected results to known data.
Workflow: HTTP request -> Pydantic validation -> service layer -> typed API response.
"""
from typing import Literal

from pydantic import AnyHttpUrl, BaseModel, Field, model_validator


# Restrict supplied coordinates to the Auckland service area.
class GeolocationCoordinates(BaseModel):
    """A user's location, with latitude and longitude bounds validated on input."""

    latitude: float = Field(ge=-37.3000, le=-36.3000)
    longitude: float = Field(ge=174.4000, le=175.3000)


class UserPreferences(BaseModel):
    """Validated guided choices shared by the chat UI and recommendation service."""

    categories: list[
        Literal["BEACH", "PARK_RECREATION_AREA", "TOURIST_ATTRACTION"]
    ] = Field(
        default_factory=lambda: ["BEACH", "PARK_RECREATION_AREA"],
        min_length=1,
        max_length=3,
    )
    transport: Literal[
        "public_transport", "drive", "cycle", "walk"
    ] = "public_transport"
    radius_meters: Literal[2000, 3000, 5000] = 2000
    budget: float | None = Field(default=None, ge=0, le=10000)

    @model_validator(mode="before")
    @classmethod
    def accept_legacy_transport_name(cls, value):
        """Accept the former frontend's transport_mode field during migration."""
        if isinstance(value, dict) and "transport" not in value:
            legacy_mode = value.get("transport_mode")
            if legacy_mode is not None:
                return {**value, "transport": legacy_mode}
        return value


# Describe one place selected to match the user's request.
class DestinationMatchItem(BaseModel):
    """A verified candidate, with optional navigation and straight-line distance."""

    candidate_id: str
    place_name: str = Field(min_length=1, max_length=200)
    category: str
    relevance_rationale: str = Field(min_length=1, max_length=500)
    auckland_council_url: AnyHttpUrl | None = None
    directions_url: AnyHttpUrl | None = None
    distance_meters: float | None = Field(default=None, ge=0)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


# Provide transit guidance when it is available for a recommendation.
class TransportInfo(BaseModel):
    """Transport mode, route details, and optional planning or live-status links."""

    mode: str
    route: str | None = None
    status: str | None = None
    fare: str | None = None
    budget_fit: str | None = None
    journey_planner_url: AnyHttpUrl | None = None
    realtime_url: AnyHttpUrl | None = None


# Assemble the user-facing result from recommendations and supporting context.
class DestinationMatchResponse(BaseModel):
    """API response containing destination matches and optional transport and safety details."""

    cultural_greeting: str
    summary: str
    recommended_destinations: list[DestinationMatchItem]
    transport: TransportInfo | None = None
    environmental_safety_notice: str | None = None
    environmental_safety_status: Literal["warning", "checked", "unverified"] = "unverified"
    environmental_safety_source: AnyHttpUrl | None = None
    ai_provider: Literal["gemini", "nvidia"] | None = None


# Define the data needed to generate personalized destination suggestions.
class ChatRequest(BaseModel):
    """Incoming chat request with a location, intent, and optional preferences."""

    coordinates: GeolocationCoordinates
    user_intent_prompt: str = Field(min_length=1, max_length=500)
    user_preferences: UserPreferences = Field(default_factory=UserPreferences)