# Docker Image Import Guide for H3X Project

## 1. Pull from Docker Hub/Registry

```bash
# Pull a specific image
docker pull node:18-alpine
docker pull nginx:alpine
docker pull postgres:15

# Pull with specific tag
docker pull mongo:6.0

# Pull from private registry
docker pull your-registry.com/your-image:tag
```

## 2. Import from TAR file

```bash
# Import image from tar file
docker load -i /path/to/your-image.tar

# Import and tag
docker load < your-image.tar
```

## 3. Save and Load Images

```bash
# Save existing image to tar
docker save -o h3x-app.tar h3x-app:latest

# Load image from tar
docker load -i h3x-app.tar
```

## 4. Import from Docker Compose

```bash
# Pull all images defined in docker-compose.yml
docker-compose pull

# Build and pull
docker-compose up --build
```

## 5. Copy from Another System

```bash
# On source system
docker save myimage:latest | gzip > myimage.tar.gz

# Transfer file to target system, then:
gunzip -c myimage.tar.gz | docker load
```

## 6. Import from Container Registry

```bash
# Login to registry
docker login your-registry.com

# Pull image
docker pull your-registry.com/h3x-project:latest

# Tag for local use
docker tag your-registry.com/h3x-project:latest h3x-local:latest
```
