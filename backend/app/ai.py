import os
import json
from openai import OpenAI
from app.config import settings

def get_cloud_destination_match(user_vibe: str, nearby_places: list) -> dict:
    """
    Uses OpenAI's gpt-oss-120b hosted serverless on Hugging Face to match
    the user's vibe to a specific physical location.
    """
    hf_token = getattr(settings, "HUGGINGFACE_API_KEY", None)
    if not hf_token:
        # Safety fallback if token isn't initialized
        return nearby_places[0] if nearby_places else {}

    # 1. Initialize the OpenAI client pointing to the Hugging Face Router
    client = OpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=hf_token
    )

    # 2. Build our available geographic options context string
    places_context = ""
    for idx, p in enumerate(nearby_places):
        places_context += f"- Option Name: {p['name']} (Lat: {p['latitude']}, Lon: {p['longitude']})\n"

    # 3. Request completion using gpt-oss-120b via one of its ultra-fast inference providers (like fireworks-ai)
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:fireworks-ai",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a local Auckland Travel Assistant agent. Your job is to pick the single BEST "
                        "destination from the provided options that matches the user's vibe. "
                        "You MUST respond ONLY with a raw JSON object string. Do not write markdown blocks (like ```json), "
                        "do not write pleasantries. Strictly follow this output schema structure:\n"
                        "{\n"
                        '  "name": "The chosen place name",\n'
                        '  "latitude": chosen_lat_float,\n'
                        '  "longitude": chosen_lon_float,\n'
                        '  "ai_reasoning": "A concise, engaging 2-sentence explanation of why this spot perfectly fits their vibe."\n'
                        "}"
                    )
                },
                {
                    "role": "user",
                    "content": f"User vibe preference: '{user_vibe}'.\nAvailable Options:\n{places_context}"
                }
            ],
            temperature=0.1
        )

        # 4. Extract and clean the generated string message content text
        raw_content = (response.choices[0].message.content or "").strip()
        
        # Clean up code blocks if the model wrapped it anyway
        if "```json" in raw_content:
            raw_content = raw_content.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_content:
            raw_content = raw_content.split("```")[1].split("```")[0].strip()

        return json.loads(raw_content)

    except Exception as e:
        print(f"GPT-OSS-120b Router Fallback Triggered: {e}")
        # Default safe object fallback state structure if parsing hits an error boundary
        return nearby_places[0] if nearby_places else {}
def get_ai_synthesis(full_prompt: str) -> str:
    """
    Sends the fully assembled context (weather + places + safeswim +
    budget analysis + transit fares) to gpt-oss-120b via Hugging Face
    and returns a plain-English synthesis for the user.

    HOW THE AI IS ACCESSED:
    - Client: openai Python SDK (pip install openai)
    - base_url: https://router.huggingface.co/v1  ← Hugging Face Inference Router
    - api_key:  your HUGGINGFACE_API_KEY from .env
    - model:    openai/gpt-oss-120b:fireworks-ai
      - This is OpenAI's gpt-oss-120b model
      - Hosted serverlessly by Hugging Face
      - Routed through Fireworks AI as the inference backend
      - Billed to your Hugging Face account (not OpenAI directly)
    """
    import json
    from openai import OpenAI
    from app.config import settings

    hf_token = getattr(settings, "HUGGINGFACE_API_KEY", None)
    if not hf_token:
        return "AI synthesis unavailable — HUGGINGFACE_API_KEY not set in .env"

    client = OpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=hf_token
    )

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:fireworks-ai",
            messages=[
                {
                    "role": "user",
                    "content": full_prompt
                }
            ],
            temperature=0.3,
            max_tokens=400
        )
        return (response.choices[0].message.content or "").strip()
    except Exception as e:
        print(f"AI synthesis error: {e}")
        return f"AI synthesis unavailable: {str(e)}"
