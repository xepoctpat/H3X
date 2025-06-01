# Deployment Guide - H3X-fLups

## Deployment Options

### 1. Local Development
```bash
npm run env:dev
```

### 2. Docker Compose
```bash
docker-compose up -d
```

### 3. Production Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Configuration

### Development
- Debug mode enabled
- Hot reload active
- Local database

### Production
- Optimized builds
- SSL enabled
- External database

## Health Monitoring

### Health Checks
```bash
curl http://localhost:3000/health
```

### Service Status
```bash
docker-compose ps
```

## Scaling

### Horizontal Scaling
```bash
docker-compose up -d --scale h3x-server=3
```

### Load Balancing
Configure nginx or cloud load balancer for production.

---

*Generated: 2025-06-01T05:46:28.374Z*
