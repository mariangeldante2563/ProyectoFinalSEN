const WorkSession = require('../models/WorkSession');
const DailyStats = require('../models/DailyStats');
const Attendance = require('../models/Attendance');
const ColombianLaborLawService = require('./ColombianLaborLawService');

class TimeCalculationService {
  static formatearTiempo(minutos) {
    const total = Math.max(0, Math.round(Number(minutos) || 0));
    const hours = Math.floor(total / 60);
    const remainingMinutes = total % 60;
    return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
  }

  static _minutosProgramados(horario, isoDay) {
    const schedule = horario?.minutosOrdinariosPorDia;
    const value = schedule instanceof Map
      ? schedule.get(String(isoDay))
      : schedule?.[String(isoDay)];
    return Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  }

  static _minutosSemanalesProgramados(horario) {
    const weeklyMinutes = Number(horario?.minutosOrdinariosSemanales);
    if (Number.isFinite(weeklyMinutes) && weeklyMinutes > 0) return weeklyMinutes;

    const schedule = horario?.minutosOrdinariosPorDia;
    const values = schedule instanceof Map ? [...schedule.values()] : Object.values(schedule || {});
    return values.reduce((total, value) => total + Math.max(0, Number(value) || 0), 0);
  }

  static _inicioSemanaLocal(fecha) {
    const localDate = this._fechaLocal(fecha);
    const [year, month, day] = localDate.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const weekday = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() - weekday + 1);
    return date.toISOString().slice(0, 10);
  }

  static _fechaLocal(fecha) {
    return ColombianLaborLawService.obtenerFechaLocal(fecha);
  }

  static obtenerHorarioVigente(usuario, fecha) {
    return (usuario.horariosLaborales || [])
      .filter(horario => horario.vigenteDesde <= fecha &&
        (!horario.vigenteHasta || horario.vigenteHasta > fecha))
      .sort((a, b) => b.vigenteDesde - a.vigenteDesde)[0] || null;
  }

  /**
   * Clasifica una sesión usando la versión de horario y las reglas legales vigentes.
   * Los cálculos se ejecutan exclusivamente en el backend.
   * @param {Object} options Marcas, horario y acumulado semanal previo
   * @returns {Object} Totales y desglose de la jornada
   */
  static calcularSesion({ entrada, salida, horario, minutosSemanalesPrevios = 0 }) {
    const inicio = new Date(entrada);
    const fin = new Date(salida);
    if (!Number.isFinite(inicio.getTime()) || !Number.isFinite(fin.getTime()) || fin <= inicio) {
      throw new Error('La sesión requiere una entrada y salida válidas.');
    }
    if (!horario?.minutosOrdinariosPorDia) {
      const minutes = Math.floor((fin - inicio) / 60000);
      return {
        estadoCalculo: 'pendiente_horario',
        tiempoTotal: { minutos: minutes, formato: `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}` }
      };
    }

    const totals = {
      total: 0,
      ordinariaDiurna: 0,
      ordinariaNocturna: 0,
      extraDiurna: 0,
      extraNocturna: 0,
      dominicalDiurna: 0,
      dominicalNocturna: 0,
      nocturnaOrdinaria: 0
    };
    const workedByDate = new Map();
    let weeklyMinutes = minutosSemanalesPrevios;
    let cursor = Math.ceil(inicio.getTime() / 60000) * 60000;

    while (cursor < fin.getTime()) {
      const instant = new Date(cursor);
      const localDate = ColombianLaborLawService.obtenerFechaLocal(instant);
      const localParts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      }).formatToParts(instant).reduce((parts, part) => {
        parts[part.type] = part.value;
        return parts;
      }, {});
      const minuteOfDay = Number(localParts.hour) * 60 + Number(localParts.minute);
      const isoDay = ColombianLaborLawService.obtenerDiaISOLocal(instant);
      const map = horario.minutosOrdinariosPorDia;
      const scheduledMinutes = Number(map instanceof Map ? map.get(String(isoDay)) : map[String(isoDay)]) || 0;
      const dateWorked = workedByDate.get(localDate) || 0;
      const rules = ColombianLaborLawService.obtenerReglasVigentes(instant, horario);
      const isRestDay = isoDay === horario.diaDescansoObligatorio ||
        ColombianLaborLawService.esFestivoColombiano(instant);
      const isOvertime = dateWorked >= scheduledMinutes;
      const isNight = minuteOfDay >= rules.inicioNocturno * 60 || minuteOfDay < 6 * 60;
      const key = isRestDay
        ? (isNight ? 'dominicalNocturna' : 'dominicalDiurna')
        : (isOvertime
          ? (isNight ? 'extraNocturna' : 'extraDiurna')
          : (isNight ? 'ordinariaNocturna' : 'ordinariaDiurna'));

      totals[key] += 1;
      totals.total += 1;
      if (!isRestDay && !isOvertime && isNight) totals.nocturnaOrdinaria += 1;
      workedByDate.set(localDate, dateWorked + 1);
      weeklyMinutes += 1;
      cursor += 60000;
    }

    const format = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    const sum = (...keys) => keys.reduce((total, key) => total + totals[key], 0);
    const firstRules = ColombianLaborLawService.obtenerReglasVigentes(inicio, horario);
    const esDescanso = totals.dominicalDiurna + totals.dominicalNocturna > 0;
    return {
      estadoCalculo: 'calculado',
      tiempoTotal: { minutos: totals.total, formato: format(totals.total) },
      horasOrdinarias: {
        diurnas: { minutos: totals.ordinariaDiurna, formato: format(totals.ordinariaDiurna) },
        nocturnas: { minutos: totals.ordinariaNocturna, formato: format(totals.ordinariaNocturna) },
        total: { minutos: sum('ordinariaDiurna', 'ordinariaNocturna'), formato: format(sum('ordinariaDiurna', 'ordinariaNocturna')) }
      },
      horasExtras: {
        diurnas: { minutos: totals.extraDiurna, formato: format(totals.extraDiurna) },
        nocturnas: { minutos: totals.extraNocturna, formato: format(totals.extraNocturna) },
        total: { minutos: sum('extraDiurna', 'extraNocturna'), formato: format(sum('extraDiurna', 'extraNocturna')) }
      },
      recargos: {
        nocturnoOrdinario: { minutos: totals.nocturnaOrdinaria, formato: format(totals.nocturnaOrdinaria), porcentaje: firstRules.recargoNocturnoOrdinario },
        extraDiurno: { minutos: totals.extraDiurna, formato: format(totals.extraDiurna), porcentaje: firstRules.recargoExtraDiurna },
        extraNocturno: { minutos: totals.extraNocturna, formato: format(totals.extraNocturna), porcentaje: firstRules.recargoExtraNocturna },
        dominicalDiurno: { minutos: totals.dominicalDiurna, formato: format(totals.dominicalDiurna), porcentaje: firstRules.recargoDescanso },
        dominicalNocturno: { minutos: totals.dominicalNocturna, formato: format(totals.dominicalNocturna), porcentaje: firstRules.recargoDescanso + firstRules.recargoNocturnoOrdinario },
        totalRecargos: { minutos: sum('nocturnaOrdinaria', 'extraDiurna', 'extraNocturna', 'dominicalDiurna', 'dominicalNocturna'), formato: format(sum('nocturnaOrdinaria', 'extraDiurna', 'extraNocturna', 'dominicalDiurna', 'dominicalNocturna')) }
      },
      metadata: {
        calculoVersion: firstRules.calculoVersion,
        minutosSemanalesPrevios,
        excedeTopeSemanal: weeklyMinutes > firstRules.maxHorasSemanales * 60,
        esDomingoOFestivo: esDescanso
      }
    };
  }

  static async obtenerSesionActiva(userId) {
    const sesionActiva = await WorkSession.obtenerSesionActiva(userId);
    if (!sesionActiva) return null;

    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) throw new Error('Empleado de la jornada activa no encontrado.');
    const ahora = new Date();
    const horario = this.obtenerHorarioVigente(user, sesionActiva.timestampEntrada);
    const calculo = this.calcularSesion({
      entrada: sesionActiva.timestampEntrada,
      salida: ahora,
      horario
    });

    return {
      ...sesionActiva.toObject(),
      duracionActual: {
        ...calculo.tiempoTotal,
        estadoCalculo: calculo.estadoCalculo
      },
      clasificacionActual: calculo,
      activa: true
    };
  }

  static async obtenerEstadisticasHoy(userId) {
    const hoy = this._inicioDia(new Date());
    let estadisticas = await DailyStats.findOne({ userId, fecha: hoy });

    if (!estadisticas) {
      estadisticas = new DailyStats({ userId, fecha: hoy });
    }

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
  }

  static async obtenerEstadisticasSemanales(userId) {
    return DailyStats.obtenerEstadisticasSemanales(userId);
  }

  static async obtenerEstadisticasMensuales(userId) {
    return DailyStats.obtenerEstadisticasMensuales(userId);
  }

  static async obtenerDatosGraficas(userId, ultimosDias = 7) {
    return DailyStats.obtenerDatosGraficas(userId, ultimosDias);
  }

  static async obtenerTablaHorasLaborales({ startDate, endDate, page = 1, limit = 100 } = {}) {
    const filtros = {};
    if (startDate || endDate) {
      filtros.timestampEntrada = {};
      if (startDate) filtros.timestampEntrada.$gte = new Date(startDate);
      if (endDate) {
        const fin = new Date(endDate);
        fin.setHours(23, 59, 59, 999);
        filtros.timestampEntrada.$lte = fin;
      }
    }

    const pagina = Math.max(1, parseInt(page, 10) || 1);
    const limite = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));
    const skip = (pagina - 1) * limite;

    const [sesiones, total] = await Promise.all([
      WorkSession.find(filtros)
        .sort({ timestampEntrada: -1 })
        .skip(skip)
        .limit(limite)
        .populate('userId', 'nombreCompleto numeroDocumento cargo departamento'),
      WorkSession.countDocuments(filtros)
    ]);

    return {
      rows: sesiones.map(sesion => this._mapearFilaLaboral(sesion)),
      pagination: {
        total,
        page: pagina,
        limit: limite,
        pages: Math.ceil(total / limite)
      },
      leyAplicada: {
        jornadaDiurna: '06:00-19:00',
        jornadaNocturna: '19:00-06:00',
        maximaDiariaHoras: ColombianLaborLawService.JORNADAS.MAXIMA_DIARIA,
        maximaSemanalHoras: ColombianLaborLawService.obtenerMaximaSemanal(new Date())
      }
    };
  }

  static async migrarRegistrosExistentes(userId, fechaInicio, fechaFin) {
    const registros = await Attendance.find({
      userId,
      timestamp: { $gte: fechaInicio, $lte: fechaFin }
    }).sort({ timestamp: 1 });

    const registrosPorDia = this.agruparRegistrosPorDia(registros);
    let sesionesCreadas = 0;
    let estadisticasActualizadas = 0;
    const errores = [];

    for (const [fecha, registrosDelDia] of Object.entries(registrosPorDia)) {
      try {
        const sesiones = this.emparejarEntradaSalida(registrosDelDia);

        for (const sesionData of sesiones) {
          const workSession = new WorkSession({
            userId,
            fecha,
            horaEntrada: this.formatearHora(sesionData.entrada),
            timestampEntrada: sesionData.entrada,
            horaSalida: this.formatearHora(sesionData.salida),
            timestampSalida: sesionData.salida,
            estado: 'completada',
            metadata: {
              observaciones: 'Migrado desde registros de asistencia existentes'
            }
          });
          await workSession.save();
          sesionesCreadas++;
        }

        await DailyStats.crearOActualizarEstadisticas(userId, new Date(`${fecha}T00:00:00`));
        estadisticasActualizadas++;
      } catch (error) {
        errores.push({ fecha, error: error.message });
      }
    }

    return {
      registrosProcesados: registros.length,
      sesionesCreadas,
      estadisticasActualizadas,
      errores,
      exitoso: errores.length === 0
    };
  }

  static agruparRegistrosPorDia(registros) {
    return registros.reduce((acc, registro) => {
      const fecha = this.formatearFecha(registro.timestamp);
      if (!acc[fecha]) acc[fecha] = [];
      acc[fecha].push(registro);
      return acc;
    }, {});
  }

  static emparejarEntradaSalida(registrosDelDia) {
    const sesiones = [];
    let entradaPendiente = null;

    registrosDelDia.forEach(registro => {
      if (registro.type === 'entrada') {
        if (entradaPendiente) {
          sesiones.push({
            entrada: entradaPendiente.timestamp,
            salida: new Date(registro.timestamp.getTime() - 60000)
          });
        }
        entradaPendiente = registro;
      } else if (registro.type === 'salida') {
        if (entradaPendiente) {
          sesiones.push({
            entrada: entradaPendiente.timestamp,
            salida: registro.timestamp
          });
          entradaPendiente = null;
        } else {
          sesiones.push({
            entrada: new Date(registro.timestamp.getTime() - (8 * 60 * 60 * 1000)),
            salida: registro.timestamp
          });
        }
      }
    });

    return sesiones;
  }

  static async validarIntegridadDatos(userId) {
    const sesionesAbiertas = await WorkSession.find({
      userId,
      estado: 'activa',
      timestampEntrada: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const sesionesCompletas = await WorkSession.find({
      userId,
      timestampSalida: { $ne: null }
    }).limit(25).sort({ timestampEntrada: -1 });

    const errores = [];
    sesionesCompletas.forEach(sesion => {
      const duracion = Math.floor((sesion.timestampSalida - sesion.timestampEntrada) / 60000);
      if (Math.abs(duracion - (sesion.tiempoLaboradoMinutos || 0)) > 1) {
        errores.push({
          tipo: 'calculo_incorrecto',
          mensaje: `Duracion calculada (${duracion}min) no coincide con almacenada (${sesion.tiempoLaboradoMinutos || 0}min)`,
          sesionId: sesion._id
        });
      }
    });

    return {
      usuario: userId,
      fecha: new Date(),
      errores,
      advertencias: sesionesAbiertas.map(sesion => ({
        tipo: 'sesion_abierta',
        mensaje: 'Sesion abierta por mas de 24 horas',
        sesionId: sesion._id
      })),
      resumen: {
        totalErrores: errores.length,
        totalAdvertencias: sesionesAbiertas.length,
        estadoGeneral: errores.length === 0 ? 'CORRECTO' : 'CON_ERRORES'
      }
    };
  }

  static async obtenerResumenDashboard(userId) {
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
          jornadaDiaria: estadisticasHoy.estadisticas.tiempoTotal.minutos <= 480,
          jornadaSemanal: estadisticasSemanales.cumpleLimiteSemanal
        }
      }
    };
  }

  static formatearTiempo(minutos) {
    return ColombianLaborLawService.formatearTiempo(minutos);
  }

  static formatearFecha(fecha) {
    const d = new Date(fecha);
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
  }

  static formatearHora(fecha) {
    const d = new Date(fecha);
    return [
      String(d.getHours()).padStart(2, '0'),
      String(d.getMinutes()).padStart(2, '0'),
      String(d.getSeconds()).padStart(2, '0')
    ].join(':');
  }

  static _inicioDia(fecha) {
    const localDate = ColombianLaborLawService.obtenerFechaLocal(fecha);
    return new Date(`${localDate}T00:00:00.000Z`);
  }

  static _mapearFilaLaboral(sesion) {
    const user = sesion.userId || {};
    const totalMinutos = sesion.tiempoLaboradoMinutos;
    const calculatedMinutes = value => totalMinutos == null ? null : value;
    const format = minutes => minutes == null
      ? 'Pendiente de revisión'
      : ColombianLaborLawService.formatearTiempo(minutes);
    const recargoTotal = sesion.recargos?.recargoTotal ?? null;
    const esDescanso = sesion.esFinDeSemana || sesion.esFestivo;

    return {
      id: sesion._id,
      empleado: {
        id: user._id,
        nombre: user.nombreCompleto || 'Empleado sin nombre',
        numeroDocumento: user.numeroDocumento || '--',
        cargo: user.cargo || '--',
        departamento: user.departamento || '--'
      },
      diaLaborado: sesion.fecha,
      entrada: sesion.horaEntrada,
      salida: sesion.horaSalida || '--',
      estado: sesion.estado,
      totalHorasLaboradas: {
        minutos: totalMinutos,
        formato: format(totalMinutos),
        decimal: totalMinutos == null ? null : Math.round((totalMinutos / 60) * 100) / 100
      },
      clasificacion: {
        ordinariaDiurna: { minutos: calculatedMinutes(sesion.tiempoJornadaOrdinariaDiurna), formato: format(calculatedMinutes(sesion.tiempoJornadaOrdinariaDiurna)) },
        ordinariaNocturna: { minutos: calculatedMinutes(sesion.tiempoJornadaOrdinariaNocturna), formato: format(calculatedMinutes(sesion.tiempoJornadaOrdinariaNocturna)) },
        extraDiurna: { minutos: calculatedMinutes(sesion.tiempoHorasExtrasDiurnas), formato: format(calculatedMinutes(sesion.tiempoHorasExtrasDiurnas)) },
        extraNocturna: { minutos: calculatedMinutes(sesion.tiempoHorasExtrasNocturnas), formato: format(calculatedMinutes(sesion.tiempoHorasExtrasNocturnas)) },
        dominicalFestiva: {
          minutos: totalMinutos == null ? null : esDescanso ? (sesion.tiempoHorasExtrasDominicales || totalMinutos) : 0,
          formato: totalMinutos == null ? 'Pendiente de revisión' : esDescanso ? format(sesion.tiempoHorasExtrasDominicales || totalMinutos) : '00:00'
        },
        recargos: {
          totalRecargos: { minutos: calculatedMinutes(recargoTotal), formato: format(calculatedMinutes(recargoTotal)) }
        }
      },
      metadata: {
        esDomingoOFestivo: Boolean(esDescanso),
        calculoVersion: sesion.metadata?.calculoVersion || null
      }
    };
  }
}

module.exports = TimeCalculationService;
