#!/bin/bash

# ============================================================================
# 🔍 VIRTUAL VACATION - PIPELINE MONITORING DASHBOARD
# ============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

REPO_URL="https://github.com/temitayocharles/virtual-vacation"

clear
echo "============================================================================"
echo -e "${CYAN}🔍 VIRTUAL VACATION - PIPELINE MONITORING DASHBOARD${NC}"
echo "============================================================================"
echo -e "${BLUE}Repository:${NC} $REPO_URL"
echo -e "${BLUE}Monitoring:${NC} DevSecOps Pipeline Status"
echo ""

# Function to check if GitHub CLI is authenticated
check_github_auth() {
    if gh auth status >/dev/null 2>&1; then
        echo -e "${GREEN}✅ GitHub CLI authenticated${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  GitHub CLI not authenticated${NC}"
        return 1
    fi
}

# Function to get pipeline status via CLI
get_pipeline_status_cli() {
    echo -e "${BLUE}📊 RECENT WORKFLOW RUNS:${NC}"
    echo "----------------------------------------"
    
    if gh run list --repo temitayocharles/virtual-vacation --limit 10 2>/dev/null; then
        echo ""
        echo -e "${BLUE}📋 CURRENT WORKFLOW STATUS:${NC}"
        echo "----------------------------------------"
        gh run view --repo temitayocharles/virtual-vacation 2>/dev/null || echo "No active runs"
    else
        echo -e "${RED}❌ Could not fetch workflow status${NC}"
        return 1
    fi
}

# Function to show manual monitoring options
show_manual_monitoring() {
    echo -e "${BLUE}🌐 MANUAL MONITORING OPTIONS:${NC}"
    echo "----------------------------------------"
    echo ""
    echo -e "${GREEN}1. GitHub Actions Dashboard:${NC}"
    echo "   $REPO_URL/actions"
    echo ""
    echo -e "${GREEN}2. DevSecOps Pipeline Workflow:${NC}"
    echo "   $REPO_URL/actions/workflows/comprehensive-devsecops.yml"
    echo ""
    echo -e "${GREEN}3. CI/CD Pipeline Workflow:${NC}"
    echo "   $REPO_URL/actions/workflows/ci-cd.yml"
    echo ""
    echo -e "${GREEN}4. DockerHub Repository:${NC}"
    echo "   https://hub.docker.com/u/temitayocharles"
    echo ""
    echo -e "${GREEN}5. Repository Insights:${NC}"
    echo "   $REPO_URL/pulse"
    echo ""
}

# Function to show pipeline stages
show_pipeline_stages() {
    echo -e "${PURPLE}🚀 DEVSECOPS PIPELINE STAGES:${NC}"
    echo "============================================================================"
    echo ""
    echo -e "${BLUE}Stage 1: Code Quality & Security Scanning${NC}"
    echo "   🔍 GitLeaks - Secret detection and API key scanning"
    echo "   🛡️  Trivy - Vulnerability scanning for code and containers"
    echo "   📋 Checkov - Infrastructure-as-Code security analysis"
    echo "   🔬 Semgrep - Static Application Security Testing (SAST)"
    echo "   📦 OWASP Dependency Check - Dependency vulnerability scanning"
    echo ""
    echo -e "${BLUE}Stage 2: Code Analysis & Testing${NC}"
    echo "   📊 SonarQube with Maven - Code quality and security analysis"
    echo "   🧪 Frontend Testing - Vitest with React Testing Library"
    echo "   🧪 Backend Testing - Jest with Supertest for API testing"
    echo ""
    echo -e "${BLUE}Stage 3: Build & Container Security${NC}"
    echo "   🐳 Multi-platform Docker builds (AMD64 + ARM64)"
    echo "   🔒 Container security testing with Trivy"
    echo "   📦 Image optimization and layer analysis"
    echo ""  
    echo -e "${BLUE}Stage 4: Deployment & Cleanup${NC}"
    echo "   🚀 DockerHub publishing with automated tagging"
    echo "   🧹 Resource cleanup for cost optimization"
    echo "   ✅ Deployment verification"
    echo ""
}

# Function to check Docker Hub status
check_dockerhub_status() {
    echo -e "${BLUE}🐳 DOCKERHUB IMAGE STATUS:${NC}"
    echo "----------------------------------------"
    
    # Check if images exist (this is a simple check)
    echo -e "${YELLOW}Expected Images:${NC}"
    echo "   📦 temitayocharles/virtual-vacation-frontend:latest"
    echo "   📦 temitayocharles/virtual-vacation-backend:latest"
    echo ""
    echo -e "${CYAN}💡 Check manually at: https://hub.docker.com/u/temitayocharles${NC}"
    echo ""
}

# Function to show what to watch for
show_monitoring_guide() {
    echo -e "${YELLOW}👀 WHAT TO MONITOR:${NC}"
    echo "============================================================================"
    echo ""
    echo -e "${GREEN}✅ SUCCESS INDICATORS:${NC}"
    echo "   • All workflow steps show green checkmarks"
    echo "   • 'comprehensive-devsecops' workflow completes successfully"
    echo "   • Docker images appear in DockerHub registry"
    echo "   • No security vulnerabilities found"
    echo "   • All tests pass (frontend & backend)"
    echo ""
    echo -e "${RED}❌ FAILURE INDICATORS:${NC}"
    echo "   • Red X marks on workflow steps"
    echo "   • Security scans find critical vulnerabilities"
    echo "   • Docker build failures"
    echo "   • Test failures in CI/CD"
    echo "   • Missing GitHub secrets (DOCKERHUB_USERNAME, DOCKERHUB_TOKEN)"
    echo ""
    echo -e "${YELLOW}⚠️  WARNING INDICATORS:${NC}"
    echo "   • Yellow warning icons on some steps"
    echo "   • Low-severity security findings"
    echo "   • Deprecated dependency warnings"
    echo "   • Build time warnings"
    echo ""
}

# Function to show next steps based on status
show_next_steps() {
    echo -e "${CYAN}🎯 NEXT STEPS BASED ON PIPELINE STATUS:${NC}"
    echo "============================================================================"
    echo ""
    echo -e "${GREEN}If Pipeline is Running:${NC}"
    echo "   • Wait for completion (typically 10-15 minutes)"
    echo "   • Monitor for any red failures"
    echo "   • Check if GitHub secrets are configured"
    echo ""
    echo -e "${GREEN}If Pipeline Succeeds:${NC}"
    echo "   • Docker images will be available on DockerHub"
    echo "   • Deploy to your EC2/Oracle Ubuntu servers"
    echo "   • Use: docker pull temitayocharles/virtual-vacation-frontend:latest"
    echo ""
    echo -e "${RED}If Pipeline Fails:${NC}"
    echo "   • Check the failed step in GitHub Actions"
    echo "   • Verify GitHub secrets are properly set"
    echo "   • Review error logs for specific issues"
    echo "   • Fix issues and push updates to trigger new run"
    echo ""
}

# Main execution
main() {
    show_pipeline_stages
    echo ""
    
    if check_github_auth; then
        echo ""
        get_pipeline_status_cli
    else
        show_manual_monitoring
    fi
    
    echo ""
    check_dockerhub_status
    echo ""
    show_monitoring_guide
    echo ""
    show_next_steps
    
    echo "============================================================================"
    echo -e "${CYAN}🔄 LIVE MONITORING:${NC}"
    echo "   Run this script again: ./monitor-pipeline.sh"
    echo "   Or visit: $REPO_URL/actions"
    echo "============================================================================"
}

# Run monitoring
main "$@"
