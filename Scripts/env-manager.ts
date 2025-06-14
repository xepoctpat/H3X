#!/usr/bin/env node
/**
 * H3X Environment Manager
 * 
 * Intelligent environment configuration management system
 * Automatically switches between development, production, and custom environments
 */

import { promises as fs } from 'fs';
import * as path from 'path';

interface EnvironmentConfig {
  name: string;
  description: string;
  settings: Record<string, string>;
  requiredSecrets: string[];
  optionalSecrets: string[];
}

interface EnvironmentProfile {
  development: EnvironmentConfig;
  production: EnvironmentConfig;
  testing: EnvironmentConfig;
  docker: EnvironmentConfig;
}

class EnvironmentManager {
  private projectRoot: string;
  private envFile: string;
  private backupDir: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.envFile = path.join(this.projectRoot, '.env');
    this.backupDir = path.join(this.projectRoot, '.env-backups');
  }

  // Get predefined environment profiles
  private getEnvironmentProfiles(): EnvironmentProfile {
    return {
      development: {
        name: 'Development',
        description: 'Local development with debug enabled and relaxed security',
        settings: {
          NODE_ENV: 'development',
          H3X_ENV: 'development',
          DEBUG: 'true',
          LOG_LEVEL: 'debug',
          HOT_RELOAD: 'true',
          ENABLE_DEBUG_PORTS: 'true',
          VERBOSE_LOGGING: 'true',
          ENABLE_DEV_TOOLS: 'true',
          API_RATE_LIMIT: '10000',
          CORS_ORIGIN: 'http://localhost:3000,http://localhost:3978,http://localhost:8080,http://localhost:8081',
          MONGODB_URI: 'mongodb://localhost:27017/h3x_dev',
          REDIS_URL: 'redis://localhost:6379',
          LMSTUDIO_URL: 'http://localhost:1234',
          MAINTENANCE_HEALTH_CHECK_INTERVAL: '5',
          FEATURE_INTELLIGENT_SCHEDULING: 'true',
          FEATURE_PREDICTIVE_ANALYTICS: 'true',
          FEATURE_AUTO_CONFLICT_RESOLUTION: 'true'
        },
        requiredSecrets: [],
        optionalSecrets: ['GITHUB_TOKEN', 'OPENAI_API_KEY', 'WEATHER_API_KEY']
      },

      production: {
        name: 'Production',
        description: 'Production environment with security hardening and monitoring',
        settings: {
          NODE_ENV: 'production',
          H3X_ENV: 'production',
          DEBUG: 'false',
          LOG_LEVEL: 'info',
          HOT_RELOAD: 'false',
          ENABLE_DEBUG_PORTS: 'false',
          VERBOSE_LOGGING: 'false',
          ENABLE_DEV_TOOLS: 'false',
          API_RATE_LIMIT: '100',
          CORS_ORIGIN: 'https://yourdomain.com',
          MONGODB_URI: 'mongodb://h3x-mongodb:27017/h3x_prod',
          REDIS_URL: 'redis://h3x-redis:6379',
          LMSTUDIO_URL: 'http://h3x-lmstudio:1234',
          ENABLE_HTTPS: 'true',
          MAINTENANCE_HEALTH_CHECK_INTERVAL: '60',
          METRICS_ENABLE: 'true',
          ANALYTICS_ENABLE: 'true',
          BACKUP_ENABLE: 'true',
          NOTIFICATIONS_ENABLE: 'true'
        },
        requiredSecrets: ['GITHUB_TOKEN', 'JWT_SECRET', 'API_SECRET'],
        optionalSecrets: ['OPENAI_API_KEY', 'WEATHER_API_KEY', 'DISCORD_WEBHOOK_URL', 'SLACK_WEBHOOK_URL']
      },

      testing: {
        name: 'Testing',
        description: 'Testing environment with isolated databases and mock services',
        settings: {
          NODE_ENV: 'test',
          H3X_ENV: 'testing',
          DEBUG: 'false',
          LOG_LEVEL: 'warn',
          MONGODB_URI: 'mongodb://localhost:27017/h3x_test',
          REDIS_URL: 'redis://localhost:6379/1',
          API_RATE_LIMIT: '1000',
          MAINTENANCE_HEALTH_CHECK_INTERVAL: '1',
          FEEDBACK_ENABLE: 'false',
          PULSE_ENABLE: 'false',
          NOTIFICATIONS_ENABLE: 'false',
          METRICS_ENABLE: 'false'
        },
        requiredSecrets: [],
        optionalSecrets: []
      },

      docker: {
        name: 'Docker',
        description: 'Docker containerized environment with service discovery',
        settings: {
          NODE_ENV: 'development',
          H3X_ENV: 'docker',
          DEBUG: 'true',
          LOG_LEVEL: 'info',
          MONGODB_URI: 'mongodb://h3x-mongodb:27017/h3x_docker',
          REDIS_URL: 'redis://h3x-redis:6379',
          LMSTUDIO_URL: 'http://h3x-lmstudio:1234',
          DOCKER_NETWORK: 'h3x-network',
          CONTAINER_PREFIX: 'h3x',
          COMPOSE_PROJECT_NAME: 'h3x-docker'
        },
        requiredSecrets: [],
        optionalSecrets: ['GITHUB_TOKEN', 'OPENAI_API_KEY']
      }
    };
  }

  // Switch to a specific environment
  async switchEnvironment(environmentName: keyof EnvironmentProfile): Promise<void> {
    const profiles = this.getEnvironmentProfiles();
    const profile = profiles[environmentName];

    if (!profile) {
      throw new Error(`Unknown environment: ${environmentName}`);
    }

    console.log(`🔄 Switching to ${profile.name} environment...`);
    console.log(`📝 ${profile.description}`);

    // Backup current .env file
    await this.backupCurrentEnv();

    // Read current .env file
    const currentEnv = await this.readCurrentEnv();

    // Merge with profile settings
    const newEnv = { ...currentEnv, ...profile.settings };

    // Write new .env file
    await this.writeEnvFile(newEnv);

    // Validate required secrets
    await this.validateSecrets(profile);

    console.log(`✅ Successfully switched to ${profile.name} environment`);
    console.log(`📁 Backup saved to: ${this.backupDir}`);

    // Show next steps
    this.showNextSteps(profile);
  }

  // Backup current environment
  private async backupCurrentEnv(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `.env.backup.${timestamp}`);
      
      const currentContent = await fs.readFile(this.envFile, 'utf-8');
      await fs.writeFile(backupFile, currentContent);
      
      console.log(`💾 Backed up current environment to: ${backupFile}`);
    } catch (error) {
      console.warn('⚠️  Could not backup current environment:', error);
    }
  }

  // Read current .env file
  private async readCurrentEnv(): Promise<Record<string, string>> {
    try {
      const content = await fs.readFile(this.envFile, 'utf-8');
      const env: Record<string, string> = {};
      
      content.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#') && line.includes('=')) {
          const [key, ...valueParts] = line.split('=');
          env[key.trim()] = valueParts.join('=').trim();
        }
      });
      
      return env;
    } catch (error) {
      console.warn('⚠️  Could not read current .env file, starting fresh');
      return {};
    }
  }

  // Write .env file
  private async writeEnvFile(env: Record<string, string>): Promise<void> {
    const lines = [
      '# ================================',
      '# H3X ENVIRONMENT CONFIGURATION',
      '# ================================',
      `# Generated by H3X Environment Manager`,
      `# Timestamp: ${new Date().toISOString()}`,
      '',
    ];

    // Group related settings
    const groups = {
      'CORE SYSTEM': ['NODE_ENV', 'H3X_ENV', 'DEBUG', 'LOG_LEVEL', 'PORT'],
      'MAINTENANCE AGENT': ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'MAINTENANCE_'],
      'DATABASE': ['MONGODB_', 'REDIS_'],
      'AI/ML': ['LMSTUDIO_', 'OPENAI_'],
      'SECURITY': ['JWT_SECRET', 'API_SECRET', 'SECRET_KEY', 'CORS_', 'SSL_'],
      'MONITORING': ['HEALTH_', 'METRICS_', 'ANALYTICS_', 'PROMETHEUS_'],
      'NOTIFICATIONS': ['NOTIFICATIONS_', 'DISCORD_', 'SLACK_', 'EMAIL_'],
      'FEATURES': ['FEATURE_'],
      'OTHER': []
    };

    // Add grouped settings
    for (const [groupName, prefixes] of Object.entries(groups)) {
      const groupVars = Object.entries(env).filter(([key]) => 
        prefixes.some(prefix => key.startsWith(prefix)) || 
        (groupName === 'OTHER' && !Object.values(groups).flat().some(p => p && key.startsWith(p)))
      );

      if (groupVars.length > 0) {
        lines.push(`# ${groupName}`);
        groupVars.forEach(([key, value]) => {
          lines.push(`${key}=${value}`);
        });
        lines.push('');
      }
    }

    await fs.writeFile(this.envFile, lines.join('\n'));
  }

  // Validate required secrets
  private async validateSecrets(profile: EnvironmentConfig): Promise<void> {
    const currentEnv = await this.readCurrentEnv();
    const missingSecrets: string[] = [];

    profile.requiredSecrets.forEach(secret => {
      if (!currentEnv[secret] || currentEnv[secret].trim() === '') {
        missingSecrets.push(secret);
      }
    });

    if (missingSecrets.length > 0) {
      console.log('\n⚠️  Missing required secrets:');
      missingSecrets.forEach(secret => {
        console.log(`   - ${secret}`);
      });
      console.log('\n💡 Add these to your .env file for full functionality');
    }

    const emptyOptionalSecrets = profile.optionalSecrets.filter(secret => 
      !currentEnv[secret] || currentEnv[secret].trim() === ''
    );

    if (emptyOptionalSecrets.length > 0) {
      console.log('\n💡 Optional secrets you can configure:');
      emptyOptionalSecrets.forEach(secret => {
        console.log(`   - ${secret}`);
      });
    }
  }

  // Show next steps
  private showNextSteps(profile: EnvironmentConfig): void {
    console.log('\n🚀 Next Steps:');
    
    if (profile.name === 'Development') {
      console.log('   1. Set GITHUB_TOKEN for maintenance agent functionality');
      console.log('   2. Run: npm run maintenance:health');
      console.log('   3. Start development: npm run dev');
    } else if (profile.name === 'Production') {
      console.log('   1. Set all required secrets in .env file');
      console.log('   2. Configure SSL certificates');
      console.log('   3. Run: npm run maintenance:health');
      console.log('   4. Start production: npm start');
    } else if (profile.name === 'Docker') {
      console.log('   1. Run: docker-compose up -d');
      console.log('   2. Check services: docker-compose ps');
      console.log('   3. View logs: docker-compose logs -f');
    }
    
    console.log('   📚 Documentation: docs/Remote-Maintenance-Agent.md');
  }

  // List available environments
  listEnvironments(): void {
    const profiles = this.getEnvironmentProfiles();
    
    console.log('🌍 Available Environments:\n');
    
    Object.entries(profiles).forEach(([key, profile]) => {
      console.log(`📋 ${key.toUpperCase()}`);
      console.log(`   Name: ${profile.name}`);
      console.log(`   Description: ${profile.description}`);
      console.log(`   Required Secrets: ${profile.requiredSecrets.length || 'None'}`);
      console.log(`   Optional Secrets: ${profile.optionalSecrets.length || 'None'}`);
      console.log('');
    });
  }

  // Show current environment status
  async showStatus(): Promise<void> {
    try {
      const currentEnv = await this.readCurrentEnv();
      
      console.log('📊 Current Environment Status:\n');
      console.log(`Environment: ${currentEnv.H3X_ENV || 'unknown'}`);
      console.log(`Node Environment: ${currentEnv.NODE_ENV || 'unknown'}`);
      console.log(`Debug Mode: ${currentEnv.DEBUG || 'false'}`);
      console.log(`Log Level: ${currentEnv.LOG_LEVEL || 'info'}`);
      
      console.log('\n🔑 Secret Status:');
      const secrets = ['GITHUB_TOKEN', 'OPENAI_API_KEY', 'JWT_SECRET', 'API_SECRET'];
      secrets.forEach(secret => {
        const value = currentEnv[secret];
        const status = value && value.trim() !== '' ? '✅ Set' : '❌ Missing';
        console.log(`   ${secret}: ${status}`);
      });
      
      console.log('\n🚀 Services:');
      console.log(`   MongoDB: ${currentEnv.MONGODB_URI || 'Not configured'}`);
      console.log(`   Redis: ${currentEnv.REDIS_URL || 'Not configured'}`);
      console.log(`   LM Studio: ${currentEnv.LMSTUDIO_URL || 'Not configured'}`);
      
    } catch (error) {
      console.error('❌ Could not read environment status:', error);
    }
  }

  // Generate secure secrets
  generateSecrets(): Record<string, string> {
    const generateSecret = (length: number = 32): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    return {
      JWT_SECRET: `h3x_jwt_${generateSecret(32)}_${Date.now()}`,
      API_SECRET: `h3x_api_${generateSecret(32)}_${Date.now()}`,
      SECRET_KEY: `h3x_master_${generateSecret(32)}_${Date.now()}`
    };
  }
}

