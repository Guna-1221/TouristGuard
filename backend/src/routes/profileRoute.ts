import { Router } from "express";
import { updateProfileHandler } from "../controllers/profileContoller";
import { upload } from "../middlewares/upload";
import { authenticateJWT } from "../middlewares/auth";
import { getProfileHandler } from "../controllers/profileContoller";
 // your JWT middleware

const router = Router();

router.post("/update", authenticateJWT, upload.single("avatar"), updateProfileHandler);
router.get("/me", authenticateJWT, getProfileHandler);

export default router;
