// src/pages/OAuthCallback.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function OAuthCallback() {
  const { handleOAuthToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      handleOAuthToken(token).then(() => {
        navigate("/home", { replace: true }); // redirect to home after login
      });
    } else {
      navigate("/signin", { replace: true }); // no token found, redirect to login
    }
  }, [location.search]);

  return <div>Logging in...</div>;
}
