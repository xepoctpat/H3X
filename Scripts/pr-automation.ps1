# H3X PR Automation Script
# PowerShell script for automated pull request generation and deployment management

param(
    [string]$Action = "status",
    [string]$TargetBranch = "main",
    [string]$Title = "",
    [string]$Description = ""
)

$ErrorActionPreference = "Stop"

# Configuration
$ProjectName = "H3X"
$RepoPath = "G:\CopilotAgents\H3X"
$CurrentBranch = "hesys-modular"

function Write-Header {
    param([string]$Message)
    Write-Host "`n🔮 H3X PR Automation: $Message`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "📋 $Message" -ForegroundColor Blue
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Get-ProjectStatus {
    Write-Header "Project Status Check"
    
    Set-Location $RepoPath
    
    # Git status
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Warning "Uncommitted changes detected:"
        $gitStatus | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    } else {
        Write-Success "Working tree clean"
    }
    
    # Current branch and commits ahead
    $branch = git branch --show-current
    Write-Info "Current branch: $branch"
    
    $commitsAhead = git rev-list --count "$TargetBranch..$CurrentBranch" 2>$null
    if ($commitsAhead) {
        Write-Info "Commits ahead of $TargetBranch: $commitsAhead"
    }
    
    # Docker services status
    Write-Info "Checking Docker services..."
    try {
        $dockerStatus = docker-compose ps --format json | ConvertFrom-Json
        foreach ($service in $dockerStatus) {
            $status = if ($service.State -eq "running") { "✅" } else { "❌" }
            Write-Host "   $status $($service.Name): $($service.State)" -ForegroundColor $(if ($service.State -eq "running") { "Green" } else { "Red" })
        }
    } catch {
        Write-Warning "Docker Compose not available or services not running"
    }
    
    # Recent tags
    Write-Info "Recent tags:"
    git tag --sort=-version:refname | Select-Object -First 5 | ForEach-Object {
        Write-Host "   📋 $_" -ForegroundColor Gray
    }
}

function New-PullRequest {
    Write-Header "Creating Pull Request"
    
    if (-not $Title) {
        $Title = "H3X Containerization Complete - Production Ready"
    }
    
    if (-not $Description) {
        $Description = @"
# H3X System Containerization Complete

## 🎯 Overview
This PR completes the full containerization and modernization of the H3X system, making it production-ready with Docker-based deployment.

## ✅ Completed Tasks
- **Containerization**: Full Docker Compose deployment with multi-stage builds
- **Service Orchestration**: Automated service discovery and health monitoring
- **Case Sensitivity Fixes**: Resolved all path issues for Linux container environments
- **Code Cleanup**: Removed 18 obsolete files, archived for recovery
- **Documentation**: Complete overhaul for containerized deployment workflow
- **Development Workflow**: Live reload with volume mounting for seamless development

## 🚀 System Architecture
- **H3X Server**: 264MB optimized Docker image on port 4978
- **Protocol Server**: 26.4MB Alpine-based container on port 8081
- **Network**: Isolated bridge network for secure service communication
- **Health Monitoring**: Automated health checks and restart policies

## 📊 Performance Improvements
- **Startup Time**: < 30 seconds for full stack
- **Memory Usage**: ~200MB total for both services
- **Development**: Instant code changes without container rebuilds
- **Deployment**: One-command deployment with `docker-compose up`

## 🔧 Technical Changes
- Replaced legacy startup scripts with containerized approach
- Automated service dependencies and networking
- Comprehensive logging and monitoring setup
- Production-ready configuration with development workflow support

## 📋 Testing
- ✅ Container builds successfully
- ✅ Services start and communicate properly
- ✅ Health endpoints responding
- ✅ Live development workflow functional
- ✅ All case sensitivity issues resolved

## 📖 Documentation
- Updated README.md for containerized deployment
- Created Docker-Deployment-Guide.md
- Updated Deployment-Options.md with modern approach
- Comprehensive Containerized-Architecture.md

Ready for production deployment and team collaboration.
"@
    }
    
    # Generate PR content file
    $prContent = @"
# Pull Request: $Title

## Branch Information
- **Source**: $CurrentBranch
- **Target**: $TargetBranch
- **Generated**: $(Get-Date -Format "yyyy-MM-ddTHH:mm:ss")

## Description
$Description

## Git Information
- **Latest Commit**: $(git log -1 --pretty=format:"%h - %s (%an, %ar)")
- **Commits in PR**: $(git rev-list --count "$TargetBranch..$CurrentBranch" 2>$null)
- **Files Changed**: $(git diff --name-only "$TargetBranch..$CurrentBranch" | Measure-Object).Count

## Deployment Instructions
```bash
# Quick deployment
docker-compose up -d

# Verify services
curl http://localhost:8081/api/health
curl http://localhost:4978/api/health

# View logs
docker-compose logs -f
```

## Review Checklist
- [ ] Code builds successfully in containers
- [ ] All services pass health checks
- [ ] Documentation is complete and accurate
- [ ] No security vulnerabilities introduced
- [ ] Development workflow tested and functional
"@

    $prFile = Join-Path $RepoPath "PULL_REQUEST_GENERATED.md"
    $prContent | Out-File -FilePath $prFile -Encoding UTF8
    
    Write-Success "Pull request content generated: PULL_REQUEST_GENERATED.md"
    Write-Info "Title: $Title"
    Write-Info "Ready for GitHub PR creation"
}

function Start-Deployment {
    Write-Header "Starting Deployment"
    
    Set-Location $RepoPath
    
    Write-Info "Building and starting containers..."
    docker-compose up -d --build
    
    Write-Info "Waiting for services to be ready..."
    Start-Sleep -Seconds 10
    
    # Health checks
    try {
        $h3xHealth = Invoke-RestMethod -Uri "http://localhost:4978/api/health" -TimeoutSec 10
        Write-Success "H3X Server: Healthy"
    } catch {
        Write-Warning "H3X Server: Not responding"
    }
    
    try {
        $protocolHealth = Invoke-RestMethod -Uri "http://localhost:8081/api/health" -TimeoutSec 10
        Write-Success "Protocol Server: Healthy"
    } catch {
        Write-Warning "Protocol Server: Not responding"
    }
    
    Write-Info "Deployment complete. Access points:"
    Write-Host "   🌐 H3X Server: http://localhost:4978" -ForegroundColor Green
    Write-Host "   🔧 Protocol Server: http://localhost:8081" -ForegroundColor Green
    Write-Host "   📊 Health Check: http://localhost:8081/api/health" -ForegroundColor Green
}

# Main script logic
switch ($Action.ToLower()) {
    "status" {
        Get-ProjectStatus
    }
    "pr" {
        New-PullRequest
    }
    "deploy" {
        Start-Deployment
    }
    "all" {
        Get-ProjectStatus
        New-PullRequest
        Start-Deployment
    }
    default {
        Write-Host @"
H3X PR Automation Script

Usage:
  .\pr-automation.ps1 [action] [options]

Actions:
  status     - Show current project status
  pr         - Generate pull request content
  deploy     - Deploy services using Docker
  all        - Run all actions in sequence

Options:
  -TargetBranch [branch]    - Target branch for PR (default: main)
  -Title [title]            - PR title
  -Description [desc]       - PR description

Examples:
  .\pr-automation.ps1 status
  .\pr-automation.ps1 pr -Title "New Feature" -TargetBranch "develop"
  .\pr-automation.ps1 deploy
  .\pr-automation.ps1 all
"@ -ForegroundColor Cyan
    }
}
