// -----------------------------------------
// FUNCIONALIDAD DEL FORMULARIO DE REGISTRO
// -----------------------------------------

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
        this.showMessage('Error al inicializar el formulario. Recargue la página.', 'error');
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
      // Error manejado silenciosamente
    }
  }

  setupRoleTabs() {
    // Selector de rol mejorado y campos de administrador
    const roleTabs = document.querySelectorAll('.role-tab');
    const adminFields = document.getElementById('adminFields');
    const tipoUsuarioInput = document.getElementById('tipoUsuario');
    const roleDescription = document.getElementById('roleDescription');
    const codigoAdmin = document.getElementById('codigoAdmin');
    const departamento = document.getElementById('departamento');

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
          roleDescription.innerHTML = '<span>Complete los campos adicionales para administradores.</span>';
          // Hacer requeridos los campos de admin
          codigoAdmin.setAttribute('required', 'required');
          departamento.setAttribute('required', 'required');
        } else {
          adminFields.style.display = 'none';
          roleDescription.innerHTML = '<span>Complete los campos para registro de empleado.</span>';
          // Quitar requeridos
          codigoAdmin.removeAttribute('required');
          departamento.removeAttribute('required');
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
    // Validación en submit
    const inputs = this.form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
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
        } else if (this.tipoUsuarioInput.value === 'administrador' && value && !this.validateAdminCode(value)) {
          isValid = false;
          errorMessage = 'El código debe cumplir con todos los requisitos de seguridad';
        }
        break;
    }

    this.showFieldValidation(field, isValid, errorMessage);
    return isValid;
  }

  showFieldValidation(field, isValid, errorMessage) {
    // Usar NotificationManager si está disponible
    if (typeof NotificationManager !== 'undefined') {
      if (!isValid && errorMessage) {
        NotificationManager.showFieldError(field, errorMessage);
      } else {
        NotificationManager.clearFieldError(field);
      }
      return;
    }
    
    // Fallback al método antiguo
    // Remover mensajes de error anteriores
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    // Remover clases de validación anteriores
    field.classList.remove('password-mismatch', 'password-match', 'field-error-highlight');

    if (!isValid && errorMessage) {
      // Crear mensaje de error
      const errorDiv = document.createElement('div');
      errorDiv.className = field.type === 'password' ? 'field-error password-error' : 'field-error';
      errorDiv.textContent = errorMessage;
      
      // Insertar después del campo o su contenedor
      const inputContainer = field.closest('.input-container');
      if (inputContainer) {
        inputContainer.appendChild(errorDiv);
      } else {
        field.parentNode.appendChild(errorDiv);
      }

      // Resaltar el campo con error
      field.classList.add('field-error-highlight');
      
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
    // Usar NotificationManager si está disponible
    if (typeof NotificationManager !== 'undefined') {
      NotificationManager.clearFieldError(field);
      return;
    }
    
    // Fallback al método antiguo
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
      // Limpiar mensajes de error previos
      this.mensajeContainer.style.display = 'none';
      
      // Validar todos los campos
      const isFormValid = this.validateForm();
      
      if (!isFormValid) {
        // El mensaje de error específico se maneja en validateForm
        return;
      }

      // Mostrar mensaje de procesamiento
      this.showMessage('Procesando registro...', 'warning');

      // Obtener datos del formulario
      const formData = this.getFormData();
      
      // Validaciones adicionales para administradores
      if (formData.tipoUsuario === 'administrador') {
        const isValidAdminCode = this.validateAdminCode(formData.codigoAdmin);
        if (!isValidAdminCode) {
          this.showMessage('El código de administrador no cumple con los requisitos de seguridad. Revise los requisitos indicados.', 'error');
          return;
        }
      }

      // Verificar si el documento ya existe
      if (this.isDocumentExists(formData.numeroDocumento)) {
        this.showMessage('Este número de documento ya está registrado.', 'error');
        return;
      }

      // Guardar en localStorage
      this.saveUserData(formData);

      // Mostrar mensaje de éxito
      this.showMessage(
        `¡Registro exitoso! Bienvenido/a ${formData.nombreCompleto}. Su registro como ${formData.tipoUsuario} ha sido completado.`,
        'success'
      );

      // Actualizar lista de usuarios
      this.updateUsersList();
      this.showUsersPanel();
      
      // Redireccionar después de mostrar mensaje
      setTimeout(() => {
        window.location.href = '../../proyectopages/index.html';
      }, 3000);

    } catch (error) {
      this.showMessage('Error inesperado. Por favor, intente nuevamente.', 'error');
    }
  }

  validateForm() {
    const inputs = this.form.querySelectorAll('input, select');
    let isValid = true;
    let errorFields = [];

    inputs.forEach(input => {
      // Solo validar campos visibles y relevantes para el tipo de usuario actual
      const isAdminField = input.closest('#adminFields') !== null;
      const isUserAdmin = this.tipoUsuarioInput.value === 'administrador';
      
      // No validar campos de admin si el usuario no es admin
      if (isAdminField && !isUserAdmin) {
        return;
      }
      
      if (!this.validateField(input)) {
        isValid = false;
        errorFields.push(input.labels ? input.labels[0].textContent.trim() : input.name);
      }
    });

    // Si hay errores, mostrarlos específicamente
    if (!isValid) {
      const errorMessage = `Por favor corrija los siguientes campos: ${errorFields.join(', ')}`;
      this.showMessage(errorMessage, 'error');
    }

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
    data.id = Date.now().toString();
    
    return data;
  }

  validateAdminCode(code) {
    if (!code) return false;

    // Validar los requisitos de seguridad
    const minLength = code.length >= 15;
    const hasUppercase = /[A-Z]/.test(code);
    const hasNumber = /[0-9]/.test(code);
    const hasSymbol = /[\/\*\+\$\%]/.test(code);

    // Actualizar indicadores visuales si el campo está visible
    const adminFields = document.getElementById('adminFields');
    if (adminFields && adminFields.style.display !== 'none') {
      this.updateRequirementCheck('length-check', minLength);
      this.updateRequirementCheck('uppercase-check', hasUppercase);
      this.updateRequirementCheck('number-check', hasNumber);
      this.updateRequirementCheck('symbol-check', hasSymbol);
    }

    // Todos los requisitos deben cumplirse
    return minLength && hasUppercase && hasNumber && hasSymbol;
  }

  updateRequirementCheck(elementId, isValid) {
    const element = document.getElementById(elementId);
    if (element) {
      const icon = element.querySelector('i');
      if (isValid) {
        icon.className = 'fas fa-check-circle';
        element.classList.add('requirement-met');
        element.classList.remove('requirement-failed');
      } else {
        icon.className = 'fas fa-times-circle';
        element.classList.add('requirement-failed');
        element.classList.remove('requirement-met');
      }
    }
  }

  isDocumentExists(documento) {
    // Simular verificación en base de datos
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    return existingUsers.some(user => user.numeroDocumento === documento);
  }

  saveUserData(userData) {
    // Crear objeto con los datos del usuario
    const userToSave = {
      id: userData.id,
      nombreCompleto: userData.nombreCompleto,
      numeroDocumento: userData.numeroDocumento,
      correoElectronico: userData.correoElectronico,
      tipoUsuario: userData.tipoUsuario,
      fechaRegistro: userData.fechaRegistro,
      cargo: userData.cargo || '',
      horarioAsignado: userData.horarioAsignado || '',
      edad: userData.edad || '',
      telefono: userData.telefono || '',
      direccion: userData.direccion || ''
    };

    // Añadir campos específicos para administradores
    if (userData.tipoUsuario === 'administrador') {
      userToSave.departamento = userData.departamento || '';
      userToSave.codigoAdmin = userData.codigoAdmin;
    }

    // Guardar la contraseña con hash seguro
    if (typeof SecurityManager !== 'undefined') {
      // Usar el nuevo método de hash
      userToSave.password = SecurityManager.hashPassword(userData.password);
    } else {
      // Fallback al método antiguo
      userToSave.password = btoa(userData.password);
    }

    // Obtener usuarios existentes y agregar el nuevo
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    existingUsers.push(userToSave);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
  }
  
  showMessage(message, type) {
    // Usar NotificationManager si está disponible
    if (typeof NotificationManager !== 'undefined') {
      NotificationManager.showToast(message, type);
      return;
    }
    
    // Fallback al método antiguo
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

// Inicializar el formulario de registro cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new RegistroManager();
});
