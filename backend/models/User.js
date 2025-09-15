/**
 * IN OUT MANAGER - MODELO DE USUARIO
 * @version 1.0.0
 * @description Esquema y modelo para usuarios de la aplicación
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Definir el esquema de usuario
const userSchema = new mongoose.Schema({
  nombreCompleto: {
    type: String,
    required: [true, 'El nombre completo es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  numeroDocumento: {
    type: String,
    required: [true, 'El número de documento es requerido'],
    unique: true,
    trim: true,
    match: [/^[0-9]{6,12}$/, 'El número de documento debe tener entre 6 y 12 dígitos']
  },
  correoElectronico: {
    type: String,
    required: [true, 'El correo electrónico es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El formato del correo electrónico no es válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false // No incluir en consultas por defecto
  },
  tipoUsuario: {
    type: String,
    enum: {
      values: ['empleado', 'administrador'],
      message: '{VALUE} no es un tipo de usuario válido'
    },
    default: 'empleado'
  },
  edad: {
    type: Number,
    min: [18, 'La edad mínima es 18 años'],
    max: [100, 'La edad máxima es 100 años']
  },
  cargo: {
    type: String,
    trim: true
  },
  horarioAsignado: {
    type: String,
    trim: true
  },
  fotoPerfil: {
    type: String,
    default: 'default-profile.png'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaDesactivacion: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // Crear automáticamente createdAt y updatedAt
  versionKey: false // No incluir __v
});

// Índices para mejorar búsquedas
userSchema.index({ numeroDocumento: 1 });
userSchema.index({ correoElectronico: 1 });

// Middleware para hashear contraseña antes de guardar
userSchema.pre('save', async function(next) {
  // Solo hash si la contraseña ha sido modificada
  if (!this.isModified('password')) {
    next();
  }
  
  try {
    // Generar salt
    const salt = await bcrypt.genSalt(10);
    // Hash de contraseña
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseña
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para verificar si una contraseña está en formato antiguo (btoa)
userSchema.methods.isLegacyPassword = function(hash, password) {
  try {
    return atob(hash) === password;
  } catch (e) {
    return false;
  }
};

// Método para generar token JWT
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      tipoUsuario: this.tipoUsuario 
    },
    config.server.jwtSecret,
    {
      expiresIn: config.server.jwtExpire
    }
  );
};

// Método para generar token de recuperación de contraseña
userSchema.methods.getResetPasswordToken = function() {
  // Generar token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token y almacenar
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Establecer expiración (10 minutos)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Crear y exportar el modelo
const User = mongoose.model('User', userSchema);
module.exports = User;