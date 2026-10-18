"""Fetch Safeswim information without making unsafe assumptions.

Purpose: keep authoritative swimming warnings independent from AI rankings.
Workflow: consented server-side location -> timed Safeswim request -> warning,
verified description, or an explicit unverified status with a source link.
"""
import logging
import math
import re
from typing import Literal, TypedDict

import httpx

from app.schemas import GeolocationCoordinates

logger = logging.getLogger("auckland_explorer.services")
SAFESWIM_API_ENDPOINT = "https://safeswim.org.nz/api/locations"
SAFESWIM_SOURCE = "https://safeswim.org.nz/"
UNVERIFIED_NOTICE = (
    "Current swim-safety status could not be verified. Check Safeswim and "
    "local signage before entering the water."
)


class EnvironmentalAlert(TypedDict):
    """Typed, conservative safety information returned to the chat API."""

    notice: str
    status: Literal["warning", "checked", "unverified"]
    source: str


def _distance_meters(
    lat: float,
    lon: float,
    place_lat: float,
    place_lon: float,
) -> float:
    """Calculate distance between the user's location and a Safeswim site."""
    earth_radius_meters = 6_371_000
    lat1, lat2 = math.radians(lat), math.radians(place_lat)
    delta_lat = lat2 - lat1
    delta_lon = math.radians(place_lon - lon)
    haversine = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lon / 2) ** 2
    )
    return earth_radius_meters * 2 * math.atan2(
        math.sqrt(haversine),
        math.sqrt(1 - haversine),
    )


def _notice_from_data(
    data: object,
    coords: GeolocationCoordinates,
) -> EnvironmentalAlert:
    """Interpret the nearest actual Safeswim record; unknown stays unverified."""
    locations = data.get("locations") if isinstance(data, dict) else None
    nearby_sites: list[tuple[float, dict, str | None]] = []
    if isinstance(locations, list):
        for location in locations:
            if not isinstance(location, dict):
                continue
            position = location.get("position")
            if (
                not isinstance(position, list)
                or len(position) < 2
                or not all(
                    isinstance(value, (int, float))
                    for value in position[:2]
                )
            ):
                continue
            place_lat, place_lon = position[:2]
            if (
                not -90 <= place_lat <= 90
                or not -180 <= place_lon <= 180
            ):
                continue
            state = location.get("state")
            quality = state.get("quality") if isinstance(state, dict) else None
            nearby_sites.append(
                (
                    _distance_meters(
                        coords.latitude,
                        coords.longitude,
                        float(place_lat),
                        float(place_lon),
                    ),
                    location,
                    quality if isinstance(quality, str) else None,
                )
            )

    if nearby_sites:
        distance, nearest_site, quality = min(
            nearby_sites,
            key=lambda candidate: candidate[0],
        )
        site_name = nearest_site.get("name")
        name = site_name.strip() if isinstance(site_name, str) else "nearby site"
        if quality == "RED":
            return {
                "notice": (
                    f"Safeswim's returned status for {name} "
                    f"({round(distance)} m away) is RED. Avoid swimming there; "
                    "check Safeswim and local signage for current advice."
                ),
                "status": "warning",
                "source": SAFESWIM_SOURCE,
            }
        if quality == "GREEN":
            return {
                "notice": (
                    f"Safeswim's returned status for {name} "
                    f"({round(distance)} m away) is GREEN, but this feed "
                    "does not include a timestamp or verify your destination. "
                    "Check Safeswim and local signage before swimming."
                ),
                "status": "unverified",
                "source": SAFESWIM_SOURCE,
            }

        return {
            "notice": (
                f"Safeswim has no verified current water-quality status for "
                f"{name} ({round(distance)} m away). Check Safeswim and local "
                "signage before swimming."
            ),
            "status": "unverified",
            "source": SAFESWIM_SOURCE,
        }

    # Retain support for the former single-alert response shape, but never
    # treat missing or unrecognized descriptions as a verified safe result.
    alert = data.get("alert") if isinstance(data, dict) else None
    description = alert.get("description") if isinstance(alert, dict) else None
    if not isinstance(description, str) or not description.strip():
        return {
            "notice": UNVERIFIED_NOTICE,
            "status": "unverified",
            "source": SAFESWIM_SOURCE,
        }

    notice = f"Safeswim update: {description.strip()}"
    warning = re.search(
        r"\b(unsafe|warning|caution|closed|not suitable|high risk|"
        r"health alert|contamination)\b",
        description,
        re.IGNORECASE,
    )
    return {
        "notice": notice,
        "status": "warning" if warning else "checked",
        "source": SAFESWIM_SOURCE,
    }


async def fetch_realtime_environmental_alerts(
    coords: GeolocationCoordinates,
) -> EnvironmentalAlert:
    """Return a safe status without logging precise coordinates or payloads."""
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(
                SAFESWIM_API_ENDPOINT,
                params={
                    "lat": coords.latitude,
                    "lon": coords.longitude,
                },
            )
            response.raise_for_status()
            return _notice_from_data(response.json(), coords)
    except (httpx.HTTPError, ValueError):
        logger.warning("Safeswim could not provide a current safety response.")
        return {
            "notice": UNVERIFIED_NOTICE,
            "status": "unverified",
            "source": SAFESWIM_SOURCE,
        }
