/*
 * Auckland Explorer
 * Static destination database.
 *
 * Keeping destination data separate from application logic
 * makes the program easier to maintain and expand.
 */
const PLACES = {
attractions: [
        {
            name: "Sky Tower",
            region: "Auckland CBD",
            lat: -36.8485,
            lon: 174.7622,
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
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
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
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
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
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
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
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
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
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
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
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
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
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
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
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
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
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
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
            points: [
                "Central harbour destination.",
                "Walking and public spaces.",
                "Close to major city attractions."
            ],
            info: "Auckland's waterfront provides access to the harbour, public spaces and central attractions.",
            council: "https://www.aucklandnz.com/"
        }
    ]
}
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