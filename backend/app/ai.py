"""
Auckland Explorer - AI Recommendation Engine

Pipeline:
1. Get live weather
2. Get real places from TomTom
3. Ask NVIDIA DeepSeek to rank those places
4. Validate the AI output with Pydantic
"""
import os
import json
import logging

from dotenv import load_dotenv
from openai import OpenAI

from app.schemas import DestinationMatchItem
from app.weather import get_auckland_weather
from app.places import get_auckland_places


load_dotenv()

logger = logging.getLogger("auckland_explorer.ai")

# NVIDIA CONFIGURATION

NVIDIA_MODEL = "deepseek-ai/deepseek-v4-flash-0731"

NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"

def get_nvidia_client():
    """
    Create the NVIDIA OpenAI-compatible client.
    """

    api_key = os.getenv("NVIDIA_API_KEY")

    if not api_key:
        raise RuntimeError(
            "NVIDIA_API_KEY is not configured."
        )

    return OpenAI(
        base_url=NVIDIA_BASE_URL,
        api_key=api_key
    )

# MAIN RECOMMENDATION PIPELINE

async def generate_location_recommendations(
    user_prompt: str,
    lat: float,
    lon: float,
    user_preferences: dict
) -> list[DestinationMatchItem]:

    """
    Main Auckland Explorer recommendation pipeline.

    User
      ↓
    Weather
      ↓
    TomTom places
      ↓
    NVIDIA DeepSeek
      ↓
    Pydantic validation
    """
    # STEP 1 — LIVE WEATHER

    weather = get_auckland_weather(
        lat=lat,
        lon=lon
    )

    if weather.get("status") != "success":

        error_code = weather.get(
            "error_code",
            "LIVE_WEATHER_UNAVAILABLE"
        )

        error_message = weather.get(
            "message",
            "Weather service failed."
        )

        logger.error(
            f"[WEATHER ERROR] {error_code}: {error_message}"
        )

        raise RuntimeError(
            f"LIVE_WEATHER_UNAVAILABLE: {error_code}"
        )

    logger.info("Live weather retrieved successfully.")

    # STEP 2 — USER PREFERENCES

    preferred_categories = user_preferences.get(
        "categories",
        []
    )

    # If frontend doesn't provide categories,
    # use a broad Auckland search.
    if not preferred_categories:
        preferred_categories = [
            "BEACH",
            "PARK"
        ]
    # STEP 3 — GET REAL PLACES FROM TOMTOM

    tomtom_places = []

    for category in preferred_categories:

        try:

            result = get_auckland_places(
                target_category=category,
                lat=lat,
                lon=lon
            )

            if result.get("status") == "success":

                places = result.get(
                    "places",
                    []
                )

                tomtom_places.extend(places)

        except Exception as exc:

            logger.warning(
                f"TomTom category {category} failed: {exc}"
            )

    # STEP 4 — MAKE SURE WE HAVE PLACES
    if not tomtom_places:

        raise RuntimeError(
            "LIVE_PLACE_SEARCH_UNAVAILABLE"
        )

    logger.info(
        f"Received {len(tomtom_places)} real places from TomTom."
    )
    # STEP 5 — ASK NVIDIA DEEPSEEK TO RANK THEM

    return await ask_nvidia_to_rank_places(
        user_prompt=user_prompt,
        user_preferences=user_preferences,
        weather=weather,
        places=tomtom_places
    )

# NVIDIA RECOMMENDATION FUNCTION

async def ask_nvidia_to_rank_places(
    user_prompt: str,
    user_preferences: dict,
    weather: dict,
    places: list
) -> list[DestinationMatchItem]:

    """
    Send the user's request + live data to DeepSeek.

    IMPORTANT:
    DeepSeek may only recommend places supplied by TomTom.
    """

    client = get_nvidia_client()
    # PROMPT

    prompt = f"""
You are the AI recommendation engine for Auckland Explorer.

Your job is to select the best Auckland destinations for the user.

USER REQUEST:
{user_prompt}

USER PREFERENCES:
{json.dumps(user_preferences, ensure_ascii=False)}

CURRENT WEATHER:
{json.dumps(weather, ensure_ascii=False)}

REAL PLACES FROM TOMTOM:
{json.dumps(places, ensure_ascii=False)}

IMPORTANT RULES:

1. ONLY recommend places contained in the REAL PLACES list.
2. NEVER invent a destination.
3. Consider the user's request.
4. Consider the current weather.
5. Consider the user's preferences.
6. Return no more than 5 recommendations.
7. Each recommendation must contain:
   - place_name
   - category
   - relevance_rationale
   - auckland_council_url
8. Return ONLY valid JSON.
9. Do not include markdown.
10. Do not include explanations outside the JSON.

Return exactly this structure:

{{
    "recommendations": [
        {{
            "place_name": "Example Place",
            "category": "BEACH",
            "relevance_rationale": "Why this place suits the user's request.",
            "auckland_council_url": "https://www.aucklandcouncil.govt.nz/"
        }}
    ]
}}
"""

    # --------------------------------------------------------
    # NVIDIA API CALL
    # --------------------------------------------------------

    try:

        completion = client.chat.completions.create(

            model=NVIDIA_MODEL,

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.2,

            top_p=0.95,

            max_tokens=4096,

            extra_body={
                "chat_template_kwargs": {
                    "thinking": True,
                    "reasoning_effort": "high"
                }
            },

            stream=False
        )

    except Exception as exc:

        logger.exception(
            "NVIDIA DeepSeek request failed."
        )

        raise RuntimeError(
            "AI_MODEL_UNAVAILABLE"
        ) from exc

    # --------------------------------------------------------
    # STEP 6 — GET MODEL RESPONSE
    # --------------------------------------------------------

    response_message = completion.choices[0].message

    response_text = response_message.content

    if not response_text:

        raise RuntimeError(
            "AI_EMPTY_RESPONSE"
        )

    # --------------------------------------------------------
    # STEP 7 — PARSE JSON
    # --------------------------------------------------------

    try:

        data = json.loads(response_text)

    except json.JSONDecodeError as exc:

        logger.error(
            f"AI returned invalid JSON: {response_text}"
        )

        raise RuntimeError(
            "AI_INVALID_JSON_RESPONSE"
        ) from exc

    # --------------------------------------------------------
    # STEP 8 — EXTRACT RECOMMENDATIONS
    # --------------------------------------------------------

    recommendations = data.get(
        "recommendations",
        []
    )

    if not isinstance(recommendations, list):

        raise RuntimeError(
            "AI_INVALID_RECOMMENDATION_FORMAT"
        )

    # --------------------------------------------------------
    # STEP 9 — PYDANTIC VALIDATION
    # --------------------------------------------------------

    validated_recommendations = []

    for item in recommendations[:5]:

        try:

            validated_item = DestinationMatchItem(
                **item
            )

            validated_recommendations.append(
                validated_item
            )

        except Exception as exc:

            logger.warning(
                f"Invalid AI recommendation skipped: {exc}"
            )

    # --------------------------------------------------------
    # STEP 10 — MAKE SURE SOMETHING VALID WAS RETURNED
    # --------------------------------------------------------

    if not validated_recommendations:

        raise RuntimeError(
            "AI_NO_VALID_RECOMMENDATIONS"
        )

    return validated_recommendations