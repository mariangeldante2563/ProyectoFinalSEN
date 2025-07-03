// ===========================
// FUNCIONALIDAD DE RECUPERACIÓN DE CONTRASEÑA
// ===========================

class PasswordRecoveryManager {
  constructor() {
    try {
      // Referencias a elementos del DOM - Formularios
      this.solicitudForm = document.getElementById('solicitudForm');
      this.verificacionForm = document.getElementById('verificacionForm');
      this.nuevaPasswordForm = document.getElementById('nuevaPasswordForm');
      
      // Referencias a elementos del DOM - Pasos
      this.step1 = document.getElementById('step1');
      this.step2 = document.getElementById('step2');
      this.step3 = document.getElementById('step3');
      
      // Referencias a elementos del DOM - Campos
      this.numeroDocumento = document.getElementById('numeroDocumento');
      this.correoElectronico = document.getElementById('correoElectronico');
      this.codigoVerificacion = document.getElementById('codigoVerificacion');
      this.nuevaPassword = document.getElementById('nuevaPassword');
      this.confirmPassword = document.getElementById('confirmPassword');
      
      // Referencias a elementos del DOM - Botones
      this.reenviarCodigoBtn = document.getElementById('reenviarCodigoBtn');
      
      // Referencias a elementos del DOM - Mensajes
      this.mensajeContainer = document.getElementById('recuperacionMensaje');
      
      // Variables de estado
      this.currentStep = 1;
      this.verificationCode = '';
      this.userData = null;
      
      this.init();
    } catch (error) {
      console.error('Error al inicializar el recuperador de contraseña:', error);
    }
  }
  
  init() {
    // Inicializar eventos de formularios
    this.setupFormEvents();
    
    // Mostrar el primer paso
    this.showCurrentStep();
  }
  
