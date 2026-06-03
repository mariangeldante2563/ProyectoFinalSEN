/**
<<<<<<< HEAD
 * @version 1.0.0
 * @description 
=======
 * IN OUT MANAGER - CLASE DE ERROR PERSONALIZADO
 * @version 1.0.0
 * @description Clase para crear errores personalizados con código HTTP
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */

class ApiError extends Error {
  /**
   * Constructor para error personalizado
<<<<<<< HEAD
   * @param {string} message 
   * @param {number} statusCode 
=======
   * @param {string} message - Mensaje de error
   * @param {number} statusCode - Código HTTP de error
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  constructor(message, statusCode) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
<<<<<<< HEAD

=======
    
    // Capturar la traza de error
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Crear error de validación
<<<<<<< HEAD
   * @param {string} message 
   * @returns {ApiError} 
=======
   * @param {string} message - Mensaje de error
   * @returns {ApiError} - Nueva instancia de error
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  static validationError(message = 'Error de validación') {
    return new ApiError(message, 400);
  }
  
  /**
   * Crear error de autenticación
<<<<<<< HEAD
   * @param {string} message 
   * @returns {ApiError} 
=======
   * @param {string} message - Mensaje de error
   * @returns {ApiError} - Nueva instancia de error
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  static authError(message = 'No autorizado') {
    return new ApiError(message, 401);
  }
  
  /**
   * Crear error de permisos
<<<<<<< HEAD
   * @param {string} message 
   * @returns {ApiError} 
=======
   * @param {string} message - Mensaje de error
   * @returns {ApiError} - Nueva instancia de error
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  static forbidden(message = 'Acceso denegado') {
    return new ApiError(message, 403);
  }
  
  /**
   * Crear error de recurso no encontrado
<<<<<<< HEAD
   * @param {string} entity 
   * @returns {ApiError} 
=======
   * @param {string} entity - Nombre de la entidad no encontrada
   * @returns {ApiError} - Nueva instancia de error
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  static notFound(entity = 'Recurso') {
    return new ApiError(`${entity} no encontrado`, 404);
  }
  
  /**
   * Crear error de servidor
<<<<<<< HEAD
   * @param {string} message 
   * @returns {ApiError} 
=======
   * @param {string} message - Mensaje de error
   * @returns {ApiError} - Nueva instancia de error
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  static serverError(message = 'Error interno del servidor') {
    return new ApiError(message, 500);
  }
}

module.exports = ApiError;