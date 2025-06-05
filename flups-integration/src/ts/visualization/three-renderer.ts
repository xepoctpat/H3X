import * as THREE from 'three';
import type {
  H3XVisualizationConfig,
  H3XNode,
  H3XTriad,
  VisualizationRenderer,
} from '../types/h3x';

/**
 * Three.js-based 3D renderer for H3X hexagonal structures
 * Provides interactive 3D visualization with optimized performance
 */
export class ThreeRenderer implements VisualizationRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private animationId: number | null = null;

  // Scene objects
  private hexNodes: Map<string, THREE.Mesh> = new Map();
  private triadConnections: Map<string, THREE.Line> = new Map();
  private lights: THREE.Light[] = [];

  // Controls and interaction
  private mouse = new THREE.Vector2();
  private raycaster = new THREE.Raycaster();
  private selectedObject: THREE.Object3D | null = null;

  // Configuration
  private config: H3XVisualizationConfig;
  private isInitialized = false;

  constructor(container: HTMLElement, config: H3XVisualizationConfig) {
    this.container = container;
    this.config = {
      ...this.getDefaultConfig(),
      ...config,
    };

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.initialize();
  }

  private getDefaultConfig(): H3XVisualizationConfig {
    return {
      backgroundColor: 0x0a0a0a,
      cameraPosition: [0, 0, 10],
      enableControls: true,
      enableAnimation: true,
      hexagonRadius: 1,
      hexagonHeight: 0.2,
      triadLineWidth: 2,
      ambientLightIntensity: 0.4,
      directionalLightIntensity: 0.6,
      performance: {
        maxNodes: 1000,
        enableShadows: true,
        enablePostProcessing: false,
      },
    };
  }

  private initialize(): void {
    this.setupRenderer();
    this.setupCamera();
    this.setupLighting();
    this.setupEventListeners();
    this.resize();
    this.isInitialized = true;
  }

  private setupRenderer(): void {
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = this.config.performance?.enableShadows ?? true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(this.config.backgroundColor || 0x0a0a0a, 0.8);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);
  }

  private setupCamera(): void {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    const cameraPos = this.config.cameraPosition || [0, 0, 10];
    const [x, y, z] = cameraPos;
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, this.config.ambientLightIntensity);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      this.config.directionalLightIntensity,
    );
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    this.lights.push(directionalLight);

    // Accent lighting for hexagonal theme
    const hexLight = new THREE.PointLight(0x00ff88, 0.5, 20);
    hexLight.position.set(0, 0, 5);
    this.scene.add(hexLight);
    this.lights.push(hexLight);
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.resize.bind(this));

    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.domElement.addEventListener('click', this.onClick.bind(this));
    this.renderer.domElement.addEventListener('wheel', this.onWheel.bind(this));
  }

  private onMouseMove(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.updateHover();
  }

  private onClick(event: MouseEvent): void {
    this.updateRaycaster();
    const intersects = this.raycaster.intersectObjects(Array.from(this.hexNodes.values()));
    if (intersects.length > 0 && intersects[0]) {
      this.selectObject(intersects[0].object);
    } else {
      this.deselectObject();
    }
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault();
    const zoomSpeed = 0.1;
    const zoom = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;

    this.camera.position.multiplyScalar(zoom);
    this.camera.position.clampLength(2, 50);
  }

  private updateHover(): void {
    this.updateRaycaster();
    const intersects = this.raycaster.intersectObjects(Array.from(this.hexNodes.values()));

    // Reset all hover states
    this.hexNodes.forEach((mesh) => {
      if (mesh.userData.isHovered && mesh !== this.selectedObject) {
        this.resetMeshMaterial(mesh);
        mesh.userData.isHovered = false;
      }
    });
    // Apply hover to intersected object
    if (intersects.length > 0 && intersects[0]) {
      const mesh = intersects[0].object as THREE.Mesh;
      if (!mesh.userData.isHovered && mesh !== this.selectedObject) {
        this.applyHoverMaterial(mesh);
        mesh.userData.isHovered = true;
      }
    }
  }

  private updateRaycaster(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
  }

  private selectObject(object: THREE.Object3D): void {
    if (this.selectedObject) {
      this.deselectObject();
    }

    this.selectedObject = object;
    this.applySelectedMaterial(object as THREE.Mesh);

    // Dispatch selection event
    const event = new CustomEvent('nodeSelected', {
      detail: {
        nodeId: object.userData.nodeId,
        position: object.position.toArray(),
        data: object.userData,
      },
    });
    this.container.dispatchEvent(event);
  }

  private deselectObject(): void {
    if (this.selectedObject) {
      this.resetMeshMaterial(this.selectedObject as THREE.Mesh);
      this.selectedObject = null;

      // Dispatch deselection event
      const event = new CustomEvent('nodeDeselected');
      this.container.dispatchEvent(event);
    }
  }

  private applyHoverMaterial(mesh: THREE.Mesh): void {
    if (mesh.material instanceof THREE.MeshStandardMaterial) {
      mesh.material.emissive.setHex(0x004400);
    }
  }

  private applySelectedMaterial(mesh: THREE.Mesh): void {
    if (mesh.material instanceof THREE.MeshStandardMaterial) {
      mesh.material.emissive.setHex(0x00ff88);
    }
  }

  private resetMeshMaterial(mesh: THREE.Mesh): void {
    if (mesh.material instanceof THREE.MeshStandardMaterial) {
      mesh.material.emissive.setHex(0x000000);
    }
  }

  private createHexagonGeometry(): THREE.CylinderGeometry {
    return new THREE.CylinderGeometry(
      this.config.hexagonRadius,
      this.config.hexagonRadius,
      this.config.hexagonHeight,
      6,
    );
  }

  private createHexagonMaterial(color: number = 0x00ff88): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
      roughness: 0.3,
      metalness: 0.7,
    });
  }

  public addNode(node: H3XNode): void {
    if (this.hexNodes.has(node.id)) {
      this.updateNode(node);
      return;
    }

    const geometry = this.createHexagonGeometry();
    const material = this.createHexagonMaterial(node.color || 0x00ff88);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(node.x, node.y, node.z || 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      nodeId: node.id,
      type: 'hexNode',
      data: node,
    };

    this.scene.add(mesh);
    this.hexNodes.set(node.id, mesh);
  }

  public removeNode(nodeId: string): void {
    const mesh = this.hexNodes.get(nodeId);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose();
      }
      this.hexNodes.delete(nodeId);

      if (this.selectedObject === mesh) {
        this.selectedObject = null;
      }
    }
  }

  public updateNode(node: H3XNode): void {
    const mesh = this.hexNodes.get(node.id);
    if (mesh) {
      mesh.position.set(node.x, node.y, node.z || 0);

      if (node.color && mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.color.setHex(node.color);
      }

      mesh.userData.data = node;
    }
  }

  public updateNodes(nodes: H3XNode[]): void {
    // Clear existing nodes
    this.clear();

    // Add new nodes
    nodes.forEach((node) => this.addNode(node));
  }

  public addTriad(triad: H3XTriad): void {
    if (this.triadConnections.has(triad.id)) {
      return;
    }

    const points = [];
    for (const nodeId of triad.nodeIds) {
      const mesh = this.hexNodes.get(nodeId);
      if (mesh) {
        points.push(mesh.position.clone());
      }
    }

    if (points.length >= 2) {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: triad.color || 0x0088ff,
        linewidth: this.config.triadLineWidth,
      });

      const line = new THREE.Line(geometry, material);
      line.userData = {
        triadId: triad.id,
        type: 'triad',
        data: triad,
      };

      this.scene.add(line);
      this.triadConnections.set(triad.id, line);
    }
  }

  public removeTriad(triadId: string): void {
    const line = this.triadConnections.get(triadId);
    if (line) {
      this.scene.remove(line);
      line.geometry.dispose();
      if (line.material instanceof THREE.Material) {
        line.material.dispose();
      }
      this.triadConnections.delete(triadId);
    }
  }

  public updateTriads(triads: H3XTriad[]): void {
    // Clear existing triads
    this.triadConnections.forEach((line) => {
      this.scene.remove(line);
      line.geometry.dispose();
      if (line.material instanceof THREE.Material) {
        line.material.dispose();
      }
    });
    this.triadConnections.clear();

    // Add new triads
    triads.forEach((triad) => this.addTriad(triad));
  }

  public clear(): void {
    // Remove all nodes
    this.hexNodes.forEach((mesh) => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose();
      }
    });
    this.hexNodes.clear();

    // Remove all triads
    this.triadConnections.forEach((line) => {
      this.scene.remove(line);
      line.geometry.dispose();
      if (line.material instanceof THREE.Material) {
        line.material.dispose();
      }
    });
    this.triadConnections.clear();

    this.selectedObject = null;
  }

  public render(): void {
    if (!this.isInitialized) return;

    this.renderer.render(this.scene, this.camera);
  }

  public animate(): void {
    if (!this.config.enableAnimation) {
      this.render();
      return;
    }

    this.animationId = requestAnimationFrame(this.animate.bind(this));

    // Rotate the scene slowly for visual appeal
    this.scene.rotation.y += 0.005;

    // Animate hexagon hover effects
    this.hexNodes.forEach((mesh) => {
      if (mesh.userData.isHovered || mesh === this.selectedObject) {
        mesh.rotation.y += 0.02;
      }
    });

    this.render();
  }

  public stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public resize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  public setCamera(position: [number, number, number], target?: [number, number, number]): void {
    this.camera.position.set(...position);
    if (target) {
      this.camera.lookAt(...target);
    }
  }

  public getStats(): { nodes: number; triads: number; fps: number } {
    return {
      nodes: this.hexNodes.size,
      triads: this.triadConnections.size,
      fps: 60, // Would need frame counting for actual FPS
    };
  }

  public dispose(): void {
    this.stopAnimation();

    this.clear();

    // Remove event listeners
    window.removeEventListener('resize', this.resize.bind(this));

    // Dispose renderer
    this.renderer.dispose();

    // Remove from DOM
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }

    this.isInitialized = false;
  }
}
