import React, { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { Search, CloudSun, MessageCircle, MapPin, Clock, X } from "lucide-react";
import WeatherWidget from "@/components/WeatherWidget";
const ChatbotWidget = React.lazy(() => import("@/components/ChatbotWidget"));
const API_URL = import.meta.env.VITE_API_URL;
interface TouristSpot {
  xid?: string;
  name: string;
  lat?: number;
  lon?: number;
  img?: string;
  description?: string;
  bestTime?: string;
  photos?: string[];
}

const fallbackSpots: TouristSpot[] = [
  { name: "Taj Mahal", lat: 27.1751, lon: 78.0421 },
  { name: "Gateway of India", lat: 18.922, lon: 72.8347 },
  { name: "Jaipur City Palace", lat: 26.9258, lon: 75.8237 },
  { name: "Hampi", lat: 15.335, lon: 76.46 },
];

const HomePage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<TouristSpot | null>(null);
  const [showWeather, setShowWeather] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
      },
      () => setSpots(fallbackSpots)
    );
  }, []);
const API_URL = import.meta.env.VITE_API_URL;
  // Fetch spots only when coords change
  useEffect(() => {
    if (!coords) return;

    const fetchNearbySpots = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/location-info?lat=${coords.lat}&lon=${coords.lon}`
        );
        const data = await res.json();
        if (Array.isArray(data.places) && data.places.length > 0) {
          setSpots(data.places);
        } else {
          setSpots(fallbackSpots);
        }
      } catch (err) {
        console.error(err);
        setSpots(fallbackSpots);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbySpots();
  }, [coords]);

  // Handle search -> refetch only when coords exist
  const handleSearch = useCallback(async () => {
  if (!query) return; // don't search empty
  setLoading(true);

  try {
    // Step 1: Get coordinates of searched place
    const geoRes = await fetch(
      `${API_URL}/api/place-geocode?name=${encodeURIComponent(query)}`
    );
    const geoData = await geoRes.json();

    if (!geoData?.lat || !geoData?.lon) {
      setSpots([]); // no data found
      return;
    }

    // Step 2: Fetch famous places around that location
    const placesRes = await fetch(
      `${API_URL}/api/location-info?lat=${geoData.lat}&lon=${geoData.lon}`
    );
    const placesData = await placesRes.json();

    if (Array.isArray(placesData.places) && placesData.places.length > 0) {
      setSpots(placesData.places);
    } else {
      setSpots([]); // no spots found
    }
  } catch (err) {
    console.error(err);
    setSpots([]);
  } finally {
    setLoading(false);
  }
}, [query]);


  // Handle horizontal scroll to load more items
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    if (scrollLeft + clientWidth >= scrollWidth - 10) {
      // Load 2 more spots
      setVisibleCount((prev) => Math.min(prev + 2, spots.length));
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b">
      {/* Title */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          Discover <span className="text-blue-600">Tourist Spots</span>
        </h1>
        <p className="text-gray-600 text-lg">
          Explore destinations and check details.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center w-full max-w-lg rounded-full shadow-md overflow-hidden border border-gray-200 bg-white">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a city or state..."
            className="flex-1 p-3 text-base text-black bg-transparent outline-none"
          />
          <button
            onClick={handleSearch}
            className="p-3 bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {loading ? "..." : <Search className="w-5 h-5" />}
          </button>
        </div>
      </div>
{/* Horizontal scroll of spots */} <div className="flex overflow-x-auto space-x-4 px-6 py-4"> {spots.map((spot, idx) => ( <div key={idx} onClick={() => setSelectedSpot(spot)} className="w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300 bg-white" > {/* Image with fixed aspect ratio */} <div className="w-full aspect-[4/3]"> <img src={spot.img || "/default-spot.jpg"} alt={spot.name} className="w-full h-full object-cover" /> </div> <div className="p-3"> <h3 className="font-semibold text-lg mb-1">{spot.name}</h3> {spot.description && ( <p className="text-gray-600 text-sm line-clamp-3"> {spot.description} </p> )} </div> </div> ))} </div>

      {/* Spot Details Modal */}
      {selectedSpot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedSpot(null)}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 shadow-lg"
            >
              <X />
            </button>
            <img
              src={selectedSpot.img || "/default-spot.jpg"}
              alt={selectedSpot.name}
              className="w-full h-64 object-cover rounded-t-2xl"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <MapPin className="text-blue-600" /> {selectedSpot.name}
              </h2>
              {selectedSpot.description && (
                <p className="mb-4 text-gray-700 leading-relaxed">
                  {selectedSpot.description}
                </p>
              )}
              {selectedSpot.bestTime && (
                <p className="mb-3 flex items-center text-sm font-medium text-gray-600">
                  <Clock className="w-4 h-4 mr-1 text-blue-500" />
                  Best time to visit: {selectedSpot.bestTime}
                </p>
              )}
              {selectedSpot.photos && selectedSpot.photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {selectedSpot.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`${selectedSpot.name}-${idx}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weather Widget */}
      {coords && (
        <div className="fixed bottom-4 left-4 z-20">
          <button
            onClick={() => setShowWeather(!showWeather)}
            className="bg-yellow-400 p-3 rounded-full shadow-lg"
          >
            <CloudSun className="h-7 w-7 text-white" />
          </button>
          {showWeather && (
            <div className="mt-2 w-64 md:w-80">
              <WeatherWidget lat={coords.lat} lng={coords.lon} />
            </div>
          )}
        </div>
      )}

      {/* Floating Chatbot */}
      <div className="fixed bottom-4 right-6 z-20">
        <button
          onClick={() => setShowChat(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      </div>
      {showChat && (
        <div className="fixed bottom-16 right-4 w-80 h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-white z-30">
          <Suspense fallback={<div className="p-4">Loading chat...</div>}>
            <ChatbotWidget />
          </Suspense>
          <button
            onClick={() => setShowChat(false)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-lg"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
