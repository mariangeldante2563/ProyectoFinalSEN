/**
<<<<<<< HEAD
 * @version 2.0.0
 * @description 
 */

class PathManager {
  static getKnownRootFolders() {
    return ['assets', 'components', 'proyectopages'];
  }

  static getRouteDefinitions() {
    return {
      home: { type: 'page', path: 'index.html' },
      login: { type: 'component', path: 'auth/login.html' },
      register: { type: 'component', path: 'auth/registro.html' },
      recovery: { type: 'component', path: 'auth/recuperar-password.html' },
      'dashboard-empleado': { type: 'component', path: 'empleado/dashboard-empleado.html' },
      'dashboard-admin': { type: 'component', path: 'admin/dashboard-admin.html' }
    };
  }

  /**
   * @returns {string} 
   */
  static getBaseUrl() {
    const origin = window.location.origin;
    const pathname = window.location.pathname.replace(/\\/g, '/');
    const segments = pathname.split('/').filter(Boolean);
    const knownRootFolders = this.getKnownRootFolders();
    const rootFolderIndex = segments.findIndex(segment => {
      return knownRootFolders.includes(segment.toLowerCase());
    });

    if (rootFolderIndex === -1) {
      return `${origin}/`;
    }

    const baseSegments = segments.slice(0, rootFolderIndex);
    const basePath = baseSegments.length > 0 ? `/${baseSegments.join('/')}/` : '/';
    return `${origin}${basePath}`;
  }

  /**
   * @returns {string} 
=======
 * IN OUT MANAGER - PATH UTILITY MODULE
 * @version 2.0.0
 * @description Módulo avanzado para manejar rutas de navegación entre páginas
 */

class PathManager {
  /**
   * Obtiene la base URL del proyecto
   * @returns {string} - URL base del proyecto
   */
  static getBaseUrl() {
    const protocol = window.location.protocol;
    const host = window.location.host;
    
    // En desarrollo con Vite, la raíz es directamente el host
    // No hay prefijo /frontend/ en la URL
    return `${protocol}//${host}/`;
  }

  /**
   * Detecta el nivel de profundidad actual en la estructura de carpetas
   * para generar rutas relativas correctas
   * @returns {string} - Prefijo de ruta relativa (e.g., '../', '../../', etc.)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  static getCurrentPathPrefix() {
    const currentPath = window.location.pathname.toLowerCase();
    
<<<<<<< HEAD
    console.log(' PathManager: Detectando ruta actual:', currentPath);
    const baseUrl = this.getBaseUrl();
    console.log(' PathManager: Base URL detectada:', baseUrl);
    return baseUrl;
  }

  static buildUrl(type, relativePath, section = null) {
    const normalizedPath = relativePath.replace(/^\/+/, '');
    let fullPath = '';

    if (type === 'component') {
      fullPath = `${this.getCurrentPathPrefix()}components/${normalizedPath}`;
    } else if (type === 'page') {
      fullPath = `${this.getCurrentPathPrefix()}proyectopages/${normalizedPath}`;
    } else if (type === 'asset') {
      fullPath = `${this.getCurrentPathPrefix()}assets/${normalizedPath}`;
    } else {
      throw new Error(`Tipo de ruta no soportado: ${type}`);
    }

    if (section) {
      return `${fullPath}#${section}`;
    }

    return fullPath;
  }

  static getRouteUrl(routeName, options = {}) {
    const routeDefinitions = this.getRouteDefinitions();
    const route = routeDefinitions[routeName];

    if (!route) {
      throw new Error(`Ruta no registrada en PathManager: ${routeName}`);
    }

    return this.buildUrl(route.type, route.path, options.section || null);
  }

  static navigateToRoute(routeName, options = {}) {
    const fullUrl = this.getRouteUrl(routeName, options);

    console.log(' PathManager: Redirigiendo a ruta registrada:', routeName, fullUrl);
=======
    console.log('🔍 PathManager: Detectando ruta actual:', currentPath);
    
    // Usar rutas absolutas basadas en la estructura del proyecto
    const baseUrl = this.getBaseUrl();
    console.log('🔗 PathManager: Base URL detectada:', baseUrl);
    
    // Para simplificar, usar rutas absolutas desde la base del frontend
    return baseUrl;
  }
  
  /**
   * Genera una ruta absoluta para un archivo en la carpeta components
   * @param {string} componentPath - Ruta relativa desde components (e.g., 'auth/login.html')
   * @returns {string} - Ruta absoluta completa
   */
  static getComponentPath(componentPath) {
    const baseUrl = this.getCurrentPathPrefix();
    const fullPath = `${baseUrl}components/${componentPath}`;
    console.log('🎯 PathManager: Ruta de componente generada:', fullPath);
    return fullPath;
  }
  
