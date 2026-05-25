import { Request, Response } from "express";
import {
  registrarUsuario,
  loginUsuario,
  loginGoogle,
  loginInstagram,
  recuperarSenha as recuperarSenhaService,
  redefinirSenha as redefinirSenhaService,
} from "./auth.service";

// =============================================
// REGISTRO
// =============================================

export async function registro(req: Request, res: Response) {
  try {
    const { nome, email, senha, celular, codigo_convite, tenant_id } = req.body;

    if (!nome || !email || !senha || !codigo_convite || !tenant_id) {
      return res.status(400).json({
        error:
          "Campos obrigatorios: nome, email, senha, codigo_convite, tenant_id",
      });
    }

    const usuario = await registrarUsuario({
      nome,
      email,
      senha,
      celular,
      codigo_convite,
      tenant_id: Number(tenant_id),
    });

    return res.status(201).json({
      message: "Conta criada com sucesso",
      usuario,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// =============================================
// LOGIN
// =============================================

export async function login(req: Request, res: Response) {
  try {
    const { email, senha, tenant_id } = req.body;

    if (!email || !senha || !tenant_id) {
      return res.status(400).json({
        error: "Campos obrigatorios: email, senha, tenant_id",
      });
    }

    const resultado = await loginUsuario({
      email,
      senha,
      tenant_id: Number(tenant_id),
    });

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }
}

// =============================================
// RECUPERAR SENHA
// =============================================

export async function recuperarSenha(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Campo obrigatorio: email" });
    }

    await recuperarSenhaService(email);

    // Sempre responde com sucesso para não revelar se o email existe
    return res.status(200).json({
      message: "Se o email estiver cadastrado, voce recebera as instrucoes em breve",
    });
  } catch (error) {
    console.error("Erro recuperar senha:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Erro desconhecido" });
  }
}

// =============================================
// REDEFINIR SENHA
// =============================================

export async function redefinirSenha(req: Request, res: Response) {
  try {
    const { token, nova_senha } = req.body;

    if (!token || !nova_senha) {
      return res.status(400).json({ error: "Campos obrigatorios: token, nova_senha" });
    }

    if (nova_senha.length < 6) {
      return res.status(400).json({ error: "A senha deve ter no minimo 6 caracteres" });
    }

    await redefinirSenhaService(token, nova_senha);

    return res.status(200).json({ message: "Senha redefinida com sucesso" });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// =============================================
// OAUTH GOOGLE (mockado)
// =============================================

export async function authGoogle(req: Request, res: Response) {
  try {
    const { token_google, tenant_id } = req.body;

    if (!token_google || !tenant_id) {
      return res.status(400).json({
        error: "Campos obrigatorios: token_google, tenant_id",
      });
    }

    // TODO: validar token_google com a API do Google
    // Por ora usa dados mockados para estrutura estar pronta
    const dadosMock = {
      oauth_id: "google_" + Date.now(),
      email: "usuario.google@mock.com",
      nome: "Usuario Google Mock",
      tenant_id: Number(tenant_id),
    };

    const resultado = await loginGoogle(dadosMock);

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// =============================================
// OAUTH INSTAGRAM (mockado)
// =============================================

export async function authInstagram(req: Request, res: Response) {
  try {
    const { token_instagram, tenant_id } = req.body;

    if (!token_instagram || !tenant_id) {
      return res.status(400).json({
        error: "Campos obrigatorios: token_instagram, tenant_id",
      });
    }

    // TODO: validar token_instagram com a API do Instagram
    // Por ora usa dados mockados para estrutura estar pronta
    const dadosMock = {
      oauth_id: "instagram_" + Date.now(),
      email: "usuario.instagram@mock.com",
      nome: "Usuario Instagram Mock",
      tenant_id: Number(tenant_id),
    };

    const resultado = await loginInstagram(dadosMock);

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
