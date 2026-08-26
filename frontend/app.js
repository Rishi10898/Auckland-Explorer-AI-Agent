// ============================================================
// AUCKLAND EXPLORER
// Frontend application logic
//
// Responsibility of this file:
//
// 1. Get user's location
// 2. Manage the map
// 3. Read user's request
// 4. Read radius and transport preferences
// 5. Build the ChatRequest expected by FastAPI
// 6. Send POST /api/chat
// 7. Display the AI recommendations
// ============================================================


// ============================================================
// 1. CONFIGURATION
// ============================================================

const API_URL = "http://127.0.0.1:8000/api/chat";


// Auckland Central fallback location
const DEFAULT_LOCATION = {
    latitude: -36.8485,
    longitude: 174.7633
};


// Current user location
let userLatitude = DEFAULT_LOCATION.latitude;
let userLongitude = DEFAULT_LOCATION.longitude;


// Leaflet map state
let exploreMap = null;
let userMarker = null;
let accuracyCircle = null;


// ============================================================
// 2. DOM ELEMENTS
// ============================================================

const chatForm = document.getElementById("chatForm");
const chatThread = document.getElementById("chatThread");

const input = document.getElementById("fInput");

const sendButton = document.getElementById("sendBtn");

const transportSelect =
    document.getElementById("fMode");

const radiusSelect =
    document.getElementById("fRadius");

const geoDot =
    document.getElementById("geoDot");

const geoLabel =
    document.getElementById("geoLabel");

const locateResult =
    document.getElementById("locateResult");


// ============================================================
// 3. APPLICATION STARTUP
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    initialiseMap();

    acquireUserLocation();

});


// ============================================================
// 4. INITIALISE MAP
// ============================================================

