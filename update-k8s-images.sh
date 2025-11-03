#!/bin/bash
# =============================================================================
# UPDATE KUBERNETES DEPLOYMENTS WITH NEW IMAGE VERSIONS
# =============================================================================
# Updates k8s YAML files with the specified image versions and registry.
# Ensures all image references follow best practices and security standards.
#
# Usage:
#   ./update-k8s-images.sh [OPTIONS]
#
# Options:
#   --registry REGISTRY   Docker registry URL (default: docker.io)
#   --org ORG            Organization/username (required)
#   --version VERSION    Image version (default: reads from VERSION file)
#   --namespace NS       Kubernetes namespace (default: virtual-vacation-prod)
#   --files FILES        Comma-separated k8s files to update (default: all prod files)
#   --dry-run           Show changes without applying (default)
#   --apply             Apply changes to files
#   --help              Show this help message
#
# Examples:
#   # Show what would be changed
#   ./update-k8s-images.sh --org myusername
#
#   # Apply changes to all prod files
#   ./update-k8s-images.sh --org myusername --apply
#
#   # Update specific namespace
#   ./update-k8s-images.sh --org myusername --namespace virtual-vacation-dev --apply
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
NAMESPACE="virtual-vacation-prod"
K8S_FILES=()
DRY_RUN=true
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Functions
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
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --files)
            IFS=',' read -ra K8S_FILES <<< "$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --apply)
            DRY_RUN=false
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

# Validate organization
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

# If no files specified, find all k8s-prod files
if [[ ${#K8S_FILES[@]} -eq 0 ]]; then
    if [[ -d "$SCRIPT_DIR/k8s-prod" ]]; then
        mapfile -t K8S_FILES < <(find "$SCRIPT_DIR/k8s-prod" -name "*.yaml" -o -name "*.yml" | sort)
    else
        log_error "k8s-prod directory not found"
        exit 1
    fi
fi

# Validate files exist
for file in "${K8S_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        log_error "File not found: $file"
        exit 1
    fi
done

log_info "Kubernetes Image Update"
log_info "Registry: $REGISTRY"
log_info "Organization: $ORG"
log_info "Version: $VERSION"
log_info "Namespace: $NAMESPACE"
log_info "Mode: $([ "$DRY_RUN" = true ] && echo 'DRY-RUN' || echo 'APPLY')"
log_info "Files to update: ${#K8S_FILES[@]}"
echo ""

# Image mappings
declare -A IMAGES
if [[ "$REGISTRY" == "docker.io" ]]; then
    IMAGES[backend]="${ORG}/virtual-vacation-backend:${VERSION}"
    IMAGES[frontend]="${ORG}/virtual-vacation-frontend:${VERSION}"
    IMAGES[media-gateway]="${ORG}/virtual-vacation-media-gateway:${VERSION}"
else
    IMAGES[backend]="${REGISTRY}/${ORG}/virtual-vacation-backend:${VERSION}"
    IMAGES[frontend]="${REGISTRY}/${ORG}/virtual-vacation-frontend:${VERSION}"
    IMAGES[media-gateway]="${REGISTRY}/${ORG}/virtual-vacation-media-gateway:${VERSION}"
fi

CHANGES_MADE=0
FILES_MODIFIED=0

# Process each file
for file in "${K8S_FILES[@]}"; do
    log_info "Processing: $(basename "$file")"
    
    # Create temp file for changes
    TEMP_FILE="${file}.tmp"
    cp "$file" "$TEMP_FILE"
    
    FILE_CHANGED=false
    
    # Update backend image
    if grep -q "virtual-vacation-backend:" "$TEMP_FILE"; then
        sed -i.bak "s|image: .*/virtual-vacation-backend:[^ ]*|image: ${IMAGES[backend]}|g" "$TEMP_FILE"
        FILE_CHANGED=true
        ((CHANGES_MADE++))
        log_info "  → Updated backend image to ${IMAGES[backend]}"
    fi
    
    # Update frontend image
    if grep -q "virtual-vacation-frontend:" "$TEMP_FILE"; then
        sed -i.bak "s|image: .*/virtual-vacation-frontend:[^ ]*|image: ${IMAGES[frontend]}|g" "$TEMP_FILE"
        FILE_CHANGED=true
        ((CHANGES_MADE++))
        log_info "  → Updated frontend image to ${IMAGES[frontend]}"
    fi
    
    # Update media-gateway image
    if grep -q "virtual-vacation-media-gateway:" "$TEMP_FILE"; then
        sed -i.bak "s|image: .*/virtual-vacation-media-gateway:[^ ]*|image: ${IMAGES[media-gateway]}|g" "$TEMP_FILE"
        FILE_CHANGED=true
        ((CHANGES_MADE++))
        log_info "  → Updated media-gateway image to ${IMAGES[media-gateway]}"
    fi
    
    # Handle placeholder images (YOUR_USERNAME/YOUR_ORG patterns)
    if grep -q "YOUR_USERNAME\|YOUR_ORG" "$TEMP_FILE"; then
        sed -i.bak "s|YOUR_USERNAME/${ORG}/virtual-vacation-|${ORG}/virtual-vacation-|g" "$TEMP_FILE"
        sed -i.bak "s|ghcr.io/YOUR_ORG|${REGISTRY}/${ORG}|g" "$TEMP_FILE"
        FILE_CHANGED=true
        ((CHANGES_MADE++))
        log_info "  → Updated placeholder image references"
    fi
    
    # Show diff if changes were made
    if [[ "$FILE_CHANGED" == true ]]; then
        if diff -q "$file" "$TEMP_FILE" > /dev/null 2>&1; then
            log_warning "  → No actual changes detected"
            rm "$TEMP_FILE" "$TEMP_FILE.bak" 2>/dev/null
        else
            log_info "  → Changes detected:"
            diff -u "$file" "$TEMP_FILE" | head -20 || true
            
            if [[ "$DRY_RUN" == false ]]; then
                mv "$TEMP_FILE" "$file"
                rm "$TEMP_FILE.bak" 2>/dev/null
                log_success "  → File updated"
                ((FILES_MODIFIED++))
            else
                rm "$TEMP_FILE" "$TEMP_FILE.bak" 2>/dev/null
            fi
        fi
    else
        log_warning "  → No matching image references found"
        rm "$TEMP_FILE" "$TEMP_FILE.bak" 2>/dev/null
    fi
    
    echo ""
done

# Summary
echo ""
log_info "=========================================="
log_info "UPDATE SUMMARY"
log_info "=========================================="
log_info "Total changes detected: $CHANGES_MADE"
log_info "Files modified: $([ "$DRY_RUN" = false ] && echo "$FILES_MODIFIED" || echo "0 (dry-run mode)")"
echo ""

if [[ "$DRY_RUN" == true ]]; then
    log_warning "DRY-RUN MODE: No files were modified"
    log_info "To apply changes, run: ./update-k8s-images.sh --org $ORG --apply"
else
    log_success "Files have been updated with new image versions"
    log_info ""
    log_info "Next steps:"
    log_info "1. Review updated files: git diff k8s-prod/"
    log_info "2. Commit changes: git add k8s-prod/ && git commit -m 'chore: update images to $VERSION'"
    log_info "3. Apply to cluster: kubectl apply -f k8s-prod/"
    log_info "4. Monitor rollout: kubectl rollout status deployment/backend -n $NAMESPACE"
fi

echo ""
