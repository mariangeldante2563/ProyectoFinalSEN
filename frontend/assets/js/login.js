/**
 * IN OUT MANAGER - Módulo de inicio de sesión
 * 
 * Este archivo contiene la lógica para el proceso de inicio de sesión
 * en el sistema IN OUT MANAGER.
 */

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar el gestor de inicio de sesión
  const loginManager = new LoginManager();
});

/**
 * Clase para gestionar el proceso de inicio de sesión
 */
class LoginManager {
  /**
   * Constructor de la clase
   */
  constructor() {
    // Elementos del DOM
    this.form = document.getElementById('loginForm');
    this.emailInput = document.getElementById('email');
    this.passwordInput = document.getElementById('password');
    this.showPasswordToggle = document.getElementById('showPassword');
    this.roleTabs = document.querySelectorAll('.role-tab');
    this.submitButton = document.querySelector('.btn-primary');
    
    // Estado
    this.selectedRole = 'empleado'; // Valor predeterminado
    
    // Inicializar componentes
    this.init();
  }
  
  /**
   * Inicializa todos los componentes y eventos
   */
  init() {
    if (!this.form) {
      console.error('No se encontró el formulario de inicio de sesión');
      return;
    }
    
    // Configurar eventos
    this.setupRoleTabs();
    this.setupPasswordToggle();
    this.setupFormSubmission();
    
    // Animación de entrada
    this.animateFormEntry();
  }
  
