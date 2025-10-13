// backend/src/models/user.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;          // optional for OAuth users
  full_name?: string;
  nationality?: string;
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
  avatar_url?: string;
  googleId?: string;          // for Google OAuth
  tripItinerary?: string[];   // optional
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    full_name: { type: String, default: "" },
    nationality: { type: String, default: "" },
    bloodType: { type: String, default: "" },
    allergies: { type: String, default: "" },
    emergencyContact: { type: String, default: "" },
    avatar_url: { type: String, default: "/default-avatar.png" },
    googleId: { type: String },
    tripItinerary: [{ type: String }],
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
