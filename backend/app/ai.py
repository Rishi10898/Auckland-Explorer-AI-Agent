"""Create AI-powered Auckland destination recommendations.

This module coordinates live weather and place data with an NVIDIA-hosted
language model, then enriches the first recommendation with transport details.
It is the recommendation-generation layer used by the backend API; it does not
fetch or calculate weather, places, or transport itself.
"""
import os
import json
import logging
from dotenv import load_dotenv
from openai import OpenAI

from app.schemas import DestinationMatchItem
from app.weather import get_auckland_weather
from app.places import get_auckland_places
from app.transport import get_transport_info


# Load environment variables (including NVIDIA_API_KEY) from a local .env file
# when one is present. Deployed environments can provide these variables directly.
load_dotenv()

# A named logger makes AI-service failures identifiable in backend logs.
logger = logging.getLogger("auckland_explorer.ai")

# NVIDIA's OpenAI-compatible API endpoint and the model used for recommendations.
NVIDIA_MODEL = "deepseek-ai/deepseek-v4-flash-0731"
NVIDIA_URL = "https://integrate.api.nvidia.com/v1"


def get_nvidia_client():
    """Build an authenticated client, failing clearly if its API key is absent."""
    key = os.getenv("NVIDIA_API_KEY")

    if not key:
        raise RuntimeError("NVIDIA_API_KEY is not configured.")

    return OpenAI(base_url=NVIDIA_URL, api_key=key)


async def generate_location_recommendations(
    user_prompt: str,
    lat: float,
    lon: float,
    user_preferences: dict
):
    """Gather live context and delegate recommendation generation to the AI.

    Weather is required, and places are searched for each requested category.
    A failure to get required live data stops the flow rather than letting the
    model make recommendations from invented or stale information.
    """
    weather = get_auckland_weather(lat=lat, lon=lon)

    if weather.get("status") != "success":
        raise RuntimeError(
            "LIVE_WEATHER_UNAVAILABLE"
        )

    # Use caller-selected place categories, with beaches and parks as defaults.
    categories = user_preferences.get(
        "categories",
        ["BEACH", "PARK_RECREATION_AREA"]
    )

    # Merge successful results across categories into the model's allowed-place list.
    places = []

    for category in categories:
        result = get_auckland_places(
            target_category=category,
            lat=lat,
            lon=lon,
            radius_meters=user_preferences.get(
                "radius_meters",
                10000
            )
        )

        if result.get("status") == "success":
            places.extend(result.get("places", []))

    if not places:
        raise RuntimeError(
            "LIVE_PLACE_SEARCH_UNAVAILABLE"
        )

    # Pass user intent, preferences, and verified live context to the AI stage.
    return await ask_ai(
        user_prompt,
        user_preferences,
        weather,
        places,
        lat,
        lon
    )


async def ask_ai(
    user_prompt,
    preferences,
    weather,
    places,
    lat,
    lon
):
    """Ask the model to select destinations, validate its output, and add transit.

    The model receives only the live place results as candidate destinations.
    Its response is parsed into the project's schema before transport is queried.
    """
    client = get_nvidia_client()

    # Keep budget and travel mode explicit in the prompt so the model can account
    # for them; a default mode is used when the user did not specify one.
    budget = preferences.get("budget")
    transport_mode = preferences.get(
        "transport",
        "public_transport"
    )

    # The prompt constrains recommendations to real results and requests a stable
    # JSON shape that the backend can validate and return to the frontend.
    prompt = f"""
You are Auckland Explorer.

Your job is to recommend suitable REAL Auckland destinations.

USER REQUEST:
{user_prompt}

USER PREFERENCES:
{json.dumps(preferences, ensure_ascii=False)}

USER BUDGET:
${budget if budget is not None else "not specified"}

TRANSPORT:
{transport_mode}

LIVE WEATHER:
{json.dumps(weather, ensure_ascii=False)}

REAL TOMTOM PLACES:
{json.dumps(places, ensure_ascii=False)}

RULES:

1. Only recommend places contained in the REAL TOMTOM PLACES.
2. Never invent a destination.
3. Consider weather.
4. Consider distance.
5. Consider the user's transport preference.
6. Consider the user's budget.
7. Return no more than 5 destinations.
8. Give a concise reason for every recommendation.
9. Do not invent transport fares or ETAs.
10. If live transport information is unavailable, say so.
11. Keep the entire response concise.
12. Return ONLY JSON.

Return exactly:

{{
  "summary": "Short overall recommendation.",
  "recommendations": [
    {{
      "place_name": "...",
      "category": "...",
      "relevance_rationale": "...",
      "auckland_council_url": "https://www.aucklandcouncil.govt.nz/",
      "latitude": 0,
      "longitude": 0
    }}
  ]
}}
"""

    # Request a non-streaming completion because the backend processes one complete
    # JSON response. Parse model output and normalize failures for the API layer.
    try:
        response = client.chat.completions.create(
            model=NVIDIA_MODEL,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            top_p=0.95,
            max_tokens=3000,
            stream=False
        )

        text = response.choices[0].message.content

        if not text:
            raise RuntimeError("AI_EMPTY_RESPONSE")

        # Models sometimes wrap otherwise valid JSON in a Markdown code fence;
        # remove that wrapper before parsing the JSON payload.
        if text.startswith("```") and text.endswith("```"):
            text = text.split("\n", 1)[1].rsplit("\n", 1)[0]

        data = json.loads(text)

    except Exception as exc:
        logger.exception("AI request failed.")
        raise RuntimeError("AI_MODEL_UNAVAILABLE") from exc

    # Convert plain dictionaries into typed response items and cap the count even
    # if the model ignores the requested maximum.
    try:
        recommendations = [
            DestinationMatchItem(**item)
            for item in data.get("recommendations", [])[:5]
        ]
    except (AttributeError, TypeError, ValueError) as exc:
        logger.exception("AI response has an invalid recommendation shape.")
        raise RuntimeError("AI_INVALID_RESPONSE") from exc

    if not recommendations:
        raise RuntimeError(
            "AI_NO_VALID_RECOMMENDATIONS"
        )

    # Transport details are currently calculated for the top-ranked destination.
    # Coordinates are required to query the transport service correctly.
    first = recommendations[0]

    if first.latitude is None or first.longitude is None:
        raise RuntimeError("AI_INVALID_RESPONSE")

    # Enrich the recommendation response using the user's origin, budget, and mode.
    transport = await get_transport_info(
        user_lat=lat,
        user_lon=lon,
        dest_lat=first.latitude,
        dest_lon=first.longitude,
        budget=preferences.get("budget"),
        transport_mode=transport_mode
    )

    # Return the concise summary, validated destination objects, and transport data
    # in the structure expected by the rest of the application.
    return {
        "summary": data.get("summary", ""),
        "recommendations": recommendations,
        "transport": transport
    }