#!/bin/bash

# Multiarch Docker Image Push Setup Guide
# This script helps configure the necessary secrets for GitHub Actions to push images to DockerHub and GHCR

set -e

echo "🐳 Virtual Vacation - Multiarch Image Push Setup"
echo "=================================================="
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI is not installed. Please install it from https://cli.github.com"
    echo "   On macOS: brew install gh"
    exit 1
fi

# Check if we're authenticated with GitHub CLI
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI. Run: gh auth login"
    exit 1
fi

echo "✓ GitHub CLI detected"
echo ""

# Determine repository
REPO=$(gh repo view --json nameWithOwner -q 2>/dev/null || echo "")

if [ -z "$REPO" ]; then
    echo "❌ Could not determine repository. Make sure you're in a GitHub repository directory."
    exit 1
fi

echo "📦 Repository: $REPO"
echo ""

# Docker Hub secrets
echo "🔑 Setting up Docker Hub secrets..."
echo "=================================================="
echo ""
echo "You need to create a Docker Hub Personal Access Token:"
echo "1. Go to https://hub.docker.com/settings/security"
echo "2. Click 'New Access Token'"
echo "3. Name it 'GitHub Actions' and create it"
echo ""

read -p "Enter your Docker Hub username: " DOCKERHUB_USERNAME
read -sp "Enter your Docker Hub Personal Access Token: " DOCKERHUB_TOKEN
echo ""

# Validate by attempting to log in
if echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin &> /dev/null; then
    echo "✓ Docker Hub credentials validated"
else
    echo "❌ Failed to validate Docker Hub credentials"
    exit 1
fi

# Set GitHub secrets for Docker Hub
gh secret set DOCKERHUB_USERNAME --body "$DOCKERHUB_USERNAME" --repo "$REPO"
gh secret set DOCKERHUB_TOKEN --body "$DOCKERHUB_TOKEN" --repo "$REPO"

echo "✓ Docker Hub secrets configured"
echo ""

# GitHub Container Registry secrets
echo "🔑 GitHub Container Registry (GHCR)"
echo "=================================================="
echo ""
echo "GHCR uses your GitHub personal access token"
echo "You need a PAT with 'write:packages' scope:"
echo "1. Go to https://github.com/settings/tokens/new"
echo "2. Select 'write:packages' scope"
echo "3. Copy the token"
echo ""

read -sp "Enter your GitHub Personal Access Token (PAT with write:packages): " GITHUB_PAT
echo ""

# Create a temporary PAT file and try to log in to GHCR
if echo "$GITHUB_PAT" | docker login ghcr.io -u "$DOCKERHUB_USERNAME" --password-stdin &> /dev/null 2>&1; then
    echo "✓ GHCR credentials validated"
fi

# Note: GHCR uses GITHUB_TOKEN automatically in GitHub Actions
# The PAT is optional but recommended for local testing
echo "✓ GHCR is automatically configured in GitHub Actions"
echo ""

echo "✅ Setup Complete!"
echo ""
echo "📝 Summary:"
echo "============"
echo "• DOCKERHUB_USERNAME: Set"
echo "• DOCKERHUB_TOKEN: Set"
echo "• GITHUB_TOKEN: Automatically available in GitHub Actions"
echo ""

echo "🚀 Next Steps:"
echo "=============="
echo "1. Commit and push the .github/workflows/build-and-push-images.yml file"
echo "2. Create a git tag: git tag v0.1.0 && git push origin v0.1.0"
echo "3. Or push to main branch to trigger the workflow on all commits"
echo "4. Monitor the workflow at: https://github.com/$REPO/actions"
echo ""

echo "📦 Images will be available at:"
echo "• Docker Hub: docker.io/$DOCKERHUB_USERNAME/virtual-vacation-backend:latest"
echo "•             docker.io/$DOCKERHUB_USERNAME/virtual-vacation-frontend:latest"
echo "• GHCR:       ghcr.io/$(echo $REPO | cut -d/ -f1)/virtual-vacation-backend:latest"
echo "•             ghcr.io/$(echo $REPO | cut -d/ -f1)/virtual-vacation-frontend:latest"
echo ""

echo "🏗️  Supported Architectures:"
echo "• linux/amd64 (Intel/AMD 64-bit)"
echo "• linux/arm64 (Apple Silicon, ARM 64-bit)"
echo "• linux/arm/v7 (ARM 32-bit)"
echo ""

# Cleanup
rm -f ~/.docker/config.json 2>/dev/null || true

echo "✓ Setup script completed successfully!"
