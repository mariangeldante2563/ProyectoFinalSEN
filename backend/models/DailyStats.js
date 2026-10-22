const mongoose = require('mongoose');
const ColombianLaborLawService = require('../services/ColombianLaborLawService');

const timeField = {
  minutos: { type: Number, default: 0, min: 0 },
  formato: { type: String, default: '00:00' }
};

const dailyStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fecha: {
    type: Date,
    required: true,
    index: true
  },
  esDomingoOFestivo: {
    type: Boolean,
    default: false
  },
  tiempoTotal: timeField,
  horasOrdinarias: {
    diurnas: timeField,
    nocturnas: timeField,
    total: timeField
  },
  horasExtras: {
    diurnas: timeField,
    nocturnas: timeField,
    total: timeField
  },
  recargos: {
    nocturnoOrdinario: {
      minutos: { type: Number, default: 0, min: 0 },
      formato: { type: String, default: '00:00' },
      porcentaje: { type: Number, default: 35 }
    },
    extraDiurno: {
      minutos: { type: Number, default: 0, min: 0 },
      formato: { type: String, default: '00:00' },
      porcentaje: { type: Number, default: 25 }
    },
    extraNocturno: {
      minutos: { type: Number, default: 0, min: 0 },
      formato: { type: String, default: '00:00' },
      porcentaje: { type: Number, default: 75 }
    },
    dominicalDiurno: {
      minutos: { type: Number, default: 0, min: 0 },
      formato: { type: String, default: '00:00' },
      porcentaje: { type: Number, default: 100 }
    },
    dominicalNocturno: {
      minutos: { type: Number, default: 0, min: 0 },
      formato: { type: String, default: '00:00' },
      porcentaje: { type: Number, default: 135 }
    },

    totalRecargos: timeField
  },
  sesiones: [{
    entrada: Date,
    salida: Date,
    duracionMinutos: Number,
    tipo: {
      type: String,
      enum: ['ordinaria', 'extra', 'nocturna', 'dominical', 'mixta'],
      default: 'ordinaria'
    }
  }],
  estadisticas: {
    numeroSesiones: { type: Number, default: 0, min: 0 },
    primeraEntrada: Date,
    ultimaSalida: Date,
    tiempoPausa: timeField,
    cumplimientoJornada: {
      cumplioOchoHoras: { type: Boolean, default: false },
      excedioJornada: { type: Boolean, default: false },
      porcentajeCumplimiento: { type: Number, default: 0, min: 0 }
    }
  },
  metadata: {
    ultimaActualizacion: { type: Date, default: Date.now },
    numeroActualizaciones: { type: Number, default: 1, min: 1 },
    origenDatos: {
      type: String,
      enum: ['manual', 'automatico', 'importado', 'correccion'],
      default: 'automatico'
    },
    observaciones: String
  }
}, {
  timestamps: true,
  versionKey: false
});

dailyStatsSchema.index({ userId: 1, fecha: 1 }, { unique: true });
dailyStatsSchema.index({ userId: 1, fecha: -1 });
dailyStatsSchema.index({ fecha: -1, 'tiempoTotal.minutos': -1 });

dailyStatsSchema.statics.formatearTiempo = function(minutos) {
  return ColombianLaborLawService.formatearTiempo(minutos);
};

