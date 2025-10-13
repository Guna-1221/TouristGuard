import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Eye, 
  Gauge, 
  RefreshCw,
  MapPin,
  Thermometer,
  CloudSnow,
  CloudDrizzle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  condition: string;
  description: string;
  rainChance: number;
  uvIndex: number;
  cityName: string;
  feelsLike: number;
}

interface EnhancedWeatherWidgetProps {
  lat?: number;
  lng?: number;
}

const EnhancedWeatherWidget: React.FC<EnhancedWeatherWidgetProps> = ({ lat, lng }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWeatherData = async (latitude?: number, longitude?: number) => {
    if (!latitude || !longitude) return;

    setLoading(true);
    setError(null);
const API_URL = import.meta.env.VITE_API_URL;
    try {

      const response = await fetch(`${API_URL}/api/weather?lat=${latitude}&lng=${longitude}`);
      if (!response.ok) throw new Error(`Backend error: ${response.status}`);

      const data = await response.json();

      if (data?.weather) {
        setWeather(data.weather);
      } else {
        throw new Error('No weather data received');
      }

    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setError(err.message || 'Failed to fetch weather data');

      toast({
        title: "Weather Update Failed",
        description: "Using cached data. Check your connection and try again.",
        variant: "destructive",
      });

      // Fallback cached data
      if (!weather) {
        setWeather({
          temperature: 22,
          humidity: 65,
          windSpeed: 12,
          visibility: 10,
          pressure: 1013,
          condition: 'partly-cloudy',
          description: 'Partly cloudy',
          rainChance: 25,
          uvIndex: 6,
          cityName: 'Your Location',
          feelsLike: 24
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lat && lng) fetchWeatherData(lat, lng);
  }, [lat, lng]);

  const handleRefresh = () => {
    if (lat && lng) fetchWeatherData(lat, lng);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun className="h-6 w-6 text-warning" />;
      case 'clouds':
      case 'cloudy':
        return <Cloud className="h-6 w-6 text-muted-foreground" />;
      case 'rain':
      case 'rainy':
        return <CloudRain className="h-6 w-6 text-primary" />;
      case 'drizzle':
        return <CloudDrizzle className="h-6 w-6 text-primary" />;
      case 'snow':
        return <CloudSnow className="h-6 w-6 text-info" />;
      default:
        return <Sun className="h-6 w-6 text-warning" />;
    }
  };

  const getConditionText = (condition: string, description: string) =>
    description.charAt(0).toUpperCase() + description.slice(1);

  const getUVLevel = (index: number) => {
    if (index <= 2) return { level: 'Low', color: 'success' };
    if (index <= 5) return { level: 'Moderate', color: 'warning' };
    if (index <= 7) return { level: 'High', color: 'error' };
    if (index <= 10) return { level: 'Very High', color: 'error' };
    return { level: 'Extreme', color: 'error' };
  };

  const getTravelAdvice = (weather: WeatherData) => {
    const advice = [];
    if (weather.rainChance > 60) advice.push({ icon: <CloudRain className="h-3 w-3" />, text: 'Bring an umbrella' });
    if (weather.uvIndex > 6) advice.push({ icon: <Sun className="h-3 w-3" />, text: 'Use sunscreen' });
    if (weather.windSpeed > 15) advice.push({ icon: <Wind className="h-3 w-3" />, text: 'Windy conditions' });
    if (weather.temperature < 10) advice.push({ icon: <Thermometer className="h-3 w-3" />, text: 'Dress warmly' });
    if (weather.visibility < 5) advice.push({ icon: <Eye className="h-3 w-3" />, text: 'Low visibility - drive carefully' });
    return advice;
  };

  if (!weather && !loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Cloud className="h-12 w-12 mx-auto mb-4" />
          <p>Weather data unavailable</p>
          <p className="text-sm">Enable location to see weather</p>
        </div>
      </Card>
    );
  }

  const uvInfo = weather ? getUVLevel(weather.uvIndex) : { level: 'Low', color: 'success' };
  const travelAdvice = weather ? getTravelAdvice(weather) : [];

  return (
    <Card className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 p-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            {weather ? getWeatherIcon(weather.condition) : <Cloud className="h-6 w-6" />}
            Weather Forecast
            {error && <Badge variant="outline" className="text-xs text-warning">Cached</Badge>}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || !lat || !lng}
            className="rounded-full hover-scale"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {weather?.cityName && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />{weather.cityName}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Fetching weather data...</p>
            </div>
          </div>
        )}

        {weather && !loading && (
          <>
            {/* Main Weather */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-primary">{weather.temperature}°C</div>
                <div className="text-sm text-muted-foreground">{getConditionText(weather.condition, weather.description)}</div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-2">Rain: {weather.rainChance}%</Badge>
                <div className="text-sm text-muted-foreground">Feels like {weather.feelsLike}°C</div>
              </div>
            </div>

            {/* Weather Details */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Wind className="h-4 w-4 text-primary" />, label: "Wind", value: `${weather.windSpeed} km/h` },
                { icon: <Droplets className="h-4 w-4 text-primary" />, label: "Humidity", value: `${weather.humidity}%` },
                { icon: <Eye className="h-4 w-4 text-primary" />, label: "Visibility", value: `${weather.visibility} km` },
                { icon: <Gauge className="h-4 w-4 text-primary" />, label: "Pressure", value: `${weather.pressure} hPa` },
              ].map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="text-lg font-semibold">{item.value}</div>
                </div>
              ))}
            </div>

            {/* UV Index */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">UV Index</span>
                </div>
                <Badge variant="outline" className={`text-${uvInfo.color}`}>{uvInfo.level}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold">{weather.uvIndex}/11</div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(weather.uvIndex / 11) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Travel Tips */}
            {travelAdvice.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                <h4 className="font-medium mb-2 text-sm">Travel Tips</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {travelAdvice.map((tip, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {tip.icon}
                      <span>{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {error && !loading && weather && (
          <div className="bg-warning/10 p-3 rounded-2xl">
            <p className="text-xs text-warning">⚠️ Showing cached data - refresh to get latest weather</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedWeatherWidget;
