# Plantilla de Caso de Uso: Registro de Usuario

**Nombre del Caso de Uso:** Registro de Usuario

**Descripción:** Este caso de uso permite a los usuarios (empleados y administradores) registrarse en el sistema proporcionando sus datos personales y credenciales.

**Actores:**
- Usuario (Empleado/Administrador)
- Sistema

**Flujo Principal:**
1. El usuario accede al formulario de registro.
2. Completa los campos requeridos (nombre, correo, contraseña, etc.).
3. Si es administrador, ingresa un código adicional.
4. El sistema valida los datos ingresados.
5. El sistema registra al usuario y muestra un mensaje de confirmación.

**Flujos Alternativos:**
- **Datos inválidos:** El sistema muestra mensajes de error específicos para cada campo.

**Precondiciones:**
- El usuario debe tener acceso al sistema.

**Postcondiciones:**
- El usuario queda registrado en la base de datos.

**Reglas de Negocio:**
- La contraseña debe tener al menos 6 caracteres.
- El código de administrador debe ser un número de máximo 4 dígitos.

**Excepciones:**
- Error en la conexión a la base de datos.
- Campos obligatorios no completados.

---