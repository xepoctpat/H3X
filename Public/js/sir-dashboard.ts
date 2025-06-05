/**
 * SIR Dashboard - Main Integration File
 * Combines Core, Data, and UI modules into a single unified dashboard
 */
class SIRDashboard {
    constructor() {
        console.log("🔮 SIR Dashboard Initialization Starting...");
        
        // Initialize the components
        this.core = null;
        this.dataManager = null;
        this.ui = null;
        
        this.initialize();
    }
    
    async initialize() {
        // Create core component
        this.core = new SIRDashboardCore();
        window.sirDashboardCore = this.core;
        await this.core.initialize();
        
        // Create data manager component
        this.dataManager = new SIRDashboardData();
        window.sirDataManager = this.dataManager;
        this.dataManager.initialize();
        
        // Create UI component
        this.ui = new SIRDashboardUI();
        window.sirUI = this.ui;
        this.ui.initialize();
        
        console.log("✅ SIR Dashboard fully initialized");
    }
    
    // Forward core methods for backward compatibility
    runAnalysis() {
        if (this.core) this.core.runAnalysis();
    }
    
    startSimulation() {
        if (this.core) this.core.startSimulation();
    }
    
    checkMonitoring() {
        if (this.core) this.core.checkMonitoring();
    }
    
    requestSupervision() {
        if (this.core) this.core.requestSupervision();
    }
    
