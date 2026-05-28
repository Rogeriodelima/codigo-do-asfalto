import { Router } from "express";
import multer from "multer";
import { getPerfil, putPerfil, postFoto } from "./perfil.controller";
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

/**
 * @swagger
 * /api/v1/perfil/foto:
 *   post:
 *     summary: Faz upload da foto de perfil do usuário
 *     description: Recebe um arquivo de imagem via multipart/form-data, valida tipo (jpeg, png, webp) e tamanho máximo de 5 MB, faz upload para o Cloudflare R2 na pasta fotos-perfil/ e atualiza o campo foto_url na tabela usuarios.
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
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
 *                   example: "https://cdn.codigodoasfalto.com.br/fotos-perfil/42-1716900000000.jpg"
 *       400:
 *         description: Arquivo ausente ou tipo inválido
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro no upload
 */
router.post("/foto", autenticar, validarTenant, upload.single("foto"), postFoto);

export default router;