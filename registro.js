// ===========================
// FUNCIONALIDAD DEL FORMULARIO DE REGISTRO
// ===========================

class RegistroManager {
  constructor() {
    try {
        this.form = document.getElementById('registroForm');
        this.roleTabs = document.querySelectorAll('.role-tab');
        this.tipoUsuarioInput = document.getElementById('tipoUsuario');
        this.adminFields = document.getElementById('adminFields');
        this.mensajeContainer = document.getElementById('registroMensaje');
        this.usersPanel = document.getElementById('usersPanel');
        this.usersList = document.getElementById('usersList');
        this.togglePanel = document.getElementById('togglePanel');
        
        if (!this.form) throw new Error('Elemento del formulario no encontrado');
        
        this.init();
    } catch (error) {
        ErrorHandler.handleError(error, 'RegistroManager Constructor');
    }
  }

  init() {
    if (!this.form) return;
    
    try {
      this.setupRoleTabs();
      this.setupFormValidation();
      this.setupFormSubmission();
      this.setupUsersPanel();
      this.loadExistingUsers();
    } catch (error) {
      console.error('Error inicializando el formulario de registro:', error);
    }
  }

  setupRoleTabs() {
    this.roleTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.handleRoleChange(e.target.closest('.role-tab'));
      });
    });
  }

  handleRoleChange(selectedTab) {
    try {
      // Remover clase active de todos los tabs
      this.roleTabs.forEach(tab => tab.classList.remove('active'));
      
      // Agregar clase active al tab seleccionado
      selectedTab.classList.add('active');
      
      // Obtener el tipo de usuario
      const role = selectedTab.dataset.role;
      this.tipoUsuarioInput.value = role;
      
      // Mostrar/ocultar campos de administrador
      if (role === 'administrador') {
        this.adminFields.style.display = 'block';
        this.adminFields.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Hacer el código de admin requerido
        const codigoAdmin = document.getElementById('codigoAdmin');
        if (codigoAdmin) {
          codigoAdmin.required = true;
        }
      } else {
        this.adminFields.style.display = 'none';
        
        // Quitar requerimiento del código de admin
        const codigoAdmin = document.getElementById('codigoAdmin');
        if (codigoAdmin) {
          codigoAdmin.required = false;
          codigoAdmin.value = '';
        }
      }
    } catch (error) {
      console.error('Error al cambiar el tipo de usuario:', error);
    }
  }

  setupFormValidation() {
    // Validación en tiempo real
    const inputs = this.form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        this.clearFieldError(input);
        
        // Validación cruzada para contraseñas
        if (input.name === 'password') {
          const confirmPasswordField = document.getElementById('confirmPassword');
          if (confirmPasswordField && confirmPasswordField.value) {
            this.validateField(confirmPasswordField);
          }
        }
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Validaciones específicas por campo
    switch (field.name) {
      case 'nombreCompleto':
        if (field.required && !value) {
          isValid = false;
          errorMessage = 'El nombre completo es requerido';
        } else if (value && !/^[A-Za-zÀ-ÿ\s]{2,50}$/.test(value)) {
          isValid = false;
          errorMessage = 'Solo letras y espacios, entre 2 y 50 caracteres';
        }
        break;

      case 'numeroDocumento':
        if (field.required && !value) {
          isValid = false;
          errorMessage = 'El número de documento es requerido';
        } else if (value && !/^[0-9]{6,12}$/.test(value)) {
          isValid = false;
          errorMessage = 'Solo números, entre 6 y 12 dígitos';
        }
        break;

      case 'edad':
        if (value && (value < 18 || value > 100)) {
          isValid = false;
          errorMessage = 'La edad debe estar entre 18 y 100 años';
        }
        break;

      case 'correoElectronico':
        if (field.required && !value) {
          isValid = false;
          errorMessage = 'El correo electrónico es requerido';
        } else if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          isValid = false;
          errorMessage = 'Formato de correo electrónico inválido';
        }
        break;

      case 'telefono':
        if (value && !/^[\+]?[0-9\s\-\(\)]{7,15}$/.test(value)) {
          isValid = false;
          errorMessage = 'Formato de teléfono inválido';
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

      case 'confirmPassword':
        const passwordField = document.getElementById('password');
        if (field.required && !value) {
          isValid = false;
          errorMessage = 'Debe confirmar la contraseña';
        } else if (value && passwordField && value !== passwordField.value) {
          isValid = false;
          errorMessage = 'Las contraseñas no coinciden';
        }
        break;

      case 'codigoAdmin':
        if (this.tipoUsuarioInput.value === 'administrador' && field.required && !value) {
          isValid = false;
          errorMessage = 'El código de administrador es requerido';
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

    // Remover clases de validación anteriores
    field.classList.remove('password-mismatch', 'password-match');

    if (!isValid && errorMessage) {
      // Crear mensaje de error
      const errorDiv = document.createElement('div');
      errorDiv.className = field.type === 'password' ? 'field-error password-error' : 'field-error';
      errorDiv.style.cssText = `
        color: #ef4444;
        font-size: 0.85rem;
        margin-top: 5px;
        font-weight: 500;
        animation: fadeInUp 0.3s ease;
      `;
      errorDiv.textContent = errorMessage;
      field.parentNode.appendChild(errorDiv);

      // Agregar clase de error visual para campos de contraseña
      if (field.type === 'password') {
        field.classList.add('password-mismatch');
      }
    } else if (field.type === 'password' && field.value && isValid) {
      // Si es válido y es un campo de contraseña con valor, marcar como correcto
      field.classList.add('password-match');
    }
  }

  clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
    
    // Limpiar clases de validación visual
    field.classList.remove('password-mismatch', 'password-match');
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
      this.showMessage('Procesando registro...', 'warning');

      // Simular envío (aquí se conectaría con el backend)
      const formData = this.getFormData();
      
      // Validaciones adicionales
      if (formData.tipoUsuario === 'administrador') {
        const isValidAdminCode = this.validateAdminCode(formData.codigoAdmin);
        if (!isValidAdminCode) {
          this.showMessage('Código de administrador inválido. Códigos válidos: ADMIN2025, MANAGER123, SUPERVISOR456', 'error');
          return;
        }
      }

      // Verificar si el documento ya existe (simulado)
      if (this.isDocumentExists(formData.numeroDocumento)) {
        this.showMessage('Este número de documento ya está registrado.', 'error');
        return;
      }

      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Guardar en localStorage (simulando base de datos)
      this.saveUserData(formData);

      // Mostrar mensaje de éxito
      this.showMessage(
        `¡Registro exitoso! Bienvenido/a ${formData.nombreCompleto}. Su registro como ${formData.tipoUsuario} ha sido completado.`,
        'success'
      );

      // Actualizar lista de usuarios
      this.updateUsersList();

      // Limpiar formulario
      this.resetForm();

      // Mostrar panel de usuarios si hay usuarios registrados
      this.showUsersPanel();

    } catch (error) {
      console.error('Error en el envío del formulario:', error);
      this.showMessage('Error inesperado. Por favor, intente nuevamente.', 'error');
    }
  }

  validateForm() {
    const inputs = this.form.querySelectorAll('input, select');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
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
    
    // Agregar timestamp
    data.fechaRegistro = new Date().toISOString();
    data.id = this.generateUserId();
    
    return data;
  }

  validateAdminCode(code) {
    // Códigos de administrador válidos (en producción esto sería más seguro)
    const validCodes = ['ADMIN2025', 'MANAGER123', 'SUPERVISOR456'];
    return validCodes.includes(code);
  }

  isDocumentExists(documento) {
    // Simular verificación en base de datos
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    return existingUsers.some(user => user.numeroDocumento === documento);
  }

  saveUserData(userData) {
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    existingUsers.push(userData);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    // Log para desarrollo
    console.log('Usuario registrado:', userData);
  }

  generateUserId() {
    return 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
      }, 8000);
    }
  }

  resetForm() {
    this.form.reset();
    
    // Resetear selector de roles
    this.roleTabs.forEach(tab => tab.classList.remove('active'));
    this.roleTabs[0].classList.add('active'); // Activar "Empleado" por defecto
    this.tipoUsuarioInput.value = 'empleado';
    
    // Ocultar campos de administrador
    this.adminFields.style.display = 'none';
    
    // Limpiar errores
    const errors = this.form.querySelectorAll('.field-error');
    errors.forEach(error => error.remove());
    
    // Scroll al inicio del formulario
    setTimeout(() => {
      document.querySelector('.registro-header').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 1000);
  }

  // Funcionalidad del panel de usuarios
  setupUsersPanel() {
    if (this.togglePanel) {
      this.togglePanel.addEventListener('click', () => {
        this.toggleUsersPanel();
      });
    }
  }

  loadExistingUsers() {
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (existingUsers.length > 0) {
      this.showUsersPanel();
      this.updateUsersList();
    }
  }

  showUsersPanel() {
    if (this.usersPanel) {
      this.usersPanel.style.display = 'block';
    }
  }

  toggleUsersPanel() {
    const usersList = this.usersList;
    if (usersList.style.display === 'none' || !usersList.style.display) {
      usersList.style.display = 'block';
      this.updateUsersList();
    } else {
      usersList.style.display = 'none';
    }
  }

  updateUsersList() {
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    if (existingUsers.length === 0) {
      this.usersList.innerHTML = '<p class="no-users">No hay usuarios registrados aún.</p>';
      return;
    }

    let usersHtml = `
      <div class="users-count">
        <strong>Total de usuarios registrados: ${existingUsers.length}</strong>
      </div>
    `;

    existingUsers.forEach((user, index) => {
      const fecha = new Date(user.fechaRegistro).toLocaleString('es-ES');
      usersHtml += `
        <div class="user-card">
          <div class="user-info">
            <div class="user-header">
              <h4>${user.nombreCompleto}</h4>
              <span class="user-type ${user.tipoUsuario}">${user.tipoUsuario.toUpperCase()}</span>
            </div>
            <div class="user-details">
              <p><strong>Documento:</strong> ${user.numeroDocumento}</p>
              <p><strong>Email:</strong> ${user.correoElectronico}</p>
              ${user.cargo ? `<p><strong>Cargo:</strong> ${user.cargo}</p>` : ''}
              ${user.telefono ? `<p><strong>Teléfono:</strong> ${user.telefono}</p>` : ''}
              <p><strong>Registrado:</strong> ${fecha}</p>
            </div>
          </div>
          <div class="user-actions">
            <button class="delete-user-btn" data-index="${index}" data-doc="${user.numeroDocumento}">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      `;
    });

    this.usersList.innerHTML = usersHtml;

    // Agregar eventos a los botones de eliminar
    this.usersList.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        const doc = e.target.dataset.doc;
        this.deleteUser(index, doc);
      });
    });
  }

  deleteUser(index, documento) {
    if (confirm(`¿Está seguro de que desea eliminar el usuario con documento ${documento}?`)) {
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      existingUsers.splice(index, 1);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
      
      this.updateUsersList();
      this.showMessage('Usuario eliminado correctamente.', 'success');
      
      // Si no hay más usuarios, ocultar el panel
      if (existingUsers.length === 0) {
        this.usersPanel.style.display = 'none';
      }
    }
  }
}

