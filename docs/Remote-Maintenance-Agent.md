# H3X Remote Maintenance Agent

## Overview

The H3X Remote Maintenance Agent is an advanced autonomous system designed to handle repository maintenance tasks automatically. It provides comprehensive automation for conflict resolution, PR management, branch cleanup, dependency updates, security patching, and health monitoring.

## Features

### 🔧 Automatic Conflict Resolution
- **Smart Detection**: Automatically detects merge conflicts across branches
- **Intelligent Resolution**: Uses file-type-specific strategies for conflict resolution
- **JSON Merging**: Advanced JSON merge capabilities for configuration files
- **Backup Creation**: Creates backups before applying resolution strategies
- **Manual Escalation**: Escalates complex conflicts to human review

### 📋 PR Management & Auto-Merge
- **Dependabot Integration**: Smart handling of dependency update PRs
- **Security Priority**: Fast-tracks security-related updates
- **Test Validation**: Runs tests before auto-merging
- **Review Analysis**: Analyzes PR changes and provides automated feedback
- **Risk Assessment**: Evaluates PR risk levels and suggests appropriate actions

### 🌿 Branch Management
- **Stale Branch Cleanup**: Automatically removes old, unused branches
- **Merged Branch Detection**: Identifies and cleans up merged branches
- **Protected Branch Respect**: Never touches protected branches
- **Activity Monitoring**: Considers recent activity before cleanup

### 📦 Dependency Management
- **Automated Updates**: Creates PRs for safe dependency updates
- **Security Patches**: Automatically applies security fixes
- **Version Strategy**: Only updates patch and minor versions for safety
- **Vulnerability Scanning**: Continuous monitoring for security issues

### 🔒 Security Monitoring
- **Vulnerability Detection**: Scans for security advisories
- **Automatic Patching**: Applies security fixes when safe
- **Issue Creation**: Creates GitHub issues for critical vulnerabilities
- **Audit Integration**: Integrates with npm audit for comprehensive scanning

### 🏥 Health Monitoring
- **System Health Checks**: Regular monitoring of repository health
- **CI/CD Status**: Monitors workflow success rates
- **Performance Tracking**: Tracks system performance metrics
- **Alert Generation**: Creates alerts for system issues

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- GitHub Personal Access Token with appropriate permissions
- Repository write access

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
export GITHUB_TOKEN="your_github_token_here"

# Run initial setup
npm run maintenance:health
```

### Configuration
The agent uses `config/maintenance-agent.json` for configuration. Key settings include:

```json
{
  "automation": {
    "conflictResolution": true,
    "autoMergePRs": true,
    "branchCleanup": true,
    "dependencyUpdates": true,
    "securityPatching": true,
    "healthMonitoring": true
  },
  "intervals": {
    "healthCheck": 15,
    "branchCleanup": 24,
    "securityScan": 12,
    "dependencyCheck": 6
  }
}
```

## Usage

### Command Line Interface

```bash
# Run a single maintenance cycle
npm run maintenance:run

# Start continuous monitoring
npm run maintenance:monitor

# Specific operations
npm run maintenance:health      # Health check
npm run maintenance:conflicts   # Resolve conflicts
npm run maintenance:prs         # Manage PRs
npm run maintenance:branches    # Clean branches
npm run maintenance:deps        # Update dependencies
npm run maintenance:security    # Apply security patches
```

### GitHub Actions Integration

The agent includes GitHub Actions workflows for automated execution:

- **Scheduled Runs**: Executes every 4 hours automatically
- **Manual Triggers**: Can be triggered manually with specific commands
- **Health Monitoring**: Continuous health checks with issue creation on failure
- **Security Scanning**: Regular security scans and patching

### Programmatic Usage

```typescript
import { RemoteMaintenanceAgent } from './Scripts/remote-maintenance-agent';

const agent = new RemoteMaintenanceAgent({
  github: {
    owner: 'your-org',
    repo: 'your-repo',
    token: process.env.GITHUB_TOKEN,
    defaultBranch: 'main'
  },
  automation: {
    conflictResolution: true,
    autoMergePRs: true,
    // ... other options
  }
});

// Run maintenance cycle
await agent.runMaintenanceCycle();

// Start continuous monitoring
await agent.startContinuousMonitoring();
```

## Conflict Resolution Strategies

The agent uses intelligent strategies based on file types:

| File Type | Strategy | Description |
|-----------|----------|-------------|
| `*.json` | Merge | Smart JSON object merging |
| `*.yml`, `*.yaml` | Ours | Prefer local changes |
| `*.env*` | Ours | Prefer local environment settings |
| `*.md`, `*.txt` | Theirs | Prefer remote documentation updates |
| `package*.json` | Merge | Careful dependency merging |
| `*.ts`, `*.js`, `*.py` | Manual | Require human review |

## Auto-Merge Criteria

PRs are automatically merged when:

1. **Status Checks**: All required checks pass
2. **Reviews**: Has required approvals (configurable)
3. **Author**: From trusted sources (Dependabot, etc.)
4. **Type**: Patch/minor updates only
5. **No Conflicts**: No merge conflicts present
6. **Not Draft**: Not marked as draft

## Security Features

### Vulnerability Management
- Automatic detection of security advisories
- Priority handling of critical vulnerabilities
- Integration with GitHub Security Advisories
- Automated patching for low-risk vulnerabilities

### Safe Automation
- Backup creation before major changes
- Rollback capabilities for failed operations
- Human escalation for high-risk changes
- Comprehensive logging and audit trails

## Monitoring & Logging

### Log Levels
- **INFO**: General operational information
- **WARN**: Warnings and non-critical issues
- **ERROR**: Errors and failures
- **SUCCESS**: Successful operations

### Log Locations
- Console output with color coding
- File logging to `logs/maintenance-agent.log`
- GitHub Actions artifacts for CI runs

### Metrics Tracking
- Operation success/failure rates
- Performance metrics
- Security vulnerability counts
- Branch cleanup statistics

## Troubleshooting

### Common Issues

**GitHub API Rate Limits**
- The agent respects GitHub API rate limits
- Implements exponential backoff for retries
- Uses conditional requests where possible

**Permission Errors**
- Ensure GitHub token has required permissions:
  - `repo` (full repository access)
  - `workflow` (for GitHub Actions)
  - `security_events` (for security advisories)

**Merge Conflicts**
- Complex conflicts are escalated to manual review
- Backup files are created before resolution attempts
- Failed resolutions are logged with detailed information

### Debug Mode
Enable debug logging by setting:
```bash
export NODE_ENV=development
export DEBUG=true
```

## Best Practices

1. **Start Gradually**: Begin with health checks and monitoring before enabling auto-merge
2. **Review Logs**: Regularly review maintenance logs for issues
3. **Test Configuration**: Test configuration changes in a development environment
4. **Monitor Performance**: Keep an eye on API usage and performance metrics
5. **Security First**: Prioritize security updates and patches

## Contributing

The maintenance agent is designed to be extensible. Key areas for contribution:

- Additional conflict resolution strategies
- Enhanced PR analysis capabilities
- New health check metrics
- Integration with additional tools and services

## Support

For issues and questions:
1. Check the logs for detailed error information
2. Review the configuration settings
3. Ensure GitHub token permissions are correct
4. Create an issue in the repository with relevant details

---

*The H3X Remote Maintenance Agent is part of the H3X Unified System and follows the same architectural principles and standards.*
