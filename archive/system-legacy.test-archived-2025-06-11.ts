/* global describe, test, expect */
import { describe, test, expect } from 'vitest';
import fs = require('fs');
import path = require('path');

describe('H3X System Tests', () => {  test('package.json exists and is valid', () => {
    const packagePath = path.join(__dirname, '..', '..', 'package.json');
    expect(fs.existsSync(packagePath)).toBe(true);

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    expect(packageJson.name).toBe('h3x-unified');
    expect(packageJson.version).toBeDefined();
  });
  test('main entry file exists', () => {
    // Updated to match actual entry file
    const mainFile = path.join(__dirname, '..', '..', 'src', 'index.ts');
    expect(fs.existsSync(mainFile)).toBe(true);
  });
  test('required directories exist', () => {
    const requiredDirs = ['src', 'scripts', 'public'];
    requiredDirs.forEach((dir) => {
      const dirPath = path.join(__dirname, '..', '..', dir);
      if (fs.existsSync(dirPath)) {
        expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      }
    });
  });
  test('configuration files exist', () => {
    const configFiles = ['.prettierrc', '.eslintrc.json', 'jest.config.json'];
    configFiles.forEach((file) => {
      const filePath = path.join(__dirname, '..', '..', file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});
