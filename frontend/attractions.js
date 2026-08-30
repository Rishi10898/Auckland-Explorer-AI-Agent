/*
 * Auckland Explorer
 * Attractions destination page.
 *
 * Responsibilities:
 * - Store attraction data.
 * - Render attraction cards.
 * - Get user location.
 * - Display destination and user on a Leaflet map.
 * - Calculate straight-line distance.
 * - Send destination to AI Explorer.
 */


/* =========================================================
   ATTRACTION DATA
   ========================================================= */

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
            "Located in the heart of Auckland CBD."
        ],
        info: "The Sky Tower is one of Auckland's defining landmarks and offers extensive views of the city.",
        council: "https://www.aucklandnz.com/"
    },

    {
        name: "Auckland War Memorial Museum",
        region: "Auckland Domain",
        lat: -36.8600,
        lon: 174.7760,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe59iDy5w_ExZpaN48WSBlKDSGrk8Rt3hFaTIU8-Txfg&s=10",
        points: [
            "Major cultural institution.",
            "Located inside Auckland Domain.",
            "Extensive natural and cultural collections."
        ],
        info: "Auckland Museum is a major cultural and natural-history institution in the Auckland Domain.",
        council: "https://www.aucklandmuseum.com/"
    },

    {
        name: "Auckland Art Gallery",
        region: "Auckland CBD",
        lat: -36.8520,
        lon: 174.7650,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcGwHQ-AgnEc3t3ROiJWqE5YAqtqbc1jud_hMUoo9ENQ&s=10",
        points: [
            "Major art collection.",
            "Central city location.",
            "Historic and modern architecture."
        ],
        info: "Auckland Art Gallery is a major public art gallery in the city centre.",
        council: "https://www.aucklandartgallery.com/"
    },

    {
        name: "Wynyard Quarter",
        region: "Auckland CBD",
        lat: -36.8410,
        lon: 174.7550,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtoJG5Q_-7YRXyWQymiOv0En2RX4hrujxqUcn4yK_B3A&s=10",
        points: [
            "Waterfront destination.",
            "Restaurants, public spaces and events.",
            "Easy walk from the CBD."
        ],
        info: "Wynyard Quarter is a regenerated waterfront precinct with public spaces and dining.",
        council: "https://www.aucklandnz.com/"
    },

    {
        name: "Viaduct Harbour",
        region: "Auckland CBD",
        lat: -36.8440,
        lon: 174.7620,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTf5QDtpN4bwf1cfA4ObxEWs7DxoDaQdCHnRCZFW0eyg&s=10",
        points: [
            "Iconic Auckland waterfront.",
            "Restaurants and public spaces.",
            "Close to the city centre."
        ],
        info: "Viaduct Harbour is a central Auckland waterfront precinct.",
        council: "https://www.aucklandnz.com/"
    },

    {
        name: "Auckland Zoo",
        region: "Western Springs",
        lat: -36.8640,
        lon: 174.7190,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5QCP8uo1okcCLMEA7GQ3p8qhVs2NgQxL89I7jQ0ME8g&s=10",
        points: [
            "Major Auckland wildlife attraction.",
            "Located beside Western Springs.",
            "Large collection of animals and habitats."
        ],
        info: "Auckland Zoo is a major wildlife attraction near Western Springs.",
        council: "https://www.aucklandzoo.co.nz/"
    },

    {
        name: "MOTAT",
        region: "Western Springs",
        lat: -36.8670,
        lon: 174.7130,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX4JopYlYngdPeMdPCqUbiiJ5JHAY-izt1O9Ho-14veQ&s=10",
        points: [
            "Transport and technology museum.",
            "Interactive exhibits.",
            "Close to Auckland Zoo."
        ],
        info: "MOTAT explores New Zealand's transport, technology and innovation history.",
        council: "https://www.motat.nz/"
    },

    {
        name: "Devonport",
        region: "North Shore",
        lat: -36.8310,
        lon: 174.7960,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjccJurp7SgEud4b4AXYSr57BIBCp7zpw-RFuByfsKNQ&s=10",
        points: [
            "Historic waterfront suburb.",
            "Views across Auckland Harbour.",
            "Easy ferry trip from downtown."
        ],
        info: "Devonport combines heritage streets, waterfront scenery and views across the Waitematā Harbour.",
        council: "https://www.aucklandnz.com/"
    },

    {
        name: "One Tree Hill",
        region: "Central Auckland",
        lat: -36.9010,
        lon: 174.7830,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPRotAQmkMDRWXzH-21FG6e5PkVypeuaFn8vGjNx8P4A&s=10",
        points: [
            "Iconic Auckland landmark.",
            "Excellent panoramic views.",
            "Located beside Cornwall Park."
        ],
        info: "One Tree Hill / Maungakiekie is an iconic volcanic landmark and cultural landscape.",
        council: "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Auckland Waterfront",
        region: "Auckland CBD",
        lat: -36.8440,
        lon: 174.7600,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiMj-6S6TXz8rf0b6ZhL18dwkr7w__iIjGSL2KM0OdaQ&s=10",
        points: [
            "Central harbour destination.",
            "Walking and public spaces.",
            "Close to major city attractions."
        ],
        info: "Auckland's waterfront provides access to the harbour, public spaces and central attractions.",
        council: "https://www.aucklandnz.com/"
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
   RENDER DESTINATION CARDS
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


                <div class="place-card-content">

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


                        <a
                            class="btn btn-secondary"
                            href="${place.council}"
                            target="_blank"
                            rel="noopener"
                        >
                            More information →
                        </a>


                        <button
                            class="location-circle"
                            type="button"
                            onclick="showLocation(${index})"
                            title="View location"
                            aria-label="View ${place.name} location"
                        >
                            📍
                        </button>


                    </div>


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
   POPUP CONTROLS
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

}


