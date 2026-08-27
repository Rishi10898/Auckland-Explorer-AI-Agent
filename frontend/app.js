// Auckland Explorer - Frontend

const API_URL = "http://127.0.0.1:8000/api/chat";

const DEFAULT_LOCATION = {
    latitude: -36.8485,
    longitude: 174.7633
};

let userLatitude = DEFAULT_LOCATION.latitude;
let userLongitude = DEFAULT_LOCATION.longitude;
let exploreMap;
let userMarker;
let accuracyCircle;

const chatForm = document.getElementById("chatForm");
const chatThread = document.getElementById("chatThread");
const input = document.getElementById("fInput");
const sendButton = document.getElementById("sendBtn");
const transportSelect = document.getElementById("fMode");
const radiusSelect = document.getElementById("fRadius");
const budgetInput = document.getElementById("fBudget");
const geoDot = document.getElementById("geoDot");
const geoLabel = document.getElementById("geoLabel");
const locateResult = document.getElementById("locateResult");


// START APPLICATION

document.addEventListener("DOMContentLoaded", () => {
    initialiseMap();
    acquireUserLocation();
});


// MAP

function initialiseMap() {
    const mapElement = document.getElementById("exploreMap");
    if (!mapElement) return;

    exploreMap = L.map("exploreMap").setView(
        [DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude],
        13
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(exploreMap);
}


// LOCATION

function acquireUserLocation() {
    setGeoStatus("loading", "Locating...");

    if (!navigator.geolocation) {
        useFallbackLocation("Geolocation unavailable");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            userLatitude = position.coords.latitude;
            userLongitude = position.coords.longitude;

            setGeoStatus("active", "Location active");

            updateMapLocation(
                userLatitude,
                userLongitude,
                position.coords.accuracy
            );
        },
        () => useFallbackLocation("Using Auckland fallback"),
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

function locateMe() {
    acquireUserLocation();
}

function useFallbackLocation(message) {
    userLatitude = DEFAULT_LOCATION.latitude;
    userLongitude = DEFAULT_LOCATION.longitude;

    setGeoStatus("error", message);
    updateMapLocation(userLatitude, userLongitude, 50);
}

function setGeoStatus(type, message) {
    if (!geoDot || !geoLabel) return;

    geoDot.className = "w-2 h-2 rounded-full";

    if (type === "active") {
        geoDot.classList.add("bg-emerald-400");
    } else if (type === "loading") {
        geoDot.classList.add("bg-amber-400", "pulse-dot");
    } else {
        geoDot.classList.add("bg-rose-400");
    }

    geoLabel.textContent = message;
}

function updateMapLocation(latitude, longitude, accuracy) {
    if (!exploreMap) return;

    exploreMap.setView([latitude, longitude], 14);

    if (userMarker) exploreMap.removeLayer(userMarker);
    if (accuracyCircle) exploreMap.removeLayer(accuracyCircle);

    userMarker = L.marker([latitude, longitude])
        .addTo(exploreMap)
        .bindPopup("Your current location");

    accuracyCircle = L.circle(
        [latitude, longitude],
        {
            radius: accuracy || 50,
            color: "#2563eb",
            fillColor: "#2563eb",
            fillOpacity: 0.12
        }
    ).addTo(exploreMap);

    if (locateResult) {
        locateResult.classList.remove("hidden");
        locateResult.innerHTML = `
            📍 Location active<br>
            <span class="text-slate-400">
                ${latitude.toFixed(5)}, ${longitude.toFixed(5)}
            </span>
        `;
    }
}


// CHAT

chatForm.addEventListener("submit", handleSubmit);

async function handleSubmit(event) {
    event.preventDefault();

    const message = input.value.trim();
    if (!message) return;

    appendUserMessage(message);
    input.value = "";
    sendButton.disabled = true;
    sendButton.textContent = "Thinking...";

    const loadingId = appendLoadingMessage();

    try {
        const response = await sendChatRequest(message);
        removeLoadingMessage(loadingId);
        displayAIResponse(response);
    } catch (error) {
        removeLoadingMessage(loadingId);

        console.error("Chat error:", error);

        addMessage(
            "System",
            "The recommendation service could not be reached. Check that FastAPI is running."
        );
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = "Send →";
    }
}


// QUICK PROMPTS

function quickSend(message) {
    input.value = message;
    chatForm.dispatchEvent(new Event("submit"));
}


// API REQUEST

async function sendChatRequest(userMessage) {
    const transport = transportSelect?.value || "public_transport";
    const radius = Number(radiusSelect?.value || 10000);

    const budget = budgetInput
        ? Number(budgetInput.value || 0)
        : 0;

    const payload = {
        coordinates: {
            latitude: userLatitude,
            longitude: userLongitude
        },

        user_intent_prompt: userMessage,

        user_preferences: {
            categories: [
                "BEACH",
                "PARK_RECREATION_AREA",
                "SHOPPING_CENTER",
                "RESTAURANT",
                "HOTEL_MOTEL"
            ],

            transport: transport,
            budget: budget,
            radius_meters: radius
        }
    };

    console.log("Sending:", payload);

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            `HTTP ${response.status}: ${JSON.stringify(data)}`
        );
    }

    return data;
}


