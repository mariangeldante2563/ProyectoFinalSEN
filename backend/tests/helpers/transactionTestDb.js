const mongoose = require('mongoose');

/**
 * Conecta las pruebas a una base aislada con soporte de transacciones.
 * @returns {Promise<void>}
 */
async function connectTransactionTestDb() {
  const uri = process.env.MONGODB_TEST_URI;
  if (!uri) {
    throw new Error('Configure MONGODB_TEST_URI con una base de prueba transaction-capable.');
  }

  await mongoose.connect(uri);
  const topology = mongoose.connection.client?.topology?.description?.type;
  if (!['ReplicaSetWithPrimary', 'Sharded'].includes(topology)) {
    await mongoose.disconnect();
    throw new Error('La base de pruebas debe ser replica set o clúster sharded.');
  }
}

/**
 * Limpia únicamente colecciones registradas en esta conexión de pruebas.
 * @returns {Promise<void>}
 */
async function clearTransactionTestDb() {
  await Promise.all(
    Object.values(mongoose.connection.models).map(model => model.deleteMany({}))
  );
}

module.exports = { connectTransactionTestDb, clearTransactionTestDb };