  /**
   * Configura la funcionalidad de las pestañas de selección de rol
   */
  setupRoleTabs() {
    if (!this.roleTabs.length) return;
    
    this.roleTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Actualizar UI
        this.roleTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
          t.setAttribute('tabindex', '-1');
        });
        
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
        
        // Actualizar estado
        this.selectedRole = tab.dataset.role;
        
        // Efectos visuales
        this.animateRoleChange();
      });
    });
  }
  
  /**
   * Configura el botón para mostrar/ocultar la contraseña
   */
  setupPasswordToggle() {
    if (!this.showPasswordToggle || !this.passwordInput) return;
    
    this.showPasswordToggle.addEventListener('change', () => {
      this.passwordInput.type = this.showPasswordToggle.checked ? 'text' : 'password';
    });
  }
  
  /**
   * Configura el envío del formulario y la validación
   */
  setupFormSubmission() {
    if (!this.form) return;
    
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Obtener los valores del formulario
      const email = this.emailInput.value.trim();
      const password = this.passwordInput.value;
      const role = this.selectedRole;
      
      // Validar datos
      if (!this.validateForm(email, password)) {
        return;
      }
      
      // Intentar iniciar sesión
      this.attemptLogin(email, password, role);
    });
  }
  
  /**
   * Valida los campos del formulario
   * 
   * @param {string} email - El correo electrónico ingresado
   * @param {string} password - La contraseña ingresada
   * @returns {boolean} - Verdadero si la validación es exitosa
   */
  validateForm(email, password) {
    let isValid = true;
    
    // Validar email
    if (!email) {
      this.showError(this.emailInput, 'El correo electrónico es obligatorio');
      isValid = false;
    } else if (!this.isValidEmail(email)) {
      this.showError(this.emailInput, 'Formato de correo electrónico inválido');
      isValid = false;
    } else {
      this.clearError(this.emailInput);
    }
    
    // Validar contraseña
    if (!password) {
      this.showError(this.passwordInput, 'La contraseña es obligatoria');
      isValid = false;
    } else {
      this.clearError(this.passwordInput);
    }
    
    return isValid;
  }
  
  /**
   * Verifica si un correo electrónico tiene un formato válido
   * 
   * @param {string} email - El correo electrónico a validar
   * @returns {boolean} - Verdadero si el formato es válido
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Muestra un mensaje de error para un campo
   * 
   * @param {HTMLElement} inputElement - El elemento input con error
   * @param {string} message - El mensaje de error
   */
  showError(inputElement, message) {
    // Buscar o crear el contenedor de mensaje
    let errorElement = inputElement.parentElement.querySelector('.validation-message');
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'validation-message error';
      inputElement.parentElement.appendChild(errorElement);
    }
    
    // Agregar clase de error al input y mostrar mensaje
    inputElement.classList.add('error-input');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  
  /**
   * Limpia el mensaje de error para un campo
   * 
   * @param {HTMLElement} inputElement - El elemento input a limpiar
   */
  clearError(inputElement) {
    const errorElement = inputElement.parentElement.querySelector('.validation-message');
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
    
    inputElement.classList.remove('error-input');
  }
  
  /**
   * Intenta realizar el inicio de sesión
   * 
   * @param {string} email - El correo electrónico del usuario
   * @param {string} password - La contraseña del usuario
   * @param {string} role - El rol seleccionado (empleado o administrador)
   */
  attemptLogin(email, password, role) {
    // Mostrar estado de carga
    this.setLoadingState(true);
    
    // En un entorno real, esto sería una llamada a una API
    // Aquí simulamos el proceso con un temporizador
    setTimeout(() => {
      try {
        // Obtener usuarios registrados de localStorage
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Buscar el usuario
        const user = users.find(u => 
          u.email === email && 
          u.password === password &&
          u.tipoUsuario === role
        );
        
        if (user) {
          // Autenticación exitosa
          this.handleSuccessfulLogin(user);
        } else {
          // Autenticación fallida
          this.handleFailedLogin();
        }
      } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        this.showLoginError('Ocurrió un error durante el inicio de sesión');
      } finally {
        this.setLoadingState(false);
      }
    }, 1000); // Simular retraso de red
  }
  
  /**
   * Maneja un inicio de sesión exitoso
   * 
   * @param {Object} user - El objeto usuario autenticado
   */
  handleSuccessfulLogin(user) {
    // Guardar usuario actual en localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Mostrar mensaje de éxito brevemente
    this.showLoginSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
    
    // Redirigir según el tipo de usuario
    setTimeout(() => {
      if (user.tipoUsuario === 'administrador') {
        window.location.href = '../admin/dashboard-admin.html';
      } else {
        window.location.href = '../empleado/dashboard-empleado.html';
      }
    }, 1000);
  }
  
  /**
   * Maneja un inicio de sesión fallido
   */
  handleFailedLogin() {
    this.showLoginError('Credenciales incorrectas o usuario no encontrado');
    this.animateErrorShake();
  }
  
  /**
   * Muestra un mensaje de error de inicio de sesión
   * 
   * @param {string} message - El mensaje de error
   */
  showLoginError(message) {
    this.showStatusMessage(message, 'error');
  }
  
  /**
   * Muestra un mensaje de éxito de inicio de sesión
   * 
   * @param {string} message - El mensaje de éxito
   */
  showLoginSuccess(message) {
    this.showStatusMessage(message, 'success');
  }
  
  /**
   * Muestra un mensaje de estado (error o éxito)
   * 
   * @param {string} message - El mensaje a mostrar
   * @param {string} type - El tipo de mensaje ('error' o 'success')
   */
  showStatusMessage(message, type) {
    // Buscar o crear el contenedor de mensajes
    let messageContainer = document.querySelector('.login-status-message');
    
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.className = 'login-status-message';
      this.form.insertBefore(messageContainer, this.form.firstChild);
    }
    
    // Configurar el mensaje
    messageContainer.textContent = message;
    messageContainer.className = `login-status-message ${type}`;
    messageContainer.style.display = 'block';
  }
  
  /**
   * Establece el estado de carga del formulario
   * 
   * @param {boolean} isLoading - Indica si se está cargando
   */
  setLoadingState(isLoading) {
    if (!this.submitButton) return;
    
    if (isLoading) {
      this.submitButton.disabled = true;
      this.submitButton.innerHTML = '<span class="loading-spinner"></span> Iniciando sesión...';
    } else {
      this.submitButton.disabled = false;
      this.submitButton.textContent = 'Iniciar Sesión';
    }
  }
  
  /**
   * Anima la entrada del formulario
   */
  animateFormEntry() {
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
      authCard.style.opacity = '0';
      authCard.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        authCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        authCard.style.opacity = '1';
        authCard.style.transform = 'translateY(0)';
      }, 100);
    }
  }
  
  /**
   * Anima el cambio de rol
   */
  animateRoleChange() {
    const formFields = document.querySelectorAll('.form-group');
    
    formFields.forEach((field, index) => {
      field.style.transition = 'none';
      field.style.opacity = '0';
      field.style.transform = 'translateX(10px)';
      
      setTimeout(() => {
        field.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        field.style.opacity = '1';
        field.style.transform = 'translateX(0)';
      }, 50 * index);
    });
  }
  
  /**
   * Anima un efecto de sacudida para errores de inicio de sesión
   */
  animateErrorShake() {
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
      authCard.classList.add('shake-animation');
      setTimeout(() => {
        authCard.classList.remove('shake-animation');
      }, 500);
    }
  }
}
