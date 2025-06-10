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

### Container Communication Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LM Studio     │    │  H3X Protocol   │    │   MCP Servers   │
│   (External)    │◄──►│     Server      │◄──►│   (External)    │
│   Port: 1234    │    │   Port: XXXX    │    │  Various Ports  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
         │              ┌─────────▼─────────┐              │
         └─────────────►│   H3X Main Server │◄─────────────┘
                        │    Port: XXXX     │
                        │  (SIR Interface)  │
                        └───────────────────┘

Communication Protocols:
• LM Studio ↔ Protocol Server: HTTP/REST API (Language Model requests)
• Protocol Server ↔ MCP Servers: Model Context Protocol (Tool/Resource access)
• H3X Server ↔ Protocol Server: Internal API (System coordination)
• External Access: Web UI through H3X Server (Port 4978)
```

**Key Features:**

- **No Azure Dependencies**: Pure local container architecture
- **Protocol-Based Communication**: Standard HTTP/REST and MCP protocols
- **Service Isolation**: Each component runs in its own container
- **Health Monitoring**: Automated health checks across all services
- **Development-Friendly**: Live reload and debugging support

## 📊 Monitoring

Check system status:

```bashbash
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

_Previous deployment methods (standalone scripts) have been archived and replaced with this
containerized approach._
