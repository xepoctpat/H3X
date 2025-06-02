import { ThreeRenderer } from './three-renderer.ts';
import { CanvasRenderer } from './canvas-renderer.ts';
import { dataIntegration } from '../utils/data-integration.ts';
import { performanceMonitor } from '../utils/performance-monitor.ts';
import type { 
  H3XVisualizationConfig, 
  H3XNode, 
  H3XTriad, 
  VisualizationRenderer 
} from '../types/h3x.ts';

/**
 * Visualization manager that automatically selects the best renderer
 * Falls back to Canvas 2D if WebGL is not available
 */
export class VisualizationManager {
  private renderer: VisualizationRenderer | null = null;
  private container: HTMLElement;
  private config: H3XVisualizationConfig;
  private isWebGLSupported: boolean = false;
  private fallbackMessage: HTMLElement | null = null;
  
  // Performance monitoring
  private performanceStats = {
    frameCount: 0,
    lastFrameTime: 0,
    averageFPS: 60
  };
  
  constructor(container: HTMLElement, config: H3XVisualizationConfig = {}) {
    this.container = container;
    this.config = config;
    
    this.detectWebGLSupport();
    this.initialize();
  }
  
  private detectWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      this.isWebGLSupported = !!gl;
      return this.isWebGLSupported;
    } catch (e) {
      this.isWebGLSupported = false;
      return false;
    }
  }
    private initialize(): void {
    this.showLoadingMessage();
    
    try {
      if (this.isWebGLSupported && !this.config.forceCanvas) {
        console.log('H3X Visualization: Initializing Three.js renderer');
        this.renderer = new ThreeRenderer(this.container, this.config);
      } else {
        console.log('H3X Visualization: Initializing Canvas 2D renderer');
        this.renderer = new CanvasRenderer(this.container, this.config);
        this.showFallbackMessage();
      }
      
      this.hideLoadingMessage();
      this.setupEventListeners();
      this.setupDataIntegration();
      
    } catch (error) {
      console.error('H3X Visualization: Failed to initialize renderer:', error);
      this.showErrorMessage(error as Error);
    }
  }

  private setupDataIntegration(): void {
    // Subscribe to data updates
    dataIntegration.onUpdate('nodes', (event) => {
      if (this.renderer) {
        this.renderer.updateNodes(event.data);
      }
    });

    dataIntegration.onUpdate('triads', (event) => {
      if (this.renderer) {
        this.renderer.updateTriads(event.data);
      }
    });

    // Set up performance monitoring
    performanceMonitor.onMetricsUpdate((metrics) => {
      if (this.renderer && 'recordPerformanceMetrics' in this.renderer) {
        (this.renderer as any).recordPerformanceMetrics(metrics);
      }
    });

    // Load initial data
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    try {
      const nodes = dataIntegration.getNodes();
      const triads = dataIntegration.getTriads();

      if (nodes.length === 0) {
        // No data available, generate sample data for demonstration
        console.log('H3X Visualization: No data available, generating sample data');
        dataIntegration.populateSampleData();
      } else {
        // Load existing data
        if (this.renderer) {
          this.renderer.updateNodes(nodes);
          this.renderer.updateTriads(triads);
        }
      }
    } catch (error) {
      console.error('H3X Visualization: Failed to load initial data:', error);
    }
  }
  
  private showLoadingMessage(): void {
    const loading = document.createElement('div');
    loading.className = 'h3x-loading';
    loading.innerHTML = `
      <div class="h3x-loading__spinner"></div>
      <div class="h3x-loading__text">Initializing H3X Visualization...</div>
    `;
    this.container.appendChild(loading);
    this.fallbackMessage = loading;
  }
  
  private hideLoadingMessage(): void {
    if (this.fallbackMessage && this.container.contains(this.fallbackMessage)) {
      this.container.removeChild(this.fallbackMessage);
      this.fallbackMessage = null;
    }
  }
  
  private showFallbackMessage(): void {
    this.hideLoadingMessage();
    
    const message = document.createElement('div');
    message.className = 'h3x-fallback-message';
    message.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255, 170, 0, 0.9);
      color: #000;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
      max-width: 200px;
    `;
    message.textContent = 'WebGL not available - using 2D Canvas fallback';
    this.container.appendChild(message);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (this.container.contains(message)) {
        this.container.removeChild(message);
      }
    }, 5000);
  }
  
  private showErrorMessage(error: Error): void {
    this.hideLoadingMessage();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'h3x-error-message';
    errorDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 68, 68, 0.9);
      color: #fff;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      z-index: 1000;
      max-width: 80%;
    `;
    errorDiv.innerHTML = `
      <h3>Visualization Error</h3>
      <p>Failed to initialize H3X visualization:</p>
      <code>${error.message}</code>
      <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px;">Reload</button>
    `;
    this.container.appendChild(errorDiv);
  }
  
  private setupEventListeners(): void {
    // Listen to renderer events
    this.container.addEventListener('nodeSelected', (event) => {
      console.log('Node selected:', (event as CustomEvent).detail);
    });
    
    this.container.addEventListener('nodeDeselected', () => {
      console.log('Node deselected');
    });
    
    // Monitor performance
    if (this.config.enableAnimation) {
      this.startPerformanceMonitoring();
    }
  }
  
  private startPerformanceMonitoring(): void {
    const monitor = () => {
      const now = performance.now();
      if (this.performanceStats.lastFrameTime > 0) {
        const frameTime = now - this.performanceStats.lastFrameTime;
        const fps = 1000 / frameTime;
        
        // Running average
        this.performanceStats.averageFPS = 
          this.performanceStats.averageFPS * 0.9 + fps * 0.1;
        
        this.performanceStats.frameCount++;
        
        // Adjust quality if performance is poor
        if (this.performanceStats.frameCount % 60 === 0) {
          if (this.performanceStats.averageFPS < 30) {
            this.adjustQuality('down');
          } else if (this.performanceStats.averageFPS > 55) {
            this.adjustQuality('up');
          }
        }
      }
      this.performanceStats.lastFrameTime = now;
      
      if (this.config.enableAnimation) {
        requestAnimationFrame(monitor);
      }
    };
    
    monitor();
  }
  
  private adjustQuality(direction: 'up' | 'down'): void {
    // This could adjust various quality settings based on performance
    console.log(`H3X Visualization: Adjusting quality ${direction} (FPS: ${this.performanceStats.averageFPS.toFixed(1)})`);
  }
  
  // Public API methods
  public addNode(node: H3XNode): void {
    if (this.renderer) {
      this.renderer.addNode(node);
    }
  }
  
  public removeNode(nodeId: string): void {
    if (this.renderer) {
      this.renderer.removeNode(nodeId);
    }
  }
  
  public updateNode(node: H3XNode): void {
    if (this.renderer) {
      this.renderer.updateNode(node);
    }
  }
  
  public addTriad(triad: H3XTriad): void {
    if (this.renderer) {
      this.renderer.addTriad(triad);
    }
  }
  
  public removeTriad(triadId: string): void {
    if (this.renderer) {
      this.renderer.removeTriad(triadId);
    }
  }
  
  public clear(): void {
    if (this.renderer) {
      this.renderer.clear();
    }
  }
  
  public render(): void {
    if (this.renderer) {
      this.renderer.render();
    }
  }
  
  public animate(): void {
    if (this.renderer) {
      this.renderer.animate();
    }
  }
  
  public stopAnimation(): void {
    if (this.renderer) {
      this.renderer.stopAnimation();
    }
  }
  
  public resize(): void {
    if (this.renderer) {
      this.renderer.resize();
    }
  }
  
  public setCamera(position: [number, number, number], target?: [number, number, number]): void {
    if (this.renderer) {
      this.renderer.setCamera(position, target);
    }
  }
  
  public getStats(): { nodes: number; triads: number; fps: number; renderer: string } {
    const baseStats = this.renderer?.getStats() || { nodes: 0, triads: 0, fps: 0 };
    return {
      ...baseStats,
      fps: this.performanceStats.averageFPS,
      renderer: this.isWebGLSupported ? 'WebGL (Three.js)' : 'Canvas 2D'
    };
  }
  
  public getRenderer(): VisualizationRenderer | null {
    return this.renderer;
  }
  
  public isUsingWebGL(): boolean {
    return this.isWebGLSupported && this.renderer instanceof ThreeRenderer;
  }
  
  public switchRenderer(forceCanvas: boolean = false): void {
    const oldRenderer = this.renderer;
    
    // Store current state
    const nodes = new Map<string, H3XNode>();
    const triads = new Map<string, H3XTriad>();
    
    // Note: In a real implementation, we'd need to extract data from the current renderer
    
    // Dispose old renderer
    if (oldRenderer) {
      oldRenderer.dispose();
    }
    
    // Create new renderer
    this.config.forceCanvas = forceCanvas;
    this.initialize();
    
    // Restore state
    for (const [nodeId, node] of nodes) {
      this.addNode(node);
    }
    for (const [triadId, triad] of triads) {
      this.addTriad(triad);
    }
  }
  
  public exportState(): { nodes: H3XNode[]; triads: H3XTriad[] } {
    // This would extract the current visualization state
    // Implementation depends on how we store data in renderers
    return { nodes: [], triads: [] };
  }
  
  public importState(data: { nodes: H3XNode[]; triads: H3XTriad[] }): void {
    this.clear();
    
    for (const node of data.nodes) {
      this.addNode(node);
    }
    
    for (const triad of data.triads) {
      this.addTriad(triad);
    }
  }
  
  public dispose(): void {
    this.stopAnimation();
    
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    
    this.hideLoadingMessage();
  }
}

// Factory function for easy initialization
export function createVisualization(
  container: HTMLElement | string, 
  config: H3XVisualizationConfig = {}
): VisualizationManager {
  const element = typeof container === 'string' 
    ? document.getElementById(container) || document.querySelector(container)
    : container;
    
  if (!element) {
    throw new Error('H3X Visualization: Container element not found');
  }
  
  return new VisualizationManager(element as HTMLElement, config);
}
