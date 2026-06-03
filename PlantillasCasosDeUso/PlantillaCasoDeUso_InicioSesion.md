# Plantilla de Caso de Uso: Inicio de Sesión

**Nombre del Caso de Uso:** Inicio de Sesión

**Descripción:** Este caso de uso permite a los usuarios autenticarse en el sistema proporcionando sus credenciales.

**Actores:**
- Usuario
- Sistema

**Flujo Principal:**
1. El usuario accede al formulario de inicio de sesión.
2. Ingresa su correo electrónico y contraseña.
3. El sistema valida las credenciales ingresadas.
4. Si las credenciales son correctas, el usuario accede al sistema.

**Flujos Alternativos:**
- **Credenciales inválidas:** El sistema muestra un mensaje de error indicando que las credenciales son incorrectas.

**Precondiciones:**
- El usuario debe estar registrado en el sistema.

**Postcondiciones:**
- El usuario accede a su panel correspondiente.

**Reglas de Negocio:**
- La contraseña debe estar encriptada en la base de datos.
- El sistema debe bloquear el acceso después de 5 intentos fallidos consecutivos.

**Excepciones:**
- Error en la conexión al servidor.
- Usuario no registrado.

---