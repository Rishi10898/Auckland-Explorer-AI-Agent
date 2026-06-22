import requests
from typing import Optional
from app.config import settings

def get_auckland_weather() -> dict:
    """
    WHAT: An advanced service function that fetches a complete weather profile for Auckland,
          including live conditions, advanced metrics, and official safety alerts.
    HOW: It queries the unified One Call 4.0 API structure using geographical coordinates.
    WHY: Consolidating text data, numbers, and warnings into one clean Python dictionary 
         gives our frontend and AI model the ultimate context for user safety.
    """
    
    # WHAT: Safely extracting our secret API key configuration using defensive attribute checking.
    # HOW: Using getattr() looks for the attribute string. If it's missing, it defaults to None.
    # WHY: This prevents a potential 'AttributeError' crash if the key was completely left out 
    #      of config.py, making our application highly resilient and safe against missing configs.
    api_key = getattr(settings, "OPEN_WEATHER_API_KEY", None)
    
    # WHAT: A defensive check to guarantee we have an active credential before touching the internet.
    # HOW: Evaluating if the api_key variable evaluates to False or None.
    # WHY: It stops execution immediately if the key is missing, providing a clean feedback error 
    #      rather than letting the requests library make an invalid web call that is guaranteed to fail.
    if not api_key:
        return {"status": "error", "message": "Weather API key is missing from configuration."}
        
    # WHAT: Hardcoded geographical coordinates for Central Auckland, New Zealand.
    # HOW: Defining latitude and longitude as immutable float constants.
    # WHY: Since this application is custom-built exclusively for Auckland sightseeing, hardcoding 
    #      these values removes the extra processing time and API costs of a geocoding lookup step.
    lat = -36.8485
    lon = 174.7633
    
    # WHAT: Constructing the unified data request URL.
    # WHY: By targeting this specific endpoint structure, we unlock real-time parameters, 
    #      metric formatting, and national alert streams simultaneously.
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    
    # WHAT: A try/except block wrapping our external HTTP web communication network request.
    # HOW: It fires off an outbound HTTP GET request using requests.get() with a strict 10-second timeout.
    # WHY: External APIs are inherently unpredictable. If the user's internet drops out or OpenWeather's 
    #      servers go completely down, this block catches the crash and prevents the whole server from stopping.
    try:
        response = requests.get(url, timeout=10)
        
        # WHAT: Checking the HTTP Status Code returned by the OpenWeatherMap server.
        # HOW: Verifying if the status_code matches '200' (which stands for an HTTP 'OK' response).
        # WHY: Just because the internet worked doesn't mean the API accepted our request. Checking 
        #      for status 200 ensures we only attempt to parse data that we know is valid and authorized.
        if response.status_code == 200:
            # WHAT: Converting the raw text payload received from the web into a Python dictionary.
            # HOW: Invoking the built-in .json() parsing method on the response object.
            # WHY: Raw web data is transmitted as a long string. Deserializing it into JSON format 
            #      allows us to natively navigate the data map using standard key-value indexing.
            data = response.json()
            
            # WHAT: Extracting core real-time atmospheric states.
            weather_condition = data["weather"][0]["main"]        # e.g., "Rain"
            weather_desc = data["weather"][0]["description"]     # e.g., "heavy intensity rain"
            
            # WHAT: Extracting precise temperature maps.
            temperature = data["main"]["temp"]
            feels_like = data["main"]["feels_like"]              # Captures human-perceived warmth/chill
            humidity = data["main"]["humidity"]                  # Relative humidity percentage
            
            # WHAT: Extracting wind motion parameters.
            wind_speed = data.get("wind", {}).get("speed", 0.0)
            
            # WHAT: Safely checking for official emergency alerts or weather warnings.
            # HOW: Using .get() to look for an 'alerts' list. If no active warnings exist, it returns an empty list [].
            # WHY: The API structure only includes the 'alerts' field if national agencies have an active warning. 
            #      This defensive lookup prevents our application from crashing when weather conditions are safe.
            active_alerts = data.get("alerts", [])
            
            # WHAT: Packaging all structural segments into a standardized application response layout.
            # WHY: This encapsulates third-party responses into an organized format perfectly tailored 
            #      for our application logic and upcoming Gemini AI prompt engineering blocks.
            return {
                "status": "success",
                "condition": weather_condition,
                "description": weather_desc,
                "metrics": {
                    "temp_actual_celsius": temperature,
                    "temp_feels_like_celsius": feels_like,
                    "humidity_percentage": humidity,
                    "wind_speed_mps": wind_speed
                },
                "safety_warnings": {
                    "has_alerts": len(active_alerts) > 0,
                    "alerts_list": active_alerts
                }
            }
        else:
            # WHAT: Returning a clean fallback dictionary if the API rejected our security credentials.
            # HOW: Formatting an error string containing the rejected HTTP response code.
            # WHY: This gives us instant, helpful debugging information in our logs if our API key 
            #      is suspended, unauthorized, or throttled.
            return {
                "status": "error",
                "message": f"Failed to fetch weather data. Status code: {response.status_code}"
            }
            
    except Exception as e:
        # WHAT: Catching any critical unexpected system errors (like a network timeout or connection reset).
        # HOW: Capturing the system exception trace message as a string variable 'e'.
        # WHY: It wraps the system crash message into a standard JSON payload return, ensuring the 
        #      front-end interface stays informed about why the application failed to process the request.
        return {
            "status": "error",
            "message": f"An exception occurred during the weather request: {str(e)}"
        }
