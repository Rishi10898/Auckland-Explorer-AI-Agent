"""API entry point for Auckland Explorer's location-based recommendations.

The service combines personalized destination suggestions with current
environmental safety alerts for the user's location.
"""
from fastapi import FastAPI, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from app.schemas import (
    GeolocationCoordinates,
    DestinationMatchResponse,
    ChatRequest
)
from app.beaches import fetch_realtime_environmental_alerts
from app.ai import generate_location_recommendations

# Configure consistent application logs for request handling and diagnostics.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger("auckland_explorer.core")
# Create the FastAPI application and describe the service in its API metadata.
app = FastAPI(
    title="Tāmaki Makaurau Auckland Explorer Core Engine API",
    version="1.0.0"
)
# Enable browser clients to call the API. The wildcard origin is convenient for
# development; production deployments should limit this to trusted frontend URLs.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
@app.post(
    "/api/chat",
    response_model=DestinationMatchResponse,
    status_code=status.HTTP_200_OK
)
async def generate_regional_destination_matches(
    request: ChatRequest
):
    """Build a response of recommendations and safety alerts for a user.

    The request contains the user's coordinates, intent, and preferences. This
    endpoint retrieves location-relevant environmental notices, generates
    recommendations, then combines the results into the declared response model.
    Known service failures become 503 responses; unexpected failures become 500s.
    """
    logger.info("Received request targeting user coordinates.")

    try:
        # Fetch current environmental notices relevant to the submitted location.
        environmental_alert = await fetch_realtime_environmental_alerts(
            request.coordinates
        )

        # Generate personalized destinations and transport guidance using the
        # user's prompt, coordinates, and preferences.
        processed_destinations = await generate_location_recommendations(
            user_prompt=request.user_intent_prompt,
            lat=request.coordinates.latitude,
            lon=request.coordinates.longitude,
            user_preferences=request.user_preferences
        )

        # Return one validated response containing the greeting, recommendations,
        # transport information, and environmental notice.
        return DestinationMatchResponse(
            cultural_greeting="Tēnā koe! Welcome to beautiful Tāmaki Makaurau (Auckland).",
            summary=processed_destinations["summary"],
            recommended_destinations=processed_destinations["recommendations"],
            transport=processed_destinations["transport"],
            environmental_safety_notice=environmental_alert
        )
    except RuntimeError as err:
        # Report known recommendation-service failures as temporarily unavailable.
        logger.error(f"Recommendation service failed: {str(err)}")

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "error_code": str(err),
                "message": "Oops! We couldn't retrieve live information right now. Please try again."
            }
        )
    except Exception:
        # Keep technical details in server logs while returning a generic error.
        logger.exception("Unexpected recommendation error.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error_code": "INTERNAL_SERVER_ERROR",
                "message": "Oops! Something went wrong. Please try again."
            }
        )
    # Allow this module to be started directly for local development. Uvicorn serves
    # the app on localhost and reloads it automatically when code changes.
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )