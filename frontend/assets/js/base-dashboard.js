/**
 * IN OUT MANAGER - BASE DASHBOARD MODULE
 * @version 1.0.0
 * @description Clase base para dashboards de empleados y administradores
 */

class BaseDashboard {
  /**
   * Constructor de la clase base
   * @param {string} userRole - Rol del usuario ('empleado' o 'administrador')
   */
  constructor(userRole) {
    // Definir propiedades básicas
    this.currentUser = null;
    this.userRole = userRole || 'empleado';
    this.isLoading = false;
    this.clockTimer = null;
    
    // Inicializar el dashboard
    this.init();
  }
  
  /**
   * Inicializa el dashboard
   */
  init() {
    // Verificar sesión de usuario
    this.checkUserSession();
    
    // Configurar logout
    this.setupLogout();
    
    // Iniciar reloj si está disponible
    this.startClock();
    
    // Método específico a implementar por clases hijas
    if (typeof this.initSpecific === 'function') {
      this.initSpecific();
    }
  }
  
  /**
   * Verifica la sesión del usuario
   */
  checkUserSession() {
    try {
      // Usar SessionManager si está disponible
      if (typeof SessionManager !== 'undefined') {
        // Verificar si hay sesión y es del tipo correcto
        if (!SessionManager.validateSession(this.userRole)) {
          SessionManager.redirectToLogin('Acceso no autorizado o sesión expirada');
          return;
        }
        
        // Obtener datos de la sesión
        this.currentUser = SessionManager.getCurrentSession();
        
        // Cargar datos completos del usuario
        this.loadUserData();
        return;
      }
      
      // Fallback si SessionManager no está disponible
      const sessionData = JSON.parse(localStorage.getItem('currentSession'));
      
      // Verificar si existe sesión
      if (!sessionData) {
        this.redirectToLogin('No hay sesión activa');
        return;
      }
      
      // Verificar si el usuario tiene el rol correcto
      if (sessionData.tipoUsuario !== this.userRole) {
        this.redirectToLogin(`Acceso no autorizado. Este dashboard es solo para ${this.userRole}s.`);
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
  
  /**
   * Carga los datos completos del usuario
   */
  async loadUserData() {
    try {
      // Verificar si hay token de autenticación
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        console.error('No hay token de autenticación');
        this.redirectToLogin('Sesión expirada');
        return;
      }

      // Usar EnhancedApiClient si está disponible para obtener datos del backend
      if (typeof EnhancedApiClient !== 'undefined') {
        try {
          const apiClient = new EnhancedApiClient();
          
          // Obtener datos del usuario actual desde el backend
          const response = await apiClient.getCurrentUser();
          
          if (response.success && response.data) {
            this.currentUser = response.data;
            console.log('Datos de usuario cargados desde backend:', this.currentUser);
            
            // Actualizar la interfaz con los datos del usuario
            this.updateUserInterface();
            return;
          } else {
            console.error('Error al obtener datos del usuario:', response.message);
            // Continuar con fallback
          }
        } catch (apiError) {
          console.error('Error de API al cargar usuario:', apiError);
          // Continuar con fallback
        }
      }
      
      // Fallback: usar SessionManager si está disponible
      if (typeof SessionManager !== 'undefined') {
        const userData = SessionManager.getFullUserData();
        
        if (!userData) {
          console.error('Datos de usuario no encontrados');
          return;
        }
        
        // Actualizar los datos de sesión con los datos completos
        this.currentUser = userData;
        
        // Actualizar la interfaz con los datos del usuario
        this.updateUserInterface();
        return;
      }
      
      // Fallback final: usar localStorage
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
  
  /**
   * Actualiza la interfaz con datos del usuario
   * Debe ser implementado por las clases hijas
   */
  updateUserInterface() {
    // Método a sobreescribir por las clases hijas
    console.warn('Método updateUserInterface no implementado');
  }
  
  /**
   * Configura el botón de logout
   */
  setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
  }
  
  /**
   * Inicia el reloj en tiempo real
   */
  startClock() {
    const currentTime = document.getElementById('currentTime');
    const currentDate = document.getElementById('currentDate');
    
    if (!currentTime && !currentDate) return;
    
    // Función para actualizar la hora y fecha
    const updateClock = () => {
      const now = new Date();
      
      // Actualizar hora
      if (currentTime) {
        currentTime.textContent = now.toLocaleTimeString('es-ES');
      }
      
      // Actualizar fecha
      if (currentDate) {
        currentDate.textContent = now.toLocaleDateString('es-ES', {
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
  
  /**
   * Cierra la sesión del usuario
   */
  logout() {
    // Confirmar cierre de sesión
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      // Usar SessionManager si está disponible
      if (typeof SessionManager !== 'undefined') {
        // Limpiar sesión
        SessionManager.endSession();
        
        // Detener el reloj
        if (this.clockTimer) {
          clearInterval(this.clockTimer);
        }
        
        // Redirigir usando SessionManager
        SessionManager.redirectToLogin();
        return;
      }
      
      // Fallback si SessionManager no está disponible
      localStorage.removeItem('currentSession');
      
      // Detener el reloj
      if (this.clockTimer) {
        clearInterval(this.clockTimer);
      }
      
      // Redirigir a la página de login
      window.location.href = '../../components/auth/login.html';
    }
  }
  
  /**
   * Redirecciona al usuario a la página de login
   * @param {string} message - Mensaje opcional para mostrar
   */
  redirectToLogin(message) {
    // Usar SessionManager si está disponible
    if (typeof SessionManager !== 'undefined') {
      SessionManager.redirectToLogin(message);
      return;
    }
    
    // Fallback si SessionManager no está disponible
    alert(message || 'Debe iniciar sesión para acceder a esta página');
    window.location.href = '../../components/auth/login.html';
  }
}

// Exportar clase para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseDashboard;
}