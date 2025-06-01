#!/bin/bash

# H3X Neural Interface System - Advanced Deployment Script
# This script manages the complete AI integration environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="h3x-neural-system"
NETWORK_NAME="h3x-network"
COMPOSE_FILE="docker-compose.yml"

# Functions
log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${PURPLE}=================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}=================================${NC}"
}

check_prerequisites() {
    log_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    log_success "Docker is installed"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    log_success "Docker Compose is installed"
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    log_success "Docker daemon is running"
    
    # Check Node.js (for local development)
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js is installed: $NODE_VERSION"
    else
        log_warning "Node.js not found (only needed for local development)"
    fi
    
    # Check Go (for protocol server development)
    if command -v go &> /dev/null; then
        GO_VERSION=$(go version)
        log_success "Go is installed: $GO_VERSION"
    else
        log_warning "Go not found (only needed for protocol server development)"
    fi
}

show_menu() {
    log_header "H3X Neural Interface System - Deployment Menu"
    echo "1) 🚀 Quick Start (Core Services)"
    echo "2) 🔬 Full Stack (All Services)"
    echo "3) 🤖 With Local AI (Including LMStudio/Ollama)"
    echo "4) 📊 With Monitoring (Prometheus + Grafana)"
    echo "5) 🔧 Development Mode"
    echo "6) 🛑 Stop All Services"
    echo "7) 🗑️  Clean Everything"
    echo "8) 📋 Show Status"
    echo "9) 📜 Show Logs"
    echo "10) 🔄 Restart Services"
    echo "11) 🏗️  Build Images"
    echo "12) 🌐 Open Interfaces"
    echo "0) ❌ Exit"
    echo ""
    read -p "Select an option [0-12]: " choice
}

quick_start() {
    log_header "Quick Start - Core Services"
    log_info "Starting H3X Server and Protocol Server..."
    
    docker-compose up -d h3x-server protocol-server
    
    wait_for_services
    show_access_info
}

full_stack() {
    log_header "Full Stack Deployment"
    log_info "Starting all core services with Redis..."
    
    docker-compose --profile with-redis up -d
    
    wait_for_services
    show_access_info
}

with_local_ai() {
    log_header "Deployment with Local AI"
    log_info "Starting services with local AI support..."
    
    docker-compose --profile with-local-ai --profile with-redis up -d
    
    wait_for_services
    show_access_info
    log_info "Local AI server (Ollama) available at: http://localhost:1234"
}

with_monitoring() {
    log_header "Deployment with Monitoring"
    log_info "Starting services with monitoring stack..."
    
    docker-compose --profile with-monitoring --profile with-redis up -d
    
    wait_for_services
    show_access_info
    log_info "Prometheus available at: http://localhost:9090"
    log_info "Grafana available at: http://localhost:3000 (admin/h3x-admin)"
}

development_mode() {
    log_header "Development Mode"
    log_info "Starting in development mode with hot reload..."
    
    # Create .env file for development
    create_dev_env
    
    # Start only supporting services in Docker
    docker-compose up -d protocol-server redis
    
    log_info "Supporting services started. Run 'npm run dev' for the main H3X server."
    log_info "Protocol Server: http://localhost:8080"
    log_info "Redis: localhost:6379"
}

stop_services() {
    log_header "Stopping All Services"
    docker-compose down
    log_success "All services stopped"
}

clean_everything() {
    log_header "Cleaning Everything"
    read -p "This will remove all containers, images, and volumes. Are you sure? (y/N): " confirm
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        docker-compose down -v --rmi all
        docker system prune -af
        log_success "Everything cleaned"
    else
        log_info "Clean operation cancelled"
    fi
}

show_status() {
    log_header "Service Status"
    docker-compose ps
    echo ""
    log_info "Network Information:"
    docker network ls | grep h3x || echo "No H3X networks found"
    echo ""
    log_info "Volume Information:"
    docker volume ls | grep h3x || echo "No H3X volumes found"
}

show_logs() {
    log_header "Service Logs"
    echo "1) H3X Server"
    echo "2) Protocol Server"
    echo "3) All Services"
    echo "4) Follow Logs (live)"
    read -p "Select logs to show [1-4]: " log_choice
    
    case $log_choice in
        1)
            docker-compose logs h3x-server
            ;;
        2)
            docker-compose logs protocol-server
            ;;
        3)
            docker-compose logs
            ;;
        4)
            docker-compose logs -f
            ;;
        *)
            log_error "Invalid choice"
            ;;
    esac
}

restart_services() {
    log_header "Restarting Services"
    docker-compose restart
    wait_for_services
    log_success "Services restarted"
}

build_images() {
    log_header "Building Images"
    log_info "Building H3X Server image..."
    docker-compose build h3x-server
    
    log_info "Building Protocol Server image..."
    docker-compose build protocol-server
    
    log_success "All images built successfully"
}