dailyStatsSchema.statics.crearOActualizarEstadisticas = async function(userId, fecha, options = {}) {
  const WorkSession = require('./WorkSession');
  const User = require('./User');
  const TimeCalculationService = require('../services/TimeCalculationService');
  const fechaStr = ColombianLaborLawService.obtenerFechaLocal(fecha);
  const fechaNormalizada = new Date(`${fechaStr}T00:00:00.000Z`);

  const sesiones = await WorkSession.find({
    userId,
    fecha: fechaStr,
    timestampSalida: { $ne: null },
    estado: 'completada'
  }).sort({ timestampEntrada: 1 }).session(options.session || null);
  const user = await User.findById(userId).session(options.session || null);

  const total = {
    tiempo: 0, ordinariaDiurna: 0, ordinariaNocturna: 0, extraDiurna: 0, extraNocturna: 0,
    nocturna: 0, dominicalDiurna: 0, dominicalNocturna: 0
  };
  const sesionesResumen = [];
  const initialRules = ColombianLaborLawService.obtenerReglasVigentes(new Date(`${fechaStr}T12:00:00.000Z`));
  let percentages = {
    nocturnoOrdinario: initialRules.recargoNocturnoOrdinario,
    extraDiurno: initialRules.recargoExtraDiurna,
    extraNocturno: initialRules.recargoExtraNocturna,
    descanso: initialRules.recargoDescanso,
    descansoNocturno: initialRules.recargoDescanso + initialRules.recargoNocturnoOrdinario
  };

  for (const sesion of sesiones) {
    const horario = TimeCalculationService.obtenerHorarioVigente(user, sesion.timestampEntrada);
    const calculo = TimeCalculationService.calcularSesion({
      entrada: sesion.timestampEntrada,
      salida: sesion.timestampSalida,
      horario
    });
    if (calculo.estadoCalculo !== 'calculado') continue;
    percentages = {
      nocturnoOrdinario: calculo.recargos.nocturnoOrdinario.porcentaje,
      extraDiurno: calculo.recargos.extraDiurno.porcentaje,
      extraNocturno: calculo.recargos.extraNocturno.porcentaje,
      descanso: calculo.recargos.dominicalDiurno.porcentaje,
      descansoNocturno: calculo.recargos.dominicalNocturno.porcentaje
    };

    const duracion = calculo.tiempoTotal.minutos;
    total.tiempo += duracion;
    total.ordinariaDiurna += calculo.horasOrdinarias.diurnas.minutos;
    total.ordinariaNocturna += calculo.horasOrdinarias.nocturnas.minutos;
    total.extraDiurna += calculo.horasExtras.diurnas.minutos;
    total.extraNocturna += calculo.horasExtras.nocturnas.minutos;
    total.nocturna += calculo.recargos.nocturnoOrdinario.minutos;
    total.dominicalDiurna += calculo.recargos.dominicalDiurno.minutos;
    total.dominicalNocturna += calculo.recargos.dominicalNocturno.minutos;
    const esDominical = calculo.metadata.esDomingoOFestivo;
    const tieneExtras = calculo.horasExtras.total.minutos > 0;
    const tieneNocturnas = calculo.horasOrdinarias.nocturnas.minutos > 0 || calculo.horasExtras.nocturnas.minutos > 0;
    const tipo = esDominical ? 'dominical' : tieneExtras && tieneNocturnas ? 'mixta' : tieneExtras ? 'extra' : tieneNocturnas ? 'nocturna' : 'ordinaria';

    sesionesResumen.push({
      entrada: sesion.timestampEntrada,
      salida: sesion.timestampSalida,
      duracionMinutos: duracion,
      tipo
    });

    await WorkSession.updateOne(
      { _id: sesion._id },
      {
        $set: {
          tiempoLaboradoMinutos: duracion,
          tiempoLaboradoHoras: calculo.tiempoTotal.formato,
          'horasOrdinarias.diurnas': calculo.horasOrdinarias.diurnas.minutos,
          'horasOrdinarias.nocturnas': calculo.horasOrdinarias.nocturnas.minutos,
          'horasOrdinarias.total': calculo.horasOrdinarias.total.minutos,
          'horasExtras.diurnas': calculo.horasExtras.diurnas.minutos,
          'horasExtras.nocturnas': calculo.horasExtras.nocturnas.minutos,
          'horasExtras.total': calculo.horasExtras.total.minutos,
          tiempoJornadaOrdinariaDiurna: calculo.horasOrdinarias.diurnas.minutos,
          tiempoJornadaOrdinariaNocturna: calculo.horasOrdinarias.nocturnas.minutos,
          tiempoJornadaOrdinariaNoturna: calculo.horasOrdinarias.nocturnas.minutos,
          tiempoHorasExtrasDiurnas: calculo.horasExtras.diurnas.minutos,
          tiempoHorasExtrasNocturnas: calculo.horasExtras.nocturnas.minutos,
          tiempoHorasExtrasDominicales: esDominical ? calculo.horasExtras.total.minutos : 0,
          'recargos.recargoNocturno': calculo.recargos.nocturnoOrdinario.minutos,
          'recargos.recargoHorasExtrasDiurnas': calculo.recargos.extraDiurno.minutos,
          'recargos.recargoHorasExtrasNocturnas': calculo.recargos.extraNocturno.minutos,
          'recargos.recargoDominicalesFestivos': calculo.recargos.dominicalDiurno.minutos + calculo.recargos.dominicalNocturno.minutos,
          'recargos.recargoTotal': calculo.recargos.totalRecargos.minutos,
          'metadata.minutosOrdinariosPrevios': calculo.metadata.minutosSemanalesPrevios,
          'metadata.calculoVersion': calculo.metadata.calculoVersion
        }
      },
      { session: options.session }
    );
  }

  const format = minutes => ColombianLaborLawService.formatearTiempo(minutes);
  const value = minutes => ({ minutos: minutes, formato: format(minutes) });
  const ordinarias = total.ordinariaDiurna + total.ordinariaNocturna;
  const extras = total.extraDiurna + total.extraNocturna;
  const recargos = total.nocturna + total.extraDiurna + total.extraNocturna +
    total.dominicalDiurna + total.dominicalNocturna;
  const primeraEntrada = sesionesResumen[0]?.entrada || null;
  const ultimaSalida = sesionesResumen[sesionesResumen.length - 1]?.salida || null;
  const stats = await this.findOneAndUpdate(
    { userId, fecha: fechaNormalizada },
    {
      $set: {
        userId,
        fecha: fechaNormalizada,
        esDomingoOFestivo: ColombianLaborLawService.esFestivoColombiano(new Date(`${fechaStr}T12:00:00.000Z`)) ||
          ColombianLaborLawService.obtenerDiaISOLocal(new Date(`${fechaStr}T12:00:00.000Z`)) === 7,
        tiempoTotal: value(total.tiempo),
        horasOrdinarias: {
          diurnas: value(total.ordinariaDiurna),
          nocturnas: value(total.ordinariaNocturna),
          total: value(ordinarias)
        },
        horasExtras: {
          diurnas: value(total.extraDiurna),
          nocturnas: value(total.extraNocturna),
          total: value(extras)
        },
        recargos: {
          nocturnoOrdinario: { ...value(total.nocturna), porcentaje: percentages.nocturnoOrdinario },
          extraDiurno: { ...value(total.extraDiurna), porcentaje: percentages.extraDiurno },
          extraNocturno: { ...value(total.extraNocturna), porcentaje: percentages.extraNocturno },
          dominicalDiurno: { ...value(total.dominicalDiurna), porcentaje: percentages.descanso },
          dominicalNocturno: { ...value(total.dominicalNocturna), porcentaje: percentages.descansoNocturno },
          totalRecargos: value(recargos)
        },
        sesiones: sesionesResumen,
        'estadisticas.numeroSesiones': sesionesResumen.length,
        'estadisticas.primeraEntrada': primeraEntrada,
        'estadisticas.ultimaSalida': ultimaSalida,
        'estadisticas.tiempoPausa': calcularPausas(sesiones),
        'estadisticas.cumplimientoJornada.cumplioOchoHoras': total.tiempo >= 480,
        'estadisticas.cumplimientoJornada.excedioJornada': extras > 0,
        'estadisticas.cumplimientoJornada.porcentajeCumplimiento': Math.round((total.tiempo / 480) * 100),
        'metadata.ultimaActualizacion': new Date(),
        'metadata.origenDatos': 'automatico'
      },
      $inc: { 'metadata.numeroActualizaciones': 1 }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, session: options.session }
  );

  return stats;
};

