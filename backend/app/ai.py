import os
import json
from typing import Optional, List, Dict, Any
import httpx
from fastapi import HTTPException
from app.config import settings
from app.types.ai import DestinationMatchResponse, RecommendedPlace

GEMINI_MODEL_ID = "gemini-2.5-flash-lite"
GEMINI_BASE_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL_ID}:generateContent"

def _get_api_key() -> str:
    return getattr(settings, "GEMINI_API_KEY", None) or os.getenv("GEMINI_API_KEY") or ""

async def get_cloud_destination_match(
    user_vibe: str,
    user_lat: float = -36.8485,
    user_lon: float = 174.7633,
    mode: str = "bus",
    radius_meters: int = 10000,
    conversation_stage: str = "recommend",
    nearby_places: Optional[List[Dict[str, Any]]] = None
) -> DestinationMatchResponse:
    """
    Queries the Gemini API to match preferences against geographical locations.
    Returns a strictly typed DestinationMatchResponse dictionary framework.
    """
    api_key = _get_api_key()

    # Define structural fallback values safely typed as a RecommendedPlace list
    fallback_place: RecommendedPlace = {
        "name": "Takapuna Beach / Waitematā",
        "suburb": "Tāmaki Makaurau",
        "cultural_significance": "A prominent coastal landmark along the Waitematā with views of Rangitoto Island.",
        "popular_for": "Swimming, coastal walks, paddleboarding, and local dining.",
        "nearby_attractions": "Takapuna Beach Reserve, Lake Pupuke, and local market shops.",
        "amenities": ["Public restrooms", "Cafes", "Parking", "Lifeguard patrols"],
        "auckland_council_url": "https://www.aucklandcouncil.govt.nz/parks-recreation/Pages/default.aspx",
        "latitude": user_lat,
        "longitude": user_lon
    }

    if nearby_places and len(nearby_places) > 0:
        first_p = nearby_places[0]
        fallback_place["name"] = str(first_p.get("name", fallback_place["name"]))
        fallback_place["suburb"] = str(first_p.get("suburb", fallback_place["suburb"]))
        fallback_place["latitude"] = float(first_p.get("latitude", user_lat))
        fallback_place["longitude"] = float(first_p.get("longitude", user_lon))

    # Core system structural fallback mapping
    default_response: DestinationMatchResponse = {
        "conversational_response": "Kia ora! I am having trouble connecting to my decision engine. Here is a default suggestion in Tāmaki Makaurau.",
        "recommended_places": [fallback_place],
        "show_transit_links": False,
        "follow_up_question": "Does Takapuna Beach sound ideal for your trip, or would you prefer a different area?"
    }

    if not api_key:
        return default_response

    places_context = ""
    if nearby_places:
        places_context = "Discovered Candidate Places in Search Radius:\n"
        for p in nearby_places:
            places_context += f"- {p.get('name')} | Address: {p.get('formatted_address')} | Distance: {p.get('distance_meters')}m\n"

    system_instruction = (
        "You are an expert conversational AI travel guide for Tāmaki Makaurau (Auckland).\n"
        "Your role is to converse naturally with the user and narrow down the best places to visit.\n\n"
        "MANDATORY GUIDELINES:\n"
        "1. Always refer to Tāmaki Makaurau alongside or in place of 'Auckland' to maintain cultural alignment.\n"
        "2. NARROW DOWN choices: Select 1 to 3 top places matching the user's vibe, travel mode, and search radius.\n"
        "3. Provide cultural snippets: Include the cultural heritage or local history of the location, popular highlights, nearby attractions, and key amenities.\n"
        "4. Include official links: Provide a valid Auckland Council or Regional park URL for users to verify history and details.\n"
        "5. Set 'show_transit_links' to true ONLY if conversation_stage is 'confirm'. Otherwise, set it to false."
    )

    user_content = (
        f"User Query/Vibe: '{user_vibe}'\n"
        f"Conversation Stage: '{conversation_stage}'\n"
        f"Selected Travel Mode: '{mode}'\n"
        f"User Search Radius: {radius_meters / 1000:.1f} km\n"
        f"User GPS Location: ({user_lat}, {user_lon})\n"
        f"{places_context}"
    )

    gemini_payload = {
        "contents": [{"parts": [{"text": user_content}]}],
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "object",
                "properties": {
                    "conversational_response": {"type": "string"},
                    "show_transit_links": {"type": "boolean"},
                    "follow_up_question": {"type": "string"},
                    "recommended_places": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "suburb": {"type": "string"},
                                "cultural_significance": {"type": "string"},
                                "popular_for": {"type": "string"},
                                "nearby_attractions": {"type": "string"},
                                "amenities": {"type": "array", "items": {"type": "string"}},
                                "auckland_council_url": {"type": "string"},
                                "latitude": {"type": "number"},
                                "longitude": {"type": "number"}
                            },
                            "required": [
                                "name", "suburb", "cultural_significance", "popular_for", 
                                "nearby_attractions", "amenities", "auckland_council_url", 
                                "latitude", "longitude"
                            ]
                        }
                    }
                },
                "required": ["conversational_response", "show_transit_links", "follow_up_question", "recommended_places"]
            }
        }
    }

    async with httpx.AsyncClient() as client:
        try:
            url = f"{GEMINI_BASE_URL}?key={api_key}"
            response = await client.post(url, json=gemini_payload, timeout=20.0)
            
            if response.status_code == 429:
                raise HTTPException(status_code=429, detail="Inference quota exhausted (15 RPM limit).")
            elif response.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Upstream Engine failure state. Status: {response.status_code}")
                
            response_data = response.json()
            raw_output_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
            
            # Cast the dynamic json object structure into our strictly typed model format
            parsed_data: DestinationMatchResponse = json.loads(raw_output_text)
            return parsed_data
            
        except (httpx.RequestError, KeyError, json.JSONDecodeError) as e:
            print(f"[DEFENSIVE FAILSAFE ENCOUNTERED]: {str(e)}")
            
            # Repopulate static error message into structural error fallback structure cleanly
            error_fallback = default_response.copy()
            error_fallback["conversational_response"] = "Kia ora! I encountered an infrastructure latency error searching across Tāmaki Makaurau. Here is a recommended spot near you."
            
            if len(error_fallback["recommended_places"]) > 0:
                error_fallback["recommended_places"][0]["name"] = "Auckland Domain / Pukekawa"
                error_fallback["recommended_places"][0]["suburb"] = "Grafton, Tāmaki Makaurau"
                error_fallback["recommended_places"][0]["cultural_significance"] = "Centered on Pukekawa, an ancient volcanic crater with deep historical significance."
                error_fallback["recommended_places"][0]["popular_for"] = "Auckland War Memorial Museum, Wintergardens, and local historical trails."
                error_fallback["recommended_places"][0]["nearby_attractions"] = "Parnell Village and the Domain Wintergardens."
                error_fallback["recommended_places"][0]["amenities"] = ["Parking", "Restrooms", "Cafes", "Wheelchair access"]
            
            error_fallback["follow_up_question"] = "Would you like me to look up transit routes to Pukekawa, or try another search variant?"
            return error_fallback

async def get_ai_synthesis(full_prompt: str) -> str:
    api_key = _get_api_key()
    if not api_key:
        return "AI synthesis unavailable — GEMINI_API_KEY not set in configuration."

    gemini_payload = {
        "contents": [{"parts": [{"text": full_prompt}]}],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 400
        }
    }

    async with httpx.AsyncClient() as client:
        try:
            url = f"{GEMINI_BASE_URL}?key={api_key}"
            response = await client.post(url, json=gemini_payload, timeout=15.0)
            if response.status_code != 200:
                return f"AI synthesis error: Gateway response code {response.status_code}"
                
            response_data = response.json()
            raw_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
            return (raw_text or "").strip()
            
        except Exception as e:
            return f"AI synthesis offline: {str(e)}"