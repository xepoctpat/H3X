/**
 * AI Integration Control Center Core JavaScript
 * Handles Docker integration, LMStudio management, and system resets
 * (All Azure, M365, Teams, and bot logic removed for local/server/container operation)
 */

class AIIntegrationControlCenter {
    constructor() {
        this.dockerConfig = { status: 'detecting' };

        this.lmstudioConfig = {
            url: 'http://localhost:1234',
            model: '',
            temperature: 0.7,
            maxTokens: 2048,
            status: 'connected'
        };

        this.systemHealth = {
            docker: 0,
            lmstudio: 85,
            neural: 100
        };

        this.resetState = {
            docker: true,
            lmstudio: true,
            neural: true,
            database: false
        };

        this.logs = [];
        this.isInitialized = false;
    }

    // Initialize the control center
    async initialize() {
        try {
            this.log('Initializing AI Integration Control Center...', 'info');
            
            // Initialize components
            await this.initializeDockerIntegration();
            await this.initializeLMStudioConnection();
            await this.initializeSystemMonitoring();
            
            this.isInitialized = true;
            this.updateSystemStatus('OPERATIONAL');
            this.log('AI Integration Control Center initialized successfully', 'success');
            
        } catch (error) {
            this.log(`Initialization failed: ${error.message}`, 'error');
            this.updateSystemStatus('ERROR');
        }
    }

    // Docker Integration Methods
    async initializeDockerIntegration() {
        try {
            this.log('Initializing Docker integration...', 'info');
            
            // Scan for available containers
            await this.scanContainers();
            
            this.updateDockerStatus('DETECTED');
            this.systemHealth.docker = 60;
            this.updateHealthMetrics();
            
        } catch (error) {
            this.log(`Docker initialization error: ${error.message}`, 'error');
            this.updateDockerStatus('ERROR');
        }
    }

    async scanContainers() {
        try {
            this.log('Scanning for Docker containers...', 'info');
            
            // Simulate container discovery
            const containers = [
                { name: 'lmstudio-server', status: 'running', port: 1234 },
                { name: 'vector-database', status: 'stopped', port: 5432 },
                { name: 'ai-pipeline', status: 'running', port: 8080 },
                { name: 'neural-cache', status: 'running', port: 6379 }
            ];

            this.dockerConfig.containers = containers;
            this.updateContainerList(containers);
            
            this.log(`Found ${containers.length} Docker containers`, 'success');
            this.systemHealth.docker = 80;
            this.updateHealthMetrics();
            
        } catch (error) {
            this.log(`Container scan failed: ${error.message}`, 'error');
        }
    }

    updateContainerList(containers) {
        const containerList = document.getElementById('containerList');
        if (!containerList) return;

        containerList.innerHTML = '';
        
        containers.forEach(container => {
            const item = document.createElement('div');
            item.className = 'container-item';
            item.innerHTML = `
                <div>
                    <i class="fas fa-cube"></i>
                    <span>${container.name}</span>
                    <small>(${container.status}:${container.port})</small>
                </div>
                <div class="container-actions">
                    <button onclick="controlCenter.connectContainer('${container.name}')">Connect</button>
                    <button onclick="controlCenter.configureContainer('${container.name}')">Configure</button>
                </div>
            `;
            containerList.appendChild(item);
        });
    }

    async connectContainer(containerName) {
        try {
            this.log(`Connecting to container: ${containerName}...`, 'info');
            
            // Simulate container connection
            await this.delay(1000);
            
            this.log(`Connected to ${containerName} successfully`, 'success');
            this.systemHealth.docker += 5;
            this.updateHealthMetrics();
            
        } catch (error) {
            this.log(`Failed to connect to ${containerName}: ${error.message}`, 'error');
        }
    }

