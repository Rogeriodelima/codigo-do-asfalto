import { prisma } from "../../../utils/prisma";
import {
  getChaveAtiva,
  encrypt,
  getChavePorId,
  decrypt,
} from "../../../utils/crypto";
import { randomBytes } from "crypto";
import { enviarEmailConvite } from "../../../utils/email";

// =============================================
// GERAR CONVITE
// =============================================

export async function gerarConvite(
  gerado_por: number,
  tenant_id: number,
  dados: {
    email_convidado: string;
    celular_convidado?: string;
  },
) {
  // Busca configuracao de expiracao do tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenant_id },
  });

  if (!tenant) {
    throw new Error("Tenant nao encontrado");
  }

  // Verifica se ja existe convite pendente para este email neste tenant
  const conviteExistente = await prisma.convite.findFirst({
    where: {
      email_convidado: dados.email_convidado,
      tenant_id,
      status: "PENDENTE",
      deleted_at: null,
    },
  });

  if (conviteExistente) {
    throw new Error(
      "Ja existe um convite pendente para este email neste tenant",
    );
  }

  // Verifica se usuario ja e membro deste tenant
  const usuarioExistente = await prisma.usuario.findFirst({
    where: {
      email: dados.email_convidado,
      tenants: {
        some: { tenant_id, status: "ATIVO" },
      },
    },
  });

  if (usuarioExistente) {
    throw new Error("Este email ja e membro deste tenant");
  }

  // Calcula data de expiracao
  const dataExpiracao = new Date();
  if (tenant.convite_expiracao_dias > 0) {
    dataExpiracao.setDate(
      dataExpiracao.getDate() + tenant.convite_expiracao_dias,
    );
  } else {
    // Sem expiracao - define para 100 anos
    dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 100);
  }

  // Gera codigo unico
  const codigo = randomBytes(8).toString("hex").toUpperCase();

  // Criptografa dados sensiveis
  const chave = await getChaveAtiva(prisma as any);
  const emailEnc = encrypt(dados.email_convidado, chave.key);
  const celularEnc = dados.celular_convidado
    ? encrypt(dados.celular_convidado, chave.key)
    : null;

  // Cria o convite
  const convite = await prisma.convite.create({
    data: {
      tenant_id,
      gerado_por,
      email_convidado: emailEnc,
      celular_convidado: celularEnc,
      codigo,
      status: "PENDENTE",
      data_expiracao: dataExpiracao,
      chave_cripto_id: chave.id,
    },
  });

  // Log de auditoria
  await prisma.auditoriaLog.create({
    data: {
      tenant_id,
      usuario_id: gerado_por,
      tipo_log: "ACAO",
      tabela: "convites",
      registro_id: convite.id,
      acao: "CREATE_CONVITE",
      valor_novo: { email_convidado: dados.email_convidado },
    },
  });

  // Envia email com o codigo
  const gerador = await prisma.usuario.findUnique({
    where: { id: gerado_por },
    select: { nome: true },
  });

  await enviarEmailConvite({
    email_destinatario: dados.email_convidado,
    nome_convidador: gerador?.nome || "Um membro",
    tenant_nome: tenant.nome,
    codigo,
    data_expiracao: dataExpiracao,
  });

  return {
    id: convite.id,
    codigo: convite.codigo,
    email_convidado: dados.email_convidado,
    data_expiracao: convite.data_expiracao,
    message: "Convite gerado com sucesso",
  };
}

// =============================================
// LISTAR CONVITES
// =============================================

export async function listarConvites(usuario_id: number, tenant_id: number) {
  const convites = await prisma.convite.findMany({
    where: {
      gerado_por: usuario_id,
      tenant_id,
      deleted_at: null,
    },
    orderBy: { created_at: "desc" },
  });

  const resultado = await Promise.all(
    convites.map(async (c: any) => {
      let email = c.email_convidado;
      if (c.chave_cripto_id) {
        const chave = await getChavePorId(prisma as any, c.chave_cripto_id);
        email = decrypt(c.email_convidado, chave);
      }
      return {
        id: c.id,
        codigo: c.codigo,
        email_convidado: email,
        status: c.status,
        data_expiracao: c.data_expiracao,
        data_uso: c.data_uso,
        created_at: c.created_at,
      };
    }),
  );

  return resultado;
}

// =============================================
// CANCELAR CONVITE
// =============================================

export async function cancelarConvite(
  id: number,
  usuario_id: number,
  tenant_id: number,
) {
  const convite = await prisma.convite.findFirst({
    where: {
      id,
      gerado_por: usuario_id,
      tenant_id,
      status: "PENDENTE",
      deleted_at: null,
    },
  });

  if (!convite) {
    throw new Error("Convite nao encontrado ou nao pode ser cancelado");
  }

  await prisma.convite.update({
    where: { id },
    data: { status: "CANCELADO", updated_at: new Date() },
  });

  await prisma.auditoriaLog.create({
    data: {
      tenant_id,
      usuario_id,
      tipo_log: "ACAO",
      tabela: "convites",
      registro_id: id,
      acao: "CANCEL_CONVITE",
    },
  });

  return { message: "Convite cancelado com sucesso" };
}
