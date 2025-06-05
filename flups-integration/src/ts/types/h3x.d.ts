// H3X Type Definitions

export interface H3XSystemStatus {
  merger: 'online' | 'offline' | 'unknown';
  ui: 'online' | 'offline' | 'unknown';
  logs: 'available' | 'empty' | 'unknown';
}

export interface H3XMetrics {
  cflupCount: number;
  amendmentCount: number;
  archiveCount: number;
  uptime: number;
}

export interface H3XNode {
  id: string;
  x: number;
  y: number;
  z?: number;
  color?: number;
  radius?: number;
  visible?: boolean;
  data?: any;
}

export interface H3XRotation {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface H3XLogEntry {
  timestamp: string;
  message: string;
}

export interface H3XCommandResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Browser Memory Info interface (for performance monitoring)
export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Performance metrics for the visualization system
export interface H3XPerformanceMetrics {
  fps: number;
  frameTime: number;
  memory: MemoryInfo;
  apiLatency: number;
  wsLatency: number;
  renderTime: number;
  updateTime: number;
}

// WebSocket connection status
export interface H3XWebSocketStatus {
  connected: boolean;
  reconnecting: boolean;
  url: string;
  lastPing: number;
  latency: number;
}

// API client configuration
export interface H3XApiClientOptions {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCaching: boolean;
  enableBatching: boolean;
}

// Triad connection for H3X structures
export interface H3XTriad {
  id: string;
  nodeIds: string[];
  color?: number;
  width?: number;
  visible?: boolean;
  strength?: number;
  type?: string;
  data?: any;
}

// Visualization configuration
export interface H3XVisualizationConfig {
  backgroundColor?: number;
  cameraPosition?: [number, number, number];
  enableControls?: boolean;
  enableAnimation?: boolean;
  forceCanvas?: boolean;
  hexagonRadius?: number;
  hexagonHeight?: number;
  triadLineWidth?: number;
  ambientLightIntensity?: number;
  directionalLightIntensity?: number;
  performance?: {
    maxNodes?: number;
    enableShadows?: boolean;
    enablePostProcessing?: boolean;
  };
}

// Module interfaces
export interface IH3XModule {
  initialize?(): void;
  destroy?(): void;
}

export interface IH3XHexagonModule extends IH3XModule {
  nodes: H3XNode[];
  latticeOptimized: boolean;
  addNode(): void;
  optimize(): void;
}

export interface IH3XTriadModule extends IH3XModule {
  balanced: boolean;
  efficiency: number;
  balance(): void;
  enhance(): void;
}

export interface IH3XFourDModule extends IH3XModule {
  rotation: H3XRotation;
  projected: boolean;
  rotate(): void;
  project(): void;
}

export interface IH3XLogger extends IH3XModule {
  logs: H3XLogEntry[];
  add(message: string): void;
  clear(): void;
  export(): H3XLogEntry[];
}

// Visualization renderer interface
export interface VisualizationRenderer {
  addNode(node: H3XNode): void;
  removeNode(nodeId: string): void;
  updateNode(node: H3XNode): void;
  updateNodes(nodes: H3XNode[]): void;
  addTriad(triad: H3XTriad): void;
  removeTriad(triadId: string): void;
  updateTriads(triads: H3XTriad[]): void;
  clear(): void;
  render(): void;
  animate(): void;
  stopAnimation(): void;
  resize(): void;
  setCamera(position: [number, number, number], target?: [number, number, number]): void;
  getStats(): { nodes: number; triads: number; fps: number };
  dispose(): void;
}
