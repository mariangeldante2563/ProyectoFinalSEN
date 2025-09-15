/**
 * IN OUT MANAGER - MIDDLEWARES DE VALIDACIÓN
 * @version 1.0.0
 * @description Middlewares para validación de datos de entrada
 */

const { body, param, validationResult } = require('express-validator');

/**
 * Middleware para verificar resultados de validación
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error en los datos de entrada',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Reglas de validación para registro de usuario
 */
exports.registerRules = [
  body('nombreCompleto')
    .notEmpty().withMessage('El nombre completo es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[A-Za-zÀ-ÿ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
  
  body('numeroDocumento')
    .notEmpty().withMessage('El número de documento es requerido')
    .matches(/^[0-9]{6,12}$/).withMessage('El número de documento debe tener entre 6 y 12 dígitos'),
  
  body('correoElectronico')
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  
  body('tipoUsuario')
    .optional()
    .isIn(['empleado', 'administrador']).withMessage('Tipo de usuario no válido'),
  
  body('edad')
    .optional()
    .isInt({ min: 18, max: 100 }).withMessage('La edad debe ser entre 18 y 100 años')
];

/**
 * Reglas de validación para login
 */
exports.loginRules = [
  body('correoElectronico')
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
];

/**
 * Reglas de validación para recuperación de contraseña
 */
exports.recoverPasswordRules = [
  body('correoElectronico')
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
  
  body('numeroDocumento')
    .notEmpty().withMessage('El número de documento es requerido')
    .matches(/^[0-9]{6,12}$/).withMessage('El número de documento debe tener entre 6 y 12 dígitos')
];

/**
 * Reglas de validación para verificación de código
 */
exports.verifyCodeRules = [
  body('correoElectronico')
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
  
  body('codigoVerificacion')
    .notEmpty().withMessage('El código de verificación es requerido')
    .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 caracteres')
];

/**
 * Reglas de validación para cambio de contraseña
 */
exports.resetPasswordRules = [
  body('correoElectronico')
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
  
  body('codigoVerificacion')
    .notEmpty().withMessage('El código de verificación es requerido')
    .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 caracteres'),
  
  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  
  body('confirmPassword')
    .notEmpty().withMessage('La confirmación de contraseña es requerida')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

/**
 * Reglas de validación para registro de asistencia
 */
exports.attendanceRules = [
  body('type')
    .notEmpty().withMessage('El tipo de registro es requerido')
    .isIn(['entrada', 'salida']).withMessage('Tipo de registro no válido')
];