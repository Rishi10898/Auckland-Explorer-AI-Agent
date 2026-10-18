/*
 * Purpose: run Auckland Explorer chat, consented location, and result-map behavior.
 * Workflow: restore opted-in location -> submit one request -> render safe cards
 * and verified markers; radius changes locally filter the current results.
 */
const API_URL = window.AUCKLAND_EXPLORER_API_URL;
const DEFAULT_LOCATION = { latitude: -36.8485, longitude: 174.7633 };
const LOCATION_KEY = "aucklandExplorerUserLocation";
const CONSENT_KEY = "aucklandExplorerLocationConsent";
const PREFERENCES_KEY = "aucklandExplorerChatPreferences";
const RADIUS_OPTIONS = [2000, 3000, 5000];
const CATEGORIES = ["all", "BEACH", "PARK_RECREATION_AREA", "TOURIST_ATTRACTION"];
const TRAVEL_MODES = ["public_transport", "drive", "cycle", "walk"];
const chatThread = document.getElementById("chatThread");
const chatForm = document.getElementById("chatForm");
const input = document.getElementById("fInput");
const sendButton = document.getElementById("sendBtn");
const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");
const serverStatus = document.getElementById("serverStatus");
const locationDialog = document.getElementById("locationDialog");
let userLocation = { ...DEFAULT_LOCATION };
let locationIsConsented = false;
let requestInFlight = false;
let lastResult = null;
let resultMap = null;
let mapSequence = 0;

document.addEventListener("DOMContentLoaded", initialiseChat);

function initialiseChat() {
    chatForm.addEventListener("submit", sendMessage);
    document.getElementById("locateBtn").addEventListener("click", openLocationDialog);
    document.getElementById("shareLocation").addEventListener("click", requestLocation);
    document.getElementById("useDefaultLocation").addEventListener("click", useDefaultLocation);
    document.getElementById("forgetLocation").addEventListener("click", forgetLocation);
    document.getElementById("fRadius").addEventListener("change", () => {
        refreshLastResult();
        savePreferences();
    });
    document.getElementById("fCategory").addEventListener("change", savePreferences);
    document.getElementById("fMode").addEventListener("change", savePreferences);
    document.getElementById("rememberPreferences").addEventListener(
        "change",
        togglePreferenceSaving,
    );
    document.querySelectorAll("[data-prompt]").forEach((button) => {
        button.addEventListener("click", () => {
            input.value = button.dataset.prompt;
            if (button.dataset.category) {
                document.getElementById("fCategory").value = button.dataset.category;
            }
            savePreferences();
            input.focus();
        });
    });
    restorePreferences();
    restoreConsentedLocation();
    loadPlaceFromUrl();
}

function restorePreferences() {
    try {
        const saved = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || "null");
        if (!saved) return;
        if (CATEGORIES.includes(saved.category)) {
            document.getElementById("fCategory").value = saved.category;
        }
        if (RADIUS_OPTIONS.includes(saved.radius)) {
            document.getElementById("fRadius").value = String(saved.radius);
        }
        if (TRAVEL_MODES.includes(saved.transport)) {
            document.getElementById("fMode").value = saved.transport;
        }
        document.getElementById("preferenceStatus").textContent =
            "Saved choices restored. Prompts and location are not saved.";
    } catch {
        document.getElementById("preferenceStatus").textContent =
            "Saved choices could not be read; using defaults.";
    }
}

function savePreferences() {
    const remember = document.getElementById("rememberPreferences");
    if (!remember.checked) return;
    const saved = {
        category: document.getElementById("fCategory").value,
        radius: Number(document.getElementById("fRadius").value),
        transport: document.getElementById("fMode").value,
    };
    try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(saved));
        document.getElementById("preferenceStatus").textContent =
            "Choices saved on this device. Prompts and location are not saved.";
    } catch {
        document.getElementById("preferenceStatus").textContent =
            "Choices will last for this visit; browser storage is unavailable.";
    }
}

