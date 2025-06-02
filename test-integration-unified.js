#!/usr/bin/env node
// H3X Unified System Integration Test Suite
// Comprehensive testing and validation for all integrated components

const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

class H3XUnifiedTestSuite {
    constructor() {
        this.baseUrl = 'http://localhost';
        this.testResults = [];
        this.services = {
            nginx: { url: 'http://localhost:80', name: 'Nginx Reverse Proxy' },
            h3x_main: { url: 'http://localhost:8080', name: 'H3X Main Service' },
            flups: { url: 'http://localhost:8080/flups', name: 'fLups Frontend' },
            lmstudio: { url: 'http://localhost:1234', name: 'LM Studio API' },
            weather: { url: 'http://localhost:3001', name: 'Weather Ingestion' },
            financial: { url: 'http://localhost:3002', name: 'Financial Ingestion' },
            feedback: { url: 'http://localhost:3003', name: 'Feedback Processor' },
            mongodb: { url: 'mongodb://localhost:27017', name: 'MongoDB Database' },
            redis: { url: 'redis://localhost:6379', name: 'Redis Cache' },
            prometheus: { url: 'http://localhost:9090', name: 'Prometheus Metrics' },
            grafana: { url: 'http://localhost:3001', name: 'Grafana Dashboard' }
        };
    }

    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            error: '\x1b[31m',
            warning: '\x1b[33m',
            test: '\x1b[35m',
            reset: '\x1b[0m'
        };
        const timestamp = new Date().toISOString();
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Test individual service health
    async testServiceHealth(serviceName, config) {
        this.log(`Testing ${config.name}...`, 'test');
        
        try {
            let response;
            
            if (serviceName === 'mongodb') {
                // Test MongoDB connection
                const { MongoClient } = require('mongodb');
                const client = new MongoClient(config.url);
                await client.connect();
                await client.db('h3x_unified').admin().ping();
                await client.close();
                response = { status: 200, data: 'Connected' };
            } else if (serviceName === 'redis') {
                // Test Redis connection
                const redis = require('redis');
                const client = redis.createClient({ url: config.url });
                await client.connect();
                await client.ping();
                await client.quit();
                response = { status: 200, data: 'Connected' };
            } else {
                // HTTP service test
                response = await axios.get(config.url + '/health', {
                    timeout: 5000,
                    validateStatus: () => true
                });
            }

            const isHealthy = response.status === 200;
            this.testResults.push({
                service: serviceName,
                name: config.name,
                status: isHealthy ? 'PASS' : 'FAIL',
                response_time: Date.now(),
                details: response.data || response.statusText
            });

            this.log(`${config.name}: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`, isHealthy ? 'success' : 'error');
            return isHealthy;

        } catch (error) {
            this.testResults.push({
                service: serviceName,
                name: config.name,
                status: 'FAIL',
                error: error.message,
                response_time: Date.now()
            });

            this.log(`${config.name}: ERROR - ${error.message}`, 'error');
            return false;
        }
    }

    // Test Docker containers
    async testDockerContainers() {
        this.log('Testing Docker containers...', 'test');
        
        try {
            const { stdout } = await execAsync('docker-compose -f docker-compose.unified.yml ps --format json');
            const containers = stdout.trim().split('\n').map(line => JSON.parse(line));
            
            let allHealthy = true;
            for (const container of containers) {
                const isHealthy = container.State === 'running';
                this.log(`Container ${container.Name}: ${container.State}`, isHealthy ? 'success' : 'error');
                
                if (!isHealthy) allHealthy = false;
            }

            this.testResults.push({
                test: 'docker_containers',
                status: allHealthy ? 'PASS' : 'FAIL',
                containers_count: containers.length,
                running_count: containers.filter(c => c.State === 'running').length
            });

            return allHealthy;

        } catch (error) {
            this.log(`Docker containers test failed: ${error.message}`, 'error');
            return false;
        }
    }

    // Test unified system functionality
    async testUnifiedSystem() {
        this.log('Testing unified system functionality...', 'test');

        const tests = [
            this.testDataIngestion(),
            this.testFeedbackLoops(),
            this.testLMStudioIntegration(),
            this.testfLupsIntegration(),
            this.testSystemIntegration()
        ];

        const results = await Promise.allSettled(tests);
        const allPassed = results.every(result => result.status === 'fulfilled' && result.value);

        this.testResults.push({
            test: 'unified_system',
            status: allPassed ? 'PASS' : 'FAIL',
            sub_tests: results.length,
            passed: results.filter(r => r.status === 'fulfilled' && r.value).length
        });

        return allPassed;
    }

    // Test data ingestion
    async testDataIngestion() {
        this.log('Testing real-time data ingestion...', 'test');

        try {
            // Test weather data
            const weatherResponse = await axios.get('http://localhost:3001/api/weather/current', {
                timeout: 5000
            });

            // Test financial data
            const financialResponse = await axios.get('http://localhost:3002/api/financial/summary', {
                timeout: 5000
            });

            const success = weatherResponse.status === 200 && financialResponse.status === 200;
            this.log(`Data ingestion: ${success ? 'WORKING' : 'FAILED'}`, success ? 'success' : 'error');
            return success;

        } catch (error) {
            this.log(`Data ingestion test failed: ${error.message}`, 'error');
            return false;
        }
    }

    // Test feedback loops
    async testFeedbackLoops() {
        this.log('Testing feedback loop processing...', 'test');

        try {
            const response = await axios.get('http://localhost:3003/api/feedback/status', {
                timeout: 5000
            });

            // Test feedback processing trigger
            await axios.post('http://localhost:3003/api/feedback/trigger', {
                test: true,
                timestamp: new Date().toISOString()
            });

            const success = response.status === 200;
            this.log(`Feedback loops: ${success ? 'WORKING' : 'FAILED'}`, success ? 'success' : 'error');
            return success;

        } catch (error) {
            this.log(`Feedback loops test failed: ${error.message}`, 'error');
            return false;
        }
    }

    // Test LM Studio integration
    async testLMStudioIntegration() {
        this.log('Testing LM Studio integration...', 'test');

        try {
            // Test models endpoint
            const modelsResponse = await axios.get('http://localhost:1234/v1/models', {
                timeout: 5000
            });

            const success = modelsResponse.status === 200;
            this.log(`LM Studio integration: ${success ? 'WORKING' : 'FAILED'}`, success ? 'success' : 'error');
            return success;

        } catch (error) {
            this.log(`LM Studio test failed: ${error.message}`, 'error');
            return false;
        }
    }

    // Test fLups integration
    async testfLupsIntegration() {
        this.log('Testing fLups integration...', 'test');

        try {
            const response = await axios.get('http://localhost:8080/flups/health', {
                timeout: 5000
            });

            const success = response.status === 200;
            this.log(`fLups integration: ${success ? 'WORKING' : 'FAILED'}`, success ? 'success' : 'error');
            return success;

        } catch (error) {
            this.log(`fLups test failed: ${error.message}`, 'error');
            return false;
        }
    }

    // Test overall system integration
    async testSystemIntegration() {
        this.log('Testing overall system integration...', 'test');

        try {
            // Test main system health
            const systemResponse = await axios.get('http://localhost:80/health', {
                timeout: 5000
            });

            // Test cross-service communication
            const integrationResponse = await axios.get('http://localhost:8080/api/system/status', {
                timeout: 5000
            });

            const success = systemResponse.status === 200;
            this.log(`System integration: ${success ? 'WORKING' : 'FAILED'}`, success ? 'success' : 'error');
            return success;

        } catch (error) {
            this.log(`System integration test failed: ${error.message}`, 'error');
            return false;
        }
    }

    // Generate test report
    async generateTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            system: 'H3X Unified System',
            version: '2.0.0',
            test_results: this.testResults,
            summary: {
                total_tests: this.testResults.length,
                passed: this.testResults.filter(r => r.status === 'PASS').length,
                failed: this.testResults.filter(r => r.status === 'FAIL').length,
                success_rate: 0
            }
        };

        report.summary.success_rate = (report.summary.passed / report.summary.total_tests * 100).toFixed(2);

        const reportPath = path.join(__dirname, 'test-reports', `integration-test-${Date.now()}.json`);
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        this.log(`Test report saved: ${reportPath}`, 'info');
        return report;
    }

    // Main test execution
    async runAllTests() {
        this.log('Starting H3X Unified System Integration Tests...', 'info');
        this.log('===============================================', 'info');

        // Wait for services to stabilize
        this.log('Waiting for services to stabilize...', 'info');
        await this.sleep(5000);

        // Test Docker containers
        await this.testDockerContainers();

        // Test individual services
        for (const [serviceName, config] of Object.entries(this.services)) {
            await this.testServiceHealth(serviceName, config);
            await this.sleep(1000); // Small delay between tests
        }

        // Test unified system functionality
        await this.testUnifiedSystem();

        // Generate and display report
        const report = await this.generateTestReport();

        this.log('===============================================', 'info');
        this.log('TEST SUMMARY:', 'info');
        this.log(`Total Tests: ${report.summary.total_tests}`, 'info');
        this.log(`Passed: ${report.summary.passed}`, 'success');
        this.log(`Failed: ${report.summary.failed}`, report.summary.failed > 0 ? 'error' : 'info');
        this.log(`Success Rate: ${report.summary.success_rate}%`, 
                  report.summary.success_rate >= 80 ? 'success' : 'warning');

        const overallSuccess = report.summary.success_rate >= 80;
        this.log(`Overall Result: ${overallSuccess ? 'PASS' : 'FAIL'}`, 
                  overallSuccess ? 'success' : 'error');

        return overallSuccess;
    }
}

// CLI interface
if (require.main === module) {
    const testSuite = new H3XUnifiedTestSuite();
    
    testSuite.runAllTests()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test suite failed:', error);
            process.exit(1);
        });
}

module.exports = { H3XUnifiedTestSuite };
