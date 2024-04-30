const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "CycleCare API",
      version: "1.0.0",
      description: "Documentación de CycleCare API",
    },
  },
  servers: [
    {
      url: "http://localhost:9001"
    },
  ],
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
