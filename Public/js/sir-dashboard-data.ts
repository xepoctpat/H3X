/**
 * SIR Dashboard Data Manager Module
 * Handles real-time data collection, pattern analysis, and data insights
 */
class SIRDashboardData {
  constructor() {
    // Enhanced real-time data tracking
    this.realtimeData = {
      patterns: {
        behavioralTrends: [],
        environmentalShifts: [],
        learningProgressions: [],
        anomalyDetections: [],
      },
      observations: {
        dataPointsCollected: 0,
        patternMatches: 0,
        anomaliesFound: 0,
        predictionAccuracy: 0,
        learningVelocity: 0,
      },
      environmentalFactors: {
        temperature: 22.5,
        humidity: 45,
        airQuality: 'Good',
        lightLevels: 350,
        soundLevels: 42,
        vibrationLevels: 0.2,
        electromagneticField: 0.8,
        airPressure: 1013.25,
      },
      neuralActivity: {
        activeNodes: 247,
        connectionStrength: 85,
        processingSpeed: 2.4,
        learningRate: 0.73,
        memoryUtilization: 67,
        predictiveAccuracy: 94.2,
      },
      temporalPatterns: {
        hourlyTrends: new Array(24).fill(0),
        dailyAverages: new Array(7).fill(0),
        monthlyProgression: new Array(30).fill(0),
      },
    };

    this.updateInterval = null;
    this.patternAnalysisInterval = null;
    this.dataCollectionInterval = null;

    console.log('🔮 SIR Dashboard Data Manager initialized');
  }

  initialize() {
    this.startRealTimeUpdates();
    console.log('✅ SIR Dashboard Data Manager ready');
  }

  startRealTimeUpdates() {
    // Main system updates every 5 seconds
    this.updateInterval = setInterval(() => {
      if (window.sirDashboardCore && window.sirDashboardCore.getConnectionStatus()) {
        this.collectRealTimeInsights();
      } else {
        // Enhanced demo mode with pattern simulation
        this.simulateRealTimeData();
        this.simulatePatternDetection();
      }
    }, 5000);

    // Advanced pattern analysis every 2 seconds for more granular insights
    this.patternAnalysisInterval = setInterval(() => {
      this.analyzeObservationalPatterns();
      this.updatePatternVisualizations();
    }, 2000);

    // Data collection metrics every 1 second for real-time feel
    this.dataCollectionInterval = setInterval(() => {
      this.updateDataCollectionMetrics();
      this.trackLearningVelocity();
    }, 1000);
  }

