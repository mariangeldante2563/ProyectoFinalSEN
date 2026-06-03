/**
<<<<<<< HEAD
 * @version 1.0.0
 * @description 
=======
 * IN OUT MANAGER - RUTAS DE REPORTES
 * @version 1.0.0
 * @description Rutas para generación y descarga de reportes
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/auth');
<<<<<<< HEAD
router.use(protect);

/**
 * @route   
 * @desc   
 * @access
 */
router.get('/user/:userId', authorize('administrador'), reportController.generateUserReport);

/**
 * @route 
 * @desc    
 * @access  
=======

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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
router.get('/general', authorize('administrador'), reportController.generateGeneralReport);

/**
<<<<<<< HEAD
 * @route  
 * @desc   
 * @access  
=======
 * @route   GET /api/reports/download/:fileName
 * @desc    Descarga un archivo de reporte por su nombre
 * @access  Private
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
router.get('/download/:fileName', reportController.downloadReport);

module.exports = router;