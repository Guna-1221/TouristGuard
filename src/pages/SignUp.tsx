import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, ArrowLeft, Lock } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa"; // ✅ brand icons
import axios from "axios";
import authBg from "@/assets/auth-bg.jpg";

const SignUp = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
const API_URL = import.meta.env.VITE_API_URL;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/signup`, form);
      alert("Account created! Please login.");
      setForm({ email: "", password: "", full_name: "" });
      navigate("/signin");
    } catch (err: any) {
      alert(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    alert(`Redirecting to ${provider} sign-in...`);
    // later: connect to your backend OAuth flow
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
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input type="text" name="full_name" value={form.full_name} onChange={handleChange} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" name="password" value={form.password} onChange={handleChange} required />
              </div>

              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>

            {/* OR Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-muted-foreground/20" />
              <span className="px-2 text-muted-foreground text-sm">or continue with</span>
              <div className="flex-1 border-t border-muted-foreground/20" />
            </div>

            {/* Social Sign in Buttons */}
           {/* Social Sign in Buttons */}
<div className="flex justify-between gap-3 mt-4">
  <Button
    variant="outline"
    className="flex items-center gap-2 flex-1"
    onClick={() => handleOAuthSignIn("Google")}
  >
    <FaGoogle className="w-5 h-5 text-red-500" />
    Google
  </Button>

  <Button
    variant="outline"
    className="flex items-center gap-2 flex-1"
    onClick={() => handleOAuthSignIn("GitHub")}
  >
    <FaGithub className="w-5 h-5" />
    GitHub
  </Button>

  <Button
    variant="secondary"
    className="flex items-center gap-2 flex-1"
    onClick={() => handleOAuthSignIn("DigiLocker")}
  >
    <Lock className="w-5 h-5" />
    DigiLocker
  </Button>
</div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
