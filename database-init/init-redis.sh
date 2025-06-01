#!/bin/bash
# Redis Initialization Script for H3X Unified System
# This script sets up Redis keys, configurations, and initial data structures

echo "Starting Redis initialization for H3X Unified System..."

# Wait for Redis to be ready
until redis-cli ping > /dev/null 2>&1; do
    echo "Waiting for Redis to be ready..."
    sleep 2
done

echo "Redis is ready, starting initialization..."

# ================================
# SYSTEM CONFIGURATION
# ================================

# Set system configuration
redis-cli HSET "h3x:config:system" \
    "version" "2.0.0" \
    "name" "H3X Unified System" \
    "initialized" "$(date -Iseconds)" \
    "mode" "unified"

# Set feedback loop configuration
redis-cli HSET "h3x:config:feedback" \
    "enabled" "true" \
    "update_interval" "60000" \
    "max_history" "1000" \
    "learning_rate" "0.01" \
    "momentum_factor" "0.9" \
    "volatility_threshold" "0.1"

# Set virtual pulse configuration
redis-cli HSET "h3x:config:pulse" \
    "enabled" "true" \
    "frequency" "0.1" \
    "amplitude" "1.0" \
    "phase_shift" "0"

# ================================
# REAL-TIME DATA QUEUES
# ================================

# Initialize data processing queues
redis-cli LPUSH "h3x:queue:weather" "initialization_marker"
redis-cli LPUSH "h3x:queue:financial" "initialization_marker"
redis-cli LPUSH "h3x:queue:social" "initialization_marker"
redis-cli LPUSH "h3x:queue:feedback" "initialization_marker"

# Set queue configurations
redis-cli HSET "h3x:config:queues" \
    "weather_max_size" "1000" \
    "financial_max_size" "5000" \
    "social_max_size" "2000" \
    "feedback_max_size" "1000"

# ================================
# CACHING STRUCTURE
# ================================

# Initialize cache for frequently accessed data
redis-cli HSET "h3x:cache:weather:current" \
    "temperature" "20.5" \
    "humidity" "65" \
    "pressure" "1013.25" \
    "updated" "$(date -Iseconds)"

redis-cli HSET "h3x:cache:financial:summary" \
    "total_symbols" "0" \
    "market_status" "closed" \
    "last_update" "$(date -Iseconds)"

# ================================
# SESSION MANAGEMENT
# ================================

# Initialize session storage
redis-cli HSET "h3x:sessions:config" \
    "timeout" "3600" \
    "max_sessions" "100" \
    "cleanup_interval" "300"

# ================================
# LMSTUDIO INTEGRATION
# ================================

# LM Studio cache and session management
redis-cli HSET "h3x:lmstudio:config" \
    "url" "http://h3x-lmstudio:1234" \
    "max_tokens" "2048" \
    "temperature" "0.7" \
    "timeout" "30000"

redis-cli LPUSH "h3x:lmstudio:queue" "initialization_marker"

# ================================
# MONITORING & METRICS
# ================================

# Initialize counters for monitoring
redis-cli SET "h3x:metrics:weather:requests" "0"
redis-cli SET "h3x:metrics:financial:requests" "0"
redis-cli SET "h3x:metrics:feedback:cycles" "0"
redis-cli SET "h3x:metrics:lmstudio:requests" "0"
redis-cli SET "h3x:metrics:system:uptime" "$(date +%s)"

# Set expiration times for temporary data (24 hours)
redis-cli EXPIRE "h3x:cache:weather:current" 86400
redis-cli EXPIRE "h3x:cache:financial:summary" 86400

# ================================
# FLUPS INTEGRATION
# ================================

# fLups system state caching
redis-cli HSET "h3x:flups:state" \
    "status" "initialized" \
    "last_update" "$(date -Iseconds)" \
    "active_experiments" "0"

# Hexagonal data processing queues
redis-cli LPUSH "h3x:flups:queue:hexagonal" "initialization_marker"
redis-cli LPUSH "h3x:flups:queue:triads" "initialization_marker"

# ================================
# FEEDBACK LOOP INITIALIZATION
# ================================

# Initialize feedback history storage
redis-cli LPUSH "h3x:feedback:history" "{\"timestamp\":\"$(date -Iseconds)\",\"type\":\"initialization\",\"value\":0.0}"

# Initialize correlation matrices (as JSON strings)
redis-cli SET "h3x:feedback:correlations:weather_financial" "{\"correlation\":0.0,\"confidence\":0.0,\"samples\":0}"
redis-cli SET "h3x:feedback:correlations:financial_social" "{\"correlation\":0.0,\"confidence\":0.0,\"samples\":0}"
redis-cli SET "h3x:feedback:correlations:social_weather" "{\"correlation\":0.0,\"confidence\":0.0,\"samples\":0}"

# ================================
# VIRTUAL PULSE SYSTEM
# ================================

# Initialize pulse generators
for i in {1..5}; do
    redis-cli HSET "h3x:pulse:generator:$i" \
        "frequency" "$(echo "scale=2; $i * 0.1" | bc)" \
        "amplitude" "1.0" \
        "phase" "$(echo "scale=2; $i * 0.2" | bc)" \
        "active" "true"
done

# ================================
# CLEANUP AND MAINTENANCE
# ================================

# Set up automatic cleanup keys
redis-cli SET "h3x:maintenance:last_cleanup" "$(date -Iseconds)"
redis-cli SET "h3x:maintenance:cleanup_interval" "3600"

# Initialize health check data
redis-cli HSET "h3x:health:status" \
    "overall" "healthy" \
    "database" "connected" \
    "queues" "operational" \
    "cache" "ready" \
    "last_check" "$(date -Iseconds)"

echo "Redis initialization completed successfully!"
echo "System ready for unified operations."

# Display initialization summary
echo "=== H3X Unified System Redis Setup Complete ==="
echo "Configurations: $(redis-cli KEYS "h3x:config:*" | wc -l)"
echo "Queues: $(redis-cli KEYS "h3x:queue:*" | wc -l)"
echo "Cache entries: $(redis-cli KEYS "h3x:cache:*" | wc -l)"
echo "Metrics: $(redis-cli KEYS "h3x:metrics:*" | wc -l)"
echo "Health status: $(redis-cli HGET "h3x:health:status" "overall")"
