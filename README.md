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

## Local development

Use Python 3.11+ and install the pinned/ranged backend dependencies:

```powershell
Set-Location backend
python -m pip install -r app/requirements.txt
python -m uvicorn app.main:app --reload
```

Run these commands from the `backend` directory. Open `http://127.0.0.1:8000/chat.html` (not a `file://` page) so the browser uses the local API. Each submitted chat request logs a received and completed line in the terminal, but intentionally does not log the prompt or coordinates. `/`, `/docs`, and `/health` are also available. A successful `/health` check does not verify provider credentials; use a real chat request to confirm the displayed provider.

## Tests and local visual checks

Backend tests mock external services and AI providers; they do not make live, billable calls. For manual visual verification, start the local server above, then check:

1. The chat layout, theme picker, keyboard focus, and responsive controls.
2. First-visit location prompt: no geolocation request until “Share my location” is pressed; the default option works without consent.
3. A mocked or credentialed recommendation: cards, details, AT link, Safeswim status, markers, and all three radius circles. Mock-based automated tests prove application behavior but do not prove provider availability.
4. Radius changes update visible cards and destination markers and clearly label straight-line distances.
5. Denied location, API failure, empty results, and map-load failure remain understandable and safe.
6. `/health`, `/`, `/chat.html`, and `/docs` load through the FastAPI server.

Live API verification requires your own provider credentials, sends location data to external services, and may incur provider charges. It is not part of the automated test suite.

## Current limitations

- The result map uses the public OpenStreetMap tile service with attribution. It is intended for modest use, not as a guaranteed unlimited production tile service; review its current usage policy and move to a suitable provider if traffic grows.
- The Safeswim endpoint returns site quality codes but no timestamp in the checked response. The app selects the nearest returned site, reports RED as a warning, and keeps GREEN/unknown data explicitly unverified; it never treats a GREEN response as a guarantee or verifies the user's destination.
- AI-created relevance rationales are suggestions, not official destination facts. Check linked destination/transport information before travelling.
- No account database, analytics, or persistent backend cache is introduced. The browser's opted-in location remains stored locally until the user chooses “Stop sharing and forget” or clears browser storage.
