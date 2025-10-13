import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DigiLockerCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code) {
      // Normally, you'd call backend to exchange "code" for DigiLocker access_token
      // For mock: just save something in localStorage
      localStorage.setItem("token", "mock_digilocker_token_" + code);
      localStorage.setItem("user", JSON.stringify({ full_name: "Demo User", email: "demo@digilocker.gov.in" }));
      navigate("/home");
    }
  }, [navigate]);

  return <p className="text-center mt-20">Connecting with DigiLocker...</p>;
};

export default DigiLockerCallback;
