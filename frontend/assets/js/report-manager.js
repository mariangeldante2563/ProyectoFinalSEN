/**
 * Clase para gestionar la generación y descarga de reportes desde el frontend
 */
class ReportManager {
  constructor(apiUrl = '/api') {
    this.apiUrl = apiUrl;
    this.baseReportUrl = `${this.apiUrl}/reports`;
  }
  
  /**
   * Genera y descarga un reporte de asistencia para el usuario actual
   * @param {Object} options - Opciones para generar el reporte
   * @param {string} options.startDate - Fecha inicial (opcional)
   * @param {string} options.endDate - Fecha final (opcional)
   * @returns {Promise<Object>} - Información del reporte generado
   */
  async generateUserReport(options = {}) {
    try {
      // Obtener ID de usuario actual
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user || !user.id) {
        throw new Error('Usuario no autenticado');
      }
      
      // Construir URL para la solicitud
      let url = `${this.baseReportUrl}/user/${user.id}`;
      
      // Añadir parámetros de fecha si existen
      if (options.startDate && options.endDate) {
        url += `?startDate=${options.startDate}&endDate=${options.endDate}`;
      }
      
      // Configurar la solicitud
      const requestOptions = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Mostrar notificación de espera
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast('Generando reporte, por favor espere...', 'info');
      }
      
      // Realizar la solicitud
      const response = await fetch(url, requestOptions);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Error al generar el reporte');
      }
      
      // Procesar la respuesta
      const data = await response.json();
      
      // Iniciar la descarga del archivo
      if (data.success && data.data.reportUrl) {
        this.downloadReport(data.data.reportUrl, data.data.fileName);
        
        // Mostrar notificación de éxito
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast('Reporte generado exitosamente', 'success');
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error al generar reporte de usuario:', error);
      
      // Mostrar notificación de error
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast(
          `Error al generar reporte: ${error.message}`, 
          'error'
        );
      }
      
      throw error;
    }
  }
  
  /**
   * Genera y descarga un reporte general (solo para administradores)
   * @param {Object} options - Opciones para generar el reporte
   * @param {string} options.startDate - Fecha inicial (opcional)
   * @param {string} options.endDate - Fecha final (opcional)
   * @returns {Promise<Object>} - Información del reporte generado
   */
  async generateGeneralReport(options = {}) {
    try {
      // Verificar si el usuario es administrador
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user || user.role !== 'admin') {
        throw new Error('Acceso denegado. Se requiere rol de administrador');
      }
      
      // Construir URL para la solicitud
      let url = `${this.baseReportUrl}/general`;
      
      // Añadir parámetros de fecha si existen
      if (options.startDate && options.endDate) {
        url += `?startDate=${options.startDate}&endDate=${options.endDate}`;
      }
      
      // Configurar la solicitud
      const requestOptions = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Mostrar notificación de espera
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast('Generando reporte general, por favor espere...', 'info');
      }
      
      // Realizar la solicitud
      const response = await fetch(url, requestOptions);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Error al generar el reporte general');
      }
      
      // Procesar la respuesta
      const data = await response.json();
      
      // Iniciar la descarga del archivo
      if (data.success && data.data.reportUrl) {
        this.downloadReport(data.data.reportUrl, data.data.fileName);
        
        // Mostrar notificación de éxito
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.showToast('Reporte general generado exitosamente', 'success');
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error al generar reporte general:', error);
      
      // Mostrar notificación de error
      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.showToast(
          `Error al generar reporte general: ${error.message}`, 
          'error'
        );
      }
      
      throw error;
    }
  }
  
  /**
   * Inicia la descarga de un archivo de reporte
   * @param {string} reportUrl - URL del reporte a descargar
   * @param {string} fileName - Nombre del archivo
   */
  downloadReport(reportUrl, fileName) {
    // Crear un elemento <a> para iniciar la descarga
    const downloadLink = document.createElement('a');
    downloadLink.href = reportUrl;
    downloadLink.download = fileName || 'reporte.xlsx';
    downloadLink.style.display = 'none';
    
    // Añadir al DOM, hacer clic y eliminar
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}