import { Router } from "express";
import { postConvite, getConvites, deleteConvite } from "./convites.controller";
import { autenticar } from "../../../middlewares/auth.middleware";
import { validarTenant } from "../../../middlewares/tenant.middleware";

const router = Router();

// POST /api/v1/convites
router.post("/", autenticar, validarTenant, postConvite);

// GET /api/v1/convites
router.get("/", autenticar, validarTenant, getConvites);

// DELETE /api/v1/convites/:id
router.delete("/:id", autenticar, validarTenant, deleteConvite);

export default router;
