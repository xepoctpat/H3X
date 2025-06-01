// sirHost.js
// SIR (Super Intelligent Regulator) Host: Advanced agentic controller with learning capabilities

class SIRHost {
  constructor() {
    this.currentCell = { q: 0, r: 0 };
    this.cellMap = new Map();
    this.listeners = {};
    
    // Super Intelligent Regulator capabilities
    this.learningEngine = null;
    this.intelligenceLevel = 'learning'; // learning, adaptive, autonomous, superintelligent
    this.regulationMode = 'passive'; // passive, active, proactive, predictive
    this.decisionHistory = [];
    this.performanceMetrics = {
      decisions: 0,
      successfulActions: 0,
      failedActions: 0,
      learningEvents: 0,
      adaptations: 0
    };
    
    this.autonomyLevel = 0.3; // 0-1 scale of autonomous operation
    this.confidenceThreshold = 0.7;
    
    // Initialize after DOM loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeSIR());
    } else {
      setTimeout(() => this.initializeSIR(), 100);
    }
  }

  initializeSIR() {
    // Initialize learning engine
    if (window.SIRLearningEngine) {
      this.learningEngine = new window.SIRLearningEngine();
      this.learningEngine.on = this.on.bind(this);
      this.learningEngine.emit = this.emit.bind(this);
      this.log('🧠 Super Intelligent Regulator initialized with learning engine');
    } else {
      this.log('⚠️ SIR Learning Engine not found, operating in basic mode');
    }
    
    // Start intelligent regulation
    this.startIntelligentRegulation();
  }

  startIntelligentRegulation() {
    // Intelligence monitoring loop
    setInterval(() => {
      this.performIntelligentRegulation();
    }, 10000); // Every 10 seconds
    
    // Performance assessment loop
    setInterval(() => {
      this.assessPerformance();
    }, 30000); // Every 30 seconds
    
    this.log('🤖 Intelligent regulation started');
  }

  performIntelligentRegulation() {
    const regulation = {
      timestamp: Date.now(),
      mode: this.regulationMode,
      actions: []
    };
    
    try {
      // Assess current state
      const currentState = this.assessCurrentState();
      
      // Make intelligent decisions based on state
      const decisions = this.makeIntelligentDecisions(currentState);
      
      // Execute approved decisions
      decisions.forEach(decision => {
        if (this.shouldExecuteDecision(decision)) {
          this.executeIntelligentDecision(decision);
          regulation.actions.push(decision);
        }
      });
      
      // Record regulation event
      this.recordExperience({
        type: 'regulation',
        state: currentState,
        decisions: decisions,
        actions: regulation.actions,
        success: regulation.actions.length > 0
      });
      
      // Emit regulation update
      this.emit('intelligentRegulation', regulation);
      
    } catch (error) {
      this.log(`❌ Intelligent regulation error: ${error.message}`);
    }
  }

  assessCurrentState() {
    return {
      currentCell: this.currentCell,
      cellData: this.getCellData(this.currentCell.q, this.currentCell.r),
      totalCells: this.cellMap.size,
      recentActivity: this.getRecentActivity(),
      autonomyLevel: this.autonomyLevel,
      performanceMetrics: this.performanceMetrics,
      learningStatus: this.learningEngine ? this.learningEngine.metrics : null,
      timestamp: Date.now()
    };
  }

  makeIntelligentDecisions(state) {
    const decisions = [];
    
    // Decision 1: Navigation optimization
    if (this.shouldOptimizeNavigation(state)) {
      const navDecision = this.planOptimalNavigation(state);
      if (navDecision) decisions.push(navDecision);
    }
    
    // Decision 2: Loop structure optimization
    if (this.shouldOptimizeLoops(state)) {
      const loopDecision = this.planLoopOptimization(state);
      if (loopDecision) decisions.push(loopDecision);
    }
    
    // Decision 3: Learning focus adjustment
    if (this.learningEngine && this.shouldAdjustLearning(state)) {
      const learningDecision = this.planLearningAdjustment(state);
      if (learningDecision) decisions.push(learningDecision);
    }
    
    // Decision 4: Autonomy level adjustment
    if (this.shouldAdjustAutonomy(state)) {
      const autonomyDecision = this.planAutonomyAdjustment(state);
      if (autonomyDecision) decisions.push(autonomyDecision);
    }
    
    return decisions;
  }

  shouldExecuteDecision(decision) {
    // Check confidence threshold
    if (decision.confidence < this.confidenceThreshold) {
      return false;
    }
    
    // Check autonomy permissions
    if (decision.autonomyRequired > this.autonomyLevel) {
      this.log(`🚫 Decision blocked: requires autonomy ${decision.autonomyRequired}, current: ${this.autonomyLevel}`);
      return false;
    }
    
    // Check for safety constraints
    if (decision.riskLevel && decision.riskLevel > 0.8) {
      this.log(`🚫 Decision blocked: high risk level ${decision.riskLevel}`);
      return false;
    }
    
    return true;
  }

  executeIntelligentDecision(decision) {
    try {
      this.log(`🎯 Executing intelligent decision: ${decision.description}`);
      
      const result = decision.execute();
      
      this.performanceMetrics.decisions++;
      
      if (result && result.success) {
        this.performanceMetrics.successfulActions++;
        this.log(`✅ Decision executed successfully: ${decision.description}`);
      } else {
        this.performanceMetrics.failedActions++;
        this.log(`❌ Decision execution failed: ${decision.description}`);
      }
      
      // Record decision in history
      this.decisionHistory.push({
        ...decision,
        executedAt: Date.now(),
        result: result
      });
      
      // Learn from the decision outcome
      this.recordExperience({
        type: 'decision_execution',
        decision: decision,
        result: result,
        success: result && result.success
      });
      
    } catch (error) {
      this.performanceMetrics.failedActions++;
      this.log(`❌ Decision execution error: ${error.message}`);
    }
  }

  // === INTELLIGENT DECISION PLANNING ===

  planOptimalNavigation(state) {
    // Analyze navigation patterns to suggest optimal moves
    if (!this.learningEngine || !state.learningStatus) return null;
    
    const prediction = this.learningEngine.predict({
      currentPosition: state.currentCell,
      recentActivity: state.recentActivity
    }, 'navigation');
    
    if (prediction.success && prediction.confidence > 0.6) {
      return {
        type: 'navigation',
        description: `Navigate to predicted optimal cell`,
        confidence: prediction.confidence,
        autonomyRequired: 0.2,
        riskLevel: 0.1,
        execute: () => {
          const targetCell = prediction.prediction;
          if (targetCell && targetCell.q !== undefined && targetCell.r !== undefined) {
            this.goToCell(targetCell.q, targetCell.r);
            return { success: true, target: targetCell };
          }
          return { success: false, reason: 'Invalid target cell' };
        }
      };
    }
    
    return null;
  }

  planLoopOptimization(state) {
    if (!state.cellData || state.cellData.loops.length === 0) return null;
    
    // Analyze loop efficiency
    const inefficientLoops = state.cellData.loops.filter(loop => {
      return !loop.coupled && loop.endB === null; // Open loops without purpose
    });
    
    if (inefficientLoops.length > 0) {
      return {
        type: 'loop_optimization',
        description: `Optimize ${inefficientLoops.length} inefficient loops`,
        confidence: 0.8,
        autonomyRequired: 0.4,
        riskLevel: 0.2,
        execute: () => {
          let optimized = 0;
          inefficientLoops.forEach(loop => {
            // Convert open loops to coupled loops for better structure
            this.removeLoop(loop.endA, loop.endB);
            this.createLoop(loop.endA, loop.endA + 1, true);
            optimized++;
          });
          return { success: true, optimized: optimized };
        }
      };
    }
    
    return null;
  }

  planLearningAdjustment(state) {
    if (!this.learningEngine) return null;
    
    const learningEffectiveness = state.learningStatus.successfulPredictions / 
      Math.max(1, state.learningStatus.successfulPredictions + state.learningStatus.failedPredictions);
    
    if (learningEffectiveness < 0.5) {
      return {
        type: 'learning_adjustment',
        description: 'Adjust learning parameters to improve effectiveness',
        confidence: 0.7,
        autonomyRequired: 0.3,
        riskLevel: 0.1,
        execute: () => {
          // Adjust learning engine parameters
          this.learningEngine.confidenceThresholds.pattern -= 0.1;
          this.learningEngine.confidenceThresholds.prediction -= 0.05;
          this.performanceMetrics.learningEvents++;
          return { success: true, adjustment: 'lowered_thresholds' };
        }
      };
    }
    
    return null;
  }

  planAutonomyAdjustment(state) {
    const successRate = this.performanceMetrics.successfulActions / 
      Math.max(1, this.performanceMetrics.decisions);
    
    if (successRate > 0.8 && this.autonomyLevel < 0.9) {
      return {
        type: 'autonomy_increase',
        description: 'Increase autonomy level due to high success rate',
        confidence: 0.9,
        autonomyRequired: 0.1,
        riskLevel: 0.3,
        execute: () => {
          const oldLevel = this.autonomyLevel;
          this.autonomyLevel = Math.min(0.9, this.autonomyLevel + 0.1);
          this.log(`🔧 Autonomy increased from ${oldLevel.toFixed(1)} to ${this.autonomyLevel.toFixed(1)}`);
          return { success: true, oldLevel: oldLevel, newLevel: this.autonomyLevel };
        }
      };
    } else if (successRate < 0.4 && this.autonomyLevel > 0.1) {
      return {
        type: 'autonomy_decrease',
        description: 'Decrease autonomy level due to low success rate',
        confidence: 0.8,
        autonomyRequired: 0.0,
        riskLevel: 0.1,
        execute: () => {
          const oldLevel = this.autonomyLevel;
          this.autonomyLevel = Math.max(0.1, this.autonomyLevel - 0.1);
          this.log(`🔧 Autonomy decreased from ${oldLevel.toFixed(1)} to ${this.autonomyLevel.toFixed(1)}`);
          return { success: true, oldLevel: oldLevel, newLevel: this.autonomyLevel };
        }
      };
    }
    
    return null;
  }

  // === ASSESSMENT METHODS ===

  shouldOptimizeNavigation(state) {
    return state.recentActivity.length > 5 && this.autonomyLevel > 0.2;
  }

  shouldOptimizeLoops(state) {
    return state.cellData.loops.length > 0 && this.autonomyLevel > 0.3;
  }

  shouldAdjustLearning(state) {
    return this.learningEngine && state.learningStatus && this.autonomyLevel > 0.25;
  }

  shouldAdjustAutonomy(state) {
    return this.performanceMetrics.decisions > 10;
  }

  assessPerformance() {
    const assessment = {
      timestamp: Date.now(),
      successRate: this.performanceMetrics.successfulActions / Math.max(1, this.performanceMetrics.decisions),
      learningEffectiveness: this.learningEngine ? 
        this.learningEngine.metrics.successfulPredictions / 
        Math.max(1, this.learningEngine.metrics.totalExperiences) : 0,
      autonomyLevel: this.autonomyLevel,
      totalDecisions: this.performanceMetrics.decisions,
      recentDecisions: this.decisionHistory.slice(-10)
    };
    
    this.emit('performanceAssessment', assessment);
    
    // Auto-adjust regulation mode based on performance
    if (assessment.successRate > 0.8) {
      this.setRegulationMode('proactive');
    } else if (assessment.successRate > 0.6) {
      this.setRegulationMode('active');
    } else {
      this.setRegulationMode('passive');
    }
    
    return assessment;
  }

  // === EXPERIENCE RECORDING ===

  recordExperience(experience) {
    if (this.learningEngine) {
      const experienceId = this.learningEngine.recordExperience({
        ...experience,
        sirContext: {
          currentCell: this.currentCell,
          autonomyLevel: this.autonomyLevel,
          regulationMode: this.regulationMode
        }
      });
      
      this.performanceMetrics.learningEvents++;
      return experienceId;
    }
    return null;
  }

  // === UTILITY METHODS ===

  getRecentActivity() {
    return this.decisionHistory.slice(-5);
  }

  setRegulationMode(mode) {
    if (['passive', 'active', 'proactive', 'predictive'].includes(mode)) {
      const oldMode = this.regulationMode;
      this.regulationMode = mode;
      this.log(`🔄 Regulation mode changed from ${oldMode} to ${mode}`);
      this.emit('regulationModeChanged', { oldMode, newMode: mode });
    }
  }

  setIntelligenceLevel(level) {
    if (['learning', 'adaptive', 'autonomous', 'superintelligent'].includes(level)) {
      const oldLevel = this.intelligenceLevel;
      this.intelligenceLevel = level;
      this.log(`🧠 Intelligence level changed from ${oldLevel} to ${level}`);
      this.emit('intelligenceLevelChanged', { oldLevel, newLevel: level });
    }
  }

  // === PUBLIC API EXTENSIONS ===

  getSIRStatus() {
    return {
      intelligenceLevel: this.intelligenceLevel,
      regulationMode: this.regulationMode,
      autonomyLevel: this.autonomyLevel,
      performanceMetrics: this.performanceMetrics,
      learningEngine: this.learningEngine ? {
        metrics: this.learningEngine.metrics,
        patternsDiscovered: this.learningEngine.discoveredPatterns ? 
          this.learningEngine.discoveredPatterns.length : 0
      } : null,
      recentDecisions: this.decisionHistory.slice(-5),
      timestamp: Date.now()
    };
  }

  executeAgenticCommand(command) {
    // Enhanced agentic command execution with intelligence
    const experience = {
      type: 'agentic_command',
      command: command,
      timestamp: Date.now()
    };
    
    try {
      let result;
      
      switch (command.type) {
        case 'navigate':
          result = this.goToCell(command.q, command.r);
          break;
        case 'createLoop':
          result = this.createLoop(command.a, command.b, command.coupled);
          break;
        case 'removeLoop':
          result = this.removeLoop(command.a, command.b);
          break;
        case 'intelligentAction':
          result = this.performIntelligentAction(command);
          break;
        default:
          throw new Error(`Unknown command type: ${command.type}`);
      }
      
      experience.result = result;
      experience.success = true;
      
    } catch (error) {
      experience.error = error.message;
      experience.success = false;
    }
    
    this.recordExperience(experience);
    return experience;
  }

  performIntelligentAction(command) {
    // Perform an action with intelligent decision making
    const state = this.assessCurrentState();
    const decisions = this.makeIntelligentDecisions(state);
    
    if (decisions.length > 0) {
      const bestDecision = decisions.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      
      if (this.shouldExecuteDecision(bestDecision)) {
        return this.executeIntelligentDecision(bestDecision);
      }
    }
    
    return { success: false, reason: 'No suitable intelligent action found' };
  }
  // Event system
  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }
  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  // Navigation with intelligence
  goToCell(q, r) {
    const oldCell = { ...this.currentCell };
    this.currentCell = { q, r };
    
    // Record navigation experience
    this.recordExperience({
      type: 'navigation',
      from: oldCell,
      to: { q, r },
      success: true
    });
    
    this.emit('cellSelected', { q, r, from: oldCell });
    this.log(`Navigated to cell (${q},${r}) from (${oldCell.q},${oldCell.r})`);
    
    return { success: true, from: oldCell, to: { q, r } };
  }

  // Loop manipulation with intelligence
  createLoop(a, b, coupled = true) {
    const key = `${this.currentCell.q},${this.currentCell.r}`;
    let cell = this.cellMap.get(key) || { q: this.currentCell.q, r: this.currentCell.r, loops: [] };
    
    const newLoop = { endA: a, endB: b, coupled };
    cell.loops.push(newLoop);
    this.cellMap.set(key, cell);
    
    // Record loop creation experience
    this.recordExperience({
      type: 'loop_creation',
      cell: { q: this.currentCell.q, r: this.currentCell.r },
      loop: newLoop,
      success: true
    });
    
    this.emit('loopChanged', { cell, action: 'create', loop: newLoop });
    this.log(`Created ${coupled ? 'coupled' : 'open'} loop in cell (${key})`);
    
    return { success: true, cell, loop: newLoop };
  }

  removeLoop(a, b) {
    const key = `${this.currentCell.q},${this.currentCell.r}`;
    let cell = this.cellMap.get(key);
    if (!cell) return { success: false, reason: 'Cell not found' };
    
    const originalLength = cell.loops.length;
    cell.loops = cell.loops.filter(l =>
      !(l.endA === a && l.endB === b) && !(l.endA === b && l.endB === a)
    );
    
    const removed = originalLength > cell.loops.length;
    this.cellMap.set(key, cell);
    
    // Record loop removal experience
    this.recordExperience({
      type: 'loop_removal',
      cell: { q: this.currentCell.q, r: this.currentCell.r },
      loop: { endA: a, endB: b },
      success: removed
    });
    
    if (removed) {
      this.emit('loopChanged', { cell, action: 'remove', loop: { endA: a, endB: b } });
      this.log(`Removed loop in cell (${key})`);
    }
    
    return { success: removed, cell };
  }

  // State queries
  getCurrentCell() {
    return this.currentCell;
  }
  getCellData(q, r) {
    return this.cellMap.get(`${q},${r}`) || { q, r, loops: [] };
  }

  // Logging
  log(msg) {
    this.emit('log', msg);
    console.log('[SIR]', msg);
  }
}

// Export singleton
window.sirHost = new SIRHost();
