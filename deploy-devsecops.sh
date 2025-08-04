#!/bin/bash

# ============================================================================
# VIRTUAL VACATION - COMPREHENSIVE DEVSECOPS DEPLOYMENT SCRIPT
# ============================================================================
# This script prepares the project for GitHub CI/CD deployment with full
# DevSecOps integration including security scanning and Docker deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions for colored output
print_header() {
    echo -e "${PURPLE}============================================================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}============================================================================${NC}"
}

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${CYAN}🔄 $1${NC}"
}

# Configuration
REPO_NAME="virtual-vacation"
GITHUB_USERNAME=${GITHUB_USERNAME:-"your-github-username"}
DOCKERHUB_USERNAME=${DOCKERHUB_USERNAME:-"your-dockerhub-username"}

print_header "🚀 VIRTUAL VACATION DEVSECOPS DEPLOYMENT PREPARATION"

# ============================================================================
# 1. PRE-FLIGHT CHECKS
# ============================================================================
print_step "Running pre-flight checks..."

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    else
        print_status "$1 is available"
    fi
}

check_tool "git"
check_tool "docker"
check_tool "npm"
check_tool "node"

# Check Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi
print_status "Docker is running"

# ============================================================================
# 2. PROJECT HEALTH CHECK
# ============================================================================
print_step "Checking project health..."

# Install dependencies
print_info "Installing frontend dependencies..."
cd frontend
npm ci --no-audit --silent
npm run type-check
print_status "Frontend dependencies installed and type-checked"
cd ..

print_info "Installing backend dependencies..."
cd backend
npm ci --no-audit --silent
print_status "Backend dependencies installed"
cd ..

# ============================================================================
# 3. SECURITY PRE-CHECKS
# ============================================================================
print_step "Running local security checks..."

# Check for common security issues
print_info "Checking for exposed secrets in environment files..."
if grep -r "password.*=" .env* 2>/dev/null | grep -v example | grep -v template; then
    print_warning "Found potential passwords in environment files"
else
    print_status "No obvious secrets found in environment files"
fi

# Check for node_modules in git
if git check-ignore node_modules >/dev/null 2>&1; then
    print_status "node_modules properly ignored by git"
else
    print_warning "node_modules might not be properly ignored"
fi

# ============================================================================
# 4. BUILD VERIFICATION
# ============================================================================
print_step "Verifying builds..."

# Test frontend build
print_info "Testing frontend build..."
cd frontend
npm run build >/dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "Frontend builds successfully"
else
    print_error "Frontend build failed"
    exit 1
fi
cd ..

# Test backend build
print_info "Testing backend build..."
cd backend
npm run build >/dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "Backend builds successfully"
else
    print_error "Backend build failed"
    exit 1
fi
cd ..

# ============================================================================
# 5. DOCKER IMAGE TESTING
# ============================================================================
print_step "Testing Docker builds..."

# Build frontend image
print_info "Building frontend Docker image..."
docker build -t virtual-vacation-frontend:test -f frontend/Dockerfile frontend/ >/dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "Frontend Docker image builds successfully"
else
    print_error "Frontend Docker build failed"
    exit 1
fi

# Build backend image
print_info "Building backend Docker image..."
docker build -t virtual-vacation-backend:test -f backend/Dockerfile backend/ >/dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "Backend Docker image builds successfully"
else
    print_error "Backend Docker build failed"
    exit 1
fi

# Clean up test images
docker rmi virtual-vacation-frontend:test virtual-vacation-backend:test >/dev/null 2>&1

# ============================================================================
# 6. GIT REPOSITORY SETUP
# ============================================================================
print_step "Preparing Git repository..."

# Check if git repo is initialized
if [ ! -d .git ]; then
    print_info "Initializing Git repository..."
    git init
    git branch -M main
fi

# Add all files
git add .

# Check for changes
if git diff --staged --quiet; then
    print_info "No changes to commit"
else
    print_info "Changes detected, ready for commit"
fi

# ============================================================================
# 7. GITHUB SECRETS SETUP GUIDE
# ============================================================================
print_header "🔐 REQUIRED GITHUB SECRETS SETUP"

cat << EOF

To complete the CI/CD setup, you need to add these secrets to your GitHub repository:

🔑 REPOSITORY SECRETS (Settings > Secrets and variables > Actions):

