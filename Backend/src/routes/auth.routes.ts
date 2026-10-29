import { Router } from "express";
import { register, login, logout, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Authenticated routes
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

export default router;
