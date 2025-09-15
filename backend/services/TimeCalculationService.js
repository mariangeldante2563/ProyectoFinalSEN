const WorkSession = require('../models/WorkSession');
const DailyStats = require('../models/DailyStats');
const Attendance = require('../models/Attendance');

/**
 * TimeCalculationService - Servicio de Cálculo de Tiempo Laborado
 * 
 * Este servicio coordina el procesamiento de registros de asistencia,
 * creando sesiones de trabajo y actualizando estadísticas diarias.
 * 
 * Funcionalidades:
 * - Procesar registros de entrada/salida
 * - Crear sesiones de trabajo automáticamente
 * - Calcular tiempos según legislación colombiana
 * - Actualizar estadísticas diarias
 * - Generar reportes y métricas
 */

class TimeCalculationService {
    
    /**
     * Procesar nuevo registro de asistencia
     * @param {ObjectId} userId - ID del usuario
     * @param {String} type - Tipo de registro ('entrada' o 'salida')
     * @param {Date} timestamp - Fecha y hora del registro
     * @param {String} location - Ubicación del registro (opcional)
     * @returns {Object} Resultado del procesamiento
     */
    static async procesarRegistroAsistencia(userId, type, timestamp = new Date(), location = null) {
        try {
            console.log(`📋 Procesando ${type} para usuario ${userId} a las ${timestamp}`);

            // 1. Crear el registro de asistencia tradicional
            const attendance = new Attendance({
                userId,
                type,
                timestamp,
                location
            });
            await attendance.save();

            // 2. Buscar sesión de trabajo pendiente para este usuario
            let workSession = await WorkSession.findOne({
                userId,
                salida: null // Sesión sin cerrar
            }).sort({ entrada: -1 });

            let resultado = {
                registro: attendance,
                sesion: null,
                estadisticas: null,
                accion: '',
                mensaje: ''
            };

            if (type === 'entrada') {
                // === PROCESO DE ENTRADA ===
                
                if (workSession) {
                    // Ya tiene una sesión abierta - cerrar la anterior automáticamente
                    console.log('⚠️ Encontrada sesión abierta previa - cerrando automáticamente');
                    
                    // Cerrar sesión anterior con timestamp actual menos 1 minuto
                    const salidaAnterior = new Date(timestamp.getTime() - 60000);
                    workSession.salida = salidaAnterior;
                    await workSession.save();
                    
                    // Actualizar estadísticas de la sesión cerrada
                    const fechaAnterior = new Date(workSession.entrada);
                    fechaAnterior.setHours(0, 0, 0, 0);
                    await DailyStats.crearOActualizarEstadisticas(userId, fechaAnterior, workSession);
                    
                    resultado.mensaje += 'Sesión anterior cerrada automáticamente. ';
                }

                // Crear nueva sesión de trabajo
                workSession = new WorkSession({
                    userId,
                    entrada: timestamp,
                    ubicacionEntrada: location
                });
                await workSession.save();

                resultado.sesion = workSession;
                resultado.accion = 'entrada_registrada';
                resultado.mensaje += 'Nueva sesión de trabajo iniciada.';

            } else if (type === 'salida') {
                // === PROCESO DE SALIDA ===
                
                if (!workSession) {
                    // No hay sesión abierta - crear una con entrada estimada
                    console.log('⚠️ No hay sesión abierta - creando entrada estimada');
                    
                    // Estimar entrada 8 horas antes
                    const entradaEstimada = new Date(timestamp.getTime() - (8 * 60 * 60 * 1000));
                    
                    workSession = new WorkSession({
                        userId,
                        entrada: entradaEstimada,
                        salida: timestamp,
                        ubicacionSalida: location,
                        metadata: {
                            entradaEstimada: true,
                            observaciones: 'Entrada estimada por registro de salida sin entrada previa'
                        }
                    });

                    resultado.accion = 'salida_con_entrada_estimada';
                    resultado.mensaje = 'Salida registrada con entrada estimada (8 horas antes).';

                } else {
                    // Cerrar sesión existente
                    workSession.salida = timestamp;
                    workSession.ubicacionSalida = location;
                    
                    resultado.accion = 'salida_registrada';
                    resultado.mensaje = 'Sesión de trabajo completada exitosamente.';
                }

                await workSession.save();
                resultado.sesion = workSession;

                // Actualizar estadísticas diarias
                const fechaSesion = new Date(workSession.entrada);
                fechaSesion.setHours(0, 0, 0, 0);
                
                const estadisticas = await DailyStats.crearOActualizarEstadisticas(
                    userId, 
                    fechaSesion, 
                    workSession
                );
                
                resultado.estadisticas = estadisticas;
            }

            console.log(`✅ ${type} procesada exitosamente: ${resultado.mensaje}`);
            return resultado;

        } catch (error) {
            console.error(`❌ Error procesando ${type}:`, error);
            throw new Error(`Error al procesar ${type}: ${error.message}`);
        }
    }