function togglePreferenceSaving(event) {
    if (event.currentTarget.checked) {
        savePreferences();
        return;
    }
    try {
        localStorage.removeItem(PREFERENCES_KEY);
        document.getElementById("preferenceStatus").textContent =
            "Saved choices removed. Prompts and location are not saved.";
    } catch {
        document.getElementById("preferenceStatus").textContent =
            "Could not remove saved choices; clear this site's browser data.";
    }
}

function restoreConsentedLocation() {
    try {
        if (localStorage.getItem(CONSENT_KEY) !== "true") return;
        const savedLocation = JSON.parse(localStorage.getItem(LOCATION_KEY) || "null");
        if (!isValidLocation(savedLocation)) return;
        userLocation = savedLocation;
        locationIsConsented = true;
        setLocationStatus("Using your saved location", "success");
        serverStatus.textContent = "Consented location · exact coordinates stay out of the AI prompt";
    } catch {
        setLocationStatus("Using Auckland Central · location settings unavailable", "error");
    }
}

function openLocationDialog() {
    if (!locationDialog.open) locationDialog.showModal();
}

function requestLocation() {
    const dialogStatus = document.getElementById("locationDialogStatus");
    if (!navigator.geolocation) {
        dialogStatus.textContent = "This browser does not support location sharing.";
        return;
    }
    dialogStatus.textContent = "Requesting browser location permission…";
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
            };
            if (!isValidLocation(location)) {
                dialogStatus.textContent = "Location is outside the supported Auckland area.";
                return;
            }
            userLocation = location;
            locationIsConsented = true;
            try {
                localStorage.setItem(CONSENT_KEY, "true");
                localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
                serverStatus.textContent = "Consented location · coordinates stay out of the AI prompt";
            } catch {
                serverStatus.textContent = "Location available for this chat only; browser storage is unavailable.";
            }
            setLocationStatus("Using your shared location", "success");
            dialogStatus.textContent = "Location saved in this browser after your consent.";
            locationDialog.close();
        },
        (error) => {
            dialogStatus.textContent = error.code === error.PERMISSION_DENIED
                ? "Location permission was denied. You can continue with Auckland Central."
                : "Location could not be determined. You can continue with Auckland Central.";
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 },
    );
}

function useDefaultLocation() {
    userLocation = { ...DEFAULT_LOCATION };
    locationIsConsented = false;
    setLocationStatus("Using Auckland Central", "success");
    serverStatus.textContent = "This request uses Auckland Central.";
    locationDialog.close();
}

function forgetLocation() {
    let storageCleared = true;
    try {
        localStorage.removeItem(CONSENT_KEY);
        localStorage.removeItem(LOCATION_KEY);
    } catch {
        storageCleared = false;
    }
    userLocation = { ...DEFAULT_LOCATION };
    locationIsConsented = false;
    setLocationStatus("Using Auckland Central", "success");
    if (storageCleared) {
        serverStatus.textContent = "Saved location forgotten · Auckland Central";
        locationDialog.close();
    } else {
        document.getElementById("locationDialogStatus").textContent =
            "Browser storage could not be cleared. You can still use Auckland Central; clear site data in browser settings to remove the saved location.";
    }
}

function isValidLocation(location) {
    return Boolean(
        location
        && Number.isFinite(location.latitude)
        && Number.isFinite(location.longitude)
        && location.latitude >= -37.3
        && location.latitude <= -36.3
        && location.longitude >= 174.4
        && location.longitude <= 175.3
    );
}

