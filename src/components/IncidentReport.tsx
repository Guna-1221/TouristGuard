import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  MapPin,
  Camera,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  Phone,
} from "lucide-react";

const IncidentReport = () => {
  const [reportStatus, setReportStatus] = useState<
    "draft" | "submitting" | "submitted"
  >("draft");
  const [incidentType, setIncidentType] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<File[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [error, setError] = useState<string>("");

  // ✅ Watch real-time location
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watcher = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Unable to fetch your real-time location.");
        },
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watcher);
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMedia(files);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (!description.trim() && media.length === 0) {
      setError("Please provide a description or upload media before submitting.");
      return;
    }

    if (!location) {
      setError("Real-time location not available. Please enable GPS.");
      return;
    }

    setReportStatus("submitting");

    setTimeout(() => {
      setReportStatus("submitted");
    }, 2000);
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case "low":
        return "success";
      case "medium":
        return "warning";
      case "high":
        return "danger";
      default:
        return "muted";
    }
  };

  if (reportStatus === "submitted") {
    return (
      <div
        className="relative min-h-screen bg-cover bg-center p-6 flex items-center justify-center"
        style={{ backgroundImage: "url('/travel-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <Card className="relative w-full max-w-md text-center shadow-success border-success/20 z-10 bg-white/80 backdrop-blur-md">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-success mb-2">
              Report Submitted
            </h2>
            <p className="text-muted-foreground mb-6">
              Your incident report has been received and is being processed by
              our AI system.
            </p>

            {media.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium">Attached Media:</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {media.map((file, i) => (
                    <li key={i}>📎 {file.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {location && (
              <p className="text-sm text-muted-foreground">
                Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            )}

            <div className="space-y-3 mt-4">
              <Button
                variant="hero"
                className="w-full"
                onClick={() => {
                  setReportStatus("draft");
                  setMedia([]);
                  setDescription("");
                  setIncidentType("");
                  setSeverity("");
                }}
              >
                Submit Another Report
              </Button>
              <Button variant="outline" className="w-full">
                View Report Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center p-4 sm:p-8"
      style={{ backgroundImage: "url('/travel-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="relative max-w-3xl mx-auto space-y-6 z-10">
        {/* Header */}
        <div className="text-center space-y-2 text-white drop-shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-3">
            <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 text-warning" />
            Incident Report
          </h1>
          <p className="text-sm sm:text-base text-white/80">
            Report safety concerns or incidents for immediate AI analysis
          </p>
        </div>

        {/* Emergency Banner */}
        <Card className="bg-gradient-danger text-white shadow-danger border-0">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start sm:items-center gap-3">
              <Phone className="h-6 w-6 flex-shrink-0" />
              <div>
                <p className="font-semibold">Emergency? Call immediately:</p>
                <p className="text-white/90 text-sm sm:text-base">
                  911 (US) • 112 (International) • Local Emergency Services
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Form */}
        <Card className="shadow-glass bg-white/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Incident Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
              <div className="space-y-2">
                <Label>Current Location</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  {location ? (
                    <span>
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </span>
                  ) : (
                    <span>Fetching real-time location...</span>
                  )}
                </div>
              </div>

              {/* Incident Type */}
              <div className="space-y-2">
                <Label>Incident Type</Label>
                <Select value={incidentType} onValueChange={setIncidentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theft">Theft / Robbery</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="medical">Medical Emergency</SelectItem>
                    <SelectItem value="accident">Accident</SelectItem>
                    <SelectItem value="suspicious">
                      Suspicious Activity
                    </SelectItem>
                    <SelectItem value="weather">Weather Related</SelectItem>
                    <SelectItem value="lost">Lost / Stranded</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Severity Level */}
              <div className="space-y-3">
                <Label>Severity Level</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "low", label: "Low", desc: "Minor concern" },
                    { value: "medium", label: "Medium", desc: "Needs attention" },
                    { value: "high", label: "High", desc: "Urgent response" },
                  ].map((level) => (
                    <Card
                      key={level.value}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        severity === level.value
                          ? `border-${getSeverityColor(
                              level.value
                            )} bg-${getSeverityColor(level.value)}/10`
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSeverity(level.value)}
                    >
                      <CardContent className="p-4 text-center">
                        <div
                          className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                            level.value === "low"
                              ? "bg-success"
                              : level.value === "medium"
                              ? "bg-warning"
                              : "bg-danger"
                          }`}
                        ></div>
                        <p className="font-medium text-sm">{level.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {level.desc}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened in detail..."
                  className="min-h-32"
                />
              </div>

              {/* Media Upload */}
              <div className="space-y-2">
                <Label>Attach Media</Label>
                <label className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                  <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload photos or videos
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 10MB per file
                  </p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {media.length > 0 && (
                  <ul className="mt-2 text-sm text-muted-foreground">
                    {media.map((file, i) => (
                      <li key={i}>📎 {file.name}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Error */}
              {error && <p className="text-red-600 text-sm">{error}</p>}

              {/* Submit + Clear */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  variant="hero"
                  className="flex-1"
                  disabled={reportStatus === "submitting"}
                >
                  {reportStatus === "submitting" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIncidentType("");
                    setSeverity("");
                    setDescription("");
                    setMedia([]);
                    setError("");
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <Clock className="h-4 w-4" />
                Report timestamp: {new Date().toLocaleString()}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncidentReport;
