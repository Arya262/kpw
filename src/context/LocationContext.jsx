import { createContext, useContext, useState, useEffect } from "react";

const LocationContext = createContext();

const LOCATION_CACHE_KEY = "user_location_cache";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_EXPIRY_MS) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse cached location", e);
      }
    }
    return {
      loading: true,
      loaded: false,
      coordinates: { lat: null, lng: null },
      address: null,
      ip: null,
      error: null,
    };
  });

  // ❌ Commented: Get Visitor IP
  /*
  const getVisitorIP = async () => {
    try {
      const response = await fetch("https://api64.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Failed to fetch IP:", error);
      return null;
    }
  };
  */

  // ❌ Commented: IP-based location lookup (fallback)
  /*
  const getLocationFromIP = async () => {
    try {
      const ip = await getVisitorIP();
      if (!ip) throw new Error("No IP found");

      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();

      const locationData = {
        loading: false,
        loaded: true,
        coordinates: { lat: data.latitude, lng: data.longitude },
        address: `${data.city}, ${data.region}, ${data.country_name}`,
        ip,
        error: null,
        timestamp: Date.now(),
      };

      setLocation(locationData);
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
    } catch (error) {
      console.error("Failed to fetch location from IP:", error);
      setLocation((prev) => ({
        ...prev,
        loading: false,
        loaded: true,
        error: { message: "Could not determine location from IP" },
      }));
    }
  };
  */

  // ✅ Reverse Geocoding for state/city
  const getStateFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      return (
        data.address?.state ||
        data.address?.county ||
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        "Unknown Location"
      );
    } catch (error) {
      console.error("Error getting location details:", error);
      return "Location Unavailable";
    }
  };

  // ✅ Success handler for Geolocation
  const onSuccess = async (position /*, ipPromise */) => {
    const coords = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    try {
      // ❌ Removed IP logic
      const state = await getStateFromCoordinates(coords.lat, coords.lng);

      const locationData = {
        loading: false,
        loaded: true,
        coordinates: coords,
        address: state,
        ip: null, // No IP now
        error: null,
        timestamp: Date.now(),
      };

      setLocation(locationData);
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
    } catch (err) {
      console.error("Error processing location:", err);
      setLocation((prev) => ({
        ...prev,
        loading: false,
        loaded: true,
        error: { message: "Could not determine location" },
      }));
    }
  };

  // ✅ Error handler → (no IP fallback anymore)
  const onError = () => {
    setLocation((prev) => ({
      ...prev,
      loading: false,
      loaded: true,
      error: { message: "Geolocation not available" },
    }));
  };

  // ✅ Request Geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      onError();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => onSuccess(pos /*, ipPromise */),
      onError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // ✅ Manual refresh function
  const refreshLocation = () => {
    setLocation((prev) => ({ ...prev, loading: true }));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => onSuccess(pos /*, ipPromise */),
        onError,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      onError();
    }
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

// ✅ Custom Hook
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
