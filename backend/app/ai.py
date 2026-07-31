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
    conversation_stage: str = "recommend",
    nearby_places: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Uses OpenAI's gpt-oss-120b model hosted on Hugging Face as an interactive decision engine.
    Analyzes vibe/prompt within search radius, incorporates Tāmaki Makaurau cultural values,
    and returns narrowed recommendations prior to confirming transit details.
    """
    hf_token = getattr(settings, "HUGGINGFACE_API_KEY", None)

    # Fallback structure if Hugging Face token is not set
    if not hf_token:
        fallback = nearby_places[0] if nearby_places else {}
        return {
            "conversational_response": "Kia ora! I am having trouble connecting to my decision engine. Here is a default suggestion in Tāmaki Makaurau.",
            "recommended_places": [{
                "name": fallback.get("name", "Takapuna Beach / Waitematā"),
                "suburb": fallback.get("suburb", "Tāmaki Makaurau"),
                "cultural_significance": "A prominent coastal landmark along the Waitematā with views of Rangitoto Island.",
                "popular_for": "Swimming, coastal walks, paddleboarding, and local dining.",
                "nearby_attractions": "Takapuna Beach Reserve, Lake Pupuke, and local market shops.",
                "amenities": ["Public restrooms", "Cafes", "Parking", "Lifeguard patrols"],
                "auckland_council_url": "https://www.aucklandcouncil.govt.nz/parks-recreation/Pages/default.aspx",
                "latitude": fallback.get("latitude", user_lat),
                "longitude": fallback.get("longitude", user_lon)
            }],
            "show_transit_links": False,
            "follow_up_question": "Does Takapuna Beach sound ideal for your trip, or would you prefer a different area?"
        }

    # Initialize OpenAI client pointing to Hugging Face Inference Router
    client = OpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=hf_token
    )

    # Construct context from TomTom category search
    places_context = ""
    if nearby_places:
        places_context = "Discovered Candidate Places in Search Radius:\n"
        for p in nearby_places:
            places_context += f"- {p.get('name')} | Address: {p.get('formatted_address')} | Distance: {p.get('distance_meters')}m\n"

    system_prompt = (
        "You are an expert conversational AI travel guide for Tāmaki Makaurau (Auckland).\n"
        "Your role is to converse naturally with the user and narrow down the best places to visit.\n\n"
        "MANDATORY GUIDELINES:\n"
        "1. Always refer to Tāmaki Makaurau alongside or in place of 'Auckland'.\n"
        "2. NARROW DOWN choices: Select 1 to 3 top places matching the user's vibe, travel mode, and search radius.\n"
        "3. Provide cultural snippets: Include the cultural heritage or local history of the location, popular highlights, nearby attractions, and key amenities (e.g. restrooms, parking, cafes).\n"
        "4. Include official links: Provide a valid Auckland Council or Regional park URL for users to verify history and details.\n"
        "5. DO NOT throw navigation links immediately! Converse first. Ask the user if they want to confirm or explore a specific spot.\n"
        "6. Set 'show_transit_links' to true ONLY if conversation_stage is 'confirm'. Otherwise, set it to false.\n\n"
        "CRITICAL: Respond STRICTLY in raw JSON matching this schema (no markdown formatting code blocks):\n"
        "{\n"
        '  "conversational_response": "Warm, engaging intro message greeting the user in Tāmaki Makaurau.",\n'
        '  "recommended_places": [\n'
        "    {\n"
        '      "name": "Place Name",\n'
        '      "suburb": "Suburb / Region in Tāmaki Makaurau",\n'
        '      "cultural_significance": "Cultural or historical context of the site",\n'
        '      "popular_for": "Main highlights and activities",\n'
        '      "nearby_attractions": "Surrounding places to explore",\n'
        '      "amenities": ["Restrooms", "Cafes", "Parking"],\n'
        '      "auckland_council_url": "https://www.aucklandcouncil.govt.nz/...",\n'
        '      "latitude": -36.xxxx,\n'
        '      "longitude": 174.xxxx\n'
        "    }\n"
        "  ],\n"
        '  "show_transit_links": false,\n'
        '  "follow_up_question": "A friendly question asking the user to confirm their choice or refine their search."\n'
        "}"
    )

    user_content = (
        f"User Query/Vibe: '{user_vibe}'\n"
        f"Conversation Stage: '{conversation_stage}'\n"
        f"Selected Travel Mode: '{mode}'\n"
        f"User Search Radius: {radius_meters / 1000:.1f} km\n"
        f"User GPS Location: ({user_lat}, {user_lon})\n"
        f"{places_context}"
    )

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:fireworks-ai",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.3
        )

        raw_content = (response.choices[0].message.content or "").strip()

        # Sanitize code fence wrappers if present in model output
        if "```json" in raw_content:
            raw_content = raw_content.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_content:
            raw_content = raw_content.split("```")[1].split("```")[0].strip()

        return json.loads(raw_content)

    except Exception as e:
        print(f"GPT-OSS-120B Decision Error: {e}")
        fallback = nearby_places[0] if nearby_places else {}
        return {
            "conversational_response": "Kia ora! I encountered an error searching across Tāmaki Makaurau. Here is a recommended spot near you.",
            "recommended_places": [{
                "name": fallback.get("name", "Auckland Domain / Pukekawa"),
                "suburb": "Grafton, Tāmaki Makaurau",
                "cultural_significance": "Centered on Pukekawa, an ancient volcanic crater with deep historical significance in Tāmaki Makaurau.",
                "popular_for": "Auckland War Memorial Museum, Wintergardens, and duck ponds.",
                "nearby_attractions": "Parnell Village and the Domain Wintergardens.",
                "amenities": ["Parking", "Restrooms", "Cafes", "Wheelchair access"],
                "auckland_council_url": "https://www.aucklandcouncil.govt.nz/parks-recreation/Pages/default.aspx",
                "latitude": fallback.get("latitude", user_lat),
                "longitude": fallback.get("longitude", user_lon)
            }],
            "show_transit_links": False,
            "follow_up_question": "Would you like me to look up transit routes to Pukekawa, or refine your search?"
        }


def get_ai_synthesis(full_prompt: str) -> str:
    """
    Generates a plain-English trip synthesis using gpt-oss-120b on Hugging Face.
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
            messages=[{"role": "user", "content": full_prompt}],
            temperature=0.3,
            max_tokens=400
        )
        return (response.choices[0].message.content or "").strip()
    except Exception as e:
        print(f"AI synthesis error: {e}")
        return f"AI synthesis unavailable: {str(e)}"