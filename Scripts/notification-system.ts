#!/usr/bin/env node
/**
 * H3X Advanced Notification System
 * 
 * Multi-channel notification system for the Remote Maintenance Agent
 * Supports Discord, Slack, Email, Teams, and custom webhooks
 */

import { promises as fs } from 'fs';
import * as path from 'path';

interface NotificationConfig {
  channels: {
    discord?: {
      webhookUrl: string;
      enabled: boolean;
    };
    slack?: {
      webhookUrl: string;
      channel: string;
      enabled: boolean;
    };
    email?: {
      smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
          user: string;
          pass: string;
        };
      };
      from: string;
      to: string[];
      enabled: boolean;
    };
    teams?: {
      webhookUrl: string;
      enabled: boolean;
    };
    webhook?: {
      url: string;
      headers?: Record<string, string>;
      enabled: boolean;
    };
  };
  filters: {
    minSeverity: 'info' | 'warn' | 'error' | 'critical';
    operations: string[];
    timeWindow: number; // minutes
    rateLimiting: {
      enabled: boolean;
      maxPerHour: number;
    };
  };
}

interface NotificationMessage {
  id: string;
  timestamp: number;
  severity: 'info' | 'warn' | 'error' | 'critical';
  title: string;
  message: string;
  operation?: string;
  details?: Record<string, any>;
  tags?: string[];
}

interface NotificationTemplate {
  discord: (msg: NotificationMessage) => any;
  slack: (msg: NotificationMessage) => any;
  email: (msg: NotificationMessage) => { subject: string; html: string; text: string };
  teams: (msg: NotificationMessage) => any;
  webhook: (msg: NotificationMessage) => any;
}

export class NotificationSystem {
  private config: NotificationConfig;
  private sentNotifications: Map<string, number> = new Map();
  private templates: NotificationTemplate;

  constructor(configPath?: string) {
    this.config = this.loadConfig(configPath);
    this.templates = this.createTemplates();
  }

