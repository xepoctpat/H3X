# H3X Containerized Deployment Guide

## 🐳 Docker-Based Deployment

This guide covers the containerized deployment of the H3X Hexperiment System.

### System Requirements

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** v2.0+
- **Minimum 4GB RAM** for containers
- **Ports 4978 and 8081** available

### Quick Deployment

```bash
# 1. Clone and navigate
git clone [repository]
cd H3X

# 2. Start the system
docker-compose up -d

# 3. Verify deployment
docker-compose ps
curl http://localhost:8081/api/health
```

### Service Configuration

The system consists of two main services:

#### H3X Server (Port 4978)

- **Image**: Built from Dockerfile.h3x
- **Purpose**: Main application server with SIR Control Interface
- **Dependencies**: Protocol server, mounted volumes
- **Health**: Automatic restart policies

#### Protocol Server (Port 8081)

- **Image**: Built from hexperiment-system-protocol/Dockerfile
- **Purpose**: Service coordination and protocol management
- **Health Endpoint**: `/api/health`
- **Status**: Lightweight Alpine-based container (26.4MB)

### Development Workflow

```bash
# Live development (recommended)
docker-compose up

# Background deployment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Volume Mounting

The system mounts local directories for live development:

- `./Public` → Container public files
- `./Src` → Container source code

Changes to these directories are immediately reflected in running containers.

### Network Architecture

Services communicate via the `h3x-network` bridge:

- **Internal DNS**: Services can reach each other by name
- **Service Discovery**: Automatic container networking
- **Port Mapping**: External access via mapped ports

### Troubleshooting

#### Port Conflicts

If ports 4978 or 8081 are in use:

```yaml
# Edit docker-compose.yml
ports:
  - '5000:3978' # Change external port
```

#### Container Issues

```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]
```

#### Network Problems

```bash
# Recreate network
docker-compose down
docker-compose up -d
```

### Configuration

Environment variables can be set in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - LOG_LEVEL=info
  - CUSTOM_CONFIG=value
```

### Backup and Recovery

```bash
# Backup container data
docker-compose down
tar -czf h3x-backup.tar.gz .

# Restore
tar -xzf h3x-backup.tar.gz
docker-compose up -d
```

---

_This containerized approach replaces all previous deployment methods and provides a consistent, reliable deployment experience across all environments._
