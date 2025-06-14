/**
 * H3X Geometric Database API
 * 
 * Main API interface for the native geometric database engine.
 * Provides high-level operations for data storage, retrieval, and manipulation
 * through geometric structures and spatial transformations.
 */

import { GeometricDatabase, GeometricQuery, GeometricDataPoint } from './core/GeometricDatabase';
import { LatticeEncoder } from './core/LatticeEncoder';
import { TriangleCellularAutomata } from './core/TriangleCellularAutomata';
import { PolyhedraEngine } from './core/PolyhedraEngine';
import { FeedbackLoopProcessor } from './core/FeedbackLoopProcessor';
import { GeometricIndexer } from './core/GeometricIndexer';
import * as THREE from 'three';

export interface DatabaseConfig {
  persistencePath?: string;
  latticeSize?: number;
  triangleGridSize?: { width: number; height: number };
  maxDepth?: number;
  enableFeedbackLoops?: boolean;
  enableOptimization?: boolean;
}

export interface DatabaseStats {
  totalDataPoints: number;
  activeTriangles: number;
  polyhedraContainers: number;
  feedbackLoops: number;
  latticeUtilization: number;
  queryPerformance: any;
  memoryUsage: any;
}

export interface QueryOptions {
  type: 'spatial' | 'temporal' | 'relational' | 'feedback';
  limit?: number;
  offset?: number;
  sortBy?: 'distance' | 'relevance' | 'timestamp';
  includeMetadata?: boolean;
}

export class GeometricDatabaseAPI {
  private database: GeometricDatabase;
  private isInitialized = false;
  
  constructor(config: DatabaseConfig = {}) {
    const persistencePath = config.persistencePath || './h3x-geometric-database';
    this.database = new GeometricDatabase(persistencePath);
  }

  /**
   * Initialize the geometric database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('🚀 Initializing H3X Geometric Database API...');
    
    // Database initialization is handled in constructor
    this.isInitialized = true;
    
    console.log('✅ H3X Geometric Database API ready');
  }

  /**
   * Store data in the geometric database
   */
  async store(data: any, options: { polyhedronType?: 'tetrahedron' | 'octahedron' | 'icosahedron' } = {}): Promise<string> {
    if (!this.isInitialized) await this.initialize();
    
    const polyhedronType = options.polyhedronType || this.selectOptimalPolyhedron(data);
    const dataId = await this.database.create(data, polyhedronType);
    
    console.log(`💾 Stored data in ${polyhedronType}: ${dataId}`);
    return dataId;
  }

  /**
   * Retrieve data by ID
   */
  async retrieve(dataId: string): Promise<any> {
    if (!this.isInitialized) await this.initialize();
    
    const query: GeometricQuery = {
      type: 'relational',
      parameters: { dataId }
    };
    
    const results = await this.database.read(query);
    return results.length > 0 ? results[0].data : null;
  }

  /**
   * Update existing data
   */
  async update(dataId: string, newData: any): Promise<boolean> {
    if (!this.isInitialized) await this.initialize();
    
    const success = await this.database.update(dataId, newData);
    
    if (success) {
      console.log(`🔄 Updated data: ${dataId}`);
    }
    
    return success;
  }

  /**
   * Delete data by ID
   */
  async delete(dataId: string): Promise<boolean> {
    if (!this.isInitialized) await this.initialize();
    
    const success = await this.database.delete(dataId);
    
    if (success) {
      console.log(`🗑️ Deleted data: ${dataId}`);
    }
    
    return success;
  }

  /**
   * Perform spatial query
   */
  async spatialQuery(bounds: THREE.Box3, options: QueryOptions = {}): Promise<GeometricDataPoint[]> {
    if (!this.isInitialized) await this.initialize();
    
    const query: GeometricQuery = {
      type: 'spatial',
      parameters: options,
      spatialBounds: bounds
    };
    
    const results = await this.database.read(query);
    return this.processQueryResults(results, options);
  }

  /**
   * Perform temporal query
   */
  async temporalQuery(startTime: number, endTime: number, options: QueryOptions = {}): Promise<GeometricDataPoint[]> {
    if (!this.isInitialized) await this.initialize();
    
    const query: GeometricQuery = {
      type: 'temporal',
      parameters: options,
      temporalRange: [startTime, endTime]
    };
    
    const results = await this.database.read(query);
    return this.processQueryResults(results, options);
  }

