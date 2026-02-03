# Documento de Casos de Uso y Funcionalidad del Sistema

## 1. Introducción
Este documento describe los casos de uso y la funcionalidad del sistema **InOutManager**, un sistema de gestión de asistencia y control de jornada laboral. Se incluyen diagramas UML y plantillas de casos de uso basados en estándares de documentación.

---

## 2. Casos de Uso
### 2.1. Registro de Usuarios
**Descripción:** Permite a los empleados y administradores registrarse en el sistema proporcionando datos personales y credenciales.

**Actores:**
- Usuario (Empleado/Administrador)
- Sistema

**Flujo Principal:**
1. El usuario accede al formulario de registro.
2. Completa los campos requeridos (nombre, correo, contraseña, etc.).
3. Si es administrador, ingresa un código adicional.
4. El sistema valida los datos y registra al usuario.
5. Se muestra un mensaje de confirmación.

**Flujos Alternativos:**
- Datos inválidos: El sistema muestra mensajes de error específicos.

**Precondiciones:**
- El usuario debe tener acceso al sistema.

**Postcondiciones:**
- El usuario queda registrado en la base de datos.

---

### 2.2. Inicio de Sesión
**Descripción:** Permite a los usuarios autenticarse en el sistema.

**Actores:**
- Usuario
- Sistema

**Flujo Principal:**
1. El usuario accede al formulario de inicio de sesión.
2. Ingresa su correo y contraseña.
3. El sistema valida las credenciales.
4. Si son correctas, el usuario accede al sistema.

**Flujos Alternativos:**
- Credenciales inválidas: El sistema muestra un mensaje de error.

**Precondiciones:**
- El usuario debe estar registrado.

**Postcondiciones:**
- El usuario accede a su panel correspondiente.

---

## 3. Tipos de Diagramas UML
Para modelar el sistema, se utilizan los siguientes diagramas UML:
- **Diagrama de Casos de Uso:** Representa las interacciones entre los actores y el sistema.
- **Diagrama de Clases:** Modela la estructura estática del sistema.
- **Diagrama de Secuencia:** Describe el flujo de mensajes entre objetos.

---

## 4. Diagramas UML
### 4.1. Diagrama de Casos de Uso
(Se incluirá un diagrama representando los casos de uso principales: Registro, Inicio de Sesión, Gestión de Asistencia, etc.)

### 4.2. Diagrama de Clases
(Se incluirá un diagrama mostrando las clases principales: Usuario, Sesión, Reporte, etc.)

### 4.3. Diagrama de Secuencia
(Se incluirá un diagrama detallando el flujo de mensajes para el caso de uso "Registro de Usuarios".)

---

## 5. Plantillas de Casos de Uso
A continuación, se presenta una plantilla estándar para documentar los casos de uso:

### Plantilla de Caso de Uso
**Nombre del Caso de Uso:** [Nombre del caso de uso]

**Descripción:** [Breve descripción del caso de uso.]

**Actores:** [Lista de actores involucrados.]

**Flujo Principal:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Flujos Alternativos:**
- [Condición]: [Descripción del flujo alternativo.]

**Precondiciones:** [Condiciones que deben cumplirse antes de ejecutar el caso de uso.]

**Postcondiciones:** [Resultados esperados después de ejecutar el caso de uso.]

---

## 6. Herramientas Utilizadas
Para la elaboración de los diagramas UML, se recomienda utilizar herramientas como:
- **Lucidchart**
- **Draw.io**
- **StarUML**

---

## 7. Conclusión
Este documento proporciona una visión clara de los casos de uso y la funcionalidad del sistema, sirviendo como referencia para el desarrollo y validación del proyecto.