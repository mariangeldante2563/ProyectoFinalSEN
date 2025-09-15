/**
 * IN OUT MANAGER - MODELO DE AUDITORÍA
 * @version 1.0.0
 * @description Esquema y modelo para registro de auditoría
 */

const mongoose = require('mongoose');

// Definir el esquema de auditoría
const auditSchema = new mongoose.Schema({
  // Usuario que realizó la acción
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Nombre completo del usuario para referencia rápida
  nombreUsuario: {
    type: String,
    required: true
  },
  // Tipo de usuario que realizó la acción
  tipoUsuario: {
    type: String,
    enum: ['empleado', 'administrador'],
    required: true
  },
  // Entidad afectada (usuario, asistencia, etc.)
  entidad: {
    type: String,
    required: true
  },
  // ID del documento afectado
  entidadId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // Tipo de acción realizada
  accion: {
    type: String,
    enum: ['crear', 'actualizar', 'eliminar', 'restaurar', 'cambiar_contraseña', 'cambiar_estado'],
    required: true
  },
  // Detalles adicionales (campos afectados, valores anteriores, etc.)
  detalles: {
    type: Object,
    default: {}
  },
  // Dirección IP desde donde se realizó la acción
  ipAddress: {
    type: String
  },
  // Usuario agente (navegador/dispositivo)
  userAgent: {
    type: String
  },
  // Fecha y hora de la acción
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Crear índices para búsqueda eficiente
auditSchema.index({ usuarioId: 1, timestamp: -1 });
auditSchema.index({ entidad: 1, entidadId: 1 });
auditSchema.index({ accion: 1 });
auditSchema.index({ timestamp: -1 });

// Crear y exportar el modelo
const Audit = mongoose.model('Audit', auditSchema);
module.exports = Audit;