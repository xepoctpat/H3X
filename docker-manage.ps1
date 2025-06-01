#!/usr/bin/env pwsh

# H3X Docker Management Script
# Provides commands to manage Docker containers for the H3X project

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("build", "up", "down", "restart", "logs", "status", "import", "export", "clean", "batch-import", "registry-pull", "help")]
    [string]$Command,
    
    [string]$Service = "",
    [string]$ImagePath = "",
    [string]$ImageName = "",
    [string]$Registry = "",
    [string]$ConfigFile = "",
    [switch]$Force = $false,
    [switch]$Compress = $false
)

function Show-Help {
    Write-Host "H3X Docker Management Script" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker-manage.ps1 -Command <command> [options]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Green
    Write-Host "  build     - Build all Docker images"
    Write-Host "  up        - Start all services"
    Write-Host "  down      - Stop all services"
    Write-Host "  restart   - Restart services"
    Write-Host "  logs      - Show logs for service"
    Write-Host "  status    - Show status of all services"
    Write-Host "  import    - Import Docker image from file"
    Write-Host "  export    - Export Docker image to file"
    Write-Host "  clean     - Clean up unused containers and images"
    Write-Host "  help      - Show this help"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Green
    Write-Host "  -Service    - Specific service name (for logs, restart)"
    Write-Host "  -ImagePath  - Path to image file (for import/export)"
    Write-Host "  -ImageName  - Name of image (for import/export)"
    Write-Host "  -Force      - Force operation without confirmation"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\docker-manage.ps1 -Command build"
    Write-Host "  .\docker-manage.ps1 -Command up"
    Write-Host "  .\docker-manage.ps1 -Command logs -Service h3x-frontend"
    Write-Host "  .\docker-manage.ps1 -Command import -ImagePath 'h3x-app.tar' -ImageName 'h3x-app:latest'"
    Write-Host "  .\docker-manage.ps1 -Command export -ImageName 'h3x-app:latest' -ImagePath 'h3x-export.tar'"
}

function Invoke-DockerBuild {
    Write-Host "Building H3X Docker images..." -ForegroundColor Cyan
    docker-compose build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Build failed!" -ForegroundColor Red
        exit 1
    }
}

function Invoke-DockerUp {
    Write-Host "Starting H3X services..." -ForegroundColor Cyan
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Services started successfully!" -ForegroundColor Green
        Start-Sleep 3
        Invoke-DockerStatus
    } else {
        Write-Host "Failed to start services!" -ForegroundColor Red
        exit 1
    }
}

function Invoke-DockerDown {
    Write-Host "Stopping H3X services..." -ForegroundColor Cyan
    docker-compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Services stopped successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to stop services!" -ForegroundColor Red
        exit 1
    }
}

function Invoke-DockerRestart {
    if ($Service) {
        Write-Host "Restarting service: $Service" -ForegroundColor Cyan
        docker-compose restart $Service
    } else {
        Write-Host "Restarting all H3X services..." -ForegroundColor Cyan
        docker-compose restart
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Restart completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Restart failed!" -ForegroundColor Red
        exit 1
    }
}

function Show-DockerLogs {
    if ($Service) {
        Write-Host "Showing logs for service: $Service" -ForegroundColor Cyan
        docker-compose logs -f $Service
    } else {
        Write-Host "Showing logs for all services:" -ForegroundColor Cyan
        docker-compose logs -f
    }
}

function Show-DockerStatus {
    Write-Host "H3X Services Status:" -ForegroundColor Cyan
    Write-Host "===================" -ForegroundColor Cyan
    docker-compose ps
    Write-Host ""
    Write-Host "Docker Images:" -ForegroundColor Cyan
    docker images | Where-Object { $_ -match "h3x|flups" }
    Write-Host ""
    Write-Host "Network Status:" -ForegroundColor Cyan
    docker network ls | Where-Object { $_ -match "h3x" }
}

function Import-DockerImage {
    if (-not $ImagePath -or -not $ImageName) {
        Write-Host "Both -ImagePath and -ImageName are required for import!" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Path $ImagePath)) {
        Write-Host "Image file not found: $ImagePath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Importing Docker image from: $ImagePath" -ForegroundColor Cyan
    docker load -i $ImagePath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Image imported successfully!" -ForegroundColor Green
        # Tag the image if needed
        if ($ImageName -ne "") {
            docker tag (docker images -q | Select-Object -First 1) $ImageName
            Write-Host "Image tagged as: $ImageName" -ForegroundColor Green
        }
    } else {
        Write-Host "Failed to import image!" -ForegroundColor Red
        exit 1
    }
}

