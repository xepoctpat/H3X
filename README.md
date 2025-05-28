# H3X Hexperiment System - Containerized Deployment

## 🐳 Docker Deployment (Current Method)

The H3X system is now fully containerized for easy deployment and scalability.

### Quick Start

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd H3X
   ```

2. **Start the system**
   ```bash
   docker-compose up -d
   ```

3. **Access the interfaces**
   - **Main H3X Server**: http://localhost:4978
   - **Protocol Server**: http://localhost:8081
   - **Health Check**: http://localhost:8081/api/health

### Services

- **h3x-server**: Main Node.js application with SIR Control Interface
- **protocol-server**: Hexperiment System Protocol server for service coordination

### Development

For live development with file watching:
```bash
# The containers mount local volumes for live development
docker-compose up
# Edit files in ./Src or ./Public and see changes immediately
```

### System Status

- ✅ **Docker Deployment**: Fully operational with service orchestration
- ✅ **Case Sensitivity**: Resolved for Linux/container environments  
- ✅ **Health Monitoring**: Automated health checks and restart policies
- ✅ **Service Discovery**: Internal networking between containers
- ✅ **Volume Mounting**: Live development support

## 🏗️ Architecture

The system uses a microservices architecture with:
- **Container Orchestration**: Docker Compose
- **Service Networking**: Bridge network for inter-service communication
- **Health Monitoring**: Built-in health checks
- **Development Workflow**: Volume mounting for live code updates

## 📊 Monitoring

Check system status:
```bash
# View service status
docker-compose ps

# View logs
docker-compose logs -f

# Health check
curl http://localhost:8081/api/health
```

## 🔧 Troubleshooting

- **Port conflicts**: Configured to use ports 4978 and 8081
- **Container issues**: Check `docker-compose logs`
- **Network problems**: Verify h3x-network bridge is created

---

*Previous deployment methods (standalone scripts) have been archived and replaced with this containerized approach.*
