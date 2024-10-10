const { Router } = require('express');
const router = Router();
const verifyResetCode = require('../middleware/validateResetCode');
const {
    userLogin,
    registerNewUser,
    requestReset,
    resetPassword
} = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Usuario autenticado correctamente
 *       400:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', userLogin);

/**
 * @swagger
 * /users/registerUser:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewUser'
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos inválidos o usuario ya registrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/registerUser', registerNewUser);

/**
 * @swagger
 * /users/request-reset/{email}:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email del usuario para el restablecimiento
 *     responses:
 *       201:
 *         description: Email enviado para el restablecimiento de contraseña
 *       404:
 *         description: Email no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/request-reset/:email', requestReset);

/**
 * @swagger
 * /users/reset-password/{email}:
 *   post:
 *     summary: Restablecer la contraseña
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email del usuario para el restablecimiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmar nueva contraseña
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Las contraseñas no coinciden
 *       404:
 *         description: No se encontró el usuario
 *       500:
 *         description: Error interno del servidor
 */
router.post('/reset-password/:email', verifyResetCode, resetPassword);

module.exports = router;
