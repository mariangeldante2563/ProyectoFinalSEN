/**
 * IN OUT MANAGER - RUTAS DE REPORTES
 * @version 1.0.0
 * @description Rutas para generación y descarga de reportes
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/auth');

// Rutas protegidas - requieren autenticación
router.use(protect);

/**
 * @route   GET /api/reports/user/:userId
 * @desc    Genera un reporte de asistencia para un usuario específico
 * @access  Private
 */
router.get('/user/:userId', reportController.generateUserReport);

/**
 * @route   GET /api/reports/general
 * @desc    Genera un reporte general de asistencia de todos los usuarios
 * @access  Admin
 */
router.get('/general', authorize('administrador'), reportController.generateGeneralReport);

/**
 * @route   GET /api/reports/download/:fileName
 * @desc    Descarga un archivo de reporte por su nombre
 * @access  Private
 */
router.get('/download/:fileName', reportController.downloadReport);

module.exports = router;