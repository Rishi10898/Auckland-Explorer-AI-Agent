// Coordinates feed road routing; map links use destination names, not raw pins.
const DESTINATION_REGIONS = {
  beaches: {
    east: [
      ["Eastern Beach", -36.8858, 174.8716],
      ["Bucklands Beach", -36.8565, 174.9068],
      ["Half Moon Bay", -36.8876, 174.9009],
      ["Howick Beach", -36.8964, 174.9305],
      ["Cockle Bay Beach", -36.8945, 174.9535],
      ["Mellons Bay Beach", -36.8834, 174.9420],
      ["Maraetai Beach", -36.8834, 175.0165],
      ["Beachlands Beach", -36.8827, 175.0060],
      ["Umupuia Beach", -36.8918, 175.0860],
      ["Duder Regional Park Coast", -36.8790, 175.1010],
    ],
    west: [
      ["Piha Beach", -36.9530, 174.4680],
      ["Muriwai Beach", -36.8170, 174.4220],
      ["Te Henga (Bethells Beach)", -36.8890, 174.4500],
      ["Karekare Beach", -36.9870, 174.4780],
      ["Whatipu Beach", -37.0750, 174.5350],
      ["Cornwallis Beach", -36.9290, 174.6260],
      ["Huia Beach", -36.9970, 174.5740],
      ["French Bay", -36.9340, 174.6350],
      ["Kakamatua Inlet", -37.0120, 174.5570],
      ["Anawhata Beach", -36.9050, 174.4530],
    ],
    south: [
      ["Clarks Beach", -37.1280, 174.7060],
      ["Karioitahi Beach", -37.2480, 174.6880],
      ["Weymouth Beach", -36.9400, 174.8780],
      ["Big Bay", -37.1580, 174.6760],
      ["Maraetai Beach", -36.8834, 175.0165],
      ["Omana Regional Park Beach", -36.8875, 175.0470],
      ["Umupuia Beach", -36.8918, 175.0860],
      ["Beachlands Beach", -36.8827, 175.0060],
      ["Kawakawa Bay Beach", -36.9650, 175.1470],
      ["Grahams Beach", -37.1420, 174.6940],
    ],
    north: [
      ["Takapuna Beach", -36.7881, 174.7720],
      ["Long Bay Beach", -36.6780, 174.7490],
      ["Browns Bay Beach", -36.7160, 174.7490],
      ["Milford Beach", -36.7720, 174.7700],
      ["Castor Bay", -36.7540, 174.7610],
      ["Mairangi Bay Beach", -36.7360, 174.7510],
      ["Campbells Bay Beach", -36.7540, 174.7530],
      ["Cheltenham Beach", -36.8230, 174.7980],
      ["Narrow Neck Beach", -36.8110, 174.8020],
      ["Waiake Beach", -36.7090, 174.7520],
    ],
    central: [
      ["Mission Bay", -36.8485, 174.8303],
      ["Kohimarama Beach", -36.8497, 174.8370],
      ["St Heliers Beach", -36.8516, 174.8612],
      ["Ōkahu Bay", -36.8388, 174.8079],
      ["Ladies Bay", -36.8505, 174.8701],
      ["Judges Bay", -36.8395, 174.7884],
      ["Herne Bay Beach", -36.8431, 174.7238],
      ["Sentinel Beach", -36.8386, 174.7216],
      ["Point Chevalier Beach", -36.8720, 174.7040],
      ["Meola Reef Beach", -36.8500, 174.7100],
    ],
    hauraki: [
      ["Orewa Beach", -36.5860, 174.6890],
      ["Red Beach", -36.5950, 174.7050],
      ["Waiwera Beach", -36.5520, 174.7050],
      ["Hatfields Beach", -36.5680, 174.6900],
      ["Stanmore Bay Beach", -36.6310, 174.7450],
      ["Manly Beach", -36.6290, 174.7700],
      ["Arkles Bay Beach", -36.6240, 174.7820],
      ["Wenderholm Beach", -36.5070, 174.7310],
      ["Snells Beach", -36.4230, 174.7290],
      ["Omaha Beach", -36.3510, 174.7670],
    ],
    gulf: [
      ["Oneroa Beach", -36.7810, 175.0090, true],
      ["Onetangi Beach", -36.7870, 175.0750, true],
      ["Palm Beach", -36.7760, 175.0460, true],
      ["Little Oneroa Beach", -36.7790, 175.0180, true],
      ["Blackpool Beach", -36.7830, 175.0070, true],
      ["Sandy Bay", -36.7690, 175.0360, true],
      ["Enclosure Bay", -36.7660, 175.0220, true],
      ["Rocky Bay", -36.7860, 175.1010, true],
      ["Man O' War Bay", -36.7960, 175.1850, true],
      ["Medlands Beach, Aotea / Great Barrier Island", -36.1980, 175.4160, true],
    ],
  },
  parks: {
    east: [
      ["Lloyd Elsmore Park", -36.9110, 174.8740],
      ["Dingle Dell Reserve", -36.8590, 174.8780],
      ["Mangemangeroa Reserve", -36.9250, 174.9510],
      ["Barry Curtis Park", -36.9640, 174.9120],
      ["Murphy's Bush Scenic Reserve", -36.9640, 174.9650],
      ["Point View Reserve", -36.9220, 174.9210],
      ["Wakaaranga Creek Reserve", -36.9030, 174.8960],
      ["Meadowlands Reserve", -36.9080, 174.8800],
      ["Pakuranga Rotary Walkway", -36.9000, 174.8840],
      ["Howick Domain", -36.8950, 174.9310],
    ],
    west: [
      ["Arataki Visitor Centre", -36.9302, 174.5870],
      ["Waitākere Ranges Regional Park", -36.9600, 174.5300],
      ["Kitekite Falls Track", -36.9590, 174.4760],
      ["Cascade Kauri Regional Park", -36.8150, 174.5450],
      ["Waitākere Dam Track", -36.9150, 174.5580],
      ["Te Henga Walkway", -36.8660, 174.5000],
      ["Huia Domain", -36.9970, 174.5740],
      ["Cornwallis Regional Park", -36.9300, 174.6240],
      ["Karekare Regional Park", -36.9960, 174.4900],
      ["Woodhill Forest", -36.7300, 174.4300],
    ],
    south: [
      ["Ambury Regional Park", -36.9266, 174.7556],
      ["Maungawhau / Mount Eden Domain", -36.8780, 174.7640],
      ["Tōtara Park", -37.0100, 174.9000],
      ["Puhinui Reserve", -37.0050, 174.8870],
      ["Ōtuataua Stonefields", -36.9980, 174.7860],
      ["Awhitu Regional Park", -37.0840, 174.6950],
      ["Waitawa Regional Park", -36.9630, 175.1250],
      ["Te Puru Park", -36.9120, 175.0110],
      ["Clevedon Scenic Reserve", -36.9990, 175.0000],
      ["Hingaia Park", -37.0540, 174.9160],
    ],
    north: [
      ["Long Bay Regional Park", -36.6767, 174.7467],
      ["Shakespear Regional Park", -36.6300, 174.8600],
      ["Eskdale Reserve", -36.7750, 174.7100],
      ["Kauri Point Centennial Park", -36.8150, 174.7300],
      ["Shepherds Park", -36.7890, 174.7480],
      ["Onepoto Domain", -36.7990, 174.7580],
      ["Waiake Reserve", -36.7060, 174.7520],
      ["Rosedale Park", -36.7460, 174.7220],
      ["Le Roys Bush", -36.8120, 174.7390],
      ["Milford Reserve", -36.7710, 174.7670],
    ],
    central: [
      ["Auckland Domain", -36.8606, 174.7785],
      ["Cornwall Park", -36.8984, 174.7848],
      ["Albert Park", -36.8506, 174.7678],
      ["Western Springs Lakeside Park", -36.8627, 174.7287],
      ["Victoria Park", -36.8469, 174.7536],
      ["Myers Park", -36.8560, 174.7614],
      ["Grey Lynn Park", -36.8585, 174.7334],
      ["Point Erin Park", -36.8336, 174.7362],
      ["Auckland Botanic Gardens", -37.0090, 174.9070],
      ["One Tree Hill Domain", -36.9006, 174.7846],
    ],
    hauraki: [
      ["Wenderholm Regional Park", -36.5070, 174.7310],
      ["Mahurangi Regional Park (Scotts Landing)", -36.4440, 174.7330],
      ["Tāwharanui Regional Park", -36.3680, 174.8230],
      ["Scandrett Regional Park", -36.3900, 174.8460],
      ["Te Arai Regional Park", -36.1740, 174.7720],
      ["Dome Forest", -36.3050, 174.5880],
      ["Parry Kauri Park", -36.4320, 174.6550],
      ["Barkers Point Scenic Reserve", -36.4460, 174.7310],
      ["Mahurangi West Regional Park", -36.4580, 174.6250],
      ["Warkworth Showgrounds Reserve", -36.3990, 174.6600],
    ],
    gulf: [
      ["Whakanewha Regional Park", -36.8170, 175.0670, true],
      ["Te Matuku Marine Reserve", -36.8080, 175.1050, true],
      ["Onetangi Sports Park", -36.7880, 175.0630, true],
      ["Whakanewha Wetland Walk", -36.8170, 175.0670, true],
      ["Stony Batter Historic Reserve", -36.7970, 175.1840, true],
      ["Rangitoto Island Summit Track", -36.7870, 174.8600, true],
      ["Motutapu Island Recreation Area", -36.7600, 174.9000, true],
      ["Tiritiri Matangi Island Sanctuary", -36.6070, 174.8930, true],
      ["Aotea / Great Barrier Island Forest", -36.2000, 175.4100, true],
      ["Kaitoke Hot Springs Track", -36.1990, 175.4300, true],
    ],
  },
  attractions: {
    east: [
      ["Howick Historical Village", -36.9090, 174.9080],
      ["Musick Point", -36.8310, 174.8940],
      ["Howick Village Centre", -36.8950, 174.9310],
      ["Achilles Point", -36.8500, 174.8710],
      ["Point England Reserve", -36.8790, 174.8610],
      ["Te Oro Music and Arts Centre", -36.9080, 174.9290],
      ["Māngemangeroa Valley", -36.9260, 174.9480],
      ["Fo Guang Shan Buddhist Temple", -36.9410, 174.9090],
      ["Howick Beach Historic Foreshore", -36.8964, 174.9305],
      ["Lloyd Elsmore Park Sports Centre", -36.9110, 174.8740],
    ],
    west: [
      ["Arataki Visitor Centre", -36.9302, 174.5870],
      ["Muriwai Gannet Colony", -36.8230, 174.4200],
      ["Piha Lion Rock", -36.9550, 174.4680],
      ["Karekare Falls", -36.9880, 174.4870],
      ["Lake Wainamu", -36.8840, 174.4490],
      ["Lopdell House Gallery", -36.9380, 174.6560],
      ["Corban Estate Arts Centre", -36.8950, 174.6370],
      ["Scenic Drive Lookout", -36.9010, 174.5990],
      ["Whatipu Caves", -37.0750, 174.5350],
      ["Waitākere Reservoir Lookout", -36.9150, 174.5580],
    ],
    south: [
      ["Auckland Botanic Gardens", -37.0090, 174.9070],
      ["Rainbow's End", -37.0100, 174.8870],
      ["Butterfly Creek", -37.0030, 174.7860],
      ["Ōtuataua Stonefields Historic Reserve", -36.9980, 174.7860],
      ["Māngere Mountain Education Centre", -36.9650, 174.7890],
      ["Glenbrook Vintage Railway", -37.2050, 174.7500],
      ["Pukekohe Park Raceway", -37.2050, 174.9200],
      ["Awhitu Lighthouse", -37.0810, 174.6810],
      ["Takanini Sikh Temple", -37.0350, 174.9110],
      ["Spookers", -37.0830, 174.9690],
    ],
    north: [
      ["Devonport Historic Village", -36.8310, 174.7960],
      ["North Head Historic Reserve", -36.8230, 174.7980],
      ["Torpedo Bay Navy Museum", -36.8270, 174.7980],
      ["Takapuna Beachfront", -36.7881, 174.7720],
      ["Snowplanet", -36.6200, 174.6960],
      ["Shakespear Regional Park", -36.6300, 174.8600],
      ["Whangaparāoa Peninsula", -36.6200, 174.7900],
      ["Albany Stadium", -36.7280, 174.7090],
      ["Gulf Harbour Marina", -36.6260, 174.7950],
      ["Long Bay Regional Park", -36.6767, 174.7467],
    ],
    central: [
      ["Sky Tower", -36.8485, 174.7622],
      ["Auckland War Memorial Museum", -36.8600, 174.7760],
      ["Auckland Art Gallery", -36.8520, 174.7650],
      ["Wynyard Quarter", -36.8410, 174.7550],
      ["Viaduct Harbour", -36.8440, 174.7620],
      ["New Zealand Maritime Museum", -36.8420, 174.7620],
      ["Auckland Ferry Terminal", -36.8420, 174.7680],
      ["Auckland Zoo", -36.8640, 174.7190],
      ["MOTAT", -36.8670, 174.7130],
      ["One Tree Hill / Maungakiekie", -36.9010, 174.7830],
    ],
    hauraki: [
      ["Matakana Village", -36.3520, 174.7180],
      ["Sculptureum", -36.3540, 174.7230],
      ["Goat Island Marine Reserve", -36.2630, 174.7950],
      ["Warkworth Museum", -36.3970, 174.6570],
      ["Puhoi Historic Village", -36.5000, 174.6600],
      ["Sheepworld", -36.3930, 174.6570],
      ["Brick Bay Sculpture Trail", -36.4300, 174.7150],
      ["Leigh Sawmill Cafe", -36.2840, 174.7990],
      ["Wenderholm Regional Park", -36.5070, 174.7310],
      ["Tāwharanui Regional Park", -36.3680, 174.8230],
    ],
    gulf: [
      ["Waiheke Community Art Gallery", -36.7810, 175.0090, true],
      ["Stony Batter Historic Reserve", -36.7970, 175.1840, true],
      ["Tiritiri Matangi Lighthouse", -36.6070, 174.8930, true],
      ["Rangitoto Summit", -36.7870, 174.8600, true],
      ["Waiheke Island Wine Trail", -36.7870, 175.0750, true],
      ["Matiatia Wharf", -36.7710, 175.0080, true],
      ["Onetangi Beachfront", -36.7870, 175.0750, true],
      ["Windy Canyon, Aotea / Great Barrier", -36.1850, 175.4420, true],
      ["Kaitoke Hot Springs", -36.1990, 175.4300, true],
      ["Whakanewha Regional Park", -36.8170, 175.0670, true],
    ],
  },
};

