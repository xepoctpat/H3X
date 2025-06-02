#!/usr/bin/env node

/**
 * Babillon Unified System - Comprehensive Health Check
 * Validates all system components and provides detailed status report
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class BabillonHealthChecker {
    constructor() {
        this.services = [            { name: 'babillon-web', port: 3000, endpoint: 'http://localhost:3000' },
            { name: 'babillon-api', port: 3001, endpoint: 'http://localhost:3001/api/health' },
            { name: 'babillon-mongodb', port: 27017 },
            { name: 'babillon-redis', port: 6380 },
            { name: 'babillon-prometheus', port: 9090, endpoint: 'http://localhost:9090' }
        ];
        this.results = [];
    }

    async checkContainerStatus() {
        console.log('🔍 Checking container status...');
        try {
            const { stdout } = await execAsync('docker-compose -f docker-compose.babillon-simple.yml ps --format json');
            const containers = stdout.trim().split('\n').map(line => JSON.parse(line));
            
            for (const service of this.services) {
                const container = containers.find(c => c.Service === service.name);
                if (container) {
                    const isHealthy = container.State === 'running' || container.Health === 'healthy';
                    this.results.push({
                        service: service.name,
                        status: isHealthy ? 'healthy' : 'unhealthy',
                        details: `Container ${container.State}`,
                        container: container.Name
                    });
                    console.log(`  ${isHealthy ? '✅' : '❌'} ${service.name}: ${container.State}`);
                } else {
                    this.results.push({
                        service: service.name,
                        status: 'missing',
                        details: 'Container not found'
                    });
                    console.log(`  ❌ ${service.name}: Not found`);
                }
            }
        } catch (error) {
            console.log(`  ❌ Error checking containers: ${error.message}`);
        }
    }

    async checkHttpEndpoints() {
        console.log('🌐 Checking HTTP endpoints...');
        
        const httpServices = this.services.filter(s => s.endpoint);
        
        for (const service of httpServices) {
            try {
                const curlCommand = `curl -s -o /dev/null -w "%{http_code}" "${service.endpoint}"`;
                const { stdout } = await execAsync(curlCommand);
                const statusCode = stdout.trim();
                const isHealthy = statusCode.startsWith('2') || statusCode.startsWith('3');
                
                console.log(`  ${isHealthy ? '✅' : '❌'} ${service.name}: HTTP ${statusCode}`);
                
                // Update existing result or add new one
                const existingResult = this.results.find(r => r.service === service.name);
                if (existingResult) {
                    existingResult.httpStatus = statusCode;
                    existingResult.httpHealthy = isHealthy;
                } else {
                    this.results.push({
                        service: service.name,
                        status: isHealthy ? 'healthy' : 'unhealthy',
                        httpStatus: statusCode,
                        httpHealthy: isHealthy
                    });
                }
            } catch (error) {
                console.log(`  ❌ ${service.name}: HTTP connection failed`);
                const existingResult = this.results.find(r => r.service === service.name);
                if (existingResult) {
                    existingResult.httpHealthy = false;
                    existingResult.httpError = error.message;
                }
            }
        }
    }

    async checkDatabaseConnections() {
        console.log('🗄️ Checking database connections...');
        
        // Test MongoDB
        try {
            const mongoCommand = 'docker exec babillon-mongodb mongosh "mongodb://babillon:babillon-secure-password@localhost:27017/babillon?authSource=admin" --eval "db.runCommand({ping: 1})" --quiet';
            const { stdout } = await execAsync(mongoCommand);
            const isHealthy = stdout.includes('"ok" : 1') || stdout.includes('ok: 1');
            console.log(`  ${isHealthy ? '✅' : '❌'} MongoDB: ${isHealthy ? 'Connected' : 'Connection failed'}`);
            
            const mongoResult = this.results.find(r => r.service === 'babillon-mongodb');
            if (mongoResult) {
                mongoResult.dbHealthy = isHealthy;
            }
        } catch (error) {
            console.log(`  ❌ MongoDB: Connection error - ${error.message}`);
        }        // Test Redis
        try {
            const redisCommand = 'docker exec babillon-redis redis-cli -p 6379 ping';
            const { stdout } = await execAsync(redisCommand);
            const isHealthy = stdout.trim() === 'PONG';
            console.log(`  ${isHealthy ? '✅' : '❌'} Redis: ${isHealthy ? 'Connected' : 'Connection failed'}`);
            
            const redisResult = this.results.find(r => r.service === 'babillon-redis');
            if (redisResult) {
                redisResult.dbHealthy = isHealthy;
            }
        } catch (error) {
            console.log(`  ❌ Redis: Connection error - ${error.message}`);
        }
    }

    async checkDataIntegrity() {
        console.log('📊 Checking data integrity...');
        
        try {
            // Check MongoDB collections
            const mongoCommand = 'docker exec babillon-mongodb mongosh "mongodb://babillon:babillon-secure-password@localhost:27017/babillon?authSource=admin" --eval "db.stats()" --quiet';
            const { stdout } = await execAsync(mongoCommand);
            const hasData = stdout.includes('collections') && !stdout.includes('0');
            console.log(`  ${hasData ? '✅' : '⚠️'} MongoDB: ${hasData ? 'Data present' : 'No data found'}`);
        } catch (error) {
            console.log(`  ❌ MongoDB data check failed: ${error.message}`);
        }        try {
            // Check Redis keys
            const redisCommand = 'docker exec babillon-redis redis-cli -p 6379 dbsize';
            const { stdout } = await execAsync(redisCommand);
            const keyCount = parseInt(stdout.trim());
            const hasData = keyCount > 0;
            console.log(`  ${hasData ? '✅' : '⚠️'} Redis: ${keyCount} keys found`);
        } catch (error) {
            console.log(`  ❌ Redis data check failed: ${error.message}`);
        }
    }

    generateReport() {
        console.log('\n📋 SYSTEM HEALTH REPORT');
        console.log('========================');
        
        const healthyServices = this.results.filter(r => r.status === 'healthy');
        const totalServices = this.results.length;
        
        console.log(`Overall Status: ${healthyServices.length}/${totalServices} services healthy`);
        console.log('');
        
        for (const result of this.results) {
            const statusIcon = result.status === 'healthy' ? '✅' : '❌';
            console.log(`${statusIcon} ${result.service.toUpperCase()}`);
            console.log(`   Status: ${result.status}`);
            if (result.container) console.log(`   Container: ${result.container}`);
            if (result.httpStatus) console.log(`   HTTP: ${result.httpStatus}`);
            if (result.dbHealthy !== undefined) console.log(`   Database: ${result.dbHealthy ? 'Connected' : 'Disconnected'}`);
            if (result.details) console.log(`   Details: ${result.details}`);
            console.log('');
        }

        // System endpoints
        console.log('🔗 SYSTEM ENDPOINTS');
        console.log('===================');
        console.log('Web Interface: http://localhost:3000');
        console.log('SIR Dashboard: http://localhost:3000/sir');
        console.log('API Server: http://localhost:3001/api/health');
        console.log('Prometheus: http://localhost:9090');
        console.log('MongoDB: mongodb://babillon:***@localhost:27017/babillon');
        console.log('Redis: redis://localhost:6379');
        console.log('');

        const allHealthy = this.results.every(r => r.status === 'healthy');
        if (allHealthy) {
            console.log('🎉 ALL SYSTEMS OPERATIONAL!');
            console.log('The Babillon Unified System is ready for use.');
        } else {
            console.log('⚠️ Some services need attention.');
            console.log('Please check the failed services above.');
        }
    }

    async run() {
        console.log('🚀 Starting Babillon System Health Check');
        console.log('=========================================\n');
        
        await this.checkContainerStatus();
        console.log('');
        
        await this.checkHttpEndpoints();
        console.log('');
        
        await this.checkDatabaseConnections();
        console.log('');
        
        await this.checkDataIntegrity();
        console.log('');
        
        this.generateReport();
    }
}

// Run the health check
if (require.main === module) {
    const checker = new BabillonHealthChecker();
    checker.run().catch(error => {
        console.error('❌ Health check failed:', error.message);
        process.exit(1);
    });
}

module.exports = BabillonHealthChecker;
