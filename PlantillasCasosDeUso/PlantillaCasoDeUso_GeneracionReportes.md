# Plantilla de Caso de Uso: Generación de Reportes

**Nombre del Caso de Uso:** Generación de Reportes

**Descripción:** Este caso de uso permite a los administradores generar reportes detallados sobre la asistencia y productividad de los empleados.

**Actores:**
- Administrador
- Sistema

**Flujo Principal:**
1. El administrador accede al módulo de reportes.
2. Selecciona los filtros deseados (rango de fechas, empleados, departamentos, etc.).
3. Solicita la generación del reporte.
4. El sistema procesa los datos y genera el reporte en el formato seleccionado (PDF, Excel).
5. El sistema notifica al administrador que el reporte está listo para descargar.

**Flujos Alternativos:**
- **Filtros incompletos:** El sistema muestra un mensaje indicando que se deben completar los filtros obligatorios.

**Precondiciones:**
- El administrador debe estar autenticado en el sistema.

**Postcondiciones:**
- El reporte generado queda disponible para su descarga.

**Reglas de Negocio:**
- Los reportes deben incluir datos actualizados.
- Solo los administradores pueden acceder a esta funcionalidad.

**Excepciones:**
- Error en la conexión a la base de datos.
- Falla en la generación del archivo.

---