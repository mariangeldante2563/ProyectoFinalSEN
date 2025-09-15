/**
 * IN OUT MANAGER - RUTAS DE AUDITORÍA
 * @version 1.0.0
 * @description Rutas para consulta de registros de auditoría
 */

const express = require('express');
const router = express.Router();

// Importar controladores
const {
  getAuditLogs,
  getEntityAuditLogs,
  getAuditLogById
} = require('../controllers/auditController');

// Importar middlewares
const { protect, authorize } = require('../middlewares/auth');

// Todas las rutas requieren autenticación y permisos de administrador
router.use(protect);
router.use(authorize('administrador'));

// Rutas
router.get('/', getAuditLogs);
router.get('/log/:id', getAuditLogById);
router.get('/:entidad/:entidadId', getEntityAuditLogs);

module.exports = router;