/* =========================================================
   SHOW LOCATION
   ========================================================= */

async function showLocation(index) {

    const place =
        PLACES[index];


    const popup =
        document.getElementById(
            "locationPopup"
        );


    popup.classList.add(
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


    try {

        const user =
            await getUserLocation();


        const distance =
            calculateDistance(

                user.latitude,
                user.longitude,

                place.lat,
                place.lon

            );


        document
            .getElementById(
                "popupDistance"
            )
            .textContent =
                `Approximately ${distance.toFixed(1)} km from your location.`;


        document
            .getElementById(
                "googleMapsLink"
            )
            .href =
                `https://www.google.com/maps/dir/${user.latitude},${user.longitude}/${place.lat},${place.lon}`;


        /*
         * Wait for the popup to become visible
         * before creating the Leaflet map.
         */

        setTimeout(

            () => {

                createMap(
                    user,
                    place
                );

            },

            200

        );

    }

    catch (error) {

        console.error(
            "Location error:",
            error
        );


        document
            .getElementById(
                "popupDistance"
            )
            .textContent =
                "Unable to access your location.";

    }

}


/* =========================================================
   GET USER LOCATION
   ========================================================= */

function getUserLocation() {

    return new Promise(

        (resolve, reject) => {

            /*
             * Use cached location if available.
             */

            if (userLocation) {

                resolve(
                    userLocation
                );

                return;

            }


            /*
             * Check browser support.
             */

            if (
                !navigator.geolocation
            ) {

                reject(
                    new Error(
                        "Geolocation is not supported."
                    )
                );

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


                    resolve(
                        userLocation
                    );

                },


                error => {

                    console.error(
                        "Geolocation error:",
                        error
                    );


                    reject(
                        error
                    );

                },


                {

                    enableHighAccuracy: true,

                    timeout: 10000,

                    maximumAge: 300000

                }

            );

        }

    );

}


/* =========================================================
   CREATE MAP
   ========================================================= */

function createMap(
    user,
    place
) {

    const mapContainer =
        document.getElementById(
            "destinationMap"
        );


    /*
     * Completely destroy the old map.
     */

    if (destinationMap) {

        destinationMap.remove();

        destinationMap =
            null;

    }


    /*
     * IMPORTANT:
     * Remove Leaflet's previous container ID.
     */

    mapContainer.innerHTML =
        "";


    mapContainer._leaflet_id =
        null;


    /*
     * Create a fresh Leaflet map.
     */

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

    )
    .addTo(
        destinationMap
    );


    const userCoordinates = [

        user.latitude,

        user.longitude

    ];


    const destinationCoordinates = [

        place.lat,

        place.lon

    ];


    /*
     * User marker.
     */

    L.marker(
        userCoordinates
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
        destinationCoordinates
    )
    .addTo(
        destinationMap
    )
    .bindPopup(
        place.name
    );


    /*
     * Show both markers.
     */

    const bounds =
        L.latLngBounds(

            [

                userCoordinates,

                destinationCoordinates

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
     * Critical fix for Leaflet inside a modal.
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

        300

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
        radius
        *
        centralAngle
    );

}


/* =========================================================
   DEGREES TO RADIANS
   ========================================================= */

function degreesToRadians(
    degrees
) {

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

function askAI(
    placeName
) {

    window.location.href =

        `chat.html?place=${encodeURIComponent(
            placeName
        )}`;

}