/*
 * Auckland Explorer
 * Static destination database.
 *
 * Keeping destination data separate from application logic
 * makes the program easier to maintain and expand.
 */

const PLACES = {

    beaches: [
        {
            name: "Piha Beach",
            region: "West Auckland",
            lat: -36.9530,
            lon: 174.4680,
            image: "https://www.newzealand.com/assets/Tourism-NZ/Auckland/img-1536201939-3159-8823-717CA83C-0811-08A9-5BCA19BBB934D606__ExtRewriteWyJqcGciLCJ3ZWJwIl0_aWxvdmVrZWxseQo_FocalPointCropWzExMDAsMzIwMCw0MCw2Niw3NSwid2VicCIsNjUsMi41XQ.webp",
            points: [
                "Iconic black-sand west coast beach.",
                "Popular for coastal scenery and surfing.",
                "Great base for exploring the Waitākere coast."
            ],
            info: "Piha is one of Auckland's best-known west coast beaches, surrounded by dramatic coastal scenery.",
            council_1: "https://www.aucklandcouncil.govt.nz/",
            council_2 : "https://www.newzealand.com/us/piha/"
        },

        {
            name: "Muriwai Beach",
            region: "West Auckland",
            lat: -36.8320,
            lon: 174.4430,
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAIDorfNLW-ik365DmCJfYGJ7TN3Obxxk7anBNxpahtA&s=10",
            points: [
                "Spectacular black-sand coastline.",
                "Known for dramatic cliffs and coastal views.",
                "Gateway to Muriwai Regional Park."
            ],
            info: "Muriwai is a rugged west coast destination with black-sand beaches, trails and coastal viewpoints.",
            council: "https://www.aucklandcouncil.govt.nz/en/parks-recreation/find-park-beach/park-detail/220.html"
        },

        {
            name: "Mission Bay",
            region: "Central Auckland",
            lat: -36.8485,
            lon: 174.8300,
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
            points: [
                "Easy-to-reach waterfront destination.",
                "Views across the Waitematā Harbour.",
                "Close to cafes, restaurants and shops."
            ],
            info: "Mission Bay is a popular Auckland waterfront destination close to the city centre.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Takapuna Beach",
            region: "North Shore",
            lat: -36.7870,
            lon: 174.7730,
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            points: [
                "Wide beach on Auckland's North Shore.",
                "Views towards Rangitoto Island.",
                "Close to Takapuna shops and cafes."
            ],
            info: "Takapuna Beach combines a large urban beach with views across the Hauraki Gulf.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Long Bay",
            region: "North Auckland",
            lat: -36.6780,
            lon: 174.7490,
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            points: [
                "Large sandy beach.",
                "Popular for walking and recreation.",
                "Part of Long Bay Regional Park."
            ],
            info: "Long Bay provides a large coastal recreation area north of Auckland.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Karekare Beach",
            region: "West Auckland",
            lat: -36.9990,
            lon: 174.5520,
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
            points: [
                "Dramatic west coast landscape.",
                "Black-sand beach and surrounding bush.",
                "A quieter alternative to Piha."
            ],
            info: "Karekare is a dramatic west coast destination within the Waitākere Ranges.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Bethells Beach",
            region: "West Auckland",
            lat: -36.8580,
            lon: 174.4650,
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
            points: [
                "Beautiful black-sand beach.",
                "Strong west coast scenery.",
                "Popular for walks and coastal exploration."
            ],
            info: "Bethells Beach is a scenic west coast destination surrounded by native landscape.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Orewa Beach",
            region: "North Auckland",
            lat: -36.5860,
            lon: 174.6890,
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            points: [
                "Long sandy coastline.",
                "Popular for walking and cycling.",
                "Close to Orewa town centre."
            ],
            info: "Orewa Beach provides an accessible coastal destination north of Auckland.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Cornwallis Beach",
            region: "West Auckland",
            lat: -36.9970,
            lon: 174.6350,
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
            points: [
                "Sheltered Manukau Harbour setting.",
                "Good for picnics and swimming.",
                "Historic Cornwallis Wharf nearby."
            ],
            info: "Cornwallis is a popular family-oriented spot on the Manukau Harbour.",
            council: "https://www.aucklandcouncil.govt.nz/en/parks-recreation/find-park-beach/park-detail/210.html"
        },

        {
            name: "Maraetai Beach",
            region: "East Auckland",
            lat: -36.8850,
            lon: 175.0400,
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            points: [
                "Eastern Auckland coastal destination.",
                "Views across the Hauraki Gulf.",
                "Popular for relaxed waterfront visits."
            ],
            info: "Maraetai is a coastal destination in east Auckland with views across the Hauraki Gulf.",
            council: "https://www.aucklandcouncil.govt.nz/"
        }
    ]
}
// ============================================================
// BEACH PAGE CONTROLLER
// Renders destination data and handles location interactions.
// ============================================================