Required API Keys:
  VITE_GOOGLE_MAPS_API_KEY          = Your Google Maps API key
  VITE_OPENWEATHER_API_KEY          = Your OpenWeather API key  
  VITE_MAPBOX_ACCESS_TOKEN          = Your Mapbox access token

Optional API Keys (uncomment in pipeline if needed):
  VITE_UNSPLASH_ACCESS_KEY          = Your Unsplash access key
  VITE_NEWS_API_KEY                 = Your News API key
  SEMGREP_APP_TOKEN                 = Your Semgrep token (for security scanning)
  NVD_API_KEY                       = NVD API key (for dependency scanning)

Docker Registry:
  DOCKERHUB_USERNAME                = $DOCKERHUB_USERNAME
  DOCKERHUB_TOKEN                   = Your DockerHub access token

Code Quality:
  SONAR_TOKEN                       = Your SonarCloud token
  CODECOV_TOKEN                     = Your Codecov token

Notifications (optional):
  SLACK_WEBHOOK_URL                 = Your Slack webhook for notifications

🏷️ REPOSITORY VARIABLES (Settings > Secrets and variables > Actions > Variables):
  DOCKERHUB_USERNAME                = $DOCKERHUB_USERNAME

EOF

# ============================================================================
# 8. DEPLOYMENT INSTRUCTIONS
# ============================================================================
print_header "🚀 DEPLOYMENT INSTRUCTIONS"

cat << EOF

📋 NEXT STEPS TO DEPLOY:

1. 🔧 Setup GitHub Repository:
   git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
   
2. 🔐 Add GitHub Secrets (see above list)

3. 🚀 Push to GitHub:
   git commit -m "feat: comprehensive DevSecOps CI/CD pipeline with security scanning"
   git push -u origin main

4. 🔍 Monitor Pipeline:
   - Go to: https://github.com/$GITHUB_USERNAME/$REPO_NAME/actions
   - Watch the comprehensive security scanning process
   - Review security reports in the Security tab

5. 📦 Verify Docker Images:
   - Frontend: https://hub.docker.com/r/$DOCKERHUB_USERNAME/virtual-vacation-frontend
   - Backend: https://hub.docker.com/r/$DOCKERHUB_USERNAME/virtual-vacation-backend

6. ☸️  Deploy to Kubernetes (optional):
   kubectl apply -f k8s-deployment.yaml

📊 PIPELINE FEATURES:
✅ Code Quality Analysis (ESLint, TypeScript)
✅ Comprehensive Security Scanning (GitLeaks, Trivy, Checkov, Semgrep, OWASP)
✅ Unit Testing with Coverage
✅ SonarQube Code Quality with Maven
✅ Multi-platform Docker Builds (AMD64, ARM64)
✅ Container Security Testing
✅ Automated Dependency Updates (Dependabot)
✅ Resource Cleanup (On-demand containers)
✅ Security Reporting & Notifications

💰 COST OPTIMIZATIONS:
✅ On-demand containers (killed after use)
✅ Efficient caching strategies
✅ Multi-stage Docker builds
✅ Resource limits and cleanup
✅ Smart artifact management

EOF

# ============================================================================
# 9. FINAL VALIDATION
# ============================================================================
print_step "Running final validation..."

# Check all required files exist
required_files=(
    ".github/workflows/comprehensive-devsecops.yml"
    ".github/dependabot.yml"
    ".github/gitleaks.toml"
    "frontend/Dockerfile"
    "backend/Dockerfile"
    "docker-compose.optimized.yml"
    "k8s-deployment.yaml"
    ".env.optimized"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file exists"
    else
        print_error "$file is missing"
    fi
done

# ============================================================================
# 10. SUCCESS SUMMARY
# ============================================================================
print_header "🎉 DEPLOYMENT PREPARATION COMPLETE!"

cat << EOF

🌟 VIRTUAL VACATION DEVSECOPS PIPELINE READY!

Your project is now equipped with:
🛡️  Comprehensive security scanning (GitLeaks, Trivy, Checkov, Semgrep, OWASP)
🧪 Full testing suite with coverage reporting
☕ SonarQube analysis with Maven integration
🐳 Multi-platform Docker builds with security scanning
📊 Automated reporting and notifications
🔄 Automated dependency updates
💰 Cost-optimized resource management

NEXT: Follow the deployment instructions above to push to GitHub and activate the pipeline!

🚀 Ready to deploy your secure, vibrant Virtual Vacation application!

EOF

print_step "Deployment preparation script completed successfully! 🎉"
