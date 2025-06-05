// Quick test for H3X SIR Control Interface
import http = require('http');
import https = require('https');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI(): Promise<any> {
  console.log('🧪 Testing H3X SIR Control Interface API...\n');

  // Test health endpoint
  console.log('1️⃣ Testing Health Endpoint...');
  try {
    const data = await makeRequest({
      hostname: 'localhost',
      port: 3979,
      path: '/health',
      method: 'GET',
    });
    console.log('✅ Health:', data);
  } catch (error) {
    console.log('❌ Health test failed:', error.message);
  }

  console.log('\n2️⃣ Testing Chat Interface...');
  try {
    const data = await makeRequest(
      {
        hostname: 'localhost',
        port: 3979,
        path: '/chat',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { message: 'Analyze the current laboratory environment' },
    );
    console.log('✅ Chat response:', data);
  } catch (error) {
    console.log('❌ Chat test failed:', error.message);
  }

  console.log('\n3️⃣ Testing SIR Analysis Endpoint...');
  try {
    const data = await makeRequest(
      {
        hostname: 'localhost',
        port: 3979,
        path: '/sir-analysis',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        environment: 'laboratory',
        analysisType: 'environmental_scan',
      },
    );
    console.log('✅ SIR Analysis:', data);
  } catch (error) {
    console.log('❌ SIR Analysis test failed:', error.message);
  }

  console.log('\n4️⃣ Testing System Status...');
  try {
    const data = await makeRequest({
      hostname: 'localhost',
      port: 3979,
      path: '/status',
      method: 'GET',
    });
    console.log('✅ System Status:', data);
  } catch (error) {
    console.log('❌ Status test failed:', error.message);
  }

  console.log('\n🎯 API Testing Complete!');
}

testAPI();
