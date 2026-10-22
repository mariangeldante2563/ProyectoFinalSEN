# Implementation Plan: Registro de Asistencia y Control de Jornada

**Branch**: `integrar-spec-kit` | **Date**: 2026-10-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-control-jornada-asistencia/spec.md`

## Summary

Deliver an auditable attendance lifecycle for employees and administrators using the existing
Express/Mongoose application. Keep accepted attendance marks immutable, project them into
work sessions and daily aggregates, and record correction requests and decisions as linked,
append-only audit events. Put all work-time and legal premium calculations in
`TimeCalculationService`; use its results for employee views, administrative statistics,
and monthly Excel reports. Preserve the existing role middleware and ExcelJS report pipeline.

The calculation rules must be effective-dated. For 2025 this means the 44-hour weekly limit
from July 15, the ordinary night window changing from 21:00-06:00 to 19:00-06:00 on
December 25, and the day-of-rest premium changing from 75% to 80% on July 1, subject to
documented employer adoption of the optional 100% premium. Confirm applicability and any
contractual exceptions with the organization's labor counsel before release.

## Technical Context

**Language/Version**: Existing Node.js CommonJS backend (no `engines` version declared);
browser JavaScript ES6+, HTML and CSS.

**Primary Dependencies**: Existing Express 4, Mongoose 6, `express-validator`, JWT middleware,
ExcelJS, Jest 28, Supertest 6, Selenium WebDriver and Vite 7. Do not add dependencies.

**Storage**: Existing MongoDB/Mongoose models. MongoDB must run as a replica set or equivalent
transaction-capable deployment for atomic mark/session/audit writes.

**Testing**: Jest (`backend/package.json`), Supertest already installed, and Selenium WebDriver
tests under `tests/selenium`. No backend Jest test files were found; the current Selenium mark
script includes a manual login pause and needs to become deterministic.

**Target Platform**: Existing Express server and Vite-served desktop/mobile web pages; Chrome
for Selenium acceptance tests.

**Project Type**: Existing web application with separate backend and frontend.

**Performance Goals**: Produce and make downloadable a monthly Excel report for 500 employees
and a 31-day month in under 30 seconds. Employee range-history queries should complete in
under 5 seconds for up to 12 months, as specified in SC-003.

**Constraints**: No new package dependencies. Persist instants in UTC and classify them in
`America/Bogota`. Authoritative legal rules and employer-selected options must be effective
dated. A weekly limit is evaluated Monday-Sunday. Keep original attendance records and audit
events append-only. Frontend displays server results and MUST NOT calculate hours or premiums.

**Scale/Scope**: Acceptance performance dataset is up to 500 employees and 31 calendar days
(approximately 15,500 employee-days before multiple sessions); history query target is
12 months. Biometric devices, geolocation and a native mobile application are excluded.

## Constitution Check

### Pre-design gate

- Layered routes → controllers → services → models: **PASS**. Controllers remain HTTP adapters;
  calculation, correction workflow, audit persistence and report preparation belong in services.
- Input validation and sanitization: **PASS**. Extend existing `express-validator` middleware
  to body, path and query inputs; reject client-supplied timestamps for ordinary marks.
- JWT and role middleware: **PASS WITH ALIGNMENT TASK**. `auth.js` uses `tipoUsuario`
  (`empleado`/`administrador`) while `roles.js` checks `role` (`admin`). Normalize feature
  route authorization to the existing `auth.js` `authorize()` contract and align shared role
  helpers before using them.
- Centralized calculations: **PASS WITH REFACTOR TASK**. Remove calculation hooks/statics
  from `WorkSession` and `DailyStats`; they may persist or query derived data but delegate
  every calculation to `TimeCalculationService`.
- Secrets and passwords: **PASS**. No secret or credential changes are planned.
- Testing and Spanish JSDoc: **PASS**. Add unit/integration tests and Spanish JSDoc for new
  public service functions; extend critical Selenium flows.
- Simplicity/dependencies: **PASS**. No additional dependencies or new application layer.
- Security constraints: **PASS**. Preserve Helmet, validate NoSQL-facing filters, restrict
  CORS, and keep authorization checks on every protected operation.

### Post-design gate

**PASS**. The proposed model, service, API, frontend and test changes preserve the gates above.
MongoDB transaction-capable topology is a deployment prerequisite, not a dependency addition.
If the target environment cannot support transactions, resolve the consistency design before
implementation; do not weaken the guarantee that an un-audited mark is not reported as accepted.

## Architecture and Project Structure

Use the repository's existing paths; no new top-level application project is introduced.

```text
backend/
├── controllers/
│   ├── attendanceController.js       # HTTP mapping and response codes
│   └── reportController.js           # Existing report entry points
├── middlewares/
│   ├── auth.js                       # JWT, ownership and administrator authorization
│   ├── roles.js                      # Align role lookup with auth.js user claims
│   └── validation.js                 # Request schemas for marks, filters, corrections
├── models/
│   ├── Attendance.js                 # Immutable source marks
│   ├── WorkSession.js                # Current derived session projection
│   ├── DailyStats.js                 # Per-employee/day derived aggregates
│   ├── Audit.js                      # Append-only marks and correction event history
│   └── User.js                       # Versioned ordinary schedule and eligibility
├── routes/
│   ├── attendance.js                 # Attendance, history, stats and corrections
│   ├── reports.js                    # Existing report access, extended monthly report
│   └── audit.js                      # Existing restricted audit queries
├── services/
│   ├── TimeCalculationService.js     # Sole owner of all work-time calculations
│   ├── ColombianLaborLawService.js   # Effective-dated legal data/lookups only
│   ├── attendanceCorrectionService.js
│   ├── attendanceAdminService.js    # Administrative attendance operations and audit coordination
│   ├── attendanceStatsService.js    # Administrative queries; aggregates TimeCalculationService results only, never recalculates
│   ├── attendanceReportService.js
│   └── auditService.js               # Transaction-aware, errors propagated
└── utils/reports/excelGenerator.js   # Existing ExcelJS workbook generator

