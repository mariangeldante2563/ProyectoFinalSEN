<<<<<<< HEAD
// Middleware de autenticación JWT
=======
/**
 * IN OUT MANAGER - MIDDLEWARES DE AUTENTICACIÓN
 * @version 1.0.0
 * @description Middlewares para autenticación y autorización
 */

>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

<<<<<<< HEAD

exports.protect = async (req, res, next) => {
  let token;

  // Logs mínimos de depuración (pueden deshabilitarse en producción)
  console.log('[auth] Header Authorization:', req.headers.authorization || 'N/A');

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.split(' ')[1];
  }
 
=======
/**
 * Middleware para proteger rutas con JWT
 * Verifica que el usuario esté autenticado
 */
exports.protect = async (req, res, next) => {
  let token;

  // Verificar si hay token en los headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Obtener token del header (Bearer token)
    token = req.headers.authorization.split(' ')[1];
  } 
  // También se puede leer desde una cookie o el body si se prefiere
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Verificar si el token existe
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado para acceder a esta ruta',
      error: 'No se proporcionó token de acceso'
    });
  }

  try {
<<<<<<< HEAD
    const decoded = jwt.verify(token.trim(), config.server.jwtSecret);
=======
    // Verificar token
    const decoded = jwt.verify(token, config.server.jwtSecret);

    // Añadir el usuario al request
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado para acceder a esta ruta',
        error: 'Usuario no encontrado'
      });
    }

    next();
  } catch (error) {
<<<<<<< HEAD
    console.error('[auth] Error verificando token:', error.message);
=======
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    return res.status(401).json({
      success: false,
      message: 'No autorizado para acceder a esta ruta',
      error: error.message
    });
  }
};

<<<<<<< HEAD
// Autoriza según roles
=======
/**
 * Middleware para verificar roles de usuario
 * @param {...String} roles - Roles permitidos
 */
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado para acceder a esta ruta',
        error: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.tipoUsuario)) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para acceder a esta ruta',
        error: `Usuario con rol ${req.user.tipoUsuario} no tiene permiso para esta acción`
      });
    }
    
    next();
  };
};

<<<<<<< HEAD
exports.checkUserOwnership = (req, res, next) => {

=======
/**
 * Middleware para verificar que un usuario solo pueda acceder a sus propios datos
 * (excepto administradores)
 */
exports.checkUserOwnership = (req, res, next) => {
  // Si es administrador, permitir acceso
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  if (req.user.tipoUsuario === 'administrador') {
    return next();
  }
  
<<<<<<< HEAD
  const userId = req.params.id || req.params.userId || req.body.userId;

=======
  // Obtener el ID del usuario solicitado
  const userId = req.params.id || req.params.userId || req.body.userId;
  
  // Si no coincide con el usuario autenticado, denegar acceso
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  if (userId && userId !== req.user.id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'No autorizado para acceder a estos datos',
      error: 'Solo puede acceder a sus propios datos'
    });
  }
  
  next();
};