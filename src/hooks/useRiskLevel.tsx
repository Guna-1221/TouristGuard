
import { useEffect, useState } from "react";

export type RiskLevel = "Low" | "Medium" | "High";

interface RiskResult {
  level: RiskLevel;
  explanation: string;
}



export const useRiskLevel = (
  city?: string,
  country?: string
): { risk: RiskResult | null; loading: boolean; error: string | null } => {
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city || !country) return;

    const fetchRisk = async () => {
      setLoading(true);
      try {
       
        const newsRes = await fetch(
          `https://newsapi.org/v2/everything?q=${city}+crime&apiKey=${process.env.NEWS_API_KEY}`
        );
        const news = await newsRes.json();

        const headlines = news.articles
          .map((a: any) => a.title + " - " + a.description)
          .slice(0, 5)
          .join("\n");

        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/api/risk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city, country, headlines }),
        });

        const data = await res.json();
        setRisk(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRisk();
  }, [city, country]);

  return { risk, loading, error };
};
