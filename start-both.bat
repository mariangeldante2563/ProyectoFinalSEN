@echo off
echo ============================================
echo IN OUT MANAGER - INICIANDO SERVICIOS
echo ============================================
echo.

:: Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo.

:: Iniciar Backend en nueva ventana
echo 🚀 Iniciando Backend...
start "IN OUT MANAGER - Backend" cmd /k "cd /d C:\Users\User\Documents\SENA\inoutmanager\backend && echo 🚀 Backend iniciando en puerto 5000... && node server.js"

:: Esperar un poco antes de iniciar el frontend
timeout /t 3 /nobreak >nul

:: Iniciar Frontend en nueva ventana
echo 🚀 Iniciando Frontend...
start "IN OUT MANAGER - Frontend" cmd /k "cd /d C:\Users\User\Documents\SENA\inoutmanager && echo 🚀 Frontend iniciando en puerto 3000... && npm run dev"

echo.
echo 🎉 ¡SERVICIOS INICIADOS!
echo ============================================
echo 🔧 Backend:  http://localhost:5000
echo 🌐 Frontend: http://localhost:3000
echo ============================================
echo.
echo Se han abierto dos ventanas nuevas:
echo 1. Backend (puerto 5000)
echo 2. Frontend (puerto 3000)
echo.
echo Cierre las ventanas para detener los servicios.
echo.
pause