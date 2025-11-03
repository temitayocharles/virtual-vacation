# SonarQube Setup & Code Quality Guide

## 📋 Overview

This guide shows you how to use SonarQube for comprehensive code quality and security analysis of the Virtual Vacation project.

**SonarQube Analyzes**:
- 🛡️ Security vulnerabilities and hotspots
- 📊 Code coverage and duplication
- 🔧 Technical debt and code smells
- 📈 Maintainability and reliability
- ✨ Best practices and standards

---

## 🚀 Quick Start

### Option 1: GitHub Actions (Recommended for CI/CD)

The easiest way - just push code!

```bash
# 1. Push to main/develop branch
git push origin main

# 2. Go to GitHub Actions tab
# 3. Find "SonarQube Code Quality & Security Scan" workflow
# 4. View results and download artifacts
```

**Benefits**:
- ✅ Automatic on every push
- ✅ Runs in parallel for all services
- ✅ Downloadable reports
- ✅ PR comments with summaries
- ✅ Integration with SonarCloud

### Option 2: Local SonarQube Server (For Detailed Analysis)

Set up a local SonarQube instance:

```bash
# 1. Install Docker (if not already installed)
# 2. Start SonarQube server
docker run -d --name sonarqube \
  -p 9000:9000 \
  -e sonar.jdbc.username=admin \
  -e sonar.jdbc.password=admin \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:latest

# 3. Wait for startup (2-3 minutes)
# 4. Access dashboard: http://localhost:9000

# Default credentials:
# Username: admin
# Password: admin

# 5. Generate authentication token
# Settings → Security → User Tokens

# 6. Run analysis script
export SONAR_TOKEN="your-generated-token"
./scripts/run-sonarqube-analysis.sh
```

### Option 3: SonarCloud (Recommended for Continuous Analysis)

Cloud-based SonarQube with persistent project history:

```bash
# 1. Go to https://sonarcloud.io
# 2. Sign in with GitHub
# 3. Import repository
# 4. Add SONAR_TOKEN to GitHub Secrets:
#    Settings → Secrets and variables → Actions → New repository secret
#    Name: SONAR_TOKEN
#    Value: [token from SonarCloud]
# 5. Workflow automatically uses it
```

---

## 📊 What Gets Analyzed

### 1. Security Analysis
```
Vulnerability Detection
├─ SQL Injection risks
├─ XSS vulnerabilities
├─ Authentication issues
├─ Authorization flaws
└─ Sensitive data exposure

Security Hotspots
├─ Cryptographic weaknesses
├─ Weak authentication
├─ Insecure deserialization
└─ Command injection risks

Compliance
├─ OWASP Top 10
├─ CWE (Common Weakness Enumeration)
└─ CERT Best Practices
```

### 2. Code Quality
```
Code Coverage
├─ Lines covered by tests (Target: >80%)
├─ Branch coverage
└─ Uncovered critical paths

Code Duplication
├─ Duplicated blocks detection
├─ Similar code patterns
└─ DRY principle violations

Technical Debt
├─ Estimated refactoring hours
├─ Debt ratio (Target: <5%)
└─ Interest calculation
```

### 3. Complexity Metrics
```
Cyclomatic Complexity (Target: <10 per function)
├─ Number of decision points
├─ Function size analysis
└─ Loop nesting depth

Cognitive Complexity (Target: <15 per function)
├─ Human understandability
├─ Nested structures
└─ Recursion depth

Maintainability Index
├─ Overall code health
├─ Rating A-E
└─ Historical trends
```

### 4. Code Smells
```
Possible Bugs
├─ Unreachable code
├─ Logic errors
├─ Type mismatches
└─ Null pointer risks

Anti-patterns
├─ Long methods
├─ Long parameter lists
├─ God classes
└─ Feature envy

Standards Violations
├─ Naming conventions
├─ Documentation gaps
└─ Import organization
```

### 5. Reliability & Maintainability
```
Ratings
├─ A: Excellent (0-5% debt)
├─ B: Good (5-10% debt)
├─ C: Fair (10-20% debt)
├─ D: Poor (20-50% debt)
└─ E: Very Poor (>50% debt)

Reliability Rating
├─ Bug predictions
├─ Test coverage gaps
└─ Known issue patterns

Maintainability Rating
├─ Code clarity
├─ Complexity analysis
└─ Documentation coverage
```

---

## 📥 Accessing Reports

### GitHub Actions Reports

1. **Go to Actions**:
   - Click "Actions" tab in GitHub
   - Find "SonarQube Code Quality & Security Scan"
   - Click on any completed run

