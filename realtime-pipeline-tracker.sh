#!/bin/bash

# ============================================================================
# 🔍 VIRTUAL VACATION - REAL-TIME CI/CD PIPELINE TRACKER
# ============================================================================
# This script provides comprehensive real-time monitoring of the GitHub Actions
# pipeline with detailed logging, progress tracking, and automated status updates

set -e

# Color codes for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuration
REPO="temitayocharles/virtual-vacation"
LOG_FILE="pipeline-tracker.log"
STATUS_FILE="pipeline-status.json"
REFRESH_INTERVAL=30  # seconds

# Initialize log file
echo "============================================================================" > "$LOG_FILE"
echo "🚀 VIRTUAL VACATION - PIPELINE TRACKING LOG" >> "$LOG_FILE"
echo "Started: $(date)" >> "$LOG_FILE"
echo "Repository: https://github.com/$REPO" >> "$LOG_FILE"
echo "============================================================================" >> "$LOG_FILE"

# Function to log with timestamp
log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    case $level in
        "SUCCESS") echo -e "${GREEN}✅ [$timestamp] $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ [$timestamp] $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  [$timestamp] $message${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️  [$timestamp] $message${NC}" ;;
        "PROGRESS") echo -e "${CYAN}🔄 [$timestamp] $message${NC}" ;;
        *) echo "[$timestamp] $message" ;;
    esac
}

# Function to check if GitHub CLI is available
check_github_cli() {
    if command -v gh &> /dev/null; then
        if gh auth status &> /dev/null; then
            log_message "SUCCESS" "GitHub CLI authenticated and ready"
            return 0
        else
            log_message "WARNING" "GitHub CLI found but not authenticated"
            return 1
        fi
    else
        log_message "WARNING" "GitHub CLI not found"
        return 1
    fi
}

# Function to get workflow runs (with or without GitHub CLI)
get_workflow_runs() {
    if check_github_cli; then
        log_message "INFO" "Fetching workflow runs via GitHub CLI"
        gh run list --repo "$REPO" --limit 10 --json databaseId,status,conclusion,name,headBranch,createdAt,updatedAt,url 2>/dev/null || {
            log_message "ERROR" "Failed to fetch workflow runs via GitHub CLI"
            return 1
        }
    else
        log_message "INFO" "GitHub CLI not available, showing manual monitoring instructions"
        return 1
    fi
}

# Function to track specific workflow run
track_workflow_run() {
    local run_id=$1
    if check_github_cli; then
        log_message "PROGRESS" "Tracking workflow run: $run_id"
        gh run view "$run_id" --repo "$REPO" --json jobs,status,conclusion,name,createdAt,updatedAt 2>/dev/null || {
            log_message "ERROR" "Failed to fetch workflow run details"
            return 1
        }
    fi
}

# Function to create status JSON
create_status_json() {
    local status=$1
    local message=$2
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat > "$STATUS_FILE" << EOF
{
  "timestamp": "$timestamp",
  "repository": "$REPO",
  "status": "$status",
  "message": "$message",
  "monitoring": {
    "dashboard_url": "https://github.com/$REPO/actions",
    "devsecops_workflow": "https://github.com/$REPO/actions/workflows/comprehensive-devsecops.yml",
    "cicd_workflow": "https://github.com/$REPO/actions/workflows/ci-cd.yml"
  },
  "last_update": "$timestamp"
}
EOF
}

