
// FUNCIONALIDAD DEL DASHBOARD DE EMPLEADO

class EmployeeDashboard extends BaseDashboard {
  constructor() {
    // Llamar al constructor de la clase base
    super('empleado');
    
    // Referencias a elementos del DOM
    this.employeeName = document.getElementById('employeeName');
    this.currentTime = document.getElementById('currentTime');
    this.currentDate = document.getElementById('currentDate');
    this.entryBtn = document.getElementById('entryBtn');
    this.exitBtn = document.getElementById('exitBtn');
    this.employeeRecords = document.getElementById('employeeRecords');
    this.profileName = document.getElementById('profileName');
    this.profileDoc = document.getElementById('profileDoc');
    this.profilePosition = document.getElementById('profilePosition');
    this.profileSchedule = document.getElementById('profileSchedule');
    this.profileEmail = document.getElementById('profileEmail');
    
    // Referencias para foto de perfil
    this.profileAvatar = document.getElementById('profileAvatar');
    // Buscar el input con cualquiera de los dos IDs posibles
    this.photoInput = document.getElementById('photoInput') || document.getElementById('profile-photo-input');
    this.uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    this.selectedFile = null;
    
    // Referencias para gráficas
    this.attendanceChartCanvas = document.getElementById('attendanceChartCanvas');
    this.weeklyChartTab = document.getElementById('weeklyChartTab');
    this.monthlyChartTab = document.getElementById('monthlyChartTab');
    
    // Estado actual de la gráfica
    this.currentChartPeriod = 'week'; // 'week' o 'month'
    this.attendanceChart = null; // instancia de Chart.js
  }
  
  // Método específico para inicializar el dashboard de empleado
  initSpecific() {
    console.log('Iniciando dashboard de empleado...');
    
    // Configurar botones de entrada/salida
    this.setupActionButtons();
    
    // Configurar funcionalidad de foto de perfil
    this.setupProfilePhotoUpload();
    
    // Cargar registros del empleado
    this.loadEmployeeRecords();
    
    // Cargar estadísticas del dashboard
    this.loadDashboardStats();
    
    // Iniciar actualización periódica de estadísticas (cada 30 segundos)
    setInterval(() => {
      this.loadDashboardStats();
    }, 30000);
    
    // Iniciar reloj en tiempo real
    this.startClock();
    
    // Configurar pestañas de gráficas
    this.setupChartTabs();
    
    // Inicializar gráficas
    this.initializeCharts();
    
    console.log('Dashboard de empleado inicializado correctamente');
  }
  
  // Configurar la funcionalidad de carga de fotos de perfil
  setupProfilePhotoUpload() {
    console.log('Configurando carga de foto de perfil...');
    
    // Verificar todos los elementos necesarios
    if (!this.photoInput) {
      console.error('Input de foto no encontrado. Buscando alternativas...');
      // Buscar alternativas para el input
      this.photoInput = document.getElementById('profile-photo-input');
      if (!this.photoInput) {
        console.error('No se encontró ningún input de foto');
      } else {
        console.log('Input de foto encontrado con ID alternativo');
      }
    }
    
    if (!this.uploadPhotoBtn) {
      console.error('Botón de upload no encontrado');
      // Intentar encontrarlo con una búsqueda más amplia
      this.uploadPhotoBtn = document.querySelector('button[id*="upload"]') || document.querySelector('button.upload-photo-btn');
    }
    
    if (!this.profileAvatar) {
      console.error('Avatar de perfil no encontrado');
      // Intentar encontrarlo con una búsqueda más amplia
      this.profileAvatar = document.querySelector('img[id*="avatar"]') || document.querySelector('img.profile-avatar');
    }
    
    // Verificar si se encontraron todos los elementos
    if (!this.photoInput || !this.uploadPhotoBtn || !this.profileAvatar) {
      console.error('No se pudieron encontrar todos los elementos necesarios para la carga de fotos');
      return;
    }
    
    console.log('Elementos para carga de foto encontrados:', {
      photoInput: this.photoInput.id || 'sin ID',
      uploadPhotoBtn: this.uploadPhotoBtn.id || 'sin ID',
      profileAvatar: this.profileAvatar.id || 'sin ID'
    });
    
    // Cargar foto actual del usuario si existe
    this.loadProfilePhoto();
    
    // Eliminar eventos anteriores si existen para prevenir duplicación
    const oldPhotoInput = this.photoInput.cloneNode(true);
    const oldUploadBtn = this.uploadPhotoBtn.cloneNode(true);
    
    if (this.photoInput.parentNode) {
      this.photoInput.parentNode.replaceChild(oldPhotoInput, this.photoInput);
      this.photoInput = oldPhotoInput;
    }
    
    if (this.uploadPhotoBtn.parentNode) {
      this.uploadPhotoBtn.parentNode.replaceChild(oldUploadBtn, this.uploadPhotoBtn);
      this.uploadPhotoBtn = oldUploadBtn;
    }
    
    // Escuchar cambios en el input de archivo
    this.photoInput.addEventListener('change', (event) => {
      console.log('Evento change detectado en input de foto');
      if (event.target.files && event.target.files[0]) {
        // Obtener el archivo seleccionado
        this.selectedFile = event.target.files[0];
        console.log('Archivo seleccionado:', this.selectedFile.name);
        
        // Validar que sea una imagen
        if (!this.selectedFile.type.match('image.*')) {
          console.error('El archivo no es una imagen válida');
          if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showToast('Por favor, seleccione una imagen válida.', 'error');
          } else {
            alert('Por favor, seleccione una imagen válida.');
          }
          this.selectedFile = null;
          return;
        }
        
        // Previsualizar la imagen
        const reader = new FileReader();
        reader.onload = (e) => {
          console.log('Previsualizando imagen');
          this.profileAvatar.src = e.target.result;
        };
        reader.readAsDataURL(this.selectedFile);
        
        // Habilitar el botón de subir
        this.uploadPhotoBtn.disabled = false;
      }
    });
    