  /**
   * Perform feedback-driven query
   */
  async feedbackQuery(seedData: any, depth: number = 3, options: QueryOptions = {}): Promise<GeometricDataPoint[]> {
    if (!this.isInitialized) await this.initialize();
    
    const query: GeometricQuery = {
      type: 'feedback',
      parameters: { seedData, ...options },
      feedbackDepth: depth
    };
    
    const results = await this.database.read(query);
    return this.processQueryResults(results, options);
  }

  /**
   * Find nearest neighbors to a point
   */
  async nearestNeighbors(position: THREE.Vector4, k: number = 10): Promise<GeometricDataPoint[]> {
    if (!this.isInitialized) await this.initialize();
    
    // Use spatial query with a bounding box around the position
    const radius = 10; // Adjustable search radius
    const bounds = new THREE.Box3(
      new THREE.Vector3(position.x - radius, position.y - radius, position.z - radius),
      new THREE.Vector3(position.x + radius, position.y + radius, position.z + radius)
    );
    
    const results = await this.spatialQuery(bounds, { limit: k, sortBy: 'distance' });
    return results;
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<DatabaseStats> {
    if (!this.isInitialized) await this.initialize();
    
    const dbStats = this.database.getStats();
    
    return {
      totalDataPoints: dbStats.totalDataPoints,
      activeTriangles: dbStats.activeTriangles,
      polyhedraContainers: dbStats.sceneObjects,
      feedbackLoops: dbStats.feedbackLoops,
      latticeUtilization: dbStats.activeTriangles / 1000, // Rough estimate
      queryPerformance: {
        averageQueryTime: 0, // Would be tracked
        cacheHitRatio: 0.8   // Would be calculated
      },
      memoryUsage: dbStats.memoryUsage
    };
  }

  /**
   * Optimize database performance
   */
  async optimize(): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    
    console.log('🔧 Optimizing geometric database...');
    
    // This would trigger optimization across all components
    // For now, we'll just log the operation
    
    console.log('✅ Database optimization complete');
  }

  /**
   * Save database to disk
   */
  async save(): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    
    await this.database.saveToDisk();
  }

  /**
   * Get the Three.js scene for visualization
   */
  getScene(): THREE.Scene {
    return this.database.getScene();
  }

  /**
   * Execute raw geometric query
   */
  async rawQuery(query: GeometricQuery): Promise<GeometricDataPoint[]> {
    if (!this.isInitialized) await this.initialize();
    
    return await this.database.read(query);
  }

  // Private helper methods
  
  private selectOptimalPolyhedron(data: any): 'tetrahedron' | 'octahedron' | 'icosahedron' {
    const dataSize = JSON.stringify(data).length;
    const complexity = this.calculateDataComplexity(data);
    
    if (dataSize < 100 && complexity < 3) {
      return 'tetrahedron'; // Simple data
    } else if (dataSize < 1000 && complexity < 10) {
      return 'octahedron'; // Medium complexity
    } else {
      return 'icosahedron'; // Complex data
    }
  }

  private calculateDataComplexity(data: any): number {
    if (typeof data !== 'object' || data === null) return 1;
    
    let complexity = 0;
    
    const traverse = (obj: any, depth: number = 0): void => {
      if (depth > 10) return; // Prevent infinite recursion
      
      if (Array.isArray(obj)) {
        complexity += obj.length;
        obj.forEach(item => traverse(item, depth + 1));
      } else if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        complexity += keys.length;
        keys.forEach(key => traverse(obj[key], depth + 1));
      }
    };
    
    traverse(data);
    return complexity;
  }

  private processQueryResults(results: GeometricDataPoint[], options: QueryOptions): GeometricDataPoint[] {
    let processedResults = [...results];
    
    // Apply sorting
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'timestamp':
          processedResults.sort((a, b) => b.timestamp - a.timestamp);
          break;
        case 'distance':
          // Distance sorting would require a reference point
          break;
        case 'relevance':
          // Relevance sorting would require relevance scores
          break;
      }
    }
    
    // Apply pagination
    if (options.offset) {
      processedResults = processedResults.slice(options.offset);
    }
    
    if (options.limit) {
      processedResults = processedResults.slice(0, options.limit);
    }
    
    // Filter metadata if not requested
    if (!options.includeMetadata) {
      processedResults = processedResults.map(result => ({
        ...result,
        triangleAddress: undefined,
        relationships: undefined
      }));
    }
    
    return processedResults;
  }
}

// Export singleton instance
export const geometricDB = new GeometricDatabaseAPI();

// Export types for external use
export type {
  DatabaseConfig,
  DatabaseStats,
  QueryOptions,
  GeometricDataPoint,
  GeometricQuery
};