  // Send notification to all enabled channels
  async sendNotification(message: NotificationMessage): Promise<void> {
    try {
      // Apply filters
      if (!this.shouldSendNotification(message)) {
        return;
      }

      // Rate limiting
      if (this.config.filters.rateLimiting.enabled && this.isRateLimited()) {
        console.warn('Notification rate limit exceeded, skipping notification');
        return;
      }

      const promises: Promise<void>[] = [];

      // Send to each enabled channel
      if (this.config.channels.discord?.enabled) {
        promises.push(this.sendToDiscord(message));
      }

      if (this.config.channels.slack?.enabled) {
        promises.push(this.sendToSlack(message));
      }

      if (this.config.channels.email?.enabled) {
        promises.push(this.sendToEmail(message));
      }

      if (this.config.channels.teams?.enabled) {
        promises.push(this.sendToTeams(message));
      }

      if (this.config.channels.webhook?.enabled) {
        promises.push(this.sendToWebhook(message));
      }

      await Promise.allSettled(promises);
      
      // Track sent notification for rate limiting
      this.trackSentNotification(message);

    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Send Discord notification
  private async sendToDiscord(message: NotificationMessage): Promise<void> {
    if (!this.config.channels.discord?.webhookUrl) return;

    const payload = this.templates.discord(message);
    
    try {
      const response = await fetch(this.config.channels.discord.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Discord notification failed:', error);
    }
  }

  // Send Slack notification
  private async sendToSlack(message: NotificationMessage): Promise<void> {
    if (!this.config.channels.slack?.webhookUrl) return;

    const payload = this.templates.slack(message);
    
    try {
      const response = await fetch(this.config.channels.slack.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Slack notification failed:', error);
    }
  }

  // Send email notification
  private async sendToEmail(message: NotificationMessage): Promise<void> {
    if (!this.config.channels.email?.smtp) return;

    const { subject, html, text } = this.templates.email(message);
    
    try {
      // This would require a proper email library like nodemailer
      // For now, we'll just log the email content
      console.log('Email notification (would be sent):');
      console.log(`To: ${this.config.channels.email.to.join(', ')}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${text}`);
    } catch (error) {
      console.error('Email notification failed:', error);
    }
  }

  // Send Teams notification
  private async sendToTeams(message: NotificationMessage): Promise<void> {
    if (!this.config.channels.teams?.webhookUrl) return;

    const payload = this.templates.teams(message);
    
    try {
      const response = await fetch(this.config.channels.teams.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Teams webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Teams notification failed:', error);
    }
  }

  // Send custom webhook notification
  private async sendToWebhook(message: NotificationMessage): Promise<void> {
    if (!this.config.channels.webhook?.url) return;

    const payload = this.templates.webhook(message);
    
    try {
      const response = await fetch(this.config.channels.webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.channels.webhook.headers
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Webhook notification failed:', error);
    }
  }

  // Check if notification should be sent based on filters
  private shouldSendNotification(message: NotificationMessage): boolean {
    // Severity filter
    const severityLevels = { info: 0, warn: 1, error: 2, critical: 3 };
    if (severityLevels[message.severity] < severityLevels[this.config.filters.minSeverity]) {
      return false;
    }

    // Operation filter
    if (this.config.filters.operations.length > 0 && message.operation) {
      if (!this.config.filters.operations.includes(message.operation)) {
        return false;
      }
    }

    // Time window filter (avoid duplicate notifications)
    const timeWindow = this.config.filters.timeWindow * 60 * 1000; // Convert to ms
    const now = Date.now();
    const recentNotifications = Array.from(this.sentNotifications.entries())
      .filter(([, timestamp]) => now - timestamp < timeWindow);

    const duplicateKey = `${message.title}-${message.operation}`;
    if (recentNotifications.some(([key]) => key === duplicateKey)) {
      return false;
    }

    return true;
  }

  // Check rate limiting
  private isRateLimited(): boolean {
    if (!this.config.filters.rateLimiting.enabled) return false;

    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentCount = Array.from(this.sentNotifications.values())
      .filter(timestamp => timestamp > oneHourAgo).length;

    return recentCount >= this.config.filters.rateLimiting.maxPerHour;
  }

  // Track sent notification for rate limiting and deduplication
  private trackSentNotification(message: NotificationMessage): void {
    const key = `${message.title}-${message.operation}`;
    this.sentNotifications.set(key, Date.now());

    // Clean up old entries (older than 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    for (const [key, timestamp] of this.sentNotifications.entries()) {
      if (timestamp < oneDayAgo) {
        this.sentNotifications.delete(key);
      }
    }
  }

  // Load configuration
  private loadConfig(configPath?: string): NotificationConfig {
    const defaultConfig: NotificationConfig = {
      channels: {},
      filters: {
        minSeverity: 'warn',
        operations: [],
        timeWindow: 30, // 30 minutes
        rateLimiting: {
          enabled: true,
          maxPerHour: 10
        }
      }
    };

    try {
      if (configPath) {
        const configData = require(path.resolve(configPath));
        return { ...defaultConfig, ...configData };
      }
    } catch (error) {
      console.warn('Failed to load notification config, using defaults');
    }

    return defaultConfig;
  }

  // Create notification templates
  private createTemplates(): NotificationTemplate {
    return {
      discord: (message: NotificationMessage) => ({
        embeds: [{
          title: `🤖 H3X Maintenance Agent`,
          description: message.title,
          color: this.getSeverityColor(message.severity),
          fields: [
            {
              name: 'Message',
              value: message.message,
              inline: false
            },
            {
              name: 'Operation',
              value: message.operation || 'N/A',
              inline: true
            },
            {
              name: 'Severity',
              value: message.severity.toUpperCase(),
              inline: true
            },
            {
              name: 'Timestamp',
              value: new Date(message.timestamp).toISOString(),
              inline: true
            }
          ],
          footer: {
            text: 'H3X Remote Maintenance Agent'
          }
        }]
      }),

      slack: (message: NotificationMessage) => ({
        channel: this.config.channels.slack?.channel || '#general',
        username: 'H3X Maintenance Agent',
        icon_emoji: ':robot_face:',
        attachments: [{
          color: this.getSeverityColorHex(message.severity),
          title: message.title,
          text: message.message,
          fields: [
            {
              title: 'Operation',
              value: message.operation || 'N/A',
              short: true
            },
            {
              title: 'Severity',
              value: message.severity.toUpperCase(),
              short: true
            }
          ],
          footer: 'H3X Remote Maintenance Agent',
          ts: Math.floor(message.timestamp / 1000)
        }]
      }),

      email: (message: NotificationMessage) => ({
        subject: `[H3X] ${message.severity.toUpperCase()}: ${message.title}`,
        html: `
          <h2>🤖 H3X Maintenance Agent Notification</h2>
          <h3>${message.title}</h3>
          <p><strong>Message:</strong> ${message.message}</p>
          <p><strong>Operation:</strong> ${message.operation || 'N/A'}</p>
          <p><strong>Severity:</strong> ${message.severity.toUpperCase()}</p>
          <p><strong>Timestamp:</strong> ${new Date(message.timestamp).toISOString()}</p>
          ${message.details ? `<p><strong>Details:</strong> <pre>${JSON.stringify(message.details, null, 2)}</pre></p>` : ''}
          <hr>
          <p><em>This notification was sent by the H3X Remote Maintenance Agent</em></p>
        `,
        text: `
H3X Maintenance Agent Notification

Title: ${message.title}
Message: ${message.message}
Operation: ${message.operation || 'N/A'}
Severity: ${message.severity.toUpperCase()}
Timestamp: ${new Date(message.timestamp).toISOString()}

${message.details ? `Details: ${JSON.stringify(message.details, null, 2)}` : ''}

This notification was sent by the H3X Remote Maintenance Agent
        `
      }),

      teams: (message: NotificationMessage) => ({
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": this.getSeverityColorHex(message.severity),
        "summary": message.title,
        "sections": [{
          "activityTitle": "🤖 H3X Maintenance Agent",
          "activitySubtitle": message.title,
          "activityImage": "https://via.placeholder.com/64x64/0078d4/ffffff?text=H3X",
          "facts": [
            {
              "name": "Message",
              "value": message.message
            },
            {
              "name": "Operation",
              "value": message.operation || 'N/A'
            },
            {
              "name": "Severity",
              "value": message.severity.toUpperCase()
            },
            {
              "name": "Timestamp",
              "value": new Date(message.timestamp).toISOString()
            }
          ]
        }]
      }),

      webhook: (message: NotificationMessage) => ({
        source: 'h3x-maintenance-agent',
        timestamp: message.timestamp,
        severity: message.severity,
        title: message.title,
        message: message.message,
        operation: message.operation,
        details: message.details,
        tags: message.tags
      })
    };
  }

  // Get severity color for Discord
  private getSeverityColor(severity: string): number {
    const colors = {
      info: 0x3498db,    // Blue
      warn: 0xf39c12,    // Orange
      error: 0xe74c3c,   // Red
      critical: 0x8e44ad // Purple
    };
    return colors[severity as keyof typeof colors] || colors.info;
  }

  // Get severity color hex for Slack/Teams
  private getSeverityColorHex(severity: string): string {
    const colors = {
      info: '#3498db',
      warn: '#f39c12',
      error: '#e74c3c',
      critical: '#8e44ad'
    };
    return colors[severity as keyof typeof colors] || colors.info;
  }

  // Convenience methods for common notifications
  async notifySuccess(title: string, message: string, operation?: string): Promise<void> {
    await this.sendNotification({
      id: this.generateId(),
      timestamp: Date.now(),
      severity: 'info',
      title,
      message,
      operation,
      tags: ['success']
    });
  }

  async notifyWarning(title: string, message: string, operation?: string, details?: any): Promise<void> {
    await this.sendNotification({
      id: this.generateId(),
      timestamp: Date.now(),
      severity: 'warn',
      title,
      message,
      operation,
      details,
      tags: ['warning']
    });
  }

  async notifyError(title: string, message: string, operation?: string, details?: any): Promise<void> {
    await this.sendNotification({
      id: this.generateId(),
      timestamp: Date.now(),
      severity: 'error',
      title,
      message,
      operation,
      details,
      tags: ['error']
    });
  }

  async notifyCritical(title: string, message: string, operation?: string, details?: any): Promise<void> {
    await this.sendNotification({
      id: this.generateId(),
      timestamp: Date.now(),
      severity: 'critical',
      title,
      message,
      operation,
      details,
      tags: ['critical']
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Export for use in other modules
export { NotificationMessage, NotificationConfig };
