import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

// Cache key for localStorage
const LOCATION_CACHE_KEY = 'user_location_cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_EXPIRY_MS) {
          return {
            loaded: true,
            coordinates: parsed.coordinates,
            address: parsed.address, // ✅ always plain string
            error: null,
          };
        }
      } catch (e) {
        console.error('Failed to parse cached location', e);
      }
    }
    return {
      loaded: false,
      coordinates: { lat: null, lng: null },
      address: null,
      error: null,
    };
  });

  // Reverse geocoding to get state/city
  const getStateFromCoordinates = async (lat, lng) => {
    try {
      console.log('Fetching state for coords:', lat, lng);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      console.log('Reverse geocode response:', data);

      return (
        data.address?.state ||
        data.address?.county ||
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        'Unknown Location'
      );
    } catch (error) {
      console.error('Error getting location details:', error);
      return 'Location Unavailable';
    }
  };

  const onSuccess = async (position) => {
    try {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      console.log('Got coordinates:', coords);

      // ✅ Check cache first
      const cached = localStorage.getItem(LOCATION_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (
            parsed.coordinates?.lat === coords.lat &&
            parsed.coordinates?.lng === coords.lng &&
            parsed.timestamp &&
            Date.now() - parsed.timestamp < CACHE_EXPIRY_MS
          ) {
            console.log('Using cached location:', parsed);
            setLocation({
              loaded: true,
              coordinates: coords,
              address: parsed.address, // ✅ plain string
              error: null,
            });
            return;
          }
        } catch (e) {
          console.error('Error reading location cache', e);
        }
      }

      // ✅ Fetch new reverse geocode
      const state = await getStateFromCoordinates(coords.lat, coords.lng);

      const locationData = {
        loaded: true,
        coordinates: coords,
        address: state, // ✅ plain string only
        error: null,
      };

      setLocation(locationData);

      localStorage.setItem(
        LOCATION_CACHE_KEY,
        JSON.stringify({
          ...locationData,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Error processing location:', error);
      setLocation((prev) => ({
        ...prev,
        loaded: true,
        error: { message: 'Could not determine location name' },
      }));
    }
  };

  const onError = (error) => {
    console.error('Geolocation error:', error);
    let errorMessage = error.message || 'Unknown error';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage =
          'Location access was denied. Please enable location services for this website.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'The request to get location timed out.';
        break;
      default:
        errorMessage = 'An unknown error occurred while getting location.';
        break;
    }

    setLocation((prev) => ({
      ...prev,
      loaded: true,
      error: {
        code: error.code,
        message: errorMessage,
      },
    }));
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      onError({
        code: 0,
        message: 'Geolocation not supported by your browser',
      });
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

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
