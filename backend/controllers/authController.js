<<<<<<< HEAD
// Controlador de autenticación
// Autor: Aprendiz SENA
=======
/**
 * IN OUT MANAGER - CONTROLADOR DE AUTENTICACIÓN
 * @version 1.0.0
 * @description Controlador para manejo de autenticación y autorización
 */
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c

const User = require('../models/User');
const crypto = require('crypto');
const config = require('../config/config');

<<<<<<< HEAD
const recoveryCodes = {};

// Registro de nuevos usuarios
exports.register = async (req, res) => {
  try {
    console.log(' === INICIO REGISTRO ===');
    console.log(' Body recibido:', JSON.stringify(req.body, null, 2));
=======
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    
    const { 
      nombreCompleto, 
      numeroDocumento, 
      correoElectronico, 
      password,
      tipoUsuario,
      codigoAdmin,
      edad,
      cargo,
      horarioAsignado,
      telefono,
      direccion,
      fechaIngreso,
      departamento
    } = req.body;

<<<<<<< HEAD
    console.log(' Datos extraídos:', {
=======
    console.log('✅ Datos extraídos:', {
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      nombreCompleto,
      numeroDocumento,
      correoElectronico,
      password: password ? '***' : undefined,
      tipoUsuario,
      edad,
      cargo,
      horarioAsignado,
      telefono,
      direccion,
      fechaIngreso,
      departamento,
      codigoAdmin
    });

<<<<<<< HEAD
  
=======
    // Verificar si ya existe usuario con ese documento o correo
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    console.log(' Verificando si existe usuario...');
    let user = await User.findOne({ 
      $or: [
        { numeroDocumento },
        { correoElectronico }
      ]
    });

    if (user) {
      console.log(' Usuario ya existe:', user.correoElectronico);
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con ese documento o correo electrónico'
      });
    }

    console.log(' Usuario no existe, procediendo a crear...');

<<<<<<< HEAD
=======
    // Crear nuevo usuario
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const userData = {
      nombreCompleto,
      numeroDocumento,
      correoElectronico,
      password,
      tipoUsuario: tipoUsuario || 'empleado',
      edad,
      cargo,
      horarioAsignado,
      telefono,
      direccion,
      fechaIngreso,
      departamento
    };

    console.log('📋 userData preparado:', { ...userData, password: '***' });

<<<<<<< HEAD
=======
    // Si es administrador, incluir código de administrador
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (tipoUsuario === 'administrador' && codigoAdmin) {
      userData.codigoAdmin = codigoAdmin;
      console.log('👤 Usuario administrador, código incluido');
    }

    console.log(' Creando documento User...');
    user = new User(userData);

<<<<<<< HEAD
=======
    // Guardar usuario
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    console.log(' Guardando usuario en MongoDB...');
    await user.save();
    console.log(' Usuario guardado exitosamente:', user._id);

<<<<<<< HEAD
    console.log(' Generando token JWT...');
    const token = user.getSignedJwtToken();

=======
    // Generar token JWT
    console.log(' Generando token JWT...');
    const token = user.getSignedJwtToken();

    // Preparar datos del usuario para la respuesta
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const responseUserData = {
      id: user._id,
      nombreCompleto: user.nombreCompleto,
      correoElectronico: user.correoElectronico,
      tipoUsuario: user.tipoUsuario,
      numeroDocumento: user.numeroDocumento,
      cargo: user.cargo || null,
      horarioAsignado: user.horarioAsignado || null
    };

<<<<<<< HEAD
=======
    // Si es administrador, incluir código de administrador
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (user.tipoUsuario === 'administrador') {
      responseUserData.codigoAdmin = user.codigoAdmin;
    }

    console.log(' Registro completado exitosamente');
    console.log(' === FIN REGISTRO ===');

<<<<<<< HEAD
=======
    // Responder con el token y datos del usuario
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      token,
      user: responseUserData
    });
  } catch (error) {
    console.error(' ERROR EN REGISTRO:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

/**
<<<<<<< HEAD
 * @desc   
 * @route   
 * @access 
 */
exports.login = async (req, res) => {
  try {
    console.log('[auth/login] body:', req.body); // log temporal; quitar al finalizar depuración
    const rawEmail = (req.body.correoElectronico || '').toString();
    const correoElectronico = rawEmail.trim().toLowerCase();
    const password = req.body.password;
    const codigoAdmin = req.body.codigoAdmin;

    // Logs temporales de diagnóstico (no exponen password)
    console.log(' Login intento -> correoNormalizado:', correoElectronico);
    console.log(' Mongo URI (host/db):', (process.env.MONGODB_URI || '').replace(/^(mongodb(?:\+srv)?:\/\/)(.*?)(\@)?(.*)$/i, (m, p1, p2, p3, p4) => {
      // Muestra solo host y db sin credenciales
      const rest = p3 ? p4 : p2;
      return p1 + rest;
    }));

=======
 * @desc    Login de usuario
 * @route   POST /api/auth/login
 * @access  Público
 */
exports.login = async (req, res) => {
  try {
    const { correoElectronico, password, codigoAdmin } = req.body;

    console.log(' Intento de login:', { correoElectronico, tienePassword: !!password, tieneCodigoAdmin: !!codigoAdmin });

    // Validar que se proporcionó correo y contraseña
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (!correoElectronico || !password) {
      console.log(' Login fallido: Datos incompletos');
      return res.status(400).json({
        success: false,
<<<<<<< HEAD
        message: 'Error en los datos de entrada',
        errors: [{ field: 'correoElectronico', message: 'El correo electrónico y la contraseña son obligatorios' }]
      });
    }

    const user = await User.findOne({ correoElectronico }).select('+password');
    console.log(' Usuario encontrado:', user ? `Sí (${user.tipoUsuario})` : 'No');
    if (user) {
      console.log(' Estado usuario:', { activo: user.activo, id: user._id });
      const pwdType = typeof user.password;
      const pwdLen = typeof user.password === 'string' ? user.password.length : null;
      const bcryptPrefix = typeof user.password === 'string' ? user.password.slice(0, 4) : null;
      console.log(' Password meta -> type/len/prefix:', { pwdType, pwdLen, bcryptPrefix });
    }

=======
        message: 'Por favor, proporcione correo electrónico y contraseña'
      });
    }

    // Buscar usuario y traer la contraseña (que normalmente está excluida)
    const user = await User.findOne({ correoElectronico }).select('+password');
    console.log(' Usuario encontrado:', user ? `Sí (${user.tipoUsuario})` : 'No');

    // Verificar si el usuario existe
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (!user) {
      console.log(' Usuario no encontrado en la base de datos');
      return res.status(401).json({
        success: false,
<<<<<<< HEAD
        message: 'Credenciales inválidas',
        errors: [{ field: 'credenciales', message: 'Usuario o contraseña inválidos' }]
      });
    }

    const isAdmin = user.tipoUsuario === 'administrador';

    // Validación condicional de código admin solo si el usuario es admin
    if (isAdmin) {
      if (!codigoAdmin) {
        console.log(' Código de administrador faltante para usuario admin');
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
          errors: [{ field: 'codigoAdmin', message: 'Código de administrador requerido' }]
        });
      }

      const adminCodeRegex = /^\d{4}$/;
      if (!adminCodeRegex.test(String(codigoAdmin))) {
        console.log(' Código de administrador con formato inválido');
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
          errors: [{ field: 'codigoAdmin', message: 'El código de administrador debe ser un número de máximo 4 dígitos' }]
        });
      }

      if (user.codigoAdmin !== String(codigoAdmin)) {
        console.log(' Código de administrador no coincide');
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
          errors: [{ field: 'codigoAdmin', message: 'Código de administrador incorrecto' }]
        });
      }
    }

    console.log(' Verificando contraseña...');
    const isMatch = await user.matchPassword(password);
    console.log(' Contraseña coincide (bcrypt.compare):', isMatch);

    if (!isMatch) {
      console.log(' Credenciales incorrectas (password)');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        errors: [{ field: 'credenciales', message: 'Usuario o contraseña inválidos' }]
      });
    }

    console.log(' Autenticación exitosa, generando token...');
    const token = user.getSignedJwtToken();

