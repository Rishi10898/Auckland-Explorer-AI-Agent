/*
 * Auckland Explorer
 * Static destination database.
 *
 * Keeping destination data separate from application logic
 * makes the program easier to maintain and expand.
 */
const PLACES = {
    parks: [
        {
            name: "Cornwall Park",
            region: "Central Auckland",
            lat: -36.9000,
            lon: 174.7800,
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
            points: [
                "Large urban green space.",
                "Views from Maungakiekie / One Tree Hill.",
                "Great for walking, picnics and recreation."
            ],
            info: "Cornwall Park is a large working farm and recreation area surrounding Maungakiekie / One Tree Hill.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Auckland Domain",
            region: "Central Auckland",
            lat: -36.8600,
            lon: 174.7780,
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
            points: [
                "One of Auckland's oldest parks.",
                "Home to Auckland War Memorial Museum.",
                "Large gardens and walking areas."
            ],
            info: "Auckland Domain is a major central-city park with gardens, paths and cultural attractions.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Western Springs Park",
            region: "Central Auckland",
            lat: -36.8690,
            lon: 174.7160,
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
            points: [
                "Large open green space.",
                "Lakes and walking paths.",
                "Close to MOTAT and Auckland Zoo."
            ],
            info: "Western Springs is a popular urban park near several major Auckland attractions.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Ambury Regional Park",
            region: "South Auckland",
            lat: -36.9500,
            lon: 174.7900,
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
            points: [
                "Working farm beside Manukau Harbour.",
                "Walking tracks and coastal views.",
                "Excellent place for nature and wildlife."
            ],
            info: "Ambury Regional Park is a working farm and coastal park on the Manukau Harbour.",
            council: "https://www.aucklandcouncil.govt.nz/en/parks-recreation/find-park-beach/park-detail/202.html"
        },

        {
            name: "One Tree Hill Domain",
            region: "Central Auckland",
            lat: -36.9010,
            lon: 174.7830,
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
            points: [
                "Iconic volcanic landscape.",
                "Panoramic Auckland views.",
                "Connected with Cornwall Park."
            ],
            info: "One Tree Hill Domain surrounds the iconic Maungakiekie volcanic cone.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Mount Eden / Maungawhau",
            region: "Central Auckland",
            lat: -36.8770,
            lon: 174.7640,
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
            points: [
                "Iconic Auckland volcanic cone.",
                "Panoramic city views.",
                "Important cultural landscape."
            ],
            info: "Maungawhau / Mount Eden is one of Auckland's most recognisable volcanic cones.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Waitākere Ranges Regional Park",
            region: "West Auckland",
            lat: -36.9400,
            lon: 174.5700,
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
            points: [
                "Large native forest landscape.",
                "West coast views.",
                "Extensive network of regional park areas."
            ],
            info: "The Waitākere Ranges contain extensive native forest, coastline and regional park landscapes.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Long Bay Regional Park",
            region: "North Auckland",
            lat: -36.6750,
            lon: 174.7480,
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
            points: [
                "Coastal regional park.",
                "Walking and recreation opportunities.",
                "Large open spaces near the beach."
            ],
            info: "Long Bay Regional Park combines coastal recreation with large open spaces.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Shakespear Regional Park",
            region: "North Auckland",
            lat: -36.6000,
            lon: 174.7700,
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
            points: [
                "Coastal regional park.",
                "Walking and wildlife experiences.",
                "Views across the Hauraki Gulf."
            ],
            info: "Shakespear Regional Park is a coastal recreation and conservation area on the Whangaparāoa Peninsula.",
            council: "https://www.aucklandcouncil.govt.nz/"
        },

        {
            name: "Muriwai Regional Park",
            region: "West Auckland",
            lat: -36.8300,
            lon: 174.4400,
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
            points: [
                "Large coastal regional park.",
                "Native bush and walking trails.",
                "Spectacular west coast scenery."
            ],
            info: "Muriwai Regional Park combines black-sand coastline, native bush and coastal viewpoints.",
            council: "https://www.aucklandcouncil.govt.nz/en/parks-recreation/find-park-beach/park-detail/220.html"
        }
    ]
}