import { Router } from "express";
import { getEvolucao, getDashboard } from "./evolucao.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Evolucao
 *   description: Evolução e dashboard do usuário
 */

/**
 * @swagger
 * /api/v1/evolucao:
 *   get:
 *     summary: Retorna o histórico de evolução do usuário
 *     tags: [Evolucao]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Evolução retornada com sucesso
 */
router.get("/", autenticar, validarTenant, getEvolucao);

/**
 * @swagger
 * /api/v1/evolucao/dashboard:
 *   get:
 *     summary: Retorna os dados consolidados do dashboard
 *     tags: [Evolucao]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retornado com sucesso
 */
router.get("/dashboard", autenticar, validarTenant, getDashboard);

export default router;