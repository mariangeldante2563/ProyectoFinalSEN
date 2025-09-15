# ============================================
# COMANDOS POWERSHELL PARA INICIAR SERVICIOS
# ============================================

# Copie y pegue estos comandos en PowerShell uno por uno:

# 1. OPCIÓN SIMPLE - DOS VENTANAS SEPARADAS:
# ==========================================

# Iniciar Backend:
Start-Process powershell -ArgumentList "-Command", "Set-Location 'C:\Users\User\Documents\SENA\inoutmanager\backend'; Write-Host '🚀 Backend iniciado' -ForegroundColor Green; node server.js; Read-Host 'Presione Enter para cerrar'"

# Iniciar Frontend (ejecutar después del comando anterior):
Start-Process powershell -ArgumentList "-Command", "Set-Location 'C:\Users\User\Documents\SENA\inoutmanager'; Write-Host '🚀 Frontend iniciado' -ForegroundColor Green; npm run dev; Read-Host 'Presione Enter para cerrar'"


# 2. OPCIÓN AVANZADA - EN LA MISMA TERMINAL:
# ==========================================

# Comando único para iniciar ambos en segundo plano:
$backend = Start-Process powershell -ArgumentList "-Command", "Set-Location 'C:\Users\User\Documents\SENA\inoutmanager\backend'; node server.js" -PassThru; $frontend = Start-Process powershell -ArgumentList "-Command", "Set-Location 'C:\Users\User\Documents\SENA\inoutmanager'; npm run dev" -PassThru; Write-Host "🎉 Servicios iniciados - Backend PID: $($backend.Id), Frontend PID: $($frontend.Id)" -ForegroundColor Green


# 3. OPCIÓN CON JOBS (EN SEGUNDO PLANO):
# =====================================

# Iniciar Backend como job:
Start-Job -Name "Backend" -ScriptBlock { Set-Location 'C:\Users\User\Documents\SENA\inoutmanager\backend'; node server.js }

# Iniciar Frontend como job:
Start-Job -Name "Frontend" -ScriptBlock { Set-Location 'C:\Users\User\Documents\SENA\inoutmanager'; npm run dev }

# Ver status de los jobs:
Get-Job

# Detener los jobs:
Stop-Job -Name "Backend", "Frontend"; Remove-Job -Name "Backend", "Frontend"


# 4. FUNCIÓN PERSONALIZADA:
# ========================

function Start-InOutManager {
    param(
        [switch]$Backend,
        [switch]$Frontend,
        [switch]$Both
    )
    
    if ($Both -or (-not $Backend -and -not $Frontend)) {
        $Backend = $true
        $Frontend = $true
    }
    
    if ($Backend) {
        Write-Host "🚀 Iniciando Backend..." -ForegroundColor Yellow
        $backendJob = Start-Job -Name "InOut-Backend" -ScriptBlock { 
            Set-Location 'C:\Users\User\Documents\SENA\inoutmanager\backend'
            node server.js 
        }
        Write-Host "✅ Backend iniciado (Job ID: $($backendJob.Id))" -ForegroundColor Green
    }
    
    if ($Frontend) {
        Write-Host "🚀 Iniciando Frontend..." -ForegroundColor Yellow
        $frontendJob = Start-Job -Name "InOut-Frontend" -ScriptBlock { 
            Set-Location 'C:\Users\User\Documents\SENA\inoutmanager'
            npm run dev 
        }
        Write-Host "✅ Frontend iniciado (Job ID: $($frontendJob.Id))" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🎉 Servicios disponibles en:" -ForegroundColor Green
    if ($Backend) { Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Cyan }
    if ($Frontend) { Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan }
    Write-Host ""
    Write-Host "Para detener: Stop-InOutManager" -ForegroundColor Yellow
}

function Stop-InOutManager {
    Get-Job -Name "InOut-*" | Stop-Job
    Get-Job -Name "InOut-*" | Remove-Job
    Write-Host "🛑 Servicios IN OUT MANAGER detenidos" -ForegroundColor Green
}

function Show-InOutManagerStatus {
    $jobs = Get-Job -Name "InOut-*" -ErrorAction SilentlyContinue
    if ($jobs) {
        Write-Host "📊 Estado de servicios IN OUT MANAGER:" -ForegroundColor Yellow
        $jobs | Format-Table Name, State, HasMoreData -AutoSize
    } else {
        Write-Host "📊 No hay servicios IN OUT MANAGER ejecutándose" -ForegroundColor Yellow
    }
}

# Usar las funciones:
# Start-InOutManager -Both      # Iniciar ambos
# Start-InOutManager -Backend   # Solo backend  
# Start-InOutManager -Frontend  # Solo frontend
# Show-InOutManagerStatus       # Ver estado
# Stop-InOutManager             # Detener todo