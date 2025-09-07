# IN OUT MANAGER - Sistema de Gestión de Tiempo y Registro de Horas

## Descripción General
Sistema para digitalizar y optimizar el registro y gestión del tiempo/horas trabajadas por proyecto, tarea o cliente.

### Funcionalidad Central
- Registro preciso de horas de trabajo
- Seguimiento por proyecto, tarea y cliente
- Gestión de usuarios (empleados y administradores)
- Reportes y análisis de tiempo

### Beneficios Clave
- **Precisión:** Reduce errores manuales en el registro de tiempo
- **Eficiencia:** Ahorra tiempo en procesos de registro y generación de reportes
- **Centralización:** Toda la información en un solo lugar accesible
- **Análisis:** Datos estructurados para toma de decisiones

## Tecnologías Implementadas

### Frontend
- **HTML5:** Estructura semántica con mejoras de accesibilidad
- **CSS3:** 
  - Estilos modulares y optimizados
  - Efectos de hover y animaciones
  - Media queries para diseño responsive
  - Flexbox y Grid para layouts modernos
- **JavaScript:** 
  - Manipulación del DOM
  - Validación de formularios en el cliente
  - Efectos interactivos
  - Gestión de eventos de usuario
- **Bibliotecas externas:**
  - FontAwesome 5.15.4 para iconografía

### Estructura del Proyecto
- **Frontend:**
  - `/frontend/assets/` - Recursos estáticos (CSS, JS, imágenes)
  - `/frontend/components/` - Componentes reutilizables
  - `/frontend/proyectopages/` - Páginas principales del sitio
- **Backend:**
  - `/backend/apps/` - Aplicaciones principales
  - `/backend/core/` - Funcionalidades centrales

### Optimizaciones
- Imágenes comprimidas y optimizadas
- CSS modular para evitar duplicación de código
- Estructura HTML semántica para mejor SEO y accesibilidad
- Carga asíncrona de scripts para mejorar rendimiento

## Instrucciones de Instalación

1. **Clonar el repositorio:**
   ```
   git clone https://github.com/[usuario]/inoutmanager.git
   cd inoutmanager
   ```

2. **Configuración inicial:**
   - Abrir `index.html` desde la carpeta `frontend/proyectopages/` en un navegador web moderno
   - Para desarrollo, se recomienda usar un servidor local como Live Server

## Requisitos del Sistema
- Navegadores compatibles: Chrome 89+, Firefox 86+, Safari 14+, Edge 88+
- Resolución mínima recomendada: 320px (móvil) - 1920px (escritorio)

## Documentación
- Ver `/docs/OPTIMIZACIONES_APLICADAS.md` para detalles sobre mejoras implementadas

## Contenido del Proyecto

### Componentes Principales

#### Frontend (Interfaz de Usuario)
- **Páginas principales**: Landing page, dashboards de admin y empleado
- **Sistema de autenticación**: Login, registro, recuperación de contraseñas
- **Diseño responsive**: Optimizado para móviles, tablets y escritorio
- **Tecnologías**: HTML5, CSS3, JavaScript ES6+, Vite, FontAwesome

#### Backend (API y Servidor)
- **Framework**: Django 5.2.3 con Django REST Framework
- **Base de datos**: SQLite (desarrollo), MySQL (producción)
- **Funcionalidades**: API REST, autenticación, gestión de usuarios
- **Estructura**: Apps modulares para escalabilidad

#### Funcionalidades Implementadas
- ✅ Sistema de navegación responsive con menú móvil
- ✅ Formularios de autenticación con validación
- ✅ Dashboards diferenciados por rol de usuario
- ✅ Configuración de desarrollo con Vite
- ✅ Backend con Django configurado y endpoints básicos
- ✅ Estilos modulares optimizados para rendimiento

#### Funcionalidades en Desarrollo
- 🚧 Modelos de base de datos completos
- 🚧 Integración frontend-backend completa
- 🚧 Sistema de reportes y análisis
- 🚧 Funcionalidades de tiempo real

### Arquitectura del Sistema
```
ProyectoFinalSEN/
├── frontend/                 # Aplicación web moderna
│   ├── proyectopages/        # Página principal
│   ├── components/           # Componentes por funcionalidad
│   │   ├── auth/            # Autenticación
│   │   ├── admin/           # Panel administrativo
│   │   └── empleado/        # Panel de empleados
│   └── assets/              # Recursos (CSS, JS, imágenes)
├── backend/                 # API REST con Django
│   ├── apps/                # Aplicaciones Django
│   ├── inoutmanager_backend/# Configuración principal
│   └── manage.py           # Comandos de gestión
├── package.json            # Dependencias frontend
├── vite.config.js          # Configuración desarrollo
└── requirements.txt        # Dependencias backend
```

## Casos de Uso del Sistema

### Para Empleados 👥
- Registro de entrada y salida (check-in/check-out)
- Consulta de historial de asistencias
- Visualización de horarios personales
- Solicitud de permisos y vacaciones

### Para Administradores 👨‍💼
- Monitoreo de asistencias en tiempo real
- Gestión completa de empleados
- Generación de reportes detallados
- Configuración de políticas de la empresa
- Análisis de productividad por departamentos

## Beneficios del Sistema

### Operacionales
- **Automatización**: Reduce trabajo manual y errores humanos
- **Tiempo real**: Información inmediata de asistencias
- **Centralización**: Toda la información en un solo lugar
- **Escalabilidad**: Crece con las necesidades de la empresa

### Técnicos
- **Responsive**: Funciona en cualquier dispositivo
- **Modular**: Fácil mantenimiento y extensión
- **Seguro**: Validaciones y protecciones implementadas
- **Moderno**: Tecnologías actuales y mejores prácticas

## Estado del Proyecto
Actualmente en desarrollo activo, con enfoque en:
- Mejora continua de la interfaz de usuario
- Implementación de funcionalidades adicionales
- Optimización de rendimiento
- Integración completa frontend-backend

### Documentación Adicional
- 📖 **Descripción completa**: Ver `DESCRIPCION_COMPLETA_PROYECTO.md` para análisis técnico detallado
- 🔧 **Optimizaciones**: Ver `/docs/OPTIMIZACIONES_APLICADAS.md` para mejoras implementadas

---

*Última actualización: Septiembre 2024*  