async function sendMessage(event) {
    event.preventDefault();
    const prompt = input.value.trim();
    if (!prompt || requestInFlight) return;

    requestInFlight = true;
    addUserMessage(prompt);
    sendButton.disabled = true;
    setLocationStatus("Finding verified nearby places…", "loading");
    const startedAt = performance.now();
    const updateProgress = () => {
        const seconds = ((performance.now() - startedAt) / 1000).toFixed(1);
        serverStatus.textContent = `Checking live data and preparing suggestions · ${seconds}s`;
    };
    updateProgress();
    const progressTimer = window.setInterval(updateProgress, 250);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 120000);

    try {
        if (!API_URL) throw new Error("The recommendation API is not configured.");
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildRequest(prompt)),
            signal: controller.signal,
        });
        let data;
        try {
            data = await response.json();
        } catch {
            throw new Error(`The server returned an invalid response (HTTP ${response.status}).`);
        }
        if (!response.ok) {
            throw new Error(data?.detail?.message || "Recommendations are temporarily unavailable.");
        }
        input.value = "";
        renderResponse(data);
        setLocationStatus(
            data.ai_provider === "nvidia" ? "Ready · NVIDIA fallback" : "Ready · Gemini",
            "success",
        );
        const elapsed = ((performance.now() - startedAt) / 1000).toFixed(1);
        const provider = data.ai_provider === "nvidia" ? "NVIDIA fallback" : "Gemini";
        serverStatus.textContent = `Ready in ${elapsed}s · ${provider}.`;
    } catch (error) {
        const message = error.name === "AbortError"
            ? "The request timed out. Please try again."
            : error.message || "The recommendation service is unavailable.";
        addErrorMessage(message);
        setLocationStatus("Request failed", "error");
        const elapsed = ((performance.now() - startedAt) / 1000).toFixed(1);
        serverStatus.textContent = `Request failed after ${elapsed}s. Retry when ready.`;
    } finally {
        window.clearTimeout(timeout);
        window.clearInterval(progressTimer);
        requestInFlight = false;
        sendButton.disabled = false;
        input.focus();
    }
}

function buildRequest(prompt) {
    const selectedCategory = document.getElementById("fCategory").value;
    const categories = selectedCategory === "all"
        ? ["BEACH", "PARK_RECREATION_AREA", "TOURIST_ATTRACTION"]
        : [selectedCategory];
    return {
        coordinates: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
        },
        user_intent_prompt: prompt,
        user_preferences: {
            categories,
            transport: document.getElementById("fMode").value,
            radius_meters: Number(document.getElementById("fRadius").value),
        },
    };
}

function addUserMessage(text) {
    const message = document.createElement("div");
    message.className = "message user";
    message.textContent = text;
    chatThread.append(message);
    scrollToLatest();
}

function addErrorMessage(text) {
    const message = document.createElement("div");
    message.className = "message ai";
    const label = document.createElement("div");
    label.className = "message-name";
    label.textContent = "Auckland Explorer";
    const detail = document.createElement("p");
    detail.textContent = text;
    const retry = document.createElement("button");
    retry.className = "btn btn-secondary";
    retry.type = "button";
    retry.textContent = "Retry";
    retry.addEventListener("click", () => {
        if (input.value.trim()) chatForm.requestSubmit();
    });
    message.append(label, detail, retry);
    chatThread.append(message);
    scrollToLatest();
}

function renderResponse(data) {
    const message = document.createElement("div");
    message.className = "message ai result-message";
    const label = document.createElement("div");
    label.className = "message-name";
    label.textContent = "🌊 Auckland Explorer";
    message.append(label);

    const summary = document.createElement("p");
    summary.textContent = String(data.summary || "Here are some nearby ideas.");
    message.append(summary);
    const providerNote = document.createElement("p");
    providerNote.className = "place-category";
    providerNote.textContent = data.ai_provider === "nvidia"
        ? "AI provider: NVIDIA fallback"
        : "AI provider: Gemini";
    message.append(providerNote);

    const cardContainer = document.createElement("div");
    cardContainer.className = "recommendation-grid";
    message.append(cardContainer);
    const mapLegend = document.createElement("div");
    mapLegend.className = "map-radius-legend";
    const mapContainer = document.createElement("div");
    mapContainer.className = "recommendation-map";
    mapContainer.setAttribute("role", "region");
    mapContainer.setAttribute("aria-label", "Map of recommended destinations and straight-line radius circles");
    message.append(mapLegend, mapContainer);

    const safetyNotice = createSafetyNotice(data);
    if (safetyNotice) message.append(safetyNotice);
    const transport = createTransportNotice(data.transport);
    if (transport) message.append(transport);

    chatThread.append(message);
    lastResult = {
        data,
        cardContainer,
        mapContainer,
        mapLegend,
        safetyNotice,
        transport,
    };
    refreshLastResult();
    scrollToLatest();
}

