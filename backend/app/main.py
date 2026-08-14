from fastapi import FastAPI, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from schemas import GeolocationCoordinates, DestinationMatchResponse
from services import fetch_realtime_environmental_alerts
from ai import generate_location_recommendations


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger("auckland_explorer.core")


app = FastAPI(
    title="Tāmaki Makaurau Auckland Explorer Core Engine API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.post(
    "/api/v1/recommendations",
    response_model=DestinationMatchResponse,
    status_code=status.HTTP_200_OK
)
async def generate_regional_destination_matches(
    coordinates: GeolocationCoordinates,
    user_intent_prompt: str,
    user_preferences: dict = Body(default={})
):
    """
    Receives the user's location, request and preferences,
    then sends them to the AI recommendation pipeline.
    """

    logger.info(
        "Received request targeting user coordinates."
    )

    try:

        # Get the current environmental/safety information.
        environmental_alert = (
            await fetch_realtime_environmental_alerts(
                coordinates
            )
        )

        # Send the user's ACTUAL coordinates and preferences
        # into the recommendation engine.
        processed_destinations = (
            await generate_location_recommendations(
                user_prompt=user_intent_prompt,
                lat=coordinates.latitude,
                lon=coordinates.longitude,
                user_preferences=user_preferences
            )
        )

        # Build the final validated API response.
        return DestinationMatchResponse(
            cultural_greeting=(
                "Tēnā koe! Welcome to beautiful "
                "Tāmaki Makaurau (Auckland)."
            ),
            recommended_destinations=processed_destinations,
            environmental_safety_notice=environmental_alert
        )

    except RuntimeError as err:

        logger.error(
            f"Recommendation service failed: {str(err)}"
        )

        # Don't return fake recommendations.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "error_code": str(err),
                "message": (
                    "Oops! We couldn't retrieve live "
                    "information right now. Please try again."
                )
            }
        )

    except Exception as err:

        logger.exception(
            "Unexpected recommendation error."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error_code": "INTERNAL_SERVER_ERROR",
                "message": (
                    "Oops! Something went wrong. "
                    "Please try again."
                )
            }
        )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )