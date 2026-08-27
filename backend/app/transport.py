import os
import httpx
from urllib.parse import quote


AT_REALTIME_URL = os.getenv("AT_REALTIME_URL")
AT_JOURNEY_URL = "https://at.govt.nz/bus-train-ferry/journey-planner"


async def get_transport_info(
    user_lat: float,
    user_lon: float,
    dest_lat: float,
    dest_lon: float,
    budget: float | None,
    transport_mode: str = "public_transport"
) -> dict:

    journey_url = (
        f"{AT_JOURNEY_URL}"
        f"?from={quote(f'{user_lat},{user_lon}')}"
        f"&to={quote(f'{dest_lat},{dest_lon}')}"
    )

    result = {
        "mode": transport_mode,
        "route": None,
        "status": "Check live AT Journey Planner",
        "fare": "Calculated by AT Journey Planner",
        "budget_fit": None,
        "journey_planner_url": journey_url,
        "realtime_url": None
    }

    if not AT_REALTIME_URL:
        return result

    api_key = os.getenv("AT_API_KEY")

    if not api_key:
        return result

    headers = {
        "Ocp-Apim-Subscription-Key": api_key,
        "Accept": "application/json"
    }

    try:
        async with httpx.AsyncClient(timeout=8) as client:
            response = await client.get(
                AT_REALTIME_URL,
                headers=headers
            )

            response.raise_for_status()
            data = response.json()

            result["status"] = "Live AT realtime data available"
            result["realtime_url"] = AT_REALTIME_URL

            return result

    except Exception:
        result["status"] = "Live AT data temporarily unavailable"
        return result