const API_URL = window.AUCKLAND_EXPLORER_API_URL;
let userLatitude = null,
    userLongitude = null;
const chatThread = document.getElementById("chatThread"),
    chatForm = document.getElementById("chatForm"),
    input = document.getElementById("fInput"),
    sendBtn = document.getElementById("sendBtn"),
    statusText = document.getElementById("statusText"),
    statusDot = document.getElementById("statusDot");
function setupEvents() {
    chatForm.addEventListener("submit", sendMessage);
    document.querySelectorAll("[data-prompt]").forEach((button) => {
        button.addEventListener("click", () => {
            input.value = button.dataset.prompt;
            sendMessage();
        });
    });
    document.getElementById("locateBtn").addEventListener("click", getUserLocation);
}
function getUserLocation() {
    setStatus("Getting location...", "loading");
    if (!navigator.geolocation) {
        useFallbackLocation();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLatitude = position.coords.latitude;
            userLongitude = position.coords.longitude;
            setStatus("Location ready", "success");
        },
        useFallbackLocation,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
}
function useFallbackLocation() {
    userLatitude = -36.8485;
    userLongitude = 174.7633;
    setStatus("Using Auckland location", "success");
}
async function sendMessage(e) {
    e?.preventDefault();
    const t = input.value.trim();
    if (t) {
        addMessage(t, "user"),
            (input.value = ""),
            setStatus("Sending to server...", "loading"),
            (sendBtn.disabled = !0);
        try {
            if (!API_URL) {
                throw new Error("AI recommendations are not configured for this GitHub Pages site.");
            }
            const e = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    coordinates: { latitude: userLatitude, longitude: userLongitude },
                    user_intent_prompt: t,
                    user_preferences: {
                        transport_mode: document.getElementById("fMode").value,
                        radius_meters: Number(document.getElementById("fRadius").value),
                    },
                }),
            });
            setStatus("Waiting for AI...", "loading");
            let a;
            try {
                a = await e.json();
            } catch {
                throw new Error(`Backend returned an invalid response (HTTP ${e.status}).`);
            }
            if (!e.ok) throw new Error(a?.detail?.message || a?.detail || "Server request failed");
            addMessage(getAIReply(a), "ai"), setStatus("Connected", "success");
        } catch (e) {
            console.error("Chat error:", e),
                addMessage(`⚠️ Backend error: ${e.message}`, "ai"),
                setStatus("Server unavailable", "error");
        } finally {
            sendBtn.disabled = !1;
        }
    }
}
function getAIReply(e) {
    return e.response || e.message || e.reply || e.answer || JSON.stringify(e, null, 2);
}
function addMessage(e, t) {
    const a = document.createElement("div");
    (a.className = `message ${t}`),
        "ai" === t
            ? (a.innerHTML = `\n\n            <div class="message-name">\n                🌊 Auckland Explorer\n            </div>\n\n            ${escapeHTML(e)}\n\n            `)
            : (a.textContent = e),
        chatThread.appendChild(a),
        (chatThread.scrollTop = chatThread.scrollHeight);
}
function setStatus(e, t) {
    (statusText.textContent = e),
        (statusDot.className = "status-dot"),
        document.getElementById("serverStatus").textContent = e,
        "loading" === t && statusDot.classList.add("loading"),
        "error" === t && statusDot.classList.add("error");
}
function loadPlaceFromURL() {
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get("prompt");
    const place = params.get("place");
    if (prompt) {
        input.value = prompt;
    } else if (place) {
        input.value = `Tell me about ${place}`;
    }
}
function escapeHTML(e) {
    const t = document.createElement("div");
    return (t.textContent = e), t.innerHTML;
}
document.addEventListener("DOMContentLoaded", () => {
    getUserLocation(), setupEvents(), loadPlaceFromURL();
});