# Function to display current status
display_status() {
    clear
    echo -e "${WHITE}============================================================================${NC}"
    echo -e "${WHITE}🔍 VIRTUAL VACATION - REAL-TIME PIPELINE TRACKER${NC}"
    echo -e "${WHITE}============================================================================${NC}"
    echo -e "${BLUE}Repository:${NC} https://github.com/$REPO"
    echo -e "${BLUE}Log File:${NC} $LOG_FILE"
    echo -e "${BLUE}Status File:${NC} $STATUS_FILE"
    echo -e "${BLUE}Last Update:${NC} $(date)"
    echo ""
    
    log_message "INFO" "Fetching current pipeline status..."
    
    if get_workflow_runs > /tmp/workflow_runs.json 2>/dev/null; then
        echo -e "${GREEN}📊 RECENT WORKFLOW RUNS:${NC}"
        echo -e "${WHITE}============================================================================${NC}"
        
        # Parse and display workflow runs
        if [ -f /tmp/workflow_runs.json ]; then
            python3 -c "
import json
import sys
try:
    with open('/tmp/workflow_runs.json', 'r') as f:
        runs = json.load(f)
    
    for i, run in enumerate(runs[:5]):
        status = run.get('status', 'unknown')
        conclusion = run.get('conclusion', 'pending')
        name = run.get('name', 'Unknown Workflow')
        branch = run.get('headBranch', 'unknown')
        created = run.get('createdAt', '')
        
        # Status icon
        if conclusion == 'success':
            icon = '✅'
        elif conclusion == 'failure':
            icon = '❌'
        elif conclusion == 'cancelled':
            icon = '⏹️'
        elif status == 'in_progress':
            icon = '🔄'
        else:
            icon = '⏳'
        
        print(f'{icon} {name} ({branch}) - {status}/{conclusion}')
        if created:
            print(f'   📅 {created[:19].replace(\"T\", \" \")}')
        print()
        
except Exception as e:
    print(f'Error parsing workflow data: {e}')
" 2>/dev/null || echo "Error parsing workflow runs"
        fi
        
        create_status_json "monitoring" "Successfully retrieved workflow data"
        log_message "SUCCESS" "Retrieved and displayed workflow runs"
    else
        echo -e "${YELLOW}⚠️  MANUAL MONITORING MODE${NC}"
        echo -e "${WHITE}============================================================================${NC}"
        echo ""
        echo -e "${CYAN}📱 Manual Monitoring Links:${NC}"
        echo -e "   🌐 GitHub Actions: https://github.com/$REPO/actions"
        echo -e "   🛡️  DevSecOps Pipeline: https://github.com/$REPO/actions/workflows/comprehensive-devsecops.yml"
        echo -e "   🔧 CI/CD Pipeline: https://github.com/$REPO/actions/workflows/ci-cd.yml"
        echo -e "   🐳 DockerHub Images: https://hub.docker.com/u/temitayocharles"
        echo ""
        
        create_status_json "manual_mode" "GitHub CLI not available, using manual monitoring"
        log_message "WARNING" "Operating in manual monitoring mode"
    fi
    
    echo -e "${WHITE}============================================================================${NC}"
    echo -e "${PURPLE}🎯 PIPELINE STAGES TO MONITOR:${NC}"
    echo ""
    echo -e "${CYAN}Stage 1: Code Quality & Security${NC}"
    echo -e "   🔍 GitLeaks, 🛡️ Trivy, 📋 Checkov, 🔬 Semgrep, 📦 OWASP"
    echo ""
    echo -e "${CYAN}Stage 2: Testing & Analysis${NC}"
    echo -e "   🧪 Frontend Tests (Vitest), 🧪 Backend Tests (Jest), 📊 SonarQube"
    echo ""
    echo -e "${CYAN}Stage 3: Build & Container Security${NC}"
    echo -e "   🐳 Multi-platform Docker builds, 🔒 Container scanning"
    echo ""
    echo -e "${CYAN}Stage 4: Deployment${NC}"
    echo -e "   🚀 DockerHub publishing, 🧹 Resource cleanup"
    echo ""
    echo -e "${WHITE}============================================================================${NC}"
    
    # Show recent log entries
    echo -e "${YELLOW}📝 RECENT LOG ENTRIES:${NC}"
    echo -e "${WHITE}============================================================================${NC}"
    tail -10 "$LOG_FILE" | while read line; do
        echo -e "${WHITE}$line${NC}"
    done
    echo ""
    
    echo -e "${BLUE}🔄 Auto-refresh in ${REFRESH_INTERVAL}s... (Press Ctrl+C to stop)${NC}"
    echo -e "${WHITE}============================================================================${NC}"
}

# Function to monitor continuously
monitor_continuously() {
    log_message "INFO" "Starting continuous monitoring mode"
    
    while true; do
        display_status
        sleep $REFRESH_INTERVAL
    done
}

# Function to show help
show_help() {
    echo -e "${WHITE}🔍 Virtual Vacation Pipeline Tracker${NC}"
    echo ""
    echo -e "${CYAN}Usage:${NC}"
    echo "  $0 [command]"
    echo ""
    echo -e "${CYAN}Commands:${NC}"
    echo "  monitor     Start continuous monitoring (default)"
    echo "  status      Show current status once"
    echo "  logs        Show recent log entries"
    echo "  runs        List recent workflow runs"
    echo "  help        Show this help message"
    echo ""
    echo -e "${CYAN}Files:${NC}"
    echo "  $LOG_FILE     - Detailed tracking log"
    echo "  $STATUS_FILE  - Current status in JSON format"
    echo ""
    echo -e "${CYAN}Environment:${NC}"
    echo "  GitHub CLI authentication recommended for full functionality"
    echo "  Fallback to manual monitoring if GitHub CLI unavailable"
}

# Main execution
case "${1:-monitor}" in
    "monitor")
        log_message "INFO" "Starting real-time pipeline monitoring"
        monitor_continuously
        ;;
    "status")
        display_status
        ;;
    "logs")
        echo -e "${YELLOW}📝 PIPELINE TRACKING LOG:${NC}"
        echo -e "${WHITE}============================================================================${NC}"
        cat "$LOG_FILE"
        ;;
    "runs")
        if get_workflow_runs; then
            echo "Recent workflow runs retrieved successfully"
        else
            echo "Could not retrieve workflow runs - check GitHub CLI authentication"
        fi
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
