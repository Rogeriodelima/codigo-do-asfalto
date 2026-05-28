import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Codigo do Asfalto - API',
      version: '1.0.0',
      description: `Documentacao das APIs da plataforma Codigo do Asfalto.

**Resolução de tenant por domínio**

Todas as requisições passam pelo middleware \`tenantDominio\`, que lê o cabeçalho \`Host\` e busca na tabela \`tenants\` um registro com \`dominio\` igual ao host recebido (ex: \`bmw.codigodoasfalto.com.br\`). Se encontrado, o \`tenant_id\` é injetado em \`req.tenantDominioId\` e fica disponível para as rotas. Caso contrário, a requisição segue normalmente e o tenant continua sendo identificado pelo JWT.`,
    },
    servers: [
      {
        url: 'http://2.24.71.43:3001',
        description: 'VPS - Desenvolvimento',
      },
      {
        url: 'http://localhost:3001',
        description: 'Local - Notebook',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/api/v1/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
