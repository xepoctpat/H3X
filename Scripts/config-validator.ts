#!/usr/bin/env node
/**
 * H3X Configuration Validator
 * 
 * Validates environment configuration and system readiness
 * Provides detailed diagnostics and recommendations
 */

import { promises as fs } from 'fs';
import * as path from 'path';

interface ValidationResult {
  category: string;
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  recommendation?: string;
}

interface SystemCheck {
  name: string;
  check: () => Promise<ValidationResult>;
}

class ConfigValidator {
  private projectRoot: string;
  private envFile: string;
  private env: Record<string, string> = {};

  constructor() {
    this.projectRoot = process.cwd();
    this.envFile = path.join(this.projectRoot, '.env');
  }

  // Load environment variables
  private async loadEnvironment(): Promise<void> {
    try {
      const content = await fs.readFile(this.envFile, 'utf-8');
      
      content.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#') && line.includes('=')) {
          const [key, ...valueParts] = line.split('=');
          this.env[key.trim()] = valueParts.join('=').trim();
        }
      });
    } catch (error) {
      throw new Error('Could not load .env file. Run "npm run env:switch development" first.');
    }
  }

  // Get all system checks
  private getSystemChecks(): SystemCheck[] {
    return [
      // Core Configuration Checks
      {
        name: 'Environment Variables',
        check: async () => {
          const required = ['NODE_ENV', 'H3X_ENV', 'PORT'];
          const missing = required.filter(key => !this.env[key]);
          
          if (missing.length === 0) {
            return {
              category: 'Core',
              name: 'Environment Variables',
              status: 'pass',
              message: 'All required environment variables are set'
            };
          } else {
            return {
              category: 'Core',
              name: 'Environment Variables',
              status: 'fail',
              message: `Missing required variables: ${missing.join(', ')}`,
              recommendation: 'Run "npm run env:switch development" to set up environment'
            };
          }
        }
      },

      // Database Checks
      {
        name: 'MongoDB Configuration',
        check: async () => {
          const mongoUri = this.env.MONGODB_URI;
          if (!mongoUri) {
            return {
              category: 'Database',
              name: 'MongoDB Configuration',
              status: 'fail',
              message: 'MongoDB URI not configured',
              recommendation: 'Set MONGODB_URI in .env file'
            };
          }

          // Basic URI validation
          if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
            return {
              category: 'Database',
              name: 'MongoDB Configuration',
              status: 'warn',
              message: 'MongoDB URI format may be invalid',
              recommendation: 'Ensure URI starts with mongodb:// or mongodb+srv://'
            };
          }

          return {
            category: 'Database',
            name: 'MongoDB Configuration',
            status: 'pass',
            message: 'MongoDB configuration looks good'
          };
        }
      },

      {
        name: 'Redis Configuration',
        check: async () => {
          const redisUrl = this.env.REDIS_URL;
          if (!redisUrl) {
            return {
              category: 'Database',
              name: 'Redis Configuration',
              status: 'warn',
              message: 'Redis URL not configured',
              recommendation: 'Set REDIS_URL for caching functionality'
            };
          }

          return {
            category: 'Database',
            name: 'Redis Configuration',
            status: 'pass',
            message: 'Redis configuration looks good'
          };
        }
      },

      // Security Checks
      {
        name: 'JWT Secret',
        check: async () => {
          const jwtSecret = this.env.JWT_SECRET;
          if (!jwtSecret) {
            return {
              category: 'Security',
              name: 'JWT Secret',
              status: 'fail',
              message: 'JWT secret not set',
              recommendation: 'Run "npm run env:secrets" to generate secure secrets'
            };
          }

          if (jwtSecret.length < 32) {
            return {
              category: 'Security',
              name: 'JWT Secret',
              status: 'warn',
              message: 'JWT secret is too short (should be 32+ characters)',
              recommendation: 'Generate a longer, more secure JWT secret'
            };
          }

          return {
            category: 'Security',
            name: 'JWT Secret',
            status: 'pass',
            message: 'JWT secret is properly configured'
          };
        }
      },

      {
        name: 'API Security',
        check: async () => {
          const apiSecret = this.env.API_SECRET;
          const corsOrigin = this.env.CORS_ORIGIN;
          
          if (!apiSecret) {
            return {
              category: 'Security',
              name: 'API Security',
              status: 'warn',
              message: 'API secret not set',
              recommendation: 'Set API_SECRET for enhanced security'
            };
          }

          if (corsOrigin === '*' && this.env.NODE_ENV === 'production') {
            return {
              category: 'Security',
              name: 'API Security',
              status: 'warn',
              message: 'CORS is set to allow all origins in production',
              recommendation: 'Restrict CORS_ORIGIN to specific domains in production'
            };
          }

          return {
            category: 'Security',
            name: 'API Security',
            status: 'pass',
            message: 'API security configuration looks good'
          };
        }
      },

      // Maintenance Agent Checks
      {
        name: 'GitHub Token',
        check: async () => {
          const githubToken = this.env.GITHUB_TOKEN;
          if (!githubToken) {
            return {
              category: 'Maintenance',
              name: 'GitHub Token',
              status: 'warn',
              message: 'GitHub token not set',
              recommendation: 'Set GITHUB_TOKEN for full maintenance agent functionality'
            };
          }

          if (githubToken.length < 20) {
            return {
              category: 'Maintenance',
              name: 'GitHub Token',
              status: 'warn',
              message: 'GitHub token appears to be invalid',
              recommendation: 'Ensure GITHUB_TOKEN is a valid GitHub personal access token'
            };
          }

          return {
            category: 'Maintenance',
            name: 'GitHub Token',
            status: 'pass',
            message: 'GitHub token is configured'
          };
        }
      },

      {
        name: 'Maintenance Features',
        check: async () => {
          const features = [
            'MAINTENANCE_AUTO_MERGE_PRS',
            'MAINTENANCE_CONFLICT_RESOLUTION',
            'MAINTENANCE_HEALTH_MONITORING'
          ];

          const enabled = features.filter(feature => this.env[feature] === 'true');
          
          if (enabled.length === 0) {
            return {
              category: 'Maintenance',
              name: 'Maintenance Features',
              status: 'warn',
              message: 'No maintenance features enabled',
              recommendation: 'Enable maintenance features for automated repository management'
            };
          }

          return {
            category: 'Maintenance',
            name: 'Maintenance Features',
            status: 'pass',
            message: `${enabled.length} maintenance features enabled`
          };
        }
      },

      // AI/ML Checks
      {
        name: 'LM Studio Configuration',
        check: async () => {
          const lmstudioUrl = this.env.LMSTUDIO_URL;
          if (!lmstudioUrl) {
            return {
              category: 'AI/ML',
              name: 'LM Studio Configuration',
              status: 'warn',
              message: 'LM Studio URL not configured',
              recommendation: 'Set LMSTUDIO_URL if using local AI models'
            };
          }

          return {
            category: 'AI/ML',
            name: 'LM Studio Configuration',
            status: 'pass',
            message: 'LM Studio configuration looks good'
          };
        }
      },

      // File System Checks
      {
        name: 'Required Directories',
        check: async () => {
          const requiredDirs = ['logs', 'Scripts', 'src', 'config'];
          const missing: string[] = [];

          for (const dir of requiredDirs) {
            try {
              await fs.access(path.join(this.projectRoot, dir));
            } catch {
              missing.push(dir);
            }
          }

          if (missing.length > 0) {
            return {
              category: 'FileSystem',
              name: 'Required Directories',
              status: 'warn',
              message: `Missing directories: ${missing.join(', ')}`,
              recommendation: 'Create missing directories for proper functionality'
            };
          }

          return {
            category: 'FileSystem',
            name: 'Required Directories',
            status: 'pass',
            message: 'All required directories exist'
          };
        }
      },

      // Package Dependencies
      {
        name: 'Package Dependencies',
        check: async () => {
          try {
            const packageJson = JSON.parse(await fs.readFile(path.join(this.projectRoot, 'package.json'), 'utf-8'));
            const requiredDeps = ['tsx', 'mongodb', 'redis', 'express'];
            const missing = requiredDeps.filter(dep => 
              !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
            );

            if (missing.length > 0) {
              return {
                category: 'Dependencies',
                name: 'Package Dependencies',
                status: 'fail',
                message: `Missing required dependencies: ${missing.join(', ')}`,
                recommendation: 'Run "npm install" to install missing dependencies'
              };
            }

            return {
              category: 'Dependencies',
              name: 'Package Dependencies',
              status: 'pass',
              message: 'All required dependencies are installed'
            };
          } catch (error) {
            return {
              category: 'Dependencies',
              name: 'Package Dependencies',
              status: 'fail',
              message: 'Could not read package.json',
              recommendation: 'Ensure package.json exists and is valid'
            };
          }
        }
      }
    ];
  }

  // Run all validations
  async validate(): Promise<ValidationResult[]> {
    await this.loadEnvironment();
    
    const checks = this.getSystemChecks();
    const results: ValidationResult[] = [];

    console.log('🔍 Running H3X Configuration Validation...\n');

    for (const check of checks) {
      try {
        const result = await check.check();
        results.push(result);
        
        const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
        console.log(`${icon} ${result.category}: ${result.name}`);
        if (result.message) {
          console.log(`   ${result.message}`);
        }
        if (result.recommendation) {
          console.log(`   💡 ${result.recommendation}`);
        }
        console.log('');
      } catch (error: any) {
        results.push({
          category: 'System',
          name: check.name,
          status: 'fail',
          message: `Validation failed: ${error.message}`,
          recommendation: 'Check system configuration and try again'
        });
      }
    }

    return results;
  }

  // Generate summary report
  generateSummary(results: ValidationResult[]): void {
    const passed = results.filter(r => r.status === 'pass').length;
    const warnings = results.filter(r => r.status === 'warn').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const total = results.length;

    console.log('📊 Validation Summary:');
    console.log(`   ✅ Passed: ${passed}/${total}`);
    console.log(`   ⚠️  Warnings: ${warnings}/${total}`);
    console.log(`   ❌ Failed: ${failed}/${total}`);
    console.log('');

    if (failed === 0 && warnings === 0) {
      console.log('🎉 Perfect! Your H3X system is fully configured and ready to go!');
      console.log('');
      console.log('🚀 Next steps:');
      console.log('   1. Run: npm run maintenance:health');
      console.log('   2. Start the system: npm run dev');
      console.log('   3. Check the dashboard: npm run maintenance:dashboard');
    } else if (failed === 0) {
      console.log('✅ Good! Your system is functional with some optional improvements available.');
      console.log('');
      console.log('🚀 You can start using H3X now:');
      console.log('   1. Run: npm run maintenance:health');
      console.log('   2. Start the system: npm run dev');
    } else {
      console.log('⚠️  Some critical issues need to be resolved before using H3X.');
      console.log('');
      console.log('🔧 Fix the failed checks above, then run validation again:');
      console.log('   npm run config:validate');
    }
  }

  // Quick fix suggestions
  generateQuickFixes(results: ValidationResult[]): void {
    const failedResults = results.filter(r => r.status === 'fail');
    
    if (failedResults.length === 0) return;

    console.log('🔧 Quick Fix Commands:');
    console.log('');

    failedResults.forEach(result => {
      if (result.name === 'Environment Variables') {
        console.log('   # Set up development environment');
        console.log('   npm run env:switch development');
        console.log('');
      }
      
      if (result.name === 'JWT Secret') {
        console.log('   # Generate secure secrets');
        console.log('   npm run env:secrets');
        console.log('');
      }
      
      if (result.name === 'Package Dependencies') {
        console.log('   # Install missing dependencies');
        console.log('   npm install');
        console.log('');
      }
    });
  }
}

// CLI Interface
async function main(): Promise<void> {
  const validator = new ConfigValidator();
  
  try {
    const results = await validator.validate();
    validator.generateSummary(results);
    validator.generateQuickFixes(results);
    
    // Exit with appropriate code
    const hasFailed = results.some(r => r.status === 'fail');
    process.exit(hasFailed ? 1 : 0);
    
  } catch (error: any) {
    console.error('❌ Validation failed:', error.message);
    console.log('');
    console.log('💡 Try running: npm run env:switch development');
    process.exit(1);
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ConfigValidator };
