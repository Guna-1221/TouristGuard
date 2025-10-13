// src/pages/Index.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-cityscape.jpg";
import { Shield, LogIn, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { loading, user, handleOAuthToken } = useAuth();
const navigate = useNavigate();

// Handle OAuth token in URL
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    // Immediately set loading to true while fetching user
    (async () => {
      await handleOAuthToken(token);
      window.history.replaceState({}, document.title, "/"); // clean URL
    })();
  }
}, [handleOAuthToken]);

// Redirect if user is logged in
useEffect(() => {
  if (!loading && user) {
    navigate("/home", { replace: true });
  }
}, [loading, user, navigate]);

if (loading) return <div>Loading TouristGuard...</div>;

  return (
    <div className="relative min-h-screen bg-gradient-sky">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/40" />

        <div className="relative z-10 text-center max-w-4xl mx-auto p-12 glass-strong rounded-3xl">
          <Shield className="h-20 w-20 text-primary mx-auto mb-6 animate-glow" />
          <h1 className="text-6xl font-display font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            TouristGuard
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            AI-powered smart travel companion with real-time safety monitoring.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/signin")}
              size="lg"
              className="bg-gradient-primary text-white rounded-full px-8 py-4"
            >
              <LogIn className="h-5 w-5 mr-2" /> Start Your Smart Journey
            </Button>
            <Button variant="ghost" size="lg" className="rounded-full px-8 py-4">
              <Star className="h-5 w-5 mr-2" /> Explore Features
            </Button>
          </div>

          <div className="mt-12 flex justify-center animate-bounce">
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
