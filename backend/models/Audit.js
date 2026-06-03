<<<<<<< HEAD
// Modelo de auditoría del sistema

const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
=======
/**
 * IN OUT MANAGER - MODELO DE AUDITORÍA
 * @version 1.0.0
 * @description Esquema y modelo para registro de auditoría
 */

const mongoose = require('mongoose');

// Definir el esquema de auditoría
const auditSchema = new mongoose.Schema({
  // Usuario que realizó la acción
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
<<<<<<< HEAD
=======
  // Nombre completo del usuario para referencia rápida
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  nombreUsuario: {
    type: String,
    required: true
  },
<<<<<<< HEAD
=======
  // Tipo de usuario que realizó la acción
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  tipoUsuario: {
    type: String,
    enum: ['empleado', 'administrador'],
    required: true
  },
<<<<<<< HEAD
=======
  // Entidad afectada (usuario, asistencia, etc.)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  entidad: {
    type: String,
    required: true
  },
<<<<<<< HEAD
=======
  // ID del documento afectado
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  entidadId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
<<<<<<< HEAD
=======
  // Tipo de acción realizada
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  accion: {
    type: String,
    enum: ['crear', 'actualizar', 'eliminar', 'restaurar', 'cambiar_contraseña', 'cambiar_estado'],
    required: true
  },
<<<<<<< HEAD
=======
  // Detalles adicionales (campos afectados, valores anteriores, etc.)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  detalles: {
    type: Object,
    default: {}
  },
  // Dirección IP desde donde se realizó la acción
  ipAddress: {
    type: String
  },
<<<<<<< HEAD
  userAgent: {
    type: String
  },
=======
  // Usuario agente (navegador/dispositivo)
  userAgent: {
    type: String
  },
  // Fecha y hora de la acción
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

<<<<<<< HEAD
=======
// Crear índices para búsqueda eficiente
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
auditSchema.index({ usuarioId: 1, timestamp: -1 });
auditSchema.index({ entidad: 1, entidadId: 1 });
auditSchema.index({ accion: 1 });
auditSchema.index({ timestamp: -1 });

<<<<<<< HEAD
=======
// Crear y exportar el modelo
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
const Audit = mongoose.model('Audit', auditSchema);
module.exports = Audit;