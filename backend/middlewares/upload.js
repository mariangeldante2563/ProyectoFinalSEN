/**
 * IN OUT MANAGER - MIDDLEWARE DE SUBIDA DE ARCHIVOS
 * @version 1.0.0
 * @description Middleware para manejar subida de archivos con Multer
 */

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Asegurar que existe el directorio de destino
const createUploadDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configuración de almacenamiento para fotos de perfil
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    createUploadDirectory(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar un nombre único para el archivo
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const fileExt = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${req.user._id}-${uniqueSuffix}${fileExt}`);
  }
});

// Filtro para permitir solo imágenes
const imageFilter = (req, file, cb) => {
  // Verificar si es una imagen
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error('¡Solo se permiten archivos de imagen!'), false);
  }
};

// Middleware para subir fotos de perfil
exports.uploadProfilePhoto = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: imageFilter
}).single('fotoPerfil');

// Middleware para manejar errores de Multer
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Error de Multer: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};