const API_URL = "http://127.0.0.1:8000/api/chat";
let userLatitude = null,
    userLongitude = null,
    map = null,
    userMarker = null;
const chatThread = document.getElementById("chatThread"),
    chatForm = document.getElementById("chatForm"),
    input = document.getElementById("fInput"),
    sendBtn = document.getElementById("sendBtn"),
    statusText = document.getElementById("statusText"),
    statusDot = document.getElementById("statusDot"),
    mapModal = document.getElementById("mapModal");
function setupEvents() {
    chatForm.addEventListener("submit", sendMessage),
        document.querySelectorAll("[data-prompt]").forEach((e) => {
            e.addEventListener("click", () => {
                (input.value = e.dataset.prompt), sendMessage();
            });
        }),
        document.getElementById("locateBtn").addEventListener("click", openMap),
        document.getElementById("closeMap").addEventListener("click", closeMap),
        mapModal.addEventListener("click", (e) => {
            e.target === mapModal && closeMap();
        });
}
function getUserLocation() {
    setStatus("Getting location...", "loading"),
        navigator.geolocation
            ? navigator.geolocation.getCurrentPosition(
                  (e) => {
                      (userLatitude = e.coords.latitude),
                          (userLongitude = e.coords.longitude),
                          setStatus("Location ready", "success");
                  },
                  () => {
                      useFallbackLocation();
                  },
                  { enableHighAccuracy: !0, timeout: 1e4, maximumAge: 3e5 }
              )
            : useFallbackLocation();
}
function useFallbackLocation() {
    (userLatitude = -36.8485), (userLongitude = 174.7633), setStatus("Using Auckland location", "success");
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
            const a = await e.json();
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
        "loading" === t && statusDot.classList.add("loading"),
        "error" === t && statusDot.classList.add("error");
}
function openMap() {
    mapModal.classList.add("active"),
        map ||
            ((map = L.map("exploreMap")),
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(map)),
        updateMap(),
        setTimeout(() => map.invalidateSize(), 100);
}
function updateMap() {
    const e = [userLatitude, userLongitude];
    userMarker ? userMarker.setLatLng(e) : (userMarker = L.marker(e).addTo(map).bindPopup("Your location")),
        map.setView(e, 13);
}
function closeMap() {
    mapModal.classList.remove("active");
}
function loadPlaceFromURL() {
    const e = new URLSearchParams(window.location.search).get("place");
    e && (input.value = `Tell me about ${e}`);
}
function escapeHTML(e) {
    const t = document.createElement("div");
    return (t.textContent = e), t.innerHTML;
}
document.addEventListener("DOMContentLoaded", () => {
    getUserLocation(), setupEvents(), loadPlaceFromURL();
});