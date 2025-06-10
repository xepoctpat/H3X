# H3X Dependabot Automation Documentation

## Overview

The H3X Dependabot Automation system provides intelligent, automated dependency management with
advanced features for security scanning, auto-merging, and integration with the existing H3X
automation ecosystem.

## 🚀 Features

### Core Automation Features

- **Smart Auto-merge**: Automatically merges safe dependency updates based on configurable rules
- **Security Scanning**: Integrated vulnerability detection and blocking of unsafe updates
- **Breaking Change Detection**: Analyzes updates for potential breaking changes
- **Performance Impact Analysis**: Monitors dependency update impact on build and runtime
  performance
- **Real-time Processing**: Webhook-based immediate response to Dependabot events
- **Comprehensive Logging**: Detailed audit trail of all automation actions

### Advanced Grouping and Scheduling

- **Intelligent Package Grouping**: Groups related packages (TypeScript tools, testing frameworks,
  etc.)
- **Multi-ecosystem Support**: Handles npm, Docker, GitHub Actions, Terraform, and pip
- **Timezone-aware Scheduling**: Optimized update schedules across different days and times
- **Target Branch Management**: Configurable target branches for different update types

### Integration Features

- **GitHub Actions Integration**: Seamless CI/CD pipeline integration
- **Existing H3X Automation**: Full compatibility with current automation scripts
- **Webhook Processing**: Real-time event handling for immediate response
- **Configuration Management**: Centralized configuration with environment-specific overrides

## 📁 File Structure

```
H3X/
├── .github/
│   ├── dependabot.yml                    # Enhanced Dependabot configuration
│   └── workflows/
│       └── dependabot-automation.yml     # GitHub Actions workflow
├── config/
│   └── dependabot-automation.json        # Centralized configuration
├── scripts/
│   ├── dependabot-automation.js          # Main automation script
│   └── dependabot-webhook-handler.js     # Webhook event processor
├── tests/
│   └── dependabot-automation.test.js     # Comprehensive test suite
└── docs/
    └── dependabot-automation.md          # This documentation
```

## ⚙️ Configuration

### Dependabot Configuration (.github/dependabot.yml)

The enhanced configuration includes:

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
      time: '02:00'
      timezone: 'UTC'
    groups:
      typescript:
        patterns: ['typescript', '@types/*', 'ts-node']
      testing:
        patterns: ['jest', '@jest/*', 'mocha', 'chai']
      # ... more groups
```

### Automation Configuration (config/dependabot-automation.json)

```json
{
  "autoMerge": {
    "enabled": true,
    "allowedUpdateTypes": ["patch", "minor"],
    "allowedEcosystems": ["npm", "github-actions"],
    "requiresAllChecks": true,
    "waitTimeMinutes": 5
  },
  "security": {
    "scanEnabled": true,
    "blockVulnerableUpdates": true,
    "allowedSeverity": ["low", "moderate"]
  }
}
```

## 🔧 Setup and Installation

### Prerequisites

- Node.js 16+
- GitHub repository with admin access
- Existing H3X automation setup

### Installation Steps

1. **Verify Configuration Files**

   ```bash
   # Check that all files are in place
   ls -la .github/dependabot.yml
   ls -la .github/workflows/dependabot-automation.yml
   ls -la config/dependabot-automation.json
   ls -la scripts/dependabot-automation.js
   ```

2. **Install Dependencies**

   ```bash
   npm install js-yaml octokit
   ```

3. **Set up GitHub Secrets** (Required for GitHub Actions)

   - `GITHUB_TOKEN`: GitHub token with repo permissions
   - `AUTOMATION_TOKEN`: Token for automation bot account (optional)

4. **Configure Webhook** (For real-time processing)

   ```bash
   # Set webhook URL in GitHub repository settings
   # URL: https://your-domain.com/webhooks/dependabot
   # Events: Pull requests, Push
   ```

5. **Run Tests**
   ```bash
   node tests/dependabot-automation.test.js
   ```

## 🚦 Usage

### Automatic Operation

The system operates automatically on Dependabot PR events:

1. **PR Created**: Webhook triggers immediate analysis
2. **Analysis**: Security scan, breaking change detection, CI status check
3. **Decision**: Auto-merge if eligible, or flag for manual review
4. **Action**: Merge PR or add review labels
5. **Logging**: Record all actions and decisions

### Manual Operation

Run the automation script manually:

```bash
# Analyze specific PR
node scripts/dependabot-automation.js --pr 123

# Process all open Dependabot PRs
node scripts/dependabot-automation.js --process-all

# Dry run (analysis only, no actions)
node scripts/dependabot-automation.js --dry-run
```

### Webhook Handler

Start the webhook handler for real-time processing:

```bash
# Start webhook server
node scripts/dependabot-webhook-handler.js

# Start with custom port
PORT=3000 node scripts/dependabot-webhook-handler.js
```

## 🔒 Security Features

### Vulnerability Scanning

- **NPM Audit Integration**: Checks for known vulnerabilities
- **GitHub Security Advisories**: Monitors for security alerts
- **Severity Filtering**: Configurable blocking based on severity levels

### Auto-merge Safety Checks

- **CI Status Validation**: Requires all checks to pass
- **Update Type Restrictions**: Limits auto-merge to patch/minor updates
- **Security Advisory Blocking**: Prevents merge of vulnerable updates
- **Breaking Change Detection**: Flags potential breaking changes

### Audit Trail

- **Comprehensive Logging**: All actions logged with timestamps
- **Decision Tracking**: Records why auto-merge was approved/denied
- **Security Events**: Special logging for security-related decisions

## 📊 Monitoring and Alerts

### Health Monitoring

- **Endpoint**: `GET /health` - System health check
- **Metrics**: Processing time, success rate, error count
- **Status Dashboard**: Real-time automation status

### Alerting

- **Failed Auto-merges**: Notifications when auto-merge fails
- **Security Issues**: Immediate alerts for vulnerability detection
- **System Errors**: Notification of automation failures

### Metrics Collection

```bash
# Get automation metrics
curl http://localhost:3000/metrics

