# ==========================================
# VALIDACIÓN DE UNIFICACIÓN DE HTML
# ==========================================
# Script para validar que todos los archivos HTML tengan:
# - Header y footer unificados
# - Rutas de recursos correctas
# - Versiones consistentes
# - Sin código muerto
# ==========================================

Write-Host "🔍 VALIDACIÓN DE UNIFICACIÓN HTML - IN OUT MANAGER" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Definir rutas y patrones
$frontendPath = "frontend"
$htmlFiles = Get-ChildItem -Path $frontendPath -Filter "*.html" -Recurse | Where-Object { $_.Name -notlike "test-*" }

Write-Host "📋 Archivos HTML encontrados:" -ForegroundColor Yellow
$htmlFiles | ForEach-Object { Write-Host "  - $($_.FullName)" -ForegroundColor Gray }

# Patrones para validar
$requiredPatterns = @{
    "Header estándar" = 'class="site-header"'
    "Footer estándar" = 'class="site-footer"'
    "Versión CSS styles" = 'styles\.css\?v=20250702003'
    "Versión CSS footer" = 'footer-styles\.css\?v=20250702004'
    "Font Awesome" = 'font-awesome'
    "Icono favicon" = 'rel="icon"'
    "Meta viewport" = 'name="viewport"'
    "Meta charset" = 'charset="UTF-8"'
}

$prohibitedPatterns = @{
    "Estilos inline" = 'style="'
    "Scripts inline" = '<script>(?![^<]*defer)'
    "Rutas absolutas incorrectas" = 'href="(?!\.\.\/|https?:\/\/)'
    "Console.log" = 'console\.log'
    "Alert" = 'alert\('
    "Comentarios TODO" = '<!-- TODO'
    "Código muerto" = '<!-- DEAD|<!-- UNUSED|<!-- ELIMINAR'
}

# Contadores
$totalFiles = $htmlFiles.Count
$validFiles = 0
$errors = @()

Write-Host "`n🔎 Validando archivos..." -ForegroundColor Cyan

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $fileName = $file.Name
    $fileErrors = @()
    
    Write-Host "`n📄 $fileName" -ForegroundColor White
    
    # Validar patrones requeridos
    foreach ($pattern in $requiredPatterns.GetEnumerator()) {
        if ($content -notmatch $pattern.Value) {
            $fileErrors += "❌ Falta: $($pattern.Key)"
        } else {
            Write-Host "  ✅ $($pattern.Key)" -ForegroundColor Green
        }
    }
    
    # Validar patrones prohibidos
    foreach ($pattern in $prohibitedPatterns.GetEnumerator()) {
        if ($content -match $pattern.Value) {
            $fileErrors += "⚠️ Encontrado: $($pattern.Key)"
        }
    }
    
    # Validar estructura específica por tipo
    if ($fileName -like "*auth*" -or $fileName -like "*login*" -or $fileName -like "*registro*" -or $fileName -like "*recuperar*") {
        if ($content -notmatch 'class="auth-page"') {
            $fileErrors += "❌ Falta clase auth-page en body"
        }
        if ($content -notmatch 'auth\.css') {
            $fileErrors += "❌ Falta CSS de autenticación"
        }
    }
    
    # Validar dashboards
    if ($fileName -like "*dashboard*") {
        if ($content -notmatch 'dashboard-empleado\.js|dashboard-admin\.js') {
            $fileErrors += "❌ Falta script específico de dashboard"
        }
    }
    
    # Mostrar errores del archivo
    if ($fileErrors.Count -eq 0) {
        Write-Host "  ✅ Archivo válido" -ForegroundColor Green
        $validFiles++
    } else {
        Write-Host "  ❌ Errores encontrados:" -ForegroundColor Red
        $fileErrors | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
        $errors += "$fileName`: $($fileErrors -join ', ')"
    }
}

# Resumen final
Write-Host "`n=============================================" -ForegroundColor Green
Write-Host "📊 RESUMEN DE VALIDACIÓN" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Total de archivos: $totalFiles" -ForegroundColor White
Write-Host "Archivos válidos: $validFiles" -ForegroundColor Green
Write-Host "Archivos con errores: $($totalFiles - $validFiles)" -ForegroundColor Red

if ($errors.Count -gt 0) {
    Write-Host "`n❌ ERRORES ENCONTRADOS:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
} else {
    Write-Host "`n🎉 TODOS LOS ARCHIVOS ESTÁN CORRECTAMENTE UNIFICADOS" -ForegroundColor Green
}

# Validación adicional: verificar que no existan archivos de prueba
$testFiles = Get-ChildItem -Path $frontendPath -Filter "test-*.html" -Recurse
if ($testFiles.Count -gt 0) {
    Write-Host "`n⚠️ ARCHIVOS DE PRUEBA ENCONTRADOS:" -ForegroundColor Yellow
    $testFiles | ForEach-Object { Write-Host "  - $($_.FullName)" -ForegroundColor Red }
    Write-Host "  Estos archivos deberían ser eliminados." -ForegroundColor Yellow
} else {
    Write-Host "`n✅ No se encontraron archivos de prueba" -ForegroundColor Green
}

Write-Host "`nValidacion completada" -ForegroundColor Green
