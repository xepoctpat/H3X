/* global describe, test, expect */
// Integration test for H3X TypeScript automation
import { describe, test, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';

describe('H3X TypeScript Automation', () => {
  test('should have TypeScript configuration', async () => {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    const tsconfig = await fs.readFile(tsconfigPath, 'utf-8');
    const config = JSON.parse(tsconfig);

    expect(config.compilerOptions).toBeDefined();
    expect(config.compilerOptions.target).toBeDefined();
    expect(config.compilerOptions.module).toBeDefined();
  });

  test('should have automation scripts in TypeScript', async () => {
    const scriptsDir = path.join(process.cwd(), 'scripts');
    const files = await fs.readdir(scriptsDir);

    const tsFiles = files.filter((file) => file.endsWith('.ts'));
    expect(tsFiles.length).toBeGreaterThan(0);

    // Check for key automation scripts
    expect(tsFiles).toContain('h3x-dev-automation.ts');
    expect(tsFiles).toContain('workflow-orchestrator.ts');
    expect(tsFiles).toContain('pre-commit-hook.ts');
  });

  test('should be able to import TypeScript modules', async () => {
    // Test that TypeScript compilation works
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      const { stdout } = await execAsync('npx tsc --noEmit');
      // If tsc exits successfully (no output), compilation passed
      expect(typeof stdout).toBe('string');
    } catch (error: any) {
      // If there are TypeScript errors, they should be reported
      console.log('TypeScript compilation errors:', error.stdout || error.message);
      throw error;
    }
  });

  test('should have proper npm scripts for TypeScript execution', async () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    // Check that scripts use tsx for TypeScript execution
    expect(packageJson.scripts).toBeDefined();

    const tsxScripts = Object.entries(packageJson.scripts).filter(([, script]: [string, any]) =>
      script.includes('npx tsx'),
    );

    expect(tsxScripts.length).toBeGreaterThan(0);
  });
});

describe('H3X Automation Scripts Health', () => {
  const scriptsDir = path.join(process.cwd(), 'scripts');

  test('should have readable automation scripts', async () => {
    const mainScripts = [
      'h3x-dev-automation.ts',
      'workflow-orchestrator.ts',
      'pre-commit-hook.ts',
      'setup-typescript-automation.ts',
    ];

    for (const script of mainScripts) {
      const scriptPath = path.join(scriptsDir, script);
      const content = await fs.readFile(scriptPath, 'utf-8');

      expect(content).toContain('export');
      expect(content.length).toBeGreaterThan(100);
    }
  });

  test('should have type definitions', async () => {
    const typesPath = path.join(scriptsDir, 'types.ts');
    const content = await fs.readFile(typesPath, 'utf-8');

    expect(content).toContain('interface');
    expect(content).toContain('export');
  });
});
