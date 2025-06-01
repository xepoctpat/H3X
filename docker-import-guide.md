# H3X Docker Image Import Guide

## Overview
This guide covers various methods to import existing Docker images into your H3X project. Your project already has a comprehensive Docker setup with multi-service orchestration.

## Current H3X Docker Architecture
Your project includes these services:
- **h3x-frontend**: Main React/TypeScript application
- **h3x-backend**: Node.js API server
- **h3x-websocket**: WebSocket server for real-time communication
- **mongodb**: Database for H3X data
- **redis**: Caching and session storage
- **nginx**: Reverse proxy and load balancer
- **prometheus**: Monitoring and metrics
- **grafana**: Visualization and dashboards

## Method 1: Import from TAR Files

### Using PowerShell Management Script
```powershell
# Import a Docker image from TAR file
.\docker-manage.ps1 -Command import -ImagePath "C:\path\to\your-image.tar" -ImageName "h3x-custom:latest"

# Example: Import a custom H3X backend image
.\docker-manage.ps1 -Command import -ImagePath ".\images\h3x-backend-custom.tar" -ImageName "h3x-backend:custom"
```

### Manual Docker Commands
```powershell
# Load image from TAR file
docker load -i "C:\path\to\your-image.tar"

# Load and see what was imported
docker load -i "h3x-backend.tar"
docker images | Select-String "h3x"
```

## Method 2: Pull from Docker Registry

### Docker Hub
```powershell
# Pull official images
docker pull node:18-alpine
docker pull nginx:alpine
docker pull mongo:6.0
docker pull redis:7-alpine
docker pull prom/prometheus:latest
docker pull grafana/grafana:latest

# Pull specific H3X images (if published)
docker pull your-username/h3x-frontend:latest
docker pull your-username/h3x-backend:latest
```

### Private Registry
```powershell
# Login to private registry
docker login your-registry.com

# Pull from private registry
docker pull your-registry.com/h3x-project/frontend:latest
docker pull your-registry.com/h3x-project/backend:latest

# Tag for local use
docker tag your-registry.com/h3x-project/frontend:latest h3x-frontend:latest
```

## Method 3: Import from Another System

### Export from Source System
```powershell
# Export H3X images from source system
.\docker-manage.ps1 -Command export -ImageName "h3x-frontend:latest" -ImagePath "h3x-frontend.tar"
.\docker-manage.ps1 -Command export -ImageName "h3x-backend:latest" -ImagePath "h3x-backend.tar"

# Or manually
docker save -o h3x-frontend.tar h3x-frontend:latest
docker save -o h3x-backend.tar h3x-backend:latest

# Compress for transfer
gzip h3x-frontend.tar
gzip h3x-backend.tar
```

### Import on Target System
```powershell
# Decompress and import
gunzip h3x-frontend.tar.gz
gunzip h3x-backend.tar.gz

.\docker-manage.ps1 -Command import -ImagePath "h3x-frontend.tar" -ImageName "h3x-frontend:latest"
.\docker-manage.ps1 -Command import -ImagePath "h3x-backend.tar" -ImageName "h3x-backend:latest"
```

## Method 4: Update docker-compose.yml for Custom Images

### Replace Built Images with Imported Ones
```yaml
services:
  h3x-frontend:
    # Instead of building from Dockerfile
    # build: 
    #   context: .
    #   dockerfile: Dockerfile
    
    # Use imported image
    image: h3x-frontend:custom
    ports:
      - "3000:3000"
    # ... rest of configuration
  
  h3x-backend:
    # Instead of node:18-alpine base
    # image: node:18-alpine
    
    # Use custom backend image
    image: h3x-backend:custom
    ports:
      - "3007:3007"
    # ... rest of configuration
```

## Method 5: Batch Import Multiple Images

### Create Import Script
```powershell
# Create batch import script
$images = @(
    @{Path=".\images\h3x-frontend.tar"; Name="h3x-frontend:latest"},
    @{Path=".\images\h3x-backend.tar"; Name="h3x-backend:latest"},
    @{Path=".\images\h3x-websocket.tar"; Name="h3x-websocket:latest"}
)

foreach ($image in $images) {
    Write-Host "Importing $($image.Name)..." -ForegroundColor Cyan
    .\docker-manage.ps1 -Command import -ImagePath $image.Path -ImageName $image.Name
}
```

## Method 6: Development Workflow Integration

### Pre-built Development Images
```powershell
# Pull pre-built development environment
docker pull your-team/h3x-dev-environment:latest

# Tag for local development
docker tag your-team/h3x-dev-environment:latest h3x-dev:latest

# Update docker-compose.override.yml for development
```

### Production Images
```powershell
# Import production-ready images
.\docker-manage.ps1 -Command import -ImagePath "prod-images\h3x-prod.tar" -ImageName "h3x-prod:latest"

# Deploy with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Method 7: Container Registry Integration

### Setup Registry Configuration
```powershell
# Configure Docker to use specific registry
$registryConfig = @{
    "registry-mirrors" = @("https://your-registry.com")
    "insecure-registries" = @("your-internal-registry:5000")
}

# Save to Docker config
$registryConfig | ConvertTo-Json | Out-File -FilePath "$env:USERPROFILE\.docker\daemon.json"
```

### Automated Registry Pull
```powershell
# Create registry pull script
$registryImages = @(
    "your-registry.com/h3x/frontend:latest",
    "your-registry.com/h3x/backend:latest",
    "your-registry.com/h3x/websocket:latest"
)

foreach ($image in $registryImages) {
    docker pull $image
    $localTag = $image.Split('/')[-1]
    docker tag $image $localTag
}
```

## Verification and Testing

### Verify Imported Images
```powershell
# List all H3X related images
docker images | Select-String "h3x"

# Inspect image details
docker inspect h3x-frontend:latest
docker inspect h3x-backend:latest

# Test image functionality
docker run --rm h3x-frontend:latest npm --version
```

### Integration Testing
```powershell
# Test with imported images
.\docker-manage.ps1 -Command up

# Check service health
.\docker-manage.ps1 -Command status

# View logs
.\docker-manage.ps1 -Command logs -Service h3x-frontend
```

## Troubleshooting

### Common Import Issues
```powershell
# Image not found after import
docker images --all
docker image ls --filter "dangling=true"

# Tag issues
docker tag <image-id> h3x-frontend:latest

# Permission issues
# Run PowerShell as Administrator

# Cleanup and retry
.\docker-manage.ps1 -Command clean -Force
```

### Performance Optimization
```powershell
# Use layer caching
docker build --cache-from h3x-frontend:latest .

# Parallel imports
Start-Job -ScriptBlock { 
    .\docker-manage.ps1 -Command import -ImagePath "image1.tar" -ImageName "h3x-app1:latest" 
}
```

## Best Practices

1. **Version Management**: Always tag imported images with specific versions
2. **Security Scanning**: Scan imported images for vulnerabilities
3. **Size Optimization**: Use multi-stage builds and minimal base images
4. **Registry Strategy**: Use private registries for proprietary images
5. **Backup Strategy**: Regularly export critical images
6. **Documentation**: Document image sources and modification history

## Integration with H3X Project

Your H3X project is already configured with:
- ✅ Multi-service Docker Compose
- ✅ PowerShell management scripts
- ✅ Production-ready Dockerfile
- ✅ Nginx reverse proxy
- ✅ Monitoring stack (Prometheus/Grafana)
- ✅ Database initialization scripts

Simply replace the base images in `docker-compose.yml` with your imported custom images and run:

```powershell
.\docker-manage.ps1 -Command up
```
