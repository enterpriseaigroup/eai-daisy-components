/**
 * Business Logic Transformer Tests
 *
 * Tests for the BusinessLogicTransformer class that transforms DAISY v1
 * components to Configurator v2 architecture.
 *
 * @fileoverview Business logic transformation tests
 */

import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  BusinessLogicTransformer,
  createTransformer,
  transformComponent,
  transformComponents,
} from '@/pipeline/transformer';
import type {
  TransformationOptions,
  TransformationResult,
} from '@/pipeline/transformer';
import type { ComponentDefinition } from '@/types';

describe('BusinessLogicTransformer', () => {
  let transformer: BusinessLogicTransformer;
  let sampleComponent: ComponentDefinition;

  beforeEach(() => {
    transformer = new BusinessLogicTransformer();

    sampleComponent = {
      id: 'test-component-123',
      name: 'TestComponent',
      type: 'functional',
      sourcePath: '/src/components/TestComponent.tsx',
      props: [
        {
          name: 'title',
          type: 'string',
          required: true,
          description: 'Component title',
        },
        {
          name: 'onClick',
          type: '() => void',
          required: false,
        },
      ],
      businessLogic: [
        {
          name: 'handleSubmit',
          signature: 'const handleSubmit = (data: FormData): void',
          purpose: 'Handle form submission',
          parameters: [
            {
              name: 'data',
              type: 'FormData',
              optional: false,
            },
          ],
          returnType: 'void',
          complexity: 'simple',
          externalDependencies: [],
        },
      ],
      reactPatterns: ['useState', 'useEffect'],
      dependencies: [
        {
          name: 'react',
          type: 'external',
          importPath: 'react',
          critical: true,
        },
      ],
      complexity: 'moderate',
      migrationStatus: 'pending',
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        documentation: 'Test component for migration',
      },
    };
  });

  describe('BusinessLogicTransformer class', () => {
    it('should create transformer instance', () => {
      expect(transformer).toBeInstanceOf(BusinessLogicTransformer);
    });

    it('should have transformComponent method', () => {
      expect(typeof transformer.transformComponent).toBe('function');
    });
  });

  describe('transformComponent', () => {
    it('should transform simple component successfully', async () => {
      const result = await transformer.transformComponent(sampleComponent);

      expect(result.success).toBe(true);
      expect(result.code).toBeTruthy();
      expect(result.component.migrationStatus).toBe('completed');
      expect(result.transformations.length).toBeGreaterThan(0);
    });

    it('should generate valid TypeScript code', async () => {
      const result = await transformer.transformComponent(sampleComponent);

      expect(result.code).toContain('import React from');
      expect(result.code).toContain('interface TestComponentProps');
      expect(result.code).toContain('const TestComponent');
      expect(result.code).toContain('export default TestComponent');
    });

    it('should preserve component props in transformation', async () => {
      const result = await transformer.transformComponent(sampleComponent);

      expect(result.code).toContain('title');
      expect(result.code).toContain('onClick');
      expect(result.code).toContain('string');
    });

    it('should preserve business logic functions', async () => {
      const result = await transformer.transformComponent(sampleComponent);

      expect(result.code).toContain('handleSubmit');
      expect(result.code).toContain('FormData');
    });

    it('should apply transformation strategy', async () => {
      const result = await transformer.transformComponent(sampleComponent);

      expect(result.strategy).toBeDefined();
      expect([
        'direct-translation',
        'pattern-mapping',
        'hybrid-approach',
        'manual-review-required',
      ]).toContain(result.strategy);
    });

    it('should handle component with no props', async () => {
      const noPropsComponent: ComponentDefinition = {
        ...sampleComponent,
        props: [],
      };

      const result = await transformer.transformComponent(noPropsComponent);

      expect(result.success).toBe(true);
      expect(result.code).toBeTruthy();
    });

    it('should handle component with no business logic', async () => {
      const noLogicComponent: ComponentDefinition = {
        ...sampleComponent,
        businessLogic: [],
      };

      const result = await transformer.transformComponent(noLogicComponent);

      expect(result.success).toBe(true);
      expect(result.code).toContain('TestComponent');
    });

    it('should transform with custom options', async () => {
      const options: TransformationOptions = {
        targetVersion: '2.1.0',
        preservePatterns: true,
        transformAPICalls: true,
        addConfiguratorIntegration: true,
      };

      const result = await transformer.transformComponent(
        sampleComponent,
        options
      );

      expect(result.success).toBe(true);
      expect(result.code).toContain('Configurator');
    });

    it('should add Configurator integration when requested', async () => {
      const options: TransformationOptions = {
        addConfiguratorIntegration: true,
      };

      const result = await transformer.transformComponent(
        sampleComponent,
        options
      );

      expect(result.code).toContain('Configurator');
      expect(result.transformations.some(t => t.type === 'structure')).toBe(
        true
      );
    });

    it('should track transformations applied', async () => {
      const result = await transformer.transformComponent(sampleComponent);

      expect(result.transformations.length).toBeGreaterThan(0);
      result.transformations.forEach(transformation => {
        expect(transformation.type).toBeDefined();
        expect(transformation.from).toBeDefined();
        expect(transformation.to).toBeDefined();
        expect(transformation.description).toBeDefined();
      });
    });

    it('should handle complex components', async () => {
      const complexComponent: ComponentDefinition = {
        ...sampleComponent,
        complexity: 'complex',
        businessLogic: [
          ...sampleComponent.businessLogic,
          {
            name: 'validateData',
            signature: 'const validateData = (data: unknown): boolean',
            purpose: 'Validate input data',
            parameters: [
              {
                name: 'data',
                type: 'unknown',
                optional: false,
              },
            ],
            returnType: 'boolean',
            complexity: 'complex',
            externalDependencies: ['validator.validate'],
          },
          {
            name: 'processResults',
            signature:
              'const processResults = async (results: Result[]): Promise<void>',
            purpose: 'Process API results',
            parameters: [
              {
                name: 'results',
                type: 'Result[]',
                optional: false,
              },
            ],
            returnType: 'Promise<void>',
            complexity: 'moderate',
            externalDependencies: ['api.process'],
          },
        ],
      };

      const result = await transformer.transformComponent(complexComponent);

      expect(result.success).toBe(true);
      expect(result.strategy).toBeDefined();
    });

    it('should generate file header with metadata', async () => {
      const result = await transformer.transformComponent(sampleComponent);

      expect(result.code).toContain('/**');
      expect(result.code).toContain('Migrated from DAISY v1');
      expect(result.code).toContain('@fileoverview');
    });

    it('should update component metadata', async () => {
      const result = await transformer.transformComponent(sampleComponent);

      expect(result.component.metadata.lastModified).toBeInstanceOf(Date);
      expect(
        result.component.metadata.lastModified.getTime()
      ).toBeGreaterThanOrEqual(sampleComponent.metadata.lastModified.getTime());
    });
  });

  describe('Transformation strategies', () => {
    it('should use direct-translation for simple components', async () => {
      const simpleComponent: ComponentDefinition = {
        ...sampleComponent,
        complexity: 'simple',
        businessLogic: [],
        reactPatterns: ['useState'],
      };

      const result = await transformer.transformComponent(simpleComponent);

      expect(result.strategy).toBe('direct-translation');
    });

    it('should require manual review for critical complexity', async () => {
      const criticalComponent: ComponentDefinition = {
        ...sampleComponent,
        complexity: 'critical',
      };

      const result = await transformer.transformComponent(criticalComponent);

      expect(result.strategy).toBe('manual-review-required');
    });
  });

  describe('Factory functions', () => {
    it('should create transformer via factory', () => {
      const instance = createTransformer();
      expect(instance).toBeInstanceOf(BusinessLogicTransformer);
    });

    it('should transform component via helper function', async () => {
      const result = await transformComponent(sampleComponent);

      expect(result.success).toBe(true);
      expect(result.component).toBeDefined();
    });

    it('should transform multiple components', async () => {
      const components = [
        sampleComponent,
        { ...sampleComponent, id: 'test-2', name: 'TestComponent2' },
        { ...sampleComponent, id: 'test-3', name: 'TestComponent3' },
      ];

      const results = await transformComponents(components);

      expect(results.length).toBe(3);
      expect(results.every(r => r.success)).toBe(true);
    });
  });

  describe('Code generation', () => {
    it('should generate functional component syntax', async () => {
      const result = await transformer.transformComponent(sampleComponent);

      expect(result.code).toContain('const TestComponent');
      expect(result.code).toContain('FC<');
      expect(result.code).toContain('return (');
    });

    it('should include prop documentation in interface', async () => {
      const result = await transformer.transformComponent(sampleComponent);

      expect(result.code).toContain('/** Component title */');
    });

    it('should generate proper TypeScript types', async () => {
      const result = await transformer.transformComponent(sampleComponent);

      expect(result.code).toContain(': string');
      expect(result.code).toContain(': () => void');
      expect(result.code).toContain('interface');
    });

    it('should format code with proper indentation', async () => {
      const result = await transformer.transformComponent(sampleComponent);

      const lines = result.code.split('\n');
      const hasIndentation = lines.some(
        line => line.startsWith('  ') && line.trim().length > 0
      );
      expect(hasIndentation).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle transformation errors gracefully', async () => {
      const invalidComponent = {
        ...sampleComponent,
        name: '', // Invalid empty name
      };

      const result = await transformer.transformComponent(invalidComponent);

      // Should still return a result, even if it failed
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it('should collect warnings during transformation', async () => {
      const result = await transformer.transformComponent(sampleComponent);

      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('Transformation tracking', () => {
    it('should record import transformations', async () => {
      const componentWithDaisyImports: ComponentDefinition = {
        ...sampleComponent,
        dependencies: [
          {
            name: 'DaisyComponent',
            type: 'external',
            importPath: '@daisy/core',
            critical: true,
          },
        ],
      };

      const result = await transformer.transformComponent(
        componentWithDaisyImports
      );

      const importTransformations = result.transformations.filter(
        t => t.type === 'api'
      );
      expect(importTransformations.length).toBeGreaterThan(0);
    });

    it('should record hook transformations', async () => {
      const result = await transformer.transformComponent(sampleComponent);

      const hookTransformations = result.transformations.filter(
        t => t.type === 'hook'
      );
      expect(hookTransformations.length).toBeGreaterThan(0);
    });
  });
});
