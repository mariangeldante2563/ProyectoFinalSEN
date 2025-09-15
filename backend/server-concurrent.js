/**
 * IN OUT MANAGER - SERVIDOR PARA INICIO CONJUNTO
 * @version 2.1.0
 * @description Servidor backend optimizado para inicio junto con frontend
 */

// Cargar variables de entorno desde .env
require('dotenv').config();

// Importaciones
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const attendanceRoutes = require('./routes/attendance');
const statsRoutes = require('./routes/stats');
const reportsRoutes = require('./routes/reports');

// Configuración
const config = require('./config/config');

// Configurar mongoose para evitar advertencias de deprecación
mongoose.set('strictQuery', false);

// Crear aplicación Express
const app = express();

// Variables de entorno y configuración
const NODE_ENV = config.server.env;
const MONGODB_URI = config.database.uri;

// Función para verificar si un puerto está disponible
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    
    server.on('error', () => resolve(false));
  });
}

// Función para encontrar puerto disponible
async function findAvailablePort(startPort, maxTries = 10) {
  for (let i = 0; i < maxTries; i++) {
    const port = startPort + i;
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  throw new Error(`No se pudo encontrar puerto disponible desde ${startPort}`);
}

async function initializeServer() {
  try {
    console.log('🚀 INICIANDO IN OUT MANAGER BACKEND');
    console.log('='.repeat(50));
    
    // Buscar puerto disponible para backend (empezando en 5000)
    const backendPort = await findAvailablePort(5000);
    console.log(`✅ Puerto backend: ${backendPort}`);
    
    // Configurar middleware
    setupMiddleware();
    
    // Configurar rutas
    setupRoutes(backendPort);
    
    // Conectar a MongoDB
    await connectDatabase();
    
    // Iniciar servidor
    await startServer(backendPort);
    
  } catch (error) {
    console.error('❌ Error al inicializar servidor:', error.message);
    process.exit(1);
  }
}

function setupMiddleware() {
  console.log('⚙️  Configurando middleware...');
  
  // Middleware de seguridad
  app.use(helmet());
  
  // Middleware de logging
  if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  
  // Middleware para parsing de JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Configurar CORS para múltiples puertos frontend
  const corsOptions = {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };
  
  app.use(cors(corsOptions));
  console.log('✅ CORS habilitado para múltiples puertos frontend');
  
  // Middleware para archivos estáticos
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

function setupRoutes(port) {
  console.log('🛣️  Configurando rutas...');
  
  // Ruta de salud
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      port: port,
      timestamp: new Date().toISOString(),
      environment: NODE_ENV
    });
  });
  
  // Rutas de la API
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/reports', reportsRoutes);
  
  // Ruta para obtener información del servidor
  app.get('/api/server-info', (req, res) => {
    res.json({
      port: port,
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
      status: 'running'
    });
  });
  
  // Middleware para manejar rutas no encontradas
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Ruta no encontrada',
      message: `La ruta ${req.originalUrl} no existe en este servidor`
    });
  });
  
  // Middleware para manejo de errores
  app.use((error, req, res, next) => {
    console.error('Error del servidor:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: NODE_ENV === 'development' ? error.message : 'Ha ocurrido un error'
    });
  });
}

async function connectDatabase() {
  console.log('🔗 Conectando a MongoDB...');
  
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conexión establecida con MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    throw error;
  }
}

function startServer(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, (error) => {
      if (error) {
        reject(error);
      } else {
        console.log('');
        console.log('🎉 BACKEND INICIADO EXITOSAMENTE');
        console.log('='.repeat(50));
        console.log(`🌐 URL: http://localhost:${port}`);
        console.log(`🏥 Health: http://localhost:${port}/health`);
        console.log(`📊 Info: http://localhost:${port}/api/server-info`);
        console.log(`📝 Ambiente: ${NODE_ENV}`);
        console.log('='.repeat(50));
        resolve(server);
      }
    });
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${port} en uso`);
        reject(error);
      } else {
        reject(error);
      }
    });
  });
}

// Manejar señales de terminación
function setupGracefulShutdown() {
  const shutdown = (signal) => {
    console.log(`\n⚠️  Señal ${signal} recibida. Cerrando servidor...`);
    
    mongoose.connection.close(() => {
      console.log('🛑 Conexión MongoDB cerrada');
      console.log('👋 Servidor backend terminado correctamente');
      process.exit(0);
    });
  };
  
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Ejecutar servidor
if (require.main === module) {
  setupGracefulShutdown();
  initializeServer();
}

module.exports = { app, initializeServer };