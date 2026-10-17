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

dailyStatsSchema.statics.crearOActualizarEstadisticas = async function(userId, fecha) {
  const WorkSession = require('./WorkSession');

  const fechaNormalizada = new Date(fecha);
  fechaNormalizada.setHours(0, 0, 0, 0);
  const fechaFin = new Date(fechaNormalizada);
  fechaFin.setDate(fechaFin.getDate() + 1);
  const fechaStr = fechaNormalizada.toISOString().slice(0, 10);

  const sesiones = await WorkSession.find({
    userId,
    fecha: fechaStr,
    timestampSalida: { $ne: null },
    estado: 'completada'
  }).sort({ timestampEntrada: 1 });

  let minutosOrdinariosAcumulados = 0;
  const calculos = [];
  const sesionesResumen = [];

  for (const sesion of sesiones) {
    const duracion = Math.max(0, Math.floor((sesion.timestampSalida - sesion.timestampEntrada) / 60000));
    const calculo = ColombianLaborLawService.calcularRecargosConAcumulado(
      sesion.timestampEntrada,
      sesion.timestampSalida,
      minutosOrdinariosAcumulados,
      duracion
    );

    minutosOrdinariosAcumulados += calculo.horasOrdinarias.total.minutos;
    calculos.push(calculo);

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
          tiempoLaboradoMinutos: calculo.tiempoTotal.minutos,
          tiempoLaboradoHoras: calculo.tiempoTotal.formato,
          tiempoJornadaOrdinariaDiurna: calculo.horasOrdinarias.diurnas.minutos,
          tiempoJornadaOrdinariaNocturna: calculo.horasOrdinarias.nocturnas.minutos,
          tiempoJornadaOrdinariaNoturna: calculo.horasOrdinarias.nocturnas.minutos,
          tiempoHorasExtrasDiurnas: calculo.horasExtras.diurnas.minutos,
          tiempoHorasExtrasNocturnas: calculo.horasExtras.nocturnas.minutos,
          tiempoHorasExtrasDominicales: esDominical ? calculo.horasExtras.total.minutos : 0,
          'recargos.recargoNocturno': calculo.recargos.nocturnoOrdinario.minutos,
          'recargos.recargoHorasExtrasDiurnas': calculo.recargos.extraDiurno.minutos,
          'recargos.recargoHorasExtrasNocturnas': calculo.recargos.extraNocturno.minutos,
          'recargos.recargoDominicalesFestivos':
            calculo.recargos.dominicalDiurno.minutos +
            calculo.recargos.dominicalNocturno.minutos +
            (calculo.recargos.extraDominicalDiurno?.minutos || 0) +
            (calculo.recargos.extraDominicalNocturno?.minutos || 0),

          'recargos.recargoTotal': calculo.recargos.totalRecargos.minutos,
          'metadata.minutosOrdinariosPrevios': calculo.metadata.minutosOrdinariosPrevios
        }
      }
    );
  }

  const total = ColombianLaborLawService.sumarCalculos(calculos);
  // El esquema de DailyStats no define campos separados para extras dominicales;
  // se consolidan dentro de las categorias dominicales para que la suma del
  // desglose coincida con totalRecargos (que ya las incluye).
  total.recargos.dominicalDiurno.minutos += total.recargos.extraDominicalDiurno?.minutos || 0;
  total.recargos.dominicalNocturno.minutos += total.recargos.extraDominicalNocturno?.minutos || 0;
  const stats = await this.findOneAndUpdate(

    { userId, fecha: fechaNormalizada },
    {
      $set: {
        userId,
        fecha: fechaNormalizada,
        esDomingoOFestivo: ColombianLaborLawService.esDomingoOFestivo(fechaNormalizada),
        tiempoTotal: total.tiempoTotal,
        horasOrdinarias: total.horasOrdinarias,
        horasExtras: total.horasExtras,
        recargos: total.recargos,
        sesiones: sesionesResumen,
        'estadisticas.numeroSesiones': sesionesResumen.length,
        'estadisticas.primeraEntrada': sesiones[0]?.timestampEntrada || null,
        'estadisticas.ultimaSalida': sesiones[sesiones.length - 1]?.timestampSalida || null,
        'estadisticas.tiempoPausa': calcularPausas(sesiones),
        'estadisticas.cumplimientoJornada.cumplioOchoHoras': total.tiempoTotal.minutos >= 480,
        'estadisticas.cumplimientoJornada.excedioJornada': total.tiempoTotal.minutos > 480,
        'estadisticas.cumplimientoJornada.porcentajeCumplimiento': Math.round((total.tiempoTotal.minutos / 480) * 100),
        'metadata.ultimaActualizacion': new Date(),
        'metadata.origenDatos': 'automatico'
      },
      $inc: { 'metadata.numeroActualizaciones': 1 }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Evita que fechaFin quede como variable no usada tras optimizaciones futuras.
  void fechaFin;
  return stats;
};

dailyStatsSchema.statics.obtenerEstadisticasSemanales = async function(userId) {
  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay());
  inicioSemana.setHours(0, 0, 0, 0);

  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  finSemana.setHours(23, 59, 59, 999);

  const estadisticasSemana = await this.find({
    userId,
    fecha: { $gte: inicioSemana, $lte: finSemana }
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
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  finMes.setHours(23, 59, 59, 999);

  const estadisticasMes = await this.find({
    userId,
    fecha: { $gte: inicioMes, $lte: finMes }
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
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - ultimosDias);
  fechaInicio.setHours(0, 0, 0, 0);

  const estadisticas = await this.find({
    userId,
    fecha: { $gte: fechaInicio }
  }).sort({ fecha: 1 });

  const labels = [];
  const horasTrabajadas = [];
  const horasExtras = [];
  const recargos = [];

  for (let i = 0; i < ultimosDias; i++) {
    const fecha = new Date(fechaInicio);
    fecha.setDate(fechaInicio.getDate() + i);
    labels.push(fecha.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }));

    const stat = estadisticas.find(item => item.fecha.toDateString() === fecha.toDateString());
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
  doc.horasOrdinarias.total.minutos =
    doc.horasOrdinarias.diurnas.minutos + doc.horasOrdinarias.nocturnas.minutos;
  doc.horasExtras.total.minutos =
    doc.horasExtras.diurnas.minutos + doc.horasExtras.nocturnas.minutos;

  doc.horasOrdinarias.diurnas.formato = ColombianLaborLawService.formatearTiempo(doc.horasOrdinarias.diurnas.minutos);
  doc.horasOrdinarias.nocturnas.formato = ColombianLaborLawService.formatearTiempo(doc.horasOrdinarias.nocturnas.minutos);
  doc.horasOrdinarias.total.formato = ColombianLaborLawService.formatearTiempo(doc.horasOrdinarias.total.minutos);
  doc.horasExtras.diurnas.formato = ColombianLaborLawService.formatearTiempo(doc.horasExtras.diurnas.minutos);
  doc.horasExtras.nocturnas.formato = ColombianLaborLawService.formatearTiempo(doc.horasExtras.nocturnas.minutos);
  doc.horasExtras.total.formato = ColombianLaborLawService.formatearTiempo(doc.horasExtras.total.minutos);

  ['nocturnoOrdinario', 'extraDiurno', 'extraNocturno', 'dominicalDiurno', 'dominicalNocturno'].forEach(tipo => {
    doc.recargos[tipo].formato = ColombianLaborLawService.formatearTiempo(doc.recargos[tipo].minutos);
  });

  doc.recargos.totalRecargos.minutos =
    doc.recargos.nocturnoOrdinario.minutos +
    doc.recargos.extraDiurno.minutos +
    doc.recargos.extraNocturno.minutos +
    doc.recargos.dominicalDiurno.minutos +
    doc.recargos.dominicalNocturno.minutos;
  doc.recargos.totalRecargos.formato = ColombianLaborLawService.formatearTiempo(doc.recargos.totalRecargos.minutos);
  doc.estadisticas.tiempoPausa.formato = ColombianLaborLawService.formatearTiempo(doc.estadisticas.tiempoPausa.minutos);
}

module.exports = mongoose.model('DailyStats', dailyStatsSchema);
