import os
import json

from google import genai
from google.genai import types


from app.schemas import DestinationMatchItem
from app.weather import get_auckland_weather
from app.places import get_auckland_places
from dotenv import load_dotenv

load_dotenv()

# Gemini model used for recommendation reasoning.
GEMINI_MODEL = "gemini-2.5-flash-lite"


def get_gemini_client():
    """
    Creates a Gemini client using the API key
    stored in the environment.
    """

    # Read the Gemini API key from the environment.
    api_key = os.getenv("GEMINI_API_KEY")

    # Stop if the API key has not been configured.
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    # Create and return the Gemini client.
    return genai.Client(api_key=api_key)


async def generate_location_recommendations(
    user_prompt: str,
    lat: float,
    lon: float,
    user_preferences: dict
) -> list[DestinationMatchItem]:
    """
    Main recommendation pipeline.

    1. Gets live weather.
    2. Attempts to get live places from TomTom.
    3. If TomTom works, Gemini ranks those real places.
    4. If TomTom fails, Gemini uses Google Search to find real places.
    5. Never intentionally invents a destination.
    """

    # ---------------------------------------------------------
    # STEP 1 — GET LIVE WEATHER
    # ---------------------------------------------------------

    weather = get_auckland_weather(
        lat=lat,
        lon=lon
    )

    # Do not make recommendations using fake/outdated weather.
    if weather["status"] != "success":
        error_code = weather.get(
        "error_code",
        "LIVE_WEATHER_UNAVAILABLE"
    )

    error_message = weather.get(
        "message",
        "Weather service failed."
    )

    print(
        f"[WEATHER ERROR] {error_code}: {error_message}"
    )

    raise RuntimeError(
        f"LIVE_WEATHER_UNAVAILABLE: {error_code}"
    )

    # ---------------------------------------------------------
    # STEP 2 — READ USER PREFERENCES
    # ---------------------------------------------------------

    # Preferences come from the frontend.
    #
    # Example:
    #
    # {
    #     "categories": ["BEACH", "PARK"],
    #     "budget": 30,
    #     "transport": "public_transport"
    # }

    preferred_categories = user_preferences.get(
        "categories",
        []
    )

    # ---------------------------------------------------------
    # STEP 3 — TRY TOMTOM
    # ---------------------------------------------------------

    tomtom_places = []

    # Search TomTom for each category selected by the user.
    for category in preferred_categories:

        result = get_auckland_places(
            target_category=category,
            lat=lat,
            lon=lon
        )

        # Only use places when TomTom successfully returned data.
        if result["status"] == "success":
            tomtom_places.extend(
                result.get("places", [])
            )

    # ---------------------------------------------------------
    # STEP 4 — TOMTOM SUCCESS
    # ---------------------------------------------------------

    if tomtom_places:

        # Gemini chooses the best places from the
        # real places returned by TomTom.
        return await ask_gemini_to_rank_places(
            user_prompt=user_prompt,
            user_preferences=user_preferences,
            weather=weather,
            places=tomtom_places
        )

    # ---------------------------------------------------------
    # STEP 5 — TOMTOM FAILED
    # ---------------------------------------------------------

    # No places were obtained from TomTom.
    # Use Gemini's Google Search grounding as the fallback.
    return await ask_gemini_to_search_places(
        user_prompt=user_prompt,
        user_preferences=user_preferences,
        weather=weather,
        lat=lat,
        lon=lon
    )


