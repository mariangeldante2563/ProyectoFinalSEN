const Attendance = require('../models/Attendance');
const DailyStats = require('../models/DailyStats');
const TimeCalculationService = require('../services/TimeCalculationService');
const AttendanceService = require('../services/attendanceService');
const AttendanceCorrectionService = require('../services/attendanceCorrectionService');

exports.registerAttendance = async (req, res) => {
  try {
    const resultado = await AttendanceService.registerMark({
      userId: req.user._id,
      type: req.body.type,
      req
    });

    res.status(201).json({
      success: true,
      message: 'Marca registrada correctamente.',
      data: resultado.attendance,
      workSession: resultado.workSession
    });
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'Error al registrar asistencia',
      error: error.message
    });
  }
};

exports.getActiveSession = async (req, res) => {
  try {
    const workSession = await AttendanceService.getActiveSession(req.user._id);
    res.status(200).json({ success: true, data: workSession });
  } catch (error) {
    console.error('Error al consultar jornada activa:', error);
    res.status(500).json({ success: false, message: 'Error al consultar jornada activa' });
  }
};

exports.requestCorrection = async (req, res) => {
  try {
    const event = await AttendanceCorrectionService.requestCorrection({
      user: req.user,
      targetType: req.body.targetType,
      targetId: req.body.targetId,
      proposedValues: req.body.proposedValues,
      reason: req.body.reason,
      req
    });
    res.status(201).json({
      success: true,
      message: 'Solicitud de corrección registrada y pendiente de aprobación.',
      data: { requestId: event._id }
    });
  } catch (error) {
    console.error('Error al solicitar corrección:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'No fue posible registrar la solicitud de corrección.',
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
  res.status(501).json({
    success: false,
    message: 'La eliminación física de marcas está deshabilitada; use el flujo de corrección auditable.'
  });
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

  const date = {};
  if (query.startDate) date.$gte = query.startDate;
  if (query.endDate) date.$lte = query.endDate;
  return { date };
}

function buildTypeFilter(query) {
  const type = query.type || query.tipo;
  return type ? { type } : {};
}
