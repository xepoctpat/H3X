// H3X WebSocket Client
// Real-time communication client for H3X frontend integration

class H3XWebSocketClient {
  constructor(url = 'ws://localhost:3008', options = {}) {
    this.url = url;
    this.options = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      ...options
    };
    
    this.ws = null;
    this.reconnectAttempts = 0;
    this.subscriptions = new Set();
    this.messageQueue = [];
    this.isConnected = false;
    this.eventHandlers = new Map();
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Default event handlers
    this.on('system_status', (data) => {
      this.updateSystemStatus(data);
    });

    this.on('config_updated', (data) => {
      this.handleConfigUpdate(data);
    });

    this.on('amendment_created', (data) => {
      this.handleAmendmentCreated(data);
    });

    this.on('loop_created', (data) => {
      this.handleLoopCreated(data);
    });

    this.on('file_changed', (data) => {
      this.handleFileChange(data);
    });
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('[H3X-WS] Connected to H3X backend');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Process queued messages
        this.processMessageQueue();
        
        // Subscribe to channels
        if (this.subscriptions.size > 0) {
          this.subscribe([...this.subscriptions]);
        }
        
        this.trigger('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[H3X-WS] Failed to parse message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('[H3X-WS] Connection closed:', event.code, event.reason);
        this.isConnected = false;
        this.trigger('disconnected', { code: event.code, reason: event.reason });
        
        if (!event.wasClean && this.reconnectAttempts < this.options.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('[H3X-WS] WebSocket error:', error);
        this.trigger('error', error);
      };

    } catch (error) {
      console.error('[H3X-WS] Failed to connect:', error);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    console.log(`[H3X-WS] Reconnecting in ${this.options.reconnectInterval}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, this.options.reconnectInterval);
  }

  send(message) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is established
      this.messageQueue.push(message);
    }
  }

  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  handleMessage(message) {
    const { type, data } = message;
    
    // Trigger specific event handlers
    if (this.eventHandlers.has(type)) {
      this.eventHandlers.get(type).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[H3X-WS] Error in ${type} handler:`, error);
        }
      });
    }

    // Trigger general message event
    this.trigger('message', message);
  }

  // Event handling
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler);
    }
  }

  trigger(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[H3X-WS] Error in ${event} handler:`, error);
        }
      });
    }
  }

  // Subscription management
  subscribe(channels) {
    if (Array.isArray(channels)) {
      channels.forEach(channel => this.subscriptions.add(channel));
    } else {
      this.subscriptions.add(channels);
    }

    this.send({
      type: 'subscribe',
      channels: [...this.subscriptions]
    });
  }

  unsubscribe(channels) {
    if (Array.isArray(channels)) {
      channels.forEach(channel => this.subscriptions.delete(channel));
    } else {
      this.subscriptions.delete(channels);
    }

    this.send({
      type: 'unsubscribe',
      channels: Array.isArray(channels) ? channels : [channels]
    });
  }

  // API methods
  getSystemStatus() {
    this.send({ type: 'get_status' });
  }

  ping() {
    this.send({ type: 'ping' });
  }

  createAmendment(amendment) {
    this.send({
      type: 'create_amendment',
      data: amendment
    });
  }

  createLoop(type, data = {}) {
    this.send({
      type: 'create_loop',
      data: { type, ...data }
    });
  }

  updateConfig(config) {
    this.send({
      type: 'update_config',
      data: config
    });
  }

  // Default event handlers
  updateSystemStatus(data) {
    // Update system status indicators
    const statusElements = {
      'merger-status': data.merger,
      'ui-status': data.ui,
      'logs-status': data.logs
    };

    Object.entries(statusElements).forEach(([elementId, status]) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = status;
        element.className = `status ${status}`;
      }
    });

    // Update connection indicator
    const connectionElement = document.getElementById('connection-status');
    if (connectionElement) {
      connectionElement.textContent = 'Connected';
      connectionElement.className = 'status online';
    }

    // Trigger custom event for applications to handle
    window.dispatchEvent(new CustomEvent('h3x:status_update', { detail: data }));
  }

  handleConfigUpdate(data) {
    console.log('[H3X-WS] Configuration updated:', data);
    
    // Update UI elements if they exist
    Object.entries(data).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element && element.type === 'checkbox') {
        element.checked = value;
      }
    });

    // Trigger custom event
    window.dispatchEvent(new CustomEvent('h3x:config_update', { detail: data }));
  }

  handleAmendmentCreated(data) {
    console.log('[H3X-WS] Amendment created:', data);
    
    // Add to amendments log if element exists
    const logElement = document.getElementById('amendments-log');
    if (logElement) {
      const amendmentElement = document.createElement('div');
      amendmentElement.className = 'amendment-entry';
      amendmentElement.innerHTML = `
        <span class="timestamp">${new Date(data.timestamp).toLocaleTimeString()}</span>
        <span class="type">${data.type}</span>
        <span class="summary">${data.summary}</span>
      `;
      logElement.insertBefore(amendmentElement, logElement.firstChild);
      
      // Keep only last 50 entries
      while (logElement.children.length > 50) {
        logElement.removeChild(logElement.lastChild);
      }
    }

    // Trigger custom event
    window.dispatchEvent(new CustomEvent('h3x:amendment_created', { detail: data }));
  }

  handleLoopCreated(data) {
    console.log('[H3X-WS] Loop created:', data);
    
    // Update loop counter if element exists
    const counterElement = document.getElementById('loop-counter');
    if (counterElement) {
      const currentCount = parseInt(counterElement.textContent) || 0;
      counterElement.textContent = currentCount + 1;
    }

    // Trigger custom event
    window.dispatchEvent(new CustomEvent('h3x:loop_created', { detail: data }));
  }

  handleFileChange(data) {
    console.log('[H3X-WS] File changed:', data.filename);
    
    // Update file status indicator
    const fileElement = document.getElementById(`file-${data.filename.replace('.', '-')}`);
    if (fileElement) {
      fileElement.classList.add('recently-modified');
      setTimeout(() => {
        fileElement.classList.remove('recently-modified');
      }, 3000);
    }

    // Trigger custom event
    window.dispatchEvent(new CustomEvent('h3x:file_changed', { detail: data }));
  }

  // Utility methods
  isConnected() {
    return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
    }
  }

  // Health monitoring
  startHealthCheck(interval = 30000) {
    this.healthCheckInterval = setInterval(() => {
      if (this.isConnected) {
        this.ping();
      }
    }, interval);
  }

  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = H3XWebSocketClient;
} else if (typeof window !== 'undefined') {
  window.H3XWebSocketClient = H3XWebSocketClient;
}
