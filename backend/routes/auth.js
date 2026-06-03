/**
<<<<<<< HEAD
 * @version 1.0.0
 * @description 
=======
 * IN OUT MANAGER - RUTAS DE AUTENTICACIÓN
 * @version 1.0.0
 * @description Rutas para autenticación de usuarios
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */

const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const multer = require('multer');
// Permite procesar formularios form-data sin archivos 
const parseFormData = multer().none();

// Parsers para aceptar JSON, y form-data
const bodyParsers = [
  express.json(),
  express.urlencoded({ extended: true }),
  parseFormData,
  (req, _res, next) => {
    if (typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch (_e) {
      }
    }
    next();
  }
];

// Normaliza campos comunes que llegan con nombres distintos (email/correo, nombre, documento)
const normalizeAuthFields = (req, _res, next) => {
  if (req.body) {
    if (!req.body.correoElectronico) {
      req.body.correoElectronico = req.body.email || req.body.correo || req.body.user || req.body.username;
    }
    if (!req.body.password && req.body.pass) {
      req.body.password = req.body.pass;
    }
    if (!req.body.nombreCompleto) {
      req.body.nombreCompleto = req.body.nombre || req.body.fullName || req.body.nombre_usuario;
    }
    if (!req.body.numeroDocumento) {
      req.body.numeroDocumento = req.body.documento || req.body.doc || req.body.cc;
    }
  }
  next();
};

=======

// Importar controladores
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
const {
  register,
  login,
  recoverPassword,
  verifyCode,
  resetPassword,
  getMe
} = require('../controllers/authController');

<<<<<<< HEAD
=======
// Importar middlewares
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
const { protect } = require('../middlewares/auth');
const { 
  registerRules, 
  loginRules, 
  recoverPasswordRules, 
  verifyCodeRules,
  resetPasswordRules,
  validate 
} = require('../middlewares/validation');
<<<<<<< HEAD
router.post('/register', bodyParsers, normalizeAuthFields, registerRules, validate, register);
router.post('/login', bodyParsers, normalizeAuthFields, loginRules, validate, login);
router.post('/recover-password', bodyParsers, normalizeAuthFields, recoverPasswordRules, validate, recoverPassword);
router.post('/verify-code', bodyParsers, normalizeAuthFields, verifyCodeRules, validate, verifyCode);
router.post('/reset-password', bodyParsers, normalizeAuthFields, resetPasswordRules, validate, resetPassword);
=======

// Rutas públicas
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/recover-password', recoverPasswordRules, validate, recoverPassword);
router.post('/verify-code', verifyCodeRules, validate, verifyCode);
router.post('/reset-password', resetPasswordRules, validate, resetPassword);

// Rutas protegidas
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
router.get('/me', protect, getMe);

module.exports = router;