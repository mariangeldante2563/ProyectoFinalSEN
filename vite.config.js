import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Configuración para tu proyecto HTML/CSS/JS
  root: 'frontend', // Usar frontend como raíz
  
  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    open: '/proyectopages/index.html', // Abrir directamente tu página principal
    host: true  // Permite acceso desde la red local
  },
  
  // Configuración de build para producción
  build: {
    outDir: '../dist', // Carpeta de salida en la raíz del proyecto
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'frontend/proyectopages/index.html'),
        login: resolve(__dirname, 'frontend/components/auth/login.html'),
        registro: resolve(__dirname, 'frontend/components/auth/registro.html'),
        recuperar: resolve(__dirname, 'frontend/components/auth/recuperar-password.html'),
        dashboardAdmin: resolve(__dirname, 'frontend/components/admin/dashboard-admin.html'),
        dashboardEmpleado: resolve(__dirname, 'frontend/components/empleado/dashboard-empleado.html')
      }
    }
  },
  
  // Configuración de assets
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp', '**/*.gif'],
  
  // Alias para rutas más fáciles
  resolve: {
    alias: {
      '@': resolve(__dirname, 'frontend'),
      '@assets': resolve(__dirname, 'frontend/assets'),
      '@components': resolve(__dirname, 'frontend/components')
    }
  }
})
