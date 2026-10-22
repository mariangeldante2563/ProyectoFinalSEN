# Feature Specification: Registro de Asistencia y Control de Jornada

**Feature Branch**: `sin rama definida`

**Created**: 2026-10-17

**Status**: Draft

**Input**: User description: "Especifica el módulo de Registro de Asistencia y Control de Jornada de InOutManager para que empleados marquen entrada y salida, consulten su historial y horas acumuladas, y administradores consulten asistencia, gestionen usuarios, exporten informes y vean estadísticas; calcula la jornada conforme a la legislación colombiana de 2025 y audita las acciones. Se excluyen relojes biométricos, geolocalización y aplicación móvil nativa."

## Clarifications

### Session 2026-10-17

- Q: ¿Qué regla debe determinar cuándo el tiempo de un empleado cuenta como hora extra si su horario asignado y el máximo legal semanal no coinciden? → A: Comparar con la jornada ordinaria asignada al empleado y validar por separado los límites legales.
- Q: ¿Qué debería pasar con una jornada cuando el empleado olvida marcar la salida? → A: Dejar la jornada incompleta hasta que el empleado solicite una corrección con la hora real y un motivo, y un administrador la revise y apruebe antes de cerrarla.
- Q: Cuando un administrador corrige una marca errónea, ¿cómo debe conservarse el registro original? → A: Conservar el registro original sin alterarlo y agregar cada corrección aprobada como un evento nuevo vinculado al original.
- Q: ¿Quién debe iniciar la corrección cuando un empleado registra una marca duplicada o con una hora equivocada? → A: El empleado solicita la corrección con un motivo y un administrador la aprueba o rechaza; hasta que se apruebe, la marca original sigue intacta.
- Q: ¿Qué período debe usar el sistema para comprobar el límite legal de horas trabajadas por semana? → A: Semana calendario fija de lunes a domingo para todos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Marcar inicio y fin de jornada (Priority: P1)

Como empleado, quiero registrar mi entrada y mi salida de manera clara para que el sistema
conserve cuándo trabajé y no confunda una marca con otra.

**Why this priority**: Las marcas son la fuente de la jornada, los cálculos y los informes.

**Independent Test**: Un empleado inicia sesión, registra entrada y luego salida; puede
confirmar ambas marcas y que la jornada pasó de activa a completada.

**Acceptance Scenarios**:

1. **Given** que el empleado no tiene una jornada activa, **When** registra su entrada,
   **Then** el sistema crea una marca de entrada con la hora oficial de registro y una única
   jornada activa para ese empleado.
2. **Given** que el empleado tiene una jornada activa, **When** registra su salida después
   de la entrada, **Then** el sistema guarda la hora, completa esa jornada y confirma el
   resultado.
3. **Given** que el empleado ya tiene una jornada activa, **When** intenta registrar otra
   entrada, **Then** el sistema rechaza la marca duplicada y conserva la jornada activa sin
   alteraciones.
4. **Given** que el empleado no tiene una jornada activa, **When** intenta registrar una
   salida, **Then** el sistema rechaza la marca y explica que primero debe existir una
   entrada.
5. **Given** una jornada activa, **When** dos solicitudes de entrada llegan al mismo
   tiempo, **Then** solo una puede crear la jornada y la otra recibe un rechazo explícito.
6. **Given** que el empleado olvidó marcar la salida, **When** envía una solicitud de
   corrección con la hora real de salida y un motivo, **Then** la jornada permanece
   incompleta y no se computa como completada hasta que un administrador la aprueba.

---

### User Story 2 - Consultar jornada calculada (Priority: P1)

Como empleado, quiero consultar el tiempo trabajado y su clasificación para entender mis
horas ordinarias, horas extra y recargos asociados a cada jornada.

**Why this priority**: El empleado necesita comprobar el resultado de sus marcas y conocer
las horas acumuladas sin tener que hacer cálculos manuales.

**Independent Test**: Se registran jornadas de prueba diurnas, nocturnas, extraordinarias y
en domingo o festivo; el empleado consulta el detalle y el total para un período.

