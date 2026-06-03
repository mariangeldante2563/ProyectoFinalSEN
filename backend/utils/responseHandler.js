/**
<<<<<<< HEAD
 * @version 1.0.0
 * @description 
=======
 * IN OUT MANAGER - UTILIDADES DE RESPUESTA
 * @version 1.0.0
 * @description Funciones para estandarizar respuestas HTTP
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */

/**
 * Envía una respuesta exitosa
<<<<<<< HEAD
 * @param {Object} res 
 * @param {Object} data 
 * @param {string} message 
 * @param {number} statusCode 
=======
 * @param {Object} res - Objeto de respuesta Express
 * @param {Object} data - Datos a enviar en la respuesta
 * @param {string} message - Mensaje de éxito
 * @param {number} statusCode - Código HTTP de respuesta
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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
<<<<<<< HEAD
 * @param {Object} res 
 * @param {string} message 
 * @param {Object} error 
 * @param {number} statusCode 
=======
 * @param {Object} res - Objeto de respuesta Express
 * @param {string} message - Mensaje de error
 * @param {Object} error - Detalles del error
 * @param {number} statusCode - Código HTTP de error
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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
<<<<<<< HEAD
 * @param {Object} res
 * @param {string} entity 
=======
 * @param {Object} res - Objeto de respuesta Express
 * @param {string} entity - Nombre de la entidad no encontrada
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
exports.notFound = (res, entity = 'Recurso') => {
  return res.status(404).json({
    success: false,
    message: `${entity} no encontrado`
  });
};

/**
 * Respuesta para errores de validación
<<<<<<< HEAD
 * @param {Object} res 
 * @param {Array} errors 
=======
 * @param {Object} res - Objeto de respuesta Express
 * @param {Array} errors - Lista de errores de validación
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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
<<<<<<< HEAD
 * @param {Object} res 
 * @param {string} message 
=======
 * @param {Object} res - Objeto de respuesta Express
 * @param {string} message - Mensaje de error
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
exports.authError = (res, message = 'No autorizado') => {
  return res.status(401).json({
    success: false,
    message
  });
};

/**
 * Respuesta para errores de permisos
<<<<<<< HEAD
 * @param {Object} res 
 * @param {string} message 
=======
 * @param {Object} res - Objeto de respuesta Express
 * @param {string} message - Mensaje de error
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
exports.forbidden = (res, message = 'Acceso denegado') => {
  return res.status(403).json({
    success: false,
    message
  });
};