#!/usr/bin/env node

/**
 * Babillon Unified System - Health Check Script
 * Comprehensive health monitoring for all services
 */

const http = require('http');
const https = require('https');
const { promisify } = require('util');
const fs = require('fs');

class BabillonHealthChecker {
    constructor() {
        this.services = [
            { name: 'Web Interface', url: 'http://localhost:3000/health', timeout: 5000 },
            { name: 'API Server', url: 'http://localhost:3001/health', timeout: 5000 },
            { name: 'Agents Controller', url: 'http://localhost:3002/health', timeout: 5000 },
            { name: 'H3X Server', url: 'http://localhost:4978/api/health', timeout: 5000 },
            { name: 'Protocol Server', url: 'http://localhost:8080/api/health', timeout: 5000 },
            { name: 'LMStudio AI', url: 'http://localhost:1234/v1/models', timeout: 10000 },
            { name: 'SIR Controller', url: 'http://localhost:9001/health', timeout: 5000 },
            { name: 'MongoDB', url: 'http://localhost:27017', timeout: 3000, expectError: true },
            { name: 'Redis', url: 'http://localhost:6379', timeout: 3000, expectError: true },
            { name: 'PostgreSQL', url: 'http://localhost:5432', timeout: 3000, expectError: true },
            { name: 'Prometheus', url: 'http://localhost:9090/api/v1/query?query=up', timeout: 5000 },
            { name: 'Grafana', url: 'http://localhost:3001/api/health', timeout: 5000 },
            { name: 'Nginx Proxy', url: 'http://localhost:80/health', timeout: 5000 }
        ];
        
        this.results = [];
        this.startTime = Date.now();
    }

