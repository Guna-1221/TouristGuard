// src/pages/SignIn.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Shield, ArrowLeft,Lock } from "lucide-react";
import authBg from "@/assets/auth-bg.jpg";
import { useAuth } from "@/hooks/useAuth";
import { FaGoogle, FaGithub } from "react-icons/fa"; 

const SignIn = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(false);
    navigate("/home");
    // try {
    //   const { error } = await signIn(form.email, form.password);
    //   if (!error) {
    //     // replace true avoids back-button confusion and forces immediate route change
    //     navigate("/home", { replace: true });
    //   } else {
    //     // signIn already shows toast; you can show inline message if you want
    //     console.warn("Sign in failed:", error);
    //   }
    // } catch (err) {
    //   console.error("Unexpected sign in error:", err);
    // } finally {
    //   setLoading(false);
    // }
  };
const API_URL = import.meta.env.VITE_API_URL;
  const handleOAuthSignIn = (provider: "Google" | "GitHub" | "DigiLocker") =>
    (window.location.href = `${API_URL}/auth/${provider}`);

  const handleDigiLockerSignIn = () => {
    window.location.href =
      "https://sandbox.digitallocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:5173/digilocker/callback&state=1234";
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${authBg})`, backgroundSize: "cover" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background/40 to-accent/30 backdrop-blur-md" />

      <div className="relative w-full max-w-md z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 glass rounded-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="text-center glass-floating p-8 mb-6">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold">TouristGuard</h1>
          <p className="text-muted-foreground">Smart Safety System</p>
        </div>

        <Card className="glass-strong border-primary/20 rounded-3xl shadow-elegant">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Access your safety dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

         {/* OR Divider */}
<div className="flex items-center my-4">
  <div className="flex-1 border-t border-muted-foreground/20" />
  <span className="px-2 text-muted-foreground text-sm">or continue with</span>
  <div className="flex-1 border-t border-muted-foreground/20" />
</div>

{/* Social Sign in Buttons - Single Row */}
<div className="flex gap-3 mt-4">
  <Button
    variant="outline"
    className="flex items-center justify-center gap-2 flex-1"
    onClick={() => handleOAuthSignIn("Google")}
  >
    <FaGoogle className="w-5 h-5 text-red-500" />
    Google
  </Button>

  <Button
    variant="outline"
    className="flex items-center justify-center gap-2 flex-1"
    onClick={() => handleOAuthSignIn("GitHub")}
  >
    <FaGithub className="w-5 h-5" />
    GitHub
  </Button>

  <Button
    variant="secondary"
    className="flex items-center justify-center gap-2 flex-1"
    onClick={() => handleOAuthSignIn("DigiLocker")}
  >
    <Lock className="w-5 h-5" />
    DigiLocker
  </Button>
</div>


            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Button variant="link" size="sm" onClick={() => navigate("/signup")}>
                  Sign Up
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
