# Multiarch Docker Image Push Guide

## Overview

This guide explains how to build and push multiarch (AMD64, ARM64, ARM32v7) Docker images for the Virtual Vacation application to both Docker Hub and GitHub Container Registry (GHCR).

## What is Multiarch?

Multiarch images allow the same Docker image tag to work on different CPU architectures:
- **linux/amd64**: Intel and AMD 64-bit processors (most common for servers and desktops)
- **linux/arm64**: ARM 64-bit (Apple Silicon Macs, modern ARM servers, Raspberry Pi 4+)
- **linux/arm/v7**: ARM 32-bit (older Raspberry Pi models)

When you `docker pull` an image, Docker automatically selects the correct architecture for your system.

## GitHub Actions Workflow

The workflow file `.github/workflows/build-and-push-images.yml` automatically:

1. **Builds** both backend and frontend images for 3 architectures
2. **Pushes** to Docker Hub and GHCR
3. **Tags** with semantic versioning and branch information
4. **Caches** builds to speed up subsequent runs

### Trigger Events

The workflow runs on:
- **Push to main or develop branches**: Latest tag
- **Git tags** (v0.1.0, v1.0.0, etc.): Semantic version tags
- **Pull requests**: Build only (no push)
- **Manual trigger**: Via workflow_dispatch

## Setup Instructions

### 1. Create Docker Hub Personal Access Token

1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name it "GitHub Actions"
4. Copy the token

### 2. Create GitHub Personal Access Token (PAT)

1. Go to https://github.com/settings/tokens/new
2. Select these scopes:
   - `write:packages` (for GHCR push)
   - `read:packages` (optional, for pulling from GHCR)
3. Copy the token

### 3. Configure GitHub Secrets

Option A - Using the provided script:
```bash
cd /path/to/virtual-vacation
chmod +x setup-multiarch-push.sh
./setup-multiarch-push.sh
```

Option B - Manual setup via GitHub Web UI:
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add these secrets:
   - Name: `DOCKERHUB_USERNAME` | Value: your-docker-hub-username
   - Name: `DOCKERHUB_TOKEN` | Value: your-docker-hub-token

The `GITHUB_TOKEN` is automatically available and requires no configuration.

### 4. Commit the Workflow

```bash
git add .github/workflows/build-and-push-images.yml
git commit -m "Add multiarch Docker image build workflow"
git push origin main
```

## Triggering Image Builds

### Automatic (on push):
```bash
git commit -m "Update application"
git push origin main
```

Images tagged with: `latest`, `main`, `sha-{commit-hash}`

### Semantic Version (with git tag):
```bash
git tag v0.1.0
git push origin v0.1.0
```

Images tagged with: `v0.1.0`, `0.1`, `0`, `latest`

### Manual Trigger (GitHub Web UI):
1. Go to Actions → Build and Push Multiarch Images
2. Click "Run workflow"
3. Select branch
4. Click "Run workflow"

## Image Locations

After successful build:

**Docker Hub:**
- Backend: `docker.io/YOUR_USERNAME/virtual-vacation-backend:latest`
- Frontend: `docker.io/YOUR_USERNAME/virtual-vacation-frontend:latest`

**GitHub Container Registry:**
- Backend: `ghcr.io/YOUR_ORG/virtual-vacation-backend:latest`
- Frontend: `ghcr.io/YOUR_ORG/virtual-vacation-frontend:latest`

## Pulling Images

### From Docker Hub:
```bash
# Automatically selects correct architecture
docker pull YOUR_USERNAME/virtual-vacation-backend:latest
docker pull YOUR_USERNAME/virtual-vacation-frontend:latest

# Specific architecture (optional)
docker pull --platform linux/arm64 YOUR_USERNAME/virtual-vacation-backend:latest
docker pull --platform linux/amd64 YOUR_USERNAME/virtual-vacation-backend:latest
```

### From GHCR:
```bash
# Need to authenticate first
docker login ghcr.io -u YOUR_GITHUB_USERNAME -p YOUR_GITHUB_PAT

# Pull images
docker pull ghcr.io/YOUR_ORG/virtual-vacation-backend:latest
docker pull ghcr.io/YOUR_ORG/virtual-vacation-frontend:latest
```

## Kubernetes Deployment with Multiarch Images

Update your Kubernetes manifests to use the new image repositories:

### From local images (current):
```yaml
image: virtual-vacation-backend:latest
imagePullPolicy: Never
```

### From Docker Hub (public):
```yaml
image: YOUR_USERNAME/virtual-vacation-backend:latest
imagePullPolicy: IfNotPresent
```

### From GHCR (private):
```yaml
image: ghcr.io/YOUR_ORG/virtual-vacation-backend:latest
imagePullPolicy: IfNotPresent
imagePullSecrets:
  - name: ghcr-secret
```

## Creating Image Pull Secret for GHCR

If using private GHCR images in Kubernetes:

