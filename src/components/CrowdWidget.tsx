import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  CheckCircle,
  Info,
} from "lucide-react";

// Extra features
import LocationShare from "./locationShare";
import CompanionFinder from "./comapanionFinder";

interface CrowdData {
  currentLevel: "low" | "medium" | "high" | "very-high";
  currentCount: number;
  maxCapacity: number;
  trend: "increasing" | "decreasing" | "stable";
  peakTime: string;
  hourlyPrediction: Array<{
    hour: string;
    level: number;
    count: number;
  }>;
  nearbyHotspots: Array<{
    name: string;
    distance: string;
    crowdLevel: "low" | "medium" | "high" | "very-high";
  }>;
}

interface CrowdWidgetProps {
  lat?: number;
  lng?: number;
}

const CrowdWidget: React.FC<CrowdWidgetProps> = ({ lat, lng }) => {
  const [crowdData, setCrowdData] = useState<CrowdData>({
    currentLevel: "medium",
    currentCount: 1250,
    maxCapacity: 2000,
    trend: "increasing",
    peakTime: "2:00 PM - 4:00 PM",
    hourlyPrediction: [],
    nearbyHotspots: [],
  });

  const [showShare, setShowShare] = useState(false);
  const [showCompanion, setShowCompanion] = useState(false);

  // Real-time updater
  useEffect(() => {
    if (lat && lng) {
      const updateData = () => {
        const now = new Date();
        const currentHour = now.getHours();

        const simulatedData: CrowdData = {
          currentLevel: ["low", "medium", "high", "very-high"][Math.floor(Math.random() * 4)] as any,
          currentCount: Math.round(500 + Math.random() * 1500),
          maxCapacity: 2000,
          trend: ["increasing", "decreasing", "stable"][Math.floor(Math.random() * 3)] as any,
          peakTime: ["12–2 PM", "2–4 PM", "6–8 PM"][Math.floor(Math.random() * 3)],
          hourlyPrediction: Array.from({ length: 6 }, (_, i) => {
            const hour = (currentHour + i) % 24;
            const label = `${hour % 12 || 12}${hour < 12 ? "AM" : "PM"}`;
            return {
              hour: label,
              level: Math.round(40 + Math.random() * 60),
              count: Math.round(800 + Math.random() * 1200),
            };
          }),
          nearbyHotspots: [
            { name: "Tourist Attraction A", distance: "0.3 km", crowdLevel: "low" },
            { name: "Shopping District", distance: "0.7 km", crowdLevel: "medium" },
            { name: "Restaurant Area", distance: "1.1 km", crowdLevel: "high" },
          ],
        };

        setCrowdData(simulatedData);
      };

      updateData();
      const interval = setInterval(updateData, 60_000); // refresh every minute
      return () => clearInterval(interval);
    }
  }, [lat, lng]);

  const crowdPercentage = (crowdData.currentCount / crowdData.maxCapacity) * 100;

  const levelColors: Record<string, string> = {
    low: "bg-green-500/20 text-green-700 border-green-500/40",
    medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/40",
    high: "bg-red-500/20 text-red-700 border-red-500/40",
    "very-high": "bg-red-600/20 text-red-800 border-red-600/40",
  };

  const trendIcon = {
    increasing: <TrendingUp className="h-4 w-4 text-red-500" />,
    decreasing: <TrendingDown className="h-4 w-4 text-green-500" />,
    stable: <Users className="h-4 w-4 text-blue-500" />,
  };

  return (
    <Card className="rounded-2xl shadow-lg border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <Users className="h-5 w-5 text-indigo-600" />
          Crowd Insights
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Crowd */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {crowdData.currentCount.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">people now</p>
          </div>
          <div className="text-right">
            <Badge className={levelColors[crowdData.currentLevel]}>
              {crowdData.currentLevel.toUpperCase()}
            </Badge>
            <div className="flex items-center justify-end gap-1 text-sm text-gray-600 mt-1">
              {trendIcon[crowdData.trend]}
              {crowdData.trend}
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Capacity</span>
            <span>{crowdPercentage.toFixed(0)}% full</span>
          </div>
          <Progress value={crowdPercentage} className="h-2 bg-gray-200" />
        </div>

        {/* Peak Time */}
        <div className="p-3 bg-indigo-50 rounded-lg">
          <div className="flex items-center gap-2 text-indigo-700 mb-1">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Peak Hours</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{crowdData.peakTime}</p>
          <p className="text-xs text-gray-500">Expect the heaviest footfall</p>
        </div>

        {/* Hourly Forecast */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Next 6 Hours</h4>
          <div className="grid grid-cols-6 gap-2">
            {crowdData.hourlyPrediction.map((p, i) => (
              <div key={i} className="text-center">
                <p className="text-xs text-gray-500">{p.hour}</p>
                <div className="h-12 bg-gray-200 rounded flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded transition-all"
                    style={{ height: `${p.level}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-gray-600 mt-1">{p.level}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Hotspots */}
        <div>
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <MapPin className="h-4 w-4 text-indigo-600" />
            <span className="font-medium text-sm">Nearby Hotspots</span>
          </div>
          <div className="space-y-2">
            {crowdData.nearbyHotspots.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{h.name}</p>
                  <p className="text-xs text-gray-500">{h.distance}</p>
                </div>
                <Badge className={`text-xs ${levelColors[h.crowdLevel]}`}>
                  {h.crowdLevel.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tips</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {crowdData.currentLevel === "high" && (
              <li className="flex items-center gap-2">
                <Info className="h-4 w-4 text-yellow-600" />
                Consider visiting during off-peak hours
              </li>
            )}
            {crowdData.trend === "increasing" && (
              <li className="flex items-center gap-2">
                <Info className="h-4 w-4 text-red-600" />
                Crowds are growing — plan ahead
              </li>
            )}
            {crowdData.currentLevel === "low" && (
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Great time to explore — fewer crowds!
              </li>
            )}
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-indigo-600" />
              Best times: Early morning or late evening
            </li>
          </ul>
        </div>

        {/* Extra Features */}
        <div className="mt-4 space-y-3">
          <button
            onClick={() => setShowShare((s) => !s)}
            className="w-full px-3 py-2 rounded-lg border bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium"
          >
            {showShare ? "Hide" : "Share Location with Family"}
          </button>
          {showShare && (
            <LocationShare
              family={[
                { id: "1", name: "Mom" },
                { id: "2", name: "Brother" },
              ]}
            />
          )}

          <button
            onClick={() => setShowCompanion((s) => !s)}
            className="w-full px-3 py-2 rounded-lg border bg-green-50 hover:bg-green-100 text-green-700 font-medium"
          >
            {showCompanion ? "Hide" : "Find a Companion"}
          </button>
          {showCompanion && (
            <CompanionFinder onSelect={(c) => console.log("Companion selected", c)} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CrowdWidget;
