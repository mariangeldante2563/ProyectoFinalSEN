
// FUNCIONALIDAD DEL DASHBOARD DE EMPLEADO


class EmployeeDashboard {
  constructor() {
    this.currentUser = null;
    this.clockTimer = null;
    
    // Referencias a elementos del DOM
    this.employeeName = document.getElementById('employeeName');
    this.currentTime = document.getElementById('currentTime');
    this.currentDate = document.getElementById('currentDate');
    this.entryBtn = document.getElementById('entryBtn');
    this.exitBtn = document.getElementById('exitBtn');
    this.employeeRecords = document.getElementById('employeeRecords');
    this.profileName = document.getElementById('profileName');
    this.profileDoc = document.getElementById('profileDoc');
    this.profilePosition = document.getElementById('profilePosition');
    this.profileSchedule = document.getElementById('profileSchedule');
    this.profileEmail = document.getElementById('profileEmail');
    this.logoutBtn = document.getElementById('logoutBtn');
    
    this.init();
  }
  
  init() {
    // Verificar sesión de usuario
    this.checkUserSession();
    
    // Iniciar reloj en tiempo real
    this.startClock();
    
    // Configurar botones de entrada/salida
    this.setupActionButtons();
    
    // Cargar registros del empleado
    this.loadEmployeeRecords();
    
    // Configurar botón de logout
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => this.logout());
    }
  }
  
  checkUserSession() {
    try {
      // Obtener datos de sesión
      const sessionData = JSON.parse(localStorage.getItem('currentSession'));
      
      // Verificar si existe sesión
      if (!sessionData) {
        // Redirigir a la página de login
        this.redirectToLogin('No hay sesión activa');
        return;
      }
      
      // Verificar si el usuario es empleado
      if (sessionData.tipoUsuario !== 'empleado') {
        this.redirectToLogin('Acceso no autorizado. Este dashboard es solo para empleados.');
        return;
      }
      
      // Guardar datos de sesión
      this.currentUser = sessionData;
      
      // Cargar datos completos del usuario
      this.loadUserData();
      
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      this.redirectToLogin('Error de sesión');
    }
  }
  
  loadUserData() {
    try {
      // Obtener todos los usuarios registrados
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Buscar el usuario actual por ID
      const userData = users.find(user => user.id === this.currentUser.id);
      
      if (!userData) {
        console.error('Datos de usuario no encontrados');
        return;
      }
      
      // Actualizar los datos de sesión con los datos completos
      this.currentUser = userData;
      
      // Actualizar la interfaz con los datos del usuario
      this.updateUserInterface();
      
    } catch (error) {
      console.error('Error al cargar datos de usuario:', error);
    }
  }
  
  updateUserInterface() {
    // Actualizar nombre del empleado
    if (this.employeeName) {
      this.employeeName.textContent = this.currentUser.nombreCompleto;
    }
    
    // Actualizar perfil
    if (this.profileName) this.profileName.textContent = this.currentUser.nombreCompleto;
    if (this.profileDoc) this.profileDoc.textContent = this.currentUser.numeroDocumento;
    if (this.profilePosition) this.profilePosition.textContent = this.currentUser.cargo || 'No especificado';
    if (this.profileSchedule) this.profileSchedule.textContent = this.currentUser.horarioAsignado || 'No especificado';
    if (this.profileEmail) this.profileEmail.textContent = this.currentUser.correoElectronico;
  }
  
  startClock() {
    // Actualizar la hora actual
    const updateClock = () => {
      const now = new Date();
      
      // Actualizar hora
      if (this.currentTime) {
        this.currentTime.textContent = now.toLocaleTimeString('es-ES');
      }
      
      // Actualizar fecha
      if (this.currentDate) {
        this.currentDate.textContent = now.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    };
    
    // Actualizar inmediatamente
    updateClock();
    
    // Actualizar cada segundo
    this.clockTimer = setInterval(updateClock, 1000);
  }
  
  setupActionButtons() {
    // Botón de entrada
    if (this.entryBtn) {
      this.entryBtn.addEventListener('click', () => this.registerAttendance('entrada'));
    }
    
    // Botón de salida
    if (this.exitBtn) {
      this.exitBtn.addEventListener('click', () => this.registerAttendance('salida'));
    }
  }
  
  registerAttendance(type) {
    try {
      // Crear registro de asistencia
      const now = new Date();
      const attendanceRecord = {
        id: `att_${Date.now()}`,
        userId: this.currentUser.id,
        type: type,
        timestamp: now.toISOString(),
        date: now.toLocaleDateString('es-ES'),
        time: now.toLocaleTimeString('es-ES')
      };
      
      // Verificar si ya existe un registro del mismo tipo para hoy
      const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      const today = new Date().toLocaleDateString('es-ES');
      
      const alreadyRegisteredToday = attendanceRecords.some(record => 
        record.userId === this.currentUser.id && 
        record.type === type && 
        new Date(record.timestamp).toLocaleDateString('es-ES') === today
      );
      
      if (alreadyRegisteredToday) {
        alert(`Ya ha registrado su ${type} de hoy.`);
        return;
      }
      
      // Guardar registro
      attendanceRecords.push(attendanceRecord);
      localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
      
      // Actualizar lista de registros
      this.loadEmployeeRecords();
      
      // Mostrar mensaje de confirmación
      alert(`Registro de ${type} exitoso a las ${attendanceRecord.time}.`);
      
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      alert('Error al registrar la asistencia. Por favor, intente nuevamente.');
    }
  }
  
  loadEmployeeRecords() {
    try {
      if (!this.employeeRecords) return;
      
      // Obtener registros de asistencia
      const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      
      // Filtrar registros del empleado actual
      const employeeRecords = attendanceRecords.filter(
        record => record.userId === this.currentUser.id
      );
      
      // Ordenar por fecha (más recientes primero)
      employeeRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Mostrar registros
      if (employeeRecords.length === 0) {
        this.employeeRecords.innerHTML = '<p>No hay registros disponibles.</p>';
        return;
      }
      
      // Generar HTML de registros
      let recordsHTML = '<div class="records-table"><table>';
      recordsHTML += '<thead><tr><th>Fecha</th><th>Hora</th><th>Tipo</th></tr></thead><tbody>';
      
      employeeRecords.forEach(record => {
        const typeClass = record.type === 'entrada' ? 'entry-record' : 'exit-record';
        const typeIcon = record.type === 'entrada' ? '⬆️' : '⬇️';
        
        recordsHTML += `
          <tr class="${typeClass}">
            <td>${record.date}</td>
            <td>${record.time}</td>
            <td>${typeIcon} ${record.type.charAt(0).toUpperCase() + record.type.slice(1)}</td>
          </tr>
        `;
      });
      
      recordsHTML += '</tbody></table></div>';
      
      // Actualizar el contenedor
      this.employeeRecords.innerHTML = recordsHTML;
      
    } catch (error) {
      console.error('Error al cargar registros de empleado:', error);
      this.employeeRecords.innerHTML = '<p>Error al cargar los registros.</p>';
    }
  }
  
  logout() {
    // Confirmar cierre de sesión
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      // Limpiar datos de sesión
      localStorage.removeItem('currentSession');
      
      // Detener el reloj
      if (this.clockTimer) {
        clearInterval(this.clockTimer);
      }
      
      // Redirigir a la página de login
      window.location.href = '../../components/auth/login.html';
    }
  }
  
  redirectToLogin(message) {
    alert(message || 'Debe iniciar sesión para acceder a esta página');
    window.location.href = '../../components/auth/login.html';
  }
}

// Inicializar el dashboard cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new EmployeeDashboard();
});
