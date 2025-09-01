import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

// Cache key for localStorage
const LOCATION_CACHE_KEY = 'user_location_cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    // Try to load from cache first
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Check if cache is still valid
        if (parsed.timestamp && (Date.now() - parsed.timestamp) < CACHE_EXPIRY_MS) {
          return {
            loaded: true,
            coordinates: parsed.coordinates,
            address: parsed.address,
            error: null
          };
        }
      } catch (e) {
        console.error('Failed to parse cached location', e);
      }
    }
    // Default state if no valid cache
    return {
      loaded: false,
      coordinates: { lat: null, lng: null },
      address: null,
      error: null
    };
  });

  const getStateFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      return data.address?.state || data.address?.county || 'Unknown Location';
    } catch (error) {
      console.error('Error getting location details:', error);
      return 'Location Unavailable';
    }
  };

  const onSuccess = async (position) => {
    try {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Check if we have a valid cached state for these coordinates
      const cached = localStorage.getItem(LOCATION_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // If we have a recent cache with the same coordinates, use it
          if (parsed.coordinates && 
              parsed.coordinates.lat === coords.lat && 
              parsed.coordinates.lng === coords.lng &&
              parsed.timestamp && 
              (Date.now() - parsed.timestamp) < CACHE_EXPIRY_MS) {
            setLocation({
              loaded: true,
              coordinates: coords,
              address: parsed.address,
              error: null
            });
            return;
          }
        } catch (e) {
          console.error('Error reading location cache', e);
        }
      }

      // If no valid cache, fetch from OpenStreetMap
      const state = await getStateFromCoordinates(coords.lat, coords.lng);
      const locationData = {
        loaded: true,
        coordinates: coords,
        address: { state },
        error: null
      };
      
      // Update state
      setLocation(locationData);
      
      // Cache the result
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({
        ...locationData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error processing location:', error);
      setLocation(prev => ({
        ...prev,
        loaded: true,
        error: { message: 'Could not determine location name' }
      }));
    }
  };

  const onError = (error) => {
    console.error('Geolocation error:', error);
    let errorMessage = error.message || 'Unknown error';
    
    // More specific error messages based on error code
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access was denied. Please enable location services for this website.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'The request to get location timed out.';
        break;
      case error.UNKNOWN_ERROR:
        errorMessage = 'An unknown error occurred while getting location.';
        break;
    }
    
    setLocation(prev => ({
      ...prev,
      loaded: true,
      error: {
        code: error.code,
        message: errorMessage,
      },
    }));
  };

  useEffect(() => {
    console.log('Checking geolocation availability...');
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser');
      onError({
        code: 0,
        message: 'Geolocation not supported by your browser',
      });
      return;
    }

    console.log('Requesting geolocation...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Got position:', position);
        onSuccess(position);
      },
      (error) => {
        console.error('Error getting position:', error);
        onError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 0 // Don't use a cached position
      }
    );
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
