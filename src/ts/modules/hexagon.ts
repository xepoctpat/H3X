// H3X Hexagon Module

import type { IH3XHexagonModule, H3XNode } from '../types/h3x.d.ts';

export class H3XHexagonModule implements IH3XHexagonModule {
  public nodes: H3XNode[] = [];
  public latticeOptimized: boolean = false;

  constructor() {
    this.initialize();
  }

  initialize(): void {
    console.log('[H3X-Hexagon] Module initialized');
  }

  addNode(): void {
    const nodeId = `hex-${this.nodes.length + 1}`;
    const newNode: H3XNode = {
      id: nodeId,
      x: Math.random() * 400,
      y: Math.random() * 300
    };
    
    this.nodes.push(newNode);
    
    // Log to global system if available
    if (typeof window !== 'undefined' && (window as any).h3xModular) {
      (window as any).h3xModular.log(`[Hexagon] Added node: ${nodeId}`);
    }
  }

  optimize(): void {
    this.latticeOptimized = !this.latticeOptimized;
    
    // Log to global system if available
    if (typeof window !== 'undefined' && (window as any).h3xModular) {
      (window as any).h3xModular.log(`[Hexagon] Lattice optimization: ${this.latticeOptimized ? 'ON' : 'OFF'}`);
    }
  }

  destroy(): void {
    this.nodes = [];
    this.latticeOptimized = false;
    console.log('[H3X-Hexagon] Module destroyed');
  }
}