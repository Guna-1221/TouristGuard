// src/components/Navigation.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, LogIn, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
const API_URL = import.meta.env.VITE_API_URL; 

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const profileDp = user?.avatar_url
    ? `${API_URL}${user.avatar_url}`
    : "/default-avatar.png";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all ${
          isScrolled ? "glass shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">TouristGuard</h1>
          </Link>

          <div className="hidden md:flex gap-4 items-center">
            <Link to="/home">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link to="/report">
              <Button variant="ghost">Report</Button>
            </Link>
            <Link to="/digital-id">
              <Button variant="ghost">Digital ID</Button>
            </Link>
            <Link to="/analytics">
              <Button variant="ghost">Analytics</Button>
            </Link>

            {/* Small DP in desktop menu */}
            {user && (
              <Link to="/profile">
                <img
                  src={profileDp}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  title={user.full_name || user.email||""}
                />
              </Link>
            )}

            {user ? (
              <Button variant="ghost" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            ) : (
              <Link to="/signin">
                <Button variant="ghost">
                  <LogIn className="h-4 w-4 mr-1" /> Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background p-6 space-y-4">
            {/* Show DP on top of mobile menu */}
            {user && (
              <div className="flex justify-center mb-4">
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  <img
                    src={profileDp}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-white object-cover"
                    title={user.full_name || user.email||""}
                  />
                </Link>
              </div>
            )}

            <Link to="/home" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full">Home</Button>
            </Link>
            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full">Dashboard</Button>
            </Link>
            <Link to="/report" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full">Report</Button>
            </Link>
            <Link to="/digital-id" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full">Digital ID</Button>
            </Link>
            <Link to="/analytics" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full">Analytics</Button>
            </Link>
            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full">Profile</Button>
            </Link>

            {user ? (
              <Button variant="ghost" className="w-full" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            ) : (
              <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full">
                  <LogIn className="h-4 w-4 mr-1" /> Sign In
                </Button>
              </Link>
            )}
          </div>
        )}
      </nav>
      <div className="h-20" />
    </>
  );
};

export default Navigation;
