#!/usr/bin/env node
/**
 * H3X Dependabot Webhook Handler
 * 
 * Provides real-time processing of Dependabot events via GitHub webhooks
 * Integrates with the existing H3X automation ecosystem
 */

const express = require('express');
const crypto = require('crypto');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class DependabotWebhookHandler {
  constructor() {
    this.app = express();
    this.port = process.env.WEBHOOK_PORT || 3001;
    this.secret = process.env.GITHUB_WEBHOOK_SECRET;
    this.projectRoot = process.cwd();
    this.logFile = path.join(this.projectRoot, 'logs/automation/webhook.log');
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Security middleware for webhook verification
    this.app.use('/webhook', (req, res, next) => {
      if (!this.secret) {
        return next();
      }

      const signature = req.headers['x-hub-signature-256'];
      if (!signature) {
        return res.status(401).send('Missing signature');
      }

      const hmac = crypto.createHmac('sha256', this.secret);
      const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
        return res.status(401).send('Invalid signature');
      }

      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'dependabot-webhook-handler',
        version: '1.0.0'
      });
    });

    // Main webhook endpoint
    this.app.post('/webhook', async (req, res) => {
      try {
        await this.handleWebhook(req, res);
      } catch (error) {
        await this.log(`Webhook error: ${error.message}`, 'error');
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Status endpoint
    this.app.get('/status', async (req, res) => {
      try {
        const status = await this.getSystemStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get status' });
      }
    });
  }

  async handleWebhook(req, res) {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    await this.log(`Received ${event} event`, 'info');

    switch (event) {
      case 'pull_request':
        await this.handlePullRequestEvent(payload);
        break;
      case 'pull_request_review':
        await this.handlePullRequestReviewEvent(payload);
        break;
      case 'check_suite':
        await this.handleCheckSuiteEvent(payload);
        break;
      case 'status':
        await this.handleStatusEvent(payload);
        break;
      default:
        await this.log(`Unhandled event type: ${event}`, 'warning');
    }

    res.json({ received: true, processed: event });
  }

  async handlePullRequestEvent(payload) {
    const { action, pull_request } = payload;
    
    // Only process Dependabot PRs
    if (pull_request.user.login !== 'dependabot[bot]') {
      return;
    }

    await this.log(`Processing PR #${pull_request.number}: ${action}`, 'info');

    switch (action) {
      case 'opened':
      case 'synchronize':
      case 'reopened':
        await this.analyzeDependabotPR(pull_request);
        break;
      case 'closed':
        if (pull_request.merged) {
          await this.handleMergedPR(pull_request);
        }
        break;
    }
  }

  async handlePullRequestReviewEvent(payload) {
    const { action, pull_request, review } = payload;
    
    if (pull_request.user.login !== 'dependabot[bot]') {
      return;
    }

    if (action === 'submitted' && review.state === 'approved') {
      await this.log(`PR #${pull_request.number} approved, checking for auto-merge`, 'info');
      await this.checkAutoMergeEligibility(pull_request);
    }
  }

  async handleCheckSuiteEvent(payload) {
    const { action, check_suite, pull_requests } = payload;
    
    if (action === 'completed' && pull_requests.length > 0) {
      for (const pr of pull_requests) {
        if (pr.user?.login === 'dependabot[bot]') {
          await this.log(`Check suite completed for PR #${pr.number}`, 'info');
          await this.evaluateAutoMerge(pr, check_suite);
        }
      }
    }
  }

  async handleStatusEvent(payload) {
    const { state, context, target_url } = payload;
    
    // Check if this is related to a Dependabot PR
    if (context && (context.includes('dependabot') || context.includes('dependency'))) {
      await this.log(`Status update: ${context} - ${state}`, 'info');
    }
  }

  async analyzeDependabotPR(pullRequest) {
    try {
      await this.log(`Analyzing Dependabot PR #${pullRequest.number}`, 'info');
      
      // Trigger the dependabot automation script
      const result = await this.runDependabotAnalysis(pullRequest.number);
      
      if (result.success) {
        await this.log(`Analysis completed for PR #${pullRequest.number}`, 'success');
        
        // Integrate with H3X automation if eligible
        if (result.eligible) {
          await this.triggerH3XIntegration(pullRequest, result.analysis);
        }
      } else {
        await this.log(`Analysis failed for PR #${pullRequest.number}: ${result.error}`, 'error');
      }
    } catch (error) {
      await this.log(`Error analyzing PR #${pullRequest.number}: ${error.message}`, 'error');
    }
  }

  async runDependabotAnalysis(prNumber) {
    return new Promise((resolve) => {
      const child = spawn('node', ['scripts/dependabot-automation.js', 'analyze', prNumber.toString()], {
        cwd: this.projectRoot,
        stdio: ['ignore', 'pipe', 'pipe']
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
          try {
            // Try to parse analysis results from stdout
            const results = this.parseAnalysisResults(stdout);
            resolve({ success: true, ...results });
          } catch (parseError) {
            resolve({ success: true, eligible: false, analysis: null });
          }
        } else {
          resolve({ success: false, error: stderr || 'Analysis failed' });
        }
      });

      // Set timeout for analysis
      setTimeout(() => {
        child.kill();
        resolve({ success: false, error: 'Analysis timeout' });
      }, 300000); // 5 minutes
    });
  }

  parseAnalysisResults(output) {
    // Extract JSON analysis results from output
    const jsonMatch = output.match(/\{[\s\S]*"eligible"[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        eligible: analysis.eligible || false,
        analysis: analysis
      };
    }
    return { eligible: false, analysis: null };
  }

  async checkAutoMergeEligibility(pullRequest) {
    try {
      const analysis = await this.runDependabotAnalysis(pullRequest.number);
      
      if (analysis.eligible) {
        await this.log(`PR #${pullRequest.number} is eligible for auto-merge`, 'info');
        // Could trigger GitHub Actions workflow or direct auto-merge here
      }
    } catch (error) {
      await this.log(`Error checking auto-merge eligibility: ${error.message}`, 'error');
    }
  }

  async evaluateAutoMerge(pullRequest, checkSuite) {
    if (checkSuite.conclusion === 'success') {
      await this.checkAutoMergeEligibility(pullRequest);
    } else if (checkSuite.conclusion === 'failure') {
      await this.log(`PR #${pullRequest.number} checks failed, auto-merge blocked`, 'warning');
    }
  }

  async handleMergedPR(pullRequest) {
    await this.log(`Dependabot PR #${pullRequest.number} was merged`, 'info');
    
    // Trigger post-merge actions
    try {
      await this.triggerPostMergeActions(pullRequest);
    } catch (error) {
      await this.log(`Post-merge actions failed: ${error.message}`, 'error');
    }
  }

  async triggerH3XIntegration(pullRequest, analysis) {
    try {
      // Integrate with existing H3X automation
      const { H3XAutomation } = require('./h3x-automation.js');
      const h3xAutomation = new H3XAutomation();
      
      await h3xAutomation.createGitCheckpoint(
        `chore(deps): Dependabot PR #${pullRequest.number} analysis completed`
      );
      
      await this.log(`H3X integration triggered for PR #${pullRequest.number}`, 'info');
    } catch (error) {
      await this.log(`H3X integration failed: ${error.message}`, 'warning');
    }
  }

  async triggerPostMergeActions(pullRequest) {
    // Run post-merge automation
    const child = spawn('node', ['scripts/dependabot-automation.js', 'post-merge', pullRequest.number.toString()], {
      cwd: this.projectRoot,
      stdio: 'inherit'
    });

    return new Promise((resolve) => {
      child.on('close', (code) => {
        if (code === 0) {
          this.log(`Post-merge actions completed for PR #${pullRequest.number}`, 'info');
        } else {
          this.log(`Post-merge actions failed for PR #${pullRequest.number}`, 'error');
        }
        resolve(code === 0);
      });
    });
  }

  async getSystemStatus() {
    try {
      const logExists = await fs.access(this.logFile).then(() => true).catch(() => false);
      
      return {
        service: 'dependabot-webhook-handler',
        status: 'running',
        timestamp: new Date().toISOString(),
        port: this.port,
        logFile: logExists ? this.logFile : 'not found',
        projectRoot: this.projectRoot,
        webhookSecret: !!this.secret
      };
    } catch (error) {
      return {
        service: 'dependabot-webhook-handler',
        status: 'error',
        error: error.message
      };
    }
  }

  async log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    console.log(logEntry.trim());
    
    try {
      await fs.mkdir(path.dirname(this.logFile), { recursive: true });
      await fs.appendFile(this.logFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  async start() {
    await this.log('Starting Dependabot Webhook Handler', 'info');
    
    this.server = this.app.listen(this.port, () => {
      this.log(`Webhook handler listening on port ${this.port}`, 'info');
      this.log(`Health check: http://localhost:${this.port}/health`, 'info');
      this.log(`Status endpoint: http://localhost:${this.port}/status`, 'info');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  async shutdown() {
    await this.log('Shutting down webhook handler', 'info');
    
    if (this.server) {
      this.server.close(() => {
        this.log('Server closed', 'info');
        process.exit(0);
      });
    }
  }
}

// CLI interface
if (require.main === module) {
  const handler = new DependabotWebhookHandler();
  handler.start().catch(console.error);
}

module.exports = { DependabotWebhookHandler };
