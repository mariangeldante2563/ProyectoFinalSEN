const Attendance = require('../models/Attendance');
const DailyStats = require('../models/DailyStats');
const TimeCalculationService = require('../services/TimeCalculationService');
const AuditService = require('../services/auditService');

exports.registerAttendance = async (req, res) => {
  try {
    const { type, timestamp, location } = req.body;
    const userId = req.user._id;

    if (!['entrada', 'salida'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de registro invalido. Debe ser "entrada" o "salida"'
      });
    }

    const resultado = await TimeCalculationService.procesarRegistroAsistencia(
      userId,
      type,
      timestamp ? new Date(timestamp) : new Date(),
      location || null
    );

    await AuditService.registrarAccion(
      req.user,
      'asistencia',
      resultado.registro._id,
      type,
      {
        accion: resultado.accion,
        mensaje: resultado.mensaje,
        sesionId: resultado.sesion?._id,
        estadisticasActualizadas: !!resultado.estadisticas
      },
      req
    );

    res.status(201).json({
      success: true,
      message: resultado.mensaje,
      data: resultado.registro,
      workSession: resultado.sesion,
      estadisticas: resultado.estadisticas,
      accion: resultado.accion
    });
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar asistencia',
      error: error.message
    });
  }
};

exports.getUserAttendance = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const skip = (page - 1) * limit;
    const filter = { userId, ...buildDateFilter(req.query), ...buildTypeFilter(req.query) };

    const [attendanceRecords, total] = await Promise.all([
      Attendance.find(filter).sort({ timestamp: -1 }).limit(limit).skip(skip),
      Attendance.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      pagination: {
        total,
        limit,
        page,
        pages: Math.ceil(total / limit)
      },
      data: attendanceRecords
    });
  } catch (error) {
    console.error('Error al obtener registros de asistencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener registros de asistencia',
      error: error.message
    });
  }
};

exports.getWeeklyStats = async (req, res) => {
  try {
    const data = await DailyStats.obtenerEstadisticasSemanales(req.params.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error al obtener estadisticas semanales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadisticas semanales',
      error: error.message
    });
  }
};

exports.getMonthlyStats = async (req, res) => {
  try {
    const data = await DailyStats.obtenerEstadisticasMensuales(req.params.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error al obtener estadisticas mensuales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadisticas mensuales',
      error: error.message
    });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Registro de asistencia no encontrado'
      });
    }

    await attendance.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Registro de asistencia eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar registro de asistencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar registro de asistencia',
      error: error.message
    });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const skip = (page - 1) * limit;
    const filter = { ...buildDateFilter(req.query), ...buildTypeFilter(req.query) };

    if (req.query.userId) filter.userId = req.query.userId;

    const [attendanceRecords, total] = await Promise.all([
      Attendance.find(filter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .populate('userId', 'nombreCompleto numeroDocumento'),
      Attendance.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      pagination: {
        total,
        limit,
        page,
        pages: Math.ceil(total / limit)
      },
      data: attendanceRecords
    });
  } catch (error) {
    console.error('Error al obtener registros de asistencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener registros de asistencia',
      error: error.message
    });
  }
};

exports.getLaborHoursSummary = async (req, res) => {
  try {
    const resumen = await TimeCalculationService.obtenerTablaHorasLaborales({
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: req.query.page,
      limit: req.query.limit
    });

    res.status(200).json({
      success: true,
      data: resumen.rows,
      pagination: resumen.pagination,
      leyAplicada: resumen.leyAplicada
    });
  } catch (error) {
    console.error('Error al obtener tabla laboral:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tabla laboral',
      error: error.message
    });
  }
};

function buildDateFilter(query) {
  if (!query.startDate && !query.endDate) return {};

  const timestamp = {};
  if (query.startDate) timestamp.$gte = new Date(query.startDate);
  if (query.endDate) {
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);
    timestamp.$lte = endDate;
  }

  return { timestamp };
}

function buildTypeFilter(query) {
  const type = query.type || query.tipo;
  return type ? { type } : {};
}
