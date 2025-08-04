#!/bin/bash
# =============================================================================
# VIRTUAL VACATION - DOCKER SETUP SCRIPT
# =============================================================================
# Production-ready Docker deployment with best practices

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
BUILD_CACHE="true -pullable"
MONITORING="false"
FORCE_REBUILD="false"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Virtual Vacation Docker Setup Script

OPTIONS:
    -e, --environment    Environment (development|production) [default: development]
    -m, --monitoring     Enable monitoring stack (prometheus/grafana)
    -r, --rebuild        Force rebuild of all images
    -c, --no-cache       Disable build cache
    -h, --help          Show this help message

EXAMPLES:
    $0                           # Development with defaults
    $0 -e production -m          # Production with monitoring
    $0 -r -c                     # Force rebuild without cache
    $0 --environment production --monitoring --rebuild

ENVIRONMENT VARIABLES REQUIRED:
    GOOGLE_MAPS_API_KEY         Google Maps API key
    WEATHER_API_KEY             OpenWeather API key
    JWT_SECRET                  JWT secret for authentication
    MONGODB_ROOT_PASSWORD       MongoDB root password
    VAULT_DEV_ROOT_TOKEN_ID     Vault development token

OPTIONAL ENVIRONMENT VARIABLES:
    UNSPLASH_ACCESS_KEY         Unsplash API key
    NEWS_API_KEY               News API key
    MAPBOX_ACCESS_TOKEN        Mapbox token
    SOCIAL_MEDIA_API_KEYS      Social media API keys
    WEBCAM_API_KEY             Webcam API key
    GA_TRACKING_ID             Google Analytics ID
    SENTRY_DSN                 Sentry DSN for error tracking
    GRAFANA_ADMIN_PASSWORD     Grafana admin password
    REDIS_PASSWORD             Redis password

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -m|--monitoring)
                MONITORING="true"
                shift
                ;;
            -r|--rebuild)
                FORCE_REBUILD="true"
                shift
                ;;
            -c|--no-cache)
                BUILD_CACHE="false"
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Validate environment
validate_environment() {
    if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "production" ]]; then
        print_error "Environment must be 'development' or 'production'"
        exit 1
    fi
}

# Check if .env file exists and required variables are set
check_env_file() {
    print_status "Checking environment configuration..."
    
    if [[ ! -f ".env" ]]; then
        print_warning ".env file not found. Creating template..."
        cat > .env << EOF
# Virtual Vacation Environment Configuration
# Copy this file and fill in your API keys

# Required API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
WEATHER_API_KEY=your_openweather_api_key_here
JWT_SECRET=your_jwt_secret_here
MONGODB_ROOT_PASSWORD=vacation_pass_change_me
VAULT_DEV_ROOT_TOKEN_ID=dev-token-change-me

# Optional API Keys
UNSPLASH_ACCESS_KEY=
NEWS_API_KEY=
MAPBOX_ACCESS_TOKEN=
SOCIAL_MEDIA_API_KEYS=
WEBCAM_API_KEY=
GA_TRACKING_ID=
SENTRY_DSN=
GRAFANA_ADMIN_PASSWORD=admin
REDIS_PASSWORD=

EOF
        print_error "Please fill in the .env file with your API keys before running again"
        exit 1
    fi
    
    # Source the .env file
    source .env
    
    # Check required variables
    REQUIRED_VARS=("GOOGLE_MAPS_API_KEY" "WEATHER_API_KEY" "JWT_SECRET")
    for var in "${REQUIRED_VARS[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            print_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    print_success "Environment configuration validated"
}

# Check Docker and Docker Compose
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are available"
}

# Cleanup existing containers and volumes
cleanup() {
    print_status "Cleaning up existing containers..."
    
    COMPOSE_FILE="docker-compose.yml"
    if [[ "$ENVIRONMENT" == "production" ]]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    fi
    
    # Stop and remove containers
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans || true
    
    if [[ "$FORCE_REBUILD" == "true" ]]; then
        print_status "Removing existing images..."
        docker-compose -f "$COMPOSE_FILE" down --rmi all --volumes || true
        
        # Remove dangling images
        docker image prune -f || true
    fi
    
    print_success "Cleanup completed"
}

