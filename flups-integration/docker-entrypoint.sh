#!/bin/sh
set -e

# Function to check if a service is running
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    
    echo "Waiting for $service_name to be ready..."
    while ! nc -z $host $port; do
        echo "  $service_name not ready, waiting..."
        sleep 2
    done
    echo "  $service_name is ready!"
}

# Wait for dependent services
echo "Checking dependencies..."
wait_for_service redis 6379 "Redis"
wait_for_service mongodb 27017 "MongoDB"

# Create health endpoint
cat > /app/health.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>fLups Health Check</title></head>
<body>
    <h1>fLups Frontend - OK</h1>
    <p>Status: Running</p>
    <p>Time: <span id="time"></span></p>
    <script>
        document.getElementById('time').textContent = new Date().toISOString();
        setInterval(() => {
            document.getElementById('time').textContent = new Date().toISOString();
        }, 1000);
    </script>
</body>
</html>
EOF

# Handle different startup modes
case "$1" in
    "dev")
        echo "Starting fLups in development mode..."
        npm run dev
        ;;
    "build")
        echo "Building fLups application..."
        npm run build
        ;;
    "serve"|*)
        echo "Starting fLups in production mode..."
        # Start the built application
        if [ -d "/app/dist" ]; then
            # Copy health check to dist
            cp /app/health.html /app/dist/health
            # Serve the built application
            npm run preview -- --host 0.0.0.0 --port 8080
        else
            echo "No dist folder found, building first..."
            npm run build
            cp /app/health.html /app/dist/health
            npm run preview -- --host 0.0.0.0 --port 8080
        fi
        ;;
esac
