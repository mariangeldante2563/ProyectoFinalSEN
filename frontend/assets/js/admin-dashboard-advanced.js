/**
 * IN OUT MANAGER - DASHBOARD ADMINISTRATIVO v3.1
 * @description KPIs funcionales: Total Empleados, Asistencia Hoy, Productividad, Alertas
 */

const ADMIN_CONFIG = {
    API_BASE: 'http://localhost:5000/api',
    TOTAL_EMPLEADOS_ESPERADOS: 10,
    INTERVALO_ACTUALIZACION: 30000 // 30 segundos
};

class AdminDashboard {
    constructor() {
        console.log('🚀 Admin Dashboard v3.1');
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    async init() {
        if (!this._verificarSesion()) return;
        this._mostrarNombreAdmin();
        await this._cargarKPIs();
        this._actualizarCada(ADMIN_CONFIG.INTERVALO_ACTUALIZACION, () => this._cargarKPIs());
        this._configurarBotones();
    }

    // =========================================
    // VERIFICACIÓN DE SESIÓN
    // =========================================
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
        const url = '../../components/auth/login.html';
        if (typeof PathManager !== 'undefined') {
            PathManager.navigateToLogin(msg);
        } else {
            if (msg) alert(msg);
            window.location.href = url;
        }
    }

    _mostrarNombreAdmin() {
        const s = this._getSession();
        const el = document.getElementById('adminName');
        if (el && s?.nombreCompleto) el.textContent = s.nombreCompleto;
    }

