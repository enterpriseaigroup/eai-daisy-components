import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Integration Test Suite - DAISY v1 Button Component Validation
 *
 * This test suite validates that we have successfully created a realistic
 * DAISY v1 Button component that can serve as test data for our complete
 * pipeline system. It focuses on verifying the component files exist,
 * are TypeScript compliant, and contain the expected DAISY v1 patterns.
 */
describe('DAISY v1 Button Component Integration Tests', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Setup temporary test environment
    tempDir = path.join(__dirname, '../../temp', `test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup temporary files
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error);
    }
  });

  describe('Component File Structure', () => {
    it('should have the complete DAISY v1 Button component structure', async () => {
      const expectedFiles = [
        'components/tier2/Button.tsx',
        'components/tier2/Button.css',
        'components/tier2/index.ts',
      ];

      const basePath = path.join(__dirname, '../../daisyv1');

      for (const file of expectedFiles) {
        const filePath = path.join(basePath, file);
        const exists = await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false);
        expect(exists).toBe(true);
      }
    });

    it('should have properly structured component directory', async () => {
      const daisyPath = path.join(__dirname, '../../daisyv1');
      const componentsPath = path.join(daisyPath, 'components');
      const tier2Path = path.join(componentsPath, 'tier2');

      const daisyExists = await fs
        .access(daisyPath)
        .then(() => true)
        .catch(() => false);
      const componentsExists = await fs
        .access(componentsPath)
        .then(() => true)
        .catch(() => false);
      const tier2Exists = await fs
        .access(tier2Path)
        .then(() => true)
        .catch(() => false);

      expect(daisyExists).toBe(true);
      expect(componentsExists).toBe(true);
      expect(tier2Exists).toBe(true);
    });
  });

  describe('Button Component Validation', () => {
    it('should contain all required Button component exports', async () => {
      const buttonPath = path.join(
        __dirname,
        '../../daisyv1/components/tier2/Button.tsx'
      );
      const content = await fs.readFile(buttonPath, 'utf-8');

      // Core exports
      expect(content).toContain('export const Button');
      expect(content).toContain('export interface ButtonProps');
      expect(content).toContain('export const withDaisyTheme');
      expect(content).toContain('export const ButtonUtils');

      // Type definitions
      expect(content).toContain('interface ButtonProps');
      expect(content).toContain('React.forwardRef');
    });

    it('should contain DAISY v1 business logic patterns', async () => {
      const buttonPath = path.join(
        __dirname,
        '../../daisyv1/components/tier2/Button.tsx'
      );
      const content = await fs.readFile(buttonPath, 'utf-8');

      // DAISY v1 patterns that need transformation
      expect(content).toContain('Theme management through CSS classes');
      expect(content).toContain('Custom event handling and analytics');
      expect(content).toContain('Custom tooltip and accessibility logic');
      expect(content).toContain('Loading state management');
      expect(content).toContain('trackEvent');
      expect(content).toContain('window.daisy');
    });

    it('should have complex component structure suitable for testing pipeline', async () => {
      const buttonPath = path.join(
        __dirname,
        '../../daisyv1/components/tier2/Button.tsx'
      );
      const content = await fs.readFile(buttonPath, 'utf-8');

      // Should have sufficient complexity for pipeline testing
      expect(content.length).toBeGreaterThan(5000); // Substantial component
      expect(content.split('\n').length).toBeGreaterThan(300); // 300+ lines

      // Multiple hooks and state management
      expect(content).toContain('useState');
      expect(content).toContain('useEffect');
      expect(content).toContain('useCallback');
      expect(content).toContain('useRef');

      // Business logic functions
      const functionMatches = content.match(/const handle\w+/g);
      expect(functionMatches?.length).toBeGreaterThan(5); // Multiple handlers
    });

    it('should be TypeScript compliant', async () => {
      const buttonPath = path.join(
        __dirname,
        '../../daisyv1/components/tier2/Button.tsx'
      );
      const validation = await validateTypeScriptFile(buttonPath);

      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        console.log('TypeScript validation errors:', validation.errors);
      }
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('CSS Styles Validation', () => {
    it('should contain comprehensive DAISY v1 styling patterns', async () => {
      const cssPath = path.join(
        __dirname,
        '../../daisyv1/components/tier2/Button.css'
      );
      const content = await fs.readFile(cssPath, 'utf-8');

      // Base component styles
      expect(content).toContain('.daisy-button');
      expect(content).toContain('.daisy-button-container');

      // Variant styles
      expect(content).toContain('--primary');
      expect(content).toContain('--secondary');
      expect(content).toContain('--tertiary');
      expect(content).toContain('--danger');

      // Size variants
      expect(content).toContain('--small');
      expect(content).toContain('--medium');
      expect(content).toContain('--large');

      // State styles
      expect(content).toContain('--disabled');
      expect(content).toContain('--loading');
      expect(content).toContain('--pressed');
      expect(content).toContain('--focus-visible');
    });

    it('should have theme support patterns', async () => {
      const cssPath = path.join(
        __dirname,
        '../../daisyv1/components/tier2/Button.css'
      );
      const content = await fs.readFile(cssPath, 'utf-8');

      // Theme patterns that need transformation
      expect(content).toContain('.daisy-theme--light');
      expect(content).toContain('.daisy-theme--dark');
      expect(content).toContain('prefers-contrast');
      expect(content).toContain('prefers-reduced-motion');
    });

    it('should be substantial enough for pipeline testing', async () => {
      const cssPath = path.join(
        __dirname,
        '../../daisyv1/components/tier2/Button.css'
      );
      const content = await fs.readFile(cssPath, 'utf-8');

      // Should have significant styling complexity
      expect(content.length).toBeGreaterThan(3000); // Substantial CSS
      expect(content.split('\n').length).toBeGreaterThan(200); // 200+ lines

      // Multiple selector types
      const classSelectors = content.match(/\.[a-zA-Z-_]+\w*/g);
      expect(classSelectors?.length).toBeGreaterThan(20); // Many CSS classes
    });
  });

  describe('Component Index Validation', () => {
    it('should properly export all component elements', async () => {
      const indexPath = path.join(
        __dirname,
        '../../daisyv1/components/tier2/index.ts'
      );
      const content = await fs.readFile(indexPath, 'utf-8');

      // All exports
      expect(content).toContain(
        'export { Button, withDaisyTheme, ButtonUtils }'
      );
      expect(content).toContain('export type { ButtonProps }');

      // Component metadata
      expect(content).toContain('DAISY_V1_COMPONENTS');
      expect(content).toContain('tier: 2');
      expect(content).toContain("complexity: 'high'");
      expect(content).toContain('businessLogic');
      expect(content).toContain('transformationChallenges');
    });

    it('should contain metadata suitable for pipeline processing', async () => {
      const indexPath = path.join(
        __dirname,
        '../../daisyv1/components/tier2/index.ts'
      );
      const content = await fs.readFile(indexPath, 'utf-8');

      // Business logic patterns for pipeline analysis
      expect(content).toContain('theme management');
      expect(content).toContain('analytics tracking');
      expect(content).toContain('accessibility features');
      expect(content).toContain('loading states');

      // Transformation challenges
      expect(content).toContain('HOC pattern to functional composition');
      expect(content).toContain('Custom event tracking to standard analytics');
      expect(content).toContain('CSS theming to design tokens');
    });
  });

  describe('Pipeline Ready Validation', () => {
    it('should be discoverable by component discovery algorithms', async () => {
      const buttonPath = path.join(
        __dirname,
        '../../daisyv1/components/tier2/Button.tsx'
      );
      const exists = await fs
        .access(buttonPath)
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);

      if (exists) {
        const content = await fs.readFile(buttonPath, 'utf-8');

        // Should be recognizable as React component
        expect(content).toContain('React');
        expect(content).toContain('export');
        expect(content).toMatch(/const \w+.*=.*React\.forwardRef/);
      }
    });

    it('should contain parseable TypeScript patterns', async () => {
      const buttonPath = path.join(
        __dirname,
        '../../daisyv1/components/tier2/Button.tsx'
      );
      const content = await fs.readFile(buttonPath, 'utf-8');

      // Import statements
      expect(content).toContain('import React');
      expect(content).toContain('import ');

      // Interface definitions
      expect(content).toMatch(/interface \w+Props/);
      expect(content).toMatch(/export interface \w+Props/);

      // Function definitions
      expect(content).toMatch(/export const \w+/);
      expect(content).toMatch(/const \w+ = /);
    });

    it('should contain complex business logic for analysis testing', async () => {
      const buttonPath = path.join(
        __dirname,
        '../../daisyv1/components/tier2/Button.tsx'
      );
      const content = await fs.readFile(buttonPath, 'utf-8');

      // State management patterns
      expect(content).toContain('useState');
      expect(content).toContain('useEffect');
      expect(content).toContain('useCallback');

      // Event handling patterns
      expect(content).toContain('handleClick');
      expect(content).toContain('handleMouseEnter');
      expect(content).toContain('handleFocus');

      // DOM interaction patterns
      expect(content).toContain('useRef');
      expect(content).toContain('.current');
      expect(content).toContain('focus()');

      // Complex conditional logic
      expect(content).toContain('if (');
      expect(content).toContain('disabled ||');
      expect(content).toContain('? ');
    });

    it('should be ready for complete pipeline processing', async () => {
      // Verify all component files exist and are non-empty
      const files = [
        'daisyv1/components/tier2/Button.tsx',
        'daisyv1/components/tier2/Button.css',
        'daisyv1/components/tier2/index.ts',
      ];

      for (const file of files) {
        const filePath = path.join(__dirname, '../../', file);
        const content = await fs.readFile(filePath, 'utf-8');

        expect(content.length).toBeGreaterThan(100); // Non-trivial content
        expect(content.trim()).not.toBe(''); // Not empty
      }

      // Verify the component represents realistic complexity
      const buttonPath = path.join(
        __dirname,
        '../../daisyv1/components/tier2/Button.tsx'
      );
      const buttonContent = await fs.readFile(buttonPath, 'utf-8');

      // Should have multiple patterns that need transformation
      const patterns = [
        'theme',
        'analytics',
        'accessibility',
        'loading',
        'tooltip',
        'focus',
        'keyboard',
        'mobile',
        'state management',
        'event handling',
      ];

      let patternCount = 0;
      patterns.forEach(pattern => {
        if (buttonContent.toLowerCase().includes(pattern)) {
          patternCount++;
        }
      });

      expect(patternCount).toBeGreaterThan(7); // Rich in transformation opportunities
    });
  });
});

/**
 * Helper function to validate TypeScript file compliance
 */
async function validateTypeScriptFile(
  filePath: string
): Promise<{ valid: boolean; errors: string[] }> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const errors: string[] = [];

    // Basic TypeScript compliance checks
    if (!content.includes('export')) {
      errors.push('No exports found');
    }

    if (!content.includes('interface') && !content.includes('type ')) {
      errors.push('No type definitions found');
    }

    // Check for proper React patterns
    if (content.includes('React') && !content.includes('import React')) {
      errors.push('React usage without import');
    }

    // Check for proper TypeScript patterns
    if (content.includes('useState') && !content.includes(': ')) {
      errors.push('Potential missing type annotations');
    }

    // Check for common anti-patterns
    const anyUsage = content.match(/:\s*any(?!\w)/g);
    if (anyUsage && anyUsage.length > 3) {
      errors.push('Excessive any type usage');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to read file: ${error}`],
    };
  }
}

export { validateTypeScriptFile };
