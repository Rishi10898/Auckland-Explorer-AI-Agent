# Your main server entry point
from fastapi import FastAPI
from app.config import settings

app = FastAPI(title="Auckland Explorer AI Agent API")

@app.get("/")
def read_root():
    return {"message": "Auckland Explorer API is running successfully"}

@app.get("/api/recommend")
def get_dummy_recommendation(budget: float = 0.0, weather: str = "sunny"):
    """
    Dummy/mock endpoint for Sprint 1 to verify routing before adding live AI logic.
    """
    # This simulates what our final AI response structure will look like
    return {
        "status": "success",
        "input_received": {
            "budget": budget,
            "weather": weather
        },
        "recommendation": {
            "place_name": "Mission Bay Beach (Mock)",
            "description": "A beautiful white-sand beach close to Auckland CBD. Great for swimming and ice cream.",
            "estimated_cost": 5.00,
            "suitability_flag": "Safe to swim"
        }
    }