dailyStatsSchema.statics.obtenerEstadisticasSemanales = async function(userId) {
  const hoy = new Date();
  const todayKey = ColombianLaborLawService.obtenerFechaLocal(hoy);
  const inicioSemana = new Date(`${todayKey}T00:00:00.000Z`);
  const day = ColombianLaborLawService.obtenerDiaISOLocal(hoy);
  inicioSemana.setUTCDate(inicioSemana.getUTCDate() - day + 1);
  const finSemana = new Date(inicioSemana);
  finSemana.setUTCDate(inicioSemana.getUTCDate() + 7);

  const estadisticasSemana = await this.find({
    userId,
    fecha: { $gte: inicioSemana, $lt: finSemana }
  }).sort({ fecha: 1 });

  let tiempoTotalSemana = 0;
  let diasTrabajados = 0;
  let horasExtrasSemana = 0;

  estadisticasSemana.forEach(dia => {
    if (dia.tiempoTotal.minutos > 0) {
      tiempoTotalSemana += dia.tiempoTotal.minutos;
      diasTrabajados++;
      horasExtrasSemana += dia.horasExtras.total.minutos;
    }
  });

  const limiteSemanal = ColombianLaborLawService.obtenerMaximaSemanal(hoy);
  return {
    diasTrabajados,
    tiempoTotal: {
      minutos: tiempoTotalSemana,
      formato: this.formatearTiempo(tiempoTotalSemana),
      horas: Math.round((tiempoTotalSemana / 60) * 100) / 100
    },
    horasExtras: {
      minutos: horasExtrasSemana,
      formato: this.formatearTiempo(horasExtrasSemana)
    },
    promedioHorasDiarias: diasTrabajados > 0
      ? Math.round(((tiempoTotalSemana / 60) / diasTrabajados) * 100) / 100
      : 0,
    limiteSemanal,
    cumpleLimite44Horas: (tiempoTotalSemana / 60) <= limiteSemanal,
    cumpleLimiteSemanal: (tiempoTotalSemana / 60) <= limiteSemanal,
    estadisticasDiarias: estadisticasSemana
  };
};

