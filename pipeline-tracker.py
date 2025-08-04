#!/usr/bin/env python3

"""
🚀 Virtual Vacation Pipeline Event Logger
=========================================
Real-time pipeline tracking system that creates structured logs
for easy AI assistant monitoring and human readability.
"""

import json
import datetime
import subprocess
import sys
import os
import time
from pathlib import Path

class PipelineTracker:
    def __init__(self):
        self.repo = "temitayocharles/virtual-vacation"
        self.log_file = Path("pipeline-events.json")
        self.status_file = Path("current-pipeline-status.json")
        self.initialize_logs()
    
    def initialize_logs(self):
        """Initialize log files with proper structure"""
        initial_data = {
            "repository": self.repo,
            "tracking_started": datetime.datetime.utcnow().isoformat(),
            "events": []
        }
        
        with open(self.log_file, 'w') as f:
            json.dump(initial_data, f, indent=2)
        
        self.log_event("TRACKER_INITIALIZED", "Pipeline tracking system started")
    
    def log_event(self, event_type, message, details=None):
        """Log a pipeline event with timestamp and structured data"""
        event = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "type": event_type,
            "message": message,
            "details": details or {}
        }
        
        # Read existing log
        try:
            with open(self.log_file, 'r') as f:
                log_data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            log_data = {"repository": self.repo, "events": []}
        
        # Add new event
        log_data["events"].append(event)
        
        # Keep only last 100 events to prevent file bloat
        if len(log_data["events"]) > 100:
            log_data["events"] = log_data["events"][-100:]
        
        # Write back to file
        with open(self.log_file, 'w') as f:
            json.dump(log_data, f, indent=2)
        
        # Update current status
        self.update_current_status(event_type, message, details)
        
        # Print to console with emoji
        emoji_map = {
            "SUCCESS": "✅",
            "ERROR": "❌", 
            "WARNING": "⚠️",
            "INFO": "ℹ️",
            "PROGRESS": "🔄",
            "WORKFLOW_STARTED": "🚀",
            "WORKFLOW_COMPLETED": "🎉",
            "TEST_PASSED": "🧪",
            "BUILD_SUCCESS": "🏗️",
            "DEPLOY_SUCCESS": "🚢"
        }
        
        emoji = emoji_map.get(event_type, "📝")
        timestamp = datetime.datetime.utcnow().strftime("%H:%M:%S")
        print(f"{emoji} [{timestamp}] {event_type}: {message}")
        
        if details:
            for key, value in details.items():
                print(f"   📋 {key}: {value}")
    
    def update_current_status(self, event_type, message, details):
        """Update the current pipeline status file"""
        status = {
            "last_update": datetime.datetime.utcnow().isoformat(),
            "repository": self.repo,
            "current_event": {
                "type": event_type,
                "message": message,
                "details": details
            },
            "monitoring_urls": {
                "actions": f"https://github.com/{self.repo}/actions",
                "devsecops": f"https://github.com/{self.repo}/actions/workflows/comprehensive-devsecops.yml",
                "cicd": f"https://github.com/{self.repo}/actions/workflows/ci-cd.yml"
            }
        }
        
        with open(self.status_file, 'w') as f:
            json.dump(status, f, indent=2)
    
    def check_github_cli(self):
        """Check if GitHub CLI is available and authenticated"""
        try:
            result = subprocess.run(['gh', 'auth', 'status'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                self.log_event("SUCCESS", "GitHub CLI authenticated")
                return True
            else:
                self.log_event("WARNING", "GitHub CLI not authenticated")
                return False
        except (subprocess.TimeoutExpired, FileNotFoundError):
            self.log_event("WARNING", "GitHub CLI not available")
            return False
    
    def get_workflow_status(self):
        """Fetch current workflow status"""
        if not self.check_github_cli():
            return None
        
        try:
            cmd = ['gh', 'run', 'list', '--repo', self.repo, '--limit', '5', '--json', 
                   'databaseId,status,conclusion,name,headBranch,createdAt,url']
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                runs = json.loads(result.stdout)
                self.log_event("SUCCESS", f"Retrieved {len(runs)} workflow runs")
                
                for run in runs[:3]:
                    run_details = {
                        "name": run.get("name", "Unknown"),
                        "status": run.get("status", "unknown"),
                        "conclusion": run.get("conclusion"),
                        "branch": run.get("headBranch", "unknown"),
                        "url": run.get("url", "")
                    }
                    
                    overall_status = run_details["conclusion"] or run_details["status"]
                    self.log_event("WORKFLOW_STATUS", 
                                 f"{run_details['name']} - {overall_status}", 
                                 run_details)
                
                return runs
            else:
                self.log_event("ERROR", "Failed to fetch workflow runs", 
                             {"error": result.stderr})
                return None
                
        except subprocess.TimeoutExpired:
            self.log_event("ERROR", "Timeout fetching workflow status")
            return None
        except json.JSONDecodeError:
            self.log_event("ERROR", "Failed to parse workflow data")
            return None
    
    def check_test_files(self):
        """Check test file status"""
        try:
            frontend_tests = len(list(Path("frontend/src").rglob("*.test.*")))
            backend_tests = len(list(Path("backend/src").rglob("*.test.*")))
            
            self.log_event("INFO", "Test file count", {
                "frontend_tests": frontend_tests,
                "backend_tests": backend_tests,
                "total_tests": frontend_tests + backend_tests
            })
            
            return frontend_tests + backend_tests > 0
            
        except Exception as e:
            self.log_event("ERROR", "Failed to count test files", {"error": str(e)})
            return False
    
    def get_latest_commit(self):
        """Get latest commit information"""
        try:
            result = subprocess.run(['git', 'log', '-1', '--format=%h %s'], 
                                  capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                commit_info = result.stdout.strip()
                self.log_event("INFO", "Latest commit", {"commit": commit_info})
                return commit_info
            else:
                self.log_event("WARNING", "Could not get commit info")
                return None
                
        except subprocess.TimeoutExpired:
            self.log_event("ERROR", "Timeout getting commit info")
            return None
    
    def run_status_check(self):
        """Run a complete status check"""
        self.log_event("PROGRESS", "Starting comprehensive status check")
        
        # Check git status
        self.get_latest_commit()
        
        # Check test files
        has_tests = self.check_test_files()
        if has_tests:
            self.log_event("SUCCESS", "Test files found")
        else:
            self.log_event("WARNING", "No test files found")
        
        # Check workflow status
        workflows = self.get_workflow_status()
        
        if workflows:
            active_runs = [w for w in workflows if w.get("status") == "in_progress"]
            if active_runs:
                self.log_event("PROGRESS", f"{len(active_runs)} workflows currently running")
            else:
                self.log_event("INFO", "No workflows currently running")
        
        self.log_event("SUCCESS", "Status check completed")
        
        return {
            "has_tests": has_tests,
            "workflows": workflows,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
    
    def show_current_status(self):
        """Display current status in a readable format"""
        print("\n" + "="*60)
        print("🔍 VIRTUAL VACATION PIPELINE STATUS")
        print("="*60)
        
        # Show current status
        if self.status_file.exists():
            with open(self.status_file, 'r') as f:
                status = json.load(f)
            
            print(f"📅 Last Update: {status['last_update'][:19].replace('T', ' ')}")
            print(f"🎯 Current Event: {status['current_event']['type']}")
            print(f"📝 Message: {status['current_event']['message']}")
            
            if status['current_event']['details']:
                print("📋 Details:")
                for key, value in status['current_event']['details'].items():
                    print(f"   • {key}: {value}")
        
        print("\n🔗 Monitoring URLs:")
        print(f"   • Actions: https://github.com/{self.repo}/actions")
        print(f"   • DevSecOps: https://github.com/{self.repo}/actions/workflows/comprehensive-devsecops.yml")
        print(f"   • CI/CD: https://github.com/{self.repo}/actions/workflows/ci-cd.yml")
        
        # Show recent events
        if self.log_file.exists():
            with open(self.log_file, 'r') as f:
                log_data = json.load(f)
            
            print(f"\n📝 Recent Events (last 5):")
            for event in log_data["events"][-5:]:
                timestamp = event["timestamp"][:19].replace('T', ' ')
                print(f"   [{timestamp}] {event['type']}: {event['message']}")
        
        print("="*60)

def main():
    tracker = PipelineTracker()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "check":
            tracker.run_status_check()
        elif command == "status":
            tracker.show_current_status()
        elif command == "monitor":
            print("🔄 Starting continuous monitoring (Ctrl+C to stop)...")
            try:
                while True:
                    tracker.run_status_check()
                    time.sleep(60)  # Check every minute
            except KeyboardInterrupt:
                tracker.log_event("INFO", "Monitoring stopped by user")
                print("\n✅ Monitoring stopped")
        else:
            print("Usage: python3 pipeline-tracker.py [check|status|monitor]")
    else:
        # Default: run status check
        tracker.run_status_check()
        tracker.show_current_status()

if __name__ == "__main__":
    main()
