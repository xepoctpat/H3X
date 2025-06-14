/**
 * H3X Modular Polyhedra Generation Engine
 * 
 * Implements three core polyhedra as modular data containers:
 * - Tetrahedrons: Basic 4-face containers for simple data structures
 * - Octahedrons: 8-face containers for medium complexity data with dual relationships
 * - Icosahedrons: 20-face containers for complex hierarchical data structures
 */

import * as THREE from 'three';

export interface PolyhedronContainer {
  id: string;
  type: 'tetrahedron' | 'octahedron' | 'icosahedron';
  mesh: THREE.Mesh;
  faces: PolyhedronFace[];
  capacity: number;
  utilization: number;
  data: Map<string, any>;
  relationships: string[];
  transformationHistory: THREE.Matrix4[];
  createdAt: number;
  lastAccessed: number;
}

export interface PolyhedronFace {
  id: string;
  vertices: THREE.Vector3[];
  normal: THREE.Vector3;
  area: number;
  dataSlots: DataSlot[];
  adjacentFaces: string[];
}

export interface DataSlot {
  id: string;
  position: THREE.Vector3;
  data: any;
  dataType: string;
  size: number;
  locked: boolean;
}

export interface PolyhedronAssembly {
  id: string;
  containers: string[];
  assemblyType: 'nested' | 'adjacent' | 'hierarchical';
  transformationMatrix: THREE.Matrix4;
  totalCapacity: number;
  totalUtilization: number;
}

export class PolyhedraEngine {
  private containers: Map<string, PolyhedronContainer> = new Map();
  private assemblies: Map<string, PolyhedronAssembly> = new Map();
  private materialLibrary: Map<string, THREE.Material> = new Map();
  private geometryCache: Map<string, THREE.BufferGeometry> = new Map();
  
  // Polyhedra specifications
  private readonly TETRAHEDRON_CAPACITY = 4;
  private readonly OCTAHEDRON_CAPACITY = 8;
  private readonly ICOSAHEDRON_CAPACITY = 20;
  
  constructor() {
    this.initializeMaterials();
    this.initializeGeometries();
  }

  /**
   * Create tetrahedron container for simple data structures
   */
  createTetrahedron(position?: THREE.Vector4): THREE.Mesh {
    const id = this.generatePolyhedronId('tetrahedron');
    const geometry = this.getTetrahedronGeometry();
    const material = this.materialLibrary.get('tetrahedron')!;
    const mesh = new THREE.Mesh(geometry, material);
    
    if (position) {
      mesh.position.set(position.x, position.y, position.z);
    }
    
    mesh.name = id;
    
    // Create container data structure
    const container: PolyhedronContainer = {
      id,
      type: 'tetrahedron',
      mesh,
      faces: this.createTetrahedronFaces(geometry),
      capacity: this.TETRAHEDRON_CAPACITY,
      utilization: 0,
      data: new Map(),
      relationships: [],
      transformationHistory: [],
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };
    
    this.containers.set(id, container);
    
    console.log(`🔺 Created tetrahedron container: ${id}`);
    return mesh;
  }

  /**
   * Create octahedron container for medium complexity data
   */
  createOctahedron(position?: THREE.Vector4): THREE.Mesh {
    const id = this.generatePolyhedronId('octahedron');
    const geometry = this.getOctahedronGeometry();
    const material = this.materialLibrary.get('octahedron')!;
    const mesh = new THREE.Mesh(geometry, material);
    
    if (position) {
      mesh.position.set(position.x, position.y, position.z);
    }
    
    mesh.name = id;
    
    // Create container data structure
    const container: PolyhedronContainer = {
      id,
      type: 'octahedron',
      mesh,
      faces: this.createOctahedronFaces(geometry),
      capacity: this.OCTAHEDRON_CAPACITY,
      utilization: 0,
      data: new Map(),
      relationships: [],
      transformationHistory: [],
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };
    
    this.containers.set(id, container);
    
    console.log(`🔶 Created octahedron container: ${id}`);
    return mesh;
  }

  /**
   * Create icosahedron container for complex hierarchical data
   */
  createIcosahedron(position?: THREE.Vector4): THREE.Mesh {
    const id = this.generatePolyhedronId('icosahedron');
    const geometry = this.getIcosahedronGeometry();
    const material = this.materialLibrary.get('icosahedron')!;
    const mesh = new THREE.Mesh(geometry, material);
    
    if (position) {
      mesh.position.set(position.x, position.y, position.z);
    }
    
    mesh.name = id;
    
    // Create container data structure
    const container: PolyhedronContainer = {
      id,
      type: 'icosahedron',
      mesh,
      faces: this.createIcosahedronFaces(geometry),
      capacity: this.ICOSAHEDRON_CAPACITY,
      utilization: 0,
      data: new Map(),
      relationships: [],
      transformationHistory: [],
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };
    
    this.containers.set(id, container);
    
    console.log(`🔷 Created icosahedron container: ${id}`);
    return mesh;
  }

