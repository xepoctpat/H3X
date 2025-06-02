import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VisualizationManager, createVisualization } from '@/visualization/visualization-manager';
import { ThreeRenderer } from '@/visualization/three-renderer';
import { CanvasRenderer } from '@/visualization/canvas-renderer';
import type { H3XNode, H3XTriad, H3XVisualizationConfig } from '@/types/h3x';

describe('VisualizationManager', () => {
  let container: HTMLElement;
  let manager: VisualizationManager;
  
  beforeEach(() => {
    // Setup test environment
    window.h3xTestUtils.mockWebGL();
    window.h3xTestUtils.mockCanvas();
    
    // Create container
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });
  
  afterEach(() => {
    if (manager) {
      manager.dispose();
    }
    
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    window.h3xTestUtils.resetMocks();
  });
  
  describe('Initialization', () => {
    it('should create a visualization manager', () => {
      manager = new VisualizationManager(container);
      expect(manager).toBeInstanceOf(VisualizationManager);
    });
    
    it('should detect WebGL support', () => {
      manager = new VisualizationManager(container);
      expect(manager.isUsingWebGL()).toBe(true);
    });
      it('should fallback to Canvas when WebGL is not available', () => {
      // Mock WebGL as unavailable
      HTMLCanvasElement.prototype.getContext = vi.fn((type: string) => {
        if (type === 'webgl' || type === 'experimental-webgl') return null;
        if (type === '2d') return {} as any;
        return null;
      }) as any;
      
      manager = new VisualizationManager(container);
      expect(manager.isUsingWebGL()).toBe(false);
    });
    
    it('should force Canvas renderer when specified', () => {
      const config: H3XVisualizationConfig = {
        forceCanvas: true
      };
      
      manager = new VisualizationManager(container, config);
      expect(manager.isUsingWebGL()).toBe(false);
    });
  });
  
  describe('Factory Function', () => {
    it('should create visualization from container element', () => {
      manager = createVisualization(container);
      expect(manager).toBeInstanceOf(VisualizationManager);
    });
    
    it('should create visualization from selector string', () => {
      container.id = 'test-container';
      manager = createVisualization('#test-container');
      expect(manager).toBeInstanceOf(VisualizationManager);
    });
    
    it('should throw error for invalid selector', () => {
      expect(() => {
        createVisualization('#non-existent');
      }).toThrow('Container element not found');
    });
  });
  
  describe('Node Management', () => {
    beforeEach(() => {
      manager = new VisualizationManager(container);
    });
    
    it('should add nodes', () => {
      const node: H3XNode = {
        id: 'node1',
        x: 0,
        y: 0,
        z: 0,
        color: 0x00ff88
      };
      
      expect(() => {
        manager.addNode(node);
      }).not.toThrow();
      
      const stats = manager.getStats();
      expect(stats.nodes).toBe(1);
    });
    
    it('should remove nodes', () => {
      const node: H3XNode = {
        id: 'node1',
        x: 0,
        y: 0
      };
      
      manager.addNode(node);
      manager.removeNode('node1');
      
      const stats = manager.getStats();
      expect(stats.nodes).toBe(0);
    });
    
    it('should update nodes', () => {
      const node: H3XNode = {
        id: 'node1',
        x: 0,
        y: 0
      };
      
      manager.addNode(node);
      
      const updatedNode: H3XNode = {
        id: 'node1',
        x: 5,
        y: 5,
        color: 0xff0000
      };
      
      expect(() => {
        manager.updateNode(updatedNode);
      }).not.toThrow();
    });
  });
  
  describe('Triad Management', () => {
    beforeEach(() => {
      manager = new VisualizationManager(container);
    });
    
    it('should add triads', () => {
      const triad: H3XTriad = {
        id: 'triad1',
        nodeIds: ['node1', 'node2', 'node3'],
        color: 0x0088ff
      };
      
      expect(() => {
        manager.addTriad(triad);
      }).not.toThrow();
      
      const stats = manager.getStats();
      expect(stats.triads).toBe(1);
    });
    
    it('should remove triads', () => {
      const triad: H3XTriad = {
        id: 'triad1',
        nodeIds: ['node1', 'node2']
      };
      
      manager.addTriad(triad);
      manager.removeTriad('triad1');
      
      const stats = manager.getStats();
      expect(stats.triads).toBe(0);
    });
  });
  
  describe('Rendering', () => {
    beforeEach(() => {
      manager = new VisualizationManager(container);
    });
    
    it('should render without errors', () => {
      expect(() => {
        manager.render();
      }).not.toThrow();
    });
    
    it('should start and stop animation', () => {
      expect(() => {
        manager.animate();
        manager.stopAnimation();
      }).not.toThrow();
    });
    
    it('should handle resize', () => {
      container.style.width = '1000px';
      container.style.height = '800px';
      
      expect(() => {
        manager.resize();
      }).not.toThrow();
    });
  });
  
  describe('Camera Control', () => {
    beforeEach(() => {
      manager = new VisualizationManager(container);
    });
    
    it('should set camera position', () => {
      expect(() => {
        manager.setCamera([10, 10, 10], [0, 0, 0]);
      }).not.toThrow();
    });
  });
  
  describe('Statistics', () => {
    beforeEach(() => {
      manager = new VisualizationManager(container);
    });
    
    it('should return valid statistics', () => {
      const stats = manager.getStats();
      
      expect(stats).toHaveProperty('nodes');
      expect(stats).toHaveProperty('triads');
      expect(stats).toHaveProperty('fps');
      expect(stats).toHaveProperty('renderer');
      
      expect(typeof stats.nodes).toBe('number');
      expect(typeof stats.triads).toBe('number');
      expect(typeof stats.fps).toBe('number');
      expect(typeof stats.renderer).toBe('string');
    });
  });
  
  describe('State Management', () => {
    beforeEach(() => {
      manager = new VisualizationManager(container);
    });
    
    it('should clear all data', () => {
      const node: H3XNode = { id: 'node1', x: 0, y: 0 };
      const triad: H3XTriad = { id: 'triad1', nodeIds: ['node1'] };
      
      manager.addNode(node);
      manager.addTriad(triad);
      manager.clear();
      
      const stats = manager.getStats();
      expect(stats.nodes).toBe(0);
      expect(stats.triads).toBe(0);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle renderer initialization errors gracefully', () => {
      // Mock a failing initialization
      const originalConsoleError = console.error;
      console.error = vi.fn();
      
      // Force an error by making the container invalid
      const invalidContainer = {} as HTMLElement;
      
      expect(() => {
        new VisualizationManager(invalidContainer);
      }).not.toThrow();
      
      console.error = originalConsoleError;
    });
  });
});

