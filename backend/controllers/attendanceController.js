<<<<<<< HEAD
// Controlador de asistencia
// Proyecto Final SENA
=======
/**
 * IN OUT MANAGER - CONTROLADOR DE ASISTENCIAS
 * @version 1.0.0
 * @description Controlador para gestión de registros de asistencia
 */
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c

const Attendance = require('../models/Attendance');
const User = require('../models/User');

<<<<<<< HEAD
// Registrar entrada/salida
=======
/**
 * @desc    Registrar nueva asistencia (entrada o salida)
 * @route   POST /api/attendance
 * @access  Privado
 */
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
exports.registerAttendance = async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user._id;
<<<<<<< HEAD
=======

    // Verificar tipo de registro
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (!['entrada', 'salida'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de registro inválido. Debe ser "entrada" o "salida"'
      });
    }

<<<<<<< HEAD
=======
    // Verificar si ya existe un registro del mismo tipo para hoy
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
<<<<<<< HEAD
=======

>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const existingRecord = await Attendance.findOne({
      userId,
      type,
      timestamp: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: `Ya ha registrado su ${type} de hoy`
      });
    }

<<<<<<< HEAD
=======
    // Crear registro de asistencia
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const attendance = new Attendance({
      userId,
      type,
      timestamp: new Date(),
      date: today.toLocaleDateString('es-ES'),
      time: new Date().toLocaleTimeString('es-ES')
    });

<<<<<<< HEAD
=======
    // Guardar registro
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    await attendance.save();

    res.status(201).json({
      success: true,
      message: `Registro de ${type} exitoso`,
      data: attendance
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

/**
<<<<<<< HEAD
 * @desc    
 * @route   
 * @access  
 */
exports.getUserAttendance = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30; 
    const startIndex = (page - 1) * limit;

=======
 * @desc    Obtener registros de asistencia de un usuario
 * @route   GET /api/attendance/user/:userId
 * @access  Privado (mismo usuario o admin)
 */
exports.getUserAttendance = async (req, res) => {
  try {
    // Opciones de filtrado
    const userId = req.params.userId;
    
    // Opciones de paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30; // Por defecto 30 registros
    const startIndex = (page - 1) * limit;
    
    // Filtros por fecha
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    let dateFilter = {};
    
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999); // Fin del día
      
      dateFilter = {
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      };
    } else if (req.query.startDate) {
      const startDate = new Date(req.query.startDate);
      dateFilter = {
        timestamp: {
          $gte: startDate
        }
      };
    } else if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999); // Fin del día
      
      dateFilter = {
        timestamp: {
          $lte: endDate
        }
      };
    }
<<<<<<< HEAD

    const typeFilter = req.query.type ? { type: req.query.type } : {};

=======
    
    // Filtro por tipo
    const typeFilter = req.query.type ? { type: req.query.type } : {};
    
    // Combinar filtros
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const filter = {
      userId,
      ...dateFilter,
      ...typeFilter
    };

<<<<<<< HEAD
    const attendanceRecords = await Attendance.find(filter)
      .sort({ timestamp: -1 }) 
      .limit(limit)
      .skip(startIndex);

    const total = await Attendance.countDocuments(filter);

=======
    // Ejecutar consulta
    const attendanceRecords = await Attendance.find(filter)
      .sort({ timestamp: -1 }) // Más recientes primero
      .limit(limit)
      .skip(startIndex);
    
    // Contar total de registros
    const total = await Attendance.countDocuments(filter);

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
      count: attendanceRecords.length,
      pagination,
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

/**
<<<<<<< HEAD
 * @desc   
 * @route   
 * @access  
=======
 * @desc    Obtener estadísticas semanales de asistencia
 * @route   GET /api/attendance/stats/weekly/:userId
 * @access  Privado (mismo usuario o admin)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
exports.getWeeklyStats = async (req, res) => {
  try {
    const userId = req.params.userId;
<<<<<<< HEAD
=======
    
    // Obtener fecha de inicio de la semana actual (domingo)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
<<<<<<< HEAD
=======
    // Fecha de fin de semana (sábado)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
<<<<<<< HEAD
=======
    // Buscar registros de la semana
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const attendanceRecords = await Attendance.find({
      userId,
      timestamp: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    }).sort({ timestamp: 1 });
<<<<<<< HEAD

=======
    
    // Procesar datos para la gráfica
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const stats = processWeeklyStats(attendanceRecords);
    
    res.status(200).json({
      success: true,
      data: stats,
      meta: {
        startOfWeek: startOfWeek.toISOString(),
        endOfWeek: endOfWeek.toISOString()
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas semanales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas semanales',
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
 * @desc    Obtener estadísticas mensuales de asistencia
 * @route   GET /api/attendance/stats/monthly/:userId
 * @access  Privado (mismo usuario o admin)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
exports.getMonthlyStats = async (req, res) => {
  try {
    const userId = req.params.userId;
<<<<<<< HEAD

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

=======
    
    // Obtener el primer día del mes actual
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    // Obtener el último día del mes actual
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    // Buscar registros del mes
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const attendanceRecords = await Attendance.find({
      userId,
      timestamp: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }).sort({ timestamp: 1 });
<<<<<<< HEAD

=======
    
    // Procesar datos para la gráfica
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const stats = processMonthlyStats(attendanceRecords, today.getMonth(), today.getFullYear());
    
    res.status(200).json({
      success: true,
      data: stats,
      meta: {
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString(),
        month: today.getMonth() + 1,
        year: today.getFullYear()
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas mensuales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas mensuales',
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
 * @desc    Eliminar un registro de asistencia
 * @route   DELETE /api/attendance/:id
 * @access  Privado (admin)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Registro de asistencia no encontrado'
      });
    }

    await attendance.remove();

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

/**
<<<<<<< HEAD
 * @desc   
 * @route   
 * @access  
 */
