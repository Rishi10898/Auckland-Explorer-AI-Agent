// frontend/app.js

const explorerForm = document.getElementById('explorer-form');
const chatLog = document.getElementById('chat-log');
const inputVibe = document.getElementById('input-vibe');
const submitBtn = document.getElementById('submit-btn');
const geoStatusDot = document.getElementById('geo-status-dot');
const geoStatusText = document.getElementById('geo-status-text');

// State variables to capture real geolocation parameters
let userLatitude = null;
let userLongitude = null;

// Initialize Geolocation prompt immediately on page mount
window.addEventListener('DOMContentLoaded', () => {
    if (!navigator.geolocation) {
        updateGeoStatus("unsupported", "Geolocation not supported by browser");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLatitude = position.coords.latitude;
            userLongitude = position.coords.longitude;
            
            // Unlock UI controls gracefully
            updateGeoStatus("active", "Location Sync Active");
            inputVibe.disabled = false;
            inputVibe.classList.remove('cursor-not-allowed', 'opacity-50');
            submitBtn.disabled = false;
            submitBtn.className = "w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-xl shadow-lg shadow-blue-600/10 transition cursor-pointer";
            submitBtn.textContent = "Query Explorer Engine";
        },
        (error) => {
            console.error("GPS Error Code: ", error);
            updateGeoStatus("error", "Location access denied. Using fallback.");
            
            // Fallback default coordinates (Auckland Central) so application stays usable
            userLatitude = -36.8485;
            userLongitude = 174.7633;
            
            // Unlock fields using fallback state
            inputVibe.disabled = false;
            inputVibe.classList.remove('cursor-not-allowed', 'opacity-50');
            submitBtn.disabled = false;
            submitBtn.className = "w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-xl transition cursor-pointer";
            submitBtn.textContent = "Query with Default Location";
        }
    );
});

explorerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const budget = document.getElementById('input-budget').value || 0.0;
    const vibe = inputVibe.value;

    // Append User prompt choice cleanly to the visual chat timeline
    appendMessage('User', vibe, 'bg-blue-600/10 border border-blue-500/20 ml-auto text-right max-w-[85%]');

    try {
        // Build query using real GPS coordinates captured from initialization lifecycle hook
        const url = `http://127.0.0.1:8000/api/recommend?budget=${budget}&vibe=${encodeURIComponent(vibe)}&lat=${userLatitude}&lon=${userLongitude}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
        
        const data = await response.json();

        // Extract the conversational AI synthesis directly into the chat pane
        if (data.ai_engine_decision && data.ai_engine_decision.transit_recommendation) {
            const aiText = data.ai_engine_decision.transit_recommendation.ai_transit_reasoning;
            appendMessage('AI Guide', aiText, 'bg-slate-900/80 border border-slate-800 max-w-[85%]');
        }

    } catch (error) {
        appendMessage('System Error', 'Failed to communicate with back-end pipeline matrices.', 'bg-red-950/40 border border-red-800 text-red-400 max-w-[85%]');
    }

    // Clear input bar text for next conversational phase turn
    inputVibe.value = '';
});

function appendMessage(sender, text, styleClasses) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `p-4 rounded-xl shadow-sm ${styleClasses}`;
    msgDiv.innerHTML = `
        <p class="text-xs text-slate-500 mb-0.5">${sender}</p>
        <p class="text-sm leading-relaxed">${text}</p>
    `;
    chatLog.appendChild(msgDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function updateGeoStatus(state, message) {
    geoStatusText.textContent = message;
    geoStatusDot.className = "h-2 w-2 rounded-full";
    if (state === "active") {
        geoStatusDot.classList.add("bg-emerald-400");
    } else if (state === "error") {
        geoStatusDot.classList.add("bg-rose-400");
    } else {
        geoStatusDot.classList.add("bg-amber-400", "animate-pulse");
    }
}
// Function to get the user's location cleanly with local caching
function getUserLocation(callback) {
    const cachedLat = localStorage.getItem("user_lat");
    const cachedLon = localStorage.getItem("user_lon");

    // 1. Check if location is already saved in localStorage
    if (cachedLat && cachedLon) {
        console.log("Loaded cached location from localStorage:", cachedLat, cachedLon);
        callback({
            lat: parseFloat(cachedLat),
            lon: parseFloat(cachedLon)
        });
        return;
    }

    // 2. If not saved, check if the browser supports Geolocation
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Save to localStorage for future reloads
                localStorage.setItem("user_lat", lat);
                localStorage.setItem("user_lon", lon);

                console.log("New location acquired and saved:", lat, lon);
                callback({ lat, lon });
            },
            (error) => {
                console.warn("Location permission denied or unavailable:", error.message);
                // Fallback to Central Auckland / Tāmaki Makaurau coordinates (-36.8485, 174.7633)
                const defaultLocation = { lat: -36.8485, lon: 174.7633 };
                callback(defaultLocation);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 3600000 // Cache browser position for 1 hour
            }
        );
    } else {
        // Fallback for unsupported browsers
        callback({ lat: -36.8485, lon: 174.7633 });
    }
}

// Function to let the user manually update their location
function resetUserLocation() {
    localStorage.removeItem("user_lat");
    localStorage.removeItem("user_lon");
    alert("Location reset! Refreshing position...");
    getUserLocation((coords) => {
        console.log("Updated position:", coords);
        window.location.reload();
    });
}
async function sendChatMessage(userMessage) {
    // Retrieve coordinates (will instantly grab from localStorage if reloaded)
    getUserLocation(async (coords) => {
        const payload = {
    coordinates: {
        latitude: coords.lat,
        longitude: coords.lon
    },

    user_intent_prompt: userMessage,

    user_preferences: {
        categories: ["BEACH"]
    }
    };

        const response = await fetch("http://localhost:8000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Backend response:", data);
    });
}