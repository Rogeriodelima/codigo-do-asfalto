import { randomBytes } from "crypto";
import { encryptKey, createPrismaClient } from "../utils/crypto";
import "dotenv/config";

async function rotacionarChave() {
  const prisma = createPrismaClient();

  try {
    console.log(`[${new Date().toISOString()}] Iniciando rotacao de chave...`);

    const agora = new Date();
    const fimVigencia = new Date(agora);
    fimVigencia.setDate(fimVigencia.getDate() + 7);

    // Desativa chave atual
    await prisma.chaveCriptografia.updateMany({
      where: { ativo: true },
      data: { ativo: false },
    });

    // Gera nova chave semanal
    const novaChave = randomBytes(32);
    const chaveEncriptada = encryptKey(novaChave);

    const criada = await prisma.chaveCriptografia.create({
      data: {
        chave_enc: chaveEncriptada,
        vigencia_inicio: agora,
        vigencia_fim: fimVigencia,
        ativo: true,
      },
    });

    console.log(
      `[${new Date().toISOString()}] Nova chave criada - id: ${criada.id}`,
    );
    console.log(
      `[${new Date().toISOString()}] Vigencia: ${agora.toISOString()} ate ${fimVigencia.toISOString()}`,
    );
    console.log(`[${new Date().toISOString()}] Rotacao concluida com sucesso!`);
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Erro na rotacao de chave:`,
      error,
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

rotacionarChave();