const REGION_DETAILS = {
  east: ["East Auckland", "Eastern Auckland and the Hauraki Gulf shoreline"],
  west: ["West Auckland", "West Auckland and the Waitākere Ranges"],
  south: ["South Auckland", "South Auckland, Franklin, and the Manukau Harbour"],
  north: ["North Shore", "Auckland's North Shore and Hibiscus Coast"],
  central: ["Central Auckland", "Central Auckland and the eastern bays"],
  hauraki: ["Hauraki Coast", "The mainland Hauraki Gulf and Rodney coast"],
  gulf: ["Gulf Islands", "Auckland's islands in the Hauraki Gulf"],
};

const CATEGORY_DETAILS = {
  beaches: ["beaches", "beach", "Beach"],
  parks: ["parks", "park", "Park"],
  attractions: ["attractions", "attraction", "Attraction"],
};

(() => {
  const page = document.body;
  const grid = document.querySelector(".places-grid");
  if (!page.dataset.destinationCategory || !page.dataset.destinationRegion || !grid) return;

  const category = page.dataset.destinationCategory;
  const region = page.dataset.destinationRegion;
  const places = DESTINATION_REGIONS[category]?.[region];
  const regionDetails = REGION_DETAILS[region];
  const categoryDetails = CATEGORY_DETAILS[category];
  if (!places || !regionDetails || !categoryDetails) {
    grid.textContent = "Destinations are not available for this region.";
    console.error("Unknown destination page configuration.", { category, region });
    return;
  }

  document.title = `${regionDetails[0]} ${categoryDetails[0]} · Auckland Explorer`;
  const sectionTitle = document.querySelector(".section-title");
  const heading = sectionTitle?.querySelector("h1");
  const eyebrow = sectionTitle?.querySelector("p");
  const description = heading?.nextElementSibling;
  if (eyebrow) eyebrow.textContent = `${regionDetails[0]} ${categoryDetails[0]}`.toUpperCase();
  if (heading) heading.innerHTML =
    `Explore ${regionDetails[0]} <span class="gradient-text">${categoryDetails[0]}.</span>`;
  if (description) description.textContent =
    `Discover ${categoryDetails[1]} destinations across ${regionDetails[1]}.`;
  grid.classList.add("destination-grid");
  const locationNotice = document.createElement("p");
  locationNotice.className = "location-hint";
  locationNotice.setAttribute("aria-live", "polite");
  sectionTitle?.after(locationNotice);

  const safeText = (value) => value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

  grid.innerHTML = places.map(([name, lat, lon, ferryRequired = false], index) => {
    const directions = new URL("https://www.google.com/maps/dir/");
    directions.searchParams.set("api", "1");
    directions.searchParams.set("destination", `${name}, ${regionDetails[0]}, Auckland, New Zealand`);
    return `
      <article class="card destination-card">
        <p class="place-region">${safeText(regionDetails[0])} · ${safeText(categoryDetails[2])}</p>
        <h2>${index + 1}. ${safeText(name)}</h2>
        <p class="destination-description">${safeText(getDescription(category, regionDetails[0]))}</p>
        <div class="destination-card-footer">
          <span class="distance-badge" data-destination="${safeText(name)}" data-lat="${lat}" data-lng="${lon}" data-ferry="${ferryRequired}"${ferryRequired ? "" : " hidden"}>Calculating driving distance…</span>
          <div class="destination-actions">
            <a class="btn btn-secondary" href="${directions.href}" target="_blank" rel="noopener noreferrer">Directions</a>
          </div>
        </div>
      </article>
    `;
  }).join("");

  function getDescription(kind, area) {
    if (kind === "beaches") return `A coastal destination in ${area}. Check tide, water-quality, and surf conditions before visiting.`;
    if (kind === "parks") return `A public green space in ${area}. Check local notices for track access and conditions.`;
    return `A place to explore in ${area}. Check official visitor information for opening hours and access.`;
  }

  initializeDistances(locationNotice);
})();

