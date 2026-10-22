# Quickstart: validar Registro de Asistencia y Control de Jornada

Esta guía ejecuta las pruebas de aceptación después de implementar el plan. No incluye
credenciales reales ni datos de empleados reales.

## Requisitos previos

- Node.js y npm compatibles con los manifiestos del repositorio.
- MongoDB configurado como replica set para soportar transacciones multi-documento.
- Variables de entorno del backend configuradas en `.env` local, sin subir secretos a Git.
- Chrome y ChromeDriver compatibles para las pruebas Selenium.
- Cuentas de prueba aisladas para un empleado y un administrador con roles reconocidos por
  `backend/middlewares/auth.js`.
- El perfil de cada usuario de prueba tiene un régimen laboral validado y una versión de
  horario que cubre las fechas de los escenarios; de lo contrario sus cálculos quedan
  correctamente pendientes de revisión.

## Iniciar la aplicación

En dos terminales desde la raíz del repositorio:

```powershell
npm run start:backend
```

```powershell
npm run dev
```

Verifica que `http://localhost:5000/health` responda con `success: true` y que el frontend
cargue desde el servidor Vite configurado en la raíz.

## Pruebas automatizadas

Ejecuta las pruebas unitarias e integración existentes del backend:

```powershell
npm --prefix backend test -- --runInBand
```

Resultado esperado: los casos nuevos de cálculo, reglas efectivas, estados de jornada,
autorización, auditoría y transacciones pasan. El entorno de integración debe ser MongoDB
transaction-capable; una instancia standalone no valida esta característica.

Ejecuta los flujos Selenium sin credenciales embebidas en código:

```powershell
node tests/selenium/registroEntrada.js
```

Resultado esperado: autenticación de empleado, entrada aceptada, segunda entrada rechazada,
salida válida, historial visible y solicitud de corrección pendiente. Ejecuta además el flujo
de administrador añadido para decidir correcciones, inspeccionar la auditoría y descargar un
reporte.

## Escenarios de aceptación manual

1. **Configuración**: administrador asigna a los usuarios de prueba su régimen, horario
   ordinario, día de descanso y opciones normativas documentadas, con fecha de vigencia.
2. **Marca normal**: empleado sin sesión registra entrada; la respuesta muestra hora del
   servidor y estado activo. Registra salida posterior; la sesión queda completada y su marca
   y auditoría aparecen en el historial.
3. **Duplicados y concurrencia**: con sesión activa repite entrada y luego lanza dos entradas
   concurrentes al iniciar una jornada nueva. Se acepta una sola apertura; las operaciones
   rechazadas responden con conflicto y no dejan marcas ni auditorías huérfanas.
4. **Salida olvidada/corrección**: empleado envía hora real de salida y motivo. Sesión y
   totales siguen pendientes; administrador aprueba o rechaza. La decisión y sus valores se
   auditan; el registro original sigue visible.
5. **Fechas legales**: valida pares inmediatamente antes/después de 1 de julio, 15 de julio
   y 25 de diciembre de 2025; el resultado identifica la regla aplicada. Incluye trabajo
   nocturno, día de descanso distinto de domingo cuando esté configurado, festivo, medianoche
   y semana de lunes a domingo.
6. **Historial y privacidad**: empleado consulta rango inclusivo, intenta consultar a otro
   usuario y prueba rango invertido; verifica respuesta correcta, denegación y error validado.
7. **Dashboard vacío y con datos**: administrador consulta una fecha sin marcas (agregados en
   cero) y una fecha con empleados y sesiones pendientes; contrasta los totales con sus
   sesiones y segmentos locales.
8. **Informe mensual**: administrador solicita `month=YYYY-MM`, descarga un XLSX con datos y
   verifica empleados, fechas, desglose y totales. Repite con mes vacío y verifica workbook
   válido. Empleado no autorizado no puede generar ni descargar un informe global.

## Umbrales verificables

- Informe descargado para 500 empleados y un mes de 31 días en menos de 30 segundos.
- Consulta de historial de hasta 12 meses en menos de 5 segundos.
- Ninguna acción de marcar o corregir responde como exitosa sin confirmación de transacción
  que incluya su evento de auditoría.
- No hay cálculos de horas o recargos ejecutados en el navegador ni en hooks de modelos.

## Referencias de diseño

- [Contratos REST](./contracts/attendance.openapi.yaml)
- [Modelo de datos y migración](./data-model.md)
- [Investigación legal y decisiones técnicas](./research.md)
- [Especificación y criterios de aceptación](./spec.md)
