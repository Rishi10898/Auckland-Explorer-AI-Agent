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

settings = Settings()