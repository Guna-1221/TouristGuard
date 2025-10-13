import axios from "axios";
import { config } from "../config/env";

export const fetchWeather = async (lat: string, lon: string) => {
  if (!config.WEATHER_API_KEY) {
    return { error: "No weather API key configured" };
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${config.WEATHER_API_KEY}&units=metric`;

  try {
    const { data } = await axios.get(url);
    return {
      temperature: data.main.temp,
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
    };
  } catch (err) {
    console.error("Weather fetch error:", err);
    return { error: "Failed to fetch weather data" };
  }
};
