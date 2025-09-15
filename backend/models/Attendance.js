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
    default: Date.now
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
attendanceSchema.index({ userId: 1, type: 1, date: 1 });

// Middleware para formatear fecha y hora antes de guardar
attendanceSchema.pre('save', function(next) {
  // Solo actualizar si timestamp ha sido modificado
  if (this.isModified('timestamp') || !this.date || !this.time) {
    const datetime = new Date(this.timestamp);
    
    // Formatear fecha en formato español
    this.date = datetime.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Formatear hora en formato español
    this.time = datetime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  next();
});

// Método estático para verificar si ya existe un registro del mismo tipo para el usuario en una fecha
attendanceSchema.statics.existsForUserAndDate = async function(userId, type, date) {
  // Crear fecha de inicio y fin para el día específico
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Buscar registro existente
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