    // =========================================
    // CARGA DE DATOS (API → localStorage)
    // =========================================
    async _fetchApi(endpoint) {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) return null;
        try {
            const res = await fetch(`${ADMIN_CONFIG.API_BASE}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (!res.ok) return null;
            const data = await res.json();
            return data.data || data.users || [];
        } catch {
            return null;
        }
    }

    async _cargarUsuarios() {
        // 1) Intentar API
        const apiUsers = await this._fetchApi('/users');
        if (apiUsers && apiUsers.length > 0) {
            console.log(`📦 API: ${apiUsers.length} usuarios`);
            return apiUsers;
        }
        // 2) Fallback localStorage
        const local = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        console.log(`📦 LocalStorage: ${local.length} usuarios`);
        return local;
    }

    async _cargarRegistros() {
        // 1) Intentar API
        const apiReg = await this._fetchApi('/attendance/all?limit=1000');
        if (apiReg && apiReg.length > 0) {
            console.log(`📦 API: ${apiReg.length} registros`);
            return apiReg;
        }
        // 2) Fallback localStorage
        const local = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
        console.log(`📦 LocalStorage: ${local.length} registros`);
        return local;
    }

    // =========================================
    // CÁLCULO DE KPIs
    // =========================================
    async _cargarKPIs() {
        try {
            const usuarios = await this._cargarUsuarios();
            const registros = await this._cargarRegistros();
            const kpis = this._calcularKPIs(usuarios, registros);
            this._renderizarKPIs(kpis);
        } catch (e) {
            console.error('Error KPIs:', e);
        }
    }

    _calcularKPIs(usuarios, registros) {
        // Total Empleados: todos los que NO son administradores
        const empleados = usuarios.filter(u =>
            (u.tipoUsuario === 'empleado' || !u.tipoUsuario || u.tipoUsuario === undefined)
        );
        const totalEmpleados = empleados.length;

        // Fecha de hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        // IDs únicos con ENTRADA hoy y SALIDA hoy
        const entraronHoy = new Set();
        const salieronHoy = new Set();

        registros.forEach(r => {
            const ts = r.timestamp || r.fecha;
            if (!ts) return;
            const fecha = new Date(ts);
            if (fecha >= hoy && fecha < manana) {
                const uid = r.userId?._id || r.userId || r.usuarioId;
                if (!uid) return;
                const id = uid.toString();
                if (r.type === 'entrada') entraronHoy.add(id);
                else if (r.type === 'salida') salieronHoy.add(id);
            }
        });

        // Asistencia Hoy = empleados que ENTRARON hoy (hayan salido o no)
        const asistenciaHoy = entraronHoy.size;

        // Trabajando ahora = entraron PERO aún NO han salido
        const trabajandoAhora = [...entraronHoy].filter(id => !salieronHoy.has(id)).length;

        // Productividad = (asistencia hoy / 10 empleados esperados) * 100
        const productividad = ADMIN_CONFIG.TOTAL_EMPLEADOS_ESPERADOS > 0
            ? Math.round((asistenciaHoy / ADMIN_CONFIG.TOTAL_EMPLEADOS_ESPERADOS) * 100)
            : 0;

        // Alertas: faltan empleados para llegar a 10
        let alertas = 0;
        if (asistenciaHoy < ADMIN_CONFIG.TOTAL_EMPLEADOS_ESPERADOS) {
            alertas = ADMIN_CONFIG.TOTAL_EMPLEADOS_ESPERADOS - asistenciaHoy;
        }

        return { totalEmpleados, asistenciaHoy, trabajandoAhora, productividad, alertas };
    }

    // =========================================
    // RENDERIZADO DE SESIONES (Ley Colombiana)
    // =========================================
    _renderizarSesiones() {
        try {
            const sesiones = JSON.parse(localStorage.getItem('workSessions') || '[]');
            const hoyDate = new Date().toLocaleDateString('es-ES');
            // Sesiones de HOY ordenadas más recientes primero
            const sesionesHoy = sesiones
                .filter(s => s.fecha === hoyDate)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // === PANEL TIEMPO REAL (feed resumido) ===
            const panelFeed = document.getElementById('realtimeFeed');
            if (panelFeed) {
                if (sesionesHoy.length === 0) {
                    panelFeed.innerHTML = '<div class="feed-empty">Aún no hay sesiones registradas hoy.</div>';
                } else {
                    let feedHtml = '';
                    sesionesHoy.slice(0, 10).forEach(s => {
                        feedHtml += `<div class="feed-item">
                            <div class="feed-icon entry"><i class="fas fa-user-clock"></i></div>
                            <div class="feed-content">
                                <div class="feed-text"><strong>${s.userName || 'Empleado'}</strong> - ${s.totalHoras || 'En curso'}</div>
                                <div class="feed-time">Ent: ${s.entrada} | Sal: ${s.salida || '--'}</div>
                            </div>
                        </div>`;
                    });
                    panelFeed.innerHTML = feedHtml;
                }
                const recentActions = document.getElementById('recentActions');
                if (recentActions) recentActions.textContent = sesionesHoy.length;
            }

            // === PANEL CLASIFICACIÓN DE HORAS (detallado) ===
            const panelClasif = document.getElementById('hoursClassificationContent');
            if (!panelClasif) return;

            if (sesionesHoy.length === 0) {
                panelClasif.innerHTML = '<div class="hc-empty">No hay datos de jornadas completadas hoy.</div>';
                return;
            }

            let html = `<div class="hc-table-wrapper">
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
                            <th>Recargos (h)</th>
                        </tr>
                    </thead>
                    <tbody>`;

            sesionesHoy.forEach(s => {
                const c = s.clasificacion || {};
                const r = s.recargos || {};
                const totalRecargo = (r.nocturno || 0) + (r.extraDiurno || 0) + (r.extraNocturno || 0) + (r.dominical || 0);
                
                html += `<tr>
                    <td class="hc-empleado"><strong>${s.userName || 'Empleado'}</strong></td>
                    <td class="hc-jornada">${s.entrada || '--'} → ${s.salida || '--'}</td>
                    <td class="hc-total"><strong>${s.totalHoras || '0h'}</strong></td>
                    <td class="hc-ok">${c.ordinariaDiurna ? c.ordinariaDiurna + 'h' : '--'}</td>
                    <td class="hc-warn">${c.ordinariaNocturna ? c.ordinariaNocturna + 'h' : '--'}</td>
                    <td class="hc-warn">${c.extrasDiurnas ? c.extrasDiurnas + 'h' : '--'}</td>
                    <td class="hc-danger">${c.extrasNocturnas ? c.extrasNocturnas + 'h' : '--'}</td>
                    <td class="hc-danger">${c.dominicales ? c.dominicales + 'h' : '--'}</td>
                    <td class="hc-recargo"><strong>+${totalRecargo.toFixed(1)}h</strong></td>
                </tr>`;
            });

            html += `</tbody></table></div>`;

            // Agregar leyenda al final
            html += `<div class="hc-legend">
                <span><span class="hc-dot ok"></span> Ordinaria Diurna (6:00-21:00)</span>
                <span><span class="hc-dot warn"></span> Ordinaria Nocturna (21:00-6:00) +35%</span>
                <span><span class="hc-dot warn"></span> Extra Diurna +25%</span>
                <span><span class="hc-dot danger"></span> Extra Nocturna +75%</span>
                <span><span class="hc-dot danger"></span> Dominical/Festivo +100%</span>
                <span><i class="fas fa-gavel"></i> Ley 2101/2021 - CST Colombia</span>
            </div>`;

            panelClasif.innerHTML = html;


        } catch (error) {
            console.error('Error al renderizar sesiones:', error);
        }
    }

    _renderizarKPIs(k) {
        // Renderizar sesiones con clasificación de ley colombiana
        this._renderizarSesiones();

        // 1) Total Empleados
        const elTotal = document.getElementById('totalEmployees');
        if (elTotal) {
            elTotal.textContent = k.totalEmpleados;
            const trend = document.getElementById('employeesTrend');
            if (trend) trend.textContent = `${k.totalEmpleados} registrados`;
        }

        // 2) Asistencia Hoy
        const elAsis = document.getElementById('todayAttendance');
        if (elAsis) {
            elAsis.textContent = k.asistenciaHoy;
            const trend = document.getElementById('attendanceTrend');
            if (trend) {
                if (k.trabajandoAhora > 0) {
                    trend.textContent = `${k.trabajandoAhora} trabajando ahora`;
                } else {
                    trend.textContent = `${k.asistenciaHoy} marcaron ingreso`;
                }
            }
        }

        // 3) Productividad
        const elProd = document.getElementById('productivityScore');
        if (elProd) {
            elProd.textContent = `${k.productividad}%`;
            const trend = document.getElementById('productivityTrend');
            if (trend) trend.textContent = `${k.productividad}%`;
        }

        // 4) Alertas Activas
        const elAlert = document.getElementById('activeAlerts');
        if (elAlert) {
            elAlert.textContent = k.alertas;
            const trend = document.getElementById('alertsTrend');
            if (trend) {
                trend.textContent = k.alertas > 0
                    ? `Faltan ${k.alertas} empleados`
                    : 'Completo';
            }
        }

        // 5) Trabajando Ahora (panel en tiempo real)
        const elWorking = document.getElementById('employeesWorking');
        if (elWorking) elWorking.textContent = k.trabajandoAhora;

        // 6) Estilo visual de alertas
        const cardAlert = document.querySelector('[data-kpi="alerts"]');
        if (cardAlert) {
            cardAlert.classList.remove('alert-danger', 'alert-success');
            cardAlert.classList.add(k.alertas > 0 ? 'alert-danger' : 'alert-success');
        }

        console.log('✅ KPIs:', k);
    }

    // =========================================
    // ACTUALIZACIÓN PERIÓDICA
    // =========================================
    _actualizarCada(ms, fn) {
        setInterval(fn, ms);
    }

    // =========================================
    // BOTONES
    // =========================================
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
            refreshBtn.addEventListener('click', () => this._cargarKPIs());
        }
    }
}

// Inicializar
new AdminDashboard();