  /**
   * Genera una ruta absoluta para un archivo en la carpeta assets
   * @param {string} assetPath - Ruta relativa desde assets (e.g., 'js/script.js')
   * @returns {string} - Ruta absoluta completa
   */
  static getAssetPath(assetPath) {
    const baseUrl = this.getCurrentPathPrefix();
    const fullPath = `${baseUrl}assets/${assetPath}`;
    console.log('🎯 PathManager: Ruta de asset generada:', fullPath);
    return fullPath;
  }
  
  /**
   * Genera una ruta absoluta para una página principal
   * @param {string} pagePath - Ruta relativa desde proyectopages (e.g., 'index.html')
   * @returns {string} - Ruta absoluta completa
   */
  static getPagePath(pagePath) {
    const baseUrl = this.getCurrentPathPrefix();
    const fullPath = `${baseUrl}proyectopages/${pagePath}`;
    console.log('🎯 PathManager: Ruta de página generada:', fullPath);
    return fullPath;
  }
  
  /**
   * Redirige al usuario al dashboard correspondiente según su rol
   * @param {string} userType - Tipo de usuario ('empleado' o 'administrador')
   */
  static navigateToDashboard(userType) {
    console.log('🚀 PathManager: Navegando al dashboard para usuario tipo:', userType);
    
    const dashboardPaths = {
      empleado: 'empleado/dashboard-empleado.html',
      administrador: 'admin/dashboard-admin.html'
    };
    
    const path = dashboardPaths[userType] || dashboardPaths.empleado;
    const fullUrl = this.getComponentPath(path);
    
    console.log('🎯 PathManager: Redirigiendo a dashboard:', fullUrl);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    window.location.href = fullUrl;
  }
  
  /**
<<<<<<< HEAD
   * @param {string} componentPath 
   * @returns {string} 
   */
  static getComponentPath(componentPath) {
    const fullPath = this.buildUrl('component', componentPath);
    console.log(' PathManager: Ruta de componente generada:', fullPath);
    return fullPath;
  }
  
  /**
   * @param {string} assetPath 
   * @returns {string} 
   */
  static getAssetPath(assetPath) {
    const fullPath = this.buildUrl('asset', assetPath);
    console.log(' PathManager: Ruta de asset generada:', fullPath);
    return fullPath;
  }
  
  /**
   * @param {string} pagePath 
   * @returns {string} 
   */
  static getPagePath(pagePath) {
    const fullPath = this.buildUrl('page', pagePath);
    console.log(' PathManager: Ruta de página generada:', fullPath);
    return fullPath;
  }
  
  /**
   * @param {string} userType
   */
  static navigateToDashboard(userType) {
    console.log(' PathManager: Navegando al dashboard para usuario tipo:', userType);
    
    const dashboardRoutes = {
      empleado: 'dashboard-empleado',
      administrador: 'dashboard-admin'
    };
    
    const routeName = dashboardRoutes[userType] || dashboardRoutes.empleado;
    this.navigateToRoute(routeName);
  }
  
