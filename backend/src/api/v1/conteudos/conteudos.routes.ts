import { Router } from "express";
import { getConteudos, getConteudo, getRecomendacoes, postConteudo, putConteudo } from "./conteudos.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Conteudos
 *   description: Conteúdos e recomendações
 */

/**
 * @swagger
 * /api/v1/conteudos:
 *   get:
 *     summary: Lista todos os conteúdos disponíveis
 *     tags: [Conteudos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 */
router.get("/", autenticar, validarTenant, getConteudos);

/**
 * @swagger
 * /api/v1/conteudos/recomendacoes:
 *   get:
 *     summary: Retorna conteúdos recomendados para o nível do usuário
 *     tags: [Conteudos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recomendações retornadas com sucesso
 */
router.get("/recomendacoes", autenticar, validarTenant, getRecomendacoes);

/**
 * @swagger
 * /api/v1/conteudos/{id}:
 *   get:
 *     summary: Retorna um conteúdo específico
 *     tags: [Conteudos]
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
 *         description: Conteúdo retornado com sucesso
 *       404:
 *         description: Conteúdo não encontrado
 */
router.get("/:id", autenticar, validarTenant, getConteudo);

/**
 * @swagger
 * /api/v1/conteudos:
 *   post:
 *     summary: Cria um novo conteúdo
 *     tags: [Conteudos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, tipo, nivel_recomendado]
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               tipo:
 *                 type: string
 *               nivel_recomendado:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Conteúdo criado com sucesso
 */
router.post("/", autenticar, validarTenant, postConteudo);

/**
 * @swagger
 * /api/v1/conteudos/{id}:
 *   put:
 *     summary: Atualiza um conteúdo
 *     tags: [Conteudos]
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
 *         description: Conteúdo atualizado com sucesso
 */
router.put("/:id", autenticar, validarTenant, putConteudo);

export default router;