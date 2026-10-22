# Data Model: Registro de Asistencia y Control de Jornada

This design extends the repository's existing Mongoose models. No new persistence model or
external data store is required. All instants are stored as UTC dates; date bucketing and legal
classification use `America/Bogota`.

## User

Extend the existing `User` document; retain legacy `horarioAsignado` during migration.

| Field | Type | Rules / purpose |
|---|---|---|
| `activo` | Boolean | Existing attendance eligibility flag; inactive users cannot create marks. |
| `horariosLaborales[]` | Embedded schedule versions | Effective-dated work arrangements used for classification. |
| `horariosLaborales[].regimenLaboral` | Enum | Required legal profile; unsupported/special profiles remain pending review until a validated rule set exists. |
| `horariosLaborales[].vigenteDesde` | Date | Required inclusive effective date. |
| `horariosLaborales[].vigenteHasta` | Date or null | Exclusive end; versions cannot overlap for one employee. |
| `horariosLaborales[].modalidad` | Enum | Agreed fixed, flexible-week or continuous-shift arrangement; determine applicable legal exception. |
| `horariosLaborales[].minutosOrdinariosPorDia` | Map by ISO weekday | Planned daily ordinary minutes; stored per schedule version, not inferred from one generic 8-hour value. |
| `horariosLaborales[].minutosOrdinariosSemanales` | Number | Agreed weekly ordinary time; classify against this and validate separately against the statutory weekly cap. |
| `horariosLaborales[].diaDescansoObligatorio` | ISO weekday | The agreed weekly rest day; default Sunday only when no different written agreement is recorded. |
| `horariosLaborales[].pausaNoLaboralMinutos` | Number or daily map | Configured unpaid pause duration; a missing required pause configuration makes dependent totals pending review. |
| `horariosLaborales[].adopcionJornadaSemanal42Desde` | Date or null | Records an employer's earlier adoption of the 42-hour weekly ordinary maximum, if applicable. |
| `horariosLaborales[].adopcionRecargoDescanso100Desde` | Date or null | Records documented earlier adoption of a 100% rest-day premium; otherwise use the statutory phase for the work date. |

**Validation**: A schedule version has ordered, non-overlapping dates; valid ISO weekday
keys; nonnegative daily minutes; at least one valid working/rest-day arrangement; and no
overlap with another version. Preserve prior schedule versions when an employee changes
contract or timetable. The calculation service must not produce a final result without a
validated regime and schedule for the applicable date.

## Attendance

Attendance remains the append-only source of employee-submitted marks.

| Field | Type | Rules / purpose |
|---|---|---|
| `userId` | ObjectId → User | Required actor/owner. |
| `type` | `entrada` / `salida` | Required mark kind. |
| `timestamp` | Date | Required server-assigned instant; ordinary mark requests cannot set it. |
| `date` | String `YYYY-MM-DD` | Derived Colombia-local work date for range queries; migrate the existing localized string. |
| `time` | String `HH:mm:ss` | Display-only value derived from the authoritative instant and Bogota timezone. |
| `observaciones` | String | Optional sanitized note; not a client-controlled labor calculation input. |
| `createdAt` | Date | Existing persistence timestamp; distinguish record creation from work instant. |

**Indexes**: `{ userId: 1, timestamp: -1 }` for personal history; `{ date: 1, userId: 1 }`
for admin date/filter views. Do not add a unique same-day `type` index: multiple shifts may be
valid and sequence/session rules enforce duplicates without rejecting legitimate shifts.

**Immutability**: Accepted marks are never updated or physically deleted. An administrative
correction or logical cancellation is a new linked Audit event; queries build effective values
from the original mark and approved correction events.

## WorkSession

WorkSession remains the current, rebuildable projection pairing marks and approved corrections.

