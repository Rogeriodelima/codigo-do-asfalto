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
  link: string;
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

          <div style="text-align: center; margin: 32px 0;">
            <a href="${dados.link}"
               style="background: #F2B705; color: #0B1F3A; text-decoration: none;
                      padding: 16px 32px; border-radius: 10px; font-weight: bold;
                      font-size: 14px; letter-spacing: 2px; text-transform: uppercase;
                      display: inline-block;">
              ACEITAR CONVITE
            </a>
          </div>

          <p style="color: #4A6278; font-size: 14px; line-height: 1.6; text-align: center;">
            Ou use o codigo: <strong style="letter-spacing: 3px;">${dados.codigo}</strong>
          </p>

          <p style="color: #8FA3B8; font-size: 13px; text-align: center; margin-top: 16px;">
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
// EMAIL DE RECUPERACAO DE SENHA
// =============================================

export async function enviarEmailRecuperacaoSenha(dados: {
  email_destinatario: string;
  nome_usuario: string;
  link_reset: string;
}) {
  await resend.emails.send({
    from: `Codigo do Asfalto <${EMAIL_FROM}>`,
    to: dados.email_destinatario,
    subject: "Recuperacao de senha - Codigo do Asfalto",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0B1F3A; padding: 32px; text-align: center;">
          <h1 style="color: #F2B705; font-size: 24px; margin: 0;">CODIGO DO ASFALTO</h1>
          <p style="color: #8FA3B8; font-size: 12px; letter-spacing: 3px; margin: 8px 0 0;">
            EVOLUCAO. EXPERIENCIA. PROPOSITO.
          </p>
        </div>

        <div style="background: #ffffff; padding: 40px 32px;">
          <h2 style="color: #0B1F3A; font-size: 20px;">Redefinir sua senha</h2>

          <p style="color: #4A6278; font-size: 15px; line-height: 1.6;">
            Ola, <strong>${dados.nome_usuario}</strong>. Recebemos uma solicitacao para redefinir a senha da sua conta.
          </p>

          <p style="color: #4A6278; font-size: 15px; line-height: 1.6;">
            Clique no botao abaixo para criar uma nova senha. O link e valido por <strong>1 hora</strong>.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${dados.link_reset}"
               style="background: #F2B705; color: #0B1F3A; text-decoration: none;
                      padding: 16px 32px; border-radius: 10px; font-weight: bold;
                      font-size: 14px; letter-spacing: 2px; text-transform: uppercase;
                      display: inline-block;">
              REDEFINIR SENHA
            </a>
          </div>

          <p style="color: #8FA3B8; font-size: 13px; line-height: 1.6;">
            Se voce nao solicitou a recuperacao de senha, ignore este email. Sua senha permanece a mesma.
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
