# Auckland Explorer

**Purpose:** help people discover Auckland destinations using their request, optional location, current weather, and verified nearby place-search results.
**Workflow:** browser chat → consented coordinates and guided preferences → FastAPI queries TomTom, OpenWeather, and Safeswim → Gemini selects from verified candidates (NVIDIA fallback) → validated cards and Leaflet map.

The existing static site remains on GitHub Pages. The existing Render API service is preserved; a separate Render staging service can serve both the API and frontend. The optional Vercel rewrite proxies `/api/*` to the same Render API.

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

For recommendations, configure `GEMINI_API_KEY_1` and the TomTom key. `NVIDIA_API_KEY` is the fallback if Gemini is unavailable. Add OpenWeather for live weather context.

```text
GEMINI_API_KEY_1
NVIDIA_API_KEY
TOMTOM_API_KEY
```

`OPEN_WEATHER_API_KEY`, `AT_API_KEY`, and `AT_REALTIME_URL` are optional. Without AT realtime credentials, the app provides the public AT Journey Planner link but does not claim live route or fare data. `GEMINI_MODEL` defaults to `gemini-3.8-flash`; `NVIDIA_MODEL` defaults to `deepseek-ai/deepseek-v4.1-flash`. These defaults are currently listed in their providers' catalogs.

Gemini uses the documented Interactions API with `gemini-3.8-flash`, JSON-schema output, and the single primary key. The SDK requirement is `google-genai>=2.31.0,<3.0.0`. Gemini and NVIDIA each receive a bounded timeout and at most one retry for transient timeouts or service/network failures. Permanent failures are not retried; the app falls back to NVIDIA without rotating Gemini keys. See the [Gemini model list](https://ai.google.dev/gemini-api/docs/models), [Interactions API guide](https://ai.google.dev/gemini-api/docs/interactions-overview), [structured output guide](https://ai.google.dev/gemini-api/docs/structured-output), and [NVIDIA NIM model/API guide](https://docs.api.nvidia.com/nim/docs/models).

The production Render service is API-only and the deployed GitHub Pages frontend calls it. In the existing service's environment settings, retain or add `GEMINI_API_KEY_1` and `NVIDIA_API_KEY`; remove obsolete `GEMINI_API_KEY_2` and `GEMINI_API_KEY_3` entries if present. Remove or update any stale `GEMINI_MODEL` or `NVIDIA_MODEL` overrides to the defaults above. Existing Render services must have new `sync: false` secrets entered manually in the dashboard. Do not paste keys into source files.

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
node --check frontend/theme.js
```

Backend tests mock external services and AI providers; they do not make live, billable calls. For manual visual verification, start the local server above, then check:

1. The chat layout, theme picker, keyboard focus, and responsive controls.
2. First-visit location prompt: no geolocation request until “Share my location” is pressed; the default option works without consent.
3. A mocked or credentialed recommendation: cards, details, AT link, Safeswim status, markers, and all three radius circles. Mock-based automated tests prove application behavior but do not prove provider availability.
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
6. Add `GEMINI_API_KEY_1`, `NVIDIA_API_KEY`, and `TOMTOM_API_KEY`; add `OPEN_WEATHER_API_KEY` for weather. Enter secrets in Render's environment settings, never in the Blueprint or browser code.
7. Create and deploy the new staging service. Check its `/health`, `/`, `/chat.html`, and `/docs` routes, then test the chat. This same-origin service needs no extra CORS origin.

## Current limitations

- The result map uses the public OpenStreetMap tile service with attribution. It is intended for modest use, not as a guaranteed unlimited production tile service; review its current usage policy and move to a suitable provider if traffic grows.
- The Safeswim endpoint returns site quality codes but no timestamp in the checked response. The app selects the nearest returned site, reports RED as a warning, and keeps GREEN/unknown data explicitly unverified; it never treats a GREEN response as a guarantee or verifies the user's destination.
- AI-created relevance rationales are suggestions, not official destination facts. Check linked destination/transport information before travelling.
- No account database, analytics, or persistent backend cache is introduced. The browser's opted-in location remains stored locally until the user chooses “Stop sharing and forget” or clears browser storage.
