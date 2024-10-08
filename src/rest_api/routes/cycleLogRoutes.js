const { Router } = require('express');
const { validateJWT } = require('../middleware/validateJWT');
const {
    registerCycleLog,
    updateCycleLogEntry,
    getCycleLogs,
    removeCycleLog,
    getCycleLogByDay,
    getCyclePrediction
} = require('../controllers/cycleLogController');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: CycleLog
 *   description: Gestión de seguimiento de ciclo menstrual
 */

/**
 * @swagger
 * /logs/register-cycle-log:
 *   post:
 *     summary: Registrar un nuevo ciclo
 *     tags: [CycleLog]
 *     parameters:
 *       - name: token
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT Token de autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CycleLog'
 *     responses:
 *       201:
 *         description: Ciclo registrado exitosamente
 *       500:
 *         description: Error al registrar el ciclo
 */
router.post('/register-cycle-log', [validateJWT], registerCycleLog);

/**
 * @swagger
 * /logs/update-cycle-log/{cycleLogId}:
 *   post:
 *     summary: Actualizar un ciclo existente
 *     tags: [CycleLog]
 *     parameters:
 *       - in: path
 *         name: cycleLogId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ciclo a actualizar
 *       - name: token
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT Token de autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CycleLog'
 *     responses:
 *       200:
 *         description: Ciclo actualizado exitosamente
 *       404:
 *         description: Ciclo no encontrado
 *       500:
 *         description: Error al actualizar el ciclo
 */
router.post('/update-cycle-log/:cycleLogId', [validateJWT], updateCycleLogEntry);

/**
 * @swagger
 * /logs/user-cycle-logs/{year}/{month}:
 *   get:
 *     summary: Obtener ciclos por mes y usuario
 *     tags: [CycleLog]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Año de los ciclos
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mes de los ciclos
 *       - name: token
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT Token de autenticación
 *     responses:
 *       200:
 *         description: Lista de ciclos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CycleLog'
 *       404:
 *         description: No se encontraron ciclos
 *       500:
 *         description: Error al obtener los ciclos
 */
router.get('/user-cycle-logs/:year/:month', [validateJWT], getCycleLogs);

/**
 * @swagger
 * /logs/cycle-log/{logId}:
 *   delete:
 *     summary: Eliminar un ciclo
 *     tags: [CycleLog]
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ciclo a eliminar
 *       - name: token
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT Token de autenticación
 *     responses:
 *       200:
 *         description: Ciclo eliminado exitosamente
 *       403:
 *         description: No autorizado para eliminar el ciclo
 *       500:
 *         description: Error al eliminar el ciclo
 */
router.delete('/cycle-log/:logId', [validateJWT], removeCycleLog);

/**
 * @swagger
 * /logs/user-cycle-logs/{year}/{month}/{day}:
 *   get:
 *     summary: Obtener ciclo por día y usuario
 *     tags: [CycleLog]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Año del ciclo
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mes del ciclo
 *       - in: path
 *         name: day
 *         required: true
 *         schema:
 *           type: integer
 *         description: Día del ciclo
 *       - name: token
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT Token de autenticación
 *     responses:
 *       200:
 *         description: Ciclo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CycleLog'
 *       404:
 *         description: Ciclo no encontrado
 *       500:
 *         description: Error al obtener el ciclo
 */
router.get('/user-cycle-logs/:year/:month/:day', [validateJWT], getCycleLogByDay);

/**
 * @swagger
 * /logs/prediction-cycle:
 *   get:
 *     summary: Obtener predicción del ciclo
 *     tags: [CycleLog]
 *     parameters:
 *       - name: token
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT Token de autenticación
 *     responses:
 *       200:
 *         description: Predicción del ciclo
 *       404:
 *         description: No se encontraron datos para la predicción
 *       500:
 *         description: Error al obtener la predicción del ciclo
 */
router.get('/prediction-cycle', [validateJWT], getCyclePrediction);

module.exports = router;