2. **Download Artifacts**:
   - Scroll to "Artifacts" section
   - Download `sonarqube-reports-frontend-*`
   - Download `sonarqube-reports-backend-*`
   - Download `sonarqube-reports-media-gateway-*`

3. **Extract and View**:
   ```bash
   unzip sonarqube-reports-frontend-*.zip
   cat scan-summary.txt
   ```

### SonarCloud Dashboard

For each service:

- **Frontend**: https://sonarcloud.io/project/overview?id=virtual-vacation-frontend
- **Backend**: https://sonarcloud.io/project/overview?id=virtual-vacation-backend  
- **Media Gateway**: https://sonarcloud.io/project/overview?id=virtual-vacation-media-gateway

Dashboard Features:
- 📊 Real-time metrics
- 🔍 Issue browsing
- 📈 Historical trends
- 🎯 Quality gates
- 📋 PR analysis

---

## 🔧 Understanding Issues

### Issue Severity Levels

```
🔴 Blocker
   ├─ Show-stoppers
   ├─ Security vulnerabilities
   └─ Data loss risks
   📝 Action: Fix immediately before deployment

🔴 Critical
   ├─ Production defects
   ├─ Logic errors
   └─ Major security issues
   📝 Action: Fix before next release

🟠 Major
   ├─ Quality issues
   ├─ Performance problems
   └─ Maintainability concerns
   📝 Action: Address in sprint planning

🟡 Minor
   ├─ Code style issues
   ├─ Documentation gaps
   └─ Minor inefficiencies
   📝 Action: Fix when convenient

ℹ️ Info
   ├─ Best practice suggestions
   ├─ Informational findings
   └─ Recommendations
   📝 Action: Consider for improvements
```

### Issue Types

**Bug**: Likely error in code
- ❌ Unreachable code
- ❌ Logic errors
- ❌ Type mismatches

**Vulnerability**: Security risk
- 🔐 SQL injection
- 🔐 XSS attacks
- 🔐 Authentication issues

**Code Smell**: Quality concern
- 💨 Complex functions
- 💨 Code duplication
- 💨 Long parameter lists

**Security Hotspot**: Requires review
- 🔍 Cryptography usage
- 🔍 Authentication logic
- 🔍 Sensitive operations

---

## ✅ Fixing Issues

### Step 1: Identify the Issue

Visit SonarCloud dashboard and click on any issue to see:
- Issue description
- Code context (highlighted)
- Suggested fix
- Similar issues

### Step 2: Apply Fix Locally

```bash
# Frontend
cd frontend
npm run lint -- --fix        # Auto-fix linting issues
npm run format               # Format code with prettier

# Backend
cd ../backend
npm run lint -- --fix        # Auto-fix linting issues
npm run format               # Format code

# Media Gateway
cd ../media-gateway
pip install black pylint
black .                      # Auto-format Python
pylint **/*.py --fix-all     # Fix Python issues
```

### Step 3: Run Tests

```bash
# Frontend
cd frontend
npm run test:coverage

# Backend
cd backend
npm run test:coverage

# Media Gateway
cd ../media-gateway
pytest . --cov --cov-report=xml
```

### Step 4: Commit & Push

```bash
git add .
git commit -m "fix: resolve SonarQube issues

- Fixed security vulnerability in authentication
- Reduced cyclomatic complexity in service layer
- Improved code coverage by 5%

Related to SonarCloud: virtual-vacation-frontend"

git push origin your-branch
```

### Step 5: Verify Results

- GitHub Actions will automatically re-analyze
- SonarCloud dashboard updates in ~1-2 minutes
- PR will show updated quality metrics

---

## 🎯 Quality Gates

Default quality gates for Virtual Vacation:

| Metric | Gate | Target |
|--------|------|--------|
| **Code Coverage** | ≥ | 80% |
| **Duplicated Lines** | ≤ | 3% |
| **Technical Debt** | ≤ | 5% |
| **Reliability Rating** | ≥ | A |
| **Security Rating** | ≥ | A |
| **Maintainability Rating** | ≥ | A |
| **Blocker Issues** | = | 0 |
| **Critical Issues** | ≤ | 2 |

When a PR fails quality gates:
1. Review the issues on SonarCloud
2. Fix them locally
3. Run tests to verify
4. Push changes
5. Quality gate auto-re-evaluates

---

## 🔐 Security Settings

### Enabled Security Standards

1. **OWASP Top 10** (Web Application Security)
   - A01:2021 Broken Access Control
   - A02:2021 Cryptographic Failures
   - A03:2021 Injection
   - etc.

