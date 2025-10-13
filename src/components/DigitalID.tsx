import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  CheckCircle,
  QrCode,
  Globe,
  Calendar,
  MapPin,
  User,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import digitalIdIcon from "@/assets/digital-id-icon.jpg";

interface TravelerProfile {
  id: string;
  full_name: string;
  email: string;
  nationality?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string;
}
const API_URL = import.meta.env.VITE_API_URL;

const DigitalID = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<TravelerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) return;
        const res = await fetch(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error loading profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Blockchain address generator
  const generateBlockchainAddress = (userId: string) => {
    const hash = userId.replace(/-/g, "").substring(0, 8);
    return `0x${hash.substring(0, 4)}...${hash.substring(4, 8)}`;
  };

  // Passport generator
  const generatePassportNumber = (userId: string) => {
    const nums = userId.replace(/\D/g, "").substring(0, 8);
    return `${nums.substring(0, 4)}•••••${nums.substring(4, 8)}`;
  };

  const travelerData = useMemo(() => {
    if (!user || !profile) {
      return {
        name: "Loading...",
        nationality: "Unknown",
        passportNumber: "••••••••••••",
        emergencyContact: "Not set",
        bloodType: "Unknown",
        allergies: "Not specified",
        issueDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        expiryDate: new Date(
          Date.now() + 3 * 365 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        verificationStatus: "Pending",
        blockchainAddress: "0x0000...0000",
      };
    }

    const issueDate = new Date();
    const expiryDate = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000);

    return {
      name: profile.full_name || user.email,
      nationality: profile.nationality || "Digital Citizen",
      passportNumber: generatePassportNumber(user.id),
      emergencyContact: profile.emergencyContact || "Not set",
      bloodType: profile.bloodType || "Not specified",
      allergies: profile.allergies || "Not specified",
      issueDate: issueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      expiryDate: expiryDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      verificationStatus: "Verified",
      blockchainAddress: generateBlockchainAddress(user.id),
    };
  }, [user, profile]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            Please sign in to view your Digital ID
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading your Digital ID...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
            <img src={digitalIdIcon} alt="Digital ID" className="h-8 w-8" />
            Blockchain Digital ID
          </h1>
          <p className="text-muted-foreground">
            Secure, verified digital identity for safe travel
          </p>
        </div>

        {/* Digital ID Card */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md bg-gradient-primary text-white shadow-primary border-0 relative overflow-hidden">
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-sm font-medium text-white/80 mb-1">
                    TOURIST DIGITAL ID
                  </h2>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-white" />
                    <span className="text-sm font-medium">
                      Blockchain Verified
                    </span>
                  </div>
                </div>
                <QrCode className="h-8 w-8 text-white/80" />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{travelerData.name}</h3>
                  <p className="text-white/80 text-sm">
                    {travelerData.nationality}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/60">Passport</p>
                    <p className="font-medium">{travelerData.passportNumber}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Blood Type</p>
                    <p className="font-medium">{travelerData.bloodType}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/20">
                  <span className="text-xs text-white/60">
                    Valid until {travelerData.expiryDate}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-white border-white/30 bg-white/10"
                  >
                    ACTIVE
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="shadow-lg rounded-xl bg-white/80">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                  <span className="text-gray-500">Full Name</span>
                  <span className="font-medium">{travelerData.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                  <span className="text-gray-500">Nationality</span>
                  <span className="font-medium">{travelerData.nationality}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                  <span className="text-gray-500">Blood Type</span>
                  <span className="font-medium">{travelerData.bloodType}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">Allergies</span>
                  <span className="font-medium text-green-500">{travelerData.allergies}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency & Medical */}
          <Card className="shadow-lg rounded-xl bg-white/80">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                Emergency Contact
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                  <span className="text-gray-500">Emergency Phone</span>
                  <span className="font-medium">{travelerData.emergencyContact}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                  <span className="text-gray-500">Issue Date</span>
                  <span className="font-medium">{travelerData.issueDate}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">Expiry Date</span>
                  <span className="font-medium">{travelerData.expiryDate}</span>
                </div>
              </div>

              <Button variant="emergency" className="w-full mt-4 bg-green-500 hover:bg-green-600">
                <Shield className="h-4 w-4 mr-2" />
                Emergency Protocol
              </Button>
            </CardContent>
          </Card>

          {/* Blockchain Verification */}
          <Card className="shadow-lg rounded-xl bg-white/80">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Blockchain Verification
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-300">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-600">Verified on Blockchain</p>
                    <p className="text-sm text-gray-500">Identity authenticated</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500 mb-1">Blockchain Address:</p>
                  <code className="text-xs bg-gray-100 p-2 rounded block font-mono  text-gray-800">
                    {travelerData.blockchainAddress}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel Status */}
          <Card className="shadow-lg rounded-xl bg-white/80">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Travel Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-300">
                  <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-700">Currently in Miami, FL</p>
                    <p className="text-sm text-gray-500">Tourist visa active</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <div className="text-lg font-bold text-blue-500">7</div>
                    <div className="text-xs text-gray-500">Days Remaining</div>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <div className="text-lg font-bold text-green-500">12</div>
                    <div className="text-xs text-gray-500">Safe Zones Visited</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DigitalID;
