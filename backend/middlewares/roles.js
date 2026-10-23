const { protect } = require('./auth');

const ROLE_ALIASES = {
  admin: 'administrador',
  administrador: 'administrador',
  empleado: 'empleado'
};

const getUserRole = user => ROLE_ALIASES[user?.tipoUsuario || user?.role] || null;

/**
 * Verifica si el usuario tiene rol de administrador
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const isAdmin = (req, res, next) => {
  try {
    // Comprobar si el usuario está autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        msg: 'No autorizado'
      });
    }
    
    // Comprobar si el usuario tiene rol de administrador
    if (getUserRole(req.user) !== 'administrador') {
      return res.status(403).json({
        success: false,
        msg: 'Acceso denegado. Se requiere rol de administrador'
      });
    }
    
    // Usuario es administrador, continuar
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

const requireAdmin = (req, res, next) => {
  return protect(req, res, () => isAdmin(req, res, next));
};

/**
 * Verifica si el usuario tiene rol específico
 * @param {Array|String} roles - Roles permitidos
 * @returns {Function} Middleware para verificar roles
 */
const hasRole = (roles) => {
  return (req, res, next) => {
    try {
      // Comprobar si el usuario está autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          msg: 'No autorizado'
        });
      }
      
      // Convertir roles a array si es string
      const allowedRoles = (Array.isArray(roles) ? roles : [roles])
        .map(role => ROLE_ALIASES[role] || role);
      
      // Comprobar si el usuario tiene alguno de los roles permitidos
      if (!allowedRoles.includes(getUserRole(req.user))) {
        return res.status(403).json({
          success: false,
          msg: 'Acceso denegado. No tiene los permisos necesarios'
        });
      }
      
      // Usuario tiene rol permitido, continuar
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
 * Verifica si el usuario es propietario del recurso o administrador
 * @param {Function} getResourceUserId - Función para extraer el userId del recurso
 * @returns {Function} Middleware para verificación
 */
const isOwnerOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      // Comprobar si el usuario está autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          msg: 'No autorizado'
        });
      }
      
      // Si es admin, permitir acceso directo
      if (getUserRole(req.user) === 'administrador') {
        return next();
      }
      
      // Obtener ID del propietario del recurso
      const resourceUserId = await getResourceUserId(req);
      
      // Si no se pudo obtener el ID, denegar acceso
      if (!resourceUserId) {
        return res.status(403).json({
          success: false,
          msg: 'Acceso denegado. Recurso no encontrado o sin propietario'
        });
      }
      
      // Comprobar si el usuario es propietario del recurso
      if (resourceUserId.toString() !== (req.user._id || req.user.id).toString()) {
        return res.status(403).json({
          success: false,
          msg: 'Acceso denegado. No es propietario del recurso'
        });
      }
      
      // Usuario es propietario, continuar
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
  requireAdmin,
  hasRole,
  isOwnerOrAdmin,
  getUserRole
};