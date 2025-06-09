/**
 * Basic test for fLups Engine Core
 * Validates core functionality and demonstrates usage
 */

import { fLupsEngine, TriangleNode, TrianglePatch, ActionEvent } from './fLups-engine-core.js';

function runBasicTests(): void {
  console.log('=== fLups Engine Core Tests ===\n');
  
  // Initialize engine with debug mode
  const engine = new fLupsEngine({ debugMode: true });
  
  console.log('1. Creating nodes...');
  
  // Create the basic fLups triangle
  const flupPlus = engine.createNode('flup+', { x: 0, y: 1, z: 0 }, 1.0);
  const flupMinus = engine.createNode('flup-', { x: -1, y: -1, z: 0 }, 1.0);
  const cflupN = engine.createNode('cflup-n', { x: 1, y: -1, z: 0 }, 1.0);
  
  console.log(`Created nodes: ${flupPlus.id}, ${flupMinus.id}, ${cflupN.id}`);
  
  console.log('\n2. Creating patch...');
  
  // Create a triangular patch
  const patch = engine.createPatch([flupPlus.id, flupMinus.id, cflupN.id]);
  console.log(`Created patch: ${patch.id}`);
  
  console.log('\n3. Testing patch retrieval...');
  
  const retrievedPatch = engine.getPatch(patch.id);
  console.log(`Retrieved patch: ${retrievedPatch ? 'SUCCESS' : 'FAILED'}`);
  
  console.log('\n4. Testing neighbor relationships...');
  
  const areNeighbors1 = engine.areNeighbors(flupPlus.id, flupMinus.id);
  const areNeighbors2 = engine.areNeighbors(flupPlus.id, 'nonexistent');
  
  console.log(`Nodes in same patch are neighbors: ${areNeighbors1 ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Node and nonexistent are neighbors: ${!areNeighbors2 ? 'SUCCESS' : 'FAILED'}`);
  
  console.log('\n5. Creating and validating actions...');
  
  // Create a transmission action
  const action = engine.createAction('transmit', flupPlus.id, flupMinus.id, 0.1);
  console.log(`Created action: ${action.id}`);
  
  // Test action validation
  const isValid = engine.isValidAction(action);
  console.log(`Action validation: ${isValid ? 'SUCCESS' : 'FAILED'}`);
  
  console.log('\n6. Processing actions...');
  
  // Update node states for valid action
  flupPlus.state = 'transmitting';
  flupMinus.state = 'receiving';
  
  const processed = engine.processAction(action);
  console.log(`Action processing: ${processed ? 'SUCCESS' : 'FAILED'}`);
  
  console.log('\n7. Testing φ-mapping...');
  
  const phiMapping = engine.mapPatchToIcosahedron(patch.id);
  console.log(`φ-mapping result: ${phiMapping ? 'SUCCESS' : 'FAILED'}`);
  
  if (phiMapping) {
    console.log(`Face index: ${phiMapping.faceIndex}`);
    console.log(`φ scale: ${phiMapping.phiScale.toFixed(3)}`);
    console.log(`Mapping quality: ${phiMapping.mappingQuality.toFixed(3)}`);
    console.log(`Is valid: ${phiMapping.isValid}`);
  }
  
  console.log('\n8. Creating mirror patch...');
  
  const mirrorPatch = engine.createMirrorPatch(patch.id);
  console.log(`Mirror patch creation: ${mirrorPatch ? 'SUCCESS' : 'FAILED'}`);
  
  console.log('\n9. Getting statistics...');
  
  const stats = engine.getStatistics();
  console.log('Engine Statistics:');
  console.log(`  Nodes: ${stats.nodeCount}`);
  console.log(`  Patches: ${stats.patchCount}`);
  console.log(`  Virtual Time: ${stats.virtualTime}`);
  console.log(`  Total Energy: ${stats.totalEnergy.toFixed(3)}`);
  
  console.log('\n10. Getting audit log...');
  
  const auditLog = engine.getAuditLog(5);
  console.log(`Audit log entries: ${auditLog.length}`);
  
  if (auditLog.length > 0) {
    console.log('Recent actions:');
    auditLog.forEach(action => {
      console.log(`  ${action.type}: ${action.status} (${action.sourceNodeId} → ${action.targetNodeId})`);
    });
  }
  
  console.log('\n=== All Tests Completed ===');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runBasicTests();
} else {
  // Browser environment - attach to window for manual testing
  (window as any).runfLupsTests = runBasicTests;
  console.log('fLups Engine tests available. Run: runfLupsTests()');
}