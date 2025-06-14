# fLups Engine Core - Implementation Documentation

## Overview

The fLups Engine Core is a TypeScript implementation of the Feedback Loops (fLups) system based on the hexagonal mirror lattice discovery. This engine provides maximum efficiency in computational feedback systems through the principles of:

- **Time as Action Rule**: Time progression only occurs during action execution
- **Hexagonal Efficiency**: Mirror lattice provides optimal packing and communication paths  
- **φ (Phi) Mapping**: Maps triangular patches to icosahedral geometry for 3D projection

## Core Components

### Data Structures

#### `TriangleNode`
Represents a single node in the fLups triangular system with three fundamental types:
- `flup+` - Positive flux node
- `flup-` - Negative flux node  
- `cflup-n` - Control flux node

Key properties:
- Position in 3D space
- Energy level (affects action validity)
- State (transmitting, receiving, processing, idle)
- Mirror counterpart linking

#### `TrianglePatch`
Represents a triangular patch containing three connected nodes, forming the basic unit of the hexagonal lattice system.

Key features:
- Links three nodes into a functional triangle
- Supports mirror patch relationships for hexagonal completion
- Tracks energy and operational phase
- Enables φ-mapping to icosahedral coordinates

#### `ActionEvent`
Represents an action event in the fLups system. Actions are the fundamental drivers of time progression.

Action types:
- `transmit` - Send signal between nodes
- `process` - Process received data
- `receive` - Accept incoming transmission
- `feedback` - Send processed result back

#### `PhiMappingResult`
Result of mapping a triangular patch to icosahedral coordinates using the golden ratio (φ) for geometric transformations and 3D visualization.

### fLupsEngine Class

The main engine class implementing hexagonal lattice feedback loops with comprehensive methods:

#### Core Methods

- `constructor(config?)` - Initialize engine with optional configuration
- `getPatch(patchId)` - Retrieve a triangular patch by ID
- `getAuditLog(limit?)` - Get complete audit log of all actions
- `areNeighbors(nodeId1, nodeId2)` - Check if two nodes are connected
- `isValidAction(action)` - Validate whether an action can be executed
- `processAction(action)` - Process and execute a single action
- `mapPatchToIcosahedron(patchId)` - Map patch to icosahedral coordinates

#### Helper Methods

- `createNode(type, position, energy)` - Create new triangular node
- `createPatch(nodeIds, isMirror)` - Create triangular patch from nodes
- `createMirrorPatch(originalPatchId)` - Create mirror patch for hexagonal lattice
- `createAction(type, source, target, cost, payload)` - Create and queue new action
- `processActionQueue()` - Process all pending actions
- `getStatistics()` - Get current engine statistics

## Usage Example

```typescript
import { fLupsEngine } from './fLups-engine-core.js';

// Initialize engine with debug mode
const engine = new fLupsEngine({ debugMode: true });

// Create the basic fLups triangle
const flupPlus = engine.createNode('flup+', { x: 0, y: 1, z: 0 }, 1.0);
const flupMinus = engine.createNode('flup-', { x: -1, y: -1, z: 0 }, 1.0);
const cflupN = engine.createNode('cflup-n', { x: 1, y: -1, z: 0 }, 1.0);

// Create a triangular patch
const patch = engine.createPatch([flupPlus.id, flupMinus.id, cflupN.id]);

// Create mirror patch for hexagonal completion
const mirrorPatch = engine.createMirrorPatch(patch.id);

// Create and process actions
flupPlus.state = 'transmitting';
flupMinus.state = 'receiving';

const action = engine.createAction('transmit', flupPlus.id, flupMinus.id, 0.1);
const success = engine.processAction(action);

// Map patch to icosahedral coordinates
const phiMapping = engine.mapPatchToIcosahedron(patch.id);

// Get engine statistics
const stats = engine.getStatistics();
console.log(`Virtual Time: ${stats.virtualTime}, Total Energy: ${stats.totalEnergy}`);
```

## Configuration Options

```typescript
const config = {
  enableMirrorLattice: true,    // Enable hexagonal mirror lattice
  enablePhiMapping: true,       // Enable φ-mapping to icosahedron
  debugMode: false,             // Enable debug logging
  maxNodes: 1000,               // Maximum number of nodes
  maxPatches: 500               // Maximum number of patches
};

const engine = new fLupsEngine(config);
```

## Hexagonal Mirror Lattice Theory

The engine implements the hexagonal mirror lattice discovery where mirroring the fLups triangle creates a hexagonal structure - one of nature's most efficient packing arrangements.

### Benefits:
- **Optimal Packing**: π/(2√3) ≈ 90.69% efficiency (maximum possible)
- **Minimum Path Length**: Each node has 3 direct neighbors, max 2 hops to any node
- **Action Efficiency**: 6 actions per cycle vs 3 in linear (2× throughput)

### Phase-Locked Operation:
The system operates in 60-degree phase increments (0°, 60°, 120°, 180°, 240°, 300°) for synchronized action patterns across the hexagonal lattice.

## φ (Phi) Mapping

The engine includes φ-mapping functionality that transforms 2D triangular patches into 3D icosahedral coordinates using the golden ratio. This enables:

- 3D visualization of fLups systems
- Geometric transformations and projections
- Integration with 3D rendering engines
- Advanced spatial analytics

## Audit Trail & Security

The engine maintains a comprehensive audit log of all actions for:

- **Auditability**: Complete history of system state changes
- **Security**: Validation and tracking of all operations
- **Precision**: Exact reproduction of system behavior
- **Debugging**: Detailed logging for development and troubleshooting

## Future Extensibility

The modular design supports:

- **Persona Overlays**: Custom behavior layers for different use cases
- **Dashboard Integration**: Real-time visualization and monitoring
- **Agentic Extensions**: AI agent integration for autonomous operation
- **Custom Validation Rules**: Domain-specific action validation
- **Performance Optimization**: Configurable limits and caching

## Files

- `Public/js/fLups-engine-core.ts` - Main implementation
- `Public/js/fLups-engine-test.ts` - Basic functionality tests

## Dependencies

- TypeScript (ES2022 target)
- No external runtime dependencies
- Compatible with both Node.js and browser environments

## License

MIT License - Part of the H3X Unified System by Hexperiment Labs