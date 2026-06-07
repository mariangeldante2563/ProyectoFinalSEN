# InOutManager - Sistema de Gestión de Asistencia



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

###  Autenticación y Autorización
- **Registro de usuarios**: Empleados y administradores con validación completa
- **Inicio de sesión seguro**: Autenticación JWT con roles diferenciados
- **Código de administrador**: Verificación adicional para acceso administrativo
- **Recuperación de contraseña**: Sistema de recuperación con códigos de verificación
- **Gestión de sesiones**: Control de sesiones activas y logout seguro
- **Middleware de protección**: Rutas protegidas por autenticación y roles

###  Gestión de Usuarios
- **CRUD completo**: Crear, leer, actualizar y eliminar usuarios
- **Roles y permisos**: Sistema de roles empleado/administrador
- **Validación de datos**: Validaciones exhaustivas en frontend y backend
- **Subida de fotos de perfil**: Gestión de avatares de usuario
- **Perfiles detallados**: Información completa de empleados (documento, cargo, horario, etc.)

###  Registro de Asistencia y Control de Jornada
- **Registro de entrada/salida**: Marcación precisa con timestamp
- **Sesiones de trabajo**: Creación automática de sesiones laborales
- **Cálculo de tiempos**: Algoritmos avanzados para cálculo de tiempo laborado
- **Legislación colombiana**: Implementación completa de la legislación laboral 2025
- **Recargos automáticos**: Cálculo de recargos nocturnos, extras y dominicales
- **Validación de integridad**: Verificación de consistencia de datos

### Estadísticas y Reportes
- **Estadísticas diarias**: Resumen completo del día laboral
- **Estadísticas semanales/mensuales**: Análisis de productividad por períodos
- **Gráficos interactivos**: Visualización con Chart.js y D3.js
- **Reportes Excel**: Generación automática de reportes personalizados
- **Dashboard en tiempo real**: Actualización automática de métricas
- **KPIs avanzados**: Indicadores clave de rendimiento

###  Panel de Administración Avanzado
- **Dashboard administrativo**: Panel completo con métricas y gráficos
- **Vista en tiempo real**: Monitoreo continuo de asistencia
- **Gestión de empleados**: Administración completa del personal
- **Auditoría de acciones**: Registro detallado de todas las operaciones
- **Alertas y notificaciones**: Sistema de alertas configurables
- **Backup y restauración**: Funcionalidades de respaldo de datos


- **Desarrollador**: Mariangel Dante
- **Email**: mariangeldante2563@ejemplo.com
- **GitHub**: [mariangeldante2563](https://github.com/mariangeldante2563)
- **Repositorio**: [sena2](https://github.com/dinocarvajalcuellar-sys/sena2)




- **npm run start:both**: para arrancar el backend y el fornted y conectarse mongo db compass- localhost:27017/inoutmanager?