async function initializeDistances(locationNotice) {
  const distanceBadges = Array.from(document.querySelectorAll(".distance-badge[data-lat][data-lng]"));
  let location;
  try {
    if (localStorage.getItem("aucklandExplorerLocationConsent") !== "true") {
      throw new Error("Location sharing has not been enabled on the Explore page.");
    }
    location = JSON.parse(localStorage.getItem("aucklandExplorerUserLocation") || "null");
    if (
      !location ||
      !Number.isFinite(location.latitude) ||
      !Number.isFinite(location.longitude) ||
      Math.abs(location.latitude) > 90 ||
      Math.abs(location.longitude) > 180
    ) {
      throw new Error("No valid saved location was found.");
    }
  } catch {
    locationNotice.innerHTML = 'Set your location on the <a class="text-link" href="../explore.html">Explore page</a> to see driving distances.';
    distanceBadges.filter((badge) => badge.dataset.ferry !== "true").forEach((badge) => {
      badge.hidden = true;
    });
    return;
  }

  locationNotice.textContent = `Driving distances from ${location.areaName || "your current location"}.`;
  if (!location.areaName) updateLocationName(location, locationNotice);

  distanceBadges.forEach((badge) => {
    badge.hidden = false;
    if (badge.dataset.ferry === "true") {
      badge.textContent = "Ferry required";
      badge.title = "A ferry crossing is required; a driving-only distance is not available.";
    }
  });

  const roadDestinations = distanceBadges.filter((badge) => badge.dataset.ferry !== "true");
  // Batch requests to avoid flooding the public routing service.
  for (let index = 0; index < roadDestinations.length; index += 3) {
    await Promise.all(roadDestinations.slice(index, index + 3).map((badge) => fetchDrivingDistance(badge, location)));
  }
}