  /**
   * Create polyhedron of specified type
   */
  createPolyhedron(type: 'tetrahedron' | 'octahedron' | 'icosahedron', position?: THREE.Vector4): THREE.Mesh {
    switch (type) {
      case 'tetrahedron':
        return this.createTetrahedron(position);
      case 'octahedron':
        return this.createOctahedron(position);
      case 'icosahedron':
        return this.createIcosahedron(position);
      default:
        throw new Error(`Unknown polyhedron type: ${type}`);
    }
  }

  /**
   * Store data in polyhedron container
   */
  storeData(containerId: string, dataKey: string, data: any): boolean {
    const container = this.containers.get(containerId);
    if (!container) return false;
    
    // Check capacity
    if (container.data.size >= container.capacity) {
      console.warn(`Container ${containerId} at capacity`);
      return false;
    }
    
    // Find optimal face for data storage
    const optimalFace = this.findOptimalFace(container, data);
    if (!optimalFace) return false;
    
    // Create data slot
    const dataSlot: DataSlot = {
      id: this.generateDataSlotId(),
      position: this.calculateDataSlotPosition(optimalFace),
      data,
      dataType: typeof data,
      size: this.calculateDataSize(data),
      locked: false
    };
    
    // Store data
    container.data.set(dataKey, dataSlot);
    optimalFace.dataSlots.push(dataSlot);
    
    // Update utilization
    container.utilization = container.data.size / container.capacity;
    container.lastAccessed = Date.now();
    
    // Update visual representation
    this.updateContainerVisualization(container);
    
    return true;
  }

  /**
   * Retrieve data from polyhedron container
   */
  retrieveData(containerId: string, dataKey: string): any {
    const container = this.containers.get(containerId);
    if (!container) return null;
    
    const dataSlot = container.data.get(dataKey);
    if (!dataSlot) return null;
    
    container.lastAccessed = Date.now();
    return dataSlot.data;
  }

  /**
   * Remove data from polyhedron container
   */
  removeData(containerId: string, dataKey: string): boolean {
    const container = this.containers.get(containerId);
    if (!container) return false;
    
    const dataSlot = container.data.get(dataKey);
    if (!dataSlot) return false;
    
    // Remove from face
    for (const face of container.faces) {
      const slotIndex = face.dataSlots.findIndex(slot => slot.id === dataSlot.id);
      if (slotIndex !== -1) {
        face.dataSlots.splice(slotIndex, 1);
        break;
      }
    }
    
    // Remove from container
    container.data.delete(dataKey);
    container.utilization = container.data.size / container.capacity;
    container.lastAccessed = Date.now();
    
    // Update visual representation
    this.updateContainerVisualization(container);
    
    return true;
  }

  /**
   * Create polyhedron assembly for complex data organization
   */
  createAssembly(containerIds: string[], assemblyType: 'nested' | 'adjacent' | 'hierarchical'): string {
    const assemblyId = this.generateAssemblyId();
    
    // Validate containers exist
    const validContainers = containerIds.filter(id => this.containers.has(id));
    if (validContainers.length === 0) {
      throw new Error('No valid containers provided for assembly');
    }
    
    // Calculate assembly properties
    let totalCapacity = 0;
    let totalUtilization = 0;
    
    for (const containerId of validContainers) {
      const container = this.containers.get(containerId)!;
      totalCapacity += container.capacity;
      totalUtilization += container.utilization * container.capacity;
    }
    
    totalUtilization = totalUtilization / totalCapacity;
    
    // Create assembly
    const assembly: PolyhedronAssembly = {
      id: assemblyId,
      containers: validContainers,
      assemblyType,
      transformationMatrix: new THREE.Matrix4(),
      totalCapacity,
      totalUtilization
    };
    
    this.assemblies.set(assemblyId, assembly);
    
    // Apply assembly transformation
    this.applyAssemblyTransformation(assembly);
    
    console.log(`🔗 Created ${assemblyType} assembly: ${assemblyId} with ${validContainers.length} containers`);
    return assemblyId;
  }

