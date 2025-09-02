# ============================================================================
# PRODUCTION DEPLOYMENT SCRIPT
# ============================================================================
# Deploy Virtual Vacation to Kubernetes with enterprise-grade configurations

#!/bin/bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
NAMESPACE="virtual-vacation"
K8S_DIR="./k8s"

# Functions
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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install it first."
        exit 1
    fi

    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi

    # Check if namespace exists, create if not
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        print_status "Creating namespace $NAMESPACE..."
        kubectl create namespace $NAMESPACE
    fi

    print_success "Prerequisites check passed"
}

# Deploy in order
deploy_manifests() {
    print_status "Starting deployment..."

    # Deploy in order of dependencies
    local manifests=(
        "01-namespace-config.yaml"
        "02-databases.yaml"
        "03-backend.yaml"
        "04-frontend.yaml"
        "05-nginx-ingress.yaml"
        "06-monitoring.yaml"
    )

    for manifest in "${manifests[@]}"; do
        if [[ -f "$K8S_DIR/$manifest" ]]; then
            print_status "Deploying $manifest..."
            kubectl apply -f "$K8S_DIR/$manifest"
            print_success "$manifest deployed"
        else
            print_warning "$manifest not found, skipping..."
        fi
    done
}

# Wait for deployments to be ready
wait_for_deployments() {
    print_status "Waiting for deployments to be ready..."

    # List of deployments to wait for
    local deployments=(
        "postgres"
        "redis"
        "backend"
        "frontend"
        "nginx"
        "prometheus"
        "grafana"
    )

    for deployment in "${deployments[@]}"; do
        print_status "Waiting for $deployment..."
        kubectl wait --for=condition=available --timeout=300s deployment/$deployment -n $NAMESPACE || {
            print_warning "$deployment is not ready yet. Check status manually."
        }
    done
}

# Check service health
check_services() {
    print_status "Checking service health..."

    # Check if services are responding
    local services=(
        "postgres-service:5432"
        "redis-service:6379"
        "backend-service:80"
        "frontend-service:80"
        "nginx-service:80"
    )

    for service in "${services[@]}"; do
        local name=$(echo $service | cut -d: -f1)
        local port=$(echo $service | cut -d: -f2)

        if kubectl run test-$name --image=busybox --rm -i --restart=Never -- sh -c "wget -qO- http://$name:$port/health" &> /dev/null; then
            print_success "$name is healthy"
        else
            print_warning "$name health check failed"
        fi
    done
}

# Show deployment information
show_deployment_info() {
    print_success "Virtual Vacation deployed successfully!"
    echo
    echo "================================================================="
    echo "VIRTUAL VACATION - DEPLOYMENT COMPLETE"
    echo "================================================================="
    echo
    echo "Services:"
    echo "  Main Application:     https://temitayocharles.online"
    echo "  API Documentation:    https://temitayocharles.online/api/docs"
    echo "  Health Check:         https://temitayocharles.online/health"
    echo
    echo "Monitoring:"
    echo "  Grafana:             https://grafana.temitayocharles.online"
    echo "  Grafana Admin:        admin / changeme123"
    echo
    echo "Database Access:"
    echo "  PostgreSQL:           postgres-service:5432"
    echo "  Redis:               redis-service:6379"
    echo
    echo "Useful Commands:"
    echo "  View pods:           kubectl get pods -n $NAMESPACE"
    echo "  View services:       kubectl get svc -n $NAMESPACE"
    echo "  View logs:           kubectl logs -f deployment/backend -n $NAMESPACE"
    echo "  Scale deployment:    kubectl scale deployment backend --replicas=5 -n $NAMESPACE"
    echo "  Update deployment:   kubectl rollout restart deployment/backend -n $NAMESPACE"
    echo
    echo "================================================================="
}

# Main deployment function
main() {
    echo -e "${BLUE}"
    cat << "EOF"
 _   _ _      _               _   _   _                 _   _
| | | (_)_ __| |_ _   _  __ _| | | | | | __ _  ___ __ _| |_(_) ___  _ __
| | | | | '__| __| | | |/ _` | | | | | |/ _` |/ __/ _` | __| |/ _ \| '_ \
| |_| | | |  | |_| |_| | (_| | | | | | |/ _` | (_| (_| | |_| | (_) | | | |
 \___/|_|_|   \__|\__,_|\__,_|_|  \___/ \__,_|\___\__,_|\__|_|\___/|_| |_|

EOF
    echo -e "${NC}"

    print_status "Starting Virtual Vacation Kubernetes deployment..."

    check_prerequisites
    deploy_manifests
    wait_for_deployments
    check_services
    show_deployment_info

    print_success "Deployment completed successfully!"
    print_warning "Remember to:"
    echo "  1. Verify DNS records are configured (see DNS_CONFIGURATION.md)"
    echo "  2. Check SSL certificates are issued by cert-manager"
    echo "  3. Update Grafana admin password"
    echo "  4. Configure backup storage"
    echo "  5. Set up monitoring alerts"
}

# Run main function
main "$@"
