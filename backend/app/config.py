"""Central backend configuration.

Purpose: load external-service credentials and runtime options once.
Workflow: local .env or deployment environment -> typed settings -> API/provider modules.
"""
import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    """Store non-secret defaults and API credentials without logging values."""

    gemini_api_keys: tuple[str, ...] = tuple(
        os.getenv(f"GEMINI_API_KEY_{number}", "").strip()
        for number in range(1, 4)
    )
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    nvidia_api_key: str = os.getenv("NVIDIA_API_KEY", "").strip()
    nvidia_model: str = os.getenv(
        "NVIDIA_MODEL",
        "deepseek-ai/deepseek-v4-flash-0731",
    )
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    open_weather_api_key: str = os.getenv("OPEN_WEATHER_API_KEY", "").strip()
    tomtom_api_key: str = os.getenv("TOMTOM_API_KEY", "").strip()
    at_api_key: str = os.getenv("AT_API_KEY", "").strip()
    at_realtime_url: str = os.getenv("AT_REALTIME_URL", "").strip()
    cors_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "https://rishi10898.github.io,http://localhost:5500,"
            "http://127.0.0.1:5500",
        ).split(",")
        if origin.strip()
    )
    frontend_directory: str = os.getenv("FRONTEND_DIR", "")


settings = Settings()