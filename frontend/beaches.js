const PLACES = [
    {
        name: "Piha Beach",
        region: "West Auckland",
        lat: -36.953,
        lon: 174.468,
        image: "https://www.newzealand.com/assets/Tourism-NZ/Auckland/img-1536201939-3159-8823-717CA83C-0811-08A9-5BCA19BBB934D606__ExtRewriteWyJqcGciLCJ3ZWJwIl0_aWxvdmVrZWxseQo_FocalPointCropWzExMDAsMzIwMCw0MCw2Niw3NSwid2VicCIsNjUsMi41XQ.webp",
        points: [
            "Iconic black-sand west coast beach.",
            "Popular for coastal scenery and surfing.",
            "Great base for exploring the Waitākere coast.",
        ],
        info: "Piha is one of Auckland's best-known west coast beaches, surrounded by dramatic coastal scenery.",
        council: "https://www.newzealand.com/us/piha/",
    },
    {
        name: "Muriwai Beach",
        region: "West Auckland",
        lat: -36.832,
        lon: 174.443,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHk8MzDG2yRJ-zmg-l4KvyccFuQyFdqaBgOUZp3i3SNw&s=10",
        points: [
            "Spectacular black-sand coastline.",
            "Known for dramatic cliffs and coastal views.",
            "Gateway to Muriwai Regional Park.",
        ],
        info: "Muriwai is a rugged west coast destination with black-sand beaches, trails and coastal viewpoints.",
        council: "https://www.newzealand.com/nz/muriwai/",
    },
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
        region: "North Auckland",
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
        name: "Bethells Beach",
        region: "West Auckland",
        lat: -36.858,
        lon: 174.465,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI27tDomzXECZrAdxh2YBf_9kUrg8bOzRbxXSoOg0Xgw&s=10",
        points: [
            "Beautiful black-sand beach.",
            "Strong west coast scenery.",
            "Popular for walks and coastal exploration.",
        ],
        info: "Bethells Beach is a scenic west coast destination surrounded by native landscape.",
        council: "https://www.aucklandnz.com/explore/bethells-beach",
    },
    {
        name: "Orewa Beach",
        region: "North Auckland",
        lat: -36.586,
        lon: 174.689,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1hmvQV_oJ_FzLMOJSQ9m4aFdNXblWHjfNZFFJ7RVWVA&s=10",
        points: ["Long sandy coastline.", "Popular for walking and cycling.", "Close to Orewa town centre."],
        info: "Orewa Beach provides an accessible coastal destination north of Auckland.",
        council: "https://www.aucklandnz.com/explore/orewa-beach",
    },
    {
        name: "Cornwallis Beach",
        region: "West Auckland",
        lat: -36.997,
        lon: 174.635,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv3p66f8U5E2ViNvclpmVgIAWVwmgYaqLgXMyeNRpW1A&s=10",
        points: [
            "Sheltered Manukau Harbour setting.",
            "Good for picnics and swimming.",
            "Historic Cornwallis Wharf nearby.",
        ],
        info: "Cornwallis is a popular family-oriented spot on the Manukau Harbour.",
        council: "https://www.cornwallis.org.nz/activities",
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
function renderPlaces() {
    const n = document.getElementById("placesGrid");
    n
        ? (n.innerHTML = PLACES.map(
              (n, a) =>
                  `\n\n            <article class="card place-card">\n\n\n                <img\n                    class="place-image"\n                    src="${n.image}"\n                    alt="${n.name}"\n                    loading="lazy"\n                >\n\n\n                <div class="place-content">\n\n\n                    <p class="place-region">\n\n                        ${n.region}\n\n                    </p>\n\n\n                    <h2>\n\n                        ${n.name}\n\n                    </h2>\n\n\n                    <p class="place-description">\n\n                        ${n.info}\n\n                    </p>\n\n\n                    <ul class="place-points">\n\n                        ${n.points.map((n) => `<li>${n}</li>`).join("")}\n\n                    </ul>\n\n\n                    <div class="place-actions">\n\n\n                        \x3c!-- MORE INFORMATION --\x3e\n\n                        <a\n                            class="btn btn-secondary"\n                            href="${n.council}"\n                            target="_blank"\n                            rel="noopener"\n                        >\n                            More information →\n                        </a>\n\n\n                        \x3c!-- CIRCULAR MAP BUTTON --\x3e\n\n                        <button\n                            class="location-circle"\n                            type="button"\n                            onclick="showLocation(${a})"\n                            title="View location and distance"\n                            aria-label="View location"\n                        >\n                            📍\n                        </button>\n\n\n                    </div>\n\n\n                    \x3c!-- ASK AI --\x3e\n\n                    <button\n                        class="ask-ai-button"\n                        type="button"\n                        onclick='askAI(${JSON.stringify(n.name)})'\n                    >\n                        ✨ Ask AI about this place\n                    </button>\n\n\n                </div>\n\n\n            </article>\n\n            `
          ).join(""))
        : console.error("placesGrid was not found.");
}
function setupPopup() {
    const n = document.getElementById("locationPopup"),
        a = document.getElementById("closeLocationPopup");
    a?.addEventListener("click", () => {
        closeLocationPopup();
    }),
        n?.addEventListener("click", (a) => {
            a.target === n && closeLocationPopup();
        });
}
function closeLocationPopup() {
    const n = document.getElementById("locationPopup");
    n?.classList.remove("active"), destinationMap && (destinationMap.remove(), (destinationMap = null));
}
function showLocation(n) {
    const a = PLACES[n];
    if (!a) return void console.error("Destination not found:", n);
    const t = document.getElementById("locationPopup");
    t?.classList.add("active"),
        (document.getElementById("popupPlaceName").textContent = a.name),
        (document.getElementById("popupDistance").textContent = "Getting your location..."),
        getUserLocation(() => {
            const n = calculateDistance(userLocation.latitude, userLocation.longitude, a.lat, a.lon);
            (document.getElementById("popupDistance").textContent =
                `Approximately ${n.toFixed(1)} km from your location.`),
                (document.getElementById("googleMapsLink").href =
                    `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${a.lat},${a.lon}`),
                setTimeout(() => {
                    createMap(a);
                }, 100);
        });
}
function getUserLocation(n) {
    if (!userLocation)
        return navigator.geolocation
            ? void navigator.geolocation.getCurrentPosition(
                  (a) => {
                      (userLocation = { latitude: a.coords.latitude, longitude: a.coords.longitude }), n();
                  },
                  (a) => {
                      console.warn("Location unavailable:", a),
                          (userLocation = { latitude: -36.8485, longitude: 174.7633 }),
                          n();
                  },
                  { enableHighAccuracy: !0, timeout: 1e4, maximumAge: 3e5 }
              )
            : ((userLocation = { latitude: -36.8485, longitude: 174.7633 }), void n());
    n();
}
function createMap(n) {
    const a = document.getElementById("destinationMap");
    if (!a) return void console.error("destinationMap element not found.");
    destinationMap && (destinationMap.remove(), (destinationMap = null)),
        (a.innerHTML = ""),
        (destinationMap = L.map("destinationMap")),
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(destinationMap);
    const t = [userLocation.latitude, userLocation.longitude],
        e = [n.lat, n.lon];
    L.marker(t).addTo(destinationMap).bindPopup("Your location"), L.marker(e).addTo(destinationMap).bindPopup(n.name);
    const o = L.latLngBounds([t, e]);
    destinationMap.fitBounds(o, { padding: [50, 50] }),
        setTimeout(() => {
            destinationMap.invalidateSize(), destinationMap.fitBounds(o, { padding: [50, 50] });
        }, 250);
}
function calculateDistance(n, a, t, e) {
    const o = degreesToRadians(t - n),
        i = degreesToRadians(e - a),
        s = Math.sin(o / 2) ** 2 + Math.cos(degreesToRadians(n)) * Math.cos(degreesToRadians(t)) * Math.sin(i / 2) ** 2;
    return 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)) * 6371;
}
function degreesToRadians(n) {
    return (n * Math.PI) / 180;
}
function askAI(n) {
    window.location.href = `chat.html?place=${encodeURIComponent(n)}`;
}
document.addEventListener("DOMContentLoaded", () => {
    renderPlaces(), setupPopup();
});