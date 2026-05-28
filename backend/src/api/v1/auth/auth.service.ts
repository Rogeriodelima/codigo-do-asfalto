import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../../../utils/prisma";
import { getChaveAtiva, encrypt, getChavePorId, decrypt } from "../../../utils/crypto";
import { enviarEmailBoasVindas, enviarEmailRecuperacaoSenha } from "../../../utils/email";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// =============================================
// REGISTRO
// =============================================

export async function registrarUsuario(dados: {
  nome: string;
  email: string;
  senha: string;
  celular?: string;
  codigo_convite: string;
  tenant_id: number;
}) {
  // Valida convite — email_convidado é criptografado com IV aleatório,
  // não é possível comparar no banco. Busca pelo código e compara em memória.
  const convite = await prisma.convite.findFirst({
    where: {
      codigo: dados.codigo_convite,
      status: "PENDENTE",
      tenant_id: dados.tenant_id,
      data_expiracao: { gte: new Date() },
      deleted_at: null,
    },
  });

  if (!convite) {
    throw new Error("Convite invalido, expirado ou ja utilizado");
  }

  let emailConvite = convite.email_convidado;
  if (convite.chave_cripto_id) {
    const chave = await getChavePorId(prisma as any, convite.chave_cripto_id);
    emailConvite = decrypt(convite.email_convidado, chave);
  }

  if (emailConvite.toLowerCase() !== dados.email.toLowerCase()) {
    throw new Error("Email nao corresponde ao convite");
  }

  // Verifica se email ja existe
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email: dados.email },
  });

  if (usuarioExistente) {
    throw new Error("Email ja cadastrado na plataforma");
  }

  // Busca chave de criptografia ativa
  const chave = await getChaveAtiva(prisma as any);

  // Criptografa dados sensiveis
  const celularEnc = dados.celular ? encrypt(dados.celular, chave.key) : null;

  // Hash da senha
  const senha_hash = await bcrypt.hash(dados.senha, 12);

  // Cria usuario
  const usuario = await prisma.usuario.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      senha_hash,
      celular: celularEnc,
      chave_cripto_id: chave.id,
    },
  });

  // Vincula usuario ao tenant
  await prisma.usuarioTenant.create({
    data: {
      usuario_id: usuario.id,
      tenant_id: dados.tenant_id,
      tenant_padrao: true,
    },
  });

  // Marca convite como usado
  await prisma.convite.update({
    where: { id: convite.id },
    data: {
      status: "USADO",
      data_uso: new Date(),
      usado_por: usuario.id,
    },
  });

  // Log de auditoria
  await prisma.auditoriaLog.create({
    data: {
      tenant_id: dados.tenant_id,
      usuario_id: usuario.id,
      tipo_log: "ACAO",
      tabela: "usuarios",
      registro_id: usuario.id,
      acao: "REGISTRO",
      valor_novo: { email: dados.email, nome: dados.nome },
    },
  });

  // Envia email de boas vindas
  const tenantInfo = await prisma.tenant.findUnique({
    where: { id: dados.tenant_id },
    select: { nome: true },
  });

  await enviarEmailBoasVindas({
    email_destinatario: dados.email,
    nome_usuario: dados.nome,
    tenant_nome: tenantInfo?.nome || "Codigo do Asfalto",
  });

  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}

// =============================================
// LOGIN
// =============================================

