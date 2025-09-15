/**
 * IN OUT MANAGER - RUTAS DE AUTENTICACIÓN
 * @version 1.0.0
 * @description Rutas para autenticación de usuarios
 */

const express = require('express');
const router = express.Router();

// Importar controladores
const {
  register,
  login,
  recoverPassword,
  verifyCode,
  resetPassword,
  getMe
} = require('../controllers/authController');

// Importar middlewares
const { protect } = require('../middlewares/auth');
const { 
  registerRules, 
  loginRules, 
  recoverPasswordRules, 
  verifyCodeRules,
  resetPasswordRules,
  validate 
} = require('../middlewares/validation');

// Rutas públicas
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/recover-password', recoverPasswordRules, validate, recoverPassword);
router.post('/verify-code', verifyCodeRules, validate, verifyCode);
router.post('/reset-password', resetPasswordRules, validate, resetPassword);

// Rutas protegidas
router.get('/me', protect, getMe);

module.exports = router;