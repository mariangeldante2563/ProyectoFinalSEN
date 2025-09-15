/**
 * IN OUT MANAGER - CLASE DE ERROR PERSONALIZADO
 * @version 1.0.0
 * @description Clase para crear errores personalizados con código HTTP
 */

class ApiError extends Error {
  /**
   * Constructor para error personalizado
   * @param {string} message - Mensaje de error
   * @param {number} statusCode - Código HTTP de error
   */
  constructor(message, statusCode) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    
    // Capturar la traza de error
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Crear error de validación
   * @param {string} message - Mensaje de error
   * @returns {ApiError} - Nueva instancia de error
   */
  static validationError(message = 'Error de validación') {
    return new ApiError(message, 400);
  }
  
  /**
   * Crear error de autenticación
   * @param {string} message - Mensaje de error
   * @returns {ApiError} - Nueva instancia de error
   */
  static authError(message = 'No autorizado') {
    return new ApiError(message, 401);
  }
  
  /**
   * Crear error de permisos
   * @param {string} message - Mensaje de error
   * @returns {ApiError} - Nueva instancia de error
   */
  static forbidden(message = 'Acceso denegado') {
    return new ApiError(message, 403);
  }
  
  /**
   * Crear error de recurso no encontrado
   * @param {string} entity - Nombre de la entidad no encontrada
   * @returns {ApiError} - Nueva instancia de error
   */
  static notFound(entity = 'Recurso') {
    return new ApiError(`${entity} no encontrado`, 404);
  }
  
  /**
   * Crear error de servidor
   * @param {string} message - Mensaje de error
   * @returns {ApiError} - Nueva instancia de error
   */
  static serverError(message = 'Error interno del servidor') {
    return new ApiError(message, 500);
  }
}

module.exports = ApiError;