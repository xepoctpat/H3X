# GitHub Actions Workflows for Code Cleanup and Security

This document outlines the GitHub Actions workflows set up for maintaining code quality, security, and automated maintenance in the H3X project.

## Workflows Overview

### 1. Comprehensive CI/CD

**File:** `.github/workflows/comprehensive-ci.yml`

This workflow runs on every push and pull request to the main branches, as well as manually. It performs:

- **Code Quality & Linting**
  - TypeScript type checking
  - Code formatting verification (Prettier)
  - Linting (ESLint)
  - HTML and JavaScript validation
  - Unused dependencies detection

- **Testing & Health Checks**
  - Unit tests
  - Integration tests
  - Setup checks
  - Health checks

- **Security Scanning**
  - npm audit
  - Snyk vulnerability scanning
  - GitHub CodeQL analysis

### 2. Automated Maintenance

**File:** `.github/workflows/automated-maintenance.yml`

This workflow runs weekly and can be triggered manually. It:

- Automatically fixes formatting issues with Prettier
- Automatically fixes linting issues with ESLint
- Checks for unused dependencies
- Runs security audits
- Creates a pull request with all changes and a detailed report

### 3. Security Scanning

**File:** `.github/workflows/security-scan.yml`

This workflow runs on pushes, pull requests, and weekly. It focuses on:

- Snyk vulnerability scanning
- CodeQL static code analysis
- Detailed security reporting

### 4. Dependabot Configuration

**File:** `.github/dependabot.yml`

Keeps dependencies up-to-date by automatically creating pull requests for:

- npm packages (weekly)
- Docker images (weekly)
- GitHub Actions (weekly)

## Best Practices Implemented

- **Fail Fast:** Critical issues break the build
- **Automated Fixes:** Where possible, issues are fixed automatically
- **Regular Scanning:** Security and maintenance tasks run on a schedule
- **Pull Request Workflow:** Changes are proposed via PRs for review
- **Comprehensive Reporting:** Detailed reports for manual review

## Usage

- **Manual Triggers:** All workflows can be manually triggered from the Actions tab
- **Scheduled Runs:** Maintenance and security workflows run on a weekly schedule
- **PR Integration:** All workflows run on pull requests to ensure quality before merging
