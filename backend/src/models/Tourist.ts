import mongoose, { Schema, Document } from "mongoose";

export interface ITourist extends Document {
  fullName: string;
  officialId: string; // Aadhaar or Passport
  nationality?: string;
  tripItinerary?: string[];
  emergencyContact?: string;
  issuedAt: Date;
  validUntil: Date;
  idHash: string; // blockchain hash
  qrCode?: string;
  createdBy?: mongoose.Types.ObjectId; // reference to User
}

const touristSchema = new Schema<ITourist>(
  {
    fullName: { type: String, required: true },
    officialId: { type: String, required: true },
    nationality: { type: String },
    tripItinerary: [{ type: String }],
    emergencyContact: { type: String },
    issuedAt: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    idHash: { type: String, required: true, unique: true },
    qrCode: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Tourist = mongoose.model<ITourist>("Tourist", touristSchema);
export default Tourist;
