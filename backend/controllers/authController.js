/**
 * IN OUT MANAGER - CONTROLADOR DE AUTENTICACIÓN
 * @version 1.0.0
 * @description Controlador para manejo de autenticación y autorización
 */

const User = require('../models/User');
const crypto = require('crypto');
const config = require('../config/config');

// Códigos de recuperación (en producción esto iría en una base de datos)
const recoveryCodes = {};

/**
 * @desc    Registro de nuevo usuario
 * @route   POST /api/auth/register
 * @access  Público
 */
exports.register = async (req, res) => {
  try {
    const { 
      nombreCompleto, 
      numeroDocumento, 
      correoElectronico, 
      password,
      tipoUsuario,
      edad,
      cargo,
      horarioAsignado
    } = req.body;

    // Verificar si ya existe usuario con ese documento o correo
    let user = await User.findOne({ 
      $or: [
        { numeroDocumento },
        { correoElectronico }
      ]
    });

    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con ese documento o correo electrónico'
      });
    }

    // Crear nuevo usuario
    user = new User({
      nombreCompleto,
      numeroDocumento,
      correoElectronico,
      password,
      tipoUsuario: tipoUsuario || 'empleado',
      edad,
      cargo,
      horarioAsignado
    });

    // Guardar usuario
    await user.save();

    // Generar token JWT
    const token = user.getSignedJwtToken();

    // Responder con el token y datos del usuario
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      token,
      user: {
        id: user._id,
        nombreCompleto: user.nombreCompleto,
        correoElectronico: user.correoElectronico,
        tipoUsuario: user.tipoUsuario,
        numeroDocumento: user.numeroDocumento,
        cargo: user.cargo || null,
        horarioAsignado: user.horarioAsignado || null
      }
    });
  } catch (error) {
    console.error('Error en registro de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

/**
 * @desc    Login de usuario
 * @route   POST /api/auth/login
 * @access  Público
 */
exports.login = async (req, res) => {
  try {
    const { correoElectronico, password } = req.body;

    // Validar que se proporcionó correo y contraseña
    if (!correoElectronico || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione correo electrónico y contraseña'
      });
    }

    // Buscar usuario y traer la contraseña (que normalmente está excluida)
    const user = await User.findOne({ correoElectronico }).select('+password');

    // Verificar si el usuario existe
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si la contraseña coincide
    const isMatch = await user.matchPassword(password);

    // Si la contraseña no coincide, verificar si es una contraseña legacy (btoa)
    if (!isMatch) {
      const isLegacyMatch = user.isLegacyPassword(user.password, password);
      
      if (isLegacyMatch) {
        // Actualizar a nuevo formato de contraseña
        user.password = password;
        await user.save();
      } else {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
    }

    // Generar token JWT
    const token = user.getSignedJwtToken();

    // Responder con token y datos del usuario
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user._id,
        nombreCompleto: user.nombreCompleto,
        correoElectronico: user.correoElectronico,
        tipoUsuario: user.tipoUsuario,
        numeroDocumento: user.numeroDocumento,
        cargo: user.cargo || null,
        horarioAsignado: user.horarioAsignado || null
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

/**
 * @desc    Iniciar proceso de recuperación de contraseña
 * @route   POST /api/auth/recover-password
 * @access  Público
 */
exports.recoverPassword = async (req, res) => {
  try {
    const { correoElectronico, numeroDocumento } = req.body;

    // Buscar usuario
    const user = await User.findOne({ 
      correoElectronico, 
      numeroDocumento 
    });

    // Si no se encuentra el usuario, responder de forma genérica por seguridad
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si los datos proporcionados son correctos, recibirá un código de verificación.'
      });
    }

    // Generar código de verificación (6 dígitos)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar código en memoria (en producción esto iría en la base de datos con tiempo de expiración)
    recoveryCodes[correoElectronico] = {
      code: verificationCode,
      userId: user._id,
      expires: Date.now() + (15 * 60 * 1000) // 15 minutos
    };

    // En producción, aquí enviaríamos un correo electrónico
    console.log(`Código de verificación para ${correoElectronico}: ${verificationCode}`);

    // Responder al cliente
    res.status(200).json({
      success: true,
      message: 'Código de verificación enviado al correo electrónico',
      // SOLO PARA DESARROLLO: Incluir el código en la respuesta
      debugCode: config.server.env === 'development' ? verificationCode : undefined
    });
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
};

/**
 * @desc    Verificar código de recuperación
 * @route   POST /api/auth/verify-code
 * @access  Público
 */
exports.verifyCode = async (req, res) => {
  try {
    const { correoElectronico, codigoVerificacion } = req.body;

    // Verificar si existe un código para ese correo
    const recoveryData = recoveryCodes[correoElectronico];
    
    if (!recoveryData) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificación inválido o expirado'
      });
    }

    // Verificar si el código ha expirado
    if (Date.now() > recoveryData.expires) {
      delete recoveryCodes[correoElectronico];
      
      return res.status(400).json({
        success: false,
        message: 'El código de verificación ha expirado'
      });
    }

    // Verificar si el código es correcto
    if (recoveryData.code !== codigoVerificacion) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificación incorrecto'
      });
    }

    // Marcar el código como verificado para permitir el cambio de contraseña
    recoveryCodes[correoElectronico].verified = true;

    res.status(200).json({
      success: true,
      message: 'Código verificado correctamente'
    });
  } catch (error) {
    console.error('Error en verificación de código:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar el código',
      error: error.message
    });
  }
};

/**
 * @desc    Establecer nueva contraseña
 * @route   POST /api/auth/reset-password
 * @access  Público (con verificación previa)
 */
exports.resetPassword = async (req, res) => {
  try {
    const { correoElectronico, codigoVerificacion, newPassword } = req.body;

    // Verificar si existe un código verificado para ese correo
    const recoveryData = recoveryCodes[correoElectronico];
    
    if (!recoveryData || !recoveryData.verified || recoveryData.code !== codigoVerificacion) {
      return res.status(400).json({
        success: false,
        message: 'No autorizado para cambiar la contraseña'
      });
    }

    // Verificar si el código ha expirado
    if (Date.now() > recoveryData.expires) {
      delete recoveryCodes[correoElectronico];
      
      return res.status(400).json({
        success: false,
        message: 'La sesión de recuperación ha expirado'
      });
    }

    // Buscar usuario
    const user = await User.findOne({ correoElectronico });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    // Eliminar código de recuperación
    delete recoveryCodes[correoElectronico];

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restablecer la contraseña',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener información del usuario actual
 * @route   GET /api/auth/me
 * @access  Privado
 */
exports.getMe = async (req, res) => {
  try {
    // req.user viene del middleware protect
    res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        nombreCompleto: req.user.nombreCompleto,
        correoElectronico: req.user.correoElectronico,
        tipoUsuario: req.user.tipoUsuario,
        numeroDocumento: req.user.numeroDocumento,
        cargo: req.user.cargo || null,
        horarioAsignado: req.user.horarioAsignado || null
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario',
      error: error.message
    });
  }
};