/**
 * WorkSession
 * Sesiones de trabajo con calculo laboral colombiano.
 */

const mongoose = require('mongoose');

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
  horasOrdinarias: {
    diurnas: { type: Number, default: null },
    nocturnas: { type: Number, default: null },
    total: { type: Number, default: null }
  },
  horasExtras: {
    diurnas: { type: Number, default: null },
    nocturnas: { type: Number, default: null },
    total: { type: Number, default: null }
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
workSessionSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { estado: 'activa' } }
);

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