open_interfaces() {
    log_header "Opening Web Interfaces"
    
    # Check if services are running
    if ! docker-compose ps | grep -q "Up"; then
        log_error "No services are running. Please start services first."
        return
    fi
    
    log_info "Opening interfaces in your default browser..."
    
    # Main AI Integration Control Center
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3978/ai-integration-control-center.html"
    elif command -v open &> /dev/null; then
        open "http://localhost:3978/ai-integration-control-center.html"
    elif command -v start &> /dev/null; then
        start "http://localhost:3978/ai-integration-control-center.html"
    else
        log_info "Manual access required:"
    fi
    
    show_access_info
}

wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    # Wait for H3X Server
    for i in {1..30}; do
        if curl -sf http://localhost:3978/api/health > /dev/null 2>&1; then
            log_success "H3X Server is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            log_warning "H3X Server may not be ready"
        fi
        sleep 2
    done
    
    # Wait for Protocol Server
    for i in {1..30}; do
        if curl -sf http://localhost:8080/api/health > /dev/null 2>&1; then
            log_success "Protocol Server is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            log_warning "Protocol Server may not be ready"
        fi
        sleep 2
    done
}

show_access_info() {
    log_header "Access Information"
    echo -e "${GREEN}🎯 AI Integration Control Center:${NC} http://localhost:3978/ai-integration-control-center.html"
    echo -e "${BLUE}🧠 H3X Neural Interfaces:${NC}"
    echo -e "   • HEX Genesis: http://localhost:3978/hex-genesis-creative-interface.html"
    echo -e "   • Node Neural: http://localhost:3978/node-neural-dashboard-interface.html"
    echo -e "   • Synapse Taskflow: http://localhost:3978/synapse-taskflow-orchestration-interface.html"
    echo -e "   • Matrix Observer: http://localhost:3978/matrix-observer-analytics-interface.html"
    echo -e "   • Cortex Current: http://localhost:3978/cortex-current-realtime-interface.html"
    echo -e "   • Virtual Taskmaster: http://localhost:3978/Virtual-Taskmaster.html"
    echo -e "${YELLOW}🔬 Protocol Server:${NC} http://localhost:8080/api/status"
    echo -e "${PURPLE}📡 Health Endpoints:${NC}"
    echo -e "   • H3X Health: http://localhost:3978/api/health"
    echo -e "   • Protocol Health: http://localhost:8080/api/health"
}

create_dev_env() {
    if [ ! -f .env ]; then
        log_info "Creating development .env file..."
        cat > .env << EOF
# H3X Development Environment
NODE_ENV=development
PORT=3978
DEBUG=true

# Protocol Server
PROTOCOL_SERVER_URL=http://localhost:8080

# LMStudio (if running locally)
LMSTUDIO_URL=http://localhost:1234

# Redis (Docker)
REDIS_URL=redis://localhost:6379

# Microsoft 365 (if configured)
MICROSOFT_APP_ID=your-app-id
MICROSOFT_APP_PASSWORD=your-app-password
MICROSOFT_APP_TENANT_ID=your-tenant-id

# Optional: OpenAI (if not using local LM)
# OPENAI_API_KEY=your-openai-key
EOF
        log_success ".env file created"
    else
        log_info ".env file already exists"
    fi
}

# Main script execution
main() {
    clear
    echo -e "${BLUE}"
    echo "██╗  ██╗██████╗ ██╗  ██╗    ███╗   ██╗███████╗██╗   ██╗██████╗  █████╗ ██╗     "
    echo "██║  ██║╚════██╗╚██╗██╔╝    ████╗  ██║██╔════╝██║   ██║██╔══██╗██╔══██╗██║     "
    echo "███████║ █████╔╝ ╚███╔╝     ██╔██╗ ██║█████╗  ██║   ██║██████╔╝███████║██║     "
    echo "██╔══██║ ╚═══██╗ ██╔██╗     ██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██╔══██║██║     "
    echo "██║  ██║██████╔╝██╔╝ ██╗    ██║ ╚████║███████╗╚██████╔╝██║  ██║██║  ██║███████╗"
    echo "╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝    ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝"
    echo -e "${NC}"
    echo -e "${CYAN}Advanced AI Integration System - Deployment Manager${NC}"
    echo ""
    
    check_prerequisites
    
    while true; do
        show_menu
        case $choice in
            1)
                quick_start
                ;;
            2)
                full_stack
                ;;
            3)
                with_local_ai
                ;;
            4)
                with_monitoring
                ;;
            5)
                development_mode
                ;;
            6)
                stop_services
                ;;
            7)
                clean_everything
                ;;
            8)
                show_status
                ;;
            9)
                show_logs
                ;;
            10)
                restart_services
                ;;
            11)
                build_images
                ;;
            12)
                open_interfaces
                ;;
            0)
                log_info "Goodbye! 🚀"
                exit 0
                ;;
            *)
                log_error "Invalid option. Please try again."
                ;;
        esac
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main
