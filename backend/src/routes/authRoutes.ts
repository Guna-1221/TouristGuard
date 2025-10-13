import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { authenticateJWT } from "../middlewares/auth";
import { config } from "../config/env";

const router = Router();

// -------------------- SIGNUP --------------------
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      email,
      password,
      nationality,
      bloodType,
      allergies,
      emergencyContact,
      avatar_url,
    } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12); // stronger hash

    const user = await User.create({
      email,
      password: hashedPassword,
      full_name,
      nationality,
      bloodType,
      allergies,
      emergencyContact,
      avatar_url,
    });

    const { password: _, ...safeUser } = user.toObject();
    res.status(201).json({ message: "User created successfully", user: safeUser });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------- LOGIN --------------------
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email },
      config.JWT_SECRET,
      { expiresIn: "1h" } // Consider refresh tokens for longer sessions
    );

    const { password: _, ...safeUser } = user.toObject();
    res.json({ token, user: safeUser, role: "normal_user" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------- GET PROFILE --------------------
router.get("/me", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user, role: "normal_user" });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------- LOGOUT --------------------
router.post("/logout", (_req: Request, res: Response) => {
  // JWT is stateless; you can blacklist tokens if needed
  res.json({ message: "Logged out" });
});

export default router;
