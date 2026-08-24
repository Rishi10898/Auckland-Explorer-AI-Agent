const explorerForm = document.getElementById("explorer-form");
const inputVibe = document.getElementById("input-vibe");
const chatLog = document.getElementById("chat-log");

let userLatitude = -36.8485;
let userLongitude = 174.7633;


// Get user's location
navigator.geolocation?.getCurrentPosition(
    (position) => {
        userLatitude = position.coords.latitude;
        userLongitude = position.coords.longitude;

        console.log("User location:", userLatitude, userLongitude);
    },
    () => {
        console.log("Using Auckland fallback location");
    }
);


// Handle form submission
explorerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const userMessage = inputVibe.value.trim();

    if (!userMessage) {
        return;
    }

    const payload = {
        coordinates: {
            latitude: userLatitude,
            longitude: userLongitude
        },

        user_intent_prompt: userMessage,

        user_preferences: {
            categories: ["BEACH"]
        }
    };

    console.log("SENDING THIS PAYLOAD:", payload);

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        console.log("FASTAPI RESPONSE:", data);

        if (!response.ok) {
            throw new Error(
                JSON.stringify(data)
            );
        }

        displayResponse(data);

    } catch (error) {

        console.error(
            "REQUEST FAILED:",
            error
        );
    }
});


// Display backend response
function displayResponse(data) {

    if (data.cultural_greeting) {
        addMessage(
            "AI Guide",
            data.cultural_greeting
        );
    }

    if (data.recommended_destinations) {

        data.recommended_destinations.forEach(
            (destination) => {

                addMessage(
                    "AI Guide",
                    `${destination.place_name}: ${destination.relevance_rationale}`
                );
            }
        );
    }

    if (data.environmental_safety_notice) {

        addMessage(
            "Safety",
            data.environmental_safety_notice
        );
    }
}


// Add message to chat
function addMessage(sender, text) {

    const div = document.createElement("div");

    div.innerHTML = `
        <strong>${sender}</strong>
        <p>${text}</p>
    `;

    chatLog.appendChild(div);
}