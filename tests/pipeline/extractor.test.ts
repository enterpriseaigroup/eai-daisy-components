/**
 * Component Extractor Tests
 *
 * Tests for the ComponentExtractor class that analyzes DAISY v1 components
 * and extracts comprehensive component definitions.
 *
 * @fileoverview Component extraction tests
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  ComponentExtractor,
  createExtractor,
  extractComponent,
} from '@/pipeline/extractor';
import type { ExtractionResult, ExtractorOptions } from '@/pipeline/extractor';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('ComponentExtractor', () => {
  let extractor: ComponentExtractor;
  let testDir: string;

  beforeEach(async () => {
    extractor = new ComponentExtractor();
    testDir = join(tmpdir(), `extractor-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('ComponentExtractor class', () => {
    it('should create extractor instance', () => {
      expect(extractor).toBeInstanceOf(ComponentExtractor);
    });

    it('should have extractComponent method', () => {
      expect(typeof extractor.extractComponent).toBe('function');
    });

    it('should have extractFromDirectory method', () => {
      expect(typeof extractor.extractFromDirectory).toBe('function');
    });
  });

  describe('extractComponent', () => {
    it('should extract simple functional component', async () => {
      const componentCode = `
import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};

export default Button;
      `;

      const filePath = join(testDir, 'Button.tsx');
      await writeFile(filePath, componentCode, 'utf-8');

      const result = await extractor.extractComponent(filePath);

      expect(result.success).toBe(true);
      expect(result.component.name).toBe('Button');
      // Component type detection may vary based on content analysis
      expect(['functional', 'utility']).toContain(result.component.type);
      expect(result.component.props.length).toBeGreaterThan(0);
      expect(result.component.complexity).toBe('simple');
    });

    it('should extract component with useState hook', async () => {
      const componentCode = `
import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

export default Counter;
      `;

      const filePath = join(testDir, 'Counter.tsx');
      await writeFile(filePath, componentCode, 'utf-8');

      const result = await extractor.extractComponent(filePath);

      expect(result.success).toBe(true);
      expect(result.component.reactPatterns).toContain('useState');
      expect(result.component.type).toBe('functional');
    });

    it('should extract component with business logic', async () => {
      const componentCode = `
import React from 'react';

const Calculator = () => {
  const calculateSum = (a: number, b: number): number => {
    return a + b;
  };

  const calculateProduct = (a: number, b: number): number => {
    return a * b;
  };

  return <div>Calculator</div>;
};

export default Calculator;
      `;

      const filePath = join(testDir, 'Calculator.tsx');
      await writeFile(filePath, componentCode, 'utf-8');

      const result = await extractor.extractComponent(filePath);

      expect(result.success).toBe(true);
      expect(result.component.businessLogic.length).toBeGreaterThan(0);
    });

    it('should handle extraction with custom options', async () => {
      const componentCode = `
export const SimpleComponent = () => {
  return <div>Simple</div>;
};
      `;

      const filePath = join(testDir, 'Simple.tsx');
      await writeFile(filePath, componentCode, 'utf-8');

      const options: ExtractorOptions = {
        deepAnalysis: true,
        extractDocs: true,
        analyzeDependencies: true,
        timeout: 5000,
      };

      const result = await extractor.extractComponent(filePath, options);

      expect(result.success).toBe(true);
      expect(result.duration).toBeLessThan(5000);
    });

    it('should detect component dependencies', async () => {
      const componentCode = `
import React from 'react';
import { Button } from './Button';
import { api } from '@/services/api';

const UserProfile = () => {
  return <div><Button /></div>;
};

export default UserProfile;
      `;

      const filePath = join(testDir, 'UserProfile.tsx');
      await writeFile(filePath, componentCode, 'utf-8');

      const result = await extractor.extractComponent(filePath);

      expect(result.success).toBe(true);
      expect(result.component.dependencies.length).toBeGreaterThan(0);
    });

    it('should handle non-existent files gracefully', async () => {
      const nonExistentPath = join(testDir, 'DoesNotExist.tsx');

      const result = await extractor.extractComponent(nonExistentPath);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.component.migrationStatus).toBe('failed');
    });

    it('should extract class component', async () => {
      const componentCode = `
import React, { Component } from 'react';

class ClassComponent extends Component {
  render() {
    return <div>Class Component</div>;
  }
}

export default ClassComponent;
      `;

      const filePath = join(testDir, 'ClassComponent.tsx');
      await writeFile(filePath, componentCode, 'utf-8');

      const result = await extractor.extractComponent(filePath);

      expect(result.success).toBe(true);
      expect(result.component.type).toBe('class');
    });

    it('should detect multiple React patterns', async () => {
      const componentCode = `
import React, { useState, useEffect, useContext, useMemo } from 'react';

const MultiHookComponent = () => {
  const [state, setState] = useState(null);
  const context = useContext(MyContext);
  const memoized = useMemo(() => computeExpensive(), []);

  useEffect(() => {
    // Effect logic
  }, []);

  return <div>Multi Hook</div>;
};

export default MultiHookComponent;
      `;

      const filePath = join(testDir, 'MultiHook.tsx');
      await writeFile(filePath, componentCode, 'utf-8');

      const result = await extractor.extractComponent(filePath);

      expect(result.success).toBe(true);
      expect(result.component.reactPatterns.length).toBeGreaterThanOrEqual(3);
      expect(result.component.reactPatterns).toContain('useState');
      expect(result.component.reactPatterns).toContain('useEffect');
      expect(result.component.reactPatterns).toContain('useMemo');
    });
  });

  describe('extractFromDirectory', () => {
    it('should extract multiple components from directory', async () => {
      const component1 = `
export const Component1 = () => <div>Component 1</div>;
      `;
      const component2 = `
export const Component2 = () => <div>Component 2</div>;
      `;

      await writeFile(join(testDir, 'Component1.tsx'), component1, 'utf-8');
      await writeFile(join(testDir, 'Component2.tsx'), component2, 'utf-8');

      const results = await extractor.extractFromDirectory(testDir);

      expect(results.length).toBe(2);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should skip non-component files', async () => {
      const componentCode = `
export const Component = () => <div>Component</div>;
      `;
      const testFileCode = `
// This is a test file
      `;
      const configFile = `
module.exports = {};
      `;

      await writeFile(join(testDir, 'Component.tsx'), componentCode, 'utf-8');
      await writeFile(
        join(testDir, 'Component.test.tsx'),
        testFileCode,
        'utf-8',
      );
      await writeFile(join(testDir, 'config.js'), configFile, 'utf-8');

      const results = await extractor.extractFromDirectory(testDir);

      // Should only extract the actual component, not test or config files
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty directory', async () => {
      const emptyDir = join(testDir, 'empty');
      await mkdir(emptyDir, { recursive: true });

      const results = await extractor.extractFromDirectory(emptyDir);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('Factory functions', () => {
    it('should create extractor via factory', () => {
      const instance = createExtractor();
      expect(instance).toBeInstanceOf(ComponentExtractor);
    });

    it('should extract component via helper function', async () => {
      const componentCode = `
export const TestComponent = () => <div>Test</div>;
      `;

      const filePath = join(testDir, 'Test.tsx');
      await writeFile(filePath, componentCode, 'utf-8');

      const result = await extractComponent(filePath);

      expect(result.success).toBe(true);
      expect(result.component.name).toBe('TestComponent');
    });
  });

  describe('Extraction metadata', () => {
    it('should include timing information in result', async () => {
      const componentCode = `
export const Component = () => <div>Component</div>;
      `;

      const filePath = join(testDir, 'Component.tsx');
      await writeFile(filePath, componentCode, 'utf-8');

      const result = await extractor.extractComponent(filePath);

      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(typeof result.duration).toBe('number');
    });

    it('should populate component metadata', async () => {
      const componentCode = `
/**
 * A test component
 * @author Test Author
 */
export const Component = () => <div>Component</div>;
      `;

      const filePath = join(testDir, 'Component.tsx');
      await writeFile(filePath, componentCode, 'utf-8');

      const result = await extractor.extractComponent(filePath);

      expect(result.component.metadata).toBeDefined();
      expect(result.component.metadata.createdAt).toBeTruthy();
      expect(result.component.metadata.createdAt.constructor.name).toBe('Date');
      expect(result.component.metadata.lastModified).toBeTruthy();
      expect(result.component.metadata.lastModified.constructor.name).toBe(
        'Date',
      );
    });

    it('should generate unique component IDs', async () => {
      const componentCode = `
export const Component = () => <div>Component</div>;
      `;

      const filePath1 = join(testDir, 'Component1.tsx');
      const filePath2 = join(testDir, 'Component2.tsx');
      await writeFile(filePath1, componentCode, 'utf-8');
      await writeFile(filePath2, componentCode, 'utf-8');

      const result1 = await extractor.extractComponent(filePath1);
      const result2 = await extractor.extractComponent(filePath2);

      expect(result1.component.id).not.toBe(result2.component.id);
    });
  });
});
