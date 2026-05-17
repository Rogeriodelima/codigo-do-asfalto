import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const ALGORITHM = "aes-256-gcm";
const MASTER_KEY = Buffer.from(process.env.MASTER_ENCRYPTION_KEY!, "hex");

// Criptografa a chave semanal com a master key
export function encryptKey(key: Buffer): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, MASTER_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(key), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("hex");
}

// Descriptografa a chave semanal com a master key
export function decryptKey(encryptedHex: string): Buffer {
  const data = Buffer.from(encryptedHex, "hex");
  const iv = data.subarray(0, 16);
  const tag = data.subarray(16, 32);
  const encrypted = data.subarray(32);
  const decipher = createDecipheriv(ALGORITHM, MASTER_KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

// Criptografa um dado com a chave semanal
export function encrypt(value: string, weeklyKey: Buffer): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, weeklyKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("hex");
}

// Descriptografa um dado com a chave semanal
export function decrypt(encryptedHex: string, weeklyKey: Buffer): string {
  const data = Buffer.from(encryptedHex, "hex");
  const iv = data.subarray(0, 16);
  const tag = data.subarray(16, 32);
  const encrypted = data.subarray(32);
  const decipher = createDecipheriv(ALGORITHM, weeklyKey, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
}

// Retorna a chave ativa da semana atual
export async function getChaveAtiva(
  prisma: PrismaClient,
): Promise<{ id: number; key: Buffer }> {
  const agora = new Date();

  const chave = await prisma.chaveCriptografia.findFirst({
    where: {
      ativo: true,
      vigencia_inicio: { lte: agora },
      vigencia_fim: { gte: agora },
    },
  });

  if (!chave) {
    throw new Error(
      "Nenhuma chave de criptografia ativa encontrada. Execute o job de rotacao.",
    );
  }

  return {
    id: chave.id,
    key: decryptKey(chave.chave_enc),
  };
}

// Busca chave por ID (para descriptografar registros antigos)
export async function getChavePorId(
  prisma: PrismaClient,
  id: number,
): Promise<Buffer> {
  const chave = await prisma.chaveCriptografia.findUnique({
    where: { id },
  });

  if (!chave) {
    throw new Error(`Chave de criptografia id ${id} nao encontrada.`);
  }

  return decryptKey(chave.chave_enc);
}

// Cria o cliente Prisma com adapter
export function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter }) as unknown as PrismaClient;
}