let userLocation = null;
let destinationMap = null;
let mapMarkers = [];


// Run after the HTML page has loaded.
document.addEventListener(
    "DOMContentLoaded",
    renderBeaches
);


// Create one card for every beach in the data array.
function renderBeaches() {

    const grid =
        document.getElementById("placesGrid");


    if (!grid) {

        console.error(
            "placesGrid was not found in beaches.html"
        );

        return;

    }


    grid.innerHTML =
        PLACES.beaches
            .map(
                (place, index) => `
                
                <article class="place-card">

                    <img
                        class="place-image"
                        src="${place.image}"
                        alt="${place.name}"
                        loading="lazy"
                    >

                    <div class="place-content">

                        <span class="place-region">
                            ${place.region}
                        </span>


                        <h2>
                            ${place.name}
                        </h2>


                        <p class="place-description">
                            ${place.info}
                        </p>


                        <ul class="place-points">

                            ${place.points
                                .map(
                                    point => `
                                        <li>
                                            ${point}
                                        </li>
                                    `
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
                                More information ↗
                            </a>


                            <button
                                class="location-circle"
                                type="button"
                                onclick="showLocation(${index})"
                                title="View location"
                            >
                                📍
                            </button>

                        </div>


                        <button
                            class="ask-ai-button"
                            type="button"
                            onclick="askAI('${place.name}')"
                        >
                            ✨ Ask AI about this place
                        </button>

                    </div>

                </article>

                `
            )
            .join("");

}


// Gets the user's current position.
function getUserLocation() {

    return new Promise(
        (resolve, reject) => {

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


            navigator.geolocation
                .getCurrentPosition(

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

                        reject(error);

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


// Opens the map popup for the selected beach.
async function showLocation(index) {

    const place =
        PLACES.beaches[index];


    const modal =
        document.getElementById(
            "locationModal"
        );


    const title =
        document.getElementById(
            "mapPlaceName"
        );


    const distanceText =
        document.getElementById(
            "mapDistance"
        );


    modal.classList.add(
        "open"
    );


    title.textContent =
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


        openMap(
            user,
            place
        );


        document
            .getElementById(
                "googleMapsLink"
            )
            .href =
                `https://www.google.com/maps/dir/${user.latitude},${user.longitude}/${place.lat},${place.lon}`;


    }

    catch (error) {

        console.error(
            error
        );


        distanceText.textContent =
            "Location could not be accessed. Please allow location permission.";

    }

}


// Creates the Leaflet map.
function openMap(
    user,
    place
) {

    if (
        !destinationMap
    ) {

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


    mapMarkers.forEach(
        marker =>
            destinationMap.removeLayer(
                marker
            )
    );


    mapMarkers = [];


    const userMarker =
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


    const placeMarker =
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


    mapMarkers.push(

        userMarker,

        placeMarker

    );


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
                [40, 40]

        }
    );


    // Required because Leaflet is created inside a hidden modal.
    setTimeout(

        () =>
            destinationMap.invalidateSize(),

        200

    );

}


// Calculates straight-line distance using coordinates.
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


// Converts degrees into radians for the distance formula.
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
// Opens the AI chat with the destination already entered.
function askAI(
    placeName
) {

    window.location.href =
        `chat.html?place=${encodeURIComponent(
            placeName
        )}`;

}