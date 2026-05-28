import { Router } from "express";
import multer from "multer";
import {
  getEquipamentos,
  getEquipamento,
  postEquipamento,
  putEquipamento,
  deleteEquipamento,
  postFotoEquipamento,
} from "./equipamentos.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

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

/**
 * @swagger
 * /api/v1/equipamentos/{id}/foto:
 *   post:
 *     summary: Faz upload da foto de um equipamento
 *     description: Recebe imagem via multipart/form-data (jpeg, png ou webp, máx 5 MB), faz upload para o Cloudflare R2 na pasta fotos-motos/ e atualiza o campo foto_url na tabela equipamentos.
 *     tags: [Equipamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [foto]
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem (jpeg, png ou webp, máx 5 MB)
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 foto_url:
 *                   type: string
 *                   example: "https://cdn.codigodoasfalto.com.br/fotos-motos/7-1716900000000.jpg"
 *       400:
 *         description: Arquivo ausente, tipo inválido ou equipamento não encontrado
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro no upload
 */
router.post(
  "/:id/foto",
  autenticar,
  validarTenant,
  upload.single("foto"),
  postFotoEquipamento,
);

export default router;