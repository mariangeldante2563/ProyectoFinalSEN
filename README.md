# InOutManager - Sistema de Gestión de Asistencia

![InOutManager Logo](img/icon.jpg)

## Descripción del Proyecto

InOutManager es un sistema completo de gestión de asistencia y control de jornada laboral desarrollado con tecnologías modernas. El sistema permite el registro preciso de entradas y salidas de empleados, cálculo automático de tiempos laborados según la legislación colombiana vigente (2025), generación de reportes avanzados y administración completa de usuarios con roles diferenciados.

## Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución JavaScript del lado del servidor
- **Express.js**: Framework web para Node.js con arquitectura RESTful
- **MongoDB**: Base de datos NoSQL para almacenamiento de datos
- **Mongoose**: ODM para modelado de datos MongoDB
- **JWT**: Autenticación basada en tokens JSON Web Token
- **bcrypt**: Encriptación de contraseñas
- **ExcelJS**: Generación de reportes en formato Excel
- **Multer**: Manejo de archivos y subida de imágenes
- **CORS**: Configuración de políticas de origen cruzado
- **Helmet**: Seguridad HTTP con headers apropiados
- **Morgan**: Logging de solicitudes HTTP

### Frontend
- **HTML5**: Estructura semántica para la interfaz de usuario
- **CSS3**: Estilos con variables CSS personalizadas, flexbox y grid para layouts responsivos
- **JavaScript (ES6+)**: Programación orientada a objetos con clases para la lógica de la aplicación
- **Chart.js**: Librería para gráficos interactivos
- **D3.js**: Librería avanzada para visualización de datos
- **FontAwesome**: Biblioteca de iconos vectoriales
- **LocalStorage API**: Almacenamiento de datos en el navegador

### Herramientas de Desarrollo
- **Vite**: Servidor de desarrollo y herramienta de construcción
- **npm**: Gestor de paquetes para dependencias
- **Git**: Control de versiones
- **PowerShell**: Scripts de automatización para Windows

## Características Implementadas

### 🔐 Autenticación y Autorización
- **Registro de usuarios**: Empleados y administradores con validación completa
- **Inicio de sesión seguro**: Autenticación JWT con roles diferenciados
- **Código de administrador**: Verificación adicional para acceso administrativo
- **Recuperación de contraseña**: Sistema de recuperación con códigos de verificación
- **Gestión de sesiones**: Control de sesiones activas y logout seguro
- **Middleware de protección**: Rutas protegidas por autenticación y roles

### 👥 Gestión de Usuarios
- **CRUD completo**: Crear, leer, actualizar y eliminar usuarios
- **Roles y permisos**: Sistema de roles empleado/administrador
- **Validación de datos**: Validaciones exhaustivas en frontend y backend
- **Subida de fotos de perfil**: Gestión de avatares de usuario
- **Perfiles detallados**: Información completa de empleados (documento, cargo, horario, etc.)

### ⏰ Registro de Asistencia y Control de Jornada
- **Registro de entrada/salida**: Marcación precisa con timestamp
- **Sesiones de trabajo**: Creación automática de sesiones laborales
- **Cálculo de tiempos**: Algoritmos avanzados para cálculo de tiempo laborado
- **Legislación colombiana**: Implementación completa de la legislación laboral 2025
- **Recargos automáticos**: Cálculo de recargos nocturnos, extras y dominicales
- **Validación de integridad**: Verificación de consistencia de datos

### 📊 Estadísticas y Reportes
- **Estadísticas diarias**: Resumen completo del día laboral
- **Estadísticas semanales/mensuales**: Análisis de productividad por períodos
- **Gráficos interactivos**: Visualización con Chart.js y D3.js
- **Reportes Excel**: Generación automática de reportes personalizados
- **Dashboard en tiempo real**: Actualización automática de métricas
- **KPIs avanzados**: Indicadores clave de rendimiento

### 🏢 Panel de Administración Avanzado
- **Dashboard administrativo**: Panel completo con métricas y gráficos
- **Vista en tiempo real**: Monitoreo continuo de asistencia
- **Gestión de empleados**: Administración completa del personal
- **Auditoría de acciones**: Registro detallado de todas las operaciones
- **Alertas y notificaciones**: Sistema de alertas configurables
- **Backup y restauración**: Funcionalidades de respaldo de datos

### 📈 Funcionalidades Avanzadas
- **Cálculos legislativos**: Implementación de jornada ordinaria, horas extras, recargos
- **Migración de datos**: Conversión de registros antiguos a nuevo formato
- **Validación de datos**: Verificación automática de integridad
- **API RESTful completa**: Endpoints documentados y seguros
- **PWA Features**: Funcionalidades de aplicación web progresiva
- **Responsive Design**: Interfaz adaptativa para todos los dispositivos

### 🔧 Arquitectura y Seguridad
- **Arquitectura modular**: Separación clara de responsabilidades
- **Middleware de seguridad**: Protección contra vulnerabilidades comunes
- **Validación de entrada**: Sanitización y validación de datos
- **Manejo de errores**: Sistema robusto de gestión de errores
- **Logging completo**: Registro detallado de operaciones y errores
- **Configuración flexible**: Variables de entorno y configuración centralizada



