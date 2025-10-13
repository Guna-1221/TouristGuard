// Mock crime risk service
export const fetchCrimeRisk = async (lat: string, lon: string) => {
  // Normally you'd query an API or database
  // For now, return mock data
  return {
    riskLevel: "Medium",
    explanation: "This area has moderate crime reports at night.",
    coordinates: { lat, lon },
  };
};
