/**
 * IN OUT MANAGER - CONFIGURACIÓN DE BASE DE DATOS
 * @version 1.0.0
 * @description Archivo de configuración y conexión a MongoDB
 */

const mongoose = require('mongoose');

// Opciones de configuración para Mongoose
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true // Importante para los índices únicos y búsquedas eficientes
};

/**
 * Establece la conexión a MongoDB
 * @returns {Promise} Promesa de conexión a MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    
    console.log(` MongoDB conectado: ${conn.connection.host}`);
    console.log(` Base de datos: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error(` Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Cierra la conexión a MongoDB
 */
const closeConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log(' Conexión a MongoDB cerrada correctamente');
  } catch (error) {
    console.error(` Error al cerrar la conexión: ${error.message}`);
  }
};

/**
 * Verifica el estado de la conexión a MongoDB
 * @returns {Boolean} Estado de la conexión
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = conectado
};

module.exports = {
  connectDB,
  closeConnection,
  isConnected
};