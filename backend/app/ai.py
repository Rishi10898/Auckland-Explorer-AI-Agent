"""Coordinate trusted context and provider-backed destination selection.

Purpose: keep exact user coordinates in backend services and constrain model
answers to place-search candidates. Workflow: weather/place lookup -> minimal
candidate prompt -> Gemini keys in order -> NVIDIA fallback -> schema mapping.
"""
import asyncio
import json
import logging
import math
import re
from typing import Any
from urllib.parse import urlencode

from google import genai
from google.genai import types
from openai import OpenAI

from app.config import settings
from app.places import get_auckland_places
from app.schemas import DestinationMatchItem, UserPreferences
from app.transport import get_transport_info
from app.weather import get_auckland_weather

logger = logging.getLogger("auckland_explorer.ai")
MAX_RECOMMENDATIONS = 5
MAX_CANDIDATES_PER_CATEGORY = 5
MODEL_TIMEOUT_MS = 20_000


class ProviderError(Exception):
    """A safe provider failure category; exception text never includes secrets."""

    def __init__(
        self,
        category: str,
        *,
        exception_type: str | None = None,
        http_status: int | None = None,
    ):
        super().__init__(category)
        self.category = category
        self.exception_type = exception_type
        self.http_status = http_status


class RecommendationError(RuntimeError):
    """A user-safe, machine-readable failure from the recommendation workflow."""

    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


def _provider_http_status(error: Exception) -> int | None:
    """Return only a valid numeric HTTP status exposed by an SDK exception."""
    response = getattr(error, "response", None)
    for value in (
        getattr(error, "status_code", None),
        getattr(error, "code", None),
        getattr(response, "status_code", None),
    ):
        if isinstance(value, int) and not isinstance(value, bool):
            if 100 <= value <= 599:
                return value
    return None


def _provider_error_category(error: Exception) -> str:
    """Map SDK/network errors to bounded failover categories."""
    status = _provider_http_status(error)
    reason = getattr(error, "status", None)
    if isinstance(reason, str):
        reason = reason.upper()

    if status == 429 or reason == "RESOURCE_EXHAUSTED":
        return "quota"
    if status == 401 or reason == "UNAUTHENTICATED":
        return "authentication"
    if status == 403 or reason == "PERMISSION_DENIED":
        return "permission"
    if status == 400 or reason == "INVALID_ARGUMENT":
        return "invalid_request"
    if status == 404 or reason == "NOT_FOUND":
        return "not_found"
    if status == 410:
        return "gone"
    if status == 408 or isinstance(error, TimeoutError):
        return "timeout"
    if (status is not None and status >= 500) or isinstance(
        error, ConnectionError
    ):
        return "unavailable"
    return "unknown"


def _log_provider_failure(provider: str, error: ProviderError) -> None:
    logger.warning(
        "%s provider failed (category=%s, exception=%s, http_status=%s).",
        provider,
        error.category,
        error.exception_type or "ProviderError",
        error.http_status,
    )


def _log_cleanup_failure(provider: str, error: Exception) -> None:
    logger.warning(
        "%s client cleanup failed (category=%s, exception=%s, http_status=%s).",
        provider,
        _provider_error_category(error),
        type(error).__name__,
        _provider_http_status(error),
    )


def _generate_gemini_text(api_key: str, prompt: str) -> str:
    """Call Gemini once with a bounded deadline and JSON response mode."""
    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(
            api_version="v1",
            timeout=MODEL_TIMEOUT_MS,
        ),
    )
    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=1400,
                response_mime_type="application/json",
            ),
        )
        text = response.text
        if not text:
            raise ProviderError("malformed_response", exception_type="EmptyResponse")
        return text
    except ProviderError:
        raise
    except Exception as error:
        raise ProviderError(
            _provider_error_category(error),
            exception_type=type(error).__name__,
            http_status=_provider_http_status(error),
        ) from error
    finally:
        close = getattr(client, "close", None)
        if callable(close):
            try:
                close()
            except Exception as error:
                _log_cleanup_failure("Gemini", error)


def _generate_nvidia_text(prompt: str) -> str:
    """Call the existing OpenAI-compatible NVIDIA endpoint once."""
    if not settings.nvidia_api_key:
        raise ProviderError("not_configured")

    client = OpenAI(
        base_url=settings.nvidia_base_url,
        api_key=settings.nvidia_api_key,
        timeout=MODEL_TIMEOUT_MS / 1000,
        max_retries=0,
    )
    try:
        response = client.chat.completions.create(
            model=settings.nvidia_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1400,
        )
        text = response.choices[0].message.content
        if not text:
            raise ProviderError("malformed_response", exception_type="EmptyResponse")
        return text
    except ProviderError:
        raise
    except Exception as error:
        raise ProviderError(
            _provider_error_category(error),
            exception_type=type(error).__name__,
            http_status=_provider_http_status(error),
        ) from error
    finally:
        try:
            client.close()
        except Exception as error:
            _log_cleanup_failure("NVIDIA", error)


