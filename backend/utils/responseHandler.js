/**
 * IN OUT MANAGER - UTILIDADES DE RESPUESTA
 * @version 1.0.0
 * @description Funciones para estandarizar respuestas HTTP
 */

/**
 * Envía una respuesta exitosa
 * @param {Object} res - Objeto de respuesta Express
 * @param {Object} data - Datos a enviar en la respuesta
 * @param {string} message - Mensaje de éxito
 * @param {number} statusCode - Código HTTP de respuesta
 */
exports.success = (res, data = null, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Envía una respuesta de error
 * @param {Object} res - Objeto de respuesta Express
 * @param {string} message - Mensaje de error
 * @param {Object} error - Detalles del error
 * @param {number} statusCode - Código HTTP de error
 */
exports.error = (res, message = 'Error en la operación', error = {}, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'production' ? {} : error
  });
};

/**
 * Respuesta para recurso no encontrado
 * @param {Object} res - Objeto de respuesta Express
 * @param {string} entity - Nombre de la entidad no encontrada
 */
exports.notFound = (res, entity = 'Recurso') => {
  return res.status(404).json({
    success: false,
    message: `${entity} no encontrado`
  });
};

/**
 * Respuesta para errores de validación
 * @param {Object} res - Objeto de respuesta Express
 * @param {Array} errors - Lista de errores de validación
 */
exports.validationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Error de validación',
    errors
  });
};

/**
 * Respuesta para errores de autenticación
 * @param {Object} res - Objeto de respuesta Express
 * @param {string} message - Mensaje de error
 */
exports.authError = (res, message = 'No autorizado') => {
  return res.status(401).json({
    success: false,
    message
  });
};

/**
 * Respuesta para errores de permisos
 * @param {Object} res - Objeto de respuesta Express
 * @param {string} message - Mensaje de error
 */
exports.forbidden = (res, message = 'Acceso denegado') => {
  return res.status(403).json({
    success: false,
    message
  });
};