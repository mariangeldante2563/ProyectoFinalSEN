const TimeCalculationService = require('../services/TimeCalculationService');
const ColombianLaborLawService = require('../services/ColombianLaborLawService');
const WorkSession = require('../models/WorkSession');
const DailyStats = require('../models/DailyStats');

<<<<<<< HEAD

class StatsController {

    static obtenerUsuarioObjetivo(req) {
        return req.query.userId || req.params.userId || req.user.id;
    }

=======
/**
 * StatsController - Controlador de Estadísticas
 * 
 * Este controlador maneja todas las operaciones relacionadas con
 * estadísticas de tiempo trabajado, cálculos de recargos y reportes.
 */

class StatsController {

    /**
     * Registrar nueva asistencia (entrada o salida)
     * POST /api/stats/attendance
     */
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    static async registrarAsistencia(req, res) {
        try {
            const { type, timestamp, location } = req.body;
            const userId = req.user.id;

<<<<<<< HEAD
            console.log(` Nueva asistencia - Usuario: ${userId}, Tipo: ${type}`);
=======
            console.log(`📋 Nueva asistencia - Usuario: ${userId}, Tipo: ${type}`);

            // Validar datos de entrada
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            if (!type || !['entrada', 'salida'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de asistencia inválido. Debe ser "entrada" o "salida"'
                });
            }

<<<<<<< HEAD
=======
            // Procesar el registro
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            const resultado = await TimeCalculationService.procesarRegistroAsistencia(
                userId,
                type,
                timestamp ? new Date(timestamp) : new Date(),
                location
            );

            res.status(201).json({
                success: true,
                message: resultado.mensaje,
                data: {
                    registro: resultado.registro,
                    sesion: resultado.sesion,
                    estadisticas: resultado.estadisticas,
                    accion: resultado.accion
                }
            });

        } catch (error) {
<<<<<<< HEAD
            console.error(' Error en registrarAsistencia:', error);
=======
            console.error('❌ Error en registrarAsistencia:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            res.status(500).json({
                success: false,
                message: 'Error al registrar asistencia',
                error: error.message
            });
        }
    }

