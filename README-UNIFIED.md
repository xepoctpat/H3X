# H3X Unified System - Complete Integration Guide

## 🚀 Overview

The H3X Unified System is the complete integration of H3X (Hexperiment Labs SIR Control Interface) and fLups systems, creating an advanced adaptive platform with real-time data processing, mathematical feedback loops, and predictive intelligence capabilities.

## 🏗️ Architecture

### Core Components

1. **H3X Core Services**
   - Main H3X application server
   - SIR (Super Intelligent Regulator) interface
   - LM Studio integration for AI processing

2. **fLups Integration**
   - Hexagonal base system with optimized fLupper triad components
   - Advanced visualization and modular architecture
   - Real-time hexagonal data processing

3. **Real-Time Data Ingestion**
   - Weather data collection and processing
   - Financial market data (stocks, crypto, indices)
   - Social media sentiment analysis (optional)

4. **Feedback Loop System**
   - Mathematical feedback coefficients (PID-like stability)
   - Virtual pulse generation with sine wave modulation
   - Predictive intelligence engine
   - Cross-domain correlation analysis

5. **Infrastructure Services**
   - MongoDB for persistent data storage
   - Redis for caching and real-time processing
   - Nginx for reverse proxy and load balancing
   - Prometheus and Grafana for monitoring

## 🛠️ Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- 8GB RAM minimum
- API keys for external services (optional for basic functionality)

### Installation

1. **Clone and Setup**

   ```bash
   cd e:\H3X
   npm install
   ```

2. **Create Docker Network**

   ```bash
   npm run network:create
   ```

3. **Configure Environment**

   ```bash
   # Copy and edit environment file
   cp env/.env.unified-dev env/.env.local
   # Edit API keys and configuration as needed
   ```

4. **Start the Unified System**

   ```bash
   npm run unified:start
   ```

5. **Initialize Databases**

   ```bash
   npm run init:databases
   ```

6. **Run Integration Tests**

   ```bash
   npm run test:unified
   ```

### Access Points

- **Main System**: http://localhost:80
- **fLups Interface**: http://localhost:80/flups
- **LM Studio API**: http://localhost:80/api/lmstudio
- **Real-time Data**: http://localhost:80/api/data
- **Feedback Processor**: http://localhost:80/api/feedback
- **Monitoring**: http://localhost:80/metrics

## 📋 Available Commands

### Unified System Management

```bash
# Start all services
npm run unified:start

# Stop all services
npm run unified:stop

# Restart all services
npm run unified:restart

# View logs
npm run logs:all

# Check system status
npm run unified:status

# Build without cache
npm run unified:build-no-cache

# Complete cleanup
npm run unified:clean
```

### Development Commands

```bash
# fLups development mode
npm run flups:dev

# Run specific data ingestion
npm run data:weather
npm run data:financial

# Run feedback processor
npm run feedback:process

# Test system integration
npm run test:unified
npm run test:unified-quick
```

### Database Management

```bash
# Initialize databases
npm run init:databases

# View database logs
npm run logs:databases
```

### Monitoring and Debugging

```bash
# View specific service logs
npm run logs:nginx
npm run logs:data

# Reload nginx configuration
npm run nginx:reload

# Check health status
npm run test:health
```

## 🔧 Configuration

### Environment Variables

The system uses environment files in the `env/` directory:

- `.env.unified` - Production configuration
- `.env.unified-dev` - Development configuration
- `.env.local` - Local overrides (create manually)

### Key Configuration Sections

#### Core System

```env
NODE_ENV=production
H3X_MODE=unified
H3X_LOG_LEVEL=info
```

#### Database Connections

```env
MONGODB_URI=mongodb://mongodb:27017/h3x_unified
REDIS_URL=redis://redis:6379
```

#### External APIs

```env
WEATHER_API_KEY=your_openweather_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FINNHUB_API_KEY=your_finnhub_key
```

#### Feedback Loop Tuning

```env
FEEDBACK_LEARNING_RATE=0.01
FEEDBACK_MOMENTUM_FACTOR=0.9
PULSE_FREQUENCY=0.1
```

