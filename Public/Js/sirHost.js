// sirHost.js
// SIR (System/Interface/Relay) Host: Central agentic controller for UI, agent, and data actions

class SIRHost {
  constructor() {
    this.currentCell = { q: 0, r: 0 };
    this.cellMap = new Map();
    this.listeners = {};
  }

  // Event system
  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }
  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  // Navigation
  goToCell(q, r) {
    this.currentCell = { q, r };
    this.emit('cellSelected', { q, r });
    this.log(`Navigated to cell (${q},${r})`);
  }

  // Loop manipulation
  createLoop(a, b, coupled = true) {
    const key = `${this.currentCell.q},${this.currentCell.r}`;
    let cell = this.cellMap.get(key) || { q: this.currentCell.q, r: this.currentCell.r, loops: [] };
    cell.loops.push({ endA: a, endB: b, coupled });
    this.cellMap.set(key, cell);
    this.emit('loopChanged', { cell, action: 'create', loop: { endA: a, endB: b, coupled } });
    this.log(`Created ${coupled ? 'coupled' : 'open'} loop in cell (${key})`);
  }

  removeLoop(a, b) {
    const key = `${this.currentCell.q},${this.currentCell.r}`;
    let cell = this.cellMap.get(key);
    if (!cell) return;
    cell.loops = cell.loops.filter(l =>
      !(l.endA === a && l.endB === b) && !(l.endA === b && l.endB === a)
    );
    this.cellMap.set(key, cell);
    this.emit('loopChanged', { cell, action: 'remove', loop: { endA: a, endB: b } });
    this.log(`Removed loop in cell (${key})`);
  }

  // State queries
  getCurrentCell() {
    return this.currentCell;
  }
  getCellData(q, r) {
    return this.cellMap.get(`${q},${r}`) || { q, r, loops: [] };
  }

  // Logging
  log(msg) {
    this.emit('log', msg);
    console.log('[SIR]', msg);
  }
}

// Export singleton
window.sirHost = new SIRHost();
