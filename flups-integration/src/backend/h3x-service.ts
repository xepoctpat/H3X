// H3X Service Layer
// Abstraction layer for H3X-merger.js operations

import fs = require('fs');
import path = require('path');
import { spawn } from 'child_process';
import EventEmitter = require('events');

class H3XService extends EventEmitter {
  constructor() {
    super();
    this.config = this.loadConfig();
    this.state = {
      amendments: [],
      cFlupInstances: {},
      fLupOutState: { amendments: [] },
      fLupRecurseState: { amendments: [] },
      h3xState: { amendments: [] },
      currentArchive: null,
    };

    this.loadState();
    this.setupFileWatchers();
  }

  loadConfig() {
    const configFile = 'H3X-config.json';
    if (fs.existsSync(configFile)) {
      try {
        return JSON.parse(fs.readFileSync(configFile, 'utf8'));
      } catch (error) {
        console.warn('[H3X-Service] Failed to load config:', error.message);
      }
    }

    return {
      timeAggregation: true,
      logDiffs: false,
      proofSync: true,
      verbose: true,
      enableSwapping: true,
      hexLatticeMode: true,
      triadPerfection: true,
    };
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    fs.writeFileSync('H3X-config.json', JSON.stringify(this.config, null, 2));
    this.emit('configUpdated', this.config);
    return this.config;
  }

  loadState() {
    try {
      // Load general amendments
      if (fs.existsSync('flup-n-amendments.log')) {
        const content = fs.readFileSync('flup-n-amendments.log', 'utf8');
        this.state.amendments = content
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line));
      }

