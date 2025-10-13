import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

const Profile: React.FC = () => {
  const { user, updateUser, token } = useAuth();

  const [fullName, setFullName] = useState("");
  const [nationality, setNationality] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("/default-avatar.png");
  const [dp, setDp] = useState<File | null>(null);
const API_URL = import.meta.env.VITE_API_URL;
  // Fetch latest profile on mount
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
     
      if (data.success) {
        const u = data.user;
      
        setFullName(u.full_name || "");
        setNationality(u.nationality || "");
        setGender(u.gender || "");
        setPhone(u.phone || "");
        setBloodType(u.bloodType || "");
        setAllergies(u.allergies || "");
        setEmergencyContact(u.emergencyContact || "");
        setAvatarUrl(u.avatar_url || "/default-avatar.png");
        updateUser(u); // update context
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const completion =
    (fullName ? 15 : 0) +
    (nationality ? 15 : 0) +
    (gender ? 10 : 0) +
    (phone ? 15 : 0) +
    (bloodType ? 10 : 0) +
    (allergies ? 10 : 0) +
    (emergencyContact ? 15 : 0) +
    (dp || avatarUrl ? 10 : 0);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setDp(file);
    if (file) setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("nationality", nationality);
      formData.append("gender", gender);
      formData.append("phone", phone);
      formData.append("bloodType", bloodType);
      formData.append("allergies", allergies);
      formData.append("emergencyContact", emergencyContact);
      if (dp) formData.append("avatar", dp);
const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/api/profile/update`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        const u = data.user;
        setAvatarUrl(u.avatar_url || avatarUrl);

        setDp(null);
        updateUser(u); // update context
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const nationalities = ["India", "USA", "UK", "Canada", "Australia", "Other"];
  const genders = ["Male", "Female", "Other"];
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6">
      <Card className="backdrop-blur-xl bg-white/20 shadow-2xl border border-white/30 rounded-3xl overflow-hidden">
        <div className="relative flex flex-col items-center p-8 text-center text-white bg-gradient-to-r from-indigo-500/70 via-purple-500/70 to-pink-500/70 backdrop-blur-xl rounded-t-3xl">
          <img
            src={"../backend" + avatarUrl}
            alt="Profile"
            className="mx-auto w-32 h-32 rounded-full border-4 border-white object-cover shadow-xl"
          />
          <h2 className="mt-4 text-2xl font-bold">{fullName || "Your Name"}</h2>
          <p className="text-sm opacity-80">{user?.email}</p>
          <Button
            variant="outline"
            className="mt-4 bg-white/30 text-white border-white/40 hover:bg-white/50 rounded-full px-6 py-2"
            onClick={() => document.getElementById("avatarInput")?.click()}
          >
            {avatarUrl && avatarUrl !== "/default-avatar.png" ? "Edit Picture" : "Upload Picture"}
          </Button>
          <input id="avatarInput" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <CardContent className="p-8 space-y-6 backdrop-blur-lg bg-white/30 rounded-b-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Full Name", value: fullName, setter: setFullName },
              { label: "Email", value: user?.email || "", disabled: true },
              { label: "Nationality", value: nationality, setter: setNationality, options: nationalities },
              { label: "Gender", value: gender, setter: setGender, options: genders },
              { label: "Phone", value: phone, setter: setPhone },
              { label: "Blood Type", value: bloodType, setter: setBloodType, options: bloodTypes },
              { label: "Allergies", value: allergies, setter: setAllergies },
              { label: "Emergency Contact", value: emergencyContact, setter: setEmergencyContact },
            ].map((field, idx) => (
              <div key={idx} className="bg-white/30 p-4 rounded-2xl">
                <Label>{field.label}</Label>
                {field.options ? (
                  <select
                    className="w-full border rounded-md p-2 bg-transparent"
                    value={field.value}
                    onChange={(e) => field.setter?.(e.target.value)}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input value={field.value} onChange={(e) => field.setter?.(e.target.value)} disabled={field.disabled} className="bg-transparent" />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white/30 p-4 rounded-2xl">
            <Label>Profile Completion</Label>
            <Progress value={completion} className="w-full h-3 rounded-full" />
            <p className="text-sm mt-1">{completion}% complete</p>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-700/90 hover:to-indigo-700/90 text-white font-bold py-3 rounded-full shadow-lg backdrop-blur-md"
          >
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