## Requisitos para Ejecutar el Proyecto

1. **Node.js** (v14.0.0 o superior)
2. **MongoDB** (v4.0.0 o superior)
3. **npm** (v6.0.0 o superior)
4. **PowerShell** (para scripts de automatización en Windows)

## Instalación y Ejecución

### Opción 1: Inicio Automático (Recomendado)
```bash
# Clonar el repositorio
git clone https://github.com/mariangeldante2563/ProyectoFinalSEN.git
cd ProyectoFinalSEN

# Ejecutar script de inicio automático (Windows PowerShell)
.\start-both.ps1
```



## API Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/recover-password` - Recuperación de contraseña
- `GET /api/auth/me` - Información del usuario actual

### Usuarios
- `GET /api/users` - Listar usuarios (admin)
- `POST /api/users` - Crear usuario (admin)
- `GET /api/users/:id` - Obtener usuario específico
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Asistencia
- `POST /api/attendance` - Registrar entrada/salida
- `GET /api/attendance/user/:userId` - Historial de asistencia
- `GET /api/attendance/stats/weekly/:userId` - Estadísticas semanales
- `GET /api/attendance/stats/monthly/:userId` - Estadísticas mensuales

### Estadísticas
- `GET /api/stats/dashboard` - Dashboard completo
- `GET /api/stats/today` - Estadísticas del día
- `GET /api/stats/charts` - Datos para gráficos

### Reportes
- `GET /api/reports/user/:userId` - Generar reporte de usuario
- `GET /api/reports/general` - Generar reporte general
- `GET /api/reports/download/:fileName` - Descargar reporte

### Auditoría
- `GET /api/audit` - Obtener registros de auditoría
- `POST /api/audit` - Crear registro de auditoría

## Legislación Laboral Implementada

El sistema implementa completamente la legislación laboral colombiana vigente para 2025:

- **Jornada ordinaria**: Máximo 8 horas diarias, 44 horas semanales
- **Horas extras**: Recargo del 25% diurno, 75% nocturno
- **Trabajo nocturno**: Recargo del 35% (22:00 - 06:00)
- **Trabajo dominical/festivo**: Recargo del 75% diurno, 100% nocturno
- **Días festivos**: Reconocimiento automático de festivos nacionales

## Características de Seguridad

- **Encriptación de contraseñas**: bcrypt con salt rounds
- **Autenticación JWT**: Tokens seguros con expiración
- **Validación de entrada**: Sanitización y validación completa
- **Protección CORS**: Configuración de orígenes permitidos
- **Headers de seguridad**: Helmet.js para protección HTTP
- **Auditoría completa**: Registro de todas las acciones relevantes

## Scripts Disponibles

### Backend
```bash
npm start      # Iniciar servidor en producción
npm run dev    # Iniciar servidor en desarrollo con nodemon
npm test       # Ejecutar pruebas
```

### Frontend
```bash
npm run dev    # Iniciar servidor de desarrollo Vite
npm run build  # Construir para producción
npm run preview # Vista previa de producción
```

### Utilidades
```powershell
.\start-both.ps1              # Iniciar backend y frontend
.\start-both.ps1 -OnlyBackend # Solo backend
.\start-both.ps1 -OnlyFrontend# Solo frontend
```

## Desarrollo y Contribución

### Estructura de Commits
- `feat:` Nuevas funcionalidades
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Cambios de estilo
- `refactor:` Refactorización de código
- `test:` Añadir o modificar tests

### Pruebas
```bash
# Backend
cd backend
npm test

# Ejecutar pruebas específicas
npm run test -- --grep "nombre de la prueba"
```

## Despliegue

### Producción
1. Configurar variables de entorno de producción
2. Construir frontend: `npm run build`
3. Iniciar backend: `npm start`
4. Configurar proxy reverso (nginx/apache) si es necesario

### Docker (Futuro)
```dockerfile
# Configuración Docker pendiente de implementación
```

## Monitoreo y Logs

- **Morgan**: Logging de solicitudes HTTP
- **Winston**: Logging estructurado (pendiente)
- **PM2**: Gestor de procesos para producción (pendiente)

## Soporte y Contacto

Para soporte técnico o consultas sobre el proyecto:

- **Desarrollador**: Mariangel Dante
- **Email**: mariangeldante2563@ejemplo.com
- **GitHub**: [mariangeldante2563](https://github.com/mariangeldante2563)
- **Repositorio**: [ProyectoFinalSEN](https://github.com/mariangeldante2563/ProyectoFinalSEN)

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE.md para más detalles.

## Estado del Proyecto

✅ **Completado**: Sistema funcional con todas las características principales implementadas
🔄 **En desarrollo**: Optimizaciones de rendimiento y nuevas funcionalidades
📋 **Pendiente**: Tests automatizados completos, documentación API, despliegue cloud

---

**Última actualización**: 30 de noviembre de 2025
**Versión**: 1.0.0