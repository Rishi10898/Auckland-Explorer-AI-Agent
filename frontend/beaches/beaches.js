const PLACES = [
    {
        name: "Mission Bay",
        region: "Central Auckland",
        lat: -36.8485,
        lon: 174.83,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZjtNU8WdZuFpceip9oZMUg4hFChi4WudjfBDatCEnFg&s=10",
        points: [
            "Easy-to-reach waterfront destination.",
            "Views across the Waitematā Harbour.",
            "Close to cafes, restaurants and shops.",
        ],
        info: "Mission Bay is a popular Auckland waterfront destination close to the city centre.",
        council: "https://www.aucklandnz.com/explore/mission-bay",
    },
    {
        name: "Takapuna Beach",
        region: "North Shore",
        lat: -36.787,
        lon: 174.773,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR1Obvd4T0fdbe1pDGXihL43mV2wR4ZY0qhYPvlKfszQ&s=10",
        points: [
            "Wide beach on Auckland's North Shore.",
            "Views towards Rangitoto Island.",
            "Close to Takapuna shops and cafes.",
        ],
        info: "Takapuna Beach combines a large urban beach with views across the Hauraki Gulf.",
        council: "https://www.aucklandnz.com/explore/takapuna-beach",
    },
    {
        name: "Long Bay",
        region: "North Shore",
        lat: -36.678,
        lon: 174.749,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsk4gvcmY4GYGbX_oUtimwJmOcFUmPrF34hIRXtTA1Lg&s=10",
        points: ["Large sandy beach.", "Popular for walking and recreation.", "Part of Long Bay Regional Park."],
        info: "Long Bay provides a large coastal recreation area north of Auckland.",
        council: "https://exploreauckland.nz/swimming-at-long-bay-beach-auckland/",
    },
    {
        name: "Karekare Beach",
        region: "West Auckland",
        lat: -36.999,
        lon: 174.552,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSisE4OjTzqmc5roO9QdCgwNXsChR8Qh6tBN8MgZ1ayXQ&s=10",
        points: [
            "Dramatic west coast landscape.",
            "Black-sand beach and surrounding bush.",
            "A quieter alternative to Piha.",
        ],
        info: "Karekare is a dramatic west coast destination within the Waitākere Ranges.",
        council: "https://www.aucklandnz.com/explore/karekare-beach",
    },
    {
        name: "Orewa Beach",
        region: "North Shore",
        lat: -36.586,
        lon: 174.689,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1hmvQV_oJ_FzLMOJSQ9m4aFdNXblWHjfNZFFJ7RVWVA&s=10",
        points: ["Long sandy coastline.", "Popular for walking and cycling.", "Close to Orewa town centre."],
        info: "Orewa Beach provides an accessible coastal destination north of Auckland.",
        council: "https://www.aucklandnz.com/explore/orewa-beach",
    },
    {
        name: "Maraetai Beach",
        region: "East Auckland",
        lat: -36.885,
        lon: 175.04,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2EBO1ULK0zf7umYaNye3rXvq-0Ac_LcHzDLL6W7B4WQ&s=10",
        points: [
            "Eastern Auckland coastal destination.",
            "Views across the Hauraki Gulf.",
            "Popular for relaxed waterfront visits.",
        ],
        info: "Maraetai is a coastal destination in east Auckland with views across the Hauraki Gulf.",
        council: "https://www.aucklandnz.com/explore/maraetai-beach",
    },
];
let userLocation = null,
    destinationMap = null;
