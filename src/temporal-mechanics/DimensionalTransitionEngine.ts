/**
 * H3X Dimensional Transition Engine
 * 
 * Implements the corrected temporal mechanics where time emerges from actions
 * rather than existing as a background parameter. The system operates in:
 * - 3D Construction Mode: Timeless state where time is undefined (∅)
 * - 4D Spacetime Mode: Temporal state where time emerges from action sequences
 */

export interface FlupState {
  id: string;
  type: 'flup-plus' | 'flup-minus' | 'cflup-n';
  position: { x: number; y: number; z: number };
  energy: number;
  active: boolean;
}

export interface Action {
  id: string;
  type: 'transmit' | 'process' | 'receive';
  source: string;
  target: string;
  energy_required: number;
  duration: number;
}

export interface SystemState {
  flups: Map<string, FlupState>;
  dimension: 3 | 4;
  time: number | null; // null = undefined time (3D mode)
  energy_total: number;
  action_count: number;
}

export class DimensionalTransitionEngine {
  private state: SystemState;
  private actionQueue: Action[];
  private rules: Map<string, (state: SystemState) => Action[]>;
  private energyThreshold: number = 1.0;

  constructor() {
    this.state = {
      flups: new Map(),
      dimension: 3, // Start in 3D construction mode
      time: null,   // Time undefined initially
      energy_total: 0,
      action_count: 0
    };
    this.actionQueue = [];
    this.rules = new Map();
    this.initializeRules();
  }

  /**
   * Initialize the rule system for dimensional transitions
   */
  private initializeRules(): void {
    // R1: Energy above threshold enables transmission
    this.rules.set('transmit', (state: SystemState) => {
      const actions: Action[] = [];
      for (const [id, flup] of state.flups) {
        if (flup.type === 'flup-plus' && flup.energy > this.energyThreshold) {
          const target = this.findTarget(flup, 'flup-minus');
          if (target) {
            actions.push({
              id: `transmit_${Date.now()}_${Math.random()}`,
              type: 'transmit',
              source: id,
              target: target.id,
              energy_required: 0.5,
              duration: 1
            });
          }
        }
      }
      return actions;
    });

    // R2: Signal received enables processing
    this.rules.set('process', (state: SystemState) => {
      const actions: Action[] = [];
      for (const [id, flup] of state.flups) {
        if (flup.type === 'flup-minus' && flup.active) {
          const target = this.findTarget(flup, 'cflup-n');
          if (target) {
            actions.push({
              id: `process_${Date.now()}_${Math.random()}`,
              type: 'process',
              source: id,
              target: target.id,
              energy_required: 0.3,
              duration: 1
            });
          }
        }
      }
      return actions;
    });

    // R3: Processing complete enables feedback
    this.rules.set('receive', (state: SystemState) => {
      const actions: Action[] = [];
      for (const [id, flup] of state.flups) {
        if (flup.type === 'cflup-n' && flup.active) {
          const target = this.findTarget(flup, 'flup-plus');
          if (target) {
            actions.push({
              id: `receive_${Date.now()}_${Math.random()}`,
              type: 'receive',
              source: id,
              target: target.id,
              energy_required: 0.2,
              duration: 1
            });
          }
        }
      }
      return actions;
    });
  }

  /**
   * Find a target flup of the specified type
   */
  private findTarget(source: FlupState, targetType: string): FlupState | null {
    for (const flup of this.state.flups.values()) {
      if (flup.type === targetType && flup.id !== source.id) {
        return flup;
      }
    }
    return null;
  }

  /**
   * Execute one tick of the dimensional transition engine
   */
  public tick(): void {
    // Check if we have valid actions
    if (this.actionQueue.length === 0) {
      this.generateActions();
    }

    if (this.actionQueue.length === 0) {
      // No valid actions - transition to 3D construction mode
      this.transitionTo3D();
      return;
    }

    // Valid actions exist - ensure we're in 4D spacetime mode
    this.transitionTo4D();

    // Execute the next action
    const action = this.actionQueue.shift()!;
    this.executeAction(action);

    // Generate new actions based on current state
    this.generateActions();
  }

  /**
   * Transition to 3D construction mode (time becomes undefined)
   */
  private transitionTo3D(): void {
    if (this.state.dimension === 4) {
      console.log('[H3X] Transitioning to 3D construction mode - time becomes undefined');
      this.state.dimension = 3;
      this.state.time = null; // Time becomes undefined (∅)
    }
  }

  /**
   * Transition to 4D spacetime mode (time emerges)
   */
  private transitionTo4D(): void {
    if (this.state.dimension === 3) {
      console.log('[H3X] Transitioning to 4D spacetime mode - time emerges');
      this.state.dimension = 4;
      this.state.time = 0; // Time emerges from first action
    }
  }

  /**
   * Execute a specific action
   */
  private executeAction(action: Action): void {
    const source = this.state.flups.get(action.source);
    const target = this.state.flups.get(action.target);

    if (!source || !target) {
      console.warn(`[H3X] Invalid action: source or target not found`);
      return;
    }

    // Check energy requirements
    if (source.energy < action.energy_required) {
      console.warn(`[H3X] Insufficient energy for action ${action.type}`);
      return;
    }

    // Execute the action
    source.energy -= action.energy_required;
    target.active = true;
    target.energy += action.energy_required * 0.8; // Energy transfer with loss

    // Advance time (only in 4D mode)
    if (this.state.dimension === 4 && this.state.time !== null) {
      this.state.time += action.duration;
    }

    this.state.action_count++;

    console.log(`[H3X] Executed ${action.type}: ${source.id} → ${target.id} (t=${this.state.time})`);
  }

  /**
   * Generate new actions based on current state and rules
   */
  private generateActions(): void {
    for (const [ruleName, ruleFunction] of this.rules) {
      const newActions = ruleFunction(this.state);
      this.actionQueue.push(...newActions);
    }
  }

  /**
   * Add a flup to the system
   */
  public addFlup(flup: FlupState): void {
    this.state.flups.set(flup.id, flup);
    this.state.energy_total += flup.energy;
  }

  /**
   * Get current system state
   */
  public getState(): SystemState {
    return { ...this.state };
  }

  /**
   * Get current dimensional mode
   */
  public getDimensionalMode(): string {
    return this.state.dimension === 3 ? '3D Construction (time undefined)' : '4D Spacetime (temporal)';
  }

  /**
   * Check if time is defined
   */
  public isTimeDefinedMode(): boolean {
    return this.state.dimension === 4 && this.state.time !== null;
  }

  /**
   * Get temporal state description
   */
  public getTemporalState(): string {
    if (this.state.dimension === 3) {
      return 'Temporal Invariance (t = ∅)';
    } else {
      return `Emergent Time (t = ${this.state.time})`;
    }
  }
}
