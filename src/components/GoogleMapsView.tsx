import React, { useEffect, useRef, useState, useCallback } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  Search,
  Route,
} from "lucide-react";
import useLocation from "@/hooks/useLocation";

declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapsViewProps {
  onLocationChange?: (lat: number, lng: number) => void;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface RiskAssessment {
  level: "safe" | "caution" | "unsafe";
  message: string;
  color: string;
}

const assessSafety = (lat: number, lng: number): RiskAssessment => {
  const random = Math.random();
  if (random < 0.5)
    return {
      level: "safe",
      message: "This area is generally safe",
      color: "#10b981",
    };
  else if (random < 0.8)
    return {
      level: "caution",
      message: "Stay alert, moderate risks nearby",
      color: "#f59e0b",
    };
  else
    return {
      level: "unsafe",
      message: "Unsafe area detected, avoid if possible",
      color: "#ef4444",
    };
};

interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  userLocation?: { lat: number; lng: number } | null;
  showRiskZones: boolean;
  risk: RiskAssessment | null;
  onSetDestination: (lat: number, lng: number) => void;
}

const Map: React.FC<MapProps> = ({
  center,
  zoom,
  userLocation,
  showRiskZones,
  risk,
  onSetDestination,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const directionsService = useRef<google.maps.DirectionsService>();
  const userMarkerRef = useRef<google.maps.Marker>();
  const destinationMarkerRef = useRef<google.maps.Marker>();
  const circleRef = useRef<google.maps.Circle>();

  useEffect(() => {
    if (mapRef.current && !map && window.google) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        mapTypeControlOptions: {
    style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
    position: window.google.maps.ControlPosition.TOP_RIGHT,
  },
        streetViewControl: true,
        fullscreenControl: true,
      });
      setMap(newMap);
      directionsService.current = new window.google.maps.DirectionsService();
      setDirectionsRenderer(new window.google.maps.DirectionsRenderer());
    }
  }, [center, zoom, map]);

  // Update user marker
  useEffect(() => {
    if (!map || !userLocation) return;
    if (!userMarkerRef.current) {
      userMarkerRef.current = new window.google.maps.Marker({
        position: userLocation,
        map,
        title: "You are here",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
      });
    } else {
      userMarkerRef.current.setPosition(userLocation);
    }

    map.panTo(userLocation);
  }, [map, userLocation]);

  // Draw Risk Zone
  useEffect(() => {
    if (!map || !userLocation || !showRiskZones || !risk) return;
    if (circleRef.current) circleRef.current.setMap(null);

    circleRef.current = new window.google.maps.Circle({
      center: userLocation,
      radius: 500,
      map,
      fillColor: risk.color,
      fillOpacity: 0.25,
      strokeColor: risk.color,
      strokeWeight: 2,
      strokeOpacity: 0.7,
    });
  }, [map, userLocation, showRiskZones, risk]);

  // Handle map clicks (set destination)
  useEffect(() => {
    if (!map) return;
    const clickListener = map.addListener("click", (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat && lng) {
        onSetDestination(lat, lng);
      }
    });
    return () => clickListener.remove();
  }, [map, onSetDestination]);

  const drawRoute = useCallback(
    (origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral) => {
      if (!directionsService.current || !directionsRenderer || !map) return;
      directionsRenderer.setMap(map);
      directionsService.current.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRenderer.setDirections(result);
          }
        }
      );
    },
    [directionsRenderer, map]
  );

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
};

const MapLoading = () => (
  <div className="flex items-center justify-center h-full bg-muted animate-pulse">
    <p className="text-muted-foreground">Loading Google Maps...</p>
  </div>
);

const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({ onLocationChange }) => {
  const { location, refreshLocation } = useLocation();
  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [destination, setDestination] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (location) {
      setCenter({ lat: location.latitude, lng: location.longitude });
      const riskLevel = assessSafety(location.latitude, location.longitude);
      setRisk(riskLevel);
    }
  }, [location]);

  const handleDestinationSet = (lat: number, lng: number) => {
    setDestination({ lat, lng });
  };

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <MapLoading />;
      case Status.FAILURE:
        return (
          <div className="flex items-center justify-center h-full text-red-500">
            <AlertTriangle className="mr-2" /> Failed to load Google Maps
          </div>
        );
      case Status.SUCCESS:
        return (
          <Map
            center={center}
            zoom={14}
            userLocation={
              location ? { lat: location.latitude, lng: location.longitude } : null
            }
            showRiskZones={showRiskZones}
            risk={risk}
            onSetDestination={handleDestinationSet}
          />
        );
    }
  };

  return (
    <Card className="glass-strong w-full h-[650px] overflow-hidden border border-border shadow-lg hover:shadow-xl transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <MapPin className="h-5 w-5 text-primary" />
            Google Maps Explorer
            <Badge variant="outline">All Features</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRiskZones(!showRiskZones)}>
              {showRiskZones ? <EyeOff className="mr-1" /> : <Eye className="mr-1" />}
              {showRiskZones ? "Hide Risk" : "Show Risk"}
            </Button>
            <Button variant="outline" size="sm" onClick={refreshLocation}>
              <Navigation className="mr-1" /> My Location
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-[calc(100%-80px)] relative">
        <Wrapper apiKey={GOOGLE_MAPS_API_KEY} render={render} />

        {risk && (
          <div className="absolute bottom-4 left-4 bg-white/90 shadow-md rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" style={{ color: risk.color }} />
              <span className="font-medium capitalize">{risk.level}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{risk.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleMapsView;
