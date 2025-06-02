#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Automated Git Commit and PR Creation Script
    
.DESCRIPTION
    This script automates the process of committing changes and creating a Pull Request.
    It can be run after making code changes to quickly submit them for review.
    
.PARAMETER Message
    The commit message. If not provided, the script will prompt for one.
    
.PARAMETER Branch
    The branch name to create for the changes. If not provided, a timestamped branch name will be generated.
    
.PARAMETER SkipPR
    If specified, the script will only commit changes without creating a PR.
    
.PARAMETER Repository
    The repository name for the PR. Defaults to origin.
    
.PARAMETER BaseBranch
    The base branch to create the PR against. Defaults to main.
    
.EXAMPLE
    .\auto-commit-pr.ps1 -Message "Fix accessibility issues"
    
.EXAMPLE
    .\auto-commit-pr.ps1 -Message "Update documentation" -Branch "docs-update" -BaseBranch "develop"
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Message,
    
    [Parameter(Mandatory=$false)]
    [string]$Branch,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipPR,
    
    [Parameter(Mandatory=$false)]
    [string]$Repository = "origin",
    
    [Parameter(Mandatory=$false)]
    [string]$BaseBranch = "main"
)

# Function to write colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    Write-Host $Message -ForegroundColor $Color
}

# Check for git command
if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
    Write-ColorOutput "❌ Git is not installed or not in the PATH." "Red"
    exit 1
}

# Check if we're in a git repository
$isGitRepo = git rev-parse --is-inside-work-tree 2>$null
if (-not $isGitRepo) {
    Write-ColorOutput "❌ Not in a git repository. Please run this script from within a git repository." "Red"
    exit 1
}

# Check for github cli command for PR creation
$hasGitHub = Get-Command "gh" -ErrorAction SilentlyContinue
if (-not $hasGitHub -and -not $SkipPR) {
    Write-ColorOutput "⚠️ GitHub CLI not found. Will commit changes but cannot create PR." "Yellow"
    Write-ColorOutput "ℹ️ Install GitHub CLI from: https://cli.github.com/" "Cyan"
    $SkipPR = $true
}

# Ensure GitHub CLI is authenticated if we're creating a PR
if (-not $SkipPR) {
    gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "⚠️ GitHub CLI not authenticated. Please run 'gh auth login' first." "Yellow"
        Write-ColorOutput "ℹ️ Will commit changes but cannot create PR." "Cyan"
        $SkipPR = $true
    }
}

# Get status of the repository
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-ColorOutput "ℹ️ No changes to commit." "Cyan"
    exit 0
}

# Display changes
Write-ColorOutput "🔍 Changes detected:" "Cyan"
git status --short
Write-ColorOutput ""

# Ask for commit message if not provided
if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = Read-Host "Enter commit message"
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $Message = "Automated commit $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }
}

# Generate branch name if not provided
if ([string]::IsNullOrWhiteSpace($Branch)) {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $randomChars = -join ((65..90) + (97..122) | Get-Random -Count 4 | ForEach-Object { [char]$_ })
    $Branch = "auto-fix-$timestamp-$randomChars"
}

# Get current branch
$currentBranch = git rev-parse --abbrev-ref HEAD

# Create and checkout new branch
Write-ColorOutput "🌿 Creating branch: $Branch" "Green"
git checkout -b $Branch
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput "❌ Failed to create branch." "Red"
    exit 1
}

# Stage all changes
Write-ColorOutput "➕ Staging changes..." "Green"
git add --all
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput "❌ Failed to stage changes." "Red"
    git checkout $currentBranch
    exit 1
}

# Commit changes
Write-ColorOutput "✅ Committing with message: $Message" "Green"
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput "❌ Failed to commit changes." "Red"
    git checkout $currentBranch
    exit 1
}

# Push changes
Write-ColorOutput "⬆️ Pushing changes to remote..." "Green"
git push --set-upstream $Repository $Branch
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput "❌ Failed to push changes." "Red"
    Write-ColorOutput "⚠️ Changes are committed to local branch '$Branch' but not pushed." "Yellow"
    exit 1
}

# Create PR if not skipped
if (-not $SkipPR) {
    Write-ColorOutput "🔄 Creating Pull Request..." "Green"
    
    $prTitle = $Message
    $prBody = @"
## Automated Pull Request

This PR was automatically created by the auto-commit-pr script.

### Changes
$Message

### Validation
- [ ] Code follows the project style guidelines
- [ ] Tests pass for the changes
- [ ] Documentation updated if required
"@
    
    $prResult = gh pr create --title $prTitle --body $prBody --base $BaseBranch
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "🎉 Pull Request created successfully!" "Green"
        Write-ColorOutput "🔗 $prResult" "Cyan"
    } else {
        Write-ColorOutput "❌ Failed to create PR. You can create it manually." "Yellow"
        Write-ColorOutput "Branch: $Branch" "Cyan"
    }
}

# Output summary
Write-ColorOutput ""
Write-ColorOutput "📋 Summary:" "Magenta"
Write-ColorOutput "  Branch:     $Branch" "White"
Write-ColorOutput "  Commit:     $Message" "White"
if (-not $SkipPR) {
    Write-ColorOutput "  PR Status:  Created against $BaseBranch" "White"
} else {
    Write-ColorOutput "  PR Status:  Skipped" "White"
}

# Return to original branch if needed
if ($SkipPR) {
    Write-ColorOutput ""
    Write-ColorOutput "ℹ️ Returning to branch: $currentBranch" "Cyan"
    git checkout $currentBranch
}

Write-ColorOutput ""
Write-ColorOutput "✨ Done!" "Green"
