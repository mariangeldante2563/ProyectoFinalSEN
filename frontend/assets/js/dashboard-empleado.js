/**
 * IN OUT MANAGER - DASHBOARD DE EMPLEADO
 * @version 3.0.0
 * @description Dashboard específico para empleados con registro de asistencia y estadísticas
 */

class EmployeeDashboard extends BaseDashboard {
  constructor() {
    super('empleado');
    this.apiBaseUrl = 'http://localhost:5000/api';
    this.attendanceChart = null;
    this.currentPeriod = 'week';
    // Cache compartido de registros para evitar peticiones redundantes
    this.allRecords = null;
  }


  /**
   * Inicialización específica para empleados
   */
  initSpecific() {
    console.log('📊 Inicializando Dashboard de Empleado v3.0.0');
    
    try {
      this.captureElements();
      this.setupAttendanceButtons();
      this.setupChartTabs();
      this.setupPhotoUpload();
      this.refreshDashboard();
      
      console.log('✅ Dashboard de empleado inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar dashboard de empleado:', error);
    }
  }

  /**
   * Obtiene los registros de asistencia del usuario reutilizando un cache
   * compartido para evitar peticiones redundantes (una sola request por refresco).
   * @returns {Promise<Array|null>}
   */
  async _obtenerRegistros() {
    if (Array.isArray(this.allRecords)) return this.allRecords;

    const authToken = localStorage.getItem('authToken');
    if (!authToken || !this.currentUser?.id) return null;

    try {
      const userId = this.currentUser.id;
      const response = await fetch(`${this.apiBaseUrl}/attendance/user/${userId}?page=1&limit=500`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      this.allRecords = data.data || [];
      return this.allRecords;
    } catch (error) {
      console.error('Error al obtener registros:', error);
      return null;
    }
  }

  /**
   * Refresca todo el dashboard con UNA sola petición de datos, distribuyendo
   * los registros a estadísticas, historial y gráfica.
   */
  async refreshDashboard() {
    // Invalidar cache para forzar datos frescos del backend
    this.allRecords = null;
    await Promise.all([
      this.loadAttendanceStats(),
      this.loadAttendanceRecords(),
      this.loadAttendanceChart()
    ]);
  }


  /**
   * Captura referencias a elementos del DOM
   */
  captureElements() {
    this.entryBtn = document.getElementById('entryBtn');
    this.exitBtn = document.getElementById('exitBtn');
    this.employeeRecords = document.getElementById('employeeRecords');
    this.attendanceChartCanvas = document.getElementById('attendanceChartCanvas');
    this.currentTimeEl = document.getElementById('currentTime');
    this.currentDateEl = document.getElementById('currentDate');
    this.employeeNameEl = document.getElementById('employeeName');
    this.profileNameEl = document.getElementById('profileName');
    this.profileDocEl = document.getElementById('profileDoc');
    this.profilePositionEl = document.getElementById('profilePosition');
    this.profileScheduleEl = document.getElementById('profileSchedule');
    this.profileEmailEl = document.getElementById('profileEmail');
    this.profileAvatarEl = document.getElementById('profileAvatar');
    this.photoInputEl = document.getElementById('photoInput');
    this.uploadPhotoBtnEl = document.getElementById('uploadPhotoBtn');
    this.sesionActivaEl = document.getElementById('sesionActiva');
    this.weeklyChartTabEl = document.getElementById('weeklyChartTab');
    this.monthlyChartTabEl = document.getElementById('monthlyChartTab');
  }

  /**
   * Actualiza la interfaz con datos del usuario
   */
  updateUserInterface() {
    try {
      if (!this.currentUser) return;

      if (this.employeeNameEl) this.employeeNameEl.textContent = this.currentUser.nombreCompleto || 'Usuario';
      if (this.profileNameEl) this.profileNameEl.textContent = this.currentUser.nombreCompleto || '--';
      if (this.profileDocEl) this.profileDocEl.textContent = this.currentUser.numeroDocumento || '--';
      if (this.profilePositionEl) this.profilePositionEl.textContent = this.currentUser.cargo || '--';
      if (this.profileScheduleEl) this.profileScheduleEl.textContent = this.currentUser.horarioAsignado || '--';
      if (this.profileEmailEl) this.profileEmailEl.textContent = this.currentUser.correoElectronico || '--';

      console.log('👤 Perfil de usuario actualizado');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    }
  }

  /**
   * Configura los botones de entrada/salida
   */
  setupAttendanceButtons() {
    if (this.entryBtn) {
      this.entryBtn.addEventListener('click', () => this.registerAttendance('entrada'));
    }

    if (this.exitBtn) {
      this.exitBtn.addEventListener('click', () => this.registerAttendance('salida'));
    }
  }

  /**
   * Configura las pestañas de cambio de período para la gráfica
   */
  setupChartTabs() {
    if (this.weeklyChartTabEl) {
      this.weeklyChartTabEl.addEventListener('click', () => {
        this.currentPeriod = 'week';
        this.updateChartTabs();
        this.loadAttendanceChart();
      });
    }

    if (this.monthlyChartTabEl) {
      this.monthlyChartTabEl.addEventListener('click', () => {
        this.currentPeriod = 'month';
        this.updateChartTabs();
        this.loadAttendanceChart();
      });
    }
  }

  /**
   * Actualiza el estado visual de las pestañas
   */
  updateChartTabs() {
    const tabs = document.querySelectorAll('.chart-tab');
    tabs.forEach(tab => {
      tab.classList.remove('active');
      if ((this.currentPeriod === 'week' && tab.id === 'weeklyChartTab') ||
          (this.currentPeriod === 'month' && tab.id === 'monthlyChartTab')) {
        tab.classList.add('active');
      }
    });
  }

  /**
   * Registra entrada o salida en el backend
   * @param {string} type - 'entrada' o 'salida'
   */
  async registerAttendance(type) {
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        this.mostrarNotificacion('Sesión expirada. Por favor, inicie sesión nuevamente.', 'error');
        return;
      }

      if (!this.currentUser || !this.currentUser.id) {
        this.mostrarNotificacion('Error: No hay una sesión activa', 'error');
        return;
      }

      // Deshabilitar botón mientras se procesa
      const actionBtn = type === 'entrada' ? this.entryBtn : this.exitBtn;
      if (actionBtn) {
        actionBtn.disabled = true;
        actionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
      }

      console.log(`📍 Registrando ${type}...`);

      // USAR LA RUTA PRINCIPAL DE ASISTENCIA /api/attendance (POST)
      const response = await fetch(`${this.apiBaseUrl}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ type: type })
      });

      const data = await response.json();

      // Restaurar botón
      if (actionBtn) {
        actionBtn.disabled = false;
        actionBtn.innerHTML = type === 'entrada' 
          ? '<span class="btn-icon"><i class="fas fa-sign-in-alt"></i></span><span class="btn-text">Registrar Entrada</span>'
          : '<span class="btn-icon"><i class="fas fa-sign-out-alt"></i></span><span class="btn-text">Registrar Salida</span>';
      }

      if (response.ok && data.success) {
        const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        console.log(`✅ ${type} registrada exitosamente`);
        
        this.mostrarNotificacion(
          `✅ ${type.charAt(0).toUpperCase() + type.slice(1)} registrada a las ${hora}`,
          'success'
        );

        // Recargar datos después de registrar (una sola petición compartida)
        setTimeout(() => {
          this.refreshDashboard();
        }, 300);

      } else {
        // Si el backend devuelve error específico
        const errorMsg = data.message || `Error al registrar ${type}`;
        if (data.message && data.message.includes('Ya ha registrado')) {
          this.mostrarNotificacion(data.message, 'warning');
        } else {
          throw new Error(errorMsg);
        }
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      this.mostrarNotificacion(error.message, 'error');

      // Restaurar botón en caso de error
      const actionBtn = type === 'entrada' ? this.entryBtn : this.exitBtn;
      if (actionBtn) {
        actionBtn.disabled = false;
        actionBtn.innerHTML = type === 'entrada' 
          ? '<span class="btn-icon"><i class="fas fa-sign-in-alt"></i></span><span class="btn-text">Registrar Entrada</span>'
          : '<span class="btn-icon"><i class="fas fa-sign-out-alt"></i></span><span class="btn-text">Registrar Salida</span>';
      }
    }
  }

  /**
   * Carga todas las estadísticas de trabajo desde el backend
   */
  async loadAttendanceStats() {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return;
      const headers = { Authorization: `Bearer ${authToken}`, Accept: 'application/json' };
      const [todayResponse, weeklyResponse, monthlyResponse, activeResponse] = await Promise.all([
        fetch(`${this.apiBaseUrl}/stats/today`, { headers }),
        fetch(`${this.apiBaseUrl}/stats/weekly`, { headers }),
        fetch(`${this.apiBaseUrl}/stats/monthly`, { headers }),
        fetch(`${this.apiBaseUrl}/stats/active-session`, { headers })
      ]);
      if (![todayResponse, weeklyResponse, monthlyResponse, activeResponse].every(response => response.ok)) {
        throw new Error('No fue posible cargar las estadísticas oficiales de asistencia.');
      }
      const [todayResult, weeklyResult, monthlyResult, activeResult] = await Promise.all([
        todayResponse.json(), weeklyResponse.json(), monthlyResponse.json(), activeResponse.json()
      ]);
      const todayData = todayResult.data;
      const weeklyData = weeklyResult.data;
      const monthlyData = monthlyResult.data;
      const stats = todayData?.estadisticas;
      const elTiempoHoy = document.getElementById('tiempoTrabajadoHoy');
      if (elTiempoHoy) elTiempoHoy.textContent = stats?.tiempoTotal?.formato || '00:00';

      const porcentaje = Math.min(stats?.estadisticas?.cumplimientoJornada?.porcentajeCumplimiento || 0, 100);
      const elPorcentaje = document.querySelector('.stat-card[data-stat="tiempo-hoy"] .stat-percentage');
      if (elPorcentaje) {
        elPorcentaje.textContent = `${porcentaje}%`;
        elPorcentaje.className = 'stat-percentage';
        if (porcentaje >= 100) elPorcentaje.classList.add('text-success');
        else if (porcentaje >= 80) elPorcentaje.classList.add('text-warning');
        else elPorcentaje.classList.add('text-danger');
      }

      const elPromedio = document.getElementById('promedioSemanal');
      if (elPromedio) elPromedio.textContent = `${Number(weeklyData?.promedioHorasDiarias || 0).toFixed(1)}h`;

      const elDias = document.getElementById('diasTrabajadosMes');
      if (elDias) elDias.textContent = monthlyData?.diasTrabajados || 0;

      const elHorasExtras = document.getElementById('horasExtrasHoy');
      if (elHorasExtras) elHorasExtras.textContent = stats?.horasExtras?.total?.formato || '00:00';

      this.updateSessionStatus(activeResult.data);
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
    }
  }

  /**
   * Actualiza el indicador de sesión activa
   * @param {Object|null} session - Sesión activa calculada por el backend
   */
  updateSessionStatus(session) {
    if (!this.sesionActivaEl) return;

    if (session) {
      const entryTime = new Date(session.timestampEntrada).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
      });
      const durationText = session.duracionActual?.estadoCalculo === 'calculado'
        ? ` (${session.duracionActual.formato})`
        : ' (cálculo pendiente de horario)';

      this.sesionActivaEl.innerHTML = `
        <div class="status-active">
          <i class="fas fa-play-circle text-success"></i>
          <span>Sesión activa desde ${entryTime}${durationText}</span>
        </div>
      `;
    } else {
      this.sesionActivaEl.innerHTML = `
        <div class="status-idle">
          <i class="fas fa-pause-circle text-muted"></i>
          <span>Sin sesión activa</span>
        </div>
      `;
    }
  }

  /**
   * Carga el historial de registros de asistencia
   */
  async loadAttendanceRecords() {
    try {
      // Reutiliza el cache compartido (evita una petición redundante)
      const records = await this._obtenerRegistros();
      if (!records) return;

      console.log('📝 Cargando historial de registros...');

      if (!this.employeeRecords) return;

      const authToken = localStorage.getItem('authToken');
      const sessionsResponse = await fetch(`${this.apiBaseUrl}/stats/sessions?page=1&limit=500`, {
        headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' }
      });
      if (!sessionsResponse.ok) throw new Error('No fue posible cargar las jornadas calculadas.');
      const sessionsResult = await sessionsResponse.json();
      const sessionsByDate = {};
      (sessionsResult.data?.sesiones || []).forEach(session => {
        if (!sessionsByDate[session.fecha]) sessionsByDate[session.fecha] = [];
        sessionsByDate[session.fecha].push(session);
      });

      if (records.length === 0) {
        this.employeeRecords.innerHTML = '<p>No hay registros disponibles.</p>';
        return;
      }

      // Agrupar registros por fecha
      const recordsByDate = {};
      records.forEach(record => {
        const dateKey = record.date || new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Bogota'
        }).format(new Date(record.timestamp));
        const date = new Date(`${dateKey}T12:00:00`).toLocaleDateString('es-CO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        if (!recordsByDate[dateKey]) {
          recordsByDate[dateKey] = { label: date, records: [] };
        }
        recordsByDate[dateKey].records.push(record);
      });

      let html = '';
      for (const [dateKey, group] of Object.entries(recordsByDate)) {
        const dateRecords = group.records;
        const sessions = sessionsByDate[dateKey] || [];
        const dayTime = sessions.length
          ? sessions.map(session => session.tiempoLaboradoHoras ||
            (session.estado === 'incompleta' ? 'Pendiente de corrección' : 'Pendiente de horario')).join(', ')
          : 'Sin jornada calculada';
        html += `
          <div class="records-group">
            <div class="records-date">
              <i class="fas fa-calendar-alt"></i>
              <strong>${group.label}</strong>
            </div>
            <div class="records-table-wrapper">
              <table class="records-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Hora</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
        `;

        // Orden cronológico ascendente dentro del día
        dateRecords
          .slice()
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .forEach(record => {
          const time = new Date(record.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });

          
          const icon = record.type === 'entrada' 
            ? '<i class="fas fa-sign-in-alt" style="color: #28a745;"></i>'
            : '<i class="fas fa-sign-out-alt" style="color: #dc3545;"></i>';
          
          const typeLabel = record.type === 'entrada' ? 'Entrada' : 'Salida';
          const rowClass = record.type === 'entrada' ? 'entry-row' : 'exit-row';

          html += `
            <tr class="${rowClass}">
              <td>${icon} ${typeLabel}</td>
              <td>${time}</td>
              <td>${record.observaciones || '-'}</td>
            </tr>
          `;
        });

        html += `
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="records-summary">
                      <i class="fas fa-clock"></i> Tiempo trabajado: <strong>${dayTime}</strong> horas
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        `;
      }

      this.employeeRecords.innerHTML = html;
      console.log('✅ Historial de registros cargado');
    } catch (error) {
      console.error('❌ Error al cargar historial:', error);
    }
  }

  /**
   * Carga los datos para la gráfica de asistencia
   */
  async loadAttendanceChart() {
    try {
      console.log(`📊 Cargando gráfica de ${this.currentPeriod === 'week' ? 'semana' : 'mes'}...`);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('La sesión expiró.');
      const days = this.currentPeriod === 'week' ? 7 : 31;
      const response = await fetch(`${this.apiBaseUrl}/stats/charts?days=${days}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('No fue posible cargar la gráfica.');
      const result = await response.json();
      const chartData = result.data;
      const values = Object.values(chartData?.datasets || {}).flat();
      const tieneDatos = values.some(value => value > 0);

      if (!tieneDatos) {
        this.renderEmptyChart();
        return;
      }

      this.renderChart(chartData);
      console.log('✅ Gráfica cargada correctamente');
    } catch (error) {
      console.error('❌ Error al cargar gráfica:', error);
      this.renderEmptyChart();
    }
  }

