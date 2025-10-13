import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth";
import { fetchCrimeRisk } from "../services/crime";
import { fetchWeather } from "../services/weather";

const router = Router();

router.get("/", authenticateJWT, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and longitude required" });
    }

    const crimeData = await fetchCrimeRisk(latitude.toString(), longitude.toString());
    const weatherData = await fetchWeather(latitude.toString(), longitude.toString());

    res.json({
      location: { latitude, longitude },
      crime: crimeData,
      weather: weatherData,
    });
  } catch (err) {
    console.error("Location error:", err);
    res.status(500).json({ error: "Failed to fetch location data" });
  }
});

export default router;