function refreshLastResult() {
    if (!lastResult) return;
    const radius = Number(document.getElementById("fRadius").value);
    const destinations = (lastResult.data.recommended_destinations || []).filter((place) =>
        isValidLocation(place)
        && straightLineDistance(userLocation, place) <= radius
    );
    lastResult.cardContainer.replaceChildren();

    if (!destinations.length) {
        const empty = document.createElement("p");
        empty.textContent = "No verified recommendations are within this radius. Try a wider radius or another category.";
        lastResult.cardContainer.append(empty);
    } else {
        destinations.forEach((place) => {
            lastResult.cardContainer.append(createRecommendationCard(place));
        });
    }
    renderRadiusLegend(lastResult.mapLegend, radius);
    renderMap(lastResult.mapContainer, destinations, radius);
}

function createRecommendationCard(place) {
    const card = document.createElement("article");
    card.className = "recommendation-card";
    const heading = document.createElement("h3");
    heading.textContent = String(place.place_name || "Auckland destination");
    const category = document.createElement("p");
    category.className = "place-category";
    category.textContent = String(place.category || "").replaceAll("_", " ");
    const distance = document.createElement("p");
    distance.className = "place-distance";
    distance.textContent = `${formatDistance(straightLineDistance(userLocation, place))} straight-line`;
    const rationale = document.createElement("p");
    rationale.textContent = String(place.relevance_rationale || "");
    card.append(heading, category, distance, rationale);

    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "More details";
    details.append(summary);
    const directions = createSafeLink(place.directions_url, "Directions");
    if (directions) details.append(directions);
    const official = createSafeLink(place.auckland_council_url, "Official information");
    if (official) {
        if (directions) details.append(document.createTextNode(" · "));
        details.append(official);
    }
    if (directions || official) card.append(details);
    return card;
}

function createSafetyNotice(data) {
    if (!data.environmental_safety_notice) return null;
    const notice = document.createElement("section");
    notice.className = "safety-notice";
    notice.dataset.status = data.environmental_safety_status || "unverified";
    const heading = document.createElement("h3");
    heading.textContent = notice.dataset.status === "warning"
        ? "Swimming safety warning"
        : notice.dataset.status === "checked"
            ? "Safeswim information"
            : "Current swim safety unverified";
    const detail = document.createElement("p");
    detail.textContent = data.environmental_safety_notice;
    notice.append(heading, detail);
    const source = createSafeLink(data.environmental_safety_source, "Check Safeswim");
    if (source) notice.append(source);
    return notice;
}

function createTransportNotice(transport) {
    if (!transport) return null;
    const notice = document.createElement("p");
    notice.className = "transport-note";
    const mode = document.createElement("strong");
    mode.textContent = `Travel: ${String(transport.mode || "public transport").replaceAll("_", " ")}. `;
    notice.append(mode);
    notice.append(document.createTextNode(String(
        transport.status || "Check Auckland Transport for current route information.",
    )));
    const planner = createSafeLink(transport.journey_planner_url, "Open AT Journey Planner");
    if (planner) {
        notice.append(document.createTextNode(" · "));
        notice.append(planner);
    }
    return notice;
}

