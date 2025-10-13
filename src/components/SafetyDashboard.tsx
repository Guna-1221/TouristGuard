import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, MapPin, Phone, RefreshCw, Users, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useLocation from "@/hooks/useLocation";
import { useToast } from "@/hooks/use-toast";
import MapView from "@/components/MapView";
import WeatherWidget from "@/components/WeatherWidget";
import CrowdWidget from "@/components/CrowdWidget";
import GoogleMapsView from "./GoogleMapsView";

// Widget definitions
const widgets = [
  { id: "map", title: "Interactive Map", image: "map.jpg", component: (props: any) => <MapView {...props} /> },
  { id: "weather", title: "Weather", image: "weather.jpg", component: (props: any) => <WeatherWidget {...props} /> },
  { id: "crowd", title: "Crowd Insights", image: "crowd.jpg", component: (props: any) => <CrowdWidget {...props} /> },
  { id: "ai", title: "AI Insights", image: "insight.jpg", component: () => (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">AI Threat Assessment</h2>
        <ul className="space-y-2">
          <li className="bg-green-100 p-2 rounded">Crime Rate Analysis → Low Risk</li>
          <li className="bg-yellow-100 p-2 rounded">Weather Conditions → Monitor</li>
          <li className="bg-green-100 p-2 rounded">Crowd Density → Normal</li>
        </ul>
      </div>
    )
  },
];

