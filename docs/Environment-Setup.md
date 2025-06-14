# H3X Environment Setup Guide

## 🚀 **Automated Environment Management**

The H3X system now includes an intelligent environment management system that automatically configures your development, production, testing, and Docker environments with optimal settings.

## ⚡ **Quick Start (30 seconds)**

```bash
# 1. Set up development environment
npm run setup

# 2. Add your GitHub token (optional but recommended)
echo "GITHUB_TOKEN=your_github_token_here" >> .env

# 3. Start the system
npm run dev
```

That's it! Your H3X system is ready to go.

## 🌍 **Environment Management**

### **Available Environments**

| Environment | Description | Use Case |
|-------------|-------------|----------|
| **development** | Local development with debug enabled | Daily development work |
| **production** | Security hardened, optimized for production | Live deployment |
| **testing** | Isolated testing with mock services | Running tests |
| **docker** | Containerized environment | Docker deployment |

### **Environment Commands**

```bash
# Switch environments
npm run env:switch development    # Switch to development
npm run env:switch production     # Switch to production
npm run env:switch testing        # Switch to testing
npm run env:switch docker         # Switch to Docker

# Environment management
npm run env:list                  # List all available environments
npm run env:status                # Show current environment status
npm run env:secrets               # Generate secure secrets

# Configuration validation
npm run config:validate           # Validate current configuration
npm run setup                     # Quick setup (dev + validate)
```

## 🔧 **Configuration Features**

### **Intelligent Defaults**
- ✅ **Smart port allocation** - No conflicts between services
- ✅ **Secure secret generation** - Cryptographically secure defaults
- ✅ **Environment-specific optimization** - Tailored for each use case
- ✅ **Maintenance agent integration** - Fully configured automation
- ✅ **Database configuration** - MongoDB and Redis ready
- ✅ **AI/ML integration** - LM Studio and OpenAI support

### **Security Features**
- 🔐 **Automatic secret generation** with high entropy
- 🔐 **Environment-specific CORS** settings
- 🔐 **Production security hardening**
- 🔐 **SSL/TLS configuration** for production
- 🔐 **API rate limiting** and security headers

### **Monitoring & Analytics**
- 📊 **Built-in health monitoring** with configurable intervals
- 📊 **Advanced analytics** with predictive insights
- 📊 **Multi-channel notifications** (Discord, Slack, Email, Teams)
- 📊 **Performance tracking** and optimization
- 📊 **Intelligent scheduling** with activity awareness

## 🎯 **Environment-Specific Settings**

### **Development Environment**
```bash
npm run env:switch development
```
- **Debug mode enabled** for detailed logging
- **Hot reload** for rapid development
- **Relaxed security** for easier testing
- **Local database** connections
- **Verbose logging** for troubleshooting
- **Development tools** enabled

### **Production Environment**
```bash
npm run env:switch production
```
- **Security hardened** with strict CORS
- **SSL/TLS enabled** for secure connections
- **Optimized performance** settings
- **Production databases** with clustering
- **Monitoring enabled** with alerts
- **Backup systems** configured

### **Testing Environment**
```bash
npm run env:switch testing
```
- **Isolated databases** to prevent data pollution
- **Mock services** for reliable testing
- **Minimal logging** to reduce noise
- **Fast execution** optimized settings
- **No external dependencies** where possible

### **Docker Environment**
```bash
npm run env:switch docker
```
- **Container networking** with service discovery
- **Volume mounts** for persistent data
- **Inter-service communication** configured
- **Resource limits** optimized for containers
- **Health checks** for container orchestration

## 🔑 **Secret Management**

### **Required Secrets (Production)**
- `GITHUB_TOKEN` - For maintenance agent functionality
- `JWT_SECRET` - For authentication
- `API_SECRET` - For API security

### **Optional Secrets**
- `OPENAI_API_KEY` - For OpenAI integration
- `WEATHER_API_KEY` - For weather data
- `DISCORD_WEBHOOK_URL` - For Discord notifications
- `SLACK_WEBHOOK_URL` - For Slack notifications

### **Generate Secure Secrets**
```bash
npm run env:secrets
```
This generates cryptographically secure secrets that you can copy to your `.env` file.

## 📊 **Configuration Validation**

The system includes comprehensive validation to ensure everything is configured correctly:

```bash
npm run config:validate
```

This checks:
- ✅ **Environment variables** - All required settings
- ✅ **Database configuration** - MongoDB and Redis
- ✅ **Security settings** - Secrets and CORS
- ✅ **Maintenance agent** - GitHub integration
- ✅ **File system** - Required directories
- ✅ **Dependencies** - Package installations

## 🚀 **Getting Started Workflows**

### **For Development**
```bash
# Quick setup
npm run setup

# Add GitHub token for full functionality
echo "GITHUB_TOKEN=ghp_your_token_here" >> .env

# Start development
npm run dev

# Check system health
npm run maintenance:health
```

### **For Production Deployment**
```bash
# Switch to production
npm run env:switch production

# Generate secure secrets
npm run env:secrets

# Add production secrets to .env
# (Copy the generated secrets)

# Validate configuration
npm run config:validate

# Start production
npm start
```

### **For Docker Deployment**
```bash
# Switch to Docker environment
npm run env:switch docker

# Start with Docker Compose
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f
```

## 🔍 **Troubleshooting**

### **Common Issues**

**"Could not load .env file"**
```bash
npm run env:switch development
```

**"Missing required secrets"**
```bash
npm run env:secrets
# Copy the generated secrets to .env
```

**"Validation failed"**
```bash
npm run config:validate
# Follow the recommendations shown
```

**"Port conflicts"**
```bash
# Check what's using the ports
npm run env:status
# Switch to a different environment if needed
```

### **Reset Everything**
```bash
# Backup current config
cp .env .env.backup

# Reset to development
npm run env:switch development

# Validate
npm run config:validate
```

## 📚 **Advanced Configuration**

### **Custom Environment Variables**
You can add custom variables to your `.env` file. The system preserves them when switching environments.

### **Environment-Specific Overrides**
Each environment has optimized defaults, but you can override any setting in your `.env` file.

### **Backup and Recovery**
All environment switches create automatic backups in `.env-backups/` directory.

## 🎉 **What's Automated**

✅ **95% of configuration** - Intelligent defaults for everything  
✅ **Port management** - No conflicts between services  
✅ **Database setup** - MongoDB and Redis configured  
✅ **Security hardening** - Production-ready security  
✅ **Monitoring integration** - Health checks and analytics  
✅ **Maintenance agent** - Fully configured automation  
✅ **AI/ML integration** - LM Studio and OpenAI ready  
✅ **Notification systems** - Multi-channel alerts  
✅ **Performance optimization** - Environment-specific tuning  

## 🔗 **Related Documentation**

- [Remote Maintenance Agent](./Remote-Maintenance-Agent.md) - Automation features
- [H3X Custom Database Plan](./H3X-Custom-Database-Plan.md) - Database architecture
- [Main README](../README.md) - Project overview

---

**Your H3X environment is now fully automated and production-ready!** 🚀
