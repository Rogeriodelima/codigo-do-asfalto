import { PrismaClient, TipoProduto } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Iniciando seed...");

  const bmw = await prisma.tenant.upsert({
    where: { slug: "bmw" },
    update: {},
    create: {
      nome: "BMW Motorrad",
      slug: "bmw",
      cor_primaria: "#0B1F3A",
      cor_secundaria: "#F2B705",
      dominio: "codigodoasfalto.com.br",
      tipo_produto_padrao: TipoProduto.MOTO,
      ativo: true,
    },
  });

  // Tenant Marrua Trip Adventure
  const marrua = await prisma.tenant.upsert({
    where: { slug: "marrua" },
    update: {},
    create: {
      nome: "Marrua Trip Adventure",
      slug: "marrua",
      cor_primaria: "#1A3A1A",
      cor_secundaria: "#F2B705",
      dominio: "marrua.codigodoasfalto.com.br",
      tipo_produto_padrao: TipoProduto.MOTO,
      ativo: true,
    },
  });

  console.log(`Tenant criado: ${marrua.nome} (id: ${marrua.id})`);

  console.log(`Tenant criado: ${bmw.nome} (id: ${bmw.id})`);
  console.log("Seed concluido!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
