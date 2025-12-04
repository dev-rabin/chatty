import express from 'express';
const router = express.Router();
import { checkAuth, login, logout, signup, updateProfile } from '../controller/auth.controller.js';
import { protectedRoute } from '../middleware/auth.middleware.js';

router.post("/login", login)
router.post("/logout", logout)
router.post("/signup", signup);

router.put("/update-profile", protectedRoute, updateProfile);
router.get("/check", protectedRoute, checkAuth)

export default router;