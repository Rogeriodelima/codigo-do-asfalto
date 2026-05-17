import { Router } from "express";
import {
  getEquipamentos,
  getEquipamento,
  postEquipamento,
  putEquipamento,
  deleteEquipamento,
} from "./equipamentos.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const router = Router();

// GET /api/v1/equipamentos
router.get("/", autenticar, validarTenant, getEquipamentos);

// GET /api/v1/equipamentos/:id
router.get("/:id", autenticar, validarTenant, getEquipamento);

// POST /api/v1/equipamentos
router.post("/", autenticar, validarTenant, postEquipamento);

// PUT /api/v1/equipamentos/:id
router.put("/:id", autenticar, validarTenant, putEquipamento);

// DELETE /api/v1/equipamentos/:id
router.delete("/:id", autenticar, validarTenant, deleteEquipamento);

export default router;
