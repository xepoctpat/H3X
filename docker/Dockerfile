# H3X Neural Interface System - Dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Production stage
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S h3x -u 1001

# Copy built application
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=h3x:nodejs . .

# Create required directories
RUN mkdir -p Public/logs && \
    chown -R h3x:nodejs Public/logs

# Expose port
EXPOSE 4978

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4978/api/health || exit 1

# Switch to non-root user
USER h3x

# Start the application
CMD ["node", "src/index.js"]
