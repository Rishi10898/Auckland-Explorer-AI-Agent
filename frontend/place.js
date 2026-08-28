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
    ],


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
    ],


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
};