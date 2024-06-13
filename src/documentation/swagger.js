const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const schemas = YAML.load(path.join(__dirname, './schemas.yaml'));

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Cycle Care API',
            version: '1.0.0',
            description: 'API para gestionar los registros de ciclo menstrual',
        },
        servers: [
            {
                url: 'http://localhost:' + process.env.APP_PORT,
                description: 'Local host environment',
            },
        ],
        components: schemas,
    },
    apis: ['./routes/*.js'],
};

const swaggerDocument = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerDocument };