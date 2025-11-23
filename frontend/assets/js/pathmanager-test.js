/**
 * PATHMANAGER TESTING SUITE
 * Script para verificar que el PathManager mejorado funciona correctamente
 */

import PathManager from './path-manager.js';

class PathManagerTester {
  constructor() {
    this.testResults = [];
    this.init();
  }

  init() {
    console.log('🧪 PathManager Tester: Iniciando pruebas...');
    this.runAllTests();
  }

  async runAllTests() {
    // Test 1: Verificar detección de URL base
    this.testBaseUrlDetection();
    
    // Test 2: Verificar generación de rutas
    this.testPathGeneration();
    
    // Test 3: Verificar navegación
    this.testNavigation();
    
    // Test 4: Verificar carga de módulos
    await this.testModuleLoading();
    
    // Mostrar resultados
    this.showResults();
  }

  testBaseUrlDetection() {
    console.log('🔍 Test 1: Detección de URL base');
    
    try {
      const baseUrl = PathManager.getBaseUrl();
      console.log('Base URL detectada:', baseUrl);
      
      if (baseUrl && baseUrl.includes('localhost')) {
        this.addResult('✅ Base URL detection', 'PASS', baseUrl);
      } else {
        this.addResult('❌ Base URL detection', 'FAIL', 'URL inválida');
      }
    } catch (error) {
      this.addResult('❌ Base URL detection', 'ERROR', error.message);
    }
  }

  testPathGeneration() {
    console.log('🔍 Test 2: Generación de rutas');
    
    try {
      const dashboardPath = PathManager.getComponentPath('admin/dashboard-admin.html');
      const loginPath = PathManager.getComponentPath('auth/login.html');
      const assetPath = PathManager.getAssetPath('js/path-manager.js');
      
      console.log('Dashboard path:', dashboardPath);
      console.log('Login path:', loginPath);
      console.log('Asset path:', assetPath);
      
      if (dashboardPath.includes('admin/dashboard-admin.html') &&
          loginPath.includes('auth/login.html') &&
          assetPath.includes('path-manager.js')) {
        this.addResult('✅ Path generation', 'PASS', 'Todas las rutas generadas correctamente');
      } else {
        this.addResult('❌ Path generation', 'FAIL', 'Rutas incorrectas');
      }
    } catch (error) {
      this.addResult('❌ Path generation', 'ERROR', error.message);
    }
  }

  testNavigation() {
    console.log('🔍 Test 3: Funciones de navegación');
    
    try {
      // Verificar que las funciones existen
      const hasNavigateToDashboard = typeof PathManager.navigateToDashboard === 'function';
      const hasNavigateToLogin = typeof PathManager.navigateToLogin === 'function';
      const hasNavigateToRegister = typeof PathManager.navigateToRegister === 'function';
      const hasNavigateToHome = typeof PathManager.navigateToHome === 'function';
      
      if (hasNavigateToDashboard && hasNavigateToLogin && hasNavigateToRegister && hasNavigateToHome) {
        this.addResult('✅ Navigation functions', 'PASS', 'Todas las funciones disponibles');
      } else {
        this.addResult('❌ Navigation functions', 'FAIL', 'Funciones faltantes');
      }
    } catch (error) {
      this.addResult('❌ Navigation functions', 'ERROR', error.message);
    }
  }

  async testModuleLoading() {
    console.log('🔍 Test 4: Carga de módulos');
    
    try {
      // Verificar que la función existe
      const hasLoadModule = typeof PathManager.loadModule === 'function';
      
      if (hasLoadModule) {
        this.addResult('✅ Module loading function', 'PASS', 'Función disponible');
      } else {
        this.addResult('❌ Module loading function', 'FAIL', 'Función no disponible');
      }
    } catch (error) {
      this.addResult('❌ Module loading function', 'ERROR', error.message);
    }
  }

  addResult(test, status, details) {
    this.testResults.push({
      test,
      status,
      details,
      timestamp: new Date().toISOString()
    });
  }

  showResults() {
    console.log('\n🧪 RESULTADOS DE PRUEBAS PATHMANAGER:');
    console.log('='.repeat(50));
    
    let passed = 0;
    let failed = 0;
    let errors = 0;
    
    this.testResults.forEach(result => {
      console.log(`${result.test}: ${result.status}`);
      console.log(`   Detalles: ${result.details}`);
      console.log(`   Tiempo: ${result.timestamp}`);
      console.log('');
      
      if (result.status === 'PASS') passed++;
      else if (result.status === 'FAIL') failed++;
      else if (result.status === 'ERROR') errors++;
    });
    
    console.log('RESUMEN:');
    console.log(`✅ Pruebas exitosas: ${passed}`);
    console.log(`❌ Pruebas fallidas: ${failed}`);
    console.log(`💥 Errores: ${errors}`);
    console.log(`📊 Total: ${this.testResults.length}`);
    
    // Crear reporte visual en el DOM
    this.createVisualReport();
  }

  createVisualReport() {
    const reportDiv = document.createElement('div');
    reportDiv.id = 'pathmanager-test-report';
    reportDiv.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: white;
      border: 2px solid #007bff;
      border-radius: 8px;
      padding: 15px;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: monospace;
      font-size: 12px;
    `;
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const total = this.testResults.length;
    
    reportDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 10px;">
        <h3 style="margin: 0; color: #007bff;">🧪 PathManager Test</h3>
        <div style="font-size: 16px; font-weight: bold; color: ${passed === total ? '#28a745' : '#dc3545'};">
          ${passed}/${total} TESTS PASSED
        </div>
      </div>
      
      ${this.testResults.map(result => `
        <div style="margin: 5px 0; padding: 5px; background: ${
          result.status === 'PASS' ? '#d4edda' : 
          result.status === 'FAIL' ? '#f8d7da' : '#fff3cd'
        }; border-radius: 3px;">
          <strong>${result.test}</strong><br>
          <small>${result.details}</small>
        </div>
      `).join('')}
      
      <button onclick="document.getElementById('pathmanager-test-report').remove()" 
              style="width: 100%; padding: 8px; margin-top: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Cerrar Reporte
      </button>
    `;
    
    document.body.appendChild(reportDiv);
    
    // Auto-cerrar después de 10 segundos
    setTimeout(() => {
      if (document.getElementById('pathmanager-test-report')) {
        reportDiv.remove();
      }
    }, 10000);
  }
}

// Auto-ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PathManagerTester());
} else {
  new PathManagerTester();
}

// Hacer PathManagerTester disponible globalmente
if (typeof window !== 'undefined') {
  window.PathManagerTester = PathManagerTester;
}