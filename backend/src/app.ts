import express from "express";
import cors from "cors";
import passport from "passport";
import "./config/db";
import "./config/passport";
import path from "path";

// Routes
import authRoutes from "./routes/authRoutes";
import googleRoutes from "./routes/google";
import aiRoutes from "./routes/ai";
import locationRoutes from "./routes/locationRoutes";
import healthRoutes from "./routes/healthroutes";
import placesRoutes from "./routes/placesRoutes";
import placeInfoRoutes from "./routes/placeInfo";
import profileRoutes from "./routes/profileRoute"; // <-- add this

const app = express();
const FRONTEND_URL = process.env.VITE_API_URL || "http://localhost:8081";
// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(passport.initialize());

// Serve uploaded files
// Serve uploaded avatars
app.use(
  "/uploads/avatars",
  express.static(path.resolve(__dirname, "../uploads/avatars"))
);

// API Routes
app.use("/api/place-info", placeInfoRoutes);
app.use("/api", placesRoutes);
app.use("/api/auth", authRoutes);
app.use("/auth/google", googleRoutes);
app.use("/api/ai-assistant-stream", aiRoutes);
app.use("/api/location", locationRoutes);
app.use("/api", healthRoutes);
app.use("/api/profile", profileRoutes); // <-- add profile route

export default app;
