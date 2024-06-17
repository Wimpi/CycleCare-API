const { Router } = require('express');
const { validateJWT } = require('../middleware/validateJWT');

const {
    contentRate,
    getInformativeContent,
    publishContent,
    getArticleByMedic,
    getArticleById,
    updateInformativeContent,
    getAverageByContentId, 
    publishVideo
} = require('../controllers/contentController');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Gestión de contenido informativo y artículos
 */

/**
 * @swagger
 * /content/create-rating/{contentId}:
 *   post:
 *     summary: Crear calificación para un contenido
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: contentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del contenido a calificar
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
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 description: Calificación del contenido
 *     responses:
 *       201:
 *         description: Contenido calificado exitosamente
 *       404:
 *         description: Contenido no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/create-rating/:contentId', [validateJWT], contentRate);

/**
 * @swagger
 * /content/obtain-informative-content:
 *   get:
 *     summary: Obtener contenido informativo
 *     tags: [Content]
 *     parameters:
 *       - name: token
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT Token de autenticación
 *     responses:
 *       200:
 *         description: Contenido informativo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InformativeContent'
 *       404:
 *         description: No se encontró contenido informativo
 *       500:
 *         description: Error interno del servidor
 */
router.get('/obtain-informative-content', [validateJWT], getInformativeContent);

/**
 * @swagger
 * /content/publish-article:
 *   post:
 *     summary: Publicar un nuevo artículo
 *     tags: [Content]
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
 *             $ref: '#/components/schemas/NewArticle'
 *     responses:
 *       201:
 *         description: Artículo creado exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.post('/publish-article', [validateJWT], publishContent);

/**
 * @swagger
 * /content/get-articles-by-medic:
 *   get:
 *     summary: Obtener artículos publicados por médico
 *     tags: [Content]
 *     parameters:
 *       - name: token
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT Token de autenticación
 *     responses:
 *       200:
 *         description: Artículos obtenidos exitosamente
 *       404:
 *         description: No se encontraron artículos para el usuario
 *       500:
 *         description: Error interno del servidor
 */
router.get('/get-articles-by-medic', [validateJWT], getArticleByMedic);

/**
 * @swagger
 * /content/get-article-by-id/{contentId}:
 *   get:
 *     summary: Obtener artículo por ID
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: contentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del contenido
 *       - name: token
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT Token de autenticación
 *     responses:
 *       200:
 *         description: Artículo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: No se encontró el artículo
 *       500:
 *         description: Error interno del servidor
 */
router.get('/get-article-by-id/:contentId', [validateJWT], getArticleById);

/**
 * @swagger
 * /content/update-informative-content:
 *   post:
 *     summary: Actualizar contenido informativo
 *     tags: [Content]
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
 *             $ref: '#/components/schemas/UpdateArticle'
 *     responses:
 *       200:
 *         description: Contenido actualizado exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.post('/update-informative-content', [validateJWT], updateInformativeContent);

/**
 * @swagger
 * /content/get-average-by-content/{contentId}:
 *   get:
 *     summary: Obtener promedio de calificaciones por ID de contenido
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: contentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del contenido
 *       - name: token
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT Token de autenticación
 *     responses:
 *       200:
 *         description: Promedio obtenido exitosamente
 *       404:
 *         description: No se encontraron artículos para el usuario
 *       500:
 *         description: Error interno del servidor
 */
router.get('/get-average-by-content/:contentId', [validateJWT], getAverageByContentId);


router.post('/publish-video', [validateJWT], publishVideo);

module.exports = router;