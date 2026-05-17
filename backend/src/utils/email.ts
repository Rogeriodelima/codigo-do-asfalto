import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@codigodoasfalto.com.br";

// =============================================
// EMAIL DE CONVITE
// =============================================

export async function enviarEmailConvite(dados: {
  email_destinatario: string;
  nome_convidador: string;
  tenant_nome: string;
  codigo: string;
  data_expiracao: Date;
}) {
  const dataFormatada = dados.data_expiracao.toLocaleDateString("pt-BR");

  await resend.emails.send({
    from: `Codigo do Asfalto <${EMAIL_FROM}>`,
    to: dados.email_destinatario,
    subject: `${dados.nome_convidador} te convidou para o Codigo do Asfalto`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0B1F3A; padding: 32px; text-align: center;">
          <h1 style="color: #F2B705; font-size: 24px; margin: 0;">CODIGO DO ASFALTO</h1>
          <p style="color: #8FA3B8; font-size: 12px; letter-spacing: 3px; margin: 8px 0 0;">
            EVOLUCAO. EXPERIENCIA. PROPOSITO.
          </p>
        </div>

        <div style="background: #ffffff; padding: 40px 32px;">
          <h2 style="color: #0B1F3A; font-size: 20px;">Voce foi convidado!</h2>

          <p style="color: #4A6278; font-size: 15px; line-height: 1.6;">
            <strong>${dados.nome_convidador}</strong> te convidou para fazer parte da comunidade
            <strong>${dados.tenant_nome}</strong> no Codigo do Asfalto.
          </p>

          <p style="color: #4A6278; font-size: 15px; line-height: 1.6;">
            Use o codigo abaixo para criar sua conta:
          </p>

          <div style="background: #F0F4F8; border: 2px solid #F2B705; border-radius: 12px;
                      padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: #8FA3B8; font-size: 12px; letter-spacing: 2px;
                      text-transform: uppercase; margin: 0 0 8px;">Seu codigo de convite</p>
            <p style="color: #0B1F3A; font-size: 32px; font-weight: bold;
                      letter-spacing: 4px; margin: 0;">${dados.codigo}</p>
          </div>

          <p style="color: #8FA3B8; font-size: 13px;">
            Este convite expira em <strong>${dataFormatada}</strong>.
          </p>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
            <p style="color: #8FA3B8; font-size: 12px; text-align: center;">
              Nao e sobre motos. E sobre nivel.
            </p>
          </div>
        </div>
      </div>
    `,
  });
}

// =============================================
// EMAIL DE BOAS VINDAS
// =============================================

export async function enviarEmailBoasVindas(dados: {
  email_destinatario: string;
  nome_usuario: string;
  tenant_nome: string;
}) {
  await resend.emails.send({
    from: `Codigo do Asfalto <${EMAIL_FROM}>`,
    to: dados.email_destinatario,
    subject: `Bem-vindo ao Codigo do Asfalto, ${dados.nome_usuario}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0B1F3A; padding: 32px; text-align: center;">
          <h1 style="color: #F2B705; font-size: 24px; margin: 0;">CODIGO DO ASFALTO</h1>
          <p style="color: #8FA3B8; font-size: 12px; letter-spacing: 3px; margin: 8px 0 0;">
            EVOLUCAO. EXPERIENCIA. PROPOSITO.
          </p>
        </div>

        <div style="background: #ffffff; padding: 40px 32px;">
          <h2 style="color: #0B1F3A; font-size: 20px;">
            Bem-vindo, ${dados.nome_usuario}!
          </h2>

          <p style="color: #4A6278; font-size: 15px; line-height: 1.6;">
            Sua conta na comunidade <strong>${dados.tenant_nome}</strong> foi criada com sucesso.
            Voce ja pode comecar a registrar suas experiencias e acompanhar sua evolucao.
          </p>

          <p style="color: #4A6278; font-size: 15px; line-height: 1.6;">
            Complete seu perfil para ativar seu score e comecar a evoluir.
          </p>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
            <p style="color: #8FA3B8; font-size: 12px; text-align: center;">
              Nao e sobre motos. E sobre nivel.
            </p>
          </div>
        </div>
      </div>
    `,
  });
}