dailyStatsSchema.statics.obtenerEstadisticasMensuales = async function(userId) {
  const hoy = new Date();
  const [year, month] = ColombianLaborLawService.obtenerFechaLocal(hoy).split('-').map(Number);
  const inicioMes = new Date(Date.UTC(year, month - 1, 1));
  const finMes = new Date(Date.UTC(year, month, 1));

  const estadisticasMes = await this.find({
    userId,
    fecha: { $gte: inicioMes, $lt: finMes }
  }).sort({ fecha: 1 });

  let tiempoTotalMes = 0;
  let diasTrabajados = 0;
  let horasExtrasMes = 0;
  const estadisticasPorDia = [];

  estadisticasMes.forEach(dia => {
    if (dia.tiempoTotal.minutos > 0) {
      tiempoTotalMes += dia.tiempoTotal.minutos;
      diasTrabajados++;
      horasExtrasMes += dia.horasExtras.total.minutos;
    }

    estadisticasPorDia.push({
      fecha: dia.fecha,
      horas: Math.round((dia.tiempoTotal.minutos / 60) * 100) / 100,
      horasExtras: Math.round((dia.horasExtras.total.minutos / 60) * 100) / 100
    });
  });

  return {
    diasTrabajados,
    tiempoTotal: {
      minutos: tiempoTotalMes,
      formato: this.formatearTiempo(tiempoTotalMes),
      horas: Math.round((tiempoTotalMes / 60) * 100) / 100
    },
    horasExtras: {
      minutos: horasExtrasMes,
      formato: this.formatearTiempo(horasExtrasMes)
    },
    promedioHorasDiarias: diasTrabajados > 0
      ? Math.round(((tiempoTotalMes / 60) / diasTrabajados) * 100) / 100
      : 0,
    estadisticasPorDia
  };
};

