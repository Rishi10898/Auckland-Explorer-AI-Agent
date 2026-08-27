import os
import json
import logging
from dotenv import load_dotenv
from openai import OpenAI

from app.schemas import DestinationMatchItem
from app.weather import get_auckland_weather
from app.places import get_auckland_places
from app.transport import get_transport_info


load_dotenv()

logger = logging.getLogger("auckland_explorer.ai")

NVIDIA_MODEL = "deepseek-ai/deepseek-v4-flash-0731"
NVIDIA_URL = "https://integrate.api.nvidia.com/v1"


def get_nvidia_client():
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

    weather = get_auckland_weather(lat=lat, lon=lon)

    if weather.get("status") != "success":
        raise RuntimeError(
            "LIVE_WEATHER_UNAVAILABLE"
        )

    categories = user_preferences.get(
        "categories",
        ["BEACH", "PARK_RECREATION_AREA"]
    )

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

    client = get_nvidia_client()

    budget = preferences.get("budget")
    transport_mode = preferences.get(
        "transport",
        "public_transport"
    )

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

        data = json.loads(text)

    except Exception as exc:
        logger.exception("AI request failed.")
        raise RuntimeError("AI_MODEL_UNAVAILABLE") from exc

    recommendations = [
        DestinationMatchItem(**item)
        for item in data.get("recommendations", [])[:5]
    ]

    if not recommendations:
        raise RuntimeError(
            "AI_NO_VALID_RECOMMENDATIONS"
        )

    first = recommendations[0]

    transport = await get_transport_info(
        user_lat=lat,
        user_lon=lon,
        dest_lat=first.latitude,
        dest_lon=first.longitude,
        budget=preferences.get("budget"),
        transport_mode=transport_mode
    )

    return {
        "summary": data.get("summary", ""),
        "recommendations": recommendations,
        "transport": transport
    }