function Import-BatchDockerImages {
    if (-not $ConfigFile) {
        Write-Host "ConfigFile parameter is required for batch import!" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Path $ConfigFile)) {
        Write-Host "Config file not found: $ConfigFile" -ForegroundColor Red
        exit 1
    }
    
    try {
        $config = Get-Content $ConfigFile | ConvertFrom-Json
        Write-Host "Starting batch import of $($config.images.Count) images..." -ForegroundColor Cyan
        
        foreach ($image in $config.images) {
            Write-Host "Importing $($image.name)..." -ForegroundColor Yellow
            
            if (-not (Test-Path $image.path)) {
                Write-Host "Warning: Image file not found: $($image.path)" -ForegroundColor Yellow
                continue
            }
            
            docker load -i $image.path
            if ($LASTEXITCODE -eq 0) {
                if ($image.tag) {
                    $imageId = docker images -q | Select-Object -First 1
                    docker tag $imageId $image.tag
                    Write-Host "  ✓ Imported and tagged as: $($image.tag)" -ForegroundColor Green
                } else {
                    Write-Host "  ✓ Imported successfully" -ForegroundColor Green
                }
            } else {
                Write-Host "  ✗ Failed to import: $($image.name)" -ForegroundColor Red
            }
        }
        
        Write-Host "Batch import completed!" -ForegroundColor Green
    }
    catch {
        Write-Host "Error processing config file: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

function Invoke-RegistryPull {
    if (-not $Registry) {
        $Registry = "docker.io"  # Default to Docker Hub
    }
    
    Write-Host "Pulling H3X images from registry: $Registry" -ForegroundColor Cyan
    
    $h3xImages = @(
        "node:18-alpine",
        "nginx:alpine", 
        "mongo:6.0",
        "redis:7-alpine",
        "prom/prometheus:latest",
        "grafana/grafana:latest"
    )
    
    # If specific config file provided, use that instead
    if ($ConfigFile -and (Test-Path $ConfigFile)) {
        try {
            $config = Get-Content $ConfigFile | ConvertFrom-Json
            $h3xImages = $config.registryImages
        }
        catch {
            Write-Host "Warning: Could not parse config file, using defaults" -ForegroundColor Yellow
        }
    }
    
    foreach ($image in $h3xImages) {
        Write-Host "Pulling $image..." -ForegroundColor Yellow
        docker pull $image
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Successfully pulled: $image" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed to pull: $image" -ForegroundColor Red
        }
    }
    
    Write-Host "Registry pull completed!" -ForegroundColor Green
}

function Export-DockerImage {
    if (-not $ImageName -or -not $ImagePath) {
        Write-Host "Both -ImageName and -ImagePath are required for export!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Exporting Docker image: $ImageName to $ImagePath" -ForegroundColor Cyan
    docker save -o $ImagePath $ImageName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Image exported successfully to: $ImagePath" -ForegroundColor Green
        $fileSize = (Get-Item $ImagePath).Length / 1MB
        Write-Host "Export file size: $($fileSize.ToString('N2')) MB" -ForegroundColor Cyan
        
        # Compress if requested
        if ($Compress) {
            Write-Host "Compressing exported image..." -ForegroundColor Yellow
            $compressedPath = "$ImagePath.gz"
            Compress-Archive -Path $ImagePath -DestinationPath $compressedPath -Force
            Remove-Item $ImagePath
            $compressedSize = (Get-Item $compressedPath).Length / 1MB
            Write-Host "Compressed file size: $($compressedSize.ToString('N2')) MB" -ForegroundColor Cyan
            Write-Host "Compression ratio: $((($fileSize - $compressedSize) / $fileSize * 100).ToString('N1'))%" -ForegroundColor Cyan
        }
    } else {
        Write-Host "Failed to export image!" -ForegroundColor Red
        exit 1
    }
}

function Invoke-DockerClean {
    if (-not $Force) {
        $confirmation = Read-Host "This will remove unused containers, networks, and images. Continue? (y/N)"
        if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
            Write-Host "Operation cancelled." -ForegroundColor Yellow
            return
        }
    }
    
    Write-Host "Cleaning up Docker resources..." -ForegroundColor Cyan
    
    # Remove stopped containers
    Write-Host "Removing stopped containers..." -ForegroundColor Yellow
    docker container prune -f
    
    # Remove unused networks
    Write-Host "Removing unused networks..." -ForegroundColor Yellow
    docker network prune -f
    
    # Remove unused images
    Write-Host "Removing unused images..." -ForegroundColor Yellow
    docker image prune -f
    
    # Remove unused volumes
    Write-Host "Removing unused volumes..." -ForegroundColor Yellow
    docker volume prune -f
    
    Write-Host "Cleanup completed!" -ForegroundColor Green
}

# Main script execution
switch ($Command) {
    "build" { Invoke-DockerBuild }
    "up" { Invoke-DockerUp }
    "down" { Invoke-DockerDown }
    "restart" { Invoke-DockerRestart }
    "logs" { Show-DockerLogs }
    "status" { Show-DockerStatus }
    "import" { Import-DockerImage }
    "export" { Export-DockerImage }
    "batch-import" { Import-BatchDockerImages }
    "registry-pull" { Invoke-RegistryPull }
    "clean" { Invoke-DockerClean }
    "help" { Show-Help }
}