dailyStatsSchema.statics.obtenerDatosGraficas = async function(userId, ultimosDias = 7) {
  const dateKey = ColombianLaborLawService.obtenerFechaLocal(new Date());
  const fechaFin = new Date(`${dateKey}T00:00:00.000Z`);
  const fechaInicio = new Date(fechaFin);
  fechaInicio.setUTCDate(fechaInicio.getUTCDate() - ultimosDias + 1);

  const estadisticas = await this.find({
    userId,
    fecha: { $gte: fechaInicio, $lt: new Date(fechaFin.getTime() + 86400000) }
  }).sort({ fecha: 1 });
  const byDate = new Map(estadisticas.map(item => [item.fecha.toISOString().slice(0, 10), item]));

  const labels = [];
  const horasTrabajadas = [];
  const horasExtras = [];
  const recargos = [];

  for (let i = 0; i < ultimosDias; i++) {
    const fecha = new Date(fechaInicio);
    fecha.setUTCDate(fechaInicio.getUTCDate() + i);
    labels.push(fecha.toLocaleDateString('es-CO', { timeZone: 'UTC', weekday: 'short', day: 'numeric' }));

    const stat = byDate.get(fecha.toISOString().slice(0, 10));
    horasTrabajadas.push(stat ? Math.round((stat.tiempoTotal.minutos / 60) * 100) / 100 : 0);
    horasExtras.push(stat ? Math.round((stat.horasExtras.total.minutos / 60) * 100) / 100 : 0);
    recargos.push(stat ? Math.round((stat.recargos.totalRecargos.minutos / 60) * 100) / 100 : 0);
  }

  return {
    labels,
    datasets: { horasTrabajadas, horasExtras, recargos }
  };
};

dailyStatsSchema.pre('save', function(next) {
  normalizarTiempos(this);
  next();
});

dailyStatsSchema.set('toJSON', { virtuals: true });
dailyStatsSchema.set('toObject', { virtuals: true });

dailyStatsSchema.virtual('tiempoTotalHoras').get(function() {
  return Math.round((this.tiempoTotal.minutos / 60) * 100) / 100;
});

dailyStatsSchema.virtual('porcentajeJornada').get(function() {
  return Math.round((this.tiempoTotalHoras / 8) * 100);
});

dailyStatsSchema.virtual('diaCompleto').get(function() {
  return this.tiempoTotalHoras >= 8;
});

function calcularPausas(sesiones) {
  let minutos = 0;
  for (let i = 1; i < sesiones.length; i++) {
    const pausa = Math.floor((sesiones[i].timestampEntrada - sesiones[i - 1].timestampSalida) / 60000);
    if (pausa > 0) minutos += pausa;
  }

  return {
    minutos,
    formato: ColombianLaborLawService.formatearTiempo(minutos)
  };
}

function normalizarTiempos(doc) {
  doc.tiempoTotal.formato = ColombianLaborLawService.formatearTiempo(doc.tiempoTotal.minutos);
  doc.horasOrdinarias.diurnas.formato = ColombianLaborLawService.formatearTiempo(doc.horasOrdinarias.diurnas.minutos);
  doc.horasOrdinarias.nocturnas.formato = ColombianLaborLawService.formatearTiempo(doc.horasOrdinarias.nocturnas.minutos);
  doc.horasOrdinarias.total.formato = ColombianLaborLawService.formatearTiempo(doc.horasOrdinarias.total.minutos);
  doc.horasExtras.diurnas.formato = ColombianLaborLawService.formatearTiempo(doc.horasExtras.diurnas.minutos);
  doc.horasExtras.nocturnas.formato = ColombianLaborLawService.formatearTiempo(doc.horasExtras.nocturnas.minutos);
  doc.horasExtras.total.formato = ColombianLaborLawService.formatearTiempo(doc.horasExtras.total.minutos);

  ['nocturnoOrdinario', 'extraDiurno', 'extraNocturno', 'dominicalDiurno', 'dominicalNocturno'].forEach(tipo => {
    doc.recargos[tipo].formato = ColombianLaborLawService.formatearTiempo(doc.recargos[tipo].minutos);
  });

  doc.recargos.totalRecargos.formato = ColombianLaborLawService.formatearTiempo(doc.recargos.totalRecargos.minutos);
  doc.estadisticas.tiempoPausa.formato = ColombianLaborLawService.formatearTiempo(doc.estadisticas.tiempoPausa.minutos);
}

module.exports = mongoose.model('DailyStats', dailyStatsSchema);
