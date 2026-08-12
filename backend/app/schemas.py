"""
Auckland Explorer - Data Validation Schema Architecture
Provides explicit runtime structural verification for system interfaces.
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional

class GeolocationCoordinates(BaseModel):
    """
    Validates physical incoming spatial location points.
    Encapsulates input validation strategies targeting geofence constraints.
    """
    latitude: float = Field(
        ..., 
        ge=-37.3000, 
        le=-36.3000, 
        description="Physical latitude constrained within the Auckland regional geofence area."
    )
    longitude: float = Field(
        ..., 
        ge=174.4000, 
        le=175.3000, 
        description="Physical longitude constrained within the Auckland regional geofence area."
    )

class DestinationMatchItem(BaseModel):
    """
    Represents an individual curated regional location destination option.
    Ensures structural data integrity across all internal parsing lifecycles.
    """
    place_name: str = Field(..., min_length=2, description="The formal bicultural name of the destination.")
    category: str = Field(..., description="Classification category matching core search filters.")
    relevance_rationale: str = Field(..., description="System justification outlining relevance to intent.")
    auckland_council_url: HttpUrl = Field(..., description="Verified accessibility reference web destination.")

class DestinationMatchResponse(BaseModel):
    """
    Top-level payload response structure wrapping output operations.
    Guarantees structural conformity before data leaves the system boundary.
    """
    cultural_greeting: str = Field(..., description="Formal te reo greeting honoring mana whenua spaces.")
    recommended_destinations: List[DestinationMatchItem] = Field(
        ..., 
        max_items=5, 
        description="List of matched locations matching contextual filtering constraints."
    )
    environmental_safety_notice: Optional[str] = Field(
        None, 
        description="Real-time water safety or weather alert notice protecting the visitor."
    )