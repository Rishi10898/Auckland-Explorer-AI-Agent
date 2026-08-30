/*
 * Auckland Explorer
 * Beaches destination page.
 *
 * Responsibilities:
 * - Store static beach information.
 * - Generate destination cards.
 * - Request the user's location.
 * - Display destination distance on a popup map.
 */


/* =========================================================
   BEACH DATA
   ========================================================= */

const PLACES = [

    {
        name: "Piha Beach",
        region: "West Auckland",
        lat: -36.9530,
        lon: 174.4680,

        image:
            "https://www.newzealand.com/assets/Tourism-NZ/Auckland/img-1536201939-3159-8823-717CA83C-0811-08A9-5BCA19BBB934D606__ExtRewriteWyJqcGciLCJ3ZWJwIl0_aWxvdmVrZWxseQo_FocalPointCropWzExMDAsMzIwMCw0MCw2Niw3NSwid2VicCIsNjUsMi41XQ.webp",

        points: [
            "Iconic black-sand west coast beach.",
            "Popular for coastal scenery and surfing.",
            "Great base for exploring the Waitākere coast."
        ],

        info:
            "Piha is one of Auckland's best-known west coast beaches, surrounded by dramatic coastal scenery.",

        council:
            "https://www.newzealand.com/us/piha/"
    },


    {
        name: "Muriwai Beach",
        region: "West Auckland",
        lat: -36.8320,
        lon: 174.4430,

        image:
            "https://images.unsplash.com/photo-1500534623283-312aade485b7",

        points: [
            "Spectacular black-sand coastline.",
            "Known for dramatic cliffs and coastal views.",
            "Gateway to Muriwai Regional Park."
        ],

        info:
            "Muriwai is a rugged west coast destination with black-sand beaches, trails and coastal viewpoints.",

        council:
            "https://www.aucklandcouncil.govt.nz/en/parks-recreation/find-park-beach/park-detail/220.html"
    },


    {
        name: "Mission Bay",
        region: "Central Auckland",
        lat: -36.8485,
        lon: 174.8300,

        image:
            "https://images.unsplash.com/photo-1500534623283-312aade485b7",

        points: [
            "Easy-to-reach waterfront destination.",
            "Views across the Waitematā Harbour.",
            "Close to cafes, restaurants and shops."
        ],

        info:
            "Mission Bay is a popular Auckland waterfront destination close to the city centre.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },


    {
        name: "Takapuna Beach",
        region: "North Shore",
        lat: -36.7870,
        lon: 174.7730,

        image:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",

        points: [
            "Wide beach on Auckland's North Shore.",
            "Views towards Rangitoto Island.",
            "Close to Takapuna shops and cafes."
        ],

        info:
            "Takapuna Beach combines a large urban beach with views across the Hauraki Gulf.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },


    {
        name: "Long Bay",
        region: "North Auckland",
        lat: -36.6780,
        lon: 174.7490,

        image:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",

        points: [
            "Large sandy beach.",
            "Popular for walking and recreation.",
            "Part of Long Bay Regional Park."
        ],

        info:
            "Long Bay provides a large coastal recreation area north of Auckland.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },


    {
        name: "Karekare Beach",
        region: "West Auckland",
        lat: -36.9990,
        lon: 174.5520,

        image:
            "https://images.unsplash.com/photo-1500534623283-312aade485b7",

        points: [
            "Dramatic west coast landscape.",
            "Black-sand beach and surrounding bush.",
            "A quieter alternative to Piha."
        ],

        info:
            "Karekare is a dramatic west coast destination within the Waitākere Ranges.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },


    {
        name: "Bethells Beach",
        region: "West Auckland",
        lat: -36.8580,
        lon: 174.4650,

        image:
            "https://images.unsplash.com/photo-1500534623283-312aade485b7",

        points: [
            "Beautiful black-sand beach.",
            "Strong west coast scenery.",
            "Popular for walks and coastal exploration."
        ],

        info:
            "Bethells Beach is a scenic west coast destination surrounded by native landscape.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },


    {
        name: "Orewa Beach",
        region: "North Auckland",
        lat: -36.5860,
        lon: 174.6890,

        image:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",

        points: [
            "Long sandy coastline.",
            "Popular for walking and cycling.",
            "Close to Orewa town centre."
        ],

        info:
            "Orewa Beach provides an accessible coastal destination north of Auckland.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },


    {
        name: "Cornwallis Beach",
        region: "West Auckland",
        lat: -36.9970,
        lon: 174.6350,

        image:
            "https://images.unsplash.com/photo-1500534623283-312aade485b7",

        points: [
            "Sheltered Manukau Harbour setting.",
            "Good for picnics and swimming.",
            "Historic Cornwallis Wharf nearby."
        ],

        info:
            "Cornwallis is a popular family-oriented spot on the Manukau Harbour.",

        council:
            "https://www.aucklandcouncil.govt.nz/en/parks-recreation/find-park-beach/park-detail/210.html"
    },


    {
        name: "Maraetai Beach",
        region: "East Auckland",
        lat: -36.8850,
        lon: 175.0400,

        image:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",

        points: [
            "Eastern Auckland coastal destination.",
            "Views across the Hauraki Gulf.",
            "Popular for relaxed waterfront visits."
        ],

        info:
            "Maraetai is a coastal destination in east Auckland with views across the Hauraki Gulf.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    }

];


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let userLocation = null;

let destinationMap = null;


/* =========================================================
   PAGE STARTUP
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderPlaces();

        setupPopup();

    }
);


/* =========================================================
   RENDER CARDS
   ========================================================= */

function renderPlaces() {

    const grid =
        document.getElementById("placesGrid");

    if (!grid) return;


    grid.innerHTML =
        PLACES.map(
            (place, index) => `

            <article class="card place-card">

                <img
                    class="place-image"
                    src="${place.image}"
                    alt="${place.name}"
                    loading="lazy"
                >

                <p class="place-region">
                    ${place.region}
                </p>

                <h2>
                    ${place.name}
                </h2>

                <p class="place-description">
                    ${place.info}
                </p>

                <ul class="place-points">

                    ${place.points
                        .map(
                            point =>
                                `<li>${point}</li>`
                        )
                        .join("")
                    }

                </ul>


                <div class="place-actions">

                    <button
                        class="btn btn-secondary"
                        type="button"
                        onclick="showLocation(${index})"
                    >
                        📍 View location
                    </button>


                    <a
                        class="btn btn-secondary"
                        href="${place.council}"
                        target="_blank"
                        rel="noopener"
                    >
                        More information →
                    </a>

                </div>


                <button
                    class="ask-ai-button"
                    type="button"
                    onclick='askAI(${JSON.stringify(place.name)})'
                >
                    ✨ Ask AI about this place
                </button>

            </article>

        `
        )
        .join("");

}


/* =========================================================
   POPUP SETUP
   ========================================================= */

function setupPopup() {

    const popup =
        document.getElementById("locationPopup");

    const closeButton =
        document.getElementById(
            "closeLocationPopup"
        );


    closeButton?.addEventListener(
        "click",
        closeLocationPopup
    );


    popup?.addEventListener(
        "click",
        event => {

            if (
                event.target === popup
            ) {

                closeLocationPopup();

            }

        }
    );

}


function closeLocationPopup() {

    document
        .getElementById(
            "locationPopup"
        )
        ?.classList.remove(
            "active"
        );

}


/* =========================================================
   SHOW DESTINATION LOCATION
   ========================================================= */

function showLocation(index) {

    const place =
        PLACES[index];


    document
        .getElementById(
            "locationPopup"
        )
        ?.classList.add(
            "active"
        );


    document
        .getElementById(
            "popupPlaceName"
        )
        .textContent =
            place.name;


    document
        .getElementById(
            "popupDistance"
        )
        .textContent =
            "Getting your location...";


    getUserLocation(
        () => {

            const distance =
                calculateDistance(

                    userLocation.latitude,
                    userLocation.longitude,

                    place.lat,
                    place.lon

                );


            document
                .getElementById(
                    "popupDistance"
                )
                .textContent =
                    `Approximately ${distance.toFixed(1)} km from your location.`;


            createMap(place);

        }
    );

}


/* =========================================================
   USER GEOLOCATION
   ========================================================= */

function getUserLocation(callback) {

    if (userLocation) {

        callback();

        return;

    }


    if (!navigator.geolocation) {

        userLocation = {
            latitude: -36.8485,
            longitude: 174.7633
        };

        callback();

        return;

    }


    navigator.geolocation.getCurrentPosition(

        position => {

            userLocation = {

                latitude:
                    position.coords.latitude,

                longitude:
                    position.coords.longitude

            };

            callback();

        },


        () => {

            userLocation = {
                latitude: -36.8485,
                longitude: 174.7633
            };

            callback();

        },


        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }

    );

}


/* =========================================================
   CREATE MAP
   ========================================================= */

function createMap(place) {

    if (destinationMap) {

        destinationMap.remove();

    }


    destinationMap =
        L.map(
            "destinationMap"
        );


    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }

    ).addTo(
        destinationMap
    );


    const user = [

        userLocation.latitude,

        userLocation.longitude

    ];


    const destination = [

        place.lat,

        place.lon

    ];


    L.marker(user)
        .addTo(destinationMap)
        .bindPopup(
            "Your location"
        );


    L.marker(destination)
        .addTo(destinationMap)
        .bindPopup(
            place.name
        );


    const bounds =
        L.latLngBounds(
            user,
            destination
        );


    destinationMap.fitBounds(
        bounds,
        {
            padding: [50, 50]
        }
    );


    setTimeout(
        () => {

            destinationMap.invalidateSize();

        },
        150
    );

}


/* =========================================================
   DISTANCE CALCULATION
   ========================================================= */

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const radius =
        6371;


    const latitudeDifference =
        degreesToRadians(
            lat2 - lat1
        );


    const longitudeDifference =
        degreesToRadians(
            lon2 - lon1
        );


    const calculation =

        Math.sin(
            latitudeDifference / 2
        ) ** 2

        +

        Math.cos(
            degreesToRadians(lat1)
        )

        *

        Math.cos(
            degreesToRadians(lat2)
        )

        *

        Math.sin(
            longitudeDifference / 2
        ) ** 2;


    return

        radius

        *

        2

        *

        Math.atan2(

            Math.sqrt(calculation),

            Math.sqrt(
                1 - calculation
            )

        );

}


function degreesToRadians(
    degrees
) {

    return (
        degrees * Math.PI / 180
    );

}


/* =========================================================
   ASK AI
   ========================================================= */

function askAI(placeName) {

    window.location.href =
        `chat.html?place=${encodeURIComponent(
            placeName
        )}`;

}