# H3X Code Cleanup and Security Guide

This document explains the code cleanup and security setup implemented for the H3X project using GitHub Actions.

## Table of Contents

1. [GitHub Actions Workflows](#github-actions-workflows)
2. [Code Quality Tools](#code-quality-tools)
3. [Security Scanning](#security-scanning)
4. [Pre-commit Hooks](#pre-commit-hooks)
5. [Pull Request Automation](#pull-request-automation)
6. [Best Practices](#best-practices)

## GitHub Actions Workflows

The following workflows have been set up in the `.github/workflows` directory:

### Code Quality & Testing

- **File**: `.github/workflows/code-quality.yml`
- **Triggers**: Push to main/master/develop, Pull requests to main/master/develop
- **Purpose**: Runs TypeScript checks, ESLint, Prettier, and tests

### Security Scanning

- **File**: `.github/workflows/security-scan.yml`
- **Triggers**: Push to main/master/develop, Pull requests to main/master/develop, Weekly schedule
- **Purpose**: Runs Snyk, npm audit, GitLeaks, OSSF Scorecard, Dependency Review, CodeQL, and Docker image scanning

The security scanning workflow includes:

1. **Snyk Security Analysis**: Scans dependencies for vulnerabilities with Snyk
2. **GitLeaks**: Detects secrets accidentally committed to the repository
3. **Dependency Review**: Analyzes dependencies in pull requests for vulnerabilities
4. **OSSF Scorecard**: Evaluates the project against security best practices
5. **CodeQL Analysis**: Performs static code analysis to find security issues
6. **Docker Image Scanning**: Uses Trivy to scan container images for vulnerabilities

Results from these scans are uploaded as SARIF files for easy viewing in the GitHub Security tab.

### Code Cleanup

- **File**: `.github/workflows/code-cleanup.yml`
- **Triggers**: Scheduled (1st and 15th of each month), Manual
- **Purpose**: Automatically formats code, fixes linting issues, and updates dependencies

### PR Automation

- **File**: `.github/workflows/pr-automation.yml`
- **Triggers**: Pull request events (opened, synchronized, reopened, labeled, unlabeled) and pull request reviews
- **Purpose**: Adds labels, validates PR titles, analyzes PR size, and auto-merges eligible PRs

## Code Quality Tools

### ESLint

ESLint is configured in `.eslintrc.js` with the following features:
- TypeScript integration with strict type checking rules
- Security rules via `eslint-plugin-security`
- Code quality rules via `eslint-plugin-sonarjs`
- Import organization rules

Run ESLint with:
```bash
npm run lint        # Fix issues
npm run lint:check  # Check without fixing
```

### Prettier

Prettier is configured to ensure consistent code formatting.

Run Prettier with:
```bash
npm run format        # Format files
npm run format:check  # Check formatting
```

## Security Scanning

Security scanning is performed using multiple tools:

### Snyk

Snyk checks for vulnerabilities in dependencies. To set up Snyk:

1. Create an account at [snyk.io](https://snyk.io/)
2. Generate an API token
3. Add the token as a GitHub repository secret named `SNYK_TOKEN` in your repository settings under Security > Secrets and variables > Actions

### CodeQL

CodeQL performs static code analysis to find security vulnerabilities. It's already configured in the security workflow.

### GitLeaks

GitLeaks scans for secrets and credentials accidentally committed to the repository. The workflow is configured to generate SARIF reports that can be viewed in GitHub Security tab.

### OSSF Scorecard

OSSF Scorecard evaluates the security posture of the project based on several metrics including CI/CD practices, code review processes, and dependency management.

### Dependency Review

Dependency Review analyzes pull requests for dependency changes and highlights potential security issues in added or updated dependencies.

### Docker Image Scanning

Trivy scans Docker images for vulnerabilities in the container and its dependencies.

## Pre-commit Hooks

Pre-commit hooks are configured in `.pre-commit-config.yaml` to ensure code quality before commits:

- Trailing whitespace removal
- End-of-file fixing
- YAML validation
- Large file detection
- Merge conflict detection
- ESLint
- Prettier
- GitLeaks

To set up pre-commit:

```bash
pip install pre-commit
npm run prepare
```

## Pull Request Automation

The PR automation workflow provides:

- Automatic labeling based on file changes
- PR title format validation (conventional commits)
- PR size analysis with warnings for large PRs
- Auto-merge for eligible PRs with appropriate labels and passing checks

### Auto-Merge

PRs will be automatically merged when all these conditions are met:
- The PR has been approved by at least one reviewer
- All checks are passing
- The PR has one of these labels: `dependencies`, `documentation`, `automated-cleanup`, or `auto-merge`

This helps streamline the workflow for non-critical changes that still require review.

## Best Practices

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <description>

[optional body]

[optional footer]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `chore`: Changes to the build process or tools

### Pull Requests

- Keep PRs small and focused
- Include a descriptive title following conventional commits
- Provide details in the description
- Link to related issues

### Security

- Never commit secrets or credentials
- Use environment variables for sensitive information
- Run security scans regularly
- Update dependencies frequently

## Additional Resources

- [ESLint Documentation](https://eslint.org/docs/user-guide/)
- [Prettier Documentation](https://prettier.io/docs/en/index.html)
- [Snyk Documentation](https://docs.snyk.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Pre-commit Documentation](https://pre-commit.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
