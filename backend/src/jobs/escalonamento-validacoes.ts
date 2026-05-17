import { prisma } from "../utils/prisma";
import { notificarValidadorWhatsApp } from "../utils/whatsapp";
import "dotenv/config";

async function escalonarValidacoes() {
  console.log(
    `[${new Date().toISOString()}] Iniciando job de escalonamento...`,
  );

  try {
    const tenants = await prisma.tenant.findMany({
      where: { ativo: true, deleted_at: null },
      include: {
        validadores: {
          where: { ativo: true },
          orderBy: { ordem: "asc" },
          include: { usuario: true },
        },
      },
    });

    for (const tenant of tenants) {
      if (tenant.validadores.length === 0) continue;

      const agora = new Date();

      const experienciasPendentes = await prisma.experiencia.findMany({
        where: {
          tenant_id: tenant.id,
          status_validacao: { in: ["EM_APROVACAO", "EM_REVISAO"] },
          deleted_at: null,
        },
        include: {
          usuario: true,
          validacoes: { orderBy: { created_at: "desc" }, take: 1 },
        },
      });

      for (const exp of experienciasPendentes) {
        const horasEspera = Math.floor(
          (agora.getTime() - new Date(exp.created_at).getTime()) / 3600000,
        );

        // Rejeicao automatica apos 7 dias em EM_REVISAO sem resposta
        if (exp.status_validacao === "EM_REVISAO" && horasEspera >= 168) {
          await prisma.experiencia.update({
            where: { id: exp.id },
            data: { status_validacao: "REJEITADA" },
          });

          await prisma.auditoriaLog.create({
            data: {
              tenant_id: tenant.id,
              usuario_id: exp.usuario_id,
              tipo_log: "SISTEMA",
              tabela: "experiencias",
              registro_id: exp.id,
              acao: "REJEICAO_AUTOMATICA",
              valor_novo: { motivo: "Sem resposta apos 7 dias em revisao" },
            },
          });

          console.log(
            `[REJEICAO] Experiencia ${exp.id} rejeitada automaticamente`,
          );
          continue;
        }

        // Escalonamento para proximo validador apos SLA
        if (horasEspera >= tenant.validacao_sla_horas) {
          const proximoValidador = tenant.validadores.find(
            (v: any) => v.ordem === 2,
          );

          if (proximoValidador) {
            console.log(
              `[ESCALONAMENTO] Experiencia ${exp.id} escalada para ${proximoValidador.usuario.email}`,
            );

            if (proximoValidador.usuario.celular) {
              await notificarValidadorWhatsApp({
                telefone: proximoValidador.usuario.celular,
                nome_validador: proximoValidador.usuario.nome,
                nome_usuario: exp.usuario.nome,
                titulo_experiencia: exp.titulo,
                tipo_experiencia: exp.tipo,
                tenant_nome: tenant.nome,
                experiencia_id: exp.id,
              });
            }
          }
        }

        // Lembrete a cada X horas apos 24h
        if (horasEspera >= 24) {
          const horasDesde24 = horasEspera - 24;
          const deveEnviarLembrete =
            horasDesde24 % tenant.validacao_lembrete_horas === 0;

          if (deveEnviarLembrete) {
            for (const validador of tenant.validadores) {
              console.log(
                `[LEMBRETE] Enviando lembrete para ${validador.usuario.email}`,
              );

              if (validador.usuario.celular) {
                await notificarValidadorWhatsApp({
                  telefone: validador.usuario.celular,
                  nome_validador: validador.usuario.nome,
                  nome_usuario: exp.usuario.nome,
                  titulo_experiencia: exp.titulo,
                  tipo_experiencia: exp.tipo,
                  tenant_nome: tenant.nome,
                  experiencia_id: exp.id,
                });
              }
            }
          }
        }
      }
    }

    console.log(
      `[${new Date().toISOString()}] Job de escalonamento concluido!`,
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Erro no job:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

escalonarValidacoes();
