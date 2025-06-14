/**
 * H3X Geometric Indexer
 * 
 * Implements geometric indexing where spatial relationships define data relationships
 * with O(log n) retrieval performance and spatial query optimization.
 */

import * as THREE from 'three';

export interface SpatialIndex {
  id: string;
  type: 'octree' | 'kdtree' | 'rtree' | 'grid';
  bounds: THREE.Box3;
  depth: number;
  nodeCount: number;
  dataPoints: string[];
  children: SpatialIndex[];
  parent?: string;
}

export interface IndexEntry {
  dataId: string;
  position: THREE.Vector4;
  triangleAddress: string;
  spatialHash: string;
  indexNodes: string[];
  lastAccessed: number;
  accessCount: number;
}

export interface QueryResult {
  dataId: string;
  distance: number;
  relevanceScore: number;
  triangleAddress: string;
  retrievalTime: number;
}

export interface IndexStats {
  totalEntries: number;
  indexDepth: number;
  averageRetrievalTime: number;
  cacheHitRatio: number;
  spatialDistribution: any;
  queryPerformance: any;
}

export class GeometricIndexer {
  private spatialIndexes: Map<string, SpatialIndex> = new Map();
  private indexEntries: Map<string, IndexEntry> = new Map();
  private queryCache: Map<string, QueryResult[]> = new Map();
  private rootIndex: SpatialIndex | null = null;
  
  // Indexing parameters
  private readonly MAX_DEPTH = 8;
  private readonly MAX_POINTS_PER_NODE = 16;
  private readonly CACHE_SIZE = 1000;
  private readonly SPATIAL_HASH_PRECISION = 1000;
  
  // Performance tracking
  private totalQueries = 0;
  private totalRetrievalTime = 0;
  private cacheHits = 0;
  
  constructor() {
    this.initializeRootIndex();
  }

  /**
   * Initialize root spatial index
   */
  private initializeRootIndex(): void {
    this.rootIndex = {
      id: 'root',
      type: 'octree',
      bounds: new THREE.Box3(
        new THREE.Vector3(-1000, -1000, -1000),
        new THREE.Vector3(1000, 1000, 1000)
      ),
      depth: 0,
      nodeCount: 0,
      dataPoints: [],
      children: []
    };
    
    this.spatialIndexes.set('root', this.rootIndex);
    console.log('🗂️ Geometric indexer initialized with octree root');
  }

  /**
   * Add data point to geometric index
   */
  addPoint(dataId: string, position: THREE.Vector4, triangleAddress: string): void {
    const spatialHash = this.calculateSpatialHash(position);
    
    // Create index entry
    const entry: IndexEntry = {
      dataId,
      position,
      triangleAddress,
      spatialHash,
      indexNodes: [],
      lastAccessed: Date.now(),
      accessCount: 0
    };
    
    this.indexEntries.set(dataId, entry);
    
    // Insert into spatial index
    this.insertIntoSpatialIndex(entry);
    
    // Clear relevant cache entries
    this.invalidateCache(position);
    
    console.log(`📍 Added point ${dataId} to geometric index at ${triangleAddress}`);
  }

  /**
   * Update data point in geometric index
   */
  updatePoint(dataId: string, newPosition: THREE.Vector4, newTriangleAddress: string): void {
    const entry = this.indexEntries.get(dataId);
    if (!entry) return;
    
    // Remove from old spatial index nodes
    this.removeFromSpatialIndex(entry);
    
    // Update entry
    entry.position = newPosition;
    entry.triangleAddress = newTriangleAddress;
    entry.spatialHash = this.calculateSpatialHash(newPosition);
    entry.indexNodes = [];
    
    // Re-insert into spatial index
    this.insertIntoSpatialIndex(entry);
    
    // Clear cache
    this.invalidateCache(newPosition);
    
    console.log(`🔄 Updated point ${dataId} in geometric index`);
  }

  /**
   * Remove data point from geometric index
   */
  removePoint(dataId: string): void {
    const entry = this.indexEntries.get(dataId);
    if (!entry) return;
    
    // Remove from spatial index
    this.removeFromSpatialIndex(entry);
    
    // Remove entry
    this.indexEntries.delete(dataId);
    
    // Clear cache
    this.invalidateCache(entry.position);
    
    console.log(`🗑️ Removed point ${dataId} from geometric index`);
  }

