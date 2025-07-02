// ===========================
// FUNCIONALIDAD DEL FORMULARIO DE LOGIN
// ===========================

class LoginManager {
  constructor() {
    try {
      this.form = document.getElementById('loginForm');
      this.roleTabs = document.querySelectorAll('.role-tab');
      this.tipoUsuarioInput = document.getElementById('tipoUsuario');
      this.adminFields = document.getElementById('adminFields');
      this.mensajeContainer = document.getElementById('loginMensaje');
      
      if (!this.form) throw new Error('Elemento del formulario no encontrado');
      
      this.init();
    } catch (error) {
      console.error('Error en LoginManager Constructor:', error);
    }
  }

  init() {
    if (!this.form) return;
    
    try {
      this.setupRoleTabs();
      this.setupFormValidation();
      this.setupFormSubmission();
      this.loadSavedCredentials();
    } catch (error) {
      console.error('Error inicializando el formulario de login:', error);
    }
  }

  setupRoleTabs() {
    // Selector de rol mejorado y campos de administrador
    const roleTabs = document.querySelectorAll('.role-tab');
    const adminFields = document.getElementById('adminFields');
    const tipoUsuarioInput = document.getElementById('tipoUsuario');
    const roleDescription = document.getElementById('roleDescription');
    const codigoAdmin = document.getElementById('codigoAdmin');

    roleTabs.forEach(tab => {
      tab.addEventListener('click', function () {
        roleTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
          t.setAttribute('tabindex', '-1');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        this.setAttribute('tabindex', '0');
        const role = this.getAttribute('data-role');
        tipoUsuarioInput.value = role;
        if (role === 'administrador') {
          adminFields.style.display = 'block';
          roleDescription.innerHTML = '<span>Ingrese sus credenciales de administrador.</span>';
          // Hacer requeridos los campos de admin
          codigoAdmin.setAttribute('required', 'required');
        } else {
          adminFields.style.display = 'none';
          roleDescription.innerHTML = '<span>Ingrese sus credenciales de empleado.</span>';
          // Quitar requeridos
          codigoAdmin.removeAttribute('required');
        }
      });
      // Accesibilidad: activar con Enter/Espacio
      tab.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  setupFormValidation() {
    // Validación en tiempo real
    const inputs = this.form.querySelectorAll('input:not([type="checkbox"])');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        this.clearFieldError(input);
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Validaciones específicas por campo
    switch (field.name) {
      case 'numeroDocumento':
        if (field.required && !value) {
          isValid = false;
          errorMessage = 'El número de documento es requerido';
        } else if (value && !/^[0-9]{6,12}$/.test(value)) {
          isValid = false;
          errorMessage = 'Solo números, entre 6 y 12 dígitos';
        }
        break;

      case 'password':
        if (field.required && !value) {
          isValid = false;
          errorMessage = 'La contraseña es requerida';
        } else if (value && value.length < 6) {
          isValid = false;
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        }
        break;

      case 'codigoAdmin':
        if (this.tipoUsuarioInput.value === 'administrador' && field.required && !value) {
          isValid = false;
          errorMessage = 'El código de administrador es requerido';
        } else if (this.tipoUsuarioInput.value === 'administrador' && value && !this.validateAdminCode(value)) {
          isValid = false;
          errorMessage = 'Código de administrador inválido';
        }
        break;
    }

    this.showFieldValidation(field, isValid, errorMessage);
    return isValid;
  }

  showFieldValidation(field, isValid, errorMessage) {
    // Remover mensajes de error anteriores
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    if (!isValid && errorMessage) {
      // Crear mensaje de error
      const errorDiv = document.createElement('div');
      errorDiv.className = 'field-error';
      errorDiv.style.cssText = `
        color: #ef4444;
        font-size: 0.85rem;
        margin-top: 5px;
        font-weight: 500;
        animation: fadeInUp 0.3s ease;
      `;
      errorDiv.textContent = errorMessage;
      field.parentNode.appendChild(errorDiv);
    }
  }

  clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }

  setupFormSubmission() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmission();
    });
  }

  async handleFormSubmission() {
    try {
      // Validar todos los campos
      const isFormValid = this.validateForm();
      
      if (!isFormValid) {
        this.showMessage('Por favor, corrija los errores en el formulario.', 'error');
        return;
      }

      // Mostrar mensaje de procesamiento
      this.showMessage('Verificando credenciales...', 'warning');

      // Obtener datos del formulario
      const formData = this.getFormData();
      
      // Validaciones adicionales para administradores
      if (formData.tipoUsuario === 'administrador') {
        const isValidAdminCode = this.validateAdminCode(formData.codigoAdmin);
        if (!isValidAdminCode) {
          this.showMessage('Código de administrador inválido.', 'error');
          return;
        }
      }

      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar credenciales
      const authResult = this.authenticateUser(formData);
      
      if (!authResult.success) {
        this.showMessage(authResult.message, 'error');
        return;
      }

      // Guardar credenciales si "recordar" está marcado
      if (formData.rememberMe) {
        this.saveCredentials(formData);
      }

      // Iniciar sesión
      this.setUserSession(authResult.userData);

      // Mostrar mensaje de éxito
      this.showMessage(
        `¡Bienvenido/a ${authResult.userData.nombreCompleto}! Accediendo a su cuenta...`,
        'success'
      );

      // Redirigir al dashboard correspondiente
      setTimeout(() => {
        this.redirectToUserDashboard(authResult.userData.tipoUsuario);
      }, 1500);

    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      this.showMessage('Error inesperado. Por favor, intente nuevamente.', 'error');
    }
  }

  validateForm() {
    const inputs = this.form.querySelectorAll('input:not([type="checkbox"])');
    let isValid = true;

    inputs.forEach(input => {
      // Solo validar los campos visibles o que no están en la sección de administrador oculta
      const isAdminField = input.closest('#adminFields');
      if (!isAdminField || (isAdminField && this.tipoUsuarioInput.value === 'administrador')) {
        if (!this.validateField(input)) {
          isValid = false;
        }
      }
    });

    return isValid;
  }

  getFormData() {
    const formData = new FormData(this.form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
      data[key] = value.trim();
    }
    
    // Manejar el checkbox "recordarme"
    data.rememberMe = formData.has('rememberMe');
    
    return data;
  }

  validateAdminCode(code) {
    // Códigos de administrador válidos (en producción esto sería más seguro)
    const validCodes = ['ADMIN2025', 'MANAGER123', 'SUPERVISOR456'];
    return validCodes.includes(code);
  }

  authenticateUser(credentials) {
    // Obtener usuarios registrados
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Buscar usuario por número de documento
    const user = users.find(u => u.numeroDocumento === credentials.numeroDocumento);
    
    if (!user) {
      return {
        success: false,
        message: 'Número de documento no encontrado.'
      };
    }
    
    // Verificar contraseña (en una app real usaríamos bcrypt.compare o similar)
    const hashedPassword = this.securePassword(credentials.password);
    if (user.password !== hashedPassword) {
      return {
        success: false,
        message: 'Contraseña incorrecta.'
      };
    }
    
    // Determinar el rol y permisos según las credenciales
    // Si la persona ingresó un código de administrador válido y su tipo es administrador
    if (credentials.codigoAdmin && this.validateAdminCode(credentials.codigoAdmin) && user.tipoUsuario === 'administrador') {
      // Es un administrador, otorgar permisos de administrador
      user.currentRole = 'administrador';
    } else {
      // Es un empleado o el código de administrador es incorrecto
      user.currentRole = 'empleado';
    }
    
    // Verificar que el rol solicitado coincida con el asignado o determinado
    if (credentials.tipoUsuario !== user.currentRole) {
      return {
        success: false,
        message: `No tiene los permisos necesarios para acceder como ${credentials.tipoUsuario}.`
      };
    }
    
    // Autenticación exitosa
    return {
      success: true,
      message: 'Autenticación exitosa',
      userData: user
    };
  }

  securePassword(password) {
    // En una aplicación real, aquí implementaríamos un hash seguro
    // Para esta demo, usamos el mismo método que en registro.js
    return btoa(password + "_salted");
  }

  setUserSession(userData) {
    // Almacenar datos de sesión (en una app real usaríamos JWT o cookies seguras)
    const sessionData = {
      id: userData.id,
      nombreCompleto: userData.nombreCompleto,
      numeroDocumento: userData.numeroDocumento,
      tipoUsuario: userData.currentRole || userData.tipoUsuario, // Usar el rol actual determinado durante la autenticación
      // No incluir la contraseña en los datos de sesión
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(sessionData));
  }

  redirectToUserDashboard(tipoUsuario) {
    // Redirigir al usuario según su rol
    if (tipoUsuario === 'administrador') {
      window.location.href = 'dashboard-admin.html';
    } else {
      window.location.href = 'dashboard-empleado.html';
    }
  }

  saveCredentials(credentials) {
    // Guardar solo número de documento y tipo de usuario
    const rememberedCredentials = {
      numeroDocumento: credentials.numeroDocumento,
      tipoUsuario: credentials.tipoUsuario
    };
    
    localStorage.setItem('rememberedCredentials', JSON.stringify(rememberedCredentials));
  }

  loadSavedCredentials() {
    // Cargar credenciales guardadas
    const savedCredentials = JSON.parse(localStorage.getItem('rememberedCredentials'));
    
    if (savedCredentials) {
      // Rellenar campos
      const documentoField = document.getElementById('numeroDocumento');
      if (documentoField) {
        documentoField.value = savedCredentials.numeroDocumento || '';
      }
      
      // Seleccionar el rol correspondiente
      if (savedCredentials.tipoUsuario) {
        const roleTab = document.querySelector(`.role-tab[data-role="${savedCredentials.tipoUsuario}"]`);
        if (roleTab) {
          roleTab.click();
        }
      }
      
      // Marcar "recordar"
      const rememberMe = document.getElementById('rememberMe');
      if (rememberMe) {
        rememberMe.checked = true;
      }
    }
  }

  showMessage(message, type) {
    this.mensajeContainer.textContent = message;
    this.mensajeContainer.className = `registro-mensaje ${type}`;
    this.mensajeContainer.style.display = 'block';
    
    // Scroll al mensaje
    this.mensajeContainer.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });

    // Auto-ocultar después de 5 segundos para mensajes de éxito
    if (type === 'success') {
      setTimeout(() => {
        this.mensajeContainer.style.display = 'none';
      }, 5000);
    }
  }
}

// Inicializar la aplicación de login
document.addEventListener('DOMContentLoaded', () => {
  const loginManager = new LoginManager();
});

// Clase para gestionar errores
class ErrorHandler {
  static handleError(error, context) {
    console.error(`Error en ${context}:`, error);
    // En producción podrías enviar estos errores a un servicio de monitoreo
  }
}