const REGIONS = {
    "beaches-east.html": "East Auckland",
    "beaches-west.html": "West Auckland",
    "beaches-south.html": "South Auckland",
    "beaches-north-shore.html": "North Shore",
    "beaches-central.html": "Central Auckland",
    "beaches-hauraki.html": "Hauraki",
    "beaches-gulf-islands.html": "Gulf Islands",
};
function getCurrentRegion() {
    const a = window.location.pathname.split("/").pop().toLowerCase();
    return REGIONS[a] || "West Auckland";
}
function renderPlaces() {
    const a = document.getElementById("placesGrid");
    if (!a) return;
    const n = getCurrentRegion(),
        t = PLACES.filter((a) => a.region === n);
    0 !== t.length
        ? ((a.innerHTML = t
              .map(
                  (a, n) =>
                      `\n        <article class="card place-card">\n            <img\n                class="place-image"\n                src="${a.image}"\n                alt="${a.name}"\n                loading="lazy"\n            >\n\n            <div class="place-content">\n                <p class="place-region">${a.region}</p>\n                <h2>${a.name}</h2>\n                <p class="place-description">${a.info}</p>\n\n                <ul class="place-points">\n                    ${a.points.map((a) => `<li>${a}</li>`).join("")}\n                </ul>\n\n                <div class="place-actions">\n                    <a\n                        class="btn btn-secondary"\n                        href="${a.council}"\n                        target="_blank"\n                        rel="noopener noreferrer"\n                    >\n                        More information →\n                    </a>\n\n                    <button\n                        class="location-circle"\n                        type="button"\n                        onclick="showLocation(${n})"\n                        title="View location and distance"\n                        aria-label="View ${a.name} location"\n                    >\n                        📍\n                    </button>\n                </div>\n\n                <button\n                    class="ask-ai-button"\n                    type="button"\n                    onclick="askAI(${JSON.stringify(a.name)})"\n                >\n                    ✨ Ask AI about this place\n                </button>\n            </div>\n        </article>\n    `
              )
              .join("")),
          (window.currentPlaces = t))
        : (a.innerHTML =
              '\n            <p class="no-recommendations">\n                No recommendations available in this region yet.\n            </p>\n        ');
}
function setupPopup() {
    const a = document.getElementById("locationPopup"),
        n = document.getElementById("closeLocationPopup");
    n?.addEventListener("click", closeLocationPopup),
        a?.addEventListener("click", (n) => {
            n.target === a && closeLocationPopup();
        });
}
function closeLocationPopup() {
    document.getElementById("locationPopup")?.classList.remove("active"),
        destinationMap && (destinationMap.remove(), (destinationMap = null));
}
function showLocation(a) {
    const n = window.currentPlaces?.[a];
    if (!n) return;
    const t = document.getElementById("locationPopup");
    t &&
        (t.classList.add("active"),
        (document.getElementById("popupPlaceName").textContent = n.name),
        (document.getElementById("popupDistance").textContent = "Getting your location..."),
        getUserLocation((a) => {
            const t = calculateDistance(a.latitude, a.longitude, n.lat, n.lon);
            (document.getElementById("popupDistance").textContent =
                `Approximately ${t.toFixed(1)} km from your location.`),
                (document.getElementById("googleMapsLink").href =
                    `https://www.google.com/maps/dir/?api=1&origin=${a.latitude},${a.longitude}&destination=${encodeURIComponent(n.name + ", Auckland, New Zealand")}`),
                createMap(n, a);
        }));
}
function getUserLocation(a) {
    userLocation
        ? a(userLocation)
        : navigator.geolocation
          ? navigator.geolocation.getCurrentPosition(
                (n) => {
                    userLocation = { latitude: n.coords.latitude, longitude: n.coords.longitude };
                    try {
                        sessionStorage.setItem("aucklandExplorerLocation", JSON.stringify(userLocation));
                    } catch (a) {
                        console.warn("Could not cache location.", a);
                    }
                    a(userLocation);
                },
                () => {
                    document.getElementById("popupDistance").textContent =
                        "Location unavailable. Please enable location access and try again.";
                },
                { enableHighAccuracy: !0, timeout: 1e4, maximumAge: 3e5 }
            )
          : (document.getElementById("popupDistance").textContent = "Your location is not supported by this browser.");
}
function createMap(a, n) {
    const t = document.getElementById("destinationMap");
    if (!t || "undefined" == typeof L) return;
    destinationMap && destinationMap.remove(),
        (t.innerHTML = ""),
        (destinationMap = L.map("destinationMap")),
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(destinationMap);
    const e = [n.latitude, n.longitude],
        o = [a.lat, a.lon];
    L.marker(e).addTo(destinationMap).bindPopup("Your location"), L.marker(o).addTo(destinationMap).bindPopup(a.name);
    const i = L.latLngBounds([e, o]);
    destinationMap.fitBounds(i, { padding: [50, 50] }),
        setTimeout(() => {
            destinationMap && (destinationMap.invalidateSize(), destinationMap.fitBounds(i, { padding: [50, 50] }));
        }, 250);
}
function calculateDistance(a, n, t, e) {
    const o = degreesToRadians(t - a),
        i = degreesToRadians(e - n),
        s = Math.sin(o / 2) ** 2 + Math.cos(degreesToRadians(a)) * Math.cos(degreesToRadians(t)) * Math.sin(i / 2) ** 2;
    return 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)) * 6371;
}
function degreesToRadians(a) {
    return (a * Math.PI) / 180;
}
function askAI(a) {
    window.location.href = `chat.html?place=${encodeURIComponent(a)}`;
}
document.addEventListener("DOMContentLoaded", () => {
    try {
        const a = sessionStorage.getItem("aucklandExplorerLocation");
        a && (userLocation = JSON.parse(a));
    } catch (a) {
        console.warn("Could not restore cached location.", a);
    }
    renderPlaces(), setupPopup();
});

function showDistances() {
    const badges = document.querySelectorAll(".distance-badge");

    if (!badges.length) return;

    badges.forEach(badge => {
        badge.textContent = "Getting distance...";
        badge.classList.add("loading");
    });

    navigator.geolocation?.getCurrentPosition(
        position => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            badges.forEach(badge => {
                const destination = badge.dataset.destination;

                // Look up the matching destination coordinates in PLACES.
                const place = PLACES.find(
                    item => item.name.toLowerCase() ===
                        destination.split(",")[0].toLowerCase()
                );

                if (!place) {
                    badge.textContent = "Distance unavailable";
                    badge.classList.remove("loading");
                    return;
                }

                const distance = calculateDistance(
                    userLat, userLon, place.lat, place.lon
                );

                badge.textContent = `Approx. ${distance.toFixed(1)} km`;
                badge.classList.remove("loading");
            });
        },
        () => {
            badges.forEach(badge => {
                badge.textContent = "Distance unavailable";
                badge.classList.remove("loading");
            });
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}
document.addEventListener("DOMContentLoaded", () => {
    renderPlaces();
    setupPopup();
    showDistances();
});