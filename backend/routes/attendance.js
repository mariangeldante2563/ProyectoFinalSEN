/**
<<<<<<< HEAD
 * @version 1.0.0
 * @description 
=======
 * IN OUT MANAGER - RUTAS DE ASISTENCIA
 * @version 1.0.0
 * @description Rutas para gestión de registros de asistencia
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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

<<<<<<< HEAD

const { 
  protect, 
  authorize 
=======
// Importar middlewares
const { 
  protect, 
  authorize, 
  checkUserOwnership 
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
} = require('../middlewares/auth');

const { 
  attendanceRules,
  validate 
} = require('../middlewares/validation');

<<<<<<< HEAD
router.use(protect);

router.post('/', attendanceRules, validate, registerAttendance);
router.post('/check-in', attendanceRules, validate, registerAttendance);
router.get('/user/:userId', authorize('administrador'), getUserAttendance);
router.get('/stats/weekly/:userId', authorize('administrador'), getWeeklyStats);
router.get('/stats/monthly/:userId', authorize('administrador'), getMonthlyStats);
=======
// Todas las rutas requieren autenticación
router.use(protect);

// Ruta para registrar asistencia (entrada o salida)
router.post('/', attendanceRules, validate, registerAttendance);

// Rutas para obtener registros y estadísticas de un usuario
router.get('/user/:userId', checkUserOwnership, getUserAttendance);
router.get('/stats/weekly/:userId', checkUserOwnership, getWeeklyStats);
router.get('/stats/monthly/:userId', checkUserOwnership, getMonthlyStats);

// Rutas exclusivas para administradores
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
router.get('/all', authorize('administrador'), getAllAttendance);
router.delete('/:id', authorize('administrador'), deleteAttendance);

module.exports = router;