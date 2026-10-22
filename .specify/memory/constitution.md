<!--
Sync Impact Report
Version change: plantilla sin versión -> 1.0.0
Principios incorporados:
- Separación por capas
- Validación y sanitización de entradas
- Autenticación y autorización por roles
- Cálculos de jornada centralizados
- Protección de credenciales y secretos
- Pruebas automatizadas
- Documentación en español
- Simplicidad y dependencias justificadas
Secciones añadidas: Security Requirements; Technology Stack and Structure;
Development Workflow and Quality Gates.
Secciones eliminadas: ninguna.
TODO: confirmar la fecha original de ratificación.
-->

# InOutManager Constitution

## Core Principles

### I. Separación estricta por capas
El backend MUST respetar el flujo rutas → controladores → servicios → modelos. Las rutas
definen endpoints y middlewares; los controladores gestionan HTTP y delegan el trabajo;
los servicios contienen la lógica de negocio; y los modelos representan los datos mediante
Mongoose. Ningún controlador MUST contener lógica de negocio pesada. Esta separación permite
probar y mantener cada responsabilidad sin duplicar reglas.

### II. Validación y sanitización en todas las entradas
Todos los endpoints MUST validar y sanitizar los datos recibidos antes de procesarlos,
incluidos parámetros, query strings y cuerpos de solicitudes. Se utilizará express-validator
o middleware propio conforme a los patrones del proyecto. Las entradas inválidas MUST producir
respuestas de error explícitas y no llegar a la lógica de negocio ni a consultas no validadas.

### III. Autenticación y autorización por roles
Toda ruta protegida MUST exigir autenticación JWT. El middleware MUST verificar la validez del
token y los permisos requeridos antes de permitir el acceso. Los roles admin y empleado MUST
aplicarse de forma diferenciada en middleware; los controladores MUST NOT sustituir esa
verificación.

### IV. Cálculos de jornada centralizados
Todo cálculo de tiempo laborado MUST implementarse exclusivamente en TimeCalculationService,
conforme a la legislación laboral colombiana aplicable y al alcance normativo de 2025 definido
por el proyecto. Controladores y frontend MUST consumir sus resultados y nunca replicar sus
fórmulas. La centralización evita discrepancias entre reportes, vistas y registros.

### V. Protección de credenciales y secretos
Las contraseñas MUST almacenarse y verificarse con bcrypt; nunca en texto plano. Los tokens,
claves y demás secretos MUST obtenerse de variables de entorno y no incluirse en el código.
El archivo .env MUST estar excluido de Git. Los cambios MUST conservar estas protecciones en
todos los flujos que creen o validen credenciales.

### VI. Pruebas automatizadas de comportamientos críticos
Los servicios de cálculo de tiempo laborado y autenticación MUST contar con pruebas unitarias.
Las pruebas Selenium en /tests/selenium MUST cubrir, como mínimo, los flujos críticos de login
y marcación. Los cambios que afecten estos comportamientos MUST actualizar o ampliar las
pruebas pertinentes para detectar regresiones.

### VII. Documentación en español
El README y la documentación del proyecto MUST redactarse en español. Los servicios y las
funciones públicas MUST incluir comentarios JSDoc que describan su propósito, parámetros y
resultado cuando corresponda. La documentación debe mantenerse alineada con el comportamiento
implementado.

### VIII. Simplicidad y dependencias justificadas
Las soluciones MUST preferir el diseño más simple que satisfaga los requisitos, sin
abstracciones prematuras. Toda dependencia nueva MUST justificarse explícitamente en el plan
de implementación, indicando la necesidad que cubre y su impacto en el proyecto.

## Security Requirements

Helmet MUST permanecer activo en Express. El inicio de sesión MUST aplicar limitación de
frecuencia. Las entradas y consultas MUST protegerse contra inyección NoSQL mediante
validación y sanitización. CORS MUST restringirse a orígenes conocidos y autorizados; no se
permitirá una política abierta en producción.

## Technology Stack and Structure

El stack acordado es Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, ExcelJS, Multer,
Helmet, CORS y Morgan en backend; HTML5, CSS3, JavaScript ES6+, Chart.js, D3.js, FontAwesome,
LocalStorage y Vite en frontend; y Selenium para pruebas en /tests/selenium. Las dependencias
solo podrán cambiar conforme al principio de simplicidad.

El backend MUST organizarse en config, controllers, middlewares, models, routes, services y
utils. El frontend MUST mantener la organización del proyecto en assets, components/auth,
components/admin, components/empleado y proyectopages. Las nuevas responsabilidades deben
ubicarse en la capa y área correspondientes.

## Development Workflow and Quality Gates

Cada cambio MUST respetar esta constitución y sus principios de seguridad. Antes de integrar
un cambio, la revisión MUST comprobar que sus entradas estén validadas, que las reglas de
negocio estén en servicios y que las pruebas y documentación relacionadas estén actualizadas.
Los cambios
en cálculo de jornada o autenticación MUST ejecutar sus pruebas unitarias; los cambios en
login o marcación MUST verificar los flujos Selenium pertinentes.

## Governance

Esta constitución prevalece sobre cualquier otra práctica del proyecto. Toda modificación de
un principio MUST documentar el cambio, su motivo y su impacto, y registrarse en un commit
específico dedicado a la enmienda. Cada cambio MUST actualizar la versión y la fecha de última
enmienda. Las revisiones de planificación y de código MUST comprobar el cumplimiento de estos
principios; cualquier excepción requiere una enmienda documentada antes de integrarse.

La versión sigue SemVer: MAJOR para cambios incompatibles o la eliminación de principios,
MINOR para añadir principios o ampliar materialmente requisitos, y PATCH para aclaraciones o
cambios editoriales sin efecto normativo.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): fecha original de adopción desconocida | **Last Amended**: 2026-10-16
