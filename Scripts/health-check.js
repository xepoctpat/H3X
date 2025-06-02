const http = require('http');

const endpoints = [
    { name: 'H3X Dashboard', url: 'http://localhost:3978/api/health' },
    { name: 'H3X Protocol Server', url: 'http://localhost:8081/health' },
    { name: 'LMStudio Integration', url: 'http://localhost:1234/v1/models' }
];

async function checkEndpoint(endpoint) {
    return new Promise((resolve) => {
        const req = http.get(endpoint.url, (res) => {
            console.log(`✅ ${endpoint.name}: Status ${res.statusCode}`);
            resolve({ name: endpoint.name, status: res.statusCode, healthy: res.statusCode < 400 });
        });

        req.on('error', (err) => {
            console.log(`❌ ${endpoint.name}: ${err.message}`);
            resolve({ name: endpoint.name, status: 'ERROR', healthy: false, error: err.message });
        });

        req.setTimeout(5000, () => {
            req.destroy();
            console.log(`⏰ ${endpoint.name}: Timeout`);
            resolve({ name: endpoint.name, status: 'TIMEOUT', healthy: false });
        });
    });
}

async function runHealthCheck() {
    console.log('🔬 H3X Protocol Health Check...\n');
    
    const results = await Promise.all(endpoints.map(checkEndpoint));
    
    console.log('\n📊 H3X System Status:');
    results.forEach(result => {
        const status = result.healthy ? '🟢 OPERATIONAL' : '🔴 DOWN';
        console.log(`  ${result.name}: ${status}`);
    });
    
    const allHealthy = results.every(r => r.healthy);
    console.log('\n🎯 H3X Protocol Status: ' + (allHealthy ? '🟢 ALL SYSTEMS GO' : '🔴 SYSTEM ISSUES DETECTED'));
    
    process.exit(allHealthy ? 0 : 1);
}

runHealthCheck();