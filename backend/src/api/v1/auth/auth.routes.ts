import { Router } from "express";
import { registro, login, authGoogle, authInstagram } from "./auth.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e registro de usuários
 */

/**
 * @swagger
 * /api/v1/auth/registro:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha, codigoConvite]
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               codigoConvite:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos ou convite inválido
 */
router.post("/registro", registro);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Realiza login com email e senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso, retorna JWT
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", login);

/**
 * @swagger
 * /api/v1/auth/google:
 *   post:
 *     summary: Autenticação via Google OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Autenticado com sucesso
 *       401:
 *         description: Token inválido
 */
router.post("/google", authGoogle);

/**
 * @swagger
 * /api/v1/auth/instagram:
 *   post:
 *     summary: Autenticação via Instagram OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Autenticado com sucesso
 *       401:
 *         description: Token inválido
 */
router.post("/instagram", authInstagram);

export default router;