function initialiseMap() {

    const mapElement =
        document.getElementById("exploreMap");

    if (!mapElement) {
        return;
    }

    exploreMap = L.map("exploreMap")
        .setView(
            [
                DEFAULT_LOCATION.latitude,
                DEFAULT_LOCATION.longitude
            ],
            13
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(exploreMap);

}


// ============================================================
// 5. GET USER LOCATION
// ============================================================

function acquireUserLocation() {

    setGeoStatus(
        "loading",
        "Locating..."
    );


    if (!navigator.geolocation) {

        useFallbackLocation(
            "Geolocation unavailable"
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        (position) => {

            userLatitude =
                position.coords.latitude;

            userLongitude =
                position.coords.longitude;


            console.log(
                "User location:",
                userLatitude,
                userLongitude
            );


            setGeoStatus(
                "active",
                "Location active"
            );


            updateMapLocation(
                userLatitude,
                userLongitude,
                position.coords.accuracy
            );

        },


        (error) => {

            console.warn(
                "Location error:",
                error.message
            );


            useFallbackLocation(
                "Using Auckland fallback"
            );

        },


        {
            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 300000
        }

    );

}


// ============================================================
// 6. MANUALLY LOCATE USER
// ============================================================

function locateMe() {

    acquireUserLocation();

}


// ============================================================
// 7. FALLBACK LOCATION
// ============================================================

function useFallbackLocation(message) {

    userLatitude =
        DEFAULT_LOCATION.latitude;

    userLongitude =
        DEFAULT_LOCATION.longitude;


    setGeoStatus(
        "error",
        message
    );


    updateMapLocation(
        userLatitude,
        userLongitude,
        50
    );

}


// ============================================================
// 8. UPDATE GEOLOCATION STATUS
// ============================================================

function setGeoStatus(type, message) {

    if (!geoDot || !geoLabel) {
        return;
    }


    geoDot.className =
        "w-2 h-2 rounded-full";


    if (type === "active") {

        geoDot.classList.add(
            "bg-emerald-400"
        );

    }

    else if (type === "loading") {

        geoDot.classList.add(
            "bg-amber-400",
            "pulse-dot"
        );

    }

    else {

        geoDot.classList.add(
            "bg-rose-400"
        );

    }


    geoLabel.textContent =
        message;

}


// ============================================================
// 9. UPDATE MAP LOCATION
// ============================================================

function updateMapLocation(
    latitude,
    longitude,
    accuracy
) {

    if (!exploreMap) {
        return;
    }


    exploreMap.setView(
        [
            latitude,
            longitude
        ],
        14
    );


    // Remove previous marker
    if (userMarker) {

        exploreMap.removeLayer(
            userMarker
        );

    }


    // Remove previous accuracy circle
    if (accuracyCircle) {

        exploreMap.removeLayer(
            accuracyCircle
        );

    }


    // New marker
    userMarker =
        L.marker([
            latitude,
            longitude
        ])
        .addTo(exploreMap)
        .bindPopup(
            "Your current location"
        );


    // Accuracy circle
    accuracyCircle =
        L.circle(
            [
                latitude,
                longitude
            ],
            {
                radius: accuracy || 50,

                color: "#2563eb",

                fillColor: "#2563eb",

                fillOpacity: 0.12
            }
        )
        .addTo(exploreMap);


    if (locateResult) {

        locateResult.classList.remove(
            "hidden"
        );

        locateResult.innerHTML = `
            📍 Location active<br>
            <span class="text-slate-400">
                ${latitude.toFixed(5)},
                ${longitude.toFixed(5)}
            </span>
        `;

    }

}


// ============================================================
// 10. FORM SUBMISSION
// ============================================================

chatForm.addEventListener(
    "submit",
    handleFormSubmit
);


async function handleFormSubmit(event) {

    event.preventDefault();


    const message =
        input.value.trim();


    if (!message) {
        return;
    }


    // Show user message
    appendUserMessage(
        message
    );


    // Clear input
    input.value = "";


    // Disable button while processing
    sendButton.disabled = true;

    sendButton.textContent =
        "Thinking...";


    // Show loading message
    const loadingId =
        appendLoadingMessage();


    try {

        const response =
            await sendChatRequest(
                message
            );


        removeLoadingMessage(
            loadingId
        );


        displayAIResponse(
            response
        );

    }

    catch (error) {

        removeLoadingMessage(
            loadingId
        );


        console.error(
            "Chat request failed:",
            error
        );


        addMessage(
            "System",
            "The recommendation service could not be reached. Please check that FastAPI is running."
        );

    }

    finally {

        sendButton.disabled =
            false;

        sendButton.textContent =
            "Send →";

    }

}


// ============================================================
// 11. QUICK PROMPTS
// ============================================================

function quickSend(message) {

    input.value =
        message;


    chatForm.dispatchEvent(
        new Event("submit")
    );

}


// ============================================================
// 12. BUILD + SEND API REQUEST
// ============================================================

async function sendChatRequest(
    userMessage
) {

    const selectedTransport =
        transportSelect.value;


    const selectedRadius =
        Number(
            radiusSelect.value
        );


    // IMPORTANT:
    //
    // This object MUST match:
    //
    // ChatRequest in schemas.py
    //
    // coordinates
    // user_intent_prompt
    // user_preferences

    const payload = {

        coordinates: {

            latitude:
                userLatitude,

            longitude:
                userLongitude

        },


        user_intent_prompt:
            userMessage,


        user_preferences: {

            categories: [
                "BEACH",
                "PARK_RECREATION_AREA",
                "SHOPPING_CENTER",
                "RESTAURANT",
                "HOTEL_MOTEL"
            ],


            transport:
                selectedTransport,


            radius_meters:
                selectedRadius

        }

    };


    // This should now be the ONLY payload
    // sent to /api/chat.

    console.log(
        "POST /api/chat payload:",
        payload
    );


    const response =
        await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        payload
                    )
            }
        );


    const data =
        await response.json();


    console.log(
        "FastAPI response:",
        data
    );


    if (!response.ok) {

        throw new Error(
            `HTTP ${response.status}: ${
                JSON.stringify(data)
            }`
        );

    }


    return data;

}


// ============================================================
// 13. DISPLAY AI RESPONSE
// ============================================================

