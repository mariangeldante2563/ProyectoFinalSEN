// FUNCIONALIDAD DEL DASHBOARD DE ADMINISTRADOR // 

class AdminDashboard extends BaseDashboard {
  constructor() {
<<<<<<< HEAD
    super('administrador');
    
   //DOM
=======
    // Llamar al constructor de la clase base
    super('administrador');
    
    // Referencias a elementos del DOM
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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
  
<<<<<<< HEAD
  initSpecific() {
    this.setupEventListeners();
    this.loadEmployeesList();
    this.loadAttendanceRecords();
    this.loadDashboardStats();
  }
  
  updateUserInterface() {
    if (this.adminName) {
      this.adminName.textContent = this.currentUser.nombreCompleto;
    }
=======
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (this.adminDepartment) {
      this.adminDepartment.textContent = this.currentUser.departamento || 'No especificado';
    }
  }
  
  setupEventListeners() {
<<<<<<< HEAD
=======
    // Búsqueda de empleados
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (this.searchBtn) {
      this.searchBtn.addEventListener('click', () => this.searchEmployees());
    }
    
<<<<<<< HEAD
=======
    // Filtro de fechas para registros
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (this.dateFilter) {
      this.dateFilter.addEventListener('change', () => this.loadAttendanceRecords());
    }
    
<<<<<<< HEAD
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => this.logout());
    }
=======
    // Botón de logout
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => this.logout());
    }
    
    // Botón de exportar
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => this.exportData());
    }
    
