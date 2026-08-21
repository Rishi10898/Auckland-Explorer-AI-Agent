from fastapi import FastAPI, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from app.schemas import GeolocationCoordinates, DestinationMatchResponse
from app.schemas import ChatRequest, DestinationMatchResponse
from app.beaches import fetch_realtime_environmental_alerts
from app.ai import generate_location_recommendations


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
    "/api/chat",
    response_model=DestinationMatchResponse,
    status_code=status.HTTP_200_OK
)
async def generate_regional_destination_matches(
    request: ChatRequest
):
    logger.info("Received request targeting user coordinates.")

    try:
        environmental_alert = await fetch_realtime_environmental_alerts(
            request.coordinates
        )

        processed_destinations = await generate_location_recommendations(
            user_prompt=request.user_intent_prompt,
            lat=request.coordinates.latitude,
            lon=request.coordinates.longitude,
            user_preferences=request.user_preferences
        )

        return DestinationMatchResponse(
            cultural_greeting="Tēnā koe! Welcome to beautiful Tāmaki Makaurau (Auckland).",
            recommended_destinations=processed_destinations,
            environmental_safety_notice=environmental_alert
        )

    except RuntimeError as err:
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
        logger.exception("Unexpected recommendation error.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error_code": "INTERNAL_SERVER_ERROR",
                "message": "Oops! Something went wrong. Please try again."
            }
        )
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )