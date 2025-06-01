#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Distributed SIR Simulation
 * Tests the entire babillon infrastructure and API integration
 */

const WebSocket = require('ws');
const http = require('http');

const API_BASE_URL = 'http://localhost:3001/api';
const AGENTS_BASE_URL = 'http://localhost:3002/api';
const WS_URL = 'ws://localhost:3003';

// Test configuration
const testSirParameters = {
    beta: 0.3,
    gamma: 0.1,
    sigma: 0.2,
    population: 10000,
    initialInfected: 10,
    vaccinationRate: 0.0,
    vaccineEfficacy: 0.95
};

const testScenario = 'sir';
const testDuration = 100;

// Color codes for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, details = '') {
    const symbol = status ? '✓' : '✗';
    const color = status ? 'green' : 'red';
    log(`${symbol} ${name}${details ? ' - ' + details : ''}`, color);
}

// HTTP request helper
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = http.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

// Test suite
class DistributedSIRTestSuite {
    constructor() {
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0
        };
        this.simulationId = null;
        this.agentSocket = null;
    }

    async runAllTests() {
        log('\n' + '='.repeat(60), 'bold');
        log('🧪 DISTRIBUTED SIR SIMULATION TEST SUITE', 'bold');
        log('='.repeat(60), 'bold');

        await this.testServiceHealth();
        await this.testAPIEndpoints();
        await this.testWebSocketConnection();
        await this.testDistributedSimulation();
        
        this.printSummary();
    }

    test(name, condition, details) {
        this.testResults.total++;
        if (condition) {
            this.testResults.passed++;
        } else {
            this.testResults.failed++;
        }
        logTest(name, condition, details);
    }

    async testServiceHealth() {
        log('\n📊 Testing Service Health...', 'blue');
        
        try {
            const apiHealth = await makeRequest(`${API_BASE_URL}/health`);
            this.test('API Health Check', 
                apiHealth.status === 200 && apiHealth.data.status === 'ok',
                `Status: ${apiHealth.status}`);
        } catch (error) {
            this.test('API Health Check', false, `Error: ${error.message}`);
        }

        try {
            const agentsHealth = await makeRequest(`${AGENTS_BASE_URL}/health`);
            this.test('Agents Health Check', 
                agentsHealth.status === 200 && agentsHealth.data.status === 'ok',
                `Status: ${agentsHealth.status}`);
        } catch (error) {
            this.test('Agents Health Check', false, `Error: ${error.message}`);
        }
    }

    async testAPIEndpoints() {
        log('\n🔌 Testing API Endpoints...', 'blue');

        // Test SIR simulation creation
        try {
            const createResponse = await makeRequest(`${API_BASE_URL}/simulations/sir`, {
                method: 'POST',
                body: {
                    parameters: testSirParameters,
                    scenario: testScenario,
                    duration: testDuration
                }
            });

            const success = createResponse.status === 200 && createResponse.data.simulationId;
            this.test('Create SIR Simulation', success, 
                success ? `ID: ${createResponse.data.simulationId.substr(0, 8)}...` : `Status: ${createResponse.status}`);
            
            if (success) {
                this.simulationId = createResponse.data.simulationId;
            }
        } catch (error) {
            this.test('Create SIR Simulation', false, `Error: ${error.message}`);
        }

        // Test simulation retrieval
        if (this.simulationId) {
            try {
                const getResponse = await makeRequest(`${API_BASE_URL}/simulations/${this.simulationId}`);
                this.test('Retrieve Simulation', 
                    getResponse.status === 200 && getResponse.data.id === this.simulationId,
                    `Status: ${getResponse.status}`);
            } catch (error) {
                this.test('Retrieve Simulation', false, `Error: ${error.message}`);
            }
        }

        // Test cells endpoint
        try {
            const cellsResponse = await makeRequest(`${API_BASE_URL}/cells`);
            this.test('List Cells', 
                cellsResponse.status === 200,
                `Status: ${cellsResponse.status}`);
        } catch (error) {
            this.test('List Cells', false, `Error: ${error.message}`);
        }
    }

    async testWebSocketConnection() {
        log('\n🔗 Testing WebSocket Connection...', 'blue');

        return new Promise((resolve) => {
            try {
                this.agentSocket = new WebSocket(WS_URL);
                
                const timeout = setTimeout(() => {
                    this.test('WebSocket Connection', false, 'Connection timeout');
                    resolve();
                }, 5000);

                this.agentSocket.on('open', () => {
                    clearTimeout(timeout);
                    this.test('WebSocket Connection', true, 'Connected successfully');
                    
                    // Test message sending
                    const testMessage = {
                        type: 'ping',
                        timestamp: Date.now()
                    };
                    
                    this.agentSocket.send(JSON.stringify(testMessage));
                    this.test('Send WebSocket Message', true, 'Ping sent');
                    
                    resolve();
                });

                this.agentSocket.on('message', (data) => {
                    try {
                        const message = JSON.parse(data);
                        if (message.type === 'pong') {
                            this.test('Receive WebSocket Message', true, 'Pong received');
                        }
                    } catch (e) {
                        this.test('Parse WebSocket Message', false, 'Invalid JSON');
                    }
                });

                this.agentSocket.on('error', (error) => {
                    clearTimeout(timeout);
                    this.test('WebSocket Connection', false, `Error: ${error.message}`);
                    resolve();
                });

            } catch (error) {
                this.test('WebSocket Connection', false, `Exception: ${error.message}`);
                resolve();
            }
        });
    }

    async testDistributedSimulation() {
        log('\n⚡ Testing Distributed Simulation...', 'blue');

        if (!this.agentSocket || this.agentSocket.readyState !== WebSocket.OPEN) {
            this.test('Distributed Simulation', false, 'No WebSocket connection');
            return;
        }

        return new Promise((resolve) => {
            const simulationMessage = {
                type: 'sir_simulation',
                data: {
                    parameters: testSirParameters,
                    scenario: testScenario,
                    duration: testDuration
                }
            };

            const timeout = setTimeout(() => {
                this.test('Distributed SIR Simulation', false, 'Simulation timeout');
                resolve();
            }, 15000);

            this.agentSocket.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    
                    if (message.type === 'simulation_complete') {
                        clearTimeout(timeout);
                        
                        const hasResults = message.results && 
                                         message.results.time && 
                                         message.results.susceptible && 
                                         message.results.infected && 
                                         message.results.recovered;
                        
                        this.test('Distributed SIR Simulation', hasResults, 
                            hasResults ? `${message.results.time.length} time steps` : 'Invalid results');
                        
                        if (hasResults) {
                            this.validateSimulationResults(message.results);
                        }
                        
                        resolve();
                    } else if (message.type === 'simulation_error') {
                        clearTimeout(timeout);
                        this.test('Distributed SIR Simulation', false, `Error: ${message.error}`);
                        resolve();
                    }
                } catch (e) {
                    // Ignore parsing errors for other messages
                }
            });

            this.agentSocket.send(JSON.stringify(simulationMessage));
            this.test('Send Simulation Request', true, 'Request sent to agents');
        });
    }

    validateSimulationResults(results) {
        log('\n🔍 Validating Simulation Results...', 'blue');

        // Check data structure
        const hasTimeData = Array.isArray(results.time) && results.time.length > 0;
        this.test('Time Data Present', hasTimeData, `Length: ${results.time?.length || 0}`);

        const hasSusceptibleData = Array.isArray(results.susceptible) && results.susceptible.length > 0;
        this.test('Susceptible Data Present', hasSusceptibleData, `Length: ${results.susceptible?.length || 0}`);

        const hasInfectedData = Array.isArray(results.infected) && results.infected.length > 0;
        this.test('Infected Data Present', hasInfectedData, `Length: ${results.infected?.length || 0}`);

        const hasRecoveredData = Array.isArray(results.recovered) && results.recovered.length > 0;
        this.test('Recovered Data Present', hasRecoveredData, `Length: ${results.recovered?.length || 0}`);

        // Check consistency
        if (hasTimeData && hasSusceptibleData && hasInfectedData && hasRecoveredData) {
            const lengthsMatch = results.time.length === results.susceptible.length &&
                               results.time.length === results.infected.length &&
                               results.time.length === results.recovered.length;
            this.test('Data Length Consistency', lengthsMatch, 'All arrays same length');

            // Check conservation (S + I + R should be approximately constant)
            const initialTotal = results.susceptible[0] + results.infected[0] + results.recovered[0];
            const finalTotal = results.susceptible[results.time.length - 1] + 
                             results.infected[results.time.length - 1] + 
                             results.recovered[results.time.length - 1];
            
            const conservationError = Math.abs(initialTotal - finalTotal) / initialTotal;
            this.test('Population Conservation', conservationError < 0.01, 
                `Error: ${(conservationError * 100).toFixed(2)}%`);

            // Check that epidemic starts with growth
            if (results.infected.length > 5) {
                const initialGrowth = results.infected[5] > results.infected[0];
                this.test('Initial Epidemic Growth', initialGrowth, 
                    `Day 0: ${results.infected[0]}, Day 5: ${results.infected[5]}`);
            }
        }
    }

    printSummary() {
        const { total, passed, failed } = this.testResults;
        const successRate = total > 0 ? (passed / total * 100).toFixed(1) : 0;
        
        log('\n' + '='.repeat(60), 'bold');
        log('📋 TEST SUMMARY', 'bold');
        log('='.repeat(60), 'bold');
        
        log(`Total Tests: ${total}`, 'blue');
        log(`Passed: ${passed}`, 'green');
        log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
        log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
        
        if (failed === 0) {
            log('\n🎉 ALL TESTS PASSED! The distributed SIR simulation system is working correctly.', 'green');
        } else if (successRate >= 80) {
            log('\n⚠️  Most tests passed. Some minor issues detected.', 'yellow');
        } else {
            log('\n❌ Several tests failed. The system may have issues.', 'red');
        }
        
        log('\n💡 Access the SIR Dashboard at: http://localhost:3000/sir', 'blue');
        log('💡 Access the General Dashboard at: http://localhost:3000/dashboard', 'blue');
        
        // Cleanup
        if (this.agentSocket) {
            this.agentSocket.close();
        }
    }
}

// Run the test suite
async function main() {
    try {
        const testSuite = new DistributedSIRTestSuite();
        await testSuite.runAllTests();
        process.exit(testSuite.testResults.failed === 0 ? 0 : 1);
    } catch (error) {
        log(`\n❌ Test suite crashed: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    log(`\n⚠️  Unhandled Rejection at: ${promise}, reason: ${reason}`, 'yellow');
});

if (require.main === module) {
    main();
}

module.exports = DistributedSIRTestSuite;
