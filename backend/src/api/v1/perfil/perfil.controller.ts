import { Request, Response } from "express";
import { buscarPerfil, atualizarPerfil } from "./perfil.service";

// =============================================
// BUSCAR PERFIL
// =============================================

export async function getPerfil(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;

    const perfil = await buscarPerfil(usuario_id, tenant_id);

    return res.status(200).json(perfil);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// =============================================
// ATUALIZAR PERFIL
// =============================================

export async function putPerfil(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const { nome, nome_exibido, celular } = req.body;

    if (!nome && !nome_exibido && !celular) {
      return res.status(400).json({
        error:
          "Informe ao menos um campo para atualizar: nome, nome_exibido ou celular",
      });
    }

    const resultado = await atualizarPerfil(usuario_id, tenant_id, {
      nome,
      nome_exibido,
      celular,
    });

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
