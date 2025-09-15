/**
 * IN OUT MANAGER - SERVIDOR CON GESTIÓN DE PUERTOS
 * @version 2.0.0
 * @description Servidor backend con detección automática de puertos
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
const PortManager = require('./utils/PortManager');

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

class ServerManager {
  constructor() {
    this.app = app;
    this.portManager = new PortManager();
    this.serverInstance = null;
    this.currentPort = null;
  }

  async initialize() {
    try {
      console.log('🚀 INICIANDO IN OUT MANAGER SERVER');
      console.log('='.repeat(50));
      
      // Preparar puertos
      const ports = await this.portManager.prepareEnvironment();
      this.currentPort = ports.backend;
      
      // Configurar middleware
      this.setupMiddleware();
      
      // Configurar rutas
      this.setupRoutes();
      
      // Conectar a MongoDB
      await this.connectDatabase();
      
      // Iniciar servidor
      await this.startServer();
      
    } catch (error) {
      console.error('❌ Error al inicializar servidor:', error.message);
      process.exit(1);
    }
  }

  setupMiddleware() {
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
    
    // Configurar CORS dinámicamente
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

  setupRoutes() {
    console.log('🛣️  Configurando rutas...');
    
    // Ruta de salud
    app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        port: this.currentPort,
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
        port: this.currentPort,
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

  async connectDatabase() {
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

  async startServer() {
    return new Promise((resolve, reject) => {
      this.serverInstance = this.app.listen(this.currentPort, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log('');
          console.log('🎉 SERVIDOR INICIADO EXITOSAMENTE');
          console.log('='.repeat(50));
          console.log(`🌐 URL: http://localhost:${this.currentPort}`);
          console.log(`🏥 Health: http://localhost:${this.currentPort}/health`);
          console.log(`📊 Info: http://localhost:${this.currentPort}/api/server-info`);
          console.log(`📝 Ambiente: ${NODE_ENV}`);
          console.log('='.repeat(50));
          resolve();
        }
      });
      
      this.serverInstance.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Puerto ${this.currentPort} en uso. Buscando alternativo...`);
          this.findAlternativePort().then(resolve).catch(reject);
        } else {
          reject(error);
        }
      });
    });
  }

  async findAlternativePort() {
    try {
      const newPort = await this.portManager.findAvailablePort(this.currentPort + 1);
      if (!newPort) {
        throw new Error('No se pudo encontrar un puerto alternativo');
      }
      
      this.currentPort = newPort;
      console.log(`🔄 Intentando con puerto ${this.currentPort}...`);
      
      return this.startServer();
    } catch (error) {
      throw new Error(`Error al buscar puerto alternativo: ${error.message}`);
    }
  }

  setupGracefulShutdown() {
    // Manejar señales de terminación
    const shutdown = (signal) => {
      console.log(`\n⚠️  Señal ${signal} recibida. Cerrando servidor...`);
      
      if (this.serverInstance) {
        this.serverInstance.close(() => {
          console.log('🛑 Servidor HTTP cerrado');
          
          mongoose.connection.close(() => {
            console.log('🛑 Conexión MongoDB cerrada');
            console.log('👋 Servidor terminado correctamente');
            process.exit(0);
          });
        });
      } else {
        process.exit(0);
      }
    };
    
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    
    // Manejar errores no capturados
    process.on('uncaughtException', (error) => {
      console.error('❌ Error no capturado:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promesa rechazada no manejada:', reason);
      process.exit(1);
    });
  }
}

// Inicializar y ejecutar servidor
async function main() {
  const server = new ServerManager();
  server.setupGracefulShutdown();
  await server.initialize();
}

// Ejecutar solo si este archivo es llamado directamente
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error fatal al iniciar servidor:', error);
    process.exit(1);
  });
}

module.exports = { ServerManager, app };