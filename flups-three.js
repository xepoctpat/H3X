// flups-three.js - Modular visualization logic for fLups system
// Each tab gets its own class. Shared setup functions for sidebar, dragbar, and controls.

// --- TriangleTab ---
export class TriangleTab {
  constructor() {
    this.steps = [
      {
        doc: `<h2>Step 1: The Feedback Loop Structure</h2><div class='explanation'>The triangle consists of three nodes: <b>flup-plus</b>, <b>flup-minus</b>, and <b>cflup-n</b>. Each node represents a state in the feedback system. The edges form a closed loop, representing continuous feedback.</div>`,
        highlight: [0, 1, 2],
        highlightEdges: [0, 1, 2],
      },
      {
        doc: `<h2>Step 2: State Evolution</h2><div class='explanation'>Each node updates its state based on its neighbors. The system evolves as each node observes and reacts to the others, creating dynamic feedback.</div>`,
        highlight: [0],
        highlightEdges: [0],
      },
      {
        doc: `<h2>Step 3: Curiosity-Driven Dynamics</h2><div class='explanation'>A small perturbation (curiosity) is added to each node's state, allowing the system to explore new configurations and avoid stagnation.</div>`,
        highlight: [1],
        highlightEdges: [1],
      },
      {
        doc: `<h2>Step 4: Feedback Loop Proof</h2><div class='explanation'>The triangle structure ensures that information and influence circulate endlessly, forming the basis for more complex feedback systems.</div>`,
        highlight: [2],
        highlightEdges: [2],
      },
    ];
    this.step = 0;
    this.graph = {
      vertices: [
        {id: "flup-plus", x: 1, y: 1, z: 0},
        {id: "flup-minus", x: -1, y: 1, z: 0},
        {id: "cflup-n", x: 0, y: -1, z: 1}
      ],
      edges: [
        ["flup-plus", "flup-minus"],
        ["flup-minus", "cflup-n"],
        ["cflup-n", "flup-plus"]
      ]
    };
  }
  getSidebarContent() {
    return `<div id='triangle-step-doc'></div>
      <div id='triangle-stepper' class='stepper'>
        <button id='triangle-prev-step' class='stepper-btn'>Prev</button>
        <span id='triangle-step-indicator' class='stepper-indicator'></span>
        <button id='triangle-next-step' class='stepper-btn'>Next</button>
      </div>`;
  }
  setupSidebarEvents(updateViz) {
    document.getElementById('triangle-prev-step').onclick = () => {
      if (this.step > 0) { this.step--; this.updateStep(updateViz); }
    };
    document.getElementById('triangle-next-step').onclick = () => {
      if (this.step < this.steps.length-1) { this.step++; this.updateStep(updateViz); }
    };
  }
  updateStep(updateViz) {
    document.getElementById('triangle-step-doc').innerHTML = this.steps[this.step].doc;
    document.getElementById('triangle-step-indicator').textContent = `Step ${this.step+1} of ${this.steps.length}`;
    if (updateViz) updateViz(this.step, this.steps[this.step]);
  }
}

// --- HexagonTab ---
export class HexagonTab {
  constructor() {
    // Add stepwise logic as needed
    this.graph = {
      vertices: Array.from({length: 6}, (_, i) => {
        const angle = Math.PI / 3 * i - Math.PI / 2;
        return {
          id: `v${i+1}`,
          x: Math.cos(angle) * 1.3,
          y: Math.sin(angle) * 1.3,
          z: 0
        };
      }),
      edges: Array.from({length: 6}, (_, i) => [
        `v${i+1}`,
        `v${(i+1)%6+1}`
      ])
    };
  }
  getSidebarContent() {
    return `<div class='explanation'>By mirroring the flups triangle, we create a hexagonal lattice—nature's most efficient packing structure. This enables optimal communication, action efficiency, and energy distribution.</div>`;
  }
  setupSidebarEvents() {}
  updateStep() {}
}

// --- ActionTimeTab ---
export class ActionTimeTab {
  constructor() {
    this.graph = {
      vertices: [
        {id: "flup+", x: 1, y: 1, z: 0},
        {id: "flup-", x: -1, y: 1, z: 0},
        {id: "cflup-n", x: 0, y: -1, z: 1}
      ],
      edges: [
        ["flup+", "flup-", "#ffb347"],
        ["flup-", "cflup-n", "#7ecfff"],
        ["cflup-n", "flup+", "#ffd580"]
      ]
    };
  }
  getSidebarContent() {
    return `<div class='explanation'>Time in this system is defined by the execution of actions. No action means no time progression. The system evolves through a sequence of state transitions driven by rules.</div>`;
  }
  setupSidebarEvents() {}
  updateStep() {}
}

