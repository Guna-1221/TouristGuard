import { Router } from "express";
import User, { IUser } from "../models/user";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/issue-id", async (req, res) => {
  try {
    const {
      email,
      fullName,
      nationality,
      bloodType,
      allergies,
      emergencyContact,
      tripItinerary,
      tripDuration,
    } = req.body;

    if (!email || !fullName || !tripItinerary || !tripDuration || !emergencyContact) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user already exists
    let user: IUser | null = await User.findOne({ email });

    const digitalId = `DIGI-${uuidv4()}`; // unique ID, can be replaced with blockchain hash
    const validTill = new Date();
    validTill.setDate(validTill.getDate() + tripDuration);

    if (!user) {
      // Create new user with blockchain ID
      user = await User.create({
        email,
        fullName,
        nationality,
        bloodType,
        allergies,
        emergencyContact,
        tripItinerary,
        tripDuration,
        digitalId,
        validTill,
      });
    } else {
      // Update existing user with new trip and digital ID
      user.digitalId = digitalId;
      user.tripItinerary = tripItinerary;
      user.tripDuration = tripDuration;
      user.validTill = validTill;
      await user.save();
    }

    res.status(201).json({
      message: "Digital ID issued successfully",
      digitalId: user.digitalId,
      validTill: user.validTill,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
