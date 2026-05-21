import { Router } from "express";
import { getFila, postValidacao, postNotificar } from "./validacoes.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Validacoes
 *   description: Validação de experiências
 */

/**
 * @swagger
 * /api/v1/validacoes/fila:
 *   get:
 *     summary: Retorna a fila de experiências pendentes de validação
 *     tags: [Validacoes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fila retornada com sucesso
 */
router.get("/fila", autenticar, validarTenant, getFila);

/**
 * @swagger
 * /api/v1/validacoes/{experiencia_id}:
 *   post:
 *     summary: Valida uma experiência (aprovar, revisar ou rejeitar)
 *     tags: [Validacoes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: experiencia_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [acao]
 *             properties:
 *               acao:
 *                 type: string
 *                 enum: [aprovar, revisar, rejeitar]
 *               observacao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validação registrada com sucesso
 */
router.post("/:experiencia_id", autenticar, validarTenant, postValidacao);

/**
 * @swagger
 * /api/v1/validacoes/{experiencia_id}/notificar:
 *   post:
 *     summary: Envia notificação ao usuário sobre a validação
 *     tags: [Validacoes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: experiencia_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notificação enviada com sucesso
 */
router.post("/:experiencia_id/notificar", autenticar, validarTenant, postNotificar);

export default router;