import { Router } from "express";
import { getPerfil, putPerfil } from "./perfil.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Perfil
 *   description: Gerenciamento do perfil do usuário
 */

/**
 * @swagger
 * /api/v1/perfil:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
 *       401:
 *         description: Não autenticado
 */
router.get("/", autenticar, validarTenant, getPerfil);

/**
 * @swagger
 * /api/v1/perfil:
 *   put:
 *     summary: Atualiza o perfil do usuário autenticado
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               celular:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       401:
 *         description: Não autenticado
 */
router.put("/", autenticar, validarTenant, putPerfil);

export default router;