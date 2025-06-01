# H3X Containerized Architecture Documentation

## 🏗️ System Architecture Overview

### Container Structure

```
H3X System Architecture
├── Docker Compose Orchestration
│   ├── h3x-server (Node.js)
│   │   ├── Port: 4978 (external) → 3978 (internal)
│   │   ├── Environment: Production
│   │   ├── Volumes: ./Public, ./Src
│   │   └── Dependencies: protocol-server
│   │
│   └── protocol-server (Alpine)
│       ├── Port: 8081 (external) → 8080 (internal) 
│       ├── Health: /api/health endpoint
│       └── Size: 26.4MB optimized container
│
├── Network: h3x-network (bridge)
├── Service Discovery: Internal DNS
└── Health Monitoring: Automated checks
```

### Data Flow

```
External Request → Docker Host → Container Port Mapping
                                       ↓
                               h3x-network Bridge
                                       ↓
                         Target Container Service
                                       ↓
                            Application Processing
                                       ↓
                            Inter-service Communication
                                       ↓
                              Response Return
```

### Container Images

#### H3X Server Image
- **Base**: Node.js 18 Alpine
- **Size**: ~264MB (multi-stage build)
- **Components**:
  - SIR Control Interface
  - Framework tools
  - Environment simulation
  - Code generators

#### Protocol Server Image  
- **Base**: Alpine Linux
- **Size**: 26.4MB (lightweight)
- **Components**:
  - Health monitoring
  - Service coordination
  - Protocol management

### Volume Strategy

```yaml
volumes:
  - ./Public:/app/Public    # Static files and web interfaces
  - ./Src:/app/Src          # Source code for live development
```

**Benefits**:
- Live code updates without container rebuilds
- Persistent configuration changes
- Development workflow optimization

### Network Configuration

```yaml
networks:
  h3x-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

**Features**:
- Isolated container communication
- Service discovery by container name
- External access via port mapping
- Network security boundaries

### Health Monitoring

#### Protocol Server Health Check
- **Endpoint**: `http://protocol-server:8080/api/health`
- **Response**: `{"service":"Hexperiment System Protocol","status":"healthy"}`
- **Interval**: Every 30 seconds
- **Timeout**: 10 seconds

#### H3X Server Health Check
- **Method**: Process monitoring
- **Restart Policy**: `unless-stopped`
- **Dependency**: Waits for protocol-server

### Security Considerations

1. **Network Isolation**
   - Containers communicate via private bridge network
   - External access only through mapped ports
   - No direct host network access

2. **Container Security**
   - Non-root user execution
   - Read-only file systems where possible
   - Minimal base images (Alpine)

3. **Port Management**
   - External ports: 4978, 8081
   - Internal communication: Container names
   - No privileged port requirements

### Scaling Strategy

#### Horizontal Scaling
```bash
# Scale h3x-server instances
docker-compose up --scale h3x-server=3

# Load balancer configuration needed for multiple instances
```

#### Vertical Scaling
```yaml
# Resource limits in docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 4G
```

### Configuration Management

#### Environment Variables
```yaml
environment:
  - NODE_ENV=production
  - PORT=3978
  - LMSTUDIO_URL=http://lmstudio:1234
  - PROTOCOL_SERVER_URL=http://protocol-server:8080
```

#### Configuration Files
- `docker-compose.yml`: Service orchestration
- `Dockerfile.h3x`: H3X server image build
- `hexperiment-system-protocol/Dockerfile`: Protocol server build

### Deployment Pipeline

```
Development → Docker Build → Image Registry → Production Deploy
     ↓              ↓              ↓                ↓
Local Code → Multi-stage → Container → docker-compose up
            Build        Images
```

### Monitoring and Observability

#### Log Management
```bash
# Service logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f h3x-server

# Log rotation
docker-compose logs --tail=1000 h3x-server
```

#### Metrics Collection
- Container resource usage: `docker stats`
- Service health: Health check endpoints
- Application metrics: Built-in monitoring

### Backup and Disaster Recovery

#### Data Backup
```bash
# Application backup
docker-compose down
tar -czf h3x-backup-$(date +%Y%m%d).tar.gz ./

# Volume backup
docker run --rm -v h3x_data:/data -v $(pwd):/backup alpine tar czf /backup/volumes.tar.gz /data
```

#### Recovery Process
```bash
# Restore application
tar -xzf h3x-backup-YYYYMMDD.tar.gz
docker-compose up -d

# Restore volumes
docker run --rm -v h3x_data:/data -v $(pwd):/backup alpine tar xzf /backup/volumes.tar.gz
```

### Performance Optimization

#### Container Optimization
- Multi-stage Docker builds
- Alpine Linux base images  
- Dependency layer caching
- .dockerignore for build context

#### Runtime Optimization
- Health check intervals
- Restart policies
- Resource constraints
- Log retention policies

---

*H3X Containerized Architecture - Generated 2025-05-28T19:24:43.082Z*
