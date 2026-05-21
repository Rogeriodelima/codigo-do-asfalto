import { Router } from "express";
import { postConvite, getConvites, deleteConvite } from "./convites.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Convites
 *   description: Gerenciamento de convites
 */

/**
 * @swagger
 * /api/v1/convites:
 *   post:
 *     summary: Gera um novo convite
 *     tags: [Convites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Convite gerado com sucesso
 *       401:
 *         description: Não autenticado
 */
router.post("/", autenticar, validarTenant, postConvite);

/**
 * @swagger
 * /api/v1/convites:
 *   get:
 *     summary: Lista todos os convites gerados pelo usuário
 *     tags: [Convites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de convites retornada com sucesso
 *       401:
 *         description: Não autenticado
 */
router.get("/", autenticar, validarTenant, getConvites);

/**
 * @swagger
 * /api/v1/convites/{id}:
 *   delete:
 *     summary: Cancela um convite
 *     tags: [Convites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Convite cancelado com sucesso
 *       404:
 *         description: Convite não encontrado
 */
router.delete("/:id", autenticar, validarTenant, deleteConvite);

export default router;