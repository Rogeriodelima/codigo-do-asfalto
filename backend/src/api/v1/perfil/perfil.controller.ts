import { Request, Response } from "express";
import { buscarPerfil, atualizarPerfil, atualizarFotoPerfil } from "./perfil.service";

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

// =============================================
// UPLOAD DE FOTO DE PERFIL
// =============================================

const MIME_PERMITIDOS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function postFoto(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;

    if (!req.file) {
      return res.status(400).json({ error: "Arquivo nao enviado" });
    }

    const contentType = req.file.mimetype;
    const extensao = MIME_PERMITIDOS[contentType];

    if (!extensao) {
      return res
        .status(400)
        .json({ error: "Tipo de arquivo invalido. Use jpeg, png ou webp" });
    }

    const url = await atualizarFotoPerfil(
      usuario_id,
      tenant_id,
      req.file.buffer,
      contentType,
      extensao,
    );

    return res.status(200).json({ foto_url: url });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