export async function loginUsuario(dados: {
  email: string;
  senha: string;
}) {
  // Busca usuario
  let usuario;
  try {
    usuario = await prisma.usuario.findUnique({
      where: { email: dados.email },
    });
  } catch (err: any) {
    console.error("ERRO DETALHADO:", err.message);
    console.error("CAUSA:", err.cause);
    throw err;
  }

  if (!usuario || !usuario.senha_hash) {
    throw new Error("Email ou senha invalidos");
  }

  if (!usuario.ativo) {
    throw new Error("Conta desativada");
  }

  // Valida senha
  const senhaValida = await bcrypt.compare(dados.senha, usuario.senha_hash);
  if (!senhaValida) {
    throw new Error("Email ou senha invalidos");
  }

  // Busca o nivel do tenant padrão (ou primeiro ativo) para incluir no JWT.
  // tenant_id permanece 0 até o usuário chamar /usuarios/selecionar-tenant;
  // o nivel aqui é uma aproximação pré-seleção — o JWT definitivo vem depois.
  const usuarioTenantPadrao = await prisma.usuarioTenant.findFirst({
    where: { usuario_id: usuario.id, status: "ATIVO", deleted_at: null },
    orderBy: [{ tenant_padrao: "desc" }, { created_at: "asc" }],
  });

  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      tenant_id: 0,
      nivel: usuarioTenantPadrao?.nivel_atual ?? 0,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    },
  };
}

// =============================================
// RECUPERAR SENHA
// =============================================

export async function recuperarSenha(email: string) {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    // Responde com sucesso mesmo quando email não existe para evitar enumeração
    if (!usuario || !usuario.ativo || !usuario.senha_hash) return;

    // Invalida tokens anteriores ainda não usados
    await prisma.tokenResetSenha.updateMany({
      where: { usuario_id: usuario.id, usado: false },
      data: { usado: true },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiracao = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.tokenResetSenha.create({
      data: { usuario_id: usuario.id, token, expiracao },
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const link = `${frontendUrl}/redefinir-senha?token=${token}`;

    await enviarEmailRecuperacaoSenha({
      email_destinatario: email,
      nome_usuario: usuario.nome,
      link_reset: link,
    });
  } catch (error) {
    console.error("Erro recuperar senha:", error);
    throw error;
  }
}

// =============================================
// REDEFINIR SENHA
// =============================================

export async function redefinirSenha(token: string, nova_senha: string) {
  const registro = await prisma.tokenResetSenha.findFirst({
    where: {
      token,
      usado: false,
      expiracao: { gte: new Date() },
    },
  });

  if (!registro) {
    throw new Error("Token invalido ou expirado");
  }

  const senha_hash = await bcrypt.hash(nova_senha, 12);

  await prisma.usuario.update({
    where: { id: registro.usuario_id },
    data: { senha_hash },
  });

  await prisma.tokenResetSenha.update({
    where: { id: registro.id },
    data: { usado: true },
  });
}

// =============================================
// OAUTH GOOGLE (mockado - aguardando credenciais)
// =============================================

export async function loginGoogle(dados: {
  oauth_id: string;
  email: string;
  nome: string;
  tenant_id: number;
}) {
  // TODO: substituir por validacao real do token Google
  // Por ora retorna dados mockados para estrutura estar pronta

  let usuario = await prisma.usuario.findUnique({
    where: { email: dados.email },
  });

  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        oauth_provider: "google",
        oauth_id: dados.oauth_id,
        email_verificado: true,
      },
    });

    await prisma.usuarioTenant.create({
      data: {
        usuario_id: usuario.id,
        tenant_id: dados.tenant_id,
        tenant_padrao: true,
      },
    });
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      tenant_id: dados.tenant_id,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
  );

  return {
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  };
}

// =============================================
// OAUTH INSTAGRAM (mockado - aguardando credenciais)
// =============================================

export async function loginInstagram(dados: {
  oauth_id: string;
  email: string;
  nome: string;
  tenant_id: number;
}) {
  // TODO: substituir por validacao real do token Instagram
  // Mesma estrutura do Google, provider diferente

  let usuario = await prisma.usuario.findUnique({
    where: { email: dados.email },
  });

  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        oauth_provider: "instagram",
        oauth_id: dados.oauth_id,
        email_verificado: true,
      },
    });

    await prisma.usuarioTenant.create({
      data: {
        usuario_id: usuario.id,
        tenant_id: dados.tenant_id,
        tenant_padrao: true,
      },
    });
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      tenant_id: dados.tenant_id,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
  );

  return {
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  };
}
