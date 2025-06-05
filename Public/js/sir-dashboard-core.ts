/**
 * SIR Dashboard Core Module
 * Handles main dashboard initialization, connection management, and system state
 */
class SIRDashboardCore {
  constructor() {
    this.serverUrl = 'http://localhost:3979';
    this.systemState = {
      mode: 'PASSIVE',
      monitoring: false,
      simulation: false,
      connected: false,
    };
    this.metrics = {
      environmentalCompliance: 0,
      aiReadiness: 0,
      simulationAccuracy: 0,
      systemHealth: 0,
    };

    this.isConnected = false;

    console.log('🔮 SIR Dashboard Core initialized');
  }

  async initialize() {
    await this.checkConnection();
    this.setupEventListeners();
    console.log('✅ SIR Dashboard Core ready');
  }

  async checkConnection() {
    try {
      const response = await fetch(`${this.serverUrl}/health`);
      const data = await response.json();

      if (response.ok) {
        this.isConnected = true;
        this.systemState.connected = true;
        this.systemState.mode = data.mode || 'PASSIVE';
        console.log('✅ Connected to SIR backend');
        this.showStatus('Connected to SIR Control Interface', 'success');
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      console.log('❌ Backend not connected - running in demo mode');
      this.isConnected = false;
      this.systemState.connected = false;
      this.showStatus("Demo Mode - Start backend with 'npm run lmstudio'", 'warning');
    }
  }

  setupEventListeners() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            this.runAnalysis();
            break;
          case '2':
            e.preventDefault();
            this.startSimulation();
            break;
          case '3':
            e.preventDefault();
            this.checkMonitoring();
            break;
        }
      }
    });
  }

  async runAnalysis() {
    this.showStatus('Running SIR Analysis...', 'info');

    try {
      if (this.isConnected) {
        const response = await fetch(`${this.serverUrl}/sir-analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            environment: 'laboratory',
            analysisType: 'environmental_scan',
            parameters: 'UI triggered analysis',
          }),
        });

        const data = await response.json();

        if (data.success) {
          this.updateMetricsFromAnalysis(data.result);
          this.showStatus('SIR Analysis completed successfully', 'success');

          // Notify other modules
          if (window.sirDataManager) {
            window.sirDataManager.processAnalysisResults(data.result);
          }
        } else {
          throw new Error(data.error);
        }
      } else {
        // Demo mode
        this.simulateAnalysisUpdate();
        this.showStatus('Demo Analysis completed (start backend for real analysis)', 'warning');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      this.showStatus('Analysis failed: ' + error.message, 'error');
    }
  }

  async startSimulation() {
    this.showStatus('Starting Environment Simulation...', 'info');

    try {
      if (this.isConnected) {
        const response = await fetch(`${this.serverUrl}/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            simulationType: 'standard',
            environment: 'laboratory',
            duration: 300,
            parameters: 'UI triggered simulation',
          }),
        });

        const data = await response.json();

        if (data.success) {
          this.systemState.simulation = true;
          this.updateSimulationDisplay(data.result);
          this.showStatus('Simulation started successfully', 'success');

          // Notify other modules
          if (window.sirDataManager) {
            window.sirDataManager.startSimulationTracking(data.result);
          }
        } else {
          throw new Error(data.error);
        }
      } else {
        // Demo mode
        this.systemState.simulation = true;
        this.simulateSimulationUpdate();
        this.showStatus('Demo Simulation started (start backend for real simulation)', 'warning');
      }
    } catch (error) {
      console.error('Simulation failed:', error);
      this.showStatus('Simulation failed: ' + error.message, 'error');
    }
  }

  async checkMonitoring() {
    this.showStatus('Checking System Monitoring...', 'info');

    try {
      if (this.isConnected) {
        const response = await fetch(`${this.serverUrl}/monitor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemComponent: 'all_systems',
            parameters: 'UI triggered monitoring check',
          }),
        });

        const data = await response.json();

        if (data.success) {
          this.systemState.monitoring = true;
          this.updateMonitoringDisplay(data.result);
          this.showStatus('Monitoring check completed', 'success');

          // Notify other modules
          if (window.sirDataManager) {
            window.sirDataManager.processMonitoringData(data.result);
          }
        } else {
          throw new Error(data.error);
        }
      } else {
        // Demo mode
        this.systemState.monitoring = true;
        this.simulateMonitoringUpdate();
        this.showStatus('Demo Monitoring active (start backend for real monitoring)', 'warning');
      }
    } catch (error) {
      console.error('Monitoring failed:', error);
      this.showStatus('Monitoring failed: ' + error.message, 'error');
    }
  }

  async requestSupervision() {
    this.showStatus('Requesting Human Supervision...', 'info');

    try {
      if (this.isConnected) {
        const response = await fetch(`${this.serverUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Request human supervision for current operations',
            context: { source: 'UI', timestamp: new Date().toISOString() },
          }),
        });

        const data = await response.json();

        if (data.success) {
          this.showStatus('Human supervision requested successfully', 'success');
        } else {
          throw new Error(data.error);
        }
      } else {
        this.showStatus(
          'Demo: Supervision request logged (start backend for real requests)',
          'warning',
        );
      }
    } catch (error) {
      console.error('Supervision request failed:', error);
      this.showStatus('Supervision request failed: ' + error.message, 'error');
    }
  }

  emergencyStop() {
    this.systemState.simulation = false;
    this.systemState.monitoring = false;
    this.showStatus('🛑 Emergency Stop Activated - All operations halted', 'error');

    // Notify other modules
    if (window.sirDataManager) {
      window.sirDataManager.emergencyStop();
    }
    if (window.sirUI) {
      window.sirUI.updateSystemStatus();
    }
  }

  updateMetricsFromAnalysis(analysisData) {
    if (analysisData.compliance) {
      this.metrics.environmentalCompliance = analysisData.compliance.score || 75;
    }
    if (analysisData.data && analysisData.data.complexity_score) {
      this.metrics.aiReadiness = analysisData.data.complexity_score;
    }
    this.updateSystemStatus();
  }

  updateSimulationDisplay(simulationData) {
    if (simulationData.data) {
      this.metrics.simulationAccuracy = parseInt(simulationData.data.simulation_accuracy) || 80;
    }
    this.updateSystemStatus();
  }

  updateMonitoringDisplay(monitoringData) {
    if (monitoringData.systemHealth) {
      this.metrics.systemHealth = monitoringData.systemHealth.overall || 85;
    }
    this.updateSystemStatus();
  }

  simulateAnalysisUpdate() {
    this.metrics.environmentalCompliance = 70 + Math.floor(Math.random() * 25);
    this.metrics.aiReadiness = 65 + Math.floor(Math.random() * 30);
    this.updateSystemStatus();
  }

  simulateSimulationUpdate() {
    this.metrics.simulationAccuracy = 75 + Math.floor(Math.random() * 20);
    this.updateSystemStatus();
  }

  simulateMonitoringUpdate() {
    this.metrics.systemHealth = 80 + Math.floor(Math.random() * 15);
    this.updateSystemStatus();
  }

  updateSystemStatus() {
    // Notify UI module to update display
    if (window.sirUI) {
      window.sirUI.updateSystemStatus();
    }
  }

  showStatus(message, type) {
    // Create status notification
    const statusDiv = document.createElement('div');
    statusDiv.className = `status-notification status-${type}`;
    statusDiv.textContent = message;

    // Add to page
    document.body.appendChild(statusDiv);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (statusDiv.parentNode) {
        statusDiv.parentNode.removeChild(statusDiv);
      }
    }, 3000);

    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  // Getter methods for other modules
  getSystemState() {
    return this.systemState;
  }

  getMetrics() {
    return this.metrics;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Export for global access
window.SIRDashboardCore = SIRDashboardCore;
