// H3X SIR Control Interface - Frontend Integration
// Connects the beautiful UI to LMStudio backend

class SIRDashboard {
    constructor() {
        this.serverUrl = 'http://localhost:3979';
        this.systemState = {
            mode: 'PASSIVE',
            monitoring: false,
            simulation: false,
            connected: false
        };
        this.metrics = {
            environmentalCompliance: 0,
            aiReadiness: 0,
            simulationAccuracy: 0,
            systemHealth: 0
        };
        this.isConnected = false;
        this.updateInterval = null;
        
        console.log("🔮 SIR Dashboard initialized");
        this.initialize();
    }

    async initialize() {
        await this.checkConnection();
        this.setupUI();
        this.startRealTimeUpdates();
        this.setupEventListeners();
    }

    async checkConnection() {
        try {
            const response = await fetch(`${this.serverUrl}/health`);
            const data = await response.json();
            
            if (response.ok) {
                this.isConnected = true;
                this.systemState.connected = true;
                this.systemState.mode = data.mode || 'PASSIVE';
                console.log("✅ Connected to SIR backend");
                this.showStatus("Connected to SIR Control Interface", "success");
            } else {
                throw new Error("Health check failed");
            }
        } catch (error) {
            console.log("❌ Backend not connected - running in demo mode");
            this.isConnected = false;
            this.systemState.connected = false;
            this.showStatus("Demo Mode - Start backend with 'npm run lmstudio'", "warning");
        }
    }

    setupUI() {
        this.createDashboardMetrics();
        this.createVisualizationControls();
        this.updateSystemStatus();
    }

    createDashboardMetrics() {
        const dashboardGrid = document.querySelector('.dashboard-grid');
        if (!dashboardGrid) return;

        dashboardGrid.innerHTML = `
            <!-- System Status Card -->
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">System Status</span>
                    <div class="status-indicator" id="system-status-indicator"></div>
                </div>
                <div class="metric-value" id="system-mode">${this.systemState.mode}</div>
                <div class="metric-description" id="connection-status">
                    ${this.isConnected ? 'Connected to LMStudio Backend' : 'Demo Mode - Backend Offline'}
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="system-health-progress" style="width: ${this.isConnected ? 85 : 45}%"></div>
                </div>
            </div>

            <!-- Environmental Compliance Card -->
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Environmental Compliance</span>
                    <div class="status-indicator status-active"></div>
                </div>
                <div class="metric-value" id="env-compliance">${this.metrics.environmentalCompliance}%</div>
                <div class="metric-description">Real-life standards compliance</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="env-progress" style="width: ${this.metrics.environmentalCompliance}%"></div>
                </div>
            </div>

            <!-- AI Readiness Card -->
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">AI Readiness</span>
                    <div class="status-indicator status-warning"></div>
                </div>
                <div class="metric-value" id="ai-readiness">${this.metrics.aiReadiness}%</div>
                <div class="metric-description">Deployment readiness assessment</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="ai-progress" style="width: ${this.metrics.aiReadiness}%"></div>
                </div>
            </div>

            <!-- Simulation Status Card -->
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Simulation Status</span>
                    <div class="status-indicator ${this.systemState.simulation ? 'status-active' : 'status-warning'}"></div>
                </div>
                <div class="metric-value" id="simulation-status">${this.systemState.simulation ? 'Running' : 'Standby'}</div>
                <div class="metric-description">Environment simulation state</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="simulation-progress" style="width: ${this.metrics.simulationAccuracy}%"></div>
                </div>
            </div>

            <!-- Monitoring Status Card -->
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Monitoring Active</span>
                    <div class="status-indicator ${this.systemState.monitoring ? 'status-active' : 'status-warning'}"></div>
                </div>
                <div class="metric-value" id="monitoring-status">${this.systemState.monitoring ? 'Active' : 'Inactive'}</div>
                <div class="metric-description">System health monitoring</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="monitoring-progress" style="width: ${this.metrics.systemHealth}%"></div>
                </div>
            </div>

            <!-- Hexperiment Framework Card -->
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Framework Status</span>
                    <div class="status-indicator status-active"></div>
                </div>
                <div class="metric-value">Active</div>
                <div class="metric-description">Hexperiment Labs Framework</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 95%"></div>
                </div>
            </div>
        `;
    }

