# Tasks: Registro de Asistencia y Control de Jornada

**Input**: Design documents from `/specs/001-control-jornada-asistencia/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/attendance.openapi.yaml](./contracts/attendance.openapi.yaml), [quickstart.md](./quickstart.md)

**Tests**: Se incluyen tareas de pruebas porque el plan y la constituciÃ³n exigen pruebas unitarias de cÃ¡lculos y comportamientos de autenticaciÃ³n, integraciÃ³n HTTP/DB y flujos Selenium crÃ­ticos.

**Organization**: Las tareas estÃ¡n agrupadas por historia de usuario y ordenadas por dependencia. Los cambios compartidos y bloqueantes preceden a las historias.

## Phase 1: Setup

**Purpose**: Preparar la persistencia transaccional requerida por las escrituras atÃ³micas.

- [X] T001 Configurar en `backend/config/db.js` la comprobaciÃ³n explÃ­cita de que MongoDB soporta transacciones multi-documento y propagar un error de inicio claro si la topologÃ­a no es compatible. | Ref. ConstituciÃ³n: VIII

---

## Phase 2: Foundational

**Purpose**: Resolver autorizaciÃ³n, validaciÃ³n, auditorÃ­a y datos compartidos que bloquean las historias.

- [X] T002 Alinear `backend/middlewares/roles.js` con las claims y valores de rol de `backend/middlewares/auth.js` (`tipoUsuario`: `empleado` y `administrador`) y conservar las comprobaciones JWT existentes. | Ref. ConstituciÃ³n: III
- [ ] T002b [Foundation] Crear middleware requireAdmin en `backend/middlewares/roles.js` que verifique JWT vÃ¡lido y tipoUsuario === "administrador", devolviendo 401 si no hay token y 403 si el rol no es administrador. Exportar como funciÃ³n reutilizable. Referencia: ConstituciÃ³n Principio III (autorizaciÃ³n en middleware, no en controladores) y SC-006 (aislamiento de datos). | Ref. ConstituciÃƒÂ³n: II, III
- [ ] T003 Implementar validaciÃ³n y sanitizaciÃ³n reutilizable de parÃ¡metros, query strings y cuerpos para las rutas de asistencia en `backend/middlewares/validation.js`; rechazar fechas invertidas, IDs invÃ¡lidos, filtros NoSQL y valores fuera de contrato antes de llegar a servicios. | Ref. ConstituciÃ³n: II, III
- [X] T004 Hacer que `backend/services/auditService.js` acepte y use la sesiÃ³n Mongoose de la operaciÃ³n, propague errores de persistencia y no confirme acciones cuando falla la escritura de auditorÃ­a. | Ref. ConstituciÃ³n: V
- [X] T005 Extender `backend/models/User.js` con `activo` y `horariosLaborales[]`; preservar `horarioAsignado` durante la migraciÃ³n y aplicar estas reglas de `data-model.md`: `regimenLaboral` es obligatorio; `vigenteDesde` es inclusivo; `vigenteHasta` es exclusivo o nulo; las versiones no se solapan; las claves diarias son dÃ­as ISO; los minutos diarios son no negativos; y adopciones anticipadas de jornada de 42 horas o recargo de descanso del 100% requieren fecha documentada. | Ref. ConstituciÃ³n: I, V
- [X] T006 Crear `backend/tests/helpers/transactionTestDb.js` para que las pruebas de integraciÃ³n usen una base aislada con transacciones disponibles y limpieza determinista de datos entre casos. | Ref. ConstituciÃ³n: VI, VIII

**Checkpoint**: Las historias pueden comenzar cuando las operaciones protegidas compartan autorizaciÃ³n y validaciÃ³n coherentes, las escrituras de auditorÃ­a participen en transacciones y exista soporte de prueba transaccional.

## Phase 3: User Story 1 - Marcar inicio y fin de jornada (Priority: P1)

**Goal**: Aceptar marcas de entrada/salida inequÃ­vocas y mantener una sola jornada activa por empleado, con solicitudes de salida olvidada pendientes de aprobaciÃ³n.

**Independent Test**: Un empleado autenticado crea entrada y salida vÃ¡lidas; entradas duplicadas, salidas sin entrada, marcas fuera de secuencia y entradas concurrentes se rechazan sin dejar cambios parciales. Una solicitud de correcciÃ³n por salida olvidada deja la jornada incompleta.

### Tests for User Story 1

- [X] T007 [P] [US1] Crear pruebas unitarias de transiciones de marcas y conflictos en `backend/tests/unit/attendanceService.test.js`, cubriendo duplicados, salida sin entrada, salida anterior o igual, empleado desactivado y solicitudes concurrentes. | Ref. ConstituciÃ³n: VI
- [ ] T008 [P] [US1] Crear pruebas de integraciÃ³n transaccional de las rutas de marcas en `backend/tests/integration/attendanceRoutes.test.js`, incluyendo rechazo de marcas con timestamps enviados por cliente, rollback ante fallo de auditorÃ­a y unicidad de la jornada activa. | Ref. ConstituciÃ³n: VI
### Implementation for User Story 1

- [X] T009 [P] [US1] Extender `backend/models/Attendance.js` con marca inmutable y fecha local canÃ³nica; cumplir las restricciones de `data-model.md`: `type` solo admite `entrada` o `salida`, `timestamp` lo asigna el servidor, `date` usa `YYYY-MM-DD` en `America/Bogota` y las marcas aceptadas no se actualizan ni eliminan fÃ­sicamente. | Ref. ConstituciÃ³n: I, V
- [X] T010 [P] [US1] Extender `backend/models/WorkSession.js` con estados `activa`, `incompleta` y `completada`, salida efectiva nula hasta su aceptaciÃ³n, y un Ã­ndice Ãºnico parcial por `userId` solo para `estado: "activa"`; conservar valores calculados nulos mientras la jornada no sea final. | Ref. ConstituciÃ³n: I, V
- [ ] T011 [US1] Implementar `backend/services/attendanceService.js` para procesar entrada/salida en una transacciÃ³n que incluya Attendance, WorkSession, auditorÃ­a y proyecciÃ³n diaria; usar actualizaciÃ³n condicional de salida y traducir conflictos de unicidad a conflicto HTTP sin cerrar automÃ¡ticamente ni estimar marcas. | Ref. ConstituciÃ³n: I, II, III, IV
- [X] T012 [US1] Implementar en `backend/services/attendanceCorrectionService.js` la creaciÃ³n de solicitudes de salida olvidada como eventos de auditorÃ­a inmutables con hora propuesta, motivo, actor y referencia a la jornada; mantenerla incompleta y excluirla de totales definitivos mientras estÃ© pendiente. | Ref. ConstituciÃ³n: V
- [ ] T013 [US1] Conectar las operaciones de marca, sesiÃ³n activa y solicitud de correcciÃ³n en `backend/controllers/attendanceController.js` y `backend/routes/attendance.js`, usando UN SOLO endpoint POST /api/attendance que recibe { type: "entrada" | "salida" } segÃºn contracts/attendance.openapi.yaml, y POST /api/corrections para solicitudes de correcciÃ³n. Exigir JWT y rol empleado en ambas rutas. El controlador SOLO debe orquestar: validar entrada con middleware validation.js, delegar toda la lÃ³gica a attendanceService.js o attendanceCorrectionService.js, y responder con los cÃ³digos definidos en el OpenAPI. PROHIBIDO que el controlador contenga lÃ³gica de transacciÃ³n, cÃ¡lculo o validaciÃ³n de reglas de negocio (Principio I de la constituciÃ³n). | Ref. ConstituciÃ³n: I, II, III
- [ ] T014 [US1] Actualizar `frontend/assets/js/api-service.js` y `frontend/assets/js/dashboard-empleado.js` para: enviar POST /api/attendance con { type: "entrada" | "salida" } y POST /api/corrections; mostrar estado activo/incompleto de la jornada; presentar Ãºnicamente timestamps y resultados de cÃ¡lculo recibidos del backend. PROHIBIDO replicar lÃ³gica de cÃ¡lculo de horas o recargos en el frontend (Principio IV de la constituciÃ³n). | Ref. ConstituciÃ³n: IV, I
- [ ] T015 [US1] Volver determinista tests/selenium/registroEntrada.js usando credenciales de prueba desde variables de entorno (process.env.TEST_USER, TEST_PASSWORD) y esperas explÃ­citas (WebDriverWait); cubrir login de empleado, marcaciÃ³n de entrada vÃ­a POST /api/attendance con type=entrada, rechazo de entrada duplicada (HTTP 409), marcaciÃ³n de salida vÃ­a POST /api/attendance con type=salida, y consulta de historial. Sin secretos hardcodeados en el archivo. Referencia: ConstituciÃ³n Principio VI (pruebas automatizadas de comportamientos crÃ­ticos). | Ref. ConstituciÃ³n: VI

**Checkpoint**: US1 funciona por sÃ­ sola con marcas autorizadas, exclusiÃ³n concurrente y errores explÃ­citos; las acciones aceptadas siempre quedan auditadas en la misma transacciÃ³n.

## Phase 4: User Story 2 - Consultar jornada calculada (Priority: P1)

**Goal**: Calcular duraciones y clasificaciones laborales histÃ³ricas desde el servidor, usando el horario efectivo y las reglas colombianas aplicables a cada fecha.

**Independent Test**: Para jornadas de referencia cubiertas por un horario y rÃ©gimen vÃ¡lidos, los detalles y acumulados identifican ordinarias, extras y recargos correctos en cambios de fecha legal, turnos nocturnos, cruces de medianoche y semanas lunes-domingo; datos incompletos quedan pendientes de revisiÃ³n.

### Tests for User Story 2

- [ ] T016 [P] [US2] Crear pruebas unitarias con casos de referencia y lÃ­mites efectivos en `backend/tests/unit/TimeCalculationService.test.js`, incluyendo 1 de enero, 1 de julio, 15 de julio, 24/25 de diciembre de 2025, zona `America/Bogota`, jornada flexible, cruce de medianoche/semana, topes diarios/semanales, solapamientos nocturnos y festivos, y horario ausente. | Ref. ConstituciÃ³n: VI
### Implementation for User Story 2

- [ ] T017 [P] [US2] Implementar en `backend/services/ColombianLaborLawService.js` las consultas de reglas efectivas y polÃ­ticas configuradas, incluidas franja nocturna, topes y porcentajes descritos en `research.md`; mantener aquÃ­ solo datos y bÃºsquedas normativas, sin fÃ³rmulas de duraciÃ³n o clasificaciÃ³n. | Ref. ConstituciÃ³n: IV
- [ ] T018 [US2] Centralizar en `backend/services/TimeCalculationService.js` toda duraciÃ³n, segmentaciÃ³n local, clasificaciÃ³n ordinaria/extra/nocturna/descanso/festivo y validaciÃ³n semanal lunes-domingo; aplicar horario y rÃ©gimen efectivos, metadatos de regla y estado pendiente cuando falte informaciÃ³n validada. | Ref. ConstituciÃ³n: IV
- [ ] T019 [US2] Eliminar cÃ¡lculos de hooks/statics de `backend/models/WorkSession.js` y `backend/models/DailyStats.js`; hacer que ambos modelos persistan y consulten proyecciones producidas exclusivamente por `TimeCalculationService`. | Ref. ConstituciÃ³n: I, IV
- [ ] T020 [US2] Actualizar `backend/services/attendanceService.js` para invocar `TimeCalculationService` al cerrar jornadas aceptadas y persistir en WorkSession los resultados, versiÃ³n de cÃ¡lculo y evidencia de la regla efectiva. | Ref. ConstituciÃ³n: IV
- [ ] T021 [US2] AÃ±adir a `backend/controllers/attendanceController.js` y `backend/routes/attendance.js` la consulta de detalle y resumen de perÃ­odo de sesiones para propietario o administrador, usando exclusivamente resultados calculados en el backend. | Ref. ConstituciÃ³n: I, II, III
- [ ] T022 [US2] Actualizar `frontend/assets/js/dashboard-empleado.js` para presentar duraciÃ³n, horas ordinarias, extras y recargos retornados por el servidor sin replicar fÃ³rmulas de tiempo o reglas legales en el navegador. | Ref. ConstituciÃ³n: IV, I

**Checkpoint**: US2 puede consultarse con marcas y horarios configurados, muestra evidencia normativa y no publica como definitivo un cÃ¡lculo sin los datos requeridos.

## Phase 5: User Story 3 - Consultar historial y estadÃ­sticas (Priority: P2)

**Goal**: Proporcionar historial inclusivo por fecha, filtros administrativos, agregados diarios y control auditado de la elegibilidad para marcar.

**Independent Test**: Con jornadas y marcas de varios usuarios se consultan rangos inclusivos como empleado y administrador; el propietario no ve datos ajenos, los rangos vacÃ­os producen cero/vacÃ­o, y agregados diarios reflejan jornadas segmentadas por fecha local.

### Tests for User Story 3

- [ ] T023 [P] [US3] Crear pruebas de integraciÃ³n en `backend/tests/integration/attendanceHistoryStats.test.js` para rangos inclusivos `America/Bogota`, aislamiento del empleado, filtros admin, rango invertido, dÃ­a vacÃ­o, cruces de medianoche y agregados de sesiones incompletas. | Ref. ConstituciÃ³n: VI
- [ ] T024 [P] [US3] AÃ±adir pruebas de autorizaciÃ³n y auditorÃ­a del cambio de elegibilidad en `backend/tests/integration/attendanceEligibility.test.js`, confirmando que solo administradores cambian estado y que el historial permanece disponible. | Ref. ConstituciÃ³n: VI
### Implementation for User Story 3

- [ ] T025 [US3] Completar en `backend/models/DailyStats.js` la persistencia de agregados por empleado y fecha `YYYY-MM-DD`, con clave Ãºnica `{ userId: 1, fecha: 1 }`, segmentos por dÃ­a local y estado separado para jornadas activas/incompletas; crear `backend/services/attendanceAdminService.js` para operaciones administrativas de asistencia y auditorÃ­a, sin implementar cÃ¡lculos de jornada. | Ref. ConstituciÃ³n: I, IV, V
- [ ] T026 [US3] Implementar `backend/services/attendanceStatsService.js` para consultas paginadas de marcas e historial por fechas, filtros por empleado y agregados diarios desde DailyStats. El servicio solo lee y agrega resultados ya calculados por TimeCalculationService; NO recalcula ni modifica usuarios. | Ref. ConstituciÃ³n: IV
- [ ] T027 [US3] Exponer las rutas de historial, consulta de todos, estadÃ­sticas diarias, estado de empleado y horario en `backend/routes/attendance.js` y las rutas existentes de usuarios; conectar `backend/controllers/attendanceController.js` con `attendanceStatsService.js` para consultas y `attendanceAdminService.js` para operaciones administrativas, aplicando permisos y validaciÃ³n por endpoint. OBLIGATORIO: Aplicar middleware requireAdmin (T002b) a las rutas exclusivas de administrador de esta tarea. PROHIBIDO validar rol dentro del controlador (Principio III). | Ref. ConstituciÃ³n: I, II, III
- [ ] T028 [US3] Actualizar `frontend/assets/js/dashboard-empleado.js`, `frontend/assets/js/dashboard-admin.js`, `frontend/components/empleado/dashboard-empleado.html` y `frontend/components/admin/dashboard-admin.html` para filtros de fecha, historial, resumen diario y estados pendientes usando solo datos del backend. | Ref. ConstituciÃ³n: IV, I

**Checkpoint**: US3 entrega resultados separados por rol, fechas inclusivas, agregados sin doble conteo y respuesta vacÃ­a con totales cero.

## Phase 6: User Story 4 - Exportar informe mensual (Priority: P2)

**Goal**: Generar un archivo Excel mensual autorizado y auditable con detalle, clasificaciÃ³n y totales por empleado.

**Independent Test**: Un administrador genera y descarga informes para un mes con jornadas y uno vacÃ­o; los datos incluyen clasificaciÃ³n por fecha local y los empleados no pueden generar ni descargar informes globales.

### Tests for User Story 4

- [ ] T029 [P] [US4] Crear pruebas unitarias de filas, desglose y totales en `backend/tests/unit/attendanceReportService.test.js`, incluyendo cruces de medianoche, jornadas pendientes y perÃ­odo sin registros. | Ref. ConstituciÃ³n: VI
- [ ] T030 [P] [US4] Crear pruebas de integraciÃ³n de acceso y descarga en `backend/tests/integration/monthlyReportRoutes.test.js`, verificando rol admin requerido tanto para generaciÃ³n como para descarga y workbook vacÃ­o vÃ¡lido. | Ref. ConstituciÃ³n: VI

### Implementation for User Story 4

- [ ] T031 [US4] Implementar `backend/services/attendanceReportService.js` para consultar empleados y segmentos del mes calendario, ensamblar valores ya calculados y pendientes, registrar eventos de generaciÃ³n/descarga y no declarar exitoso el informe antes de completar su auditorÃ­a. RESTRICCIÃ“N CONSTITUCIONAL: `attendanceAdminService.js` SOLO puede leer y agregar resultados ya calculados por TimeCalculationService. PROHIBIDO recalcular horas, recargos o totales. Si necesita un agregado nuevo, debe extender TimeCalculationService, no duplicar la lÃ³gica (Principio IV). | Ref. ConstituciÃ³n: IV
- [ ] T032 [US4] Extender `backend/controllers/reportController.js`, `backend/routes/reports.js` y `backend/utils/reports/excelGenerator.js` para generar y descargar el Excel mensual definido en `contracts/attendance.openapi.yaml` mediante `GET /api/admin/reports/monthly`, mantener ExcelJS, filtrar el mes solicitado y restringir ambos endpoints al rol administrador. RESTRICCIÃ“N CONSTITUCIONAL: `attendanceStatsService.js` SOLO puede leer y agregar resultados ya calculados por TimeCalculationService. PROHIBIDO recalcular horas, recargos o totales. Si necesita un agregado nuevo, debe extender TimeCalculationService, no duplicar la lÃ³gica (Principio IV). OBLIGATORIO: Aplicar middleware requireAdmin (T002b) a esta ruta. PROHIBIDO validar rol dentro del controlador (Principio III). | Ref. ConstituciÃ³n: I, II, III
- [ ] T033 [US4] Actualizar `frontend/assets/js/reports-manager.js` y `frontend/assets/js/dashboard-admin.js` para solicitar mes, iniciar descarga y comunicar error o perÃ­odo vacÃ­o de acuerdo con la respuesta del servidor. | Ref. ConstituciÃ³n: IV, I
- [ ] T034 [US4] AÃ±adir a `tests/selenium/` un flujo de administrador que genere y descargue un informe mensual, compruebe su perÃ­odo y un flujo de empleado que compruebe denegaciÃ³n, usando cuentas de prueba y sin credenciales incrustadas. Verificar mediante test de integraciÃ³n que requireAdmin (T002b) devuelve 403 a un usuario con tipoUsuario=empleado y 200 a un usuario con tipoUsuario=administrador. | Ref. ConstituciÃ³n: VI

**Checkpoint**: US4 produce un workbook vÃ¡lido para meses con y sin datos y protege tanto la generaciÃ³n como la descarga.

## Phase 7: User Story 5 - Consultar auditorÃ­a de asistencia (Priority: P2)

**Goal**: Permitir a administradores reconstruir marcas y correcciones sin modificar registros fuente ni eventos previos.

**Independent Test**: Un administrador consulta eventos enlazados de una marca y puede aprobar/rechazar correcciones de errores; se preserva el original, solo una decisiÃ³n puede ganar y la vista muestra actor, momento, motivo y valores previos/propuestos/efectivos.

### Tests for User Story 5

- [ ] T035 [P] [US5] Crear pruebas de integraciÃ³n de solicitudes y decisiones en `backend/tests/integration/attendanceCorrectionRoutes.test.js`, cubriendo aprobaciÃ³n, rechazo, solicitud repetida, marca original inmutable, decisiÃ³n duplicada y exclusiÃ³n de pendientes de totales finales. Verificar mediante test de integraciÃ³n que requireAdmin (T002b) devuelve 403 a un usuario con tipoUsuario=empleado y 200 a un usuario con tipoUsuario=administrador. | Ref. ConstituciÃ³n: VI
- [ ] T036 [P] [US5] Crear pruebas de integraciÃ³n en `backend/tests/integration/attendanceAudit.test.js` para permiso administrativo, secuencia append-only, carrera de decisiones, cancelaciÃ³n lÃ³gica y rollback si falla una escritura auditada. Verificar mediante test de integraciÃ³n que requireAdmin (T002b) devuelve 403 a un usuario con tipoUsuario=empleado y 200 a un usuario con tipoUsuario=administrador. | Ref. ConstituciÃ³n: VI

### Implementation for User Story 5

- [ ] T037 [P] [US5] Extender `backend/models/Audit.js` para las acciones de marca, correcciÃ³n, cancelaciÃ³n y reporte; preservar documentos append-only y aÃ±adir referencia de solicitud con Ã­ndice Ãºnico parcial que permita como mÃ¡ximo una decisiÃ³n approve/reject por solicitud. | Ref. ConstituciÃ³n: V
- [ ] T038 [US5] Completar `backend/services/attendanceCorrectionService.js` con aprobaciÃ³n/rechazo transaccional de solicitudes y correcciÃ³n de marcas errÃ³neas; al aprobar, agregar evento enlazado y recalcular proyecciones afectadas sin sobrescribir la marca original. | Ref. ConstituciÃ³n: V
- [ ] T039 [US5] Implementar cancelaciÃ³n lÃ³gica y consulta paginada de auditorÃ­a en `backend/services/attendanceAdminService.js`, `backend/controllers/attendanceController.js`, `backend/routes/attendance.js` y `backend/routes/audit.js`; exigir administrador y registrar motivo y valores previos/efectivos. OBLIGATORIO: Aplicar middleware requireAdmin (T002b) a estas rutas. PROHIBIDO validar rol dentro del controlador (Principio III). | Ref. ConstituciÃ³n: V
- [ ] T040 [US5] Actualizar `frontend/assets/js/audit-manager.js` y `frontend/assets/js/dashboard-admin.js` para revisar secuencias auditadas y decidir correcciones mostrando valores anteriores, propuestos y resultado sin permitir editar eventos existentes. | Ref. ConstituciÃ³n: V
- [ ] T041 [US5] AÃ±adir a `tests/selenium/` un flujo completo de empleado que solicita correcciÃ³n y administrador que aprueba/rechaza e inspecciona la auditorÃ­a, verificando que la marca original continÃºa visible. | Ref. ConstituciÃ³n: VI

**Checkpoint**: US5 conserva evidencia inmutable y permite reconstruir cambios; una solicitud o decisiÃ³n no altera proyecciones antes de aprobarse.

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Migrar los datos existentes, validar metas de aceptaciÃ³n y alinear documentaciÃ³n y automatizaciÃ³n.

- [ ] T042 Crear `backend/scripts/migrateAttendanceDates.js` para convertir fechas localizadas a `YYYY-MM-DD` desde timestamps en `America/Bogota`, detectar sesiones activas duplicadas y marcas huÃ©rfanas, preservar documentos fuente y dejar ambiguos en revisiÃ³n antes de crear Ã­ndices Ãºnicos. | Ref. ConstituciÃ³n: I, VIII
- [ ] T043 [P] AÃ±adir `backend/tests/performance/monthlyReport.perf.test.js` con datos sintÃ©ticos de 500 empleados y 31 dÃ­as y medir desde la solicitud hasta la descarga completa del workbook; exigir menos de 30 segundos y verificar filas, totales y perÃ­odo. | Ref. ConstituciÃ³n: VI
- [ ] T044 [P] AÃ±adir `backend/tests/performance/attendanceHistory.perf.test.js` para medir consulta inclusiva de hasta 12 meses y exigir menos de 5 segundos. | Ref. ConstituciÃ³n: VI
- [ ] T045 [P] Actualizar `README.md` y `specs/001-control-jornada-asistencia/quickstart.md` con prerequisitos de MongoDB transaccional, configuraciÃ³n local sin secretos, comandos existentes, pruebas y escenarios de aceptaciÃ³n en espaÃ±ol. | Ref. ConstituciÃ³n: VII
- [ ] T046 Ejecutar la migraciÃ³n de ensayo, pruebas Jest/Supertest y flujos Selenium descritos en `specs/001-control-jornada-asistencia/quickstart.md`; resolver cualquier regresiÃ³n sin relajar invariantes de transacciÃ³n, rol, auditorÃ­a o cÃ¡lculo centralizado. | Ref. ConstituciÃ³n: I, II, III, IV, VI
- [ ] T047 Actualizar los comentarios JSDoc en los servicios pÃºblicos modificados bajo `backend/services/` y asegurar que la documentaciÃ³n no afirme reglas legales o capacidades no verificadas para la poblaciÃ³n laboral del despliegue. | Ref. ConstituciÃ³n: VII

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No depende de otras fases; habilita la comprobaciÃ³n de transacciones.
- **Foundational (Phase 2)**: Depende de Setup y bloquea todas las historias.
- **US1 (Phase 3)**: Depende de Foundational; crea la fuente de marcas y los estados bÃ¡sicos.
- **US2 (Phase 4)**: Depende de US1 para calcular jornadas completadas y sus marcas de origen.
- **US3 (Phase 5)**: Depende de US1 y US2 para consultar jornadas y agregados calculados.
- **US4 (Phase 6)**: Depende de US2 y US3 para usar resultados y filtros consistentes.
- **US5 (Phase 7)**: Depende de Foundational y US1; para recalcular resultados aprobados se integra despuÃ©s de US2.
- **Polish (Phase 8)**: Depende de todas las historias que se incluyan en el release; la migraciÃ³n de Ã­ndices requiere reconciliar legacy antes de ejecutarse.

### User Story Dependencies

- **US1 (P1)**: Puede iniciarse despuÃ©s de Foundational; habilita registro y solicitud de salida olvidada.
- **US2 (P1)**: Sigue a US1; depende de marcas y sesiones, pero puede probarse con fixtures propios.
- **US3 (P2)**: Sigue a US1 y US2; necesita sesiones y resultados para formar historial y DailyStats.
- **US4 (P2)**: Sigue a US2 y US3; consume la misma clasificaciÃ³n y filtrado que las vistas.
- **US5 (P2)**: Su auditorÃ­a de marcas se apoya en US1; la recomputaciÃ³n de una correcciÃ³n aprobada requiere US2. La revisiÃ³n de eventos puede trabajarse en paralelo con US3/US4 despuÃ©s de completar su base compartida.

### Parallel Opportunities

- En **Phase 2**, T002, T003 y T005 trabajan archivos distintos; T004 puede avanzar en paralelo con ellos una vez entendido el contrato transaccional.
- En **US1**, T007 y T008 son pruebas en archivos distintos; T009 y T010 son modificaciones de modelos diferentes.
- En **US2**, T016 y T017 pueden avanzar en paralelo en pruebas y consulta de reglas; T018 depende de ambos.
- En **US3**, T023 y T024 son pruebas independientes; el trabajo de interfaz puede iniciar una vez definidos los payloads en los contratos.
- En **US4**, T029 y T030 son pruebas independientes; las tareas de servicio y presentaciÃ³n se separan por archivos.
- En **US5**, T035 y T036 son pruebas independientes; T037 es independiente del servicio de decisiÃ³n hasta integrar sus referencias.
- En **Polish**, T043, T044 y T045 pueden ejecutarse en paralelo tras estabilizar los endpoints y resultados.

### Parallel Example: User Story 1

```text
1. Ejecutar T007 y T008 en paralelo para cubrir reglas del servicio y transacciones HTTP.
2. Ejecutar T009 y T010 en paralelo para definir Attendance y WorkSession.
3. Implementar T011 y T012 despuÃ©s de los modelos y hacer que ambos usen T004 y la sesiÃ³n transaccional.
4. Integrar T013, T014 y T015 despuÃ©s de disponer de los contratos de servicio y rutas.
```

## Implementation Strategy

### MVP First (US1 + cÃ¡lculo mÃ­nimo de US2)

1. Completar Setup y Foundational.
2. Completar US1 para registro atÃ³mico de entrada/salida, rechazo de secuencias invÃ¡lidas y solicitud de salida olvidada.
3. Completar los casos necesarios de US2 para calcular jornadas completadas con horario/regla validada.
4. Detenerse y validar los escenarios independientes de US1 y los casos de referencia legales antes de ampliar a vistas o reportes.

### Incremental Delivery

1. Setup + Foundational: transacciones, autorizaciÃ³n, validaciÃ³n, auditorÃ­a y horario efectivo.
2. US1: marcas confiables y solicitud de correcciÃ³n de salida olvidada.
3. US2: clasificaciÃ³n y detalle de tiempos con reglas efectivas.
4. US3: historial, estadÃ­sticas y elegibilidad administrativa.
5. US4: exportaciÃ³n mensual con autorizaciÃ³n y auditorÃ­a.
6. US5: decisiones de correcciÃ³n y consulta integral append-only.
7. Polish: migraciÃ³n, umbrales de rendimiento, documentaciÃ³n y aceptaciÃ³n Selenium.

## Notes

- `[P]` indica archivos distintos sin dependencia de tareas incompletas.
- `[US#]` enlaza cada tarea de historia con la historia correspondiente de `spec.md`.
- Los cambios de hora y recargo deben contar con validaciÃ³n legal de aplicabilidad para la poblaciÃ³n de despliegue antes de producciÃ³n.
- No se agregan dependencias; usar las versiones ya declaradas de Express, Mongoose, ExcelJS, Jest, Supertest, Selenium WebDriver y Vite.
- Mantener todos los elementos nuevos sin marcar hasta completar cada tarea.

## Additional Tasks for Functional Gaps

### FR-015: AdministraciÃ³n de usuarios (habilitar/deshabilitar)
- [ ] T048 [US-Admin] Crear `backend/services/adminUserService.js` con mÃ©todo `toggleActive(userId, adminId)` que: cambie `User.activo`, registre evento en Audit (quiÃ©n, cuÃ¡ndo, valor anterior y nuevo), y devuelva el usuario actualizado. Referencia: FR-015, Principio II (validaciÃ³n), Principio III (autorizaciÃ³n). | Ref. ConstituciÃ³n: I, II, III
- [ ] T049 [US-Admin] Crear endpoint `PATCH /api/admin/users/{userId}/status` en `backend/routes/users.js`, protegido con `requireAdmin` (T002b) y compatible con `contracts/attendance.openapi.yaml`. El controlador solo orquesta: valida id, delega a `adminUserService.toggleActive` para actualizar `User.activo`, responde 200 con el usuario actualizado o 404 si no existe. OBLIGATORIO: Aplicar middleware requireAdmin (T002b) a esta ruta. PROHIBIDO validar rol dentro del controlador (Principio III). Referencia: FR-015, OpenAPI. | Ref. ConstituciÃ³n: I, II, III
- [ ] T050 [US-Admin] AÃ±adir en `frontend/components/admin/dashboard-admin.html` un botÃ³n "Habilitar/Deshabilitar" por empleado en la tabla de usuarios, que llame a `PATCH /api/admin/users/{userId}/status` y actualice la fila sin recargar. Referencia: FR-015. | Ref. ConstituciÃ³n: IV, I

### FR-011: Bloqueo de empleados en informes globales
- [ ] T051 [US4] AÃ±adir guard en `GET /api/admin/reports/monthly` que verifique `requireAdmin` (T002b) ANTES de generar el Excel. Si el usuario es empleado, devolver 403. Cubrir con test de integraciÃ³n que un empleado autenticado recibe 403 al llamar al endpoint. OBLIGATORIO: Aplicar middleware requireAdmin (T002b) a esta ruta. PROHIBIDO validar rol dentro del controlador (Principio III). Referencia: FR-011, SC-006, Principio III. | Ref. ConstituciÃ³n: I, II, III

### FR-006: Trazabilidad de regla legal aplicada
- [ ] T052 [US2] AÃ±adir campos `ruleVersion` (string, ej. "CO-2025-v1") y `effectivePeriod` ({ `from`: Date, `to`: Date }) a los esquemas `WorkSession` y `DailyStats`. `TimeCalculationService` debe poblar ambos campos en cada cÃ¡lculo. AÃ±adir test que verifique que dos cÃ¡lculos con reglas distintas producen `ruleVersion` diferente. Referencia: FR-006, SC-002, Principio IV. | Ref. ConstituciÃ³n: IV

### W2: Aplicar validaciÃ³n a TODAS las rutas nuevas
- [ ] T053 [Foundation] Revisar que TODAS las rutas creadas en T013, T021, T032, T039, T049, T051 usen el middleware `validation.js` (T003) con esquemas especÃ­ficos por endpoint. AÃ±adir test que verifique que cada ruta rechaza payload invÃ¡lido con 400. Referencia: Principio II, W2 del informe de anÃ¡lisis. | Ref. ConstituciÃ³n: II, III

### W3: Pruebas Selenium de login + marcaciÃ³n base
- [ ] T054 [US1] Crear `tests/selenium/loginYMarcacionBase.js` con Selenium que cubra el flujo end-to-end: (1) login de empleado, (2) `POST /api/attendance` type=entrada, (3) verificaciÃ³n de estado activo en dashboard, (4) `POST /api/attendance` type=salida, (5) verificaciÃ³n de historial. Usar variables de entorno para credenciales. Referencia: ConstituciÃ³n Principio VI, W3 del informe. | Ref. ConstituciÃ³n: VI

### US5: UI de auditorÃ­a para administrador
- [ ] T055 [US5] Crear `frontend/components/admin/auditoria.html` con tabla paginada que consuma `GET /api/audit` (T040) y muestre: fecha, usuario, acciÃ³n, entidad afectada, valores anterior/nuevo. AÃ±adir filtros por fecha y usuario. Referencia: US5, FR-013. | Ref. ConstituciÃ³n: V

















































































