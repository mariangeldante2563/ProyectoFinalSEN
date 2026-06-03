<<<<<<< HEAD
// Controlador de reportes
=======
/**
 * IN OUT MANAGER - CONTROLADOR DE REPORTES
 * @version 1.0.0
 * @description Controlador para generar y descargar reportes
 */
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c

const path = require('path');
const fs = require('fs');
const ExcelGenerator = require('../utils/reports/excelGenerator');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const config = require('../config/config');

/**
<<<<<<< HEAD
 
 * @param {Request} req 
 * @param {Response} res 
=======
 * Genera un reporte de asistencia para un usuario específico
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
async function generateUserReport(req, res) {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
<<<<<<< HEAD
=======
    // Validar si el usuario existe
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Usuario no encontrado' 
      });
    }
<<<<<<< HEAD

    const query = { userId: userId };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

=======
    
    // Construir query de búsqueda
    const query = { userId: userId };
    
    // Añadir filtro por fechas si se proporcionaron
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Obtener registros de asistencia
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const attendanceRecords = await Attendance.find(query).sort({ date: 1, time: 1 });
    
    if (attendanceRecords.length === 0) {
      return res.status(404).json({ 
        success: false, 
        msg: 'No hay registros de asistencia para el período especificado' 
      });
    }
<<<<<<< HEAD

=======
    
    // Preparar datos del usuario para el reporte
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const userData = {
      nombreCompleto: user.nombreCompleto,
      numeroDocumento: user.numeroDocumento,
      cargo: user.cargo
    };
<<<<<<< HEAD

=======
    
    // Generar reporte Excel
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const reportInfo = await ExcelGenerator.generateAttendanceReport({
      userId: userId,
      userData: userData,
      attendanceData: attendanceRecords,
      startDate,
      endDate
    });
<<<<<<< HEAD

=======
    
    // Devolver la URL para descargar el reporte
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    res.status(200).json({
      success: true,
      msg: 'Reporte generado exitosamente',
      data: {
        reportUrl: `/api/${reportInfo.downloadPath}`,
        fileName: reportInfo.fileName
      }
    });
  } catch (error) {
    console.error('Error generando reporte de usuario:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al generar el reporte',
      error: error.message
    });
  }
}

/**
<<<<<<< HEAD

 * @param {Request} req 
 * @param {Response} res 
=======
 * Genera un reporte general de asistencia (todos los usuarios)
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
async function generateGeneralReport(req, res) {
  try {
    const { startDate, endDate } = req.query;
<<<<<<< HEAD

    const query = {};

=======
    
    // Construir query de búsqueda
    const query = {};
    
    // Añadir filtro por fechas si se proporcionaron
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Obtener registros de asistencia populados con datos de usuario
    const attendanceRecords = await Attendance.find(query)
                                             .populate('userId', 'nombreCompleto numeroDocumento cargo')
                                             .sort({ date: 1, time: 1 });
    
    if (attendanceRecords.length === 0) {
      return res.status(404).json({ 
        success: false, 
        msg: 'No hay registros de asistencia para el período especificado' 
      });
    }
    
<<<<<<< HEAD
    // Generar reporte de excel
=======
    // Generar reporte Excel
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const reportInfo = await ExcelGenerator.generateGeneralAttendanceReport({
      attendanceData: attendanceRecords,
      startDate,
      endDate
    });
    
<<<<<<< HEAD
=======
    // Devolver la URL para descargar el reporte
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    res.status(200).json({
      success: true,
      msg: 'Reporte general generado exitosamente',
      data: {
        reportUrl: `/api/${reportInfo.downloadPath}`,
        fileName: reportInfo.fileName
      }
    });
  } catch (error) {
    console.error('Error generando reporte general:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al generar el reporte general',
      error: error.message
    });
  }
}

/**
<<<<<<< HEAD
 * @param {Request} req 
 * @param {Response} res 
=======
 * Descarga un archivo de reporte por su nombre
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */
function downloadReport(req, res) {
  try {
    const { fileName } = req.params;
<<<<<<< HEAD

=======
    
    // Validar nombre de archivo
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (!fileName || !fileName.endsWith('.xlsx')) {
      return res.status(400).json({
        success: false,
        msg: 'Nombre de archivo inválido'
      });
    }
    
    // Ruta al archivo
    const filePath = path.join(__dirname, '../', config.paths.reports, fileName);
<<<<<<< HEAD

=======
    
    // Verificar si el archivo existe
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        msg: 'Archivo no encontrado'
      });
    }
<<<<<<< HEAD

=======
    
    // Enviar el archivo como descarga
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error al descargar el archivo:', err);
        res.status(500).json({
          success: false,
          msg: 'Error al descargar el archivo',
          error: err.message
        });
      }
    });
  } catch (error) {
    console.error('Error en descarga de reporte:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al procesar la descarga',
      error: error.message
    });
  }
}

module.exports = {
  generateUserReport,
  generateGeneralReport,
  downloadReport
};