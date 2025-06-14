/**
 * H3X Triangle-Based Cellular Automata
 * 
 * Implements triangles as fundamental data storage cells with cellular automata rules
 * for distributed computation and self-organizing data structures.
 */

import * as THREE from 'three';

export interface TriangleCell {
  id: string;
  vertices: [THREE.Vector3, THREE.Vector3, THREE.Vector3];
  state: TriangleState;
  neighbors: string[];
  data: any;
  generation: number;
  lastUpdate: number;
}

export interface TriangleState {
  active: boolean;
  dataType: 'empty' | 'primitive' | 'complex' | 'reference';
  density: number;
  temperature: number; // Activity level
  pressure: number;    // Storage pressure
  flow: THREE.Vector3; // Data flow direction
}

export interface CellularRule {
  name: string;
  condition: (cell: TriangleCell, neighbors: TriangleCell[]) => boolean;
  action: (cell: TriangleCell, neighbors: TriangleCell[]) => TriangleState;
  priority: number;
}

export interface TriangleGrid {
  width: number;
  height: number;
  cells: Map<string, TriangleCell>;
  adjacencyMatrix: Map<string, string[]>;
  generation: number;
}

export class TriangleCellularAutomata {
  private grid: TriangleGrid;
  private rules: CellularRule[] = [];
  private evolutionHistory: TriangleGrid[] = [];
  private maxHistorySize: number = 100;
  
  // Cellular automata parameters
  private readonly TRIANGLE_SIZE = 1.0;
  private readonly NEIGHBOR_RADIUS = 1.5;
  private readonly EVOLUTION_THRESHOLD = 0.1;
  
  constructor() {
    this.grid = {
      width: 0,
      height: 0,
      cells: new Map(),
      adjacencyMatrix: new Map(),
      generation: 0
    };
    
    this.initializeDefaultRules();
  }

