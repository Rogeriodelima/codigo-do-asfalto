import "dotenv/config";

const UAZAPI_URL = process.env.UAZAPI_URL || "https://agentedeia.uazapi.com";
const UAZAPI_TOKEN = process.env.UAZAPI_TOKEN || "mock_token";
const UAZAPI_INSTANCE = process.env.UAZAPI_INSTANCE || "mock_instance";

// =============================================
// ENVIAR MENSAGEM DE TEXTO
// =============================================

async function enviarMensagem(
  telefone: string,
  mensagem: string,
): Promise<void> {
  // TODO: substituir mock por chamada real quando configurar credenciais
  if (UAZAPI_TOKEN === "mock_token") {
    console.log(`[WHATSAPP MOCK] Para: ${telefone}`);
    console.log(`[WHATSAPP MOCK] Mensagem: ${mensagem}`);
    return;
  }

  const response = await fetch(`${UAZAPI_URL}/send/text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: UAZAPI_TOKEN,
      instance: UAZAPI_INSTANCE,
    },
    body: JSON.stringify({
      phone: telefone,
      message: mensagem,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao enviar WhatsApp: ${response.statusText}`);
  }
}

// =============================================
// NOTIFICACAO DE NOVA EXPERIENCIA PARA VALIDADOR
// =============================================

export async function notificarValidadorWhatsApp(dados: {
  telefone: string;
  nome_validador: string;
  nome_usuario: string;
  titulo_experiencia: string;
  tipo_experiencia: string;
  tenant_nome: string;
  experiencia_id: number;
}): Promise<void> {
  const mensagem = `🏍️ *Código do Asfalto - ${dados.tenant_nome}*

Olá ${dados.nome_validador}!

Nova experiência aguardando validação:

*Piloto:* ${dados.nome_usuario}
*Tipo:* ${dados.tipo_experiencia}
*Experiência:* ${dados.titulo_experiencia}

Acesse o painel para validar.

_SLA: 36 horas_`;

  await enviarMensagem(dados.telefone, mensagem);
}

// =============================================
// LEMBRETE DE VALIDACAO PENDENTE
// =============================================

export async function lembreteValidacaoPendenteWhatsApp(dados: {
  telefone: string;
  nome_validador: string;
  quantidade_pendentes: number;
  tenant_nome: string;
}): Promise<void> {
  const mensagem = `⚠️ *Código do Asfalto - ${dados.tenant_nome}*

Olá ${dados.nome_validador}!

Você tem *${dados.quantidade_pendentes} experiência(s)* aguardando validação há mais de 24 horas.

Acesse o painel para não ultrapassar o SLA.`;

  await enviarMensagem(dados.telefone, mensagem);
}

// =============================================
// NOTIFICACAO PARA USUARIO - EXPERIENCIA VALIDADA
// =============================================

export async function notificarUsuarioValidacaoWhatsApp(dados: {
  telefone: string;
  nome_usuario: string;
  titulo_experiencia: string;
  status: string;
  observacao?: string;
  tenant_nome: string;
}): Promise<void> {
  const emoji =
    dados.status === "VALIDADA" || dados.status === "VALIDADA_DESTAQUE"
      ? "✅"
      : "🔵";
  const statusTexto =
    {
      VALIDADA: "aprovada",
      VALIDADA_DESTAQUE: "aprovada com destaque",
      EM_REVISAO: "em revisão - ação necessária",
      REJEITADA: "não aprovada",
    }[dados.status] || dados.status;

  const mensagem = `${emoji} *Código do Asfalto - ${dados.tenant_nome}*

Olá ${dados.nome_usuario}!

Sua experiência *${dados.titulo_experiencia}* foi ${statusTexto}.${dados.observacao ? `\n\n*Observação:* ${dados.observacao}` : ""}

Acesse o app para ver detalhes.`;

  await enviarMensagem(dados.telefone, mensagem);
}

// =============================================
// CONVITE VIA WHATSAPP
// =============================================

export async function enviarWhatsappConvite({
  celular,
  nome_convidador,
  tenant_nome,
  link,
}: {
  celular: string;
  nome_convidador: string;
  tenant_nome: string;
  link: string;
}) {
  const mensagem = `Olá! ${nome_convidador} te convidou para fazer parte do ${tenant_nome} no Código do Asfalto.\n\nAcesse o link abaixo para criar sua conta:\n${link}\n\nO convite é pessoal e intransferível.`;

  try {
    if (UAZAPI_TOKEN === "mock_token") {
      console.log(`[WHATSAPP MOCK] Convite para: ${celular}`);
      console.log(`[WHATSAPP MOCK] Mensagem: ${mensagem}`);
      return;
    }

    await fetch(`${UAZAPI_URL}/send/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: UAZAPI_TOKEN,
        instance: UAZAPI_INSTANCE,
      },
      body: JSON.stringify({
        phone: celular,
        message: mensagem,
      }),
    });
  } catch (err) {
    console.error("Erro ao enviar WhatsApp de convite:", err);
    // Nao lanca erro — convite ja foi criado no banco
  }
}
