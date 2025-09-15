/**
 * IN OUT MANAGER - SCRIPT DE LIMPIEZA DE BASE DE DATOS
 * @version 1.0.0
 * @description Script para eliminar todos los datos de la base de datos
 */

const mongoose = require('mongoose');
const config = require('../config/config');

// Configurar mongoose para evitar advertencias de deprecación
mongoose.set('strictQuery', false);

// Importar modelos
const User = require('../models/User');
const WorkSession = require('../models/WorkSession');
const DailyStats = require('../models/DailyStats');
const Attendance = require('../models/Attendance');
const Audit = require('../models/Audit');

/**
 * Función principal para limpiar la base de datos
 */
async function clearDatabase() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    // Conectar a la base de datos
    await mongoose.connect(config.database.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Conectado a MongoDB exitosamente');
    console.log('⚠️  INICIANDO LIMPIEZA DE BASE DE DATOS...');
    console.log('');

    // Obtener estadísticas antes de limpiar
    const userCount = await User.countDocuments();
    const workSessionCount = await WorkSession.countDocuments();
    const dailyStatsCount = await DailyStats.countDocuments();
    const attendanceCount = await Attendance.countDocuments();
    const auditCount = await Audit.countDocuments();

    console.log('📊 DATOS ACTUALES EN LA BASE DE DATOS:');
    console.log(`   - Usuarios: ${userCount}`);
    console.log(`   - Sesiones de trabajo: ${workSessionCount}`);
    console.log(`   - Estadísticas diarias: ${dailyStatsCount}`);
    console.log(`   - Asistencias: ${attendanceCount}`);
    console.log(`   - Auditorías: ${auditCount}`);
    console.log('');

    if (userCount === 0 && workSessionCount === 0 && dailyStatsCount === 0 && attendanceCount === 0 && auditCount === 0) {
      console.log('✅ La base de datos ya está vacía.');
      return;
    }

    console.log('🗑️  ELIMINANDO TODOS LOS DATOS...');
    console.log('');

    // Eliminar todas las colecciones
    console.log('   Eliminando usuarios...');
    const deletedUsers = await User.deleteMany({});
    console.log(`   ✅ ${deletedUsers.deletedCount} usuarios eliminados`);

    console.log('   Eliminando sesiones de trabajo...');
    const deletedWorkSessions = await WorkSession.deleteMany({});
    console.log(`   ✅ ${deletedWorkSessions.deletedCount} sesiones de trabajo eliminadas`);

    console.log('   Eliminando estadísticas diarias...');
    const deletedDailyStats = await DailyStats.deleteMany({});
    console.log(`   ✅ ${deletedDailyStats.deletedCount} estadísticas diarias eliminadas`);

    console.log('   Eliminando asistencias...');
    const deletedAttendances = await Attendance.deleteMany({});
    console.log(`   ✅ ${deletedAttendances.deletedCount} asistencias eliminadas`);

    console.log('   Eliminando auditorías...');
    const deletedAudits = await Audit.deleteMany({});
    console.log(`   ✅ ${deletedAudits.deletedCount} auditorías eliminadas`);

    console.log('');
    console.log('🎉 LIMPIEZA COMPLETADA EXITOSAMENTE');
    console.log('');

    // Verificar que las colecciones estén vacías
    const finalUserCount = await User.countDocuments();
    const finalWorkSessionCount = await WorkSession.countDocuments();
    const finalDailyStatsCount = await DailyStats.countDocuments();
    const finalAttendanceCount = await Attendance.countDocuments();
    const finalAuditCount = await Audit.countDocuments();

    console.log('📊 VERIFICACIÓN FINAL:');
    console.log(`   - Usuarios: ${finalUserCount}`);
    console.log(`   - Sesiones de trabajo: ${finalWorkSessionCount}`);
    console.log(`   - Estadísticas diarias: ${finalDailyStatsCount}`);
    console.log(`   - Asistencias: ${finalAttendanceCount}`);
    console.log(`   - Auditorías: ${finalAuditCount}`);

    if (finalUserCount === 0 && finalWorkSessionCount === 0 && finalDailyStatsCount === 0 && finalAttendanceCount === 0 && finalAuditCount === 0) {
      console.log('✅ Base de datos completamente limpia');
    } else {
      console.log('⚠️  Algunos datos pueden no haberse eliminado correctamente');
    }

  } catch (error) {
    console.error('❌ Error durante la limpieza de la base de datos:', error);
    process.exit(1);
  } finally {
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log('');
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Confirmar antes de ejecutar
console.log('⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos');
console.log('⚠️  Esta acción NO se puede deshacer');
console.log('');

// Ejecutar inmediatamente
clearDatabase();