// src/hooks/useAuth.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
const API_URL = import.meta.env.VITE_API_URL;

export type UserRole = "normal_user" | "admin" | "super_admin";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url?: string | null;
  nationality?: string;
  gender?: string;
  phone?: string;
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
}

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  loading: boolean;
  token?: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  updateUser: (user: Profile) => void;
  hasRole: (requiredRole: UserRole) => boolean;
  handleOAuthToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user data if token exists
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setRole(data.role);
      } else {
        setUser(null);
        setRole(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: data.message || "Invalid credentials",
        });
        return { error: data };
      }

      localStorage.setItem("token", data.token);
      setUser(data.user);
      setRole(data.role);

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      return { error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: data.message || "Registration failed",
        });
        return { error: data };
      }

      toast({
        title: "Account created!",
        description: "Please sign in with your new credentials.",
      });

      return { error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem("token");
      setUser(null);
      setRole(null);

      await fetch("http://localhost:8080/api/auth/logout", { method: "POST" }).catch(() => {});

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleOAuthToken = async (token: string) => {
    try {
      localStorage.setItem("token", token);
      await fetchUserData();
    } catch (err) {
      console.error("OAuth login failed", err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUser: Profile) => {
    setUser(updatedUser);
  };

  const hasRole = (requiredRole: UserRole) => {
    if (!role) return false;
    const roleHierarchy: Record<UserRole, number> = {
      normal_user: 1,
      admin: 2,
      super_admin: 3,
    };
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        token: localStorage.getItem("token"),
        signIn,
        signUp,
        signOut,
        updateUser,
        hasRole,
        handleOAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