    /**
     * Obtener sesión de trabajo activa para un usuario
     * @param {ObjectId} userId - ID del usuario
     * @returns {Object|null} Sesión activa o null
     */
    static async obtenerSesionActiva(userId) {
        try {
            const sesionActiva = await WorkSession.findOne({
                userId,
                salida: null
            }).sort({ entrada: -1 });

            if (sesionActiva) {
                // Calcular duración actual
                const ahora = new Date();
                const duracionMinutos = Math.floor((ahora - sesionActiva.entrada) / (1000 * 60));
                
                return {
                    ...sesionActiva.toObject(),
                    duracionActual: {
                        minutos: duracionMinutos,
                        formato: this.formatearTiempo(duracionMinutos)
                    },
                    activa: true
                };
            }

            return null;

        } catch (error) {
            throw new Error(`Error al obtener sesión activa: ${error.message}`);
        }
    }

    /**
     * Obtener estadísticas del día actual para un usuario
     * @param {ObjectId} userId - ID del usuario
     * @returns {Object} Estadísticas del día
     */
    static async obtenerEstadisticasHoy(userId) {
        try {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            let estadisticas = await DailyStats.findOne({
                userId,
                fecha: hoy
            });

            if (!estadisticas) {
                // Crear estadísticas vacías para hoy
                estadisticas = new DailyStats({
                    userId,
                    fecha: hoy
                });
                await estadisticas.save();
            }

            // Agregar sesión activa si existe
            const sesionActiva = await this.obtenerSesionActiva(userId);
            
            return {
                estadisticas,
                sesionActiva,
                resumen: {
                    tiempoTrabajadoHoy: estadisticas.tiempoTotal.formato,
                    horasExtrasHoy: estadisticas.horasExtras.total.formato,
                    recargosHoy: estadisticas.recargos.totalRecargos.formato,
                    cumplioJornada: estadisticas.estadisticas.cumplimientoJornada.cumplioOchoHoras,
                    porcentajeCumplimiento: estadisticas.estadisticas.cumplimientoJornada.porcentajeCumplimiento
                }
            };

        } catch (error) {
            throw new Error(`Error al obtener estadísticas de hoy: ${error.message}`);
        }
    }

    /**
     * Obtener estadísticas semanales para un usuario
     * @param {ObjectId} userId - ID del usuario
     * @returns {Object} Estadísticas de la semana
     */
    static async obtenerEstadisticasSemanales(userId) {
        try {
            return await DailyStats.obtenerEstadisticasSemanales(userId);
        } catch (error) {
            throw new Error(`Error al obtener estadísticas semanales: ${error.message}`);
        }
    }

    /**
     * Obtener estadísticas mensuales para un usuario
     * @param {ObjectId} userId - ID del usuario
     * @returns {Object} Estadísticas del mes
     */
    static async obtenerEstadisticasMensuales(userId) {
        try {
            return await DailyStats.obtenerEstadisticasMensuales(userId);
        } catch (error) {
            throw new Error(`Error al obtener estadísticas mensuales: ${error.message}`);
        }
    }

    /**
     * Obtener datos para gráficas del dashboard
     * @param {ObjectId} userId - ID del usuario
     * @param {Number} ultimosDias - Número de días (default: 7)
     * @returns {Object} Datos para gráficas
     */
    static async obtenerDatosGraficas(userId, ultimosDias = 7) {
        try {
            return await DailyStats.obtenerDatosGraficas(userId, ultimosDias);
        } catch (error) {
            throw new Error(`Error al obtener datos para gráficas: ${error.message}`);
        }
    }

