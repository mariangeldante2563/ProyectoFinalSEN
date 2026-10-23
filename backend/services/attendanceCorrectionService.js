const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const WorkSession = require('../models/WorkSession');
const AuditService = require('./auditService');

const createServiceError = (status, message) => Object.assign(new Error(message), { status });

class AttendanceCorrectionService {
  /**
   * Registra una solicitud de corrección sin alterar las marcas originales.
   * @param {Object} options Datos de la solicitud y actor autenticado
   * @returns {Promise<Object>} Evento de auditoría que identifica la solicitud
   */
  static async requestCorrection({ user, targetType, targetId, proposedValues, reason, req }) {
    const session = await mongoose.startSession();
    let requestEvent;
    try {
      await session.withTransaction(async () => {
        if (targetType === 'attendance') {
          const attendance = await Attendance.findOne({
            _id: targetId,
            userId: user._id
          }).session(session);
          if (!attendance) throw createServiceError(404, 'No se encontró una marca propia.');

          requestEvent = await AuditService.registrarAccion(
            user,
            'asistencia',
            attendance._id,
            'solicitar_correccion',
            {
              targetType,
              targetId: attendance._id,
              proposedValues,
              reason: reason.trim(),
              status: 'pending',
              estadoAnterior: null,
              estadoNuevo: null
            },
            req,
            session
          );
          return;
        } else if (targetType === 'workSession') {
          const workSession = await WorkSession.findOne({
            _id: targetId,
            userId: user._id,
            estado: { $in: ['activa', 'incompleta'] },
            timestampSalida: null
          }).session(session);
          if (!workSession) throw createServiceError(404, 'No se encontró una jornada incompleta propia.');

          const exitValue = proposedValues.timestampSalida;
          const proposedExit = new Date(exitValue);
          if (!exitValue || Number.isNaN(proposedExit.getTime()) || proposedExit <= workSession.timestampEntrada) {
            throw createServiceError(400, 'La hora de salida propuesta debe ser válida y posterior a la entrada.');
          }

          const previousStatus = workSession.estado;
          workSession.estado = 'incompleta';
          await workSession.save({ session });
          requestEvent = await AuditService.registrarAccion(
            user,
            'asistencia',
            workSession._id,
            'solicitar_correccion',
            {
              targetType,
              targetId: workSession._id,
              proposedValues: { timestampSalida: proposedExit },
              reason: reason.trim(),
              status: 'pending',
              estadoAnterior: previousStatus,
              estadoNuevo: 'incompleta'
            },
            req,
            session
          );
        } else {
          throw createServiceError(400, 'Tipo de objetivo debe ser attendance o workSession.');
        }
      });
      return requestEvent;
    } finally {
      await session.endSession();
    }
  }
}

module.exports = AttendanceCorrectionService;
