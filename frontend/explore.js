/*
 * Auckland Explorer
 * Explore-page controller.
 *
 * Handles:
 * - Category switching
 * - Destination cards
 * - User geolocation
 * - Leaflet map
 * - Distance calculation
 * - Google Maps directions
 * - AI prompt generation
 */

const DEFAULT_LOCATION = {
    lat: -36.8485,
    lon: 174.7633
};

let userLocation = null;
let map = null;
let userMarker = null;
let placeMarkers = [];

const categoryInfo = {
    beaches: ["BEACHES", "Auckland beaches"],
    parks: ["PARKS", "Auckland parks"],
    attractions: ["CITY & ATTRACTIONS", "Places worth visiting"]
};

document.addEventListener("DOMContentLoaded", () => {
    createMap();
    if (document.getElementById("placesGrid") && typeof PLACES !== "undefined") {
        showCategory("beaches");

        document.querySelectorAll(".category-btn").forEach(button => {
            button.addEventListener("click", () => {
                document.querySelectorAll(".category-btn")
                    .forEach(b => b.classList.remove("active"));

                button.classList.add("active");
                showCategory(button.dataset.category);
            });
        });
    }
});


/* Creates the Leaflet map. */
function createMap() {
    const mapElement = document.getElementById("exploreMap");
    if (!mapElement || typeof L === "undefined") {
        const mapStatus = document.getElementById("mapStatus");
        if (mapStatus) mapStatus.textContent = "The map could not be loaded. Your location can still be saved.";
        return;
    }

    map = L.map("exploreMap", {
        maxZoom: 19,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        keyboard: true
    }).setView(
        [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon],
        10
    );

    const tileStatus = document.getElementById("mapTileStatus");
    const tiles = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
            maxNativeZoom: 19,
            maxZoom: 19,
            attribution: 'Sources: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, and the GIS User Community'
        }
    );
    tiles.on("tileerror", () => {
        if (tileStatus) tileStatus.hidden = false;
    });
    tiles.addTo(map);
    L.control.scale({ imperial: false }).addTo(map);
}


/* Displays all places for the selected category. */
function showCategory(category) {
    const places = PLACES[category] || [];

    document.getElementById("categoryLabel").textContent =
        categoryInfo[category][0];

    document.getElementById("categoryTitle").textContent =
        categoryInfo[category][1];

    document.getElementById("categoryDescription").textContent =
        `${places.length} destinations to discover around Auckland.`;

    const grid = document.getElementById("placesGrid");

    grid.innerHTML = places.map((place, index) =>
        createPlaceCard(place, index)
    ).join("");

    updateMap(places);
}


/* Builds one destination card. */
function createPlaceCard(place, index) {
    const distance = userLocation
        ? formatDistance(getDistance(
            userLocation.lat,
            userLocation.lon,
            place.lat,
            place.lon
        ))
        : "Enable location";

    return `
        <article class="place-card">

            <img
                class="place-image"
                src="${place.image}?auto=format&fit=crop&w=900&q=80"
                alt="${escapeHtml(place.name)}"
                loading="lazy"
            >

            <div class="place-content">

                <span class="place-region">
                    ${escapeHtml(place.region)}
                </span>

                <h3>${escapeHtml(place.name)}</h3>

                <ul>
                    ${place.points.map(point =>
                        `<li>${escapeHtml(point)}</li>`
                    ).join("")}
                </ul>

                <div class="place-distance">
                    📍 ${distance}
                </div>

                <details>
                    <summary>More information</summary>

                    <p>
                        ${escapeHtml(place.info)}
                    </p>

                    <a
                        href="${place.council}"
                        target="_blank"
                        rel="noopener"
                        class="text-link">
                        Official information →
                    </a>
                </details>

                <div class="place-actions">

                    <button
                        class="btn btn-secondary"
                        onclick="showPlace(${index})">
                        🗺 View
                    </button>

                    <button
                        class="btn btn-secondary"
                        onclick="getDirections(
                            ${place.lat},
                            ${place.lon},
                            '${escapeJs(place.name)}'
                        )">
                        📍 Directions
                    </button>

                    <button
                        class="btn btn-primary"
                        onclick="askAI('${escapeJs(place.name)}')">
                        ✨ Ask AI
                    </button>

                </div>

            </div>

        </article>
    `;
}