// Error Handler para el registro
class ErrorHandler {
    static handleError(error, context = '') {
        console.error(`Error en ${context}:`, error);
        
        // Mostrar mensaje de error al usuario
        const message = document.getElementById('registroMensaje');
        if (message) {
            message.textContent = `Ha ocurrido un error. Por favor, inténtelo de nuevo.`;
            message.className = 'registro-mensaje error';
            message.style.display = 'block';
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                message.style.display = 'none';
            }, 5000);
        }
    }
}

// ===========================
// ENHANCED REGISTRATION FORM ANIMATIONS
// ===========================

// Enhanced Animation System for Registration
class RegistrationAnimations {
  constructor() {
    this.init();
  }

  init() {
    this.setupPageTransitions();
    this.setupFormAnimations();
    this.setupProgressIndicator();
  }

  setupPageTransitions() {
    // Add smooth page entry animation
    const registroSection = document.querySelector('.registro-section');
    if (registroSection) {
      registroSection.classList.add('scroll-reveal');
      
      // Trigger animation after page load
      setTimeout(() => {
        registroSection.classList.add('revealed');
      }, 500);
    }
  }

  setupFormAnimations() {
    // Staggered form field animations
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
      group.style.opacity = '0';
      group.style.transform = 'translateY(30px)';
      group.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      
      setTimeout(() => {
        group.style.opacity = '1';
        group.style.transform = 'translateY(0)';
      }, index * 100 + 800);
    });

    // Enhanced role tab animations
    const roleTabs = document.querySelectorAll('.role-tab');
    roleTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Add ripple effect
        this.createRippleEffect(tab);
        
        // Smooth transition for admin fields
        const adminFields = document.getElementById('adminFields');
        if (adminFields) {
          if (tab.dataset.role === 'administrador') {
            adminFields.style.maxHeight = '0';
            adminFields.style.opacity = '0';
            adminFields.style.display = 'block';
            
            setTimeout(() => {
              adminFields.style.maxHeight = '500px';
              adminFields.style.opacity = '1';
            }, 100);
          } else {
            adminFields.style.maxHeight = '0';
            adminFields.style.opacity = '0';
            
            setTimeout(() => {
              adminFields.style.display = 'none';
            }, 300);
          }
        }
      });
    });
  }

  setupProgressIndicator() {
    // Visual progress indicator for form completion
    const form = document.getElementById('registroForm');
    if (!form) return;

    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'form-progress';
    progressBar.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <div class="progress-text">Completando registro...</div>
    `;
    
    const formHeader = document.querySelector('.registro-header');
    if (formHeader) {
      formHeader.appendChild(progressBar);
    }

    // Track form completion
    const inputs = form.querySelectorAll('input[required], select[required]');
    const progressFill = progressBar.querySelector('.progress-fill');
    const progressText = progressBar.querySelector('.progress-text');

    const updateProgress = () => {
      const filledInputs = Array.from(inputs).filter(input => {
        return input.value.trim() !== '';
      });
      
      const progress = (filledInputs.length / inputs.length) * 100;
      progressFill.style.width = progress + '%';
      
      if (progress === 100) {
        progressText.textContent = '¡Formulario completo!';
        progressBar.classList.add('complete');
      } else {
        progressText.textContent = `Progreso: ${Math.round(progress)}%`;
        progressBar.classList.remove('complete');
      }
    };

    inputs.forEach(input => {
      input.addEventListener('input', updateProgress);
    });

    // Initial progress check
    updateProgress();
  }

  createRippleEffect(element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width / 2) - (size / 2) + 'px';
    ripple.style.top = (rect.height / 2) - (size / 2) + 'px';
    ripple.classList.add('ripple-effect');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
}

// Inicializar el formulario de registro cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new RegistroManager();
  new RegistrationAnimations();
});
