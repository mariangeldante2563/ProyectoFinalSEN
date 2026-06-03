/**
<<<<<<< HEAD
 * @version 1.0.0
 * @description 
=======
 * IN OUT MANAGER - RUTAS DE USUARIOS
 * @version 1.0.0
 * @description Rutas para gestión de usuarios
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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

<<<<<<< HEAD

=======
// Importar middlewares
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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
<<<<<<< HEAD
router.get('/me', getCurrentUser);
=======

// Ruta para obtener el usuario actual autenticado
router.get('/me', getCurrentUser);

// Rutas para todos los usuarios
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
router.get('/:id', checkUserOwnership, getUserById);
router.put('/:id', checkUserOwnership, updateUser);
router.put('/:id/change-password', checkUserOwnership, changePassword);
router.put('/:id/profile-photo', checkUserOwnership, uploadProfilePhoto, handleUploadError, updateProfilePhoto);

<<<<<<< HEAD
=======
// Rutas solo para administradores
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
router.get('/', authorize('administrador'), getUsers);
router.delete('/:id', authorize('administrador'), deleteUser);
router.put('/:id/activate', authorize('administrador'), activateUser);

module.exports = router;