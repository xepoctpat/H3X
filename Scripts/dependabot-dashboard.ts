
// Auto-generated interfaces
interface ProcessEnv {
  [key: string]: string | undefined;
}

interface ConsoleLog {
  log: (message?: any, ...optionalParams: any[]) => void;
  error: (message?: any, ...optionalParams: any[]) => void;
  warn: (message?: any, ...optionalParams: any[]) => void;
}

/**
 * H3X Dependabot Automation Dashboard Server
 *
 * Provides a web interface for monitoring and managing the Dependabot automation system:
 * - Real-time metrics dashboard
 * - Health status monitoring
 * - Alert management
 * - Performance analytics
 * - Configuration management
 */

import { promises as fs } from 'fs';
import path = require('path');

import express = require('express');


import * as DependabotMonitoring from './dependabot-monitoring';

class DependabotDashboard {
  constructor(port = 3001) {
    this.port = port;
    this.app = express();
    this.monitoring = new DependabotMonitoring();
    this.projectRoot = process.cwd();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupStaticFiles();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../public')));

    // CORS for development
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      next();
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      const healthStatus = this.monitoring.getHealthStatus();
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        dependabot: healthStatus,
      });
    });

    // Metrics endpoint
    this.app.get('/api/metrics', (req, res) => {
      try {
        const metrics = this.monitoring.getMetrics();
        res.json(metrics);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Alerts endpoint
    this.app.get('/api/alerts', (req, res) => {
      try {
        const alerts = this.monitoring.getAlerts();
        res.json(alerts);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Resolve alert
    this.app.post('/api/alerts/:alertId/resolve', async (req, res) => {
      try {
        const { alertId } = req.params;
        const { resolution } = req.body;
        await this.monitoring.resolveAlert(alertId, resolution);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Dashboard report
    this.app.get('/api/report', (req, res) => {
      try {
        const report = this.monitoring.generateReport();
        res.json(report);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Configuration endpoints
    this.app.get('/api/config', async (req, res) => {
      try {
        const config = await this.getAutomationConfig();
        res.json(config);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.put('/api/config', async (req, res) => {
      try {
        await this.updateAutomationConfig(req.body);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Recent activity
    this.app.get('/api/activity', (req, res) => {
      try {
        const metrics = this.monitoring.getMetrics();
        const recentActivity = {
          recentPRs: metrics.performance.processingTimes.slice(-10),
          recentErrors: metrics.errors.slice(-5),
          dailyStats: metrics.dailyStats,
        };
        res.json(recentActivity);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Performance data
    this.app.get('/api/performance', (req, res) => {
      try {
        const metrics = this.monitoring.getMetrics();
        const performance = {
          processingTimes: metrics.performance.processingTimes,
          cpuUsage: metrics.performance.cpuUsage,
          memoryUsage: metrics.performance.memoryUsage,
        };
        res.json(performance);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Manual PR processing trigger
    this.app.post('/api/process-pr/:prNumber', async (req, res) => {
      try {
        const { prNumber } = req.params;
        import { DependabotAutomation } from './dependabot-automation';
        const automation = new DependabotAutomation();

        const result = await automation.analyzePR(parseInt(prNumber));
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Dashboard HTML page
    this.app.get('/', (req, res) => {
      res.send(this.generateDashboardHTML());
    });

    // API documentation
    this.app.get('/api', (req, res) => {
      res.json({
        endpoints: {
          'GET /health': 'System health check',
          'GET /api/metrics': 'Get automation metrics',
          'GET /api/alerts': 'Get active and resolved alerts',
          'POST /api/alerts/:id/resolve': 'Resolve an alert',
          'GET /api/report': 'Get comprehensive dashboard report',
          'GET /api/config': 'Get automation configuration',
          'PUT /api/config': 'Update automation configuration',
          'GET /api/activity': 'Get recent activity',
          'GET /api/performance': 'Get performance metrics',
          'POST /api/process-pr/:number': 'Manually process a PR',
        },
      });
    });
  }

  setupStaticFiles() {
    // Serve dashboard assets if they exist
    const publicDir = path.join(this.projectRoot, 'public');
    this.app.use('/static', express.static(publicDir));
  }

  async getAutomationConfig() {
    try {
      const configPath = path.join(this.projectRoot, 'config/dependabot-automation.json');
      const content = await fs.readFile(configPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return { error: 'Configuration file not found' };
    }
  }

  async updateAutomationConfig(newConfig) {
    const configPath = path.join(this.projectRoot, 'config/dependabot-automation.json');
    await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2));
  }

  generateDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>H3X Dependabot Automation Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 0;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .card {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 1px solid #e1e8ed;
        }
        
        .card h3 {
            color: #2c3e50;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .metric:last-child {
            border-bottom: none;
        }
        
        .metric-value {
            font-weight: bold;
            color: #3498db;
        }
        
        .status {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }
        
        .status.healthy {
            background: #d4edda;
            color: #155724;
        }
        
        .status.warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .status.critical {
            background: #f8d7da;
            color: #721c24;
        }
        
        .alert {
            margin: 0.5rem 0;
            padding: 1rem;
            border-radius: 5px;
            border-left: 4px solid;
        }
        
        .alert.warning {
            background: #fff3cd;
            border-color: #ffc107;
        }
        
        .alert.critical {
            background: #f8d7da;
            border-color: #dc3545;
        }
        
        .btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
        }
        
        .btn:hover {
            background: #2980b9;
        }
        
        .loading {
            text-align: center;
            color: #666;
            font-style: italic;
        }
        
        .refresh-btn {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: #27ae60;
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            font-size: 1.2em;
        }
        
        .api-links {
            background: #ecf0f1;
            padding: 1rem;
            border-radius: 5px;
            margin-top: 1rem;
        }
        
        .api-links a {
            color: #3498db;
            text-decoration: none;
            margin-right: 1rem;
        }
        
        .api-links a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 H3X Dependabot Automation Dashboard</h1>
        <p>Real-time monitoring and management of automated dependency updates</p>
    </div>
    
    <div class="container">
        <div class="dashboard-grid">
            <!-- Health Status Card -->
            <div class="card">
                <h3>🏥 System Health</h3>
                <div id="health-status" class="loading">Loading...</div>
            </div>
            
            <!-- Metrics Card -->
            <div class="card">
                <h3>📊 Automation Metrics</h3>
                <div id="metrics" class="loading">Loading...</div>
            </div>
            
            <!-- Active Alerts Card -->
            <div class="card">
                <h3>🚨 Active Alerts</h3>
                <div id="alerts" class="loading">Loading...</div>
            </div>
            
            <!-- Recent Activity Card -->
            <div class="card">
                <h3>⚡ Recent Activity</h3>
                <div id="activity" class="loading">Loading...</div>
            </div>
        </div>
        
        <div class="api-links">
            <strong>API Endpoints:</strong>
            <a href="/api/metrics" target="_blank">Metrics</a>
            <a href="/api/alerts" target="_blank">Alerts</a>
            <a href="/api/report" target="_blank">Report</a>
            <a href="/api/performance" target="_blank">Performance</a>
            <a href="/api/config" target="_blank">Configuration</a>
        </div>
    </div>
    
    <button class="refresh-btn" onclick="refreshDashboard()" title="Refresh Dashboard">🔄</button>
    
    <script>
        async function fetchData(async function fetchData(endpoint) {): Promise<any> {
            try {
                const response = await fetch(\`/api/\${endpoint}\`);
                return await response.json();
            } catch (error) {
                console.error(\`Error fetching \${endpoint}:\`, error);
                return { error: error.message };
            }
        }
        
        function formatStatus(status) {
            return \`<span class="status \${status}">\${status.toUpperCase()}</span>\`;
        }
        
        function formatMetric(label, value, unit = '') {
            return \`
                <div class="metric">
                    <span>\${label}</span>
                    <span class="metric-value">\${value}\${unit}</span>
                </div>
            \`;
        }
        
        function formatAlert(alert) {
            return \`
                <div class="alert \${alert.severity}">
                    <strong>\${alert.type.replace('-', ' ').toUpperCase()}</strong><br>
                    \${alert.message}<br>
                    <small>\${new Date(alert.timestamp).toLocaleString()}</small>
                    <button class="btn" onclick="resolveAlert('\${alert.id}')">Resolve</button>
                </div>
            \`;
        }
        
        async function loadHealthStatus(async function loadHealthStatus() {): Promise<any> {
            const health = await fetchData('metrics');
            if (health.error) {
                document.getElementById('health-status').innerHTML = \`<div class="error">\${health.error}</div>\`;
                return;
            }
            
            const healthStatus = health.healthStatus;
            let html = formatMetric('Overall Status', formatStatus(healthStatus.status));
            
            if (healthStatus.components) {
                Object.entries(healthStatus.components).forEach(([component, status]) => {
                    html += formatMetric(component.replace(/([A-Z])/g, ' $1').toLowerCase(), formatStatus(status));
                });
            }
            
            document.getElementById('health-status').innerHTML = html;
        }
        
        async function loadMetrics(async function loadMetrics() {): Promise<any> {
            const metrics = await fetchData('metrics');
            if (metrics.error) {
                document.getElementById('metrics').innerHTML = \`<div class="error">\${metrics.error}</div>\`;
                return;
            }
            
            let html = '';
            html += formatMetric('Total PRs Processed', metrics.totalPRsProcessed);
            html += formatMetric('Auto-merged PRs', metrics.autoMergedPRs);
            html += formatMetric('Blocked PRs', metrics.blockedPRs);
            html += formatMetric('Security Alerts', metrics.securityAlertsFound);
            html += formatMetric('Success Rate', \`\${Math.round(metrics.successRate * 100)}\`, '%');
            html += formatMetric('Avg Processing Time', \`\${Math.round(metrics.averageProcessingTime)}\`, 'ms');
            
            document.getElementById('metrics').innerHTML = html;
        }
        
        async function loadAlerts(async function loadAlerts() {): Promise<any> {
            const alertsData = await fetchData('alerts');
            if (alertsData.error) {
                document.getElementById('alerts').innerHTML = \`<div class="error">\${alertsData.error}</div>\`;
                return;
            }
            
            const activeAlerts = alertsData.active || [];
            
            if (activeAlerts.length === 0) {
                document.getElementById('alerts').innerHTML = '<div style="color: #27ae60;">✅ No active alerts</div>';
                return;
            }
            
            let html = '';
            activeAlerts.forEach(alert => {
                html += formatAlert(alert);
            });
            
            document.getElementById('alerts').innerHTML = html;
        }
        
        async function loadActivity(async function loadActivity() {): Promise<any> {
            const activity = await fetchData('activity');
            if (activity.error) {
                document.getElementById('activity').innerHTML = \`<div class="error">\${activity.error}</div>\`;
                return;
            }
            
            let html = '';
            
            // Recent PRs
            if (activity.recentPRs && activity.recentPRs.length > 0) {
                html += '<strong>Recent PRs:</strong><br>';
                activity.recentPRs.slice(-5).forEach(pr => {
                    html += \`<div class="metric">
                        <span>PR #\${pr.prNumber}</span>
                        <span>\${pr.time}ms</span>
                    </div>\`;
                });
            }
            
            // Recent errors
            if (activity.recentErrors && activity.recentErrors.length > 0) {
                html += '<br><strong>Recent Errors:</strong><br>';
                activity.recentErrors.forEach(error => {
                    html += \`<div style="color: #e74c3c; font-size: 0.9em; margin: 0.25rem 0;">
                        \${error.message}
                    </div>\`;
                });
            }
            
            if (!html) {
                html = '<div style="color: #666;">No recent activity</div>';
            }
            
            document.getElementById('activity').innerHTML = html;
        }
        
        async function resolveAlert(async function resolveAlert(alertId) {): Promise<any> {
            try {
                const response = await fetch(\`/api/alerts/\${alertId}/resolve\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resolution: 'Resolved via dashboard' })
                });
                
                if (response.ok) {
                    loadAlerts(); // Refresh alerts
                } else {
                    alert('Failed to resolve alert');
                }
            } catch (error) {
                alert('Error resolving alert: ' + error.message);
            }
        }
        
        async function refreshDashboard(async function refreshDashboard() {): Promise<any> {
            document.querySelectorAll('.card > div:last-child').forEach(el => {
                el.innerHTML = '<div class="loading">Loading...</div>';
            });
            
            await Promise.all([
                loadHealthStatus(),
                loadMetrics(),
                loadAlerts(),
                loadActivity()
            ]);
        }
        
        // Initial load
        refreshDashboard();
        
        // Auto-refresh every 30 seconds
        setInterval(refreshDashboard, 30000);
    </script>
</body>
</html>
    `;
  }

  async start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`🚀 Dependabot Dashboard running at http://localhost:${this.port}`);
        console.log(`📊 Health check: http://localhost:${this.port}/health`);
        console.log(`📈 Metrics API: http://localhost:${this.port}/api/metrics`);
        resolve();
      });
    });
  }

  async stop() {
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(resolve);
      });
      console.log('🛑 Dashboard server stopped');
    }
  }
}

// CLI interface
if (require.main === module) {
  const port = (process.env as ProcessEnv).PORT || 3001;
  const dashboard = new DependabotDashboard(port);

  dashboard.start().catch((error) => {
    console.error('❌ Failed to start dashboard:', error.message);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down dashboard...');
    await dashboard.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n⏹️  Shutting down dashboard...');
    await dashboard.stop();
    process.exit(0);
  });
}

export = DependabotDashboard;
