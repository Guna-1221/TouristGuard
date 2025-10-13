import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-cityscape.jpg";
import dashboardBg from "@/assets/dashboard-bg.jpg";
import { useState, useEffect } from "react";

const Layout = ({ protectedRoute = false }: { protectedRoute?: boolean }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading TouristGuard...
      </div>
    );
  }

  if (protectedRoute && !user) {
    return <Navigate to="/signin" />;
  }

  const getBackground = () => {
    if (location.pathname === "/") return `url(${heroImage})`;
    if (location.pathname.startsWith("/dashboard")) return `url(${dashboardBg})`;
    if (location.pathname.startsWith("/analytics")) return `linear-gradient(to right, #1e3c72, #2a5298)`;
    if (location.pathname.startsWith("/home")) return `url(${dashboardBg})`;
    return "none";
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: getBackground(),
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      {user && <Navigation />}

      <main className={`flex-1 ${user ? "pt-20" : ""}`}>
        <Outlet />
      </main>

      {/* Footer shows only if user exists AND width >= 400px */}
      {user && windowWidth >= 400 && <Footer />}
    </div>
  );
};

export default Layout;