async function updateLocationName(location, notice) {
  const query = new URLSearchParams({
    format: "jsonv2",
    lat: location.latitude,
    lon: location.longitude,
    zoom: "14",
    addressdetails: "1",
  });
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query}`);
    if (!response.ok) throw new Error(`Location name service returned HTTP ${response.status}.`);
    const { address = {} } = await response.json();
    const areaName = address.neighbourhood || address.suburb || address.village ||
      address.town || address.city || address.county;
    if (!areaName) return;

    location.areaName = areaName;
    localStorage.setItem("aucklandExplorerUserLocation", JSON.stringify(location));
    notice.textContent = `Driving distances from ${areaName}.`;
  } catch (error) {
    console.error("Could not look up the saved location name.", error);
  }
}

async function fetchDrivingDistance(badge, location) {
  const destinationLatitude = Number(badge.dataset.lat);
  const destinationLongitude = Number(badge.dataset.lng);
  if (
    !Number.isFinite(destinationLatitude) ||
    !Number.isFinite(destinationLongitude) ||
    Math.abs(destinationLatitude) > 90 ||
    Math.abs(destinationLongitude) > 180
  ) {
    badge.textContent = "Distance unavailable";
    badge.title = "This destination has invalid coordinates.";
    return;
  }

  badge.textContent = "Calculating driving distance…";
  badge.classList.add("loading");
  const coordinates = `${location.longitude},${location.latitude};${destinationLongitude},${destinationLatitude}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?alternatives=false&steps=false&overview=false`;
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Driving-distance service returned HTTP ${response.status}.`);
    const result = await response.json();
    if (
      result.code !== "Ok" ||
      !result.routes?.length ||
      result.waypoints?.length !== 2 ||
      !Number.isFinite(result.routes[0].distance) ||
      result.routes[0].distance < 0
    ) {
      throw new Error("No continuous driving route was found.");
    }
    const snapsTooFar = result.waypoints.some((waypoint) =>
      !Number.isFinite(waypoint.distance) || waypoint.distance > 1500
    );
    if (snapsTooFar) throw new Error("The destination is too far from a mapped road for a reliable driving distance.");
    badge.textContent = `Approx. ${(result.routes[0].distance / 1000).toFixed(1)} km driving`;
    badge.title = `Road distance from your saved location, rounded to 0.1 km. GPS accuracy: ±${Math.round(location.accuracy || 0)} m.`;
  } catch (error) {
    badge.textContent = "Driving route unavailable";
    badge.title = error.name === "AbortError"
      ? "Driving-distance lookup timed out. Try again later."
      : error.message || "Could not retrieve a driving route.";
  } finally {
    clearTimeout(timeout);
    badge.classList.remove("loading");
  }
}