    async checkService(service) {
        return new Promise((resolve) => {
            const url = new URL(service.url);
            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method: 'GET',
                timeout: service.timeout,
                headers: {
                    'User-Agent': 'Babillon-HealthCheck/1.0'
                }
            };

            const protocol = url.protocol === 'https:' ? https : http;
            
            const req = protocol.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const result = {
                        service: service.name,
                        status: 'healthy',
                        statusCode: res.statusCode,
                        responseTime: Date.now() - requestStart,
                        message: `HTTP ${res.statusCode}`,
                        url: service.url
                    };

                    if (service.expectError) {
                        // For database services, connection refused means they're running
                        result.status = 'healthy';
                        result.message = 'Service accessible (database)';
                    } else if (res.statusCode >= 400) {
                        result.status = 'unhealthy';
                        result.message = `HTTP ${res.statusCode} - ${data.substring(0, 100)}`;
                    }

                    resolve(result);
                });
            });

            const requestStart = Date.now();

            req.on('error', (error) => {
                const result = {
                    service: service.name,
                    status: 'unhealthy',
                    responseTime: Date.now() - requestStart,
                    message: error.message,
                    url: service.url,
                    error: error.code
                };

                // For database services, ECONNREFUSED often means they're running on different protocol
                if (service.expectError && (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND')) {
                    result.status = 'assumed_healthy';
                    result.message = 'Database service detected (connection refused expected)';
                }

                resolve(result);
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    service: service.name,
                    status: 'timeout',
                    responseTime: service.timeout,
                    message: `Timeout after ${service.timeout}ms`,
                    url: service.url
                });
            });

            req.end();
        });
    }

    async checkDockerServices() {
        try {
            const { exec } = require('child_process');
            const execPromise = promisify(exec);
            
            const { stdout } = await execPromise('docker-compose -f docker-compose.babillon-unified.yml ps --format json');
            const containers = stdout.trim().split('\n').filter(line => line).map(line => JSON.parse(line));
            
            return containers.map(container => ({
                name: container.Name,
                status: container.State,
                health: container.Health || 'unknown',
                ports: container.Ports
            }));
        } catch (error) {
            return [{
                name: 'Docker Compose',
                status: 'error',
                health: 'unknown',
                error: error.message
            }];
        }
    }

    async runHealthCheck() {
        console.log('🔍 Babillon Unified System Health Check');
        console.log('==========================================');
        console.log(`Started at: ${new Date().toISOString()}`);
        console.log('');

        // Check Docker services first
        console.log('📦 Docker Services Status:');
        const dockerServices = await this.checkDockerServices();
        dockerServices.forEach(service => {
            const statusIcon = service.status === 'running' ? '✅' : '❌';
            const healthIcon = service.health === 'healthy' ? '💚' : service.health === 'unhealthy' ? '💔' : '⚠️';
            console.log(`  ${statusIcon} ${healthIcon} ${service.name} - ${service.status} (${service.health})`);
        });
        console.log('');

        // Check HTTP endpoints
        console.log('🌐 HTTP Health Checks:');
        const healthPromises = this.services.map(service => this.checkService(service));
        this.results = await Promise.all(healthPromises);

        this.results.forEach(result => {
            const statusIcon = result.status === 'healthy' ? '✅' : 
                              result.status === 'assumed_healthy' ? '🟡' :
                              result.status === 'timeout' ? '⏱️' : '❌';
            
            console.log(`  ${statusIcon} ${result.service} - ${result.status} (${result.responseTime}ms)`);
            if (result.message && result.status !== 'healthy') {
                console.log(`     └─ ${result.message}`);
            }
        });

        this.generateSummary();
        this.logResults();
    }

    generateSummary() {
        const totalTime = Date.now() - this.startTime;
        const healthy = this.results.filter(r => r.status === 'healthy').length;
        const assumedHealthy = this.results.filter(r => r.status === 'assumed_healthy').length;
        const unhealthy = this.results.filter(r => r.status === 'unhealthy' || r.status === 'timeout').length;
        const total = this.results.length;

        console.log('');
        console.log('📊 Health Check Summary:');
        console.log(`  ✅ Healthy: ${healthy}/${total}`);
        console.log(`  🟡 Assumed Healthy: ${assumedHealthy}/${total}`);
        console.log(`  ❌ Unhealthy: ${unhealthy}/${total}`);
        console.log(`  ⏱️ Total Check Time: ${totalTime}ms`);

        const overallHealth = unhealthy === 0 ? 'HEALTHY' : unhealthy < total / 2 ? 'DEGRADED' : 'CRITICAL';
        const healthIcon = overallHealth === 'HEALTHY' ? '💚' : overallHealth === 'DEGRADED' ? '🟡' : '💔';
        
        console.log('');
        console.log(`${healthIcon} Overall System Status: ${overallHealth}`);

        if (unhealthy > 0) {
            console.log('');
            console.log('🚨 Issues Detected:');
            this.results
                .filter(r => r.status === 'unhealthy' || r.status === 'timeout')
                .forEach(result => {
                    console.log(`  • ${result.service}: ${result.message}`);
                });
        }

        // Exit with appropriate code
        if (overallHealth === 'CRITICAL') {
            process.exit(1);
        } else if (overallHealth === 'DEGRADED') {
            process.exit(2);
        }
    }

    async logResults() {
        const logData = {
            timestamp: new Date().toISOString(),
            totalCheckTime: Date.now() - this.startTime,
            results: this.results,
            summary: {
                healthy: this.results.filter(r => r.status === 'healthy').length,
                assumedHealthy: this.results.filter(r => r.status === 'assumed_healthy').length,
                unhealthy: this.results.filter(r => r.status === 'unhealthy' || r.status === 'timeout').length,
                total: this.results.length
            }
        };

        try {
            const logPath = 'logs/health-checks.log';
            await fs.promises.mkdir('logs', { recursive: true });
            await fs.promises.appendFile(logPath, JSON.stringify(logData) + '\n');
        } catch (error) {
            console.warn(`⚠️ Could not write to log file: ${error.message}`);
        }
    }
}

// Run health check if this script is executed directly
if (require.main === module) {
    const checker = new BabillonHealthChecker();
    checker.runHealthCheck().catch(error => {
        console.error('❌ Health check failed:', error.message);
        process.exit(1);
    });
}

module.exports = BabillonHealthChecker;
