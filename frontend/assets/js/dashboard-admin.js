// FUNCIONALIDAD DEL DASHBOARD DE ADMINISTRADOR // 

class AdminDashboard extends BaseDashboard {
  constructor() {
    // Llamar al constructor de la clase base
    super('administrador');
    
    // Referencias a elementos del DOM
    this.adminName = document.getElementById('adminName');
    this.employeesList = document.getElementById('employeesList');
    this.attendanceRecords = document.getElementById('attendanceRecords');
    this.adminDepartment = document.getElementById('adminDepartment');
    this.activeEmployees = document.getElementById('activeEmployees');
    this.todayAttendance = document.getElementById('todayAttendance');
    this.employeeSearch = document.getElementById('employeeSearch');
    this.searchBtn = document.getElementById('searchBtn');
    this.dateFilter = document.getElementById('dateFilter');
    this.exportBtn = document.getElementById('exportBtn');
    this.newEmployeeBtn = document.getElementById('newEmployeeBtn');
    this.reportsBtn = document.getElementById('reportsBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
  }
  
  // Método específico para inicializar el dashboard de administrador
  initSpecific() {
    // Configurar eventos de botones
    this.setupEventListeners();
    
    // Cargar lista de empleados
    this.loadEmployeesList();
    
    // Cargar registros de asistencia
    this.loadAttendanceRecords();
    
    // Cargar estadísticas
    this.loadDashboardStats();
  }
  
  // Los métodos checkUserSession() y loadUserData() ya están implementados en BaseDashboard
  
  /**
   * Sobreescribimos el método de la clase base para personalizar
   * la interfaz específica del dashboard de administrador
   */
  updateUserInterface() {
    // Actualizar nombre del administrador
    if (this.adminName) {
      this.adminName.textContent = this.currentUser.nombreCompleto;
    }
    
    // Actualizar departamento
    if (this.adminDepartment) {
      this.adminDepartment.textContent = this.currentUser.departamento || 'No especificado';
    }
  }
  
  setupEventListeners() {
    // Búsqueda de empleados
    if (this.searchBtn) {
      this.searchBtn.addEventListener('click', () => this.searchEmployees());
    }
    
    // Filtro de fechas para registros
    if (this.dateFilter) {
      this.dateFilter.addEventListener('change', () => this.loadAttendanceRecords());
    }
    
    // Botón de logout
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => this.logout());
    }
    
