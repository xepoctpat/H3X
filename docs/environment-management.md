# H3X Environment Management System

This document describes the comprehensive environment management system for the H3X Hexperiment System Protocol.

## Overview

The environment management system provides easy switching between development and production environments with optimized configurations for each use case.

## Available Environments

### Development Environment (`dev`)

- **Purpose**: Local development with hot reload, debugging capabilities, and relaxed security
- **Features**:
  - Hot reload for code changes
  - Debug ports exposed (9239, 8090, 8092)
  - Read-write volume mounts for live editing
  - Relaxed CORS settings
  - Faster health checks
  - Debug logging enabled
  - Manual restart policy for better control

### Production Environment (`prod`)

- **Purpose**: Production deployment with optimized performance, security, and monitoring
- **Features**:
  - Optimized Docker images
  - Resource limits and reservations
  - Read-only volume mounts for security
  - Strict CORS settings
  - SSL/TLS support with Nginx proxy
  - Monitoring with Prometheus
  - Automatic restart policies
  - Production logging levels

## Quick Start

### Using NPM Scripts (Recommended)

```bash
# Check current environment status
npm run env:status

# Start development environment
npm run env:dev

# Start development environment with rebuild
npm run env:dev:build

# Start production environment
npm run env:prod

# Start production environment with rebuild
npm run env:prod:build

# Quick environment management
npm run env:quick dev          # Start dev environment
npm run env:quick prod         # Start prod environment
npm run env:quick status       # Show status
npm run env:quick switch dev   # Switch to dev (without starting)
npm run env:quick logs dev     # Show dev logs
npm run env:quick clean        # Clean Docker resources
```

### Direct PowerShell Usage

```powershell
# Environment switching
./hexperiment-system-protocol/scripts/env-switcher.ps1 dev -Up
./hexperiment-system-protocol/scripts/env-switcher.ps1 prod -Up -Build
./hexperiment-system-protocol/scripts/env-switcher.ps1 status

# Quick commands
./hexperiment-system-protocol/scripts/env-quick.ps1 dev
./hexperiment-system-protocol/scripts/env-quick.ps1 restart prod -Build
```

## Environment Configuration

### Environment Files

- **`.env.dev`**: Development environment variables
- **`.env.prod`**: Production environment variables
- **`.current-env`**: Tracks the currently active environment

### Docker Compose Files

- **`docker-compose.dev.yml`**: Development services configuration
- **`docker-compose.prod.yml`**: Production services configuration
- **`docker-compose.lmstudio.yml`**: Legacy unified configuration (kept for compatibility)

## Service Configurations

### Development Services

| Service | Container Name | Ports | Purpose |
|---------|---------------|-------|---------|
| h3x-lmstudio | h3x-lmstudio-dev | 1234, 1235 | LM Studio with debug settings |
| h3x-main | h3x-main-dev | 3978, 8081, 9239 | Main app with debug port |
| h3x-protocol | h3x-protocol-dev | 8080, 8090 | Protocol server with debug |
| hexperiment-mcp | hexperiment-mcp-dev | 8082, 8092 | MCP server with debug |
| h3x-redis | h3x-redis-dev | 6379 | Redis with debug logging |
| h3x-response-processor | h3x-response-processor-dev | - | Response processor |
| h3x-devtools | h3x-devtools | - | Development utilities |

### Production Services

| Service | Container Name | Ports | Purpose |
|---------|---------------|-------|---------|
| h3x-lmstudio | h3x-lmstudio-prod | 1234 | LM Studio optimized |
| h3x-main | h3x-main-prod | 3978 | Main app production |
| h3x-protocol | h3x-protocol-prod | 8080 | Protocol server |
| hexperiment-mcp | hexperiment-mcp-prod | 8082 | MCP server |
| h3x-redis | h3x-redis-prod | - | Redis with memory limits |
| h3x-response-processor | h3x-response-processor-prod | - | Response processor |
| h3x-proxy | h3x-proxy-prod | 80, 443 | Nginx reverse proxy |
| h3x-monitor | h3x-monitor-prod | 9090 | Prometheus monitoring |