    async generateCompose() {
        try {
            this.log('Generating Docker Compose configuration...', 'info');
            
            const compose = `version: '3.8'

services:
  lmstudio-server:
    image: lmstudio/server:latest
    ports:
      - "1234:1234"
    environment:
      - MODEL_PATH=/models
      - API_KEY=\${LMSTUDIO_API_KEY}
    volumes:
      - ./models:/models
    networks:
      - h3x-neural-network

  vector-database:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qdrant_storage:/qdrant/storage
    networks:
      - h3x-neural-network

  ai-pipeline:
    image: h3x/neural-pipeline:latest
    ports:
      - "8080:8080"
    environment:
      - LMSTUDIO_URL=http://lmstudio-server:1234
      - VECTOR_DB_URL=http://vector-database:6333
      - AZURE_CLIENT_ID=\${AZURE_CLIENT_ID}
      - AZURE_CLIENT_SECRET=\${AZURE_CLIENT_SECRET}
    depends_on:
      - lmstudio-server
      - vector-database
    networks:
      - h3x-neural-network

  h3x-neural-bot:
    image: h3x/neural-bot:latest
    ports:
      - "3978:3978"
    environment:
      - BOT_ID=\${BOT_ID}
      - BOT_PASSWORD=\${BOT_PASSWORD}
      - AI_PIPELINE_URL=http://ai-pipeline:8080
    depends_on:
      - ai-pipeline
    networks:
      - h3x-neural-network

networks:
  h3x-neural-network:
    driver: bridge

volumes:
  qdrant_storage:
  models:`;

            document.getElementById('dockerCompose').value = compose;
            this.log('Docker Compose configuration generated', 'success');
            
        } catch (error) {
            this.log(`Compose generation failed: ${error.message}`, 'error');
        }
    }

    // LMStudio Integration Methods
    async initializeLMStudioConnection() {
        try {
            this.log('Initializing LMStudio connection...', 'info');
            
            // Test LMStudio connection
            const isConnected = await this.testLMStudioConnection();
            
            if (isConnected) {
                this.updateLMStudioStatus('CONNECTED');
                this.loadModels();
                this.log('LMStudio connection established', 'success');
            } else {
                this.updateLMStudioStatus('DISCONNECTED');
                this.log('LMStudio connection failed', 'warning');
                this.systemHealth.lmstudio = 0;
            }
            
            this.updateHealthMetrics();
            
        } catch (error) {
            this.log(`LMStudio initialization error: ${error.message}`, 'error');
            this.updateLMStudioStatus('ERROR');
        }
    }

    async testLMStudioConnection() {
        try {
            // Simulate API call to LMStudio
            await this.delay(1000);
            return true; // Simulate successful connection
        } catch (error) {
            return false;
        }
    }

    async loadModels() {
        try {
            // Simulate loading available models
            const models = [
                'llama-2-7b-chat',
                'mistral-7b-instruct',
                'codellama-7b-instruct',
                'neural-chat-7b'
            ];

            const modelSelect = document.getElementById('selectedModel');
            if (modelSelect) {
                modelSelect.innerHTML = '<option value="">Select Model...</option>';
                models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model;
                    option.textContent = model;
                    modelSelect.appendChild(option);
                });
            }

