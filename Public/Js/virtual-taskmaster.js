// Virtual Taskmaster - Synapse Taskflow Legacy Interface Core

document.addEventListener('DOMContentLoaded', function() {
  initializeVirtualTaskmaster();
});

function initializeVirtualTaskmaster() {
  console.log('Virtual Taskmaster: Synapse Taskflow Legacy Interface initialized');
  
  // Create taskmaster interface if it doesn't exist
  if (!document.getElementById('taskmaster-container')) {
    createTaskmasterInterface();
  }
  
  setupTaskmasterEvents();
}

function createTaskmasterInterface() {
  const container = document.createElement('div');
  container.id = 'taskmaster-container';
  container.innerHTML = `
    <div class="taskmaster-panel">
      <h3>Virtual Taskmaster - Synapse Control</h3>
      <div class="task-dashboard">
        <div class="status-grid">
          <div class="status-card">
            <h4>Active Tasks</h4>
            <div class="counter" id="active-tasks">0</div>
          </div>
          <div class="status-card">
            <h4>Completed</h4>
            <div class="counter" id="completed-tasks">0</div>
          </div>
          <div class="status-card">
            <h4>System Load</h4>
            <div class="counter" id="system-load">25%</div>
          </div>
        </div>
        
        <div class="task-controls">
          <input type="text" id="task-input" placeholder="Enter task description..." />
          <button id="add-task">Add Task</button>
          <button id="auto-mode">Auto Mode</button>
          <button id="clear-all">Clear All</button>
        </div>
        
        <div class="task-list" id="task-list">
          <div class="task-header">Task Queue</div>
        </div>
        
        <div class="synapse-log" id="synapse-log">
          <div class="log-header">Synapse Activity Log</div>
          <div class="log-content">
            <div class="log-entry">System initialized - Virtual Taskmaster online</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(container);
}

function setupTaskmasterEvents() {
  const addTaskBtn = document.getElementById('add-task');
  const autoModeBtn = document.getElementById('auto-mode');
  const clearAllBtn = document.getElementById('clear-all');
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');
  const synapseLog = document.getElementById('synapse-log').querySelector('.log-content');
  
  let taskCounter = 0;
  let completedCounter = 0;
  let autoMode = false;
  let autoInterval;
  
  // Task management
  if (addTaskBtn && taskInput) {
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        addTask();
      }
    });
  }
  
  if (autoModeBtn) {
    autoModeBtn.addEventListener('click', toggleAutoMode);
  }
  
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllTasks);
  }
  
  function addTask() {
    const description = taskInput.value.trim();
    if (!description) return;
    
    taskCounter++;
    const taskId = 'task-' + taskCounter;
    
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.id = taskId;
    taskElement.innerHTML = `
      <div class="task-content">
        <span class="task-id">#${taskCounter}</span>
        <span class="task-desc">${description}</span>
        <span class="task-status">Pending</span>
      </div>
      <div class="task-actions">
        <button onclick="completeTask('${taskId}')">Complete</button>
        <button onclick="removeTask('${taskId}')">Remove</button>
      </div>
    `;
    
    taskList.appendChild(taskElement);
    taskInput.value = '';
    
    updateCounters();
    logActivity(`Task #${taskCounter} added: ${description}`);
    
    // Auto-execute after 3 seconds in auto mode
    if (autoMode) {
      setTimeout(() => {
        if (document.getElementById(taskId)) {
          completeTask(taskId);
        }
      }, 3000);
    }
  }
  
  function toggleAutoMode() {
    autoMode = !autoMode;
    autoModeBtn.textContent = autoMode ? 'Disable Auto' : 'Auto Mode';
    autoModeBtn.style.background = autoMode ? '#ff4444' : '#0f3460';
    
    if (autoMode) {
      logActivity('🤖 Auto Mode enabled - tasks will auto-complete');
      startAutoTasks();
    } else {
      logActivity('⏹️ Auto Mode disabled');
      if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
      }
    }
  }
  
  function startAutoTasks() {
    const autoTasks = [
      'Monitor system performance',
      'Optimize neural pathways',
      'Process data streams',
      'Update task priorities',
      'Synchronize synapse networks',
      'Calibrate response systems'
    ];
    
    autoInterval = setInterval(() => {
      if (autoMode) {
        const randomTask = autoTasks[Math.floor(Math.random() * autoTasks.length)];
        taskInput.value = randomTask;
        addTask();
      }
    }, 5000);
  }
  
  function clearAllTasks() {
    const tasks = taskList.querySelectorAll('.task-item');
    tasks.forEach(task => task.remove());
    taskCounter = 0;
    completedCounter = 0;
    updateCounters();
    logActivity('🗑️ All tasks cleared');
  }
  
  function updateCounters() {
    const activeTasks = taskList.querySelectorAll('.task-item').length;
    document.getElementById('active-tasks').textContent = activeTasks;
    document.getElementById('completed-tasks').textContent = completedCounter;
    
    // Update system load based on active tasks
    const load = Math.min(95, 25 + (activeTasks * 5));
    document.getElementById('system-load').textContent = load + '%';
  }
  
  function logActivity(message) {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `<span class="log-time">[${new Date().toLocaleTimeString()}]</span> ${message}`;
    synapseLog.appendChild(logEntry);
    
    // Keep only last 20 entries
    const entries = synapseLog.querySelectorAll('.log-entry');
    if (entries.length > 20) {
      entries[0].remove();
    }
    
    synapseLog.scrollTop = synapseLog.scrollHeight;
  }
  
  // Global functions for task actions
  window.completeTask = function(taskId) {
    const task = document.getElementById(taskId);
    if (task) {
      task.querySelector('.task-status').textContent = 'Completed';
      task.style.opacity = '0.6';
      task.querySelector('.task-actions').style.display = 'none';
      
      completedCounter++;
      updateCounters();
      
      const desc = task.querySelector('.task-desc').textContent;
      logActivity(`✅ Task completed: ${desc}`);
      
      // Remove after 3 seconds
      setTimeout(() => {
        if (task.parentNode) {
          task.remove();
          updateCounters();
        }
      }, 3000);
    }
  };
  
  window.removeTask = function(taskId) {
    const task = document.getElementById(taskId);
    if (task) {
      const desc = task.querySelector('.task-desc').textContent;
      task.remove();
      updateCounters();
      logActivity(`🗑️ Task removed: ${desc}`);
    }
  };
}

