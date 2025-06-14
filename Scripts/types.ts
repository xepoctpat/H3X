// Type definitions for H3X automation scripts
export interface AutomationConfig {
  linting: {
    enabled: boolean;
    tools: string[];
    autofix: boolean;
    failOnError: boolean;
    extensions: string[];
  };
  testing: {
    enabled: boolean;
    frameworks: string[];
    coverage: boolean;
    threshold: number;
    timeout: number;
  };
  building: {
    enabled: boolean;
    targets: string[];
    typescript: boolean;
    minify: boolean;
    watch: boolean;
  };
  monitoring: {
    enabled: boolean;
    healthChecks: boolean;
    performance: boolean;
    security: boolean;
  };
}

export interface AutomationResult {
  success: boolean;
  message: string;
  duration: number;
  errors?: string[];
}

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  message: string;
  timestamp: string;
}
