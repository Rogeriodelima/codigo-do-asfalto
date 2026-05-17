import { Router } from "express";
import { registro, login, authGoogle, authInstagram } from "./auth.controller";

const router = Router();

// POST /api/v1/auth/registro
router.post("/registro", registro);

// POST /api/v1/auth/login
router.post("/login", login);

// POST /api/v1/auth/google
router.post("/google", authGoogle);

// POST /api/v1/auth/instagram
router.post("/instagram", authInstagram);

export default router;
