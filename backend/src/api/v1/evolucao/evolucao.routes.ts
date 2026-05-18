import { Router } from "express";
import { getEvolucao, getDashboard } from "./evolucao.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const router = Router();

// GET /api/v1/evolucao
router.get("/", autenticar, validarTenant, getEvolucao);

// GET /api/v1/evolucao/dashboard
router.get("/dashboard", autenticar, validarTenant, getDashboard);

export default router;
