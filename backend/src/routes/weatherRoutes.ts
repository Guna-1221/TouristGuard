import express from "express";
import axios from "axios";

const router = express.Router();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || "";

router.get("/weather", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "Missing lat/lon" });

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const data = response.data;
    res.json({ weather: data.weather[0].main, temp: data.main.temp });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

export default router;
