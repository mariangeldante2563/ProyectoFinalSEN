/**
<<<<<<< HEAD
 * @version 1.0.0
 * @description 
=======
 * IN OUT MANAGER - NOTIFICACIONES Y MENSAJES
 * @version 1.0.0
 * @description Módulo para manejo centralizado de notificaciones y mensajes al usuario
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */

class NotificationManager {
  /**
<<<<<<< HEAD
   * @param {string} message 
   * @param {string} type 
   * @param {number} duration 
   */
  static showToast(message, type = 'info', duration = 3000) {

=======
   * Muestra una notificación estilo toast al usuario
   * 
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación ('success', 'error', 'warning', 'info')
   * @param {number} duration - Duración en milisegundos
   */
  static showToast(message, type = 'info', duration = 3000) {
    // Crear contenedor si no existe
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      document.body.appendChild(toastContainer);
<<<<<<< HEAD

=======
      
      // Estilos para el contenedor
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      toastContainer.style.position = 'fixed';
      toastContainer.style.bottom = '20px';
      toastContainer.style.right = '20px';
      toastContainer.style.zIndex = '9999';
      toastContainer.style.display = 'flex';
      toastContainer.style.flexDirection = 'column-reverse';
      toastContainer.style.gap = '10px';
    }
<<<<<<< HEAD

=======
    
    // Crear elemento toast
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
<<<<<<< HEAD

=======
    
    // Definir estilos por tipo
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const baseStyle = 'padding: 12px 20px; border-radius: 4px; box-shadow: 0 3px 10px rgba(0,0,0,0.2); ' +
                     'margin-bottom: 8px; font-size: 14px; display: flex; align-items: center; ' +
                     'min-width: 280px; max-width: 350px; opacity: 0; transform: translateX(50px); ' +
                     'transition: all 0.3s ease;';
    
    const typeStyles = {
      success: 'background-color: #dff2bf; color: #4F8A10; border-left: 4px solid #4F8A10;',
      error: 'background-color: #ffbaba; color: #D8000C; border-left: 4px solid #D8000C;',
      warning: 'background-color: #feefb3; color: #9F6000; border-left: 4px solid #9F6000;',
      info: 'background-color: #bde5f8; color: #00529B; border-left: 4px solid #00529B;'
    };
    
    toast.style.cssText = baseStyle + (typeStyles[type] || typeStyles.info);
<<<<<<< HEAD

=======
    
    // Icono según tipo
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
<<<<<<< HEAD
=======
    
    // Contenido del toast
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    toast.innerHTML = `
      <div style="margin-right: 10px; font-weight: bold; font-size: 18px;">${icons[type] || icons.info}</div>
      <div style="flex-grow: 1;">${message}</div>
      <div class="toast-close" style="cursor: pointer; margin-left: 10px;">×</div>
    `;
<<<<<<< HEAD

    toastContainer.appendChild(toast);
=======
    
    // Añadir al DOM
    toastContainer.appendChild(toast);
    
    // Animar entrada
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 10);
<<<<<<< HEAD
=======
    
    // Configurar botón de cerrar
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const closeButton = toast.querySelector('.toast-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.hideToast(toast));
    }
<<<<<<< HEAD

=======
    
    // Auto-ocultar después de la duración
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (duration > 0) {
      setTimeout(() => this.hideToast(toast), duration);
    }
    
