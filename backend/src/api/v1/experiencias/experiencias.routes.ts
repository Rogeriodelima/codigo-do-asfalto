import { Router } from "express";
import { getExperiencias, getExperiencia, postExperiencia, putExperiencia, deleteExperiencia } from "./experiencias.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Experiencias
 *   description: Registro e gerenciamento de experiências
 */

/**
 * @swagger
 * /api/v1/experiencias:
 *   get:
 *     summary: Lista todas as experiências do usuário
 *     tags: [Experiencias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 */
router.get("/", autenticar, validarTenant, getExperiencias);

/**
 * @swagger
 * /api/v1/experiencias/{id}:
 *   get:
 *     summary: Retorna uma experiência específica
 *     tags: [Experiencias]
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
 *         description: Experiência retornada com sucesso
 *       404:
 *         description: Experiência não encontrada
 */
router.get("/:id", autenticar, validarTenant, getExperiencia);

/**
 * @swagger
 * /api/v1/experiencias:
 *   post:
 *     summary: Registra uma nova experiência
 *     tags: [Experiencias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo, titulo, data]
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [viagem, evento, rota]
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               data:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Experiência registrada com sucesso
 */
router.post("/", autenticar, validarTenant, postExperiencia);

/**
 * @swagger
 * /api/v1/experiencias/{id}:
 *   put:
 *     summary: Atualiza uma experiência
 *     tags: [Experiencias]
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
 *         description: Experiência atualizada com sucesso
 *       404:
 *         description: Experiência não encontrada
 */
router.put("/:id", autenticar, validarTenant, putExperiencia);

/**
 * @swagger
 * /api/v1/experiencias/{id}:
 *   delete:
 *     summary: Remove uma experiência
 *     tags: [Experiencias]
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
 *         description: Experiência removida com sucesso
 *       404:
 *         description: Experiência não encontrada
 */
router.delete("/:id", autenticar, validarTenant, deleteExperiencia);

export default router;