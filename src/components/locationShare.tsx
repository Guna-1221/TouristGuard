import React, { useEffect, useState, useRef } from "react";

type ShareResponse = { success: boolean };
type FamilyMember = { id: string; name: string; lastSeen?: string };

export default function LocationShare({
  family = [],
  onShared,
}: {
  family?: FamilyMember[];
  onShared?: (pos: { lat: number; lng: number }) => void;
}) {
  const [sharing, setSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const liveRef = useRef(false);

  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  const shareOnce = async (position: GeolocationPosition) => {
    const { latitude: lat, longitude: lng } = position.coords;
    try {
      // send to backend
      await fetch("/api/location/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, familyIds: family.map((f) => f.id) }),
      });
      onShared?.({ lat, lng });
    } catch (e) {
      setError("Failed to share location.");
    }
  };

  const startLiveShare = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }
    liveRef.current = true;
    setSharing(true);
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        await shareOnce(pos);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    setWatchId(id);
  };

  const stopLiveShare = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    liveRef.current = false;
    setSharing(false);
  };

  const shareNow = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => shareOnce(pos),
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  };

  return (
    <div className="p-3 rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-medium">Share location with family</h3>

      <div className="mt-2 space-y-2">
        <button
          onClick={shareNow}
          className="px-3 py-1 rounded border"
          type="button"
        >
          Share now
        </button>

        {!sharing ? (
          <button onClick={startLiveShare} className="px-3 py-1 rounded border">
            Start live sharing
          </button>
        ) : (
          <button onClick={stopLiveShare} className="px-3 py-1 rounded border">
            Stop live sharing
          </button>
        )}

        <div>
          <label className="text-sm">Sharing to:</label>
          <div className="text-sm">
            {family.length ? family.map((f) => f.name).join(", ") : "No family selected"}
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}