def _generate_text(prompt: str) -> tuple[str, str]:
    """Try Gemini projects in order, then NVIDIA without quota rotation."""
    configured_gemini = [
        (index, key)
        for index, key in enumerate(settings.gemini_api_keys, start=1)
        if key
    ]
    last_category = "not_configured"
    for index, key in configured_gemini:
        try:
            return _generate_gemini_text(key, prompt), "gemini"
        except ProviderError as error:
            last_category = error.category
            logger.warning("Gemini project slot %s failed.", index)
            _log_provider_failure("Gemini", error)
            if error.category == "quota":
                raise RecommendationError("AI_QUOTA_EXCEEDED") from error
            if error.category in {"invalid_request", "not_found", "gone"}:
                break

    if settings.nvidia_api_key:
        try:
            return _generate_nvidia_text(prompt), "nvidia"
        except ProviderError as error:
            last_category = error.category
            logger.warning("NVIDIA fallback failed.")
            _log_provider_failure("NVIDIA", error)

    if last_category == "quota":
        raise RecommendationError("AI_QUOTA_EXCEEDED")
    if last_category == "not_configured":
        raise RecommendationError("AI_PROVIDERS_NOT_CONFIGURED")
    if last_category == "not_found":
        raise RecommendationError("AI_RESOURCE_NOT_FOUND")
    if last_category == "gone":
        raise RecommendationError("AI_PROVIDER_RESOURCE_GONE")
    raise RecommendationError("AI_PROVIDERS_UNAVAILABLE")


def _recommendation_prompt(
    user_prompt: str,
    preferences: UserPreferences,
    weather: dict[str, Any],
    places: list[dict[str, Any]],
) -> str:
    """Build model context without sending user or candidate coordinates."""
    candidate_context = [
        {
            "candidate_id": place["candidate_id"],
            "name": place["name"],
            "category": place["category"],
            "distance_meters": round(place["distance_meters"]),
        }
        for place in places
    ]
    weather_context = {
        key: weather[key]
        for key in ("condition", "description", "temperature_celsius")
        if key in weather
    }
    preference_context = {
        "categories": preferences.categories,
        "transport": preferences.transport,
        "radius_km": preferences.radius_meters / 1000,
        "budget_nzd": preferences.budget,
    }

    return f"""You are Auckland Explorer, a concise local destination guide.

USER REQUEST:
{user_prompt}

USER PREFERENCES:
{json.dumps(preference_context, ensure_ascii=False)}

LIVE WEATHER:
{json.dumps(weather_context, ensure_ascii=False)}

VERIFIED TOMTOM CANDIDATES (only these IDs may be recommended):
{json.dumps(candidate_context, ensure_ascii=False)}

Rules:
- Select only candidate_id values present in the verified candidate list.
- Never invent place names, coordinates, prices, access details, transport fares, or ETAs.
- Prefer candidates within the selected radius, using their straight-line distances.
- If none are within the radius, choose the nearest suitable candidates.
- Weather context may be considered, but do not claim a condition not shown above.
- Keep the summary brief and each rationale specific and concise.
- Return at most {MAX_RECOMMENDATIONS} distinct recommendations.
- Return only valid JSON in this shape:
{{
  "summary": "Short helpful introduction",
  "recommendations": [
    {{"candidate_id": "one listed ID", "relevance_rationale": "Why it fits"}}
  ]
}}"""


