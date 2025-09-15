/**
 * IN OUT MANAGER - PATH UTILITY MODULE
 * @version 1.0.0
 * @description Módulo para manejar rutas de navegación entre páginas
 */

class PathManager {
  /**
   * Detecta el nivel de profundidad actual en la estructura de carpetas
   * para generar rutas relativas correctas
   * @returns {string} - Prefijo de ruta relativa (e.g., '../', '../../', etc.)
   */
  static getCurrentPathPrefix() {
    const currentPath = window.location.pathname;
    
    // Esquema de detección de rutas
    if (currentPath.includes('/proyectopages/')) {
      return './';
    } else if (currentPath.includes('/components/auth/')) {
      return '../../';
    } else if (currentPath.includes('/components/admin/') || currentPath.includes('/components/empleado/')) {
      return '../../';
    } else {
      // Fallback para otras ubicaciones
      return '../';
    }
  }
  
  /**
   * Genera una ruta relativa para un archivo en la carpeta components
   * @param {string} componentPath - Ruta relativa desde components (e.g., 'auth/login.html')
   * @returns {string} - Ruta relativa completa
   */
  static getComponentPath(componentPath) {
    const prefix = this.getCurrentPathPrefix();
    return `${prefix}components/${componentPath}`;
  }
  
  /**
   * Genera una ruta relativa para un archivo en la carpeta assets
   * @param {string} assetPath - Ruta relativa desde assets (e.g., 'js/script.js')
   * @returns {string} - Ruta relativa completa
   */
  static getAssetPath(assetPath) {
    const prefix = this.getCurrentPathPrefix();
    return `${prefix}assets/${assetPath}`;
  }
  
  /**
   * Genera una ruta relativa para una página principal
   * @param {string} pagePath - Ruta relativa desde proyectopages (e.g., 'index.html')
   * @returns {string} - Ruta relativa completa
   */
  static getPagePath(pagePath) {
    const prefix = this.getCurrentPathPrefix();
    return `${prefix}proyectopages/${pagePath}`;
  }
  
  /**
   * Redirige al usuario al dashboard correspondiente según su rol
   * @param {string} userType - Tipo de usuario ('empleado' o 'administrador')
   */
  static navigateToDashboard(userType) {
    const dashboardPaths = {
      empleado: 'empleado/dashboard-empleado.html',
      administrador: 'admin/dashboard-admin.html'
    };
    
    const path = dashboardPaths[userType] || dashboardPaths.empleado;
    window.location.href = this.getComponentPath(path);
  }
  
  /**
   * Redirige al usuario a la página de login
   * @param {string} message - Mensaje opcional para mostrar
   */
  static navigateToLogin(message = null) {
    if (message) {
      alert(message);
    }
    window.location.href = this.getComponentPath('auth/login.html');
  }
  
  /**
   * Redirige al usuario a la página de registro
   */
  static navigateToRegister() {
    window.location.href = this.getComponentPath('auth/registro.html');
  }
  
  /**
   * Redirige al usuario a la página principal
   */
  static navigateToHome() {
    window.location.href = this.getPagePath('index.html');
  }
}

// Exportar clase para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PathManager;
}