# Get recent automation activity
curl http://localhost:3000/activity
```

## 🔧 Customization

### Update Policies

Modify `config/dependabot-automation.json`:

```json
{
  "packages": {
    "critical-package": {
      "autoMerge": false,
      "requiresManualReview": true
    },
    "@types/*": {
      "autoMerge": true,
      "allowedUpdateTypes": ["minor", "patch", "major"]
    }
  }
}
```

### Custom Rules

Add custom auto-merge rules:

```javascript
// In dependabot-automation.js
isAutoMergeEligible(packageUpdate, ciStatus) {
  // Custom logic here
  if (packageUpdate.packageName === 'my-critical-package') {
    return false; // Never auto-merge
  }
  // ... existing logic
}
```

### Notification Channels

Configure notification channels:

```json
{
  "notifications": {
    "enabled": true,
    "channels": ["github", "slack", "email"],
    "slack": {
      "webhook": "https://hooks.slack.com/...",
      "channel": "#dependencies"
    }
  }
}
```

## 🧪 Testing

### Running Tests

```bash
# Run full test suite
node tests/dependabot-automation.test.js

# Run specific test category
node tests/dependabot-automation.test.js --category security

# Run with verbose output
DEBUG=true node tests/dependabot-automation.test.js
```

### Test Categories

- **Configuration Validation**: Validates all config files
- **PR Analysis**: Tests package parsing and update detection
- **Auto-merge Logic**: Validates merge eligibility rules
- **Security Scanning**: Tests vulnerability detection
- **Webhook Handler**: Tests real-time event processing
- **GitHub Actions Integration**: Validates workflow configuration
- **Performance**: Measures processing time and resource usage

### Mock Data

The test suite includes comprehensive mock data for:

- Dependabot PR payloads
- Package update information
- CI status responses
- Security advisory data

## 🚨 Troubleshooting

### Common Issues

#### Auto-merge Not Working

1. Check CI status requirements
2. Verify GitHub token permissions
3. Review package eligibility rules
4. Check automation logs

#### Webhook Events Not Processing

1. Verify webhook URL configuration
2. Check webhook secret configuration
3. Review webhook handler logs
4. Validate GitHub webhook delivery

#### Security Scanning Failures

1. Check NPM audit availability
2. Verify GitHub Security API access
3. Review security configuration
4. Check network connectivity

### Debug Mode

Enable debug logging:

```bash
DEBUG=dependabot:* node scripts/dependabot-automation.js
```

### Log Files

Check automation logs:

- Main log: `logs/automation/dependabot-automation.log`
- Webhook log: `logs/webhooks/dependabot-webhook.log`
- Error log: `logs/errors/dependabot-errors.log`

## 🔄 Integration with Existing H3X Automation

### Compatibility

- **h3x-automation.js**: Full compatibility maintained
- **dev-automation.js**: Integrates with development workflows
- **git-pr-automation.js**: Extends existing PR automation
- **cicd-automation.js**: Coordinates with CI/CD processes

### Shared Resources

- **Logging**: Uses existing H3X logging infrastructure
- **Configuration**: Extends existing config management
- **Notifications**: Integrates with current notification systems

### Coordination

- **Non-conflicting**: Avoids conflicts with existing automation
- **Complementary**: Enhances rather than replaces existing features
- **Shared State**: Coordinates state with other automation scripts

## 📈 Performance Optimization

### Caching

- **Package Information**: Caches NPM package metadata
- **Security Advisories**: Caches vulnerability data
- **CI Status**: Caches status check results

### Rate Limiting

- **GitHub API**: Respects GitHub API rate limits
- **NPM Registry**: Implements NPM API rate limiting
- **Batch Processing**: Groups operations for efficiency

### Resource Management

- **Memory**: Efficient memory usage with streaming
- **CPU**: Optimized processing algorithms
- **Network**: Minimizes external API calls

## 📚 API Reference

### DependabotAutomation Class

#### Methods

```javascript
// Initialize automation
const automation = new DependabotAutomation();

// Analyze a PR
await automation.analyzePR(prNumber);

// Check auto-merge eligibility
const eligible = automation.isAutoMergeEligible(packageUpdate, ciStatus);

// Parse package information from PR
const packageInfo = automation.parsePackageInfo(prTitle);

// Get update type (major/minor/patch)
const updateType = automation.getUpdateType(fromVersion, toVersion);
```

### Webhook Handler API

#### Endpoints

```bash
# Health check
GET /health

# Process webhook event
POST /webhooks/dependabot

# Get metrics
GET /metrics

# Get recent activity
GET /activity
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create feature branch
3. Install dependencies: `npm install`
4. Run tests: `npm test`
5. Submit pull request

### Code Style

- Follow existing H3X coding standards
- Add comprehensive tests for new features
- Update documentation for changes
- Include performance considerations

### Testing Requirements

- All new features must include tests
- Maintain >90% test coverage
- Include integration tests
- Test error conditions

## 📄 License

This automation system is part of the H3X project and follows the same licensing terms.

## 📞 Support

For issues or questions:

1. Check this documentation
2. Review troubleshooting section
3. Check existing GitHub issues
4. Create new issue with detailed description

---

_This documentation was last updated: ${new Date().toISOString()}_
