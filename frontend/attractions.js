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