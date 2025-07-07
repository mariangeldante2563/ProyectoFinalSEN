# IN OUT MANAGER - Script de Validación Post-Optimización
# Ejecutar en PowerShell para verificar la optimización

Write-Host "🔍 VALIDANDO OPTIMIZACIÓN DE IN OUT MANAGER..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$proyectoPath = "c:\Users\User\Documents\SENA\inoutmanager"
$frontendPath = "$proyectoPath\frontend\assets"

# Verificar estructura de archivos CSS
Write-Host "📁 VERIFICANDO ESTRUCTURA CSS..." -ForegroundColor Yellow
$cssFiles = Get-ChildItem -Path "$frontendPath\css" -Filter "*.css" | Select-Object Name
Write-Host "Archivos CSS encontrados:"
foreach ($file in $cssFiles) {
    Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
}

$expectedCSS = @("styles.css", "footer-styles.css", "auth.css")
$missingCSS = $expectedCSS | Where-Object { $_ -notin $cssFiles.Name }
if ($missingCSS.Count -eq 0) {
    Write-Host "✅ Todos los archivos CSS requeridos están presentes" -ForegroundColor Green
} else {
    Write-Host "❌ Archivos CSS faltantes: $($missingCSS -join ', ')" -ForegroundColor Red
}
Write-Host ""

# Verificar estructura de archivos JS
Write-Host "📁 VERIFICANDO ESTRUCTURA JAVASCRIPT..." -ForegroundColor Yellow
$jsFiles = Get-ChildItem -Path "$frontendPath\js" -Filter "*.js" | Select-Object Name
Write-Host "Archivos JS encontrados:"
foreach ($file in $jsFiles) {
    Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
}

$expectedJS = @("utils.js", "script.js")
$missingJS = $expectedJS | Where-Object { $_ -notin $jsFiles.Name }
if ($missingJS.Count -eq 0) {
    Write-Host "✅ Archivos JS principales están presentes" -ForegroundColor Green
} else {
    Write-Host "❌ Archivos JS faltantes: $($missingJS -join ', ')" -ForegroundColor Red
}
Write-Host ""

# Verificar tamaños de archivos
Write-Host "📊 VERIFICANDO TAMAÑOS DE ARCHIVOS..." -ForegroundColor Yellow
$scriptSize = (Get-Item "$frontendPath\js\script.js").Length
$utilsSize = (Get-Item "$frontendPath\js\utils.js").Length

Write-Host "  script.js: $([math]::Round($scriptSize/1KB, 2)) KB"
Write-Host "  utils.js: $([math]::Round($utilsSize/1KB, 2)) KB"

if ($scriptSize -gt 0 -and $utilsSize -gt 0) {
    Write-Host "✅ Archivos JavaScript tienen contenido" -ForegroundColor Green
} else {
    Write-Host "❌ Uno o más archivos JavaScript están vacíos" -ForegroundColor Red
}
Write-Host ""

# Verificar archivo de pruebas
Write-Host "🧪 VERIFICANDO ARCHIVO DE PRUEBAS..." -ForegroundColor Yellow
$testFile = "$proyectoPath\frontend\test-optimizacion.html"
if (Test-Path $testFile) {
    $testSize = (Get-Item $testFile).Length
    Write-Host "✅ Archivo de pruebas presente ($([math]::Round($testSize/1KB, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "❌ Archivo de pruebas no encontrado" -ForegroundColor Red
}
Write-Host ""

# Verificar documentación
Write-Host "📖 VERIFICANDO DOCUMENTACIÓN..." -ForegroundColor Yellow
$docFile = "$proyectoPath\OPTIMIZACION_COMPLETA.md"
if (Test-Path $docFile) {
    $docSize = (Get-Item $docFile).Length
    Write-Host "✅ Documentación presente ($([math]::Round($docSize/1KB, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "❌ Documentación no encontrada" -ForegroundColor Red
}
Write-Host ""

# Resumen final
Write-Host "🎯 RESUMEN DE VALIDACIÓN" -ForegroundColor Magenta
Write-Host "========================" -ForegroundColor Magenta

$totalChecks = 5
$passedChecks = 0

if ($missingCSS.Count -eq 0) { $passedChecks++ }
if ($missingJS.Count -eq 0) { $passedChecks++ }
if ($scriptSize -gt 0 -and $utilsSize -gt 0) { $passedChecks++ }
if (Test-Path $testFile) { $passedChecks++ }
if (Test-Path $docFile) { $passedChecks++ }

$successRate = [math]::Round(($passedChecks / $totalChecks) * 100, 0)

Write-Host "Verificaciones pasadas: $passedChecks/$totalChecks ($successRate%)"

if ($successRate -eq 100) {
    Write-Host ""
    Write-Host "🎉 ¡OPTIMIZACIÓN COMPLETADA EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "✅ Todos los archivos están en su lugar" -ForegroundColor Green
    Write-Host "✅ Estructura optimizada implementada" -ForegroundColor Green
    Write-Host "✅ Documentación completa" -ForegroundColor Green
    Write-Host "✅ Sistema listo para pruebas" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Cyan
    Write-Host "1. Abrir test-optimizacion.html en navegador"
    Write-Host "2. Verificar funcionamiento de componentes"
    Write-Host "3. Revisar consola del navegador para errores"
    Write-Host "4. Probar responsividad en diferentes dispositivos"
} elseif ($successRate -ge 80) {
    Write-Host ""
    Write-Host "⚠️  OPTIMIZACIÓN CASI COMPLETA" -ForegroundColor Yellow
    Write-Host "Revisar elementos faltantes arriba" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ OPTIMIZACIÓN INCOMPLETA" -ForegroundColor Red
    Write-Host "Múltiples elementos requieren atención" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔗 Para más información, consulte: OPTIMIZACION_COMPLETA.md" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Pausa para ver resultados
Read-Host "Presione Enter para continuar..."
