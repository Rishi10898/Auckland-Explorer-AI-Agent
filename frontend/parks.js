/*
 * Auckland Explorer
 * Parks destination page.
 *
 * Responsibilities:
 * - Store park information.
 * - Render park cards.
 * - Get user location.
 * - Show a Leaflet map inside a popup.
 * - Calculate straight-line distance.
 * - Send selected park to AI Explorer.
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
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm1B2U8AQ_eUK8ftDxcnwZEpH0BJf6M_r55G30vMzIGQ&s=10",
        points: [
            "One of Auckland's largest and oldest parks.",
            "Home to walking areas and open green spaces.",
            "Close to Auckland Museum and the city centre."
        ],
        info: "A large central Auckland park combining gardens, open spaces and cultural attractions.",
        council: "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Cornwall Park",
        region: "Central Auckland",
        lat: -36.8984,
        lon: 174.7848,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0sOib3-7hZL4PjHgJCET6irk003VzNBbTAl5iuq4fog&s=10",
        points: [
            "Large open green spaces.",
            "Views towards One Tree Hill.",
            "Popular for walking and picnics."
        ],
        info: "Cornwall Park is a major Auckland green space with walking areas and views.",
        council: "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Western Springs Lakeside Park",
        region: "Central Auckland",
        lat: -36.8627,
        lon: 174.7287,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi8BFL59e0NuMssnbogGeYOGih4wfQLnoryk8Wa_C-jQ&s=10",
        points: [
            "Peaceful lakeside environment.",
            "Popular walking routes.",
            "Close to Auckland Zoo and MOTAT."
        ],
        info: "Western Springs is a central Auckland park known for its lake and walking environment.",
        council: "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Albert Park",
        region: "Central Auckland",
        lat: -36.8506,
        lon: 174.7678,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFSBrjWWlN0t6LwtfV387ELnaR0yE_IszyStHeMNj0RA&s=10",
        points: [
            "Historic park near Auckland CBD.",
            "Convenient central location.",
            "Good for a short city walk."
        ],
        info: "Albert Park is a historic green space close to Auckland's city centre.",
        council: "https://www.aucklandcouncil.govt.nz/"
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
            "Beach and green space combined."
        ],
        info: "Long Bay Regional Park combines coastal scenery with open recreational areas.",
        council: "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Ambury Regional Park",
        region: "South Auckland",
        lat: -36.9266,
        lon: 174.7556,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPt6FHBvANq1kGj__3KnQGh72MEYak1Yx7URmdmr3oCw&s=10",
        points: [
            "Large coastal regional park.",
            "Walking and open spaces.",
            "Views across the Manukau Harbour."
        ],
        info: "Ambury Regional Park provides open countryside and coastal walking opportunities.",
        council: "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Shakespear Regional Park",
        region: "North Auckland",
        lat: -36.7000,
        lon: 174.8500,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEh8vHeYCIBa7fjy9mym7npEo5uOWckG0PeP3ScW8saQ&s=10",
        points: [
            "Coastal scenery and walking tracks.",
            "Large open natural environment.",
            "Views across the Hauraki Gulf."
        ],
        info: "Shakespear Regional Park is a coastal destination with natural landscapes and walking tracks.",
        council: "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Waitākere Ranges Regional Park",
        region: "West Auckland",
        lat: -36.9500,
        lon: 174.5000,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV-UJc7RnSBZDF77JUwskks4Y9NBc0u0m2LoRunXVPnA&s=10",
        points: [
            "Native forest landscapes.",
            "Major walking and nature area.",
            "Close to Auckland's west coast."
        ],
        info: "The Waitākere area provides access to some of Auckland's most significant natural landscapes.",
        council: "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Ōtuataua Stonefields Reserve",
        region: "South Auckland",
        lat: -36.9980,
        lon: 174.7860,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFDNY3Aacd9QrZ88TgDomI95PuKtWPCKa7jdOjTLzpwQ&s=10",
        points: [
            "Historic and cultural landscape.",
            "Open walking environment.",
            "Unique volcanic features."
        ],
        info: "Ōtuataua Stonefields is an important Auckland landscape with natural and historical significance.",
        council: "https://www.aucklandcouncil.govt.nz/"
    },

    {
        name: "Tāwharanui Regional Park",
        region: "North Auckland",
        lat: -36.3680,
        lon: 174.8230,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOBdvsZCFhyelTyqAVhy4OnCvrJJ1xx8NpoqU8EG5ewQ&s=10",
        points: [
            "Large natural coastal environment.",
            "Walking and outdoor recreation.",
            "Combination of beach and park landscapes."
        ],
        info: "Tāwharanui is a major regional park combining natural coastal scenery and outdoor recreation.",
        council: "https://www.aucklandcouncil.govt.nz/"
    }

];


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let userLocation = null;

let destinationMap = null;

let userMarker = null;

let placeMarker = null;


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
   RENDER PARK CARDS
   ========================================================= */

function renderPlaces() {

    const grid =
        document.getElementById("placesGrid");


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
                            aria-label="View location for ${place.name}"
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


    const placeName =
        document.getElementById(
            "popupPlaceName"
        );


    const distanceText =
        document.getElementById(
            "popupDistance"
        );


    popup.classList.add(
        "active"
    );


    placeName.textContent =
        place.name;


    distanceText.textContent =
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


        distanceText.textContent =
            `${distance.toFixed(1)} km away from you`;


        document
            .getElementById(
                "googleMapsLink"
            )
            .href =
                `https://www.google.com/maps/dir/${user.latitude},${user.longitude}/${place.lat},${place.lon}`;


        /*
         * Wait for popup to become visible
         * before Leaflet measures its size.
         */

        setTimeout(
            () => {

                openMap(
                    user,
                    place
                );

            },
            250
        );

    }

    catch (error) {

        console.error(
            "Location error:",
            error
        );


        distanceText.textContent =
            "Location could not be accessed. Please allow location permission.";

    }

}


/* =========================================================
   USER GEOLOCATION
   ========================================================= */

function getUserLocation() {

    return new Promise(
        (resolve, reject) => {

            /*
             * Reuse location if we already have it.
             */

            if (userLocation) {

                resolve(
                    userLocation
                );

                return;

            }


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
   LEAFLET MAP
   ========================================================= */

function openMap(
    user,
    place
) {

    /*
     * Create the Leaflet map only once.
     */

    if (!destinationMap) {

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

    }


    /*
     * Remove old markers.
     */

    if (userMarker) {

        destinationMap.removeLayer(
            userMarker
        );

    }


    if (placeMarker) {

        destinationMap.removeLayer(
            placeMarker
        );

    }


    /*
     * Add current user marker.
     */

    userMarker =
        L.marker(

            [

                user.latitude,

                user.longitude

            ]

        )
        .addTo(
            destinationMap
        )
        .bindPopup(
            "Your location"
        );


    /*
     * Add destination marker.
     */

    placeMarker =
        L.marker(

            [

                place.lat,

                place.lon

            ]

        )
        .addTo(
            destinationMap
        )
        .bindPopup(
            place.name
        );


    /*
     * Show both locations.
     */

    const bounds =
        L.latLngBounds(

            [

                [

                    user.latitude,

                    user.longitude

                ],

                [

                    place.lat,

                    place.lon

                ]

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
     * Important because the map exists
     * inside a popup that was previously hidden.
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