    // Botón de exportar
    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => this.exportData());
    }
    
    // Botón de nuevo empleado
    if (this.newEmployeeBtn) {
      this.newEmployeeBtn.addEventListener('click', () => window.location.href = 'registro.html');
    }
    
    // Botón de informes
    if (this.reportsBtn) {
      this.reportsBtn.addEventListener('click', () => {
        // Usar NotificationManager si está disponible
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast('Funcionalidad de informes en desarrollo', 'info');
        } else {
          alert('Funcionalidad de informes en desarrollo');
        }
      });
    }
    
    // Botón de configuración
    if (this.settingsBtn) {
      this.settingsBtn.addEventListener('click', () => {
        // Usar NotificationManager si está disponible
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast('Funcionalidad de configuración en desarrollo', 'info');
        } else {
          alert('Funcionalidad de configuración en desarrollo');
        }
      });
    }
  }
  
  loadEmployeesList() {
    try {
      if (!this.employeesList) return;
      
      // Obtener todos los usuarios registrados
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Filtrar solo empleados (excluir administradores)
      const employees = users.filter(user => user.tipoUsuario === 'empleado');
      
      // Mostrar empleados
      if (employees.length === 0) {
        this.employeesList.innerHTML = '<p>No hay empleados registrados.</p>';
        return;
      }
      
      // Generar HTML de empleados
      let employeesHTML = '<div class="employees-table"><table>';
      employeesHTML += '<thead><tr><th>Nombre</th><th>Documento</th><th>Cargo</th><th>Acciones</th></tr></thead><tbody>';
      
      employees.forEach(employee => {
        employeesHTML += `
          <tr data-id="${employee.id}">
            <td>${employee.nombreCompleto}</td>
            <td>${employee.numeroDocumento}</td>
            <td>${employee.cargo || 'No especificado'}</td>
            <td>
              <button class="view-btn" data-id="${employee.id}">Ver</button>
              <button class="edit-btn" data-id="${employee.id}">Editar</button>
            </td>
          </tr>
        `;
      });
      
      employeesHTML += '</tbody></table></div>';
      
      // Actualizar el contenedor
      this.employeesList.innerHTML = employeesHTML;
      
      // Configurar botones de acción
      this.setupEmployeeActions();
      
    } catch (error) {
      console.error('Error al cargar lista de empleados:', error);
      this.employeesList.innerHTML = '<p>Error al cargar los empleados.</p>';
    }
  }
  
  setupEmployeeActions() {
    // Botones de ver empleado
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        const employeeId = button.getAttribute('data-id');
        this.viewEmployeeDetails(employeeId);
      });
    });
    
    // Botones de editar empleado
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const employeeId = button.getAttribute('data-id');
        // Usar NotificationManager si está disponible
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast(`Funcionalidad de edición en desarrollo para empleado ID: ${employeeId}`, 'info');
        } else {
          alert(`Funcionalidad de edición en desarrollo para empleado ID: ${employeeId}`);
        }
      });
    });
  }
  
  viewEmployeeDetails(employeeId) {
    try {
      // Obtener todos los usuarios registrados
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Buscar el empleado por ID
      const employee = users.find(user => user.id === employeeId);
      
      if (!employee) {
        // Usar NotificationManager si está disponible
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast('Empleado no encontrado', 'error');
        } else {
          alert('Empleado no encontrado');
        }
        return;
      }
      
      // Obtener registros de asistencia del empleado
      const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      const employeeRecords = attendanceRecords.filter(record => record.userId === employeeId);
      
      // Crear ventana modal
      const modal = document.createElement('div');
      modal.className = 'employee-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <h3>Detalles del Empleado</h3>
          
          <div class="employee-details">
            <p><strong>Nombre:</strong> ${employee.nombreCompleto}</p>
            <p><strong>Documento:</strong> ${employee.numeroDocumento}</p>
            <p><strong>Correo:</strong> ${employee.correoElectronico}</p>
            <p><strong>Cargo:</strong> ${employee.cargo || 'No especificado'}</p>
            <p><strong>Horario:</strong> ${employee.horarioAsignado || 'No especificado'}</p>
            <p><strong>Fecha de Ingreso:</strong> ${employee.fechaIngreso || 'No especificado'}</p>
            <p><strong>Teléfono:</strong> ${employee.telefono || 'No especificado'}</p>
          </div>
          
          <h4>Registros de Asistencia</h4>
          <div class="employee-attendance">
            ${this.generateAttendanceHTML(employeeRecords)}
          </div>
        </div>
      `;
      
      // Añadir modal al documento
      document.body.appendChild(modal);
      
      // Configurar cierre de modal
      const closeModal = modal.querySelector('.close-modal');
      closeModal.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
      // Cerrar al hacer clic fuera del contenido
      modal.addEventListener('click', event => {
        if (event.target === modal) {
          document.body.removeChild(modal);
        }
      });
      
    } catch (error) {
      console.error('Error al mostrar detalles del empleado:', error);
      // Usar NotificationManager si está disponible
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast('Error al cargar los detalles del empleado', 'error');
      } else {
        alert('Error al cargar los detalles del empleado');
      }
    }
  }
  
  generateAttendanceHTML(records) {
    if (records.length === 0) {
      return '<p>No hay registros de asistencia para este empleado.</p>';
    }
    
    // Ordenar por fecha (más recientes primero)
    records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    let html = '<table>';
    html += '<thead><tr><th>Fecha</th><th>Hora</th><th>Tipo</th></tr></thead><tbody>';
    
    records.forEach(record => {
      const typeClass = record.type === 'entrada' ? 'entry-record' : 'exit-record';
      const typeIcon = record.type === 'entrada' ? '⬆️' : '⬇️';
      
      html += `
        <tr class="${typeClass}">
          <td>${record.date}</td>
          <td>${record.time}</td>
          <td>${typeIcon} ${record.type.charAt(0).toUpperCase() + record.type.slice(1)}</td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    
    return html;
  }
  
  loadAttendanceRecords() {
    try {
      if (!this.attendanceRecords) return;
      
      // Obtener todos los registros de asistencia
      const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      
      // Aplicar filtro de fecha
      const filteredRecords = this.filterAttendanceByDate(attendanceRecords);
      
      // Mostrar registros
      if (filteredRecords.length === 0) {
        this.attendanceRecords.innerHTML = '<p>No hay registros de asistencia disponibles.</p>';
        return;
      }
      
      // Obtener lista de usuarios para mostrar nombres
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Ordenar por fecha (más recientes primero)
      filteredRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Generar HTML de registros
      let recordsHTML = '<div class="records-table"><table>';
      recordsHTML += '<thead><tr><th>Empleado</th><th>Fecha</th><th>Hora</th><th>Tipo</th></tr></thead><tbody>';
      
      filteredRecords.forEach(record => {
        const user = users.find(u => u.id === record.userId);
        const userName = user ? user.nombreCompleto : 'Usuario desconocido';
        const typeClass = record.type === 'entrada' ? 'entry-record' : 'exit-record';
        const typeIcon = record.type === 'entrada' ? '⬆️' : '⬇️';
        
        recordsHTML += `
          <tr class="${typeClass}">
            <td>${userName}</td>
            <td>${record.date}</td>
            <td>${record.time}</td>
            <td>${typeIcon} ${record.type.charAt(0).toUpperCase() + record.type.slice(1)}</td>
          </tr>
        `;
      });
      
      recordsHTML += '</tbody></table></div>';
      
      // Actualizar el contenedor
      this.attendanceRecords.innerHTML = recordsHTML;
      
    } catch (error) {
      console.error('Error al cargar registros de asistencia:', error);
      this.attendanceRecords.innerHTML = '<p>Error al cargar los registros.</p>';
    }
  }
  
  filterAttendanceByDate(records) {
    if (!this.dateFilter) return records;
    
    const filterValue = this.dateFilter.value;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filterValue) {
      case 'today':
        return records.filter(record => {
          const recordDate = new Date(record.timestamp);
          return recordDate.getDate() === now.getDate() &&
                 recordDate.getMonth() === now.getMonth() &&
                 recordDate.getFullYear() === now.getFullYear();
        });
        
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        
        return records.filter(record => {
          const recordDate = new Date(record.timestamp);
          return recordDate >= weekStart;
        });
        
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        
        return records.filter(record => {
          const recordDate = new Date(record.timestamp);
          return recordDate >= monthStart;
        });
        
      case 'all':
      default:
        return records;
    }
  }
  
  loadDashboardStats() {
    try {
      // Obtener todos los usuarios registrados
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Filtrar solo empleados
      const employees = users.filter(user => user.tipoUsuario === 'empleado');
      
      // Actualizar contador de empleados activos
      if (this.activeEmployees) {
        this.activeEmployees.textContent = employees.length;
      }
      
      // Calcular porcentaje de asistencia hoy
      if (this.todayAttendance) {
        const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
        const now = new Date();
        const today = now.toLocaleDateString('es-ES');
        
        // Contar empleados que registraron entrada hoy
        const employeesWithEntryToday = new Set();
        
        attendanceRecords.forEach(record => {
          const recordDate = new Date(record.timestamp).toLocaleDateString('es-ES');
          if (recordDate === today && record.type === 'entrada') {
            employeesWithEntryToday.add(record.userId);
          }
        });
        
        // Calcular porcentaje
        const attendancePercentage = employees.length > 0 
          ? Math.round((employeesWithEntryToday.size / employees.length) * 100) 
          : 0;
        
        this.todayAttendance.textContent = `${attendancePercentage}%`;
      }
      
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }
  
  searchEmployees() {
    try {
      if (!this.employeeSearch || !this.employeesList) return;
      
      const searchTerm = this.employeeSearch.value.trim().toLowerCase();
      
      // Si no hay término de búsqueda, mostrar todos los empleados
      if (!searchTerm) {
        this.loadEmployeesList();
        return;
      }
      
      // Obtener todos los usuarios registrados
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Filtrar empleados que coincidan con la búsqueda
      const filteredEmployees = users.filter(user => 
        user.tipoUsuario === 'empleado' && (
          user.nombreCompleto.toLowerCase().includes(searchTerm) ||
          user.numeroDocumento.includes(searchTerm) ||
          (user.cargo && user.cargo.toLowerCase().includes(searchTerm))
        )
      );
      
      // Mostrar resultados
      if (filteredEmployees.length === 0) {
        this.employeesList.innerHTML = '<p>No se encontraron empleados que coincidan con la búsqueda.</p>';
        return;
      }
      
      // Generar HTML de empleados
      let employeesHTML = '<div class="employees-table"><table>';
      employeesHTML += '<thead><tr><th>Nombre</th><th>Documento</th><th>Cargo</th><th>Acciones</th></tr></thead><tbody>';
      
      filteredEmployees.forEach(employee => {
        employeesHTML += `
          <tr data-id="${employee.id}">
            <td>${employee.nombreCompleto}</td>
            <td>${employee.numeroDocumento}</td>
            <td>${employee.cargo || 'No especificado'}</td>
            <td>
              <button class="view-btn" data-id="${employee.id}">Ver</button>
              <button class="edit-btn" data-id="${employee.id}">Editar</button>
            </td>
          </tr>
        `;
      });
      
      employeesHTML += '</tbody></table></div>';
      
      // Actualizar el contenedor
      this.employeesList.innerHTML = employeesHTML;
      
      // Configurar botones de acción
      this.setupEmployeeActions();
      
    } catch (error) {
      console.error('Error al buscar empleados:', error);
      this.employeesList.innerHTML = '<p>Error al buscar empleados.</p>';
    }
  }
  
  exportData() {
    try {
      // Obtener registros de asistencia filtrados
      const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      const filteredRecords = this.filterAttendanceByDate(attendanceRecords);
      
      // Obtener lista de usuarios para mostrar nombres
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Crear datos CSV
      let csv = 'Empleado,Documento,Fecha,Hora,Tipo\n';
      
      filteredRecords.forEach(record => {
        const user = users.find(u => u.id === record.userId);
        if (user) {
          csv += `"${user.nombreCompleto}","${user.numeroDocumento}","${record.date}","${record.time}","${record.type}"\n`;
        }
      });
      
      // Crear blob y descargar
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Nombre del archivo
      const dateStr = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
      link.setAttribute('href', url);
      link.setAttribute('download', `registros_asistencia_${dateStr}.csv`);
      link.style.display = 'none';
      
      // Descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Usar NotificationManager si está disponible
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast('Datos exportados correctamente', 'success');
      } else {
        alert('Datos exportados correctamente');
      }
      
    } catch (error) {
      console.error('Error al exportar datos:', error);
      // Usar NotificationManager si está disponible
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast('Error al exportar datos', 'error');
      } else {
        alert('Error al exportar datos');
      }
    }
  }
  
  // Los métodos logout() y redirectToLogin() ya están implementados en BaseDashboard
}

// Inicializar el dashboard cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new AdminDashboard();
});