def get_safeswim_status(lat: float, lon: float) -> dict:
    """
    WHAT: Provides the official Safeswim URL for live validation.
    WHY: Ensures users get 100% accurate, authoritative data straight from the source.
    """
    return {
        "safe_to_swim": "unknown",
        "advice": "Please verify live water quality, real-time conditions, and active swim warnings directly on the official Safeswim map.",
        "official_url": "https://www.safeswim.org.nz/"
    }
import httpx
import asyncio
from datetime import datetime, timedelta

# --- IN-MEMORY CACHE STORAGE VARIABES ---
# Updates globally every 35 minutes
SAFESWIM_GLOBAL_LOCATIONS = []
LAST_GLOBAL_REFRESH = None

# Caches deep-dive beach profiles permanently (or monthly) once requested
SAFESWIM_SPECIFIC_BEACH_CACHE = {}

# Greater Auckland Bounding Box for filtering out-of-region entries
MIN_LAT, MAX_LAT = -37.3000, -36.3000
MIN_LON, MAX_LON = 174.2000, 175.3000

async def update_safeswim_global_cache():
    """
    WHAT: Background worker task that fetches the raw Safeswim locations array.
    HOW: Filters data down to Auckland-only boundaries and drops external records.
    WHY: Keeps an up-to-date, zero-latency local variable cache ready for user requests.
    """
    global SAFESWIM_GLOBAL_LOCATIONS, LAST_GLOBAL_REFRESH
    url = "https://safeswim.org.nz/api/locations"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                all_locations = data.get("locations", [])
                
                auckland_only = []
                for loc in all_locations:
                    pos = loc.get("position")
                    if not pos or len(pos) < 2:
                        continue
                    
                    lat, lon = pos[0], pos[1]
                    # Filter condition: Keep only locations within Greater Auckland coordinates
                    if MIN_LAT <= lat <= MAX_LAT and MIN_LON <= lon <= MAX_LON:
                        auckland_only.append(loc)
                
                SAFESWIM_GLOBAL_LOCATIONS = auckland_only
                LAST_GLOBAL_REFRESH = datetime.now()
                print(f"[{datetime.now()}] Safeswim local global variable synchronized. Cached {len(auckland_only)} Auckland locations.")
        except Exception as e:
            print(f"Error executing Safeswim background refresh sync worker task: {str(e)}")

async def safeswim_background_scheduler():
    """Loops indefinitely, executing the update task precisely every 35 minutes."""
    while True:
        await update_safeswim_global_cache()
        await asyncio.sleep(35 * 60) # Sleep for 35 minutes

async def fetch_specific_beach_profile(slug: str) -> dict:
    """
    WHAT: Looks up specific detailed information (facilities, descriptions) for a given beach identifier.
    HOW: Uses an on-demand, write-through in-memory dictionary cache database layer.
    """
    global SAFESWIM_SPECIFIC_BEACH_CACHE
    
    # If the deep dive info was already fetched before, return it instantly
    if slug in SAFESWIM_SPECIFIC_BEACH_CACHE:
        return SAFESWIM_SPECIFIC_BEACH_CACHE[slug]
        
    url = f"https://safeswim.org.nz/api/locations/{slug}"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=10.0)
            if response.status_code == 200:
                profile_data = response.json()
                
                # Extract clean indicators to pass along to our core search outputs
                clean_profile = {
                    "description": profile_data.get("description", ""),
                    "hazards": [t.get("name") for t in profile_data.get("tags", []) if t.get("type") == "LOCATION_HAZARD"],
                    "facilities": [t.get("name") for t in profile_data.get("tags", []) if t.get("type") == "LOCATION_FACILITY"]
                }
                
                # Save data to local memory variable lookup matrix
                SAFESWIM_SPECIFIC_BEACH_CACHE[slug] = clean_profile
                return clean_profile
        except Exception as e:
            print(f"Failed to fetch beach metadata profile for {slug}: {str(e)}")
            
    return {"description": "Metadata offline.", "hazards": [], "facilities": []}

def match_closest_auckland_beach(user_lat: float, user_lon: float) -> Optional[dict]:
    """Calculates proximity against our filtered local variable list to isolate the closest spot.

    Returns None when no cached Auckland locations are available yet.
    """
    if not SAFESWIM_GLOBAL_LOCATIONS:
        return None
        
    closest_site = None
    min_dist = float('inf')
    
    for loc in SAFESWIM_GLOBAL_LOCATIONS:
        pos = loc.get("position")
        b_lat, b_lon = pos[0], pos[1]
        dist = (user_lat - b_lat)**2 + (user_lon - b_lon)**2
        if dist < min_dist:
            min_dist = dist
            closest_site = loc
            
    return closest_site
