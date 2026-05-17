import { Router } from "express";
import { getPerfil, putPerfil } from "./perfil.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const router = Router();

// GET /api/v1/perfil
router.get("/", autenticar, validarTenant, getPerfil);

// PUT /api/v1/perfil
router.put("/", autenticar, validarTenant, putPerfil);

export default router;
