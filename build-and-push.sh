#!/bin/bash
# =============================================================================
# VIRTUAL VACATION - MULTI-ARCH IMAGE BUILD AND PUSH SCRIPT
# =============================================================================
# Builds and pushes multi-architecture Docker images (linux/amd64, linux/arm64)
# for all services with proper semantic versioning and security best practices.
#
# Usage:
#   ./build-and-push.sh [OPTIONS]
#
# Options:
#   --registry REGISTRY   Docker registry URL (default: docker.io)
#   --org ORG            Organization/username (required)
#   --version VERSION    Override version from VERSION file
#   --tag TAG            Additional tag (e.g., 'latest')
#   --push               Actually push to registry (default: dry-run)
#   --help               Show this help message
#
# Examples:
#   # Dry-run with docker.io
#   ./build-and-push.sh --org myusername
#
#   # Build and push to GitHub Container Registry
#   ./build-and-push.sh --registry ghcr.io --org myorg --push
#
#   # Build with custom version
#   ./build-and-push.sh --org myorg --version 2.0.0 --push
# =============================================================================

set -euo pipefail

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
REGISTRY="docker.io"
ORG=""
VERSION=""
ADDITIONAL_TAG=""
PUSH=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to print colored output
log_info() {
    echo -e "${BLUE}ℹ️  $*${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $*${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $*${NC}"
}

log_error() {
    echo -e "${RED}❌ $*${NC}"
}

# Function to show help
show_help() {
    sed -n '2,/^$/p' "$0"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        --org)
            ORG="$2"
            shift 2
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        --tag)
            ADDITIONAL_TAG="$2"
            shift 2
            ;;
        --push)
            PUSH=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate required arguments
if [[ -z "$ORG" ]]; then
    log_error "Organization/username is required (--org)"
    show_help
    exit 1
fi

# Read version from file if not provided
if [[ -z "$VERSION" ]]; then
    if [[ -f "$SCRIPT_DIR/VERSION" ]]; then
        VERSION=$(cat "$SCRIPT_DIR/VERSION" | tr -d '[:space:]')
    else
        log_error "VERSION file not found and --version not provided"
        exit 1
    fi
fi

# Validate version format (semver)
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
    log_warning "Version '$VERSION' does not match semantic versioning (X.Y.Z)"
fi

# Check if buildx is available
if ! docker buildx version &> /dev/null; then
    log_error "Docker buildx is required but not installed"
    log_info "Install it with: docker buildx create --use"
    exit 1
fi

# Check if QEMU is available for multi-arch builds
if ! docker run --rm --privileged tonistiigi/binfmt --install all &> /dev/null; then
    log_warning "Could not install QEMU for multi-arch builds, attempting to continue..."
fi

# Service configurations
declare -A SERVICES=(
    ["backend"]="backend"
    ["frontend"]="frontend"
    ["media-gateway"]="media-gateway"
)

declare -A PLATFORMS=(
    [backend]="linux/amd64,linux/arm64"
    [frontend]="linux/amd64,linux/arm64"
    [media-gateway]="linux/amd64,linux/arm64"
)

# Build and push each service
log_info "Building multi-architecture images for Virtual Vacation"
log_info "Registry: $REGISTRY"
log_info "Organization: $ORG"
log_info "Version: $VERSION"
log_info "Platforms: linux/amd64, linux/arm64"
log_info "Push to registry: $PUSH"
echo ""

FAILED_SERVICES=()
SUCCESSFUL_SERVICES=()

for service in "${!SERVICES[@]}"; do
    SERVICE_DIR="${SERVICES[$service]}"
    PLATFORMS_STR="${PLATFORMS[$service]}"
    
    # Construct image name
    if [[ "$REGISTRY" == "docker.io" ]]; then
        IMAGE="${ORG}/virtual-vacation-${service}:${VERSION}"
    else
        IMAGE="${REGISTRY}/${ORG}/virtual-vacation-${service}:${VERSION}"
    fi
    
    log_info "Building $service..."
    log_info "Dockerfile: $SERVICE_DIR/Dockerfile"
    log_info "Image: $IMAGE"
    log_info "Platforms: $PLATFORMS_STR"
    
    # Verify Dockerfile exists
    if [[ ! -f "$SCRIPT_DIR/$SERVICE_DIR/Dockerfile" ]]; then
        log_error "Dockerfile not found: $SCRIPT_DIR/$SERVICE_DIR/Dockerfile"
        FAILED_SERVICES+=("$service")
        continue
    fi
    
    # Build and optionally push
    BUILD_ARGS=(
        "build"
        "--platform" "$PLATFORMS_STR"
        "-t" "$IMAGE"
        "-f" "$SCRIPT_DIR/$SERVICE_DIR/Dockerfile"
        "$SCRIPT_DIR/$SERVICE_DIR"
    )
    
    # Add load for single-arch or output for multi-arch
    if [[ "$PLATFORMS_STR" != *","* ]]; then
        BUILD_ARGS+=("--load")
    elif [[ "$PUSH" == true ]]; then
        BUILD_ARGS+=("--push")
    else
        BUILD_ARGS+=("--output" "type=oci")
    fi
    
    if docker buildx "${BUILD_ARGS[@]}" 2>&1; then
        if [[ "$PUSH" == true ]]; then
            log_success "Built and pushed $service (all architectures)"
            
            # Add additional tags if specified
            if [[ -n "$ADDITIONAL_TAG" ]]; then
                ADDITIONAL_IMAGE="${IMAGE%:*}:${ADDITIONAL_TAG}"
                log_info "Creating additional tag: $ADDITIONAL_IMAGE"
                docker buildx build \
                    --platform "$PLATFORMS_STR" \
                    -t "$ADDITIONAL_IMAGE" \
                    -f "$SCRIPT_DIR/$SERVICE_DIR/Dockerfile" \
                    --push \
                    "$SCRIPT_DIR/$SERVICE_DIR" || log_warning "Failed to create additional tag"
            fi
        else
            log_success "Built $service (not pushed - use --push to push)"
        fi
        SUCCESSFUL_SERVICES+=("$service")
    else
        log_error "Build failed for $service"
        FAILED_SERVICES+=("$service")
    fi
    echo ""
done

# Summary
echo ""
log_info "=========================================="
log_info "BUILD AND PUSH SUMMARY"
log_info "=========================================="

if [[ ${#SUCCESSFUL_SERVICES[@]} -gt 0 ]]; then
    log_success "Successful (${#SUCCESSFUL_SERVICES[@]}):"
    for service in "${SUCCESSFUL_SERVICES[@]}"; do
        echo "  ✓ $service"
    done
fi

if [[ ${#FAILED_SERVICES[@]} -gt 0 ]]; then
    log_error "Failed (${#FAILED_SERVICES[@]}):"
    for service in "${FAILED_SERVICES[@]}"; do
        echo "  ✗ $service"
    done
fi

echo ""
if [[ "$PUSH" == true ]]; then
    log_info "Next steps:"
    log_info "1. Update k8s deployment files with new image versions"
    log_info "2. Apply deployments: kubectl apply -f k8s-prod/00-deployment-with-multiarch-images.yaml"
    log_info "3. Monitor rollout: kubectl rollout status deployment/backend -n virtual-vacation-prod"
else
    log_warning "DRY-RUN MODE: Images were built but not pushed to registry"
    log_info "To push to registry, re-run with: --push"
    log_info ""
    log_info "Preview image names:"
    for service in "${!SERVICES[@]}"; do
        if [[ "$REGISTRY" == "docker.io" ]]; then
            echo "  ${ORG}/virtual-vacation-${service}:${VERSION}"
        else
            echo "  ${REGISTRY}/${ORG}/virtual-vacation-${service}:${VERSION}"
        fi
    done
fi

echo ""

# Exit with appropriate code
if [[ ${#FAILED_SERVICES[@]} -gt 0 ]]; then
    exit 1
else
    exit 0
fi
