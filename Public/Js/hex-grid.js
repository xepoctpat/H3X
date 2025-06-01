// hex-grid.js
// Hexagonal grid component integrated with SIR Host

class HexGrid {
  constructor(svgId) {
    this.svg = document.getElementById(svgId);
    this.hexSize = 36;
    this.gridRadius = 3;
    this.width = 400;
    this.height = 400;
    this.activeCell = { q: 0, r: 0 };
    
    this.init();
  }

  init() {
    // Listen for SIR navigation events
    window.sirHost.on('cellSelected', ({q, r}) => {
      this.activeCell = { q, r };
      this.render();
    });
    
    // Initial render
    this.render();
  }

  // Convert axial coordinates to pixel position
  hexToPixel(q, r) {
    const x = this.hexSize * Math.sqrt(3) * (q + r/2) + this.width/2;
    const y = this.hexSize * 3/2 * r + this.height/2;
    return [x, y];
  }

  // Draw a single hexagon
  drawHex(q, r, isActive) {
    const [cx, cy] = this.hexToPixel(q, r);
    
    // Calculate hex vertices
    let points = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI/3 * i + Math.PI/6;
      const x = cx + this.hexSize * Math.cos(angle);
      const y = cy + this.hexSize * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    
    // Create hex polygon
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", points.join(" "));
    poly.setAttribute("class", "hex-cell" + (isActive ? " active" : ""));
    poly.setAttribute("stroke", "#fff");
    poly.setAttribute("stroke-width", "2");
    poly.setAttribute("fill", isActive ? "#7fd1b9" : "#444");
    poly.setAttribute("cursor", "pointer");
    
    // Handle click - route through SIR
    poly.onclick = () => {
      window.sirHost.goToCell(q, r);
    };
    
    this.svg.appendChild(poly);

    // Add coordinate label
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", cx);
    label.setAttribute("y", cy);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "middle");
    label.setAttribute("fill", "#fff");
    label.setAttribute("font-size", "10");
    label.setAttribute("pointer-events", "none");
    label.textContent = `${q},${r}`;
    this.svg.appendChild(label);
  }

  // Render the entire grid
  render() {
    // Clear previous content
    this.svg.innerHTML = '';
    
    // Draw hex cells in a radius around center
    for (let q = -this.gridRadius; q <= this.gridRadius; q++) {
      for (let r = -this.gridRadius; r <= this.gridRadius; r++) {
        if (Math.abs(q + r) <= this.gridRadius) {
          const isActive = (q === this.activeCell.q && r === this.activeCell.r);
          this.drawHex(q, r, isActive);
        }
      }
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.hexGrid = new HexGrid('hex-svg');
});
