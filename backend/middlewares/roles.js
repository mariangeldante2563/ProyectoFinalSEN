<<<<<<< HEAD
// Middleware de control de roles
// FIXME: Revisar lógica de roles con tipoUsuario

// Verifica si es admin
const isAdmin = (req, res, next) => {
  try {
=======
/**
 * IN OUT MANAGER - MIDDLEWARE DE ROLES
 * @version 1.0.0
 * @description Middleware para verificación de roles de usuario
 */

/**
 * Verifica si el usuario tiene rol de administrador
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const isAdmin = (req, res, next) => {
  try {
    // Comprobar si el usuario está autenticado
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (!req.user) {
      return res.status(401).json({
        success: false,
        msg: 'No autorizado'
      });
    }
<<<<<<< HEAD

=======
    
    // Comprobar si el usuario tiene rol de administrador
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        msg: 'Acceso denegado. Se requiere rol de administrador'
      });
    }
<<<<<<< HEAD

=======
    
    // Usuario es administrador, continuar
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    next();
  } catch (error) {
    console.error('Error en verificación de rol admin:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al verificar permisos',
      error: error.message
    });
  }
};

<<<<<<< HEAD
// Middleware para verificar roles específicos
const hasRole = (roles) => {
  return (req, res, next) => {
    try {
=======
/**
 * Verifica si el usuario tiene rol específico
 * @param {Array|String} roles - Roles permitidos
 * @returns {Function} Middleware para verificar roles
 */
const hasRole = (roles) => {
  return (req, res, next) => {
    try {
      // Comprobar si el usuario está autenticado
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (!req.user) {
        return res.status(401).json({
          success: false,
          msg: 'No autorizado'
        });
      }
      
<<<<<<< HEAD
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

=======
      // Convertir roles a array si es string
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Comprobar si el usuario tiene alguno de los roles permitidos
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          msg: 'Acceso denegado. No tiene los permisos necesarios'
        });
      }
<<<<<<< HEAD

=======
      
      // Usuario tiene rol permitido, continuar
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      next();
    } catch (error) {
      console.error('Error en verificación de roles:', error);
      res.status(500).json({
        success: false,
        msg: 'Error al verificar permisos',
        error: error.message
      });
    }
  };
};

/**
<<<<<<< HEAD

 * @param {Function} getResourceUserId 
 * @returns {Function} 
=======
 * Verifica si el usuario es propietario del recurso o administrador
 * @param {Function} getResourceUserId - Función para extraer el userId del recurso
 * @returns {Function} Middleware para verificación
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
const isOwnerOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
<<<<<<< HEAD
=======
      // Comprobar si el usuario está autenticado
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (!req.user) {
        return res.status(401).json({
          success: false,
          msg: 'No autorizado'
        });
      }
<<<<<<< HEAD

      if (req.user.role === 'admin') {
        return next();
      }
      const resourceUserId = await getResourceUserId(req);
=======
      
      // Si es admin, permitir acceso directo
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Obtener ID del propietario del recurso
      const resourceUserId = await getResourceUserId(req);
      
      // Si no se pudo obtener el ID, denegar acceso
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (!resourceUserId) {
        return res.status(403).json({
          success: false,
          msg: 'Acceso denegado. Recurso no encontrado o sin propietario'
        });
      }
<<<<<<< HEAD

=======
      
      // Comprobar si el usuario es propietario del recurso
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (resourceUserId.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          msg: 'Acceso denegado. No es propietario del recurso'
        });
      }
<<<<<<< HEAD

=======
      
      // Usuario es propietario, continuar
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      next();
    } catch (error) {
      console.error('Error en verificación de propietario:', error);
      res.status(500).json({
        success: false,
        msg: 'Error al verificar permisos',
        error: error.message
      });
    }
  };
};

module.exports = {
  isAdmin,
  hasRole,
  isOwnerOrAdmin
};