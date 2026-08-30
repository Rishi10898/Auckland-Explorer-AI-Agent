/*
 * Auckland Explorer
 * Frontend controller.
 *
 * Complex techniques demonstrated:
 * - Modular functions
 * - Asynchronous API communication
 * - Geolocation API integration
 * - Dynamic DOM generation
 * - Structured error handling
 */

const API_URL = "http://127.0.0.1:8000/api/chat";

const DEFAULT_LOCATION = {
    latitude: -36.8485,
    longitude: 174.7633
};

let location = { ...DEFAULT_LOCATION };
let map;
let marker;

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("exploreMap")) {
        initialiseMap();
        locateMe();
    }

    document
        .getElementById("chatForm")
        ?.addEventListener("submit", submitChat);

    document
        .getElementById("contactForm")
        ?.addEventListener("submit", submitFeedback);
});

/* Creates the interactive map used by the AI Explorer. */
function initialiseMap() {
    map = L.map("exploreMap").setView(
        [location.latitude, location.longitude], 13
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "&copy; OpenStreetMap contributors" }
    ).addTo(map);
}

/* Requests the user's position and falls back safely if unavailable. */
function locateMe() {
    if (!navigator.geolocation) {
        updateLocation(DEFAULT_LOCATION);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => updateLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }),
        () => updateLocation(DEFAULT_LOCATION),
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

/* Updates application state and the map marker. */
function updateLocation(newLocation) {
    location = newLocation;

    const label = document.getElementById("geoLabel");

    if (label) {
        label.textContent =
            `📍 ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
    }

    if (!map) return;

    if (marker) map.removeLayer(marker);

    marker = L.marker([
        location.latitude,
        location.longitude
    ]).addTo(map);

    map.setView([
        location.latitude,
        location.longitude
    ], 14);
}

/* Sends the user's request to the FastAPI recommendation engine. */
async function submitChat(event) {
    event.preventDefault();

    const input = document.getElementById("fInput");
    const button = document.getElementById("sendBtn");
    const message = input.value.trim();

    if (!message) return;

    addMessage("You", message);
    input.value = "";
    button.disabled = true;
    button.textContent = "Thinking...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildPayload(message))
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail?.message || "Request failed.");
        }

        displayResponse(data);

    } catch (error) {
        addMessage(
            "System",
            `Unable to get recommendations: ${error.message}`
        );
    } finally {
        button.disabled = false;
        button.textContent = "Send →";
    }
}

/* Builds the exact structure required by ChatRequest. */
function buildPayload(message) {
    return {
        coordinates: location,
        user_intent_prompt: message,
        user_preferences: {
            categories: [
                "BEACH",
                "PARK_RECREATION_AREA",
                "SHOPPING_CENTER"
            ],
            transport: document.getElementById("fMode")?.value,
            radius_meters: Number(
                document.getElementById("fRadius")?.value || 10000
            )
        }
    };
}

/*
 * Converts the structured backend response into one
 * readable AI message instead of several separate messages.
 */
function displayResponse(data) {
    let html = `<strong>${escapeHtml(
        data.cultural_greeting || "Auckland Explorer"
    )}</strong>`;

    for (const place of data.recommended_destinations || []) {
        html += `
            <div class="recommendation">
                <strong>${escapeHtml(place.place_name)}</strong>
                <br>
                <small>${escapeHtml(place.category)}</small>
                <p>${escapeHtml(place.relevance_rationale)}</p>
                <a href="${escapeHtml(place.auckland_council_url)}"
                   target="_blank"
                   rel="noopener">
                    Official information →
                </a>
            </div>
        `;
    }

    if (data.environmental_safety_notice) {
        html += `
            <div class="recommendation">
                🌊 <strong>Safety</strong>
                <p>${escapeHtml(
                    data.environmental_safety_notice
                )}</p>
            </div>
        `;
    }

    addMessage("AI Explorer", html, true);
}

/* Adds a message to the chat interface. */
function addMessage(sender, text, html = false) {
    const thread = document.getElementById("chatThread");
    if (!thread) return;

    const div = document.createElement("div");
    div.className =
        `message ${sender === "You" ? "user" : "ai"}`;

    div.innerHTML = html
        ? `<strong>${escapeHtml(sender)}</strong><br>${text}`
        : `<strong>${escapeHtml(sender)}</strong><br>${escapeHtml(text)}`;

    thread.appendChild(div);
    thread.scrollTop = thread.scrollHeight;
}

/* Reuses the chat pipeline for predefined prompts. */
function quickSend(message) {
    const input = document.getElementById("fInput");
    if (!input) return;

    input.value = message;
    document
        .getElementById("chatForm")
        ?.requestSubmit();
}

/* Handles contact feedback locally until a backend endpoint is added. */
function submitFeedback(event) {
    event.preventDefault();

    document.getElementById("contactStatus").textContent =
        "Thank you! Your feedback has been recorded for this prototype.";

    event.target.reset();
}

/* Prevents API-generated text from being interpreted as HTML. */
function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function loadPromptFromUrl() {
    const prompt = new URLSearchParams(
        window.location.search
    ).get("prompt");

    const input = document.getElementById("fInput");

    if (prompt && input) {
        input.value = prompt;
        input.focus();
    }
}