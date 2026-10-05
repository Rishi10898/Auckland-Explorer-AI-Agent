const PLACES = [
    {
        name: "Auckland Domain",
        region: "Central Auckland",
        lat: -36.8606,
        lon: 174.7785,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm1B2U8AQ_eUK8ftDxcnwZEpH0BJf6M_r55G30vMzIGQ&s=10",
        points: [
            "One of Auckland's largest and oldest parks.",
            "Home to walking areas and open green spaces.",
            "Close to Auckland Museum and the city centre.",
        ],
        info: "A large central Auckland park combining gardens, open spaces and cultural attractions.",
        council: "https://www.aucklandcouncil.govt.nz/",
    },
    {
        name: "Cornwall Park",
        region: "Central Auckland",
        lat: -36.8984,
        lon: 174.7848,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0sOib3-7hZL4PjHgJCET6irk003VzNBbTAl5iuq4fog&s=10",
        points: ["Large open green spaces.", "Views towards One Tree Hill.", "Popular for walking and picnics."],
        info: "Cornwall Park is a major Auckland green space with walking areas and views.",
        council: "https://www.aucklandcouncil.govt.nz/",
    },
    {
        name: "Western Springs Lakeside Park",
        region: "Central Auckland",
        lat: -36.8627,
        lon: 174.7287,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi8BFL59e0NuMssnbogGeYOGih4wfQLnoryk8Wa_C-jQ&s=10",
        points: ["Peaceful lakeside environment.", "Popular walking routes.", "Close to Auckland Zoo and MOTAT."],
        info: "Western Springs is a central Auckland park known for its lake and walking environment.",
        council: "https://www.aucklandcouncil.govt.nz/",
    },
    {
        name: "Albert Park",
        region: "Central Auckland",
        lat: -36.8506,
        lon: 174.7678,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFSBrjWWlN0t6LwtfV387ELnaR0yE_IszyStHeMNj0RA&s=10",
        points: ["Historic park near Auckland CBD.", "Convenient central location.", "Good for a short city walk."],
        info: "Albert Park is a historic green space close to Auckland's city centre.",
        council: "https://www.aucklandcouncil.govt.nz/",
    },
    {
        name: "Long Bay Regional Park",
        region: "North Auckland",
        lat: -36.6767,
        lon: 174.7467,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3ZAWDTFAQHi066co6Myqv08w00JWLbLojasSvnYRNHg&s=10",
        points: [
            "Large coastal recreation area.",
            "Walking and picnic opportunities.",
            "Beach and green space combined.",
        ],
        info: "Long Bay Regional Park combines coastal scenery with open recreational areas.",
        council: "https://www.aucklandcouncil.govt.nz/",
    },
    {
        name: "Ambury Regional Park",
        region: "South Auckland",
        lat: -36.9266,
        lon: 174.7556,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPt6FHBvANq1kGj__3KnQGh72MEYak1Yx7URmdmr3oCw&s=10",
        points: ["Large coastal regional park.", "Walking and open spaces.", "Views across the Manukau Harbour."],
        info: "Ambury Regional Park provides open countryside and coastal walking opportunities.",
        council: "https://www.aucklandcouncil.govt.nz/",
    },
    {
        name: "Shakespear Regional Park",
        region: "North Auckland",
        lat: -36.7,
        lon: 174.85,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEh8vHeYCIBa7fjy9mym7npEo5uOWckG0PeP3ScW8saQ&s=10",
        points: [
            "Coastal scenery and walking tracks.",
            "Large open natural environment.",
            "Views across the Hauraki Gulf.",
        ],
        info: "Shakespear Regional Park is a coastal destination with natural landscapes and walking tracks.",
        council: "https://www.aucklandcouncil.govt.nz/",
    },
    {
        name: "Waitākere Ranges Regional Park",
        region: "West Auckland",
        lat: -36.95,
        lon: 174.5,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV-UJc7RnSBZDF77JUwskks4Y9NBc0u0m2LoRunXVPnA&s=10",
        points: ["Native forest landscapes.", "Major walking and nature area.", "Close to Auckland's west coast."],
        info: "The Waitākere area provides access to some of Auckland's most significant natural landscapes.",
        council: "https://www.aucklandcouncil.govt.nz/",
    },
    {
        name: "Ōtuataua Stonefields Reserve",
        region: "South Auckland",
        lat: -36.998,
        lon: 174.786,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFDNY3Aacd9QrZ88TgDomI95PuKtWPCKa7jdOjTLzpwQ&s=10",
        points: ["Historic and cultural landscape.", "Open walking environment.", "Unique volcanic features."],
        info: "Ōtuataua Stonefields is an important Auckland landscape with natural and historical significance.",
        council: "https://www.aucklandcouncil.govt.nz/",
    },
    {
        name: "Tāwharanui Regional Park",
        region: "North Auckland",
        lat: -36.368,
        lon: 174.823,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOBdvsZCFhyelTyqAVhy4OnCvrJJ1xx8NpoqU8EG5ewQ&s=10",
        points: [
            "Large natural coastal environment.",
            "Walking and outdoor recreation.",
            "Combination of beach and park landscapes.",
        ],
        info: "Tāwharanui is a major regional park combining natural coastal scenery and outdoor recreation.",
        council: "https://www.aucklandcouncil.govt.nz/",
    },
];
let userLocation = null,
    destinationMap = null,
    userMarker = null,
    placeMarker = null;
