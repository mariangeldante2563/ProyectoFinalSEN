const WorkSession = require('../models/WorkSession');
const DailyStats = require('../models/DailyStats');
const Attendance = require('../models/Attendance');
const ColombianLaborLawService = require('./ColombianLaborLawService');

class TimeCalculationService {
  static async procesarRegistroAsistencia(userId, type, timestamp = new Date(), location = null) {
    if (!['entrada', 'salida'].includes(type)) {
      throw new Error('Tipo de registro invalido. Debe ser entrada o salida');
    }

    const marca = new Date(timestamp);
    const attendance = new Attendance({
      userId,
      type,
      timestamp: marca,
      // Se envian explicitamente 'date' y 'time' (refuerzo defensivo) para no
      // depender unicamente del hook del modelo al satisfacer los campos requeridos.
      date: marca.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: marca.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    await attendance.save();


    let workSession = await WorkSession.obtenerSesionActiva(userId);
    const resultado = {
      registro: attendance,
      sesion: null,
      estadisticas: null,
      accion: '',
      mensaje: ''
    };

    if (type === 'entrada') {
      if (workSession) {
        const salidaAnterior = this._calcularSalidaAutomatica(workSession.timestampEntrada, marca);
        workSession.horaSalida = this.formatearHora(salidaAnterior);
        workSession.timestampSalida = salidaAnterior;
        workSession.ubicacionSalida = location;
        workSession.metadata.cierreAutomatico = true;
        workSession.metadata.observaciones = 'Sesion cerrada automaticamente por nueva entrada';
        await workSession.save();
        await DailyStats.crearOActualizarEstadisticas(userId, this._inicioDia(workSession.timestampEntrada));
        resultado.mensaje += 'Sesion anterior cerrada automaticamente. ';
      }

      workSession = new WorkSession({
        userId,
        fecha: this.formatearFecha(marca),
        horaEntrada: this.formatearHora(marca),
        timestampEntrada: marca,
        ubicacionEntrada: location,
        estado: 'activa'
      });
      await workSession.save();

      resultado.sesion = workSession;
      resultado.accion = 'entrada_registrada';
      resultado.mensaje += 'Nueva sesion de trabajo iniciada.';
      return resultado;
    }

    if (!workSession) {
      const entradaEstimada = new Date(marca.getTime() - (8 * 60 * 60 * 1000));
      workSession = new WorkSession({
        userId,
        fecha: this.formatearFecha(entradaEstimada),
        horaEntrada: this.formatearHora(entradaEstimada),
        timestampEntrada: entradaEstimada,
        horaSalida: this.formatearHora(marca),
        timestampSalida: marca,
        ubicacionSalida: location,
        estado: 'completada',
        metadata: {
          entradaEstimada: true,
          observaciones: 'Entrada estimada por salida sin entrada previa'
        }
      });

      resultado.accion = 'salida_con_entrada_estimada';
      resultado.mensaje = 'Salida registrada con entrada estimada.';
    } else {
      if (marca <= workSession.timestampEntrada) {
        throw new Error('La salida debe ser posterior a la entrada registrada');
      }

      workSession.horaSalida = this.formatearHora(marca);
      workSession.timestampSalida = marca;
      workSession.ubicacionSalida = location;
      workSession.estado = 'completada';
      resultado.accion = 'salida_registrada';
      resultado.mensaje = 'Sesion de trabajo completada exitosamente.';
    }

    await workSession.save();
    const estadisticas = await DailyStats.crearOActualizarEstadisticas(
      userId,
      this._inicioDia(workSession.timestampEntrada)
    );

    resultado.sesion = workSession;
    resultado.estadisticas = estadisticas;
    return resultado;
  }

  static async obtenerSesionActiva(userId) {
    const sesionActiva = await WorkSession.obtenerSesionActiva(userId);
    if (!sesionActiva) return null;

    const ahora = new Date();
    const duracionMinutos = Math.max(0, Math.floor((ahora - sesionActiva.timestampEntrada) / 60000));
    const calculo = ColombianLaborLawService.calcularRecargos(
      sesionActiva.timestampEntrada,
      ahora,
      duracionMinutos
    );

    return {
      ...sesionActiva.toObject(),
      duracionActual: {
        minutos: duracionMinutos,
        formato: this.formatearTiempo(duracionMinutos)
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
      await estadisticas.save();
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
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static _calcularSalidaAutomatica(entrada, nuevaEntrada) {
    const sugerida = new Date(new Date(nuevaEntrada).getTime() - 60000);
    if (sugerida > entrada) return sugerida;
    return new Date(new Date(entrada).getTime() + 60000);
  }

  static _mapearFilaLaboral(sesion) {
    const user = sesion.userId || {};
    const resumen = sesion.toLaborSummary();
    const totalMinutos = resumen.tiempoTotal.minutos;

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
        formato: resumen.tiempoTotal.formato,
        decimal: Math.round((totalMinutos / 60) * 100) / 100
      },
      clasificacion: {
        ordinariaDiurna: resumen.horasOrdinarias.diurnas,
        ordinariaNocturna: resumen.horasOrdinarias.nocturnas,
        extraDiurna: resumen.horasExtras.diurnas,
        extraNocturna: resumen.horasExtras.nocturnas,
        dominicalFestiva: {
          minutos: resumen.metadata.esDomingoOFestivo ? totalMinutos : 0,
          formato: resumen.metadata.esDomingoOFestivo ? resumen.tiempoTotal.formato : '00:00'
        },
        recargos: resumen.recargos
      },
      metadata: {
        esDomingoOFestivo: resumen.metadata.esDomingoOFestivo,
        jornadaNocturna: '19:00-06:00',
        jornadaDiurna: '06:00-19:00'
      }
    };
  }
}

module.exports = TimeCalculationService;
