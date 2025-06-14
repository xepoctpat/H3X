/**
 * H3X Proof System Standalone Module
 * Provides proof system functionality without external dependencies
 */

import { H3XBenchmarkFramework } from './proof/benchmark-framework.js';
import { H3XProofSystem } from './proof/proof-engine.js';
import type { Triangle3D, PlatonicSolid } from './proof/types/proof-types.js';

export class H3XProofModule {
  private proof_system: H3XProofSystem;
  private benchmark_framework: H3XBenchmarkFramework;
  private initialized: boolean = false;

  constructor() {
    this.proof_system = new H3XProofSystem({
      lattice_resolution: 1000,
      max_flups_per_cell: 10,
      energy_conservation_strict: true,
      time_axiom_validation: true,
      benchmark_enabled: true,
      debug_mode: false,
    });

    this.benchmark_framework = new H3XBenchmarkFramework(this.proof_system);
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create initial test scenario
      await this.createTestScenario();
      this.initialized = true;
    } catch (error) {
      throw new Error(`Proof system initialization failed: ${error}`);
    }
  }

  private async createTestScenario(): Promise<void> {
    // Create test triangle for proof
    const test_triangle = {
      vertices: [
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: 0, z: 1 },
      ] as [
        { x: number; y: number; z: number },
        { x: number; y: number; z: number },
        { x: number; y: number; z: number }
      ],
      id: 'demo_triangle',
      platonic_source: 'tetrahedron' as PlatonicSolid,
      attachment_cost: 3.2,
    };

    // Prove triangle attachment
    this.proof_system.proveTriangleAttachment(test_triangle);

    // Create some flups
    const flup1 = this.proof_system.createFlup(
      { type: 'demo_data', value: 42 },
      { x: 100, y: 100 },
    );

    const flup2 = this.proof_system.createFlup(
      { type: 'demo_control', state: 'active' },
      { x: 200, y: 200 },
    );

    // Create regulator
    this.proof_system.createRegulator({ x: 150, y: 150 }, [flup1.id, flup2.id]);

    // Run initial time steps
    for (let i = 0; i < 3; i++) {
      this.proof_system.runTimeStep();
    }
  }

  public getStatus(): any {
    const metrics = this.proof_system.getMetrics();
    const lattice_status = this.proof_system.getLatticeStatus();
    const all_proofs = this.proof_system.getAllProofs();

    return {
      initialized: this.initialized,
      total_proofs: all_proofs.length,
      flup_count: lattice_status.flups_count,
      regulator_count: lattice_status.regulators_count,
      lattice_utilization: lattice_status.flups_count / 1000, // Assuming 1000 is max capacity for now
      energy_efficiency: 1 - metrics.energy_consumption / 1000,
      storage_efficiency: metrics.storage_efficiency,
      information_density: metrics.information_density,
    };
  }

  public createTriangleProof(triangle_data: any): string {
    try {
      if (!this.initialized) {
        return 'Error: Proof system not initialized';
      }

      // Validate input
      if (!triangle_data.vertices || !triangle_data.id) {
        return 'Error: Invalid triangle data - requires vertices and id';
      }

      const triangle: Triangle3D = {
        vertices: triangle_data.vertices,
        id: triangle_data.id,
        platonic_source: triangle_data.platonic_source || ('tetrahedron' as PlatonicSolid),
        attachment_cost: triangle_data.attachment_cost || 5.0,
      };

      const proof = this.proof_system.proveTriangleAttachment(triangle);
      return `Proof created: ${proof.axiom_id} (validation: ${proof.validation_score.toFixed(3)})`;
    } catch (error) {
      return `Proof creation failed: ${error}`;
    }
  }

  public createFlup(data: any, x: number, y: number): string {
    try {
      if (!this.initialized) {
        return 'Error: Proof system not initialized';
      }

      const flup = this.proof_system.createFlup(data, { x, y });
      return `Flup created: ${flup.id} at (${x}, ${y})`;
    } catch (error) {
      return `Flup creation failed: ${error}`;
    }
  }

  public runTimeStep(): string {
    try {
      if (!this.initialized) {
        return 'Error: Proof system not initialized';
      }

      this.proof_system.runTimeStep();
      const status = this.getStatus();
      return `Time step executed. Flups: ${status.flup_count}, Efficiency: ${(status.energy_efficiency * 100).toFixed(1)}%`;
    } catch (error) {
      return `Time step failed: ${error}`;
    }
  }

  public async runBenchmark(): Promise<string> {
    try {
      if (!this.initialized) {
        return 'Error: Proof system not initialized';
      }

      const results = await this.benchmark_framework.runComprehensiveBenchmark();
      let total_improvement = 0;
      let benchmark_count = 0;

      results.forEach((benchmark_results) => {
        benchmark_results.forEach((result) => {
          total_improvement += result.improvement_ratio;
          benchmark_count++;
        });
      });

      const avg_improvement = benchmark_count > 0 ? total_improvement / benchmark_count : 1.0;
      return `Benchmark completed: ${results.size} comparisons. Average improvement: ${avg_improvement.toFixed(2)}x`;
    } catch (error) {
      return `Benchmark failed: ${error}`;
    }
  }

  public exportData(): any {
    if (!this.initialized) {
      return { error: 'Proof system not initialized' };
    }

    const all_proofs = this.proof_system.getAllProofs();
    const status = this.getStatus();

    return {
      timestamp: new Date().toISOString(),
      system_version: '1.0.0',
      status,
      proofs: all_proofs,
      benchmark_results: Array.from(this.benchmark_framework.getBenchmarkResults().entries()),
    };
  }
}
