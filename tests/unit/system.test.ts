/**
 * Sample unit test for H3X system
 */

import { describe, it, expect } from 'vitest';

import { createMockH3XSystem } from '../utils/test-utils';

describe('H3X System Unit Tests', () => {
  it('should create a valid H3X system mock', () => {
    const mockSystem = createMockH3XSystem();

    expect(mockSystem).toBeDefined();
    expect(mockSystem.log).toBeDefined();
    expect(mockSystem.createCFlup).toBeDefined();
    expect(mockSystem.listCFlups).toBeDefined();
  });

  it('should handle system status requests', async () => {
    const mockSystem = createMockH3XSystem();
    const status = await mockSystem.getStatus();

    // Replace custom matcher with plain assertion for Vitest compatibility
    expect(status).toBeDefined();
    expect(typeof status).toBe('object');
    expect('status' in status).toBe(true);
    expect('timestamp' in status).toBe(true);
    expect(status.status).toBe('ok');
  });

  it('should log messages correctly', () => {
    const mockSystem = createMockH3XSystem();

    mockSystem.log('Test message');

    expect(mockSystem.log).toHaveBeenCalledWith('Test message');
    expect(mockSystem.log).toHaveBeenCalledTimes(1);
  });
});
