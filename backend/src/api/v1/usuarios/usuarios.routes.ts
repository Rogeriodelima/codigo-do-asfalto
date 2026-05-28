import { Router } from "express";
import {
  getMeTenants,
  getMePerfil,
  postSelecionarTenant,
} from "./usuarios.controller";
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

/**
 * @swagger
 * /api/v1/usuarios/me/perfil:
 *   get:
 *     summary: Retorna o perfil e nível do usuário no tenant atual
 *     description: Busca o registro em usuario_tenants usando o usuario_id e tenant_id presentes no JWT. Retorna perfil derivado do nivel_atual (ADMIN ≥ 6, GESTOR = 5, MEMBRO < 5).
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 perfil:
 *                   type: string
 *                   enum: [ADMIN, GESTOR, MEMBRO]
 *                   example: GESTOR
 *                 nivel:
 *                   type: integer
 *                   example: 5
 *                 tenant_id:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: tenant_id ausente no token ou vínculo não encontrado
 *       401:
 *         description: Token não fornecido ou inválido
 */
router.get("/me/perfil", autenticar, getMePerfil);

/**
 * @swagger
 * /api/v1/usuarios/selecionar-tenant:
 *   post:
 *     summary: Seleciona o tenant ativo e emite JWT definitivo
 *     description: Valida o acesso do usuário ao tenant informado e retorna um novo JWT com tenant_id e nivel preenchidos. Deve ser chamado após GET /me/tenants quando o usuário tem mais de um tenant.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tenant_id]
 *             properties:
 *               tenant_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: JWT definitivo emitido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nome:
 *                       type: string
 *                     email:
 *                       type: string
 *                     nivel:
 *                       type: integer
 *                     tenant_id:
 *                       type: integer
 *       400:
 *         description: tenant_id ausente
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Usuário não tem acesso a este tenant
 */
router.post("/selecionar-tenant", autenticar, postSelecionarTenant);

export default router;
