/**
<<<<<<< HEAD

 * @version 1.0.0
 * @description 
=======
 * IN OUT MANAGER - BASE DASHBOARD MODULE
 * @version 1.0.0
 * @description Clase base para dashboards de empleados y administradores
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */

class BaseDashboard {
  /**
<<<<<<< HEAD
   * @param {string} userRole - Rol del usuario ('empleado' o 'administrador')
   */
  constructor(userRole) {
=======
   * Constructor de la clase base
   * @param {string} userRole - Rol del usuario ('empleado' o 'administrador')
   */
  constructor(userRole) {
    // Definir propiedades básicas
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    this.currentUser = null;
    this.userRole = userRole || 'empleado';
    this.isLoading = false;
    this.clockTimer = null;
<<<<<<< HEAD
    this.init();
  }
  
  init() {
    this.checkUserSession();
    this.setupLogout();
    this.startClock();
=======
    
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (typeof this.initSpecific === 'function') {
      this.initSpecific();
    }
  }
<<<<<<< HEAD
  checkUserSession() {
    try {
      if (typeof SessionManager !== 'undefined') {
=======
  
  /**
   * Verifica la sesión del usuario
   */
  checkUserSession() {
    try {
      // Usar SessionManager si está disponible
      if (typeof SessionManager !== 'undefined') {
        // Verificar si hay sesión y es del tipo correcto
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        if (!SessionManager.validateSession(this.userRole)) {
          SessionManager.redirectToLogin('Acceso no autorizado o sesión expirada');
          return;
        }
<<<<<<< HEAD
        this.currentUser = SessionManager.getCurrentSession();
        this.loadUserData();
        return;
      }
      const sessionData = JSON.parse(localStorage.getItem('currentSession'));
=======
        
        // Obtener datos de la sesión
        this.currentUser = SessionManager.getCurrentSession();
        
        // Cargar datos completos del usuario
        this.loadUserData();
        return;
      }
      
      // Fallback si SessionManager no está disponible
      const sessionData = JSON.parse(localStorage.getItem('currentSession'));
      
      // Verificar si existe sesión
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (!sessionData) {
        this.redirectToLogin('No hay sesión activa');
        return;
      }
<<<<<<< HEAD
=======
      
      // Verificar si el usuario tiene el rol correcto
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (sessionData.tipoUsuario !== this.userRole) {
        this.redirectToLogin(`Acceso no autorizado. Este dashboard es solo para ${this.userRole}s.`);
        return;
      }
<<<<<<< HEAD
      this.currentUser = sessionData;
      this.loadUserData();
=======
      
      // Guardar datos de sesión
      this.currentUser = sessionData;
      
      // Cargar datos completos del usuario
      this.loadUserData();
      
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      this.redirectToLogin('Error de sesión');
    }
  }
<<<<<<< HEAD

  async loadUserData() {
    try {
=======
  
  /**
   * Carga los datos completos del usuario
   */
  async loadUserData() {
    try {
      // Verificar si hay token de autenticación
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        console.error('No hay token de autenticación');
        this.redirectToLogin('Sesión expirada');
        return;
      }
<<<<<<< HEAD
      if (typeof EnhancedApiClient !== 'undefined') {
        try {
          const apiClient = new EnhancedApiClient();
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            this.currentUser = response.data;
            console.log('Datos de usuario cargados desde backend:', this.currentUser);
=======

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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
            this.updateUserInterface();
            return;
          } else {
            console.error('Error al obtener datos del usuario:', response.message);
<<<<<<< HEAD
   
          }
        } catch (apiError) {
          console.error('Error de API al cargar usuario:', apiError);
        }
      }
      
      if (typeof SessionManager !== 'undefined') {
        const userData = SessionManager.getFullUserData();
=======
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
        
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        if (!userData) {
          console.error('Datos de usuario no encontrados');
          return;
        }
        
<<<<<<< HEAD
        this.currentUser = userData;
=======
        // Actualizar los datos de sesión con los datos completos
        this.currentUser = userData;
        
        // Actualizar la interfaz con los datos del usuario
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        this.updateUserInterface();
        return;
      }
      
<<<<<<< HEAD
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userData = users.find(user => user.id === this.currentUser.id);
=======
      // Fallback final: usar localStorage
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Buscar el usuario actual por ID
      const userData = users.find(user => user.id === this.currentUser.id);
      
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (!userData) {
        console.error('Datos de usuario no encontrados');
        return;
      }
      
<<<<<<< HEAD
      this.currentUser = userData;
=======
      // Actualizar los datos de sesión con los datos completos
      this.currentUser = userData;
      
      // Actualizar la interfaz con los datos del usuario
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      this.updateUserInterface();
      
    } catch (error) {
      console.error('Error al cargar datos de usuario:', error);
    }
  }
  
<<<<<<< HEAD
  
  updateUserInterface() {
    
    console.warn('Método updateUserInterface no implementado');
  }
  
=======
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
  }
  
<<<<<<< HEAD
  
=======
  /**
   * Inicia el reloj en tiempo real
   */
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  startClock() {
    const currentTime = document.getElementById('currentTime');
    const currentDate = document.getElementById('currentDate');
    
    if (!currentTime && !currentDate) return;
<<<<<<< HEAD
  
    const updateClock = () => {
      const now = new Date();
=======
    
    // Función para actualizar la hora y fecha
    const updateClock = () => {
      const now = new Date();
      
      // Actualizar hora
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (currentTime) {
        currentTime.textContent = now.toLocaleTimeString('es-ES');
      }
      
<<<<<<< HEAD
=======
      // Actualizar fecha
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (currentDate) {
        currentDate.textContent = now.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    };
    
<<<<<<< HEAD
    updateClock();
    
    this.clockTimer = setInterval(updateClock, 1000);
  }

  logout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      if (typeof SessionManager !== 'undefined') {
        SessionManager.endSession();
        if (this.clockTimer) {
          clearInterval(this.clockTimer);
        }
        SessionManager.redirectToLogin();
        return;
      }
      localStorage.removeItem('currentSession');
      if (this.clockTimer) {
        clearInterval(this.clockTimer);
      }
      if (typeof PathManager !== 'undefined') {
        PathManager.navigateToLogin();
        return;
      }
=======
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      window.location.href = '../../components/auth/login.html';
    }
  }
  
  /**
<<<<<<< HEAD
   * @param {string} message 
   */
  redirectToLogin(message) {
=======
   * Redirecciona al usuario a la página de login
   * @param {string} message - Mensaje opcional para mostrar
   */
  redirectToLogin(message) {
    // Usar SessionManager si está disponible
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (typeof SessionManager !== 'undefined') {
      SessionManager.redirectToLogin(message);
      return;
    }
<<<<<<< HEAD
    if (typeof PathManager !== 'undefined') {
      PathManager.navigateToLogin(message);
      return;
    }
=======
    
    // Fallback si SessionManager no está disponible
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    alert(message || 'Debe iniciar sesión para acceder a esta página');
    window.location.href = '../../components/auth/login.html';
  }
}
<<<<<<< HEAD
if (typeof window !== 'undefined') {
  window.BaseDashboard = BaseDashboard;
}

=======

// Exportar clase para uso en otros módulos
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseDashboard;
}