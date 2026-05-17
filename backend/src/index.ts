import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { prisma } from "./utils/prisma";
import authRoutes from "./api/v1/auth/auth.routes";
import perfilRoutes from "./api/v1/perfil/perfil.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de seguranca
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisicoes em desenvolvimento
if (process.env.NODE_ENV === "development") {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rotas
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/perfil", perfilRoutes);

// Health check
app.get("/health", async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      app: "Codigo do Asfalto - API",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      app: "Codigo do Asfalto - API",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

// Rota raiz
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Bem-vindo a API do Codigo do Asfalto",
    version: "1.0.0",
    docs: "/api/docs",
  });
});

// Tratamento de rotas nao encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Rota nao encontrada",
    path: req.path,
    method: req.method,
  });
});

// Tratamento de erros globais
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`Erro: ${err.message}`);
  console.error(err.stack);
  res.status(500).json({
    error: "Erro interno do servidor",
    message:
      process.env.NODE_ENV === "development" ? err.message : "Algo deu errado",
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Encerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Encerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
