import { Router } from "express";
import {
  getConteudos,
  getConteudo,
  getRecomendacoes,
  postConteudo,
  putConteudo,
} from "./conteudos.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const router = Router();

// GET /api/v1/conteudos
router.get("/", autenticar, validarTenant, getConteudos);

// GET /api/v1/conteudos/recomendacoes
router.get("/recomendacoes", autenticar, validarTenant, getRecomendacoes);

// GET /api/v1/conteudos/:id
router.get("/:id", autenticar, validarTenant, getConteudo);

// POST /api/v1/conteudos
router.post("/", autenticar, validarTenant, postConteudo);

// PUT /api/v1/conteudos/:id
router.put("/:id", autenticar, validarTenant, putConteudo);

export default router;
