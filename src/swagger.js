import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "getFit API",
      version: "1.0.0",
      description: "API documentation for the getFit fitness website",
    },

    servers: [
      {
        url: "http://localhost:5001",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);