const SafetyDashboard: React.FC = () => {
  const { location, error, loading, refreshLocation, calculateNearbyTourists } = useLocation();
  const { toast } = useToast();

  const [safetyStatus, setSafetyStatus] = useState<"safe" | "warning" | "danger">("safe");
  const [nearbyTourists, setNearbyTourists] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showCompanion, setShowCompanion] = useState(false);
  const [openToConnect, setOpenToConnect] = useState(false);
  const [companions, setCompanions] = useState<{ id: string; name: string; distance: string; open: boolean }[]>([]);

  // Update tourists + status whenever location changes
  useEffect(() => {
    if (!location) return;

    const tourists = calculateNearbyTourists();
    setNearbyTourists(tourists);

    if (tourists > 100) setSafetyStatus("safe");
    else if (tourists > 50) setSafetyStatus("warning");
    else setSafetyStatus("danger");
  }, [location, calculateNearbyTourists]); // calculateNearbyTourists is memoized in the hook

  const getStatusConfig = () => {
    switch (safetyStatus) {
      case "safe": return { text: "All Clear", percent: 98, color: "bg-green-500" };
      case "warning": return { text: "Caution Advised", percent: 72, color: "bg-yellow-500" };
      case "danger": return { text: "High Alert", percent: 31, color: "bg-red-500" };
      default: return { text: "All Clear", percent: 98, color: "bg-green-500" };
    }
  };
  const statusConfig = getStatusConfig();

  const handleEmergencyCall = () => {
    toast({
      title: "Emergency Call Initiated",
      description: "Connecting to local emergency services...",
      variant: "destructive",
    });
  };

  const handleFindCompanions = () => {
    setShowCompanion(true);
    const nearby = [
      { id: "1", name: "Alice", distance: "200m", open: true },
      { id: "2", name: "Ravi", distance: "350m", open: false },
      { id: "3", name: "Sara", distance: "500m", open: true },
    ];
    setCompanions(nearby);
  };

  const getCurrentLocationText = () => {
    if (loading) return "Detecting location...";
    if (error) return "Location unavailable";
    return location?.address || location?.city || "Unknown location";
  };

  return (
    <div className="min-h-screen p-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 rounded-3xl gap-3 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
        <div className="flex items-center gap-3">
          <Shield className="text-primary h-10 w-10 sm:h-12 sm:w-12" />
          <div>
            <h1 className="font-bold text-xl sm:text-4xl">Safety Command Center</h1>
            <p className="hidden sm:block text-muted-foreground mt-1 font-mono text-sm sm:text-lg">
              Real-time AI-powered safety monitoring
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap items-start sm:items-center">
          <Badge variant="outline" className="flex items-center gap-1 text-xs sm:text-sm rounded-full px-3 py-1 bg-white/20 backdrop-blur-md">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" /> {getCurrentLocationText()}
          </Badge>
          <Button size="sm" variant="ghost" onClick={refreshLocation} disabled={loading} className="rounded-full bg-cyan-500/80 hover:bg-cyan-500 text-white">
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" variant="destructive" onClick={handleEmergencyCall} className="rounded-full bg-red-500/90 hover:bg-red-600 text-white">
            <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Emergency
          </Button>
        </div>
      </div>

      {/* Safety Status */}
      <Card className={`rounded-3xl p-4 sm:p-6 mt-4 text-white shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 ${statusConfig.color}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="font-bold text-lg sm:text-3xl">{statusConfig.text}</h2>
            {!loading && <p className="text-sm sm:text-base text-white/90">Nearby tourists: {nearbyTourists}</p>}
          </div>
          {!loading && (
            <div className="mt-3 sm:mt-0 text-right">
              <div className="text-2xl sm:text-6xl font-bold">{statusConfig.percent}%</div>
              <p className="text-xs sm:text-base text-white/80">Safety Score</p>
            </div>
          )}
        </div>
      </Card>

      {/* Share & Companion Buttons */}
     {/* Share & Companion Buttons */}
<div className="flex flex-wrap gap-3 mt-6">
  <div className="relative">
    <Button
      onClick={() => setShowShare((s) => !s)}
      size="sm"
      className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-gray-50 flex items-center gap-2 px-4 py-2"
    >
      <Share2 className="h-4 w-4" /> Share
    </Button>
    {showShare && (
      <div className="absolute top-full mt-2 left-0 w-64 p-3 rounded-xl bg-white/20 backdrop-blur-md text-sm text-white shadow-md z-10">
        Sharing your live location with family members...
      </div>
    )}
  </div>

  <div className="relative">
    <Button
      onClick={handleFindCompanions}
      size="sm"
      className="rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-4 py-2"
    >
      <Users className="h-4 w-4" /> Companion
    </Button>
    {showCompanion && (
      <div className="absolute top-full mt-2 left-0 w-72 p-3 rounded-xl bg-white/20 backdrop-blur-md text-sm text-white shadow-md z-10">
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={openToConnect}
            onChange={(e) => setOpenToConnect(e.target.checked)}
            className="accent-green-400"
          />
          I’m open to connect
        </label>
        <div className="space-y-2 max-h-48 overflow-auto">
          {companions.filter(c => c.open).map(c => (
            <div key={c.id} className="p-2 rounded-lg bg-black/20 flex justify-between items-center">
              <span>{c.name} • {c.distance}</span>
              <Button size="xl" className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-2 py-1">
                Connect
              </Button>
            </div>
          ))}
          {!companions.some(c => c.open) && <p className="text-gray-200 text-sm">No open companions nearby.</p>}
        </div>
      </div>
    )}
  </div>
</div>


      {/* Widgets */}
      <div className="flex space-x-6 overflow-x-auto no-scrollbar py-4 px-2">
        {widgets.map(w => (
          <motion.div key={w.id} className="relative min-w-[300px] h-[200px] rounded-2xl shadow-lg cursor-pointer overflow-hidden group"
            whileHover={{ scale: 1.05 }} onClick={() => setActive(w.id)}>
            <img src={w.image} alt={w.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
            <h2 className="absolute bottom-4 left-4 text-white text-xl font-bold drop-shadow-lg">{w.title}</h2>
          </motion.div>
        ))}
      </div>

      {/* Expanded Widget */}
      <AnimatePresence>
        {active && (
          <motion.div key="expanded" className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
            <motion.div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-3xl shadow-2xl w-[90%] h-[80%] overflow-auto"
              initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeInOut" }} onClick={e => e.stopPropagation()}>
              {widgets.find(w => w.id === active)?.component({ lat: location?.latitude, lng: location?.longitude })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SafetyDashboard;
