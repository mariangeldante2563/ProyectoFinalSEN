/**
 * IN OUT MANAGER - DASHBOARD ADMINISTRATIVO v3.2
 * @description KPIs + Clasificación de Horas según Ley Colombiana
 */

const ADMIN_CONFIG = {
    API_BASE: 'http://localhost:5000/api',
    TOTAL_EMPLEADOS_ESPERADOS: 10,
    INTERVALO_ACTUALIZACION: 30000
};

class AdminDashboard {
    constructor() {
        console.log('🚀 Admin Dashboard v3.2');
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    async init() {
        if (!this._verificarSesion()) return;
        this._mostrarNombreAdmin();
        this._actualizarFecha();
        await this._cargarDashboard();
        this._actualizarCada(ADMIN_CONFIG.INTERVALO_ACTUALIZACION, () => this._cargarDashboard());
        this._configurarBotones();
        await this._initEmployeesPanel();
    }


    _verificarSesion() {
        const sesion = this._getSession();
        if (!sesion) {
            this._redirigirLogin('Debe iniciar sesión.');
            return false;
        }
        return true;
    }

    _getSession() {
        return typeof SessionManager !== 'undefined'
            ? SessionManager.getCurrentSession()
            : JSON.parse(localStorage.getItem('currentSession') || 'null');
    }

    _redirigirLogin(msg) {
        if (typeof PathManager !== 'undefined') {
            PathManager.navigateToLogin(msg);
            return;
        }
        if (msg) alert(msg);
        window.location.href = '../../components/auth/login.html';
    }

    _mostrarNombreAdmin() {
        const sesion = this._getSession();
        const el = document.getElementById('adminName');
        if (el && sesion?.nombreCompleto) el.textContent = sesion.nombreCompleto;
    }

    _actualizarFecha() {
        const el = document.getElementById('currentDateTime');
        if (!el) return;
        const render = () => {
            el.textContent = new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
        };
        render();
        setInterval(render, 60000);
    }

    async _fetchApi(endpoint) {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) return null;
        try {
            const res = await fetch(`${ADMIN_CONFIG.API_BASE}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            if (!res.ok) return null;
            const data = await res.json();
            return data.data || data.users || [];
        } catch {
            return null;
        }
    }

    async _cargarDashboard() {
        try {
            const [usuarios, registros] = await Promise.all([
                this._cargarUsuarios(),
                this._cargarRegistros()
            ]);
            // Obtener horas laborales desde localStorage directamente
            const horasLaborales = this._obtenerHorasLaborales();
            const kpis = this._calcularKPIs(usuarios, registros, horasLaborales);
            this._renderizarKPIs(kpis);
            this._renderizarSesiones(horasLaborales);
        } catch (error) {
            console.error('Error cargando dashboard admin:', error);
        }
    }

    async _cargarUsuarios() {
        const apiUsers = await this._fetchApi('/users');
        if (Array.isArray(apiUsers) && apiUsers.length > 0) return apiUsers;
        return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    }

    async _cargarRegistros() {
        const apiReg = await this._fetchApi('/attendance/all?limit=1000');
        if (Array.isArray(apiReg) && apiReg.length > 0) return apiReg;
        return JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    }

    /**
     * Obtiene las horas laborales desde workSessions (calculadas por el empleado)
     * o las calcula desde attendanceRecords si workSessions está vacío
     */
    _obtenerHorasLaborales() {
        let sesiones = JSON.parse(localStorage.getItem('workSessions') || '[]');

        // Si workSessions está vacío, calcular desde attendanceRecords
        if (sesiones.length === 0) {
            sesiones = this._calcularSesionesDesdeRegistros();
            if (sesiones.length > 0) {
                localStorage.setItem('workSessions', JSON.stringify(sesiones));
            }
        }

        // Mapear al formato esperado por _renderizarSesiones
        return sesiones.map(s => ({
            id: s.id || `${s.userId}-${s.entrada}`,
            empleado: {
                nombre: s.userName || 'Empleado',
                numeroDocumento: s.numeroDocumento || '--'
            },
            diaLaborado: s.fecha || '--',
            entrada: s.entrada || '--',
            salida: s.salida || '--',
            estado: s.salida ? 'completada' : 'activa',
            totalHorasLaboradas: { formato: s.totalHoras || '00:00', minutos: s.totalMinutos || 0 },
            clasificacion: {
                ordinariaDiurna: { formato: this._formatoHora(s.clasificacion?.ordinariaDiurna) },
                ordinariaNocturna: { formato: this._formatoHora(s.clasificacion?.ordinariaNocturna) },
                extraDiurna: { formato: this._formatoHora(s.clasificacion?.extrasDiurnas) },
                extraNocturna: { formato: this._formatoHora(s.clasificacion?.extrasNocturnas) },
                dominicalFestiva: { formato: this._formatoHora(s.clasificacion?.dominicales) },
                recargos: {
                    totalRecargos: { formato: this._formatoRecargo(s.recargos) }
                }
            }
        }));
    }

    /**
     * Calcula sesiones de trabajo a partir de attendanceRecords (cuando workSessions no existe)
     */
    _calcularSesionesDesdeRegistros() {
        const registros = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
        const hoy = new Date().toLocaleDateString('es-ES');
        const sesiones = [];

        // Agrupar por usuario
        const usuarios = {};
        registros.forEach(r => {
            if (!r.date || r.date !== hoy) return;
            const uid = r.userId || 'unknown';
            if (!usuarios[uid]) usuarios[uid] = { userId: uid, userName: r.userName || 'Empleado', registros: [] };
            usuarios[uid].registros.push(r);
        });

        Object.values(usuarios).forEach(u => {
            const entradas = u.registros.filter(r => r.type === 'entrada').sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            const salidas = u.registros.filter(r => r.type === 'salida').sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            if (entradas.length === 0 || salidas.length === 0) return;

            for (let i = 0; i < Math.min(entradas.length, salidas.length); i++) {
                const entrada = entradas[i];
                const salida = salidas[i];
                const diffMs = new Date(salida.timestamp) - new Date(entrada.timestamp);
                const totalMin = Math.floor(diffMs / (1000 * 60));
                if (totalMin <= 0) continue;

                const horaEnt = new Date(entrada.timestamp).getHours();
                const clasif = this._clasificarJornada(horaEnt, totalMin);

                sesiones.push({
                    userId: u.userId,
                    userName: u.userName,
                    fecha: hoy,
                    entrada: entrada.time || new Date(entrada.timestamp).toLocaleTimeString('es-ES'),
                    salida: salida.time || new Date(salida.timestamp).toLocaleTimeString('es-ES'),
                    totalMinutos: totalMin,
                    totalHoras: `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`,
                    clasificacion: clasif.clasificacion,
                    recargos: clasif.recargos,
                    timestamp: new Date(salida.timestamp).toISOString()
                });
            }
        });

        return sesiones.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Clasifica una jornada según legislación colombiana
     */
    _clasificarJornada(horaEntrada, totalMinutos) {
        const MAX_HORAS_NORMALES = 8;
        const esFinDeSemana = new Date().getDay() === 0;

        let minutosDiurnos = 0, minutosNocturnos = 0;
        let minutosExtrasDiurnas = 0, minutosExtrasNocturnas = 0, minutosDominicales = 0;

        for (let h = horaEntrada; h < horaEntrada + Math.ceil(totalMinutos / 60); h++) {
            const horaActual = h % 24;
            const esDiurno = horaActual >= 6 && horaActual < 19; // Diurno 06:00-19:00 (fuente: backend ColombianLaborLawService)

            const horasDesdeEntrada = h - horaEntrada;

            if (esFinDeSemana) {
                minutosDominicales += 60;
            } else if (horasDesdeEntrada < MAX_HORAS_NORMALES) {
                if (esDiurno) minutosDiurnos += 60;
                else minutosNocturnos += 60;
            } else {
                if (esDiurno) minutosExtrasDiurnas += 60;
                else minutosExtrasNocturnas += 60;
            }
        }

        return {
            clasificacion: {
                ordinariaDiurna: Math.round(minutosDiurnos / 60 * 100) / 100,
                ordinariaNocturna: Math.round(minutosNocturnos / 60 * 100) / 100,
                extrasDiurnas: Math.round(minutosExtrasDiurnas / 60 * 100) / 100,
                extrasNocturnas: Math.round(minutosExtrasNocturnas / 60 * 100) / 100,
                dominicales: Math.round(minutosDominicales / 60 * 100) / 100
            },
            recargos: {
                nocturno: Math.round(minutosNocturnos * 0.35 / 60 * 100) / 100,
                extraDiurno: Math.round(minutosExtrasDiurnas * 0.25 / 60 * 100) / 100,
                extraNocturno: Math.round(minutosExtrasNocturnas * 0.75 / 60 * 100) / 100,
                dominical: Math.round(minutosDominicales * 1.0 / 60 * 100) / 100
            }
        };
    }

    _formatoHora(valor) {
        if (!valor || valor === 0) return '00:00';
        const horas = Math.floor(Number(valor));
        const minutos = Math.round((Number(valor) - horas) * 60);
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    }

    _formatoRecargo(recargos) {
        if (!recargos) return '00:00';
        const total = (recargos.nocturno || 0) + (recargos.extraDiurno || 0) + (recargos.extraNocturno || 0) + (recargos.dominical || 0);
        const horas = Math.floor(total);
        const minutos = Math.round((total - horas) * 60);
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    }

    _calcularKPIs(usuarios, registros, horasLaborales) {
        const empleados = usuarios.filter(u => u.tipoUsuario === 'empleado' || !u.tipoUsuario);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        const entraronHoy = new Set();
        const salieronHoy = new Set();

        registros.forEach(r => {
            const ts = r.timestamp || r.fecha;
            if (!ts) return;
            const fecha = new Date(ts);
            if (fecha < hoy || fecha >= manana) return;
            const uid = r.userId?._id || r.userId || r.usuarioId;
            if (!uid) return;
            const id = uid.toString();
            if (r.type === 'entrada') entraronHoy.add(id);
            if (r.type === 'salida') salieronHoy.add(id);
        });

        const trabajandoAhora = [...entraronHoy].filter(id => !salieronHoy.has(id)).length;
        const asistenciaHoy = entraronHoy.size;
        const productividad = ADMIN_CONFIG.TOTAL_EMPLEADOS_ESPERADOS > 0
            ? Math.round((asistenciaHoy / ADMIN_CONFIG.TOTAL_EMPLEADOS_ESPERADOS) * 100)
            : 0;
        const alertas = Math.max(0, ADMIN_CONFIG.TOTAL_EMPLEADOS_ESPERADOS - asistenciaHoy);

        return { totalEmpleados: empleados.length, asistenciaHoy, trabajandoAhora, productividad, alertas, accionesRecientes: horasLaborales.length };
    }

    _renderizarKPIs(kpis) {
        this._setText('totalEmployees', kpis.totalEmpleados);
        this._setText('employeesTrend', `${kpis.totalEmpleados} registrados`);
        this._setText('todayAttendance', kpis.asistenciaHoy);
        this._setText('attendanceTrend', kpis.trabajandoAhora > 0 ? `${kpis.trabajandoAhora} trabajando ahora` : `${kpis.asistenciaHoy} marcaron ingreso`);
        this._setText('productivityScore', `${kpis.productividad}%`);
        this._setText('productivityTrend', `${kpis.productividad}%`);
        this._setText('activeAlerts', kpis.alertas);
        this._setText('alertsTrend', kpis.alertas > 0 ? `Faltan ${kpis.alertas} empleados` : 'Completo');
        this._setText('employeesWorking', kpis.trabajandoAhora);
        this._setText('recentActions', kpis.accionesRecientes);

        const cardAlert = document.querySelector('[data-kpi="alerts"]');
        if (cardAlert) {
            cardAlert.classList.remove('alert-danger', 'alert-success');
            cardAlert.classList.add(kpis.alertas > 0 ? 'alert-danger' : 'alert-success');
        }
    }

    _renderizarSesiones(rows) {
        // Feed en tiempo real
        const panelFeed = document.getElementById('realtimeFeed');
        if (panelFeed) {
            if (!rows.length) {
                panelFeed.innerHTML = '<div class="feed-empty">Aún no hay sesiones registradas hoy.</div>';
            } else {
                panelFeed.innerHTML = rows.slice(0, 10).map(row => `
                    <div class="feed-item">
                        <div class="feed-icon ${row.estado === 'activa' ? 'entry' : 'exit'}"><i class="fas fa-user-clock"></i></div>
                        <div class="feed-content">
                            <div class="feed-text"><strong>${this._escape(row.empleado?.nombre || 'Empleado')}</strong> - ${this._fmt(row.totalHorasLaboradas)}</div>
                            <div class="feed-time">${this._escape(row.entrada || '--')} → ${this._escape(row.salida || '--')}</div>
                        </div>
                    </div>`).join('');
            }
        }

        // Panel de clasificación de horas
        const panel = document.getElementById('hoursClassificationContent');
        if (!panel) return;

        if (!rows.length) {
            panel.innerHTML = '<div class="hc-empty">No hay registros laborales para hoy.</div>';
            return;
        }

        const totalRecargos = this._sumarHoras(rows.map(r => r.clasificacion?.recargos?.totalRecargos));

        const body = rows.map(row => {
            const c = row.clasificacion || {};
            return `<tr>
                <td class="hc-empleado"><strong>${this._escape(row.empleado?.nombre || 'Empleado')}</strong></td>
                <td class="hc-jornada">${this._escape(row.entrada || '--')} → ${this._escape(row.salida || '--')}</td>
                <td class="hc-total"><strong>${this._fmt(row.totalHorasLaboradas)}</strong></td>
                <td class="hc-ok">${this._fmt(c.ordinariaDiurna)}</td>
                <td class="hc-warn">${this._fmt(c.ordinariaNocturna)}</td>
                <td class="hc-warn">${this._fmt(c.extraDiurna)}</td>
                <td class="hc-danger">${this._fmt(c.extraNocturna)}</td>
                <td class="hc-danger">${this._fmt(c.dominicalFestiva)}</td>
                <td class="hc-recargo"><strong>${this._fmt(c.recargos?.totalRecargos)}</strong></td>
            </tr>`;
        }).join('');

        panel.innerHTML = `
            <div class="hc-table-wrapper">
                <table class="hc-table">
                    <thead>
                        <tr>
                            <th>Empleado</th>
                            <th>Jornada</th>
                            <th>Total</th>
                            <th>Ord Diurna</th>
                            <th>Ord Nocturna (+35%)</th>
                            <th>Extra Diurna (+25%)</th>
                            <th>Extra Nocturna (+75%)</th>
                            <th>Dominical (+100%)</th>
                            <th>Recargos</th>
                        </tr>
                    </thead>
                    <tbody>${body}</tbody>
                </table>
            </div>
            <div class="hc-legend" style="margin-top:10px;padding:8px;background:#f1f5f9;border-radius:8px;font-size:0.8rem;">
                <span><span class="hc-dot ok"></span> Ordinaria Diurna (6:00-19:00)</span>
                <span><span class="hc-dot warn"></span> Ordinaria Nocturna (19:00-6:00) +35%</span>

                <span><span class="hc-dot warn"></span> Extra Diurna +25%</span>
                <span><span class="hc-dot danger"></span> Extra Nocturna +75%</span>
                <span><span class="hc-dot danger"></span> Dominical/Festivo +100%</span>
                <span><i class="fas fa-gavel"></i> Ley 2101/2021 - CST Colombia</span>
                <span style="margin-left:auto;"><strong>Total recargos: ${totalRecargos}</strong></span>
            </div>`;
    }

    _sumarHoras(formatos) {
        let totalMin = 0;
        formatos.forEach(f => {
            if (!f || f === '00:00') return;
            const [h, m] = f.split(':').map(Number);
            totalMin += h * 60 + m;
        });
        const horas = Math.floor(totalMin / 60);
        const min = totalMin % 60;
        return `${String(horas).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }

    _setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    _fmt(valor) {
        return valor?.formato || '00:00';
    }

    _escape(value) {
        return String(value).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
    }

    _actualizarCada(ms, fn) {
        setInterval(fn, ms);
    }

    // ============================================================
    // GESTION DE EMPLEADOS: carga unica + busqueda por documento +
    // filtros combinables (departamento / estado). El filtrado se hace
    // en cliente sobre un cache para evitar consultas/renders duplicados.
    // ============================================================

    async _initEmployeesPanel() {
        this._empBody = document.getElementById('employeesTableBody');
        if (!this._empBody) return; // Panel ausente: no hacer nada

        this._empSearchInput = document.getElementById('employeeSearchInput');
        this._empSearchBtn = document.getElementById('employeeSearchBtn');
        this._empClearBtn = document.getElementById('employeeClearBtn');
        this._empDeptFilter = document.getElementById('departmentFilter');
        this._empStatusFilter = document.getElementById('statusFilter');

        // Carga unica de empleados (reutiliza el indice numeroDocumento del backend)
        this._empleadosCache = await this._fetchEmpleados();
        this._renderEmpleados(this._empleadosCache);

        // Busqueda por documento: boton "Buscar" y tecla Enter
        if (this._empSearchBtn) {
            this._empSearchBtn.addEventListener('click', () => this._aplicarFiltrosEmpleados());
        }
        if (this._empSearchInput) {
            this._empSearchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') this._aplicarFiltrosEmpleados();
            });
        }
        // Limpiar busqueda y filtros
        if (this._empClearBtn) {
            this._empClearBtn.addEventListener('click', () => this._limpiarBusquedaEmpleados());
        }
        // Filtros existentes (siguen funcionando y se combinan con la busqueda)
        if (this._empDeptFilter) {
            this._empDeptFilter.addEventListener('change', () => this._aplicarFiltrosEmpleados());
        }
        if (this._empStatusFilter) {
            this._empStatusFilter.addEventListener('change', () => this._aplicarFiltrosEmpleados());
        }
    }

    async _fetchEmpleados() {
        // mostrarInactivos=true para poder filtrar por estado en cliente
        const apiUsers = await this._fetchApi('/users?tipoUsuario=empleado&limit=1000&mostrarInactivos=true');
        if (Array.isArray(apiUsers) && apiUsers.length > 0) return apiUsers;
        // Fallback offline
        const locales = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        return locales.filter(u => (u.tipoUsuario || 'empleado') === 'empleado');
    }

    _aplicarFiltrosEmpleados() {
        const base = Array.isArray(this._empleadosCache) ? this._empleadosCache : [];
        const doc = (this._empSearchInput?.value || '').trim().toLowerCase();
        const dept = (this._empDeptFilter?.value || '').trim().toLowerCase();
        const estado = (this._empStatusFilter?.value || '').trim().toLowerCase();

        const filtrados = base.filter(emp => {
            // Busqueda por numero de documento (parcial, sin distinguir mayusculas)
            if (doc) {
                const numero = String(emp.numeroDocumento || '').toLowerCase();
                if (!numero.includes(doc)) return false;
            }
            // Filtro por departamento
            if (dept) {
                const empDept = String(emp.departamento || '').toLowerCase();
                if (!empDept.includes(dept)) return false;
            }
            // Filtro por estado (activo/inactivo). 'working' se trata como activo
            // por compatibilidad con el objeto de usuario disponible.
            if (estado) {
                const activo = emp.activo !== false;
                if (estado === 'inactive' && activo) return false;
                if ((estado === 'active' || estado === 'working') && !activo) return false;
            }
            return true;
        });

        // Si hay busqueda activa por documento, mostrar tarjeta de perfil completo
        this._renderEmpleados(filtrados, doc !== '');
    }

    _limpiarBusquedaEmpleados() {
        if (this._empSearchInput) this._empSearchInput.value = '';
        if (this._empDeptFilter) this._empDeptFilter.value = '';
        if (this._empStatusFilter) this._empStatusFilter.value = '';
        this._renderEmpleados(this._empleadosCache || []);
    }

    _renderEmpleados(lista, docActive = false) {
        if (!this._empBody) return;
        const rows = Array.isArray(lista) ? lista : [];

        if (rows.length === 0) {
            this._empBody.innerHTML = `
                <tr class="emp-empty-row">
                    <td colspan="6" style="text-align:center;padding:18px;color:#6b7280;">
                        <i class="fas fa-user-slash"></i> No se encontraron empleados con los criterios seleccionados.
                    </td>
                </tr>`;
            return;
        }

        // Busqueda por documento activa con un unico resultado: mostrar perfil completo
        if (docActive && rows.length === 1) {
            this._empBody.innerHTML = `
                <tr>
                    <td colspan="6" style="padding:0;">
                        ${this._perfilEmpleadoCard(rows[0])}
                    </td>
                </tr>`;
            return;
        }

        this._empBody.innerHTML = rows.map(emp => {
            const nombre = this._escape(emp.nombreCompleto || 'Empleado');
            const doc = this._escape(emp.numeroDocumento || '--');
            const dept = this._escape(emp.departamento || 'No asignado');
            const activo = emp.activo !== false;
            const estadoTxt = activo ? 'Activo' : 'Inactivo';
            const estadoStyle = activo
                ? 'display:inline-block;padding:2px 10px;border-radius:999px;background:#dcfce7;color:#16a34a;font-weight:600;font-size:0.8rem;'
                : 'display:inline-block;padding:2px 10px;border-radius:999px;background:#fee2e2;color:#dc2626;font-weight:600;font-size:0.8rem;';
            const ultima = this._formatoUltimaActividad(emp);
            return `
                <tr>
                    <td><input type="checkbox" class="emp-select"></td>
                    <td class="emp-nombre"><strong>${nombre}</strong><br><small>Doc: ${doc}</small></td>
                    <td>${dept}</td>
                    <td><span style="${estadoStyle}">${estadoTxt}</span></td>
                    <td>${ultima}</td>
                    <td><button type="button" class="emp-action-btn" disabled title="Próximamente">Ver</button></td>
                </tr>`;
        }).join('');
    }

    _perfilEmpleadoCard(emp) {
        const activo = emp.activo !== false;
        const estadoColor = activo ? '#16a34a' : '#dc2626';
        const estadoBg   = activo ? '#dcfce7' : '#fee2e2';
        const horas = this._obtenerHorasEmpleado(emp);
        const fechaRaw = emp.createdAt || emp.fechaRegistro || emp.fechaIngreso;
        const fechaReg = fechaRaw
            ? (() => { const d = new Date(fechaRaw); return isNaN(d) ? this._escape(String(fechaRaw)) : d.toLocaleDateString('es-CO', { dateStyle: 'medium' }); })()
            : '--';
        const campo = (lbl, val) => `
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;">
                <div style="font-size:0.72rem;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">${lbl}</div>
                <div style="font-size:0.92rem;color:#1e293b;font-weight:500;">${val}</div>
            </div>`;
        return `
            <div style="padding:16px;background:#f8fafc;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #e2e8f0;">
                    <i class="fas fa-id-badge" style="font-size:1.4rem;color:#2563eb;"></i>
                    <strong style="font-size:1rem;color:#1e293b;">Perfil del Empleado</strong>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">
                    ${campo('Nombre Completo', this._escape(emp.nombreCompleto || '--'))}
                    ${campo('Tipo de Documento', 'C.C.')}
                    ${campo('Número de Documento', this._escape(emp.numeroDocumento || '--'))}
                    ${campo('Correo Electrónico', this._escape(emp.correoElectronico || '--'))}
                    ${campo('Cargo / Vinculación', this._escape(emp.cargo || '--'))}
                    ${campo('Departamento / Dependencia', this._escape(emp.departamento || 'No asignado'))}
                    ${campo('Horario Asignado', this._escape(emp.horarioAsignado || '--'))}
                    ${campo('Estado', `<span style="display:inline-block;padding:2px 10px;border-radius:999px;background:${estadoBg};color:${estadoColor};font-weight:600;">${activo ? 'Activo' : 'Inactivo'}</span>`)}
                    ${campo('Fecha de Registro', fechaReg)}
                    ${campo('Última Actividad', this._formatoUltimaActividad(emp))}
                    ${campo('Horas Trabajadas', horas)}
                </div>
            </div>`;
    }

    _obtenerHorasEmpleado(emp) {
        try {
            const id = String(emp._id || emp.id || '');
            const sesiones = JSON.parse(localStorage.getItem('workSessions') || '[]');
            const propias = sesiones.filter(s => {
                const sid = String(s.userId || s.usuarioId || '');
                const sNombre = String(s.userName || s.nombre || '').toLowerCase();
                const empNombre = String(emp.nombreCompleto || '').toLowerCase();
                return (id && sid === id) || (empNombre && sNombre === empNombre);
            });
            if (!propias.length) return '00:00';
            let totalMin = 0;
            propias.forEach(s => {
                totalMin += (s.totalMinutos || 0);
                if (!s.totalMinutos && s.totalHoras) {
                    const m = String(s.totalHoras).match(/(\d+)h\s*(\d+)m/);
                    if (m) totalMin += parseInt(m[1]) * 60 + parseInt(m[2]);
                }
            });
            const h = Math.floor(totalMin / 60);
            const m = totalMin % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        } catch (_) { return '--'; }
    }

    _formatoUltimaActividad(emp) {
        const fecha = emp.ultimaActividad || emp.updatedAt || emp.fechaIngreso;
        if (!fecha) return '--';
        const d = new Date(fecha);
        if (isNaN(d.getTime())) return this._escape(String(fecha));
        return d.toLocaleDateString('es-CO', { dateStyle: 'medium' });
    }

    _configurarBotones() {
        const logoutBtn = document.getElementById('logoutBtn');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (typeof SessionManager !== 'undefined') {
                    SessionManager.logout('Sesión cerrada.');
                } else {
                    ['currentSession', 'authToken', 'token'].forEach(k => localStorage.removeItem(k));
                    window.location.href = '../../components/auth/login.html';
                }
            });
        }
        const refreshBtn = document.getElementById('refreshRealtime');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this._cargarDashboard());
        }
    }
}

new AdminDashboard();