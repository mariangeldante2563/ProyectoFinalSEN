/**
 * IN OUT MANAGER - SCRIPT DE LIMPIEZA DE LOCALSTORAGE
 * @version 1.0.0
 * @description Script para eliminar todos los datos del localStorage del frontend
 */

class LocalStorageCleaner {
  constructor() {
    this.init();
  }

  init() {
    console.log('🧹 IN OUT MANAGER - LIMPIEZA DE LOCALSTORAGE');
    console.log('='.repeat(50));
    
    this.showCurrentData();
    this.clearAllData();
    this.verifyCleanup();
  }

  showCurrentData() {
    console.log('📊 DATOS ACTUALES EN LOCALSTORAGE:');
    console.log('-'.repeat(30));
    
    // Verificar datos específicos del sistema
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const currentUser = localStorage.getItem('currentUser');
    const userSession = localStorage.getItem('userSession');
    
    console.log(`   👥 Usuarios registrados: ${registeredUsers.length}`);
    console.log(`   📝 Registros de asistencia: ${attendanceRecords.length}`);
    console.log(`   👤 Usuario actual: ${currentUser ? 'Sí' : 'No'}`);
    console.log(`   🔐 Sesión activa: ${userSession ? 'Sí' : 'No'}`);
    
    // Mostrar todas las claves en localStorage
    const allKeys = Object.keys(localStorage);
    console.log(`   🗂️  Total de claves en localStorage: ${allKeys.length}`);
    
    if (allKeys.length > 0) {
      console.log('   📋 Claves encontradas:');
      allKeys.forEach((key, index) => {
        const value = localStorage.getItem(key);
        const size = new Blob([value]).size;
        console.log(`      ${index + 1}. ${key} (${size} bytes)`);
      });
    }
    
    console.log('');
  }

  clearAllData() {
    console.log('🗑️  ELIMINANDO TODOS LOS DATOS...');
    console.log('-'.repeat(30));
    
    const allKeys = Object.keys(localStorage);
    const totalKeys = allKeys.length;
    
    if (totalKeys === 0) {
      console.log('   ✅ LocalStorage ya está vacío');
      return;
    }
    
    // Eliminar datos específicos del sistema uno por uno
    const systemKeys = [
      'registeredUsers',
      'attendanceRecords', 
      'currentUser',
      'userSession',
      'userPreferences',
      'dashboardSettings',
      'notifications',
      'tempData',
      'lastLogin',
      'userStats'
    ];
    
    let removedCount = 0;
    
    systemKeys.forEach(key => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        console.log(`   ✅ Eliminado: ${key}`);
        removedCount++;
      }
    });
    
    // Eliminar cualquier otra clave que pueda existir
    const remainingKeys = Object.keys(localStorage);
    remainingKeys.forEach(key => {
      if (!systemKeys.includes(key)) {
        localStorage.removeItem(key);
        console.log(`   ✅ Eliminado: ${key}`);
        removedCount++;
      }
    });
    
    // Limpieza completa como respaldo
    try {
      localStorage.clear();
      console.log('   🧹 Limpieza completa ejecutada');
    } catch (error) {
      console.log('   ⚠️  Error en limpieza completa:', error.message);
    }
    
    console.log(`   📊 Total de elementos eliminados: ${removedCount}`);
    console.log('');
  }

  verifyCleanup() {
    console.log('✅ VERIFICACIÓN DE LIMPIEZA:');
    console.log('-'.repeat(30));
    
    const remainingKeys = Object.keys(localStorage);
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    
    console.log(`   📊 Claves restantes: ${remainingKeys.length}`);
    console.log(`   👥 Usuarios registrados: ${registeredUsers.length}`);
    console.log(`   📝 Registros de asistencia: ${attendanceRecords.length}`);
    
    if (remainingKeys.length === 0) {
      console.log('   🎉 ¡LOCALSTORAGE COMPLETAMENTE LIMPIO!');
    } else {
      console.log('   ⚠️  Algunas claves permanecen:');
      remainingKeys.forEach((key, index) => {
        console.log(`      ${index + 1}. ${key}`);
      });
    }
    
    console.log('');
    console.log('🏁 LIMPIEZA DE LOCALSTORAGE COMPLETADA');
    console.log('='.repeat(50));
  }
}

// Ejecutar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  // Verificar si estamos en una página que debe ejecutar la limpieza
  const shouldClean = confirm(
    '⚠️ ADVERTENCIA: Esto eliminará TODOS los datos de usuarios almacenados en el navegador.\n\n' +
    '• Usuarios registrados\n' +
    '• Registros de asistencia\n' +
    '• Sesiones activas\n' +
    '• Configuraciones\n\n' +
    '¿Está seguro de que desea continuar?'
  );
  
  if (shouldClean) {
    new LocalStorageCleaner();
    alert('✅ Limpieza completada. Todos los datos de usuarios han sido eliminados del navegador.');
    
    // Opcional: Recargar la página para mostrar el estado limpio
    if (confirm('¿Desea recargar la página para ver el resultado?')) {
      window.location.reload();
    }
  } else {
    console.log('❌ Limpieza cancelada por el usuario');
  }
});

// Función para ejecutar limpieza manualmente desde la consola
window.clearLocalStorageData = function() {
  new LocalStorageCleaner();
};