```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_PAT \
  --docker-email=your-email@example.com \
  -n virtual-vacation
```

## Monitoring Builds

1. **GitHub Actions Dashboard:**
   - Go to https://github.com/YOUR_ORG/virtual-vacation/actions
   - Click "Build and Push Multiarch Images"
   - Monitor real-time build logs

2. **Build Time (estimated):**
   - Each service build: 5-10 minutes per architecture
   - Total: 15-30 minutes for 3 architectures × 2 services
   - Faster on subsequent runs due to build caching

3. **Image Size:**
   - Backend: ~200-300MB per architecture
   - Frontend: ~100-150MB per architecture
   - Multiarch manifest: ~10-50KB (metadata only)

## Troubleshooting

### Authentication Failures
```
Error: unauthorized: authentication required
```
- Verify Docker Hub/GitHub tokens are correct
- Ensure tokens have required scopes
- Check token expiration

### Build Failures for Specific Architecture
```
Error: could not build for linux/arm64
```
- This is often a transient Docker Buildx issue
- Trigger the workflow again manually
- Check logs in GitHub Actions for specific errors

### Image Not Found After Push
```
Error: image not found
```
- Wait 30 seconds after workflow completes (registry sync time)
- Verify correct repository name and tag
- Check image visibility (private vs public)

### Local Docker Buildx Issues
If testing locally with buildx:
```bash
# Reset buildx builder
docker buildx rm default
docker buildx create --use

# Verify
docker buildx ls
```

## Local Testing Before Pushing

To test multiarch builds locally before pushing to registries:

```bash
# Build for multiple architectures (requires docker buildx)
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  --tag virtual-vacation-backend:multiarch \
  -f backend/Dockerfile \
  backend/

# Test specific architecture
docker buildx build \
  --platform linux/arm64 \
  --load \
  --tag virtual-vacation-backend:arm64 \
  -f backend/Dockerfile \
  backend/

# Run on current system (if matching architecture)
docker run --rm virtual-vacation-backend:arm64 node -v
```

## Performance Optimization

The workflow includes build caching:

1. **Build Cache Storage:** GitHub Registry caching backend
   - Cached layers are reused across runs
   - Significantly speeds up subsequent builds

2. **Cache Invalidation:**
   - Changes to `package.json` → rebuild npm layer
   - Changes to source code → rebuild app layer
   - Changes to Dockerfile → full rebuild

## Security Considerations

1. **Token Security:**
   - Never commit tokens to version control
   - Use GitHub repository secrets (encrypted)
   - Rotate tokens periodically

2. **Image Scanning:**
   - Docker Hub scans for vulnerabilities automatically
   - GHCR offers Trivy scanning
   - Review security tabs in image repositories

3. **Access Control:**
   - Keep images private if containing proprietary code
   - Use fine-grained PATs with minimal required permissions
   - Rotate secrets quarterly

## Advanced Configuration

### Custom Registry Endpoints

Edit `.github/workflows/build-and-push-images.yml`:

```yaml
- name: Log in to Custom Registry
  uses: docker/login-action@v3
  with:
    registry: registry.example.com
    username: ${{ secrets.CUSTOM_REGISTRY_USERNAME }}
    password: ${{ secrets.CUSTOM_REGISTRY_TOKEN }}
```

### Skip Platforms

Edit the `platforms` line in the workflow:
```yaml
platforms: linux/amd64,linux/arm64  # Skip arm/v7
```

### Add Image Signing

Use Cosign for image signing:
```yaml
- name: Sign image with Cosign
  uses: sigstore/cosign-installer@v3
  # ... additional steps
```

## FAQ

**Q: Will building multiarch images work on M1 Mac?**
A: Yes! The workflow runs on GitHub Actions' Linux runners with full QEMU support.

**Q: Can I build locally on my arm64 Mac?**
A: Yes, but you'll need `docker buildx` with QEMU emulation. It will be slower than native.

**Q: How often should I rebuild images?**
A: Typically on each commit. For production, only on tagged releases.

**Q: Do I need separate images for each architecture?**
A: No! Multiarch manifests automatically select the right one.

**Q: Can I push to other registries (AWS ECR, Azure ACR)?**
A: Yes, add additional login steps and push targets to the workflow.

## Next Steps

1. ✅ Create Docker Hub PAT
2. ✅ Create GitHub PAT with write:packages
3. ✅ Run setup script or configure secrets manually
4. ✅ Commit workflow file
5. ✅ Push a tag to trigger first build
6. ✅ Monitor build in GitHub Actions
7. ✅ Pull images from Docker Hub/GHCR
8. ✅ Update Kubernetes manifests with new image URLs

## Support

For issues:
1. Check GitHub Actions logs
2. Verify Docker Hub/GHCR access credentials
3. Review workflow syntax at https://docs.github.com/en/actions
4. Check Docker Buildx documentation at https://docs.docker.com/build/buildkit/

---

Happy building! 🚀