/* Shows a selected destination on the map. */
function showPlace(index) {
    const activeCategory =
        document.querySelector(".category-btn.active")
            ?.dataset.category || "beaches";

    const place = PLACES[activeCategory][index];

    if (!place || !map) return;

    map.setView(
        [place.lat, place.lon],
        14
    );

    L.popup()
        .setLatLng([place.lat, place.lon])
        .setContent(
            `<strong>${escapeHtml(place.name)}</strong><br>
             ${escapeHtml(place.region)}`
        )
        .openOn(map);
}
/* Requests, names, and maps the user's precise current location. */
function locateUser(showMapModal = false) {
    const status = document.getElementById("locationStatus");
    const consent = document.getElementById("locationConsent");
    const shareButton = document.getElementById("shareLocation");

    if (!consent?.checked) {
        const message = "Please consent to location use before sharing your location.";
        if (status) status.textContent = message;
        return;
    }
    if (!shareButton) {
        if (status) status.textContent = "Location sharing is not available on this page.";
        return;
    }

    if (showMapModal) {
        document.getElementById("exploreMapModal")?.classList.remove("hidden");
        const title = document.getElementById("exploreMapTitle");
        if (title) title.textContent = "Your location";
    }
    shareButton.click();
}

/* Opens the map and uses the shared location flow. */
function locateMe() {
    locateUser(true);
}


/* Places the user's location on the map. */
function updateUserMarker(locationName = "Your location") {
    if (!map || !userLocation) return;

    if (userMarker) {
        map.removeLayer(userMarker);
    }

    userMarker = L.marker([
        userLocation.lat,
        userLocation.lon
    ], {
        draggable: document.getElementById("locationConsent")?.checked === true
    })
        .addTo(map)
        .bindPopup(`📍 ${escapeHtml(locationName)}<br>Drag this pin to adjust your starting point.`);

    userMarker.on("dragend", () => {
        const adjusted = userMarker.getLatLng();
        userLocation = { lat: adjusted.lat, lon: adjusted.lng };
        userMarker.setPopupContent("📍 Adjusted location<br>Checking the area name…");

        if (typeof window.saveAdjustedUserLocation === "function") {
            window.saveAdjustedUserLocation(adjusted.lat, adjusted.lng);
        }
    });

    map.setView([
        userLocation.lat,
        userLocation.lon
    ], 18);
}

function showUserLocationOnMap(latitude, longitude, locationName) {
    if (document.getElementById("locationConsent")?.checked !== true) return;
    userLocation = { lat: latitude, lon: longitude };
    if (!map) createMap();
    const mapStatus = document.getElementById("mapStatus");
    if (!map) {
        if (mapStatus) {
            mapStatus.textContent =
                `The map could not be loaded. Your location was found: ${locationName}`;
        }
        return;
    }
    updateUserMarker(locationName);
    if (mapStatus) mapStatus.textContent = `📍 ${locationName}`;
}

function clearUserLocationFromMap() {
    if (map) map.closePopup();
    if (userMarker && map) map.removeLayer(userMarker);
    userMarker = null;
    userLocation = null;
    if (map) {
        map.setView([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon], 10);
    }
}

window.showUserLocationOnMap = showUserLocationOnMap;
window.clearUserLocationFromMap = clearUserLocationFromMap;

/* Refreshes cards after location becomes available. */
function refreshCards() {
    const category =
        document.querySelector(".category-btn.active")
            ?.dataset.category || "beaches";

    showCategory(category);
}
/* Adds destination markers to the map. */
function updateMap(places) {
    if (!map) return;

    placeMarkers.forEach(marker=>map.removeLayer(marker));

    placeMarkers = places.map(place =>
        L.marker([place.lat, place.lon])
            .addTo(map)
            .bindPopup(`<strong>${escapeHtml(place.name)}</strong>`)
    );
}
/* Opens Google Maps with user → destination. */
function getDirections(lat, lon, name) {
    const origin = userLocation ? `${userLocation.lat},${userLocation.lon}` : "";

    const url =
        `https://www.google.com/maps/dir/?api=1`+
        `&origin=${encodeURIComponent(origin)}`+
        `&destination=${lat},${lon}`+
        `&destination_place_id=`+
        `&travelmode=transit`;

    window.open(url, "_blank", "noopener");
}
/* Opens the AI chat with the destination already typed. */
function askAI(placeName) {
    const prompt = `Tell me more about ${placeName}.Consider the current weather,my location,transport options,travel time and what I should know before visiting.`;
    window.location.href = `chat.html?prompt=${encodeURIComponent(prompt)}`;
}
/* Calculates straight-line distance between two coordinates. */
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );
}
function toRadians(value) {
    return value * Math.PI / 180;
}
function formatDistance(distance) {
    return distance < 1
        ? `${Math.round(distance * 1000)} m away`
        : `${distance.toFixed(1)} km away`;
}
/* Prevents destination data from becoming executable HTML. */
function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function escapeJs(value) {
    return String(value ?? "")
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");
}