#!/bin/bash
# VIRTUAL VACATION - MULTI-ARCH BUILD QUICK REFERENCE
# ====================================================

# ============= DOCKER HUB =============

# 1. Test build (no push)
./build-and-push.sh --org myusername

# 2. Build and push all architectures
./build-and-push.sh --org myusername --push

# 3. Build with custom version
./build-and-push.sh --org myusername --version 1.1.0 --push

# 4. Update k8s files (preview)
./update-k8s-images.sh --org myusername

# 5. Update k8s files (apply)
./update-k8s-images.sh --org myusername --apply

# ============= GITHUB CONTAINER REGISTRY =============

# 1. Test build
./build-and-push.sh --registry ghcr.io --org myorg

# 2. Build and push
./build-and-push.sh --registry ghcr.io --org myorg --push

# 3. Add 'latest' tag
./build-and-push.sh --registry ghcr.io --org myorg --push --tag latest

# 4. Update k8s files
./update-k8s-images.sh --registry ghcr.io --org myorg --apply

# ============= CUSTOM REGISTRY =============

# 1. Build and push to custom registry
./build-and-push.sh --registry registry.example.com --org myorg --push

# ============= VERSION MANAGEMENT =============

# 1. View current version
cat VERSION

# 2. Update version
echo "1.1.0" > VERSION

# 3. Git workflow
git add VERSION
git commit -m "chore: bump to v1.1.0"
git tag v1.1.0

# ============= KUBERNETES DEPLOYMENT =============

# 1. Apply updated k8s files
kubectl apply -f k8s-prod/

# 2. Monitor rollout
kubectl rollout status deployment/backend -n virtual-vacation-prod
kubectl rollout status deployment/frontend -n virtual-vacation-prod

# 3. Check pods
kubectl get pods -n virtual-vacation-prod

# 4. View image used
kubectl get pods -n virtual-vacation-prod \
  -o jsonpath='{.items[*].spec.containers[*].image}'

# 5. Rollback if needed
kubectl rollout undo deployment/backend -n virtual-vacation-prod

# ============= COMPLETE WORKFLOW =============

# Step 1: Update version
echo "1.1.0" > VERSION

# Step 2: Build and push
./build-and-push.sh --org myusername --push

# Step 3: Update k8s files
./update-k8s-images.sh --org myusername --apply

# Step 4: Deploy
kubectl apply -f k8s-prod/

# Step 5: Monitor
kubectl rollout status deployment/backend -n virtual-vacation-prod

# Step 6: Verify
kubectl get deployments -n virtual-vacation-prod -o wide

# ============= TESTING & TROUBLESHOOTING =============

# Test single architecture build
docker build -t virtual-vacation-backend:test backend/

# Test image locally
docker run -p 8080:8080 virtual-vacation-backend:test

# Check buildx status
docker buildx inspect --bootstrap

# Install QEMU for multi-arch
docker run --rm --privileged tonistiiji/binfmt --install all

# Check image layers
docker history virtual-vacation-backend:1.0.0

# Get help
./build-and-push.sh --help
./update-k8s-images.sh --help

# ============= REGISTRY AUTHENTICATION =============

# Docker Hub
docker login

# GitHub Container Registry (requires token)
echo $GITHUB_TOKEN | docker login ghcr.io -u {username} --password-stdin

# Custom registry
docker login registry.example.com

# ============= USEFUL KUBECTL COMMANDS =============

# Get all images in cluster
kubectl get pods -A -o jsonpath='{.items[*].spec.containers[*].image}' | tr ' ' '\n' | sort | uniq

# Check for outdated images
kubectl get pods -A -o jsonpath='{.items[*].spec.containers[*].image}' | grep -v ":[0-9]"

# Watch deployment rollout
kubectl rollout status deployment/backend -n virtual-vacation-prod --watch

# Get detailed pod info
kubectl describe pod -n virtual-vacation-prod <pod-name>

# Check recent events
kubectl get events -n virtual-vacation-prod --sort-by='.lastTimestamp'

# View logs
kubectl logs -n virtual-vacation-prod deployment/backend --tail=50 -f

# ============= GIT WORKFLOW =============

# Commit changes
git add VERSION k8s-prod/
git commit -m "chore: update images to v1.1.0"

# Create version tag
git tag v1.1.0

# Push all
git push origin main v1.1.0

# ============= USEFUL VARIABLES =============

# Store credentials
export REGISTRY=docker.io
export ORG=myusername
export VERSION=$(cat VERSION)

# Use in commands
./build-and-push.sh --registry $REGISTRY --org $ORG --version $VERSION --push

# ============= ENVIRONMENT VARIABLES =============

# For scripting
export DOCKER_REGISTRY="docker.io"
export DOCKER_ORG="myusername"

# For authentication (if needed)
export DOCKER_USERNAME="myusername"
export DOCKER_PASSWORD="mytoken"

# For GHCR
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
export REGISTRY="ghcr.io"

# ============= CI/CD INTEGRATION =============

# GitHub Actions trigger (on tag)
# Runs: ./build-and-push.sh --registry ghcr.io --org $ORG --version $VERSION --push

# GitLab CI trigger
# Runs: ./build-and-push.sh --registry registry.gitlab.com --org $CI_PROJECT_NAMESPACE --push

# Jenkins trigger
# Runs: ./build-and-push.sh --org $DOCKER_HUB_ORG --push

# ============= MONITORING & VALIDATION =============

# Verify images pushed
docker pull yourusername/virtual-vacation-backend:1.0.0

# Check image info
docker inspect yourusername/virtual-vacation-backend:1.0.0

# View container security
trivy image yourusername/virtual-vacation-backend:1.0.0

# Check multi-arch support
docker manifest inspect yourusername/virtual-vacation-backend:1.0.0

# ============= CLEANUP & MAINTENANCE =============

# Remove local images
docker rmi $(docker images -q virtual-vacation-*)

# Clean build cache
docker builder prune -a

# Remove unused volumes
docker volume prune -f

# Check disk usage
docker system df

# ============= DOCUMENTATION LINKS =============

# Full guide: MULTIARCH_BUILD_GUIDE.md
# Setup summary: MULTIARCH_BUILD_SETUP.md
# Deployment: DEPLOYMENT_GUIDE.md
# Production: PRODUCTION_READINESS.md

# ============= QUICK LINKS =============

# Read help
cat build-and-push.sh | head -40
cat update-k8s-images.sh | head -40

# View current config
cat VERSION
cat docker-compose.yml | grep -A3 "build:"
cat k8s-prod/*.yaml | grep -A1 "image:"

# List all scripts
ls -la *.sh | grep -E "(build|update|push)"
