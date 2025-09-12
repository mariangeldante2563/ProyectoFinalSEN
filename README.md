# InOutManager - Sistema de Gestión de Asistencia

![InOutManager Logo](img/icon.jpg)

## Descripción del Proyecto

InOutManager es un sistema de gestión de asistencia diseñado para facilitar el registro de entrada y salida de empleados, así como la administración de datos de asistencia por parte de administradores. El sistema permite un seguimiento eficiente del tiempo de trabajo, generación de reportes y gestión de usuarios.

## Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica para la interfaz de usuario
- **CSS3**: Estilos con variables CSS personalizadas, flexbox y grid para layouts responsivos
- **JavaScript (ES6+)**: Programación orientada a objetos con clases para la lógica de la aplicación
- **FontAwesome**: Biblioteca de iconos vectoriales
- **LocalStorage API**: Almacenamiento de datos en el navegador

### Herramientas de Desarrollo
- **Vite**: Servidor de desarrollo y herramienta de construcción
- **npm**: Gestor de paquetes para dependencias
- **Git**: Control de versiones

## Características Implementadas

### Autenticación y Autorización
- Registro de usuarios (empleados y administradores)
- Inicio de sesión con validación de credenciales
- Permisos basados en roles (empleado/administrador)
- Cierre de sesión seguro

### Dashboard de Empleado
- Registro de entrada y salida
- Visualización de histórico de asistencias
- Perfil de usuario con datos personales
- Reloj en tiempo real

### Dashboard de Administrador
- Listado completo de empleados
- Registros de asistencia de todos los empleados
- Filtros por fecha y empleado
- Estadísticas básicas de asistencia

## Arquitectura del Proyecto

```
inoutmanager/
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── styles.css          # Estilos principales
│   │   │   ├── auth.css            # Estilos para autenticación
│   │   │   └── footer-styles.css   # Estilos para el footer
│   │   ├── js/
│   │   │   ├── login.js            # Lógica de inicio de sesión
│   │   │   ├── registro.js         # Lógica de registro
│   │   │   ├── dashboard-admin.js  # Funcionalidad del dashboard admin
│   │   │   └── dashboard-empleado.js # Funcionalidad del dashboard empleado
│   ├── components/
│   │   ├── admin/
│   │   │   └── dashboard-admin.html # Panel de administrador
│   │   ├── auth/
│   │   │   ├── login.html          # Página de inicio de sesión
│   │   │   └── registro.html       # Página de registro
│   │   └── empleado/
│   │       └── dashboard-empleado.html # Panel de empleado
│   └── proyectopages/
│       └── index.html              # Página principal
├── img/                            # Imágenes del proyecto
├── vite.config.js                  # Configuración de Vite
├── package.json                    # Dependencias y scripts
└── index.html                      # Punto de entrada
```

## Requisitos para Ejecutar el Proyecto

1. Node.js (v14.0.0 o superior)
2. npm (v6.0.0 o superior)

## Instalación y Ejecución

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/mariangeldante2563/ProyectoFinalSEN.git
   cd inoutmanager
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Ejecutar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Acceder a la aplicación:
   Abrir http://localhost:5173 en el navegador

## Análisis de Mejoras Necesarias

### Aspectos Técnicos Pendientes

1. **Backend Robusto**:
   - Implementar un servidor backend (Node.js/Express, Python/Django o similar)
   - Reemplazar LocalStorage por base de datos relacional (MySQL, PostgreSQL)
   - Crear APIs RESTful para comunicación cliente-servidor

2. **Autenticación Avanzada**:
   - Implementar JWT para autenticación segura
   - Añadir recuperación de contraseñas
   - Implementar autenticación de dos factores

3. **Seguridad**:
   - Validación y sanitización de datos en frontend y backend
   - Protección contra ataques XSS y CSRF
   - Cifrado de información sensible

4. **Optimización de Rendimiento**:
   - Minificación y empaquetado de archivos para producción
   - Implementación de lazy loading para componentes pesados
   - Optimización de imágenes y recursos estáticos

5. **Mejoras UX/UI**:
   - Implementar un framework/biblioteca frontend (React, Vue, Angular)
   - Mejorar la accesibilidad (WCAG 2.1)
   - Añadir animaciones y transiciones más fluidas

### Características Funcionales a Implementar

1. **Gestión Avanzada de Usuarios**:
   - Panel para creación/edición/eliminación de empleados
   - Gestión de permisos y roles más granulares
   - Importación/exportación masiva de usuarios

2. **Sistema de Reportes**:
   - Generación de reportes en PDF, Excel, CSV
   - Reportes personalizables por período
   - Gráficos y visualizaciones estadísticas

3. **Notificaciones**:
   - Sistema de alertas para administradores
   - Notificaciones por email para eventos importantes
   - Recordatorios automatizados

4. **Geolocalización**:
   - Verificación de ubicación al registrar entrada/salida
   - Mapas de asistencia por ubicación geográfica

5. **Integración con otros Sistemas**:
   - API para integración con sistemas de RRHH
   - Sincronización con calendarios (Google Calendar, Outlook)
   - Conexión con sistemas de nómina

## Escalabilidad y Mantenimiento

Para asegurar que el proyecto sea escalable y mantenible a futuro, se recomienda:

1. **Arquitectura Modular**:
   - Refactorizar el código con patrones de diseño (MVC, MVVM)
   - Dividir componentes grandes en componentes más pequeños y reutilizables
   - Implementar inyección de dependencias

2. **Infraestructura Cloud**:
   - Migrar a una solución cloud (AWS, Azure, Google Cloud)
   - Implementar balanceo de carga y auto-escalado
   - Configurar CDN para recursos estáticos

3. **DevOps y CI/CD**:
   - Configurar integración continua (GitHub Actions, Jenkins)
   - Implementar pruebas automatizadas (unit, integration, e2e)
   - Despliegue automático a entornos de staging y producción

4. **Monitoreo y Análisis**:
   - Implementar logging centralizado
   - Monitoreo de rendimiento y errores (New Relic, Sentry)
   - Análisis de uso y comportamiento del usuario

5. **Documentación**:
   - Documentación técnica detallada (API docs, arquitectura)
   - Guías de usuario para cada rol
   - Documentación de procesos de desarrollo y despliegue

## Conclusión

InOutManager es un proyecto con un sólido fundamento en tecnologías web estándar que tiene el potencial de evolucionar hacia una solución empresarial robusta. La implementación actual demuestra las funcionalidades básicas con una interfaz de usuario intuitiva, pero requiere mejoras significativas en backend, seguridad y escalabilidad para convertirse en una herramienta de producción completa.

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE.md para más detalles.

## Contacto

Para más información, contactar a:
- Desarrollador: Mariangel Dante
- Email: mariangeldante2563@ejemplo.com
- GitHub: [mariangeldante2563](https://github.com/mariangeldante2563)