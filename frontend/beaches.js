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
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHk8MzDG2yRJ-zmg-l4KvyccFuQyFdqaBgOUZp3i3SNw&s=10",

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
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZjtNU8WdZuFpceip9oZMUg4hFChi4WudjfBDatCEnFg&s=10",

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
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR1Obvd4T0fdbe1pDGXihL43mV2wR4ZY0qhYPvlKfszQ&s=10",

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
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsk4gvcmY4GYGbX_oUtimwJmOcFUmPrF34hIRXtTA1Lg&s=10",

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
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSisE4OjTzqmc5roO9QdCgwNXsChR8Qh6tBN8MgZ1ayXQ&s=10",

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
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI27tDomzXECZrAdxh2YBf_9kUrg8bOzRbxXSoOg0Xgw&s=10",

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
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1hmvQV_oJ_FzLMOJSQ9m4aFdNXblWHjfNZFFJ7RVWVA&s=10",

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
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv3p66f8U5E2ViNvclpmVgIAWVwmgYaqLgXMyeNRpW1A&s=10",

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
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2EBO1ULK0zf7umYaNye3rXvq-0Ac_LcHzDLL6W7B4WQ&s=10",

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
        document.getElementById(
            "placesGrid"
        );


    if (!grid) {

        console.error(
            "placesGrid was not found."
        );

        return;

    }


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


                <div class="place-content">


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


                        <!-- MORE INFORMATION -->

                        <a
                            class="btn btn-secondary"
                            href="${place.council}"
                            target="_blank"
                            rel="noopener"
                        >
                            More information →
                        </a>


                        <!-- CIRCULAR MAP BUTTON -->

                        <button
                            class="location-circle"
                            type="button"
                            onclick="showLocation(${index})"
                            title="View location and distance"
                            aria-label="View location"
                        >
                            📍
                        </button>


                    </div>


                    <!-- ASK AI -->

                    <button
                        class="ask-ai-button"
                        type="button"
                        onclick='askAI(${JSON.stringify(place.name)})'
                    >
                        ✨ Ask AI about this place
                    </button>


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
        document.getElementById(
            "locationPopup"
        );


    const closeButton =
        document.getElementById(
            "closeLocationPopup"
        );


    closeButton?.addEventListener(

        "click",

        () => {

            closeLocationPopup();

        }

    );


    /* Close when clicking outside the popup card */

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


/* =========================================================
   CLOSE POPUP
========================================================= */

function closeLocationPopup() {

    const popup =
        document.getElementById(
            "locationPopup"
        );


    popup?.classList.remove(
        "active"
    );


    /*
     * Remove the Leaflet map.
     *
     * This prevents the "Map container is already initialized"
     * error when another destination is opened.
     */

    if (destinationMap) {

        destinationMap.remove();

        destinationMap = null;

    }

}


/* =========================================================
   SHOW DESTINATION LOCATION
========================================================= */

function showLocation(index) {

    const place =
        PLACES[index];


    if (!place) {

        console.error(
            "Destination not found:",
            index
        );

        return;

    }


    const popup =
        document.getElementById(
            "locationPopup"
        );


    /* Open popup FIRST */

    popup?.classList.add(
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


    /*
     * Get location and then create the map.
     */

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


            /*
             * Update Google Maps directions.
             */

            document
                .getElementById(
                    "googleMapsLink"
                )
                .href =
                    `https://www.google.com/maps/dir/` +
                    `${userLocation.latitude},${userLocation.longitude}/` +
                    `${place.lat},${place.lon}`;


            /*
             * Wait until the popup is visible.
             *
             * This is important for Leaflet.
             */

            setTimeout(

                () => {

                    createMap(
                        place
                    );

                },

                100

            );

        }

    );

}


/* =========================================================
   USER GEOLOCATION
========================================================= */

function getUserLocation(callback) {

    /*
     * Use existing location if already obtained.
     */

    if (userLocation) {

        callback();

        return;

    }


    /*
     * Fallback if geolocation is unsupported.
     */

    if (!navigator.geolocation) {

        userLocation = {

            latitude:
                -36.8485,

            longitude:
                174.7633

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


        error => {

            console.warn(
                "Location unavailable:",
                error
            );


            /*
             * Auckland CBD fallback.
             *
             * This means the map will still work
             * if the user denies location permission.
             */

            userLocation = {

                latitude:
                    -36.8485,

                longitude:
                    174.7633

            };


            callback();

        },


        {

            enableHighAccuracy:
                true,

            timeout:
                10000,

            maximumAge:
                300000

        }

    );

}


/* =========================================================
   CREATE MAP
========================================================= */

function createMap(place) {

    const mapElement =
        document.getElementById(
            "destinationMap"
        );


    if (!mapElement) {

        console.error(
            "destinationMap element not found."
        );

        return;

    }


    /*
     * Remove an old map if one exists.
     */

    if (destinationMap) {

        destinationMap.remove();

        destinationMap = null;

    }


    /*
     * Clear Leaflet's previous internal map ID.
     *
     * This helps prevent container initialisation issues.
     */

    mapElement.innerHTML =
        "";


    /*
     * Create map.
     */

    destinationMap =
        L.map(
            "destinationMap"
        );


    /*
     * OpenStreetMap tiles.
     */

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom:
                19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }

    ).addTo(
        destinationMap
    );


    /*
     * Coordinates.
     */

    const user = [

        userLocation.latitude,

        userLocation.longitude

    ];


    const destination = [

        place.lat,

        place.lon

    ];


    /*
     * User marker.
     */

    L.marker(
        user
    )

        .addTo(
            destinationMap
        )

        .bindPopup(
            "Your location"
        );


    /*
     * Destination marker.
     */

    L.marker(
        destination
    )

        .addTo(
            destinationMap
        )

        .bindPopup(
            place.name
        );


    /*
     * Fit both markers inside the map.
     */

    const bounds =
        L.latLngBounds(

            [

                user,

                destination

            ]

        );


    destinationMap.fitBounds(

        bounds,

        {

            padding:
                [50, 50]

        }

    );


    /*
     * VERY IMPORTANT:
     *
     * Leaflet needs to recalculate its dimensions
     * after being placed inside a popup/modal.
     */

    setTimeout(

        () => {

            destinationMap.invalidateSize();

            destinationMap.fitBounds(

                bounds,

                {

                    padding:
                        [50, 50]

                }

            );

        },

        250

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

    const earthRadius =
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
            degreesToRadians(
                lat1
            )
        )

        *

        Math.cos(
            degreesToRadians(
                lat2
            )
        )

        *

        Math.sin(
            longitudeDifference / 2
        ) ** 2;


    const centralAngle =

        2

        *

        Math.atan2(

            Math.sqrt(
                calculation
            ),

            Math.sqrt(
                1 - calculation
            )

        );


    return (
        earthRadius
        *
        centralAngle
    );

}


/* =========================================================
   DEGREES → RADIANS
========================================================= */

function degreesToRadians(degrees) {

    return (

        degrees
        *
        Math.PI
        /
        180

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