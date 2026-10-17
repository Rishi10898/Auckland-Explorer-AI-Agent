"""Fetch live Safeswim beach alerts and return user-friendly fallback notices."""

import logging

import httpx

from app.schemas import GeolocationCoordinates

# Logger for monitoring external service health and troubleshooting API failures.
logger = logging.getLogger("auckland_explorer.services")

# Safeswim API endpoint that returns beach and water safety information for a location.
SAFESWIM_API_ENDPOINT = "https://safeswim.org.nz/api/locations"


async def fetch_realtime_environmental_alerts(coords: GeolocationCoordinates) -> str:
    """
    Fetch live water safety information for the given coordinates.

    Purpose:
    This function is the app's gateway to the external Safeswim service. It turns
    the response into a human-readable message suitable for display in the app.

    Why it is here:
    Beach safety data depends on live upstream services, which may be unavailable
    or slow. This function protects the application from those issues and keeps
    the user experience safe and informative.

    How it works:
    1. Build an async HTTP client with a short timeout.
    2. Send a GET request including latitude and longitude.
    3. Check for rate limiting (HTTP 429).
    4. Parse the JSON result for alert details when available.
    5. Return a fallback warning if the external service fails or returns invalid data.
    """

    # Using AsyncClient within a context manager ensures the connection is cleaned up
    # properly and avoids socket/resource leaks after each request.
    async with httpx.AsyncClient(timeout=4.0) as client:
        try:
            # Log the exact coordinates being queried so service issues can be traced
            # to a specific geographic area.
            logger.info(
                f"Querying live environmental safety matrices at Lat: {coords.latitude}, Lon: {coords.longitude}"
            )

            # Send the request to Safeswim using latitude and longitude as query parameters.
            response = await client.get(
                SAFESWIM_API_ENDPOINT,
                params={"lat": coords.latitude, "lon": coords.longitude},
            )

            # Safeswim may rate-limit repeated requests with HTTP 429.
            # Instead of failing the app, we return a safe placeholder message.
            if response.status_code == 429:
                logger.warning(
                    "Upstream gateway rate limit (429) hit. Gracefully falling back to baseline indicators."
                )
                return (
                    "Safety notice: Live swim water quality reports are currently refreshing. "
                    "Please verify physical signage on arrival."
                )

            # Raise any non-2xx response so it can be handled by the exception block.
            response.raise_for_status()
            data = response.json()

            # Some API responses include an alert object with a description field.
            # If it is missing, we provide a default green status message.
            alert_msg = data.get("alert", {}).get(
                "description",
                "Status green: No active health or water warnings detected across local beaches.",
            )
            return f"Safeswim Update: {alert_msg}"

        except httpx.HTTPStatusError as exc:
            # Handle HTTP-level failure responses such as 500 or 503 with a user-safe message.
            logger.error(
                f"Downstream network gateway raised error exception status: {exc.response.status_code}"
            )
            return (
                "Safety notice: Unable to contact live swim water quality servers. "
                "Check conditions locally before entering water."
            )
        except (httpx.RequestError, ValueError) as exc:
            # Catch connection problems or invalid JSON parsing issues.
            logger.critical(
                f"Network transport level communication break or parse failure: {str(exc)}"
            )
            return (
                "Safety notice: Environmental status data stream unreachable. "
                "Exercise standard personal precaution."
            )