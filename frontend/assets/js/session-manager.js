/**
 * IN OUT MANAGER - SESSION MANAGER MODULE
 * @version 1.0.0
 * @description Módulo para centralizar la gestión de sesiones en la aplicación
 */

class SessionManager {
  /**
   * Crea y guarda una nueva sesión de usuario
   * @param {Object} userData - Los datos del usuario a guardar en la sesión
   * @returns {Object} - Los datos de sesión guardados
   */
  static createSession(userData) {
    if (!userData || !userData.id || !userData.tipoUsuario) {
      console.error('Datos de usuario inválidos para crear sesión');
      return null;
    }
    
    // Crear objeto de sesión con datos esenciales
    const sessionData = {
      id: userData.id,
      nombreCompleto: userData.nombreCompleto,
      correoElectronico: userData.correoElectronico,
      tipoUsuario: userData.tipoUsuario,
      lastLogin: new Date().toISOString(),
      sessionId: this.generateSessionId(),
      userAgent: navigator.userAgent,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hora de expiración
    };
    
    // Si SecurityManager está disponible, generar token JWT
    if (typeof SecurityManager !== 'undefined') {
      sessionData.token = SecurityManager.generateToken({
        userId: userData.id,
        tipoUsuario: userData.tipoUsuario,
        sessionId: sessionData.sessionId
      });
    }
    
    // Guardar en localStorage
    localStorage.setItem('currentSession', JSON.stringify(sessionData));
    
    // Registrar inicio de sesión en historial (opcional)
    this.logSessionEvent('login');
    
    return sessionData;
  }
  
  /**
   * Obtiene los datos de la sesión actual
   * @returns {Object|null} - Los datos de sesión o null si no hay sesión
   */
  static getCurrentSession() {
    try {
      const sessionData = localStorage.getItem('currentSession');
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error al obtener la sesión actual:', error);
      return null;
    }
  }
  
  /**
   * Verifica si hay una sesión activa y del tipo especificado
   * @param {string|null} userType - Tipo de usuario esperado ('empleado', 'administrador', o null para cualquier tipo)
   * @returns {boolean} - true si hay una sesión válida, false en caso contrario
   */
  static validateSession(userType = null) {
    const session = this.getCurrentSession();
    
    // Verificar existencia de sesión
    if (!session) return false;
    
    // Si se especifica un tipo de usuario, verificarlo
    if (userType && session.tipoUsuario !== userType) return false;
    
    // Verificar expiración si está disponible
    if (session.expiresAt) {
      const expirationTime = new Date(session.expiresAt).getTime();
      if (Date.now() > expirationTime) {
        // La sesión ha expirado
        this.endSession();
        return false;
      }
      
      // Si queda menos de 10 minutos, renovar la sesión
      if (expirationTime - Date.now() < 600000) {
        this.updateSession({
          expiresAt: new Date(Date.now() + 3600000).toISOString()
        });
      }
    }
    
    // Verificar token JWT si está disponible
    if (typeof SecurityManager !== 'undefined' && session.token) {
      const payload = SecurityManager.verifyToken(session.token);
      
      if (!payload || payload.userId !== session.id) {
        // Token inválido
        this.endSession();
        return false;
      }
    }
    
    // Verificar que el User-Agent coincida (previene session hijacking)
    if (session.userAgent && session.userAgent !== navigator.userAgent) {
      console.warn('Posible intento de secuestro de sesión detectado');
      this.endSession();
      return false;
    }
    
    return true;
  }
  
  /**
   * Cierra la sesión actual
   * @returns {boolean} - true si se cerró correctamente
   */
  static endSession() {
    // Registrar cierre de sesión en historial (opcional)
    this.logSessionEvent('logout');
    
    // Eliminar datos de sesión
    localStorage.removeItem('currentSession');
    return true;
  }
  
  /**
   * Actualiza los datos de la sesión actual
   * @param {Object} newData - Los nuevos datos a actualizar
   * @returns {Object|null} - Los datos actualizados o null si no hay sesión
   */
  static updateSession(newData) {
    const currentSession = this.getCurrentSession();
    if (!currentSession) return null;
    
    // Actualizar con nuevos datos
    const updatedSession = { ...currentSession, ...newData };
    localStorage.setItem('currentSession', JSON.stringify(updatedSession));
    
    return updatedSession;
  }
  
  /**
   * Obtiene datos completos del usuario actual desde registeredUsers
   * @returns {Object|null} - Datos completos del usuario o null si no se encuentra
   */
  static getFullUserData() {
    const session = this.getCurrentSession();
    if (!session) return null;
    
    try {
      // Buscar usuario en registeredUsers
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      return users.find(user => user.id === session.id) || null;
    } catch (error) {
      console.error('Error al obtener datos completos del usuario:', error);
      return null;
    }
  }
  
  /**
   * Redirecciona al usuario a la página de login
   * @param {string} message - Mensaje opcional para mostrar
   */
  static redirectToLogin(message = null) {
    // Usar PathManager si está disponible
    if (typeof PathManager !== 'undefined') {
      PathManager.navigateToLogin(message);
      return;
    }
    
    // Fallback si PathManager no está disponible
    if (message) {
      alert(message);
    }
    window.location.href = '../../components/auth/login.html';
  }
  
  /**
   * Redirecciona al dashboard según el tipo de usuario
   * @param {string} userType - Tipo de usuario ('empleado' o 'administrador')
   */
  static redirectToDashboard(userType) {
    console.log('SessionManager: Redirigiendo usuario tipo:', userType);
    
    // Usar PathManager si está disponible
    if (typeof PathManager !== 'undefined') {
      PathManager.navigateToDashboard(userType);
      return;
    }
    
    // Fallback si PathManager no está disponible
    const dashboardUrls = {
      empleado: '../empleado/dashboard-empleado.html',
      administrador: '../admin/dashboard-admin.html'
    };
    
    const url = dashboardUrls[userType] || dashboardUrls.empleado;
    console.log('SessionManager: Navegando a URL:', url);
    window.location.href = url;
  }
  
  // Métodos auxiliares
  
  /**
   * Genera un ID único para la sesión
   * @private
   * @returns {string} - ID de sesión
   */
  static generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  /**
   * Registra eventos de sesión en historial (opcional)
   * @private
   * @param {string} eventType - Tipo de evento ('login' o 'logout')
   */
  static logSessionEvent(eventType) {
    const session = this.getCurrentSession();
    if (!session) return;
    
    // Obtener historial existente
    const sessionHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
    
    // Agregar nuevo evento
    sessionHistory.push({
      userId: session.id,
      userType: session.tipoUsuario,
      eventType: eventType,
      timestamp: new Date().toISOString()
    });
    
    // Guardar historial actualizado (limitado a últimos 100 eventos)
    localStorage.setItem('sessionHistory', JSON.stringify(
      sessionHistory.slice(-100)
    ));
  }
}

// Exportar clase para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionManager;
}