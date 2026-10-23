/**
 * IN OUT MANAGER - MIDDLEWARES DE VALIDACIÓN
 * @version 1.0.0
 * @description Middlewares para validación de datos de entrada
 */

const { body, param, query, validationResult } = require('express-validator');

const rejectUnknownFields = (source, allowedFields) => (req, res, next) => {
  const values = req[source] || {};
  if (typeof values !== 'object' || Array.isArray(values)) {
    return res.status(400).json({
      success: false,
      message: `El formato de ${source} no es válido`
    });
  }

  const unknownFields = Object.keys(values).filter(field => !allowedFields.includes(field));
  if (unknownFields.length) {
    return res.status(400).json({
      success: false,
      message: `Campos no permitidos en ${source}: ${unknownFields.join(', ')}`
    });
  }

  next();
};

/**
 * Middleware para verificar resultados de validación
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Errores de validación:', JSON.stringify(errors.array(), null, 2));
    console.log('📦 Datos recibidos:', JSON.stringify(req.body, null, 2));
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
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('tipoUsuario')
    .optional()
    .isIn(['empleado', 'administrador']).withMessage('Tipo de usuario no válido'),
  
  body('codigoAdmin')
    .optional()
    .matches(/^[0-9]{1,4}$/).withMessage('El código de administrador debe ser un número de máximo 4 dígitos'),
  
  body('edad')
    .optional({ nullable: true, checkFalsy: true })
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
    .notEmpty().withMessage('La contraseña es requerida'),
  
  body('codigoAdmin')
    .optional()
    .matches(/^[0-9]{1,4}$/).withMessage('El código de administrador debe ser un número de máximo 4 dígitos')
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
  rejectUnknownFields('body', ['type', 'timestamp']),
  body('type')
    .trim()
    .notEmpty().withMessage('El tipo de registro es requerido')
    .isIn(['entrada', 'salida']).withMessage('Tipo de registro no válido'),
  body('timestamp').custom((_, { req }) => {
    if (Object.prototype.hasOwnProperty.call(req.body, 'timestamp')) {
      throw new Error('La marca de tiempo la asigna el servidor.');
    }
    return true;
  })
];

exports.attendanceQueryRules = [
  rejectUnknownFields('query', ['startDate', 'endDate', 'type', 'userId', 'page', 'limit']),
  query('startDate').optional().trim().isISO8601({ strict: true }).withMessage('Fecha inicial inválida'),
  query('endDate').optional().trim().isISO8601({ strict: true }).withMessage('Fecha final inválida'),
  query('type').optional().trim().isIn(['entrada', 'salida']).withMessage('Tipo de registro no válido'),
  query('userId').optional().trim().isMongoId().withMessage('ID de usuario inválido'),
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('La página debe ser un entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 500 }).toInt().withMessage('El límite debe estar entre 1 y 500'),
  query('endDate').custom((endDate, { req }) => {
    const { startDate } = req.query;
    if (startDate && endDate && startDate > endDate) {
      throw new Error('La fecha inicial no puede ser posterior a la fecha final');
    }
    return true;
  }).optional()
];

exports.attendanceIdRules = [
  rejectUnknownFields('body', ['reason']),
  param('id').isMongoId().withMessage('ID de asistencia inválido'),
  body('reason').trim().notEmpty().isLength({ max: 500 }).withMessage('El motivo es obligatorio y no puede superar 500 caracteres')
];

exports.correctionRules = [
  rejectUnknownFields('body', ['targetType', 'targetId', 'proposedValues', 'reason']),
  body('targetType').trim().isIn(['attendance', 'workSession'])
    .withMessage('Tipo de objetivo debe ser attendance o workSession'),
  body('targetId').trim().isMongoId().withMessage('ID de objetivo inválido'),
  body('reason').trim().notEmpty().isLength({ max: 500 }).withMessage('El motivo es obligatorio y no puede superar 500 caracteres'),
  body('proposedValues').custom((values, { req }) => {
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      throw new Error('Los valores propuestos deben ser un objeto');
    }

    const expectedField = req.body.targetType === 'attendance' ? 'timestamp' : 'timestampSalida';
    const fields = Object.keys(values);
    const proposedValue = values[expectedField];
    if (fields.length !== 1 || fields[0] !== expectedField ||
        typeof proposedValue !== 'string' || Number.isNaN(Date.parse(proposedValue))) {
      throw new Error(`Para ${req.body.targetType} se requiere únicamente ${expectedField} con fecha válida`);
    }
    return true;
  })
];

exports.correctionDecisionRules = [
  rejectUnknownFields('body', ['decision', 'reason']),
  param('requestId').isMongoId().withMessage('ID de solicitud inválido'),
  body('decision').isIn(['approve', 'reject']).withMessage('La decisión debe ser approve o reject'),
  body('reason').if(body('decision').equals('reject')).trim().notEmpty().isLength({ max: 500 })
    .withMessage('El motivo de rechazo es obligatorio y no puede superar 500 caracteres')
];

exports.dateRangeRules = [
  rejectUnknownFields('query', ['startDate', 'endDate']),
  query('startDate').isISO8601({ strict: true }).withMessage('Fecha inicial inválida'),
  query('endDate').isISO8601({ strict: true }).withMessage('Fecha final inválida'),
  query('endDate').custom((endDate, { req }) => {
    if (req.query.startDate > endDate) {
      throw new Error('La fecha inicial no puede ser posterior a la fecha final');
    }
    return true;
  })
];

exports.userIdRules = [
  param('userId').isMongoId().withMessage('ID de usuario inválido')
];