// backend/src/routes/safetyAnalyticsRoutes.ts
import { Router, Request, Response } from "express";
import axios from "axios";
import { getStateFromCoordinates, getFamousPlacesForState } from "./placesRoutes"; // reuse your helper functions

const router = Router();

// Simulated crime, crowd & weather data (replace with real DB or API later)
const simulatedData = {
  crimes: ["theft", "assault", "medical", "lost_person"],
  weather: ["rain", "sunny", "hot", "storm"],
  crowdLevels: ["low", "medium", "high"]
};

// Helper to generate random number within a range
const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Main endpoint
router.get("/", async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat and lon are required" });

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    // 1. Get the state name from coordinates
    const state = await getStateFromCoordinates(latitude, longitude);

    // 2. Get famous places in the state
    const hotspots = await getFamousPlacesForState(state);

    // 3. Generate dynamic analytics
    const totalReports = randomBetween(100, 300);
    const resolvedIncidents = randomBetween(80, totalReports);
    const avgResponseTime = (randomBetween(3, 10) + Math.random()).toFixed(1) + " mins";
    const safetyScore = Math.max(50, 100 - (totalReports - resolvedIncidents));
    const weeklyReports = randomBetween(5, 20);

    // Format hotspots data
    const hotspotData = hotspots.slice(0, 5).map((place: any) => ({
      location: place.name,
      incidents: randomBetween(1, 20),
      trend: ["up", "down", "stable"][randomBetween(0,2)]
    }));

    // Generate recent incidents
    const recentIncidents = Array.from({ length: 5 }, () => ({
      type: simulatedData.crimes[randomBetween(0, simulatedData.crimes.length - 1)],
      time: `${randomBetween(1, 12)} hours ago`,
      status: ["resolved", "investigating"][randomBetween(0,1)],
      severity: ["low", "medium", "high"][randomBetween(0,2)]
    }));

    // AI insights
    const aiInsights = [
      {
        title: "Safety Improvement Detected",
        description: `${hotspotData[0]?.location || state} incidents decreased by ${randomBetween(10,50)}% after enhanced patrols.`,
        type: "success"
      },
      {
        title: "Tourist Flow Pattern",
        description: `Peak safety concerns occur between 2-4 PM. Monitor high crowd areas.`,
        type: "info"
      },
      {
        title: "Weather Alert Correlation",
        description: `Incidents increase during ${simulatedData.weather[randomBetween(0,3)]} days. Take precautions.`,
        type: "warning"
      }
    ];

    // Respond with structured analytics
    res.json({
      safetyScore,
      safetyTrend: "+2%", // placeholder, can calculate dynamically
      totalReports,
      weeklyReports,
      resolvedIncidents,
      avgResponseTime,
      responseTrend: "+10%", // placeholder
      hotspots: hotspotData,
      recentIncidents,
      aiInsights
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch safety analytics" });
  }
});

export default router;
