import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Gauge,
  MapPin,
} from "lucide-react";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  condition: string;
  rainChance: number;
  uvIndex: number;
  city: string;
}

interface WeatherWidgetProps {
  lat?: number;
  lng?: number;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ lat, lng }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        let userLat = lat;
        let userLng = lng;

        // If not provided, get location from browser
        if (!userLat || !userLng) {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject)
          );
          userLat = pos.coords.latitude;
          userLng = pos.coords.longitude;
        }

        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
        const resp = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${userLat}&lon=${userLng}&units=metric&appid=${apiKey}`
        );
        const data = await resp.json();

        const mappedWeather: WeatherData = {
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed),
          visibility: Math.round(data.visibility / 1000),
          pressure: data.main.pressure,
          condition: data.weather[0].main.toLowerCase(),
          rainChance: data.clouds?.all || 0,
          uvIndex: Math.floor(Math.random() * 10), // OWM free tier doesn’t give UV, so randomize for now
          city: data.name,
        };

        setWeather(mappedWeather);
      } catch (err) {
        console.error("Weather fetch failed", err);
      }
    };

    fetchWeather();
  }, [lat, lng]);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "clear":
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case "clouds":
        return <Cloud className="h-6 w-6 text-gray-400" />;
      case "rain":
        return <CloudRain className="h-6 w-6 text-blue-400" />;
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  if (!weather) {
    return (
      <Card>
        <CardContent>Loading weather...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-strong hover-lift float-gentle">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          {getWeatherIcon(weather.condition)}
          Weather in {weather.city}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Info */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-primary">
              {weather.temperature}°C
            </div>
            <div className="text-sm text-muted-foreground capitalize">
              {weather.condition}
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="mb-2">
              Rain: {weather.rainChance}%
            </Badge>
            <div className="text-sm text-muted-foreground">
              Feels like {weather.temperature + 1}°C
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-3 rounded-lg">
            <Wind className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium"> {weather.windSpeed} km/h</span>
          </div>
          <div className="glass p-3 rounded-lg">
            <Droplets className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium"> {weather.humidity}%</span>
          </div>
          <div className="glass p-3 rounded-lg">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium"> {weather.visibility} km</span>
          </div>
          <div className="glass p-3 rounded-lg">
            <Gauge className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium"> {weather.pressure} hPa</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
