/**
 * IN OUT MANAGER - RUTAS DE USUARIOS
 * @version 1.0.0
 * @description Rutas para gestión de usuarios
 */

const express = require('express');
const router = express.Router();

// Importar controladores
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  getCurrentUser,
  updateProfilePhoto,
  activateUser
} = require('../controllers/userController');

// Importar middlewares
const { 
  protect, 
  authorize, 
  checkUserOwnership 
} = require('../middlewares/auth');
const {
  uploadProfilePhoto,
  handleUploadError
} = require('../middlewares/upload');

// Todas las rutas requieren autenticación
router.use(protect);

// Ruta para obtener el usuario actual autenticado
router.get('/me', getCurrentUser);

// Rutas para todos los usuarios
router.get('/:id', checkUserOwnership, getUserById);
router.put('/:id', checkUserOwnership, updateUser);
router.put('/:id/change-password', checkUserOwnership, changePassword);
router.put('/:id/profile-photo', checkUserOwnership, uploadProfilePhoto, handleUploadError, updateProfilePhoto);

// Rutas solo para administradores
router.get('/', authorize('administrador'), getUsers);
router.delete('/:id', authorize('administrador'), deleteUser);
router.put('/:id/activate', authorize('administrador'), activateUser);

module.exports = router;