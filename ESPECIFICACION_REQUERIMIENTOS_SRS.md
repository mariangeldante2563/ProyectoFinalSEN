# ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE (SRS)
## Proyecto: IN OUT MANAGER (ProyectoFinalSEN)
### Fecha: 28 de septiembre de 2025

---

## 1. Introducción

### 1.1 Propósito
Este documento describe los requerimientos funcionales y no funcionales del sistema IN OUT MANAGER, desarrollado en el marco del ProyectoFinalSEN. El objetivo es gestionar la asistencia, control de jornada y administración de empleados en una organización, proporcionando herramientas avanzadas para el monitoreo, auditoría y generación de reportes.

### 1.2 Alcance
El sistema cubre la gestión de usuarios (empleados y administradores), registro de asistencia, control de sesiones de trabajo, generación de reportes, auditoría de acciones y visualización avanzada de datos en tiempo real. Incluye una arquitectura cliente-servidor con backend Node.js/Express y frontend web modular.

### 1.3 Definiciones, Acrónimos y Abreviaturas
- **SRS**: Software Requirements Specification
- **API**: Application Programming Interface
- **SPA**: Single Page Application
- **JWT**: JSON Web Token
- **CRUD**: Create, Read, Update, Delete

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
IN OUT MANAGER es una solución web para la gestión de asistencia y administración de empleados. El sistema se compone de:
- **Backend**: Node.js, Express, MongoDB, API RESTful
- **Frontend**: HTML5, CSS3, JavaScript ES6+, Vite, Chart.js, D3.js
- **PWA**: Funcionalidades offline y notificaciones push

### 2.2 Funciones del Producto
- Registro y autenticación de usuarios (empleados y administradores)
- Registro de entradas, salidas y pausas laborales
- Panel de administración avanzado con estadísticas, reportes y auditoría
- Gestión de empleados (alta, baja, edición, consulta)
- Visualización de datos en tiempo real y gráficos interactivos
- Generación y descarga de reportes
- Auditoría de acciones relevantes
- Sistema de notificaciones y alertas

### 2.3 Características de los Usuarios
- **Empleado**: Marca asistencia, consulta su información y reportes personales
- **Administrador**: Gestiona empleados, visualiza estadísticas, genera reportes, audita acciones y administra el sistema

### 2.4 Restricciones
- El sistema debe funcionar en navegadores modernos y dispositivos móviles
- La base de datos utilizada es MongoDB
- El backend corre en puerto 3000, el frontend en 3001
- Seguridad basada en JWT y roles

---

## 3. Requerimientos Funcionales

### 3.1 Autenticación y Gestión de Usuarios
- RF1: El sistema debe permitir el registro de empleados y administradores
- RF2: El login debe validar credenciales y roles
- RF3: Los administradores deben ingresar un código especial para acceder
- RF4: Los usuarios pueden recuperar su contraseña
- RF5: El sistema debe mantener la sesión activa y permitir logout

### 3.2 Registro de Asistencia y Sesiones
- RF6: Los empleados pueden marcar entrada, salida y pausas
- RF7: El sistema debe registrar cada evento de asistencia con fecha y hora
- RF8: Los administradores pueden consultar el historial de asistencia de cualquier empleado
- RF9: El sistema debe calcular estadísticas diarias y mensuales

### 3.3 Panel de Administración
- RF10: El administrador accede a un dashboard avanzado con KPIs, gráficos y paneles en tiempo real
- RF11: El sistema debe permitir la gestión CRUD de empleados
- RF12: El administrador puede generar y descargar reportes personalizados
- RF13: El sistema debe mostrar alertas y notificaciones relevantes
- RF14: El administrador puede auditar acciones importantes (altas, bajas, cambios de datos)

### 3.4 Funcionalidades Avanzadas
- RF15: El sistema debe mostrar gráficos interactivos (Chart.js, D3.js)
- RF16: El dashboard debe actualizarse en tiempo real
- RF17: El sistema debe funcionar como PWA (offline y notificaciones)
- RF18: Debe existir una herramienta de diagnóstico y testing para PathManager y rutas

---

## 4. Requerimientos No Funcionales

### 4.1 Rendimiento
- RNF1: El sistema debe responder a las acciones del usuario en menos de 2 segundos
- RNF2: El backend debe soportar al menos 100 usuarios concurrentes

### 4.2 Seguridad
- RNF3: Las contraseñas deben almacenarse cifradas
- RNF4: El acceso a rutas administrativas debe estar protegido por roles y JWT
- RNF5: Los datos sensibles no deben exponerse en el frontend

### 4.3 Usabilidad
- RNF6: La interfaz debe ser responsiva y accesible
- RNF7: El sistema debe mostrar mensajes claros de error y éxito

### 4.4 Mantenibilidad
- RNF8: El código debe estar modularizado y documentado
- RNF9: Debe existir una herramienta de diagnóstico para rutas y módulos

### 4.5 Portabilidad
- RNF10: El sistema debe funcionar en Windows, Linux y MacOS

---

## 5. Requerimientos de la Interfaz Externa

### 5.1 API RESTful
- La API debe exponer endpoints para:
    - Autenticación (`/api/auth/register`, `/api/auth/login`)
    - Gestión de usuarios (`/api/users`, `/api/users/:id`)
    - Registro de asistencia (`/api/attendance/clock-in`, `/api/attendance/clock-out`)
    - Estadísticas y reportes (`/api/admin/stats`, `/api/reports/generate`)
    - Auditoría (`/api/audit`)

### 5.2 Interfaz de Usuario
- El frontend debe estar dividido en componentes HTML para cada módulo
- Debe existir navegación protegida por roles
- El dashboard debe ser interactivo y modular

### 5.3 Integraciones
- El sistema debe permitir la exportación de reportes en formatos estándar (CSV, PDF)
- Debe ser posible integrar notificaciones push

---

## 6. Apéndices

### 6.1 Supuestos y Dependencias
- Se asume que los usuarios tienen acceso a internet y dispositivos compatibles
- El sistema depende de Node.js, MongoDB y navegadores modernos

### 6.2 Glosario
- **Empleado**: Usuario que marca asistencia y consulta su información
- **Administrador**: Usuario con permisos avanzados para gestionar el sistema
- **Dashboard**: Panel de control con visualización avanzada de datos
- **Auditoría**: Registro de acciones relevantes para control y seguridad

---

**Fin del documento SRS.**