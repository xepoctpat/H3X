# Automated Git Workflow Guide

This guide explains how to use the automatic commit and PR creation script to streamline your development workflow.

## Overview

The `auto-commit-pr.ps1` script automates the process of:
1. Creating a new branch
2. Committing your changes
3. Pushing the branch to the remote repository
4. Creating a Pull Request (using GitHub CLI)

## Prerequisites

- Git installed and configured
- GitHub CLI (`gh`) installed and authenticated (for PR creation)
- PowerShell 5.1 or higher

## Usage

### Basic Usage

```powershell
# From the project root
./scripts/auto-commit-pr.ps1 -Message "Your commit message"
```

This will:
- Create a timestamped branch
- Commit all changes with your message
- Push to remote
- Create a PR against the main branch

### Advanced Options

```powershell
# Specify a custom branch name
./scripts/auto-commit-pr.ps1 -Message "Fix accessibility issues" -Branch "fix-accessibility"

# Skip PR creation (commit and push only)
./scripts/auto-commit-pr.ps1 -Message "WIP: Code refactoring" -SkipPR

# Create PR against a different base branch
./scripts/auto-commit-pr.ps1 -Message "New feature" -BaseBranch "develop"
```

### Interactive Mode

If you run the script without specifying a commit message, it will prompt you to enter one:

```powershell
./scripts/auto-commit-pr.ps1
```

## Workflow Integration

### After Making Code Changes

1. Make your code changes
2. Run code linting and tests
3. Run the auto-commit-pr script to commit and create a PR
4. Review and merge the PR in GitHub

### Continuous Integration

This script can be integrated with your CI/CD pipeline:

```powershell
# Example for automated fixes
if ($fixesApplied) {
    ./scripts/auto-commit-pr.ps1 -Message "Automated fixes: $fixDescription" -Branch "auto-fixes-$timestamp"
}
```

## Troubleshooting

- **Authentication Issues**: Run `gh auth login` to authenticate GitHub CLI
- **Push Failures**: Ensure you have write access to the repository
- **PR Creation Failures**: Check GitHub CLI installation and permissions

## Best Practices

1. Use descriptive commit messages
2. Include ticket/issue numbers in commit messages when applicable
3. Review changes before running the script
4. Run tests before committing

## Notes

- The script stages ALL changes in the repository
- If PR creation fails, changes are still committed and pushed
- You can manually create a PR from the pushed branch if needed
