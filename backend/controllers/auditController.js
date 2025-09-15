/**
 * IN OUT MANAGER - CONTROLADOR DE AUDITORÍA
 * @version 1.0.0
 * @description Controlador para consulta de registros de auditoría
 */

const Audit = require('../models/Audit');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/responseHandler');

/**
 * @desc    Obtener registros de auditoría (filtrados y paginados)
 * @route   GET /api/audit
 * @access  Privado/Admin
 */
exports.getAuditLogs = async (req, res, next) => {
  try {
    // Opciones de paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    // Construir filtros
    const filter = {};
    
    // Filtro por entidad
    if (req.query.entidad) {
      filter.entidad = req.query.entidad;
    }
    
    // Filtro por ID de entidad
    if (req.query.entidadId) {
      filter.entidadId = req.query.entidadId;
    }
    
    // Filtro por acción
    if (req.query.accion) {
      filter.accion = req.query.accion;
    }
    
    // Filtro por usuario que realizó la acción
    if (req.query.usuarioId) {
      filter.usuarioId = req.query.usuarioId;
    }
    
    // Filtro por rango de fechas
    if (req.query.fechaInicio || req.query.fechaFin) {
      filter.timestamp = {};
      
      if (req.query.fechaInicio) {
        filter.timestamp.$gte = new Date(req.query.fechaInicio);
      }
      
      if (req.query.fechaFin) {
        filter.timestamp.$lte = new Date(req.query.fechaFin);
      }
    }
    
    // Ejecutar consulta
    const logs = await Audit.find(filter)
      .sort({ timestamp: -1 }) // Más recientes primero
      .skip(startIndex)
      .limit(limit)
      .populate('usuarioId', 'nombreCompleto tipoUsuario');
    
    // Contar total de registros
    const total = await Audit.countDocuments(filter);
    
    // Información de paginación
    const pagination = {
      total,
      limit,
      page,
      pages: Math.ceil(total / limit)
    };
    
    return success(res, { 
      logs, 
      pagination 
    }, 'Registros de auditoría obtenidos correctamente');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Obtener registros de auditoría de una entidad específica
 * @route   GET /api/audit/:entidad/:entidadId
 * @access  Privado/Admin
 */
exports.getEntityAuditLogs = async (req, res, next) => {
  try {
    const { entidad, entidadId } = req.params;
    
    // Opciones de paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Ejecutar consulta
    const logs = await Audit.find({
      entidad,
      entidadId
    })
      .sort({ timestamp: -1 }) // Más recientes primero
      .skip(startIndex)
      .limit(limit)
      .populate('usuarioId', 'nombreCompleto tipoUsuario');
    
    // Contar total de registros
    const total = await Audit.countDocuments({
      entidad,
      entidadId
    });
    
    // Información de paginación
    const pagination = {
      total,
      limit,
      page,
      pages: Math.ceil(total / limit)
    };
    
    return success(res, { 
      logs, 
      pagination 
    }, `Historial de auditoría para ${entidad} ${entidadId}`);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Obtener detalle de un registro de auditoría
 * @route   GET /api/audit/log/:id
 * @access  Privado/Admin
 */
exports.getAuditLogById = async (req, res, next) => {
  try {
    const log = await Audit.findById(req.params.id)
      .populate('usuarioId', 'nombreCompleto tipoUsuario correoElectronico');
    
    if (!log) {
      return next(ApiError.notFound('Registro de auditoría'));
    }
    
    return success(res, { log }, 'Detalle de registro de auditoría');
  } catch (err) {
    next(err);
  }
};