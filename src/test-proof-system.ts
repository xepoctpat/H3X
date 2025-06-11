#!/usr/bin/env node

/**
 * H3X Proof System Test Runner
 * Standalone test execution for the mathematical proof system
 */

import { H3XProofTestSuite } from './proof/tests/proof-tests.js';
import { H3XProofModule } from './proof-module.js';

async function runProofSystemTests(): Promise<void> {
  console.info('\n🧮 H3X Mathematical Proof System - Test Execution\n');

  try {
    // Test 1: Basic proof module functionality
    console.info('📊 Testing basic proof module...');
    const proof_module = new H3XProofModule();
    await proof_module.initialize();

    const status = proof_module.getStatus();
    console.info(
      `✅ Proof module initialized: ${status.flup_count} flups, ${status.total_proofs} proofs`,
    );

    // Test 2: Create triangle proof
    console.info('🔺 Testing triangle proof creation...');
    const triangle_result = proof_module.createTriangleProof({
      vertices: [
        { x: 1, y: 1, z: 0 },
        { x: -1, y: 1, z: 0 },
        { x: 0, y: -1, z: 1 },
      ],
      id: 'test_triangle_manual',
      platonic_source: 'octahedron',
      attachment_cost: 4.2,
    });
    console.info(`✅ Triangle proof: ${triangle_result}`);

    // Test 3: Create flup
    console.info('🔮 Testing flup creation...');
    const flup_result = proof_module.createFlup({ test: 'manual_data', value: 123 }, 50, 75);
    console.info(`✅ Flup creation: ${flup_result}`);

    // Test 4: Run time step
    console.info('⏰ Testing time step execution...');
    const time_step_result = proof_module.runTimeStep();
    console.info(`✅ Time step: ${time_step_result}`);

    // Test 5: Export data
    console.info('📤 Testing data export...');
    const exported_data = proof_module.exportData();
    console.info(`✅ Data export: ${exported_data.proofs?.length ?? 0} proofs exported`);

    // Test 6: Full test suite
    console.info('\n🧪 Running comprehensive test suite...');
    const test_suite = new H3XProofTestSuite();
    const test_results = await test_suite.runAllTests();

    console.info('\n📋 Test Results:');
    console.info(`   Total Tests: ${test_results.total_tests}`);
    console.info(`   Passed: ${test_results.passed}`);
    console.info(`   Failed: ${test_results.failed}`);
    console.info(`   Coverage: ${test_results.coverage_percentage.toFixed(1)}%`);
    console.info(`   Duration: ${test_results.duration_ms}ms`);

    if (test_results.failed > 0) {
      console.error('\n❌ Some tests failed:');
      test_results.details.forEach(([test_name, result]) => {
        if (!result.passed) {
          console.error(`   - ${test_name}: ${result.error ?? 'Unknown error'}`);
        }
      });
    }

    // Test 7: Quick benchmark (if all tests passed)
    if (test_results.failed === 0) {
      console.info('\n⚡ Running quick benchmark...');
      const benchmark_result = await proof_module.runBenchmark();
      console.info(`✅ Benchmark: ${benchmark_result}`);
    }

    console.info('\n🎉 H3X Proof System testing completed successfully!');
    console.info('📈 System is ready for mathematical proof operations.\n');
  } catch (error) {
    console.error('\n❌ H3X Proof System testing failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runProofSystemTests().catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { runProofSystemTests };
