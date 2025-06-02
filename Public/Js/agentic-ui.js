// agentic-ui.js
// Enhanced Agentic Interface with Super Intelligent Regulator integration

class AgenticInterface {
  constructor() {
    this.statusLog = document.getElementById('status-log');
    this.isRunning = false;
    this.agentActions = [];
    this.intelligenceMode = 'learning'; // learning, adaptive, autonomous, superintelligent
    this.sirIntegration = false;
    
    this.init();
  }

  init() {
    // Listen to all SIR events for logging
    window.sirHost.on('log', (msg) => {
      this.addLogEntry(msg, 'info');
    });
    
    window.sirHost.on('cellSelected', ({q, r, from}) => {
      this.addLogEntry(`Cell (${q},${r}) selected${from ? ` from (${from.q},${from.r})` : ''}`, 'navigation');
    });
    
    window.sirHost.on('loopChanged', ({cell, action, loop}) => {
      const loopDesc = loop.endB !== null ? 
        `${loop.coupled ? 'coupled' : 'open'} loop between ${loop.endA} and ${loop.endB}` :
        `open loop at ${loop.endA}`;
      this.addLogEntry(`${action} ${loopDesc} in cell (${cell.q},${cell.r})`, 'loop');
    });
    
    // Listen to SIR intelligence events
    window.sirHost.on('intelligentRegulation', (regulation) => {
      this.addLogEntry(`🤖 Intelligent regulation: ${regulation.actions.length} actions executed`, 'intelligence');
    });
    
    window.sirHost.on('learningUpdate', (update) => {
      this.addLogEntry(`🧠 Learning update: ${update.recentPatterns.length} new patterns`, 'learning');
    });
    
    window.sirHost.on('performanceAssessment', (assessment) => {
      this.addLogEntry(`📊 Performance: ${(assessment.successRate * 100).toFixed(1)}% success rate`, 'performance');
    });
    
    window.sirHost.on('regulationModeChanged', ({oldMode, newMode}) => {
      this.addLogEntry(`🔄 Regulation mode: ${oldMode} → ${newMode}`, 'mode');
    });
    
    window.sirHost.on('intelligenceLevelChanged', ({oldLevel, newLevel}) => {
      this.addLogEntry(`🧠 Intelligence level: ${oldLevel} → ${newLevel}`, 'intelligence');
    });
    
    // Add enhanced control buttons
    this.addEnhancedControlButtons();
    
    // Check for SIR integration
    this.checkSIRIntegration();
    
    // Initialize with a welcome message
    this.addLogEntry('Enhanced Agentic Interface initialized with SIR integration.', 'system');
  }

  checkSIRIntegration() {
    setTimeout(() => {
      if (window.sirHost && window.sirHost.learningEngine) {
        this.sirIntegration = true;
        this.addLogEntry('✅ SIR Learning Engine detected and integrated', 'system');
        this.updateIntelligenceDisplay();
      } else {
        this.addLogEntry('⚠️ SIR Learning Engine not found - running in basic mode', 'warning');
      }
    }, 1000);
  }

