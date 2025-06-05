import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupGlobals } from './test-globals';

// Setup global test environment
beforeAll(() => {
  setupGlobals();
});

// Cleanup after each test
afterEach(() => {
  // Reset mocks after each test
  vi.clearAllMocks();
});

// Global test utilities
declare global {
  interface Window {
    h3xTestUtils: {
      mockWebSocket: () => void;
      mockCanvas: () => void;
      mockWebGL: () => void;
      resetMocks: () => void;
    };
  }
}

// Mock implementations for testing
const mockWebSocket = () => {
  class MockWebSocket extends EventTarget {
    readyState: number = 0; // WebSocket.CONNECTING
    url: string;

    constructor(url: string) {
      super();
      this.url = url;
      setTimeout(() => {
        this.readyState = 1; // WebSocket.OPEN
        this.dispatchEvent(new Event('open'));
      }, 0);
    }

    send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
      // Mock send implementation
    }

    close() {
      this.readyState = 3; // WebSocket.CLOSED
      this.dispatchEvent(new Event('close'));
    }
  }

  global.WebSocket = MockWebSocket as any;
};

const mockCanvas = () => {
  const mockContext = {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
    })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
  };
  HTMLCanvasElement.prototype.getContext = vi.fn((type: string) => {
    if (type === '2d') return mockContext as any; // Cast to any to avoid strict type checking
    if (type === 'webgl' || type === 'experimental-webgl') return mockWebGLContext();
    return null;
  }) as any;
};

const mockWebGLContext = () => ({
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  createProgram: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  useProgram: vi.fn(),
  createBuffer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  getAttribLocation: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  drawArrays: vi.fn(),
  viewport: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  getParameter: vi.fn(),
  getExtension: vi.fn(),
});

const mockWebGL = () => {
  HTMLCanvasElement.prototype.getContext = vi.fn((type: string) => {
    if (type === '2d') return {} as any;
    if (type === 'webgl' || type === 'experimental-webgl') return mockWebGLContext();
    return null;
  }) as any;
};

// Setup window utilities
if (typeof window !== 'undefined') {
  window.h3xTestUtils = {
    mockWebSocket,
    mockCanvas,
    mockWebGL,
    resetMocks: () => {
      vi.clearAllMocks();
    },
  };
}