function displayAIResponse(data) {


    // Greeting
    if (
        data.cultural_greeting
    ) {

        addMessage(
            "AI Guide",
            data.cultural_greeting
        );

    }


    // Recommendations
    if (
        Array.isArray(
            data.recommended_destinations
        )
    ) {

        data.recommended_destinations
            .forEach(
                destination => {

                    const text =

                        `${destination.place_name}

${destination.category}

${destination.relevance_rationale}

${destination.auckland_council_url}`;


                    addMessage(
                        "AI Guide",
                        text
                    );

                }
            );

    }


    // Environmental safety
    if (
        data.environmental_safety_notice
    ) {

        addMessage(
            "Safety",
            data.environmental_safety_notice
        );

    }


    // If nothing came back
    if (
        !data.cultural_greeting &&
        !data.recommended_destinations
    ) {

        addMessage(
            "AI Guide",
            "I couldn't find any recommendations for that request."
        );

    }

}


// ============================================================
// 14. USER MESSAGE
// ============================================================

function appendUserMessage(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.className =
        "flex items-start gap-3 justify-end fade-in";


    div.innerHTML = `

        <div
            class="bg-blue-600 rounded-2xl
                   rounded-tr-none p-3.5
                   max-w-[85%] text-sm
                   text-slate-100 shadow-md"
        >
            ${escapeHtml(text)}
        </div>

        <div
            class="w-8 h-8 rounded-full
                   bg-slate-800
                   border border-slate-700
                   flex items-center
                   justify-center
                   text-xs font-bold shrink-0"
        >
            You
        </div>

    `;


    chatThread.appendChild(
        div
    );


    scrollToBottom();

}


// ============================================================
// 15. AI / SYSTEM MESSAGE
// ============================================================

function addMessage(
    sender,
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.className =
        "flex items-start gap-3 fade-in";


    div.innerHTML = `

        <div
            class="w-8 h-8 rounded-full
                   bg-blue-600
                   flex items-center
                   justify-center
                   text-xs font-bold
                   shrink-0"
        >
            ${sender === "You" ? "You" : "AI"}
        </div>


        <div
            class="bg-slate-900
                   border border-slate-800
                   rounded-2xl
                   rounded-tl-none
                   p-4 max-w-[85%]
                   text-sm leading-relaxed
                   text-slate-200"
        >

            <div class="font-semibold mb-1">
                ${escapeHtml(sender)}
            </div>

            <p class="whitespace-pre-line">
                ${escapeHtml(text)}
            </p>

        </div>

    `;


    chatThread.appendChild(
        div
    );


    scrollToBottom();

}


// ============================================================
// 16. LOADING MESSAGE
// ============================================================

function appendLoadingMessage() {

    const id =
        `loading-${Date.now()}`;


    const div =
        document.createElement(
            "div"
        );


    div.id = id;


    div.className =
        "flex items-start gap-3 fade-in";


    div.innerHTML = `

        <div
            class="w-8 h-8 rounded-full
                   bg-blue-600
                   flex items-center
                   justify-center
                   text-xs font-bold
                   shrink-0"
        >
            AI
        </div>


        <div
            class="bg-slate-900
                   border border-slate-800
                   rounded-2xl
                   rounded-tl-none
                   p-4 text-sm
                   text-slate-400"
        >

            <div class="flex items-center gap-2">

                <div
                    class="spinner w-4 h-4
                           border-2
                           border-slate-700
                           border-t-blue-400
                           rounded-full"
                ></div>

                Finding suitable places...

            </div>

        </div>

    `;


    chatThread.appendChild(
        div
    );


    scrollToBottom();


    return id;

}


// ============================================================
// 17. REMOVE LOADING MESSAGE
// ============================================================

function removeLoadingMessage(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.remove();

    }

}


// ============================================================
// 18. SCROLL CHAT
// ============================================================

function scrollToBottom() {

    chatThread.scrollTop =
        chatThread.scrollHeight;

}


// ============================================================
// 19. HTML ESCAPING
// ============================================================

function escapeHtml(
    text
) {

    return String(text || "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}