frontend/
├── assets/js/
│   ├── api-service.js
│   ├── dashboard-empleado.js
│   ├── dashboard-admin.js
│   ├── reports-manager.js
│   └── audit-manager.js
├── assets/css/
│   ├── dashboard.css
│   └── admin-dashboard-advanced.css
└── components/
    ├── empleado/dashboard-empleado.html
    └── admin/dashboard-admin.html

tests/
└── selenium/
    ├── registroEntrada.js
    └── [new deterministic attendance, correction and report scenarios]
backend/tests/
└── [new Jest unit and Supertest integration tests]
```

**Structure Decision**: Extend the existing backend services, controllers, routes, Mongoose
models and dashboard scripts. Keep the report flow in `reportController.js` and
`excelGenerator.js`, with data assembly and authorization in `attendanceReportService.js`.
The repository root already declares Vite; the frontend has no separate package manifest.

## Data and Consistency Design

See [data-model.md](./data-model.md) for fields, indexes, state transitions and migration notes.

1. Attendance marks are source facts with server-generated timestamps. Do not update or
   physically delete them after acceptance.
2. A partial unique index on `WorkSession.userId` for `estado: "activa"` enforces one open
   session per user even under concurrent requests. Translate duplicate-key conflicts to
   HTTP 409.
3. A MongoDB transaction contains mark creation, session transition/projection, required
   audit event and affected DailyStats recomputation. `AuditService` must propagate failures;
   no success-shaped response is allowed if any required write fails.
4. A correction request is an immutable Audit event; approval/rejection is another immutable
   event linked to that request. A unique partial index on the correction request reference
   in decision events prevents two conflicting decisions. The current WorkSession and
   DailyStats are projections rebuilt from original marks plus approved corrections.
5. DailyStats remains keyed by user and Colombia-local work date. Administrative dashboard
   totals aggregate these rows; one session crossing midnight contributes each segment to
   its corresponding local day. Do not recalculate labor formulas in a Mongoose hook.
6. Store and compare timestamps as instants, calculate local-day/week boundaries in
   `America/Bogota`, and use canonical `YYYY-MM-DD` date keys rather than locale-formatted
   strings for querying.
7. Use the scheduled daily minutes and legal arrangement effective on the work date to
   classify overtime. Apply the weekly statutory cap by Monday-Sunday, the daily/weekly
   overtime ceilings, flexible schedule exceptions, and employer-selected premium policy
   independently. A missing schedule or unresolved exceptional rule yields “pending review,”
   not an estimated legal result.

## REST Interface Summary

All routes are under `/api`; JSON request bodies use `Content-Type: application/json`.
Protected routes require `Authorization: Bearer <JWT>`. `auth.js` `authorize('administrador')`
is required for organization-wide reads, decisions, user eligibility, reports and audit.
See [contracts/attendance.openapi.yaml](./contracts/attendance.openapi.yaml) for payload
schemas and response examples.

| Method | Path | Access | Expected payload/query |
|---|---|---|---|
| `POST` | `/api/attendance` | Employee | `{"type":"entrada"}` or `{"type":"salida"}`; timestamp is assigned by server. |
| `GET` | `/api/attendance/user/{userId}` | Owner or admin | `startDate`, `endDate`, optional `type`, `page`, `limit`. |
| `GET` | `/api/attendance/all` | Admin | `startDate`, `endDate`, optional `userId`, `type`, `page`, `limit`. |
| `POST` | `/api/attendance/{attendanceId}/cancellations` | Admin | `{"reason":"..."}`; records an auditable logical cancellation; does not physically delete the mark. |
| `GET` | `/api/attendance/sessions/active` | Employee | No body; returns current session or `null`. |
| `GET` | `/api/attendance/sessions` | Owner or admin | Optional `userId`; required `startDate`, `endDate`; optional `status`, `page`, `limit`; server-calculated period summary accompanies paginated rows. |
| `GET` | `/api/attendance/stats/daily` | Admin | Required `date=YYYY-MM-DD`; optional employee filter; returns organization/day aggregates. |
| `POST` | `/api/corrections` | Employee | `targetType`, `targetId`, proposed field values and `reason`. |
| `GET` | `/api/corrections/mine` | Employee | Optional `status`, `page`, `limit`. |
| `GET` | `/api/corrections` | Admin | Optional `status`, employee, date range and pagination. |
| `PATCH` | `/api/corrections/{requestId}` | Admin | `{"decision":"approve"}` or `{"decision":"reject","reason":"..."}`. |
| `PATCH` | `/api/admin/users/{userId}/status` | Admin | `{"active":true}` or `{"active":false,"reason":"..."}`. |
| `PATCH` | `/api/users/{userId}/work-schedule` | Admin | Effective-dated regime, daily/weekly minutes, arrangement, rest day and documented policy options. |
| `GET` | `/api/admin/reports/monthly` | Admin | `month=YYYY-MM`; returns filename and download URL. |
| `GET` | `/api/reports/download/{fileName}` | Admin | No body; authorization must be administrator-only, not merely require login. |
| `GET` | `/api/audit/asistencia/{attendanceId}` | Admin | Optional pagination; returns original mark and linked immutable events. |

**Common status codes**: `200` successful read/decision/report generation, `201` mark or
correction request created, `400` invalid input/range, `401` unauthenticated, `403` forbidden,
`404` absent record, `409` state conflict/duplicate mark, `422` correction not applicable,
`500` explicit server failure. Empty report periods return a valid workbook with period and
no-data indication.

## Implementation Sequence

1. Add effective-dated Colombian rule data/lookups and golden tests. Keep every time
   classification formula and duration calculation in `TimeCalculationService`;
   `ColombianLaborLawService` may provide legal data/lookups only. Introduce scheduled-week/day
   inputs and rule metadata before changing persisted projections.
2. Extend User with versioned schedule/eligibility data, validated regime and effective-dated
   admin schedule configuration endpoint; audit configuration changes. Normalize Attendance timestamps
   and local date keys. Preserve old fields during migration; add indexes after checking and
   resolving duplicate/open legacy sessions.
3. Replace physical attendance deletion with an audited logical cancellation. Add partial
   unique active-session index and make attendance processing atomic. Use a
   conditional active-session update for exit so simultaneous exits cannot both succeed.
   Remove auto-close-on-next-entry and estimated-entry behavior; reject invalid sequences
   with 409.
4. Add append-only correction request/decision workflow and make `AuditService` transaction
   aware and fail loudly. Recompute WorkSession and DailyStats only for approved corrections.
5. Extract model-level calculations from `WorkSession`/`DailyStats` into
   `TimeCalculationService`; make all weekly views use the agreed Monday-Sunday period; add
   daily aggregate query and validate ownership/roles.
6. Add monthly report service using existing ExcelJS generator, canonical filtered queries,
   streamed/cursor-based assembly as supported by the installed ExcelJS version, and
   administrator-only download access. Audit successful report generation and download before
   exposing the final workbook as complete.
7. Update employee/admin dashboard scripts and HTML for status, incomplete session, correction
   request, date filters, daily aggregates, report download and audit links. The browser only
   formats server-returned values.
8. Run migration checks and test suite, then Selenium acceptance flows against seeded
   employees/admins. Do not deploy until the representative report meets the 30-second target.

## Testing Strategy

- **Unit / Jest**: legal effective-date boundaries (January 1, July 1, July 15, December 24/25),
  weekly Mon-Sun accumulation, cross-midnight and cross-week segmentation, scheduled/flexible
  ordinary time, overtime caps, rest-day/holiday/night overlap, missing schedule and `America/Bogota`.
- **Unit / Jest**: attendance state machine and duplicate/concurrent entry conflicts; invalid
  and out-of-order marks; incomplete sessions; request/approve/reject correction rules; audit
  immutability and report row totals.
- **Integration / Supertest + transaction-capable MongoDB test database**: JWT ownership and
  role matrix, validation failures, transaction rollback when audit or projection persistence
  fails, unique-index conflict under concurrent requests, correction decision races, daily
  aggregate visibility and empty-month Excel report response.
- **Selenium**: employee login → entry → duplicate-entry rejection → exit → history/detail;
  forgotten exit → correction request; admin login → approve/reject → audit trail; admin daily
  dashboard and monthly report download. Use test-only environment credentials; do not commit
  `tests/credenciales.js` secrets or embed credentials in the tests.
- **Performance acceptance**: seed 500 employees with a month of marks; measure request start
  to workbook download completion; require under 30 seconds. Also verify the generated
  workbook's row count, totals, period and no-data case.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| MongoDB standalone deployment cannot run transactions | Mark, session and audit could diverge | Require replica-set/transaction support before rollout; verify in startup/deployment checks and integration tests. |
| Existing service/model rules use 19:00 nocturnal hours and current-date caps for historical sessions | 2025 results and old reports may be wrong | Effective-date every rule, test exact transition instants and recompute affected projections from immutable marks. |
| Employee population may include different legal regimes; 2025 rules also vary by policy, rest day, schedule arrangement and sector exception | Incorrect labor classification or compliance report | Require a validated legal regime and versioned schedule/policy before final calculation; use the statutory default only after counsel validates applicability; leave unsupported profiles pending review. |
| Existing dates are locale strings and session grouping is by entry day | Boundary filters and cross-midnight totals are wrong | Backfill canonical Colombia-local date keys; recompute daily projections by segment; keep compatibility reads during migration. |
| Existing `AuditService` swallows persistence errors | Successful response can lack audit evidence | Propagate errors and include audit write in the same MongoDB transaction as the accepted action. |
| `auth.js` and `roles.js` inspect different role fields | Unauthorized access or false denial | Standardize feature gates on `auth.js` `tipoUsuario` values; add role matrix tests before exposing endpoints. |
| Existing general report download allows any authenticated user with a filename | Cross-user report disclosure | Require administrator role and use unguessable generated filenames; test access denial. |
| Existing DailyStats is per user/day and code computes them from model hooks/statics | Dashboard omissions and violation of calculation ownership | Make `TimeCalculationService` the only calculation entry point; aggregate per-user daily projections for organization view. |
| Legacy data contains estimated entries/automatic closures and unmatched marks | Migration could silently certify fabricated hours | Preserve original marks, mark ambiguous sessions pending review, record migration metadata and do not convert estimates to approved facts. |
| Selenium scenarios currently pause for manual login | CI or acceptance run is nondeterministic | Use isolated seeded accounts, environment-based credentials and explicit waits; never commit secrets. |

## Nuevas dependencias

Ninguna. Jest, Supertest, Selenium WebDriver, ExcelJS, Mongoose, Express, `express-validator`
and Vite are already declared in the repository manifests.

## Complexity Tracking

No constitutional violations or additional application layers are proposed. The
`attendanceCorrectionService` and `attendanceReportService` are separate only because they own
independent domain workflows and keep HTTP controllers thin.
