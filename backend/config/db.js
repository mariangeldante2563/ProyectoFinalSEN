/**
<<<<<<< HEAD
 * @version 1.0.0
 * @description 
=======
 * IN OUT MANAGER - CONFIGURACIÓN DE BASE DE DATOS
 * @version 1.0.0
 * @description Archivo de configuración y conexión a MongoDB
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */

const mongoose = require('mongoose');

<<<<<<< HEAD
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true 
};

/**
 * @returns {Promise} 
=======
// Opciones de configuración para Mongoose
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true // Importante para los índices únicos y búsquedas eficientes
};

/**
 * Establece la conexión a MongoDB
 * @returns {Promise} Promesa de conexión a MongoDB
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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

<<<<<<< HEAD

=======
/**
 * Cierra la conexión a MongoDB
 */
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
const closeConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log(' Conexión a MongoDB cerrada correctamente');
  } catch (error) {
    console.error(` Error al cerrar la conexión: ${error.message}`);
  }
};

/**
<<<<<<< HEAD
 * @returns {Boolean} 
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1; 
=======
 * Verifica el estado de la conexión a MongoDB
 * @returns {Boolean} Estado de la conexión
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = conectado
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
};

module.exports = {
  connectDB,
  closeConnection,
  isConnected
};