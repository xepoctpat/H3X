// traid-editor.js
// Triangle (traid) editor component integrated with SIR Host

class TraidEditor {
  constructor(svgId) {
    this.svg = document.getElementById(svgId);
    this.size = 120;
    this.cx = 200;
    this.cy = 200;
    this.width = 400;
    this.height = 400;
    this.selected = null;
    this.currentCell = { q: 0, r: 0 };
    
    // Calculate triangle vertices (equilateral)
    this.points = [
      [this.cx, this.cy - this.size], // top
      [this.cx - this.size * Math.sin(Math.PI/3), this.cy + this.size/2], // bottom left
      [this.cx + this.size * Math.sin(Math.PI/3), this.cy + this.size/2]  // bottom right
    ];
    
    // Circle positions at triangle vertices
    this.circles = this.points.map(([x, y]) => ({ x, y }));
    
    this.init();
  }

  init() {
    // Listen for SIR events
    window.sirHost.on('cellSelected', ({q, r}) => {
      this.currentCell = { q, r };
      this.selected = null;
      this.render();
    });
    
    window.sirHost.on('loopChanged', ({cell}) => {
      if (cell.q === this.currentCell.q && cell.r === this.currentCell.r) {
        this.render();
      }
    });
    
    // Initial render
    this.render();
  }

  // Handle circle click
  handleCircleClick(idx) {
    if (this.selected === null) {
      // First click - select circle
      this.selected = idx;
      this.render();
    } else if (this.selected === idx) {
      // Same circle clicked - toggle open loop
      const cellData = window.sirHost.getCellData(this.currentCell.q, this.currentCell.r);
      const hasOpenLoop = cellData.loops.some(l => l.endA === idx && l.endB === null);
      
      if (hasOpenLoop) {
        window.sirHost.removeLoop(idx, null);
      } else {
        window.sirHost.createLoop(idx, null, false);
      }
      
      this.selected = null;
      this.render();
    } else {
      // Different circle clicked - toggle coupled loop
      const cellData = window.sirHost.getCellData(this.currentCell.q, this.currentCell.r);
      const hasCoupledLoop = cellData.loops.some(l =>
        (l.endA === this.selected && l.endB === idx) ||
        (l.endA === idx && l.endB === this.selected)
      );
      
      if (hasCoupledLoop) {
        window.sirHost.removeLoop(this.selected, idx);
      } else {
        window.sirHost.createLoop(this.selected, idx, true);
      }
      
      this.selected = null;
      this.render();
    }
  }

  // Draw loops
  drawLoops() {
    const cellData = window.sirHost.getCellData(this.currentCell.q, this.currentCell.r);
    
    for (const loop of cellData.loops) {
      if (loop.endB !== null) {
        // Coupled loop between two circles
        const [a, b] = [this.circles[loop.endA], this.circles[loop.endB]];
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        
        // Create curved path between circles
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const dx = b.y - a.y;
        const dy = a.x - b.x;
        const cpx = mx + dx * 0.2;
        const cpy = my + dy * 0.2;
        
        path.setAttribute("d", `M${a.x},${a.y} Q${cpx},${cpy} ${b.x},${b.y}`);
        path.setAttribute("stroke", loop.coupled ? "#7fd1b9" : "#ff6b6b");
        path.setAttribute("stroke-width", "4");
        path.setAttribute("fill", "none");
        if (!loop.coupled) {
          path.setAttribute("stroke-dasharray", "8 4");
        }
        
        this.svg.appendChild(path);
      } else {
        // Open loop (single circle)
        const a = this.circles[loop.endA];
        const arc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        arc.setAttribute("cx", a.x);
        arc.setAttribute("cy", a.y - 30);
        arc.setAttribute("r", 15);
        arc.setAttribute("stroke", "#ff6b6b");
        arc.setAttribute("stroke-width", "3");
        arc.setAttribute("fill", "none");
        arc.setAttribute("stroke-dasharray", "6 3");
        
        this.svg.appendChild(arc);
      }
    }
  }

  // Render the traid editor
  render() {
    // Clear previous content
    this.svg.innerHTML = '';
    
    // Draw triangle
    const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    triangle.setAttribute("points", this.points.map(p => p.join(',')).join(' '));
    triangle.setAttribute("stroke", "#fff");
    triangle.setAttribute("stroke-width", "2");
    triangle.setAttribute("fill", "#333");
    triangle.setAttribute("fill-opacity", "0.3");
    this.svg.appendChild(triangle);
    
    // Draw loops
    this.drawLoops();
    
    // Draw circles
    this.circles.forEach((circle, i) => {
      const circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circ.setAttribute("cx", circle.x);
      circ.setAttribute("cy", circle.y);
      circ.setAttribute("r", 18);
      circ.setAttribute("stroke", "#888");
      circ.setAttribute("stroke-width", "3");
      circ.setAttribute("fill", this.selected === i ? "#ffd580" : "#fff");
      circ.setAttribute("cursor", "pointer");
      
      circ.onclick = () => this.handleCircleClick(i);
      
      this.svg.appendChild(circ);
      
      // Add circle label
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", circle.x);
      label.setAttribute("y", circle.y);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "middle");
      label.setAttribute("fill", "#000");
      label.setAttribute("font-size", "12");
      label.setAttribute("font-weight", "bold");
      label.setAttribute("pointer-events", "none");
      label.textContent = i;
      this.svg.appendChild(label);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.traidEditor = new TraidEditor('traid-svg');
});
