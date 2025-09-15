/**
 * IN OUT MANAGER - RUTAS DE ASISTENCIA
 * @version 1.0.0
 * @description Rutas para gestión de registros de asistencia
 */

const express = require('express');
const router = express.Router();

// Importar controladores
const {
  registerAttendance,
  getUserAttendance,
  getWeeklyStats,
  getMonthlyStats,
  deleteAttendance,
  getAllAttendance
} = require('../controllers/attendanceController');

// Importar middlewares
const { 
  protect, 
  authorize, 
  checkUserOwnership 
} = require('../middlewares/auth');

const { 
  attendanceRules,
  validate 
} = require('../middlewares/validation');

// Todas las rutas requieren autenticación
router.use(protect);

// Ruta para registrar asistencia (entrada o salida)
router.post('/', attendanceRules, validate, registerAttendance);

// Rutas para obtener registros y estadísticas de un usuario
router.get('/user/:userId', checkUserOwnership, getUserAttendance);
router.get('/stats/weekly/:userId', checkUserOwnership, getWeeklyStats);
router.get('/stats/monthly/:userId', checkUserOwnership, getMonthlyStats);

// Rutas exclusivas para administradores
router.get('/all', authorize('administrador'), getAllAttendance);
router.delete('/:id', authorize('administrador'), deleteAttendance);

module.exports = router;