"""Build Auckland Transport planner links and optionally check live-service reachability.

Purpose: offer a public journey-planner link without fabricating routes or fares.
Workflow: validated origin/destination -> encoded AT link -> optional API status.
"""

from urllib.parse import quote

import httpx

from app.config import settings


AT_REALTIME_URL = settings.at_realtime_url
AT_JOURNEY_URL = "https://at.govt.nz/bus-train-ferry/journey-planner"


async def get_transport_info(
    user_lat: float,
    user_lon: float,
    dest_lat: float,
    dest_lon: float,
    budget: float | None,
    transport_mode: str = "public_transport"
) -> dict:
    """Build a planner link and optionally check if AT realtime data is online.

    Coordinates form the link's origin and destination. Missing API settings,
    request failures, and successful checks are represented in the returned
    dictionary; route and fare details remain the planner's responsibility.
    """

    # Encode coordinate pairs for safe use as URL query parameter values.
    journey_url = (
        f"{AT_JOURNEY_URL}"
        f"?from={quote(f'{user_lat},{user_lon}')}"
        f"&to={quote(f'{dest_lat},{dest_lon}')}"
    )

    # Set useful fallback values first, so callers always receive a planner
    # link even when the optional realtime service is not configured.
    result = {
        "mode": transport_mode,
        "route": None,
        "status": "Check live AT Journey Planner",
        "fare": "Calculated by AT Journey Planner",
        "budget_fit": None,
        "journey_planner_url": journey_url,
        "realtime_url": None
    }

    # Without an endpoint there is no realtime service to query.
    if not AT_REALTIME_URL:
        return result

    api_key = settings.at_api_key

    # The configured API requires a subscription key for authentication.
    if not api_key:
        return result

    # Authenticate the request and ask the service to return JSON.
    headers = {
        "Ocp-Apim-Subscription-Key": api_key,
        "Accept": "application/json"
    }

    try:
        # Use an asynchronous request with a timeout to avoid waiting too long
        # on an external service.
        async with httpx.AsyncClient(timeout=8) as client:
            response = await client.get(
                AT_REALTIME_URL,
                headers=headers
            )

            response.raise_for_status()
            response.json()

            # A successful response confirms availability; this function does
            # not interpret the payload as route or fare information.
            result["status"] = "Live AT realtime data available"
            result["realtime_url"] = AT_REALTIME_URL

            return result

    except (httpx.HTTPError, ValueError):
        # Preserve the planner fallback and report that live data could not be
        # checked because of a network, HTTP, or response error.
        result["status"] = "Live AT data temporarily unavailable"
        return result