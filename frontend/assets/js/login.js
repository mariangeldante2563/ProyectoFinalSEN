/**
 * IN OUT MANAGER - Módulo de inicio de sesión (Versión optimizada)
 * 
 * Archivo único que maneja todas las funcionalidades del formulario de login:
 * - Validación de formularios
 * - Selector de roles
 * - Mostrar/ocultar contraseña
 * - Autenticación de usuarios
 * - Animaciones y efectos visuales
 * - Garantía de visibilidad del formulario
 * 
 * © 2025 IN OUT MANAGER
 */

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Logging para debugging
  console.log('🚀 Inicializando módulo de login...');
  
  // ======================================
  // INICIALIZACIÓN Y CARGA
  // ======================================
  
  // Asegurar visibilidad de elementos críticos inmediatamente
  ensureFormVisibility();
  
  // Elementos del DOM
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('showPassword');
  const roleTabs = document.querySelectorAll('.role-tab');
  const submitButton = document.querySelector('.login-submit-btn');
  const resultMessage = document.getElementById('loginResult');
  const logoContainer = document.querySelector('.logo-container');
  const adminCodeGroup = document.getElementById('adminCodeGroup');
  const adminCodeInput = document.getElementById('adminCode');
  
  // Verificación de elementos críticos
  if (!form || !emailInput || !passwordInput) {
    console.error('Error: Elementos esenciales del formulario no encontrados.');
    return;
  }
  
  // Estado inicial
  let selectedRole = 'empleado'; // Rol predeterminado
  
  // ======================================
  // INICIALIZACIÓN DE FUNCIONALIDADES
  // ======================================
  
  // Inicializar selector de rol
  initRoleTabs();
  
  // Inicializar toggle de contraseña
  initPasswordToggle();
  
  // Inicializar validación del formulario
  initFormValidation();
  
  // Animar entrada del formulario
  animateFormEntry();
  
  // Configurar observer para garantizar visibilidad
  setupVisibilityObserver();
  
  // ======================================
  // FUNCIONES DE INICIALIZACIÓN
  // ======================================
  
  /**
   * Inicializa el selector de roles
   */
  function initRoleTabs() {
    if (!roleTabs.length) return;
    
    roleTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Actualizar UI
        roleTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
          t.setAttribute('tabindex', '-1');
        });
        
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
        
        // Actualizar estado
        selectedRole = tab.dataset.role;
        
        // Actualizar descripción
        updateRoleDescription(selectedRole);
        
        // Mostrar/ocultar campo de código de administrador
        toggleAdminCodeField(selectedRole);
      });
    });
  }
  
  /**
   * Inicializa el toggle para mostrar/ocultar contraseña
   */
  function initPasswordToggle() {
    if (!passwordToggle || !passwordInput) return;
    
    passwordToggle.addEventListener('change', () => {
      passwordInput.type = passwordToggle.checked ? 'text' : 'password';
    });
  }
  
  /**
   * Inicializa la validación del formulario
   */
  function initFormValidation() {
    // Validación en tiempo real para email
    emailInput.addEventListener('input', () => validateEmail());
    
    // Validación en tiempo real para password
    passwordInput.addEventListener('input', () => validatePassword());
    
    // Validación en tiempo real para código de administrador
    if (adminCodeInput) {
      adminCodeInput.addEventListener('input', () => validateAdminCode());
    }
    
    // Envío del formulario
    form.addEventListener('submit', handleFormSubmit);
  }
  
  // ======================================
  // FUNCIONES DE MANIPULACIÓN DE UI
  // ======================================
  
  /**
   * Actualiza la descripción del rol seleccionado
   * @param {string} role - El rol seleccionado
   */
  function updateRoleDescription(role) {
    const roleDescription = document.getElementById('roleDescription');
    if (!roleDescription) return;
    
    const descriptions = {
      'empleado': 'Ingrese sus credenciales para acceder como empleado.',
      'administrador': 'Ingrese sus credenciales y el código de administrador para acceder como administrador.'
    };
    
    // Animar cambio de descripción
    fadeElement(roleDescription, () => {
      roleDescription.innerHTML = `<span>${descriptions[role] || ''}</span>`;
    });
  }
  
  /**
   * Desvanece un elemento, ejecuta una función, y lo vuelve a mostrar
   * @param {HTMLElement} element - El elemento a animar
   * @param {Function} callback - Función a ejecutar mientras está desvanecido
   */
  function fadeElement(element, callback) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      callback();
      
      element.style.transition = 'all 0.3s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 200);
  }
  
  /**
   * Muestra un mensaje de resultado
   * @param {string} message - El mensaje a mostrar
   * @param {string} type - El tipo de mensaje ('success' o 'error')
   */
  function showResultMessage(message, type = 'success') {
    if (!resultMessage) return;
    
    resultMessage.textContent = message;
    resultMessage.className = `result-message ${type}`;
    resultMessage.style.display = 'block';
    
    fadeElement(resultMessage, () => {});
  }
  
  /**
   * Establece el estado de carga del botón de envío
   * @param {boolean} isLoading - Indica si está cargando
   */
  function setButtonLoading(isLoading) {
    if (!submitButton) return;
    
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
    } else {
      submitButton.disabled = false;
      submitButton.innerHTML = '<span class="btn-icon"><i class="fas fa-sign-in-alt"></i></span><span class="btn-text">Iniciar Sesión</span><div class="btn-shine"></div>';
    }
  }
  
  // ======================================
  // VALIDACIÓN DE FORMULARIO
  // ======================================
  
  /**
   * Valida el campo de email
   * @returns {boolean} - Verdadero si es válido
   */
  function validateEmail() {
    const email = emailInput.value.trim();
    const errorElement = document.getElementById('emailError');
    
    if (!email) {
      showInputError(emailInput, errorElement, 'El correo electrónico es obligatorio');
      return false;
    } else if (!isValidEmail(email)) {
      showInputError(emailInput, errorElement, 'El formato del correo electrónico no es válido');
      return false;
    } else {
      clearInputError(emailInput, errorElement);
      return true;
    }
  }
  
  /**
   * Valida el campo de contraseña
   * @returns {boolean} - Verdadero si es válido
   */
  function validatePassword() {
    const password = passwordInput.value;
    const errorElement = document.getElementById('passwordError');
    
    if (!password) {
      showInputError(passwordInput, errorElement, 'La contraseña es obligatoria');
      return false;
    } else if (password.length < 8) {
      showInputError(passwordInput, errorElement, 'La contraseña debe tener al menos 8 caracteres');
      return false;
    } else {
      clearInputError(passwordInput, errorElement);
      return true;
    }
  }
  
  /**
   * Valida el campo de código de administrador
   * @returns {boolean} - Verdadero si es válido
   */
  function validateAdminCode() {
    if (!adminCodeInput || selectedRole !== 'administrador') return true;
    
    const adminCode = adminCodeInput.value.trim();
    const errorElement = document.getElementById('adminCodeError');
    
    if (!adminCode) {
      showInputError(adminCodeInput, errorElement, 'El código de administrador es obligatorio');
      return false;
    } else if (adminCode.length < 6) {
      showInputError(adminCodeInput, errorElement, 'El código debe tener al menos 6 caracteres');
      return false;
    } else if (adminCode.length > 20) {
      showInputError(adminCodeInput, errorElement, 'El código no puede tener más de 20 caracteres');
      return false;
    } else {
      clearInputError(adminCodeInput, errorElement);
      return true;
    }
  }
  
  /**
   * Verifica si un email tiene formato válido
   * @param {string} email - Email a validar
   * @returns {boolean} - Verdadero si es válido
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Muestra un error en un campo de entrada
   * @param {HTMLElement} input - El campo con error
   * @param {HTMLElement} errorElement - El elemento donde mostrar el error
   * @param {string} message - El mensaje de error
   */
  function showInputError(input, errorElement, message) {
    if (!input || !errorElement) return;
    
    input.classList.add('error-input');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  
  /**
   * Elimina un error de un campo de entrada
   * @param {HTMLElement} input - El campo a limpiar
   * @param {HTMLElement} errorElement - El elemento de error a limpiar
   */
  function clearInputError(input, errorElement) {
    if (!input || !errorElement) return;
    
    input.classList.remove('error-input');
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
  
  // ======================================
  // MANEJO DE EVENTOS DEL FORMULARIO
  // ======================================
  
  /**
   * Maneja el envío del formulario
   * @param {Event} e - El evento de envío
   */
  function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validar todos los campos
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isAdminCodeValid = validateAdminCode();
    
    if (!isEmailValid || !isPasswordValid || !isAdminCodeValid) {
      return;
    }
    
    // Iniciar proceso de login
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const adminCode = selectedRole === 'administrador' ? adminCodeInput.value.trim() : null;
    
    attemptLogin(email, password, selectedRole, adminCode);
  }
  
  /**
   * Intenta realizar el inicio de sesión
   * @param {string} email - El email del usuario
   * @param {string} password - La contraseña del usuario
   * @param {string} role - El rol seleccionado
   * @param {string} adminCode - El código de administrador (si aplica)
   */
  function attemptLogin(email, password, role, adminCode = null) {
    // Mostrar estado de carga
    setButtonLoading(true);
    
    // En un entorno real, aquí iría una llamada a la API
    // Simulamos con un timeout
    setTimeout(() => {
      try {
        // Simulación de autenticación con localStorage
        const usersJSON = localStorage.getItem('registeredUsers');
        const users = usersJSON ? JSON.parse(usersJSON) : [];
        
        let user = users.find(u => 
          u.email === email && 
          u.password === password &&
          u.tipoUsuario === role
        );
        
        // Validación adicional para administradores
        if (user && role === 'administrador') {
          if (!adminCode || user.codigoAdministrador !== adminCode) {
            showResultMessage('Código de administrador incorrecto', 'error');
            setButtonLoading(false);
            return;
          }
        }
        
        if (user) {
          handleSuccessfulLogin(user);
        } else {
          handleFailedLogin();
        }
      } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        showResultMessage('Ocurrió un error inesperado', 'error');
      } finally {
        setButtonLoading(false);
      }
    }, 1000);
  }
  
  /**
   * Maneja un inicio de sesión exitoso
   * @param {Object} user - El usuario autenticado
   */
  function handleSuccessfulLogin(user) {
    // Guardar usuario en localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Mostrar mensaje de éxito
    showResultMessage('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
    
    // Animar éxito
    animateSuccess();
    
    // Redirigir según el tipo de usuario
    setTimeout(() => {
      const redirectPath = user.tipoUsuario === 'administrador' 
        ? '../admin/dashboard-admin.html'
        : '../empleado/dashboard-empleado.html';
      
      window.location.href = redirectPath;
    }, 1500);
  }
  
  /**
   * Maneja un inicio de sesión fallido
   */
  function handleFailedLogin() {
    showResultMessage('Credenciales incorrectas o usuario no encontrado', 'error');
    animateErrorShake();
  }
  
  /**
   * Muestra u oculta el campo de código de administrador según el rol seleccionado
   * @param {string} role - El rol seleccionado
   */
  function toggleAdminCodeField(role) {
    if (!adminCodeGroup) return;
    
    if (role === 'administrador') {
      // Mostrar campo de código de administrador
      adminCodeGroup.style.display = 'block';
      setTimeout(() => {
        adminCodeGroup.classList.remove('hide');
        adminCodeGroup.classList.add('show');
      }, 10);
      
      // Hacer que el campo sea requerido
      if (adminCodeInput) {
        adminCodeInput.setAttribute('required', 'true');
      }
    } else {
      // Ocultar campo de código de administrador
      adminCodeGroup.classList.remove('show');
      adminCodeGroup.classList.add('hide');
      
      setTimeout(() => {
        adminCodeGroup.style.display = 'none';
        adminCodeGroup.classList.remove('hide');
      }, 400);
      
      // Remover la validación requerida y limpiar el campo
      if (adminCodeInput) {
        adminCodeInput.removeAttribute('required');
        adminCodeInput.value = '';
        clearInputError(adminCodeInput, document.getElementById('adminCodeError'));
      }
    }
  }

  // ======================================
  // ANIMACIONES Y EFECTOS VISUALES
  // ======================================
  
  /**
   * Anima la entrada del formulario
   */
  function animateFormEntry() {
    const authCard = document.querySelector('.auth-card');
    if (!authCard) return;
    
    // Aplicar animación de entrada
    authCard.style.opacity = '0';
    authCard.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      authCard.style.transition = 'all 0.5s ease';
      authCard.style.opacity = '1';
      authCard.style.transform = 'translateY(0)';
    }, 100);
  }
  
  /**
   * Anima un efecto de sacudida para errores
   */
  function animateErrorShake() {
    const authCard = document.querySelector('.auth-card');
    if (!authCard) return;
    
    authCard.classList.add('shake-animation');
    setTimeout(() => authCard.classList.remove('shake-animation'), 500);
  }
  
  /**
   * Anima un efecto de éxito
   */
  function animateSuccess() {
    const authCard = document.querySelector('.auth-card');
    if (!authCard) return;
    
    authCard.classList.add('success-animation');
  }
  
  // ======================================
  // GARANTÍA DE VISIBILIDAD
  // ======================================
  
  /**
   * Asegura que los elementos del formulario sean visibles
   */
  function ensureFormVisibility() {
    const criticalElements = [
      '.site-content',
      '.login-section',
      '.auth-container',
      '.auth-card',
      '#loginForm',
      '.auth-header',
      '.logo-container',
      '#adminCodeGroup'
    ];
    
    criticalElements.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        // Asegurar que el elemento sea visible
        element.style.display = selector === '.auth-container' ? 'flex' : 'block';
        element.style.visibility = 'visible';
        element.style.opacity = '1';
      }
    });
  }
  
  /**
   * Configura un observador para garantizar la visibilidad del formulario
   */
  function setupVisibilityObserver() {
    // Crear un observador para detectar cambios de visibilidad
    const observer = new MutationObserver(mutations => {
      let needsCheck = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || 
             mutation.attributeName === 'class')) {
          needsCheck = true;
        }
      });
      
      if (needsCheck) {
        ensureFormVisibility();
      }
    });
    
    // Observar elementos críticos
    const criticalElements = [
      document.querySelector('.site-content'),
      document.querySelector('.login-section'),
      document.querySelector('.auth-container'),
      document.querySelector('.auth-card')
    ].filter(el => el !== null);
    
    criticalElements.forEach(element => {
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    });
  }
});

// Garantizar visibilidad incluso si DOMContentLoaded ya ocurrió
if (document.readyState === 'loading') {
  console.log('🔄 Documento cargando - esperando a DOMContentLoaded');
} else {
  console.log('🔄 Documento ya cargado - asegurando visibilidad inmediata');
  setTimeout(() => {
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
      authCard.style.display = 'block';
      authCard.style.visibility = 'visible';
      authCard.style.opacity = '1';
    }
  }, 0);
}
