/* =========================================================
   AUCKLAND EXPLORER CHAT
   ========================================================= */


/* BACKEND URL */

const API_URL =
    "http://127.0.0.1:8000/api/chat";


/* STATE */

let userLatitude = null;
let userLongitude = null;

let map = null;
let userMarker = null;


/* ELEMENTS */

const chatThread =
    document.getElementById("chatThread");

const chatForm =
    document.getElementById("chatForm");

const input =
    document.getElementById("fInput");

const sendBtn =
    document.getElementById("sendBtn");

const statusText =
    document.getElementById("statusText");

const statusDot =
    document.getElementById("statusDot");

const mapModal =
    document.getElementById("mapModal");


/* =========================================================
   STARTUP
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        getUserLocation();

        setupEvents();

        loadPlaceFromURL();

    }
);


/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {

    chatForm.addEventListener(
        "submit",
        sendMessage
    );


    document
        .querySelectorAll(
            "[data-prompt]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        input.value =
                            button.dataset.prompt;

                        sendMessage();

                    }
                );

            }
        );


    document
        .getElementById(
            "locateBtn"
        )
        .addEventListener(
            "click",
            openMap
        );


    document
        .getElementById(
            "closeMap"
        )
        .addEventListener(
            "click",
            closeMap
        );


    mapModal.addEventListener(
        "click",
        event => {

            if (
                event.target === mapModal
            ) {

                closeMap();

            }

        }
    );

}


/* =========================================================
   LOCATION
   ========================================================= */

function getUserLocation() {

    setStatus(
        "Getting location...",
        "loading"
    );


    if (!navigator.geolocation) {

        useFallbackLocation();

        return;

    }


    navigator.geolocation.getCurrentPosition(

        position => {

            userLatitude =
                position.coords.latitude;

            userLongitude =
                position.coords.longitude;


            setStatus(
                "Location ready",
                "success"
            );

        },


        () => {

            useFallbackLocation();

        },


        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }

    );

}


function useFallbackLocation() {

    userLatitude =
        -36.8485;

    userLongitude =
        174.7633;


    setStatus(
        "Using Auckland location",
        "success"
    );

}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage(event) {

    event?.preventDefault();


    const message =
        input.value.trim();


    if (!message) return;


    addMessage(
        message,
        "user"
    );


    input.value =
        "";


    setStatus(
        "Sending to server...",
        "loading"
    );


    sendBtn.disabled =
        true;


    try {

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
                        JSON.stringify({

                            coordinates: {

                                latitude:
                                    userLatitude,

                                longitude:
                                    userLongitude

                            },


                            user_intent_prompt:
                                message,


                            user_preferences: {

                                transport_mode:
                                    document
                                        .getElementById(
                                            "fMode"
                                        )
                                        .value,


                                radius_meters:
                                    Number(
                                        document
                                            .getElementById(
                                                "fRadius"
                                            )
                                            .value
                                    )

                            }

                        })

                }
            );


        setStatus(
            "Waiting for AI...",
            "loading"
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data?.detail?.message ||

                data?.detail ||

                "Server request failed"

            );

        }


        const reply =
            getAIReply(data);


        addMessage(
            reply,
            "ai"
        );


        setStatus(
            "Connected",
            "success"
        );

    }


    catch (error) {

        console.error(
            "Chat error:",
            error
        );


        addMessage(

            `⚠️ Backend error: ${error.message}`,

            "ai"

        );


        setStatus(
            "Server unavailable",
            "error"
        );

    }


    finally {

        sendBtn.disabled =
            false;

    }

}


/* =========================================================
   EXTRACT AI RESPONSE
   ========================================================= */

function getAIReply(data) {

    return (

        data.response ||

        data.message ||

        data.reply ||

        data.answer ||

        JSON.stringify(
            data,
            null,
            2
        )

    );

}


/* =========================================================
   ADD MESSAGE
   ========================================================= */

function addMessage(
    text,
    type
) {

    const message =
        document.createElement(
            "div"
        );


    message.className =
        `message ${type}`;


    if (type === "ai") {

        message.innerHTML =
            `

            <div class="message-name">
                🌊 Auckland Explorer
            </div>

            ${escapeHTML(text)}

            `;

    }


    else {

        message.textContent =
            text;

    }


    chatThread.appendChild(
        message
    );


    chatThread.scrollTop =
        chatThread.scrollHeight;

}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(
    text,
    state
) {

    statusText.textContent =
        text;


    statusDot.className =
        "status-dot";


    if (state === "loading") {

        statusDot.classList.add(
            "loading"
        );

    }


    if (state === "error") {

        statusDot.classList.add(
            "error"
        );

    }

}


/* =========================================================
   MAP
   ========================================================= */

function openMap() {

    mapModal.classList.add(
        "active"
    );


    if (!map) {

        map =
            L.map(
                "exploreMap"
            );


        L.tileLayer(

            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

            {
                attribution:
                    "&copy; OpenStreetMap contributors"
            }

        )
        .addTo(
            map
        );

    }


    updateMap();


    setTimeout(

        () =>
            map.invalidateSize(),

        100

    );

}


function updateMap() {

    const location = [

        userLatitude,
        userLongitude

    ];


    if (userMarker) {

        userMarker.setLatLng(
            location
        );

    }


    else {

        userMarker =
            L.marker(
                location
            )
            .addTo(
                map
            )
            .bindPopup(
                "Your location"
            );

    }


    map.setView(
        location,
        13
    );

}


function closeMap() {

    mapModal.classList.remove(
        "active"
    );

}


/* =========================================================
   PLACE FROM BEACH / PARK / ATTRACTION PAGE
   ========================================================= */

function loadPlaceFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const place =
        params.get(
            "place"
        );


    if (!place) return;


    input.value =
        `Tell me about ${place}`;

}


/* =========================================================
   SAFE TEXT
   ========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}