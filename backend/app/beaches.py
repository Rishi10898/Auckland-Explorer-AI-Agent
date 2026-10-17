"""Fetch Safeswim information without making unsafe assumptions.

Purpose: keep authoritative swimming warnings independent from AI rankings.
Workflow: consented server-side location -> timed Safeswim request -> warning,
verified description, or an explicit unverified status with a source link.
"""
import logging
import re

import httpx

from app.schemas import GeolocationCoordinates

logger = logging.getLogger("auckland_explorer.services")
SAFESWIM_API_ENDPOINT = "https://safeswim.org.nz/api/locations"
SAFESWIM_SOURCE = "https://safeswim.org.nz/"
UNVERIFIED_NOTICE = (
    "Current swim-safety status could not be verified. Check Safeswim and "
    "local signage before entering the water."
)


def _notice_from_data(data: object) -> dict[str, str]:
    """Interpret the known alert description; absent data remains unknown."""
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
) -> dict[str, str]:
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
            return _notice_from_data(response.json())
    except (httpx.HTTPError, ValueError):
        logger.warning("Safeswim could not provide a current safety response.")
        return {
            "notice": UNVERIFIED_NOTICE,
            "status": "unverified",
            "source": SAFESWIM_SOURCE,
        }