exports.getAllAttendance = async (req, res) => {
  try {

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const startIndex = (page - 1) * limit;

    let filter = {};

    if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    if (req.query.type) {
      filter.type = req.query.type;
    }

=======
 * @desc    Obtener todos los registros de asistencia (para administradores)
 * @route   GET /api/attendance/all
 * @access  Privado (admin)
 */
exports.getAllAttendance = async (req, res) => {
  try {
    // Opciones de paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const startIndex = (page - 1) * limit;
    
    // Filtros
    let filter = {};
    
    // Filtro por usuario
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    
    // Filtro por tipo
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // Filtro por fecha
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      filter.timestamp = {
        $gte: startDate,
        $lte: endDate
      };
    } else if (req.query.startDate) {
      const startDate = new Date(req.query.startDate);
      filter.timestamp = { $gte: startDate };
    } else if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
      filter.timestamp = { $lte: endDate };
    }

<<<<<<< HEAD
=======
    // Ejecutar consulta
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const attendanceRecords = await Attendance.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(startIndex)
      .populate('userId', 'nombreCompleto numeroDocumento'); // Traer datos del usuario
<<<<<<< HEAD

    const total = await Attendance.countDocuments(filter);

=======
    
    // Contar total de registros
    const total = await Attendance.countDocuments(filter);

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
      count: attendanceRecords.length,
      pagination,
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

<<<<<<< HEAD


/**
 * @param {Array} records 
 */
function processWeeklyStats(records) {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const entriesData = Array(7).fill(0);
  const exitsData = Array(7).fill(0);
  const workHoursData = Array(7).fill(0);

=======
// Funciones auxiliares para procesar estadísticas

/**
 * Procesar datos para estadísticas semanales
 * @param {Array} records - Registros de asistencia
 */
function processWeeklyStats(records) {
  // Nombres de los días de la semana
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Inicializar datos
  const entriesData = Array(7).fill(0);
  const exitsData = Array(7).fill(0);
  const workHoursData = Array(7).fill(0);
  
  // Agrupar registros por día de la semana
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  const recordsByDay = {};
  
  records.forEach(record => {
    const date = new Date(record.timestamp);
<<<<<<< HEAD
    const dayOfWeek = date.getDay(); 
=======
    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    
    if (!recordsByDay[dayOfWeek]) {
      recordsByDay[dayOfWeek] = { entries: [], exits: [] };
    }
    
    if (record.type === 'entrada') {
      recordsByDay[dayOfWeek].entries.push(record);
    } else {
      recordsByDay[dayOfWeek].exits.push(record);
    }
  });
  
<<<<<<< HEAD
=======
  // Procesar datos para cada día de la semana
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  for (let i = 0; i < 7; i++) {
    if (recordsByDay[i]) {
      entriesData[i] = recordsByDay[i].entries.length;
      exitsData[i] = recordsByDay[i].exits.length;
<<<<<<< HEAD
=======
      
      // Calcular horas trabajadas
      // Simplificación: consideramos 8 horas por cada par entrada/salida
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      workHoursData[i] = Math.min(entriesData[i], exitsData[i]) * 8;
    }
  }
  
  return {
    labels: dayNames,
    datasets: {
      entries: entriesData,
      exits: exitsData,
      workHours: workHoursData
    }
  };
}

/**
<<<<<<< HEAD

 * @param {Array} records 
 * @param {Number} month 
 * @param {Number} year - Año
 */
function processMonthlyStats(records, month, year) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();

=======
 * Procesar datos para estadísticas mensuales
 * @param {Array} records - Registros de asistencia
 * @param {Number} month - Mes (0-11)
 * @param {Number} year - Año
 */
function processMonthlyStats(records, month, year) {
  // Determinar el número de días en el mes
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Inicializar datos
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1); // [1, 2, ..., 30/31]
  const entriesData = Array(daysInMonth).fill(0);
  const exitsData = Array(daysInMonth).fill(0);
  const workHoursData = Array(daysInMonth).fill(0);
<<<<<<< HEAD

=======
  
  // Agrupar registros por día del mes
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  const recordsByDay = {};
  
  records.forEach(record => {
    const date = new Date(record.timestamp);
    const dayOfMonth = date.getDate(); // 1-31
    
    if (!recordsByDay[dayOfMonth]) {
      recordsByDay[dayOfMonth] = { entries: [], exits: [] };
    }
    
    if (record.type === 'entrada') {
      recordsByDay[dayOfMonth].entries.push(record);
    } else {
      recordsByDay[dayOfMonth].exits.push(record);
    }
  });
<<<<<<< HEAD

=======
  
  // Procesar datos para cada día del mes
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  for (let i = 1; i <= daysInMonth; i++) {
    if (recordsByDay[i]) {
      entriesData[i - 1] = recordsByDay[i].entries.length;
      exitsData[i - 1] = recordsByDay[i].exits.length;
<<<<<<< HEAD

=======
      
      // Calcular horas trabajadas
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      workHoursData[i - 1] = Math.min(entriesData[i - 1], exitsData[i - 1]) * 8;
    }
  }
  
  return {
    labels,
    datasets: {
      entries: entriesData,
      exits: exitsData,
      workHours: workHoursData
    }
  };
}