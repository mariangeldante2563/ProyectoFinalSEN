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
  getAllAttendance,
  getLaborHoursSummary,
  getActiveSession,
  requestCorrection
} = require('../controllers/attendanceController');

// Importar middlewares
const { 
  protect, 
  authorize, 
  checkUserOwnership 
} = require('../middlewares/auth');

const { 
  attendanceRules,
  attendanceQueryRules,
  correctionRules,
  attendanceIdRules,
  userIdRules,
  validate
} = require('../middlewares/validation');

// Todas las rutas requieren autenticación
router.use(protect);

// Ruta para registrar asistencia (entrada o salida)
router.post('/', authorize('empleado'), attendanceRules, validate, registerAttendance);
router.get('/sessions/active', authorize('empleado'), getActiveSession);
router.post('/corrections', authorize('empleado'), correctionRules, validate, requestCorrection);

// Rutas para obtener registros y estadísticas de un usuario
router.get('/user/:userId', userIdRules, attendanceQueryRules, validate, checkUserOwnership, getUserAttendance);
router.get('/stats/weekly/:userId', checkUserOwnership, getWeeklyStats);
router.get('/stats/monthly/:userId', checkUserOwnership, getMonthlyStats);

// Rutas exclusivas para administradores
router.get('/labor-hours', authorize('administrador'), getLaborHoursSummary);
router.get('/all', attendanceQueryRules, validate, authorize('administrador'), getAllAttendance);
router.delete('/:id', authorize('administrador'), attendanceIdRules, validate, deleteAttendance);

module.exports = router;
