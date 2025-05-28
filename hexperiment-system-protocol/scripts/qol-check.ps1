# Quality of Life (QoL) script for local connectivity, cleanliness, and modularity
$ScriptDir = $PSScriptRoot

Write-Host "[QoL] === H3X Quality of Life Check ===" -ForegroundColor Magenta

Write-Host "[QoL] Checking environment status..." -ForegroundColor Cyan
pwsh "$ScriptDir\env-switcher.ps1" status

Write-Host "[QoL] Running Go format..." -ForegroundColor Yellow
pwsh "$ScriptDir\go-fmt.ps1"

Write-Host "[QoL] Running Go vet..." -ForegroundColor Yellow
pwsh "$ScriptDir\go-vet.ps1"

Write-Host "[QoL] Running Go mod tidy..." -ForegroundColor Yellow
pwsh "$ScriptDir\go-mod-tidy.ps1"

Write-Host "[QoL] Running Go tests..." -ForegroundColor Yellow
pwsh "$ScriptDir\go-test.ps1"

Write-Host "[QoL] Checking Docker containers..." -ForegroundColor Cyan
docker ps --format "table {{.Names}}	{{.Status}}	{{.Ports}}"

Write-Host "[QoL] Checking local network connectivity (Docker)..." -ForegroundColor Cyan
docker network ls | Select-String "h3x"

Write-Host "[QoL] Checking for running LM Studio and protocol containers..." -ForegroundColor Cyan
docker ps --filter "name=lmstudio" --filter "name=protocol" --filter "name=mcp" --format "table {{.Names}}	{{.Status}}"

Write-Host "[QoL] Checking Docker volumes..." -ForegroundColor Cyan
docker volume ls | Select-String "h3x"

Write-Host "[QoL] Environment check complete!" -ForegroundColor Green
Write-Host "[QoL] Quick commands:" -ForegroundColor Yellow
Write-Host "  npm run env:dev     - Start development environment" -ForegroundColor White
Write-Host "  npm run env:prod    - Start production environment" -ForegroundColor White
Write-Host "  npm run env:status  - Check current status" -ForegroundColor White
Write-Host "  npm run env:quick   - Show all environment commands" -ForegroundColor White