  async collectRealTimeInsights() {
    try {
      if (!window.sirDashboardCore) return;

      const serverUrl = 'http://localhost:3979'; // Should get from core

      // Collect insights from multiple endpoints for comprehensive data
      const [statusResponse, analysisResponse] = await Promise.all([
        fetch(`${serverUrl}/status`),
        fetch(`${serverUrl}/sir-analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            environment: 'realtime_observation',
            analysisType: 'pattern_detection',
            parameters: 'passive_learning_insights',
          }),
        }),
      ]);

      const statusData = await statusResponse.json();
      const analysisData = await analysisResponse.json();

      this.processStatusInsights(statusData);
      this.processAnalysisInsights(analysisData);

      // Update UI with new insights
      if (window.sirUI) {
        window.sirUI.updateDataVisualizations(this.realtimeData);
      }
    } catch (error) {
      console.error('Error collecting real-time insights:', error);
      this.simulateRealTimeData(); // Fallback to simulation on error
    }
  }

  processStatusInsights(data) {
    // Process system status for behavioral patterns
    this.realtimeData.observations.dataPointsCollected += Math.floor(Math.random() * 50) + 25;

    if (data.systemState) {
      // Update environmental factors from live data
      if (data.systemState.environment) {
        this.realtimeData.environmentalFactors = {
          ...this.realtimeData.environmentalFactors,
          ...data.systemState.environment,
        };
      }

      // Update neural activity metrics
      if (data.systemState.neural) {
        this.realtimeData.neuralActivity = {
          ...this.realtimeData.neuralActivity,
          ...data.systemState.neural,
        };
      }
    }

    // Add to behavioral trends
    this.realtimeData.patterns.behavioralTrends.push({
      timestamp: new Date().toISOString(),
      activity: data.activity || Math.random(),
      confidence: data.confidence || 0.8 + Math.random() * 0.2,
    });

    // Keep array at reasonable size
    if (this.realtimeData.patterns.behavioralTrends.length > 100) {
      this.realtimeData.patterns.behavioralTrends.shift();
    }
  }

  processAnalysisInsights(data) {
    if (!data || !data.result) return;

    const result = data.result;

    // Process pattern detection results
    if (result.patterns) {
      // Incorporate new patterns into existing collections
      if (result.patterns.environmental) {
        this.realtimeData.patterns.environmentalShifts.push({
          timestamp: new Date().toISOString(),
          type: result.patterns.environmental.type || 'temperature',
          magnitude: result.patterns.environmental.magnitude || Math.random(),
          confidence: result.patterns.environmental.confidence || 0.7 + Math.random() * 0.3,
        });

        // Keep array at reasonable size
        if (this.realtimeData.patterns.environmentalShifts.length > 100) {
          this.realtimeData.patterns.environmentalShifts.shift();
        }
      }

      // Process learning progressions
      if (result.patterns.learning) {
        this.realtimeData.patterns.learningProgressions.push({
          timestamp: new Date().toISOString(),
          rate: result.patterns.learning.rate || 0.5 + Math.random() * 0.5,
          domain: result.patterns.learning.domain || 'general',
          confidence: result.patterns.learning.confidence || 0.6 + Math.random() * 0.4,
        });

        // Keep array at reasonable size
        if (this.realtimeData.patterns.learningProgressions.length > 100) {
          this.realtimeData.patterns.learningProgressions.shift();
        }
      }

      // Process anomaly detections
      if (result.patterns.anomalies) {
        this.realtimeData.patterns.anomalyDetections.push({
          timestamp: new Date().toISOString(),
          type: result.patterns.anomalies.type || 'data_inconsistency',
          severity: result.patterns.anomalies.severity || Math.random(),
          confidence: result.patterns.anomalies.confidence || 0.5 + Math.random() * 0.5,
        });

        // Keep array at reasonable size
        if (this.realtimeData.patterns.anomalyDetections.length > 100) {
          this.realtimeData.patterns.anomalyDetections.shift();
        }

        // Update anomaly count
        this.realtimeData.observations.anomaliesFound++;
      }
    }

    // Update observation metrics
    if (result.metrics) {
      this.realtimeData.observations.patternMatches +=
        result.metrics.patternMatches || Math.floor(Math.random() * 5);
      this.realtimeData.observations.predictionAccuracy =
        result.metrics.predictionAccuracy ||
        Math.min(100, this.realtimeData.observations.predictionAccuracy + (Math.random() - 0.3));
    }

    // Update temporal patterns
    this.updateTemporalPatterns();
  }

  simulateRealTimeData() {
    // Simulate data point collection
    this.realtimeData.observations.dataPointsCollected += Math.floor(Math.random() * 50) + 25;

    // Simulate environmental changes
    this.realtimeData.environmentalFactors.temperature = 22 + Math.random() * 3;
    this.realtimeData.environmentalFactors.humidity = 45 + (Math.random() * 10 - 5);
    this.realtimeData.environmentalFactors.lightLevels = 350 + (Math.random() * 50 - 25);
    this.realtimeData.environmentalFactors.soundLevels = 40 + Math.random() * 8;

    // Simulate neural activity
    this.realtimeData.neuralActivity.activeNodes = 240 + Math.floor(Math.random() * 20);
    this.realtimeData.neuralActivity.connectionStrength = 80 + Math.random() * 10;
    this.realtimeData.neuralActivity.processingSpeed = 2.2 + Math.random() * 0.6;
    this.realtimeData.neuralActivity.learningRate = 0.7 + Math.random() * 0.1;

    // Update UI with simulated data
    if (window.sirUI) {
      window.sirUI.updateDataVisualizations(this.realtimeData);
    }
  }

  simulatePatternDetection() {
    // Simulate finding behavioral trends
    if (Math.random() > 0.7) {
      this.realtimeData.patterns.behavioralTrends.push({
        timestamp: new Date().toISOString(),
        activity: Math.random(),
        confidence: 0.8 + Math.random() * 0.2,
      });

      // Keep array at reasonable size
      if (this.realtimeData.patterns.behavioralTrends.length > 100) {
        this.realtimeData.patterns.behavioralTrends.shift();
      }

      this.realtimeData.observations.patternMatches++;
    }

    // Simulate environmental shifts
    if (Math.random() > 0.8) {
      this.realtimeData.patterns.environmentalShifts.push({
        timestamp: new Date().toISOString(),
        type: ['temperature', 'humidity', 'light', 'sound'][Math.floor(Math.random() * 4)],
        magnitude: Math.random(),
        confidence: 0.7 + Math.random() * 0.3,
      });

      // Keep array at reasonable size
      if (this.realtimeData.patterns.environmentalShifts.length > 100) {
        this.realtimeData.patterns.environmentalShifts.shift();
      }
    }

    // Simulate learning progressions
    if (Math.random() > 0.9) {
      this.realtimeData.patterns.learningProgressions.push({
        timestamp: new Date().toISOString(),
        rate: 0.5 + Math.random() * 0.5,
        domain: ['perception', 'analysis', 'reasoning', 'adaptation'][
          Math.floor(Math.random() * 4)
        ],
        confidence: 0.6 + Math.random() * 0.4,
      });

      // Keep array at reasonable size
      if (this.realtimeData.patterns.learningProgressions.length > 100) {
        this.realtimeData.patterns.learningProgressions.shift();
      }
    }

    // Simulate anomaly detections
    if (Math.random() > 0.95) {
      this.realtimeData.patterns.anomalyDetections.push({
        timestamp: new Date().toISOString(),
        type: ['data_inconsistency', 'outlier', 'pattern_break', 'unexpected_shift'][
          Math.floor(Math.random() * 4)
        ],
        severity: Math.random(),
        confidence: 0.5 + Math.random() * 0.5,
      });

      // Keep array at reasonable size
      if (this.realtimeData.patterns.anomalyDetections.length > 100) {
        this.realtimeData.patterns.anomalyDetections.shift();
      }

      this.realtimeData.observations.anomaliesFound++;
    }

    // Update temporal patterns
    this.updateTemporalPatterns();
  }

  updateTemporalPatterns() {
    // Update hourly trends
    const hour = new Date().getHours();
    this.realtimeData.temporalPatterns.hourlyTrends[hour] += Math.random();

    // Update daily averages
    const day = new Date().getDay();
    this.realtimeData.temporalPatterns.dailyAverages[day] =
      (this.realtimeData.temporalPatterns.dailyAverages[day] + Math.random()) / 2;

    // Update monthly progression
    const date = new Date().getDate() - 1; // 0-indexed
    this.realtimeData.temporalPatterns.monthlyProgression[date] += Math.random() * 0.5;
  }

  analyzeObservationalPatterns() {
    // Advanced pattern analysis algorithm simulation
    const allPatterns = [
      ...this.realtimeData.patterns.behavioralTrends,
      ...this.realtimeData.patterns.environmentalShifts,
      ...this.realtimeData.patterns.learningProgressions,
    ];

    if (allPatterns.length > 0) {
      // Calculate overall prediction accuracy based on pattern consistency
      const confidences = allPatterns.map((p) => p.confidence || 0.5);
      const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;

      // Apply some random variation but trend toward the average
      this.realtimeData.observations.predictionAccuracy =
        this.realtimeData.observations.predictionAccuracy * 0.95 + avgConfidence * 100 * 0.05;

      // Ensure within bounds
      this.realtimeData.observations.predictionAccuracy = Math.min(
        99.9,
        Math.max(70, this.realtimeData.observations.predictionAccuracy),
      );
    }
  }

  updatePatternVisualizations() {
    // This would update any visualizations of the patterns
    // Currently just a placeholder - UI module will handle this
    if (window.sirUI) {
      window.sirUI.updatePatternVisualizations(this.realtimeData.patterns);
    }
  }

  updateDataCollectionMetrics() {
    // Small increments to data collection to simulate continuous activity
    this.realtimeData.observations.dataPointsCollected += Math.floor(Math.random() * 3);
  }

  trackLearningVelocity() {
    // Calculate learning velocity based on recent pattern acquisitions
    // This is a simulated metric representing the rate of learning
    if (this.realtimeData.patterns.learningProgressions.length > 0) {
      const recentLearning = this.realtimeData.patterns.learningProgressions.slice(-10);
      const avgRate =
        recentLearning.reduce((sum, p) => sum + (p.rate || 0.5), 0) /
        Math.max(1, recentLearning.length);

      // Smooth out the learning velocity changes
      this.realtimeData.observations.learningVelocity =
        this.realtimeData.observations.learningVelocity * 0.9 + avgRate * 10 * 0.1;
    } else {
      // Small random fluctuations when no data
      this.realtimeData.observations.learningVelocity += (Math.random() - 0.5) * 0.1;
      this.realtimeData.observations.learningVelocity = Math.max(
        0,
        Math.min(10, this.realtimeData.observations.learningVelocity),
      );
    }
  }

  processAnalysisResults(analysisData) {
    // Process results from SIR analysis
    if (!analysisData) return;

    // Update pattern detection with analysis results
    if (analysisData.patterns) {
      // Add patterns to our collection
      if (analysisData.patterns.behavioral) {
        this.realtimeData.patterns.behavioralTrends.push({
          timestamp: new Date().toISOString(),
          activity: analysisData.patterns.behavioral.activity || Math.random(),
          confidence: analysisData.patterns.behavioral.confidence || 0.8 + Math.random() * 0.2,
        });
      }

      // Increment pattern matches
      this.realtimeData.observations.patternMatches +=
        analysisData.patterns.matchCount || Math.floor(Math.random() * 3) + 1;
    }

    // Update observation metrics
    if (analysisData.metrics) {
      this.realtimeData.observations.predictionAccuracy =
        analysisData.metrics.accuracy || this.realtimeData.observations.predictionAccuracy;
    }
  }

  startSimulationTracking(simulationData) {
    // Begin enhanced tracking during simulation
    if (!simulationData) return;

    // Increase data collection rate during simulation
    this.realtimeData.observations.dataPointsCollected += 100;

    // Add simulation start marker to patterns
    this.realtimeData.patterns.environmentalShifts.push({
      timestamp: new Date().toISOString(),
      type: 'simulation_start',
      magnitude: 1.0,
      confidence: 1.0,
    });

    // Clear previous intervals and start faster updates during simulation
    if (this.simulationInterval) clearInterval(this.simulationInterval);

    this.simulationInterval = setInterval(() => {
      // More rapid pattern generation during simulation
      this.simulatePatternDetection();
      this.analyzeObservationalPatterns();

      // Faster UI updates
      if (window.sirUI) {
        window.sirUI.updateDataVisualizations(this.realtimeData);
      }
    }, 800); // Much faster updates
  }

  processMonitoringData(monitoringData) {
    // Process monitoring data for patterns
    if (!monitoringData) return;

    // Update neural activity from monitoring data
    if (monitoringData.neural) {
      this.realtimeData.neuralActivity = {
        ...this.realtimeData.neuralActivity,
        ...monitoringData.neural,
      };
    }

    // Update environmental data
    if (monitoringData.environment) {
      this.realtimeData.environmentalFactors = {
        ...this.realtimeData.environmentalFactors,
        ...monitoringData.environment,
      };
    }

    // Add monitoring event to learning progressions
    this.realtimeData.patterns.learningProgressions.push({
      timestamp: new Date().toISOString(),
      rate: monitoringData.learningRate || 0.7 + Math.random() * 0.3,
      domain: 'monitoring',
      confidence: 0.9,
    });
  }

  emergencyStop() {
    // Stop all data collection intervals
    if (this.updateInterval) clearInterval(this.updateInterval);
    if (this.patternAnalysisInterval) clearInterval(this.patternAnalysisInterval);
    if (this.dataCollectionInterval) clearInterval(this.dataCollectionInterval);
    if (this.simulationInterval) clearInterval(this.simulationInterval);

    // Add emergency stop event to anomaly detections
    this.realtimeData.patterns.anomalyDetections.push({
      timestamp: new Date().toISOString(),
      type: 'emergency_stop',
      severity: 1.0,
      confidence: 1.0,
    });

    console.log('🛑 Data Manager: Emergency stop initiated - all data collection halted');
  }

  // Getter methods for other modules
  getRealtimeData() {
    return this.realtimeData;
  }

  getEnvironmentalFactors() {
    return this.realtimeData.environmentalFactors;
  }

  getNeuralActivity() {
    return this.realtimeData.neuralActivity;
  }

  getObservations() {
    return this.realtimeData.observations;
  }

  getPatterns() {
    return this.realtimeData.patterns;
  }
}

// Export for global access
window.SIRDashboardData = SIRDashboardData;
