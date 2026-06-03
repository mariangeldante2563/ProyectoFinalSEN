/**
<<<<<<< HEAD
=======
 * IN OUT MANAGER - SESSION MANAGER MODULE
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 * @version 2.0.0
 * @description Módulo para centralizar la gestión de sesiones en la aplicación
 */

<<<<<<< HEAD
=======
// Importar PathManager para navegación
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
import PathManager from './path-manager.js';

class SessionManager {
  /**
<<<<<<< HEAD
   * @param {Object} userData 
   * @returns {Object} 
=======
   * Crea y guarda una nueva sesión de usuario
   * @param {Object} userData - Los datos del usuario a guardar en la sesión
   * @returns {Object} - Los datos de sesión guardados
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  static createSession(userData) {
    if (!userData || !userData.id || !userData.tipoUsuario) {
      console.error('Datos de usuario inválidos para crear sesión');
      return null;
    }
<<<<<<< HEAD

=======
    
    // Crear objeto de sesión con datos esenciales
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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
<<<<<<< HEAD

=======
    
    // Si SecurityManager está disponible, generar token JWT
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (typeof SecurityManager !== 'undefined') {
      sessionData.token = SecurityManager.generateToken({
        userId: userData.id,
        tipoUsuario: userData.tipoUsuario,
        sessionId: sessionData.sessionId
      });
    }
<<<<<<< HEAD

    localStorage.setItem('currentSession', JSON.stringify(sessionData));
=======
    
    // Guardar en localStorage
    localStorage.setItem('currentSession', JSON.stringify(sessionData));
    
    // Registrar inicio de sesión en historial (opcional)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    this.logSessionEvent('login');
    
    return sessionData;
  }
  
  /**
<<<<<<< HEAD
   * @returns {Object|null} 
=======
   * Obtiene los datos de la sesión actual
   * @returns {Object|null} - Los datos de sesión o null si no hay sesión
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
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
<<<<<<< HEAD
   * @param {string|null} userType 
   * @returns {boolean} 
   */
  static validateSession(userType = null) {
    const session = this.getCurrentSession();
    if (!session) return false;
    if (userType && session.tipoUsuario !== userType) return false;
    if (session.expiresAt) {
      const expirationTime = new Date(session.expiresAt).getTime();
      if (Date.now() > expirationTime) {

=======
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        this.endSession();
        return false;
      }
      
<<<<<<< HEAD
=======
      // Si queda menos de 10 minutos, renovar la sesión
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      if (expirationTime - Date.now() < 600000) {
        this.updateSession({
          expiresAt: new Date(Date.now() + 3600000).toISOString()
        });
      }
    }
    
<<<<<<< HEAD

=======
    // Verificar token JWT si está disponible
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (typeof SecurityManager !== 'undefined' && session.token) {
      const payload = SecurityManager.verifyToken(session.token);
      
      if (!payload || payload.userId !== session.id) {
<<<<<<< HEAD

=======
        // Token inválido
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        this.endSession();
        return false;
      }
    }
<<<<<<< HEAD

=======
    
    // Verificar que el User-Agent coincida (previene session hijacking)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (session.userAgent && session.userAgent !== navigator.userAgent) {
      console.warn('Posible intento de secuestro de sesión detectado');
      this.endSession();
      return false;
    }
    