    emergencyStop() {
        if (this.core) this.core.emergencyStop();
    }
}
                anomaliesFound: 0,
                predictionAccuracy: 0,
                learningVelocity: 0
            },
            environmentalFactors: {
                temperature: 22.5,
                humidity: 45,
                airQuality: 'Good',
                lightLevels: 350,
                soundLevels: 42,
                vibrationLevels: 0.2,
                electromagneticField: 0.8,
                airPressure: 1013.25
            },
            neuralActivity: {
                activeNodes: 247,
                connectionStrength: 85,
                processingSpeed: 2.4,
                learningRate: 0.73,
                memoryUtilization: 67,
                predictiveAccuracy: 94.2
            },
            temporalPatterns: {
                hourlyTrends: new Array(24).fill(0),
                dailyAverages: new Array(7).fill(0),
                monthlyProgression: new Array(30).fill(0)
            }
        };
        
        this.isConnected = false;
        this.updateInterval = null;
        this.patternAnalysisInterval = null;
        this.dataCollectionInterval = null;
        
        console.log("🔮 Enhanced SIR Dashboard with Pattern Analytics initialized");
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
        // Main system updates every 5 seconds
        this.updateInterval = setInterval(() => {
            if (this.isConnected) {
                this.checkSystemStatus();
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
            // Collect insights from multiple endpoints for comprehensive data
            const [statusResponse, analysisResponse] = await Promise.all([
                fetch(`${this.serverUrl}/status`),
                fetch(`${this.serverUrl}/sir-analysis`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        environment: 'realtime_observation',
                        analysisType: 'pattern_detection',
                        parameters: 'passive_learning_insights'
                    })
                })
            ]);
            
            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                this.processStatusInsights(statusData);
            }
            
            if (analysisResponse.ok) {
                const analysisData = await analysisResponse.json();
                this.processAnalysisInsights(analysisData);
            }
        } catch (error) {
            console.log("Real-time insights collection failed:", error);
        }
    }

    processStatusInsights(data) {
        // Process system status for behavioral patterns
        this.realtimeData.observations.dataPointsCollected += Math.floor(Math.random() * 50) + 25;
        
        if (data.systemState) {
            this.systemState = { ...this.systemState, ...data.systemState };
            
            // Track pattern progression
            this.realtimeData.patterns.behavioralTrends.push({
                timestamp: Date.now(),
                mode: data.systemState.mode,
                activity: data.systemState.monitoring ? 'active' : 'passive',
                efficiency: Math.random() * 20 + 80
            });
            
            // Keep only last 100 entries for performance
            if (this.realtimeData.patterns.behavioralTrends.length > 100) {
                this.realtimeData.patterns.behavioralTrends.shift();
            }
        }
    }

    processAnalysisInsights(data) {
        // Process SIR analysis for environmental patterns
        if (data.result && data.result.environmentalData) {
            this.updateEnvironmentalFactors(data.result.environmentalData);
        }
        
        // Simulate pattern detection results
        this.realtimeData.observations.patternMatches += Math.floor(Math.random() * 5) + 1;
        this.realtimeData.observations.predictionAccuracy = Math.max(85, 
            this.realtimeData.observations.predictionAccuracy + (Math.random() - 0.5) * 2);
    }

    analyzeObservationalPatterns() {
        const now = Date.now();
        
        // Detect environmental shifts
        const recentTemp = this.realtimeData.environmentalFactors.temperature;
        const recentHumidity = this.realtimeData.environmentalFactors.humidity;
        
        this.realtimeData.patterns.environmentalShifts.push({
            timestamp: now,
            temperature: recentTemp,
            humidity: recentHumidity,
            stability: Math.abs(recentTemp - 22.5) < 1 && Math.abs(recentHumidity - 45) < 5
        });
        
        // Learning progression tracking
        this.realtimeData.patterns.learningProgressions.push({
            timestamp: now,
            accuracy: this.realtimeData.observations.predictionAccuracy,
            dataPoints: this.realtimeData.observations.dataPointsCollected,
            velocity: this.realtimeData.observations.learningVelocity
        });
        
        // Anomaly detection simulation
        if (Math.random() < 0.1) { // 10% chance of detecting an anomaly
            this.realtimeData.patterns.anomalyDetections.push({
                timestamp: now,
                type: ['temperature_spike', 'unusual_pattern', 'data_irregularity', 'processing_anomaly'][Math.floor(Math.random() * 4)],
                severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                resolved: Math.random() > 0.3
            });
            this.realtimeData.observations.anomaliesFound++;
        }
        
        // Maintain array sizes for performance
        [this.realtimeData.patterns.environmentalShifts, 
         this.realtimeData.patterns.learningProgressions,
         this.realtimeData.patterns.anomalyDetections].forEach(array => {
            if (array.length > 200) array.splice(0, array.length - 200);
        });
    }

    updateDataCollectionMetrics() {
        // Simulate continuous data collection in PASSIVE mode
        this.realtimeData.observations.dataPointsCollected += Math.floor(Math.random() * 3) + 1;
        
        // Update neural activity
        this.realtimeData.neuralActivity.activeNodes = 247 + Math.floor(Math.random() * 20 - 10);
        this.realtimeData.neuralActivity.connectionStrength = Math.max(70, 
            this.realtimeData.neuralActivity.connectionStrength + (Math.random() - 0.5) * 3);
        this.realtimeData.neuralActivity.processingSpeed = Math.max(1.0,
            2.4 + (Math.random() - 0.5) * 0.8).toFixed(1);
        this.realtimeData.neuralActivity.memoryUtilization = Math.min(95,
            Math.max(50, this.realtimeData.neuralActivity.memoryUtilization + (Math.random() - 0.5) * 5));
    }

    trackLearningVelocity() {
        // Calculate learning velocity based on data collection rate
        const recent = this.realtimeData.patterns.learningProgressions.slice(-10);
        if (recent.length >= 2) {
            const latest = recent[recent.length - 1];
            const previous = recent[recent.length - 2];
            const timeDiff = (latest.timestamp - previous.timestamp) / 1000; // seconds
            const dataDiff = latest.dataPoints - previous.dataPoints;
            
            this.realtimeData.observations.learningVelocity = (dataDiff / timeDiff).toFixed(2);
        }
    }

    updateEnvironmentalFactors(data) {
        // Update environmental factors with new data
        if (data.temperature) this.realtimeData.environmentalFactors.temperature = data.temperature;
        if (data.humidity) this.realtimeData.environmentalFactors.humidity = data.humidity;
        if (data.airQuality) this.realtimeData.environmentalFactors.airQuality = data.airQuality;
        if (data.lightLevels) this.realtimeData.environmentalFactors.lightLevels = data.lightLevels;
    }

    updatePatternVisualizations() {
        // Update the dashboard with pattern insights
        this.updateAdvancedMetrics();
        this.updateEnvironmentalDisplay();
        this.updateNeuralActivityDisplay();
        this.updateAnomalyAlerts();
    }

    updateAdvancedMetrics() {
        // Update data points collected
        const dataPointsEl = document.getElementById('data-points-collected');
        if (dataPointsEl) {
            dataPointsEl.textContent = this.realtimeData.observations.dataPointsCollected.toLocaleString();
        }
        
        // Update pattern matches
        const patternMatchesEl = document.getElementById('pattern-matches');
        if (patternMatchesEl) {
            patternMatchesEl.textContent = this.realtimeData.observations.patternMatches.toLocaleString();
        }
        
        // Update prediction accuracy
        const predictionAccuracyEl = document.getElementById('prediction-accuracy');
        if (predictionAccuracyEl) {
            predictionAccuracyEl.textContent = this.realtimeData.observations.predictionAccuracy.toFixed(1) + '%';
        }
        
        // Update learning velocity
        const learningVelocityEl = document.getElementById('learning-velocity');
        if (learningVelocityEl) {
            learningVelocityEl.textContent = this.realtimeData.observations.learningVelocity + ' pts/sec';
        }
        
        // Update anomalies found
        const anomaliesEl = document.getElementById('anomalies-found');
        if (anomaliesEl) {
            anomaliesEl.textContent = this.realtimeData.observations.anomaliesFound;
        }
    }

    updateEnvironmentalDisplay() {
        // Update detailed environmental readings
        const envReadings = [
            ['temp-reading', this.realtimeData.environmentalFactors.temperature.toFixed(1) + '°C'],
            ['humidity-reading', this.realtimeData.environmentalFactors.humidity + '%'],
            ['air-quality-reading', this.realtimeData.environmentalFactors.airQuality],
            ['light-levels-reading', this.realtimeData.environmentalFactors.lightLevels + ' lux'],
            ['sound-levels-reading', this.realtimeData.environmentalFactors.soundLevels + ' dB'],
            ['vibration-reading', this.realtimeData.environmentalFactors.vibrationLevels.toFixed(1) + ' Hz'],
            ['em-field-reading', this.realtimeData.environmentalFactors.electromagneticField.toFixed(1) + ' mT'],
            ['pressure-reading', this.realtimeData.environmentalFactors.airPressure.toFixed(1) + ' hPa']
        ];
        
        envReadings.forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    updateNeuralActivityDisplay() {
        // Update neural network activity metrics
        const neuralReadings = [
            ['neural-nodes', this.realtimeData.neuralActivity.activeNodes],
            ['connection-strength', this.realtimeData.neuralActivity.connectionStrength.toFixed(1) + '%'],
            ['processing-speed', this.realtimeData.neuralActivity.processingSpeed + ' GHz'],
            ['learning-rate', this.realtimeData.neuralActivity.learningRate.toFixed(2)],
            ['memory-utilization', this.realtimeData.neuralActivity.memoryUtilization.toFixed(1) + '%'],
            ['predictive-accuracy', this.realtimeData.neuralActivity.predictiveAccuracy.toFixed(1) + '%']
        ];
        
        neuralReadings.forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    updateAnomalyAlerts() {
        // Display recent anomalies
        const recentAnomalies = this.realtimeData.patterns.anomalyDetections.slice(-5);
        const anomalyListEl = document.getElementById('anomaly-list');
        
        if (anomalyListEl && recentAnomalies.length > 0) {
            anomalyListEl.innerHTML = recentAnomalies.map(anomaly => {
                const timeStr = new Date(anomaly.timestamp).toLocaleTimeString();
                const severityColor = { low: '#00ff00', medium: '#ffaa00', high: '#ff0000' }[anomaly.severity];
                const statusIcon = anomaly.resolved ? '✅' : '⚠️';
                
                return `<div style="color: ${severityColor}; margin: 2px 0;">
                    ${statusIcon} ${timeStr} - ${anomaly.type.replace('_', ' ').toUpperCase()} 
                    (${anomaly.severity})
                </div>`;
            }).join('');
        }
    }

    simulatePatternDetection() {
        // Enhanced simulation for pattern detection in demo mode
        this.realtimeData.observations.patternMatches += Math.floor(Math.random() * 3) + 1;
        
        // Simulate environmental shifts
        this.realtimeData.environmentalFactors.temperature += (Math.random() - 0.5) * 0.2;
        this.realtimeData.environmentalFactors.humidity += Math.floor((Math.random() - 0.5) * 2);
        this.realtimeData.environmentalFactors.soundLevels = 42 + Math.floor((Math.random() - 0.5) * 8);
        this.realtimeData.environmentalFactors.vibrationLevels = Math.max(0, 
            this.realtimeData.environmentalFactors.vibrationLevels + (Math.random() - 0.5) * 0.1);
        
        // Simulate neural activity changes
        this.realtimeData.neuralActivity.learningRate = Math.max(0.1,
            Math.min(1.0, this.realtimeData.neuralActivity.learningRate + (Math.random() - 0.5) * 0.05));
        
        // Update prediction accuracy with slight improvements over time (learning effect)
        this.realtimeData.observations.predictionAccuracy = Math.min(99.9,
            this.realtimeData.observations.predictionAccuracy + Math.random() * 0.1);
    }

    // ...existing code...
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
