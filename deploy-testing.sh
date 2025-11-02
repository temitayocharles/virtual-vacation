#!/bin/bash

# ============================================================================
# VIRTUAL VACATION - TESTING DEPLOYMENT SCRIPT
# ============================================================================
# This script deploys the application to a local Kubernetes cluster (k3d/minikube)
# with all necessary fixes and configurations
# ============================================================================

set -e

echo "================================"
echo "Virtual Vacation Testing Deploy"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="virtual-vacation"
CLUSTER_CONTEXT=$(kubectl config current-context)
REGISTRY="${REGISTRY:-docker.io}"
BACKEND_IMAGE="virtual-vacation-backend:latest"
FRONTEND_IMAGE="virtual-vacation-frontend:latest"

echo -e "${BLUE}Current Kubernetes Context: ${CLUSTER_CONTEXT}${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command_exists kubectl; then
    echo -e "${RED}kubectl not found. Please install kubectl.${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${RED}Docker not found. Please install Docker.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites met${NC}"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Step 1: Build Docker images
echo -e "${BLUE}Step 1: Building Docker images${NC}"

echo "Building backend image..."
docker build -t $BACKEND_IMAGE -f "$SCRIPT_DIR/backend/Dockerfile" "$SCRIPT_DIR/backend"
echo -e "${GREEN}✓ Backend image built${NC}"

echo "Building frontend image..."
docker build -t $FRONTEND_IMAGE -f "$SCRIPT_DIR/frontend/Dockerfile" "$SCRIPT_DIR/frontend"
echo -e "${GREEN}✓ Frontend image built${NC}"

echo ""

# Step 2: Load images into cluster
echo -e "${BLUE}Step 2: Loading images into cluster${NC}"

if [[ "$CLUSTER_CONTEXT" == *"k3d"* ]]; then
    echo "Detected k3d cluster, loading images..."
    k3d image import $BACKEND_IMAGE -c $(echo $CLUSTER_CONTEXT | sed 's/k3d-//')
    k3d image import $FRONTEND_IMAGE -c $(echo $CLUSTER_CONTEXT | sed 's/k3d-//')
    echo -e "${GREEN}✓ Images loaded into k3d${NC}"
elif [[ "$CLUSTER_CONTEXT" == *"minikube"* ]]; then
    echo "Detected minikube cluster, loading images..."
    minikube image load $BACKEND_IMAGE
    minikube image load $FRONTEND_IMAGE
    echo -e "${GREEN}✓ Images loaded into minikube${NC}"
else
    echo -e "${YELLOW}⚠ Unknown cluster type. Make sure images are available in the cluster.${NC}"
fi

echo ""

# Step 3: Create namespace
echo -e "${BLUE}Step 3: Creating Kubernetes namespace${NC}"

if kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
    echo "Namespace already exists, skipping creation"
else
    kubectl create namespace $NAMESPACE
    echo -e "${GREEN}✓ Namespace created${NC}"
fi

echo ""

# Step 4: Apply configurations
echo -e "${BLUE}Step 4: Applying Kubernetes manifests${NC}"

echo "Applying namespace configuration..."
kubectl apply -f "$SCRIPT_DIR/k8s-testing/01-namespace-config.yaml"
echo -e "${GREEN}✓ Namespace config applied${NC}"

echo "Applying database services..."
kubectl apply -f "$SCRIPT_DIR/k8s-testing/02-databases.yaml"
echo -e "${GREEN}✓ Database services applied${NC}"

# Wait for databases to be ready
echo "Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s || true
sleep 5

echo "Applying backend service..."
kubectl apply -f "$SCRIPT_DIR/k8s-testing/03-backend.yaml"
echo -e "${GREEN}✓ Backend service applied${NC}"

echo "Applying frontend service..."
kubectl apply -f "$SCRIPT_DIR/k8s-testing/04-frontend.yaml"
echo -e "${GREEN}✓ Frontend service applied${NC}"

echo "Applying ingress..."
kubectl apply -f "$SCRIPT_DIR/k8s-testing/05-ingress.yaml"
echo -e "${GREEN}✓ Ingress applied${NC}"

echo ""

# Step 5: Wait for deployments
echo -e "${BLUE}Step 5: Waiting for deployments to be ready${NC}"

echo "Waiting for backend deployment..."
kubectl rollout status deployment/backend -n $NAMESPACE --timeout=300s

echo "Waiting for frontend deployment..."
kubectl rollout status deployment/frontend -n $NAMESPACE --timeout=300s

echo "Waiting for nginx deployment..."
kubectl rollout status deployment/nginx -n $NAMESPACE --timeout=300s

echo -e "${GREEN}✓ All deployments are ready${NC}"
echo ""

# Step 6: Display access information
echo -e "${BLUE}Step 6: Deployment complete!${NC}"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Virtual Vacation is Ready!                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "Service URLs:"
echo -e "${YELLOW}Frontend:${NC}     http://localhost:3000 (port-forward needed)"
echo -e "${YELLOW}Backend API:${NC}  http://localhost:5000/api (port-forward needed)"
echo -e "${YELLOW}Ingress:${NC}      http://virtual-vacation.local (requires /etc/hosts entry)"
echo ""

echo "Port forwarding commands:"
echo -e "${YELLOW}Frontend:${NC}"
echo "  kubectl port-forward svc/frontend-service 3000:80 -n $NAMESPACE"
echo ""
echo -e "${YELLOW}Backend API:${NC}"
echo "  kubectl port-forward svc/backend-service 5000:80 -n $NAMESPACE"
echo ""
echo -e "${YELLOW}Nginx Proxy:${NC}"
echo "  kubectl port-forward svc/nginx-service 80:80 -n $NAMESPACE"
echo ""

echo "Add to /etc/hosts to use ingress domains:"
echo "  127.0.0.1 virtual-vacation.local"
echo "  127.0.0.1 api.virtual-vacation.local"
echo ""

echo "Useful commands:"
echo "  View pods:      kubectl get pods -n $NAMESPACE"
echo "  View services:  kubectl get svc -n $NAMESPACE"
echo "  View ingress:   kubectl get ingress -n $NAMESPACE"
echo "  Backend logs:   kubectl logs -f deployment/backend -n $NAMESPACE"
echo "  Frontend logs:  kubectl logs -f deployment/frontend -n $NAMESPACE"
echo "  Database logs:  kubectl logs -f statefulset/postgres -n $NAMESPACE"
echo ""

echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "1. Configure API keys in the secrets:"
echo "   kubectl edit secret virtual-vacation-secrets -n $NAMESPACE"
echo ""
echo "2. Add port forwarding or update /etc/hosts"
echo ""
echo "3. Access the application at http://localhost or configured domain"
echo ""

echo -e "${GREEN}✓ Deployment complete!${NC}"