    return true;
  }
  
  /**
<<<<<<< HEAD
   * @returns {boolean} 
   */
  static endSession() {
    this.logSessionEvent('logout');
=======
   * Cierra la sesión actual
   * @returns {boolean} - true si se cerró correctamente
   */
  static endSession() {
    // Registrar cierre de sesión en historial (opcional)
    this.logSessionEvent('logout');
    
    // Eliminar datos de sesión
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    localStorage.removeItem('currentSession');
    return true;
  }

  /**
<<<<<<< HEAD
   * @param {string} message
   */
  static logout(message = null) {
    console.log(' SessionManager: Cerrando sesión...');
    
    this.endSession();

    PathManager.navigateToLogin(message || 'Sesión cerrada correctamente.');
  }

  /**
   * @returns {Object|null} 
=======
   * Cierra la sesión y redirige al login usando PathManager
   * @param {string} message - Mensaje opcional para mostrar
   */
  static logout(message = null) {
    console.log('🚪 SessionManager: Cerrando sesión...');
    
    // Cerrar sesión
    this.endSession();
    
    // Redirigir usando PathManager
    if (typeof PathManager !== 'undefined' && PathManager.navigateToLogin) {
      PathManager.navigateToLogin(message || 'Sesión cerrada correctamente.');
    } else {
      // Fallback si PathManager no está disponible
      window.location.href = '../auth/login.html';
    }
  }

  /**
   * Obtiene los datos del usuario actual de forma simplificada
   * @returns {Object|null} - Los datos del usuario o null si no hay sesión
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  static getUserData() {
    const session = this.getCurrentSession();
    if (!session) return null;
    
    return {
      id: session.id,
      nombre: session.nombreCompleto,
      correo: session.correoElectronico,
      tipo: session.tipoUsuario,
      lastLogin: session.lastLogin
    };
  }

  /**
<<<<<<< HEAD
=======
   * Verifica si el usuario tiene permisos de administrador
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   * @returns {boolean} - true si es administrador
   */
  static isAdmin() {
    const userData = this.getUserData();
    return userData && userData.tipo === 'administrador';
  }

  /**
<<<<<<< HEAD
=======
   * Verifica si el usuario está autenticado
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   * @returns {boolean} - true si está autenticado
   */
  static isAuthenticated() {
    return this.getCurrentSession() !== null;
  }
  
  /**
<<<<<<< HEAD
   * @param {Object} newData 
   * @returns {Object|null} 
=======
   * Actualiza los datos de la sesión actual
   * @param {Object} newData - Los nuevos datos a actualizar
   * @returns {Object|null} - Los datos actualizados o null si no hay sesión
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  static updateSession(newData) {
    const currentSession = this.getCurrentSession();
    if (!currentSession) return null;
<<<<<<< HEAD

=======
    
    // Actualizar con nuevos datos
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const updatedSession = { ...currentSession, ...newData };
    localStorage.setItem('currentSession', JSON.stringify(updatedSession));
    
    return updatedSession;
  }
  
  /**
<<<<<<< HEAD
=======
   * Obtiene datos completos del usuario actual desde registeredUsers
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   * @returns {Object|null} - Datos completos del usuario o null si no se encuentra
   */
  static getFullUserData() {
    const session = this.getCurrentSession();
    if (!session) return null;
    
    try {
<<<<<<< HEAD
=======
      // Buscar usuario en registeredUsers
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      return users.find(user => user.id === session.id) || null;
    } catch (error) {
      console.error('Error al obtener datos completos del usuario:', error);
      return null;
    }
  }
  
  /**
<<<<<<< HEAD

   * @param {string} message 
   */
  static redirectToLogin(message = null) {
    PathManager.navigateToLogin(message);
  }
  
  /**
   * @param {string} userType 
   */
  static redirectToDashboard(userType) {
    console.log('SessionManager: Redirigiendo usuario tipo:', userType);

    PathManager.navigateToDashboard(userType);
  }
  
  
  /**

   * @private
   * @returns {string} 
=======
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  static generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  /**
<<<<<<< HEAD
   * @private
   * @param {string} eventType 
=======
   * Registra eventos de sesión en historial (opcional)
   * @private
   * @param {string} eventType - Tipo de evento ('login' o 'logout')
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  static logSessionEvent(eventType) {
    const session = this.getCurrentSession();
    if (!session) return;
<<<<<<< HEAD

    const sessionHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]');

=======
    
    // Obtener historial existente
    const sessionHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
    
    // Agregar nuevo evento
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    sessionHistory.push({
      userId: session.id,
      userType: session.tipoUsuario,
      eventType: eventType,
      timestamp: new Date().toISOString()
    });
<<<<<<< HEAD

=======
    
    // Guardar historial actualizado (limitado a últimos 100 eventos)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    localStorage.setItem('sessionHistory', JSON.stringify(
      sessionHistory.slice(-100)
    ));
  }
}

<<<<<<< HEAD
if (typeof window !== 'undefined') {
  window.SessionManager = SessionManager;
}

export default SessionManager;
=======
// Hacer SessionManager disponible globalmente
if (typeof window !== 'undefined') {
  window.SessionManager = SessionManager;
}
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
