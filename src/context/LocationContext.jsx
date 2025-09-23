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
      loaded: false,
      coordinates: { lat: null, lng: null },
      address: null,
      ip: null,
      error: null,
    };
  });

  // ✅ Get Visitor IP
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

  // ✅ IP-based location lookup (fallback)
const getLocationFromIP = async () => {
  try {
    console.log("⚡ Falling back to IP-based location...");
    const ip = await getVisitorIP();
    if (!ip) throw new Error("No IP found");

    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    console.log("📍 IP-based location data:", data);

    const locationData = {
      loaded: true,
      coordinates: {
        lat: data.latitude,
        lng: data.longitude,
      },
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
      loaded: true,
      error: { message: "Could not determine location from IP" },
    }));
  }
};


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
  const onSuccess = async (position) => {
    const coords = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    try {
      const ip = await getVisitorIP();
      const state = await getStateFromCoordinates(coords.lat, coords.lng);

      const locationData = {
        loaded: true,
        coordinates: coords,
        address: state,
        ip,
        error: null,
        timestamp: Date.now(),
      };

      setLocation(locationData);
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
    } catch (err) {
      console.error("Error processing location:", err);
      setLocation((prev) => ({
        ...prev,
        loaded: true,
        error: { message: "Could not determine location" },
      }));
    }
  };

  // ✅ Error handler → fallback to IP
  const onError = (error) => {
    console.warn("Geolocation error:", error);
    getLocationFromIP(); // fallback
  };

  // ✅ Request Geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported, falling back to IP...");
      getLocationFromIP();
      return;
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
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