**Acceptance Scenarios**:

1. **Given** que una jornada está completada, **When** se consulta su detalle, **Then** se
   muestran duración trabajada, tiempo ordinario, horas extra y los recargos aplicables.
2. **Given** que una jornada cruza medianoche o un cambio de día legal, **When** se calcula,
   **Then** cada intervalo se clasifica según su fecha y hora local colombiana, sin asignar
   toda la jornada a un solo día.
3. **Given** que durante 2025 cambia una regla laboral aplicable, **When** se calcula una
   jornada de antes y otra de después de su vigencia, **Then** cada una utiliza la regla
   vigente en la fecha trabajada y el resultado identifica su base normativa.
4. **Given** que el empleado tiene jornadas en un período, **When** consulta las horas
   acumuladas, **Then** obtiene totales que coinciden con la suma de los detalles incluidos
   en ese período.

---

### User Story 3 - Consultar historial y estadísticas (Priority: P2)

Como empleado, quiero consultar mi historial por rango de fechas; como administrador, quiero
consultar la asistencia de todos los empleados y ver agregados diarios para supervisar la
operación.

**Why this priority**: La consulta permite verificar registros y detectar ausencias o
jornadas incompletas sin revisar cada marca manualmente.

**Independent Test**: Con datos de varios empleados y días, se consulta un rango como empleado
y como administrador, y se contrastan resultados y agregados con los registros fuente.

**Acceptance Scenarios**:

1. **Given** un empleado autenticado y un rango válido, **When** consulta su historial,
   **Then** recibe únicamente sus marcas y jornadas del rango, con inicio y fin inclusivos
   según el calendario colombiano.
2. **Given** un administrador y un rango válido, **When** filtra por empleado o consulta a
   todos, **Then** los resultados corresponden al filtro y al período seleccionados.
3. **Given** que existen jornadas en una fecha, **When** el administrador consulta el
   dashboard diario, **Then** ve agregados de cantidad de empleados marcados, tiempo
   trabajado, horas extra, recargos y jornadas activas o incompletas para esa fecha.
4. **Given** que no hay registros en el rango, **When** se consulta el historial o el
   dashboard, **Then** se muestra un resultado vacío con totales en cero, no un error.
5. **Given** un empleado que intenta consultar a otra persona, **When** solicita ese
   historial o sus estadísticas, **Then** el sistema deniega el acceso sin revelar datos
   del otro empleado.
6. **Given** un administrador autorizado, **When** habilita o deshabilita a un empleado para
   marcar, **Then** el permiso cambia para las marcas futuras, se conserva el historial y la
   acción queda auditada con los valores anteriores y posteriores.

---

### User Story 4 - Exportar informe mensual (Priority: P2)

Como administrador, quiero generar un informe mensual de asistencia en Excel para revisar
horas y recargos por empleado y conservar un resultado compartible.

**Why this priority**: El informe mensual reduce trabajo manual y permite revisar el
cumplimiento de jornada en un período común de gestión.

**Independent Test**: El administrador selecciona un mes y descarga un archivo Excel;
verifica empleados, jornadas, clasificaciones, totales y período contra los datos del
sistema.

**Acceptance Scenarios**:

1. **Given** un administrador y un mes calendario, **When** solicita el informe, **Then** el
   archivo incluye las marcas y jornadas del período, identificador y nombre del empleado,
   duración, horas ordinarias y extra, recargos aplicables, estado y total por empleado.
2. **Given** un período con jornadas que cruzan medianoche, **When** se genera el informe,
   **Then** el tiempo se atribuye a las fechas correspondientes conforme a la clasificación
   diaria definida para la jornada.
3. **Given** que el período no contiene registros, **When** se genera el informe, **Then**
   se obtiene un archivo válido que indica que no hay datos y conserva el período solicitado.
4. **Given** un empleado autenticado, **When** intenta generar un informe global, **Then** el
   sistema deniega la acción.

---

### User Story 5 - Consultar auditoría de asistencia (Priority: P2)