// DISPLAY ONE COMPLETE AI RESPONSE

function displayAIResponse(data) {
    let message = "";

    if (data.cultural_greeting) {
        message += `${data.cultural_greeting}\n\n`;
    }

    if (data.summary) {
        message += `${data.summary}\n\n`;
    }

    const destinations = data.recommended_destinations || [];

    if (destinations.length) {
        message += "Recommended destinations\n\n";

        destinations.forEach((place, index) => {
            message += `${index + 1}. ${place.place_name}\n`;
            message += `${place.category}\n`;
            message += `${place.relevance_rationale}\n`;

            if (place.auckland_council_url) {
                message += `${place.auckland_council_url}\n`;
            }

            message += "\n";
        });
    }

    if (data.transport) {
        message += `Transport\n`;
        if (data.transport.status) {
            message += `${data.transport.status}\n`;
        }
        if (data.transport.journey_planner_url) {
            message += `Journey Planner: ${data.transport.journey_planner_url}\n`;
        }
        message += "\n";
    }

    if (data.environmental_safety_notice) {
        message += `Safety\n${data.environmental_safety_notice}`;
    }

    if (!message.trim()) {
        message = "I couldn't find suitable recommendations for that request.";
    }

    addMessage("AI Guide", message, true);
}


// USER MESSAGE

function appendUserMessage(text) {
    const div = document.createElement("div");

    div.className =
        "flex items-start gap-3 justify-end fade-in";

    div.innerHTML = `
        <div class="bg-blue-600 rounded-2xl rounded-tr-none
                    p-3.5 max-w-[85%] text-sm text-slate-100 shadow-md">
            ${escapeHtml(text)}
        </div>

        <div class="w-8 h-8 rounded-full bg-slate-800
                    border border-slate-700 flex items-center
                    justify-center text-xs font-bold shrink-0">
            You
        </div>
    `;

    chatThread.appendChild(div);
    scrollToBottom();
}


// AI MESSAGE

function addMessage(sender, text, allowLinks = false) {
    const div = document.createElement("div");

    div.className =
        "flex items-start gap-3 fade-in";

    const safeText = escapeHtml(text);
    const content = allowLinks
        ? linkify(safeText)
        : safeText;

    div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-blue-600
                    flex items-center justify-center
                    text-xs font-bold shrink-0">
            AI
        </div>

        <div class="bg-slate-900 border border-slate-800
                    rounded-2xl rounded-tl-none p-4 max-w-[85%]
                    text-sm leading-relaxed text-slate-200">

            <div class="font-semibold mb-2">
                ${escapeHtml(sender)}
            </div>

            <div class="whitespace-pre-line">
                ${content}
            </div>

        </div>
    `;

    chatThread.appendChild(div);
    scrollToBottom();
}


// LOADING

function appendLoadingMessage() {
    const id = `loading-${Date.now()}`;

    const div = document.createElement("div");
    div.id = id;

    div.className =
        "flex items-start gap-3 fade-in";

    div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-blue-600
                    flex items-center justify-center
                    text-xs font-bold shrink-0">
            AI
        </div>

        <div class="bg-slate-900 border border-slate-800
                    rounded-2xl rounded-tl-none p-4
                    text-sm text-slate-400">
            Finding suitable places...
        </div>
    `;

    chatThread.appendChild(div);
    scrollToBottom();

    return id;
}

function removeLoadingMessage(id) {
    document.getElementById(id)?.remove();
}


// UTILITIES

function scrollToBottom() {
    chatThread.scrollTop = chatThread.scrollHeight;
}

function escapeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function linkify(text) {
    return text.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" ' +
        'class="text-blue-400 underline break-all">$1</a>'
    );
}