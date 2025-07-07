// ===========================
// RECUPERACIÓN DE CONTRASEÑA OPTIMIZADA
// ===========================

class RecoveryManager {
  constructor() {
    this.currentStep = 1;
    this.verificationCode = '';
    this.userData = null;
    this.init();
  }

  init() {
    console.log('🚀 Inicializando sistema de recuperación...');
    this.setupEventListeners();
    this.showStep(1);
  }

  setupEventListeners() {
    // Formulario de identidad
    const identityForm = document.getElementById('identityForm');
    if (identityForm) {
      identityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleIdentityForm();
      });
    }

    // Formulario de verificación
    const verificationForm = document.getElementById('verificationForm');
    if (verificationForm) {
      verificationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleVerificationForm();
      });
    }

    // Formulario de nueva contraseña
    const passwordForm = document.getElementById('newPasswordForm');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePasswordForm();
      });
    }
  }

  validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return false;

    const value = field.value.trim();
    let isValid = true;
    let message = '';

    switch (fieldId) {
      case 'numeroDocumento':
        if (!value) {
          isValid = false;
          message = 'El número de documento es requerido';
        } else if (!/^[0-9]{6,12}$/.test(value)) {
          isValid = false;
          message = 'Debe tener entre 6 y 12 dígitos';
        }
        break;
      
      case 'correoElectronico':
        if (!value) {
          isValid = false;
          message = 'El correo electrónico es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          isValid = false;
          message = 'Ingrese un correo válido';
        }
        break;
    }

    this.showFieldError(fieldId + 'Error', message, !isValid);
    return isValid;
  }

  showFieldError(errorId, message, show) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      if (show) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
      } else {
        errorElement.classList.remove('show');
      }
    }
  }

  handleIdentityForm() {
    const numeroDocumento = document.getElementById('numeroDocumento').value.trim();
    const correoElectronico = document.getElementById('correoElectronico').value.trim();

    // Validar campos
    const isDocumentoValid = this.validateField('numeroDocumento');
    const isCorreoValid = this.validateField('correoElectronico');

    if (!isDocumentoValid || !isCorreoValid) {
      return;
    }

    this.showMessage('identityResult', 'Verificando información...', 'info');

    // Simular verificación exitosa
    this.userData = { numeroDocumento, correoElectronico };
    this.verificationCode = this.generateCode();
    
    this.showMessage('identityResult', `Código enviado a ${this.maskEmail(correoElectronico)}`, 'success');
    
    setTimeout(() => {
      this.showStep(2);
    }, 1500);
  }

  handleVerificationForm() {
    const codigo = document.getElementById('codigoVerificacion').value.trim().toUpperCase();
    
    if (!codigo) {
      this.showMessage('verificationResult', 'Ingrese el código de verificación', 'error');
      return;
    }

    if (codigo.length !== 6) {
      this.showMessage('verificationResult', 'El código debe tener 6 caracteres', 'error');
      return;
    }

    this.showMessage('verificationResult', 'Verificando código...', 'info');

    if (codigo !== this.verificationCode) {
      this.showMessage('verificationResult', 'Código incorrecto', 'error');
      return;
    }

    this.showMessage('verificationResult', 'Código verificado correctamente', 'success');
    
    setTimeout(() => {
      this.showStep(3);
    }, 1000);
  }

  handlePasswordForm() {
    const nuevaPassword = document.getElementById('nuevaPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!nuevaPassword || !confirmPassword) {
      this.showMessage('passwordResult', 'Complete todos los campos', 'error');
      return;
    }

    if (nuevaPassword.length < 8) {
      this.showMessage('passwordResult', 'La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }

    if (nuevaPassword !== confirmPassword) {
      this.showMessage('passwordResult', 'Las contraseñas no coinciden', 'error');
      return;
    }

    this.showMessage('passwordResult', '¡Contraseña establecida correctamente!', 'success');
    
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  }

  showStep(step) {
    this.currentStep = step;
    
    // Ocultar todos los formularios
    const forms = ['identityForm', 'verificationForm', 'newPasswordForm'];
    forms.forEach(formId => {
      const form = document.getElementById(formId);
      if (form) {
        form.style.display = 'none';
        form.classList.remove('active');
      }
    });

    // Actualizar indicadores de pasos
    for (let i = 1; i <= 3; i++) {
      const stepElement = document.getElementById(`step${i}`);
      if (stepElement) {
        stepElement.classList.remove('active', 'completed');
        if (i < step) {
          stepElement.classList.add('completed');
        } else if (i === step) {
          stepElement.classList.add('active');
        }
      }
    }

    // Mostrar formulario actual
    const formIds = ['', 'identityForm', 'verificationForm', 'newPasswordForm'];
    const currentForm = document.getElementById(formIds[step]);
    if (currentForm) {
      currentForm.style.display = 'block';
      currentForm.classList.add('active');
    }

    // Limpiar mensajes anteriores
    this.clearMessages();
  }

  showMessage(containerId, message, type) {
    const container = document.getElementById(containerId);
    if (container) {
      container.textContent = message;
      container.className = `result-message ${type}`;
      container.style.display = 'block';
    }
  }

  clearMessages() {
    const messageIds = ['identityResult', 'verificationResult', 'passwordResult'];
    messageIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = 'none';
      }
    });
  }

  generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  maskEmail(email) {
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + '***' + username.slice(-1);
    return maskedUsername + '@' + domain;
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  try {
    const recoveryManager = new RecoveryManager();
    console.log('✅ Sistema de recuperación inicializado');
  } catch (error) {
    console.error('❌ Error al inicializar:', error);
  }
});