  /**
   * @param {string} message 
   */
  static navigateToLogin(message = null) {
    console.log(' PathManager: Navegando al login');
    if (message) {
      console.log(' PathManager: Mensaje:', message);
      alert(message);
    }
    this.navigateToRoute('login');
=======
   * Redirige al usuario a la página de login
   * @param {string} message - Mensaje opcional para mostrar
   */
  static navigateToLogin(message = null) {
    console.log('🔐 PathManager: Navegando al login');
    if (message) {
      console.log('📝 PathManager: Mensaje:', message);
      alert(message);
    }
    const fullUrl = this.getComponentPath('auth/login.html');
    console.log('🎯 PathManager: Redirigiendo a login:', fullUrl);
    window.location.href = fullUrl;
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  }
  
  /**
   * Redirige al usuario a la página de registro
   */
  static navigateToRegister() {
<<<<<<< HEAD
    console.log(' PathManager: Navegando al registro');
    this.navigateToRoute('register');
  }

  static navigateToRecovery() {
    console.log(' PathManager: Navegando a recuperación de contraseña');
    this.navigateToRoute('recovery');
=======
    console.log('📝 PathManager: Navegando al registro');
    const fullUrl = this.getComponentPath('auth/registro.html');
    console.log('🎯 PathManager: Redirigiendo a registro:', fullUrl);
    window.location.href = fullUrl;
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
  }
  
  /**
   * Redirige al usuario a la página principal
   */
<<<<<<< HEAD
  static navigateToHome(section = null) {
    console.log(' PathManager: Navegando al home');
    const fullUrl = this.getRouteUrl('home', { section });
    console.log(' PathManager: Redirigiendo a home:', fullUrl);
=======
  static navigateToHome() {
    console.log('🏠 PathManager: Navegando al home');
    const fullUrl = this.getPagePath('index.html');
    console.log('🎯 PathManager: Redirigiendo a home:', fullUrl);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    window.location.href = fullUrl;
  }

  /**
<<<<<<< HEAD
=======
   * Obtiene la URL actual sin parámetros
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   * @returns {string} - URL limpia
   */
  static getCurrentCleanUrl() {
    return window.location.origin + window.location.pathname;
  }

  /**
<<<<<<< HEAD

   * @param {string} pageName
   * @returns {boolean} 
=======
   * Verifica si estamos en una página específica
   * @param {string} pageName - Nombre de la página a verificar
   * @returns {boolean} - True si estamos en esa página
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  static isCurrentPage(pageName) {
    const currentPath = window.location.pathname.toLowerCase();
    return currentPath.includes(pageName.toLowerCase());
  }

  /**
   * Método para debuggear rutas
   */
  static debugPaths() {
<<<<<<< HEAD
    console.group(' PathManager Debug Info');
=======
    console.group('🔍 PathManager Debug Info');
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    console.log('Current URL:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
    console.log('Base URL:', this.getBaseUrl());
    console.log('Current path prefix:', this.getCurrentPathPrefix());
    console.log('Dashboard Admin URL:', this.getComponentPath('admin/dashboard-admin.html'));
    console.log('Dashboard Empleado URL:', this.getComponentPath('empleado/dashboard-empleado.html'));
    console.log('Login URL:', this.getComponentPath('auth/login.html'));
<<<<<<< HEAD
    console.log('Register URL:', this.getComponentPath('auth/registro.html'));
    console.log('Recovery URL:', this.getComponentPath('auth/recuperar-password.html'));
    console.log('Home URL:', this.getPagePath('index.html'));
    console.groupEnd();
  }

  static bindNavigation() {
    if (this.navigationBound) {
      return;
    }

    document.addEventListener('click', event => {
      const target = event.target.closest('[data-route]');

      if (!target) {
        return;
      }

      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      if (target.target === '_blank' || target.hasAttribute('download')) {
        return;
      }

      const routeName = target.dataset.route;
      const section = target.dataset.section || null;

      if (!routeName) {
        return;
      }

      event.preventDefault();
      this.navigateToRoute(routeName, { section });
    });

    this.navigationBound = true;
  }

  /**
   * @param {string} modulePath 
   * @returns {Promise} 
   */
  static async loadModule(modulePath) {
    console.log(' PathManager: Cargando módulo:', modulePath);
    
    try {
      const fullPath = this.getAssetPath('js/' + modulePath);
      console.log(' PathManager: Ruta completa del módulo:', fullPath);
      const script = document.createElement('script');
      script.type = 'module';
      script.src = fullPath;
      return new Promise((resolve, reject) => {
        script.onload = () => {
          console.log(' PathManager: Módulo cargado exitosamente:', modulePath);
=======
    console.groupEnd();
  }

  /**
   * Método avanzado para cargar módulos JavaScript dinámicamente
   * @param {string} modulePath - Ruta del módulo JavaScript
   * @returns {Promise} - Promesa que se resuelve cuando el módulo se carga
   */
  static async loadModule(modulePath) {
    console.log('📦 PathManager: Cargando módulo:', modulePath);
    
    try {
      const fullPath = this.getAssetPath('js/' + modulePath);
      console.log('🔗 PathManager: Ruta completa del módulo:', fullPath);
      
      // Crear elemento script dinámicamente
      const script = document.createElement('script');
      script.type = 'module';
      script.src = fullPath;
      
      return new Promise((resolve, reject) => {
        script.onload = () => {
          console.log('✅ PathManager: Módulo cargado exitosamente:', modulePath);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
          resolve(script);
        };
        
        script.onerror = (error) => {
<<<<<<< HEAD
          console.error(' PathManager: Error cargando módulo:', modulePath, error);
=======
          console.error('❌ PathManager: Error cargando módulo:', modulePath, error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
          reject(error);
        };
        
        document.head.appendChild(script);
      });
      
    } catch (error) {
<<<<<<< HEAD
      console.error(' PathManager: Error al cargar módulo:', error);
=======
      console.error('❌ PathManager: Error al cargar módulo:', error);
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      throw error;
    }
  }

  /**
   * Inicializa PathManager y ejecuta diagnósticos
   */
  static init() {
<<<<<<< HEAD
    console.log(' PathManager: Inicializando...');
    this.bindNavigation();
    window.addEventListener('popstate', (event) => {
      console.log(' PathManager: Cambio de ruta detectado:', event);
    });
    this.debugPaths();
    
    console.log(' PathManager: Inicialización completada');
  }
}

=======
    console.log('🚀 PathManager: Inicializando...');
    
    // Agregar listener para cambios de ruta
    window.addEventListener('popstate', (event) => {
      console.log('🔄 PathManager: Cambio de ruta detectado:', event);
    });
    
    // Debuggear rutas al inicializar
    this.debugPaths();
    
    console.log('✅ PathManager: Inicialización completada');
  }
}

// Auto-inicializar cuando el DOM esté listo
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PathManager.init());
} else {
  PathManager.init();
}

<<<<<<< HEAD
if (typeof window !== 'undefined') {
  window.PathManager = PathManager;
}

export default PathManager;
=======
// Hacer PathManager disponible globalmente
if (typeof window !== 'undefined') {
  window.PathManager = PathManager;
}
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
