# Auckland Explorer

**Purpose:** help people discover Auckland destinations using their request, optional location, current weather, and verified nearby place-search results.
**Workflow:** browser chat → consented coordinates and guided preferences → FastAPI checks TomTom, OpenWeather, and Safeswim → Gemini selects from verified candidates (NVIDIA fallback) → validated cards and Leaflet map.

The existing static site remains on GitHub Pages. The existing Render API service is preserved; a separate Render staging service can serve both the API and frontend.

## What the chat does

- Keeps free-text prompts and adds category, radius (2/3/5 km), and travel-mode choices.
- Remembers category, radius, and travel choices in browser storage when enabled; it never saves chat prompts or adds stored choices to provider calls beyond the current request.
- Clearly labels “All categories” as three place searches. The backend limits AI context to the five closest verified candidates per selected category to keep prompts bounded.
- Shows the request's elapsed time and operational progress, not private model reasoning.
- Uses Auckland Central when location is not shared. Browser geolocation is requested only after the user explicitly chooses to share.
- Saves precise coordinates in the browser only after consent. The backend uses them for TomTom place search, OpenWeather, Safeswim, distance checks, and the Auckland Transport planner link. The result map requests OpenStreetMap tiles for its displayed area. Coordinates are not added to the Gemini/NVIDIA prompt or application logs.
- Sends candidate IDs, nearby place names/categories, the user's prompt/preferences, and available weather to the AI provider. Nearby names and weather can still imply an approximate area.
- Validates each AI-selected candidate ID and constructs its displayed coordinates and directions URL from the trusted TomTom record. The AI cannot introduce new destination coordinates or URLs.
- Calculates and labels straight-line distance separately from transport/road distance.
- Displays a separate swimming safety notice. Missing/unavailable Safeswim data is “unverified”, never an automatic safe/green result.
- Does not enable Google Maps grounding. As currently documented, Maps grounding has no free-tier availability and can incur usage charges. Directions are ordinary outbound links; no Google Maps API is called.

## Configuration

Set credentials as environment variables or in the ignored `backend/.env` file for local work. Never put values in frontend files or commit them.

For recommendations, configure at least one Gemini key and the TomTom key. Add OpenWeather for live weather context; the other Gemini project keys are optional fallback slots.

```text
GEMINI_API_KEY_1
TOMTOM_API_KEY
```

`GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`, `OPEN_WEATHER_API_KEY`, and `NVIDIA_API_KEY` are optional. NVIDIA enables the OpenAI-compatible fallback. Its model defaults to the existing integration's `deepseek-ai/deepseek-v4-flash-0731`; set `NVIDIA_MODEL` only after checking availability in your NVIDIA account. `GEMINI_MODEL` defaults to `gemini-2.5-flash`. `AT_API_KEY` and `AT_REALTIME_URL` are optional; without them the app still provides the public AT Journey Planner link.

Gemini requests use the stable `v1` API and the three configured project keys in order. A Gemini quota/429 response stops the sequence instead of rotating keys to evade a limit. Invalid requests and explicit 410 Gone responses skip remaining Gemini projects; other failures may fall through to another project and then NVIDIA. Separate projects do not guarantee independent account, billing, or model limits. Monitor each project's active limits and billing independently.

The production Render service is API-only and the deployed GitHub Pages frontend calls it. Add `GEMINI_API_KEY_1` to that existing service's environment settings to use Gemini; `_2` and `_3` are optional fallback slots. `render.yaml` lists these variable names, but existing Render services must have newly added `sync: false` secrets entered manually in the dashboard. Do not paste keys into source files.

For a staging deployment, set `FRONTEND_DIR=frontend`. Set `CORS_ORIGINS` to a comma-separated list of trusted frontend origins only when cross-origin requests are needed; same-origin Render staging does not require browser CORS.

## Local development

Use Python 3.11+ and install the pinned/ranged backend dependencies:

```powershell
Set-Location backend
python -m pip install -r app/requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 --log-level info
```

Run these commands from the `backend` directory. Open `http://127.0.0.1:8000/chat.html` (not a `file://` page) so the browser uses the local API. Each submitted chat request logs a received and completed line in the terminal, but intentionally does not log the prompt or coordinates. `/`, `/docs`, and `/health` are also available. A successful `/health` check does not verify provider credentials; use a real chat request to confirm the displayed provider.

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

`render.yaml` retains the current production service definition and adds a separately named `auckland-explorer-ai-agent-staging` web service. The production GitHub Pages frontend already targets the production API. To connect it to Gemini, add `GEMINI_API_KEY_1` (and optional `_2`/`_3`) to the existing `auckland-explorer-ai-agent-api` service in **Render Dashboard → service → Environment**, then save and redeploy that backend service. Do not deploy the entire Blueprint just to add a key.

Because the Blueprint contains both services, use the dashboard steps below to create staging alone and avoid changing the existing production service.

1. In Render, choose **New → Web Service**, connect this repository, and select the intended branch.
2. Set **Root Directory** to `.`, **Runtime** to Python, and **Instance Type** to Free.
3. Set **Build Command** to `pip install -r backend/app/requirements.txt`.
4. Set **Start Command** to `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`.
5. Set **Health Check Path** to `/health` and add `FRONTEND_DIR=frontend`.
6. Add `GEMINI_API_KEY_1` and `TOMTOM_API_KEY`; add `OPEN_WEATHER_API_KEY` for weather, more Gemini keys for eligible transient failures, and `NVIDIA_API_KEY` only if you want that fallback. Enter secrets in Render's environment settings, never in the Blueprint or browser code.
7. Create and deploy the new staging service. Check its `/health`, `/`, `/chat.html`, and `/docs` routes, then test the chat. This same-origin service needs no extra CORS origin.

## Current limitations

- The result map uses the public OpenStreetMap tile service with attribution. It is intended for modest use, not as a guaranteed unlimited production tile service; review its current usage policy and move to a suitable provider if traffic grows.
- Safeswim response freshness depends on its upstream payload. If the application cannot confirm a description, it reports status as unverified and links to Safeswim.
- AI-created relevance rationales are suggestions, not official destination facts. Check linked destination/transport information before travelling.
- No account database, analytics, or persistent backend cache is introduced. The browser's opted-in location remains stored locally until the user chooses “Stop sharing and forget” or clears browser storage.