function createSafeLink(value, label) {
    if (typeof value !== "string") return null;
    try {
        const url = new URL(value);
        if (url.protocol !== "https:") return null;
        const link = document.createElement("a");
        link.href = url.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = label;
        return link;
    } catch {
        return null;
    }
}

function renderRadiusLegend(container, selectedRadius) {
    container.replaceChildren();
    RADIUS_OPTIONS.forEach((radius) => {
        const item = document.createElement("span");
        item.textContent = `${radius / 1000} km${radius === selectedRadius ? " · selected" : ""}`;
        if (radius === selectedRadius) {
            const selected = document.createElement("strong");
            selected.textContent = item.textContent;
            item.replaceChildren(selected);
        }
        container.append(item);
    });
    const explanation = document.createElement("span");
    explanation.textContent = "Straight-line radius · distances are not travel routes";
    container.append(explanation);
}

function renderMap(container, destinations, selectedRadius) {
    if (resultMap) {
        resultMap.remove();
        resultMap = null;
    }
    container.id = `recommendationMap${++mapSequence}`;
    if (typeof window.L === "undefined") {
        container.textContent = "The map could not load. The verified destination cards remain available.";
        return;
    }

    resultMap = window.L.map(container.id, { scrollWheelZoom: false })
        .setView([userLocation.latitude, userLocation.longitude], 12);
    window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(resultMap);

    const boundsItems = [];
    const origin = window.L.marker([userLocation.latitude, userLocation.longitude]);
    const originPopup = document.createElement("span");
    originPopup.textContent = locationIsConsented
        ? "Your consented starting location"
        : "Auckland Central default";
    origin.bindPopup(originPopup).addTo(resultMap);
    boundsItems.push(origin);

    const circles = RADIUS_OPTIONS.slice().reverse().map((radius) => {
        const selected = radius === selectedRadius;
        const circle = window.L.circle(
            [userLocation.latitude, userLocation.longitude],
            {
                radius,
                color: selected ? "#0891b2" : "#64748b",
                weight: selected ? 3 : 1,
                opacity: selected ? 1 : 0.58,
                fillColor: selected ? "#22d3ee" : "#94a3b8",
                fillOpacity: selected ? 0.08 : 0.025,
            },
        ).addTo(resultMap);
        boundsItems.push(circle);
        return circle;
    });

    destinations.forEach((place) => {
        const marker = window.L.marker([place.latitude, place.longitude]);
        const popup = document.createElement("span");
        popup.textContent = `${place.place_name} · ${formatDistance(
            straightLineDistance(userLocation, place),
        )} straight-line`;
        marker.bindPopup(popup).addTo(resultMap);
        boundsItems.push(marker);
    });

    circles.find((circle) => circle.options.radius === selectedRadius)?.bringToFront();
    resultMap.fitBounds(window.L.featureGroup(boundsItems).getBounds(), { padding: [18, 18] });
    window.setTimeout(() => resultMap?.invalidateSize(), 0);
}

function straightLineDistance(origin, destination) {
    const toRadians = (degrees) => degrees * Math.PI / 180;
    const lat1 = toRadians(origin.latitude);
    const lat2 = toRadians(destination.latitude);
    const deltaLat = lat2 - lat1;
    const deltaLon = toRadians(destination.longitude - origin.longitude);
    const haversine = Math.sin(deltaLat / 2) ** 2
        + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function formatDistance(meters) {
    return meters < 1000
        ? `${Math.round(meters)} m`
        : `${(meters / 1000).toFixed(1)} km`;
}

function setLocationStatus(message, state) {
    statusText.textContent = message;
    statusDot.className = `status-dot${state === "loading" ? " loading" : ""}${state === "error" ? " error" : ""}`;
}

function loadPlaceFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get("prompt");
    const place = params.get("place");
    if (prompt) input.value = prompt;
    else if (place) input.value = `Tell me about ${place}`;
    if (prompt || place) input.focus();
}

function scrollToLatest() {
    chatThread.scrollTop = chatThread.scrollHeight;
}
