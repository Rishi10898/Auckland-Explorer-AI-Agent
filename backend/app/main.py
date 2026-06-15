"""Auckland Explorer API entrypoint.

Provides a health-check and a mock recommendation endpoint used for
testing routing and response shape before AI integration.
"""
from fastapi import FastAPI
from app.weather import get_auckland_weather
from app.places import get_auckland_places

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Auckland Explorer API is running successfully"}

@app.get("/api/recommend")
def get_recommendation(budget: float = 0.0, weather: str = "sunny"):
    live_weather = get_auckland_weather()
    live_places = get_auckland_places()
    
    return {
        "status": "success",
        "input_received": {
            "budget": budget,
            "weather_parameter_provided": weather
        },
        "live_auckland_weather": live_weather,
        "live_auckland_places": live_places,  # Live TomTom injection
        "recommendation": {
            "place_name": "Mission Bay Beach (Mock Layout)",
            "description": "A beautiful white-sand beach close to Auckland CBD.",
            "estimated_cost": 5.0,
            "suitability_flag": "Safe to swim"
        }
    }