// --- FourDTab ---
export class FourDTab {
  constructor() {
    this.graph = {
      vertices: Array.from({length: 30}, (_, i) => {
        const t = i * 0.25;
        return {
          id: `t${i}`,
          x: Math.cos(t) * 1.2,
          y: Math.sin(t) * 1.2,
          z: (i-15)/6
        };
      }),
      edges: Array.from({length: 29}, (_, i) => [
        `t${i}`,
        `t${i+1}`
      ])
    };
  }
  getSidebarContent() {
    return `<div class='explanation'>The flups system can be generalized to 4D spacetime, with time-slice, spacetime, and phase diagrams, and mathematical/physics notes. See the .md files for more details.</div>`;
  }
  setupSidebarEvents() {}
  updateStep() {}
}

// --- MathProofTab ---
export class MathProofTab {
  constructor() {
    // The proof content is from flups-proto.md, formatted for HTML/markdown
    this.proof = `
<h2>fLups Prototype Mathematical Proof</h2>
<pre class="code">// Place this in an HTML file with three.js loaded
const vertices = [
  {x: 1, y: 1, z: 0, label: "flup-plus"},
  {x: -1, y: 1, z: 0, label: "flup-minus"},
  {x: 0, y: -1, z: 1, label: "cflup-n"}
];

const edges = [
  [0, 1], [1, 2], [2, 0]
];

// ...initialize three.js scene...

vertices.forEach(v => {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.1),
    new THREE.MeshBasicMaterial({color: 0x00ff00})
  );
  sphere.position.set(v.x, v.y, v.z);
  scene.add(sphere);
  // Optionally add labels
});

edges.forEach(([i, j]) => {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(vertices[i].x, vertices[i].y, vertices[i].z),
    new THREE.Vector3(vertices[j].x, vertices[j].y, vertices[j].z)
  ]);
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 0xffffff}));
  scene.add(line);
});
</pre>
<p class="explanation">This code demonstrates the construction of the fundamental fLups triangle in 3D space, with each vertex and edge corresponding to a logical or mathematical element of the proof. The structure is the basis for all higher-order feedback and geometric reasoning in the fLups system.</p>
`;
  }
  getSidebarContent() {
    return this.proof;
  }
  setupSidebarEvents() {}
  updateStep() {}
}

// --- Time Mode Logic ---
export const TimeModes = {
  discrete: 'Discrete: Each action = 1 time unit',
  conditional: 'Conditional: No valid actions = temporal freeze (infinity)',
  emergent: 'Emergent: Time arises from rule execution',
  relative: 'Relative: Subsystems have different action rates'
};

let currentTimeMode = 'discrete';

export function getTimeMode() {
  return currentTimeMode;
}

export function setTimeMode(mode) {
  if (TimeModes[mode]) currentTimeMode = mode;
}

export function setupTimeModeToggle() {
  const select = document.getElementById('time-mode-select');
  if (!select) return;
  select.value = currentTimeMode;
  select.onchange = (e) => {
    setTimeMode(e.target.value);
    // Optionally, trigger a re-render or log the change
    if (window.logTimeModeChange) window.logTimeModeChange(currentTimeMode);
  };
}

// --- Shared Setup Functions ---
export function setupSidebarTabs(tabModules) {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  tabBtns.forEach(btn => {
    btn.onclick = () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      const contentDiv = document.getElementById('tab-' + tab);
      contentDiv.classList.add('active');
      contentDiv.innerHTML = tabModules[tab].getSidebarContent();
      if (tabModules[tab].setupSidebarEvents) {
        tabModules[tab].setupSidebarEvents();
      }
      if (tab === 'triangle') {
        tabModules[tab].step = 0;
        tabModules[tab].updateStep();
      }
    };
  });
  // Initial load
  const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
  const contentDiv = document.getElementById('tab-' + activeTab);
  contentDiv.innerHTML = tabModules[activeTab].getSidebarContent();
  if (tabModules[activeTab].setupSidebarEvents) {
    tabModules[activeTab].setupSidebarEvents();
  }
  if (activeTab === 'triangle') {
    tabModules[activeTab].step = 0;
    tabModules[activeTab].updateStep();
  }
}

export function setupDragbar() {
  const dragbar = document.getElementById('dragbar');
  const sidebar = document.getElementById('sidebar');
  const container = document.getElementById('container');
  let dragging = false, startX = 0, startWidth = 0;
  dragbar?.addEventListener('mousedown', (e) => {
    if (window.innerWidth < 700) return;
    dragging = true;
    startX = e.clientX;
    startWidth = sidebar.offsetWidth;
    document.body.style.cursor = 'ew-resize';
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    let newWidth = Math.max(180, Math.min(500, startWidth + (e.clientX - startX)));
    sidebar.style.width = newWidth + 'px';
    container.style.setProperty('--sidebar-width', newWidth + 'px');
  });
  window.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = false;
      document.body.style.cursor = '';
    }
  });
}

export function setupVizControls(tabModules) {
  // Placeholder for modular viz controls if needed
}