## Advanced Usage

### Using Profiles

```bash
# Start with monitoring profile (production only)
npm run env:switch prod
./hexperiment-system-protocol/scripts/env-switcher.ps1 prod -Up -Profile monitoring

# Start with proxy profile (production only)
./hexperiment-system-protocol/scripts/env-switcher.ps1 prod -Up -Profile proxy

# Start development with tools
./hexperiment-system-protocol/scripts/env-switcher.ps1 dev -Up -Profile tools
```

### Service-Specific Operations

```bash
# View logs for specific service
./hexperiment-system-protocol/scripts/env-switcher.ps1 dev -Logs -Service h3x-main-dev

# Check status of current environment
npm run env:status
```

### Environment Switching Workflow

1. **Check Current Status**:

   ```bash
   npm run env:status
   ```

2. **Switch Environment**:

   ```bash
   npm run env:quick switch prod
   ```

3. **Start New Environment**:

   ```bash
   npm run env:prod:build
   ```

4. **Verify Switch**:

   ```bash
   npm run env:status
   ```

## Environment Variables

### Development Variables

```bash
NODE_ENV=development
GO_ENV=development
DEBUG=true
LOG_LEVEL=debug
API_KEY=dev-api-key-12345
CORS_ALLOWED_ORIGINS=http://localhost:3978,http://localhost:8081,http://localhost:8080
```

### Production Variables

```bash
NODE_ENV=production
GO_ENV=production
DEBUG=false
LOG_LEVEL=info
API_KEY=${H3X_API_KEY}  # Set in deployment
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**:

   ```bash
   # Clean up any hanging containers
   npm run env:quick clean
   ```

2. **Environment Not Switching**:

   ```bash
   # Force stop current environment
   ./hexperiment-system-protocol/scripts/env-switcher.ps1 dev -Down
   ./hexperiment-system-protocol/scripts/env-switcher.ps1 prod -Down
   ```

3. **Docker Issues**:

   ```bash
   # Clean Docker system
   npm run env:quick clean -Force
   ```

### Logs and Debugging

```bash
# View all logs for development environment
npm run env:dev:logs

# View logs for specific service
./hexperiment-system-protocol/scripts/env-switcher.ps1 dev -Logs -Service hexperiment-mcp-dev

# Check Docker status
docker ps
docker network ls
docker volume ls
```

## Security Considerations

### Development Environment

- Uses development API keys (safe for local use)
- Relaxed CORS settings for easy testing
- Debug ports exposed
- Read-write volume mounts for hot reload

### Production Environment

- Requires secure API keys (set via environment variables)
- Strict CORS settings
- No debug ports exposed
- Read-only volume mounts
- SSL/TLS termination via Nginx
- Resource limits to prevent abuse
- Monitoring and alerting enabled

## Maintenance

### Regular Tasks

```bash
# Daily: Check environment status
npm run env:status

# Weekly: Clean unused Docker resources
npm run env:quick clean

# Monthly: Force clean all Docker resources
npm run env:quick clean -Force

# Before deployment: Run quality checks
npm run qol:check
```

### Backup and Recovery

Production environment includes automated backup configuration:

- Daily backups at 2 AM
- 30-day retention policy
- Prometheus metrics for monitoring

## Integration with Existing Workflows

The environment management system integrates seamlessly with existing H3X workflows:

- **Quality of Life Checks**: `npm run qol:check` now includes environment validation
- **Go Development**: All Go scripts work with the current environment
- **Docker Integration**: Builds on existing Docker Compose setup
- **LM Studio Integration**: Maintains compatibility with LM Studio configurations

## Next Steps

1. **SSL Configuration**: Set up SSL certificates for production
2. **Monitoring Setup**: Configure Prometheus alerts and Grafana dashboards  
3. **CI/CD Integration**: Add environment switching to deployment pipelines
4. **Backup Automation**: Implement automated backup and restore procedures
