# Especificaciones Técnicas - IN OUT MANAGER

## Análisis de Dependencias

### Frontend Dependencies (package.json)
```json
{
  "dependencies": {
    "@fortawesome/fontawesome-free": "^6.5.1"  // Iconografía
  },
  "devDependencies": {
    "vite": "^5.0.0"  // Servidor de desarrollo y build
  }
}
```

### Backend Dependencies (requirements.txt)
```
asgiref==3.8.1                   # Soporte ASGI para Django
Django==5.2.3                    # Framework web principal
djangorestframework==3.16.0      # API REST framework
PyMySQL==1.1.1                   # Conector MySQL
sqlparse==0.5.3                  # Parser SQL
tzdata==2025.2                   # Datos de zonas horarias
```

## Configuración de Vite

### Características del servidor de desarrollo:
- **Puerto**: 3000
- **Auto-apertura**: Página principal al iniciar
- **Hot Module Replacement**: Recarga en vivo
- **Host**: Acceso desde red local habilitado

### Configuración de Build:
- **Múltiples puntos de entrada**: Todas las páginas HTML
- **Optimización**: Minificación y tree-shaking automático
- **Assets**: Manejo inteligente de recursos estáticos

## Estructura de Archivos JavaScript

### Módulos por Funcionalidad

#### `script.js` (Core)
- Navegación principal
- Menú responsive
- Funcionalidades base

#### `login.js` (Autenticación)
- Validación de formularios
- Manejo de errores
- Redirección post-login

#### `registro.js` (Registro)
- Validación compleja de campos
- Confirmación de contraseñas
- Integración con API

#### `dashboard-admin.js` (Administración)
- Gestión de empleados
- Generación de reportes
- Filtros y búsquedas

#### `dashboard-empleado.js` (Empleados)
- Check-in/Check-out
- Visualización de historial
- Notificaciones

## Arquitectura CSS

### Metodología de Estilos
- **CSS Variables**: Para consistencia de colores y espaciado
- **Mobile-First**: Diseño responsive desde móvil
- **Modularidad**: Archivos separados por funcionalidad

### Breakpoints Responsivos
```css
/* Móvil */
@media (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Desktop grande */
@media (min-width: 1440px) { }
```

## Configuración de Django

### Apps Instaladas
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',        # API REST
    'inoutapi',             # App principal del proyecto
]
```

### Configuración de Base de Datos
- **Desarrollo**: SQLite (incluida)
- **Producción**: MySQL (configuración en settings.py)

## Patrones de Diseño Implementados

### Frontend
- **Module Pattern**: Encapsulación de funcionalidades
- **Observer Pattern**: Manejo de eventos del DOM
- **Factory Pattern**: Creación de elementos dinámicos

### Backend
- **MVT Pattern**: Model-View-Template de Django
- **Repository Pattern**: Abstracción de acceso a datos
- **Serializer Pattern**: Transformación de datos API

## Seguridad Implementada

### Frontend
- Validación de inputs en cliente
- Sanitización de datos
- Escape de HTML para prevenir XSS

### Backend
- CSRF Protection (Django)
- Validación server-side
- Autenticación basada en sesiones
- Permisos por rol de usuario

## Optimizaciones de Rendimiento

### Carga de Recursos
- **Preload**: Recursos críticos prioritarios
- **Defer**: Scripts no críticos
- **Lazy Loading**: Imágenes bajo demanda

### Versionado de Assets
```html
<link rel="stylesheet" href="styles.css?v=20250702003">
```

### Compresión
- Imágenes optimizadas (WebP cuando es posible)
- CSS minificado en producción
- JavaScript comprimido

## Testing y Desarrollo

### Herramientas de Desarrollo
- **Live Reload**: Vite development server
- **Browser DevTools**: Debugging integrado
- **Console Logging**: Sistema de logs estructurado

### Validación
- **HTML Validator**: Markup semántico
- **CSS Validator**: Estilos válidos
- **Accessibility Check**: Cumplimiento WCAG

## Deployment y Producción

### Frontend
```bash
npm run build    # Genera archivos optimizados
npm run preview  # Preview de producción
```

### Backend
```bash
python manage.py collectstatic  # Recolecta archivos estáticos
python manage.py migrate       # Aplica migraciones
gunicorn inoutmanager_backend.wsgi  # Servidor WSGI
```

## Monitoreo y Logs

### Frontend
- **Console.log**: Debugging en desarrollo
- **Error Handling**: Manejo graceful de errores
- **User Analytics**: Preparado para Google Analytics

### Backend
- **Django Logging**: Sistema de logs estructurado
- **Database Query Monitoring**: Optimización de consultas
- **API Response Times**: Métricas de rendimiento

## Compatibilidad de Navegadores

### Soporte Completo
- Chrome 89+
- Firefox 86+
- Safari 14+
- Edge 88+

### Funcionalidades Progresivas
- Service Workers (preparado)
- Push Notifications (en desarrollo)
- Offline Mode (planificado)

---

*Este documento técnico complementa la descripción del proyecto proporcionando detalles específicos de implementación y configuración.*