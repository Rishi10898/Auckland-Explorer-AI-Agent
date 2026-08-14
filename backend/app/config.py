# Handles environment variables and API keys
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ClaudAI_API_KEY: str = os.getenv("ClaudAI_API_KEY", "")
    DeepSeek_API_KEY: str = os.getenv("DeepSeek_API_KEY", "")
    grok_api_key: str = os.getenv("grok_api_key", "")
    OPEN_WEATHER_API_KEY: str = os.getenv("OPEN_WEATHER_API_KEY", "")
    TOMTOM_API_KEY: str = os.getenv("TOMTOM_API_KEY", "")
    AT_API_KEY: str = os.getenv("AT_API_KEY", "")
    HUGGINGFACE_API_KEY: str = os.getenv("HUGGINGFACE_API_KEY", "")
settings = Settings()