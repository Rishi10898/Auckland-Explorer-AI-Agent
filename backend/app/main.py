"""Auckland Explorer API entrypoint.

Provides a health-check and a mock recommendation endpoint used for
testing routing and response shape before AI integration.
"""

from fastapi import FastAPI
from app.config import settings  # reserved for runtime configuration


app = FastAPI(title="Auckland Explorer AI Agent API")


@app.get("/")
def read_root():
    """Health-check: returns a simple running message."""
    return {"message": "Auckland Explorer API is running successfully"}


@app.get("/api/recommend")
def get_dummy_recommendation(budget: float = 0.0, weather: str = "sunny"):
    """Mock recommendation: echoes inputs and returns a fixed result."""

    return {
        "status": "success",
        "input_received": {"budget": budget, "weather": weather},
        "recommendation": {
            "place_name": "Mission Bay Beach (Mock)",
            "description": "White-sand beach near Auckland CBD. Good for swimming.",
            "estimated_cost": 5.00,
            "suitability_flag": "Safe to swim",
        },
    }