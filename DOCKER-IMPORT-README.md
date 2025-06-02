# H3X Docker Import & Management Guide

## Quick Start

Your H3X project now has comprehensive Docker support with multiple ways to import and manage container images.

## Available Tools

### 1. PowerShell Management Scripts

- `docker-manage.ps1` - Core Docker operations
- `docker-import-helper.ps1` - Specialized import operations

### 2. NPM Scripts

```bash
npm run docker:up          # Start all services
npm run docker:down        # Stop all services  
npm run docker:build       # Build H3X images
npm run docker:status      # Show service status
npm run docker:logs        # View service logs
npm run docker:setup-dev   # Setup development environment
npm run docker:setup-prod  # Setup production environment
npm run docker:verify      # Verify all images
npm run docker:export      # Export all images for backup
```

## Import Methods

### Method 1: Import TAR Files

```powershell
# Import single image
.\docker-manage.ps1 -Command import -ImagePath "h3x-backend.tar" -ImageName "h3x-backend:latest"

# Batch import from config file
.\docker-manage.ps1 -Command batch-import -ConfigFile "docker-import-config.json"

# Import with helper script
.\docker-import-helper.ps1 -Operation import-custom -ImageDir ".\images"
```

### Method 2: Pull from Registry

```powershell
# Pull base images
.\docker-manage.ps1 -Command registry-pull

# Pull from specific registry
.\docker-manage.ps1 -Command registry-pull -Registry "your-registry.com"

# Quick setup
npm run docker:setup-dev
```

### Method 3: Development Setup

```powershell
# Complete development environment
.\docker-import-helper.ps1 -Operation setup-dev

# This will:
# - Pull all base images (Node.js, MongoDB, Redis, etc.)
# - Build H3X application images
# - Setup development networks and volumes
```

### Method 4: Production Setup

```powershell
# Production environment with optimized images
.\docker-import-helper.ps1 -Operation setup-prod

# Expects production images in .\images\ directory:
# - h3x-frontend-prod.tar
# - h3x-backend-prod.tar
# - h3x-websocket-prod.tar
```

## Configuration Files

### docker-import-config.json

```json
{
  "images": [
    {
      "name": "H3X Frontend",
      "path": "./images/h3x-frontend.tar",
      "tag": "h3x-frontend:latest"
    }
  ],
  "registryImages": [
    "node:18-alpine",
    "nginx:alpine"
  ]
}
```

## Service Architecture

Your H3X system includes these services:

```yaml
services:
  h3x-frontend:     # React/TypeScript UI (Port 3000)
  h3x-backend:      # Node.js API Server (Port 3007)  
  h3x-websocket:    # WebSocket Server (Port 3008)
  mongodb:          # Database (Port 27017)
  redis:            # Cache/Sessions (Port 6379)
  nginx:            # Reverse Proxy (Port 80)
  prometheus:       # Monitoring (Port 9090)
  grafana:          # Dashboards (Port 3001)
```

## Common Workflows

### 1. Fresh Development Setup

```powershell
# Clone project and setup Docker environment
git clone your-repo
cd h3x-project
npm install
npm run docker:setup-dev
npm run docker:up
```

### 2. Import Custom Images

```powershell
# Place TAR files in .\images\ directory
mkdir images
# Copy your custom *.tar files here

# Import all custom images
npm run docker:import-custom

# Start with custom images
npm run docker:up
```

### 3. Production Deployment

```powershell
# Import production images
npm run docker:setup-prod

# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Monitor status
npm run docker:status
```

### 4. Backup and Export

```powershell
# Export all current images
npm run docker:export

# This creates timestamped backup in .\exports\
```

### 5. Registry Operations

```powershell
# Login to private registry
docker login your-registry.com

# Pull H3X images from registry
.\docker-manage.ps1 -Command registry-pull -Registry "your-registry.com"

# Push local images to registry
docker push your-registry.com/h3x-frontend:latest
```

## Troubleshooting

### Verify Installation

```powershell
npm run docker:verify
```

### Check Service Status

```powershell
npm run docker:status
```

### View Logs

```powershell
# All services
npm run docker:logs

# Specific service
.\docker-manage.ps1 -Command logs -Service h3x-frontend
```

### Clean and Reset

```powershell
# Stop all services
npm run docker:down

# Clean unused resources
npm run docker:clean

# Rebuild everything
npm run docker:build
npm run docker:up
```

### Import Issues

```powershell
# Check image exists
docker images | findstr h3x

# Verify TAR file
docker load -i your-image.tar --verbose

# Check disk space
docker system df
```

## Performance Tips

1. **Use layer caching**: Build images incrementally
2. **Compress exports**: Use `-Compress` flag for exports
3. **Parallel operations**: Import multiple images simultaneously
4. **Registry mirrors**: Configure local registry mirrors
5. **Volume persistence**: Use named volumes for data persistence

## Security Considerations

1. **Scan images**: Run security scans on imported images
2. **Verify sources**: Only import images from trusted sources
3. **Update regularly**: Keep base images updated
4. **Network isolation**: Use Docker networks for service isolation
5. **Secrets management**: Use Docker secrets for sensitive data

## Integration with H3X System

The Docker setup integrates seamlessly with your H3X project:

- **Development**: Hot reloading and debugging support
- **Testing**: Isolated test environments
- **Production**: Optimized builds and monitoring
- **WebSocket**: Real-time communication between services
- **Database**: Persistent data storage with MongoDB
- **Caching**: Redis for performance optimization
- **Monitoring**: Prometheus metrics and Grafana dashboards

## Next Steps

1. **Setup your environment**: `npm run docker:setup-dev`
2. **Import your images**: Place TAR files in `.\images\` and run import
3. **Start services**: `npm run docker:up`
4. **Verify operation**: `npm run docker:verify`
5. **Access application**: Open http://localhost:3000

Your H3X system is now fully containerized and ready for development or production deployment!