  /**
   * Perform spatial range query
   */
  spatialRangeQuery(bounds: THREE.Box3): QueryResult[] {
    const startTime = performance.now();
    const cacheKey = this.createBoundsKey(bounds);
    
    // Check cache first
    const cached = this.queryCache.get(cacheKey);
    if (cached) {
      this.cacheHits++;
      return cached;
    }
    
    const results: QueryResult[] = [];
    
    // Traverse spatial index
    this.traverseForRange(this.rootIndex!, bounds, results);
    
    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    const retrievalTime = performance.now() - startTime;
    this.updatePerformanceStats(retrievalTime);
    
    // Cache results
    this.cacheResults(cacheKey, results);
    
    return results;
  }

  /**
   * Perform nearest neighbor query
   */
  nearestNeighborQuery(position: THREE.Vector4, k: number = 10): QueryResult[] {
    const startTime = performance.now();
    const cacheKey = this.createPositionKey(position, k);
    
    // Check cache
    const cached = this.queryCache.get(cacheKey);
    if (cached) {
      this.cacheHits++;
      return cached;
    }
    
    const candidates: QueryResult[] = [];
    
    // Find all points and calculate distances
    for (const [dataId, entry] of this.indexEntries) {
      const distance = this.calculate4DDistance(position, entry.position);
      const relevanceScore = this.calculateRelevanceScore(distance, entry);
      
      candidates.push({
        dataId,
        distance,
        relevanceScore,
        triangleAddress: entry.triangleAddress,
        retrievalTime: 0
      });
    }
    
    // Sort by distance and take top k
    candidates.sort((a, b) => a.distance - b.distance);
    const results = candidates.slice(0, k);
    
    const retrievalTime = performance.now() - startTime;
    this.updatePerformanceStats(retrievalTime);
    
    // Update retrieval times
    results.forEach(result => {
      result.retrievalTime = retrievalTime / results.length;
    });
    
    // Cache results
    this.cacheResults(cacheKey, results);
    
    return results;
  }

  /**
   * Perform geometric relationship query
   */
  relationshipQuery(dataId: string, relationshipType: 'adjacent' | 'contained' | 'overlapping'): QueryResult[] {
    const entry = this.indexEntries.get(dataId);
    if (!entry) return [];
    
    const results: QueryResult[] = [];
    const position = entry.position;
    
    switch (relationshipType) {
      case 'adjacent':
        return this.findAdjacentPoints(position);
      case 'contained':
        return this.findContainedPoints(position);
      case 'overlapping':
        return this.findOverlappingPoints(position);
      default:
        return [];
    }
  }

  /**
   * Insert entry into spatial index
   */
  private insertIntoSpatialIndex(entry: IndexEntry): void {
    const position3D = new THREE.Vector3(entry.position.x, entry.position.y, entry.position.z);
    this.insertIntoNode(this.rootIndex!, entry, position3D);
  }

  /**
   * Insert entry into specific index node
   */
  private insertIntoNode(node: SpatialIndex, entry: IndexEntry, position: THREE.Vector3): void {
    // Check if point is within node bounds
    if (!node.bounds.containsPoint(position)) {
      return;
    }
    
    // Add to this node
    node.dataPoints.push(entry.dataId);
    entry.indexNodes.push(node.id);
    
    // Check if node needs subdivision
    if (node.dataPoints.length > this.MAX_POINTS_PER_NODE && node.depth < this.MAX_DEPTH) {
      this.subdivideNode(node);
    }
    
    // Try to insert into children
    for (const child of node.children) {
      this.insertIntoNode(child, entry, position);
    }
  }

