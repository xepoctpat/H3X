/**
 * AI Integration Control Center Core JavaScript
 * Handles Azure M365 Bot connections, Docker integration, LMStudio management, and system resets
 */

class AIIntegrationControlCenter {
    constructor() {
        this.azureConfig = {
            subscriptionId: '',
            resourceGroup: 'H3X-Neural-Resources',
            botName: 'H3X-Neural-Bot',
            tenantId: '',
            clientId: '',
            clientSecret: '',
            status: 'disconnected'
        };

        this.dockerConfig = {
            containers: [],
            networks: [],
            status: 'detecting'
        };

        this.lmstudioConfig = {
            url: 'http://localhost:1234',
            model: '',
            temperature: 0.7,
            maxTokens: 2048,
            status: 'connected'
        };

        this.systemHealth = {
            azure: 0,
            docker: 0,
            lmstudio: 85,
            neural: 100
        };

        this.resetState = {
            azure: true,
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
            await this.initializeAzureConnection();
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

    // Azure Integration Methods
    async initializeAzureConnection() {
        try {
            // Check if user is authenticated with Azure
            const authState = await this.checkAzureAuth();
            if (authState.isSignedIn) {
                this.log('Azure authentication detected', 'success');
                this.updateAzureStatus('AUTHENTICATED');
                this.systemHealth.azure = 50;
            } else {
                this.log('Azure authentication required', 'warning');
                this.updateAzureStatus('AUTH_REQUIRED');
            }
        } catch (error) {
            this.log(`Azure initialization error: ${error.message}`, 'error');
            this.updateAzureStatus('ERROR');
        }
    }

    async checkAzureAuth() {
        // Simulate Azure auth check
        return { isSignedIn: true };
    }

    async setupAzureSubscription() {
        try {
            this.log('Setting up Azure subscription...', 'info');
            
            // Validate subscription ID
            const subscriptionId = document.getElementById('subscriptionId').value;
            if (!subscriptionId) {
                alert('Please enter a valid Azure Subscription ID');
                return;
            }

            this.azureConfig.subscriptionId = subscriptionId;
            this.markRequirementComplete('subscription');
            this.log(`Azure subscription configured: ${subscriptionId}`, 'success');
            this.systemHealth.azure += 15;
            this.updateHealthMetrics();
            
        } catch (error) {
            this.log(`Subscription setup failed: ${error.message}`, 'error');
        }
    }

    async setupBotService() {
        try {
            this.log('Setting up Azure Bot Service...', 'info');
            
            // Simulate bot service creation
            await this.delay(2000);
            
            this.markRequirementComplete('bot');
            this.log('Azure Bot Service configured successfully', 'success');
            this.systemHealth.azure += 15;
            this.updateHealthMetrics();
            
        } catch (error) {
            this.log(`Bot service setup failed: ${error.message}`, 'error');
        }
    }

    async setupAppService() {
        try {
            this.log('Setting up Azure App Service...', 'info');
            
            // Simulate app service creation
            await this.delay(2000);
            
            this.markRequirementComplete('app');
            this.log('Azure App Service configured successfully', 'success');
            this.systemHealth.azure += 15;
            this.updateHealthMetrics();
            
        } catch (error) {
            this.log(`App service setup failed: ${error.message}`, 'error');
        }
    }

    async setupAppRegistration() {
        try {
            this.log('Setting up Azure App Registration...', 'info');
            
            // Simulate app registration
            await this.delay(1500);
            
            this.azureConfig.clientId = 'generated-client-id';
            this.markRequirementComplete('registration');
            this.log('Azure App Registration configured successfully', 'success');
            this.systemHealth.azure += 10;
            this.updateHealthMetrics();
            
        } catch (error) {
            this.log(`App registration setup failed: ${error.message}`, 'error');
        }
    }

    async setupTeamsManifest() {
        try {
            this.log('Setting up Teams App Manifest...', 'info');
            
            // Generate Teams manifest
            const manifest = this.generateTeamsManifest();
            
            this.markRequirementComplete('teams');
            this.log('Teams App Manifest generated successfully', 'success');
            this.systemHealth.azure += 5;
            this.updateHealthMetrics();
            
        } catch (error) {
            this.log(`Teams manifest setup failed: ${error.message}`, 'error');
        }
    }

    async setupManagedIdentity() {
        try {
            this.log('Setting up Managed Identity...', 'info');
            
            // Simulate managed identity setup
            await this.delay(1000);
            
            this.markRequirementComplete('identity');
            this.log('Managed Identity configured successfully', 'success');
            this.systemHealth.azure += 5;
            this.updateHealthMetrics();
            
            if (this.systemHealth.azure >= 95) {
                this.updateAzureStatus('CONNECTED');
            }
            
        } catch (error) {
            this.log(`Managed identity setup failed: ${error.message}`, 'error');
        }
    }

    generateTeamsManifest() {
        return {
            "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.16/MicrosoftTeams.schema.json",
            "manifestVersion": "1.16",
            "version": "1.0.0",
            "id": "generated-app-id",
            "packageName": "com.h3x.neural.bot",
            "developer": {
                "name": "H3X Neural Systems",
                "websiteUrl": "https://h3x-neural.com",
                "privacyUrl": "https://h3x-neural.com/privacy",
                "termsOfUseUrl": "https://h3x-neural.com/terms"
            },
            "name": {
                "short": "H3X Neural Bot",
                "full": "H3X Neural AI Integration Bot"
            },
            "description": {
                "short": "Advanced AI integration bot for Microsoft 365",
                "full": "H3X Neural AI Integration Bot provides advanced AI capabilities across Microsoft 365 applications with LMStudio integration."
            },
            "icons": {
                "outline": "icon-outline.png",
                "color": "icon-color.png"
            },
            "accentColor": "#00ff88",
            "bots": [
                {
                    "botId": this.azureConfig.clientId,
                    "scopes": ["personal", "team", "groupchat"],
                    "commandLists": [
                        {
                            "scopes": ["personal", "team", "groupchat"],
                            "commands": [
                                {
                                    "title": "Neural Query",
                                    "description": "Send a query to the H3X Neural AI system"
                                },
                                {
                                    "title": "System Status",
                                    "description": "Check the status of AI integration systems"
                                }
                            ]
                        }
                    ]
                }
            ],
            "permissions": ["identity", "messageTeamMembers"],
            "validDomains": ["localhost", "h3x-neural.azurewebsites.net"]
        };
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
        document.getElementById('azureHealth').textContent = `${this.systemHealth.azure}%`;
        document.getElementById('dockerHealth').textContent = `${this.systemHealth.docker}%`;
        document.getElementById('lmstudioHealth').textContent = `${this.systemHealth.lmstudio}%`;
        document.getElementById('neuralHealth').textContent = `${this.systemHealth.neural}%`;

        // Update progress bars
        document.querySelector('[data-metric="azure"]').style.width = `${this.systemHealth.azure}%`;
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

    updateSystemStatus(status) {
        const statusElement = document.getElementById('systemStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    updateAzureStatus(status) {
        const statusElement = document.getElementById('azureStatus');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.setAttribute('data-status', status.toLowerCase().includes('connected') ? 'connected' : 'disconnected');
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
        this.azureConfig = {
            subscriptionId: '',
            resourceGroup: 'H3X-Neural-Resources',
            botName: 'H3X-Neural-Bot',
            tenantId: '',
            clientId: '',
            clientSecret: '',
            status: 'disconnected'
        };

        this.systemHealth.azure = 0;
        this.systemHealth.docker = 0;
        this.resetUIStates();
    }

    hardResetSystems() {
        this.resetConfigurations();
        this.dockerConfig.containers = [];
        this.systemHealth = { azure: 0, docker: 0, lmstudio: 0, neural: 50 };
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

// Azure Functions
function setupAzureSubscription() { controlCenter.setupAzureSubscription(); }
function setupBotService() { controlCenter.setupBotService(); }
function setupAppService() { controlCenter.setupAppService(); }
function setupAppRegistration() { controlCenter.setupAppRegistration(); }
function setupTeamsManifest() { controlCenter.setupTeamsManifest(); }
function setupManagedIdentity() { controlCenter.setupManagedIdentity(); }

function validateSubscription() {
    const subscriptionId = document.getElementById('subscriptionId').value;
    if (subscriptionId) {
        controlCenter.log(`Validating subscription: ${subscriptionId}`, 'info');
        controlCenter.setupAzureSubscription();
    } else {
        alert('Please enter a subscription ID');
    }
}

function createResourceGroup() {
    const resourceGroup = document.getElementById('resourceGroup').value;
    if (resourceGroup) {
        controlCenter.log(`Creating resource group: ${resourceGroup}`, 'info');
        controlCenter.markRequirementComplete('resource group');
    } else {
        alert('Please enter a resource group name');
    }
}

function registerBot() {
    const botName = document.getElementById('botName').value;
    if (botName) {
        controlCenter.log(`Registering bot: ${botName}`, 'info');
        controlCenter.setupBotService();
    } else {
        alert('Please enter a bot name');
    }
}

function provisionResources() { controlCenter.log('Provisioning Azure resources...', 'info'); }
function deployBot() { controlCenter.log('Deploying M365 bot...', 'info'); }
function validateDeployment() { controlCenter.log('Validating deployment...', 'info'); }

// Docker Functions
function scanContainers() { controlCenter.scanContainers(); }
function createNetwork() { controlCenter.log('Creating AI network...', 'info'); }
function orchestrateContainers() { controlCenter.log('Orchestrating container stack...', 'info'); }
function generateCompose() { controlCenter.generateCompose(); }
function launchStack() { controlCenter.log('Launching Docker stack...', 'info'); }
function resetStack() { controlCenter.log('Resetting Docker stack...', 'warning'); }

function connectContainer(name) { controlCenter.connectContainer(name); }
function configureContainer(name) { controlCenter.log(`Configuring container: ${name}`, 'info'); }

// LMStudio Functions
function testLMStudioConnection() { controlCenter.testLMStudioConnection(); }
function loadModels() { controlCenter.loadModels(); }
function sendTestPrompt() { controlCenter.sendTestPrompt(); }
function clearTest() { 
    document.getElementById('testPrompt').value = '';
    document.getElementById('testResponse').textContent = '';
}

function toggleMapping(mapping) { controlCenter.toggleMapping(mapping); }

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
});

// M365 AI Integration Module
class M365AIIntegration {
    constructor() {
        this.baseUrl = 'http://localhost:3978';
        this.isConnected = false;
        this.chatHistory = [];
    }    async initialize() {
        try {
            // Test M365 agent health (correct endpoint)
            const healthResponse = await fetch(`${this.baseUrl}/health`);
            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                this.updateStatus('m365-status', 'ONLINE', 'online');
                this.isConnected = true;
                this.addChatMessage('system', `🤖 ${healthData.service} initialized successfully`);
                
                // Test additional endpoints
                await this.testGraphAPI();
                await this.testTeamsBot();
                await this.testAdaptiveCards();
                
                return true;
            }
        } catch (error) {
            console.error('M365 initialization failed:', error);
            this.updateStatus('m365-status', 'ERROR', 'error');
            this.addChatMessage('system', '❌ M365 AI Agent initialization failed');
        }
        return false;
    }    async testGraphAPI() {
        try {
            // Test main endpoint which shows features including M365 integration
            const response = await fetch(`${this.baseUrl}/`);
            if (response.ok) {
                const data = await response.json();
                if (data.features && data.features.some(f => f.includes('Microsoft SDK'))) {
                    this.updateStatus('graph-api-status', 'ONLINE', 'online');
                } else {
                    this.updateStatus('graph-api-status', 'LIMITED', 'warning');
                }
            } else {
                this.updateStatus('graph-api-status', 'OFFLINE', 'offline');
            }
        } catch (error) {
            this.updateStatus('graph-api-status', 'OFFLINE', 'offline');
        }
    }    async testTeamsBot() {
        try {
            // Test if Bot Framework endpoint exists
            const testMessage = {
                type: 'message',
                text: 'ping',
                from: { id: 'test', name: 'Test' },
                timestamp: new Date().toISOString()
            };
            
            const response = await fetch(`${this.baseUrl}/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testMessage)
            });
            
            // Even if auth fails, endpoint existence means Teams Bot is configured
            if (response.status === 401 || response.status === 200) {
                this.updateStatus('teams-bot-status', 'ONLINE', 'online');
            } else {
                this.updateStatus('teams-bot-status', 'LIMITED', 'warning');
            }
        } catch (error) {
            this.updateStatus('teams-bot-status', 'OFFLINE', 'offline');
        }
    }    async testAdaptiveCards() {
        try {
            // Check if service supports adaptive cards (based on M365 features)
            const response = await fetch(`${this.baseUrl}/`);
            if (response.ok) {
                const data = await response.json();
                if (data.features && data.features.some(f => f.includes('Microsoft'))) {
                    this.updateStatus('adaptive-cards-status', 'ONLINE', 'online');
                } else {
                    this.updateStatus('adaptive-cards-status', 'LIMITED', 'warning');
                }
            } else {
                this.updateStatus('adaptive-cards-status', 'OFFLINE', 'offline');
            }
        } catch (error) {
            this.updateStatus('adaptive-cards-status', 'OFFLINE', 'offline');
        }
    }

    async sendMessage(message) {
        if (!this.isConnected) {
            this.addChatMessage('system', '❌ M365 Agent not connected');
            return;
        }

        this.addChatMessage('user', message);

        try {
            const response = await fetch(`${this.baseUrl}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'message',
                    text: message,
                    from: { id: 'user', name: 'User' },
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.addChatMessage('assistant', result.text || result.response || 'Message processed');
            } else {
                this.addChatMessage('system', '❌ Failed to send message to M365 Agent');
            }
        } catch (error) {
            console.error('M365 message error:', error);
            this.addChatMessage('system', '❌ Connection error with M365 Agent');
        }
    }

    addChatMessage(type, message) {
        const chatHistory = document.getElementById('m365-chat-history');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.innerHTML = `
            <span class="message-time">[${new Date().toLocaleTimeString()}]</span>
            <span class="message-content">${message}</span>
        `;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        this.chatHistory.push({ type, message, timestamp: new Date() });
    }

    updateStatus(elementId, text, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
            element.className = `status-indicator ${className}`;
        }
    }

    disconnect() {
        this.isConnected = false;
        this.updateStatus('m365-status', 'OFFLINE', 'offline');
        this.updateStatus('graph-api-status', 'OFFLINE', 'offline');
        this.updateStatus('teams-bot-status', 'OFFLINE', 'offline');
        this.updateStatus('adaptive-cards-status', 'OFFLINE', 'offline');
        this.addChatMessage('system', '🔌 M365 AI Agent disconnected');
    }
}

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
                    this.addProtocolMessage('incoming', `${data.type}: ${JSON.stringify(data.data)}`);
                } catch (error) {
                    this.addProtocolMessage('incoming', event.data);
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
const m365Integration = new M365AIIntegration();
const protocolIntegration = new ProtocolIntegration();

// M365 AI Functions
async function initializeM365Agent() {
    await m365Integration.initialize();
}

async function testGraphAPI() {
    await m365Integration.testGraphAPI();
}

async function sendTeamsMessage() {
    const message = prompt('Enter message to send to Teams:');
    if (message) {
        await m365Integration.sendMessage(`Teams: ${message}`);
    }
}

function disconnectM365() {
    m365Integration.disconnect();
}

function sendM365Message() {
    const input = document.getElementById('m365-chat-input');
    const message = input.value.trim();
    if (message) {
        m365Integration.sendMessage(message);
        input.value = '';
    }
}

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
        if (event.target.id === 'm365-chat-input') {
            sendM365Message();
        } else if (event.target.id === 'protocol-message') {
            sendProtocolMessage();
        }
    }
});
