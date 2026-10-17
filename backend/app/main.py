"""FastAPI entry point for chat, health checks, and optional staging web pages.

Purpose: expose validated API routes and serve the frontend when deployed with
the staging bundle. Workflow: request -> schemas/services -> privacy-safe response.
"""
import logging
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.ai import RecommendationError, generate_location_recommendations
from app.beaches import fetch_realtime_environmental_alerts
from app.config import settings
from app.schemas import ChatRequest, DestinationMatchResponse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("auckland_explorer.core")

app = FastAPI(
    title="Tāmaki Makaurau Auckland Explorer Core Engine API",
    version="1.1.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health", tags=["service"])
async def health_check():
    """Expose a credential-free health check for local and Render verification."""
    return {"status": "ok"}


def _public_error_message(code: str) -> str:
    """Translate internal service codes into concise, non-sensitive UI messages."""
    if code == "AI_QUOTA_EXCEEDED":
        return "AI quota is currently exhausted. Please try again later."
    if code == "AI_PROVIDERS_NOT_CONFIGURED":
        return "No AI provider is configured for recommendations."
    if code == "LIVE_PLACE_SEARCH_UNAVAILABLE":
        return "Nearby places could not be verified. Please try again later."
    if code == "AI_INVALID_RESPONSE":
        return "The recommendation service returned an invalid response. Please retry."
    return "Live recommendations are temporarily unavailable. Please try again."


@app.post(
    "/api/chat",
    response_model=DestinationMatchResponse,
    status_code=status.HTTP_200_OK,
)
async def generate_regional_destination_matches(
    request: ChatRequest,
) -> DestinationMatchResponse:
    """Combine location-aware recommendations with independent safety information."""
    logger.info("Received Auckland Explorer recommendation request.")

    try:
        environmental_alert = await fetch_realtime_environmental_alerts(
            request.coordinates
        )
        processed_destinations = await generate_location_recommendations(
            user_prompt=request.user_intent_prompt,
            lat=request.coordinates.latitude,
            lon=request.coordinates.longitude,
            user_preferences=request.user_preferences,
        )
        return DestinationMatchResponse(
            cultural_greeting=(
                "Tēnā koe! Welcome to beautiful Tāmaki Makaurau (Auckland)."
            ),
            summary=processed_destinations["summary"],
            recommended_destinations=processed_destinations["recommendations"],
            transport=processed_destinations["transport"],
            environmental_safety_notice=environmental_alert["notice"],
            environmental_safety_status=environmental_alert["status"],
            environmental_safety_source=environmental_alert["source"],
            ai_provider=processed_destinations["provider"],
        )
    except RecommendationError as error:
        logger.warning("Recommendation workflow failed (%s).", error.code)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "error_code": error.code,
                "message": _public_error_message(error.code),
            },
        ) from error
    except Exception as error:
        logger.exception("Unexpected recommendation error.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error_code": "INTERNAL_SERVER_ERROR",
                "message": "Something went wrong. Please try again.",
            },
        ) from error


frontend_directory = Path(
    settings.frontend_directory
    or Path(__file__).resolve().parents[2] / "frontend"
)
if frontend_directory.is_dir():
    # Mount last so API and health routes always take precedence.
    app.mount(
        "/",
        StaticFiles(directory=frontend_directory, html=True),
        name="frontend",
    )


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
