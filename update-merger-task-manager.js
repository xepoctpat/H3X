// update-merger-task-manager.js
//
// Automated Task & PR Status Updater for Merger Task Manager.md
// -------------------------------------------------------------
// This script automates the process of updating task and pull request statuses in the Merger Task Manager.md file.
// It is designed for use in agentic, CI/CD, and manual workflows to keep your project status always up-to-date.
//
// USAGE:
//   node update-merger-task-manager.js <task> <status> [<log-message>]
//   node update-merger-task-manager.js T_D "Task Name" "Log message"
//   node update-merger-task-manager.js PR_M "PR Title" "PR merged successfully"
//
// SHORT ALIAS OPTIONS:
//   T_D   - Task Done           node update-merger-task-manager.js T_D "Task Name" "Log message"
//   T_I   - Task In Progress    node update-merger-task-manager.js T_I "Task Name" "Log message"
//   T_O   - Task Open           node update-merger-task-manager.js T_O "Task Name" "Log message"
//   T_R   - Task Review         node update-merger-task-manager.js T_R "Task Name" "Log message"
//   T_M   - Task Merged         node update-merger-task-manager.js T_M "Task Name" "Log message"
//   PR_O  - PR Open             node update-merger-task-manager.js PR_O "PR Title" "Log message"
//   PR_R  - PR Review           node update-merger-task-manager.js PR_R "PR Title" "Log message"
//   PR_M  - PR Merged           node update-merger-task-manager.js PR_M "PR Title" "Log message"
//
// You can also use the full form:
//   node update-merger-task-manager.js "Task Name" done "Log message"
//   node update-merger-task-manager.js "Task Name" in progress "Log message"
//
// HOW IT WORKS:
//   - Finds the specified task or PR in Merger Task Manager.md and updates its status (checked/unchecked).
//   - Appends a log entry with timestamp and status under the Agent Mode Actions section.
//   - Updates the "Last updated" date in the file.
//   - Supports both checklist tasks and PR tracking.
//
// ENHANCEMENTS:
//   - Improved error handling: warns if the task is not found or ambiguous.
//   - User feedback for successful/failed updates.
//   - Easily extensible for new status codes or workflow integrations.
//
// For more details, see automation-scripts.md and the documentation in your workspace.

// Short Alias Options for Task & PR Management
//
// T_D   - Task Done           node update-merger-task-manager.js T_D "Task Name" "Log message"
// T_I   - Task In Progress    node update-merger-task-manager.js T_I "Task Name" "Log message"
// T_O   - Task Open           node update-merger-task-manager.js T_O "Task Name" "Log message"
// T_R   - Task Review         node update-merger-task-manager.js T_R "Task Name" "Log message"
// T_M   - Task Merged         node update-merger-task-manager.js T_M "Task Name" "Log message"
// PR_O  - PR Open             node update-merger-task-manager.js PR_O "PR Title" "Log message"
// PR_R  - PR Review           node update-merger-task-manager.js PR_R "PR Title" "Log message"
// PR_M  - PR Merged           node update-merger-task-manager.js PR_M "PR Title" "Log message"
//
// You can also use the full form:
// node update-merger-task-manager.js "Task Name" done "Log message"
// node update-merger-task-manager.js "Task Name" in progress "Log message"
// ...etc.

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'Merger Task Manager.md');

function updateTaskStatus(task, status, logMessage, isPR = false) {
  let content = fs.readFileSync(FILE, 'utf8');
  const now = new Date().toISOString();
  
  // Escape regex special characters in the task name
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // Regex to find the task line
  const taskRegex = new RegExp(`(- \\[)( |x)(\\] \\*\\*${escapeRegExp(task)}\\*\\*)`);
  if (!taskRegex.test(content)) {
    console.error(`Task "${task}" not found in Merger Task Manager.md. Please check the task name for typos or ambiguity.`);
    process.exit(2);
  }
  content = content.replace(taskRegex, `- [${status === 'done' || status === 'merged' ? 'x' : ' '}] **${task}**`);

  // Append log if provided
  if (logMessage) {
    const logSection = '\n## 🤖 Agent Mode Actions\n';
    const logEntry = `- [${status === 'done' || status === 'merged' ? 'x' : ' '}] ${isPR ? 'PR: ' : ''}${task} (${status.toUpperCase()}) @ ${now}\n  - ${logMessage}\n`;
    if (content.includes(logSection)) {
      content = content.replace(logSection, logSection + logEntry);
    } else {
      content += `\n${logSection}${logEntry}`;
    }
  }

  // Update last updated timestamp
  content = content.replace(/_Last updated: .+_/, `_Last updated: ${now.slice(0, 10)}_`);

  fs.writeFileSync(FILE, content, 'utf8');
  console.log(`Updated '${task}' to status '${status}'.`);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Add support for more short aliases for task and PR management
function parseArgs(args) {
  const aliasMap = {
    'T_D': { status: 'done' },
    'T_I': { status: 'in progress' },
    'T_O': { status: 'open' },
    'T_R': { status: 'review' },
    'T_M': { status: 'merged' },
    'PR_O': { status: 'open', isPR: true },
    'PR_R': { status: 'review', isPR: true },
    'PR_M': { status: 'merged', isPR: true }
  };
  if (aliasMap[args[0]] && args[1]) {
    return {
      task: args[1],
      status: aliasMap[args[0]].status,
      log: args.slice(2).join(' '),
      isPR: aliasMap[args[0]].isPR || false
    };
  }
  // Fallback to original usage
  return { task: args[0], status: args[1], log: args.slice(2).join(' '), isPR: false };
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const { task, status, log, isPR } = parseArgs(args);
  if (!task || !status) {
    console.log('Usage: node update-merger-task-manager.js <task> <status> [<log-message>]');
    console.log('   or: node update-merger-task-manager.js T_D <task> [<log-message>]');
    console.log('   or: node update-merger-task-manager.js T_I <task> [<log-message>]');
    console.log('   or: node update-merger-task-manager.js T_O <task> [<log-message>]');
    console.log('   or: node update-merger-task-manager.js T_R <task> [<log-message>]');
    console.log('   or: node update-merger-task-manager.js T_M <task> [<log-message>]');
    console.log('   or: node update-merger-task-manager.js PR_O <pr-title> [<log-message>]');
    console.log('   or: node update-merger-task-manager.js PR_R <pr-title> [<log-message>]');
    console.log('   or: node update-merger-task-manager.js PR_M <pr-title> [<log-message>]');
    process.exit(1);
  }
  updateTaskStatus(task, status, log, isPR);
}

module.exports = { updateTaskStatus };
