import mongoose from "mongoose";
import { config } from "./env";

mongoose.connect(config.MONGO_URI, { autoIndex: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));
