#!/usr/bin/env pwsh

# H3X Docker Import Helper Script
# Provides quick commands for common Docker image import scenarios

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("setup-dev", "setup-prod", "import-custom", "pull-base", "export-all", "verify", "help")]
    [string]$Operation,
    
    [string]$ImageDir = ".\images",
    [string]$Registry = "",
    [switch]$Force = $false
)

function Show-ImportHelp {
    Write-Host "H3X Docker Import Helper" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker-import-helper.ps1 -Operation <operation> [options]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Operations:" -ForegroundColor Green
    Write-Host "  setup-dev    - Setup development environment with base images" -ForegroundColor White
    Write-Host "  setup-prod   - Setup production environment with optimized images" -ForegroundColor White
    Write-Host "  import-custom- Import custom H3X images from directory" -ForegroundColor White
    Write-Host "  pull-base    - Pull all base images from registry" -ForegroundColor White
    Write-Host "  export-all   - Export all H3X images for backup" -ForegroundColor White
    Write-Host "  verify       - Verify all images are available and working" -ForegroundColor White
    Write-Host "  help         - Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Green
    Write-Host "  -ImageDir    - Directory containing image TAR files (default: .\images)" -ForegroundColor White
    Write-Host "  -Registry    - Registry URL for pulling images" -ForegroundColor White
    Write-Host "  -Force       - Force operations without confirmation" -ForegroundColor White
}

function Setup-DevEnvironment {
    Write-Host "Setting up H3X Development Environment..." -ForegroundColor Cyan
    
    # Pull base development images
    $devImages = @(
        "node:18-alpine",
        "nginx:alpine",
        "mongo:6.0",
        "redis:7-alpine"
    )
    
    foreach ($image in $devImages) {
        Write-Host "Pulling $image..." -ForegroundColor Yellow
        docker pull $image
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $image" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed to pull $image" -ForegroundColor Red
        }
    }
    
    # Build H3X application images
    Write-Host "Building H3X application images..." -ForegroundColor Cyan
    .\docker-manage.ps1 -Command build
    
    Write-Host "Development environment setup complete!" -ForegroundColor Green
}

function Setup-ProdEnvironment {
    Write-Host "Setting up H3X Production Environment..." -ForegroundColor Cyan
    
    # Check for production images in directory
    $prodImages = @(
        "h3x-frontend-prod.tar",
        "h3x-backend-prod.tar",
        "h3x-websocket-prod.tar"
    )
    
    foreach ($imageFile in $prodImages) {
        $imagePath = Join-Path $ImageDir $imageFile
        if (Test-Path $imagePath) {
            $imageName = $imageFile.Replace("-prod.tar", ":prod")
            Write-Host "Importing $imageName..." -ForegroundColor Yellow
            .\docker-manage.ps1 -Command import -ImagePath $imagePath -ImageName $imageName
        } else {
            Write-Host "Warning: Production image not found: $imagePath" -ForegroundColor Yellow
        }
    }
    
    # Pull monitoring stack
    Write-Host "Setting up monitoring stack..." -ForegroundColor Cyan
    docker pull prom/prometheus:latest
    docker pull grafana/grafana:latest
    
    Write-Host "Production environment setup complete!" -ForegroundColor Green
}

function Import-CustomImages {
    Write-Host "Importing custom H3X images from: $ImageDir" -ForegroundColor Cyan
    
    if (-not (Test-Path $ImageDir)) {
        Write-Host "Image directory not found: $ImageDir" -ForegroundColor Red
        return
    }
    
    $tarFiles = Get-ChildItem -Path $ImageDir -Filter "*.tar"
    
    if ($tarFiles.Count -eq 0) {
        Write-Host "No TAR files found in $ImageDir" -ForegroundColor Yellow
        return
    }
    
    foreach ($tarFile in $tarFiles) {
        $imageName = $tarFile.BaseName + ":custom"
        Write-Host "Importing $($tarFile.Name) as $imageName..." -ForegroundColor Yellow
        .\docker-manage.ps1 -Command import -ImagePath $tarFile.FullName -ImageName $imageName
    }
    
    Write-Host "Custom image import complete!" -ForegroundColor Green
}

function Pull-BaseImages {
    Write-Host "Pulling base images for H3X..." -ForegroundColor Cyan
    
    if ($Registry) {
        Write-Host "Using registry: $Registry" -ForegroundColor Yellow
        .\docker-manage.ps1 -Command registry-pull -Registry $Registry
    } else {
        .\docker-manage.ps1 -Command registry-pull
    }
    
    Write-Host "Base images pull complete!" -ForegroundColor Green
}

function Export-AllImages {
    Write-Host "Exporting all H3X images..." -ForegroundColor Cyan
    
    # Create export directory
    $exportDir = ".\exports\$(Get-Date -Format 'yyyy-MM-dd-HH-mm')"
    New-Item -ItemType Directory -Path $exportDir -Force | Out-Null
    
    # Get all H3X related images
    $h3xImages = docker images --format "table {{.Repository}}:{{.Tag}}" | Where-Object { $_ -match "h3x|flups" }
    
    foreach ($image in $h3xImages) {
        if ($image -match "REPOSITORY") { continue }  # Skip header
        
        $exportPath = Join-Path $exportDir "$($image.Replace(':', '-').Replace('/', '_')).tar"
        Write-Host "Exporting $image..." -ForegroundColor Yellow
        .\docker-manage.ps1 -Command export -ImageName $image -ImagePath $exportPath -Compress
    }
    
    Write-Host "All images exported to: $exportDir" -ForegroundColor Green
}

function Verify-Images {
    Write-Host "Verifying H3X Docker images..." -ForegroundColor Cyan
    
    # Check required images exist
    $requiredImages = @(
        "node:18-alpine",
        "nginx:alpine", 
        "mongo:6.0",
        "redis:7-alpine"
    )
    
    $missingImages = @()
    
    foreach ($image in $requiredImages) {
        $imageExists = docker images --format "{{.Repository}}:{{.Tag}}" | Where-Object { $_ -eq $image }
        if ($imageExists) {
            Write-Host "  ✓ $image" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $image (missing)" -ForegroundColor Red
            $missingImages += $image
        }
    }
    
    # Check H3X specific images
    $h3xImages = docker images --format "{{.Repository}}:{{.Tag}}" | Where-Object { $_ -match "h3x" }
    Write-Host ""
    Write-Host "H3X Images:" -ForegroundColor Cyan
    foreach ($image in $h3xImages) {
        Write-Host "  ✓ $image" -ForegroundColor Green
    }
    
    if ($missingImages.Count -eq 0) {
        Write-Host ""
        Write-Host "All required images are available!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Missing images: $($missingImages -join ', ')" -ForegroundColor Red
        Write-Host "Run 'pull-base' operation to download missing images." -ForegroundColor Yellow
    }
}

# Main execution
switch ($Operation) {
    "setup-dev" { Setup-DevEnvironment }
    "setup-prod" { Setup-ProdEnvironment }
    "import-custom" { Import-CustomImages }
    "pull-base" { Pull-BaseImages }
    "export-all" { Export-AllImages }
    "verify" { Verify-Images }
    "help" { Show-ImportHelp }
}
