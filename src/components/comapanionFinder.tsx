import React, { useEffect, useState } from "react";

type Companion = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceMeters?: number;
  status?: "available" | "busy";
};

export default function CompanionFinder({
  onSelect,
}: {
  onSelect?: (c: Companion) => void;
}) {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // try to fetch current position and nearby companions
    (async function fetchNearby() {
      if (!navigator.geolocation) {
        setError("Geolocation not available");
        return;
      }
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude: lat, longitude: lng } = pos.coords;
            const q = new URLSearchParams({ lat: String(lat), lng: String(lng) });
            const res = await fetch(`/api/companions/nearby?${q.toString()}`);
            const data = await res.json();
            setCompanions(data || []);
          } catch (e) {
            setError("Failed to load companions");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    })();
  }, []);

  const requestCompanion = async (companionId: string) => {
    try {
      const res = await fetch("/api/companions/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companionId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error("request failed");
      onSelect?.(companions.find((c) => c.id === companionId)!);
      alert("Request sent");
    } catch (e) {
      setError("Failed to request companion");
    }
  };

  return (
    <div className="p-3 rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-medium">Find a companion nearby</h3>

      {loading && <div>Loading nearby companions…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <ul className="mt-2 space-y-2">
        {companions.length === 0 && !loading && <li>No companions found nearby.</li>}
        {companions.map((c) => (
          <li key={c.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs">~{Math.round((c.distanceMeters || 0) / 1000 * 10) / 10} km</div>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => requestCompanion(c.id)}
                className="px-2 py-1 rounded border"
                disabled={c.status !== "available"}
              >
                Request
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
