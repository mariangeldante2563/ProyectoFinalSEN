/**
 * IN OUT MANAGER - CONFIGURACIÓN DE BASE DE DATOS
 * @version 1.0.0
 * @description Archivo de configuración y conexión a MongoDB
 */

const mongoose = require('mongoose');

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true // Importante para los índices únicos y búsquedas eficientes
};

const supportsTransactions = (connection = mongoose.connection) => {
  const topologyType = connection.client?.topology?.description?.type;
  return topologyType === 'ReplicaSetWithPrimary' || topologyType === 'Sharded';
};

/**
 * Establece la conexión a MongoDB
 * @returns {Promise<import('mongoose').Mongoose>} Promesa de conexión a MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    if (!supportsTransactions(conn.connection)) {
      await mongoose.disconnect();
      throw new Error(
        'MongoDB debe ejecutarse como replica set o clúster sharded para soportar transacciones.'
      );
    }

    console.log(` MongoDB conectado: ${conn.connection.host}`);
    console.log(` Base de datos: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error(` Error de conexión a MongoDB: ${error.message}`);
    throw error;
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
  isConnected,
  supportsTransactions
};