<<<<<<< HEAD
    if (this.newEmployeeBtn) {
      this.newEmployeeBtn.addEventListener('click', () => {
        if (typeof PathManager !== 'undefined') {
          PathManager.navigateToRegister();
          return;
        }
        window.location.href = '../auth/registro.html';
      });
    }
    
    if (this.reportsBtn) {
      this.reportsBtn.addEventListener('click', () => {
=======
    // Botón de nuevo empleado
    if (this.newEmployeeBtn) {
      this.newEmployeeBtn.addEventListener('click', () => window.location.href = 'registro.html');
    }
    
    // Botón de informes
    if (this.reportsBtn) {
      this.reportsBtn.addEventListener('click', () => {
        // Usar NotificationManager si está disponible
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast('Funcionalidad de informes en desarrollo', 'info');
        } else {
          alert('Funcionalidad de informes en desarrollo');
        }
      });
    }
<<<<<<< HEAD
    if (this.settingsBtn) {
      this.settingsBtn.addEventListener('click', () => {
=======
    
    // Botón de configuración
    if (this.settingsBtn) {
      this.settingsBtn.addEventListener('click', () => {
        // Usar NotificationManager si está disponible
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast('Funcionalidad de configuración en desarrollo', 'info');
        } else {
          alert('Funcionalidad de configuración en desarrollo');
        }
      });
    }
  }
  
<<<<<<< HEAD
  _authHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async loadEmployeesList() {
    try {
      if (!this.employeesList) return;
      this.employeesList.innerHTML = '<p>Cargando empleados...</p>';

      const response = await fetch('/api/users?tipoUsuario=empleado&limit=200', {
        headers: this._authHeaders()
      });
      const result = await response.json();

      if (!result.success) {
        this.employeesList.innerHTML = '<p>Error al obtener empleados del servidor.</p>';
        return;
      }

      const employees = result.data;
=======
  loadEmployeesList() {
    try {
      if (!this.employeesList) return;
      
      // Obtener todos los usuarios registrados
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Filtrar solo empleados (excluir administradores)
      const employees = users.filter(user => user.tipoUsuario === 'empleado');
      
      // Mostrar empleados
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (employees.length === 0) {
        this.employeesList.innerHTML = '<p>No hay empleados registrados.</p>';
        return;
      }
<<<<<<< HEAD

      let employeesHTML = '<div class="employees-table"><table>';
      employeesHTML += '<thead><tr><th>Nombre</th><th>Documento</th><th>Cargo</th><th>Acciones</th></tr></thead><tbody>';

      employees.forEach(employee => {
        employeesHTML += `
          <tr data-id="${employee._id}">
=======
      
      // Generar HTML de empleados
      let employeesHTML = '<div class="employees-table"><table>';
      employeesHTML += '<thead><tr><th>Nombre</th><th>Documento</th><th>Cargo</th><th>Acciones</th></tr></thead><tbody>';
      
      employees.forEach(employee => {
        employeesHTML += `
          <tr data-id="${employee.id}">
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            <td>${employee.nombreCompleto}</td>
            <td>${employee.numeroDocumento}</td>
            <td>${employee.cargo || 'No especificado'}</td>
            <td>
<<<<<<< HEAD
              <button class="view-btn" data-id="${employee._id}">Ver</button>
              <button class="edit-btn" data-id="${employee._id}">Editar</button>
=======
              <button class="view-btn" data-id="${employee.id}">Ver</button>
              <button class="edit-btn" data-id="${employee.id}">Editar</button>
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            </td>
          </tr>
        `;
      });
<<<<<<< HEAD

      employeesHTML += '</tbody></table></div>';
      this.employeesList.innerHTML = employeesHTML;
      this.setupEmployeeActions();
=======
      
      employeesHTML += '</tbody></table></div>';
      
      // Actualizar el contenedor
      this.employeesList.innerHTML = employeesHTML;
      
      // Configurar botones de acción
      this.setupEmployeeActions();
      
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    } catch (error) {
      console.error('Error al cargar lista de empleados:', error);
      this.employeesList.innerHTML = '<p>Error al cargar los empleados.</p>';
    }
  }
  
  setupEmployeeActions() {
<<<<<<< HEAD

=======
    // Botones de ver empleado
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        const employeeId = button.getAttribute('data-id');
        this.viewEmployeeDetails(employeeId);
      });
    });
<<<<<<< HEAD
=======
    
    // Botones de editar empleado
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const employeeId = button.getAttribute('data-id');
<<<<<<< HEAD
=======
        // Usar NotificationManager si está disponible
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast(`Funcionalidad de edición en desarrollo para empleado ID: ${employeeId}`, 'info');
        } else {
          alert(`Funcionalidad de edición en desarrollo para empleado ID: ${employeeId}`);
        }
      });
    });
  }
  
<<<<<<< HEAD
  async viewEmployeeDetails(employeeId) {
    try {
      const [userRes, attRes, statsRes] = await Promise.all([
        fetch(`/api/users/${employeeId}`, { headers: this._authHeaders() }),
        fetch(`/api/attendance/all?userId=${employeeId}&limit=100`, { headers: this._authHeaders() }),
        fetch(`/api/stats/dashboard?userId=${employeeId}`, { headers: this._authHeaders() })
      ]);

      const userResult = await userRes.json();
      const attResult = await attRes.json();
      const statsResult = await statsRes.json();

      const employee = userResult.data;

      if (!employee) {
=======
  viewEmployeeDetails(employeeId) {
    try {
      // Obtener todos los usuarios registrados
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Buscar el empleado por ID
      const employee = users.find(user => user.id === employeeId);
      
      if (!employee) {
        // Usar NotificationManager si está disponible
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast('Empleado no encontrado', 'error');
        } else {
          alert('Empleado no encontrado');
        }
        return;
      }
<<<<<<< HEAD

      const employeeRecords = attResult.success ? attResult.data.map(r => ({
        userId: r.userId?._id || r.userId,
        type: r.type,
        timestamp: r.timestamp,
        date: r.date || new Date(r.timestamp).toLocaleDateString('es-ES'),
        time: r.time || new Date(r.timestamp).toLocaleTimeString('es-ES')
      })) : [];
      const employeeStats = statsResult.success ? statsResult.data : null;
      
=======
      
      // Obtener registros de asistencia del empleado
      const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      const employeeRecords = attendanceRecords.filter(record => record.userId === employeeId);
      
      // Crear ventana modal
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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
<<<<<<< HEAD

          <h4>Estadísticas del Empleado</h4>
          <div class="employee-stats">
            ${this.generateEmployeeStatsHTML(employeeStats)}
          </div>
=======
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
          
          <h4>Registros de Asistencia</h4>
          <div class="employee-attendance">
            ${this.generateAttendanceHTML(employeeRecords)}
          </div>
        </div>
      `;
      
<<<<<<< HEAD
      document.body.appendChild(modal);
      
=======
      // Añadir modal al documento
      document.body.appendChild(modal);
      
      // Configurar cierre de modal
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      const closeModal = modal.querySelector('.close-modal');
      closeModal.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
<<<<<<< HEAD
=======
      // Cerrar al hacer clic fuera del contenido
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      modal.addEventListener('click', event => {
        if (event.target === modal) {
          document.body.removeChild(modal);
        }
      });
      
    } catch (error) {
      console.error('Error al mostrar detalles del empleado:', error);
<<<<<<< HEAD
=======
      // Usar NotificationManager si está disponible
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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
<<<<<<< HEAD
=======
    
    // Ordenar por fecha (más recientes primero)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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
<<<<<<< HEAD

  generateEmployeeStatsHTML(stats) {
    if (!stats || !stats.hoy || !stats.semana || !stats.mes) {
      return '<p>No hay estadísticas disponibles para este empleado.</p>';
    }

    return `
      <div class="employee-stats-grid">
        <p><strong>Tiempo trabajado hoy:</strong> ${stats.hoy.estadisticas?.tiempoTotal?.formato || '00:00'}</p>
        <p><strong>Horas extras hoy:</strong> ${stats.hoy.estadisticas?.horasExtras?.total?.formato || '00:00'}</p>
        <p><strong>Promedio semanal:</strong> ${(stats.semana.promedioHorasDiarias || 0).toFixed(1)}h</p>
        <p><strong>Días trabajados del mes:</strong> ${stats.mes.diasTrabajados || 0}</p>
      </div>
    `;
  }
  
  async loadAttendanceRecords() {
    try {
      if (!this.attendanceRecords) return;
      this.attendanceRecords.innerHTML = '<p>Cargando registros...</p>';

      // Construir filtro de fecha para la query
      const dateParams = this._buildDateQueryParams();
      const response = await fetch(`/api/attendance/all?limit=200${dateParams}`, {
        headers: this._authHeaders()
      });
      const result = await response.json();

      if (!result.success) {
        this.attendanceRecords.innerHTML = '<p>Error al obtener registros del servidor.</p>';
        return;
      }

      const filteredRecords = result.data;

=======
  
  loadAttendanceRecords() {
    try {
      if (!this.attendanceRecords) return;
      
      // Obtener todos los registros de asistencia
      const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      
      // Aplicar filtro de fecha
      const filteredRecords = this.filterAttendanceByDate(attendanceRecords);
      
      // Mostrar registros
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (filteredRecords.length === 0) {
        this.attendanceRecords.innerHTML = '<p>No hay registros de asistencia disponibles.</p>';
        return;
      }
<<<<<<< HEAD

      let recordsHTML = '<div class="records-table"><table>';
      recordsHTML += '<thead><tr><th>Empleado</th><th>Fecha</th><th>Hora</th><th>Tipo</th></tr></thead><tbody>';

      filteredRecords.forEach(record => {
        // userId viene populate con { _id, nombreCompleto, numeroDocumento }
        const userName = record.userId?.nombreCompleto || 'Usuario desconocido';
        const typeClass = record.type === 'entrada' ? 'entry-record' : 'exit-record';
        const typeIcon = record.type === 'entrada' ? '⬆️' : '⬇️';

=======
      
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
        
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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
<<<<<<< HEAD
      this.attendanceRecords.innerHTML = recordsHTML;

=======
      
      // Actualizar el contenedor
      this.attendanceRecords.innerHTML = recordsHTML;
      
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    } catch (error) {
      console.error('Error al cargar registros de asistencia:', error);
      this.attendanceRecords.innerHTML = '<p>Error al cargar los registros.</p>';
    }
  }
<<<<<<< HEAD

  // Construye los parámetros de fecha para la query según el filtro seleccionado
  _buildDateQueryParams() {
    if (!this.dateFilter) return '';
    const filterValue = this.dateFilter.value;
    const now = new Date();

    const toISO = (d) => d.toISOString().split('T')[0];

    switch (filterValue) {
      case 'today': {
        const today = toISO(now);
        return `&startDate=${today}&endDate=${today}`;
      }
      case 'week': {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return `&startDate=${toISO(weekStart)}&endDate=${toISO(now)}`;
      }
      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return `&startDate=${toISO(monthStart)}&endDate=${toISO(now)}`;
      }
      case 'all':
      default:
        return '';
    }
  }
  
  async loadDashboardStats() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [usersRes, attRes] = await Promise.all([
        fetch('/api/users?tipoUsuario=empleado&limit=1', { headers: this._authHeaders() }),
        fetch(`/api/attendance/all?startDate=${today}&endDate=${today}&limit=500`, { headers: this._authHeaders() })
      ]);

      const usersResult = await usersRes.json();
      const attResult = await attRes.json();

      const totalEmployees = usersResult.success ? usersResult.pagination.total : 0;

      if (this.activeEmployees) {
        this.activeEmployees.textContent = totalEmployees;
      }

      if (this.todayAttendance) {
        const employeesWithEntry = new Set();
        if (attResult.success) {
          attResult.data.forEach(record => {
            if (record.type === 'entrada') {
              const uid = record.userId?._id || record.userId;
              employeesWithEntry.add(String(uid));
            }
          });
        }
        const percentage = totalEmployees > 0
          ? Math.round((employeesWithEntry.size / totalEmployees) * 100)
          : 0;
        this.todayAttendance.textContent = `${percentage}%`;
      }
    } catch (error) {
      console.error('Error al cargar estadísticas del dashboard:', error);
    }
  }
  
  async searchEmployees() {
    try {
      if (!this.employeeSearch || !this.employeesList) return;

      const searchTerm = this.employeeSearch.value.trim();

=======
  
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (!searchTerm) {
        this.loadEmployeesList();
        return;
      }
<<<<<<< HEAD

      this.employeesList.innerHTML = '<p>Buscando...</p>';

      const response = await fetch(
        `/api/users?tipoUsuario=empleado&search=${encodeURIComponent(searchTerm)}&limit=100`,
        { headers: this._authHeaders() }
      );
      const result = await response.json();

      if (!result.success || result.data.length === 0) {
        this.employeesList.innerHTML = '<p>No se encontraron empleados que coincidan con la búsqueda.</p>';
        return;
      }

      let employeesHTML = '<div class="employees-table"><table>';
      employeesHTML += '<thead><tr><th>Nombre</th><th>Documento</th><th>Cargo</th><th>Acciones</th></tr></thead><tbody>';

      result.data.forEach(employee => {
        employeesHTML += `
          <tr data-id="${employee._id}">
=======
      
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            <td>${employee.nombreCompleto}</td>
            <td>${employee.numeroDocumento}</td>
            <td>${employee.cargo || 'No especificado'}</td>
            <td>
<<<<<<< HEAD
              <button class="view-btn" data-id="${employee._id}">Ver</button>
              <button class="edit-btn" data-id="${employee._id}">Editar</button>
=======
              <button class="view-btn" data-id="${employee.id}">Ver</button>
              <button class="edit-btn" data-id="${employee.id}">Editar</button>
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            </td>
          </tr>
        `;
      });
<<<<<<< HEAD

      employeesHTML += '</tbody></table></div>';
      this.employeesList.innerHTML = employeesHTML;
      this.setupEmployeeActions();
=======
      
      employeesHTML += '</tbody></table></div>';
      
      // Actualizar el contenedor
      this.employeesList.innerHTML = employeesHTML;
      
      // Configurar botones de acción
      this.setupEmployeeActions();
      
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    } catch (error) {
      console.error('Error al buscar empleados:', error);
      this.employeesList.innerHTML = '<p>Error al buscar empleados.</p>';
    }
  }
  
<<<<<<< HEAD
  async exportData() {
    try {
      const dateParams = this._buildDateQueryParams();
      const response = await fetch(`/api/attendance/all?limit=1000${dateParams}`, {
        headers: this._authHeaders()
      });
      const result = await response.json();

      if (!result.success) {
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast('Error al obtener datos para exportar', 'error');
        } else {
          alert('Error al obtener datos para exportar');
        }
        return;
      }

      const filteredRecords = result.data;
      let csv = 'Empleado,Documento,Fecha,Hora,Tipo\n';

      filteredRecords.forEach(record => {
        const nombre = record.userId?.nombreCompleto || 'Desconocido';
        const documento = record.userId?.numeroDocumento || '-';
        const fecha = record.date || new Date(record.timestamp).toLocaleDateString('es-ES');
        const hora = record.time || new Date(record.timestamp).toLocaleTimeString('es-ES');
        csv += `"${nombre}","${documento}","${fecha}","${hora}","${record.type}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
=======
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      const dateStr = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
      link.setAttribute('href', url);
      link.setAttribute('download', `registros_asistencia_${dateStr}.csv`);
      link.style.display = 'none';
<<<<<<< HEAD
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
=======
      
      // Descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Usar NotificationManager si está disponible
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast('Datos exportados correctamente', 'success');
      } else {
        alert('Datos exportados correctamente');
      }
      
    } catch (error) {
      console.error('Error al exportar datos:', error);
<<<<<<< HEAD
       if (typeof NotificationManager !== 'undefined') {
=======
      // Usar NotificationManager si está disponible
      if (typeof NotificationManager !== 'undefined') {
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        NotificationManager.showToast('Error al exportar datos', 'error');
      } else {
        alert('Error al exportar datos');
      }
    }
  }
  
<<<<<<< HEAD
}

=======
  // Los métodos logout() y redirectToLogin() ya están implementados en BaseDashboard
}

// Inicializar el dashboard cuando se cargue la página
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new AdminDashboard();
});
