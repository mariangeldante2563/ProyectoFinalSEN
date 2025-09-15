/**
 * IN OUT MANAGER - EXTENSIÓN DASHBOARD DE ADMINISTRADOR
 * @version 1.0.0
 * @description Añade funcionalidad de reportes al dashboard de administrador
 */

// Extendemos el dashboard de administrador para añadir funcionalidad de reportes
class AdminDashboardWithReports extends AdminDashboard {
  constructor() {
    // Llamar al constructor de la clase base
    super();
    
    // Inicializar el gestor de reportes
    this.reportManager = new ReportManager();
    
    // Referencias adicionales para reportes
    this.generateGeneralReportBtn = document.getElementById('generateGeneralReportBtn');
    this.generateUserReportBtn = document.getElementById('generateUserReportBtn');
    this.reportUserSelect = document.getElementById('reportUserSelect');
    this.generalReportStartDate = document.getElementById('generalReportStartDate');
    this.generalReportEndDate = document.getElementById('generalReportEndDate');
    this.userReportStartDate = document.getElementById('userReportStartDate');
    this.userReportEndDate = document.getElementById('userReportEndDate');
  }
  
  // Sobreescribimos el método para añadir la inicialización de reportes
  initSpecific() {
    // Llamar al método base para mantener funcionalidad original
    super.initSpecific();
    
    // Inicializar funcionalidad de reportes
    this.initReportFunctionality();
  }
  
  // Inicializar funcionalidad de reportes
  initReportFunctionality() {
    // Configurar fechas por defecto (último mes)
    this.setupDefaultDates();
    
    // Cargar lista de usuarios para reportes individuales
    this.loadUsersForReports();
    
    // Configurar botones de generación de reportes
    if (this.generateGeneralReportBtn) {
      this.generateGeneralReportBtn.addEventListener('click', () => this.handleGenerateGeneralReport());
    }
    
    if (this.generateUserReportBtn) {
      this.generateUserReportBtn.addEventListener('click', () => this.handleGenerateUserReport());
    }
  }
  
  // Configurar fechas por defecto (último mes)
  setupDefaultDates() {
    const dateInputs = [
      this.generalReportStartDate, 
      this.generalReportEndDate,
      this.userReportStartDate,
      this.userReportEndDate
    ];
    
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    // Formatear fechas en formato YYYY-MM-DD para input type="date"
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Establecer fechas en los inputs disponibles
    dateInputs.forEach(input => {
      if (input) {
        if (input.id.includes('Start')) {
          input.value = formatDate(lastMonth);
        } else {
          input.value = formatDate(today);
        }
      }
    });
  }
  
  // Cargar usuarios para el selector de reportes individuales
  async loadUsersForReports() {
    if (!this.reportUserSelect) return;
    
    try {
      // Obtener datos de usuarios (reutilizamos la función de la clase base)
      const users = await this.fetchUsers();
      
      // Llenar el selector
      this.reportUserSelect.innerHTML = '';
      
      users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.nombreCompleto} (${user.numeroDocumento})`;
        this.reportUserSelect.appendChild(option);
      });
      
    } catch (error) {
      console.error('Error al cargar usuarios para reportes:', error);
      
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast(
          'Error al cargar lista de usuarios para reportes',
          'error'
        );
      }
    }
  }
  
  // Validar fechas de reporte
  validateReportDates(startDateInput, endDateInput) {
    if (!startDateInput || !endDateInput) return false;
    
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    // Verificar que ambas fechas estén definidas
    if (!startDate || !endDate) {
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast('Por favor, seleccione ambas fechas', 'warning');
      }
      return false;
    }
    
    // Verificar que la fecha inicial no sea posterior a la final
    if (new Date(startDate) > new Date(endDate)) {
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast(
          'La fecha inicial no puede ser posterior a la fecha final', 
          'warning'
        );
      }
      return false;
    }
    
    return true;
  }
  
  // Manejar la generación de reporte general
  async handleGenerateGeneralReport() {
    if (!this.validateReportDates(this.generalReportStartDate, this.generalReportEndDate)) {
      return;
    }
    
    try {
      // Mostrar indicador de carga
      this.generateGeneralReportBtn.disabled = true;
      this.generateGeneralReportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
      
      // Generar reporte general
      await this.reportManager.generateGeneralReport({
        startDate: this.generalReportStartDate.value,
        endDate: this.generalReportEndDate.value
      });
      
    } catch (error) {
      console.error('Error al generar reporte general:', error);
    } finally {
      // Restaurar estado del botón
      this.generateGeneralReportBtn.disabled = false;
      this.generateGeneralReportBtn.innerHTML = '<i class="fas fa-file-excel"></i> Generar Reporte General';
    }
  }
  
  // Manejar la generación de reporte de usuario específico
  async handleGenerateUserReport() {
    if (!this.validateReportDates(this.userReportStartDate, this.userReportEndDate)) {
      return;
    }
    
    // Verificar que se haya seleccionado un usuario
    if (!this.reportUserSelect || !this.reportUserSelect.value) {
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast('Por favor, seleccione un usuario', 'warning');
      }
      return;
    }
    
    try {
      const userId = this.reportUserSelect.value;
      
      // Mostrar indicador de carga
      this.generateUserReportBtn.disabled = true;
      this.generateUserReportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
      
      // Generar reporte de usuario específico
      const url = `${this.reportManager.baseReportUrl}/user/${userId}?startDate=${this.userReportStartDate.value}&endDate=${this.userReportEndDate.value}`;
      
      // Configurar la solicitud
      const requestOptions = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Mostrar notificación de espera
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast('Generando reporte, por favor espere...', 'info');
      }
      
      // Realizar la solicitud
      const response = await fetch(url, requestOptions);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Error al generar el reporte');
      }
      
      // Procesar la respuesta
      const data = await response.json();
      
      // Iniciar la descarga del archivo
      if (data.success && data.data.reportUrl) {
        this.reportManager.downloadReport(data.data.reportUrl, data.data.fileName);
        
        // Mostrar notificación de éxito
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast('Reporte generado exitosamente', 'success');
        }
      }
      
    } catch (error) {
      console.error('Error al generar reporte de usuario:', error);
      
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast(
          `Error al generar reporte: ${error.message}`,
          'error'
        );
      }
    } finally {
      // Restaurar estado del botón
      this.generateUserReportBtn.disabled = false;
      this.generateUserReportBtn.innerHTML = '<i class="fas fa-file-excel"></i> Generar Reporte';
    }
  }
}

// Sobrescribir la inicialización del dashboard cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si la clase ReportManager está disponible
  if (typeof ReportManager !== 'undefined' && typeof AdminDashboard !== 'undefined') {
    const dashboard = new AdminDashboardWithReports();
  } else {
    // Fallback a la versión original si no están disponibles las clases necesarias
    if (typeof AdminDashboard !== 'undefined') {
      const dashboard = new AdminDashboard();
      console.warn('ReportManager no disponible. Funcionalidad de reportes desactivada.');
    } else {
      console.error('AdminDashboard no disponible. No se pudo inicializar el dashboard.');
    }
  }
});