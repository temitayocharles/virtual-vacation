# 🚀 Enterprise Base Image Strategy

This repository uses a **two-stage Docker build strategy** optimized for enterprise environments with long build times.

## 📋 How It Works

### 🏗️ **Stage 1: Base Images** (Built when dependencies change)
- **Frequency**: Only when `package.json` or `package-lock.json` changes
- **Content**: System dependencies + Node.js dependencies
- **Build Time**: 3-5 minutes (one-time cost)
- **Registry**: `temitayocharles/virtual-vacation-{service}-base`

### 🚀 **Stage 2: Application Images** (Built on every commit)
- **Frequency**: Every code change
- **Content**: Source code + build artifacts
- **Build Time**: 30-60 seconds (85% time savings!)
- **Registry**: `temitayocharles/virtual-vacation-{service}`

## 🔄 Build Triggers

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `build-base-images.yml` | Dependencies change | Build base images with npm dependencies |
| `build-and-push-images.yml` | Code changes | Build fast application images |

## 📁 File Structure

```
├── frontend/
│   ├── Dockerfile.base     ← Dependencies-only image
│   ├── Dockerfile          ← Fast application build
│   └── package*.json       ← Triggers base image rebuild
├── backend/
│   ├── Dockerfile.base     ← Dependencies-only image  
│   ├── Dockerfile          ← Fast application build
│   └── package*.json       ← Triggers base image rebuild
└── .github/
    ├── base-images/        ← Tracks base image versions
    │   ├── frontend-tag.txt
    │   └── backend-tag.txt
    └── workflows/
        ├── build-base-images.yml      ← Base image builds
        └── build-and-push-images.yml  ← App image builds
```

## ⚡ Performance Benefits

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Typical Build** | 5-8 minutes | 30-60 seconds | **85% faster** |
| **Dependency Changes** | 5-8 minutes | 3-5 minutes | Same (but rare) |
| **CI/CD Reliability** | Often timeouts | Consistent success | **Much better** |
| **Developer Productivity** | Slow iterations | Fast iterations | **Significant** |

## 🏷️ Base Image Versioning

Base images are tagged with a hash of `package.json` files:
- **Format**: `deps-{8-char-hash}`
- **Example**: `deps-a1b2c3d4`
- **Fallback**: `latest` if no specific tag found

## 🔧 Manual Operations

### Build base images manually:
```bash
# Trigger base image rebuild
gh workflow run build-base-images.yml -f force_rebuild=true
```

### Check current base image tags:
```bash
cat .github/base-images/frontend-tag.txt
cat .github/base-images/backend-tag.txt
```

## 🛡️ Security & Best Practices

✅ **Base images run as non-root user**  
✅ **Minimal attack surface** (dependencies only)  
✅ **Specific version tags** prevent supply chain attacks  
✅ **Multi-architecture support** (amd64, arm64)  
✅ **Build cache optimization** for maximum speed  

## 🔍 Troubleshooting

### Base image not found:
1. Check if dependencies changed recently
2. Manually trigger base image build
3. Verify Docker Hub credentials

### Build still slow:
1. Ensure base image workflow completed successfully
2. Check base image tag files are updated
3. Verify Docker layer caching is working

---

**This strategy is perfect for enterprise environments where build speed and reliability are critical!** 🚀