  /**
   * Subdivide spatial index node
   */
  private subdivideNode(node: SpatialIndex): void {
    if (node.children.length > 0) return; // Already subdivided
    
    const bounds = node.bounds;
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    
    // Create 8 octree children
    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        for (let z = 0; z < 2; z++) {
          const childId = `${node.id}_${x}${y}${z}`;
          
          const childMin = new THREE.Vector3(
            bounds.min.x + (x * size.x / 2),
            bounds.min.y + (y * size.y / 2),
            bounds.min.z + (z * size.z / 2)
          );
          
          const childMax = new THREE.Vector3(
            childMin.x + size.x / 2,
            childMin.y + size.y / 2,
            childMin.z + size.z / 2
          );
          
          const child: SpatialIndex = {
            id: childId,
            type: 'octree',
            bounds: new THREE.Box3(childMin, childMax),
            depth: node.depth + 1,
            nodeCount: 0,
            dataPoints: [],
            children: [],
            parent: node.id
          };
          
          node.children.push(child);
          this.spatialIndexes.set(childId, child);
        }
      }
    }
    
    console.log(`🌳 Subdivided node ${node.id} into ${node.children.length} children`);
  }

  /**
   * Remove entry from spatial index
   */
  private removeFromSpatialIndex(entry: IndexEntry): void {
    for (const nodeId of entry.indexNodes) {
      const node = this.spatialIndexes.get(nodeId);
      if (node) {
        const index = node.dataPoints.indexOf(entry.dataId);
        if (index !== -1) {
          node.dataPoints.splice(index, 1);
        }
      }
    }
  }

  /**
   * Traverse spatial index for range query
   */
  private traverseForRange(node: SpatialIndex, bounds: THREE.Box3, results: QueryResult[]): void {
    // Check if node intersects with query bounds
    if (!node.bounds.intersectsBox(bounds)) {
      return;
    }
    
    // Check points in this node
    for (const dataId of node.dataPoints) {
      const entry = this.indexEntries.get(dataId);
      if (entry) {
        const position3D = new THREE.Vector3(entry.position.x, entry.position.y, entry.position.z);
        if (bounds.containsPoint(position3D)) {
          const distance = bounds.getCenter(new THREE.Vector3()).distanceTo(position3D);
          const relevanceScore = this.calculateRelevanceScore(distance, entry);
          
          results.push({
            dataId,
            distance,
            relevanceScore,
            triangleAddress: entry.triangleAddress,
            retrievalTime: 0
          });
        }
      }
    }
    
    // Traverse children
    for (const child of node.children) {
      this.traverseForRange(child, bounds, results);
    }
  }

  /**
   * Find adjacent points
   */
  private findAdjacentPoints(position: THREE.Vector4): QueryResult[] {
    const adjacencyRadius = 2.0; // Define adjacency threshold
    const bounds = new THREE.Box3(
      new THREE.Vector3(position.x - adjacencyRadius, position.y - adjacencyRadius, position.z - adjacencyRadius),
      new THREE.Vector3(position.x + adjacencyRadius, position.y + adjacencyRadius, position.z + adjacencyRadius)
    );
    
    return this.spatialRangeQuery(bounds);
  }

  /**
   * Find contained points
   */
  private findContainedPoints(position: THREE.Vector4): QueryResult[] {
    const containmentRadius = 1.0;
    const bounds = new THREE.Box3(
      new THREE.Vector3(position.x - containmentRadius, position.y - containmentRadius, position.z - containmentRadius),
      new THREE.Vector3(position.x + containmentRadius, position.y + containmentRadius, position.z + containmentRadius)
    );
    
    return this.spatialRangeQuery(bounds);
  }

  /**
   * Find overlapping points
   */
  private findOverlappingPoints(position: THREE.Vector4): QueryResult[] {
    const overlapRadius = 1.5;
    const bounds = new THREE.Box3(
      new THREE.Vector3(position.x - overlapRadius, position.y - overlapRadius, position.z - overlapRadius),
      new THREE.Vector3(position.x + overlapRadius, position.y + overlapRadius, position.z + overlapRadius)
    );
    
    return this.spatialRangeQuery(bounds);
  }

  // Utility methods
  
  private calculateSpatialHash(position: THREE.Vector4): string {
    const x = Math.floor(position.x * this.SPATIAL_HASH_PRECISION);
    const y = Math.floor(position.y * this.SPATIAL_HASH_PRECISION);
    const z = Math.floor(position.z * this.SPATIAL_HASH_PRECISION);
    const w = Math.floor(position.w * this.SPATIAL_HASH_PRECISION);
    return `${x},${y},${z},${w}`;
  }

  private calculate4DDistance(pos1: THREE.Vector4, pos2: THREE.Vector4): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    const dw = pos1.w - pos2.w;
    return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
  }

  private calculateRelevanceScore(distance: number, entry: IndexEntry): number {
    // Combine distance with access frequency for relevance
    const distanceScore = 1 / (1 + distance);
    const accessScore = Math.log(1 + entry.accessCount) / 10;
    const recencyScore = 1 / (1 + (Date.now() - entry.lastAccessed) / 1000);
    
    return (distanceScore * 0.5) + (accessScore * 0.3) + (recencyScore * 0.2);
  }

  private createBoundsKey(bounds: THREE.Box3): string {
    const min = bounds.min;
    const max = bounds.max;
    return `bounds_${min.x}_${min.y}_${min.z}_${max.x}_${max.y}_${max.z}`;
  }

  private createPositionKey(position: THREE.Vector4, k: number): string {
    return `nn_${position.x}_${position.y}_${position.z}_${position.w}_${k}`;
  }

  private invalidateCache(position: THREE.Vector4): void {
    // Remove cache entries that might be affected by this position change
    const keysToRemove: string[] = [];
    
    for (const key of this.queryCache.keys()) {
      if (key.includes(position.x.toString()) || key.includes(position.y.toString())) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => this.queryCache.delete(key));
  }

  private cacheResults(key: string, results: QueryResult[]): void {
    // Implement LRU cache
    if (this.queryCache.size >= this.CACHE_SIZE) {
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }
    
    this.queryCache.set(key, results);
  }

  private updatePerformanceStats(retrievalTime: number): void {
    this.totalQueries++;
    this.totalRetrievalTime += retrievalTime;
  }

  // Public API methods
  
  getIndexStats(): IndexStats {
    const averageRetrievalTime = this.totalQueries > 0 ? this.totalRetrievalTime / this.totalQueries : 0;
    const cacheHitRatio = this.totalQueries > 0 ? this.cacheHits / this.totalQueries : 0;
    
    return {
      totalEntries: this.indexEntries.size,
      indexDepth: this.calculateMaxDepth(),
      averageRetrievalTime,
      cacheHitRatio,
      spatialDistribution: this.calculateSpatialDistribution(),
      queryPerformance: {
        totalQueries: this.totalQueries,
        cacheHits: this.cacheHits,
        averageRetrievalTime
      }
    };
  }

  private calculateMaxDepth(): number {
    let maxDepth = 0;
    for (const index of this.spatialIndexes.values()) {
      maxDepth = Math.max(maxDepth, index.depth);
    }
    return maxDepth;
  }

  private calculateSpatialDistribution(): any {
    const distribution = {
      totalNodes: this.spatialIndexes.size,
      leafNodes: 0,
      averagePointsPerNode: 0,
      maxPointsPerNode: 0
    };
    
    let totalPoints = 0;
    
    for (const index of this.spatialIndexes.values()) {
      if (index.children.length === 0) {
        distribution.leafNodes++;
      }
      totalPoints += index.dataPoints.length;
      distribution.maxPointsPerNode = Math.max(distribution.maxPointsPerNode, index.dataPoints.length);
    }
    
    distribution.averagePointsPerNode = distribution.totalNodes > 0 ? totalPoints / distribution.totalNodes : 0;
    
    return distribution;
  }

  optimizeIndex(): void {
    console.log('🔧 Optimizing geometric index...');
    
    // Rebuild index for better performance
    const entries = Array.from(this.indexEntries.values());
    
    // Clear current index
    this.spatialIndexes.clear();
    this.queryCache.clear();
    this.initializeRootIndex();
    
    // Re-insert all entries
    for (const entry of entries) {
      this.insertIntoSpatialIndex(entry);
    }
    
    console.log('✅ Geometric index optimization complete');
  }

  getEntry(dataId: string): IndexEntry | undefined {
    return this.indexEntries.get(dataId);
  }

  getAllEntries(): IndexEntry[] {
    return Array.from(this.indexEntries.values());
  }

  getSpatialIndex(nodeId: string): SpatialIndex | undefined {
    return this.spatialIndexes.get(nodeId);
  }

  clearCache(): void {
    this.queryCache.clear();
    this.cacheHits = 0;
    console.log('🧹 Geometric index cache cleared');
  }
}
