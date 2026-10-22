const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const WorkSession = require('../models/WorkSession');
const User = require('../models/User');
const DailyStats = require('../models/DailyStats');
const AuditService = require('./auditService');

const createServiceError = (status, message) => Object.assign(new Error(message), { status });

function validateMarkTransition({ type, user, openSession, timestamp }) {
  if (!['entrada', 'salida'].includes(type)) {
    throw createServiceError(400, 'El tipo de marca debe ser entrada o salida.');
  }
  if (!user) throw createServiceError(404, 'Empleado no encontrado.');
  if (!user.activo) throw createServiceError(403, 'El empleado no está habilitado para marcar.');
  if (type === 'entrada' && openSession) {
    throw createServiceError(409, 'Ya existe una jornada abierta para este empleado.');
  }
  if (type === 'salida' && !openSession) {
    throw createServiceError(409, 'No existe una jornada abierta para registrar salida.');
  }
  if (type === 'salida' && timestamp <= openSession.timestampEntrada) {
    throw createServiceError(409, 'La salida debe ser posterior a la entrada.');
  }
}

class AttendanceService {
  /**
   * Registra una marca y su sesión en una transacción con auditoría.
   * @param {Object} options Datos autenticados y de la marca
   * @returns {Promise<Object>} Marca y sesión actualizadas
   */
  static async registerMark({ userId, type, req, timestamp = new Date() }) {
    const session = await mongoose.startSession();
    let result;
    try {
      await session.withTransaction(async () => {
        const user = await User.findById(userId).session(session);
        if (!user) throw createServiceError(404, 'Empleado no encontrado.');
        if (!user.activo) throw createServiceError(403, 'El empleado no está habilitado para marcar.');

        const openSession = await WorkSession.findOne({
          userId,
          estado: { $in: ['activa', 'incompleta'] },
          timestampSalida: null
        }).session(session);
        validateMarkTransition({ type, user, openSession, timestamp });

        const attendance = new Attendance({ userId, type, timestamp });
        await attendance.save({ session });

        let workSession;
        if (type === 'entrada') {
          workSession = new WorkSession({
            userId,
            fecha: attendance.date,
            horaEntrada: attendance.time,
            timestampEntrada: timestamp,
            estado: 'activa',
            tiempoLaboradoMinutos: null,
            metadata: {
              entradaEstimada: false,
              cierreAutomatico: false,
              calculoVersion: null
            }
          });
          await workSession.save({ session });
        } else {
          workSession = await WorkSession.findOneAndUpdate(
            {
              _id: openSession._id,
              estado: 'activa',
              timestampSalida: null
            },
            {
              $set: {
                horaSalida: attendance.time,
                timestampSalida: timestamp,
                estado: 'completada'
              }
            },
            { new: true, runValidators: true, session }
          );
          if (!workSession) {
            throw createServiceError(409, 'La jornada ya fue cerrada por otra solicitud.');
          }
          await DailyStats.crearOActualizarEstadisticas(userId, timestamp, { session });
          workSession = await WorkSession.findById(workSession._id).session(session);
        }

        await AuditService.registrarAccion(
          user,
          'asistencia',
          attendance._id,
          type === 'entrada' ? 'marcar_entrada' : 'marcar_salida',
          {
            attendanceId: attendance._id,
            workSessionId: workSession._id,
            timestamp: attendance.timestamp,
            estadoAnterior: type === 'entrada' ? 'sin_jornada' : 'activa',
            estadoNuevo: workSession.estado
          },
          req,
          session
        );
        result = { attendance, workSession };
      });
      return result;
    } catch (error) {
      if (error.code === 11000) {
        throw createServiceError(409, 'Ya existe una jornada activa para este empleado.');
      }
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Obtiene la única jornada sin salida del empleado.
   * @param {string} userId Identificador del empleado
   * @returns {Promise<Object|null>} Jornada abierta o null
   */
  static async getActiveSession(userId) {
    return WorkSession.findOne({
      userId,
      estado: { $in: ['activa', 'incompleta'] },
      timestampSalida: null
    }).sort({ timestampEntrada: -1 });
  }

}

module.exports = AttendanceService;
module.exports.validateMarkTransition = validateMarkTransition;
