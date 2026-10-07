const PLACES = [
    {
        name: "Sky Tower",
        region: "Auckland CBD",
        lat: -36.8485,
        lon: 174.7622,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwzkyW46MPo1kuOS9Lut_L11pa_EFCHPRZp9lx0azS3Q&s=10",
        points: [
            "One of Auckland's most recognisable landmarks.",
            "Panoramic views across the city.",
            "Located in the heart of Auckland CBD.",
        ],
        info: "The Sky Tower is one of Auckland's defining landmarks and offers extensive views of the city.",
        council: "https://www.aucklandnz.com/",
    },
    {
        name: "Auckland War Memorial Museum",
        region: "Auckland Domain",
        lat: -36.86,
        lon: 174.776,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe59iDy5w_ExZpaN48WSBlKDSGrk8Rt3hFaTIU8-Txfg&s=10",
        points: [
            "Major cultural institution.",
            "Located inside Auckland Domain.",
            "Extensive natural and cultural collections.",
        ],
        info: "Auckland Museum is a major cultural and natural-history institution in the Auckland Domain.",
        council: "https://www.aucklandmuseum.com/",
    },
    {
        name: "Auckland Art Gallery",
        region: "Auckland CBD",
        lat: -36.852,
        lon: 174.765,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcGwHQ-AgnEc3t3ROiJWqE5YAqtqbc1jud_hMUoo9ENQ&s=10",
        points: ["Major art collection.", "Central city location.", "Historic and modern architecture."],
        info: "Auckland Art Gallery is a major public art gallery in the city centre.",
        council: "https://www.aucklandartgallery.com/",
    },
    {
        name: "Wynyard Quarter",
        region: "Auckland CBD",
        lat: -36.841,
        lon: 174.755,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtoJG5Q_-7YRXyWQymiOv0En2RX4hrujxqUcn4yK_B3A&s=10",
        points: ["Waterfront destination.", "Restaurants, public spaces and events.", "Easy walk from the CBD."],
        info: "Wynyard Quarter is a regenerated waterfront precinct with public spaces and dining.",
        council: "https://www.aucklandnz.com/",
    },
    {
        name: "Viaduct Harbour",
        region: "Auckland CBD",
        lat: -36.844,
        lon: 174.762,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTf5QDtpN4bwf1cfA4ObxEWs7DxoDaQdCHnRCZFW0eyg&s=10",
        points: ["Iconic Auckland waterfront.", "Restaurants and public spaces.", "Close to the city centre."],
        info: "Viaduct Harbour is a central Auckland waterfront precinct.",
        council: "https://www.aucklandnz.com/",
    },
    {
        name: "Auckland Zoo",
        region: "Western Springs",
        lat: -36.864,
        lon: 174.719,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5QCP8uo1okcCLMEA7GQ3p8qhVs2NgQxL89I7jQ0ME8g&s=10",
        points: [
            "Major Auckland wildlife attraction.",
            "Located beside Western Springs.",
            "Large collection of animals and habitats.",
        ],
        info: "Auckland Zoo is a major wildlife attraction near Western Springs.",
        council: "https://www.aucklandzoo.co.nz/",
    },
    {
        name: "MOTAT",
        region: "Western Springs",
        lat: -36.867,
        lon: 174.713,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX4JopYlYngdPeMdPCqUbiiJ5JHAY-izt1O9Ho-14veQ&s=10",
        points: ["Transport and technology museum.", "Interactive exhibits.", "Close to Auckland Zoo."],
        info: "MOTAT explores New Zealand's transport, technology and innovation history.",
        council: "https://www.motat.nz/",
    },
    {
        name: "Devonport",
        region: "North Shore",
        lat: -36.831,
        lon: 174.796,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjccJurp7SgEud4b4AXYSr57BIBCp7zpw-RFuByfsKNQ&s=10",
        points: ["Historic waterfront suburb.", "Views across Auckland Harbour.", "Easy ferry trip from downtown."],
        info: "Devonport combines heritage streets, waterfront scenery and views across the Waitematā Harbour.",
        council: "https://www.aucklandnz.com/",
    },
    {
        name: "One Tree Hill",
        region: "Central Auckland",
        lat: -36.901,
        lon: 174.783,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPRotAQmkMDRWXzH-21FG6e5PkVypeuaFn8vGjNx8P4A&s=10",
        points: ["Iconic Auckland landmark.", "Excellent panoramic views.", "Located beside Cornwall Park."],
        info: "One Tree Hill / Maungakiekie is an iconic volcanic landmark and cultural landscape.",
        council: "https://www.aucklandcouncil.govt.nz/",
    },
    {
        name: "Auckland Waterfront",
        region: "Auckland CBD",
        lat: -36.844,
        lon: 174.76,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiMj-6S6TXz8rf0b6ZhL18dwkr7w__iIjGSL2KM0OdaQ&s=10",
        points: ["Central harbour destination.", "Walking and public spaces.", "Close to major city attractions."],
        info: "Auckland's waterfront provides access to the harbour, public spaces and central attractions.",
        council: "https://www.aucklandnz.com/",
    },
];
let userLocation = null,
    destinationMap = null;