// CSS injection for styling
const style = document.createElement('style');
style.textContent = `
  .taskmaster-panel {
    background: #1a1a2e;
    color: #eee;
    padding: 20px;
    border-radius: 8px;
    margin: 20px;
    font-family: 'Segoe UI', sans-serif;
  }
  
  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .status-card {
    background: #16213e;
    border: 2px solid #0f3460;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
  }
  
  .status-card h4 {
    margin: 0 0 10px 0;
    color: #ccc;
    font-size: 14px;
  }
  
  .counter {
    font-size: 24px;
    font-weight: bold;
    color: #00ff41;
  }
  
  .task-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  
  .task-controls input {
    flex: 1;
    min-width: 200px;
    padding: 10px;
    background: #16213e;
    border: 1px solid #0f3460;
    border-radius: 4px;
    color: white;
  }
  
  .task-controls button {
    background: #0f3460;
    color: white;
    border: 1px solid #1a73e8;
    padding: 10px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
  }
  
  .task-controls button:hover {
    background: #1a73e8;
  }
  
  .task-list {
    background: #16213e;
    border: 2px solid #0f3460;
    border-radius: 8px;
    margin-bottom: 20px;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .task-header {
    background: #0f3460;
    padding: 10px;
    font-weight: bold;
    border-bottom: 1px solid #1a73e8;
  }
  
  .task-item {
    padding: 12px;
    border-bottom: 1px solid #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .task-content {
    display: flex;
    gap: 15px;
    align-items: center;
    flex: 1;
  }
  
  .task-id {
    color: #888;
    font-weight: bold;
    min-width: 40px;
  }
  
  .task-desc {
    flex: 1;
  }
  
  .task-status {
    color: #ffa500;
    font-size: 12px;
    min-width: 80px;
  }
  
  .task-actions {
    display: flex;
    gap: 5px;
  }
  
  .task-actions button {
    background: #333;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
  }
  
  .task-actions button:hover {
    background: #555;
  }
  
  .synapse-log {
    background: #16213e;
    border: 2px solid #0f3460;
    border-radius: 8px;
  }
  
  .log-header {
    background: #0f3460;
    padding: 10px;
    font-weight: bold;
    border-bottom: 1px solid #1a73e8;
  }
  
  .log-content {
    height: 150px;
    overflow-y: auto;
    padding: 10px;
    font-size: 12px;
  }
  
  .log-entry {
    margin-bottom: 5px;
    padding: 2px 0;
  }
  
  .log-time {
    color: #888;
    margin-right: 8px;
  }
`;
document.head.appendChild(style);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeVirtualTaskmaster };
}
