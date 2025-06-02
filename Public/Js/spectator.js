// Spectator - Matrix Observer Legacy Interface Core

document.addEventListener('DOMContentLoaded', function() {
  initializeSpectator();
});

function initializeSpectator() {
  console.log('Spectator: Matrix Observer Legacy Interface initialized');
  
  // Create spectator interface if it doesn't exist
  if (!document.getElementById('spectator-container')) {
    createSpectatorInterface();
  }
  
  setupSpectatorEvents();
}

function createSpectatorInterface() {
  const container = document.createElement('div');
  container.id = 'spectator-container';
  container.innerHTML = `
    <div class="spectator-panel">
      <h3>Matrix Observer - Spectator Mode</h3>
      <div id="matrix-display" class="matrix-display">
        <div class="status-indicator">
          <span class="status-dot active"></span>
          <span>System Active</span>
        </div>
        <div class="observation-feed">
          <div class="feed-item">Initializing matrix observation...</div>
        </div>
      </div>
      <div class="spectator-controls">
        <button id="start-observation">Start Observation</button>
        <button id="pause-observation">Pause</button>
        <button id="clear-feed">Clear Feed</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(container);
}

function setupSpectatorEvents() {
  const startBtn = document.getElementById('start-observation');
  const pauseBtn = document.getElementById('pause-observation');
  const clearBtn = document.getElementById('clear-feed');
  const feed = document.querySelector('.observation-feed');
  
  let observationInterval;
  let isObserving = false;
  
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      if (!isObserving) {
        startObservation();
        isObserving = true;
        this.textContent = 'Stop Observation';
      } else {
        stopObservation();
        isObserving = false;
        this.textContent = 'Start Observation';
      }
    });
  }
  
  if (pauseBtn) {
    pauseBtn.addEventListener('click', function() {
      if (observationInterval) {
        clearInterval(observationInterval);
        observationInterval = null;
        this.textContent = 'Resume';
      } else if (isObserving) {
        startObservationFeed();
        this.textContent = 'Pause';
      }
    });
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (feed) {
        feed.innerHTML = '<div class="feed-item">Feed cleared</div>';
      }
    });
  }
  
  function startObservation() {
    addFeedItem('🔍 Starting matrix observation...');
    addFeedItem('📊 Monitoring system metrics...');
    startObservationFeed();
  }
  
  function stopObservation() {
    if (observationInterval) {
      clearInterval(observationInterval);
      observationInterval = null;
    }
    addFeedItem('⏹️ Observation stopped');
  }
  
  function startObservationFeed() {
    observationInterval = setInterval(() => {
      const observations = [
        '🔄 Matrix rotation detected',
        '📈 Performance metrics updated',
        '🌐 Network activity observed',
        '⚡ Energy level fluctuation',
        '🔗 Connection established',
        '💾 Data stream active',
        '🎯 Target locked',
        '📡 Signal processing...'
      ];
      
      const randomObservation = observations[Math.floor(Math.random() * observations.length)];
      addFeedItem(randomObservation);
    }, 2000);
  }
  
  function addFeedItem(message) {
    if (!feed) return;
    
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `<span class="timestamp">[${new Date().toLocaleTimeString()}]</span> ${message}`;
    
    feed.appendChild(item);
    
    // Keep only last 10 items
    const items = feed.querySelectorAll('.feed-item');
    if (items.length > 10) {
      items[0].remove();
    }
    
    // Auto-scroll to bottom
    feed.scrollTop = feed.scrollHeight;
  }
}

// CSS injection for styling
const style = document.createElement('style');
style.textContent = `
  .spectator-panel {
    background: #1a1a2e;
    color: #eee;
    padding: 20px;
    border-radius: 8px;
    margin: 20px;
    font-family: 'Courier New', monospace;
  }
  
  .matrix-display {
    background: #16213e;
    border: 2px solid #0f3460;
    border-radius: 4px;
    padding: 15px;
    margin: 15px 0;
  }
  
  .status-indicator {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #666;
    margin-right: 8px;
  }
  
  .status-dot.active {
    background: #00ff41;
    box-shadow: 0 0 10px #00ff41;
  }
  
  .observation-feed {
    background: #0a0a0a;
    border: 1px solid #333;
    border-radius: 4px;
    height: 200px;
    overflow-y: auto;
    padding: 10px;
    font-size: 12px;
  }
  
  .feed-item {
    margin-bottom: 5px;
    padding: 2px 0;
  }
  
  .timestamp {
    color: #888;
    margin-right: 8px;
  }
  
  .spectator-controls {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }
  
  .spectator-controls button {
    background: #0f3460;
    color: white;
    border: 1px solid #1a73e8;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
  }
  
  .spectator-controls button:hover {
    background: #1a73e8;
  }
`;
document.head.appendChild(style);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeSpectator };
}
