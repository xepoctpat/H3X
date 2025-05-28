/**
 * SIR Dashboard UI Module
 * Handles UI creation, controls, and visualization components
 */
class SIRDashboardUI {
    constructor() {
        console.log("🔮 SIR Dashboard UI Module initialized");
    }

    initialize() {
        this.setupUI();
        console.log("✅ SIR Dashboard UI ready");
    }

    setupUI() {
        this.createDashboardMetrics();
        this.createVisualizationControls();
        this.updateSystemStatus();
    }

    createDashboardMetrics() {
        const dashboardGrid = document.querySelector('.dashboard-grid');
        if (!dashboardGrid) return;

        // Get data from core module if available
        let systemState = { mode: 'PASSIVE', monitoring: false, simulation: false, connected: false };
        let metrics = { environmentalCompliance: 0, aiReadiness: 0, simulationAccuracy: 0, systemHealth: 0 };
        let isConnected = false;

        if (window.sirDashboardCore) {
            systemState = window.sirDashboardCore.getSystemState();
            metrics = window.sirDashboardCore.getMetrics();
            isConnected = window.sirDashboardCore.getConnectionStatus();
        }

        dashboardGrid.innerHTML = `
            <!-- System Status Card -->
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">System Status</span>
                    <div class="status-indicator" id="system-status-indicator"></div>
                </div>
                <div class="metric-value" id="system-mode">${systemState.mode}</div>
                <div class="metric-description" id="connection-status">
                    ${isConnected ? 'Connected to LMStudio Backend' : 'Demo Mode - Backend Offline'}
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="system-health-progress" style="width: ${isConnected ? 85 : 45}%"></div>
                </div>
            </div>

            <!-- Environmental Compliance Card -->
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Environmental Compliance</span>
                    <div class="status-indicator status-active"></div>
                </div>
                <div class="metric-value" id="env-compliance">${metrics.environmentalCompliance}%</div>
                <div class="metric-description">Real-life standards compliance</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="env-progress" style="width: ${metrics.environmentalCompliance}%"></div>
                </div>
            </div>

            <!-- AI Readiness Card -->
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">AI Readiness</span>
                    <div class="status-indicator status-warning"></div>
                </div>
                <div class="metric-value" id="ai-readiness">${metrics.aiReadiness}%</div>
                <div class="metric-description">Deployment readiness assessment</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="ai-progress" style="width: ${metrics.aiReadiness}%"></div>
                </div>
            </div>

            <!-- Simulation Status Card -->
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Simulation Status</span>
                    <div class="status-indicator ${systemState.simulation ? 'status-active' : 'status-warning'}"></div>
                </div>
                <div class="metric-value" id="simulation-status">${systemState.simulation ? 'Running' : 'Standby'}</div>
                <div class="metric-description">Environment simulation state</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="simulation-progress" style="width: ${metrics.simulationAccuracy}%"></div>
                </div>
            </div>

            <!-- Monitoring Status Card -->
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Monitoring Active</span>
                    <div class="status-indicator ${systemState.monitoring ? 'status-active' : 'status-warning'}"></div>
                </div>
                <div class="metric-value" id="monitoring-status">${systemState.monitoring ? 'Active' : 'Inactive'}</div>
                <div class="metric-description">System health monitoring</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="monitoring-progress" style="width: ${metrics.systemHealth}%"></div>
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
            
            <!-- Pattern Recognition Card (NEW) -->
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Pattern Recognition</span>
                    <div class="status-indicator status-active"></div>
                </div>
                <div class="metric-value" id="pattern-matches">0</div>
                <div class="metric-description">Identified data patterns</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="pattern-progress" style="width: 60%"></div>
                </div>
            </div>

            <!-- Learning Velocity Card (NEW) -->
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Learning Velocity</span>
                    <div class="status-indicator status-active"></div>
                </div>
                <div class="metric-value" id="learning-velocity">0.0</div>
                <div class="metric-description">Knowledge acquisition rate</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="learning-progress" style="width: 70%"></div>
                </div>
            </div>
            
            <!-- Prediction Accuracy Card (NEW) -->
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Prediction Accuracy</span>
                    <div class="status-indicator status-active"></div>
                </div>
                <div class="metric-value" id="prediction-accuracy">0.0%</div>
                <div class="metric-description">Forecast reliability score</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="prediction-progress" style="width: 80%"></div>
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
                <button class="control-button" id="run-analysis-btn">
                    🔬 Run SIR Analysis
                </button>
                <button class="control-button" id="start-simulation-btn">
                    🌍 Start Simulation
                </button>
                <button class="control-button" id="system-monitor-btn">
                    📊 System Monitor
                </button>
                <button class="control-button" id="request-supervision-btn">
                    👥 Human Supervision
                </button>
                <button class="control-button danger" id="emergency-stop-btn">
                    🛑 Emergency Stop
                </button>
            </div>
            
            <div class="visualization-tabs">
                <div class="tab-buttons">
                    <button class="tab-button active" data-tab="environment">Environment</button>
                    <button class="tab-button" data-tab="neural">Neural Activity</button>
                    <button class="tab-button" data-tab="patterns">Pattern Analysis</button>
                    <button class="tab-button" data-tab="insights">SIR Insights</button>
                </div>
                <div class="tab-content">
                    <div class="tab-panel active" id="environment-tab">
                        <div class="env-metrics-grid">
                            <div class="env-metric">
                                <span class="env-label">Temperature</span>
                                <span class="env-value" id="temp-value">22.5°C</span>
                            </div>
                            <div class="env-metric">
                                <span class="env-label">Humidity</span>
                                <span class="env-value" id="humidity-value">45%</span>
                            </div>
                            <div class="env-metric">
                                <span class="env-label">Air Quality</span>
                                <span class="env-value" id="air-quality-value">Good</span>
                            </div>
                            <div class="env-metric">
                                <span class="env-label">Light Levels</span>
                                <span class="env-value" id="light-value">350 lux</span>
                            </div>
                            <div class="env-metric">
                                <span class="env-label">Sound Levels</span>
                                <span class="env-value" id="sound-value">42 dB</span>
                            </div>
                            <div class="env-metric">
                                <span class="env-label">EM Field</span>
                                <span class="env-value" id="em-field-value">0.8 μT</span>
                            </div>
                        </div>
                    </div>
                    <div class="tab-panel" id="neural-tab">
                        <div class="neural-metrics-grid">
                            <div class="neural-metric">
                                <span class="neural-label">Active Nodes</span>
                                <span class="neural-value" id="active-nodes-value">247</span>
                            </div>
                            <div class="neural-metric">
                                <span class="neural-label">Connection Strength</span>
                                <span class="neural-value" id="connection-strength-value">85%</span>
                            </div>
                            <div class="neural-metric">
                                <span class="neural-label">Processing Speed</span>
                                <span class="neural-value" id="processing-speed-value">2.4 GHz</span>
                            </div>
                            <div class="neural-metric">
                                <span class="neural-label">Learning Rate</span>
                                <span class="neural-value" id="learning-rate-value">0.73</span>
                            </div>
                            <div class="neural-metric">
                                <span class="neural-label">Memory Utilization</span>
                                <span class="neural-value" id="memory-utilization-value">67%</span>
                            </div>
                            <div class="neural-metric">
                                <span class="neural-label">Predictive Accuracy</span>
                                <span class="neural-value" id="predictive-accuracy-value">94.2%</span>
                            </div>
                        </div>
                    </div>
                    <div class="tab-panel" id="patterns-tab">
                        <div class="patterns-grid">
                            <div class="pattern-card">
                                <h4>Behavioral Trends</h4>
                                <div class="pattern-count" id="behavioral-trends-count">0 patterns</div>
                                <div class="pattern-chart" id="behavioral-chart"></div>
                            </div>
                            <div class="pattern-card">
                                <h4>Environmental Shifts</h4>
                                <div class="pattern-count" id="environmental-shifts-count">0 patterns</div>
                                <div class="pattern-chart" id="environmental-chart"></div>
                            </div>
                            <div class="pattern-card">
                                <h4>Learning Progressions</h4>
                                <div class="pattern-count" id="learning-progressions-count">0 patterns</div>
                                <div class="pattern-chart" id="learning-chart"></div>
                            </div>
                            <div class="pattern-card">
                                <h4>Anomaly Detections</h4>
                                <div class="pattern-count" id="anomaly-detections-count">0 patterns</div>
                                <div class="pattern-chart" id="anomaly-chart"></div>
                            </div>
                        </div>
                    </div>
                    <div class="tab-panel" id="insights-tab">
                        <div class="insights-container">
                            <div class="insight-card">
                                <h4>PASSIVE Mode Analysis</h4>
                                <p>During PASSIVE observation mode, the SIR system is primarily gathering data and building its understanding of the environment. This phase is critical for establishing baselines and detecting patterns without interference.</p>
                                <div class="insight-metrics">
                                    <div class="insight-metric">
                                        <span>Data Points</span>
                                        <span class="value" id="data-points-value">0</span>
                                    </div>
                                    <div class="insight-metric">
                                        <span>Patterns Detected</span>
                                        <span class="value" id="patterns-detected-value">0</span>
                                    </div>
                                    <div class="insight-metric">
                                        <span>Anomalies Found</span>
                                        <span class="value" id="anomalies-found-value">0</span>
                                    </div>
                                </div>
                            </div>
                            <div class="insight-recommendations" id="sir-recommendations">
                                <h4>SIR Recommendations</h4>
                                <ul>
                                    <li>Continue passive observation to improve pattern recognition</li>
                                    <li>Current environmental factors are within optimal ranges</li>
                                    <li>Neural activity shows healthy learning progression</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Setup tab functionality
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Add active class to clicked button and corresponding panel
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });

        // Setup button click handlers
        this.setupButtonHandlers();
    }

    setupButtonHandlers() {
        // Run Analysis button
        const runAnalysisBtn = document.getElementById('run-analysis-btn');
        if (runAnalysisBtn) {
            runAnalysisBtn.addEventListener('click', () => {
                if (window.sirDashboardCore) {
                    window.sirDashboardCore.runAnalysis();
                }
            });
        }

        // Start Simulation button
        const startSimulationBtn = document.getElementById('start-simulation-btn');
        if (startSimulationBtn) {
            startSimulationBtn.addEventListener('click', () => {
                if (window.sirDashboardCore) {
                    window.sirDashboardCore.startSimulation();
                }
            });
        }

        // System Monitor button
        const systemMonitorBtn = document.getElementById('system-monitor-btn');
        if (systemMonitorBtn) {
            systemMonitorBtn.addEventListener('click', () => {
                if (window.sirDashboardCore) {
                    window.sirDashboardCore.checkMonitoring();
                }
            });
        }

        // Request Supervision button
        const requestSupervisionBtn = document.getElementById('request-supervision-btn');
        if (requestSupervisionBtn) {
            requestSupervisionBtn.addEventListener('click', () => {
                if (window.sirDashboardCore) {
                    window.sirDashboardCore.requestSupervision();
                }
            });
        }

        // Emergency Stop button
        const emergencyStopBtn = document.getElementById('emergency-stop-btn');
        if (emergencyStopBtn) {
            emergencyStopBtn.addEventListener('click', () => {
                if (window.sirDashboardCore) {
                    window.sirDashboardCore.emergencyStop();
                }
            });
        }
    }

    updateSystemStatus() {
        if (!window.sirDashboardCore) return;
        
        const systemState = window.sirDashboardCore.getSystemState();
        const metrics = window.sirDashboardCore.getMetrics();
        const isConnected = window.sirDashboardCore.getConnectionStatus();

        // Update system status indicator
        const statusIndicator = document.getElementById('system-status-indicator');
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator ' + 
                (isConnected ? 'status-active' : 'status-warning');
        }

        // Update mode display
        const systemMode = document.getElementById('system-mode');
        if (systemMode) {
            systemMode.textContent = systemState.mode;
        }

        // Update connection status
        const connectionStatus = document.getElementById('connection-status');
        if (connectionStatus) {
            connectionStatus.textContent = isConnected ? 
                'Connected to LMStudio Backend' : 
                'Demo Mode - Backend Offline';
        }

        // Update progress bars
        this.updateProgressBar('env-progress', metrics.environmentalCompliance);
        this.updateProgressBar('ai-progress', metrics.aiReadiness);
        this.updateProgressBar('simulation-progress', metrics.simulationAccuracy);
        this.updateProgressBar('monitoring-progress', metrics.systemHealth);
        this.updateProgressBar('system-health-progress', isConnected ? 85 : 45);

        // Update metric values
        const envCompliance = document.getElementById('env-compliance');
        if (envCompliance) envCompliance.textContent = metrics.environmentalCompliance + '%';

        const aiReadiness = document.getElementById('ai-readiness');
        if (aiReadiness) aiReadiness.textContent = metrics.aiReadiness + '%';

        // Update simulation status
        const simulationStatus = document.getElementById('simulation-status');
        if (simulationStatus) {
            simulationStatus.textContent = systemState.simulation ? 'Running' : 'Standby';
        }

        // Update monitoring status
        const monitoringStatus = document.getElementById('monitoring-status');
        if (monitoringStatus) {
            monitoringStatus.textContent = systemState.monitoring ? 'Active' : 'Inactive';
        }
    }

    updateDataVisualizations(realtimeData) {
        if (!realtimeData) return;
        
        // Update environmental factors
        const env = realtimeData.environmentalFactors;
        if (env) {
            document.getElementById('temp-value')?.textContent = env.temperature.toFixed(1) + '°C';
            document.getElementById('humidity-value')?.textContent = Math.round(env.humidity) + '%';
            document.getElementById('air-quality-value')?.textContent = env.airQuality;
            document.getElementById('light-value')?.textContent = Math.round(env.lightLevels) + ' lux';
            document.getElementById('sound-value')?.textContent = Math.round(env.soundLevels) + ' dB';
            document.getElementById('em-field-value')?.textContent = env.electromagneticField.toFixed(1) + ' μT';
        }
        
        // Update neural activity
        const neural = realtimeData.neuralActivity;
        if (neural) {
            document.getElementById('active-nodes-value')?.textContent = neural.activeNodes;
            document.getElementById('connection-strength-value')?.textContent = neural.connectionStrength + '%';
            document.getElementById('processing-speed-value')?.textContent = neural.processingSpeed.toFixed(1) + ' GHz';
            document.getElementById('learning-rate-value')?.textContent = neural.learningRate.toFixed(2);
            document.getElementById('memory-utilization-value')?.textContent = neural.memoryUtilization + '%';
            document.getElementById('predictive-accuracy-value')?.textContent = neural.predictiveAccuracy.toFixed(1) + '%';
        }
        
        // Update observation metrics
        const obs = realtimeData.observations;
        if (obs) {
            // Update the dashboard cards
            document.getElementById('pattern-matches')?.textContent = obs.patternMatches;
            document.getElementById('learning-velocity')?.textContent = obs.learningVelocity.toFixed(1);
            document.getElementById('prediction-accuracy')?.textContent = obs.predictionAccuracy.toFixed(1) + '%';
            
            // Update the progress bars
            this.updateProgressBar('pattern-progress', Math.min(100, obs.patternMatches / 2));
            this.updateProgressBar('learning-progress', obs.learningVelocity * 10);
            this.updateProgressBar('prediction-progress', obs.predictionAccuracy);
            
            // Update the insights tab
            document.getElementById('data-points-value')?.textContent = obs.dataPointsCollected.toLocaleString();
            document.getElementById('patterns-detected-value')?.textContent = obs.patternMatches;
            document.getElementById('anomalies-found-value')?.textContent = obs.anomaliesFound;
        }
    }

    updatePatternVisualizations(patterns) {
        if (!patterns) return;
        
        // Update pattern counts
        document.getElementById('behavioral-trends-count')?.textContent = 
            patterns.behavioralTrends.length + ' patterns';
        document.getElementById('environmental-shifts-count')?.textContent = 
            patterns.environmentalShifts.length + ' patterns';
        document.getElementById('learning-progressions-count')?.textContent = 
            patterns.learningProgressions.length + ' patterns';
        document.getElementById('anomaly-detections-count')?.textContent = 
            patterns.anomalyDetections.length + ' patterns';
            
        // Update SIR recommendations based on patterns
        this.updateSIRRecommendations(patterns);
        
        // Pattern charts would be implemented here with a visualization library
        // This is a placeholder for actual chart implementation
    }

    updateSIRRecommendations(patterns) {
        const recommendationsEl = document.getElementById('sir-recommendations');
        if (!recommendationsEl) return;
        
        // Generate dynamic recommendations based on current patterns
        let recommendations = '<h4>SIR Recommendations</h4><ul>';
        
        // Base recommendations on PASSIVE mode insights
        recommendations += '<li>Continue passive observation to improve pattern recognition</li>';
        
        // Add dynamic recommendations based on patterns
        if (patterns.behavioralTrends.length > 10) {
            recommendations += '<li>Sufficient behavioral data collected for initial analysis</li>';
        } else {
            recommendations += '<li>More behavioral data needed for robust pattern detection</li>';
        }
        
        if (patterns.anomalyDetections.length > 0) {
            recommendations += '<li>Investigate detected anomalies to refine monitoring parameters</li>';
        } else {
            recommendations += '<li>Current environmental factors are within optimal ranges</li>';
        }
        
        if (patterns.learningProgressions.length > 5) {
            recommendations += '<li>Neural activity shows healthy learning progression</li>';
        } else {
            recommendations += '<li>Establish longer observation window for learning assessment</li>';
        }
        
        // Add common final recommendation
        recommendations += '<li>PASSIVE mode providing valuable baseline data for future operations</li>';
        
        recommendations += '</ul>';
        
        recommendationsEl.innerHTML = recommendations;
    }

    updateProgressBar(id, percentage) {
        const progressBar = document.getElementById(id);
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            
            // Update color based on percentage
            if (percentage < 30) {
                progressBar.style.backgroundColor = '#ff4747';
            } else if (percentage < 70) {
                progressBar.style.backgroundColor = '#ffaa00';
            } else {
                progressBar.style.backgroundColor = '#00cc66';
            }
        }
    }
}

// Export for global access
window.SIRDashboardUI = SIRDashboardUI;
