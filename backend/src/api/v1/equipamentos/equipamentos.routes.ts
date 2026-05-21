import { Router } from "express";
import { getEquipamentos, getEquipamento, postEquipamento, putEquipamento, deleteEquipamento } from "./equipamentos.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Equipamentos
 *   description: Equipamentos do piloto
 */

/**
 * @swagger
 * /api/v1/equipamentos:
 *   get:
 *     summary: Lista todos os equipamentos do usuário
 *     tags: [Equipamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 */
router.get("/", autenticar, validarTenant, getEquipamentos);

/**
 * @swagger
 * /api/v1/equipamentos/{id}:
 *   get:
 *     summary: Retorna um equipamento específico
 *     tags: [Equipamentos]
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
 *         description: Equipamento retornado com sucesso
 *       404:
 *         description: Equipamento não encontrado
 */
router.get("/:id", autenticar, validarTenant, getEquipamento);

/**
 * @swagger
 * /api/v1/equipamentos:
 *   post:
 *     summary: Adiciona um novo equipamento
 *     tags: [Equipamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, tipo]
 *             properties:
 *               nome:
 *                 type: string
 *               tipo:
 *                 type: string
 *               descricao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Equipamento adicionado com sucesso
 */
router.post("/", autenticar, validarTenant, postEquipamento);

/**
 * @swagger
 * /api/v1/equipamentos/{id}:
 *   put:
 *     summary: Atualiza um equipamento
 *     tags: [Equipamentos]
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
 *         description: Equipamento atualizado com sucesso
 */
router.put("/:id", autenticar, validarTenant, putEquipamento);

/**
 * @swagger
 * /api/v1/equipamentos/{id}:
 *   delete:
 *     summary: Remove um equipamento
 *     tags: [Equipamentos]
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
 *         description: Equipamento removido com sucesso
 *       404:
 *         description: Equipamento não encontrado
 */
router.delete("/:id", autenticar, validarTenant, deleteEquipamento);

export default router;