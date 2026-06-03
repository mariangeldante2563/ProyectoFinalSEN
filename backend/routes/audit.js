/**
<<<<<<< HEAD
 * @version 1.0.0
 * @description 
=======
 * IN OUT MANAGER - RUTAS DE AUDITORÍA
 * @version 1.0.0
 * @description Rutas para consulta de registros de auditoría
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */

const express = require('express');
const router = express.Router();

<<<<<<< HEAD
=======
// Importar controladores
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
const {
  getAuditLogs,
  getEntityAuditLogs,
  getAuditLogById
} = require('../controllers/auditController');

<<<<<<< HEAD
const { protect, authorize } = require('../middlewares/auth');
router.use(protect);
router.use(authorize('administrador'));
=======
// Importar middlewares
const { protect, authorize } = require('../middlewares/auth');

// Todas las rutas requieren autenticación y permisos de administrador
router.use(protect);
router.use(authorize('administrador'));

// Rutas
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
router.get('/', getAuditLogs);
router.get('/log/:id', getAuditLogById);
router.get('/:entidad/:entidadId', getEntityAuditLogs);

module.exports = router;