## 🏭 Production Deployment

### Docker Compose Production

1. **Update Environment**

   ```bash
   cp env/.env.unified env/.env.production
   # Edit production settings
   ```

2. **Build Production Images**

   ```bash
   npm run unified:build
   ```

3. **Deploy**

   ```bash
   docker-compose -f docker-compose.unified.yml --env-file env/.env.production up -d
   ```

### Security Considerations

- Change default passwords in production
- Configure proper SSL certificates
- Set up firewall rules
- Enable authentication for monitoring endpoints
- Rotate API keys regularly

## 🔍 Monitoring and Maintenance

### Health Checks

The system includes comprehensive health checks:

- HTTP endpoints: `/health`
- Docker health checks for all services
- Database connectivity monitoring
- Real-time data flow verification

### Metrics and Monitoring

- **Prometheus**: Metrics collection on port 9090
- **Grafana**: Dashboards on port 3001
- **Application Logs**: Centralized logging through Docker
- **Performance Metrics**: Response times, throughput, error rates

### Backup and Recovery

```bash
# Backup MongoDB
docker exec h3x-mongodb mongodump --out /backup

# Backup Redis
docker exec h3x-redis redis-cli BGSAVE

# Export system configuration
docker-compose -f docker-compose.unified.yml config > backup/compose-config.yml
```

## 🧪 Development Guide

### Adding New Data Sources

1. Create new ingestion service in `real-time-data/`
2. Add Dockerfile and service configuration
3. Update `docker-compose.unified.yml`
4. Configure feedback loop integration
5. Add monitoring and health checks

### Extending Feedback Loops

1. Modify `feedback-loops/feedback-processor.js`
2. Add new correlation algorithms
3. Update virtual pulse generators
4. Configure adaptive thresholds
5. Test with integration suite

### fLups Customization

1. Modify files in `flups-integration/`
2. Update build process in Dockerfile
3. Configure reverse proxy routing
4. Add new visualization components

## 🐛 Troubleshooting

### Common Issues

1. **Services Won't Start**

   ```bash
   # Check Docker daemon
   docker version
   
   # Check network
   docker network ls | grep hex-flup-network
   
   # View detailed logs
   npm run logs:all
   ```

2. **Database Connection Issues**

   ```bash
   # Check database containers
   docker-compose -f docker-compose.unified.yml ps mongodb redis
   
   # Test connections
   docker exec h3x-mongodb mongosh --eval "db.runCommand('ping')"
   docker exec h3x-redis redis-cli ping
   ```

3. **API Integration Problems**

   ```bash
   # Test individual services
   curl http://localhost:3001/api/weather/health
   curl http://localhost:3002/api/financial/health
   curl http://localhost:3003/api/feedback/status
   ```

4. **Performance Issues**

   ```bash
   # Check resource usage
   docker stats
   
   # Review metrics
   curl http://localhost:80/metrics
   ```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug environment
export DEBUG=true
export H3X_LOG_LEVEL=debug

# Restart with debug logging
npm run unified:restart
```

## 📊 System Metrics

### Performance Benchmarks

- **Startup Time**: < 2 minutes for full system
- **Response Time**: < 100ms for API endpoints
- **Data Processing**: 1000+ events/second
- **Memory Usage**: ~4GB for complete system
- **CPU Usage**: ~20% average load

### Scaling Considerations

- Horizontal scaling via Docker Swarm or Kubernetes
- Database sharding for large datasets
- Redis clustering for high-throughput caching
- Load balancing across multiple instances

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add comprehensive tests
5. Update documentation
6. Submit pull request

### Code Standards

- Use TypeScript where possible
- Follow ESLint configuration
- Write comprehensive tests
- Document all public APIs
- Use semantic versioning

## 📜 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🙏 Acknowledgments

- H3X Development Team
- fLups Integration Contributors
- Open source community
- Docker and Node.js ecosystems

---

**H3X Unified System v2.0.0** - Built with ❤️ by Hexperiment Labs
