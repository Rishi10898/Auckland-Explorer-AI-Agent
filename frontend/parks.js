/*
 * Auckland Explorer
 * Parks destination page.
 *
 * Responsibilities:
 * - Store static park information.
 * - Generate destination cards.
 * - Request the user's location.
 * - Display destination distance on a popup map.
 */


/* =========================================================
   PARK DATA
   ========================================================= */

const PLACES = [

    {
        name: "Auckland Domain",
        region: "Central Auckland",
        lat: -36.8606,
        lon: 174.7785,
        image:
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",

        points: [
            "One of Auckland's largest and oldest parks.",
            "Home to walking areas and open green spaces.",
            "Close to Auckland Museum and the city centre."
        ],

        info:
            "A large central Auckland park combining gardens, open spaces and cultural attractions.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Cornwall Park",
        region: "Central Auckland",
        lat: -36.8984,
        lon: 174.7848,
        image:
            "https://images.unsplash.com/photo-1472396961693-142e6e269027",

        points: [
            "Large open green spaces.",
            "Views towards One Tree Hill.",
            "Popular for walking and picnics."
        ],

        info:
            "Cornwall Park is a major Auckland green space with walking areas and views.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Western Springs",
        region: "Central Auckland",
        lat: -36.8627,
        lon: 174.7287,
        image:
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",

        points: [
            "Peaceful lakeside environment.",
            "Popular walking routes.",
            "Close to Auckland Zoo and MOTAT."
        ],

        info:
            "Western Springs is a central Auckland park known for its lake and walking environment.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Albert Park",
        region: "Central Auckland",
        lat: -36.8506,
        lon: 174.7678,
        image:
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",

        points: [
            "Historic park near Auckland CBD.",
            "Convenient central location.",
            "Good for a short city walk."
        ],

        info:
            "Albert Park is a historic green space close to Auckland's city centre.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Long Bay Regional Park",
        region: "North Auckland",
        lat: -36.6767,
        lon: 174.7467,
        image:
            "https://images.unsplash.com/photo-1473448912268-2022ce9509d8",

        points: [
            "Large coastal recreation area.",
            "Walking and picnic opportunities.",
            "Beach and green space combined."
        ],

        info:
            "Long Bay Regional Park combines coastal scenery with open recreational areas.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Ambury Regional Park",
        region: "South Auckland",
        lat: -36.9266,
        lon: 174.7556,
        image:
            "https://images.unsplash.com/photo-1472396961693-142e6e269027",

        points: [
            "Large coastal regional park.",
            "Walking and open spaces.",
            "Views across the Manukau Harbour."
        ],

        info:
            "Ambury Regional Park provides open countryside and coastal walking opportunities.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Shakespear Regional Park",
        region: "North Auckland",
        lat: -36.7000,
        lon: 174.8500,
        image:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",

        points: [
            "Coastal scenery and walking tracks.",
            "Large open natural environment.",
            "Views across the Hauraki Gulf."
        ],

        info:
            "Shakespear Regional Park is a coastal destination with natural landscapes and walking tracks.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Waitākere Ranges",
        region: "West Auckland",
        lat: -36.9500,
        lon: 174.5000,
        image:
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",

        points: [
            "Native forest landscapes.",
            "Major walking and nature area.",
            "Close to Auckland's west coast."
        ],

        info:
            "The Waitākere area provides access to some of Auckland's most significant natural landscapes.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Ōtuataua Stonefields",
        region: "South Auckland",
        lat: -36.9980,
        lon: 174.7860,
        image:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",

        points: [
            "Historic and cultural landscape.",
            "Open walking environment.",
            "Unique volcanic features."
        ],

        info:
            "Ōtuataua Stonefields is an important Auckland landscape with natural and historical significance.",

        council:
            "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Tāwharanui Regional Park",
        region: "North Auckland",
        lat: -36.3680,
        lon: 174.8230,
        image:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",

        points: [
            "Large natural coastal environment.",
            "Walking and outdoor recreation.",
            "Combination of beach and park landscapes."
        ],

        info:
            "Tāwharanui is a major regional park combining natural coastal scenery and outdoor recreation.",

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
                >

                <p class="place-region">
                    ${place.region}
                </p>

                <h2>
                    ${place.name}
                </h2>

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
        document.getElementById("closeLocationPopup");


    closeButton?.addEventListener(
        "click",
        closeLocationPopup
    );


    popup?.addEventListener(
        "click",
        event => {

            if (event.target === popup) {

                closeLocationPopup();

            }

        }
    );

}


function closeLocationPopup() {

    document
        .getElementById("locationPopup")
        ?.classList.remove("active");

}


/* =========================================================
   SHOW DESTINATION LOCATION
   ========================================================= */

function showLocation(index) {

    const place =
        PLACES[index];


    document
        .getElementById("locationPopup")
        ?.classList.add("active");


    document
        .getElementById("popupPlaceName")
        .textContent =
            place.name;


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
                .getElementById("popupDistance")
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
        L.map("destinationMap");


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(destinationMap);


    const user =
        [
            userLocation.latitude,
            userLocation.longitude
        ];


    const destination =
        [
            place.lat,
            place.lon
        ];


    L.marker(user)
        .addTo(destinationMap)
        .bindPopup("Your location");


    L.marker(destination)
        .addTo(destinationMap)
        .bindPopup(place.name);


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
        100
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
            Math.sqrt(1 - calculation)
        );

}


function degreesToRadians(
    degrees
) {

    return degrees * Math.PI / 180;

}