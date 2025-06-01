// agentic-ui.js
// Agentic interface for automated control and demonstration

class AgenticInterface {
  constructor() {
    this.statusLog = document.getElementById('status-log');
    this.isRunning = false;
    this.agentActions = [];
    
    this.init();
  }

  init() {
    // Listen to all SIR events for logging
    window.sirHost.on('log', (msg) => {
      this.addLogEntry(msg, 'info');
    });
    
    window.sirHost.on('cellSelected', ({q, r}) => {
      this.addLogEntry(`Cell (${q},${r}) selected`, 'navigation');
    });
    
    window.sirHost.on('loopChanged', ({cell, action, loop}) => {
      const loopDesc = loop.endB !== null ? 
        `${loop.coupled ? 'coupled' : 'open'} loop between ${loop.endA} and ${loop.endB}` :
        `open loop at ${loop.endA}`;
      this.addLogEntry(`${action} ${loopDesc} in cell (${cell.q},${cell.r})`, 'loop');
    });
    
    // Add control buttons for agentic demonstration
    this.addControlButtons();
    
    // Initialize with a welcome message
    this.addLogEntry('Agentic interface initialized. Ready for commands.', 'system');
  }

  addLogEntry(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.style.marginBottom = '0.5rem';
    entry.style.color = this.getLogColor(type);
    entry.innerHTML = `<span style="color:#666">[${timestamp}]</span> ${message}`;
    
    this.statusLog.appendChild(entry);
    this.statusLog.scrollTop = this.statusLog.scrollHeight;
  }

  getLogColor(type) {
    switch(type) {
      case 'system': return '#7fd1b9';
      case 'navigation': return '#ffd580';
      case 'loop': return '#ff6b6b';
      case 'error': return '#ff4444';
      default: return '#f3f3f3';
    }
  }

  addControlButtons() {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '1rem';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '1rem';
    buttonContainer.style.justifyContent = 'center';
    
    // Demo automation button
    const demoBtn = document.createElement('button');
    demoBtn.textContent = 'Run Agent Demo';
    demoBtn.style.background = '#7fd1b9';
    demoBtn.style.color = '#181c24';
    demoBtn.style.border = 'none';
    demoBtn.style.borderRadius = '5px';
    demoBtn.style.padding = '0.5rem 1rem';
    demoBtn.style.cursor = 'pointer';
    demoBtn.onclick = () => this.runAgentDemo();
    
    // Clear log button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear Log';
    clearBtn.style.background = '#666';
    clearBtn.style.color = '#fff';
    clearBtn.style.border = 'none';
    clearBtn.style.borderRadius = '5px';
    clearBtn.style.padding = '0.5rem 1rem';
    clearBtn.style.cursor = 'pointer';
    clearBtn.onclick = () => this.clearLog();
    
    buttonContainer.appendChild(demoBtn);
    buttonContainer.appendChild(clearBtn);
    
    // Insert after status log
    this.statusLog.parentNode.appendChild(buttonContainer);
  }

  clearLog() {
    this.statusLog.innerHTML = '';
    this.addLogEntry('Log cleared.', 'system');
  }

  async runAgentDemo() {
    if (this.isRunning) {
      this.addLogEntry('Agent demo already running.', 'error');
      return;
    }
    
    this.isRunning = true;
    this.addLogEntry('Starting agent demonstration...', 'system');
    
    try {
      // Demo sequence: navigate cells and create loops
      const demoSequence = [
        { action: 'navigate', q: 1, r: 0, delay: 1000 },
        { action: 'createLoop', a: 0, b: 1, coupled: true, delay: 1500 },
        { action: 'navigate', q: -1, r: 1, delay: 1000 },
        { action: 'createLoop', a: 1, b: null, coupled: false, delay: 1500 },
        { action: 'createLoop', a: 0, b: 2, coupled: true, delay: 1500 },
        { action: 'navigate', q: 0, r: -1, delay: 1000 },
        { action: 'createLoop', a: 0, b: 1, coupled: true, delay: 1000 },
        { action: 'createLoop', a: 1, b: 2, coupled: true, delay: 1000 },
        { action: 'createLoop', a: 2, b: 0, coupled: true, delay: 1500 }
      ];
      
      for (const step of demoSequence) {
        await this.executeAgentAction(step);
        await this.delay(step.delay);
      }
      
      this.addLogEntry('Agent demonstration completed.', 'system');
    } catch (error) {
      this.addLogEntry(`Agent demo error: ${error.message}`, 'error');
    } finally {
      this.isRunning = false;
    }
  }

  async executeAgentAction(action) {
    switch (action.action) {
      case 'navigate':
        this.addLogEntry(`Agent navigating to cell (${action.q},${action.r})`, 'system');
        window.sirHost.goToCell(action.q, action.r);
        break;
      case 'createLoop':
        const loopDesc = action.b !== null ? 
          `${action.coupled ? 'coupled' : 'open'} loop between ${action.a} and ${action.b}` :
          `open loop at ${action.a}`;
        this.addLogEntry(`Agent creating ${loopDesc}`, 'system');
        window.sirHost.createLoop(action.a, action.b, action.coupled);
        break;
      default:
        throw new Error(`Unknown agent action: ${action.action}`);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API for external agent control
  getSystemState() {
    return {
      currentCell: window.sirHost.getCurrentCell(),
      allCells: Array.from(window.sirHost.cellMap.entries()).map(([key, cell]) => cell),
      isRunning: this.isRunning
    };
  }

  executeCommand(command) {
    try {
      switch (command.type) {
        case 'navigate':
          window.sirHost.goToCell(command.q, command.r);
          return { success: true, message: `Navigated to (${command.q},${command.r})` };
        case 'createLoop':
          window.sirHost.createLoop(command.a, command.b, command.coupled);
          return { success: true, message: 'Loop created' };
        case 'removeLoop':
          window.sirHost.removeLoop(command.a, command.b);
          return { success: true, message: 'Loop removed' };
        case 'getState':
          return { success: true, data: this.getSystemState() };
        default:
          throw new Error(`Unknown command type: ${command.type}`);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.agenticInterface = new AgenticInterface();
  
  // Expose global agent API
  window.agent = {
    executeCommand: (cmd) => window.agenticInterface.executeCommand(cmd),
    getState: () => window.agenticInterface.getSystemState(),
    demo: () => window.agenticInterface.runAgentDemo()
  };
  
  console.log('Agentic interface ready. Use window.agent for programmatic control.');
});