// CLI Interface
async function main(): Promise<void> {
  const manager = new EnvironmentManager();
  const command = process.argv[2];
  const environment = process.argv[3] as keyof EnvironmentProfile;

  try {
    switch (command) {
      case 'switch':
        if (!environment) {
          console.error('❌ Please specify an environment: development, production, testing, or docker');
          process.exit(1);
        }
        await manager.switchEnvironment(environment);
        break;

      case 'list':
        manager.listEnvironments();
        break;

      case 'status':
        await manager.showStatus();
        break;

      case 'secrets':
        const secrets = manager.generateSecrets();
        console.log('🔐 Generated Secure Secrets:\n');
        Object.entries(secrets).forEach(([key, value]) => {
          console.log(`${key}=${value}`);
        });
        console.log('\n💡 Copy these to your .env file');
        break;

      default:
        console.log(`
🌍 H3X Environment Manager

Usage:
  npm run env:switch <environment>  Switch to specific environment
  npm run env:list                  List available environments  
  npm run env:status                Show current environment status
  npm run env:secrets               Generate secure secrets

Environments:
  development  - Local development with debug enabled
  production   - Production with security hardening
  testing      - Testing with isolated services
  docker       - Docker containerized environment

Examples:
  npm run env:switch development
  npm run env:switch production
  npm run env:status
        `);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { EnvironmentManager };
