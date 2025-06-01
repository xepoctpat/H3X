# Hexperiment System Protocol - Modern Dockerfile
FROM golang:1.21-alpine AS builder

# Set working directory
WORKDIR /app

# Install git (needed for go mod download)
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -a -installsuffix cgo -o main .

# Final stage - minimal image
FROM alpine:latest

# Install ca-certificates and tini for signal handling
RUN apk --no-cache add ca-certificates tini \
    && rm -rf /var/cache/apk/*

# Create non-root user for security (no shell, no home, locked password)
RUN addgroup -g 1000 -S appuser \
    && adduser -u 1000 -S -D -H -G appuser -s /sbin/nologin appuser

WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose application port (change as needed)
EXPOSE 8081

# Health check endpoint (customize path/port as needed)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8081/api/health || exit 1

# Use tini for proper signal handling (recommended for containers)
ENTRYPOINT ["/sbin/tini", "--"]

# Run the application (change binary name if needed)
CMD ["./main"]