2. **CWE** (Common Weakness Enumeration)
   - CWE-79: Cross-site Scripting (XSS)
   - CWE-89: SQL Injection
   - CWE-94: Code Injection
   - etc.

3. **CERT** (Secure Coding Practices)
   - Secure coding practices
   - Common programming errors
   - Best practices

### Security Hotspots Review Process

When a security hotspot is found:

1. **Understand the Risk**: Read the explanation
2. **Review Code**: Examine the highlighted code
3. **Determine Status**:
   - ✅ Secure: Properly implemented
   - 🔍 To Review: Needs verification
   - ❌ Vulnerability: Security issue found
4. **Mark Status**: In SonarCloud, mark as reviewed
5. **Fix if Needed**: Apply security patch if required

---

## 📈 Monitoring & Trends

### Historical Analysis

SonarCloud maintains historical data:

- 📊 Metrics trends over time
- 🎯 Quality gate evolution
- 🐛 Issue trend analysis
- 📈 Coverage progression

### Performance Monitoring

Track these key metrics:

```
Week-over-week changes:
├─ Coverage increase/decrease
├─ New issues added
├─ Issues resolved
├─ Technical debt change
└─ Quality rating stability
```

### Setting Alerts

Configure notifications for:
- Quality gate failures
- New security vulnerabilities
- Critical issues
- Coverage drops

---

## 🚀 CI/CD Integration

### GitHub Actions

**Trigger Points**:
- ✅ On push to main/develop
- ✅ On pull requests
- ✅ Manual workflow dispatch

**Parallel Execution**:
```
sonarqube-scan (matrix strategy)
├─ Frontend analysis
├─ Backend analysis
└─ Media Gateway analysis
   ↓
   └─ comprehensive-report (depends on all)
       └─ quality-gate (final gate)
```

**Workflow Output**:
- ✅ Artifacts: Downloadable reports
- ✅ Codecov: Coverage trending
- ✅ PR Comments: Summary on PRs
- ✅ SonarCloud: Persistent dashboard

### Workflow Configuration

The workflow is configured in `.github/workflows/sonarqube-scan.yml`:

- Multi-service scanning (frontend, backend, media-gateway)
- Parallel execution for speed
- Automatic coverage report generation
- SonarCloud integration
- Artifact storage (30 days)
- PR commenting with results

---

## 🛠️ Troubleshooting

### Issue: "SonarQube scanner not found"

```bash
# macOS
brew install sonar-scanner

# Linux (Ubuntu/Debian)
sudo apt-get install sonarqube

# Manual installation
# 1. Download from https://www.sonarqube.org/downloads/
# 2. Extract and add to PATH
# 3. Verify: sonar-scanner --version
```

### Issue: "Coverage report not found"

```bash
# Frontend
cd frontend
npm run test:coverage
# Verify coverage/lcov.info exists

# Backend
cd backend
npm run test:coverage
# Verify coverage/lcov.info exists

# Media Gateway
cd media-gateway
pip install coverage
coverage run -m pytest .
coverage xml
# Verify coverage.xml exists
```

### Issue: "Authentication failed to SonarCloud"

```bash
# 1. Verify SONAR_TOKEN secret exists in GitHub
# 2. Verify token is not expired (SonarCloud Settings)
# 3. Regenerate token if needed:
#    - SonarCloud.io → Account → Security
#    - Generate new token
#    - Update GitHub secret

# 4. Check if organization is correct in workflow:
#    - Should match GitHub username/org
```

### Issue: "Quality gate failed"

Check the SonarCloud dashboard:
1. Click on the failed service
2. Review all issues
3. Filter by severity or type
4. Fix issues locally
5. Push changes to trigger re-analysis

---

## 📚 Resources

- **SonarQube Docs**: https://docs.sonarqube.org
- **SonarCloud**: https://sonarcloud.io
- **SonarScanner CLI**: https://docs.sonarqube.org/latest/analyzing-source-code/scanners/sonarscanner/
- **Quality Gates**: https://docs.sonarqube.org/latest/user-guide/quality-gates/
- **Security Standards**: https://owasp.org/Top10/

---

## ✨ Best Practices

1. **Regular Analysis**: Run on every push
2. **Fix Issues Fast**: Address blockers/critical immediately
3. **Monitor Trends**: Check metrics weekly
4. **Maintain Coverage**: Keep above 80%
5. **Review Hotspots**: Don't ignore security findings
6. **Update Dependencies**: Keep libraries current
7. **Document Changes**: Explain fixes in commits
8. **Team Review**: Discuss findings in team meetings

---

**Last Updated**: November 2, 2025

For questions or issues, refer to the SonarQube documentation or the team's engineering guidelines.
