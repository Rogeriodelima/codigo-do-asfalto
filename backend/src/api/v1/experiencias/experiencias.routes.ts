import { Router } from "express";
import {
  getExperiencias,
  getExperiencia,
  postExperiencia,
  putExperiencia,
  deleteExperiencia,
} from "./experiencias.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const router = Router();

// GET /api/v1/experiencias
router.get("/", autenticar, validarTenant, getExperiencias);

// GET /api/v1/experiencias/:id
router.get("/:id", autenticar, validarTenant, getExperiencia);

// POST /api/v1/experiencias
router.post("/", autenticar, validarTenant, postExperiencia);

// PUT /api/v1/experiencias/:id
router.put("/:id", autenticar, validarTenant, putExperiencia);

// DELETE /api/v1/experiencias/:id
router.delete("/:id", autenticar, validarTenant, deleteExperiencia);

export default router;
