# Environment Switcher Validation Script
# Tests the environment management system

Write-Host "=== H3X Environment Switcher Validation ===" -ForegroundColor Magenta

$ScriptDir = $PSScriptRoot
$EnvSwitcher = "$ScriptDir\env-switcher.ps1"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

function Test-FileExists {
    param([string]$FilePath, [string]$Description)
    if (Test-Path $FilePath) {
        Write-Host "✅ $Description exists: $FilePath" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $Description missing: $FilePath" -ForegroundColor Red
        return $false
    }
}

function Test-Command {
    param([string]$Command, [string]$Description)
    try {
        $result = Invoke-Expression $Command 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Description works" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $Description failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $Description failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n--- File Validation ---" -ForegroundColor Yellow

$files = @(
    @("$ProjectRoot\docker-compose.dev.yml", "Development Compose File"),
    @("$ProjectRoot\docker-compose.prod.yml", "Production Compose File"),
    @("$ProjectRoot\.env.dev", "Development Environment File"),
    @("$ProjectRoot\.env.prod", "Production Environment File"),
    @("$EnvSwitcher", "Environment Switcher Script"),
    @("$ScriptDir\env-quick.ps1", "Quick Environment Script")
)

$fileResults = @()
foreach ($file in $files) {
    $fileResults += Test-FileExists $file[0] $file[1]
}

Write-Host "`n--- Script Validation ---" -ForegroundColor Yellow

$scriptResults = @()
$scriptResults += Test-Command "pwsh $EnvSwitcher list" "Environment List Command"
$scriptResults += Test-Command "pwsh $EnvSwitcher status" "Environment Status Command"

Write-Host "`n--- Docker Validation ---" -ForegroundColor Yellow

$dockerResults = @()
$dockerResults += Test-Command "docker --version" "Docker Installation"
$dockerResults += Test-Command "docker-compose --version" "Docker Compose Installation"

Write-Host "`n--- NPM Script Validation ---" -ForegroundColor Yellow

Push-Location $ProjectRoot
try {
    $npmResults = @()
    $npmResults += Test-Command "npm run env:status" "NPM Environment Status"
    $npmResults += Test-Command "npm run env:list" "NPM Environment List"
} finally {
    Pop-Location
}

Write-Host "`n--- Summary ---" -ForegroundColor Cyan

$totalTests = $fileResults.Count + $scriptResults.Count + $dockerResults.Count + $npmResults.Count
$passedTests = ($fileResults + $scriptResults + $dockerResults + $npmResults | Where-Object { $_ -eq $true }).Count

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red

if ($passedTests -eq $totalTests) {
    Write-Host "`n🎉 All validation tests passed! Environment switcher is ready to use." -ForegroundColor Green
    Write-Host "`nQuick Start:" -ForegroundColor Yellow
    Write-Host "  npm run env:dev     - Start development environment" -ForegroundColor White
    Write-Host "  npm run env:prod    - Start production environment" -ForegroundColor White
    Write-Host "  npm run env:status  - Check current environment" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Some validation tests failed. Please check the errors above." -ForegroundColor Yellow
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Ensure Docker and Docker Compose are installed" -ForegroundColor White
    Write-Host "  2. Check that all required files exist in the project" -ForegroundColor White
    Write-Host "  3. Verify PowerShell execution policy allows script execution" -ForegroundColor White
}

Write-Host "`n--- Environment Management Documentation ---" -ForegroundColor Cyan
Write-Host "See: docs/environment-management.md for complete usage guide" -ForegroundColor Gray
