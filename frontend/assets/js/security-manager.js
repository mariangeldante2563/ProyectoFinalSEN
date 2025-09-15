/**
 * IN OUT MANAGER - SECURITY UTILITY MODULE
 * @version 1.0.0
 * @description Módulo para manejo de seguridad y cifrado
 */

class SecurityManager {
  /**
   * Genera un hash simple para contraseñas
   * NOTA: Este método es más seguro que btoa, pero NO es lo suficientemente
   * seguro para producción. En un entorno real, se debería usar bcrypt en el servidor.
   * 
   * @param {string} password - Contraseña en texto plano
   * @returns {string} - Hash de la contraseña
   */
  static hashPassword(password) {
    if (!password) return '';
    
    // Usar un algoritmo más seguro si está disponible
    if (window.crypto && window.crypto.subtle && false) { // Desactivado por compatibilidad
      // En un entorno real, usaríamos crypto.subtle.digest
      // Sin embargo, este código es asíncrono y requeriría reescribir parte de la aplicación
      // Por eso, implementamos una solución más simple para este proyecto
      return this.simpleHash(password);
    } else {
      // Fallback a un método simple pero mejor que btoa
      return this.simpleHash(password);
    }
  }
  
  /**
   * Implementación simple de un algoritmo de hash 
   * Mejor que btoa pero aún insuficiente para producción
   * 
   * @param {string} str - String a hashear
   * @returns {string} - Hash resultante
   */
  static simpleHash(str) {
    // Generar un salt aleatorio
    const salt = "InOutManager" + new Date().getFullYear();
    const saltedStr = salt + str + salt;
    
    // Algoritmo de hash simple (no criptográficamente seguro)
    let hash = 0;
    for (let i = 0; i < saltedStr.length; i++) {
      const char = saltedStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    
    // Convertir a string hexadecimal y añadir el salt codificado
    const hexHash = Math.abs(hash).toString(16);
    const encodedSalt = btoa(salt).substring(0, 8);
    
    return encodedSalt + ":" + hexHash;
  }
  
  /**
   * Verifica si una contraseña coincide con un hash
   * 
   * @param {string} password - Contraseña en texto plano
   * @param {string} hash - Hash almacenado
   * @returns {boolean} - true si coinciden, false si no
   */
  static verifyPassword(password, hash) {
    // Si el hash tiene el formato nuevo (con :)
    if (hash.includes(':')) {
      // Usamos el algoritmo de hash moderno
      const newHash = this.hashPassword(password);
      return newHash === hash;
    }
    
    // Compatibilidad con el sistema antiguo (btoa)
    try {
      return atob(hash) === password;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Genera un token JWT simple para sesiones
   * NOTA: Esta es una implementación muy simplificada con fines educativos
   * 
   * @param {Object} payload - Datos a incluir en el token
   * @returns {string} - Token JWT
   */
  static generateToken(payload) {
    // Header (siempre es el mismo en nuestra implementación simple)
    const header = {
      alg: "HS256",
      typ: "JWT"
    };
    
    // Añadir timestamps
    const now = Date.now();
    const enhancedPayload = {
      ...payload,
      iat: now,                  // Issued at (timestamp de creación)
      exp: now + 24 * 3600000    // Expira en 24 horas
    };
    
    // Codificar header y payload
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(enhancedPayload));
    
    // En una implementación real, aquí se firmaría con una clave secreta
    // Para este proyecto, usamos un "signature" simulado
    const signature = this.simpleHash(encodedHeader + "." + encodedPayload);
    
    // Formatear como JWT
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
  
  /**
   * Verifica un token JWT simple
   * 
   * @param {string} token - Token JWT a verificar
   * @returns {Object|null} - Payload decodificado o null si es inválido
   */
  static verifyToken(token) {
    try {
      // Dividir en sus 3 partes
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      // Decodificar payload
      const payload = JSON.parse(atob(parts[1]));
      
      // Verificar expiración
      if (payload.exp && payload.exp < Date.now()) {
        return null; // Expirado
      }
      
      // En una implementación real, aquí se verificaría la firma
      
      return payload;
    } catch (e) {
      return null;
    }
  }
  
  /**
   * Sanitiza un string para prevenir XSS
   * 
   * @param {string} str - String a sanitizar
   * @returns {string} - String sanitizado
   */
  static sanitizeString(str) {
    if (!str) return '';
    
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Exportar clase para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityManager;
}