import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../../utils/prisma";
import { getChaveAtiva, encrypt, getChavePorId, decrypt } from "../../../utils/crypto";
import { enviarEmailBoasVindas } from "../../../utils/email";

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
  tenant_id: number;
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

  // Verifica vinculo com tenant separadamente
  const usuarioTenant = await prisma.usuarioTenant.findFirst({
    where: {
      usuario_id: usuario.id,
      tenant_id: dados.tenant_id,
      status: "ATIVO",
      deleted_at: null,
    },
  });

  if (!usuarioTenant) {
    throw new Error("Usuario nao tem acesso a este tenant");
  }

  // Gera token JWT
  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      tenant_id: dados.tenant_id,
      nivel: usuarioTenant.nivel_atual,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
  );

  // Log de auditoria
  await prisma.auditoriaLog.create({
    data: {
      tenant_id: dados.tenant_id,
      usuario_id: usuario.id,
      tipo_log: "ACESSO",
      acao: "LOGIN",
    },
  });

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      nivel: usuarioTenant.nivel_atual,
      tenant_id: dados.tenant_id,
    },
  };
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