Como administrador, quiero revisar quién registró cada marca y qué cambió en una jornada
para poder esclarecer discrepancias.

**Why this priority**: La trazabilidad permite atribuir acciones y mantener evidencia
confiable sobre los registros de jornada.

**Independent Test**: Se registra una entrada y una salida y se consulta su auditoría; se
verifica actor, instante, acción y transición de estado.

**Acceptance Scenarios**:

1. **Given** una marca de entrada o salida aceptada, **When** se revisa su auditoría,
   **Then** aparece quién realizó la acción, cuándo ocurrió, qué tipo de marca fue y qué
   estado o datos de jornada cambiaron.
2. **Given** un registro afectado por una corrección o eliminación administrativa autorizada,
   **When** se revisa la auditoría, **Then** constan el administrador, la fecha y hora, los
   valores anteriores y posteriores, y el motivo de la acción.
3. **Given** un empleado que no tiene permiso administrativo, **When** intenta consultar la
   auditoría global, **Then** se deniega el acceso.
4. **Given** una marca original errónea, **When** un administrador aprueba su corrección,
   **Then** la marca original permanece disponible y una corrección vinculada registra el
   motivo, el autor, la aprobación y los valores corregidos.
5. **Given** una marca duplicada o con hora equivocada, **When** el empleado solicita su
   corrección con un motivo, **Then** un administrador autorizado puede aprobarla o
   rechazarla, y la solicitud no cambia la marca original mientras está pendiente.

## Edge Cases

- Se rechaza una salida anterior o igual a la entrada; no se altera la marca previa.
- No se completa una jornada activa automáticamente al recibir una nueva entrada.
- No se estima una entrada ausente a partir de una salida. Si se olvida la salida, la
  jornada queda incompleta hasta que el empleado solicita la hora real y un motivo y un
  administrador aprueba la corrección.
- Una jornada puede atravesar medianoche, domingo o festivo; la clasificación divide el
  tiempo por los límites locales y legales pertinentes.
- Las solicitudes repetidas o concurrentes de marca no crean sesiones activas duplicadas.
- Un rango con fecha inicial posterior a la fecha final se rechaza con explicación.
- Las marcas de empleados desactivados no pueden crearse; sus registros históricos siguen
  consultables por administradores.
- Una falla al guardar auditoría no debe presentarse como una marca exitosa.
- Una corrección no sobrescribe ni elimina la marca original; cada ajuste aprobado se agrega
  como evento nuevo vinculado y deja visible la secuencia de cambios.
- Una solicitud pendiente de corrección no altera la marca original ni su efecto en los
  totales; el cambio solo rige después de su aprobación administrativa.
- La ausencia de registros produce valores vacíos o cero, no datos de otra persona o período.
- Si falta información necesaria para clasificar una jornada, el sistema la identifica como
  pendiente de revisión y no presenta un cálculo estimado como definitivo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir que un empleado autenticado registre una marca de
  entrada o salida mediante una acción explícita.
- **FR-002**: El sistema MUST asignar a cada marca el instante oficial de registro y
  conservarlo de forma inequívoca; las vistas y reglas de calendario MUST interpretarlo en
  la zona horaria de Colombia.
- **FR-003**: El sistema MUST permitir como máximo una jornada activa por empleado y MUST
  procesar de forma excluyente solicitudes concurrentes de apertura.
- **FR-004**: El sistema MUST aceptar una salida únicamente si existe una jornada activa y
  su instante es posterior a la entrada. MUST rechazar entradas duplicadas y salidas sin
  jornada activa sin estimar ni completar jornadas automáticamente.
- **FR-005**: El sistema MUST calcular duración trabajada, tiempo ordinario, horas extra y
  recargos nocturnos y dominicales o festivos conforme a las normas colombianas vigentes en
  la fecha trabajada durante 2025. El tiempo extra MUST determinarse respecto de la jornada
  ordinaria asignada al empleado; el cumplimiento de los límites legales diarios y semanales
  MUST verificarse además, de forma independiente. Para verificar el límite semanal, el
  sistema MUST consolidar las horas de lunes a domingo en una semana calendario fija.