  setupFormEvents() {
    // Eventos para el formulario de solicitud
    if (this.solicitudForm) {
      this.solicitudForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSolicitudSubmit();
      });
    }
    
    // Eventos para el formulario de verificación
    if (this.verificacionForm) {
      this.verificacionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleVerificacionSubmit();
      });
    }
    
    // Eventos para el formulario de nueva contraseña
    if (this.nuevaPasswordForm) {
      this.nuevaPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleNuevaPasswordSubmit();
      });
    }
    
    // Evento para reenviar código
    if (this.reenviarCodigoBtn) {
      this.reenviarCodigoBtn.addEventListener('click', () => {
        this.generateAndSendCode();
      });
    }
  }
  
  showCurrentStep() {
    // Ocultar todos los formularios
    this.solicitudForm.style.display = 'none';
    this.verificacionForm.style.display = 'none';
    this.nuevaPasswordForm.style.display = 'none';
    
    // Actualizar clases de los pasos
    this.step1.classList.remove('active', 'completed');
    this.step2.classList.remove('active', 'completed');
    this.step3.classList.remove('active', 'completed');
    
    // Mostrar el formulario actual y actualizar los pasos
    switch (this.currentStep) {
      case 1:
        this.solicitudForm.style.display = 'block';
        this.step1.classList.add('active');
        break;
      case 2:
        this.verificacionForm.style.display = 'block';
        this.step1.classList.add('completed');
        this.step2.classList.add('active');
        break;
      case 3:
        this.nuevaPasswordForm.style.display = 'block';
        this.step1.classList.add('completed');
        this.step2.classList.add('completed');
        this.step3.classList.add('active');
        break;
    }
  }
  
  async handleSolicitudSubmit() {
    try {
      // Validar el formulario
      if (!this.validateSolicitudForm()) {
        return;
      }
      
      // Mostrar mensaje de procesamiento
      this.showMessage('Verificando información...', 'warning');
      
      // Obtener datos del formulario
      const numeroDocumento = this.numeroDocumento.value.trim();
      const correoElectronico = this.correoElectronico.value.trim();
      
      // Verificar si existe el usuario
      const userData = this.findUserByDocumentoAndEmail(numeroDocumento, correoElectronico);
      
      if (!userData) {
        this.showMessage('No se encontró ningún usuario con los datos proporcionados.', 'error');
        return;
      }
      
      // Guardar datos del usuario para uso posterior
      this.userData = userData;
      
      // Generar y enviar código de verificación
      await this.generateAndSendCode();
      
      // Avanzar al siguiente paso
      this.currentStep = 2;
      this.showCurrentStep();
      
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      this.showMessage('Error al procesar la solicitud. Intente nuevamente.', 'error');
    }
  }
  
  async generateAndSendCode() {
    try {
      // Mostrar mensaje de procesamiento
      this.showMessage('Enviando código de verificación...', 'warning');
      
      // Generar código aleatorio (6 caracteres alfanuméricos)
      this.verificationCode = this.generateRandomCode(6);
      
      // Simular envío de código (en una aplicación real, aquí se enviaría por email)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mostrar mensaje de éxito
      this.showMessage(`Se ha enviado un código de verificación a ${this.maskEmail(this.userData.correoElectronico)}`, 'success');
      
      // En una aplicación de demostración, mostrar el código en la consola
      console.info('Código de verificación generado:', this.verificationCode);
      
    } catch (error) {
      console.error('Error al generar y enviar código:', error);
      this.showMessage('Error al enviar el código. Intente nuevamente.', 'error');
    }
  }
  
  async handleVerificacionSubmit() {
    try {
      // Validar código de verificación
      const inputCode = this.codigoVerificacion.value.trim();
      
      if (!inputCode) {
        this.showMessage('Debe ingresar el código de verificación.', 'error');
        return;
      }
      
      // Verificar si el código coincide
      if (inputCode !== this.verificationCode) {
        this.showMessage('El código de verificación es incorrecto. Intente nuevamente.', 'error');
        return;
      }
      
      // Mostrar mensaje de éxito
      this.showMessage('Código verificado correctamente.', 'success');
      
      // Avanzar al siguiente paso
      this.currentStep = 3;
      this.showCurrentStep();
      
    } catch (error) {
      console.error('Error al verificar el código:', error);
      this.showMessage('Error al verificar el código. Intente nuevamente.', 'error');
    }
  }
  
  async handleNuevaPasswordSubmit() {
    try {
      // Validar el formulario de nueva contraseña
      if (!this.validatePasswordForm()) {
        return;
      }
      
      // Mostrar mensaje de procesamiento
      this.showMessage('Actualizando contraseña...', 'warning');
      
      // Obtener la nueva contraseña
      const nuevaPassword = this.nuevaPassword.value.trim();
      
      // Actualizar la contraseña del usuario en localStorage
      this.updateUserPassword(nuevaPassword);
      
      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mostrar mensaje de éxito
      this.showMessage('¡Contraseña actualizada correctamente! Será redirigido al login en unos segundos...', 'success');
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 3000);
      
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error);
      this.showMessage('Error al actualizar la contraseña. Intente nuevamente.', 'error');
    }
  }
  
  validateSolicitudForm() {
    const numeroDocumento = this.numeroDocumento.value.trim();
    const correoElectronico = this.correoElectronico.value.trim();
    
    if (!numeroDocumento) {
      this.showMessage('Debe ingresar el número de documento.', 'error');
      return false;
    }
    
    if (!/^[0-9]{6,12}$/.test(numeroDocumento)) {
      this.showMessage('El número de documento debe contener entre 6 y 12 dígitos.', 'error');
      return false;
    }
    
    if (!correoElectronico) {
      this.showMessage('Debe ingresar el correo electrónico.', 'error');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoElectronico)) {
      this.showMessage('Debe ingresar un correo electrónico válido.', 'error');
      return false;
    }
    
    return true;
  }
  
  validatePasswordForm() {
    const nuevaPassword = this.nuevaPassword.value.trim();
    const confirmPassword = this.confirmPassword.value.trim();
    
    if (!nuevaPassword) {
      this.showMessage('Debe ingresar la nueva contraseña.', 'error');
      return false;
    }
    
    if (nuevaPassword.length < 6) {
      this.showMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
      return false;
    }
    
    if (!confirmPassword) {
      this.showMessage('Debe confirmar la nueva contraseña.', 'error');
      return false;
    }
    
    if (nuevaPassword !== confirmPassword) {
      this.showMessage('Las contraseñas no coinciden.', 'error');
      return false;
    }
    
    return true;
  }
  
  findUserByDocumentoAndEmail(documento, email) {
    try {
      // Obtener usuarios registrados del localStorage
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Buscar usuario que coincida con documento y correo
      return users.find(user => 
        user.numeroDocumento === documento && 
        user.correoElectronico.toLowerCase() === email.toLowerCase()
      );
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      return null;
    }
  }
  
  updateUserPassword(newPassword) {
    try {
      if (!this.userData) {
        throw new Error('No hay datos de usuario para actualizar');
      }
      
      // Obtener usuarios registrados
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Encontrar el índice del usuario a actualizar
      const userIndex = users.findIndex(user => user.id === this.userData.id);
      
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
      }
      
      // Actualizar contraseña (usando el mismo método de encriptación que en registro)
      users[userIndex].password = this.securePassword(newPassword);
      
      // Guardar usuarios actualizados en localStorage
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      throw error;
    }
  }
  
  securePassword(password) {
    // En una aplicación real, usaríamos una función hash segura
    // Para esta demo, usamos el mismo método que en registro.js
    return btoa(password + "_salted");
  }
  
  generateRandomCode(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset.charAt(randomIndex);
    }
    return result;
  }
  
  maskEmail(email) {
    if (!email) return '';
    
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    
    const name = parts[0];
    const domain = parts[1];
    
    // Mostrar solo los primeros 2 y últimos 2 caracteres del nombre de usuario
    const maskedName = name.length <= 4 
      ? name.charAt(0) + '*'.repeat(name.length - 1)
      : name.substring(0, 2) + '*'.repeat(name.length - 4) + name.substring(name.length - 2);
    
    return `${maskedName}@${domain}`;
  }
  
  showMessage(message, type) {
    if (!this.mensajeContainer) return;
    
    this.mensajeContainer.textContent = message;
    this.mensajeContainer.className = `registro-mensaje ${type}`;
    this.mensajeContainer.style.display = 'block';
    
    // Desplazarse al mensaje
    this.mensajeContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-ocultar mensajes de éxito después de 5 segundos
    if (type === 'success') {
      setTimeout(() => {
        this.mensajeContainer.style.display = 'none';
      }, 5000);
    }
  }
}

// Inicializar el gestor de recuperación de contraseña cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new PasswordRecoveryManager();
});