    /**
     * Procesar registros de asistencia existentes para un usuario
     * Esta función migra registros antiguos al nuevo sistema
     * @param {ObjectId} userId - ID del usuario
     * @param {Date} fechaInicio - Fecha de inicio del procesamiento
     * @param {Date} fechaFin - Fecha fin del procesamiento
     * @returns {Object} Resultado del procesamiento
     */
    static async migrarRegistrosExistentes(userId, fechaInicio, fechaFin) {
        try {
            console.log(`🔄 Migrando registros existentes para usuario ${userId}`);

            // Obtener todos los registros de asistencia en el rango
            const registros = await Attendance.find({
                userId,
                timestamp: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                }
            }).sort({ timestamp: 1 });

            console.log(`📊 Encontrados ${registros.length} registros para migrar`);

            let sesionesCreadas = 0;
            let estadisticasActualizadas = 0;
            let errores = [];

            // Agrupar registros por día
            const registrosPorDia = this.agruparRegistrosPorDia(registros);

            for (const [fecha, registrosDelDia] of Object.entries(registrosPorDia)) {
                try {
                    console.log(`📅 Procesando ${fecha} - ${registrosDelDia.length} registros`);

                    // Emparejar entradas y salidas
                    const sesiones = this.emparejarEntradaSalida(registrosDelDia);

                    for (const sesionData of sesiones) {
                        // Crear WorkSession
                        const workSession = new WorkSession({
                            userId,
                            entrada: sesionData.entrada,
                            salida: sesionData.salida,
                            metadata: {
                                origenDatos: 'migracion',
                                observaciones: 'Migrado desde registros de asistencia existentes'
                            }
                        });

                        await workSession.save();
                        sesionesCreadas++;

                        // Actualizar estadísticas diarias
                        const fechaSesion = new Date(sesionData.entrada);
                        fechaSesion.setHours(0, 0, 0, 0);

                        await DailyStats.crearOActualizarEstadisticas(
                            userId,
                            fechaSesion,
                            workSession
                        );
                        estadisticasActualizadas++;
                    }

                } catch (error) {
                    console.error(`❌ Error procesando día ${fecha}:`, error);
                    errores.push({
                        fecha,
                        error: error.message
                    });
                }
            }

            const resultado = {
                registrosProcesados: registros.length,
                sesionesCreadas,
                estadisticasActualizadas,
                errores,
                exitoso: errores.length === 0
            };

            console.log(`✅ Migración completada:`, resultado);
            return resultado;

        } catch (error) {
            throw new Error(`Error en migración de registros: ${error.message}`);
        }
    }

    /**
     * Agrupar registros de asistencia por día
     * @param {Array} registros - Array de registros de asistencia
     * @returns {Object} Registros agrupados por fecha
     */
    static agruparRegistrosPorDia(registros) {
        const registrosPorDia = {};

        registros.forEach(registro => {
            const fecha = registro.timestamp.toISOString().split('T')[0];
            
            if (!registrosPorDia[fecha]) {
                registrosPorDia[fecha] = [];
            }
            
            registrosPorDia[fecha].push(registro);
        });

        return registrosPorDia;
    }

    /**
     * Emparejar registros de entrada y salida
     * @param {Array} registrosDelDia - Registros de un día específico
     * @returns {Array} Array de sesiones con entrada y salida
     */
    static emparejarEntradaSalida(registrosDelDia) {
        const sesiones = [];
        let entradaPendiente = null;

        registrosDelDia.forEach(registro => {
            if (registro.type === 'entrada') {
                if (entradaPendiente) {
                    // Hay una entrada sin salida previa - crear sesión con salida estimada
                    sesiones.push({
                        entrada: entradaPendiente.timestamp,
                        salida: new Date(registro.timestamp.getTime() - 60000) // 1 minuto antes
                    });
                }
                entradaPendiente = registro;

            } else if (registro.type === 'salida') {
                if (entradaPendiente) {
                    // Emparejar entrada con salida
                    sesiones.push({
                        entrada: entradaPendiente.timestamp,
                        salida: registro.timestamp
                    });
                    entradaPendiente = null;
                } else {
                    // Salida sin entrada - crear entrada estimada
                    const entradaEstimada = new Date(registro.timestamp.getTime() - (8 * 60 * 60 * 1000));
                    sesiones.push({
                        entrada: entradaEstimada,
                        salida: registro.timestamp
                    });
                }
            }
        });

        // Si queda una entrada sin salida al final del día
        if (entradaPendiente) {
            const salidaEstimada = new Date(entradaPendiente.timestamp);
            salidaEstimada.setHours(23, 59, 59, 999); // Final del día
            
            sesiones.push({
                entrada: entradaPendiente.timestamp,
                salida: salidaEstimada
            });
        }

        return sesiones;
    }

    /**
     * Validar integridad de datos para un usuario
     * @param {ObjectId} userId - ID del usuario
     * @returns {Object} Reporte de validación
     */
    static async validarIntegridadDatos(userId) {
        try {
            console.log(`🔍 Validando integridad de datos para usuario ${userId}`);

            const reporte = {
                usuario: userId,
                fecha: new Date(),
                validaciones: [],
                errores: [],
                advertencias: [],
                resumen: {}
            };

            // 1. Verificar sesiones sin cerrar
            const sesionesAbiertas = await WorkSession.find({
                userId,
                salida: null,
                entrada: {
                    $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Más de 24 horas
                }
            });

            if (sesionesAbiertas.length > 0) {
                reporte.advertencias.push({
                    tipo: 'sesiones_abiertas',
                    mensaje: `${sesionesAbiertas.length} sesiones abiertas por más de 24 horas`,
                    datos: sesionesAbiertas
                });
            }

            // 2. Verificar estadísticas huérfanas
            const estadisticasHuerfanas = await DailyStats.find({
                userId
            });

            for (const stat of estadisticasHuerfanas) {
                const sesionesDelDia = await WorkSession.find({
                    userId,
                    entrada: {
                        $gte: stat.fecha,
                        $lt: new Date(stat.fecha.getTime() + 24 * 60 * 60 * 1000)
                    }
                });

                if (sesionesDelDia.length === 0 && stat.tiempoTotal.minutos > 0) {
                    reporte.errores.push({
                        tipo: 'estadisticas_huerfanas',
                        mensaje: `Estadísticas sin sesiones de trabajo para ${stat.fecha.toDateString()}`,
                        datos: stat
                    });
                }
            }

            // 3. Verificar cálculos incorrectos
            const sesionesCompletas = await WorkSession.find({
                userId,
                salida: { $ne: null }
            }).limit(10).sort({ entrada: -1 });

            for (const sesion of sesionesCompletas) {
                const duracionCalculada = Math.floor((sesion.salida - sesion.entrada) / (1000 * 60));
                
                if (Math.abs(duracionCalculada - sesion.tiempoTotal.minutos) > 1) {
                    reporte.errores.push({
                        tipo: 'calculo_incorrecto',
                        mensaje: `Duración calculada (${duracionCalculada}min) no coincide con almacenada (${sesion.tiempoTotal.minutos}min)`,
                        datos: sesion
                    });
                }
            }

            // Generar resumen
            reporte.resumen = {
                totalValidaciones: reporte.validaciones.length,
                totalErrores: reporte.errores.length,
                totalAdvertencias: reporte.advertencias.length,
                estadoGeneral: reporte.errores.length === 0 ? 'CORRECTO' : 'CON_ERRORES'
            };

            console.log(`✅ Validación completada: ${reporte.resumen.estadoGeneral}`);
            return reporte;

        } catch (error) {
            throw new Error(`Error en validación de integridad: ${error.message}`);
        }
    }

    /**
     * Formatear tiempo de minutos a HH:MM
     * @param {Number} minutos - Minutos a formatear
     * @returns {String} Tiempo formateado
     */
    static formatearTiempo(minutos) {
        if (!minutos || minutos < 0) return "00:00";
        
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        
        return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    /**
     * Obtener resumen completo del dashboard para un usuario
     * @param {ObjectId} userId - ID del usuario
     * @returns {Object} Datos completos del dashboard
     */
    static async obtenerResumenDashboard(userId) {
        try {
            console.log(`📊 Generando resumen completo del dashboard para usuario ${userId}`);

            // Obtener todas las estadísticas en paralelo
            const [
                estadisticasHoy,
                estadisticasSemanales,
                estadisticasMensuales,
                datosGraficas,
                sesionActiva
            ] = await Promise.all([
                this.obtenerEstadisticasHoy(userId),
                this.obtenerEstadisticasSemanales(userId),
                this.obtenerEstadisticasMensuales(userId),
                this.obtenerDatosGraficas(userId, 7),
                this.obtenerSesionActiva(userId)
            ]);

            return {
                fecha: new Date(),
                usuario: userId,
                hoy: estadisticasHoy,
                semana: estadisticasSemanales,
                mes: estadisticasMensuales,
                graficas: datosGraficas,
                sesionActiva,
                resumen: {
                    trabajandoAhora: !!sesionActiva,
                    tiempoHoy: estadisticasHoy.estadisticas.tiempoTotal.formato,
                    promedioSemanal: `${estadisticasSemanales.promedioHorasDiarias.toFixed(1)}h`,
                    diasMes: estadisticasMensuales.diasTrabajados,
                    cumpleLimites: {
                        jornadaDiaria: estadisticasHoy.estadisticas.tiempoTotal.minutos <= 480, // 8 horas
                        jornada44Horas: estadisticasSemanales.cumpleLimite44Horas
                    }
                }
            };

        } catch (error) {
            throw new Error(`Error al generar resumen del dashboard: ${error.message}`);
        }
    }
}

module.exports = TimeCalculationService;