<<<<<<< HEAD
// Controlador de usuarios
// Autor: Desarrollo SENA
=======
/**
 * IN OUT MANAGER - CONTROLADOR DE USUARIOS
 * @version 1.0.0
 * @description Controlador para gestión de usuarios
 */
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c

const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { success, error, notFound, validationError } = require('../utils/responseHandler');
const AuditService = require('../services/auditService');

<<<<<<< HEAD
// Obtener todos los usuarios
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const filter = {};

    if (req.query.mostrarInactivos === 'true') {
    } else if (req.query.mostrarInactivos === 'false') {
      filter.activo = true;
    } else {
=======
/**
 * @desc    Obtener todos los usuarios
 * @route   GET /api/users
 * @access  Privado/Admin
 */
exports.getUsers = async (req, res, next) => {
  try {
    // Opciones de paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Filtros
    const filter = {};
    
    // Por defecto, solo mostrar usuarios activos a menos que se indique lo contrario
    if (req.query.mostrarInactivos === 'true') {
      // Si se solicitan inactivos, no aplicar filtro de activos
    } else if (req.query.mostrarInactivos === 'false') {
      filter.activo = true; // Solo activos
    } else {
      // Por defecto, solo mostrar activos
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      filter.activo = true;
    }
    
    if (req.query.tipoUsuario) {
      filter.tipoUsuario = req.query.tipoUsuario;
    }
    
    if (req.query.search) {
      filter.$or = [
        { nombreCompleto: { $regex: req.query.search, $options: 'i' } },
        { correoElectronico: { $regex: req.query.search, $options: 'i' } },
        { numeroDocumento: { $regex: req.query.search, $options: 'i' } }
      ];
    }
<<<<<<< HEAD
=======

    // Ejecutar consulta
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const users = await User.find(filter)
      .select('-password')
      .limit(limit)
      .skip(startIndex)
      .sort({ createdAt: -1 });
<<<<<<< HEAD

    const total = await User.countDocuments(filter);

=======
    
    // Contar total de usuarios
    const total = await User.countDocuments(filter);

    // Información de paginación
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const pagination = {
      total,
      limit,
      page,
      pages: Math.ceil(total / limit)
    };

    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
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
 * @desc    Obtener un usuario por ID
 * @route   GET /api/users/:id
 * @access  Privado (mismo usuario o admin)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    
<<<<<<< HEAD
=======
    // Verificar si es un error de ID inválido
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido',
        error: 'ID no válido'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
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
exports.updateUser = async (req, res, next) => {
  try {
=======
 * @desc    Actualizar un usuario
 * @route   PUT /api/users/:id
 * @access  Privado (mismo usuario o admin)
 */
exports.updateUser = async (req, res, next) => {
  try {
    // Campos permitidos para actualización
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const allowedUpdates = [
      'nombreCompleto', 
      'edad', 
      'cargo', 
      'horarioAsignado'
    ];
<<<<<<< HEAD

    if (req.user.tipoUsuario === 'administrador') {
      allowedUpdates.push('tipoUsuario');
    }

=======
    
    // Si es administrador, permitir actualizar más campos
    if (req.user.tipoUsuario === 'administrador') {
      allowedUpdates.push('tipoUsuario');
    }
    
    // Crear objeto con los campos permitidos
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

<<<<<<< HEAD
=======
    // Obtener el usuario antes de actualizar para auditoría
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const userAnterior = await User.findById(req.params.id).select('-password');
    
    if (!userAnterior) {
      return next(ApiError.notFound('Usuario'));
    }
<<<<<<< HEAD
r
=======

    // Buscar y actualizar
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const userNuevo = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
<<<<<<< HEAD

=======
    
    // Registrar la acción de auditoría
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const AuditService = require('../services/auditService');
    await AuditService.registrarCambios(
      req.user, 
      'usuario', 
      userNuevo._id, 
      userAnterior.toObject(), 
      userNuevo.toObject(), 
      req
    );

    return success(res, { user: userNuevo }, 'Usuario actualizado correctamente');
  } catch (err) {
    next(err);
  }
};

/**
<<<<<<< HEAD
 * @desc   
 * @route  
 * @access 
 */
exports.updateProfilePhoto = async (req, res) => {
  try {
=======
 * @desc    Actualizar foto de perfil
 * @route   PUT /api/users/:id/profile-photo
 * @access  Privado (mismo usuario o admin)
 */
exports.updateProfilePhoto = async (req, res) => {
  try {
    // El middleware de multer ya procesó la imagen y la guardó
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha subido ninguna imagen'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

<<<<<<< HEAD
=======
    // Guardar la ruta relativa de la imagen en la base de datos
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const fotoPerfil = `profiles/${req.file.filename}`;
    user.fotoPerfil = fotoPerfil;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Foto de perfil actualizada correctamente',
      data: {
        fotoPerfil
      }
    });
  } catch (error) {
    console.error('Error al actualizar foto de perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar foto de perfil',
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
 * @desc    Desactivar un usuario (soft delete)
 * @route   DELETE /api/users/:id
 * @access  Privado/Admin
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(ApiError.notFound('Usuario'));
    }
<<<<<<< HEAD

    if (!user.activo) {
      return next(ApiError.validationError('El usuario ya se encuentra desactivado'));
    }

    user.activo = false;
    user.fechaDesactivacion = new Date();
    await user.save();

=======
    
    // Si ya está desactivado, informar
    if (!user.activo) {
      return next(ApiError.validationError('El usuario ya se encuentra desactivado'));
    }
    
    // Implementar soft delete
    user.activo = false;
    user.fechaDesactivacion = new Date();
    await user.save();
    
    // Registrar la acción de auditoría
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    await AuditService.registrarAccion(
      req.user,
      'usuario',
      user._id,
      'cambiar_estado',
      {
        estadoAnterior: true,
        estadoNuevo: false,
        fechaDesactivacion: user.fechaDesactivacion
      },
      req
    );

    return success(res, null, 'Usuario desactivado correctamente');
  } catch (err) {
    next(err);
  }
};

/**
<<<<<<< HEAD
 * @desc    
 * @route   
 * @access  
=======
 * @desc    Reactivar un usuario
 * @route   PUT /api/users/:id/activate
 * @access  Privado/Admin
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
exports.activateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(ApiError.notFound('Usuario'));
    }
    
<<<<<<< HEAD
    if (user.activo) {
      return next(ApiError.validationError('El usuario ya se encuentra activo'));
    }
 
    user.activo = true;
    user.fechaDesactivacion = null;
    await user.save();

=======
    // Si ya está activo, informar
    if (user.activo) {
      return next(ApiError.validationError('El usuario ya se encuentra activo'));
    }
    
    // Reactivar usuario
    user.activo = true;
    user.fechaDesactivacion = null;
    await user.save();
    
    // Registrar la acción de auditoría
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    await AuditService.registrarAccion(
      req.user,
      'usuario',
      user._id,
      'cambiar_estado',
      {
        estadoAnterior: false,
        estadoNuevo: true,
        fechaReactivacion: new Date()
      },
      req
    );

    return success(res, null, 'Usuario activado correctamente');
  } catch (err) {
    next(err);
  }
};

/**
<<<<<<< HEAD
 * @desc    
 * @route  
 * @access 
 */
exports.getCurrentUser = async (req, res, next) => {
  try {

=======
 * @desc    Obtener usuario autenticado
 * @route   GET /api/users/me
 * @access  Privado
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    // Obtener el usuario actual usando el ID del token JWT (req.user)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return next(ApiError.notFound('Usuario'));
    }

    return success(res, { user }, 'Perfil de usuario obtenido correctamente');
  } catch (err) {
    next(err);
  }
};

/**
<<<<<<< HEAD
 * @desc    
 * @route   
 * @access 
=======
 * @desc    Cambiar contraseña de usuario
 * @route   PUT /api/users/:id/change-password
 * @access  Privado (mismo usuario o admin)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
<<<<<<< HEAD
=======
    // Validar datos de entrada
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere contraseña actual y nueva'
      });
    }

<<<<<<< HEAD
=======
    // Buscar usuario
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const user = await User.findById(req.params.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

<<<<<<< HEAD
=======
    // Si no es administrador, verificar contraseña actual
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (req.user.tipoUsuario !== 'administrador') {
      const isMatch = await user.matchPassword(currentPassword);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }
    }

<<<<<<< HEAD
=======
    // Actualizar contraseña
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
};