=======
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si la contraseña coincide
    console.log(' Verificando contraseña...');
    const isMatch = await user.matchPassword(password);
    console.log(' Contraseña coincide:', isMatch);

    // Si la contraseña no coincide, verificar si es una contraseña legacy (btoa)
    if (!isMatch) {
      console.log(' Contraseña no coincide, verificando formato legacy...');
      const isLegacyMatch = user.isLegacyPassword(user.password, password);
      
      if (isLegacyMatch) {
        console.log(' Contraseña legacy detectada, actualizando...');
        // Actualizar a nuevo formato de contraseña
        user.password = password;
        await user.save();
      } else {
        console.log(' Credenciales incorrectas');
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
    }

    // Si es administrador, verificar código de administrador
    if (user.tipoUsuario === 'administrador') {
      console.log(' Usuario es administrador, verificando código...');
      if (!codigoAdmin) {
        console.log(' Código de administrador no proporcionado');
        return res.status(401).json({
          success: false,
          message: 'Código de administrador requerido'
        });
      }

      console.log('🔍 Comparando códigos:', { almacenado: user.codigoAdmin, recibido: codigoAdmin });
      if (user.codigoAdmin !== codigoAdmin) {
        console.log(' Código de administrador incorrecto');
        return res.status(401).json({
          success: false,
          message: 'Código de administrador incorrecto'
        });
      }
      console.log(' Código de administrador correcto');
    }

    // Generar token JWT
    console.log(' Autenticación exitosa, generando token...');
    const token = user.getSignedJwtToken();

    // Preparar datos del usuario para la respuesta
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const userData = {
      id: user._id,
      nombreCompleto: user.nombreCompleto,
      correoElectronico: user.correoElectronico,
      tipoUsuario: user.tipoUsuario,
      numeroDocumento: user.numeroDocumento,
      cargo: user.cargo || null,
      horarioAsignado: user.horarioAsignado || null
    };

<<<<<<< HEAD
=======
    // Si es administrador, incluir código de administrador
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (user.tipoUsuario === 'administrador') {
      userData.codigoAdmin = user.codigoAdmin;
    }

<<<<<<< HEAD
    console.log(' Enviando respuesta de login exitoso');
    res.status(200).json({
      success: true,
=======
    // Responder con token y datos del usuario
    console.log(' Enviando respuesta de login exitoso');
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      token,
      user: userData
    });
  } catch (error) {
    console.error(' Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

/**
<<<<<<< HEAD
 * @desc    
 * @route   
 * @access 
=======
 * @desc    Iniciar proceso de recuperación de contraseña
 * @route   POST /api/auth/recover-password
 * @access  Público
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
exports.recoverPassword = async (req, res) => {
  try {
    const { correoElectronico, numeroDocumento } = req.body;

<<<<<<< HEAD
=======
    // Buscar usuario
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const user = await User.findOne({ 
      correoElectronico, 
      numeroDocumento 
    });

<<<<<<< HEAD
=======
    // Si no se encuentra el usuario, responder de forma genérica por seguridad
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si los datos proporcionados son correctos, recibirá un código de verificación.'
      });
    }

<<<<<<< HEAD
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    

    recoveryCodes[correoElectronico] = {
      code: verificationCode,
      userId: user._id,
      expires: Date.now() + (15 * 60 * 1000) 
    };

    console.log(`Código de verificación para ${correoElectronico}: ${verificationCode}`);

    res.status(200).json({
      success: true,
      message: 'Código de verificación enviado al correo electrónico',
=======
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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
<<<<<<< HEAD
 * @desc    
 * @route   
 * @access  
=======
 * @desc    Verificar código de recuperación
 * @route   POST /api/auth/verify-code
 * @access  Público
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
exports.verifyCode = async (req, res) => {
  try {
    const { correoElectronico, codigoVerificacion } = req.body;
<<<<<<< HEAD
=======

    // Verificar si existe un código para ese correo
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const recoveryData = recoveryCodes[correoElectronico];
    
    if (!recoveryData) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificación inválido o expirado'
      });
    }

<<<<<<< HEAD
=======
    // Verificar si el código ha expirado
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (Date.now() > recoveryData.expires) {
      delete recoveryCodes[correoElectronico];
      
      return res.status(400).json({
        success: false,
        message: 'El código de verificación ha expirado'
      });
    }
<<<<<<< HEAD
=======

    // Verificar si el código es correcto
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (recoveryData.code !== codigoVerificacion) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificación incorrecto'
      });
    }

<<<<<<< HEAD
=======
    // Marcar el código como verificado para permitir el cambio de contraseña
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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
<<<<<<< HEAD
 * @desc    
 * @route   
 * @access  
=======
 * @desc    Establecer nueva contraseña
 * @route   POST /api/auth/reset-password
 * @access  Público (con verificación previa)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
exports.resetPassword = async (req, res) => {
  try {
    const { correoElectronico, codigoVerificacion, newPassword } = req.body;
<<<<<<< HEAD
=======

    // Verificar si existe un código verificado para ese correo
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const recoveryData = recoveryCodes[correoElectronico];
    
    if (!recoveryData || !recoveryData.verified || recoveryData.code !== codigoVerificacion) {
      return res.status(400).json({
        success: false,
        message: 'No autorizado para cambiar la contraseña'
      });
    }
<<<<<<< HEAD
=======

    // Verificar si el código ha expirado
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (Date.now() > recoveryData.expires) {
      delete recoveryCodes[correoElectronico];
      
      return res.status(400).json({
        success: false,
        message: 'La sesión de recuperación ha expirado'
      });
    }
<<<<<<< HEAD
=======

    // Buscar usuario
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const user = await User.findOne({ correoElectronico });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
<<<<<<< HEAD
    user.password = newPassword;
    await user.save();

=======

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    // Eliminar código de recuperación
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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
<<<<<<< HEAD
 * @desc    
 * @route   
 * @access  
 */
exports.getMe = async (req, res) => {
  try {
=======
 * @desc    Obtener información del usuario actual
 * @route   GET /api/auth/me
 * @access  Privado
 */
exports.getMe = async (req, res) => {
  try {
    // req.user viene del middleware protect
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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