import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMapEvents,
  LayersControl,
} from "react-leaflet";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Users, AlertTriangle, Shield, Search, X } from "lucide-react";
import useLocation from "@/hooks/useLocation";
import { useRiskLevel } from "@/hooks/useRiskLevel";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";

// ---------- Leaflet default icons fix ----------
// ensure markers show correctly when bundlers change asset paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ---------- helpers ----------
const createCustomIcon = (color: string) =>
  new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}"/>
        <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

const userIcon = createCustomIcon("#3b82f6");
const incidentIcon = createCustomIcon("#ef4444");
const safeZoneIcon = createCustomIcon("#10b981");
const searchIconMarker = createCustomIcon("#f59e0b");

// ---------- types ----------
interface SafetyZone {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  level: "safe" | "moderate" | "warning";
  name: string;
  touristCount: number;
}

interface Incident {
  id: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
  timestamp: Date;
}

interface MapViewProps {
  onLocationChange?: (lat: number, lng: number) => void;
}

// ---------- small utility components ----------
function MapEvents({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onClick?.(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

// ---------- main component ----------
export default function MapView({ onLocationChange }: MapViewProps) {
  const { location, getCurrentLocation } = useLocation();
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]);
  const [mapInstance, setMapInstance] = useState<any | null>(null);

  // responsive sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // search
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchResult, setSearchResult] = useState<{ lat: number; lng: number; displayName: string } | null>(null);

  // routing
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [travelMode, setTravelMode] = useState<"driving-car" | "foot-walking" | "cycling-regular">("driving-car");

  // overlays
  const [showIncidents, setShowIncidents] = useState(true);
  const [showSafetyZones, setShowSafetyZones] = useState(true);
  const [showTouristSpots, setShowTouristSpots] = useState(true);
  const [touristSpots, setTouristSpots] = useState<any[]>([]);

  // static sample data (you can replace with API results)
  const safetyZones = useMemo<SafetyZone[]>(
    () => [
      { id: "1", lat: 40.7589, lng: -73.9851, radius: 500, level: "safe", name: "Times Square Tourist Zone", touristCount: 1250 },
      { id: "2", lat: 40.7505, lng: -73.9934, radius: 300, level: "moderate", name: "Herald Square Area", touristCount: 850 },
    ],
    []
  );

  const incidents = useMemo<Incident[]>(
    () => [
      { id: "1", lat: 40.7614, lng: -73.9776, type: "Pickpocket Alert", description: "Reported pickpocket activity near subway entrance", severity: "medium", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    ],
    []
  );

  // risk levels
  const { risk: userRisk } = useRiskLevel(location?.address ?? "", "");
  const { risk: searchRisk } = useRiskLevel(searchResult?.displayName ?? "", "");

  // when location is available set center
  useEffect(() => {
    if (location) {
      const c: [number, number] = [location.latitude, location.longitude];
      setMapCenter(c);
      // keep map centered if it's created
      if (mapInstance) mapInstance.setView(c, mapInstance.getZoom());
    }
  }, [location, mapInstance]);

  // invalidate map size when sidebar toggles or search result changes
  useEffect(() => {
    if (!mapInstance) return;
    // small timeout to allow layout animation to finish
    const t = setTimeout(() => mapInstance.invalidateSize(), 260);
    return () => clearTimeout(t);
  }, [sidebarOpen, searchResult, mapInstance]);

  // fetch tourist spots for a selected search result (example local api)
  useEffect(() => {
    if (!searchResult) return setTouristSpots([]);
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/location-info?lat=${searchResult.lat}&lon=${searchResult.lng}`);
        const data = await res.json();
        if (mounted) setTouristSpots(data.places || []);
      } catch (err) {
        console.error("fetchTouristSpots error", err);
      }
    })();
    return () => { mounted = false; };
  }, [searchResult]);

  // fetch search suggestions (Nominatim)
  async function fetchSuggestions(query: string) {
    setSearchQuery(query);
    if (!query) return setSuggestions([]);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const d = await r.json();
      setSuggestions(d.slice(0, 6));
    } catch (err) {
      console.error("suggestions error", err);
    }
  }

  async function handleSelectSuggestion(s: any) {
    const result = { lat: parseFloat(s.lat), lng: parseFloat(s.lon), displayName: s.display_name };
    setSearchResult(result);
    setMapCenter([result.lat, result.lng]);
    setSuggestions([]);
    setRouteCoords([]);
    setDistance(null);
    // close sidebar on mobile for better map view
    setSidebarOpen(false);
  }

  async function fetchRoute(start: [number, number], end: [number, number]) {
    if (!start || !end) return;
    try {
      const apiKey = ""; // <- set your ORS / routing API key
      const res = await fetch(
        `https://api.openrouteservice.org/v2/directions/${travelMode}?api_key=${apiKey}&start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`
      );
      const data = await res.json();
      if (data.features?.[0]?.geometry?.coordinates) {
        const coords = data.features[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
        setRouteCoords(coords);
        setDistance(data.features[0].properties.summary.distance / 1000);
      }
    } catch (err) {
      console.error("Route fetch error:", err);
      alert("Error fetching route. Check console and API key.");
    }
  }

  async function handleStartRoute() {
    if (location && searchResult) {
      await fetchRoute([location.latitude, location.longitude], [searchResult.lat, searchResult.lng]);
      // focus map on route midpoint
      if (mapInstance && routeCoords.length === 0) {
        mapInstance.setView([searchResult.lat, searchResult.lng], 13);
      }
    } else {
      alert("Select a search result and ensure location is detected.");
    }
  }

  const getZoneColor = (level: string) => {
    switch (level) {
      case "safe": return "#10b981";
      case "moderate": return "#f59e0b";
      case "warning": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "#10b981";
      case "medium": return "#f59e0b";
      case "high": return "#ef4444";
      default: return "#6b7280";
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] w-full rounded-lg overflow-hidden shadow-lg">
      {/* Sidebar (collapsible on small screens) */}
      <div className={`bg-white/95 backdrop-blur-md p-3 md:p-4 z-20 md:relative absolute inset-x-0 top-0 md:top-auto md:left-auto md:w-80 transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-y-0" : "-translate-y-full md:translate-y-0"}`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Safety Map</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <Button variant="outline" size="sm" onClick={getCurrentLocation} className="flex-1 flex items-center justify-center gap-2">
            <Navigation className="h-4 w-4" /> My Location
          </Button>
          <Button variant="outline" size="sm" className="hidden md:flex" onClick={() => setSidebarOpen((s) => !s)}>
            Menu
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <div className="flex items-center bg-white rounded-full shadow px-3 py-2">
            <Search className="h-5 w-5 text-gray-500 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => fetchSuggestions(e.target.value)}
              placeholder="Search for a place..."
              className="flex-1 border-none focus:ring-0 text-sm outline-none w-full"
            />
            {searchQuery && (
              <button className="ml-2 text-xs text-muted-foreground" onClick={() => { setSearchQuery(""); setSuggestions([]); }}>
                Clear
              </button>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 bg-white shadow-md rounded-md overflow-hidden max-h-60 overflow-y-auto mt-2 z-30">
              {suggestions.map((s, i) => (
                <div key={i} className="p-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => handleSelectSuggestion(s)}>
                  {s.display_name}
                </div>
              ))}
            </div>
          )}

          {searchResult && (
            <div className="mt-2">
              <Button onClick={handleStartRoute} className="w-full">Start Route {distance && `(Distance: ${distance.toFixed(2)} km)`}</Button>
            </div>
          )}
        </div>

        {/* Travel Mode */}
        <div className="flex flex-col gap-2 mb-3">
          <span className="text-sm font-medium">Travel Mode</span>
          <div className="flex gap-2">
            {(["driving-car", "foot-walking", "cycling-regular"] as const).map((mode) => (
              <Button key={mode} variant={travelMode === mode ? "default" : "outline"} size="sm" onClick={() => setTravelMode(mode)}>
                {mode.split("-")[0]}
              </Button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 mb-3">
          <span className="text-sm font-medium">Filters</span>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showIncidents} onChange={() => setShowIncidents(!showIncidents)} /> Show Incidents</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showSafetyZones} onChange={() => setShowSafetyZones(!showSafetyZones)} /> Show Safety Zones</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showTouristSpots} onChange={() => setShowTouristSpots(!showTouristSpots)} /> Show Tourist Spots</label>
        </div>

        {/* Analytics */}
        {distance && (
          <div className="mt-2 p-2 bg-white rounded-lg shadow-sm text-sm">
            <p>Distance: {distance.toFixed(2)} km</p>
            <p>Estimated ETA: {(distance / 40 * 60).toFixed(0)} min (assuming 40 km/h)</p>
            <p>Route Risk Level: {searchRisk?.level ?? "Unknown"}</p>
          </div>
        )}

        {/* footer spacing so content doesn't touch mobile edges */}
        <div className="h-2" />
      </div>

      {/* Floating toggle button for mobile */}
      <div className="absolute left-3 top-3 z-30 md:hidden">
        <Button size="sm" onClick={() => setSidebarOpen(true)}>
          Menu
        </Button>
      </div>

      {/* Map area */}
      <div className="flex-1 relative md:relative h-[60vh] md:h-full">
       <MapContainer
  ref={(mapRef) => {
    if (mapRef && !mapInstance) {
      setMapInstance(mapRef);
    }
  }}
  center={mapCenter}
  zoom={14}
  className="h-full w-full"
  scrollWheelZoom={true}
>


          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Street Map">
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles © Esri" />
            </LayersControl.BaseLayer>
          </LayersControl>

          <MapEvents onClick={(lat, lng) => { setMapCenter([lat, lng]); onLocationChange?.(lat, lng); }} />

          {/* User */}
          {location && (
            <>
              <Circle center={[location.latitude, location.longitude]} radius={300} pathOptions={{ fillColor: getZoneColor(userRisk?.level ?? "safe"), fillOpacity: 0.25, color: getZoneColor(userRisk?.level ?? "safe"), weight: 2 }} />
              <Marker position={[location.latitude, location.longitude]} icon={userIcon}>
                <Popup>
                  <div className="p-2 space-y-1">
                    <h3 className="font-semibold text-primary">Your Location</h3>
                    <p className="text-sm text-muted-foreground">{location.address ?? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}</p>
                    <Badge variant="outline" className="text-xs">Safety Level: {userRisk?.level ?? "Unknown"}</Badge>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Search result */}
          {searchResult && (
            <Marker position={[searchResult.lat, searchResult.lng]} icon={searchIconMarker}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{searchResult.displayName}</h3>
                  <Badge variant="outline" className="text-xs">Risk Level: {searchRisk?.level ?? "Unknown"}</Badge>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route */}
          {routeCoords.length > 0 && <Polyline positions={routeCoords} color="#3b82f6" weight={4} />}

          {/* Safety zones */}
          {showSafetyZones && safetyZones.map((zone) => (
            <React.Fragment key={zone.id}>
              <Circle center={[zone.lat, zone.lng]} radius={zone.radius} pathOptions={{ fillColor: getZoneColor(zone.level), fillOpacity: 0.2, color: getZoneColor(zone.level), weight: 2 }} />
              <Marker position={[zone.lat, zone.lng]} icon={safeZoneIcon}>
                <Popup>
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2"><Shield className="h-4 w-4 text-success" /><h3 className="font-semibold">{zone.name}</h3></div>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">Safety Level: {zone.level}</Badge>
                      <div className="flex items-center gap-1 text-sm"><Users className="h-3 w-3" /><span>{zone.touristCount} tourists nearby</span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

          {/* Tourist spots */}
          {showTouristSpots && touristSpots.map((spot) => (
            <Marker key={spot.xid ?? `${spot.lat}_${spot.lon}`} position={[spot.lat, spot.lon]} icon={createCustomIcon("#fbbf24")}> 
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{spot.name}</h3>
                  {spot.img && <img src={spot.img} alt={spot.name} className="w-full h-24 object-cover rounded-md my-1" />}
                  <p className="text-sm">{spot.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Incidents */}
          {showIncidents && incidents.map((incident) => (
            <Marker key={incident.id} position={[incident.lat, incident.lng]} icon={incidentIcon}>
              <Popup>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-warning" /><h3 className="font-semibold">{incident.type}</h3></div>
                  <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs" style={{ color: getSeverityColor(incident.severity) }}>{incident.severity} severity</Badge>
                    <span className="text-xs text-muted-foreground">{incident.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