    // Configurar botón de subida con un manejador más robusto
    console.log('Agregando evento click al botón de subida');
    this.uploadPhotoBtn.addEventListener('click', (event) => {
      console.log('Botón de subida clickeado');
      event.preventDefault(); // Prevenir comportamiento por defecto
      this.uploadProfilePhoto();
    });
  }
  
  // Cargar la foto de perfil actual
  loadProfilePhoto() {
    console.log('Cargando foto de perfil para el usuario:', this.currentUser.id);
    
    try {
      // Verificar si hay una foto guardada para este usuario
      const userPhotos = JSON.parse(localStorage.getItem('userProfilePhotos') || '{}');
      const photoData = userPhotos[this.currentUser.id];
      
      if (photoData) {
        console.log('Foto encontrada en localStorage');
        this.profileAvatar.src = photoData;
      } else {
        // Usar imagen predeterminada
        console.log('Usando imagen predeterminada');
        // Corregimos la ruta para usar .png en lugar de .svg
        this.profileAvatar.src = '../../assets/img/default-profile.png';
        
        // Verificar si la imagen existe, si no, intentar con otras rutas comunes
        this.profileAvatar.onerror = () => {
          console.warn('Imagen por defecto no encontrada, intentando rutas alternativas');
          
          // Intentar con una ruta alternativa
          this.profileAvatar.src = '../../assets/img/default-profile.jpg';
          
          // Si también falla, usar un avatar genérico en base64
          this.profileAvatar.onerror = () => {
            console.warn('Usando avatar genérico en base64');
            // Avatar genérico en base64 (imagen pequeña para no sobrecargar)
            this.profileAvatar.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAFWUlEQVR4nO2dbWhdRRTHf9ea2jR9QJNaK9HWVNTUl0BtFRFBsH6pgtYXFLFoa6E+fBDxA1J98QMK+qFWFKRFRQTB1iKCYPGpgvXdtonGptVardE0Tdr6sE327vcP9xrvzZ29c87M3jibe39w2M3O7jn/s3fv3Zkzc85FURRFURRFURRFURRFURRFURRFKTFltgzHTr16HphqWzkC7NoUf1cgim0DisSmpXBjF9Q1QM1cGD4YXCe3v2G/LCKMjcDKu2D2VYfoHDhl20QlmTdbYOl66JjXIBJcZ9tEJZgNS6C9IR5YS9BqMIvUalc/H/2CiqbUB7YM541bfx2dXSmzgKUXBVYw3NO2lUtl9jRsmBvoiXVAl21blcLdN8CcqsA2sbFTYr0gVgIvBtbPnYGVu2Ffw7Tf34mWZx3WAxuCG6RQ9zQ8VE/niGlsj+WCeAl4MLCe9xGsaoD9W75sGQVGbNsuBtIFsdUM3wsuiI6qwQaDRhE8mUodNgCbwlpmHTPDfVPbE4lE09voUgNP2i6AUlE3cF/UDZQ72bL55CiqZGuWalqoOM7uwf5U2YqA8pjcOA0FIcBpKAgBTkNBCHAaCkKA01AQApyGghDgNBSEAKehIAQ4DQUhwGkoCEfxKPBeSrvbjcNxZoN7rWD+HzQjFMR1wIHIWnly4zhBHATeMLDj3EghLYFZPTP+GW3XO7oVjgHfJTR90Ti6FQ4QQxATxuEoTJ/D9OQmd9hNHw4/TmPbQXvjBOHJzYsGdiqOwhvECuBnTO/eX+nJHwbCW8QR4OtUdoU4TBsI9xBv8vIDlqoQIcLOEY8CH2Oarnc4nM4InSOGgM8TnP2UcTgKM48+l5Mf38JxkiiIR4BdMeHIOhznsJX80JaLdRGefHSREH8QzwJfEXROSRyOc9w6kR/hstD+PbPdQvxBbAZ2BNYy43Dk4T1gO7PDbyC77Z8xpL0EkV//rphNPv+KOWkkWLXAaxGtHgBeAdYGf54LvBNhfwb4wDwcZzkMdAc3SqHC0Cb+c+b5BRiO0boB+CHMcZJJ68LtSOs88GFU/UIw5/eEJt3ALVHtxQniBGbp+x3gQIz9LmB3So9bfO28EZkAHwceBFYnNHsSeD9qQCORtL3PV0T0RbYjgR4Y3mppcTLGdkVcJ6UmiPeAO8mEBCVJWpfCYQOfMOXlcAw4HNVhmgSkbRzuh5eXws+jMJRg14dZR+VtdVJJiF+XzWMwOhtO95rZWQklP8r6GbiT9K/ATwKXB9a5CaI14EajcOTRB3QS85poJgnrMI8AM6Oj7ruHg+uk9VUSxVF+Ax6z7SvRYvKroPtnFuwJrPPDlpkgfjj0WQYsMLJ9no5JcfQEt5i9R5K5zgDbzpp3Lp03iW+aBG9CshJCKbgOODTdJpLneqGy+oQTB4rzkFgDVBdlZI/XSP4/c/N8HULPjJiU4mim34HKxcDrrs8ZkCUyF8R5cAPwEWYTlK7LkvvICt3AHqL3eImTvAUIIo+6moB7jT1MgzpHFlmUPpOUOocC2+BfN05Y6hyatdekaDiBWXLO7EdaJu9QZF8qUeCxiv7gjYrO9PMDcGc68ZXJM0M6iSBrkB4n2+eZl5ofAZrdvh6bzJ17ga7ZqMB1QmUdkTuamR2+MvpOZPcfhs/sIYL2YtvfAOnj8vRBVC5dVjQ6MNOV9slAJJO0ebH5iTmZgSgXdtl2UClsTFFXW6lY6KI3OorpEJR7XHTdPz2+VnKD8+CvvsA6N78d6qQzL2wfCqzfnYuKsFPoO+RX2wYqhQeXwpIA3bnpzEpCWwOMjQTW7xkvTV0URVEURRH4B1T6ZhDtsqX/AAAAAElFTkSuQmCC';
          };
        };
      }
    } catch (error) {
      console.error('Error al cargar foto de perfil:', error);
      // En caso de error, establecer una imagen por defecto
      this.profileAvatar.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAFWUlEQVR4nO2dbWhdRRTHf9ea2jR9QJNaK9HWVNTUl0BtFRFBsH6pgtYXFLFoa6E+fBDxA1J98QMK+qFWFKRFRQTB1iKCYPGpgvXdtonGptVardE0Tdr6sE327fcP9xrvzZ29c87M3jibe39w2M3O7jn/s3fv3Zkzc85FURRFURRFURRFURRFURRFURRFKTFltgzHTr16HphqWzkC7NoUf1cgim0DisSmpXBjF9Q1QM1cGD4YXCe3v2G/LCKMjcDKu2D2VYfoHDhl20QlmTdbYOl66JjXIBJcZ9tEJZgNS6C9IR5YS9BqMIvUalc/H/2CiqbUB7YM541bfx2dXSmzgKUXBVYw3NO2lUtl9jRsmBvoiXVAl21blcLdN8CcqsA2sbFTYr0gVgIvBtbPnYGVu2Ffw7Tf34mWZx3WAxuCG6RQ9zQ8VE/niGlsj+WCeAl4MLCe9xGsaoD9W75sGQVGbNsuBtIFsdUM3wsuiI6qwQaDRhE8mUodNgCbwlpmHTPDfVPbE4lE09voUgNP2i6AUlE3cF/UDZQ72bL55CiqZGuWalqoOM7uwf5U2YqA8pjcOA0FIcBpKAgBTkNBCHAaCkKA01AQApyGghDgNBSEAKehIAQ4DQUhwGkoCEfxKPBeSrvbjcNxZoN7rWD+HzQjFMR1wIHIWnly4zhBHATeMLDj3EghLYFZPTP+GW3XO7oVjgHfJTR90Ti6FQ4QQxATxuEoTJ/D9OQmd9hNHw4/TmPbQXvjBOHJzYsGdiqOwhvECuBnTO/eX+nJHwbCW8QR4OtUdoU4TBsI9xBv8vIDlqoQIcLOEY8CH2Oarnc4nM4InSOGgM8TnP2UcTgKM48+l5Mf38JxkiiIR4BdMeHIOhznsJX80JaLdRGefHSREH8QzwJfEXROSRyOc9w6kR/hstD+PbPdQvxBbAZ2BNYy43Dk4T1gO7PDbyC77Z8xpL0EkV//rphNPv+KOWkkWLXAaxGtHgBeAdYGf54LvBNhfwb4wDwcZzkMdAc3SqHC0Cb+c+b5BRiO0boB+CHMcZJJ68LtSOs88GFU/UIw5/eEJt3ALVHtxQniBGbp+x3gQIz9LmB3So9bfO28EZkAHwceBFYnNHsSeD9qQCORtL3PV0T0RbYjgR4Y3mppcTLGdkVcJ6UmiPeAO8mEBCVJWpfCYQOfMOXlcAw4HNVhmgSkbRzuh5eXws+jMJRg14dZR+VtdVJJiF+XzWMwOhtO95rZWQklP8r6GbiT9K/ATwKXB9a5CaI14EajcOTRB3QS85poJgnrMI8AM6Oj7ruHg+uk9VUSxVF+Ax6z7SvRYvKroPtnFuwJrPPDlpkgfjj0WQYsMLJ9no5JcfQEt5i9R5K5zgDbzpp3Lp03iW+aBG9CshJCKbgOODTdJpLneqGy+oQTB4rzkFgDVBdlZI/XSP4/c/N8HULPjJiU4mim34HKxcDrrs8ZkCUyF8R5cAPwEWYTlK7LkvvICt3AHqL3eImTvAUIIo+6moB7jT1MgzpHFlmUPpOUOocC2+BfN05Y6hyatdekaDiBWXLO7EdaJu9QZF8qUeCxiv7gjYrO9PMDcGc68ZXJM0M6iSBrkB4n2+eZl5ofAZrdvh6bzJ17ga7ZqMB1QmUdkTuamR2+MvpOZPcfhs/sIYL2YtvfAOnj8vRBVC5dVjQ6MNOV9slAJJO0ebH5iTmZgSgXdtl2UClsTFFXW6lY6KI3OorpEJR7XHTdPz2+VnKD8+CvvsA6N78d6qQzL2wfCqzfnYuKsFPoO+RX2wYqhQeXwpIA3bnpzEpCWwOMjQTW7xkvTV0URVEURRH4B1T6ZhDtsqX/AAAAAElFTkSuQmCC';
    }
  }
  
  /**
   * Subir foto de perfil al servidor
   * Método unificado y profesional para manejar la subida de fotos
   */
  async uploadProfilePhoto() {
    console.log('[uploadProfilePhoto] Iniciando proceso de subida de foto');
    
    // Validar elementos del DOM
    if (!this.photoInput) {
      this.photoInput = document.getElementById('photoInput');
      if (!this.photoInput) {
        this.showNotification('Error: No se encontró el selector de fotos', 'error');
        return;
      }
    }
    
    if (!this.uploadPhotoBtn) {
      this.uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    }
    
    // Obtener el archivo seleccionado
    const file = this.selectedFile || (this.photoInput.files && this.photoInput.files[0]);
    
    if (!file) {
      this.showNotification('Por favor, seleccione una imagen primero', 'warning');
      return;
    }
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      this.showNotification('El archivo debe ser una imagen', 'error');
      return;
    }
    
    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showNotification('La imagen no debe superar 5MB', 'error');
      return;
    }
    
    console.log('[uploadProfilePhoto] Archivo válido:', file.name, file.size, 'bytes');
    
    // Deshabilitar botón y mostrar estado de carga
    this.setUploadButtonState(true, 'Subiendo...');
    
    try {
      // Intentar subir al servidor primero
      if (typeof window.apiService !== 'undefined' && typeof window.apiService.uploadProfilePhoto === 'function') {
        console.log('[uploadProfilePhoto] Subiendo al servidor via API');
        
        const response = await window.apiService.uploadProfilePhoto(this.currentUser.id, file);
        
        console.log('[uploadProfilePhoto] Respuesta del servidor:', response);
        
        // Actualizar avatar con la URL del servidor
        const photoUrl = response.fotoPerfil ? `/uploads/${response.fotoPerfil}` : response.photoUrl;
        
        if (photoUrl && this.profileAvatar) {
          this.profileAvatar.src = photoUrl;
        }
        
        this.showNotification('Foto de perfil actualizada correctamente', 'success');
        
      } else {
        // Fallback: guardar en localStorage
        console.log('[uploadProfilePhoto] API no disponible, guardando en localStorage');
        await this.savePhotoLocally(file);
        this.showNotification('Foto guardada localmente', 'success');
      }
      
    } catch (error) {
      console.error('[uploadProfilePhoto] Error:', error);
      
      // Si falla el servidor, intentar guardar localmente
      try {
        console.log('[uploadProfilePhoto] Fallback a localStorage por error');
        await this.savePhotoLocally(file);
        this.showNotification('Foto guardada localmente (sin conexión al servidor)', 'warning');
      } catch (localError) {
        console.error('[uploadProfilePhoto] Error al guardar localmente:', localError);
        this.showNotification('Error al guardar la foto', 'error');
      }
      
    } finally {
      // Restablecer UI
      this.setUploadButtonState(false, 'Actualizar Foto');
      if (this.photoInput) this.photoInput.value = '';
      this.selectedFile = null;
      console.log('[uploadProfilePhoto] Proceso finalizado');
    }
  }
  
  /**
   * Guardar foto localmente en localStorage
   * @param {File} file - Archivo de imagen
   * @returns {Promise} Promesa que resuelve cuando se guarda la foto
   */
  savePhotoLocally(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const userPhotos = JSON.parse(localStorage.getItem('userProfilePhotos') || '{}');
          userPhotos[this.currentUser.id] = e.target.result;
          localStorage.setItem('userProfilePhotos', JSON.stringify(userPhotos));
          
          if (this.profileAvatar) {
            this.profileAvatar.src = e.target.result;
          }
          
          resolve(e.target.result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Establecer el estado del botón de subida
   * @param {boolean} loading - Si está en estado de carga
   * @param {string} text - Texto del botón
   */
  setUploadButtonState(loading, text) {
    if (this.uploadPhotoBtn) {
      this.uploadPhotoBtn.disabled = loading;
      this.uploadPhotoBtn.textContent = text;
    }
  }
  
  /**
   * Mostrar notificación al usuario
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación (success, error, warning)
   */
  showNotification(message, type = 'info') {
    console.log(`[Notificación ${type}]:`, message);
    if (typeof NotificationManager !== 'undefined') {
      NotificationManager.showToast(message, type);
    } else {
      alert(message);
    }
  }
  
  // ==========================================================================
  // FIN DE MÉTODOS DE SUBIDA DE FOTOS - Código legacy eliminado
  // ==========================================================================

  
  setupChartTabs() {
    // Configurar pestañas para cambiar entre vista semanal y mensual
    if (this.weeklyChartTab) {
      this.weeklyChartTab.addEventListener('click', () => {
        this.setChartPeriod('week');
      });
    }
    
    if (this.monthlyChartTab) {
      this.monthlyChartTab.addEventListener('click', () => {
        this.setChartPeriod('month');
      });
    }
  }
  
  setChartPeriod(period) {
    // Actualizar la pestaña activa
    this.weeklyChartTab.classList.toggle('active', period === 'week');
    this.monthlyChartTab.classList.toggle('active', period === 'month');
    
    // Actualizar el período actual
    this.currentChartPeriod = period;
    
    // Actualizar la gráfica
    this.updateAttendanceChart();
  }
  
  // Método para iniciar y actualizar el reloj en tiempo real
  startClock() {
    // Actualizar fecha y hora actual
    this.updateDateTime();
    
    // Actualizar cada segundo
    setInterval(() => this.updateDateTime(), 1000);
  }
  
  // Actualizar fecha y hora actual en el DOM
  updateDateTime() {
    const now = new Date();
    
    if (this.currentTime) {
      this.currentTime.textContent = now.toLocaleTimeString('es-ES');
    }
    
    if (this.currentDate) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      this.currentDate.textContent = now.toLocaleDateString('es-ES', options);
    }
  }
  
  /**
   * Sobreescribimos el método de la clase base para personalizar
   * la interfaz específica del dashboard de empleado
   */
  updateUserInterface() {
    // Actualizar nombre del empleado
    if (this.employeeName) {
      this.employeeName.textContent = this.currentUser.nombreCompleto;
    }
    
    // Actualizar perfil
    if (this.profileName) this.profileName.textContent = this.currentUser.nombreCompleto;
    if (this.profileDoc) this.profileDoc.textContent = this.currentUser.numeroDocumento;
    if (this.profilePosition) this.profilePosition.textContent = this.currentUser.cargo || 'No especificado';
    if (this.profileSchedule) this.profileSchedule.textContent = this.currentUser.horarioAsignado || 'No especificado';
    if (this.profileEmail) this.profileEmail.textContent = this.currentUser.correoElectronico;
    
    // Cargar foto de perfil
    if (this.profileAvatar) {
      this.loadProfilePhoto();
    }
  }
  
  setupActionButtons() {
    // Botón de entrada
    if (this.entryBtn) {
      console.log('Configurando botón de entrada');
      this.entryBtn.addEventListener('click', () => {
        console.log('Botón de entrada clickeado');
        this.registerAttendance('entrada');
      });
    }
    
    // Botón de salida
    if (this.exitBtn) {
      console.log('Configurando botón de salida');
      this.exitBtn.addEventListener('click', () => {
        console.log('Botón de salida clickeado');
        this.registerAttendance('salida');
      });
    }
  }
  
  registerAttendance(type) {
    console.log('Método registerAttendance ejecutado con tipo:', type);
    try {
      // Validar que tenemos datos del usuario actual
      if (!this.currentUser || !this.currentUser.id) {
        console.error('No hay usuario activo en la sesión');
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast('Error: No hay una sesión activa', 'error');
        } else {
          alert('Error: No hay una sesión activa');
        }
        return;
      }
      
      console.log('Usuario actual:', this.currentUser);
      
      // Mostrar estado de carga
      const actionBtn = type === 'entrada' ? this.entryBtn : this.exitBtn;
      const originalText = actionBtn.innerHTML;
      actionBtn.disabled = true;
      actionBtn.innerHTML = '<span class="loading-spinner"></span> Procesando...';
      
      // Verificar si ya existe un registro del mismo tipo para hoy
      const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      console.log('Registros existentes:', attendanceRecords.length);
      
      const today = new Date().toLocaleDateString('es-ES');
      
      const alreadyRegisteredToday = attendanceRecords.some(record => 
        record.userId === this.currentUser.id && 
        record.type === type && 
        new Date(record.timestamp).toLocaleDateString('es-ES') === today
      );
      
      if (alreadyRegisteredToday) {
        // Usar NotificationManager si está disponible
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showToast(`Ya ha registrado su ${type} de hoy.`, 'warning');
        } else {
            alert(`Ya ha registrado su ${type} de hoy.`);
        }
        // Restaurar estado del botón
        actionBtn.disabled = false;
        actionBtn.innerHTML = originalText;
        return;
      }
      
      // Usar la nueva API de estadísticas para registrar la asistencia
      this.registerAttendanceWithStats(type)
        .then(response => {
          console.log('Registro de asistencia exitoso:', response);
          
          // Actualizar lista de registros y estadísticas
          this.loadEmployeeRecords();
          this.loadDashboardStats();
          
          // Mostrar mensaje de confirmación con información adicional
          const mensaje = `${response.data.accion === 'entrada_registrada' ? 'Entrada' : 'Salida'} registrada exitosamente`;
          const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          
          if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showToast(`${mensaje} a las ${hora}`, 'success');
          } else {
            alert(`${mensaje} a las ${hora}`);
          }
          
          // Actualizar las gráficas con datos reales
          this.updateAttendanceChart();
        })
        .catch(error => {
          console.error('Error al registrar asistencia:', error);
          
          // Mostrar mensaje de error
          if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showToast('Error al registrar asistencia: ' + error.message, 'error');
          } else {
            alert('Error al registrar asistencia: ' + error.message);
          }
        })
        .finally(() => {
          // Restaurar estado del botón
          actionBtn.disabled = false;
          actionBtn.innerHTML = originalText;
        });
        
    } catch (error) {
      console.error('Error general al registrar asistencia:', error);
      // Usar NotificationManager si está disponible
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast('Error al registrar la asistencia. Por favor, intente nuevamente.', 'error');
      } else {
        alert('Error al registrar la asistencia. Por favor, intente nuevamente.');
      }
    }
  }

  // Nueva función para registrar asistencia con estadísticas
  async registerAttendanceWithStats(type) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch('/api/stats/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: type,
          timestamp: new Date().toISOString(),
          location: null // Se puede expandir para incluir geolocalización
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar asistencia');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en registerAttendanceWithStats:', error);
      throw error;
    }
  }

  // Cargar estadísticas del dashboard
  async loadDashboardStats() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/stats/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Error al cargar estadísticas del dashboard');
        return;
      }

      const data = await response.json();
      this.updateDashboardDisplay(data.data);
    } catch (error) {
      console.error('Error al cargar estadísticas del dashboard:', error);
    }
  }

  // Actualizar la visualización del dashboard con datos reales
  updateDashboardDisplay(stats) {
    try {
      // Actualizar tiempo trabajado hoy
      const tiempoHoyElement = document.getElementById('tiempoTrabajadoHoy');
      if (tiempoHoyElement && stats.hoy) {
        tiempoHoyElement.textContent = stats.hoy.estadisticas.tiempoTotal.formato || '00:00';
      }

      // Actualizar promedio semanal
      const promedioSemanalElement = document.getElementById('promedioSemanal');
      if (promedioSemanalElement && stats.semana) {
        const promedio = stats.semana.promedioHorasDiarias || 0;
        promedioSemanalElement.textContent = `${promedio.toFixed(1)}h`;
      }

      // Actualizar días trabajados este mes
      const diasMesElement = document.getElementById('diasTrabajadosMes');
      if (diasMesElement && stats.mes) {
        diasMesElement.textContent = stats.mes.diasTrabajados || 0;
      }

      // Actualizar indicador de sesión activa
      const sesionActivaElement = document.getElementById('sesionActiva');
      if (sesionActivaElement) {
        if (stats.sesionActiva) {
          sesionActivaElement.innerHTML = `
            <div class="status-working">
              <i class="fas fa-play-circle text-success"></i>
              <span>Trabajando (${stats.sesionActiva.duracionActual?.formato || '00:00'})</span>
            </div>
          `;
        } else {
          sesionActivaElement.innerHTML = `
            <div class="status-idle">
              <i class="fas fa-pause-circle text-muted"></i>
              <span>Sin sesión activa</span>
            </div>
          `;
        }
      }

      // Actualizar tarjetas de estadísticas si existen
      this.updateStatsCards(stats);

      // Actualizar gráficas con datos reales
      if (stats.graficas) {
        this.updateChartsWithRealData(stats.graficas);
      }

    } catch (error) {
      console.error('Error al actualizar visualización del dashboard:', error);
    }
  }

  // Actualizar tarjetas de estadísticas
  updateStatsCards(stats) {
    // Tiempo total hoy
    const cardTiempoHoy = document.querySelector('.stat-card[data-stat="tiempo-hoy"]');
    if (cardTiempoHoy && stats.hoy) {
      const valueElement = cardTiempoHoy.querySelector('.stat-value');
      const percentElement = cardTiempoHoy.querySelector('.stat-percentage');
      
      if (valueElement) {
        valueElement.textContent = stats.hoy.estadisticas.tiempoTotal.formato || '00:00';
      }
      
      if (percentElement && stats.hoy.estadisticas.estadisticas) {
        const porcentaje = stats.hoy.estadisticas.estadisticas.cumplimientoJornada?.porcentajeCumplimiento || 0;
        percentElement.textContent = `${porcentaje}%`;
        
        // Actualizar color según cumplimiento
        percentElement.className = 'stat-percentage';
        if (porcentaje >= 100) {
          percentElement.classList.add('text-success');
        } else if (porcentaje >= 80) {
          percentElement.classList.add('text-warning');
        } else {
          percentElement.classList.add('text-danger');
        }
      }
    }

    // Horas extras hoy
    const cardHorasExtras = document.querySelector('.stat-card[data-stat="horas-extras"]');
    if (cardHorasExtras && stats.hoy) {
      const valueElement = cardHorasExtras.querySelector('.stat-value');
      if (valueElement) {
        valueElement.textContent = stats.hoy.estadisticas.horasExtras?.total?.formato || '00:00';
      }
    }

    // Días trabajados este mes
    const cardDiasMes = document.querySelector('.stat-card[data-stat="dias-mes"]');
    if (cardDiasMes && stats.mes) {
      const valueElement = cardDiasMes.querySelector('.stat-value');
      if (valueElement) {
        valueElement.textContent = stats.mes.diasTrabajados || 0;
      }
    }

    // Promedio semanal
    const cardPromedio = document.querySelector('.stat-card[data-stat="promedio-semanal"]');
    if (cardPromedio && stats.semana) {
      const valueElement = cardPromedio.querySelector('.stat-value');
      if (valueElement) {
        const promedio = stats.semana.promedioHorasDiarias || 0;
        valueElement.textContent = `${promedio.toFixed(1)}h`;
      }
    }
  }

  // Actualizar gráficas con datos reales de la API de estadísticas
  async updateChartsWithRealData(graphData) {
    try {
      if (!this.attendanceChart || !graphData) return;

      // Configurar datos para Chart.js
      const chartData = {
        labels: graphData.labels || [],
        datasets: [
          {
            label: 'Horas Trabajadas',
            data: graphData.datasets.horasTrabajadas || [],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Horas Extras',
            data: graphData.datasets.horasExtras || [],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
          },
          {
            label: 'Recargos (horas)',
            data: graphData.datasets.recargos || [],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
          }
        ]
      };

      // Actualizar la gráfica
      this.attendanceChart.data = chartData;
      this.attendanceChart.options.scales.y.title.text = 'Horas';
      this.attendanceChart.update('active');

      console.log('Gráficas actualizadas con datos reales');
    } catch (error) {
      console.error('Error al actualizar gráficas con datos reales:', error);
    }
  }

  // Cargar datos de gráficas desde la API
  async loadChartDataFromAPI(days = 7) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch(`/api/stats/charts?days=${days}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Error al cargar datos de gráficas');
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error al cargar datos de gráficas desde la API:', error);
      return null;
    }
  }
  
  loadEmployeeRecords() {
    try {
      if (!this.employeeRecords) return;
      
      // Mostrar estado de carga
      this.employeeRecords.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Cargando registros...</p>';
      
      // Comprobar si está disponible el servicio API mejorado
      if (typeof window.apiService !== 'undefined' && typeof window.apiService.getAttendanceRecords === 'function') {
        // Usar API service para obtener registros
        window.apiService.getAttendanceRecords(this.currentUser.id)
          .then(response => {
            const records = response.records || [];
            this.renderEmployeeRecords(records);
            
            // Mostrar indicador de modo offline si corresponde
            if (response.mode === 'offline' && typeof NotificationManager !== 'undefined') {
              NotificationManager.showToast('Mostrando registros en modo offline', 'info');
            }
          })
          .catch(error => {
            console.error('Error al obtener registros desde API:', error);
            // En caso de error, usar localStorage como respaldo
            this.loadEmployeeRecordsFromLocalStorage();
          });
      } else {
        // Método de respaldo si no está disponible el API
        this.loadEmployeeRecordsFromLocalStorage();
      }
    } catch (error) {
      console.error('Error al cargar registros de empleado:', error);
      this.employeeRecords.innerHTML = '<p>Error al cargar los registros.</p>';
    }
  }
  
  // Método de respaldo para cargar registros desde localStorage
  loadEmployeeRecordsFromLocalStorage() {
    try {
      // Obtener registros de asistencia
      const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      
      // Filtrar registros del empleado actual
      const employeeRecords = attendanceRecords.filter(
        record => record.userId === this.currentUser.id
      );
      
      // Renderizar registros
      this.renderEmployeeRecords(employeeRecords);
      
    } catch (error) {
      console.error('Error al cargar registros desde localStorage:', error);
      this.employeeRecords.innerHTML = '<p>Error al cargar los registros.</p>';
    }
  }
  
  // Renderiza los registros en la interfaz
  renderEmployeeRecords(records) {
    if (!this.employeeRecords) return;
    
    // Ordenar por fecha (más recientes primero)
    records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Mostrar registros
    if (records.length === 0) {
      this.employeeRecords.innerHTML = '<p>No hay registros disponibles.</p>';
      return;
    }
    
    // Generar HTML de registros
    let recordsHTML = '<div class="records-table"><table class="records-table">';
    recordsHTML += '<thead><tr><th>Fecha</th><th>Hora</th><th>Tipo</th></tr></thead><tbody>';
    
    records.forEach(record => {
      const typeClass = record.type === 'entrada' ? 'entry-record' : 'exit-record';
      const typeIcon = record.type === 'entrada' ? '<i class="fas fa-sign-in-alt"></i>' : '<i class="fas fa-sign-out-alt"></i>';
      const typeLabel = record.type.charAt(0).toUpperCase() + record.type.slice(1);
      
      recordsHTML += `
        <tr class="${typeClass}">
          <td><i class="fas fa-calendar-day"></i> ${record.date}</td>
          <td><i class="fas fa-clock"></i> ${record.time}</td>
          <td>${typeIcon} ${typeLabel}</td>
        </tr>
      `;
    });
    
    recordsHTML += '</tbody></table></div>';
    
    // Actualizar el contenedor
    this.employeeRecords.innerHTML = recordsHTML;
  }
  
  initializeCharts() {
    if (!this.attendanceChartCanvas) return;
    
    // Configuración inicial de la gráfica
    const ctx = this.attendanceChartCanvas.getContext('2d');
    
    // Crear gráfica con datos vacíos (se actualizará después)
    this.attendanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Registros'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Día'
            }
          }
        }
      }
    });
    
    // Actualizar gráfica con datos reales
    this.updateAttendanceChart();
  }
  
  updateAttendanceChart() {
    if (!this.attendanceChart) return;
    
    // Mostrar estado de carga en la gráfica
    this.attendanceChart.data = {
      labels: ['Cargando datos...'],
      datasets: []
    };
    this.attendanceChart.update();
    
    // Usar la nueva API de estadísticas para obtener datos de gráficas
    const days = this.currentChartPeriod === 'week' ? 7 : 30;
    this.loadChartDataFromAPI(days)
      .then(chartData => {
        if (chartData) {
          // Actualizar con datos reales de la API
          this.updateChartsWithRealData(chartData);
        } else {
          // Fallback a método local si la API no está disponible
          this.updateChartWithLocalData();
        }
      })
      .catch(error => {
        console.error('Error al cargar datos de gráficas:', error);
        // En caso de error, usar métodos locales como fallback
        this.updateChartWithLocalData();
      });
  }
  
  // Método para actualizar gráfica con datos de la API
  updateChartWithApiData(stats) {
    // Convertir datos de la API al formato que espera Chart.js
    let chartData;
    
    if (this.currentChartPeriod === 'week') {
      chartData = {
        labels: stats.dailyStats.map(day => day.label || day.day),
        datasets: [
          {
            label: 'Entradas',
            data: stats.dailyStats.map(day => day.entries),
            backgroundColor: 'rgba(40, 167, 69, 0.7)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1
          },
          {
            label: 'Salidas',
            data: stats.dailyStats.map(day => day.exits),
            backgroundColor: 'rgba(220, 53, 69, 0.7)',
            borderColor: 'rgba(220, 53, 69, 1)',
            borderWidth: 1
          },
          {
            label: 'Horas Trabajadas',
            data: stats.dailyStats.map(day => day.workHours),
            backgroundColor: 'rgba(255, 193, 7, 0.7)',
            borderColor: 'rgba(255, 193, 7, 1)',
            borderWidth: 1,
            type: 'line'
          }
        ]
      };
    } else {
      // Similar para datos mensuales
      chartData = {
        labels: stats.dailyStats.map(day => day.day),
        datasets: [
          {
            label: 'Entradas',
            data: stats.dailyStats.map(day => day.entries),
            backgroundColor: 'rgba(40, 167, 69, 0.7)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1
          },
          {
            label: 'Salidas',
            data: stats.dailyStats.map(day => day.exits),
            backgroundColor: 'rgba(220, 53, 69, 0.7)',
            borderColor: 'rgba(220, 53, 69, 1)',
            borderWidth: 1
          },
          {
            label: 'Horas Trabajadas',
            data: stats.dailyStats.map(day => day.workHours),
            backgroundColor: 'rgba(255, 193, 7, 0.7)',
            borderColor: 'rgba(255, 193, 7, 1)',
            borderWidth: 1,
            type: 'line'
          }
        ]
      };
    }
    
    // Actualizar gráfica
    this.attendanceChart.data = chartData;
    this.attendanceChart.options.scales.x.title.text = 
      this.currentChartPeriod === 'week' ? 'Día de la semana' : 'Día del mes';
    this.attendanceChart.update();
    
    // Mostrar indicador de modo offline si es necesario
    if (stats.mode === 'offline') {
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast('Mostrando estadísticas en modo offline', 'info');
      }
    }
  }
  
  // Método para actualizar gráfica con datos locales
  updateChartWithLocalData() {
    // Obtener registros de asistencia
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    
    // Filtrar registros del empleado actual
    const employeeRecords = attendanceRecords.filter(
      record => record.userId === this.currentUser.id
    );
    
    // Si no hay registros, mostrar mensaje
    if (employeeRecords.length === 0) {
      // Actualizar la gráfica con mensaje de "No hay datos"
      this.attendanceChart.data = {
        labels: ['No hay datos disponibles'],
        datasets: []
      };
      this.attendanceChart.update();
      return;
    }
    
    // Preparar datos para la gráfica según el período seleccionado
    let chartData;
    if (this.currentChartPeriod === 'week') {
      chartData = this.prepareWeeklyChartData(employeeRecords);
    } else {
      chartData = this.prepareMonthlyChartData(employeeRecords);
    }
    
    // Actualizar gráfica con los datos preparados
    this.attendanceChart.data = chartData;
    this.attendanceChart.options.scales.x.title.text = 
      this.currentChartPeriod === 'week' ? 'Día de la semana' : 'Día del mes';
    this.attendanceChart.update();
  }
  
  prepareWeeklyChartData(records) {
    // Obtener la fecha actual
    const today = new Date();
    
    // Calcular el primer día de la semana actual (domingo)
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    
    // Nombres de los días de la semana
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    // Inicializar datos para cada día
    const days = [];
    const entriesData = [];
    const exitsData = [];
    const workHoursData = [];
    
    // Procesar los últimos 7 días
    for (let i = 0; i < 7; i++) {
      // Fecha del día actual en el ciclo
      const currentDate = new Date(firstDayOfWeek);
      currentDate.setDate(firstDayOfWeek.getDate() + i);
      const dateString = currentDate.toLocaleDateString('es-ES');
      
      // Filtrar registros para este día
      const dayRecords = records.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate.toLocaleDateString('es-ES') === dateString;
      });
      
      // Contar entradas y salidas
      const entries = dayRecords.filter(r => r.type === 'entrada').length;
      const exits = dayRecords.filter(r => r.type === 'salida').length;
      
      // Calcular horas trabajadas (simulación)
      let workHours = 0;
      if (entries > 0 && exits > 0) {
        // Simplificación: asumimos que siempre hay una entrada y una salida
        workHours = Math.min(entries, exits) * 8; // 8 horas por par entrada/salida
      }
      
      // Añadir datos
      days.push(dayNames[i]);
      entriesData.push(entries);
      exitsData.push(exits);
      workHoursData.push(workHours);
    }
    
    // Devolver datos formateados para Chart.js
    return {
      labels: days,
      datasets: [
        {
          label: 'Entradas',
          data: entriesData,
          backgroundColor: 'rgba(40, 167, 69, 0.7)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1
        },
        {
          label: 'Salidas',
          data: exitsData,
          backgroundColor: 'rgba(220, 53, 69, 0.7)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 1
        },
        {
          label: 'Horas Trabajadas',
          data: workHoursData,
          backgroundColor: 'rgba(255, 193, 7, 0.7)',
          borderColor: 'rgba(255, 193, 7, 1)',
          borderWidth: 1
        }
      ]
    };
  }
  
  prepareMonthlyChartData(records) {
    // Obtener la fecha actual
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Determinar el número de días en el mes actual
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Inicializar datos para cada día del mes
    const days = [];
    const entriesData = [];
    const exitsData = [];
    const workHoursData = [];
    
    // Procesar cada día del mes
    for (let i = 1; i <= daysInMonth; i++) {
      // Crear fecha para el día actual
      const currentDate = new Date(currentYear, currentMonth, i);
      const dateString = currentDate.toLocaleDateString('es-ES');
      
      // Filtrar registros para este día
      const dayRecords = records.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate.toLocaleDateString('es-ES') === dateString;
      });
      
      // Contar entradas y salidas
      const entries = dayRecords.filter(r => r.type === 'entrada').length;
      const exits = dayRecords.filter(r => r.type === 'salida').length;
      
      // Calcular horas trabajadas (simulación)
      let workHours = 0;
      if (entries > 0 && exits > 0) {
        // Simplificación: asumimos que siempre hay una entrada y una salida
        workHours = Math.min(entries, exits) * 8; // 8 horas por par entrada/salida
      }
      
      // Añadir datos
      days.push(i); // Día del mes (1-31)
      entriesData.push(entries);
      exitsData.push(exits);
      workHoursData.push(workHours);
    }
    
    // Devolver datos formateados para Chart.js
    return {
      labels: days,
      datasets: [
        {
          label: 'Entradas',
          data: entriesData,
          backgroundColor: 'rgba(40, 167, 69, 0.7)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1
        },
        {
          label: 'Salidas',
          data: exitsData,
          backgroundColor: 'rgba(220, 53, 69, 0.7)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 1
        },
        {
          label: 'Horas Trabajadas',
          data: workHoursData,
          backgroundColor: 'rgba(255, 193, 7, 0.7)',
          borderColor: 'rgba(255, 193, 7, 1)',
          borderWidth: 1,
          type: 'line'
        }
      ]
    };
  }
  
  // Los métodos logout() y redirectToLogin() ya están implementados en BaseDashboard
}

// Inicializar el dashboard cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
  // Crear instancia y guardarla en window para acceso global
  window.employeeDashboard = new EmployeeDashboard();
});
