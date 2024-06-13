const { Router } = require('express');
const { validateJWT } = require('../middleware/validateJWT');
const { getSleepChartInformation } = require('../controllers/chartController');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Charts
 *   description: Gestión de estadìsticas de usuario
 */

/**
 * @swagger
 * /chart/obtain-sleep-hours:
 *   get:
 *     summary: Obtener información de horas de sueño
 *     tags: [Charts]
 *     responses:
 *       200:
 *         description: Información de horas de sueño obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SleepHours'
 *       400:
 *         description: Username es requerido
 *       404:
 *         description: No se encontraron registros para el usuario
 *       500:
 *         description: Error interno del servidor
 */
router.get('/obtain-sleep-hours', [validateJWT], getSleepChartInformation);

module.exports = router;