    return toast;
  }
  
  /**
<<<<<<< HEAD
   * @param {HTMLElement} toast
=======
   * Oculta una notificación toast
   * 
   * @param {HTMLElement} toast - Elemento DOM del toast
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  static hideToast(toast) {
    if (!toast) return;
    
<<<<<<< HEAD
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    
    setTimeout(() => {
      toast.remove();
=======
    // Animar salida
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    
    // Eliminar del DOM
    setTimeout(() => {
      toast.remove();
      
      // Eliminar el contenedor si no hay más toasts
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      const container = document.getElementById('toast-container');
      if (container && !container.hasChildNodes()) {
        container.remove();
      }
    }, 300);
  }
  
  /**
<<<<<<< HEAD
   * @param {string} message 
   * @param {string} title 
   * @param {string} okText 
   * @param {string} cancelText 
   * @returns {Promise<boolean>} 
   */
  static async confirm(message, title = 'Confirmar', okText = 'Aceptar', cancelText = 'Cancelar') {
    return new Promise((resolve) => {
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
=======
   * Muestra un diálogo de confirmación al usuario
   * 
   * @param {string} message - Mensaje a mostrar
   * @param {string} title - Título del diálogo
   * @param {string} okText - Texto del botón de confirmación
   * @param {string} cancelText - Texto del botón de cancelación
   * @returns {Promise<boolean>} - Promesa que se resuelve con true (confirmación) o false (cancelación)
   */
  static async confirm(message, title = 'Confirmar', okText = 'Aceptar', cancelText = 'Cancelar') {
    return new Promise((resolve) => {
      // Verificar si la API de modal está disponible
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        // Implementación con Bootstrap (no disponible en este proyecto)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        resolve(confirm(message));
        return;
      }
      
<<<<<<< HEAD
      if ('showModal' in document.createElement('dialog')) {

        const dialog = document.createElement('dialog');
        dialog.className = 'confirm-dialog';

        dialog.style.cssText = 'padding: 0; border: none; border-radius: 8px; ' +
                              'box-shadow: 0 5px 15px rgba(0,0,0,0.3); max-width: 400px; width: 90%;';

=======
      // Verificar si el navegador soporta dialog
      if ('showModal' in document.createElement('dialog')) {
        // Crear diálogo
        const dialog = document.createElement('dialog');
        dialog.className = 'confirm-dialog';
        
        // Estilos para el diálogo
        dialog.style.cssText = 'padding: 0; border: none; border-radius: 8px; ' +
                              'box-shadow: 0 5px 15px rgba(0,0,0,0.3); max-width: 400px; width: 90%;';
        
        // Contenido del diálogo
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        dialog.innerHTML = `
          <div style="padding: 16px; border-bottom: 1px solid #eee;">
            <h3 style="margin: 0; font-size: 18px;">${title}</h3>
          </div>
          <div style="padding: 20px; font-size: 14px;">
            ${message}
          </div>
          <div style="padding: 16px; display: flex; justify-content: flex-end; gap: 8px; background: #f9f9f9;">
            <button id="cancelBtn" style="padding: 8px 16px; border: none; background: #e0e0e0; border-radius: 4px; cursor: pointer;">
              ${cancelText}
            </button>
            <button id="okBtn" style="padding: 8px 16px; border: none; background: #4285f4; color: white; border-radius: 4px; cursor: pointer;">
              ${okText}
            </button>
          </div>
        `;
<<<<<<< HEAD

        document.body.appendChild(dialog);
=======
        
        // Añadir al DOM
        document.body.appendChild(dialog);
        
        // Configurar botones
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        const okBtn = dialog.querySelector('#okBtn');
        const cancelBtn = dialog.querySelector('#cancelBtn');
        
        okBtn.addEventListener('click', () => {
          dialog.close();
          dialog.remove();
          resolve(true);
        });
<<<<<<< HEAD
=======
        
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        cancelBtn.addEventListener('click', () => {
          dialog.close();
          dialog.remove();
          resolve(false);
        });
<<<<<<< HEAD
        dialog.showModal();
      } else {
=======
        
        // Mostrar diálogo
        dialog.showModal();
      } else {
        // Fallback a confirm nativo
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
        resolve(confirm(message));
      }
    });
  }
  
  /**
<<<<<<< HEAD
   * @param {HTMLElement} element 
   * @param {string} message 
   */
  static showFieldError(element, message) {
    if (!element) return;

    this.clearFieldError(element);
=======
   * Muestra un mensaje de error en un elemento del DOM
   * 
   * @param {HTMLElement} element - Elemento donde mostrar el error
   * @param {string} message - Mensaje de error
   */
  static showFieldError(element, message) {
    if (!element) return;
    
    // Limpiar error previo
    this.clearFieldError(element);
    
    // Crear elemento de error
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
<<<<<<< HEAD
    errorDiv.style.cssText = 'color: #D8000C; font-size: 12px; margin-top: 4px;';
    element.classList.add('error');
    element.setAttribute('aria-invalid', 'true');
=======
    
    // Estilos para el error
    errorDiv.style.cssText = 'color: #D8000C; font-size: 12px; margin-top: 4px;';
    
    // Añadir clase de error al campo
    element.classList.add('error');
    element.setAttribute('aria-invalid', 'true');
    
    // Añadir mensaje después del elemento
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    if (element.parentElement) {
      element.parentElement.appendChild(errorDiv);
    }
  }
  
  /**
<<<<<<< HEAD
   * 
   * @param {HTMLElement} element
   */
  static clearFieldError(element) {
    if (!element || !element.parentElement) return;
=======
   * Limpia un mensaje de error de un elemento
   * 
   * @param {HTMLElement} element - Elemento del que limpiar el error
   */
  static clearFieldError(element) {
    if (!element || !element.parentElement) return;
    
    // Buscar y eliminar mensaje de error
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const errorDiv = element.parentElement.querySelector('.error-message');
    if (errorDiv) {
      errorDiv.remove();
    }
<<<<<<< HEAD
=======
    
    // Limpiar clase de error
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    element.classList.remove('error');
    element.setAttribute('aria-invalid', 'false');
  }
  
  /**
<<<<<<< HEAD
   * @param {string} message 
   * @returns {Object} 
   */
  static showLoader(message = 'Cargando...') {

=======
   * Muestra un mensaje de carga
   * 
   * @param {string} message - Mensaje a mostrar
   * @returns {Object} - Objeto con método hide para ocultar el loader
   */
  static showLoader(message = 'Cargando...') {
    // Crear overlay
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const overlay = document.createElement('div');
    overlay.className = 'loader-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; ' +
                          'background-color: rgba(0,0,0,0.5); z-index: 9999; display: flex; ' +
                          'align-items: center; justify-content: center; flex-direction: column;';
    
<<<<<<< HEAD

=======
    // Crear spinner
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const spinner = document.createElement('div');
    spinner.className = 'loader-spinner';
    spinner.style.cssText = 'border: 5px solid #f3f3f3; border-top: 5px solid #3498db; ' +
                           'border-radius: 50%; width: 50px; height: 50px; animation: spin 2s linear infinite;';
<<<<<<< HEAD

=======
    
    // Crear mensaje
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const messageDiv = document.createElement('div');
    messageDiv.className = 'loader-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = 'color: white; margin-top: 15px; font-size: 16px;';
<<<<<<< HEAD

    const style = document.createElement('style');
    style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
    document.head.appendChild(style);

=======
    
    // Añadir estilos de animación
    const style = document.createElement('style');
    style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
    document.head.appendChild(style);
    
    // Construir y añadir al DOM
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    overlay.appendChild(spinner);
    overlay.appendChild(messageDiv);
    document.body.appendChild(overlay);
    
<<<<<<< HEAD
=======
    // Método para ocultar
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    return {
      hide: () => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          overlay.remove();
        }, 300);
      },
      updateMessage: (newMessage) => {
        messageDiv.textContent = newMessage;
      }
    };
  }
}

<<<<<<< HEAD
=======
// Exportar clase para uso en otros módulos
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationManager;
}