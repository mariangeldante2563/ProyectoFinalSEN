# Script para iniciar el servidor backend del proyecto IN OUT MANAGER
# @version 1.0.0

Write-Host "🚀 Iniciando servidor backend de IN OUT MANAGER..." -ForegroundColor Green

# Cambiar al directorio del backend
$backendPath = "C:\Users\User\Documents\SENA\inoutmanager\backend"
Set-Location $backendPath

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "server.js")) {
    Write-Host "❌ Error: No se encontró server.js en el directorio actual" -ForegroundColor Red
    Write-Host "📁 Directorio actual: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Verificar que Node.js esté disponible
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar que MongoDB esté ejecutándose (opcional)
Write-Host "🔍 Verificando conexión a MongoDB..." -ForegroundColor Yellow

# Iniciar el servidor
Write-Host "🎯 Iniciando servidor en puerto 5000..." -ForegroundColor Cyan
Write-Host "🌐 URL del servidor: http://localhost:5000" -ForegroundColor Blue
Write-Host "📊 Frontend esperado en: http://localhost:3000" -ForegroundColor Blue
Write-Host "" 
Write-Host "Para detener el servidor, presiona Ctrl+C" -ForegroundColor Yellow
Write-Host "=" * 50 -ForegroundColor Gray

# Ejecutar el servidor
node server.js