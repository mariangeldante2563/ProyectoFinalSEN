const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/StatsController');
const { protect } = require('../middlewares/auth');

/**
 * Rutas de Estadísticas - /api/stats
 * 
 * Todas las rutas requieren autenticación
 */

// === REGISTRO DE ASISTENCIA ===

/**
 * @route   POST /api/stats/attendance
 * @desc    Registrar nueva asistencia (entrada o salida)
 * @access  Private
 * @body    { type: 'entrada'|'salida', timestamp?: Date, location?: String }
 */
router.post('/attendance', protect, async (req, res) => {
    return await StatsController.registrarAsistencia(req, res);
});

// === DASHBOARD Y RESÚMENES ===

/**
 * @route   GET /api/stats/dashboard
 * @desc    Obtener resumen completo del dashboard
 * @access  Private
 * @returns Datos completos para el dashboard del empleado
 */
router.get('/dashboard', protect, async (req, res) => {
    return await StatsController.obtenerDashboard(req, res);
});

/**
 * @route   GET /api/stats/today
 * @desc    Obtener estadísticas del día actual
 * @access  Private
 * @returns Estadísticas del día de hoy
 */
router.get('/today', protect, async (req, res) => {
    return await StatsController.obtenerEstadisticasHoy(req, res);
});

/**
 * @route   GET /api/stats/weekly
 * @desc    Obtener estadísticas de la semana actual
 * @access  Private
 * @returns Estadísticas semanales
 */
router.get('/weekly', protect, async (req, res) => {
    return await StatsController.obtenerEstadisticasSemanales(req, res);
});

/**
 * @route   GET /api/stats/monthly
 * @desc    Obtener estadísticas del mes actual
 * @access  Private
 * @returns Estadísticas mensuales
 */
router.get('/monthly', protect, async (req, res) => {
    return await StatsController.obtenerEstadisticasMensuales(req, res);
});

// === GRÁFICAS Y VISUALIZACIÓN ===

/**
 * @route   GET /api/stats/charts
 * @desc    Obtener datos para gráficas del dashboard
 * @access  Private
 * @query   { days?: Number } - Número de días hacia atrás (default: 7)
 * @returns Datos formateados para gráficas
 */
router.get('/charts', protect, async (req, res) => {
    return await StatsController.obtenerDatosGraficas(req, res);
});

// === SESIONES DE TRABAJO ===

/**
 * @route   GET /api/stats/active-session
 * @desc    Obtener sesión de trabajo activa actual
 * @access  Private
 * @returns Sesión activa o null
 */
router.get('/active-session', protect, async (req, res) => {
    return await StatsController.obtenerSesionActiva(req, res);
});

/**
 * @route   GET /api/stats/sessions
 * @desc    Obtener histórico de sesiones de trabajo
 * @access  Private
 * @query   { fechaInicio?, fechaFin?, page?, limit? }
 * @returns Lista paginada de sesiones
 */
router.get('/sessions', protect, async (req, res) => {
    return await StatsController.obtenerHistoricoSesiones(req, res);
});

/**
 * @route   GET /api/stats/sessions/:sessionId
 * @desc    Obtener detalle de una sesión específica
 * @access  Private
 * @returns Detalle completo de la sesión con reporte legal
 */
router.get('/sessions/:sessionId', protect, async (req, res) => {
    return await StatsController.obtenerDetalleSesion(req, res);
});

// === MIGRACIÓN Y MANTENIMIENTO ===

/**
 * @route   POST /api/stats/migrate
 * @desc    Migrar registros de asistencia existentes al nuevo sistema
 * @access  Private
 * @body    { fechaInicio: Date, fechaFin: Date }
 * @returns Resultado de la migración
 */
router.post('/migrate', protect, async (req, res) => {
    return await StatsController.migrarRegistros(req, res);
});

/**
 * @route   GET /api/stats/validate
 * @desc    Validar integridad de datos del usuario
 * @access  Private
 * @returns Reporte de validación
 */
router.get('/validate', protect, async (req, res) => {
    return await StatsController.validarIntegridad(req, res);
});

// === LEGISLACIÓN Y CÁLCULOS ===

/**
 * @route   GET /api/stats/labor-law-info
 * @desc    Obtener información sobre legislación laboral colombiana
 * @access  Private
 * @returns Información de jornadas, recargos y festivos
 */
router.get('/labor-law-info', protect, async (req, res) => {
    return await StatsController.obtenerInfoLegislacion(req, res);
});

/**
 * @route   POST /api/stats/calculate-overtime
 * @desc    Calcular recargos para fechas específicas
 * @access  Private
 * @body    { entrada: Date, salida: Date }
 * @returns Cálculos detallados de recargos
 */
router.post('/calculate-overtime', protect, async (req, res) => {
    return await StatsController.calcularRecargos(req, res);
});

// === RENDIMIENTO DEL SISTEMA ===

/**
 * @route   GET /api/stats/system-performance
 * @desc    Obtener estadísticas de rendimiento y uso del sistema
 * @access  Private
 * @returns Métricas de rendimiento del usuario
 */
router.get('/system-performance', protect, async (req, res) => {
    return await StatsController.obtenerRendimientoSistema(req, res);
});

module.exports = router;