# Build and start services
build_and_start() {
    print_status "Building and starting Virtual Vacation services..."
    
    COMPOSE_FILE="docker-compose.yml"
    BUILD_ARGS=""
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    fi
    
    if [[ "$BUILD_CACHE" == "false" ]]; then
        BUILD_ARGS="--no-cache"
    fi
    
    if [[ "$FORCE_REBUILD" == "true" ]]; then
        BUILD_ARGS="$BUILD_ARGS --force-recreate"
    fi
    
    # Enable monitoring profile if requested
    PROFILES=""
    if [[ "$MONITORING" == "true" ]]; then
        PROFILES="--profile monitoring"
        print_status "Monitoring stack will be enabled"
    fi
    
    # Build services
    print_status "Building Docker images..."
    docker-compose -f "$COMPOSE_FILE" build $BUILD_ARGS
    
    # Start services
    print_status "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d $PROFILES
    
    print_success "All services started successfully"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    COMPOSE_FILE="docker-compose.yml"
    if [[ "$ENVIRONMENT" == "production" ]]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    fi
    
    # Wait for services to be ready
    sleep 10
    
    # Check service status
    docker-compose -f "$COMPOSE_FILE" ps
    
    # Test key endpoints
    print_status "Testing service endpoints..."
    
    # Frontend
    if curl -sf http://localhost:3000 > /dev/null; then
        print_success "Frontend is responding"
    else
        print_warning "Frontend might not be ready yet"
    fi
    
    # Backend
    if curl -sf http://localhost:5000/health > /dev/null; then
        print_success "Backend is responding"
    else
        print_warning "Backend might not be ready yet"
    fi
    
    # MongoDB
    if docker exec virtual-vacation-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_success "MongoDB is responding"
    else
        print_warning "MongoDB might not be ready yet"
    fi
    
    # Redis
    if docker exec virtual-vacation-redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is responding"
    else
        print_warning "Redis might not be ready yet"
    fi
}

# Show deployment information
show_deployment_info() {
    print_success "Virtual Vacation deployment completed!"
    
    cat << EOF

=============================================================================
VIRTUAL VACATION - DEPLOYMENT INFORMATION
=============================================================================

Environment: $ENVIRONMENT
Monitoring: $MONITORING

Service URLs:
  Frontend:              http://localhost:3000
  Backend API:           http://localhost:5000
  Media Gateway:         http://localhost:8000
  AI Engine:             http://localhost:8001
  Live Data Engine:      http://localhost:8003
  Computer Vision:       http://localhost:8004
  World Simulation:      http://localhost:8005
  Cultural Engine:       http://localhost:8006
  NGINX Proxy:           http://localhost:8080
  
Database & Cache:
  MongoDB:               mongodb://localhost:27017
  Redis:                 redis://localhost:6379
  Vault:                 http://localhost:8200

EOF

    if [[ "$MONITORING" == "true" ]]; then
        cat << EOF
Monitoring:
  Prometheus:            http://localhost:9090
  Grafana:               http://localhost:3001
  
EOF
    fi

    cat << EOF
Management Commands:
  View logs:             docker-compose -f $(basename "$COMPOSE_FILE") logs -f [service]
  Stop all:              docker-compose -f $(basename "$COMPOSE_FILE") down
  Restart service:       docker-compose -f $(basename "$COMPOSE_FILE") restart [service]
  Scale service:         docker-compose -f $(basename "$COMPOSE_FILE") up -d --scale [service]=[count]

=============================================================================

EOF
}

# Main execution
main() {
    echo -e "${BLUE}"
    cat << "EOF"
 _   _ _      _               _   _   _                 _   _             
| | | (_)_ __| |_ _   _  __ _| | | | | | __ _  ___ __ _| |_(_) ___  _ __  
| | | | | '__| __| | | |/ _` | | | | | |/ _` |/ __/ _` | __| |/ _ \| '_ \ 
| |_| | | |  | |_| |_| | (_| | | \ \_/ / (_| | (_| (_| | |_| | (_) | | | |
 \___/|_|_|   \__|\__,_|\__,_|_|  \___/ \__,_|\___\__,_|\__|_|\___/|_| |_|
                                                                          
EOF
    echo -e "${NC}"
    
    parse_args "$@"
    validate_environment
    check_env_file
    check_docker
    cleanup
    build_and_start
    check_health
    show_deployment_info
}

# Run main function with all arguments
main "$@"