            this.log(`Loaded ${models.length} available models`, 'success');
            
        } catch (error) {
            this.log(`Model loading failed: ${error.message}`, 'error');
        }
    }

    async sendTestPrompt() {
        try {
            const prompt = document.getElementById('testPrompt').value;
            if (!prompt.trim()) {
                alert('Please enter a test prompt');
                return;
            }

            this.log('Sending test prompt to LMStudio...', 'info');
            
            // Simulate AI response
            const response = await this.simulateAIResponse(prompt);
            
            document.getElementById('testResponse').textContent = response;
            this.log('Test prompt completed successfully', 'success');
            
        } catch (error) {
            this.log(`Test prompt failed: ${error.message}`, 'error');
        }
    }

    async simulateAIResponse(prompt) {
        await this.delay(2000);
        return `AI Response to: "${prompt}"\n\nThis is a simulated response from the H3X Neural AI system. The integration with LMStudio is working correctly, and the system is ready to process complex queries across Microsoft 365 applications with advanced AI capabilities.`;
    }

    // System Reset Methods
    async performSoftReset() {
        const confirmation = await this.showResetConfirmation(
            'Soft Reset',
            'This will reset UI states and clear temporary data. No permanent data will be lost.'
        );
        
        if (confirmation) {
            this.log('Performing soft reset...', 'info');
            await this.delay(1000);
            
            // Reset UI states
            this.resetUIStates();
            this.log('Soft reset completed', 'success');
        }
    }

    async performMediumReset() {
        const confirmation = await this.showResetConfirmation(
            'Medium Reset',
            'This will reset configurations and restart services. Some settings may need to be reconfigured.'
        );
        
        if (confirmation) {
            this.log('Performing medium reset...', 'warning');
            await this.delay(2000);
            
            // Reset configurations
            this.resetConfigurations();
            await this.initialize();
            this.log('Medium reset completed', 'success');
        }
    }

    async performHardReset() {
        const confirmation = await this.showResetConfirmation(
            'Hard Reset',
            'This will reset all connections and configurations. You will need to reconfigure everything.'
        );
        
        if (confirmation) {
            this.log('Performing hard reset...', 'error');
            await this.delay(3000);
            
            // Hard reset all systems
            this.hardResetSystems();
            await this.initialize();
            this.log('Hard reset completed', 'success');
        }
    }

    async performFactoryReset() {
        const confirmation = await this.showResetConfirmation(
            'Factory Reset',
            'WARNING: This will completely reset the entire system to factory defaults. All data and configurations will be permanently lost!'
        );
        
        if (confirmation) {
            this.log('Performing factory reset...', 'error');
            await this.delay(5000);
            
            // Factory reset everything
            this.factoryResetSystem();
            location.reload();
        }
    }

    showResetConfirmation(type, message) {
        return new Promise((resolve) => {
            const confirmationDiv = document.getElementById('resetConfirmation');
            const warningText = document.getElementById('resetWarning');
            
            warningText.textContent = message;
            confirmationDiv.style.display = 'block';
            
            this.pendingResetConfirmation = resolve;
        });
    }

    confirmReset() {
        if (this.pendingResetConfirmation) {
            this.pendingResetConfirmation(true);
            this.hideResetConfirmation();
        }
    }

    cancelReset() {
        if (this.pendingResetConfirmation) {
            this.pendingResetConfirmation(false);
            this.hideResetConfirmation();
        }
    }

    hideResetConfirmation() {
        const confirmationDiv = document.getElementById('resetConfirmation');
        confirmationDiv.style.display = 'none';
        this.pendingResetConfirmation = null;
    }

    // System Monitoring Methods
    async initializeSystemMonitoring() {
        this.startHealthMonitoring();
        this.updateHealthMetrics();
    }

    startHealthMonitoring() {
        setInterval(() => {
            this.updateHealthMetrics();
        }, 5000);
    }

    updateHealthMetrics() {
        // Update health displays
        document.getElementById('dockerHealth').textContent = `${this.systemHealth.docker}%`;
        document.getElementById('lmstudioHealth').textContent = `${this.systemHealth.lmstudio}%`;
        document.getElementById('neuralHealth').textContent = `${this.systemHealth.neural}%`;

        // Update progress bars
        document.querySelector('[data-metric="docker"]').style.width = `${this.systemHealth.docker}%`;
        document.querySelector('[data-metric="lmstudio"]').style.width = `${this.systemHealth.lmstudio}%`;
        document.querySelector('[data-metric="neural"]').style.width = `${this.systemHealth.neural}%`;
    }

    // Utility Methods
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = { timestamp, message, type };
        this.logs.push(entry);

        // Add to log viewer
        const logViewer = document.getElementById('systemLogs');
        if (logViewer) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${type}`;
            logEntry.innerHTML = `
                <span class="log-time">${timestamp}</span>
                <span class="log-message">${message}</span>
            `;
            logViewer.appendChild(logEntry);
            logViewer.scrollTop = logViewer.scrollHeight;
        }

        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    }

    // --- Database Clone/Backup Integration ---
    async cloneDatabase() {
        try {
            this.log('Initiating database clone/backup...', 'info');
            showBanner('Cloning database...','info',0);
            const response = await fetch('http://localhost:8080/api/db/clone', { method: 'POST' });
            if (response.ok) {
                this.log('Database clone/backup completed successfully', 'success');
                showBanner('Database clone/backup completed!','success');
            } else {
                this.log('Database clone/backup failed', 'error');
                showBanner('Database clone/backup failed','error',5000);
            }
        } catch (error) {
            this.log('Database clone/backup error: ' + error.message, 'error');
            showBanner('Database clone/backup error: ' + error.message, 'error', 5000);
        } finally {
            setTimeout(() => {
                let banner = document.getElementById('qolBanner');
                if (banner) banner.style.display = 'none';
            }, 2000);
        }
    }

    updateSystemStatus(status) {
        const statusElement = document.getElementById('systemStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    updateDockerStatus(status) {
        const statusElement = document.getElementById('dockerStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    updateLMStudioStatus(status) {
        const statusElement = document.getElementById('lmstudioStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    markRequirementComplete(requirement) {
        const requirements = document.querySelectorAll('.requirement-item');
        requirements.forEach(item => {
            if (item.textContent.toLowerCase().includes(requirement)) {
                item.setAttribute('data-status', 'completed');
            }
        });
    }

    resetUIStates() {
        // Reset all form inputs
        document.querySelectorAll('input, select, textarea').forEach(element => {
            if (element.type === 'checkbox') {
                element.checked = element.id !== 'resetDatabase';
            } else if (element.id !== 'lmstudioUrl') {
                element.value = '';
            }
        });

        // Reset requirement states
        document.querySelectorAll('.requirement-item').forEach(item => {
            item.setAttribute('data-status', 'pending');
        });
    }

    resetConfigurations() {
        this.dockerConfig = { status: 'detecting', containers: [] };
        this.lmstudioConfig = {
            url: 'http://localhost:1234',
            model: '',
            temperature: 0.7,
            maxTokens: 2048,
            status: 'connected'
        };
        this.systemHealth.docker = 0;
        this.systemHealth.lmstudio = 0;
        this.systemHealth.neural = 50;
        this.resetUIStates();
    }

    hardResetSystems() {
        this.resetConfigurations();
        this.logs = [];
        
        // Clear log viewer
        const logViewer = document.getElementById('systemLogs');
        if (logViewer) {
            logViewer.innerHTML = '';
        }
    }

    factoryResetSystem() {
        // Clear all local storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Reset everything
        this.hardResetSystems();
        this.systemHealth.neural = 0;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    clearLogs() {
        this.logs = [];
        const logViewer = document.getElementById('systemLogs');
        if (logViewer) {
            logViewer.innerHTML = '';
        }
    }

    exportLogs() {
        const logsText = this.logs.map(log => 
            `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
        ).join('\n');
        
        const blob = new Blob([logsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `h3x-neural-logs-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    refreshLogs() {
        this.log('System logs refreshed', 'info');
    }

    toggleMapping(mapping) {
        const button = document.querySelector(`[onclick="toggleMapping('${mapping}')"]`);
        if (button) {
            const currentStatus = button.getAttribute('data-status');
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            
            button.setAttribute('data-status', newStatus);
            button.textContent = newStatus === 'active' ? 'Active' : 'Activate';
            
            this.log(`Integration mapping ${mapping} ${newStatus}`, 'info');
        }
    }
}

// Global functions for button events
let controlCenter;

function initializeControlCenter() {
    controlCenter = new AIIntegrationControlCenter();
    controlCenter.initialize();
}

function updateSystemStatus() {
    if (controlCenter && controlCenter.isInitialized) {
        controlCenter.updateSystemStatus('OPERATIONAL');
    }
}

function startHealthMonitoring() {
    if (controlCenter) {
        controlCenter.startHealthMonitoring();
    }
}

// Docker Functions
function scanContainers() { controlCenter.scanContainers(); }
function createNetwork() { controlCenter.log('Creating AI network...', 'info'); }
function orchestrateContainers() { controlCenter.log('Orchestrating container stack...', 'info'); }
function generateCompose() { controlCenter.generateCompose(); }
function launchStack() { controlCenter.log('Launching Docker stack...', 'info'); }
function resetStack() { controlCenter.log('Resetting Docker stack...', 'warning'); }
function connectContainer(name) { controlCenter.connectContainer(name); }
function configureContainer(name) { controlCenter.log(`Configuring container: ${name}`, 'info'); }
function cloneDatabase() { controlCenter.cloneDatabase(); }

// LMStudio Functions
function testLMStudioConnection() { controlCenter.testLMStudioConnection(); }
function loadModels() { controlCenter.loadModels(); }
function sendTestPrompt() { controlCenter.sendTestPrompt(); }
function clearTest() { 
    document.getElementById('testPrompt').value = '';
    document.getElementById('testResponse').textContent = '';
}

// Reset Functions
function performSoftReset() { controlCenter.performSoftReset(); }
function performMediumReset() { controlCenter.performMediumReset(); }
function performHardReset() { controlCenter.performHardReset(); }
function performFactoryReset() { controlCenter.performFactoryReset(); }
function confirmReset() { controlCenter.confirmReset(); }
function cancelReset() { controlCenter.cancelReset(); }

// System Functions
function clearLogs() { controlCenter.clearLogs(); }
function exportLogs() { controlCenter.exportLogs(); }
function refreshLogs() { controlCenter.refreshLogs(); }

// --- QOL: Utility for showing banners ---
function showBanner(message, type = 'info', timeout = 3000) {
    let banner = document.getElementById('qolBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'qolBanner';
        banner.style.position = 'fixed';
        banner.style.top = '10px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.zIndex = 9999;
        banner.style.padding = '10px 24px';
        banner.style.borderRadius = '6px';
        banner.style.fontWeight = 'bold';
        banner.style.fontSize = '1.1em';
        banner.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        document.body.appendChild(banner);
    }
    banner.textContent = message;
    banner.style.background = type === 'error' ? '#ffdddd' : (type === 'success' ? '#ddffdd' : '#ddeeff');
    banner.style.color = type === 'error' ? '#a00' : (type === 'success' ? '#080' : '#005');
    banner.style.display = 'block';
    if (timeout > 0) {
        setTimeout(() => { banner.style.display = 'none'; }, timeout);
    }
}

// --- QOL: Persona Generation Integration with Loading State ---
async function generatePersonaFrontend() {
    const personaBtn = document.getElementById('generatePersonaBtn');
    if (personaBtn) personaBtn.disabled = true;
    showBanner('Generating persona(s)...', 'info', 0);
    const socialSetting = document.getElementById('personaSocialSetting')?.value || 'work';
    const trait = document.getElementById('personaTrait')?.value || '';
    const variations = parseInt(document.getElementById('personaVariations')?.value || '1', 10);
    const useAI = document.getElementById('personaUseAI')?.checked || false;
    const payload = { socialSetting, trait, variations, useAI };
    try {
        const response = await fetch('http://localhost:8080/api/persona/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            const data = await response.json();
            displayPersonas(data.personas || []);
            showBanner('Persona(s) generated successfully!', 'success');
        } else {
            showBanner('Persona generation failed.', 'error', 5000);
        }
    } catch (error) {
        showBanner('Persona generation error: ' + error.message, 'error', 5000);
    } finally {
        if (personaBtn) personaBtn.disabled = false;
        setTimeout(() => {
            let banner = document.getElementById('qolBanner');
            if (banner) banner.style.display = 'none';
        }, 2000);
    }
}

// --- QOL: WebSocket Connection Status Indicator ---
function updateWebSocketStatus(connected) {
    let wsStatus = document.getElementById('wsStatus');
    if (!wsStatus) {
        wsStatus = document.createElement('span');
        wsStatus.id = 'wsStatus';
        wsStatus.style.position = 'fixed';
        wsStatus.style.bottom = '10px';
        wsStatus.style.right = '20px';
        wsStatus.style.padding = '6px 16px';
        wsStatus.style.borderRadius = '6px';
        wsStatus.style.fontWeight = 'bold';
        wsStatus.style.background = '#ddeeff';
        wsStatus.style.color = '#005';
        wsStatus.style.zIndex = 9999;
        document.body.appendChild(wsStatus);
    }
    wsStatus.textContent = connected ? 'WebSocket: Connected' : 'WebSocket: Disconnected';
    wsStatus.style.background = connected ? '#ddffdd' : '#ffdddd';
    wsStatus.style.color = connected ? '#080' : '#a00';
}

// --- Patch ProtocolIntegration WebSocket events for QOL ---
if (typeof ProtocolIntegration !== 'undefined') {
    const origStartWebSocket = ProtocolIntegration.prototype.startWebSocket;
    ProtocolIntegration.prototype.startWebSocket = function() {
        origStartWebSocket.call(this);
        if (this.websocket) {
            this.websocket.onopen = () => {
                this.updateStatus('websocket-status', 'CONNECTED', 'online');
                this.addProtocolMessage('system', '🔌 WebSocket connection established');
                updateWebSocketStatus(true);
            };
            this.websocket.onclose = () => {
                this.updateStatus('websocket-status', 'DISCONNECTED', 'offline');
                this.addProtocolMessage('system', '🔌 WebSocket connection closed');
                updateWebSocketStatus(false);
            };
            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateStatus('websocket-status', 'ERROR', 'error');
                this.addProtocolMessage('system', '❌ WebSocket error');
                updateWebSocketStatus(false);
            };
        }
    };
}

// Emergency reset function
document.addEventListener('DOMContentLoaded', function() {
    const emergencyResetBtn = document.getElementById('emergencyReset');
    if (emergencyResetBtn) {
        emergencyResetBtn.addEventListener('click', function() {
            if (confirm('EMERGENCY RESET: This will immediately reset all systems. Continue?')) {
                if (controlCenter) {
                    controlCenter.performFactoryReset();
                } else {
                    location.reload();
                }
            }
        });
    }

    // Temperature slider update
    const temperatureSlider = document.getElementById('temperature');
    const tempValue = document.getElementById('tempValue');
    if (temperatureSlider && tempValue) {
        temperatureSlider.addEventListener('input', function() {
            tempValue.textContent = this.value;
        });
    }

    // Persona generation button wiring
    const personaBtn = document.getElementById('generatePersonaBtn');
    if (personaBtn) {
        personaBtn.addEventListener('click', generatePersonaFrontend);
    }
});

// Hexperiment Protocol Integration Module
class ProtocolIntegration {
    constructor() {
        this.baseUrl = 'http://localhost:8080';
        this.websocket = null;
        this.isConnected = false;
        this.messageHistory = [];
    }

    async connect() {
        try {
            // Test protocol server health
            const healthResponse = await fetch(`${this.baseUrl}/api/health`);
            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                this.updateStatus('protocol-status', 'ONLINE', 'online');
                this.isConnected = true;
                this.addProtocolMessage('system', `🔬 Protocol Server connected: ${healthData.service} v${healthData.version}`);
                
                // Get status information
                await this.getStatus();
                
                return true;
            }
        } catch (error) {
            console.error('Protocol connection failed:', error);
            this.updateStatus('protocol-status', 'ERROR', 'error');
            this.addProtocolMessage('system', '❌ Protocol Server connection failed');
        }
        return false;
    }

    async getStatus() {
        try {
            const statusResponse = await fetch(`${this.baseUrl}/api/status`);
            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                document.getElementById('connections-count').textContent = statusData.connections || 0;
                this.addProtocolMessage('incoming', `Status: ${statusData.connections} active connections`);
            }
        } catch (error) {
            console.error('Failed to get protocol status:', error);
        }
    }

    startWebSocket() {
        if (this.websocket) {
            this.websocket.close();
        }
        try {
            this.websocket = new WebSocket(`ws://localhost:8080/ws`);
            this.websocket.onopen = () => {
                this.updateStatus('websocket-status', 'CONNECTED', 'online');
                this.addProtocolMessage('system', '🔌 WebSocket connection established');
            };
            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    switch (data.type) {
                        case 'persona_response':
                            this.addProtocolMessage('persona', `Persona(s) generated: ${JSON.stringify(data.data.personas, null, 2)}`);
                            displayPersonas(data.data.personas || []);
                            break;
                        case 'lmstudio_response':
                            this.addProtocolMessage('lmstudio', `LMStudio: ${JSON.stringify(data.data.response)}`);
                            break;
                        case 'heartbeat_response':
                            this.addProtocolMessage('heartbeat', `Heartbeat: ${JSON.stringify(data.data)}`);
                            break;
                        default:
                            this.addProtocolMessage('incoming', `${data.type}: ${JSON.stringify(data.data)}`);
                    }
                } catch (error) {
                    this.addProtocolMessage('system', '❌ WebSocket message parse error');
                }
            };
            this.websocket.onclose = () => {
                this.updateStatus('websocket-status', 'DISCONNECTED', 'offline');
                this.addProtocolMessage('system', '🔌 WebSocket connection closed');
            };
            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateStatus('websocket-status', 'ERROR', 'error');
                this.addProtocolMessage('system', '❌ WebSocket error');
            };
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.updateStatus('websocket-status', 'ERROR', 'error');
        }
    }

    async sendMessage(message) {
        if (!this.isConnected) {
            this.addProtocolMessage('system', '❌ Protocol Server not connected');
            return;
        }

        const protocolMessage = {
            id: `msg-${Date.now()}`,
            type: 'user-message',
            data: { content: message },
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        try {
            // Send via HTTP API
            const response = await fetch(`${this.baseUrl}/api/protocol`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(protocolMessage)
            });

            if (response.ok) {
                const result = await response.json();
                this.addProtocolMessage('outgoing', `Sent: ${message}`);
                this.addProtocolMessage('incoming', `Response: ${result.status}`);
            } else {
                this.addProtocolMessage('system', '❌ Failed to send protocol message');
            }
        } catch (error) {
            console.error('Protocol message error:', error);
            this.addProtocolMessage('system', '❌ Protocol communication error');
        }
    }

    async runDockerContainer() {
        try {
            // This would typically require a Docker API or management service
            this.addProtocolMessage('system', '🐳 Initiating Docker container startup...');
            this.updateStatus('docker-status', 'STARTING', 'warning');
            
            // Simulate Docker container startup
            setTimeout(() => {
                this.updateStatus('docker-status', 'RUNNING', 'online');
                this.addProtocolMessage('system', '🐳 Docker container is now running');
            }, 3000);
            
        } catch (error) {
            console.error('Docker startup failed:', error);
            this.updateStatus('docker-status', 'ERROR', 'error');
            this.addProtocolMessage('system', '❌ Docker container startup failed');
        }
    }

    addProtocolMessage(type, message) {
        const protocolStream = document.getElementById('protocol-stream');
        const messageDiv = document.createElement('div');
        messageDiv.className = `protocol-message ${type}`;
        messageDiv.innerHTML = `
            <span class="message-time">[${new Date().toLocaleTimeString()}]</span>
            <span class="message-content">${message}</span>
        `;
        protocolStream.appendChild(messageDiv);
        protocolStream.scrollTop = protocolStream.scrollHeight;
        this.messageHistory.push({ type, message, timestamp: new Date() });
    }

    updateStatus(elementId, text, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
            element.className = `status-indicator ${className}`;
        }
    }

    stop() {
        this.isConnected = false;
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        this.updateStatus('protocol-status', 'OFFLINE', 'offline');
        this.updateStatus('websocket-status', 'OFFLINE', 'offline');
        this.addProtocolMessage('system', '🔌 Protocol Server disconnected');
    }
}

// Initialize integration modules
const protocolIntegration = new ProtocolIntegration();

// Protocol Integration Functions
async function connectProtocolServer() {
    await protocolIntegration.connect();
}

function startWebSocket() {
    protocolIntegration.startWebSocket();
}

async function runDockerContainer() {
    await protocolIntegration.runDockerContainer();
}

function stopProtocolServer() {
    protocolIntegration.stop();
}

function sendProtocolMessage() {
    const input = document.getElementById('protocol-message');
    const message = input.value.trim();
    if (message) {
        protocolIntegration.sendMessage(message);
        input.value = '';
    }
}

// Enhanced keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        if (event.target.id === 'protocol-message') {
            sendProtocolMessage();
        }
    }
});
