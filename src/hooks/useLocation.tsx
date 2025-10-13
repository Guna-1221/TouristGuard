import { useState, useEffect, useCallback } from "react";

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface LocationError {
  code: number;
  message: string;
}

const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [loading, setLoading] = useState(true);

  // Reverse geocode coordinates to address
  const reverseGeocode = useCallback(async (lat: number, lon: number): Promise<Partial<Location>> => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const data = await response.json();
      return {
        address: data.locality || "Unknown Location",
        city: data.city || data.locality,
        country: data.countryName,
      };
    } catch (err) {
      console.warn("Reverse geocoding failed:", err);
      return {};
    }
  }, []);

  // Simulated tourist density
  const calculateNearbyTourists = useCallback((lat: number, lon: number): number => {
    const touristHotspots = [
      { lat: 25.7617, lon: -80.1918, density: 200 }, // Miami Beach
      { lat: 40.7589, lon: -73.9851, density: 300 }, // Times Square
      { lat: 34.1341, lon: -118.3215, density: 150 }, // Hollywood
      { lat: 41.8781, lon: -87.6298, density: 100 }, // Chicago
      { lat: 37.7749, lon: -122.4194, density: 180 }, // San Francisco
    ];

    let maxTourists = 20; // base
    touristHotspots.forEach((hotspot) => {
      const distance = Math.sqrt(Math.pow(lat - hotspot.lat, 2) + Math.pow(lon - hotspot.lon, 2));
      if (distance < 0.1) {
        const proximityFactor = Math.max(0, 1 - distance / 0.1);
        maxTourists = Math.max(maxTourists, hotspot.density * proximityFactor);
      }
    });

    return Math.floor(maxTourists + (Math.random() * 30 - 15));
  }, []);

  // Memoized function for current location
  const getTourists = useCallback(() => {
    if (!location) return 0;
    return calculateNearbyTourists(location.latitude, location.longitude);
  }, [location, calculateNearbyTourists]);

  // Fetch current position
  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError({ code: -1, message: "Geolocation not supported" });
      setLoading(false);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const timestamp = pos.timestamp;
        const geocodeData = await reverseGeocode(latitude, longitude);

        setLocation({ latitude, longitude, accuracy, timestamp, ...geocodeData });
        setLoading(false);
      },
      (err) => {
        setError({ code: err.code, message: err.message });
        setLoading(false);
      },
      options
    );
  }, [reverseGeocode]);

  // Watch for real-time location changes
  useEffect(() => {
    getCurrentLocation();

    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const timestamp = pos.timestamp;
        const geocodeData = await reverseGeocode(latitude, longitude);
        setLocation({ latitude, longitude, accuracy, timestamp, ...geocodeData });
      },
      (err) => setError({ code: err.code, message: err.message }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [getCurrentLocation, reverseGeocode]);

  return {
    location,
    error,
    loading,
    refreshLocation: getCurrentLocation,
    calculateNearbyTourists: getTourists,
  };
};

export default useLocation;
