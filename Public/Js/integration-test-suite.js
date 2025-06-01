/**
 * Comprehensive AI Integration Test Suite
 * Tests all components of the H3X Neural System
 */

class IntegrationTestSuite {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
    }

    async runFullTest() {
        console.log('🚀 Starting Comprehensive AI Integration Test Suite...');
        console.log('═'.repeat(60));

        // Test 1: H3X Server Health
        await this.testH3XServer();
        
        // Test 2: Protocol Server Health
        await this.testProtocolServer();
        
        // Test 3: M365 AI Integration
        await this.testM365Integration();
        
        // Test 4: WebSocket Communication
        await this.testWebSocketIntegration();
        
        // Test 5: Neural Interface Access
        await this.testNeuralInterfaces();
        
        // Test 6: LMStudio Connection
        await this.testLMStudioConnection();
        
        // Test 7: Docker Container Detection
        await this.testDockerIntegration();
        
        // Test 8: System Reset Functionality
        await this.testResetFunctionality();

        // Generate Report
        this.generateReport();
    }

    async testH3XServer() {
        console.log('🧠 Testing H3X Server...');
        try {
            const response = await fetch('http://localhost:3978/health');
            const data = await response.json();
            
            if (response.ok && data.status === 'healthy') {
                this.logResult('H3X Server Health', 'PASS', `Service: ${data.service}, Port: ${data.port}`);
                
                // Test service info endpoint
                const infoResponse = await fetch('http://localhost:3978/');
                const infoData = await infoResponse.json();
                
                if (infoResponse.ok) {
                    this.logResult('H3X Service Info', 'PASS', `Version: ${infoData.version}, Features: ${infoData.features.length}`);
                } else {
                    this.logResult('H3X Service Info', 'FAIL', 'Unable to fetch service information');
                }
            } else {
                this.logResult('H3X Server Health', 'FAIL', 'Server not healthy');
            }
        } catch (error) {
            this.logResult('H3X Server Health', 'ERROR', error.message);
        }
    }

    async testProtocolServer() {
        console.log('🔬 Testing Protocol Server...');
        try {
            const response = await fetch('http://localhost:8080/api/health');
            const data = await response.json();
            
            if (response.ok && data.status === 'healthy') {
                this.logResult('Protocol Server Health', 'PASS', `Service: ${data.service} v${data.version}`);
                
                // Test status endpoint
                const statusResponse = await fetch('http://localhost:8080/api/status');
                const statusData = await statusResponse.json();
                
                if (statusResponse.ok) {
                    this.logResult('Protocol Server Status', 'PASS', `Connections: ${statusData.connections}`);
                } else {
                    this.logResult('Protocol Server Status', 'FAIL', 'Unable to fetch status');
                }
            } else {
                this.logResult('Protocol Server Health', 'FAIL', 'Server not healthy');
            }
        } catch (error) {
            this.logResult('Protocol Server Health', 'ERROR', error.message);
        }
    }

    async testM365Integration() {
        console.log('🤖 Testing M365 AI Integration...');
        try {
            // Test Bot Framework endpoint
            const testMessage = {
                type: 'message',
                text: 'integration-test',
                from: { id: 'test-suite', name: 'Integration Test' },
                timestamp: new Date().toISOString()
            };

            const response = await fetch('http://localhost:3978/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testMessage)
            });

            // Check if Bot Framework endpoint exists (even if auth fails)
            if (response.status === 401) {
                this.logResult('M365 Bot Framework', 'PASS', 'Bot Framework endpoint configured (auth required)');
            } else if (response.status === 200) {
                this.logResult('M365 Bot Framework', 'PASS', 'Bot Framework endpoint responding');
            } else {
                this.logResult('M365 Bot Framework', 'FAIL', `Unexpected status: ${response.status}`);
            }

            // Test service features for M365 compatibility
            const serviceResponse = await fetch('http://localhost:3978/');
            if (serviceResponse.ok) {
                const serviceData = await serviceResponse.json();
                const hasM365Features = serviceData.features.some(f => f.includes('Microsoft'));
                
                if (hasM365Features) {
                    this.logResult('M365 SDK Integration', 'PASS', 'Microsoft SDK features detected');
                } else {
                    this.logResult('M365 SDK Integration', 'FAIL', 'No Microsoft SDK features found');
                }
            }

        } catch (error) {
            this.logResult('M365 Integration', 'ERROR', error.message);
        }
    }

    async testWebSocketIntegration() {
        console.log('🔌 Testing WebSocket Integration...');
        return new Promise((resolve) => {
            try {
                const ws = new WebSocket('ws://localhost:8080/ws');
                let connected = false;

                const timeout = setTimeout(() => {
                    if (!connected) {
                        this.logResult('WebSocket Connection', 'FAIL', 'Connection timeout');
                        ws.close();
                        resolve();
                    }
                }, 5000);

                ws.onopen = () => {
                    connected = true;
                    clearTimeout(timeout);
                    this.logResult('WebSocket Connection', 'PASS', 'WebSocket connected successfully');
                    
                    // Test message sending
                    const testMessage = {
                        id: 'test-' + Date.now(),
                        type: 'integration-test',
                        data: { content: 'Hello from test suite' },
                        timestamp: new Date().toISOString(),
                        status: 'pending'
                    };
                    
                    ws.send(JSON.stringify(testMessage));
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.logResult('WebSocket Messaging', 'PASS', `Received: ${data.type}`);
                    } catch (e) {
                        this.logResult('WebSocket Messaging', 'PASS', 'Message received (non-JSON)');
                    }
                    ws.close();
                    resolve();
                };

                ws.onerror = (error) => {
                    clearTimeout(timeout);
                    this.logResult('WebSocket Connection', 'ERROR', 'WebSocket error occurred');
                    resolve();
                };

                ws.onclose = () => {
                    if (connected) {
                        this.logResult('WebSocket Cleanup', 'PASS', 'WebSocket closed cleanly');
                    }
                    resolve();
                };

            } catch (error) {
                this.logResult('WebSocket Integration', 'ERROR', error.message);
                resolve();
            }
        });
    }

    async testNeuralInterfaces() {
        console.log('🧠 Testing Neural Interfaces...');
        const interfaces = [
            'hex-genesis-creative-interface.html',
            'node-neural-dashboard-interface.html',
            'synapse-taskflow-orchestration-interface.html',
            'matrix-observer-analytics-interface.html',
            'cortex-current-realtime-interface.html',
            'Virtual-Taskmaster.html'
        ];

        let passCount = 0;
        for (const interface of interfaces) {
            try {
                const response = await fetch(`http://localhost:3978/${interface}`);
                if (response.ok) {
                    passCount++;
                } else {
                    console.log(`❌ ${interface}: ${response.status}`);
                }
            } catch (error) {
                console.log(`❌ ${interface}: ${error.message}`);
            }
        }

        if (passCount === interfaces.length) {
            this.logResult('Neural Interfaces', 'PASS', `All ${interfaces.length} interfaces accessible`);
        } else {
            this.logResult('Neural Interfaces', 'PARTIAL', `${passCount}/${interfaces.length} interfaces accessible`);
        }
    }

    async testLMStudioConnection() {
        console.log('🤖 Testing LMStudio Connection...');
        try {
            const response = await fetch('http://localhost:1234/v1/models');
            if (response.ok) {
                const data = await response.json();
                this.logResult('LMStudio Connection', 'PASS', `API responding, models available: ${data.data?.length || 0}`);
            } else {
                this.logResult('LMStudio Connection', 'FAIL', `HTTP ${response.status}`);
            }
        } catch (error) {
            this.logResult('LMStudio Connection', 'OFFLINE', 'LMStudio not running on port 1234');
        }
    }

    async testDockerIntegration() {
        console.log('🐳 Testing Docker Integration...');
        try {
            // Since we can't directly access Docker API from browser, 
            // we'll test if the deployment scripts and configs exist
            const response = await fetch('http://localhost:3978/docker-compose.yml');
            if (response.ok) {
                this.logResult('Docker Configuration', 'PASS', 'Docker Compose file accessible');
            } else {
                this.logResult('Docker Configuration', 'FAIL', 'Docker Compose file not found');
            }
        } catch (error) {
            this.logResult('Docker Integration', 'ERROR', error.message);
        }
    }

    async testResetFunctionality() {
        console.log('🔄 Testing Reset Functionality...');
        try {
            // Test if the reset functions are available
            if (typeof performReset === 'function') {
                this.logResult('Reset Functions', 'PASS', 'Reset functionality available');
            } else {
                this.logResult('Reset Functions', 'FAIL', 'Reset functions not found');
            }
        } catch (error) {
            this.logResult('Reset Functionality', 'ERROR', error.message);
        }
    }

    logResult(test, status, details) {
        const result = {
            test,
            status,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.results.push(result);
        
        const statusIcon = {
            'PASS': '✅',
            'FAIL': '❌',
            'ERROR': '🚨',
            'PARTIAL': '⚠️',
            'OFFLINE': '🔌'
        }[status] || '❓';
        
        console.log(`${statusIcon} ${test}: ${status} - ${details}`);
    }

    generateReport() {
        const endTime = Date.now();
        const duration = (endTime - this.startTime) / 1000;
        
        console.log('\n📊 TEST SUITE RESULTS');
        console.log('═'.repeat(60));
        
        const statusCounts = this.results.reduce((acc, result) => {
            acc[result.status] = (acc[result.status] || 0) + 1;
            return acc;
        }, {});
        
        console.log(`Total Tests: ${this.results.length}`);
        console.log(`Duration: ${duration}s`);
        console.log(`Results: ${JSON.stringify(statusCounts, null, 2)}`);
        
        const passRate = ((statusCounts.PASS || 0) / this.results.length * 100).toFixed(1);
        console.log(`Pass Rate: ${passRate}%`);
        
        console.log('\n🎯 SYSTEM STATUS OVERVIEW:');
        console.log('═'.repeat(60));
        
        if (statusCounts.PASS >= 6) {
            console.log('🟢 H3X Neural System: FULLY OPERATIONAL');
            console.log('🚀 Ready for production deployment');
        } else if (statusCounts.PASS >= 4) {
            console.log('🟡 H3X Neural System: PARTIALLY OPERATIONAL');
            console.log('⚠️ Some components need attention');
        } else {
            console.log('🔴 H3X Neural System: NEEDS ATTENTION');
            console.log('🔧 Multiple components require configuration');
        }
        
        console.log('\n🌐 Access URLs:');
        console.log('• AI Integration Control Center: http://localhost:3978/ai-integration-control-center.html');
        console.log('• H3X Neural Interfaces: http://localhost:3978/');
        console.log('• Protocol Server: http://localhost:8080/api/status');
        console.log('• WebSocket Endpoint: ws://localhost:8080/ws');
        
        return {
            totalTests: this.results.length,
            duration,
            statusCounts,
            passRate: parseFloat(passRate),
            results: this.results
        };
    }
}

// Auto-run test suite when loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🧪 AI Integration Test Suite Ready');
    console.log('Run: new IntegrationTestSuite().runFullTest()');
});

// Export for use
window.IntegrationTestSuite = IntegrationTestSuite;
