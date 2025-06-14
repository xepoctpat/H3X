# H3X Deployment Options - Containerized Architecture

## 🐳 Current Deployment Method: Docker Compose

The H3X system is now deployed using Docker containers for maximum portability and ease of management.

### ✅ Docker Compose Deployment (Recommended)

**Prerequisites:**
- Docker Desktop or Docker Engine
- Docker Compose

**Deployment Steps:**
```bash
# 1. Start all services
docker-compose up -d

# 2. Verify deployment
docker-compose ps

# 3. Check logs
docker-compose logs -f
```

**Services:**
- **h3x-server** (Port 4978): Main application server
- **protocol-server** (Port 8081): Hexperiment protocol coordination

**Benefits:**
- ✅ Consistent environment across all platforms
- ✅ Automatic service discovery and networking
- ✅ Built-in health checks and restart policies
- ✅ Live development with volume mounting
- ✅ Easy scaling and configuration management

## 🔄 Migration from Legacy Methods

Previous deployment methods have been containerized:

| Legacy Method | Containerized Equivalent |
|---------------|-------------------------|
| `Start-Standalone.js` | `docker-compose up h3x-server` |
| `Start-Lmstudio.js` | Integrated in h3x-server container |
| Manual Node.js setup | Automated via Dockerfile |
| Port configuration | Configured in docker-compose.yml |

## 🛠️ Development Workflow

```bash
# Start development environment
docker-compose up

# The containers automatically mount:
# - ./Src -> /app/Src (live code updates)
# - ./Public -> /app/Public (static files)

# Changes to code are immediately reflected in running containers
```

## 📈 Scaling

```bash
# Scale h3x-server instances
docker-compose up --scale h3x-server=3

# View scaled services
docker-compose ps
```

## 🔍 Monitoring

```bash
# Service health
curl http://localhost:8081/api/health

# Container stats
docker stats

# Service logs
docker-compose logs -f [service-name]
```

---

*Legacy deployment scripts have been archived. The containerized approach provides better reliability, consistency, and development experience.*