| Field | Type | Rules / purpose |
|---|---|---|
| `userId` | ObjectId → User | Required employee. |
| `fecha` | String `YYYY-MM-DD` | Bogota-local date key; retain a session start date for display, but split metrics by day. |
| `timestampEntrada` | Date | Required entry instant from an accepted mark. |
| `timestampSalida` | Date or null | Effective exit from an accepted mark or approved correction; never estimated. |
| `estado` | `activa` / `incompleta` / `completada` | Active at entry, incomplete while awaiting a forgotten-exit correction or review, complete only after accepted exit and required review. |
| `tiempoLaboradoMinutos` | Number or null | Calculated by `TimeCalculationService`; null while not final. |
| `horasOrdinarias`, `horasExtras`, `recargos` | Existing numeric breakdown | Derived classification/minutes and applicable percentage for report display. |
| `metadata.calculoVersion` | String | Law-rule table/version that produced the projection. |
| `metadata.reglaAplicada` | Object | Effective date interval, schedule version, rest-day and applicable policy evidence. |
| `metadata.entradaEstimada`, `metadata.cierreAutomatico` | Legacy Boolean | Kept during migration for traceability; must not create new estimates or automatic closures. |

**Indexes**: `{ userId: 1, timestampEntrada: -1 }` and `{ fecha: 1, userId: 1 }`; add a
partial unique `{ userId: 1 }` index with filter `estado: "activa"` to enforce at most one
active session per employee. Closing an active session also uses a conditional update matching
its active state and missing exit so concurrent exits cannot both commit. Check and resolve
legacy duplicates before index creation.

## DailyStats

Retain one derived document per employee and Colombia-local date using the existing unique
`{ userId: 1, fecha: 1 }` key. Keep durations, ordinary/overtime/night/rest-day breakdown,
session summaries, completeness state and update metadata. Calculate all values in
`TimeCalculationService`; DailyStats only stores/queries calculated output.

The administrator's organization-wide daily row is an aggregate over these employee/day
documents, excluding unapproved incomplete sessions from final totals while separately
counting them as pending. A session crossing midnight is split into daily segments before
aggregation.

## Audit

Audit is an append-only event stream. Keep existing actor identity, role, entity, entity ID,
timestamp, IP and user-agent fields; add the following allowed actions:

- `marcar_entrada`, `marcar_salida`
- `solicitar_correccion`, `aprobar_correccion`, `rechazar_correccion`
- `cancelar_marca` for an authorized logical cancellation that does not delete its source
- `generar_reporte`, `descargar_reporte`

Request event `detalles` includes the proposed values, reason, target type, source mark/session
ID, and request event ID. A decision event includes `requestId`, decision, reviewer, decision
time, reason when rejected, and previous/proposed/effective values. The event ID of the request
is its stable request identifier; decision events link to it. Pending state is derived from a
request with no decision event. An index on the decision request reference with a partial
unique filter allows at most one approve/reject decision per request.

Each new event identifies the authorized actor from the authenticated request, never a
client-supplied actor ID. Do not update or delete Audit documents.
Report events include the requested month, generated file identifier, generation/download
time and outcome; a workbook is not made available as a successful report unless generation
and its audit event both complete.

## Relationships and lifecycle

```text
User 1 ── N Attendance
User 1 ── N WorkSession
User 1 ── N DailyStats (one per local day)
Attendance / WorkSession 1 ── N linked Audit events
WorkSession + approved correction decisions ──> DailyStats (derived projection)
```

```text
No active session
  └─ accepted entry mark ─> active
       ├─ accepted later exit mark ─> completed
       └─ forgotten-exit correction request ─> incomplete / pending
            ├─ administrator approval ─> completed with approved effective exit
            └─ administrator rejection ─> incomplete; original marks unchanged
```

An invalid/duplicate mark or rejected correction does not change Attendance source facts or
final totals. Every committed user mark, request, decision and projection update is atomic.

## Migration notes

1. Audit and report current legacy dates before changing `Attendance.date` from locale format
   to canonical `YYYY-MM-DD`; derive it from `timestamp` in `America/Bogota`.
2. Reconcile orphaned or multiple active WorkSessions. Preserve their original documents and
   audit migration decisions; do not accept existing estimated-entry or auto-close metadata
   as a verified mark.
3. Recompute WorkSession and DailyStats from original timestamp marks using the effective,
   validated regime and schedule/legal rules. Flag unmatched, overlapping or ambiguous
   sequences for human review.
4. Add the partial unique active-session index only after reconciliation succeeds.
5. Keep old API fields during a compatibility window; do not silently reinterpret client
   supplied `timestamp` or `location` as authoritative data.
