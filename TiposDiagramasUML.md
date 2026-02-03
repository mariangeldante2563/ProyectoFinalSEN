# Tipos de Diagramas UML

## Introducción
Los diagramas UML (Unified Modeling Language) son herramientas visuales que permiten modelar y documentar sistemas de software. A continuación, se describen los principales tipos de diagramas UML utilizados en el desarrollo del sistema **InOutManager**.

---

## 1. Diagrama de Casos de Uso
**Descripción:**
- Representa las interacciones entre los actores (usuarios u otros sistemas) y el sistema.
- Útil para identificar los requisitos funcionales del sistema.

**Elementos Clave:**
- Actores
- Casos de uso
- Relaciones (asociación, inclusión, extensión)

**Ejemplo:**
- Registro de usuarios
- Inicio de sesión
- Generación de reportes

---

## 2. Diagrama de Clases
**Descripción:**
- Modela la estructura estática del sistema, mostrando las clases, sus atributos, métodos y relaciones.
- Útil para el diseño detallado del sistema.

**Elementos Clave:**
- Clases
- Atributos y métodos
- Relaciones (herencia, asociación, composición, agregación)

**Ejemplo:**
- Clase Usuario con atributos como nombre, correo, contraseña.
- Clase Reporte con métodos para generar reportes en Excel.

---

## 3. Diagrama de Secuencia
**Descripción:**
- Representa el flujo de mensajes entre objetos en un escenario específico.
- Útil para modelar la lógica de los casos de uso.

**Elementos Clave:**
- Objetos
- Mensajes
- Línea de vida

**Ejemplo:**
- Flujo de registro de un usuario.
- Flujo de autenticación y autorización.

---

## 4. Diagrama de Actividades
**Descripción:**
- Modela el flujo de trabajo o procesos dentro del sistema.
- Útil para entender la lógica de negocio y los procesos.

**Elementos Clave:**
- Actividades
- Decisiones
- Flujos

**Ejemplo:**
- Proceso de generación de reportes.
- Proceso de validación de datos de entrada.

---

## 5. Diagrama de Componentes
**Descripción:**
- Muestra la organización y dependencia entre los componentes del sistema.
- Útil para modelar la arquitectura del sistema.

**Elementos Clave:**
- Componentes
- Interfaces
- Relaciones

**Ejemplo:**
- Componentes del backend (controladores, servicios, modelos).
- Componentes del frontend (formularios, scripts, estilos).

---

## 6. Diagrama de Despliegue
**Descripción:**
- Representa la distribución física del sistema en hardware.
- Útil para planificar la infraestructura del sistema.

**Elementos Clave:**
- Nodos
- Artefactos
- Relaciones

**Ejemplo:**
- Servidor backend desplegado en un servidor Node.js.
- Base de datos MongoDB alojada en un servidor remoto.

---

## Conclusión
Los diagramas UML son esenciales para modelar y documentar sistemas complejos como **InOutManager**. Cada tipo de diagrama proporciona una perspectiva única que facilita el diseño, desarrollo y mantenimiento del sistema.