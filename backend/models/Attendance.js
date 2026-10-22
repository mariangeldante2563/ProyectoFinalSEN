/**
 * IN OUT MANAGER - MODELO DE ASISTENCIA
 * @version 1.0.0
 * @description Esquema y modelo para registros de asistencia
 */

const mongoose = require('mongoose');

// Definir el esquema de asistencia
const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Se requiere ID de usuario']
  },
  type: {
    type: String,
    enum: {
      values: ['entrada', 'salida'],
      message: '{VALUE} no es un tipo de registro válido'
    },
    required: [true, 'El tipo de registro es requerido']
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    immutable: true
  },
  // Campos adicionales para búsquedas más eficientes
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  // Campo opcional para observaciones
  observaciones: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para mejorar búsquedas
attendanceSchema.index({ userId: 1, timestamp: 1 });
attendanceSchema.index({ date: 1, userId: 1 });

attendanceSchema.pre('validate', function(next) {
  if (this.isModified('timestamp') || !this.date || !this.time) {
    const datetime = new Date(this.timestamp);
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(datetime).reduce((result, part) => {
      result[part.type] = part.value;
      return result;
    }, {});
    this.date = `${parts.year}-${parts.month}-${parts.day}`;
    this.time = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    }).format(datetime);
  }
  next();
});

attendanceSchema.statics.existsForUserAndDate = async function(userId, type, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const existingRecord = await this.findOne({
    userId,
    type,
    timestamp: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
  
  return existingRecord !== null;
};

// Crear y exportar el modelo
const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;