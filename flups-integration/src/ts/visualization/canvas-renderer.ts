import type { 
  H3XVisualizationConfig, 
  H3XNode, 
  H3XTriad, 
  VisualizationRenderer 
} from '@/types/h3x';

/**
 * Canvas 2D fallback renderer for H3X hexagonal structures
 * Provides 2D visualization when WebGL is not available
 */
export class CanvasRenderer implements VisualizationRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement;
  private animationId: number | null = null;
  
  // Data storage
  private nodes: Map<string, H3XNode> = new Map();
  private triads: Map<string, H3XTriad> = new Map();
  
  // Interaction state
  private mouse = { x: 0, y: 0 };
  private selectedNodeId: string | null = null;
  private hoveredNodeId: string | null = null;
  private camera = { x: 0, y: 0, zoom: 1 };
  private isDragging = false;
  private lastMousePos = { x: 0, y: 0 };
  
  // Configuration
  private config: H3XVisualizationConfig;
  private isInitialized = false;
  
  constructor(container: HTMLElement, config: H3XVisualizationConfig) {
    this.container = container;
    this.config = { 
      ...this.getDefaultConfig(), 
      ...config 
    };
    
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    
    this.initialize();
  }
  
  private getDefaultConfig(): H3XVisualizationConfig {
    return {
      backgroundColor: 0x0a0a0a,
      cameraPosition: [0, 0, 10],
      enableControls: true,
      enableAnimation: true,
      hexagonRadius: 30,
      hexagonHeight: 0.2,
      triadLineWidth: 2,
      ambientLightIntensity: 0.4,
      directionalLightIntensity: 0.6,
      performance: {
        maxNodes: 500,
        enableShadows: false,
        enablePostProcessing: false
      }
    };
  }
  
  private initialize(): void {
    this.setupCanvas();
    this.setupEventListeners();
    this.resize();
    this.isInitialized = true;
  }
  
  private setupCanvas(): void {
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.cursor = 'pointer';
    
    this.container.appendChild(this.canvas);
  }
  
  private setupEventListeners(): void {
    window.addEventListener('resize', this.resize.bind(this));
    
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('click', this.onClick.bind(this));
    this.canvas.addEventListener('wheel', this.onWheel.bind(this));
  }
  
  private onMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
    
    if (this.isDragging) {
      const dx = this.mouse.x - this.lastMousePos.x;
      const dy = this.mouse.y - this.lastMousePos.y;
      
      this.camera.x += dx / this.camera.zoom;
      this.camera.y += dy / this.camera.zoom;
    }
    
    this.lastMousePos = { ...this.mouse };
    this.updateHover();
  }
  
  private onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.lastMousePos = { ...this.mouse };
  }
  
  private onMouseUp(event: MouseEvent): void {
    this.isDragging = false;
  }
  
  private onClick(event: MouseEvent): void {
    if (this.isDragging) return;
    
    const worldPos = this.screenToWorld(this.mouse.x, this.mouse.y);
    const nodeId = this.getNodeAtPosition(worldPos.x, worldPos.y);
    
    if (nodeId) {
      this.selectNode(nodeId);
    } else {
      this.deselectNode();
    }
  }
  
  private onWheel(event: WheelEvent): void {
    event.preventDefault();
    
    const zoomSpeed = 0.1;
    const zoomFactor = event.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
    
    this.camera.zoom = Math.max(0.1, Math.min(5, this.camera.zoom * zoomFactor));
  }
  
  private updateHover(): void {
    const worldPos = this.screenToWorld(this.mouse.x, this.mouse.y);
    const nodeId = this.getNodeAtPosition(worldPos.x, worldPos.y);
    
    if (nodeId !== this.hoveredNodeId) {
      this.hoveredNodeId = nodeId;
      this.canvas.style.cursor = nodeId ? 'pointer' : 'default';
    }
  }
  
  private screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    return {
      x: (screenX - centerX) / this.camera.zoom + this.camera.x,
      y: (screenY - centerY) / this.camera.zoom + this.camera.y
    };
  }
  
  private worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    return {
      x: (worldX - this.camera.x) * this.camera.zoom + centerX,
      y: (worldY - this.camera.y) * this.camera.zoom + centerY
    };
  }
    private getNodeAtPosition(x: number, y: number): string | null {
    const radius = this.config.hexagonRadius || 20; // Default radius if undefined
    
    for (const [nodeId, node] of this.nodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= radius) {
        return nodeId;
      }
    }
    
    return null;
  }
  
  private selectNode(nodeId: string): void {
    if (this.selectedNodeId === nodeId) return;
    
    this.selectedNodeId = nodeId;
    const node = this.nodes.get(nodeId);
    
    if (node) {
      const event = new CustomEvent('nodeSelected', {
        detail: { 
          nodeId: nodeId,
          position: [node.x, node.y, node.z || 0],
          data: node 
        }
      });
      this.container.dispatchEvent(event);
    }
  }
  
  private deselectNode(): void {
    if (this.selectedNodeId) {
      this.selectedNodeId = null;
      
      const event = new CustomEvent('nodeDeselected');
      this.container.dispatchEvent(event);
    }
  }
  
  private drawHexagon(x: number, y: number, radius: number, color: string, isSelected: boolean = false, isHovered: boolean = false): void {
    const screenPos = this.worldToScreen(x, y);
    const scaledRadius = radius * this.camera.zoom;
    
    this.ctx.save();
    this.ctx.translate(screenPos.x, screenPos.y);
    
    // Draw hexagon
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = Math.cos(angle) * scaledRadius;
      const hy = Math.sin(angle) * scaledRadius;
      
      if (i === 0) {
        this.ctx.moveTo(hx, hy);
      } else {
        this.ctx.lineTo(hx, hy);
      }
    }
    this.ctx.closePath();
    
    // Fill
    this.ctx.fillStyle = color;
    if (isSelected) {
      this.ctx.globalAlpha = 1.0;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 20;
    } else if (isHovered) {
      this.ctx.globalAlpha = 0.9;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 10;
    } else {
      this.ctx.globalAlpha = 0.7;
    }
    this.ctx.fill();
    
    // Stroke
    this.ctx.globalAlpha = 1.0;
    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = isSelected ? '#00ff88' : (isHovered ? '#88ffaa' : '#0088ff');
    this.ctx.lineWidth = isSelected ? 3 : (isHovered ? 2 : 1);
    this.ctx.stroke();
    
    this.ctx.restore();
  }
  
  private drawLine(x1: number, y1: number, x2: number, y2: number, color: string, width: number): void {
    const start = this.worldToScreen(x1, y1);
    const end = this.worldToScreen(x2, y2);
    
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.globalAlpha = 0.6;
    this.ctx.stroke();
    this.ctx.restore();
  }
  
  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // Draw background
    const bgColor = `#${(this.config.backgroundColor || 0x0a0a0a).toString(16).padStart(6, '0')}`;
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  public addNode(node: H3XNode): void {
    this.nodes.set(node.id, { ...node });
  }
  
  public removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    
    if (this.selectedNodeId === nodeId) {
      this.selectedNodeId = null;
    }
    if (this.hoveredNodeId === nodeId) {
      this.hoveredNodeId = null;
    }
  }
  
  public updateNode(node: H3XNode): void {
    if (this.nodes.has(node.id)) {
      this.nodes.set(node.id, { ...node });
    }
  }
  
  public updateNodes(nodes: H3XNode[]): void {
    nodes.forEach(node => this.updateNode(node));
  }
  
  public addTriad(triad: H3XTriad): void {
    this.triads.set(triad.id, { ...triad });
  }

  public removeTriad(triadId: string): void {
    this.triads.delete(triadId);
  }
  
  public updateTriads(triads: H3XTriad[]): void {
    triads.forEach(triad => {
      if (this.triads.has(triad.id)) {
        this.triads.set(triad.id, { ...triad });
      }
    });
  }
  
  public clear(): void {
    this.nodes.clear();
    this.triads.clear();
    this.selectedNodeId = null;
    this.hoveredNodeId = null;
  }
  
  public render(): void {
    if (!this.isInitialized) return;
    
    this.clearCanvas();
    
    // Draw triads (lines) first
    for (const triad of this.triads.values()) {
      const color = `#${(triad.color || 0x0088ff).toString(16).padStart(6, '0')}`;
        for (let i = 0; i < triad.nodeIds.length - 1; i++) {
        const nodeId1 = triad.nodeIds[i];
        const nodeId2 = triad.nodeIds[i + 1];
        
        if (nodeId1 && nodeId2) {
          const node1 = this.nodes.get(nodeId1);
          const node2 = this.nodes.get(nodeId2);
        
          if (node1 && node2) {
            this.drawLine(
              node1.x, node1.y,
              node2.x, node2.y,
              color,
              (this.config.triadLineWidth || 2)
            );
          }
        }
      }
    }
    
    // Draw nodes (hexagons) on top
    for (const [nodeId, node] of this.nodes) {
      const color = `#${(node.color || 0x00ff88).toString(16).padStart(6, '0')}`;
      const isSelected = nodeId === this.selectedNodeId;
      const isHovered = nodeId === this.hoveredNodeId;
        this.drawHexagon(
        node.x, node.y,
        (this.config.hexagonRadius || 20),
        color,
        isSelected,
        isHovered
      );
    }
    
    // Draw debug info
    this.drawDebugInfo();
  }
  
  private drawDebugInfo(): void {
    this.ctx.save();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px monospace';
    this.ctx.globalAlpha = 0.8;
    
    const info = [
      `Nodes: ${this.nodes.size}`,
      `Triads: ${this.triads.size}`,
      `Zoom: ${this.camera.zoom.toFixed(2)}`,
      `Camera: (${this.camera.x.toFixed(0)}, ${this.camera.y.toFixed(0)})`
    ];
      for (let i = 0; i < info.length; i++) {
      const text = info[i];
      if (text) {
        this.ctx.fillText(text, 10, 20 + i * 16);
      }
    }
    
    this.ctx.restore();
  }
  
  public animate(): void {
    if (!this.config.enableAnimation) {
      this.render();
      return;
    }
    
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
  
  public stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  public resize(): void {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    this.ctx.scale(dpr, dpr);
  }
  
  public setCamera(position: [number, number, number], target?: [number, number, number]): void {
    this.camera.x = position[0];
    this.camera.y = position[1];
    this.camera.zoom = position[2] / 10; // Convert Z to zoom
  }
  
  public getStats(): { nodes: number; triads: number; fps: number } {
    return {
      nodes: this.nodes.size,
      triads: this.triads.size,
      fps: 60 // Would need frame counting for actual FPS
    };
  }
  
  public dispose(): void {
    this.stopAnimation();
    
    this.clear();
    
    // Remove event listeners
    window.removeEventListener('resize', this.resize.bind(this));
    
    // Remove from DOM
    if (this.container.contains(this.canvas)) {
      this.container.removeChild(this.canvas);
    }
    
    this.isInitialized = false;
  }
}
