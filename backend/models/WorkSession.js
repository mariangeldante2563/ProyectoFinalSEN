/**
 * WorkSession
 * Sesiones de trabajo con calculo laboral colombiano.
 */

const mongoose = require('mongoose');
const ColombianLaborLawService = require('../services/ColombianLaborLawService');

const workSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Se requiere ID de usuario']
  },
  fecha: {
    type: String,
    required: [true, 'La fecha es requerida'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha invalido (YYYY-MM-DD)']
  },
  horaEntrada: {
    type: String,
    required: [true, 'La hora de entrada es requerida'],
    match: [/^\d{2}:\d{2}:\d{2}$/, 'Formato de hora invalido (HH:MM:SS)']
  },
  timestampEntrada: {
    type: Date,
    required: [true, 'El timestamp de entrada es requerido']
  },
  horaSalida: {
    type: String,
    match: [/^\d{2}:\d{2}:\d{2}$/, 'Formato de hora invalido (HH:MM:SS)'],
    default: null
  },
  timestampSalida: {
    type: Date,
    default: null
  },
  ubicacionEntrada: {
    type: String,
    default: null
  },
  ubicacionSalida: {
    type: String,
    default: null
  },
  tiempoLaboradoMinutos: {
    type: Number,
    default: null,
    min: [0, 'El tiempo laborado no puede ser negativo']
  },
  tiempoLaboradoHoras: {
    type: String,
    default: null
  },
  estado: {
    type: String,
    enum: {
      values: ['activa', 'completada', 'incompleta'],
      message: '{VALUE} no es un estado valido'
    },
    default: 'activa'
  },
  tiempoJornadaOrdinariaDiurna: {
    type: Number,
    default: 0,
    min: 0
  },
  tiempoJornadaOrdinariaNocturna: {
    type: Number,
    default: 0,
    min: 0
  },
  // Campo conservado por compatibilidad con datos/versiones anteriores.
  tiempoJornadaOrdinariaNoturna: {
    type: Number,
    default: 0,
    min: 0
  },
  tiempoHorasExtrasDiurnas: {
    type: Number,
    default: 0,
    min: 0
  },
  tiempoHorasExtrasNocturnas: {
    type: Number,
    default: 0,
    min: 0
  },
  tiempoHorasExtrasDominicales: {
    type: Number,
    default: 0,
    min: 0
  },
  recargos: {
    recargoNocturno: { type: Number, default: 0, min: 0 },
    recargoHorasExtrasDiurnas: { type: Number, default: 0, min: 0 },
    recargoHorasExtrasNocturnas: { type: Number, default: 0, min: 0 },
    recargoDominicalesFestivos: { type: Number, default: 0, min: 0 },
    recargoTotal: { type: Number, default: 0, min: 0 }
  },
  observaciones: {
    type: String,
    trim: true,
    maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres']
  },
  metadata: {
    entradaEstimada: { type: Boolean, default: false },
    cierreAutomatico: { type: Boolean, default: false },
    minutosOrdinariosPrevios: { type: Number, default: 0 },
    calculoVersion: { type: String, default: 'co-ley-2466-2025' },
    observaciones: String
  },
  esFinDeSemana: {
    type: Boolean,
    default: false
  },
  esFestivo: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

workSessionSchema.index({ userId: 1, fecha: 1 });
workSessionSchema.index({ userId: 1, timestampEntrada: 1 });
workSessionSchema.index({ estado: 1 });

workSessionSchema.pre('save', function(next) {
  if (this.timestampSalida) {
    this.aplicarCalculoLaboral(this.metadata?.minutosOrdinariosPrevios || 0);
    this.estado = 'completada';
  }
  next();
});

workSessionSchema.methods.aplicarCalculoLaboral = function(minutosOrdinariosPrevios = 0) {
  if (!this.timestampEntrada || !this.timestampSalida) return null;

  const entrada = new Date(this.timestampEntrada);
  const salida = new Date(this.timestampSalida);
  const minutos = Math.max(0, Math.floor((salida - entrada) / 60000));
  const calculo = ColombianLaborLawService.calcularRecargosConAcumulado(
    entrada,
    salida,
    minutosOrdinariosPrevios,
    minutos
  );

  this.tiempoLaboradoMinutos = calculo.tiempoTotal.minutos;
  this.tiempoLaboradoHoras = calculo.tiempoTotal.formato;
  this.esFinDeSemana = ColombianLaborLawService.esDomingo(entrada);
  this.esFestivo = ColombianLaborLawService.esFestivo(entrada);

  this.tiempoJornadaOrdinariaDiurna = calculo.horasOrdinarias.diurnas.minutos;
  this.tiempoJornadaOrdinariaNocturna = calculo.horasOrdinarias.nocturnas.minutos;
  this.tiempoJornadaOrdinariaNoturna = calculo.horasOrdinarias.nocturnas.minutos;
  this.tiempoHorasExtrasDiurnas = calculo.horasExtras.diurnas.minutos;
  this.tiempoHorasExtrasNocturnas = calculo.horasExtras.nocturnas.minutos;
  // Tiempo realmente clasificado como extra dentro de un dia dominical/festivo
  this.tiempoHorasExtrasDominicales = calculo.metadata.esDomingoOFestivo
    ? calculo.horasExtras.total.minutos
    : 0;

  this.recargos.recargoNocturno = calculo.recargos.nocturnoOrdinario.minutos;
  this.recargos.recargoHorasExtrasDiurnas = calculo.recargos.extraDiurno.minutos;
  this.recargos.recargoHorasExtrasNocturnas = calculo.recargos.extraNocturno.minutos;
  // Agrupa los 4 conceptos dominicales/festivos (ordinario diurno/nocturno y
  // extra diurno/nocturno) en el unico campo existente del esquema.
  this.recargos.recargoDominicalesFestivos =
    calculo.recargos.dominicalDiurno.minutos +
    calculo.recargos.dominicalNocturno.minutos +
    (calculo.recargos.extraDominicalDiurno?.minutos || 0) +
    (calculo.recargos.extraDominicalNocturno?.minutos || 0);

  this.recargos.recargoTotal = calculo.recargos.totalRecargos.minutos;
  this.metadata.minutosOrdinariosPrevios = minutosOrdinariosPrevios;

  return calculo;
};

workSessionSchema.methods.toLaborSummary = function() {
  const entrada = this.timestampEntrada;
  const salida = this.timestampSalida || new Date();
  const minutos = Math.max(0, Math.floor((new Date(salida) - new Date(entrada)) / 60000));
  const calculo = this.timestampSalida
    ? ColombianLaborLawService.calcularRecargosConAcumulado(
        entrada,
        salida,
        this.metadata?.minutosOrdinariosPrevios || 0,
        minutos
      )
    : ColombianLaborLawService.calcularRecargos(entrada, salida, minutos);

  return {
    tiempoTotal: calculo.tiempoTotal,
    horasOrdinarias: calculo.horasOrdinarias,
    horasExtras: calculo.horasExtras,
    recargos: calculo.recargos,
    metadata: calculo.metadata
  };
};

workSessionSchema.statics.obtenerSesionActiva = async function(userId) {
  return this.findOne({
    userId,
    estado: 'activa',
    timestampSalida: null
  }).sort({ timestampEntrada: -1 });
};

workSessionSchema.statics.existeEntradaEnFecha = async function(userId, fecha) {
  return this.findOne({
    userId,
    fecha,
    estado: { $in: ['activa', 'completada'] }
  });
};

const WorkSession = mongoose.model('WorkSession', workSessionSchema);
module.exports = WorkSession;
