// Simple test script
console.log('🔬 Testing SIR Tools...');

try {
  const { sirAnalysisTool } = require('./src/tools/sirAnalysisTool');
  console.log('✅ sirAnalysisTool loaded');
  console.log('Tool structure:', Object.keys(sirAnalysisTool));
  
  // Test the tool function
  sirAnalysisTool.func({ 
    environment: 'test', 
    analysisType: 'environmental_scan' 
  }).then(result => {
    console.log('✅ SIR Analysis result:', JSON.stringify(result, null, 2));
  }).catch(err => {
    console.error('❌ Analysis error:', err.message);
  });

} catch (err) {
  console.error('❌ Loading error:', err.message);
}

try {
  const { monitoringTool } = require('./src/tools/monitoringTool');
  console.log('✅ monitoringTool loaded');
  
} catch (err) {
  console.error('❌ Monitoring tool error:', err.message);
}

try {
  const { humanSupervisionTool } = require('./src/tools/humanSupervisionTool');
  console.log('✅ humanSupervisionTool loaded');
  
} catch (err) {
  console.error('❌ Human supervision tool error:', err.message);
}

try {
  const { environmentSimulationTool } = require('./src/tools/environmentSimulationTool');
  console.log('✅ environmentSimulationTool loaded');
  
} catch (err) {
  console.error('❌ Environment simulation tool error:', err.message);
}

console.log('🎯 Tool loading tests completed!');