- **FR-006**: El cálculo MUST distinguir el tiempo diurno/nocturno, ordinario/extra y
  dominical/festivo, incluidos los cambios normativos con vigencia durante 2025. Cada
  resultado MUST permitir identificar la regla y período de vigencia que lo sustentan.
- **FR-007**: El sistema MUST permitir a un empleado consultar únicamente su propio
  historial y sus horas acumuladas por rango de fechas, con límites de fecha inclusivos.
- **FR-008**: El sistema MUST permitir a administradores autorizados consultar marcas,
  jornadas y totales de todos los empleados, filtrando por empleado y rango de fechas.
- **FR-009**: El dashboard administrativo MUST mostrar estadísticas agregadas por día que
  incluyan cantidad de empleados marcados, tiempo trabajado, horas extra, recargos y
  jornadas activas o incompletas.
- **FR-010**: El sistema MUST permitir a un administrador generar y descargar un informe
  mensual en formato Excel con detalle por empleado y fecha, marcas, duración, clasificaciones
  laborales, estado y totales del período.
- **FR-011**: El sistema MUST generar informes válidos también para períodos sin registros y
  MUST impedir que empleados obtengan informes globales.
- **FR-012**: El sistema MUST crear un registro de auditoría para cada marca aceptada que
  identifique actor, instante, acción, jornada afectada y cambios de estado o datos.
- **FR-013**: Toda corrección o eliminación administrativa autorizada que afecte marcas,
  jornadas o resultados MUST registrar actor, instante, motivo y valores previos y posteriores.
  La consulta de auditoría completa MUST limitarse a administradores autorizados.
- **FR-014**: Las marcas inválidas, solicitudes no autorizadas, rangos inválidos y fallas al
  guardar la auditoría MUST comunicar un error claro y no presentar una operación fallida
  como exitosa.
- **FR-015**: La administración de usuarios MUST permitir que solo administradores
  autorizados habiliten o deshabiliten empleados para registrar asistencia, conservando su
  historial. Cada cambio MUST quedar auditado con actor, instante y valores anteriores y
  posteriores. La administración general de identidades y credenciales se rige por el módulo
  de usuarios existente.
- **FR-016**: Ante una salida olvidada, el sistema MUST permitir al empleado solicitar el
  cierre de su jornada indicando la hora real de salida y un motivo. La jornada MUST quedar
  incompleta y excluida de totales definitivos hasta que un administrador autorizado apruebe
  la corrección; el rechazo MUST conservar la jornada como incompleta y comunicar el motivo.
- **FR-017**: El sistema MUST conservar cada marca original sin sobrescribirla ni eliminarla.
  Cada corrección aprobada MUST agregarse como un evento nuevo vinculado al registro original
  e identificar motivo, autor, instante de aprobación y valores corregidos; las consultas
  MUST permitir reconstruir la secuencia y presentar los valores vigentes derivados de ella.
- **FR-018**: El sistema MUST permitir que un empleado solicite corregir una marca duplicada
  o errónea indicando el motivo y los valores propuestos. Un administrador autorizado MUST
  poder aprobar o rechazar la solicitud con una decisión auditable; mientras esté pendiente,
  la marca original permanece vigente y no cambia los totales hasta que se apruebe el ajuste.

### Key Entities *(include if feature involves data)*

- **Empleado**: Persona habilitada para registrar entrada y salida; se relaciona con sus
  marcas, jornadas, estadísticas y eventos de auditoría.
- **Marca de asistencia**: Evento de entrada o salida con instante, actor y referencia a la
  jornada relacionada.
- **Jornada**: Período iniciado por una entrada y finalizado por una salida, con duración,
  estado y clasificación laboral.
- **Regla laboral**: Parámetros normativos y su intervalo de vigencia utilizados para
  clasificar tiempo trabajado y recargos.
- **Estadística diaria**: Agregados de jornadas y tiempo por empleado y fecha local,
  disponibles para consultas diarias de administración.
