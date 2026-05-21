import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Codigo do Asfalto - API',
      version: '1.0.0',
      description: 'Documentacao das APIs da plataforma Codigo do Asfalto',
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