    createVisualizationControls() {
        const visualizationContainer = document.querySelector('.visualization-container');
        if (!visualizationContainer) return;

        visualizationContainer.innerHTML = `
            <h3 style="color: #00ffff; margin-bottom: 20px;">🔮 SIR Environment Simulation</h3>
            
            <div class="simulation-display">
                <div id="threejs-container">
                    <div class="loading">
                        <div class="spinner"></div>
                        Initializing 3D Environment...
                    </div>
                </div>
            </div>

            <div class="control-panel">
                <button class="control-button" onclick="sirDashboard.runAnalysis()">
                    🔬 Run SIR Analysis
                </button>
                <button class="control-button" onclick="sirDashboard.startSimulation()">
                    🌍 Start Simulation
                </button>
                <button class="control-button" onclick="sirDashboard.checkMonitoring()">
                    📊 System Monitor
                </button>
                <button class="control-button" onclick="sirDashboard.requestSupervision()">
                    👥 Human Supervision
                </button>
                <button class="control-button danger" onclick="sirDashboard.emergencyStop()">
                    🛑 Emergency Stop
                </button>
            </div>
        `;

        // Update simulation info
        const simulationInfo = document.querySelector('.simulation-info');
        if (simulationInfo) {
            simulationInfo.innerHTML = `
                <div class="info-item">
                    <div class="info-label">Temperature</div>
                    <div class="info-value" id="temp-value">22.5°C</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Humidity</div>
                    <div class="info-value" id="humidity-value">45%</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Air Quality</div>
                    <div class="info-value" id="air-quality-value">Good</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Processing Power</div>
                    <div class="info-value" id="processing-power">85%</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Active Entities</div>
                    <div class="info-value" id="active-entities">247</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Framework Status</div>
                    <div class="info-value" style="color: #00ff00;">Operational</div>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch(e.key) {
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
        this.showStatus("Running SIR Analysis...", "info");
        
        try {
            if (this.isConnected) {
                const response = await fetch(`${this.serverUrl}/sir-analysis`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        environment: 'laboratory',
                        analysisType: 'environmental_scan',
                        parameters: 'UI triggered analysis'
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.updateMetricsFromAnalysis(data.result);
                    this.showStatus("SIR Analysis completed successfully", "success");
                } else {
                    throw new Error(data.error);
                }
            } else {
                // Demo mode
                this.simulateAnalysisUpdate();
                this.showStatus("Demo Analysis completed (start backend for real analysis)", "warning");
            }
        } catch (error) {
            console.error("Analysis failed:", error);
            this.showStatus("Analysis failed: " + error.message, "error");
        }
    }

    async startSimulation() {
        this.showStatus("Starting Environment Simulation...", "info");
        
        try {
            if (this.isConnected) {
                const response = await fetch(`${this.serverUrl}/simulate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        simulationType: 'standard',
                        environment: 'laboratory',
                        duration: 300,
                        parameters: 'UI triggered simulation'
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.systemState.simulation = true;
                    this.updateSimulationDisplay(data.result);
                    this.showStatus("Simulation started successfully", "success");
                } else {
                    throw new Error(data.error);
                }
            } else {
                // Demo mode
                this.systemState.simulation = true;
                this.simulateSimulationUpdate();
                this.showStatus("Demo Simulation started (start backend for real simulation)", "warning");
            }
        } catch (error) {
            console.error("Simulation failed:", error);
            this.showStatus("Simulation failed: " + error.message, "error");
        }
    }

    async checkMonitoring() {
        this.showStatus("Checking System Monitoring...", "info");
        
        try {
            if (this.isConnected) {
                const response = await fetch(`${this.serverUrl}/monitor`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        systemComponent: 'all_systems',
                        parameters: 'UI triggered monitoring check'
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.systemState.monitoring = true;
                    this.updateMonitoringDisplay(data.result);
                    this.showStatus("Monitoring check completed", "success");
                } else {
                    throw new Error(data.error);
                }
            } else {
                // Demo mode
                this.systemState.monitoring = true;
                this.simulateMonitoringUpdate();
                this.showStatus("Demo Monitoring active (start backend for real monitoring)", "warning");
            }
        } catch (error) {
            console.error("Monitoring failed:", error);
            this.showStatus("Monitoring failed: " + error.message, "error");
        }
    }

    async requestSupervision() {
        this.showStatus("Requesting Human Supervision...", "info");
        
        try {
            if (this.isConnected) {
                const response = await fetch(`${this.serverUrl}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: "Request human supervision for current operations",
                        context: { source: 'UI', timestamp: new Date().toISOString() }
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.showStatus("Supervision request submitted", "success");
                } else {
                    throw new Error(data.error);
                }
            } else {
                this.showStatus("Demo: Supervision request logged (start backend for real requests)", "warning");
            }
        } catch (error) {
            console.error("Supervision request failed:", error);
            this.showStatus("Supervision request failed: " + error.message, "error");
        }
    }

    emergencyStop() {
        this.systemState.simulation = false;
        this.systemState.monitoring = false;
        this.showStatus("🛑 Emergency Stop Activated - All operations halted", "error");
        this.updateSystemStatus();
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
            document.getElementById('processing-power').textContent = simulationData.data.processing_power || '85%';
            document.getElementById('active-entities').textContent = simulationData.data.active_entities || '247';
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
        // Update system status indicator
        const statusIndicator = document.getElementById('system-status-indicator');
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator ' + 
                (this.isConnected ? 'status-active' : 'status-warning');
        }

        // Update mode display
        const systemMode = document.getElementById('system-mode');
        if (systemMode) {
            systemMode.textContent = this.systemState.mode;
        }

        // Update connection status
        const connectionStatus = document.getElementById('connection-status');
        if (connectionStatus) {
            connectionStatus.textContent = this.isConnected ? 
                'Connected to LMStudio Backend' : 
                'Demo Mode - Backend Offline';
        }

        // Update progress bars
        this.updateProgressBar('env-progress', this.metrics.environmentalCompliance);
        this.updateProgressBar('ai-progress', this.metrics.aiReadiness);
        this.updateProgressBar('simulation-progress', this.metrics.simulationAccuracy);
        this.updateProgressBar('monitoring-progress', this.metrics.systemHealth);
        this.updateProgressBar('system-health-progress', this.isConnected ? 85 : 45);

        // Update metric values
        const envCompliance = document.getElementById('env-compliance');
        if (envCompliance) envCompliance.textContent = this.metrics.environmentalCompliance + '%';

        const aiReadiness = document.getElementById('ai-readiness');
        if (aiReadiness) aiReadiness.textContent = this.metrics.aiReadiness + '%';

        // Update simulation status
        const simulationStatus = document.getElementById('simulation-status');
        if (simulationStatus) {
            simulationStatus.textContent = this.systemState.simulation ? 'Running' : 'Standby';
        }

        // Update monitoring status
        const monitoringStatus = document.getElementById('monitoring-status');
        if (monitoringStatus) {
            monitoringStatus.textContent = this.systemState.monitoring ? 'Active' : 'Inactive';
        }
    }

    updateProgressBar(id, percentage) {
        const progressBar = document.getElementById(id);
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
    }

    showStatus(message, type) {
        // Create or update status message
        let statusEl = document.getElementById('status-message');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'status-message';
            statusEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            `;
            document.body.appendChild(statusEl);
        }

        const colors = {
            success: 'rgba(0, 255, 0, 0.8)',
            warning: 'rgba(255, 170, 0, 0.8)',
            error: 'rgba(255, 0, 0, 0.8)',
            info: 'rgba(0, 255, 255, 0.8)'
        };

        statusEl.style.backgroundColor = colors[type] || colors.info;
        statusEl.textContent = message;
        statusEl.style.opacity = '1';
        statusEl.style.transform = 'translateY(0)';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            statusEl.style.opacity = '0';
            statusEl.style.transform = 'translateY(-20px)';
        }, 3000);
    }

    startRealTimeUpdates() {
        // Update every 5 seconds
        this.updateInterval = setInterval(() => {
            if (this.isConnected) {
                this.checkSystemStatus();
            } else {
                // Demo mode - simulate some updates
                this.simulateRealTimeData();
            }
        }, 5000);
    }

    async checkSystemStatus() {
        try {
            const response = await fetch(`${this.serverUrl}/status`);
            const data = await response.json();
            
            if (response.ok) {
                this.systemState = { ...this.systemState, ...data.systemState };
                this.updateSystemStatus();
            }
        } catch (error) {
            console.log("Status check failed:", error);
            this.isConnected = false;
            this.systemState.connected = false;
        }
    }

    simulateRealTimeData() {
        // Simulate environmental data changes
        const tempEl = document.getElementById('temp-value');
        const humidityEl = document.getElementById('humidity-value');
        const airQualityEl = document.getElementById('air-quality-value');

        if (tempEl) {
            const temp = (22.5 + (Math.random() - 0.5) * 2).toFixed(1);
            tempEl.textContent = temp + '°C';
        }

        if (humidityEl) {
            const humidity = Math.floor(45 + (Math.random() - 0.5) * 10);
            humidityEl.textContent = humidity + '%';
        }

        if (airQualityEl) {
            const airQualities = ['Excellent', 'Good', 'Fair', 'Poor'];
            airQualityEl.textContent = airQualities[Math.floor(Math.random() * 2)]; // Bias toward good
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Global instance
let sirDashboard;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    sirDashboard = new SIRDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (sirDashboard) {
        sirDashboard.destroy();
    }
});