- **Evento de auditoría**: Evidencia de quién realizó una acción, cuándo ocurrió, qué entidad
  afectó y qué valores cambiaron.
- **Informe mensual**: Representación exportada de marcas, jornadas, clasificación y totales
  de empleados durante un mes calendario.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En pruebas de aceptación, el 100% de las secuencias válidas de entrada y salida
  produce exactamente una jornada activa y luego completada; el 100% de marcas duplicadas o
  fuera de secuencia se rechaza sin modificar la jornada.
- **SC-002**: El 100% de los casos de referencia aprobados por revisión legal para 2025
  coincide en duración, clasificación y recargos, incluidos los casos diurnos, nocturnos,
  extra, dominicales/festivos y los cambios de vigencia normativa.
- **SC-003**: Empleados completan una consulta de su historial por rango de fechas en menos
  de 5 segundos para un período de hasta 12 meses y pueden verificar el total contra el
  detalle mostrado.
- **SC-004**: Un administrador genera y descarga un informe mensual de todos los empleados
  en menos de 30 segundos, con una población de prueba de hasta 500 empleados y 31 días.
- **SC-005**: El 100% de las marcas aceptadas y correcciones administrativas de las pruebas
  tiene auditoría completa; ninguna operación sin auditoría se reporta como exitosa.
- **SC-006**: En todas las pruebas de acceso, ningún empleado puede consultar datos,
  estadísticas, informes o auditoría de otro empleado o de toda la organización.

## Assumptions

- Se conserva el instante absoluto de cada marca; para clasificar jornada, determinar fecha,
  día de la semana y festivo se usa la hora local de Colombia.
- La marca representa el instante en que se solicita registrar la acción; no se aceptan
  horas retroactivas introducidas por el empleado. Los casos que requieren ajuste se tramitan
  mediante autorización administrativa y dejan auditoría.
- Cada empleado tiene una jornada ordinaria asignada por la organización y vigente en las
  fechas trabajadas. El tiempo que exceda esa jornada se clasifica como extra, y los límites
  legales diarios y semanales se validan además por separado. Si falta la jornada asignada,
  las horas que dependan de ella quedan pendientes de revisión y no se asume una jornada
  universal.
- El período de verificación semanal es fijo de lunes a domingo para todos los empleados,
  aunque sus jornadas ordinarias asignadas sean distintas.
- Los intervalos de descanso no laborado se descuentan según la jornada asignada por la
  organización; esta iteración no añade marcas independientes de inicio y fin de descanso.
  Si no existe una regla de descanso aplicable, el resultado queda pendiente de revisión.
- Las reglas de cálculo se comprobarán durante la planificación contra fuentes oficiales
  colombianas aplicables a 2025, incluyendo porcentajes, límites, horarios, festivos y fechas
  de transición. Este documento no fija valores legales particulares.
- Se consideran los festivos nacionales colombianos y las fechas oficiales aplicables; un
  calendario local o institucional adicional deberá ser definido por la organización.
- Los recargos se expresan como tiempo clasificado y su porcentaje legal aplicable; el
  cálculo de valores monetarios de nómina está fuera de alcance porque no se definieron datos
  salariales.
- Las estadísticas diarias agrupan el tiempo trabajado por fecha local colombiana; una
  jornada nocturna o que cruce medianoche puede contribuir a más de una fecha.
- El informe mensual cubre el mes calendario colombiano seleccionado. La gestión de usuarios
  para este módulo se limita a habilitar o deshabilitar empleados para marcar; la creación y
  administración general de identidades corresponde al módulo existente.
- Las correcciones y eliminaciones administrativas solo se incluyen cuando ya estén
  autorizadas por las reglas de la organización; cada una exige motivo y auditoría. La
  definición de un flujo de aprobación nuevo no es parte de esta iteración.
- Las jornadas incompletas y las correcciones de salida pendientes no se incluyen como
  jornadas completadas en totales definitivos ni en informes confirmados; se muestran como
  pendientes de revisión.
- Permanecen fuera de alcance la integración con relojes biométricos, la geolocalización y
  una aplicación móvil nativa.
