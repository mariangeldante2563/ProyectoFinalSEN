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
    const registros = await this._obtenerRegistros();
    if (!registros) return;

    this.loadAttendanceStats();
    this.loadAttendanceRecords();
    this.loadAttendanceChart();
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

        // Guardar en localStorage - incluye datos de workSession (clasificación de horas)
        this._guardarEnLocalStorage(type, data.data, data.workSession);

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
      // Reutiliza el cache compartido (evita una petición redundante)
      const registros = await this._obtenerRegistros();
      if (!registros) return;

      console.log('📈 Cargando estadísticas de trabajo...');


      // ---- ESTADÍSTICA 1: Tiempo Trabajado Hoy ----
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayRecords = registros.filter(r => {
        const rDate = new Date(r.timestamp);
        rDate.setHours(0, 0, 0, 0);
        return rDate.getTime() === today.getTime();
      });

      const tiempoHoy = this.calcularTiempoTrabajado(todayRecords);
      const elTiempoHoy = document.getElementById('tiempoTrabajadoHoy');
      if (elTiempoHoy) elTiempoHoy.textContent = tiempoHoy.formato;

      // Calcular porcentaje de cumplimiento (asumiendo jornada de 8 horas = 480 min)
      const porcentaje = Math.min(Math.round((tiempoHoy.totalMinutos / 480) * 100), 100);
      const elPorcentaje = document.querySelector('.stat-card[data-stat="tiempo-hoy"] .stat-percentage');
      if (elPorcentaje) {
        elPorcentaje.textContent = `${porcentaje}%`;
        elPorcentaje.className = 'stat-percentage';
        if (porcentaje >= 100) elPorcentaje.classList.add('text-success');
        else if (porcentaje >= 80) elPorcentaje.classList.add('text-warning');
        else elPorcentaje.classList.add('text-danger');
      }

      // ---- ESTADÍSTICA 2: Promedio Semanal ----
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      const weekRecords = registros.filter(r => {
        const rDate = new Date(r.timestamp);
        return rDate >= startOfWeek;
      });

      const promedioSemanal = this.calcularPromedioSemanal(weekRecords);
      const elPromedio = document.getElementById('promedioSemanal');
      if (elPromedio) elPromedio.textContent = `${promedioSemanal.toFixed(1)}h`;

      // ---- ESTADÍSTICA 3: Días Trabajados (este mes) ----
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthRecords = registros.filter(r => {
        const rDate = new Date(r.timestamp);
        return rDate >= startOfMonth;
      });

      const diasTrabajados = this.calcularDiasTrabajados(monthRecords);
      const elDias = document.getElementById('diasTrabajadosMes');
      if (elDias) elDias.textContent = diasTrabajados;

      // ---- ESTADÍSTICA 4: Horas Extras Hoy ----
      // Horas extras = tiempo trabajado hoy - 8 horas (480 min), mínimo 0
      const horasExtrasMinutos = Math.max(0, tiempoHoy.totalMinutos - 480);
      const horasExtrasFormato = this.formatearMinutos(horasExtrasMinutos);
      const elHorasExtras = document.getElementById('horasExtrasHoy');
      if (elHorasExtras) elHorasExtras.textContent = horasExtrasFormato;

      // Actualizar estado de sesión activa
      this.updateSessionStatus(todayRecords);

      console.log('✅ Estadísticas cargadas correctamente');
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
    }
  }

  /**
   * Calcula el tiempo trabajado a partir de registros de entrada/salida
   * @param {Array} records - Registros del día
   * @returns {{ formato: string, totalMinutos: number }}
   */
  _emparejarSesiones(records) {
    const ordenados = [...records].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const sesiones = [];
    let entradaPendiente = null;

    ordenados.forEach(r => {
      if (r.type === 'entrada') {
        entradaPendiente = r;
      } else if (r.type === 'salida' && entradaPendiente) {
        const minutos = (new Date(r.timestamp) - new Date(entradaPendiente.timestamp)) / (1000 * 60);
        if (minutos > 0) {
          sesiones.push({ entrada: entradaPendiente.timestamp, salida: r.timestamp, minutos });
        }
        entradaPendiente = null;
      }
    });

    return sesiones;
  }

  calcularTiempoTrabajado(records) {
    const totalMinutes = this._emparejarSesiones(records).reduce((acc, s) => acc + s.minutos, 0);
    return {
      totalMinutos: totalMinutes,
      formato: this.formatearMinutos(totalMinutes)
    };
  }


  /**
   * Formatea minutos a formato HH:MM
   * @param {number} totalMinutes
   * @returns {string}
   */
  formatearMinutos(totalMinutes) {
    if (totalMinutes < 0) totalMinutes = 0;
    const horas = Math.floor(totalMinutes / 60);
    const minutos = Math.floor(totalMinutes % 60);
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  }

  /**
   * Calcula el promedio de horas trabajadas por día en la semana
   * @param {Array} records - Registros de la semana
   * @returns {number}
   */
  calcularPromedioSemanal(records) {
    const sesiones = this._emparejarSesiones(records);
    if (sesiones.length === 0) return 0;

    // Agrupar minutos trabajados por día (solo días con jornada efectiva)
    const minutosPorDia = {};
    sesiones.forEach(s => {
      const dia = new Date(s.entrada).toDateString();
      minutosPorDia[dia] = (minutosPorDia[dia] || 0) + s.minutos;
    });

    const dias = Object.keys(minutosPorDia).length;
    if (dias === 0) return 0;
    const totalMinutes = Object.values(minutosPorDia).reduce((a, b) => a + b, 0);
    return (totalMinutes / 60) / dias;
  }

  /**
   * Calcula la cantidad de días trabajados (días con al menos una sesión efectiva)
   * @param {Array} records
   * @returns {number}
   */
  calcularDiasTrabajados(records) {
    const sesiones = this._emparejarSesiones(records);
    return new Set(sesiones.map(s => new Date(s.entrada).toDateString())).size;
  }


  /**
   * Actualiza el indicador de sesión activa
   * @param {Array} records - Registros del día
   */
  updateSessionStatus(records) {
    if (!this.sesionActivaEl) return;

    const entries = records.filter(r => r.type === 'entrada');
    const exits = records.filter(r => r.type === 'salida');

    if (entries.length > exits.length) {
      const lastEntry = entries[entries.length - 1];
      const entryTime = new Date(lastEntry.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Calcular tiempo transcurrido desde la última entrada
      const now = new Date();
      const entryDate = new Date(lastEntry.timestamp);
      const diffMinutos = Math.floor((now - entryDate) / (1000 * 60));
      const horasActivas = Math.floor(diffMinutos / 60);
      const minutosActivos = diffMinutos % 60;
      const tiempoActivo = `${String(horasActivas).padStart(2, '0')}:${String(minutosActivos).padStart(2, '0')}`;

      this.sesionActivaEl.innerHTML = `
        <div class="status-active">
          <i class="fas fa-play-circle text-success"></i>
          <span>Sesión activa desde ${entryTime} (${tiempoActivo})</span>
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


      if (records.length === 0) {
        this.employeeRecords.innerHTML = '<p>No hay registros disponibles.</p>';
        return;
      }

      // Agrupar registros por fecha
      const recordsByDate = {};
      records.forEach(record => {
        const date = new Date(record.timestamp).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        if (!recordsByDate[date]) {
          recordsByDate[date] = [];
        }
        recordsByDate[date].push(record);
      });

      let html = '';
      for (const [date, dateRecords] of Object.entries(recordsByDate)) {
        html += `
          <div class="records-group">
            <div class="records-date">
              <i class="fas fa-calendar-alt"></i>
              <strong>${date}</strong>
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

        // Calcular tiempo trabajado para este grupo de fecha (emparejamiento unificado)
        const totalMin = this._emparejarSesiones(dateRecords).reduce((acc, s) => acc + s.minutos, 0);
        const h = Math.floor(totalMin / 60);
        const m = Math.floor(totalMin % 60);
        const dayTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;


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

      // La gráfica se construye desde los MISMOS registros reales que las
      // estadísticas, garantizando consistencia y sin peticiones adicionales.
      const records = await this._obtenerRegistros();
      if (!records) {
        this.renderEmptyChart();
        return;
      }

      const chartData = this._buildChartData(records, this.currentPeriod);
      const tieneDatos = chartData.datasets.entries.some(v => v > 0) ||
                         chartData.datasets.exits.some(v => v > 0) ||
                         chartData.datasets.workHours.some(v => v > 0);

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

  /**
   * Construye los datasets de la gráfica (entradas, salidas y horas trabajadas)
   * agregando los registros reales por día para el período indicado.
   * @param {Array} records
   * @param {string} period - 'week' o 'month'
   * @returns {{labels:string[], datasets:{entries:number[], exits:number[], workHours:number[]}}}
   */
  _buildChartData(records, period) {
    const hoy = new Date();
    const dias = [];

    if (period === 'week') {
      const inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - hoy.getDay());
      inicio.setHours(0, 0, 0, 0);
      for (let i = 0; i < 7; i++) {
        const d = new Date(inicio);
        d.setDate(inicio.getDate() + i);
        dias.push(d);
      }
    } else {
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= ultimoDia; i++) {
        dias.push(new Date(hoy.getFullYear(), hoy.getMonth(), i));
      }
    }

    const sesiones = this._emparejarSesiones(records);
    const labels = [];
    const entries = [];
    const exits = [];
    const workHours = [];

    dias.forEach(d => {
      const key = d.toDateString();
      labels.push(d.toLocaleDateString('es-ES', period === 'week'
        ? { weekday: 'short' }
        : { day: 'numeric' }));

      entries.push(records.filter(r => r.type === 'entrada' && new Date(r.timestamp).toDateString() === key).length);
      exits.push(records.filter(r => r.type === 'salida' && new Date(r.timestamp).toDateString() === key).length);

      const minutos = sesiones
        .filter(s => new Date(s.entrada).toDateString() === key)
        .reduce((acc, s) => acc + s.minutos, 0);
      workHours.push(Math.round((minutos / 60) * 100) / 100);
    });

    return { labels, datasets: { entries, exits, workHours } };
  }


  /**
   * Renderiza la gráfica de asistencia
   * @param {Object} statsData - Datos de la API
   */
  renderChart(statsData) {
    const canvas = this.attendanceChartCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (this.attendanceChart) {
      this.attendanceChart.destroy();
    }

    const labels = statsData.labels || [];
    const entriesData = statsData.datasets?.entries || [];
    const exitsData = statsData.datasets?.exits || [];
    const workHoursData = statsData.datasets?.workHours || [];

    this.attendanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Entradas',
            data: entriesData,
            backgroundColor: '#28a745',
            borderColor: '#1e7e34',
            borderWidth: 1
          },
          {
            label: 'Salidas',
            data: exitsData,
            backgroundColor: '#dc3545',
            borderColor: '#a02622',
            borderWidth: 1
          },
          {
            label: 'Horas Trabajadas',
            data: workHoursData,
            backgroundColor: 'rgba(255, 193, 7, 0.5)',
            borderColor: '#ffc107',
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
                if (context.dataset.label === 'Horas Trabajadas') {
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
              text: 'Cantidad de registros'
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

  _guardarEnLocalStorage(type, record, workSession) {
    try {
      const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      const userId = this.currentUser?.id || 'unknown';
      const userName = this.currentUser?.nombreCompleto || 'Desconocido';
      const now = new Date();
      const recordTimestamp = record?.timestamp || now.toISOString();
      
      // Clasificar la hora según legislación colombiana
      const hora = new Date(recordTimestamp).getHours();
      const esDiurno = hora >= 6 && hora < 19; // Diurno 06:00-19:00 (fuente: backend ColombianLaborLawService)

      const clasificacion = esDiurno ? 'Ordinaria Diurna' : 'Ordinaria Nocturna';
      const porcentajeRecargo = esDiurno ? 0 : 35; // Nocturno = 35% recargo

      attendanceRecords.push({
        userId: userId,
        userName: userName,
        type: type,
        timestamp: recordTimestamp,
        date: record?.date || now.toLocaleDateString('es-ES'),
        time: record?.time || now.toLocaleTimeString('es-ES'),
        hora: hora,
        clasificacion: clasificacion,
        recargo: porcentajeRecargo,
        id: record?._id || `local_${Date.now()}`
      });

      // Si el backend devolvió workSession con clasificación, guardarla directamente
      if (type === 'salida' && workSession && workSession._id) {
        this._guardarWorkSessionDesdeBackend(userId, workSession);
      } else if (type === 'salida') {
        // Fallback: calcular desde registros locales
        this._calcularSesionYCargos(userId, attendanceRecords);
      }

      // Mantener solo los últimos 500 registros
      if (attendanceRecords.length > 500) {
        attendanceRecords.splice(0, attendanceRecords.length - 500);
      }
      localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
      console.log(`💾 Registro guardado en localStorage (${attendanceRecords.length} totales)`);
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }

  /**
   * Guarda la sesión de trabajo calculada por el backend (con clasificación según ley colombiana)
   * @param {string} userId - ID del usuario
   * @param {Object} workSession - Objeto workSession devuelto por el backend
   */
  _guardarWorkSessionDesdeBackend(userId, workSession) {
    try {
      const hoy = new Date().toLocaleDateString('es-ES');
      const sesionesStorage = JSON.parse(localStorage.getItem('workSessions') || '[]');
      
      const sesion = {
        userId: userId,
        userName: this.currentUser?.nombreCompleto || 'Desconocido',
        fecha: hoy,
        entrada: workSession.horaEntrada || workSession.horaEntrada || '--',
        salida: workSession.horaSalida || '--',
        totalMinutos: workSession.tiempoLaboradoMinutos || 0,
        totalHoras: workSession.tiempoLaboradoHoras || '0h',
        clasificacion: {
          ordinariaDiurna: Math.round((workSession.tiempoJornadaOrdinariaDiurna || 0) / 60 * 100) / 100,
          ordinariaNocturna: Math.round((workSession.tiempoJornadaOrdinariaNocturna || 0) / 60 * 100) / 100,
          extrasDiurnas: Math.round((workSession.tiempoHorasExtrasDiurnas || 0) / 60 * 100) / 100,
          extrasNocturnas: Math.round((workSession.tiempoHorasExtrasNocturnas || 0) / 60 * 100) / 100,
          dominicales: Math.round((workSession.tiempoHorasExtrasDominicales || 0) / 60 * 100) / 100
        },
        recargos: {
          nocturno: Math.round((workSession.recargos?.recargoNocturno || 0) / 60 * 100) / 100,
          extraDiurno: Math.round((workSession.recargos?.recargoHorasExtrasDiurnas || 0) / 60 * 100) / 100,
          extraNocturno: Math.round((workSession.recargos?.recargoHorasExtrasNocturnas || 0) / 60 * 100) / 100,
          dominical: Math.round((workSession.recargos?.recargoDominicalesFestivos || 0) / 60 * 100) / 100
        },
        timestamp: new Date().toISOString()
      };

      const idx = sesionesStorage.findIndex(s => s.userId === userId && s.fecha === hoy);
      if (idx >= 0) {
        sesionesStorage[idx] = sesion;
      } else {
        sesionesStorage.push(sesion);
      }

      if (sesionesStorage.length > 100) {
        sesionesStorage.splice(0, sesionesStorage.length - 100);
      }
      localStorage.setItem('workSessions', JSON.stringify(sesionesStorage));
      console.log('📋 Sesión guardada desde backend (con ley colombiana):', sesion);
    } catch (error) {
      console.error('Error al guardar workSession del backend:', error);
    }
  }

  /**
   * Calcula la sesión completa cuando se registra una salida
   * @param {string} userId - ID del usuario
   * @param {Array} records - Todos los registros actuales
   */
  _calcularSesionYCargos(userId, records) {
    try {
      // Obtener registros de HOY ordenados
      const hoy = new Date().toLocaleDateString('es-ES');
      const recordsHoy = records.filter(r => r.date === hoy && r.userId === userId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Encontrar el último par entrada-salida
      const entradas = recordsHoy.filter(r => r.type === 'entrada');
      const salidas = recordsHoy.filter(r => r.type === 'salida');
      
      if (entradas.length === 0 || salidas.length === 0) return;

      const ultimaEntrada = entradas[entradas.length - 1];
      const ultimaSalida = salidas[salidas.length - 1];

      // Calcular tiempo trabajado en minutos
      const diffMs = new Date(ultimaSalida.timestamp) - new Date(ultimaEntrada.timestamp);
      const totalMinutos = Math.floor(diffMs / (1000 * 60));
      const totalHoras = totalMinutos / 60;

      // Clasificación de horas según legislación colombiana
      const horaEntrada = new Date(ultimaEntrada.timestamp).getHours();
      const horaSalida = new Date(ultimaSalida.timestamp).getHours();

      // Limites legales Colombia. Fuente unica de verdad: backend ColombianLaborLawService.
      // Este calculo local es solo un respaldo offline cuando el backend no responde.
      const JORNADA_DIURNA_INICIO = 6;
      const JORNADA_DIURNA_FIN = 19; // Jornada diurna 06:00-19:00

      const MAX_HORAS_NORMALES = 8;

      let minutosDiurnos = 0;
      let minutosNocturnos = 0;
      let minutosExtrasDiurnas = 0;
      let minutosExtrasNocturnas = 0;
      let minutosDominicales = 0;

      const esFinDeSemana = new Date().getDay() === 0; // Domingo
      const totalMinutosOrdinarios = Math.min(totalMinutos, MAX_HORAS_NORMALES * 60);
      const minutosExtras = Math.max(0, totalMinutos - totalMinutosOrdinarios);

      // Distribuir entre diurno y nocturno
      for (let h = horaEntrada; h < horaSalida || (h >= horaEntrada && h < horaEntrada + Math.ceil(totalHoras)); h++) {
        const horaActual = h % 24;
        const esDiurno = horaActual >= JORNADA_DIURNA_INICIO && horaActual < JORNADA_DIURNA_FIN;
        const minutosEnHora = 60;

        if (esFinDeSemana) {
          minutosDominicales += minutosEnHora;
        } else if (h - horaEntrada < MAX_HORAS_NORMALES) {
          // Jornada ordinaria
          if (esDiurno) minutosDiurnos += minutosEnHora;
          else minutosNocturnos += minutosEnHora;
        } else {
          // Horas extras
          if (esDiurno) minutosExtrasDiurnas += minutosEnHora;
          else minutosExtrasNocturnas += minutosEnHora;
        }

        // Si ya procesamos todas las horas reales, salir
        if (h - horaEntrada >= Math.ceil(totalHoras)) break;
      }

      // Guardar la sesión calculada en localStorage
      const sesionesStorage = JSON.parse(localStorage.getItem('workSessions') || '[]');
      
      // Buscar si ya existe una sesión para hoy para este usuario
      const idx = sesionesStorage.findIndex(s => 
        s.userId === userId && s.fecha === hoy
      );

      const sesion = {
        userId: userId,
        userName: this.currentUser?.nombreCompleto || 'Desconocido',
        fecha: hoy,
        entrada: ultimaEntrada.time,
        salida: ultimaSalida.time,
        totalMinutos: totalMinutos,
        totalHoras: `${Math.floor(totalMinutos / 60)}h ${totalMinutos % 60}m`,
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
        },
        timestamp: new Date().toISOString()
      };

      if (idx >= 0) {
        sesionesStorage[idx] = sesion;
      } else {
        sesionesStorage.push(sesion);
      }

      // Mantener últimas 100 sesiones
      if (sesionesStorage.length > 100) {
        sesionesStorage.splice(0, sesionesStorage.length - 100);
      }
      localStorage.setItem('workSessions', JSON.stringify(sesionesStorage));
      console.log('📋 Sesión calculada y guardada:', sesion);

    } catch (error) {
      console.error('Error al calcular sesión:', error);
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