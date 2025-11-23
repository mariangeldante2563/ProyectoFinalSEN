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
    console.log('🔵 === INICIO REGISTRO ===');
    console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));
    
    const { 
      nombreCompleto, 
      numeroDocumento, 
      correoElectronico, 
      password,
      tipoUsuario,
      codigoAdmin,
      edad,
      cargo,
      horarioAsignado
    } = req.body;

    console.log('✅ Datos extraídos:', {
      nombreCompleto,
      numeroDocumento,
      correoElectronico,
      password: password ? '***' : undefined,
      tipoUsuario,
      edad,
      cargo,
      horarioAsignado,
      codigoAdmin
    });

    // Verificar si ya existe usuario con ese documento o correo
    console.log('🔍 Verificando si existe usuario...');
    let user = await User.findOne({ 
      $or: [
        { numeroDocumento },
        { correoElectronico }
      ]
    });

    if (user) {
      console.log('⚠️ Usuario ya existe:', user.correoElectronico);
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con ese documento o correo electrónico'
      });
    }

    console.log('✅ Usuario no existe, procediendo a crear...');

    // Crear nuevo usuario
    const userData = {
      nombreCompleto,
      numeroDocumento,
      correoElectronico,
      password,
      tipoUsuario: tipoUsuario || 'empleado',
      edad,
      cargo,
      horarioAsignado
    };

    console.log('📝 userData preparado:', { ...userData, password: '***' });

    // Si es administrador, incluir código de administrador
    if (tipoUsuario === 'administrador' && codigoAdmin) {
      userData.codigoAdmin = codigoAdmin;
      console.log('👑 Usuario administrador, código incluido');
    }

    console.log('💾 Creando documento User...');
    user = new User(userData);

    // Guardar usuario
    console.log('💾 Guardando usuario en MongoDB...');
    await user.save();
    console.log('✅ Usuario guardado exitosamente:', user._id);

    // Generar token JWT
    console.log('🔑 Generando token JWT...');
    const token = user.getSignedJwtToken();

    // Preparar datos del usuario para la respuesta
    const responseUserData = {
      id: user._id,
      nombreCompleto: user.nombreCompleto,
      correoElectronico: user.correoElectronico,
      tipoUsuario: user.tipoUsuario,
      numeroDocumento: user.numeroDocumento,
      cargo: user.cargo || null,
      horarioAsignado: user.horarioAsignado || null
    };

    // Si es administrador, incluir código de administrador
    if (user.tipoUsuario === 'administrador') {
      responseUserData.codigoAdmin = user.codigoAdmin;
    }

    console.log('✅ Registro completado exitosamente');
    console.log('🔵 === FIN REGISTRO ===');

    // Responder con el token y datos del usuario
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      token,
      user: responseUserData
    });
  } catch (error) {
    console.error('❌ ERROR EN REGISTRO:', error);
    console.error('Stack trace:', error.stack);
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
    const { correoElectronico, password, codigoAdmin } = req.body;

    console.log('🔐 Intento de login:', { correoElectronico, tienePassword: !!password, tieneCodigoAdmin: !!codigoAdmin });

    // Validar que se proporcionó correo y contraseña
    if (!correoElectronico || !password) {
      console.log('❌ Login fallido: Datos incompletos');
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione correo electrónico y contraseña'
      });
    }

    // Buscar usuario y traer la contraseña (que normalmente está excluida)
    const user = await User.findOne({ correoElectronico }).select('+password');
    console.log('🔍 Usuario encontrado:', user ? `Sí (${user.tipoUsuario})` : 'No');

    // Verificar si el usuario existe
    if (!user) {
      console.log('❌ Usuario no encontrado en la base de datos');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si la contraseña coincide
    console.log('🔑 Verificando contraseña...');
    const isMatch = await user.matchPassword(password);
    console.log('🔑 Contraseña coincide:', isMatch);

    // Si la contraseña no coincide, verificar si es una contraseña legacy (btoa)
    if (!isMatch) {
      console.log('⚠️ Contraseña no coincide, verificando formato legacy...');
      const isLegacyMatch = user.isLegacyPassword(user.password, password);
      
      if (isLegacyMatch) {
        console.log('✅ Contraseña legacy detectada, actualizando...');
        // Actualizar a nuevo formato de contraseña
        user.password = password;
        await user.save();
      } else {
        console.log('❌ Credenciales incorrectas');
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
    }

    // Si es administrador, verificar código de administrador
    if (user.tipoUsuario === 'administrador') {
      console.log('🔐 Usuario es administrador, verificando código...');
      if (!codigoAdmin) {
        console.log('❌ Código de administrador no proporcionado');
        return res.status(401).json({
          success: false,
          message: 'Código de administrador requerido'
        });
      }

      console.log('🔍 Comparando códigos:', { almacenado: user.codigoAdmin, recibido: codigoAdmin });
      if (user.codigoAdmin !== codigoAdmin) {
        console.log('❌ Código de administrador incorrecto');
        return res.status(401).json({
          success: false,
          message: 'Código de administrador incorrecto'
        });
      }
      console.log('✅ Código de administrador correcto');
    }

    // Generar token JWT
    console.log('✅ Autenticación exitosa, generando token...');
    const token = user.getSignedJwtToken();

    // Preparar datos del usuario para la respuesta
    const userData = {
      id: user._id,
      nombreCompleto: user.nombreCompleto,
      correoElectronico: user.correoElectronico,
      tipoUsuario: user.tipoUsuario,
      numeroDocumento: user.numeroDocumento,
      cargo: user.cargo || null,
      horarioAsignado: user.horarioAsignado || null
    };

    // Si es administrador, incluir código de administrador
    if (user.tipoUsuario === 'administrador') {
      userData.codigoAdmin = user.codigoAdmin;
    }

    // Responder con token y datos del usuario
    console.log('📤 Enviando respuesta de login exitoso');
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: userData
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
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