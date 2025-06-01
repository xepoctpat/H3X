# Automation Scripts & Agent Actions

> This file is the single source for all automation scripts and agent actions—current and obsolete. Obsolete or deprecated scripts should be clearly marked and listed in the dedicated section below for historical reference.

---

## 📖 Documentation & Usage

This file documents all automation scripts, agent actions, and automation requests for the 
H3X-fLups unified workspace. Use it to:

- Track all current and obsolete automation scripts
- Log agent actions and automation completions
- Propose and document new automations
- Reference usage examples for each script

For integration with the Merger Task Manager, see the "Agent Actions" section below.

## 🚀 Auto

- Run daily checkpoint: `pwsh ./daily-checkpoint.ps1`
- Manage Docker: `pwsh ./docker-manage.ps1 <command>`
- Import Docker config: `pwsh ./docker-import-helper.ps1 <config>`
- Run CI/CD automation: `node cicd-automation.js`
- Clean modular files: `npx ts-node h3x-modular-clean.ts`
- Backup modular files: `npx ts-node h3x-modular-backup.ts`
- Merge modular to all-in-one: `node merge-modular-to-allinone.js`
- Auto commit and PR: `pwsh ./scripts/auto-commit-pr.ps1 -Message "Your commit message"`

---

## 📜 Existing Automation Scripts (Current)

- **daily-checkpoint.ps1**
  - Purpose: Automates daily project checkpointing and logging.
  - Location/path: `daily-checkpoint.ps1`

- **docker-manage.ps1**
  - Purpose: PowerShell script for managing Docker containers and images for the project.
  - Location/path: `docker-manage.ps1`

- **cicd-automation.js**
  - Purpose: Node.js script for CI/CD automation tasks.
  - Location/path: `cicd-automation.js`

- **docker-import-helper.ps1**
  - Purpose: PowerShell script for importing Docker configurations.
  - Location/path: `docker-import-helper.ps1`

- **h3x-modular-clean.ts**
  - Purpose: TypeScript script for cleaning up modular H3X project files.
  - Location/path: `h3x-modular-clean.ts`

- **h3x-modular-backup.ts**
  - Purpose: TypeScript script for backing up modular H3X project files.
  - Location/path: `h3x-modular-backup.ts`

- **auto-commit-pr.ps1**
  - Purpose: Automates git commit and PR creation workflow.
  - Location/path: `scripts/auto-commit-pr.ps1`
- **merge-modular-to-allinone.js**
  - Purpose: Node.js script to merge modular code into an all-in-one file.
  - Location/path: `merge-modular-to-allinone.js`
- **azure-dependency-scanner.js**
  - Purpose: Scans the entire codebase for Azure and Microsoft 365 references.
  - Location/path: `scripts/azure-dependency-scanner.js`
  - Usage: `npm run scan:azure`
- **iteration-controller.js**
  - Purpose: Interactive controller for managing the H3X-fLups iteration process.
  - Location/path: `scripts/iteration-controller.js`
  - Usage: `npm run iterate` or `node scripts/iteration-controller.js`

## 🗃️ Obsolete/Deprecated Automation Scripts

- **No obsolete or deprecated scripts currently tracked in this file.**

## ➕ Adding New Automations

(Add new automation requests below as they are created.)

## 🤖 Agent Actions (All)

Agents should log automation completions, errors, and status updates here for both current and obsolete automations. Use timestamps and reference the related task in `Merger Task Manager.md`.

**Agent Log Template:**
- [ ] `<script or action>` (`<status>`) @ `<timestamp>`
  - `<log message>`
  - Related task: `<task name>`

**Examples:**
- [x] `merge-modular-to-allinone.js` (done) @ 2025-06-01T10:15:00Z
  - Modular code successfully merged into all-in-one file.
  - Related task: Merge Project Folders
- [ ] `cicd-automation.js` (in progress) @ 2025-06-01T10:20:00Z
  - CI/CD pipeline automation script running, awaiting results.
  - Related task: Continuous Integration
- [x] `docker-manage.ps1` (done) @ 2025-06-01T10:25:00Z
  - Docker containers started for development environment.
  - Related task: Docker Compose Consolidation
- [ ] `internal-audit-cleanup` (in progress) @ 2025-06-01T10:30:00Z
  - Comprehensive workspace audit and cleanup initiated
  - Related task: Code Quality & Reference Management
- [x] `development-iterator.js` (done) @ 2025-06-01T05:30:00Z
  - Development iteration process started successfully. Completed 8+ iterations.
  - Enhanced documentation, optimized taskmaster, improved code generation.
  - Related task: Continuous Development Cycle
- [x] `setup-check.js` (updated) @ 2025-06-01T07:30:00Z
  - Removed Azure dependency verification checks.
  - Replaced with essential script verification.
  - Related task: Code Cleanup & Refactoring
- [x] `ai-integration-control-core.js` (updated) @ 2025-06-01T08:00:00Z
  - Removed Azure and Microsoft 365 references from Docker configuration.
  - Updated AI response text to remove Microsoft 365 mentions.
  - Related task: Code Cleanup & Refactoring
- [x] `azure-dependency-scanner.js` (created) @ 2025-06-01T08:10:00Z
  - Added new script to scan for remaining Azure dependencies.
  - Added to package.json as npm run scan:azure
  - Related task: Code Cleanup & Refactoring
- [x] `update-merger-task-manager.js` (fixed) @ 2025-06-01T08:15:00Z
  - Fixed regex pattern issue that prevented task updates.
  - Added proper escapeRegExp function.
  - Related task: Code Cleanup & Refactoring
- [x] `iteration-controller.js` (created) @ 2025-06-01T08:30:00Z
  - Created new interactive controller for managing iteration process.
  - Added to package.json as npm run iterate and npm run iterate:bg.
  - Updated CONTINUE-TO-ITERATE-READY.md with new commands.
  - Related task: Continuous Development Cycle

---

## 🔄 TypeScript Conversion Plan

The following Node.js automation scripts are candidates for conversion to TypeScript for improved maintainability and type safety:

- [ ] `merge-modular-to-allinone.js` → `merge-modular-to-allinone.ts`
- [ ] `cicd-automation.js` → `cicd-automation.ts`
- [ ] `health-check.js` → `health-check.ts`
- [ ] `merger-ui-server.js` → `merger-ui-server.ts`

Scripts already in TypeScript:
- [x] `h3x-modular-clean.ts`
- [x] `h3x-modular-backup.ts`

> Begin conversion by creating a TypeScript version of each script, ensuring feature parity and updating documentation/usage examples accordingly.

---

_Last updated: 2025-06-01_
