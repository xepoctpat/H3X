// H3X Frontend Integration
// Enhanced integration script for H3X interfaces with real-time backend communication

class H3XFrontendIntegration {
  constructor(options = {}) {
    this.options = {
      apiBaseUrl: 'http://localhost:3007/api',
      wsUrl: 'ws://localhost:3008',
      enableWebSocket: true,
      enablePolling: true,
      pollingInterval: 5000,
      ...options,
    };

    this.wsClient = null;
    this.pollingTimer = null;
    this.lastUpdate = null;
    this.eventHandlers = new Map();

    this.init();
  }

  async init() {
    console.log('[H3X-Frontend] Initializing integration...');

    // Initialize WebSocket connection if enabled
    if (this.options.enableWebSocket && typeof WebSocket !== 'undefined') {
      await this.initWebSocket();
    }

    // Start polling if enabled
    if (this.options.enablePolling) {
      this.startPolling();
    }

    // Set up DOM event listeners
    this.setupDOMListeners();

    // Load initial data
    await this.loadInitialData();

    console.log('[H3X-Frontend] Integration initialized');
  }

  async initWebSocket() {
    try {
      // Use the WebSocket client if available
      if (typeof H3XWebSocketClient !== 'undefined') {
        this.wsClient = new H3XWebSocketClient(this.options.wsUrl);

        this.wsClient.on('connected', () => {
          console.log('[H3X-Frontend] WebSocket connected');
          this.updateConnectionStatus('connected');
        });

        this.wsClient.on('disconnected', () => {
          console.log('[H3X-Frontend] WebSocket disconnected');
          this.updateConnectionStatus('disconnected');
        });

        this.wsClient.on('system_status', (data) => {
          this.updateSystemStatus(data);
        });

        this.wsClient.on('amendment_created', (data) => {
          this.handleAmendmentUpdate(data);
        });

        this.wsClient.on('config_updated', (data) => {
          this.handleConfigUpdate(data);
        });

        this.wsClient.connect();
        this.wsClient.startHealthCheck();
      }
    } catch (error) {
      console.warn('[H3X-Frontend] WebSocket initialization failed:', error);
    }
  }

  setupDOMListeners() {
    // Configuration form handlers
    const configForm = document.getElementById('merger-config-form');
    if (configForm) {
      configForm.addEventListener('change', this.handleConfigChange.bind(this));
    }

    // Button handlers
    this.setupButtonHandler('save-config-btn', this.saveConfig.bind(this));
    this.setupButtonHandler('refresh-state-btn', this.refreshState.bind(this));
    this.setupButtonHandler('create-cflup-btn', this.createCFlup.bind(this));
    this.setupButtonHandler('export-archive-btn', this.showExportDialog.bind(this));
    this.setupButtonHandler('create-checkpoint-btn', this.createCheckpoint.bind(this));

    // Global H3X event listeners
    window.addEventListener('h3x:status_update', this.handleStatusUpdate.bind(this));
    window.addEventListener('h3x:amendment_created', this.handleAmendmentCreated.bind(this));
    window.addEventListener('h3x:config_update', this.handleConfigUpdated.bind(this));
  }

