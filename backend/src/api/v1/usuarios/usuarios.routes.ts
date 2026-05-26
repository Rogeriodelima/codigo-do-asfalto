import { Router } from "express";
import { getMeTenants } from "./usuarios.controller";
import { autenticar } from "../../../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Operações relacionadas ao usuário autenticado
 */

/**
 * @swagger
 * /api/v1/usuarios/me/tenants:
 *   get:
 *     summary: Lista os tenants ativos do usuário autenticado
 *     description: Retorna todos os tenants onde o usuário possui vínculo ativo (status = ATIVO). Usado na seleção de tenant pós-login.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tenants retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nome:
 *                     type: string
 *                     example: "BMW Motorrad"
 *                   logo_url:
 *                     type: string
 *                     nullable: true
 *                     example: null
 *       401:
 *         description: Token não fornecido ou inválido
 *       400:
 *         description: Erro ao buscar tenants
 */
router.get("/me/tenants", autenticar, getMeTenants);

export default router;
