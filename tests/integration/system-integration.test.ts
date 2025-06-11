/**
 * Sample integration test for H3X system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setupBrowserMocks, waitFor } from '../utils/test-utils';

describe('H3X System Integration Tests', () => {
  beforeEach(() => {
    setupBrowserMocks();
  });

  it('should integrate with localStorage', async () => {
    const testKey = 'h3x-test-data';
    const testValue = JSON.stringify({ test: true });

    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);

    expect(retrieved).toBe(testValue);
    expect(JSON.parse(retrieved!)).toEqual({ test: true });
  });

  it('should handle async operations', async () => {
    let completed = false;

    setTimeout(() => {
      completed = true;
    }, 100);

    await waitFor(() => completed, { timeout: 1000 });

    expect(completed).toBe(true);
  });
});