  addEnhancedControlButtons() {
    const container = document.createElement('div');
    container.style.cssText = `
      margin: 1rem 0;
      padding: 1rem;
      background: rgba(127, 209, 185, 0.1);
      border-radius: 8px;
      border: 1px solid rgba(127, 209, 185, 0.3);
    `;
    
    container.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: #7fd1b9;">Super Intelligent Regulator Controls</h4>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button id="sir-demo-btn" style="padding: 0.5rem 1rem; background: #7fd1b9; color: #1a1a1a; border: none; border-radius: 4px; cursor: pointer;">
            🤖 SIR Demo
          </button>
          <button id="learning-demo-btn" style="padding: 0.5rem 1rem; background: #ffd580; color: #1a1a1a; border: none; border-radius: 4px; cursor: pointer;">
            🧠 Learning Demo
          </button>
          <button id="intelligence-toggle-btn" style="padding: 0.5rem 1rem; background: #ff9580; color: #1a1a1a; border: none; border-radius: 4px; cursor: pointer;">
            🎯 Toggle Intelligence
          </button>
          <button id="sir-status-btn" style="padding: 0.5rem 1rem; background: #9580ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            📊 SIR Status
          </button>
        </div>
      </div>
      <div id="intelligence-display" style="padding: 0.5rem; background: rgba(0,0,0,0.2); border-radius: 4px; font-family: monospace; font-size: 0.9rem;">
        <div>Intelligence: <span id="intelligence-level">learning</span> | Regulation: <span id="regulation-mode">passive</span> | Autonomy: <span id="autonomy-level">0.3</span></div>
      </div>
    `;
    
    // Insert before status log
    this.statusLog.parentNode.insertBefore(container, this.statusLog);
    
    // Add event listeners
    document.getElementById('sir-demo-btn').addEventListener('click', () => this.runSIRDemo());
    document.getElementById('learning-demo-btn').addEventListener('click', () => this.runLearningDemo());
    document.getElementById('intelligence-toggle-btn').addEventListener('click', () => this.toggleIntelligenceMode());
    document.getElementById('sir-status-btn').addEventListener('click', () => this.showSIRStatus());
  }

  updateIntelligenceDisplay() {
    if (window.sirHost) {
      const status = window.sirHost.getSIRStatus();
      
      const levelEl = document.getElementById('intelligence-level');
      const modeEl = document.getElementById('regulation-mode');
      const autonomyEl = document.getElementById('autonomy-level');
      
      if (levelEl) levelEl.textContent = status.intelligenceLevel;
      if (modeEl) modeEl.textContent = status.regulationMode;
      if (autonomyEl) autonomyEl.textContent = status.autonomyLevel.toFixed(1);
    }
  }

  async runSIRDemo() {
    if (this.isRunning) {
      this.addLogEntry('SIR demo already running.', 'error');
      return;
    }
    
    this.isRunning = true;
    this.addLogEntry('🤖 Starting Super Intelligent Regulator demonstration...', 'system');
    
    try {
      // Phase 1: Basic navigation with learning
      this.addLogEntry('Phase 1: Intelligent navigation patterns', 'demo');
      await this.demonstrateIntelligentNavigation();
      
      // Phase 2: Pattern recognition
      this.addLogEntry('Phase 2: Pattern recognition and learning', 'demo');
      await this.demonstratePatternRecognition();
      
      // Phase 3: Autonomous decision making
      this.addLogEntry('Phase 3: Autonomous decision execution', 'demo');
      await this.demonstrateAutonomousDecisions();
      
      // Phase 4: Self-regulation
      this.addLogEntry('Phase 4: Self-regulation and adaptation', 'demo');
      await this.demonstrateSelfRegulation();
      
      this.addLogEntry('✅ SIR demonstration completed successfully', 'success');
      
    } catch (error) {
      this.addLogEntry(`❌ SIR demo error: ${error.message}`, 'error');
    } finally {
      this.isRunning = false;
    }
  }

  async demonstrateIntelligentNavigation() {
    const navSequence = [
      { q: 1, r: 0 }, { q: 1, r: 1 }, { q: 0, r: 1 }, 
      { q: -1, r: 1 }, { q: -1, r: 0 }, { q: 0, r: 0 }
    ];
    
    for (const cell of navSequence) {
      const result = window.sirHost.executeAgenticCommand({
        type: 'navigate',
        q: cell.q,
        r: cell.r
      });
      
      this.addLogEntry(`Navigated to (${cell.q},${cell.r}) with intelligence`, 'navigation');
      await this.sleep(800);
    }
  }

  async demonstratePatternRecognition() {
    // Create a pattern of loops for learning
    const loopPattern = [
      { a: 0, b: 1, coupled: true },
      { a: 1, b: 2, coupled: true },
      { a: 2, b: 0, coupled: true },
      { a: 0, b: null, coupled: false }, // Open loop
    ];
    
    for (const loop of loopPattern) {
      window.sirHost.executeAgenticCommand({
        type: 'createLoop',
        a: loop.a,
        b: loop.b,
        coupled: loop.coupled
      });
      
      this.addLogEntry(`Created ${loop.coupled ? 'coupled' : 'open'} loop for pattern analysis`, 'learning');
      await this.sleep(600);
    }
    
    // Let SIR analyze the patterns
    await this.sleep(2000);
    this.addLogEntry('Pattern analysis completed by SIR learning engine', 'learning');
  }

  async demonstrateAutonomousDecisions() {
    if (!window.sirHost.learningEngine) {
      this.addLogEntry('Learning engine not available for autonomous decisions', 'warning');
      return;
    }
    
    // Trigger intelligent actions
    for (let i = 0; i < 3; i++) {
      const result = window.sirHost.executeAgenticCommand({
        type: 'intelligentAction'
      });
      
      if (result.success) {
        this.addLogEntry(`Autonomous decision executed successfully`, 'intelligence');
      } else {
        this.addLogEntry(`Autonomous decision: ${result.reason}`, 'intelligence');
      }
      
      await this.sleep(1500);
    }
  }

  async demonstrateSelfRegulation() {
    // Show current performance
    const status = window.sirHost.getSIRStatus();
    this.addLogEntry(`Current autonomy level: ${status.autonomyLevel.toFixed(1)}`, 'performance');
    
    // Wait for regulation cycles
    await this.sleep(3000);
    
    const newStatus = window.sirHost.getSIRStatus();
    this.addLogEntry(`Self-regulation completed. New autonomy: ${newStatus.autonomyLevel.toFixed(1)}`, 'performance');
  }

  async runLearningDemo() {
    if (!window.sirHost.learningEngine) {
      this.addLogEntry('❌ Learning engine not available', 'error');
      return;
    }
    
    this.addLogEntry('🧠 Starting learning demonstration...', 'system');
    
    // Generate learning data
    const learningData = [
      { action: 'navigate', result: 'success', pattern: 'sequential' },
      { action: 'navigate', result: 'success', pattern: 'sequential' },
      { action: 'createLoop', result: 'success', pattern: 'structural' },
      { action: 'navigate', result: 'success', pattern: 'sequential' },
      { action: 'createLoop', result: 'success', pattern: 'structural' }
    ];
    
    for (const data of learningData) {
      window.sirHost.recordExperience({
        type: 'learning_sample',
        data: data,
        success: data.result === 'success'
      });
      
      this.addLogEntry(`Learning sample recorded: ${data.action} → ${data.result}`, 'learning');
      await this.sleep(500);
    }
    
    this.addLogEntry('✅ Learning demonstration completed', 'success');
  }

  toggleIntelligenceMode() {
    const modes = ['learning', 'adaptive', 'autonomous', 'superintelligent'];
    const currentIndex = modes.indexOf(this.intelligenceMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];
    
    this.intelligenceMode = newMode;
    window.sirHost.setIntelligenceLevel(newMode);
    
    this.addLogEntry(`🎯 Intelligence mode changed to: ${newMode}`, 'mode');
    this.updateIntelligenceDisplay();
  }

  showSIRStatus() {
    if (!window.sirHost) {
      this.addLogEntry('❌ SIR Host not available', 'error');
      return;
    }
    
    const status = window.sirHost.getSIRStatus();
    
    this.addLogEntry('📊 === SIR STATUS REPORT ===', 'status');
    this.addLogEntry(`Intelligence Level: ${status.intelligenceLevel}`, 'status');
    this.addLogEntry(`Regulation Mode: ${status.regulationMode}`, 'status');
    this.addLogEntry(`Autonomy Level: ${status.autonomyLevel.toFixed(2)}`, 'status');
    this.addLogEntry(`Total Decisions: ${status.performanceMetrics.decisions}`, 'status');
    this.addLogEntry(`Success Rate: ${((status.performanceMetrics.successfulActions / Math.max(1, status.performanceMetrics.decisions)) * 100).toFixed(1)}%`, 'status');
    
    if (status.learningEngine) {
      this.addLogEntry(`Learning Experiences: ${status.learningEngine.metrics.totalExperiences}`, 'status');
      this.addLogEntry(`Patterns Discovered: ${status.learningEngine.patternsDiscovered}`, 'status');
      this.addLogEntry(`Prediction Success: ${status.learningEngine.metrics.successfulPredictions}`, 'status');
    }
    
    this.addLogEntry(`Recent Decisions: ${status.recentDecisions.length}`, 'status');
    this.addLogEntry('=== END STATUS REPORT ===', 'status');
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
