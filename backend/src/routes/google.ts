import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import User from "../models/user";

const router = Router();

// Google OAuth login
router.get("/", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const profile = req.user;
      if (!profile) {
        return res.status(401).send("No user returned from Google OAuth");
      }

      const email = (profile as any).email;
      const displayName = (profile as any).displayName;
      const photoUrl = (profile as any).photos?.[0]?.value;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          full_name: displayName || "",
          avatar_url: photoUrl || "/default-avatar.png",
          nationality: "",
          gender: "",
          phone: "",
          bloodType: "",
          allergies: "",
          emergencyContact: "",
        });
      }

      const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "1h" });
      const frontendUrl = `http://localhost:8081/oauth/callback?token=${token}`;
      res.redirect(frontendUrl);
    } catch (err) {
      console.error("OAuth callback error:", err);
      res.status(500).send("OAuth error");
    }
  }
);



export default router;
