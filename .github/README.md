# H3X GitHub Actions Workflows

This document describes the GitHub Actions workflows configured for the H3X project.

## Overview

We have three primary workflows:

1. **Code Quality & Testing** - Runs on every push and pull request to main, master, and develop branches
2. **Security Scanning** - Runs on push, pull request, and weekly schedule
3. **Code Cleanup** - Runs on schedule (1st and 15th of each month) and can be triggered manually

## Workflow Details

### Code Quality & Testing

This workflow runs the following checks:
- TypeScript type checking
- ESLint for code quality
- Prettier for code formatting
- Project tests
- Setup check
- Health check
- Dependency check
- Performance tests

**Trigger:** Push to main/master/develop, Pull requests to main/master/develop, Manual

### Security Scanning

This workflow runs multiple security scanning tools:
- npm audit
- GitLeaks (for secret scanning)
- CodeQL analysis
- OSSF Scorecard analysis
- Dependency Review
- Docker image scanning with Trivy

**Trigger:** Push to main/master/develop, Pull requests to main/master/develop, Weekly on Monday at 2 AM, Manual

### Code Cleanup

This workflow automatically performs code cleanup tasks:
- Formatting with Prettier
- ESLint auto-fixing
- Checking for unused dependencies
- Dependency updates

It creates pull requests with the changes for team review.

**Trigger:** Schedule (1st and 15th of each month), Manual

## How to Use

### Running Workflows Manually

1. Go to the "Actions" tab in your GitHub repository
2. Select the workflow you want to run
3. Click "Run workflow" and select the branch

### Setting Up Required Secrets

Currently, the workflows use only built-in GitHub tokens and public action secrets.

### Working with Pull Requests from Automated Workflows

The Code Cleanup workflow creates automated pull requests. When reviewing these PRs:

1. Check that all tests are passing
2. Review code formatting changes
3. Test dependency updates locally if needed
4. Approve and merge if everything looks good

## Extending Workflows

To extend these workflows:

1. Edit the YAML files in the `.github/workflows` directory
2. Add new jobs or steps as needed
3. Test your changes by triggering the workflow manually

## Troubleshooting

If a workflow fails:

1. Check the workflow logs in the Actions tab
2. Verify that all required secrets are set up
3. Test the failing step locally
4. Make necessary changes and re-run the workflow
