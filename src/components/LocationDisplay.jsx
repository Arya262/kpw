import React, { useEffect } from 'react';
import { useLocation } from '../context/LocationContext';

const LocationDisplay = () => {
  const { location, setLocation } = useLocation();

  // Log location state changes
  useEffect(() => {
    console.log('Location state updated:', location);
  }, [location]);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            loaded: true,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            error: null
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocation(prev => ({
            ...prev,
            loaded: true,
            error: {
              code: error.code,
              message: error.message,
            },
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  };

  if (!location.loaded) {
    return (
      <div>
        <p>Requesting location access...</p>
        <p>Please allow location access when prompted by your browser.</p>
        <button onClick={requestLocation}>Retry Location Access</button>
      </div>
    );
  }

  if (location.error) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ff6b6b', borderRadius: '8px' }}>
        <h3>⚠️ Location Access Required</h3>
        <p><strong>Error:</strong> {location.error.message}</p>
        <p>To use this feature, please:</p>
        <ol>
          <li>Check your browser's location settings</li>
          <li>Make sure your device's location services are enabled</li>
          <li>If prompted, allow this website to access your location</li>
          <li>Click the button below to try again</li>
        </ol>
        <button 
          onClick={requestLocation}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '10px'
          }}
        >
          Allow Location Access
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #4CAF50', borderRadius: '8px' }}>
      <h3>✅ Location Access Granted</h3>
      <p><strong>Latitude:</strong> {location.coordinates.lat?.toFixed(6) || 'N/A'}</p>
      <p><strong>Longitude:</strong> {location.coordinates.lng?.toFixed(6) || 'N/A'}</p>
      
      {location.coordinates.lat && location.coordinates.lng && (
        <a 
          href={`https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#4285F4',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          View on Google Maps
        </a>
      )}
    </div>
  );
};

export default LocationDisplay;
