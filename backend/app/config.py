"""Load shared API configuration for the Auckland Explorer backend.

Credentials are kept outside the source code in environment variables or a
local '.env' file, making configuration easier to adapt across environments.
"""
import os
from dotenv import load_dotenv
# Load local .env values into the process environment when available.
# Deployment-provided environment variables remain the source of configuration.
load_dotenv()

class Settings:
    """Hold API credentials required by the application's external services.

    Values are read at import time; absent keys default to empty strings so
    configuration can load even when an integration is not configured.
    """
    # Keep each integration's credential in a named setting for shared access.
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPEN_WEATHER_API_KEY: str = os.getenv("OPEN_WEATHER_API_KEY", "")
    TOMTOM_API_KEY: str = os.getenv("TOMTOM_API_KEY", "")
    AT_API_KEY: str = os.getenv("AT_API_KEY", "")
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")

# Provide one shared configuration object for the rest of the application.
settings = Settings()