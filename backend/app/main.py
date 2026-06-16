"""Auckland Explorer API entrypoint.

Provides a health-check and a mock recommendation endpoint used for
testing routing and response shape before AI integration.
"""
from fastapi import FastAPI
from app.weather import get_auckland_weather
from app.ai import get_ai_decision
from app.places import get_auckland_places

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Auckland Explorer API with LangChain & Gemma 2 is running!"}

@app.get("/api/recommend")
def get_recommendation(budget: float = 0.0, vibe: str = "relaxing outdoor walk"):
    # 1. Fetch live metrics from OpenWeatherMap
    weather_data = get_auckland_weather()
    weather_condition = weather_data.get("condition", "Clouds")
    
    # 2. Feed the data into your new LangChain + Gemma 2:2b model
    ai_chosen_category = get_ai_decision(
        user_budget=budget, 
        weather_condition=weather_condition, 
        user_vibe=vibe
    )
    
    # 3. Use Gemma's single chosen category to run a targeted TomTom search
    live_places = get_auckland_places(target_category=ai_chosen_category)
    
    # 4. Return everything to the browser
    return {
        "status": "success",
        "input_received": {
            "budget": budget,
            "vibe_provided": vibe
        },
        "live_auckland_weather": weather_data,
        "ai_engine_decision": {
            "selected_category": ai_chosen_category
        },
        "live_auckland_places": live_places,
        "recommendation": {
            "place_name": f"Top recommendation selected from {ai_chosen_category}",
            "description": f"Gemma automatically chose this category because it matched your budget (${budget}) and the weather ({weather_condition}).",
            "suitability_flag": "Dynamically optimized by LangChain + Gemma 2"
        }
    }