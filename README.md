# Auckland Explorer

**Purpose:** help people discover Auckland destinations using their request, optional location, current weather, and verified nearby place-search results.
**Workflow:** browser chat → consented coordinates and guided preferences → FastAPI checks TomTom, OpenWeather, and Safeswim → Gemini selects from verified candidates (NVIDIA fallback) → validated cards and Leaflet map.

The existing static site remains on GitHub Pages. The existing Render API service is preserved; a separate Render staging service can serve both the API and frontend.

## What the chat does

- Keeps free-text prompts and adds category, radius (2/3/5 km), and travel-mode choices.
- Uses Auckland Central when location is not shared. Browser geolocation is requested only after the user explicitly chooses to share.
- Saves precise coordinates in the browser only after consent. The backend uses them for TomTom place search, OpenWeather, Safeswim, distance checks, and the Auckland Transport planner link. The result map requests OpenStreetMap tiles for its displayed area. Coordinates are not added to the Gemini/NVIDIA prompt or application logs.
- Sends candidate IDs, nearby place names/categories, the user's prompt/preferences, and available weather to the AI provider. Nearby names and weather can still imply an approximate area.
- Validates each AI-selected candidate ID and constructs its displayed coordinates and directions URL from the trusted TomTom record. The AI cannot introduce new destination coordinates or URLs.
- Calculates and labels straight-line distance separately from transport/road distance.
- Displays a separate swimming safety notice. Missing/unavailable Safeswim data is “unverified”, never an automatic safe/green result.
- Does not enable Google Maps grounding. As currently documented, Maps grounding has no free-tier availability and can incur usage charges. Directions are ordinary outbound links; no Google Maps API is called.

## Configuration

Set credentials as environment variables or in the ignored `backend/.env` file for local work. Never put values in frontend files or commit them.

Required for the full location-aware workflow:

```text
GEMINI_API_KEY_1
GEMINI_API_KEY_2
GEMINI_API_KEY_3
TOMTOM_API_KEY
OPEN_WEATHER_API_KEY
```

`NVIDIA_API_KEY` is optional and enables the OpenAI-compatible NVIDIA fallback. The fallback model defaults to the existing integration's `deepseek-ai/deepseek-v4-flash-0731`; set `NVIDIA_MODEL` only after checking the model ID is available to your NVIDIA account. `GEMINI_MODEL` defaults to `gemini-2.5-flash`. `AT_API_KEY` and `AT_REALTIME_URL` are optional; without them the app still provides the public AT Journey Planner link.

Gemini requests use the three configured project keys in order. A Gemini quota/429 response stops the Gemini sequence instead of rotating keys to evade a limit. Other temporary failures may fall through to another configured Gemini project and then NVIDIA. Separate projects do not guarantee independent account, billing, or model limits. Monitor each project's active limits and billing independently.

For a staging deployment, set `FRONTEND_DIR=frontend`. Set `CORS_ORIGINS` to a comma-separated list of trusted frontend origins only when cross-origin requests are needed; same-origin Render staging does not require browser CORS.

## Local development

Use Python 3.11+ and install the pinned/ranged backend dependencies:

```powershell
Set-Location backend
python -m pip install -r app/requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000/` for the site, `/chat.html` for chat, `/docs` for the FastAPI schema, or `/health` for a credential-free health response. The browser frontend uses the same local FastAPI service.

## Tests and local visual checks

From the repository root:

```powershell
Set-Location backend
python -m unittest discover -s tests -v
python -m compileall -q app tests
Set-Location ..
node --check frontend/chat.js
node --check frontend/config.js
```

Backend tests mock external services and AI providers; they do not make live, billable calls. For manual visual verification, start the local server above, then check:

1. The chat layout, theme picker, keyboard focus, and responsive controls.
2. First-visit location prompt: no geolocation request until “Share my location” is pressed; the default option works without consent.
3. A mocked or credentialed recommendation: cards, details, AT link, Safeswim status, markers, and all three radius circles.
4. Radius changes update visible cards and destination markers and clearly label straight-line distances.
5. Denied location, API failure, empty results, and map-load failure remain understandable and safe.
6. `/health`, `/`, `/chat.html`, and `/docs` load through the FastAPI server.

Live API verification requires your own provider credentials, sends location data to external services, and may incur provider charges. It is not part of the automated test suite.

## Render staging (separate from production)

`render.yaml` retains the current production service definition and adds a separately named `auckland-explorer-ai-agent-staging` web service. The staging service uses the repository root so it can serve `frontend/`; it starts the backend from `backend/`. Review the blueprint and required environment variables in the Render dashboard before creating the service. Do not sync staging secrets from production.

Set the staging environment variables listed above, at minimum the three Gemini keys, TomTom key, and OpenWeather key; add NVIDIA only if you want that fallback. The staging service serves the site and `/api/chat` from one origin. Check Render build/deploy logs, `/health`, `/`, `/chat.html`, and `/docs`; then exercise the chat/map with test credentials while checking browser network requests for leaked secrets. Secrets belong only in Render's environment settings, never in browser JavaScript.

Creating a second service may incur separate compute, bandwidth, and provider usage; plan availability, sleep behavior, and pricing depend on the current Render account/plan and must be checked before creation. Do not deploy this blueprint or change the production URL without explicit authorization. To disable staging, remove or suspend only the separately named staging service in Render; leave GitHub Pages and the current production service untouched.

## Current limitations

- The result map uses the public OpenStreetMap tile service with attribution. It is intended for modest use, not as a guaranteed unlimited production tile service; review its current usage policy and move to a suitable provider if traffic grows.
- Safeswim response freshness depends on its upstream payload. If the application cannot confirm a description, it reports status as unverified and links to Safeswim.
- AI-created relevance rationales are suggestions, not official destination facts. Check linked destination/transport information before travelling.
- No account database, analytics, or persistent backend cache is introduced. The browser's opted-in location remains stored locally until the user chooses “Stop sharing and forget” or clears browser storage.