function renderPlaces() {
    const n = document.getElementById("placesGrid");
    n
        ? (n.innerHTML = PLACES.map(
              (n, a) =>
                  `\n\n            <article class="card place-card">\n\n                <img\n                    class="place-image"\n                    src="${n.image}"\n                    alt="${n.name}"\n                    loading="lazy"\n                >\n\n                <div class="place-content">\n\n                    <p class="place-region">\n                        ${n.region}\n                    </p>\n\n                    <h2>\n                        ${n.name}\n                    </h2>\n\n                    <p class="place-description">\n                        ${n.info}\n                    </p>\n\n                    <ul class="place-points">\n\n                        ${n.points.map((n) => `<li>${n}</li>`).join("")}\n\n                    </ul>\n\n                    <div class="place-actions">\n\n                        <a\n                            class="btn btn-secondary"\n                            href="${n.council}"\n                            target="_blank"\n                            rel="noopener"\n                        >\n                            More information →\n                        </a>\n\n                        <button\n                            class="location-circle"\n                            type="button"\n                            onclick="showLocation(${a})"\n                            title="View location"\n                            aria-label="View location for ${n.name}"\n                        >\n                            📍\n                        </button>\n\n                    </div>\n\n                    <button\n                        class="ask-ai-button"\n                        type="button"\n                        onclick='askAI(${JSON.stringify(n.name)})'\n                    >\n                        ✨ Ask AI about this place\n                    </button>\n\n                </div>\n\n            </article>\n\n            `
          ).join(""))
        : console.error("placesGrid was not found.");
}
function setupPopup() {
    const n = document.getElementById("locationPopup"),
        a = document.getElementById("closeLocationPopup");
    a?.addEventListener("click", closeLocationPopup),
        n?.addEventListener("click", (a) => {
            a.target === n && closeLocationPopup();
        });
}
function closeLocationPopup() {
    const n = document.getElementById("locationPopup");
    n?.classList.remove("active");
}
async function showLocation(n) {
    const a = PLACES[n],
        t = document.getElementById("locationPopup"),
        e = document.getElementById("popupPlaceName"),
        o = document.getElementById("popupDistance");
    t.classList.add("active"), (e.textContent = a.name), (o.textContent = "Getting your location...");
    try {
        const n = await getUserLocation(),
            t = calculateDistance(n.latitude, n.longitude, a.lat, a.lon);
        (o.textContent = `${t.toFixed(1)} km away from you`),
            (document.getElementById("googleMapsLink").href =
                `https://www.google.com/maps/dir/${n.latitude},${n.longitude}/${a.lat},${a.lon}`),
            setTimeout(() => {
                openMap(n, a);
            }, 250);
    } catch (n) {
        console.error("Location error:", n),
            (o.textContent = "Location could not be accessed. Please allow location permission.");
    }
}
function getUserLocation() {
    return new Promise((n, a) => {
        userLocation
            ? n(userLocation)
            : navigator.geolocation
              ? navigator.geolocation.getCurrentPosition(
                    (a) => {
                        (userLocation = { latitude: a.coords.latitude, longitude: a.coords.longitude }),
                            n(userLocation);
                    },
                    (n) => {
                        a(n);
                    },
                    { enableHighAccuracy: !0, timeout: 1e4, maximumAge: 3e5 }
                )
              : a(new Error("Geolocation is not supported."));
    });
}
function openMap(n, a) {
    destinationMap ||
        ((destinationMap = L.map("destinationMap")),
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(destinationMap)),
        userMarker && destinationMap.removeLayer(userMarker),
        placeMarker && destinationMap.removeLayer(placeMarker),
        (userMarker = L.marker([n.latitude, n.longitude]).addTo(destinationMap).bindPopup("Your location")),
        (placeMarker = L.marker([a.lat, a.lon]).addTo(destinationMap).bindPopup(a.name));
    const t = L.latLngBounds([
        [n.latitude, n.longitude],
        [a.lat, a.lon],
    ]);
    destinationMap.fitBounds(t, { padding: [50, 50] }),
        setTimeout(() => {
            destinationMap.invalidateSize(), destinationMap.fitBounds(t, { padding: [50, 50] });
        }, 150);
}
function calculateDistance(n, a, t, e) {
    const o = degreesToRadians(t - n),
        i = degreesToRadians(e - a),
        c = Math.sin(o / 2) ** 2 + Math.cos(degreesToRadians(n)) * Math.cos(degreesToRadians(t)) * Math.sin(i / 2) ** 2;
    return 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c)) * 6371;
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
