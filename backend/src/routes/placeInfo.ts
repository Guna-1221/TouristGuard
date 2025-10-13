import { Router, Request, Response } from "express";
import fetch from "node-fetch";

const router = Router();

interface OpenTripMapPlace {
  properties: {
    xid: string;
    name: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface OpenTripMapAutosuggestResponse {
  features: OpenTripMapPlace[];
}
interface OpenTripMapPlaceDetails {
  xid: string;
  name: string;
  point?: {
    lat: number;
    lon: number;
  };
  wikipedia_extracts?: {
    text: string;
  };
  info?: {
    descr: string;
  };
  preview?: {
    source: string;
  };
  images?: { source: string }[];
}


router.get("/", async (req: Request, res: Response) => {
  try {
    const { name } = req.query;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Query param 'name' is required" });
    }

    const apiKey = process.env.OPENTRIPMAP_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OpenTripMap API key" });
    }

    const searchRes = await fetch(
      `https://api.opentripmap.com/0.1/en/places/autosuggest?name=${encodeURIComponent(
        name
      )}&apikey=${apiKey}`
    );
const searchData = (await searchRes.json()) as OpenTripMapAutosuggestResponse;

    if (!searchData.features || searchData.features.length === 0) {
      return res.status(404).json({ error: "Place not found" });
    }

    const place = searchData.features[0];
if (!place) {
  return res.status(404).json({ error: "Place not found" });
}

    const xid = place.properties.xid;

    const detailsRes = await fetch(
      `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${apiKey}`
    );
   
if (!detailsRes.ok) {
  return res.status(502).json({ error: "Failed to fetch place details" });
}

// ✅ Cast JSON so TS knows the structur
if (!detailsRes.ok) {
  return res.status(502).json({ error: "Failed to fetch place details" });
}

// ✅ Cast JSON so TS knows the structure
const details = (await detailsRes.json()) as OpenTripMapPlaceDetails;

    const result = {
      xid: details.xid,
      name: details.name || place.properties.name,
      lat: details.point?.lat,
      lon: details.point?.lon,
      description: details.wikipedia_extracts?.text || details.info?.descr || "",
      img: details.preview?.source || null,
      bestTime: null,
      photos: details.images?.map((p: any) => p.source) || [],
    };

    return res.json(result);
  } catch (err) {
    console.error("Error in /place-info:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
