#!/bin/bash

# ============================================================================
# 🚀 VIRTUAL VACATION - GITHUB REPOSITORY SETUP & DEPLOYMENT
# ============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "============================================================================"
echo "🚀 VIRTUAL VACATION - GITHUB SETUP & DEPLOYMENT"
echo "============================================================================"
echo ""

# Get repository name from user
REPO_NAME=${1:-"virtual-vacation"}
GITHUB_USERNAME=${2:-""}

if [[ -z "$GITHUB_USERNAME" ]]; then
    echo -e "${YELLOW}Please provide your GitHub username:${NC}"
    read -p "GitHub Username: " GITHUB_USERNAME
fi

echo -e "${BLUE}Repository: ${GITHUB_USERNAME}/${REPO_NAME}${NC}"
echo ""

# Check if already authenticated
if gh auth status >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Already authenticated with GitHub${NC}"
    
    # Create repository
    echo -e "${BLUE}Creating GitHub repository...${NC}"
    if gh repo create "$REPO_NAME" --public --description "🌍 Virtual Vacation - Immersive Travel Experience with Comprehensive DevSecOps Pipeline" --clone=false; then
        echo -e "${GREEN}✅ Repository created successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Repository might already exist, continuing...${NC}"
    fi
    
    # Set remote and push
    git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git" 2>/dev/null || git remote set-url origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
    
    echo -e "${BLUE}Pushing to GitHub...${NC}"
    git push -u origin main
    
    echo -e "${GREEN}🎉 SUCCESSFULLY PUSHED TO GITHUB!${NC}"
    echo ""
    echo -e "${BLUE}📋 NEXT STEPS - CONFIGURE GITHUB SECRETS:${NC}"
    echo "1. Go to: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/settings/secrets/actions"
    echo "2. Add these secrets:"
    echo "   - DOCKERHUB_USERNAME: Your DockerHub username"
    echo "   - DOCKERHUB_TOKEN: Your DockerHub access token"
    echo "   - SONAR_TOKEN: Your SonarCloud token (optional)"
    echo ""
    echo -e "${GREEN}🚀 THE DEVSECOPS PIPELINE WILL AUTOMATICALLY:${NC}"
    echo "   ✅ Scan for secrets with GitLeaks"
    echo "   ✅ Check vulnerabilities with Trivy"
    echo "   ✅ Analyze infrastructure with Checkov"
    echo "   ✅ Run static analysis with Semgrep"
    echo "   ✅ Check dependencies with OWASP"
    echo "   ✅ Analyze code quality with SonarQube + Maven"
    echo "   ✅ Build multi-platform Docker images"
    echo "   ✅ Push to DockerHub"
    echo "   ✅ Clean up resources automatically"
    
else
    echo -e "${YELLOW}⚠️  GitHub CLI not authenticated${NC}"
    echo ""
    echo -e "${BLUE}OPTION 1 - Authenticate with GitHub CLI:${NC}"
    echo "   gh auth login"
    echo "   Then run: ./github-setup.sh"
    echo ""
    echo -e "${BLUE}OPTION 2 - Manual Setup:${NC}"
    echo "1. Create repository manually at: https://github.com/new"
    echo "   - Repository name: $REPO_NAME"
    echo "   - Description: 🌍 Virtual Vacation - Immersive Travel Experience with DevSecOps"
    echo "   - Public repository"
    echo ""
    echo "2. Add remote and push:"
    echo "   git remote add origin https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "3. Configure GitHub Secrets:"
    echo "   - Go to repository Settings > Secrets and variables > Actions"
    echo "   - Add DOCKERHUB_USERNAME and DOCKERHUB_TOKEN"
    echo ""
    echo -e "${GREEN}The DevSecOps pipeline will start automatically on push!${NC}"
fi

echo ""
echo "============================================================================"
echo -e "${GREEN}🎯 PRODUCTION DEPLOYMENT READY!${NC}"
echo "Your Virtual Vacation app is ready for EC2/Oracle Ubuntu deployment!"
echo "============================================================================"