  /**
   * Disassemble polyhedron assembly
   */
  disassembleAssembly(assemblyId: string): boolean {
    const assembly = this.assemblies.get(assemblyId);
    if (!assembly) return false;
    
    // Reset container transformations
    for (const containerId of assembly.containers) {
      const container = this.containers.get(containerId);
      if (container) {
        container.mesh.matrix.identity();
        container.mesh.updateMatrix();
      }
    }
    
    this.assemblies.delete(assemblyId);
    console.log(`🔓 Disassembled assembly: ${assemblyId}`);
    return true;
  }

  /**
   * Transform polyhedron for data migration
   */
  transformPolyhedron(containerId: string, transformation: THREE.Matrix4): boolean {
    const container = this.containers.get(containerId);
    if (!container) return false;
    
    // Apply transformation
    container.mesh.applyMatrix4(transformation);
    container.transformationHistory.push(transformation.clone());
    
    // Update face positions
    this.updateFacePositions(container);
    
    console.log(`🔄 Transformed container: ${containerId}`);
    return true;
  }

  // Private helper methods
  
  private initializeMaterials(): void {
    // Tetrahedron material (simple data)
    this.materialLibrary.set('tetrahedron', new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.7,
      wireframe: false
    }));
    
    // Octahedron material (medium complexity)
    this.materialLibrary.set('octahedron', new THREE.MeshPhongMaterial({
      color: 0x0080ff,
      transparent: true,
      opacity: 0.7,
      wireframe: false
    }));
    
    // Icosahedron material (complex data)
    this.materialLibrary.set('icosahedron', new THREE.MeshPhongMaterial({
      color: 0xff8000,
      transparent: true,
      opacity: 0.7,
      wireframe: false
    }));
  }

  private initializeGeometries(): void {
    // Cache geometries for performance
    this.geometryCache.set('tetrahedron', new THREE.TetrahedronGeometry(1));
    this.geometryCache.set('octahedron', new THREE.OctahedronGeometry(1));
    this.geometryCache.set('icosahedron', new THREE.IcosahedronGeometry(1));
  }

  private getTetrahedronGeometry(): THREE.BufferGeometry {
    return this.geometryCache.get('tetrahedron')!.clone();
  }

  private getOctahedronGeometry(): THREE.BufferGeometry {
    return this.geometryCache.get('octahedron')!.clone();
  }

  private getIcosahedronGeometry(): THREE.BufferGeometry {
    return this.geometryCache.get('icosahedron')!.clone();
  }

  private createTetrahedronFaces(geometry: THREE.BufferGeometry): PolyhedronFace[] {
    return this.createFacesFromGeometry(geometry, 4);
  }

  private createOctahedronFaces(geometry: THREE.BufferGeometry): PolyhedronFace[] {
    return this.createFacesFromGeometry(geometry, 8);
  }

  private createIcosahedronFaces(geometry: THREE.BufferGeometry): PolyhedronFace[] {
    return this.createFacesFromGeometry(geometry, 20);
  }

  private createFacesFromGeometry(geometry: THREE.BufferGeometry, faceCount: number): PolyhedronFace[] {
    const faces: PolyhedronFace[] = [];
    const positions = geometry.attributes.position.array;
    const indices = geometry.index?.array || [];
    
    for (let i = 0; i < faceCount; i++) {
      const faceId = `face_${i}`;
      
      // Get triangle vertices for this face
      const vertexIndices = [
        indices[i * 3],
        indices[i * 3 + 1],
        indices[i * 3 + 2]
      ];
      
      const vertices = vertexIndices.map(index => new THREE.Vector3(
        positions[index * 3],
        positions[index * 3 + 1],
        positions[index * 3 + 2]
      ));
      
      // Calculate face normal and area
      const normal = this.calculateFaceNormal(vertices);
      const area = this.calculateFaceArea(vertices);
      
      faces.push({
        id: faceId,
        vertices,
        normal,
        area,
        dataSlots: [],
        adjacentFaces: []
      });
    }
    
    return faces;
  }

  private calculateFaceNormal(vertices: THREE.Vector3[]): THREE.Vector3 {
    const v1 = vertices[1].clone().sub(vertices[0]);
    const v2 = vertices[2].clone().sub(vertices[0]);
    return v1.cross(v2).normalize();
  }

  private calculateFaceArea(vertices: THREE.Vector3[]): number {
    const v1 = vertices[1].clone().sub(vertices[0]);
    const v2 = vertices[2].clone().sub(vertices[0]);
    return v1.cross(v2).length() / 2;
  }

  private findOptimalFace(container: PolyhedronContainer, data: any): PolyhedronFace | null {
    // Find face with least utilization and sufficient space
    let bestFace: PolyhedronFace | null = null;
    let bestScore = -1;
    
    for (const face of container.faces) {
      const utilization = face.dataSlots.length / (face.area * 10); // Rough capacity estimate
      const score = (1 - utilization) * face.area;
      
      if (score > bestScore && utilization < 0.8) {
        bestScore = score;
        bestFace = face;
      }
    }
    
    return bestFace;
  }

  private calculateDataSlotPosition(face: PolyhedronFace): THREE.Vector3 {
    // Calculate centroid of face for data slot position
    const centroid = new THREE.Vector3();
    face.vertices.forEach(vertex => centroid.add(vertex));
    return centroid.divideScalar(face.vertices.length);
  }

  private calculateDataSize(data: any): number {
    return JSON.stringify(data).length;
  }

  private updateContainerVisualization(container: PolyhedronContainer): void {
    // Update material opacity based on utilization
    const material = container.mesh.material as THREE.MeshPhongMaterial;
    material.opacity = 0.3 + (container.utilization * 0.7);
    
    // Update color intensity based on data activity
    const intensity = Math.min(1, container.utilization * 2);
    material.emissive.setScalar(intensity * 0.1);
  }

  private updateFacePositions(container: PolyhedronContainer): void {
    // Update face vertex positions after transformation
    const worldMatrix = container.mesh.matrixWorld;
    
    for (const face of container.faces) {
      face.vertices.forEach(vertex => {
        vertex.applyMatrix4(worldMatrix);
      });
      
      // Recalculate normal and area
      face.normal = this.calculateFaceNormal(face.vertices);
      face.area = this.calculateFaceArea(face.vertices);
    }
  }

  private applyAssemblyTransformation(assembly: PolyhedronAssembly): void {
    const containers = assembly.containers.map(id => this.containers.get(id)!);
    
    switch (assembly.assemblyType) {
      case 'nested':
        this.applyNestedTransformation(containers);
        break;
      case 'adjacent':
        this.applyAdjacentTransformation(containers);
        break;
      case 'hierarchical':
        this.applyHierarchicalTransformation(containers);
        break;
    }
  }

  private applyNestedTransformation(containers: PolyhedronContainer[]): void {
    // Arrange containers in nested configuration
    for (let i = 1; i < containers.length; i++) {
      const scale = 1 - (i * 0.2);
      containers[i].mesh.scale.setScalar(scale);
    }
  }

  private applyAdjacentTransformation(containers: PolyhedronContainer[]): void {
    // Arrange containers side by side
    containers.forEach((container, index) => {
      container.mesh.position.x = index * 3;
    });
  }

  private applyHierarchicalTransformation(containers: PolyhedronContainer[]): void {
    // Arrange containers in hierarchical tree structure
    containers.forEach((container, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const positionInLevel = index - (Math.pow(2, level) - 1);
      
      container.mesh.position.x = (positionInLevel - Math.pow(2, level - 1)) * 4;
      container.mesh.position.y = -level * 3;
    });
  }

  // Utility methods
  
  private generatePolyhedronId(type: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${type}_${timestamp}_${random}`;
  }

  private generateAssemblyId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `assembly_${timestamp}_${random}`;
  }

  private generateDataSlotId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `slot_${timestamp}_${random}`;
  }

  // Public API methods
  
  getContainer(id: string): PolyhedronContainer | undefined {
    return this.containers.get(id);
  }

  getAllContainers(): PolyhedronContainer[] {
    return Array.from(this.containers.values());
  }

  getAssembly(id: string): PolyhedronAssembly | undefined {
    return this.assemblies.get(id);
  }

  getAllAssemblies(): PolyhedronAssembly[] {
    return Array.from(this.assemblies.values());
  }

  getEngineStats(): any {
    const totalContainers = this.containers.size;
    const totalAssemblies = this.assemblies.size;
    const totalCapacity = Array.from(this.containers.values()).reduce((sum, c) => sum + c.capacity, 0);
    const totalUtilization = Array.from(this.containers.values()).reduce((sum, c) => sum + c.utilization, 0) / totalContainers;
    
    return {
      totalContainers,
      totalAssemblies,
      totalCapacity,
      averageUtilization: totalUtilization,
      containerTypes: {
        tetrahedrons: Array.from(this.containers.values()).filter(c => c.type === 'tetrahedron').length,
        octahedrons: Array.from(this.containers.values()).filter(c => c.type === 'octahedron').length,
        icosahedrons: Array.from(this.containers.values()).filter(c => c.type === 'icosahedron').length
      }
    };
  }
}
