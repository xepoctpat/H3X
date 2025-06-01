// sirLearningEngine.js
// Super Intelligent Regulator - Advanced Learning Logic System
// Implements pattern recognition, machine learning, and intelligent behavior adaptation

class SIRLearningEngine {
  constructor() {
    this.patterns = new Map();
    this.behaviorRules = new Map();
    this.experienceDatabase = [];
    this.predictionModels = new Map();
    this.adaptationStrategies = new Map();
    this.confidenceThresholds = {
      pattern: 0.7,
      prediction: 0.8,
      adaptation: 0.6
    };
    
    this.metrics = {
      totalExperiences: 0,
      successfulPredictions: 0,
      failedPredictions: 0,
      adaptationEvents: 0,
      patternDiscoveries: 0
    };
    
    this.initialize();
  }

  initialize() {
    console.log('🧠 SIR Learning Engine initialized');
    
    // Initialize base pattern recognition algorithms
    this.initializePatternRecognition();
    
    // Initialize common learning algorithms
    this.initializeCommonLearning();
    
    // Initialize behavior adaptation strategies
    this.initializeBehaviorAdaptation();
    
    // Start continuous learning loop
    this.startLearningLoop();
  }

  // === PATTERN RECOGNITION SYSTEM ===
  
  initializePatternRecognition() {
    // Sequence pattern detector
    this.patterns.set('sequence', {
      type: 'sequence',
      algorithm: this.detectSequencePatterns.bind(this),
      confidence: 0,
      discovered: 0
    });
    
    // Frequency pattern detector
    this.patterns.set('frequency', {
      type: 'frequency',
      algorithm: this.detectFrequencyPatterns.bind(this),
      confidence: 0,
      discovered: 0
    });
    
    // Correlation pattern detector
    this.patterns.set('correlation', {
      type: 'correlation',
      algorithm: this.detectCorrelationPatterns.bind(this),
      confidence: 0,
      discovered: 0
    });
    
    // Temporal pattern detector
    this.patterns.set('temporal', {
      type: 'temporal',
      algorithm: this.detectTemporalPatterns.bind(this),
      confidence: 0,
      discovered: 0
    });
  }

  detectSequencePatterns(data) {
    if (!Array.isArray(data) || data.length < 3) return null;
    
    const sequences = [];
    
    // Look for repeating subsequences
    for (let len = 2; len <= Math.floor(data.length / 2); len++) {
      for (let i = 0; i <= data.length - len * 2; i++) {
        const pattern = data.slice(i, i + len);
        const nextOccurrence = data.slice(i + len, i + len * 2);
        
        if (this.arraysEqual(pattern, nextOccurrence)) {
          sequences.push({
            pattern: pattern,
            startIndex: i,
            length: len,
            confidence: this.calculateSequenceConfidence(pattern, data)
          });
        }
      }
    }
    
    return sequences.length > 0 ? {
      type: 'sequence',
      patterns: sequences,
      confidence: Math.max(...sequences.map(s => s.confidence)),
      timestamp: Date.now()
    } : null;
  }

  detectFrequencyPatterns(data) {
    const frequencies = new Map();
    
    data.forEach(item => {
      const key = JSON.stringify(item);
      frequencies.set(key, (frequencies.get(key) || 0) + 1);
    });
    
    const sortedFreqs = Array.from(frequencies.entries())
      .map(([item, count]) => ({
        item: JSON.parse(item),
        frequency: count / data.length,
        count: count
      }))
      .sort((a, b) => b.frequency - a.frequency);
    
    return {
      type: 'frequency',
      patterns: sortedFreqs,
      confidence: this.calculateFrequencyConfidence(sortedFreqs),
      timestamp: Date.now()
    };
  }

