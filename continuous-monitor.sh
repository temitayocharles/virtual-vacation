#!/bin/bash

# ============================================================================
# 🔄 VIRTUAL VACATION - CONTINUOUS PIPELINE MONITORING
# ============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

REPO_URL="https://github.com/temitayocharles/virtual-vacation"
CHECK_INTERVAL=30  # seconds

echo "============================================================================"
echo -e "${CYAN}🔄 CONTINUOUS MONITORING: Virtual Vacation Pipeline${NC}"
echo "============================================================================"
echo -e "${BLUE}Repository:${NC} $REPO_URL"
echo -e "${BLUE}Refresh Rate:${NC} Every $CHECK_INTERVAL seconds"
echo -e "${YELLOW}Press Ctrl+C to stop monitoring${NC}"
echo ""

# Function to check pipeline status
check_pipeline_status() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "----------------------------------------"
    echo -e "${CYAN}⏰ Last Check: $timestamp${NC}"
    echo "----------------------------------------"
    
    # Try to get status via GitHub CLI if authenticated
    if gh auth status >/dev/null 2>&1; then
        echo -e "${GREEN}📊 GitHub Actions Status:${NC}"
        if gh run list --repo temitayocharles/virtual-vacation --limit 3 2>/dev/null; then
            echo ""
            echo -e "${BLUE}Latest Run Details:${NC}"
            gh run view --repo temitayocharles/virtual-vacation 2>/dev/null || echo "No active runs found"
        else
            echo -e "${RED}❌ Could not fetch workflow status${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Manual Check Required:${NC}"
        echo "   Visit: $REPO_URL/actions"
    fi
    
    echo ""
    echo -e "${BLUE}🔍 Quick Status Check:${NC}"
    echo "   1. GitHub Actions: $REPO_URL/actions"
    echo "   2. DockerHub: https://hub.docker.com/u/temitayocharles"
    echo "   3. Expected Images:"
    echo "      - temitayocharles/virtual-vacation-frontend:latest"
    echo "      - temitayocharles/virtual-vacation-backend:latest"
    echo ""
}

# Function to show current monitoring status
show_monitoring_tips() {
    echo -e "${CYAN}💡 MONITORING TIPS:${NC}"
    echo "----------------------------------------"
    echo -e "${GREEN}✅ Look for these SUCCESS signs:${NC}"
    echo "   • Green checkmarks on all workflow steps"
    echo "   • 'comprehensive-devsecops' workflow completed"
    echo "   • Docker images published to DockerHub"
    echo ""
    echo -e "${RED}❌ Watch for these FAILURE signs:${NC}"
    echo "   • Red X marks on workflow steps"
    echo "   • 'DOCKERHUB_USERNAME' or 'DOCKERHUB_TOKEN' secret missing"
    echo "   • Security scan failures"
    echo "   • Docker build errors"
    echo ""
    echo -e "${YELLOW}⚠️  WARNINGS to note:${NC}"
    echo "   • Yellow caution icons (non-critical issues)"
    echo "   • Dependency update notifications"
    echo "   • Performance optimization suggestions"
    echo ""
}

# Function for interactive monitoring
interactive_monitoring() {
    echo -e "${BLUE}🎮 INTERACTIVE MONITORING MODE${NC}"
    echo "----------------------------------------"
    echo "Commands:"
    echo "  [Enter] - Refresh status"
    echo "  'o' - Open GitHub Actions in browser"
    echo "  'd' - Open DockerHub in browser"
    echo "  'q' - Quit monitoring"
    echo ""
    
    while true; do
        read -p "Press Enter to refresh, or command: " cmd
        
        case $cmd in
            "q"|"quit"|"exit")
                echo -e "${GREEN}👋 Monitoring stopped. Happy deploying!${NC}"
                exit 0
                ;;
            "o"|"open")
                echo -e "${BLUE}🌐 Opening GitHub Actions...${NC}"
                open "$REPO_URL/actions" 2>/dev/null || echo "Could not open browser"
                ;;
            "d"|"docker")
                echo -e "${BLUE}🐳 Opening DockerHub...${NC}"
                open "https://hub.docker.com/u/temitayocharles" 2>/dev/null || echo "Could not open browser"
                ;;
            "")
                clear
                check_pipeline_status
                ;;
            *)
                echo -e "${YELLOW}Unknown command: $cmd${NC}"
                ;;
        esac
    done
}

# Main execution
main() {
    show_monitoring_tips
    
    if [[ "${1:-}" == "--interactive" ]] || [[ "${1:-}" == "-i" ]]; then
        interactive_monitoring
    else
        # Continuous monitoring mode
        while true; do
            clear
            echo "============================================================================"
            echo -e "${CYAN}🔄 CONTINUOUS MONITORING: Virtual Vacation Pipeline${NC}"
            echo "============================================================================"
            
            check_pipeline_status
            show_monitoring_tips
            
            echo -e "${YELLOW}🔄 Next refresh in $CHECK_INTERVAL seconds... (Ctrl+C to stop)${NC}"
            
            # Countdown with early exit on Ctrl+C
            for ((i=CHECK_INTERVAL; i>0; i--)); do
                printf "\rRefreshing in %2d seconds..." $i
                sleep 1
            done
            echo ""
        done
    fi
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${GREEN}👋 Monitoring stopped. Check your pipeline at: $REPO_URL/actions${NC}"; exit 0' INT

# Check command line arguments
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    echo "Usage:"
    echo "  ./continuous-monitor.sh              # Continuous auto-refresh mode"
    echo "  ./continuous-monitor.sh -i           # Interactive mode"
    echo "  ./continuous-monitor.sh --help       # Show this help"
    exit 0
fi

# Run main function
main "$@"
