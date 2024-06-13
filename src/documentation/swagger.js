const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Definir las opciones de configuración
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
                url: 'http://localhost:'+ process.env.APP_PORT,
                description: 'Entorno local de desarrollo',
            },
        ],
        components:{
            schemas:{
                NewUser: {
                    type: 'object',
                    required: ['email', 'name', 'firstLastName', 'secondLastName', 'username', 'password', 'role', 'isRegular', 'aproxCycleDuration', 'aproxPeriodDuration'],
                    properties: {
                        email: {
                            type: 'string',
                            description: 'Correo electrónico del usuario',
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre del usuario',
                        },
                        firstLastName: {
                            type: 'string',
                            description: 'Primer apellido del usuario',
                        },
                        secondLastName: {
                            type: 'string',
                            description: 'Segundo apellido del usuario',
                        },
                        username: {
                            type: 'string',
                            description: 'Nombre de usuario',
                        },
                        password: {
                            type: 'string',
                            description: 'Contraseña del usuario',
                        },
                        role: {
                            type: 'string',
                            description: 'Rol del usuario',
                        },
                        isRegular: {
                            type: 'boolean',
                            description: 'Indica si el ciclo menstrual es regular',
                        },
                        aproxCycleDuration: {
                            type: 'integer',
                            description: 'Duración aproximada del ciclo menstrual',
                        },
                        aproxPeriodDuration: {
                            type: 'integer',
                            description: 'Duración aproximada del período menstrual',
                        },
                    },
                },
            },
        },
    },
    apis: ['./routes/*.js'],
};

// Inicializar swagger-jsdoc
const swaggerDocument = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerDocument };