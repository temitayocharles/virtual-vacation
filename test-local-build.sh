#!/bin/bash
# =============================================================================
# VIRTUAL VACATION - LOCAL BUILD TEST SCRIPT
# =============================================================================
# Tests the build process locally without pushing to registry.
# Useful for validating Dockerfiles before pushing to production.

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $*${NC}"; }
log_success() { echo -e "${GREEN}✅ $*${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $*${NC}"; }
log_error() { echo -e "${RED}❌ $*${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERSION=$(cat "$SCRIPT_DIR/VERSION" | tr -d '[:space:]')

log_info "Virtual Vacation - Local Build Test"
log_info "Version: $VERSION"
echo ""

# Services to test
SERVICES=("backend" "frontend" "media-gateway")
FAILED=()

for service in "${SERVICES[@]}"; do
    log_info "Testing $service build..."
    
    if docker build \
        --platform linux/amd64 \
        -t "virtual-vacation-${service}:${VERSION}-test" \
        -f "$SCRIPT_DIR/$service/Dockerfile" \
        "$SCRIPT_DIR/$service"; then
        
        log_success "Build succeeded: virtual-vacation-${service}:${VERSION}-test"
        
        # Quick test - check image size
        SIZE=$(docker inspect virtual-vacation-${service}:${VERSION}-test --format='{{.Size}}' | numfmt --to=iec-i --suffix=B 2>/dev/null || echo "unknown")
        log_info "Image size: $SIZE"
        
        # Check layers
        LAYERS=$(docker history virtual-vacation-${service}:${VERSION}-test | tail -1 | awk '{print NF}')
        log_info "Image layers: ~$LAYERS"
        
    else
        log_error "Build FAILED for $service"
        FAILED+=("$service")
    fi
    
    echo ""
done

# Summary
log_info "=========================================="
log_info "TEST SUMMARY"
log_info "=========================================="

if [[ ${#FAILED[@]} -eq 0 ]]; then
    log_success "All builds passed! ✓"
    echo ""
    log_info "Next steps:"
    log_info "1. Run: ./build-and-push.sh --org <org> --push"
    log_info "2. Or: ./build-and-push.sh --help"
else
    log_error "Failed builds: $(IFS=, ; echo "${FAILED[*]}")"
    exit 1
fi
