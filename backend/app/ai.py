import os
import json
from typing import Optional, List, Dict, Any
from openai import OpenAI
from app.config import settings

def get_cloud_destination_match(
    user_vibe: str, 
    user_lat: float = -36.8485, 
    user_lon: float = 174.7633, 
    mode: str = "bus",
    radius_meters: int = 10000,
    nearby_places: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Uses OpenAI's gpt-oss-120b hosted serverless on Hugging Face as a primary decision engine.
    Dynamically identifies places across Greater Auckland without restricting to a pre-filtered list.
    """
    hf_token = getattr(settings, "HUGGINGFACE_API_KEY", None)
    
    # Baseline fallback if token isn't initialized
    if not hf_token:
        fallback = nearby_places[0] if nearby_places else {}
        return {
            "name": fallback.get("name", "Auckland Location"),
            "suburb": fallback.get("suburb", "Auckland"),
            "latitude": fallback.get("latitude", user_lat),
            "longitude": fallback.get("longitude", user_lon),
            "bus_accessible": True,
            "recommended_mode": mode,
            "transit_mismatch": False,
            "mismatch_message": None,
            "ai_reasoning": "Fallback location returned due to missing API configuration."
        }

    # Initialize OpenAI client pointing to Hugging Face Router
    client = OpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=hf_token
    )

    # Context about nearby options
    places_context = ""
    if nearby_places:
        places_context = "Optional Local Suggestions Near User:\n"
        for p in nearby_places:
            places_context += f"- {p.get('name')} (Lat: {p.get('latitude')}, Lon: {p.get('longitude')})\n"

    system_prompt = (
        "You are the primary decision engine for an Auckland travel assistant AI.\n"
        "You have complete knowledge of Greater Auckland geography, beaches, parks, reserves, trails, and public transit coverage.\n\n"
        "Your Tasks:\n"
        "1. Analyze the user prompt, starting GPS coordinates (user_lat, user_lon), requested travel mode, search radius, and vibe/destination preferences.\n"
        "2. Identify the target location in Greater Auckland:\n"
        "   - If a specific place is requested (e.g. 'Piha Beach', 'Mission Bay', 'Takapuna', 'Cornwall Park'), locate that exact spot and estimate its accurate latitude/longitude.\n"
        "   - If a general vibe is requested, pick a real, highly relevant place anywhere in Greater Auckland.\n"
        "3. Evaluate Auckland Transport (AT) Bus/Train Accessibility:\n"
        "   - Remote West Coast/rural spots (e.g., Piha, Karekare, Bethells, Muriwai, Anawhata, Waitākere Ranges regional parks) DO NOT have AT bus/train service.\n"
        "   - Urban suburbs, harbor beaches, and central parks DO have public transit service.\n"
        "4. Transport Mismatch Logic:\n"
        "   - If the user selected 'bus' but the chosen location is NOT bus-accessible, set 'bus_accessible': false and 'transit_mismatch': true. Explain clearly in 'mismatch_message'.\n\n"
        "CRITICAL: Respond ONLY with a raw JSON object string. Do not write markdown code blocks or any extra conversational text. "
        "Strictly match this JSON structure:\n"
        "{\n"
        '  "name": "Chosen Place Name",\n'
        '  "suburb": "Suburb or Area",\n'
        '  "latitude": -36.xxxx,\n'
        '  "longitude": 174.xxxx,\n'
        '  "bus_accessible": true,\n'
        '  "recommended_mode": "bus",\n'
        '  "transit_mismatch": false,\n'
        '  "mismatch_message": null,\n'
        '  "ai_reasoning": "Concise 2-sentence explanation of why this spot fits their prompt and starting location."\n'
        "}"
    )

    user_content = (
        f"User Query/Vibe: '{user_vibe}'\n"
        f"Selected Travel Mode: '{mode}'\n"
        f"Max Search Radius Chosen by User: {radius_meters / 1000:.1f} km\n"
        f"User Starting Location: ({user_lat}, {user_lon})\n"
        f"{places_context}"
    )

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:fireworks-ai",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.2
        )

        raw_content = (response.choices[0].message.content or "").strip()
        
        # Strip out code fences if model includes them
        if "```json" in raw_content:
            raw_content = raw_content.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_content:
            raw_content = raw_content.split("```")[1].split("```")[0].strip()

        return json.loads(raw_content)

    except Exception as e:
        print(f"GPT-OSS-120b Router Fallback Triggered: {e}")
        fallback = nearby_places[0] if nearby_places else {}
        return {
            "name": fallback.get("name", "Auckland City Center"),
            "suburb": "Auckland",
            "latitude": fallback.get("latitude", user_lat),
            "longitude": fallback.get("longitude", user_lon),
            "bus_accessible": True,
            "recommended_mode": mode,
            "transit_mismatch": False,
            "mismatch_message": None,
            "ai_reasoning": "Dynamic search hit an error boundary. Displaying current location context."
        }


def get_ai_synthesis(full_prompt: str) -> str:
    """
    Sends the fully assembled context to gpt-oss-120b via Hugging Face
    and returns a plain-English synthesis for the user.
    """
    hf_token = getattr(settings, "HUGGINGFACE_API_KEY", None)
    if not hf_token:
        return "AI synthesis unavailable — HUGGINGFACE_API_KEY not set in .env"

    client = OpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=hf_token
    )

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:fireworks-ai",
            messages=[
                {"role": "user", "content": full_prompt}
            ],
            temperature=0.3,
            max_tokens=400
        )
        return (response.choices[0].message.content or "").strip()
    except Exception as e:
        print(f"AI synthesis error: {e}")
        return f"AI synthesis unavailable: {str(e)}"