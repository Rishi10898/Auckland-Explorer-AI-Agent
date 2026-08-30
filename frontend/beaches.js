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
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            points: [
                "Iconic black-sand west coast beach.",
                "Popular for coastal scenery and surfing.",
                "Great base for exploring the Waitākere coast."
            ],
            info: "Piha is one of Auckland's best-known west coast beaches, surrounded by dramatic coastal scenery.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Muriwai Beach",
            region: "West Auckland",
            lat: -36.8320,
            lon: 174.4430,
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
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
// Application state
let userLocation = null;
let destinationMap = null;
// Render beach cards
function renderBeaches() {

}
// Request location
function getUserLocation() {

}
// Calculate distance
function calculateDistance() {

}
// Open location popup
function showLocation() {

}
// Open AI Explorer
function askAI() {

}