  detectCorrelationPatterns(data) {
    if (data.length < 2) return null;
    
    const correlations = [];
    
    // Simple correlation detection between adjacent data points
    for (let i = 0; i < data.length - 1; i++) {
      const current = data[i];
      const next = data[i + 1];
      
      if (typeof current === 'object' && typeof next === 'object') {
        const correlation = this.calculateObjectCorrelation(current, next);
        if (correlation.strength > 0.5) {
          correlations.push({
            fromIndex: i,
            toIndex: i + 1,
            correlation: correlation,
            confidence: correlation.strength
          });
        }
      }
    }
    
    return correlations.length > 0 ? {
      type: 'correlation',
      patterns: correlations,
      confidence: Math.max(...correlations.map(c => c.confidence)),
      timestamp: Date.now()
    } : null;
  }

  detectTemporalPatterns(data) {
    if (data.length < 3) return null;
    
    const temporalPatterns = [];
    
    // Detect recurring time intervals
    const timestamps = data.map(d => d.timestamp || Date.now()).sort();
    const intervals = [];
    
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    
    // Find common intervals
    const intervalMap = new Map();
    intervals.forEach(interval => {
      const rounded = Math.round(interval / 1000) * 1000; // Round to nearest second
      intervalMap.set(rounded, (intervalMap.get(rounded) || 0) + 1);
    });
    
    const commonIntervals = Array.from(intervalMap.entries())
      .filter(([interval, count]) => count >= 2)
      .map(([interval, count]) => ({
        interval: interval,
        frequency: count / intervals.length,
        confidence: Math.min(0.9, count / intervals.length * 2)
      }));
    
    return commonIntervals.length > 0 ? {
      type: 'temporal',
      patterns: commonIntervals,
      confidence: Math.max(...commonIntervals.map(p => p.confidence)),
      timestamp: Date.now()
    } : null;
  }

  // === COMMON LEARNING ALGORITHMS ===
  
  initializeCommonLearning() {
    // Reinforcement learning
    this.learningAlgorithms = {
      reinforcement: new ReinforcementLearner(),
      supervised: new SupervisedLearner(),
      unsupervised: new UnsupervisedLearner(),
      adaptive: new AdaptiveLearner()
    };
  }

  // === BEHAVIOR ADAPTATION SYSTEM ===
  
  initializeBehaviorAdaptation() {
    // Strategy: Pattern-based adaptation
    this.adaptationStrategies.set('pattern_based', {
      name: 'Pattern-Based Adaptation',
      execute: this.patternBasedAdaptation.bind(this),
      priority: 1
    });
    
    // Strategy: Performance-based adaptation
    this.adaptationStrategies.set('performance_based', {
      name: 'Performance-Based Adaptation',
      execute: this.performanceBasedAdaptation.bind(this),
      priority: 2
    });
    
    // Strategy: Context-aware adaptation
    this.adaptationStrategies.set('context_aware', {
      name: 'Context-Aware Adaptation',
      execute: this.contextAwareAdaptation.bind(this),
      priority: 3
    });
  }

  patternBasedAdaptation(context) {
    const recentPatterns = this.getRecentPatterns(10);
    
    if (recentPatterns.length === 0) return null;
    
    // Adapt behavior based on discovered patterns
    const adaptations = [];
    
    recentPatterns.forEach(pattern => {
      if (pattern.confidence > this.confidenceThresholds.adaptation) {
        switch (pattern.type) {
          case 'sequence':
            adaptations.push({
              type: 'predictive_behavior',
              description: 'Adapt to detected sequence patterns',
              action: () => this.adaptToSequencePattern(pattern)
            });
            break;
          
          case 'frequency':
            adaptations.push({
              type: 'optimization_behavior',
              description: 'Optimize for frequent patterns',
              action: () => this.adaptToFrequencyPattern(pattern)
            });
            break;
          
          case 'temporal':
            adaptations.push({
              type: 'timing_behavior',
              description: 'Adjust timing based on temporal patterns',
              action: () => this.adaptToTemporalPattern(pattern)
            });
            break;
        }
      }
    });
    
    return adaptations;
  }

