/**
 * IN OUT MANAGER - MIDDLEWARE DE MANEJO DE ERRORES
 * @version 1.0.0
 * @description Middleware centralizado para manejar errores
 */

const { error } = require('../utils/responseHandler');
const mongoose = require('mongoose');

/**
 * Middleware para capturar y procesar errores
 */
const errorHandler = (err, req, res, next) => {
  console.error('ERROR:', err);

  // Variables para el mensaje y código de respuesta
  let statusCode = 500;
  let message = 'Error interno del servidor';
  let errorDetails = {};

  // Manejar diferentes tipos de errores
  if (err.name === 'ValidationError') {
    // Error de validación de Mongoose
    statusCode = 400;
    message = 'Error de validación';
    errorDetails = Object.values(err.errors).map(e => e.message);
  } else if (err.code === 11000) {
    // Error de duplicación (violación de unique)
    statusCode = 400;
    message = 'Error de duplicación';
    
    // Intentar identificar el campo duplicado
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    errorDetails = `Ya existe un registro con el campo ${field}: ${value}`;
  } else if (err.name === 'JsonWebTokenError') {
    // Error de JWT
    statusCode = 401;
    message = 'Token de autenticación inválido';
  } else if (err.name === 'TokenExpiredError') {
    // Error de JWT expirado
    statusCode = 401;
    message = 'Token de autenticación expirado';
  } else if (err instanceof mongoose.Error.CastError) {
    // Error de casteo de ID en MongoDB
    statusCode = 400;
    message = 'ID inválido';
    errorDetails = `${err.path}: ${err.value} no es un ID válido`;
  } else if (err.statusCode) {
    // Error personalizado con código de estado
    statusCode = err.statusCode;
    message = err.message;
  }

  // Enviar respuesta con formato estandarizado
  return error(res, message, errorDetails, statusCode);
};

/**
 * Middleware para manejar rutas no encontradas
 */
const notFoundHandler = (req, res, next) => {
  return error(res, 'Ruta no encontrada', { url: req.originalUrl }, 404);
};

module.exports = {
  errorHandler,
  notFoundHandler
};