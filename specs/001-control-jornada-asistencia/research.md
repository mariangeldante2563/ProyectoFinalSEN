# Research: Registro de Asistencia y Control de Jornada

## Colombian labor rules effective during 2025

**Decision**: Represent legal rules as date-effective data used only through
`TimeCalculationService`. Do not use a single 2025 constant or current-date rule to calculate
historical attendance.

**Rationale**: Primary legislation defines different effective dates during the year:

- **Ordinary weekly maximum**: Ley 2101 de 2021, Article 3. The phased reduction gives a
  maximum of 46 hours weekly until July 14, 2025, and 44 hours from July 15, 2025, absent an
  employer's earlier adoption of the 42-hour week. The 42-hour phase begins July 15, 2026.
- **Night-work period**: Under the pre-amendment rule, night work begins at 21:00. Ley 2466 de
  2025, Article 10, changes the window to 19:00-06:00 and makes that change effective six
  months after sanction. For the June 25, 2025 sanction date, apply the amended window from
  December 25, 2025; retain the prior 21:00-06:00 window through December 24, subject to legal
  confirmation of the precise publication/sanction calculation.
- **Day-of-rest premium**: Ley 2466 de 2025, Article 14, establishes a phased premium:
  75% through June 30, 2025; 80% from July 1, 2025; 90% from July 1, 2026; and 100% from
  July 1, 2027. The law permits an employer to apply 100% earlier. Store the employer's
  effective-dated adoption rather than assume that optional election.
- **Overtime ceiling**: Ley 2466 de 2025, Article 13, limits supplementary hours to two per
  day and twelve per week, with statutory sector exceptions. Record an exceeded ceiling as a
  compliance alert; do not silently discard or reclassify worked time.
- **Base rate categories**: The Código Sustantivo del Trabajo, Article 168, sets the ordinary
  night-work surcharge at 35%, daytime overtime at 25%, and nighttime overtime at 75% over
  the applicable ordinary hourly wage. Treat these as surcharge percentages, separate from
  base wages. When work overlaps night, overtime and obligatory-rest/holiday periods, combine
  only the legally applicable surcharge concepts once; test all combinations against the
  applicable rule version.
- **Ordinary daily schedule**: The schedule is not always a flat eight-hour threshold.
  Ley 2466 Article 11 and Ley 2101 Article 2 allow agreed variable daily distribution within
  statutory conditions (including the specified flexible-week arrangement). Persist the
  employee's effective-dated agreed schedule and its modality. Do not infer overtime solely
  from a generic eight-hour daily cut-off.
- **Rest day definition**: Ley 2466 Article 14 permits a written agreed weekly rest day other
  than Sunday; absent that agreement Sunday is presumed. Work classification therefore needs
  the employee's effective-dated day of obligatory rest, not only `getDay() === 0`. National
  holidays remain separately classified.

**Alternatives considered**:

- Reuse the existing single `MAXIMA_SEMANAL` and current-date calculation: rejected because it
  gives historical dates future/current rates and misses 2025 transitions.
- Hard-code 2025 percentages in `WorkSession` or `DailyStats`: rejected by the constitution's
  single calculation owner and by the need to classify later/historical dates.
- Apply the 100% rest-day premium to all employers from June 2025: rejected because the statute
  allows early adoption but does not establish that this organization elected it.

**Official primary sources**:

- [Ley 2466 de 2025, Función Pública - Gestor Normativo](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=260676):
  Articles 10-14 and transition clauses.
- [Ley 2101 de 2021, Función Pública - Gestor Normativo](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=166506):
  Articles 2-3, weekly ordinary-hour reduction and gradual effective dates.
- [Código Sustantivo del Trabajo, Función Pública - Gestor Normativo](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=199983):
  Article 168 rate categories and Article 179 day-of-rest pay, as amended by Ley 2466 de 2025.

**Legal verification required before production**: Counsel must confirm date interpretation,
the legal regime applicable to the employees in this deployment (Código Sustantivo del Trabajo
versus a special public-sector or other regime), the employer's early 100% premium election,
contract-specific day of rest and schedule, applicable holidays, flexible arrangement
conditions, and any sector exception. Until an employee's applicable regime and schedule are
configured, dependent results remain pending review. The system reports hours and percentages;
it is not a payroll monetary calculator.

## Repository and stack decisions

**Decision**: Reuse Express 4, Mongoose 6, JWT middleware, `express-validator`, ExcelJS,
Jest/Supertest, Selenium WebDriver and Vite already declared in repository package manifests.
No new dependency is needed.

**Rationale**:

- `backend/routes/attendance.js`, `attendanceController.js` and
  `TimeCalculationService.js` already implement the basic mark flow.
- `Attendance`, `WorkSession`, `DailyStats`, `Audit` and `User` already persist relevant data.
- `backend/routes/reports.js`, `reportController.js` and
  `utils/reports/excelGenerator.js` provide the existing Excel generation/download pattern.
- Root `package.json` contains Vite; `backend/package.json` contains Jest and Supertest.
  Selenium scripts exist, but the current entry-mark test pauses for manual login.

**Alternatives considered**:

- Add a new time-zone, queue, report, or validation package: rejected; use Node's
  `Intl.DateTimeFormat`, MongoDB indexes/transactions and existing libraries.
- Put formulas in models, controllers or browser code: rejected by project constitution.
- Add a new correction persistence model: rejected for this plan; record request, approval and
  rejection as linked immutable `Audit` events, with `WorkSession`/`DailyStats` as projections.

## Persistence and concurrency

**Decision**: Require MongoDB multi-document transactions and a partial unique index that
allows only one `WorkSession` with `estado: "activa"` per employee.

**Rationale**: A mark, its session transition, audit event and daily projection must either
commit together or all fail. The unique index is the final arbiter for concurrent entry
requests; service-level checks alone can race.

**Alternatives considered**:

- Service-level pre-read only: rejected because concurrent requests can both pass the check.
- Best-effort audit after responding: rejected because it can report an unaudited mark as
  successful.
- Compensating deletes after a failed audit write: rejected because it can leave partial or
  unrecoverable state and conflicts with immutable source marks.

**Operational prerequisite**: Run the application database in a transaction-capable MongoDB
replica-set topology and exercise rollback/concurrency behavior in integration tests.