  performanceBasedAdaptation(context) {
    const successRate = this.calculateSuccessRate();
    const adaptations = [];
    
    if (successRate < 0.7) {
      adaptations.push({
        type: 'strategy_adjustment',
        description: 'Adjust strategies due to low success rate',
        action: () => this.adjustLearningStrategies()
      });
    }
    
    if (this.metrics.failedPredictions > this.metrics.successfulPredictions) {
      adaptations.push({
        type: 'prediction_refinement',
        description: 'Refine prediction models',
        action: () => this.refinePredictionModels()
      });
    }
    
    return adaptations;
  }

  contextAwareAdaptation(context) {
    const adaptations = [];
    
    // Adapt based on current context
    if (context.environment === 'high_activity') {
      adaptations.push({
        type: 'resource_optimization',
        description: 'Optimize for high activity environment',
        action: () => this.optimizeForHighActivity()
      });
    }
    
    if (context.userInteraction === 'frequent') {
      adaptations.push({
        type: 'responsiveness_enhancement',
        description: 'Enhance responsiveness for frequent interactions',
        action: () => this.enhanceResponsiveness()
      });
    }
    
    return adaptations;
  }

  // === PREDICTIVE CAPABILITIES ===
  
  predict(inputData, modelType = 'default') {
    const model = this.predictionModels.get(modelType) || this.createDefaultPredictionModel();
    
    try {
      const prediction = model.predict(inputData);
      
      if (prediction.confidence > this.confidenceThresholds.prediction) {
        this.metrics.successfulPredictions++;
        return {
          success: true,
          prediction: prediction.value,
          confidence: prediction.confidence,
          model: modelType,
          timestamp: Date.now()
        };
      } else {
        return {
          success: false,
          reason: 'Low confidence prediction',
          confidence: prediction.confidence,
          model: modelType
        };
      }
    } catch (error) {
      this.metrics.failedPredictions++;
      return {
        success: false,
        reason: error.message,
        model: modelType
      };
    }
  }

  // === SELF-REGULATION SYSTEM ===
  
  regulate() {
    const regulation = {
      timestamp: Date.now(),
      actions: [],
      metrics: { ...this.metrics }
    };
    
    // Monitor learning effectiveness
    const learningEffectiveness = this.assessLearningEffectiveness();
    if (learningEffectiveness < 0.6) {
      regulation.actions.push({
        type: 'learning_adjustment',
        description: 'Adjust learning parameters for better effectiveness',
        execute: () => this.adjustLearningParameters()
      });
    }
    
    // Monitor pattern discovery rate
    const patternDiscoveryRate = this.calculatePatternDiscoveryRate();
    if (patternDiscoveryRate < 0.1) {
      regulation.actions.push({
        type: 'pattern_sensitivity_increase',
        description: 'Increase pattern detection sensitivity',
        execute: () => this.increasePatternSensitivity()
      });
    }
    
    // Monitor prediction accuracy
    const predictionAccuracy = this.calculatePredictionAccuracy();
    if (predictionAccuracy < 0.7) {
      regulation.actions.push({
        type: 'prediction_model_refinement',
        description: 'Refine prediction models',
        execute: () => this.refinePredictionModels()
      });
    }
    
    // Execute regulation actions
    regulation.actions.forEach(action => {
      try {
        action.execute();
        console.log(`🔧 SIR Self-Regulation: ${action.description}`);
      } catch (error) {
        console.error(`❌ SIR Regulation Error: ${error.message}`);
      }
    });
    
    return regulation;
  }

  // === EXPERIENCE MANAGEMENT ===
  
  recordExperience(experience) {
    const enhancedExperience = {
      ...experience,
      id: this.generateExperienceId(),
      timestamp: Date.now(),
      context: this.getCurrentContext(),
      patterns: this.analyzeExperiencePatterns(experience)
    };
    
    this.experienceDatabase.push(enhancedExperience);
    this.metrics.totalExperiences++;
    
    // Learn from experience
    this.learnFromExperience(enhancedExperience);
    
    // Trigger pattern analysis
    this.analyzeNewPatterns([enhancedExperience]);
    
    return enhancedExperience.id;
  }

