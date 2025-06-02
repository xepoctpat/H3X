# Docker Deployment Guide for H3X System

## 🚀 Complete Docker Deployment Process

### Prerequisites Verification

```bash
# Check Docker installation
docker --version
docker-compose --version

# Verify Docker is running
docker ps
```

### Initial Setup

```bash
# 1. Clone repository
git clone [repository-url]
cd H3X

# 2. Verify Docker configuration
cat docker-compose.yml

# 3. Build and start services
docker-compose up --build -d
```

### Service Architecture

```text
┌─────────────────┐    ┌──────────────────┐
│   H3X Server    │    │ Protocol Server  │
│   (Port 4978)   │◄──►│   (Port 8081)    │
│                 │    │                  │
│ • SIR Interface │    │ • Health Checks  │
│ • Node.js App   │    │ • Service Coord  │
│ • Volume Mounts │    │ • Alpine Linux   │
└─────────────────┘    └──────────────────┘
        │                        │
        └────────────────────────┘
                   │
            h3x-network (bridge)
```

### Development Workflow

```bash
# Start development environment
docker-compose up

# File watching is automatic via volume mounts:
# - ./Src/ → /app/Src/
# - ./Public/ → /app/Public/

# View live logs
docker-compose logs -f h3x-server
```

### Production Deployment

```bash
# Production build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose up --scale h3x-server=3 -d

# Update services
docker-compose pull
docker-compose up -d
```

### Monitoring and Maintenance

```bash
# Health checks
curl http://localhost:8081/api/health

# Service status
docker-compose ps

# Resource usage
docker stats

# Log monitoring
docker-compose logs -f --tail=100
```

### Backup and Recovery

```bash
# Backup volumes
docker-compose down
docker run --rm -v h3x_data:/data -v $(pwd):/backup alpine tar czf /backup/h3x-backup.tar.gz /data

# Restore
docker run --rm -v h3x_data:/data -v $(pwd):/backup alpine tar xzf /backup/h3x-backup.tar.gz
docker-compose up -d
```

### Troubleshooting

#### Common Issues

1. **Port Conflicts**

   ```bash
   # Check port usage
   netstat -tulpn | grep :4978
   netstat -tulpn | grep :8081
   
   # Modify ports in docker-compose.yml if needed
   ```

2. **Container Startup Issues**

   ```bash
   # Check container logs
   docker-compose logs h3x-server
   docker-compose logs protocol-server
   
   # Rebuild containers
   docker-compose down
   docker-compose up --build
   ```

3. **Network Issues**

   ```bash
   # Inspect network
   docker network inspect h3x_h3x-network
   
   # Recreate network
   docker-compose down
   docker network prune
   docker-compose up -d
   ```

### Performance Optimization

```yaml
# Add to docker-compose.yml for production
services:
  h3x-server:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'  
          memory: 2G
```

---

**Generated on:** 2025-05-28T19:24:43.080Z - H3X Deployment Automation
