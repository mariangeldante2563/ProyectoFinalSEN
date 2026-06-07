//RECUPERACIÓN DE CONTRASEÑA OJO // 

class RecoveryManager {
  constructor() {
    this.currentStep = 1;
    this.verificationCode = '';
    this.userData = null;
    this.backendUrl = 'http://localhost:5000/api/auth';
    this.init();
  }

  init() {
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
    
    // Botón para reenviar código
    const resendCodeBtn = document.getElementById('resendCodeBtn');
    if (resendCodeBtn) {
      resendCodeBtn.addEventListener('click', () => {
        this.resendVerificationCode();
      });
    }
    
    // Botón para volver atrás
    const backToIdentityBtn = document.getElementById('backToIdentityBtn');
    if (backToIdentityBtn) {
      backToIdentityBtn.addEventListener('click', () => {
        this.showStep(1);
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

  async handleIdentityForm() {
    const numeroDocumento = document.getElementById('numeroDocumento').value.trim();
    const correoElectronico = document.getElementById('correoElectronico').value.trim();

    // Validar campos
    const isDocumentoValid = this.validateField('numeroDocumento');
    const isCorreoValid = this.validateField('correoElectronico');

    if (!isDocumentoValid || !isCorreoValid) {
      return;
    }

    this.showMessage('identityResult', 'Verificando información...', 'info');

    try {
      const response = await fetch(`${this.backendUrl}/recover-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ correoElectronico, numeroDocumento })
      });

      const data = await response.json();

      if (!response.ok) {
        this.showMessage('identityResult', data.message || 'Error al verificar la cuenta', 'error');
        return;
      }

      this.userData = { numeroDocumento, correoElectronico };
      this.showMessage('identityResult', data.message || 'Código enviado al correo electrónico', 'success');

      if (data.debugCode) {
        const debugMessage = `Código de verificación: ${data.debugCode}`;
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast(debugMessage, 'info', 10000);
        } else {
          console.log(debugMessage);
        }
      }

      setTimeout(() => {
        this.showStep(2);
      }, 1500);
    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      this.showMessage('identityResult', 'Error al conectar con el servidor', 'error');
    }
  }

  async handleVerificationForm() {
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

    if (!this.userData || !this.userData.correoElectronico) {
      this.showMessage('verificationResult', 'Error interno. Por favor regrese al primer paso.', 'error');
      return;
    }

    try {
      const response = await fetch(`${this.backendUrl}/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ correoElectronico: this.userData.correoElectronico, codigoVerificacion: codigo })
      });

      const data = await response.json();

      if (!response.ok) {
        this.showMessage('verificationResult', data.message || 'Código de verificación incorrecto', 'error');
        return;
      }

      this.showMessage('verificationResult', data.message || 'Código verificado correctamente', 'success');
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast('Código verificado correctamente', 'success');
      }

      setTimeout(() => {
        this.showStep(3);
      }, 1000);
    } catch (error) {
      console.error('Error al verificar el código:', error);
      this.showMessage('verificationResult', 'Error al conectar con el servidor', 'error');
    }
  }

  async handlePasswordForm() {
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
    
    try {
      const response = await fetch(`${this.backendUrl}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correoElectronico: this.userData.correoElectronico,
          codigoVerificacion: document.getElementById('codigoVerificacion').value.trim(),
          newPassword: nuevaPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        this.showMessage('passwordResult', data.message || 'Error al restablecer la contraseña', 'error');
        return;
      }

      this.showMessage('passwordResult', data.message || '¡Contraseña actualizada correctamente!', 'success');
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast('Contraseña actualizada exitosamente', 'success');
      }

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      this.showMessage('passwordResult', 'Error al conectar con el servidor', 'error');
    }
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
  
  async resendVerificationCode() {
    if (!this.userData || !this.userData.correoElectronico || !this.userData.numeroDocumento) {
      this.showMessage('verificationResult', 'Error al reenviar el código. Por favor, vuelva a la primera etapa.', 'error');
      return;
    }

    try {
      const response = await fetch(`${this.backendUrl}/recover-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correoElectronico: this.userData.correoElectronico,
          numeroDocumento: this.userData.numeroDocumento
        })
      });

      const data = await response.json();

      if (!response.ok) {
        this.showMessage('verificationResult', data.message || 'Error al reenviar el código', 'error');
        return;
      }

      this.showMessage('verificationResult', data.message || 'Código reenviado correctamente', 'success');

      if (data.debugCode) {
        const debugMessage = `Código de verificación: ${data.debugCode}`;
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast(debugMessage, 'info', 10000);
        } else {
          console.log(debugMessage);
        }
      }
    } catch (error) {
      console.error('Error al reenviar código:', error);
      this.showMessage('verificationResult', 'Error al conectar con el servidor', 'error');
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  const recoveryManager = new RecoveryManager();
});