function renderPlaces() {
    const n = document.getElementById("placesGrid");
    n
        ? (n.innerHTML = PLACES.map(
              (n, t) =>
                  `\n\n            <article class="card place-card">\n\n                <img\n                    class="place-image"\n                    src="${n.image}"\n                    alt="${n.name}"\n                    loading="lazy"\n                >\n\n\n                <div class="place-card-content">\n\n                    <p class="place-region">\n                        ${n.region}\n                    </p>\n\n\n                    <h2>\n                        ${n.name}\n                    </h2>\n\n\n                    <p class="place-description">\n                        ${n.info}\n                    </p>\n\n\n                    <ul class="place-points">\n\n                        ${n.points.map((n) => `<li>${n}</li>`).join("")}\n\n                    </ul>\n\n\n                    <div class="place-actions">\n\n\n                        <a\n                            class="btn btn-secondary"\n                            href="${n.council}"\n                            target="_blank"\n                            rel="noopener"\n                        >\n                            More information →\n                        </a>\n\n\n                        <button\n                            class="location-circle"\n                            type="button"\n                            onclick="showLocation(${t})"\n                            title="View location"\n                            aria-label="View ${n.name} location"\n                        >\n                            📍\n                        </button>\n\n\n                    </div>\n\n\n                    <button\n                        class="ask-ai-button"\n                        type="button"\n                        onclick='askAI(${JSON.stringify(n.name)})'\n                    >\n                        ✨ Ask AI about this place\n                    </button>\n\n\n                </div>\n\n            </article>\n\n        `
          ).join(""))
        : console.error("placesGrid was not found.");
}
function setupPopup() {
    const n = document.getElementById("locationPopup"),
        t = document.getElementById("closeLocationPopup");
    t?.addEventListener("click", closeLocationPopup),
        n?.addEventListener("click", (t) => {
            t.target === n && closeLocationPopup();
        });
}
function closeLocationPopup() {
    const n = document.getElementById("locationPopup");
    n?.classList.remove("active");
}
async function showLocation(n) {
    const t = PLACES[n];
    document.getElementById("locationPopup").classList.add("active"),
        (document.getElementById("popupPlaceName").textContent = t.name),
        (document.getElementById("popupDistance").textContent = "Getting your location...");
    try {
        const n = await getUserLocation(),
            e = calculateDistance(n.latitude, n.longitude, t.lat, t.lon);
        (document.getElementById("popupDistance").textContent = `Approximately ${e.toFixed(1)} km from your location.`),
            (document.getElementById("googleMapsLink").href =
                `https://www.google.com/maps/dir/${n.latitude},${n.longitude}/${t.lat},${t.lon}`),
            setTimeout(() => {
                createMap(n, t);
            }, 200);
    } catch (n) {
        console.error("Location error:", n),
            (document.getElementById("popupDistance").textContent = "Unable to access your location.");
    }
}
function getUserLocation() {
    return new Promise((n, t) => {
        userLocation
            ? n(userLocation)
            : navigator.geolocation
              ? navigator.geolocation.getCurrentPosition(
                    (t) => {
                        (userLocation = { latitude: t.coords.latitude, longitude: t.coords.longitude }),
                            n(userLocation);
                    },
                    (n) => {
                        console.error("Geolocation error:", n), t(n);
                    },
                    { enableHighAccuracy: !0, timeout: 1e4, maximumAge: 3e5 }
                )
              : t(new Error("Geolocation is not supported."));
    });
}
function createMap(n, t) {
    const e = document.getElementById("destinationMap");
    destinationMap && (destinationMap.remove(), (destinationMap = null)),
        (e.innerHTML = ""),
        (e._leaflet_id = null),
        (destinationMap = L.map("destinationMap")),
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(destinationMap);
    const a = [n.latitude, n.longitude],
        o = [t.lat, t.lon];
    L.marker(a).addTo(destinationMap).bindPopup("Your location"), L.marker(o).addTo(destinationMap).bindPopup(t.name);
    const i = L.latLngBounds([a, o]);
    destinationMap.fitBounds(i, { padding: [50, 50] }),
        setTimeout(() => {
            destinationMap.invalidateSize(), destinationMap.fitBounds(i, { padding: [50, 50] });
        }, 300);
}
function calculateDistance(n, t, e, a) {
    const o = degreesToRadians(e - n),
        i = degreesToRadians(a - t),
        c = Math.sin(o / 2) ** 2 + Math.cos(degreesToRadians(n)) * Math.cos(degreesToRadians(e)) * Math.sin(i / 2) ** 2;
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