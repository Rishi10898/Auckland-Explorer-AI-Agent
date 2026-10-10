(() => {
  const locationKey = "aucklandExplorerUserLocation";
  const consentKey = "aucklandExplorerLocationConsent";
  const consent = document.getElementById("locationConsent");
  const shareButton = document.getElementById("shareLocation");
  const name = document.getElementById("userLocationName");
  const status = document.getElementById("locationStatus");

  if (!consent || !shareButton || !name || !status) return;

  function readLocation() {
    const location = JSON.parse(localStorage.getItem(locationKey) || "null");
    if (
      !location ||
      !Number.isFinite(location.latitude) ||
      !Number.isFinite(location.longitude) ||
      Math.abs(location.latitude) > 90 ||
      Math.abs(location.longitude) > 180
    ) {
      return null;
    }
    return location;
  }

  async function updateLocationName(location) {
    const query = new URLSearchParams({
      format: "jsonv2",
      lat: location.latitude,
      lon: location.longitude,
      zoom: "14",
      addressdetails: "1",
    });
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query}`);
      if (!response.ok) throw new Error("Location name lookup failed");
      const result = await response.json();
      const address = result.address || {};
      const area = address.neighbourhood || address.suburb || address.village ||
        address.town || address.city || address.county;
      if (area) {
        location.areaName = area;
        localStorage.setItem(locationKey, JSON.stringify(location));
      }
      name.textContent = area ? `Your location · ${area}` : "Your current location";
    } catch (error) {
      name.textContent = "Your current location";
      status.textContent = "Location is saved, but its area name could not be found.";
      console.error("Could not look up the saved location name.", error);
    }
  }

  try {
    const hasConsent = localStorage.getItem(consentKey) === "true";
    const location = readLocation();
    consent.checked = hasConsent;
    shareButton.textContent = location ? "Change my location" : "Share my location";
    shareButton.disabled = !hasConsent;

    if (hasConsent && location) {
      name.textContent = "Finding your area…";
      updateLocationName(location);
    } else if (!hasConsent) {
      name.textContent = "Location sharing is off";
    }
  } catch (error) {
    status.textContent = "Could not read saved location settings in this browser.";
    console.error("Could not read saved location settings.", error);
  }

  consent.addEventListener("change", () => {
    try {
      localStorage.setItem(consentKey, String(consent.checked));
      shareButton.disabled = !consent.checked || shareButton.dataset.loading === "true";
      if (!consent.checked) {
        name.textContent = "Location sharing is off";
        status.textContent = "Saved location distances are paused until you consent again.";
      } else {
        status.textContent = "Consent saved. Share your location or use the saved location.";
        const location = readLocation();
        if (location) {
          name.textContent = "Finding your area…";
          updateLocationName(location);
        }
      }
    } catch (error) {
      status.textContent = "Could not save your location consent in this browser.";
      console.error("Could not save location consent.", error);
    }
  });

  shareButton.addEventListener("click", () => {
    if (!consent.checked) return;
    if (!navigator.geolocation) {
      status.textContent = "Location sharing is not supported by this browser.";
      return;
    }

    shareButton.dataset.loading = "true";
    shareButton.disabled = true;
    consent.disabled = true;
    status.textContent = "Requesting your location…";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        try {
          localStorage.setItem(locationKey, JSON.stringify(location));
          localStorage.setItem(consentKey, "true");
          name.textContent = "Finding your area…";
          status.textContent = `Location saved in this browser (GPS accuracy ±${Math.round(location.accuracy)} m).`;
          updateLocationName(location);
          shareButton.textContent = "Change my location";
        } catch (error) {
          status.textContent = "Location was found but could not be saved in this browser.";
          console.error("Could not save the current location.", error);
        } finally {
          shareButton.dataset.loading = "false";
          consent.disabled = false;
          shareButton.disabled = !consent.checked;
        }
      },
      (error) => {
        status.textContent = error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Allow it in your browser settings to continue."
          : "Your location could not be determined. Please try again.";
        shareButton.dataset.loading = "false";
        consent.disabled = false;
        shareButton.disabled = !consent.checked;
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  });
})();