def _parse_model_response(
    text: str,
    places: list[dict[str, Any]],
) -> tuple[str, list[DestinationMatchItem]]:
    """Validate model-selected IDs and map output from verified place records."""
    content = text.strip()
    if content.startswith("```"):
        content = re.sub(
            r"^```(?:json)?\s*|\s*```$",
            "",
            content,
            flags=re.IGNORECASE,
        )

    try:
        data = json.loads(content)
    except json.JSONDecodeError as error:
        raise RecommendationError("AI_INVALID_RESPONSE") from error

    if not isinstance(data, dict):
        raise RecommendationError("AI_INVALID_RESPONSE")
    summary = data.get("summary")
    raw_recommendations = data.get("recommendations")
    if (
        not isinstance(summary, str)
        or not summary.strip()
        or len(summary) > 500
        or not isinstance(raw_recommendations, list)
        or len(raw_recommendations) > MAX_RECOMMENDATIONS
    ):
        raise RecommendationError("AI_INVALID_RESPONSE")

    places_by_id = {place["candidate_id"]: place for place in places}
    recommendations = []
    selected_ids = set()

    for item in raw_recommendations:
        if not isinstance(item, dict):
            raise RecommendationError("AI_INVALID_RESPONSE")
        candidate_id = item.get("candidate_id")
        rationale = item.get("relevance_rationale")
        if (
            not isinstance(candidate_id, str)
            or candidate_id not in places_by_id
            or candidate_id in selected_ids
            or not isinstance(rationale, str)
            or not rationale.strip()
            or len(rationale) > 500
        ):
            raise RecommendationError("AI_INVALID_RESPONSE")

        candidate = places_by_id[candidate_id]
        selected_ids.add(candidate_id)
        directions_url = "https://www.google.com/maps/dir/?" + urlencode(
            {
                "api": "1",
                "destination": (
                    f'{candidate["latitude"]},{candidate["longitude"]}'
                ),
            }
        )
        recommendations.append(
            DestinationMatchItem(
                candidate_id=candidate_id,
                place_name=candidate["name"],
                category=candidate["category"],
                relevance_rationale=rationale.strip(),
                directions_url=directions_url,
                distance_meters=candidate["distance_meters"],
                latitude=candidate["latitude"],
                longitude=candidate["longitude"],
            )
        )

    return summary.strip(), recommendations


def _straight_line_distance_meters(
    origin_lat: float,
    origin_lon: float,
    destination_lat: float,
    destination_lon: float,
) -> float:
    """Calculate straight-line distance for deterministic radius filtering."""
    earth_radius_meters = 6_371_000
    lat1, lat2 = math.radians(origin_lat), math.radians(destination_lat)
    delta_lat = lat2 - lat1
    delta_lon = math.radians(destination_lon - origin_lon)
    haversine = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lon / 2) ** 2
    )
    return earth_radius_meters * 2 * math.atan2(
        math.sqrt(haversine),
        math.sqrt(1 - haversine),
    )


async def generate_location_recommendations(
    user_prompt: str,
    lat: float,
    lon: float,
    user_preferences: UserPreferences,
) -> dict[str, Any]:
    """Fetch nearby context and rank candidates without exposing origin coordinates."""
    weather = await asyncio.to_thread(get_auckland_weather, lat=lat, lon=lon)
    if weather.get("status") != "success":
        weather = {"status": "unavailable"}

    place_results = await asyncio.gather(
        *(
            asyncio.to_thread(
                get_auckland_places,
                target_category=category,
                lat=lat,
                lon=lon,
                radius_meters=5000,
            )
            for category in dict.fromkeys(user_preferences.categories)
        )
    )

    places_by_id: dict[str, dict[str, Any]] = {}
    for result in place_results:
        if result.get("status") != "success":
            continue
        for place in result.get("places", []):
            distance = _straight_line_distance_meters(
                lat,
                lon,
                place["latitude"],
                place["longitude"],
            )
            if distance > 5000:
                continue
            places_by_id[place["candidate_id"]] = {
                **place,
                "distance_meters": round(distance, 1),
            }

    places = sorted(
        places_by_id.values(),
        key=lambda place: place["distance_meters"],
    )
    if not places:
        raise RecommendationError("LIVE_PLACE_SEARCH_UNAVAILABLE")

    places = sorted(
        (
            place
            for category in dict.fromkeys(user_preferences.categories)
            for place in [
                candidate
                for candidate in places
                if candidate["category"] == category
            ][:MAX_CANDIDATES_PER_CATEGORY]
        ),
        key=lambda place: place["distance_meters"],
    )

    prompt = _recommendation_prompt(
        user_prompt,
        user_preferences,
        weather,
        places,
    )
    text, provider = await asyncio.to_thread(_generate_text, prompt)
    summary, recommendations = _parse_model_response(text, places)

    transport = None
    if recommendations:
        first = recommendations[0]
        transport = await get_transport_info(
            user_lat=lat,
            user_lon=lon,
            dest_lat=first.latitude,
            dest_lon=first.longitude,
            budget=user_preferences.budget,
            transport_mode=user_preferences.transport,
        )

    return {
        "summary": summary,
        "recommendations": recommendations,
        "transport": transport,
        "provider": provider,
    }
