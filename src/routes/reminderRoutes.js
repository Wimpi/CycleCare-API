const { Router } = require('express');
const { validateJWT } = require('../middleware/validateJWT');
const {
    registerReminder, 
    reminderUpdate, 
    getCurrentUserReminders,
    removeReminder
} = require('../controllers/reminderController');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reminders
 *   description: Gestión de recordatorios
 */

/**
 * @swagger
 * /reminders/create-reminder:
 *   post:
 *     summary: Registrar un nuevo recordatorio
 *     tags: [Reminders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reminder'
 *     responses:
 *       201:
 *         description: Recordatorio registrado correctamente
 *       500:
 *         description: Error interno del servidor
 */
router.post('/create-reminder', [validateJWT], registerReminder);

/**
 * @swagger
 * /reminders/update-reminder/{reminderId}:
 *   post:
 *     summary: Actualizar un recordatorio existente
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: reminderId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del recordatorio a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReminder'
 *     responses:
 *       200:
 *         description: Recordatorio actualizado correctamente
 *       403:
 *         description: No tienes permiso para actualizar este recordatorio
 *       404:
 *         description: No se encontró el recordatorio
 *       500:
 *         description: Error interno del servidor
 */
router.post('/update-reminder/:reminderId', [validateJWT], reminderUpdate);

/**
 * @swagger
 * /reminders/user-reminders:
 *   get:
 *     summary: Obtener recordatorios del usuario actual
 *     tags: [Reminders]
 *     responses:
 *       200:
 *         description: Lista de recordatorios del usuario actual
 *       400:
 *         description: Nombre de usuario es requerido
 *       404:
 *         description: No se encontraron recordatorios para el usuario
 *       500:
 *         description: Error interno del servidor
 */
router.get('/user-reminders', validateJWT, getCurrentUserReminders);

/**
 * @swagger
 * /reminders/reminder/{reminderId}:
 *   delete:
 *     summary: Eliminar un recordatorio
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: reminderId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del recordatorio a eliminar
 *     responses:
 *       200:
 *         description: Recordatorio eliminado correctamente
 *       403:
 *         description: No tienes permiso para eliminar este recordatorio
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/reminder/:reminderId', validateJWT, removeReminder);

module.exports = router;