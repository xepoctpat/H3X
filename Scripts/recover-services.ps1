Write-Host "🔧 H3X-fLups Service Recovery Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# Stop all services
Write-Host "`n📍 Stopping all services..." -ForegroundColor Yellow
docker-compose -f docker-compose.babillon-unified.yml down -v

# Clean up
Write-Host "`n🧹 Cleaning up Docker system..." -ForegroundColor Yellow
docker system prune -f

# Start essential services first (databases)
Write-Host "`n🚀 Starting essential services (databases)..." -ForegroundColor Yellow
docker-compose -f docker-compose.babillon-unified.yml up -d babillon-redis babillon-mongodb babillon-postgres

# Wait for databases
Write-Host "`n⏳ Waiting for databases to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Start remaining services
Write-Host "`n🚀 Starting application services..." -ForegroundColor Yellow
docker-compose -f docker-compose.babillon-unified.yml up -d

# Wait for services to start
Write-Host "`n⏳ Waiting for all services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Check status
Write-Host "`n📊 Current Docker container status:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`n✅ Recovery process completed!" -ForegroundColor Green
Write-Host "Finished at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