  renderChart(statsData) {
    const canvas = this.attendanceChartCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (this.attendanceChart) {
      this.attendanceChart.destroy();
    }

    const labels = statsData.labels || [];
    const workHoursData = statsData.datasets?.horasTrabajadas || [];
    const overtimeData = statsData.datasets?.horasExtras || [];
    const surchargeData = statsData.datasets?.recargos || [];

    this.attendanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Horas trabajadas',
            data: workHoursData,
            backgroundColor: '#28a745',
            borderColor: '#1e7e34',
            borderWidth: 1
          },
          {
            label: 'Horas extra',
            data: overtimeData,
            backgroundColor: '#ffc107',
            borderColor: '#d39e00',
            borderWidth: 1
          },
          {
            label: 'Recargos',
            data: surchargeData,
            backgroundColor: 'rgba(23, 162, 184, 0.35)',
            borderColor: '#17a2b8',
            borderWidth: 2,
            type: 'line',
            fill: false,
            tension: 0.3,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (['Horas trabajadas', 'Horas extra', 'Recargos'].includes(context.dataset.label)) {
                  return `${context.dataset.label}: ${context.raw}h`;
                }
                return `${context.dataset.label}: ${context.raw}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Horas'
            },
            ticks: {
              stepSize: 1
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            title: {
              display: true,
              text: 'Horas'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  /**
   * Renderiza una gráfica vacía (sin datos)
   */
  renderEmptyChart() {
    const canvas = this.attendanceChartCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (this.attendanceChart) {
      this.attendanceChart.destroy();
    }

    this.attendanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Sin datos disponibles'],
        datasets: [{
          label: 'Registros',
          data: [0],
          backgroundColor: '#e0e0e0'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  /**
   * Configura la subida de foto de perfil
   */
  setupPhotoUpload() {
    if (this.uploadPhotoBtnEl && this.photoInputEl) {
      this.uploadPhotoBtnEl.addEventListener('click', () => {
        this.photoInputEl.click();
      });

      this.photoInputEl.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (this.profileAvatarEl) {
              this.profileAvatarEl.src = event.target.result;
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  /**
   * Muestra una notificación al usuario
   * @param {string} message - Mensaje
   * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
   */
  mostrarNotificacion(message, type = 'info') {
    if (typeof NotificationManager !== 'undefined') {
      NotificationManager.showToast(message, type);
    } else {
      // Fallback: alert según el tipo
      if (type === 'error') {
        alert('❌ ' + message);
      } else if (type === 'warning') {
        alert('⚠️ ' + message);
      } else {
        alert(message);
      }
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Inicializando dashboard de empleado...');
  window.employeeDashboard = new EmployeeDashboard();
});