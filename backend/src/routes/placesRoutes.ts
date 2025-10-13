import { Router, Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY || "";

// ----------------------
// Cache Setup (24h TTL)
// ----------------------
const CACHE_TTL = 24 * 60 * 60 * 1000;
const nominatimCache = new Map<string, { state: string; timestamp: number }>();
const placesCache = new Map<string, { data: any; timestamp: number }>();
const placeSearchCache = new Map<string, { data: any; timestamp: number }>();

// ----------------------
// Async Pool (Throttle Requests)
// ----------------------
export async function asyncPool(poolLimit: number, array: any[], iteratorFn: any) {
  const ret: any[] = [];
  const executing: Promise<any>[] = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
    if (poolLimit <= array.length) {
      const e: any = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) await Promise.race(executing);
    }
  }
  return Promise.all(ret);
}

// ----------------------
// Get State from Coordinates (Nominatim)
// ----------------------
export async function getStateFromCoordinates(lat: number, lon: number): Promise<string> {
  const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  const cached = nominatimCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.state;

  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: { lat, lon, format: "json", addressdetails: 1 },
      headers: { "User-Agent": "SafeTravelerGuardian/1.0 (guna1221639@)" },
      timeout: 6000,
    });
    const state = response.data.address?.state || "Unknown";
    nominatimCache.set(key, { state, timestamp: Date.now() });
    return state;
  } catch (err) {
    console.error("Error fetching state from Nominatim:", err);
    return "Unknown";
  }
}

// ----------------------
// Get Popular Tourist Places for a State
// ----------------------
export async function getFamousPlacesForState(state: string) {
  const cached = placesCache.get(state);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  try {
    // Step 1: Get the center coordinates of the state
    const geoRes = await axios.get("https://api.opentripmap.com/0.1/en/places/geoname", {
      params: { name: state, apikey: OPENTRIPMAP_API_KEY },
      validateStatus: () => true,
    });

    const stateCenter = geoRes.data;
    if (!stateCenter?.lat || !stateCenter?.lon) return [];

    // Step 2: Fetch top-rated tourist attractions (only major kinds)
    const placesRes = await axios.get("https://api.opentripmap.com/0.1/en/places/radius", {
      params: {
        lat: stateCenter.lat,
        lon: stateCenter.lon,
        radius: 150000, // 150 km
        rate: 3,
        kinds: "interesting_places,tourist_facilities,monuments_and_memorials,museums,architecture,natural",
        limit: 30,
        format: "json",
        apikey: OPENTRIPMAP_API_KEY,
      },
      validateStatus: () => true,
    });

    if (!Array.isArray(placesRes.data)) return [];

    const topPlaces = (placesRes.data || [])
      .filter((p: any) => p.name && p.rate)
      .sort((a: any, b: any) => b.rate - a.rate)
      .slice(0, 10);

    // Step 3: Fetch details for each place
    const detailedPlaces = await asyncPool(3, topPlaces, async (p: any) => {
      if (!p.xid) return null;
      try {
        const detailRes = await axios.get(`https://api.opentripmap.com/0.1/en/places/xid/${p.xid}`, {
          params: { apikey: OPENTRIPMAP_API_KEY },
          validateStatus: () => true,
        });

        if (detailRes.data?.name) {
          return {
            xid: p.xid,
            name: detailRes.data.name,
            lat: detailRes.data.point?.lat || p.point?.lat,
            lon: detailRes.data.point?.lon || p.point?.lon,
            img: detailRes.data.preview?.source || null,
            description: detailRes.data.wikipedia_extracts?.text || "",
          };
        }
        return null;
      } catch {
        return null;
      }
    });

    const filteredPlaces = detailedPlaces.filter(Boolean);
    placesCache.set(state, { data: filteredPlaces, timestamp: Date.now() });
    return filteredPlaces;
  } catch (err) {
    console.error("Error fetching famous places for state:", err);
    return [];
  }
}

// ----------------------
// Route: Search by Place Name (Exact + Nearby Attractions)
// ----------------------
router.get("/place-geocode", async (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "name is required" });

  const key = name.toString().toLowerCase();
  const cached = placeSearchCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    // Step 1: Get geoname info
    const geoRes = await axios.get("https://api.opentripmap.com/0.1/en/places/geoname", {
      params: { name, apikey: OPENTRIPMAP_API_KEY },
      validateStatus: () => true,
    });

    if (!geoRes.data?.lat || !geoRes.data?.lon) {
      return res.status(404).json({ error: "Place not found" });
    }

    // Step 2: Fetch nearby attractions
    const nearbyRes = await axios.get("https://api.opentripmap.com/0.1/en/places/radius", {
      params: {
        lat: geoRes.data.lat,
        lon: geoRes.data.lon,
        radius: 10000, // 10 km radius
        kinds: "interesting_places,tourist_facilities,monuments_and_memorials,museums,architecture,natural",
        rate: 3,
        limit: 20,
        format: "json",
        apikey: OPENTRIPMAP_API_KEY,
      },
      validateStatus: () => true,
    });

    // Step 3: Sort + detail
    const attractions = (nearbyRes.data || [])
      .filter((p: any) => p.name && p.rate)
      .sort((a: any, b: any) => b.rate - a.rate)
      .slice(0, 10);

    const result = {
      name,
      lat: geoRes.data.lat,
      lon: geoRes.data.lon,
      attractions,
    };

    placeSearchCache.set(key, { data: result, timestamp: Date.now() });
    res.json(result);
  } catch (err) {
    console.error("Error fetching place-geocode:", err);
    res.status(500).json({ error: "Failed to fetch geocode or attractions" });
  }
});

// ----------------------
// Route: Get Location Info from Coordinates
// ----------------------
router.get("/location-info", async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat and lon are required" });

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    const state = await getStateFromCoordinates(latitude, longitude);
    const places = await getFamousPlacesForState(state);

    res.json({ state, places });
  } catch (err: any) {
    console.error("Error in /location-info route:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
