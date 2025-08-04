#!/bin/bash

# ============================================================================
# 📊 SIMPLIFIED PIPELINE STATUS LOGGER FOR AI ASSISTANT TRACKING
# ============================================================================
# This creates easily parseable status updates for AI assistant monitoring

LOG_FILE="ai-pipeline-status.log"
REPO="temitayocharles/virtual-vacation"

# Initialize with clear format
cat > "$LOG_FILE" << EOF
VIRTUAL_VACATION_PIPELINE_STATUS_LOG
====================================
Repository: $REPO
Started: $(date)
====================================

EOF

# Function to log status in AI-readable format
log_status() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local status=$1
    local stage=$2
    local details=$3
    
    echo "[$timestamp] STATUS=$status STAGE=$stage DETAILS=$details" >> "$LOG_FILE"
    echo "🤖 AI_TRACKABLE: [$timestamp] $status | $stage | $details"
}

# Check current git status
log_status "INFO" "GIT_STATUS" "Checking repository state"
cd "/Users/charlie/Documents/Virtual Vacation"

# Get latest commit
LATEST_COMMIT=$(git log -1 --format="%h %s" 2>/dev/null || echo "unknown")
log_status "INFO" "LATEST_COMMIT" "$LATEST_COMMIT"

# Check if GitHub CLI is available
if command -v gh &> /dev/null && gh auth status &> /dev/null 2>&1; then
    log_status "SUCCESS" "GITHUB_CLI" "Authenticated and ready"
    
    # Get workflow runs
    if gh run list --repo "$REPO" --limit 5 --json status,conclusion,name,createdAt > /tmp/workflow_status.json 2>/dev/null; then
        log_status "SUCCESS" "WORKFLOW_FETCH" "Retrieved workflow runs"
        
        # Parse workflow status
        python3 -c "
import json
import sys

try:
    with open('/tmp/workflow_status.json', 'r') as f:
        runs = json.load(f)
    
    for run in runs[:3]:
        name = run.get('name', 'Unknown')
        status = run.get('status', 'unknown')
        conclusion = run.get('conclusion', 'pending')
        created = run.get('createdAt', '')[:19]
        
        overall_status = conclusion if conclusion else status
        print(f'WORKFLOW_STATUS={overall_status} NAME={name} CREATED={created}')
        
except Exception as e:
    print(f'WORKFLOW_PARSE_ERROR={e}')
" >> "$LOG_FILE" 2>/dev/null
    else
        log_status "ERROR" "WORKFLOW_FETCH" "Failed to retrieve workflow runs"
    fi
else
    log_status "WARNING" "GITHUB_CLI" "Not available or not authenticated"
fi

# Check file status
log_status "INFO" "TEST_FILES" "Frontend: $(find frontend/src -name '*.test.*' | wc -l | tr -d ' ') Backend: $(find backend/src -name '*.test.*' | wc -l | tr -d ' ')"

# Show the current status
echo ""
echo "🤖 CURRENT PIPELINE STATUS (AI Trackable):"
echo "=================================================="
tail -20 "$LOG_FILE" | grep -E "(STATUS=|WORKFLOW_STATUS=)" | tail -10
echo "=================================================="
echo ""
echo "📁 Full log available at: $LOG_FILE"
echo "🔗 Monitor at: https://github.com/$REPO/actions"