describe('ThreeRenderer', () => {
  let container: HTMLElement;
  let renderer: ThreeRenderer;
  
  beforeEach(() => {
    window.h3xTestUtils.mockWebGL();
    
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });
  
  afterEach(() => {
    if (renderer) {
      renderer.dispose();
    }
    
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    window.h3xTestUtils.resetMocks();
  });
  
  it('should initialize Three.js renderer', () => {
    const config = {
      backgroundColor: 0x000000,
      enableAnimation: false
    };
    
    expect(() => {
      renderer = new ThreeRenderer(container, config);
    }).not.toThrow();
  });
  
  it('should add and render hexagonal nodes', () => {
    renderer = new ThreeRenderer(container, {});
    
    const node: H3XNode = {
      id: 'hex1',
      x: 0,
      y: 0,
      z: 0,
      color: 0x00ff88
    };
    
    renderer.addNode(node);
    
    expect(() => {
      renderer.render();
    }).not.toThrow();
    
    const stats = renderer.getStats();
    expect(stats.nodes).toBe(1);
  });
});

describe('CanvasRenderer', () => {
  let container: HTMLElement;
  let renderer: CanvasRenderer;
  
  beforeEach(() => {
    window.h3xTestUtils.mockCanvas();
    
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });
  
  afterEach(() => {
    if (renderer) {
      renderer.dispose();
    }
    
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    window.h3xTestUtils.resetMocks();
  });
  
  it('should initialize Canvas 2D renderer', () => {
    const config = {
      backgroundColor: 0x000000,
      enableAnimation: false
    };
    
    expect(() => {
      renderer = new CanvasRenderer(container, config);
    }).not.toThrow();
  });
  
  it('should add and render hexagonal nodes', () => {
    renderer = new CanvasRenderer(container, {});
    
    const node: H3XNode = {
      id: 'hex1',
      x: 0,
      y: 0,
      color: 0x00ff88
    };
    
    renderer.addNode(node);
    
    expect(() => {
      renderer.render();
    }).not.toThrow();
    
    const stats = renderer.getStats();
    expect(stats.nodes).toBe(1);
  });
  
  it('should handle mouse interactions', () => {
    renderer = new CanvasRenderer(container, {});
    
    const canvas = container.querySelector('canvas')!;
    expect(canvas).toBeTruthy();
    
    // Simulate mouse events
    const mouseEvent = new MouseEvent('click', {
      bubbles: true,
      clientX: 100,
      clientY: 100
    });
    
    expect(() => {
      canvas.dispatchEvent(mouseEvent);
    }).not.toThrow();
  });
});