  setupButtonHandler(buttonId, handler) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', handler);
    }
  }

  async loadInitialData() {
    try {
      // Load system status
      const status = await this.fetchAPI('/system/status');
      this.updateSystemStatus(status);

      // Load configuration
      const config = await this.fetchAPI(
        '/config',
        'GET',
        null,
        this.options.apiBaseUrl.replace('/api', ''),
      );
      this.updateConfigUI(config);

      // Load amendments
      const amendments = await this.fetchAPI('/amendments');
      this.updateAmendmentsUI(amendments.amendments || []);

      // Load metrics
      const metrics = await this.fetchAPI('/metrics');
      this.updateMetricsUI(metrics);
    } catch (error) {
      console.error('[H3X-Frontend] Failed to load initial data:', error);
    }
  }

  async fetchAPI(endpoint, method = 'GET', body = null, baseUrl = null) {
    const url = `${baseUrl || this.options.apiBaseUrl}${endpoint}`;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[H3X-Frontend] API request failed: ${method} ${url}`, error);
      throw error;
    }
  }

  // Configuration Management
  async handleConfigChange(event) {
    const form = event.target.form;
    if (form) {
      const config = this.getConfigFromForm(form);
      await this.updateConfig(config);
    }
  }

  getConfigFromForm(form) {
    const formData = new FormData(form);
    const config = {};

    // Handle checkboxes
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      config[checkbox.id] = checkbox.checked;
    });

    // Handle other form elements
    for (const [key, value] of formData.entries()) {
      if (!config.hasOwnProperty(key)) {
        config[key] = value;
      }
    }

    return config;
  }

  async saveConfig() {
    try {
      const form = document.getElementById('merger-config-form');
      if (form) {
        const config = this.getConfigFromForm(form);
        await this.updateConfig(config);
        this.showNotification('Configuration saved successfully', 'success');
      }
    } catch (error) {
      this.showNotification('Failed to save configuration: ' + error.message, 'error');
    }
  }

  async updateConfig(config) {
    try {
      await this.fetchAPI('/config', 'POST', config, this.options.apiBaseUrl.replace('/api', ''));
      console.log('[H3X-Frontend] Configuration updated:', config);

      // Trigger custom event
      window.dispatchEvent(new CustomEvent('h3x:config_saved', { detail: config }));
    } catch (error) {
      console.error('[H3X-Frontend] Failed to update config:', error);
      throw error;
    }
  }

  updateConfigUI(config) {
    Object.entries(config).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = value;
        } else {
          element.value = value;
        }
      }
    });
  }

  // System Operations
  async refreshState() {
    try {
      this.showNotification('Refreshing system state...', 'info');
      await this.loadInitialData();
      this.showNotification('System state refreshed', 'success');
    } catch (error) {
      this.showNotification('Failed to refresh state: ' + error.message, 'error');
    }
  }

  async createCFlup() {
    try {
      this.showNotification('Creating new cFLup instance...', 'info');
      const result = await this.fetchAPI('/loops/cflup/create', 'POST');
      this.showNotification('cFLup instance created successfully', 'success');

      // Refresh data
      await this.loadInitialData();
    } catch (error) {
      this.showNotification('Failed to create cFLup: ' + error.message, 'error');
    }
  }

  async createCheckpoint() {
    try {
      this.showNotification('Creating system checkpoint...', 'info');
      const result = await this.fetchAPI('/checkpoint', 'POST');
      this.showNotification(`Checkpoint created: ${result.filename}`, 'success');
    } catch (error) {
      this.showNotification('Failed to create checkpoint: ' + error.message, 'error');
    }
  }

  // UI Updates
  updateSystemStatus(status) {
    // Update status indicators
    const statusMappings = {
      'merger-status': status.merger,
      'ui-status': status.ui,
      'logs-status': status.logs,
    };

    Object.entries(statusMappings).forEach(([elementId, statusValue]) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = statusValue || 'unknown';
        element.className = `status ${statusValue || 'unknown'}`;
      }
    });

    // Update uptime if available
    if (status.uptime && document.getElementById('system-uptime')) {
      const uptimeText = this.formatUptime(status.uptime);
      document.getElementById('system-uptime').textContent = uptimeText;
    }

    // Update connection count
    if (typeof status.connections !== 'undefined' && document.getElementById('connection-count')) {
      document.getElementById('connection-count').textContent = status.connections;
    }
  }

  updateAmendmentsUI(amendments) {
    const logElement =
      document.getElementById('stateLog') || document.getElementById('amendments-log');
    if (!logElement) return;

    // Clear existing content
    logElement.innerHTML = '';

    if (amendments.length === 0) {
      logElement.innerHTML = '<div class="no-amendments">No amendments recorded</div>';
      return;
    }

    // Add amendments
    amendments
      .slice(-20)
      .reverse()
      .forEach((amendment) => {
        const amendmentElement = document.createElement('div');
        amendmentElement.className = 'amendment-entry';
        amendmentElement.innerHTML = `
        <div class="amendment-header">
          <span class="timestamp">${new Date(amendment.timestamp).toLocaleString()}</span>
          <span class="type badge">${amendment.type || 'unknown'}</span>
        </div>
        <div class="amendment-content">
          <span class="summary">${amendment.summary || amendment.message || 'No summary'}</span>
          ${amendment.instanceId ? `<span class="instance-id">Instance: ${amendment.instanceId}</span>` : ''}
        </div>
      `;
        logElement.appendChild(amendmentElement);
      });
  }

  updateMetricsUI(metrics) {
    // Update metric displays
    const metricMappings = {
      'total-amendments': metrics.amendments?.total,
      'recent-amendments': metrics.amendments?.recent,
      'total-cflups': metrics.cFlups?.total,
      'active-cflups': metrics.cFlups?.active,
      'archive-count': metrics.archives?.count,
    };

    Object.entries(metricMappings).forEach(([elementId, value]) => {
      const element = document.getElementById(elementId);
      if (element && typeof value !== 'undefined') {
        element.textContent = value;
      }
    });

    // Update system health indicator
    if (metrics.systemHealth && document.getElementById('health-status')) {
      const healthElement = document.getElementById('health-status');
      healthElement.textContent = metrics.systemHealth.status;
      healthElement.className = `health-status ${metrics.systemHealth.status}`;
    }
  }

  updateConnectionStatus(status) {
    const connectionElement = document.getElementById('connection-status');
    if (connectionElement) {
      connectionElement.textContent = status;
      connectionElement.className = `connection-status ${status}`;
    }
  }

  // Event Handlers
  handleStatusUpdate(event) {
    console.log('[H3X-Frontend] Status update received:', event.detail);
    this.updateSystemStatus(event.detail);
  }

  handleAmendmentCreated(event) {
    console.log('[H3X-Frontend] Amendment created:', event.detail);
    // Refresh amendments
    this.loadInitialData();
  }

  handleConfigUpdated(event) {
    console.log('[H3X-Frontend] Config updated:', event.detail);
    this.updateConfigUI(event.detail);
  }

  handleAmendmentUpdate(amendment) {
    // Add new amendment to UI
    const logElement =
      document.getElementById('stateLog') || document.getElementById('amendments-log');
    if (logElement) {
      const amendmentElement = document.createElement('div');
      amendmentElement.className = 'amendment-entry new';
      amendmentElement.innerHTML = `
        <div class="amendment-header">
          <span class="timestamp">${new Date(amendment.timestamp).toLocaleString()}</span>
          <span class="type badge">${amendment.type}</span>
        </div>
        <div class="amendment-content">
          <span class="summary">${amendment.summary}</span>
        </div>
      `;

      logElement.insertBefore(amendmentElement, logElement.firstChild);

      // Highlight briefly
      setTimeout(() => {
        amendmentElement.classList.remove('new');
      }, 2000);
    }
  }

  handleConfigUpdate(config) {
    this.updateConfigUI(config);
    this.showNotification('Configuration updated from server', 'info');
  }

  // Utility Methods
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  showNotification(message, type = 'info') {
    console.log(`[H3X-Frontend] ${type.toUpperCase()}: ${message}`);

    // Create notification element if it doesn't exist
    let notificationContainer = document.getElementById('h3x-notifications');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'h3x-notifications';
      notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 300px;
      `;
      document.body.appendChild(notificationContainer);
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `h3x-notification ${type}`;
    notification.style.cssText = `
      background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
      color: white;
      padding: 10px 15px;
      margin-bottom: 10px;
      border-radius: 4px;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    notification.textContent = message;

    notificationContainer.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
    });

    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  showExportDialog() {
    const loopType = prompt('Enter loop type to export (cFLup, fLup-out, fLup-recurse, H3X):');
    if (loopType) {
      this.exportArchive(loopType);
    }
  }

  async exportArchive(loopType, filename = null) {
    try {
      this.showNotification(`Exporting ${loopType} archive...`, 'info');
      const result = await this.fetchAPI('/archives/export', 'POST', {
        loopType,
        filename,
      });
      this.showNotification(`Archive exported: ${result.filename}`, 'success');
    } catch (error) {
      this.showNotification('Export failed: ' + error.message, 'error');
    }
  }

  startPolling() {
    this.pollingTimer = setInterval(async () => {
      try {
        // Only poll if WebSocket is not connected
        if (!this.wsClient || !this.wsClient.isConnected) {
          await this.loadInitialData();
        }
      } catch (error) {
        console.warn('[H3X-Frontend] Polling update failed:', error);
      }
    }, this.options.pollingInterval);
  }

  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  // Cleanup
  destroy() {
    this.stopPolling();

    if (this.wsClient) {
      this.wsClient.stopHealthCheck();
      this.wsClient.disconnect();
    }

    // Remove event listeners
    window.removeEventListener('h3x:status_update', this.handleStatusUpdate.bind(this));
    window.removeEventListener('h3x:amendment_created', this.handleAmendmentCreated.bind(this));
    window.removeEventListener('h3x:config_update', this.handleConfigUpdated.bind(this));
  }
}

// Auto-initialize when DOM is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.h3xIntegration = new H3XFrontendIntegration();
  });
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  export = H3XFrontendIntegration;
} else if (typeof window !== 'undefined') {
  window.H3XFrontendIntegration = H3XFrontendIntegration;
}