  learnFromExperience(experience) {
    // Apply all learning algorithms
    Object.values(this.learningAlgorithms).forEach(algorithm => {
      try {
        algorithm.learn(experience);
      } catch (error) {
        console.warn(`Learning algorithm error: ${error.message}`);
      }
    });
    
    // Update behavior rules based on experience
    this.updateBehaviorRules(experience);
  }

  // === LEARNING LOOP ===
  
  startLearningLoop() {
    // Continuous learning cycle every 5 seconds
    setInterval(() => {
      this.performLearningCycle();
    }, 5000);
    
    // Self-regulation cycle every 30 seconds
    setInterval(() => {
      this.regulate();
    }, 30000);
  }

  performLearningCycle() {
    try {
      // Analyze recent experiences for patterns
      const recentExperiences = this.getRecentExperiences(10);
      if (recentExperiences.length > 0) {
        this.analyzeNewPatterns(recentExperiences);
      }
      
      // Update prediction models
      this.updatePredictionModels();
      
      // Evaluate and adapt behaviors
      this.evaluateAndAdapt();
      
      // Emit learning update event
      if (window.sirHost) {
        window.sirHost.emit('learningUpdate', {
          metrics: this.metrics,
          recentPatterns: this.getRecentPatterns(5),
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('SIR Learning Cycle Error:', error);
    }
  }

  // === UTILITY METHODS ===
  
  analyzeNewPatterns(experiences) {
    const data = experiences.map(exp => exp.data || exp);
    
    this.patterns.forEach((patternConfig, patternType) => {
      try {
        const detectedPattern = patternConfig.algorithm(data);
        if (detectedPattern && detectedPattern.confidence > this.confidenceThresholds.pattern) {
          this.metrics.patternDiscoveries++;
          patternConfig.discovered++;
          patternConfig.confidence = detectedPattern.confidence;
          
          console.log(`🔍 SIR Pattern Discovery: ${patternType} pattern with confidence ${detectedPattern.confidence.toFixed(2)}`);
          
          // Store the pattern
          if (!this.discoveredPatterns) this.discoveredPatterns = [];
          this.discoveredPatterns.push(detectedPattern);
        }
      } catch (error) {
        console.warn(`Pattern analysis error for ${patternType}: ${error.message}`);
      }
    });
  }

  calculateSequenceConfidence(pattern, data) {
    const patternStr = JSON.stringify(pattern);
    let occurrences = 0;
    
    for (let i = 0; i <= data.length - pattern.length; i++) {
      const subseq = data.slice(i, i + pattern.length);
      if (JSON.stringify(subseq) === patternStr) {
        occurrences++;
      }
    }
    
    return Math.min(0.95, (occurrences - 1) / (data.length - pattern.length + 1));
  }

  calculateFrequencyConfidence(frequencies) {
    if (frequencies.length === 0) return 0;
    
    const maxFreq = frequencies[0].frequency;
    const avgFreq = frequencies.reduce((sum, f) => sum + f.frequency, 0) / frequencies.length;
    
    return Math.min(0.9, (maxFreq - avgFreq) / maxFreq);
  }

  calculateObjectCorrelation(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const commonKeys = keys1.filter(k => keys2.includes(k));
    
    if (commonKeys.length === 0) return { strength: 0, details: 'No common properties' };
    
    let matches = 0;
    commonKeys.forEach(key => {
      if (obj1[key] === obj2[key]) matches++;
    });
    
    return {
      strength: matches / commonKeys.length,
      details: `${matches}/${commonKeys.length} properties match`
    };
  }

  arraysEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  generateExperienceId() {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentContext() {
    return {
      timestamp: Date.now(),
      cellPosition: window.sirHost ? window.sirHost.getCurrentCell() : null,
      systemState: 'active',
      learningMode: 'continuous'
    };
  }

  getRecentExperiences(count) {
    return this.experienceDatabase.slice(-count);
  }

  getRecentPatterns(count) {
    return (this.discoveredPatterns || []).slice(-count);
  }

  calculateSuccessRate() {
    const total = this.metrics.successfulPredictions + this.metrics.failedPredictions;
    return total > 0 ? this.metrics.successfulPredictions / total : 0;
  }

  calculatePredictionAccuracy() {
    return this.calculateSuccessRate();
  }

  calculatePatternDiscoveryRate() {
    const timeSpan = 300000; // 5 minutes
    const recentDiscoveries = (this.discoveredPatterns || [])
      .filter(p => Date.now() - p.timestamp < timeSpan);
    return recentDiscoveries.length / (timeSpan / 60000); // Patterns per minute
  }

  assessLearningEffectiveness() {
    const factors = [
      this.calculateSuccessRate(),
      this.calculatePatternDiscoveryRate() / 10, // Normalize
      Math.min(1, this.metrics.adaptationEvents / 100)
    ];
    
    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }

  // Placeholder methods for adaptation actions
  adaptToSequencePattern(pattern) { /* Implementation */ }
  adaptToFrequencyPattern(pattern) { /* Implementation */ }
  adaptToTemporalPattern(pattern) { /* Implementation */ }
  adjustLearningStrategies() { /* Implementation */ }
  refinePredictionModels() { /* Implementation */ }
  optimizeForHighActivity() { /* Implementation */ }
  enhanceResponsiveness() { /* Implementation */ }
  adjustLearningParameters() { /* Implementation */ }
  increasePatternSensitivity() { /* Implementation */ }
  updateBehaviorRules(experience) { /* Implementation */ }
  updatePredictionModels() { /* Implementation */ }
  evaluateAndAdapt() { /* Implementation */ }
  createDefaultPredictionModel() { 
    return {
      predict: (data) => ({ value: null, confidence: 0 })
    };
  }
  analyzeExperiencePatterns(experience) { return []; }
}

// === HELPER LEARNING CLASSES ===

class ReinforcementLearner {
  constructor() {
    this.qTable = new Map();
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
  }
  
  learn(experience) {
    // Simple Q-learning implementation
    const state = JSON.stringify(experience.state || {});
    const action = experience.action || 'default';
    const reward = experience.reward || 0;
    
    const stateActions = this.qTable.get(state) || new Map();
    const currentQ = stateActions.get(action) || 0;
    
    // Q-learning update
    const newQ = currentQ + this.learningRate * (reward - currentQ);
    stateActions.set(action, newQ);
    this.qTable.set(state, stateActions);
  }
}

class SupervisedLearner {
  constructor() {
    this.trainingData = [];
    this.model = null;
  }
  
  learn(experience) {
    if (experience.input && experience.expectedOutput) {
      this.trainingData.push({
        input: experience.input,
        output: experience.expectedOutput
      });
      
      // Simple model update (placeholder)
      this.updateModel();
    }
  }
  
  updateModel() {
    // Placeholder for model training
  }
}

class UnsupervisedLearner {
  constructor() {
    this.clusters = [];
    this.patterns = [];
  }
  
  learn(experience) {
    // Simple clustering based on similarity
    this.addToCluster(experience.data || experience);
  }
  
  addToCluster(data) {
    // Placeholder clustering algorithm
  }
}

class AdaptiveLearner {
  constructor() {
    this.adaptations = [];
    this.performance = new Map();
  }
  
  learn(experience) {
    // Track performance and adapt accordingly
    const context = experience.context || 'default';
    const success = experience.success || false;
    
    const contextPerf = this.performance.get(context) || { successes: 0, failures: 0 };
    if (success) {
      contextPerf.successes++;
    } else {
      contextPerf.failures++;
    }
    this.performance.set(context, contextPerf);
  }
}

// Export the SIR Learning Engine
window.SIRLearningEngine = SIRLearningEngine;
