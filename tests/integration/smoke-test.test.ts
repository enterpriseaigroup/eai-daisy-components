/**
 * Smoke test to verify test infrastructure is working
 */

import { describe, expect, it } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs/promises';

describe('Test Infrastructure Smoke Test', () => {
  it('should have test fixtures created', async () => {
    const v1ButtonPath = path.join(__dirname, '../fixtures/components/v1/Button.tsx');
    const v2ButtonPath = path.join(__dirname, '../fixtures/components/v2/Button.tsx');

    const v1Exists = await fs.access(v1ButtonPath).then(() => true).catch(() => false);
    const v2Exists = await fs.access(v2ButtonPath).then(() => true).catch(() => false);

    expect(v1Exists).toBe(true);
    expect(v2Exists).toBe(true);
  });

  it('should be able to read v1 Button component', async () => {
    const v1ButtonPath = path.join(__dirname, '../fixtures/components/v1/Button.tsx');
    const content = await fs.readFile(v1ButtonPath, 'utf-8');

    expect(content).toContain('export const Button');
    expect(content).toContain('useState');
    expect(content).toContain('useEffect');
  });

  it('should be able to read v2 Button component', async () => {
    const v2ButtonPath = path.join(__dirname, '../fixtures/components/v2/Button.tsx');
    const content = await fs.readFile(v2ButtonPath, 'utf-8');

    expect(content).toContain('export const Button');
    expect(content).toContain('useState');
    expect(content).toContain('useEffect');
  });

  it('should verify webpack is available', async () => {
    const webpack = await import('webpack').catch(() => null);
    expect(webpack).not.toBeNull();
  });

  it('should verify TypeScript compiler API is available', async () => {
    const ts = await import('typescript').catch(() => null);
    expect(ts).not.toBeNull();
  });

  it('should verify all test dependencies are installed', () => {
    // Verify key packages are available
    expect(require.resolve('webpack')).toBeTruthy();
    expect(require.resolve('typescript')).toBeTruthy();
    expect(require.resolve('@playwright/test')).toBeTruthy();
    expect(require.resolve('pixelmatch')).toBeTruthy();
  });
});