  /**
   * Initialize triangle grid as the foundation for data storage
   */
  initializeTriangleGrid(width: number, height: number): void {
    console.log(`🔺 Initializing ${width}x${height} triangle cellular grid...`);
    
    this.grid.width = width;
    this.grid.height = height;
    this.grid.cells.clear();
    this.grid.adjacencyMatrix.clear();
    this.grid.generation = 0;
    
    // Create triangular tessellation
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        // Create upward-pointing triangle
        const upTriangle = this.createTriangleCell(row, col, 'up');
        this.grid.cells.set(upTriangle.id, upTriangle);
        
        // Create downward-pointing triangle (offset pattern)
        if (col < width - 1) {
          const downTriangle = this.createTriangleCell(row, col, 'down');
          this.grid.cells.set(downTriangle.id, downTriangle);
        }
      }
    }
    
    // Build adjacency relationships
    this.buildAdjacencyMatrix();
    
    console.log(`✅ Triangle grid initialized with ${this.grid.cells.size} cells`);
  }

  /**
   * Create individual triangle cell with geometric properties
   */
  private createTriangleCell(row: number, col: number, orientation: 'up' | 'down'): TriangleCell {
    const id = `triangle_${row}_${col}_${orientation}`;
    
    // Calculate triangle vertices based on position and orientation
    const baseX = col * this.TRIANGLE_SIZE;
    const baseY = row * this.TRIANGLE_SIZE * Math.sqrt(3) / 2;
    
    let vertices: [THREE.Vector3, THREE.Vector3, THREE.Vector3];
    
    if (orientation === 'up') {
      vertices = [
        new THREE.Vector3(baseX, baseY, 0),
        new THREE.Vector3(baseX + this.TRIANGLE_SIZE, baseY, 0),
        new THREE.Vector3(baseX + this.TRIANGLE_SIZE / 2, baseY + this.TRIANGLE_SIZE * Math.sqrt(3) / 2, 0)
      ];
    } else {
      vertices = [
        new THREE.Vector3(baseX + this.TRIANGLE_SIZE / 2, baseY, 0),
        new THREE.Vector3(baseX + this.TRIANGLE_SIZE * 1.5, baseY, 0),
        new THREE.Vector3(baseX + this.TRIANGLE_SIZE, baseY + this.TRIANGLE_SIZE * Math.sqrt(3) / 2, 0)
      ];
    }
    
    return {
      id,
      vertices,
      state: {
        active: false,
        dataType: 'empty',
        density: 0,
        temperature: 0,
        pressure: 0,
        flow: new THREE.Vector3(0, 0, 0)
      },
      neighbors: [],
      data: null,
      generation: 0,
      lastUpdate: Date.now()
    };
  }

  /**
   * Build adjacency matrix for triangle neighbors
   */
  private buildAdjacencyMatrix(): void {
    console.log('🔗 Building triangle adjacency matrix...');
    
    for (const [cellId, cell] of this.grid.cells) {
      const neighbors: string[] = [];
      
      // Find neighboring triangles within radius
      for (const [otherId, otherCell] of this.grid.cells) {
        if (cellId !== otherId && this.areTrianglesAdjacent(cell, otherCell)) {
          neighbors.push(otherId);
        }
      }
      
      cell.neighbors = neighbors;
      this.grid.adjacencyMatrix.set(cellId, neighbors);
    }
    
    console.log('✅ Adjacency matrix built');
  }

  /**
   * Check if two triangles are adjacent (share an edge or vertex)
   */
  private areTrianglesAdjacent(triangle1: TriangleCell, triangle2: TriangleCell): boolean {
    const threshold = 0.01; // Tolerance for floating point comparison
    
    // Check if triangles share vertices
    for (const vertex1 of triangle1.vertices) {
      for (const vertex2 of triangle2.vertices) {
        if (vertex1.distanceTo(vertex2) < threshold) {
          return true;
        }
      }
    }
    
    // Check if triangle centroids are within neighbor radius
    const centroid1 = this.calculateTriangleCentroid(triangle1);
    const centroid2 = this.calculateTriangleCentroid(triangle2);
    
    return centroid1.distanceTo(centroid2) <= this.NEIGHBOR_RADIUS;
  }

  /**
   * Calculate triangle centroid
   */
  private calculateTriangleCentroid(triangle: TriangleCell): THREE.Vector3 {
    const centroid = new THREE.Vector3();
    triangle.vertices.forEach(vertex => centroid.add(vertex));
    return centroid.divideScalar(3);
  }

  /**
   * Find optimal triangle for storing data based on lattice coordinates
   */
  findOptimalTriangle(latticeCoords: { u: number, v: number }): string {
    // Convert lattice coordinates to triangle grid coordinates
    const gridX = Math.floor(latticeCoords.u * this.grid.width / 1024);
    const gridY = Math.floor(latticeCoords.v * this.grid.height / 1024);
    
    // Find the best triangle at this grid position
    let bestTriangle: TriangleCell | null = null;
    let bestScore = -1;
    
    // Check triangles in the vicinity
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const checkY = Math.max(0, Math.min(this.grid.height - 1, gridY + dy));
        const checkX = Math.max(0, Math.min(this.grid.width - 1, gridX + dx));
        
        // Check both up and down triangles at this position
        const upId = `triangle_${checkY}_${checkX}_up`;
        const downId = `triangle_${checkY}_${checkX}_down`;
        
        const upTriangle = this.grid.cells.get(upId);
        const downTriangle = this.grid.cells.get(downId);
        
        if (upTriangle) {
          const score = this.calculateTriangleScore(upTriangle);
          if (score > bestScore) {
            bestScore = score;
            bestTriangle = upTriangle;
          }
        }
        
        if (downTriangle) {
          const score = this.calculateTriangleScore(downTriangle);
          if (score > bestScore) {
            bestScore = score;
            bestTriangle = downTriangle;
          }
        }
      }
    }
    
    return bestTriangle ? bestTriangle.id : this.createNewTriangle(latticeCoords);
  }

  /**
   * Calculate triangle suitability score for data storage
   */
  private calculateTriangleScore(triangle: TriangleCell): number {
    let score = 0;
    
    // Prefer empty triangles
    if (triangle.state.dataType === 'empty') score += 10;
    
    // Prefer low density areas
    score += (1 - triangle.state.density) * 5;
    
    // Prefer low pressure areas
    score += (1 - triangle.state.pressure) * 3;
    
    // Prefer triangles with good connectivity
    score += triangle.neighbors.length * 0.5;
    
    // Prefer recently updated triangles (better cache locality)
    const timeSinceUpdate = Date.now() - triangle.lastUpdate;
    score += Math.max(0, 2 - timeSinceUpdate / 1000);
    
    return score;
  }

  /**
   * Create new triangle if needed (dynamic expansion)
   */
  private createNewTriangle(latticeCoords: { u: number, v: number }): string {
    // For now, return a default triangle ID
    // In a full implementation, this would dynamically expand the grid
    const defaultId = Array.from(this.grid.cells.keys())[0];
    return defaultId || 'triangle_0_0_up';
  }

  /**
   * Store data in triangle cell
   */
  storeDataInTriangle(triangleId: string, data: any): boolean {
    const triangle = this.grid.cells.get(triangleId);
    if (!triangle) return false;
    
    // Update triangle state
    triangle.data = data;
    triangle.state.active = true;
    triangle.state.dataType = this.classifyDataType(data);
    triangle.state.density = this.calculateDataDensity(data);
    triangle.state.temperature += 0.1; // Increase activity
    triangle.lastUpdate = Date.now();
    triangle.generation = this.grid.generation;
    
    // Trigger cellular automata evolution
    this.triggerLocalEvolution(triangleId);
    
    return true;
  }

  /**
   * Retrieve data from triangle cell
   */
  retrieveDataFromTriangle(triangleId: string): any {
    const triangle = this.grid.cells.get(triangleId);
    if (!triangle) return null;
    
    // Update access statistics
    triangle.state.temperature += 0.05;
    triangle.lastUpdate = Date.now();
    
    return triangle.data;
  }

  /**
   * Evolve cellular automata by one generation
   */
  evolveGeneration(): void {
    const newStates = new Map<string, TriangleState>();
    
    // Apply cellular automata rules to each triangle
    for (const [triangleId, triangle] of this.grid.cells) {
      const neighbors = this.getTriangleNeighbors(triangleId);
      const newState = this.applyRules(triangle, neighbors);
      newStates.set(triangleId, newState);
    }
    
    // Update all triangle states
    for (const [triangleId, newState] of newStates) {
      const triangle = this.grid.cells.get(triangleId);
      if (triangle) {
        triangle.state = newState;
        triangle.generation = this.grid.generation + 1;
      }
    }
    
    this.grid.generation++;
    
    // Store evolution history
    this.storeEvolutionHistory();
  }

  /**
   * Get triangle neighbors
   */
  private getTriangleNeighbors(triangleId: string): TriangleCell[] {
    const triangle = this.grid.cells.get(triangleId);
    if (!triangle) return [];
    
    return triangle.neighbors
      .map(neighborId => this.grid.cells.get(neighborId))
      .filter(neighbor => neighbor !== undefined) as TriangleCell[];
  }

  /**
   * Apply cellular automata rules
   */
  private applyRules(triangle: TriangleCell, neighbors: TriangleCell[]): TriangleState {
    const newState = { ...triangle.state };
    
    // Apply rules in priority order
    for (const rule of this.rules.sort((a, b) => b.priority - a.priority)) {
      if (rule.condition(triangle, neighbors)) {
        return rule.action(triangle, neighbors);
      }
    }
    
    // Default evolution: cool down temperature and pressure
    newState.temperature = Math.max(0, newState.temperature * 0.95);
    newState.pressure = Math.max(0, newState.pressure * 0.98);
    
    return newState;
  }

  /**
   * Trigger local evolution around a specific triangle
   */
  private triggerLocalEvolution(triangleId: string): void {
    const triangle = this.grid.cells.get(triangleId);
    if (!triangle) return;
    
    // Evolve the triangle and its immediate neighbors
    const affectedTriangles = [triangleId, ...triangle.neighbors];
    
    for (const affectedId of affectedTriangles) {
      const affectedTriangle = this.grid.cells.get(affectedId);
      if (affectedTriangle) {
        const neighbors = this.getTriangleNeighbors(affectedId);
        const newState = this.applyRules(affectedTriangle, neighbors);
        affectedTriangle.state = newState;
        affectedTriangle.generation = this.grid.generation;
      }
    }
  }

  /**
   * Initialize default cellular automata rules
   */
  private initializeDefaultRules(): void {
    // Rule 1: Data diffusion - spread data to neighboring empty triangles
    this.rules.push({
      name: 'data_diffusion',
      priority: 10,
      condition: (cell, neighbors) => {
        return cell.state.active && cell.state.temperature > 0.5 &&
               neighbors.some(n => n.state.dataType === 'empty');
      },
      action: (cell, neighbors) => {
        const newState = { ...cell.state };
        newState.temperature *= 0.9; // Cool down after diffusion
        newState.flow = this.calculateDataFlow(cell, neighbors);
        return newState;
      }
    });
    
    // Rule 2: Pressure equilibrium - balance storage pressure
    this.rules.push({
      name: 'pressure_equilibrium',
      priority: 8,
      condition: (cell, neighbors) => {
        const avgPressure = neighbors.reduce((sum, n) => sum + n.state.pressure, 0) / neighbors.length;
        return Math.abs(cell.state.pressure - avgPressure) > this.EVOLUTION_THRESHOLD;
      },
      action: (cell, neighbors) => {
        const newState = { ...cell.state };
        const avgPressure = neighbors.reduce((sum, n) => sum + n.state.pressure, 0) / neighbors.length;
        newState.pressure = (cell.state.pressure + avgPressure) / 2;
        return newState;
      }
    });
    
    // Rule 3: Density optimization - reorganize for better storage efficiency
    this.rules.push({
      name: 'density_optimization',
      priority: 6,
      condition: (cell, neighbors) => {
        return cell.state.density > 0.8 && 
               neighbors.some(n => n.state.density < 0.2);
      },
      action: (cell, neighbors) => {
        const newState = { ...cell.state };
        newState.density *= 0.95; // Slightly reduce density
        newState.pressure += 0.1; // Increase pressure to encourage migration
        return newState;
      }
    });
    
    // Rule 4: Garbage collection - clean up unused triangles
    this.rules.push({
      name: 'garbage_collection',
      priority: 4,
      condition: (cell, neighbors) => {
        const timeSinceUpdate = Date.now() - cell.lastUpdate;
        return cell.state.active && timeSinceUpdate > 60000 && // 1 minute
               cell.state.temperature < 0.1;
      },
      action: (cell, neighbors) => {
        return {
          active: false,
          dataType: 'empty',
          density: 0,
          temperature: 0,
          pressure: 0,
          flow: new THREE.Vector3(0, 0, 0)
        };
      }
    });
  }

  /**
   * Calculate data flow direction
   */
  private calculateDataFlow(cell: TriangleCell, neighbors: TriangleCell[]): THREE.Vector3 {
    const cellCentroid = this.calculateTriangleCentroid(cell);
    const flow = new THREE.Vector3();
    
    for (const neighbor of neighbors) {
      if (neighbor.state.dataType === 'empty' || neighbor.state.density < cell.state.density) {
        const neighborCentroid = this.calculateTriangleCentroid(neighbor);
        const direction = neighborCentroid.clone().sub(cellCentroid).normalize();
        flow.add(direction);
      }
    }
    
    return flow.normalize();
  }

  // Utility methods
  
  private classifyDataType(data: any): 'empty' | 'primitive' | 'complex' | 'reference' {
    if (data === null || data === undefined) return 'empty';
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') return 'primitive';
    if (typeof data === 'object' && Object.keys(data).length > 10) return 'complex';
    return 'reference';
  }

  private calculateDataDensity(data: any): number {
    const size = JSON.stringify(data).length;
    return Math.min(1, size / 1000); // Normalize to 0-1 range
  }

  private storeEvolutionHistory(): void {
    // Store a snapshot of the current grid state
    const snapshot: TriangleGrid = {
      width: this.grid.width,
      height: this.grid.height,
      cells: new Map(this.grid.cells),
      adjacencyMatrix: new Map(this.grid.adjacencyMatrix),
      generation: this.grid.generation
    };
    
    this.evolutionHistory.push(snapshot);
    
    // Limit history size
    if (this.evolutionHistory.length > this.maxHistorySize) {
      this.evolutionHistory.shift();
    }
  }

  // Public API methods
  
  getGridStats(): any {
    const activeCells = Array.from(this.grid.cells.values()).filter(cell => cell.state.active).length;
    const totalDensity = Array.from(this.grid.cells.values()).reduce((sum, cell) => sum + cell.state.density, 0);
    const avgTemperature = Array.from(this.grid.cells.values()).reduce((sum, cell) => sum + cell.state.temperature, 0) / this.grid.cells.size;
    
    return {
      totalCells: this.grid.cells.size,
      activeCells,
      utilization: activeCells / this.grid.cells.size,
      totalDensity,
      averageTemperature: avgTemperature,
      generation: this.grid.generation,
      historySize: this.evolutionHistory.length
    };
  }

  getTriangleById(id: string): TriangleCell | undefined {
    return this.grid.cells.get(id);
  }

  getAllTriangles(): TriangleCell[] {
    return Array.from(this.grid.cells.values());
  }

  optimizeGrid(): void {
    console.log('🔄 Optimizing triangle cellular grid...');
    
    // Run several evolution cycles to optimize the grid
    for (let i = 0; i < 10; i++) {
      this.evolveGeneration();
    }
    
    console.log('✅ Grid optimization complete');
  }
}
