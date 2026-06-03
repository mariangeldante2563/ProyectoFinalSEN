/**
<<<<<<< HEAD
 * @version 1.0.0
 * @description 
=======
 * IN OUT MANAGER - SECURITY UTILITY MODULE
 * @version 1.0.0
 * @description Módulo para manejo de seguridad y cifrado
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
 */

class SecurityManager {
  /**
<<<<<<< HEAD
   * @param {string} password 
   * @returns {string} 
   */
  static hashPassword(password) {
    if (!password) return '';

    if (window.crypto && window.crypto.subtle && false) { 
      return this.simpleHash(password);
    } else {
=======
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      return this.simpleHash(password);
    }
  }
  
  /**
<<<<<<< HEAD
   * @param {string} str 
   * @returns {string} 
   */
  static simpleHash(str) {

    const salt = "InOutManager" + new Date().getFullYear();
    const saltedStr = salt + str + salt;
    
=======
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    let hash = 0;
    for (let i = 0; i < saltedStr.length; i++) {
      const char = saltedStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
<<<<<<< HEAD
      hash = hash & hash; 
    }
    
=======
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    
    // Convertir a string hexadecimal y añadir el salt codificado
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const hexHash = Math.abs(hash).toString(16);
    const encodedSalt = btoa(salt).substring(0, 8);
    
    return encodedSalt + ":" + hexHash;
  }
  
  /**
<<<<<<< HEAD
   * @param {string} password 
   * @param {string} hash 
   * @returns {boolean}
   */
  static verifyPassword(password, hash) {

    if (hash.includes(':')) {
      const newHash = this.hashPassword(password);
      return newHash === hash;
    }

=======
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    try {
      return atob(hash) === password;
    } catch (e) {
      return false;
    }
  }
  
  /**
<<<<<<< HEAD
   * @param {Object} payload 
   * @returns {string} 
   */
  static generateToken(payload) {

=======
   * Genera un token JWT simple para sesiones
   * NOTA: Esta es una implementación muy simplificada con fines educativos
   * 
   * @param {Object} payload - Datos a incluir en el token
   * @returns {string} - Token JWT
   */
  static generateToken(payload) {
    // Header (siempre es el mismo en nuestra implementación simple)
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    const header = {
      alg: "HS256",
      typ: "JWT"
    };
<<<<<<< HEAD

    const now = Date.now();
    const enhancedPayload = {
      ...payload,
      iat: now,                  
      exp: now + 24 * 3600000   
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(enhancedPayload));
    const signature = this.simpleHash(encodedHeader + "." + encodedPayload);

=======
    
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
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
  
  /**
<<<<<<< HEAD
   * @param {string} token 
   * @returns {Object|null} 
   */
  static verifyToken(token) {
    try {

      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      
      if (payload.exp && payload.exp < Date.now()) {
        return null; 
      }

=======
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
      
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
      return payload;
    } catch (e) {
      return null;
    }
  }
  
  /**
<<<<<<< HEAD
   * @param {string} str 
   * @returns {string} 
=======
   * Sanitiza un string para prevenir XSS
   * 
   * @param {string} str - String a sanitizar
   * @returns {string} - String sanitizado
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
   */
  static sanitizeString(str) {
    if (!str) return '';
    
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

<<<<<<< HEAD
=======
// Exportar clase para uso en otros módulos
>>>>>>> 83d3fee8987e2a325c60d0c2557fb0e9974b613c
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityManager;
}