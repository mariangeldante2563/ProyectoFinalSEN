/**
 * IN OUT MANAGER - INIT SCRIPT
 * @version 1.0.0
 * @description Script de inicialización del sistema para garantizar estructura y datos necesarios
 */

// Asegurar que se ejecute después de carga de página
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar estructuras de datos si no existen
  initializeDataStructures();
  
  // Imprimir diagnóstico
  printDiagnostic();
});

/**
 * Inicializa las estructuras de datos necesarias en localStorage
 */
function initializeDataStructures() {
  // Lista de estructuras a verificar e inicializar
  const requiredStructures = [
    { key: 'registeredUsers', defaultValue: [] },
    { key: 'attendanceRecords', defaultValue: [] },
    { key: 'sessionHistory', defaultValue: [] }
  ];
  
  requiredStructures.forEach(structure => {
    if (!localStorage.getItem(structure.key)) {
      localStorage.setItem(structure.key, JSON.stringify(structure.defaultValue));
      console.log(`Se inicializó ${structure.key} en localStorage`);
    }
  });
  
  // Verificar si existe al menos un usuario
  ensureTestUser();
}

/**
 * Asegura que exista al menos un usuario de prueba
 */
function ensureTestUser() {
  try {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    if (users.length === 0) {
      // Crear usuario de prueba
      const testUser = {
        id: 'user_' + Date.now(),
        nombreCompleto: 'Usuario de Prueba',
        correoElectronico: 'test@example.com',
        numeroDocumento: '1234567890',
        tipoUsuario: 'empleado',
        passwordHash: btoa('password123'), // Codificación simple para demostración
        cargo: 'Técnico',
        horarioAsignado: '8:00 AM - 5:00 PM',
        fechaRegistro: new Date().toISOString()
      };
      
      users.push(testUser);
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      console.log('Se creó un usuario de prueba');
    }
  } catch (error) {
    console.error('Error al verificar usuario de prueba:', error);
  }
}

/**
 * Imprime información de diagnóstico en la consola
 */
function printDiagnostic() {
  try {
    // Datos generales
    console.group('Diagnóstico del sistema');
    
    // Verificar sesión
    const sessionData = localStorage.getItem('currentSession');
    if (sessionData) {
      const session = JSON.parse(sessionData);
      console.log('Sesión activa:', {
        id: session.id,
        tipo: session.tipoUsuario,
        nombre: session.nombreCompleto
      });
    } else {
      console.warn('No hay sesión activa');
    }
    
    // Contar usuarios registrados
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    console.log(`Usuarios registrados: ${users.length}`);
    
    // Contar registros de asistencia
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    console.log(`Registros de asistencia: ${attendanceRecords.length}`);
    
    // Estado del localStorage
    const usedSpace = calculateLocalStorageUsage();
    console.log(`Uso de localStorage: ${usedSpace.toFixed(2)} KB`);
    
    console.groupEnd();
  } catch (error) {
    console.error('Error al imprimir diagnóstico:', error);
  }
}

/**
 * Calcula el espacio utilizado en localStorage
 * @returns {number} - Tamaño en KB
 */
function calculateLocalStorageUsage() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    total += (key.length + value.length) * 2; // Aproximado para UTF-16
  }
  return total / 1024; // Convertir a KB
}