async def ask_gemini_to_rank_places(
    user_prompt: str,
    user_preferences: dict,
    weather: dict,
    places: list
) -> list[DestinationMatchItem]:
    """
    Gives real TomTom places to Gemini and asks it
    to select the most suitable destinations.
    """

    # Create Gemini client.
    client = get_gemini_client()

    # Give Gemini the user's request, preferences,
    # current weather and REAL places from TomTom.
    prompt = f"""
You are Auckland Explorer's recommendation engine.

USER REQUEST:
{user_prompt}

USER PREFERENCES:
{json.dumps(user_preferences)}

CURRENT WEATHER:
{json.dumps(weather)}

REAL PLACES FROM TOMTOM:
{json.dumps(places)}

Choose the best places for the user.

IMPORTANT RULES:
- Only recommend places from the REAL PLACES list.
- Do not invent a destination.
- Consider the user's preferences.
- Consider the current weather.
- Return no more than 5 places.
- Keep the recommendations relevant to the user's request.

Return JSON in exactly this structure:

{{
    "recommendations": [
        {{
            "place_name": "...",
            "category": "...",
            "relevance_rationale": "...",
            "auckland_council_url": "https://..."
        }}
    ]
}}
"""

    # Ask Gemini to process the real data.
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,
            response_mime_type="application/json"
        )
    )

    # Gemini's response.text can be either a string or None.
    response_text = response.text

    # If Gemini returned no text, stop instead of
    # passing None into json.loads().
    if response_text is None:
        raise RuntimeError(
            "GEMINI_EMPTY_RESPONSE"
        )

    # Convert Gemini's JSON string into a Python dictionary.
    data = json.loads(response_text)

    # Get the recommendation list from Gemini's response.
    recommendations = data.get(
        "recommendations",
        []
    )

    # Convert each recommendation into a Pydantic
    # DestinationMatchItem so the output is validated.
    return [
        DestinationMatchItem(**item)
        for item in recommendations[:5]
    ]


async def ask_gemini_to_search_places(
    user_prompt: str,
    user_preferences: dict,
    weather: dict,
    lat: float,
    lon: float
) -> list[DestinationMatchItem]:
    """
    Fallback place-discovery system.

    Used when TomTom cannot provide live places.

    Gemini uses Google Search grounding to find
    real places instead of using hardcoded destinations.
    """

    # Create Gemini client.
    client = get_gemini_client()

    # Tell Gemini to search for real places.
    prompt = f"""
You are Auckland Explorer's fallback live-place discovery system.

The TomTom place-search service is currently unavailable.

Use Google Search to find REAL and CURRENT places in Auckland.

USER REQUEST:
{user_prompt}

USER PREFERENCES:
{json.dumps(user_preferences)}

USER LOCATION:
latitude={lat}
longitude={lon}

CURRENT WEATHER:
{json.dumps(weather)}

IMPORTANT RULES:
- Search for real places.
- Do not invent destinations.
- Verify that the places actually exist.
- Prefer official Auckland Council or official venue websites.
- Consider the user's preferences.
- Consider the current weather.
- Return no more than 5 recommendations.
- Include a source URL for every recommendation.

Return JSON in exactly this structure:

{{
    "recommendations": [
        {{
            "place_name": "...",
            "category": "...",
            "relevance_rationale": "...",
            "auckland_council_url": "https://..."
        }}
    ]
}}
"""

    try:

        # Ask Gemini to use Google Search to find current information.
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                tools=[
                    types.Tool(
                        google_search=types.GoogleSearch()
                    )
                ],
                response_mime_type="application/json"
            )
        )

        # Gemini's text response may be None.
        response_text = response.text

        # Check before passing it to json.loads().
        if response_text is None:
            raise RuntimeError(
                "GEMINI_EMPTY_RESPONSE"
            )

        # Convert Gemini's JSON string into a Python dictionary.
        data = json.loads(response_text)

        # Extract the recommendations.
        recommendations = data.get(
            "recommendations",
            []
        )

        # Validate each recommendation using schemas.py.
        return [
            DestinationMatchItem(**item)
            for item in recommendations[:5]
        ]

    except Exception as exc:

        # Both the original place-search route and
        # the fallback search route have failed.
        #
        # We deliberately DO NOT invent a destination.
        raise RuntimeError(
            "LIVE_PLACE_SEARCH_UNAVAILABLE"
        ) from exc