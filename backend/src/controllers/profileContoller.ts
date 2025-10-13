import { Request, Response } from "express";
import User from "../models/user";

export const updateProfileHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // from JWT middleware

    const {
      full_name,
      nationality,
      gender,
      phone,
      bloodType,
      allergies,
      emergencyContact,
    } = req.body;

    // If a file is uploaded, store relative URL in DB
    let avatar_url;
    if (req.file) {
      avatar_url = `/uploads/avatars/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        full_name,
        nationality,
        gender,
        phone,
        bloodType,
        allergies,
        emergencyContact,
        ...(avatar_url && { avatar_url }),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getProfileHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // from JWT middleware

    const user = await User.findById(userId);
    

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