<<<<<<< HEAD
    static async obtenerDashboard(req, res) {
        try {
            const userId = StatsController.obtenerUsuarioObjetivo(req);
            console.log(` Generando dashboard para usuario: ${userId}`);
=======
    /**
     * Obtener resumen completo del dashboard
     * GET /api/stats/dashboard
     */
    static async obtenerDashboard(req, res) {
        try {
            const userId = req.user.id;
            console.log(`📊 Generando dashboard para usuario: ${userId}`);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c

            const resumen = await TimeCalculationService.obtenerResumenDashboard(userId);

            res.json({
                success: true,
                data: resumen
            });

        } catch (error) {
<<<<<<< HEAD
            console.error(' Error en obtenerDashboard:', error);
=======
            console.error('❌ Error en obtenerDashboard:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            res.status(500).json({
                success: false,
                message: 'Error al obtener datos del dashboard',
                error: error.message
            });
        }
    }

<<<<<<< HEAD
    
    static async obtenerEstadisticasHoy(req, res) {
        try {
            const userId = StatsController.obtenerUsuarioObjetivo(req);
=======
    /**
     * Obtener estadísticas del día actual
     * GET /api/stats/today
     */
    static async obtenerEstadisticasHoy(req, res) {
        try {
            const userId = req.user.id;
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            const estadisticas = await TimeCalculationService.obtenerEstadisticasHoy(userId);

            res.json({
                success: true,
                data: estadisticas
            });

        } catch (error) {
<<<<<<< HEAD
            console.error(' Error en obtenerEstadisticasHoy:', error);
=======
            console.error('❌ Error en obtenerEstadisticasHoy:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas de hoy',
                error: error.message
            });
        }
    }

<<<<<<< HEAD
    static async obtenerEstadisticasSemanales(req, res) {
        try {
            const userId = StatsController.obtenerUsuarioObjetivo(req);
=======
    /**
     * Obtener estadísticas semanales
     * GET /api/stats/weekly
     */
    static async obtenerEstadisticasSemanales(req, res) {
        try {
            const userId = req.user.id;
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            const estadisticas = await TimeCalculationService.obtenerEstadisticasSemanales(userId);

            res.json({
                success: true,
                data: estadisticas
            });

        } catch (error) {
<<<<<<< HEAD
            console.error(' Error en obtenerEstadisticasSemanales:', error);
=======
            console.error('❌ Error en obtenerEstadisticasSemanales:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas semanales',
                error: error.message
            });
        }
    }

<<<<<<< HEAD
    static async obtenerEstadisticasMensuales(req, res) {
        try {
            const userId = StatsController.obtenerUsuarioObjetivo(req);
=======
    /**
     * Obtener estadísticas mensuales
     * GET /api/stats/monthly
     */
    static async obtenerEstadisticasMensuales(req, res) {
        try {
            const userId = req.user.id;
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            const estadisticas = await TimeCalculationService.obtenerEstadisticasMensuales(userId);

            res.json({
                success: true,
                data: estadisticas
            });

        } catch (error) {
<<<<<<< HEAD
            console.error(' Error en obtenerEstadisticasMensuales:', error);
=======
            console.error('❌ Error en obtenerEstadisticasMensuales:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas mensuales',
                error: error.message
            });
        }
    }

<<<<<<< HEAD

    static async obtenerDatosGraficas(req, res) {
        try {
            const userId = StatsController.obtenerUsuarioObjetivo(req);
=======
    /**
     * Obtener datos para gráficas
     * GET /api/stats/charts
     */
    static async obtenerDatosGraficas(req, res) {
        try {
            const userId = req.user.id;
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            const { days = 7 } = req.query;

            const datos = await TimeCalculationService.obtenerDatosGraficas(
                userId, 
                parseInt(days)
            );

            res.json({
                success: true,
                data: datos
            });

        } catch (error) {
<<<<<<< HEAD
            console.error(' Error en obtenerDatosGraficas:', error);
=======
            console.error('❌ Error en obtenerDatosGraficas:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            res.status(500).json({
                success: false,
                message: 'Error al obtener datos para gráficas',
                error: error.message
            });
        }
    }

<<<<<<< HEAD

    static async obtenerSesionActiva(req, res) {
        try {
            const userId = StatsController.obtenerUsuarioObjetivo(req);
=======
    /**
     * Obtener sesión de trabajo activa
     * GET /api/stats/active-session
     */
    static async obtenerSesionActiva(req, res) {
        try {
            const userId = req.user.id;
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            const sesion = await TimeCalculationService.obtenerSesionActiva(userId);

            res.json({
                success: true,
                data: sesion
            });

        } catch (error) {
<<<<<<< HEAD
            console.error(' Error en obtenerSesionActiva:', error);
=======
            console.error('❌ Error en obtenerSesionActiva:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            res.status(500).json({
                success: false,
                message: 'Error al obtener sesión activa',
                error: error.message
            });
        }
    }

<<<<<<< HEAD

    static async obtenerHistoricoSesiones(req, res) {
        try {
            const userId = StatsController.obtenerUsuarioObjetivo(req);
=======
    /**
     * Obtener histórico de sesiones
     * GET /api/stats/sessions
     */
    static async obtenerHistoricoSesiones(req, res) {
        try {
            const userId = req.user.id;
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            const { 
                fechaInicio, 
                fechaFin, 
                page = 1, 
                limit = 20 
            } = req.query;

<<<<<<< HEAD
=======
            // Construir filtros
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            const filtros = { userId };
            
            if (fechaInicio || fechaFin) {
                filtros.entrada = {};
                if (fechaInicio) filtros.entrada.$gte = new Date(fechaInicio);
                if (fechaFin) filtros.entrada.$lte = new Date(fechaFin);
            }

<<<<<<< HEAD
            const skip = (parseInt(page) - 1) * parseInt(limit);

=======
            // Paginación
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Obtener sesiones
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            const [sesiones, total] = await Promise.all([
                WorkSession.find(filtros)
                    .sort({ entrada: -1 })
                    .skip(skip)
                    .limit(parseInt(limit))
                    .populate('userId', 'name email'),
                    
                WorkSession.countDocuments(filtros)
            ]);

            res.json({
                success: true,
                data: {
                    sesiones,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / parseInt(limit))
                    }
                }
            });

        } catch (error) {
<<<<<<< HEAD
            console.error(' Error en obtenerHistoricoSesiones:', error);
=======
            console.error('❌ Error en obtenerHistoricoSesiones:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            res.status(500).json({
                success: false,
                message: 'Error al obtener histórico de sesiones',
                error: error.message
            });
        }
    }

<<<<<<< HEAD
    static async obtenerDetalleSesion(req, res) {
        try {
            const { sessionId } = req.params;
            const userId = req.query.userId;
            const filtro = { _id: sessionId };

            if (userId) {
                filtro.userId = userId;
            }

            const sesion = await WorkSession.findOne(filtro);
=======
    /**
     * Obtener detalle de una sesión específica
     * GET /api/stats/sessions/:sessionId
     */
    static async obtenerDetalleSesion(req, res) {
        try {
            const { sessionId } = req.params;
            const userId = req.user.id;

            const sesion = await WorkSession.findOne({
                _id: sessionId,
                userId
            });
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c

            if (!sesion) {
                return res.status(404).json({
                    success: false,
                    message: 'Sesión no encontrada'
                });
            }

<<<<<<< HEAD
=======
            // Generar reporte legal si la sesión está completa
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            let reporteLegal = null;
            if (sesion.salida) {
                reporteLegal = ColombianLaborLawService.generarReporteLegal({
                    metadata: sesion.metadata || {},
                    recargos: sesion.recargos || {},
                    horasExtras: sesion.horasExtras || {}
                });
            }

            res.json({
                success: true,
                data: {
                    sesion,
                    reporteLegal
                }
            });

        } catch (error) {
<<<<<<< HEAD
            console.error(' Error en obtenerDetalleSesion:', error);
=======
            console.error('❌ Error en obtenerDetalleSesion:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            res.status(500).json({
                success: false,
                message: 'Error al obtener detalle de sesión',
                error: error.message
            });
        }
    }

<<<<<<< HEAD
    static async migrarRegistros(req, res) {
        try {
            const userId = StatsController.obtenerUsuarioObjetivo(req);
=======
    /**
     * Migrar registros de asistencia existentes
     * POST /api/stats/migrate
     */
    static async migrarRegistros(req, res) {
        try {
            const userId = req.user.id;
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            const { fechaInicio, fechaFin } = req.body;

            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({
                    success: false,
                    message: 'Fechas de inicio y fin son requeridas'
                });
            }

<<<<<<< HEAD
            console.log(` Iniciando migración para usuario ${userId}`);
=======
            console.log(`🔄 Iniciando migración para usuario ${userId}`);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c

            const resultado = await TimeCalculationService.migrarRegistrosExistentes(
                userId,
                new Date(fechaInicio),
                new Date(fechaFin)
            );

            res.json({
                success: true,
                message: 'Migración completada',
                data: resultado
            });

        } catch (error) {
<<<<<<< HEAD
            console.error(' Error en migrarRegistros:', error);
=======
            console.error('❌ Error en migrarRegistros:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            res.status(500).json({
                success: false,
                message: 'Error al migrar registros',
                error: error.message
            });
        }
    }

<<<<<<< HEAD
    static async validarIntegridad(req, res) {
        try {
            const userId = StatsController.obtenerUsuarioObjetivo(req);
=======
    /**
     * Validar integridad de datos
     * GET /api/stats/validate
     */
    static async validarIntegridad(req, res) {
        try {
            const userId = req.user.id;
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            
            const reporte = await TimeCalculationService.validarIntegridadDatos(userId);

            res.json({
                success: true,
                data: reporte
            });

        } catch (error) {
<<<<<<< HEAD
            console.error(' Error en validarIntegridad:', error);
=======
            console.error('❌ Error en validarIntegridad:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            res.status(500).json({
                success: false,
                message: 'Error al validar integridad de datos',
                error: error.message
            });
        }
    }

<<<<<<< HEAD
=======
    /**
     * Obtener información de legislación laboral aplicada
     * GET /api/stats/labor-law-info
     */
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    static async obtenerInfoLegislacion(req, res) {
        try {
            const info = {
                jornadas: ColombianLaborLawService.JORNADAS,
                recargos: ColombianLaborLawService.RECARGOS,
                festivosFijos: ColombianLaborLawService.FESTIVOS_FIJOS,
                festivosLunes: ColombianLaborLawService.FESTIVOS_LUNES,
                descripcion: {
                    'NOCTURNO_ORDINARIO': 'Trabajo nocturno ordinario (22:00-06:00) - Art. 168 CST',
                    'EXTRA_DIURNO': 'Horas extras diurnas (después de 8 horas) - Art. 159 CST',
                    'EXTRA_NOCTURNO': 'Horas extras nocturnas - Art. 168 CST',
                    'DOMINICAL_DIURNO': 'Trabajo dominical y festivo diurno - Art. 179 CST',
                    'DOMINICAL_NOCTURNO': 'Trabajo dominical y festivo nocturno - Art. 179 + 168 CST'
                }
            };

            res.json({
                success: true,
                data: info
            });

        } catch (error) {
<<<<<<< HEAD
            console.error(' Error en obtenerInfoLegislacion:', error);
=======
            console.error('❌ Error en obtenerInfoLegislacion:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            res.status(500).json({
                success: false,
                message: 'Error al obtener información de legislación',
                error: error.message
            });
        }
    }

    /**
<<<<<<< HEAD
    Calcular recargos para fechas específicas
=======
     * Calcular recargos para fechas específicas
     * POST /api/stats/calculate-overtime
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
     */
    static async calcularRecargos(req, res) {
        try {
            const { entrada, salida } = req.body;

            if (!entrada || !salida) {
                return res.status(400).json({
                    success: false,
                    message: 'Fechas de entrada y salida son requeridas'
                });
            }

            const fechaEntrada = new Date(entrada);
            const fechaSalida = new Date(salida);
            const tiempoTotalMinutos = Math.floor((fechaSalida - fechaEntrada) / (1000 * 60));

            if (tiempoTotalMinutos <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de salida debe ser posterior a la entrada'
                });
            }

            const calculos = ColombianLaborLawService.calcularRecargos(
                fechaEntrada,
                fechaSalida,
                tiempoTotalMinutos
            );

            const validacion = ColombianLaborLawService.validarLimitesLegales(
<<<<<<< HEAD
                tiempoTotalMinutos / 60, 
                0 
=======
                tiempoTotalMinutos / 60, // Horas diarias
                0 // Horas semanales (no disponible en este contexto)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            );

            res.json({
                success: true,
                data: {
                    calculos,
                    validacion,
                    tiempoTotal: {
                        minutos: tiempoTotalMinutos,
                        formato: TimeCalculationService.formatearTiempo(tiempoTotalMinutos),
                        horas: Math.round((tiempoTotalMinutos / 60) * 100) / 100
                    }
                }
            });

        } catch (error) {
<<<<<<< HEAD
            console.error(' Error en calcularRecargos:', error);
=======
            console.error('❌ Error en calcularRecargos:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            res.status(500).json({
                success: false,
                message: 'Error al calcular recargos',
                error: error.message
            });
        }
    }

    /**
<<<<<<< HEAD
     Obtener estadísticas de rendimiento del sistema
     */
    static async obtenerRendimientoSistema(req, res) {
        try {
            const userId = StatsController.obtenerUsuarioObjetivo(req);
=======
     * Obtener estadísticas de rendimiento del sistema
     * GET /api/stats/system-performance
     */
    static async obtenerRendimientoSistema(req, res) {
        try {
            const userId = req.user.id;
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c

            const [
                totalSesiones,
                sesionesEsteMes,
                ultimasSesiones,
                estadisticasRecientes
            ] = await Promise.all([
                WorkSession.countDocuments({ userId }),
                
                WorkSession.countDocuments({
                    userId,
                    entrada: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }),
                
                WorkSession.find({ userId, salida: { $ne: null } })
                    .sort({ entrada: -1 })
                    .limit(5)
                    .select('entrada salida tiempoTotal'),
                    
                DailyStats.find({ userId })
                    .sort({ fecha: -1 })
                    .limit(10)
                    .select('fecha tiempoTotal horasExtras')
            ]);

<<<<<<< HEAD
=======
            // Calcular estadísticas agregadas
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            let tiempoTotalAcumulado = 0;
            let horasExtrasAcumuladas = 0;

            estadisticasRecientes.forEach(stat => {
                tiempoTotalAcumulado += stat.tiempoTotal.minutos || 0;
                horasExtrasAcumuladas += (stat.horasExtras?.total?.minutos || 0);
            });

            const rendimiento = {
                resumen: {
                    totalSesiones,
                    sesionesEsteMes,
                    promedioHorasDiarias: estadisticasRecientes.length > 0 ? 
                        Math.round(((tiempoTotalAcumulado / 60) / estadisticasRecientes.length) * 100) / 100 : 0,
                    totalHorasExtras: Math.round((horasExtrasAcumuladas / 60) * 100) / 100
                },
                ultimaActividad: ultimasSesiones,
                tendencias: {
                    diasConDatos: estadisticasRecientes.length,
                    promedioSemanal: estadisticasRecientes.length > 0 ? 
                        Math.round(((tiempoTotalAcumulado / 60) / estadisticasRecientes.length) * 7 * 100) / 100 : 0
                }
            };

            res.json({
                success: true,
                data: rendimiento
            });

        } catch (error) {
<<<<<<< HEAD
            console.error(' Error en obtenerRendimientoSistema:', error);
=======
            console.error('❌ Error en obtenerRendimientoSistema:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            res.status(500).json({
                success: false,
                message: 'Error al obtener rendimiento del sistema',
                error: error.message
            });
        }
    }
}

module.exports = StatsController;