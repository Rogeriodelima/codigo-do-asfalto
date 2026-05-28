import { Router } from "express";
import { getLogs } from "./auditoria.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";
import { autorizarPerfil } from "../../../middlewares/autorizarPerfil";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auditoria
 *   description: Logs de auditoria do sistema (acesso restrito a gestores e admins)
 */

/**
 * @swagger
 * /api/v1/auditoria:
 *   get:
 *     summary: Lista os logs de auditoria do tenant
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tabela
 *         schema:
 *           type: string
 *         description: Filtrar por tabela afetada
 *       - in: query
 *         name: usuario_id
 *         schema:
 *           type: integer
 *         description: Filtrar por usuário
 *       - in: query
 *         name: acao
 *         schema:
 *           type: string
 *         description: Filtrar por ação (busca parcial, case-insensitive)
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (ISO 8601)
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (ISO 8601)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Logs retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 paginas:
 *                   type: integer
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso restrito a GESTOR ou ADMIN
 */
router.get(
  "/",
  autenticar,
  validarTenant,
  autorizarPerfil("GESTOR", "ADMIN"),
  getLogs,
);

export default router;
