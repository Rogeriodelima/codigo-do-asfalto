import { Router } from "express";
import { getFila, postValidacao, postNotificar } from "./validacoes.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const router = Router();

// GET /api/v1/validacoes/fila
router.get("/fila", autenticar, validarTenant, getFila);

// POST /api/v1/validacoes/:experiencia_id
router.post("/:experiencia_id", autenticar, validarTenant, postValidacao);

// POST /api/v1/validacoes/:experiencia_id/notificar
router.post(
  "/:experiencia_id/notificar",
  autenticar,
  validarTenant,
  postNotificar,
);

export default router;