      // Load cFLup instances
      if (fs.existsSync('cFLup-instances.log')) {
        const content = fs.readFileSync('cFLup-instances.log', 'utf8');
        const entries = content
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line));

        entries.forEach((entry) => {
          if (!this.state.cFlupInstances[entry.instanceId]) {
            this.state.cFlupInstances[entry.instanceId] = {
              created: entry.timestamp,
              amendments: [],
            };
          }
          this.state.cFlupInstances[entry.instanceId].amendments.push(entry);
        });
      }

      this.emit('stateLoaded', this.state);
    } catch (error) {
      console.warn('[H3X-Service] Failed to load state:', error.message);
    }
  }

  setupFileWatchers() {
    const logFiles = [
      'flup-n-amendments.log',
      'cFLup-instances.log',
      'fLup-out.log',
      'fLup-recurse.log',
      'H3X-instances.log',
    ];

    logFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.watchFile(file, (curr, prev) => {
          if (curr.mtime > prev.mtime) {
            this.reloadState();
            this.emit('fileChanged', { file, timestamp: Date.now() });
          }
        });
      }
    });
  }

  reloadState() {
    const oldState = { ...this.state };
    this.loadState();
    this.emit('stateUpdated', { oldState, newState: this.state });
  }

  // Loop Management
  async createCFlupInstance() {
    try {
      const result = await this.executeCommand(['create-cflup']);
      this.reloadState();
      this.emit('cFlupCreated', result);
      return result;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async listCFlupInstances() {
    try {
      const result = await this.executeCommand(['list-cflups']);
      return {
        output: result,
        instances: this.state.cFlupInstances,
        count: Object.keys(this.state.cFlupInstances).length,
      };
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  // Amendment Logging
  logAmendment(type, instanceId, summary, data = {}, file = 'api') {
    const amendment = {
      timestamp: new Date().toISOString(),
      type,
      instanceId,
      summary,
      data,
      file,
      source: 'h3x-service',
    };

    // Append to log
    fs.appendFileSync('flup-n-amendments.log', JSON.stringify(amendment) + '\n');

    // Update state
    this.state.amendments.push(amendment);

    // Emit event
    this.emit('amendmentLogged', amendment);

    return amendment;
  }

  logLoopAmendment(loopType, instanceId, summary, data = {}) {
    const logFiles = {
      cFLup: 'cFLup-instances.log',
      'fLup-out': 'fLup-out.log',
      'fLup-recurse': 'fLup-recurse.log',
      H3X: 'H3X-instances.log',
    };

    const logFile = logFiles[loopType];
    if (!logFile) {
      throw new Error(`Unknown loop type: ${loopType}`);
    }

    const amendment = {
      timestamp: new Date().toISOString(),
      loopType,
      instanceId,
      summary,
      data,
      source: 'h3x-service',
    };

    // Append to specific loop log
    fs.appendFileSync(logFile, JSON.stringify(amendment) + '\n');

    // Update state based on loop type
    if (loopType === 'cFLup') {
      if (!this.state.cFlupInstances[instanceId]) {
        this.state.cFlupInstances[instanceId] = {
          created: amendment.timestamp,
          amendments: [],
        };
      }
      this.state.cFlupInstances[instanceId].amendments.push(amendment);
    }

    this.emit('loopAmendmentLogged', amendment);
    return amendment;
  }

  // Archive Management
  async exportLoopArchive(loopType, filename) {
    try {
      const outputFile =
        filename || `${loopType}-archive-${new Date().toISOString().split('T')[0]}.json`;
      const result = await this.executeCommand(['export-loop-archive', loopType, outputFile]);

      this.emit('archiveExported', { loopType, filename: outputFile });
      return { success: true, filename: outputFile, output: result };
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async importLoopArchive(filename, options = {}) {
    try {
      const args = ['import-loop-archive', filename];
      if (options.replace) args.push('--replace');
      if (options.merge) args.push('--merge');

      const result = await this.executeCommand(args);
      this.reloadState();

      this.emit('archiveImported', { filename, options });
      return { success: true, output: result };
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  listArchives() {
    try {
      return fs
        .readdirSync('.')
        .filter(
          (file) =>
            (file.endsWith('.json') || file.endsWith('.log')) &&
            (file.includes('archive') || file.includes('checkpoint') || file.includes('backup')),
        )
        .map((file) => {
          const stats = fs.statSync(file);
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            type: this.getArchiveType(file),
          };
        })
        .sort((a, b) => b.modified - a.modified);
    } catch (error) {
      this.emit('error', error);
      return [];
    }
  }

  getArchiveType(filename) {
    if (filename.includes('cFLup')) return 'cFLup';
    if (filename.includes('fLup-out')) return 'fLup-out';
    if (filename.includes('fLup-recurse')) return 'fLup-recurse';
    if (filename.includes('H3X')) return 'H3X';
    if (filename.includes('checkpoint')) return 'checkpoint';
    if (filename.includes('backup')) return 'backup';
    return 'unknown';
  }

  // System Operations
  async getSystemStatus() {
    try {
      const result = await this.executeCommand(['status']);
      return {
        output: result,
        state: this.state,
        config: this.config,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        files: this.getFileStatus(),
      };
    } catch (error) {
      this.emit('error', error);
      return {
        error: error.message,
        state: this.state,
        config: this.config,
      };
    }
  }

  getFileStatus() {
    const files = [
      'H3X-merger.js',
      'H3X-config.json',
      'flup-n-amendments.log',
      'cFLup-instances.log',
      'fLup-out.log',
      'fLup-recurse.log',
      'H3X-instances.log',
    ];

    return files.reduce((status, file) => {
      status[file] = {
        exists: fs.existsSync(file),
        size: fs.existsSync(file) ? fs.statSync(file).size : 0,
        modified: fs.existsSync(file) ? fs.statSync(file).mtime : null,
      };
      return status;
    }, {});
  }

  async createCheckpoint() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const checkpointData = {
        timestamp,
        state: this.state,
        config: this.config,
        files: this.getFileStatus(),
      };

      const filename = `checkpoint-${timestamp}.json`;
      fs.writeFileSync(filename, JSON.stringify(checkpointData, null, 2));

      this.emit('checkpointCreated', { filename, timestamp });
      return { success: true, filename, timestamp };
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  // Metrics and Analytics
  getMetrics() {
    return {
      amendments: {
        total: this.state.amendments.length,
        recent: this.state.amendments.filter(
          (a) => Date.now() - new Date(a.timestamp).getTime() < 24 * 60 * 60 * 1000,
        ).length,
      },
      cFlups: {
        total: Object.keys(this.state.cFlupInstances).length,
        active: Object.values(this.state.cFlupInstances).filter(
          (instance) => instance.amendments.length > 0,
        ).length,
      },
      archives: {
        count: this.listArchives().length,
        totalSize: this.listArchives().reduce((sum, archive) => sum + archive.size, 0),
      },
      config: this.config,
      systemHealth: this.getSystemHealth(),
    };
  }

  getSystemHealth() {
    const requiredFiles = ['H3X-merger.js', 'H3X-config.json'];
    const fileStatus = this.getFileStatus();

    const health = {
      status: 'healthy',
      checks: {
        requiredFiles: requiredFiles.every((file) => fileStatus[file]?.exists),
        configValid: true,
        logsAccessible: fileStatus['flup-n-amendments.log']?.exists || false,
      },
    };

    if (!health.checks.requiredFiles) {
      health.status = 'degraded';
      health.message = 'Required files missing';
    }

    return health;
  }

  // Utility Methods
  async executeCommand(args) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', ['H3X-merger.js', ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(stderr || `Command failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  // Real-time Data
  getRealtimeActivity() {
    const recentAmendments = this.state.amendments
      .filter((a) => Date.now() - new Date(a.timestamp).getTime() < 60 * 60 * 1000) // Last hour
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      recentAmendments,
      activeLoops: Object.keys(this.state.cFlupInstances).length,
      lastActivity: recentAmendments[0]?.timestamp || null,
      systemLoad: {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
      },
    };
  }

  // Cleanup
  destroy() {
    // Stop file watching
    const logFiles = [
      'flup-n-amendments.log',
      'cFLup-instances.log',
      'fLup-out.log',
      'fLup-recurse.log',
      'H3X-instances.log',
    ];

    logFiles.forEach((file) => {
      try {
        fs.unwatchFile(file);
      } catch (error) {
        // Ignore errors during cleanup
      }
    });

    this.removeAllListeners();
  }
}

export = H3XService;
