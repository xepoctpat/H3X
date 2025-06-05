/**
 * H3X Automation System Type Definitions
 */

export interface AutomationConfig {
  linting: LintingConfig;
  testing: TestingConfig;
  building: BuildingConfig;
  monitoring: MonitoringConfig;
  git: GitConfig;
  docker: DockerConfig;
}

export interface LintingConfig {
  enabled: boolean;
  tools: string[];
  autofix: boolean;
  failOnError: boolean;
  extensions: string[];
}

export interface TestingConfig {
  enabled: boolean;
  frameworks: string[];
  coverage: boolean;
  threshold: number;
  timeout: number;
}

export interface BuildingConfig {
  enabled: boolean;
  targets: string[];
  minify: boolean;
  sourcemap: boolean;
}

export interface MonitoringConfig {
  healthCheck: boolean;
  performance: boolean;
  security: boolean;
  interval: number;
}

export interface GitConfig {
  preCommitHooks: boolean;
  autoCommit: boolean;
  commitMessage: string;
  pushAfterCommit: boolean;
}

export interface DockerConfig {
  enabled: boolean;
  compose: string;
  services: string[];
  healthCheck: boolean;
}

export interface ProcessInfo {
  pid: number;
  command: string;
  startTime: Date;
  status: 'running' | 'stopped' | 'error';
}

export interface AutomationResult {
  success: boolean;
  message: string;
  duration: number;
  details?: any;
  errors?: string[];
  warnings?: string[];
}

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  module: string;
  data?: any;
}

export interface WorkflowStep {
  name: string;
  command: string;
  description: string;
  required: boolean;
  timeout: number;
  retries: number;
}

export interface WorkflowConfig {
  name: string;
  description: string;
  steps: WorkflowStep[];
  parallel: boolean;
  continueOnError: boolean;
}

export interface TestSuite {
  name: string;
  files: string[];
  framework: string;
  coverage: boolean;
  timeout: number;
}

export interface BuildTarget {
  name: string;
  input: string;
  output: string;
  minify: boolean;
  sourcemap: boolean;
}

export interface SecurityScan {
  vulnerabilities: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  fixes: string[];
}

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  message: string;
  timestamp: Date;
}

export interface MetricsData {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  processes: number;
  timestamp: Date;
}
