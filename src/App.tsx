import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Layout
import Layout from "@/components/Layout";

// Pages & Components
import DigitalID from "@/components/DigitalID";
import SafetyDashboard from "@/components/SafetyDashboard";
import IncidentReport from "@/components/IncidentReport";
import SafetyAnalytics from "@/components/SafetyAnalytics";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import HomePage from "./pages/HomePage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import DigiLockerCallback from "./pages/Digilockercallback";
import OAuthCallback from "@/pages/OAuthCallback";
import Profile from "@/pages/Profiles";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes (no header/footer) */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/digilocker/callback" element={<DigiLockerCallback />} />
              

<Route path="/oauth/callback" element={<OAuthCallback />} />

            </Route>

            {/* Protected routes (with header/footer, requires login) */}
           
              <Route path="/profile" element={<Profile />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/dashboard" element={<SafetyDashboard />} />
              <Route path="/report" element={<IncidentReport />} />
              <Route path="/digital-id" element={<DigitalID />} />
              <Route path="/analytics" element={<SafetyAnalytics />} />
           

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
