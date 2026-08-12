from typing import List, TypedDict

class RecommendedPlace(TypedDict):
    name: str
    suburb: str
    cultural_significance: str
    popular_for: str
    nearby_attractions: str
    amenities: List[str]
    auckland_council_url: str
    latitude: float
    longitude: float

class DestinationMatchResponse(TypedDict):
    conversational_response: str
    show_transit_links: bool
    follow_up_question: str
    recommended_places: List[RecommendedPlace]