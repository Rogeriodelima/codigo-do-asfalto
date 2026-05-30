import { prisma } from "../../../utils/prisma";
import {
  getChaveAtiva,
  encrypt,
  getChavePorId,
  decrypt,
} from "../../../utils/crypto";
import { randomBytes } from "crypto";
import { enviarEmailConvite } from "../../../utils/email";
import { enviarWhatsappConvite } from "../../../utils/whatsapp";

// =============================================
// VALIDAR CONVITE (pré-cadastro, sem autenticação)
// =============================================

export async function validarConvite(dados: {
  codigo: string;
  email?: string;
}) {
  const convite = await prisma.convite.findFirst({
    where: {
      codigo: dados.codigo,
      status: "PENDENTE",
      data_expiracao: { gte: new Date() },
      deleted_at: null,
    },
    include: {
      tenant: { select: { id: true, nome: true } },
    },
  });

  if (!convite) {
    throw new Error("Convite invalido, expirado ou ja utilizado");
  }

  // Valida email apenas se fornecido no body e se ha email armazenado no convite
  if (dados.email && convite.email_convidado) {
    // O email_convidado é criptografado com IV aleatório — descriptografa para comparar
    let emailConvite = convite.email_convidado;
    if (convite.chave_cripto_id) {
      const chave = await getChavePorId(prisma as any, convite.chave_cripto_id);
      emailConvite = decrypt(convite.email_convidado, chave);
    }

    if (emailConvite.toLowerCase() !== dados.email.toLowerCase()) {
      throw new Error("Email nao corresponde ao convite");
    }
  }

  return {
    tenant_id: convite.tenant_id,
    nome_tenant: convite.tenant.nome,
  };
}

// =============================================
// GERAR CONVITE
// =============================================

export async function gerarConvite(
  gerado_por: number,
  tenant_id: number,
  dados: {
    email_convidado?: string;
    celular_convidado?: string;
    canal: "EMAIL" | "WHATSAPP" | "AMBOS";
  },
) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenant_id },
  });

  if (!tenant) {
    throw new Error("Tenant nao encontrado");
  }

  // Verificacoes de duplicata — apenas quando email e fornecido
  if (dados.email_convidado) {
    const conviteExistente = await prisma.convite.findFirst({
      where: {
        email_convidado: dados.email_convidado,
        tenant_id,
        status: "PENDENTE",
        deleted_at: null,
      },
    });

    if (conviteExistente) {
      throw new Error("Ja existe um convite pendente para este email neste tenant");
    }

    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        email: dados.email_convidado,
        tenants: { some: { tenant_id, status: "ATIVO" } },
      },
    });

    if (usuarioExistente) {
      throw new Error("Este email ja e membro deste tenant");
    }
  }

  // Calcula data de expiracao
  const dataExpiracao = new Date();
  if (tenant.convite_expiracao_dias > 0) {
    dataExpiracao.setDate(dataExpiracao.getDate() + tenant.convite_expiracao_dias);
  } else {
    dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 100);
  }

  const codigo = randomBytes(8).toString("hex").toUpperCase();

  // Criptografa dados sensiveis
  const chave = await getChaveAtiva(prisma as any);
  const emailEnc = dados.email_convidado
    ? encrypt(dados.email_convidado, chave.key)
    : "";
  const celularEnc = dados.celular_convidado
    ? encrypt(dados.celular_convidado, chave.key)
    : null;

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

  await prisma.auditoriaLog.create({
    data: {
      tenant_id,
      usuario_id: gerado_por,
      tipo_log: "ACAO",
      tabela: "convites",
      registro_id: convite.id,
      acao: "CREATE_CONVITE",
      valor_novo: { email_convidado: dados.email_convidado, canal: dados.canal },
    },
  });

  const gerador = await prisma.usuario.findUnique({
    where: { id: gerado_por },
    select: { nome: true },
  });

  const link = `${process.env.APP_URL}/cadastro?codigo=${codigo}`;
  const nomeConvidador = gerador?.nome || "Um membro";

  if (dados.canal === "EMAIL" || dados.canal === "AMBOS") {
    await enviarEmailConvite({
      email_destinatario: dados.email_convidado!,
      nome_convidador: nomeConvidador,
      tenant_nome: tenant.nome,
      codigo,
      data_expiracao: dataExpiracao,
      link,
    });
  }

  if ((dados.canal === "WHATSAPP" || dados.canal === "AMBOS") && dados.celular_convidado) {
    await enviarWhatsappConvite({
      celular: dados.celular_convidado,
      nome_convidador: nomeConvidador,
      tenant_nome: tenant.nome,
      link,
    });
  }

  return {
    id: convite.id,
    codigo: convite.codigo,
    email_convidado: dados.email_convidado || null,
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
      let email = c.email_convidado || null;
      let celular = c.celular_convidado || null;
      if (c.chave_cripto_id) {
        const chave = await getChavePorId(prisma as any, c.chave_cripto_id);
        if (email) email = decrypt(email, chave);
        if (celular) celular = decrypt(celular, chave);
      }
      return {
        id: c.id,
        codigo: c.codigo,
        email_convidado: email || null,
        celular_convidado: celular || null,
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
