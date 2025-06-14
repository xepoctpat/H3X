# H3X Hexperiment System - Secure Containerized Deployment

## 🐳 Docker Deployment (Secure Method)

The H3X system is fully containerized for secure, scalable, and easy deployment.

### Quick Start

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd H3X
   ```

2. **Configure Environment Variables**
   - Copy the provided `.env.example` to `.env` and securely configure your ports and secrets:

   ```bash
   cp .env.example .env
   # Edit .env to securely set ports and credentials
   ```

3. **Start the system securely**
   ```bash
   docker-compose up -d
   ```

4. **Access the interfaces securely**
   - **Main H3X Server**: `http://localhost:<H3X_SERVER_PORT>`
   - **Protocol Server**: `http://localhost:<PROTOCOL_SERVER_PORT>`
   - **Health Check**: `http://localhost:<PROTOCOL_SERVER_PORT>/api/health`

   *(Ports are masked for security. Replace placeholders with your securely configured ports.)*

### Services

- **H3X-server**: Main Node.js application with secure SIR Control Interface
- **protocol-server**: Secure Hexperiment System Protocol server for internal service coordination

### Secure Development Workflow

For secure live development with automatic file watching:
```bash
docker-compose up
# Securely edit files in ./src or ./public and see changes immediately
```

### System Status

- ✅ **Docker Deployment**: Securely operational with service orchestration
- ✅ **Case Sensitivity**: Resolved for Linux/container environments  
- ✅ **Health Monitoring**: Automated secure health checks and restart policies
- ✅ **Service Discovery**: Secure internal networking between containers
- ✅ **Volume Mounting**: Securely configured for live code updates

### Security Best Practices

- **Ports and Credentials**: Always configured securely via environment variables (`.env` file)
- **Container Isolation**: Secure bridge network (`h3x-network`) isolates services internally
- **Logging and Monitoring**: Securely monitor logs and system status using Docker Compose commands

### 📊 Secure Monitoring Commands

Check system status securely:
```bash
# View service status securely
docker-compose ps

# Securely view logs
docker-compose logs -f

# Secure health check
curl http://localhost:<PROTOCOL_SERVER_PORT>/api/health
```

### Troubleshooting Securely

- **Port Issues**: Verify secure port configuration in `.env`
- **Container Issues**: Securely check logs with `docker-compose logs`
- **Network Issues**: Verify secure bridge network (`h3x-network`) is properly created

---

*Previous deployment methods (standalone scripts) have been securely archived and replaced with this secure containerized approach.*
