import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Configuración para tu proyecto HTML/CSS/JS
  root: 'frontend', 
  
  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    open: '/proyectopages/index.html',
    host: true  
  },
  
  
  build: {
    outDir: '../dist', 
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
  
 
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp', '**/*.gif'],
  
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'frontend'),
      '@assets': resolve(__dirname, 'frontend/assets'),
      '@components': resolve(__dirname, 'frontend/components')
    }
  }
})
