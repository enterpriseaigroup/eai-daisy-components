/**
 * Type Definitions Tests
 *
 * Tests for core type definitions and type utilities used throughout
 * the component extraction pipeline.
 *
 * @fileoverview Type definition tests
 */

import { describe, it, expect } from '@jest/globals';
import type {
  ComponentType,
  ComponentDefinition,
  PropDefinition,
  BusinessLogicDefinition,
  ComplexityLevel,
  MigrationStatus,
  ReactPattern,
  ValidationResult,
  ExtractionConfig,
  MigrationResult,
  QualityAssessment,
} from '@/types';

describe('Type Definitions', () => {
  describe('ComponentType', () => {
    it('should accept valid component types', () => {
      const validTypes: ComponentType[] = [
        'functional',
        'class',
        'higher-order',
        'hook',
        'utility',
      ];

      validTypes.forEach(type => {
        expect(typeof type).toBe('string');
      });
    });

    it('should have exactly 5 component types', () => {
      const types: ComponentType[] = [
        'functional',
        'class',
        'higher-order',
        'hook',
        'utility',
      ];

      expect(types.length).toBe(5);
    });
  });

  describe('ComplexityLevel', () => {
    it('should accept valid complexity levels', () => {
      const validLevels: ComplexityLevel[] = [
        'simple',
        'moderate',
        'complex',
        'critical',
      ];

      validLevels.forEach(level => {
        expect(typeof level).toBe('string');
      });
    });

    it('should represent increasing complexity', () => {
      const levels: ComplexityLevel[] = [
        'simple',
        'moderate',
        'complex',
        'critical',
      ];

      // Verify order makes sense
      expect(levels[0]).toBe('simple');
      expect(levels[3]).toBe('critical');
    });
  });

  describe('MigrationStatus', () => {
    it('should include all possible migration states', () => {
      const validStatuses: MigrationStatus[] = [
        'pending',
        'in-progress',
        'completed',
        'failed',
        'requires-manual-review',
      ];

      expect(validStatuses.length).toBe(5);
      expect(validStatuses).toContain('pending');
      expect(validStatuses).toContain('completed');
    });
  });

  describe('ReactPattern', () => {
    it('should include common React hook patterns', () => {
      const hookPatterns: ReactPattern[] = [
        'useState',
        'useEffect',
        'useContext',
        'useReducer',
        'useMemo',
        'useCallback',
      ];

      hookPatterns.forEach(pattern => {
        expect(pattern.startsWith('use') || pattern.includes('hook')).toBe(
          true
        );
      });
    });

    it('should include render pattern types', () => {
      const renderPatterns: ReactPattern[] = [
        'render-props',
        'children-as-function',
      ];

      renderPatterns.forEach(pattern => {
        expect(typeof pattern).toBe('string');
        expect(pattern.includes('-')).toBe(true);
      });
    });
  });

  describe('ComponentDefinition interface', () => {
    it('should create valid component definition with all required fields', () => {
      const componentDef: ComponentDefinition = {
        id: 'test-component-123',
        name: 'TestComponent',
        type: 'functional',
        sourcePath: '/path/to/component.tsx',
        props: [],
        businessLogic: [],
        reactPatterns: [],
        dependencies: [],
        complexity: 'simple',
        migrationStatus: 'pending',
        metadata: {
          createdAt: new Date(),
          lastModified: new Date(),
        },
      };

      expect(componentDef.id).toBe('test-component-123');
      expect(componentDef.name).toBe('TestComponent');
      expect(componentDef.type).toBe('functional');
      expect(componentDef.complexity).toBe('simple');
      expect(componentDef.migrationStatus).toBe('pending');
    });

    it('should support complex component definitions with props and logic', () => {
      const propDef: PropDefinition = {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Component title',
      };

      const businessLogic: BusinessLogicDefinition = {
        name: 'handleClick',
        signature: 'const handleClick = (event: MouseEvent): void',
        purpose: 'Handle click events',
        parameters: [
          {
            name: 'event',
            type: 'MouseEvent',
            optional: false,
          },
        ],
        returnType: 'void',
        complexity: 'simple',
        externalDependencies: [],
      };

      const componentDef: ComponentDefinition = {
        id: 'complex-component-456',
        name: 'ComplexComponent',
        type: 'functional',
        sourcePath: '/path/to/complex.tsx',
        props: [propDef],
        businessLogic: [businessLogic],
        reactPatterns: ['useState', 'useEffect'],
        dependencies: [],
        complexity: 'moderate',
        migrationStatus: 'in-progress',
        metadata: {
          createdAt: new Date(),
          lastModified: new Date(),
          documentation: 'A complex component',
        },
      };

      expect(componentDef.props.length).toBe(1);
      expect(componentDef.businessLogic.length).toBe(1);
      expect(componentDef.reactPatterns.length).toBe(2);
      expect(componentDef.complexity).toBe('moderate');
    });
  });

  describe('PropDefinition interface', () => {
    it('should create required prop definition', () => {
      const prop: PropDefinition = {
        name: 'userId',
        type: 'string',
        required: true,
      };

      expect(prop.required).toBe(true);
      expect(prop.name).toBe('userId');
      expect(prop.type).toBe('string');
    });

    it('should create optional prop definition with default value', () => {
      const prop: PropDefinition = {
        name: 'theme',
        type: "'light' | 'dark'",
        required: false,
        defaultValue: 'light',
        description: 'UI theme',
      };

      expect(prop.required).toBe(false);
      expect(prop.defaultValue).toBe('light');
      expect(prop.description).toBe('UI theme');
    });
  });

  describe('BusinessLogicDefinition interface', () => {
    it('should define simple business logic function', () => {
      const logic: BusinessLogicDefinition = {
        name: 'calculateTotal',
        signature: 'const calculateTotal = (items: Item[]): number',
        purpose: 'Calculate total price of items',
        parameters: [
          {
            name: 'items',
            type: 'Item[]',
            optional: false,
          },
        ],
        returnType: 'number',
        complexity: 'simple',
        externalDependencies: [],
      };

      expect(logic.name).toBe('calculateTotal');
      expect(logic.returnType).toBe('number');
      expect(logic.parameters.length).toBe(1);
      expect(logic.complexity).toBe('simple');
    });

    it('should define complex business logic with dependencies', () => {
      const logic: BusinessLogicDefinition = {
        name: 'fetchUserData',
        signature:
          'const fetchUserData = async (userId: string): Promise<User>',
        purpose: 'Fetch user data from API',
        parameters: [
          {
            name: 'userId',
            type: 'string',
            optional: false,
            description: 'User ID to fetch',
          },
        ],
        returnType: 'Promise<User>',
        complexity: 'complex',
        externalDependencies: ['api.users.get', 'from @/services/api'],
      };

      expect(logic.complexity).toBe('complex');
      expect(logic.externalDependencies.length).toBe(2);
      expect(logic.returnType).toContain('Promise');
    });
  });

  describe('ValidationResult interface', () => {
    it('should create successful validation result', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
      };

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.score).toBe(100);
    });

    it('should create failed validation result with errors', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            code: 'MISSING_PROP',
            message: 'Required prop is missing',
            path: 'props.title',
            value: undefined,
          },
        ],
        warnings: [
          {
            code: 'DEPRECATED_API',
            message: 'Using deprecated API',
            path: 'api.old',
            suggestion: 'Use new API instead',
          },
        ],
        score: 60,
      };

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.warnings.length).toBe(1);
      expect(result.score).toBe(60);
    });
  });

  describe('ExtractionConfig interface', () => {
    it('should create minimal extraction config', () => {
      const config: ExtractionConfig = {
        sourcePath: '/src/components',
        outputPath: '/dist/components',
        preserveBaseline: true,
        processing: {
          mode: 'parallel',
          concurrency: 4,
          continueOnError: true,
          retry: {
            maxAttempts: 3,
            delay: 1000,
            backoffMultiplier: 2,
            retryableOperations: ['file-read', 'ast-parsing'],
          },
          filters: {
            include: ['**/*.tsx', '**/*.ts'],
            exclude: ['**/*.test.*', '**/*.spec.*'],
            types: ['functional', 'class'],
            complexity: ['simple', 'moderate'],
            custom: [],
          },
        },
        performance: {
          memoryLimit: 512,
          timeoutPerComponent: 30000,
          maxBundleSizeIncrease: 10,
          monitoring: true,
        },
        validation: {
          strict: true,
          typescript: true,
          eslint: true,
          componentStructure: true,
          businessLogicPreservation: true,
        },
        output: {
          generateDeclarations: true,
          generateDocs: true,
          generateExamples: false,
          format: {
            typescript: '.tsx',
            indentation: 'spaces',
            indentationSize: 2,
            lineEnding: 'lf',
            quotes: 'single',
          },
          naming: {
            componentFiles: 'PascalCase',
            interfaces: 'PascalCase',
            utilities: 'camelCase',
            constants: 'UPPER_SNAKE_CASE',
          },
        },
        logging: {
          level: 'info',
          outputs: ['console', 'file'],
          format: 'detailed',
          timestamps: true,
          stackTraces: true,
        },
      };

      expect(config.sourcePath).toBe('/src/components');
      expect(config.processing.mode).toBe('parallel');
      expect(config.validation.strict).toBe(true);
      expect(config.output.format.indentationSize).toBe(2);
    });
  });

  describe('MigrationResult interface', () => {
    it('should create successful migration result', () => {
      const componentDef: ComponentDefinition = {
        id: 'test-123',
        name: 'TestComponent',
        type: 'functional',
        sourcePath: '/src/test.tsx',
        props: [],
        businessLogic: [],
        reactPatterns: [],
        dependencies: [],
        complexity: 'simple',
        migrationStatus: 'completed',
        metadata: {
          createdAt: new Date(),
          lastModified: new Date(),
        },
      };

      const result: MigrationResult = {
        success: true,
        component: componentDef,
        operation: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 1000,
          steps: [],
          config: {} as ExtractionConfig,
          strategy: 'direct-translation',
        },
        performance: {
          memoryUsage: 50,
          peakMemoryUsage: 75,
          cpuTime: 500,
          fileOperations: 5,
          bundleSizeImpact: {
            originalSize: 1000,
            migratedSize: 1100,
            sizeChange: 100,
            percentageChange: 10,
            meetsTarget: true,
          },
          warnings: [],
        },
        quality: {
          overallScore: 95,
          typeSafety: 100,
          businessLogicPreservation: 100,
          codeQuality: 90,
          performance: 90,
          maintainability: 95,
          issues: [],
        },
        artifacts: {
          component: {
            path: '/dist/TestComponent.tsx',
            content: 'component code',
            size: 1100,
            type: 'component',
            generatedAt: new Date(),
          },
          types: [],
          tests: [],
          documentation: [],
          examples: [],
          utilities: [],
        },
        issues: [],
        recommendations: [],
      };

      expect(result.success).toBe(true);
      expect(result.quality.overallScore).toBe(95);
      expect(result.performance.bundleSizeImpact.meetsTarget).toBe(true);
    });
  });

  describe('QualityAssessment interface', () => {
    it('should create quality assessment with high scores', () => {
      const assessment: QualityAssessment = {
        overallScore: 90,
        typeSafety: 95,
        businessLogicPreservation: 100,
        codeQuality: 85,
        performance: 90,
        maintainability: 88,
        issues: [],
      };

      expect(assessment.overallScore).toBeGreaterThan(0);
      expect(assessment.overallScore).toBeLessThanOrEqual(100);
      expect(assessment.typeSafety).toBeGreaterThanOrEqual(0);
      expect(assessment.issues.length).toBe(0);
    });

    it('should create quality assessment with issues', () => {
      const assessment: QualityAssessment = {
        overallScore: 65,
        typeSafety: 70,
        businessLogicPreservation: 80,
        codeQuality: 60,
        performance: 75,
        maintainability: 50,
        issues: [
          {
            severity: 'medium',
            category: 'maintainability',
            description: 'Component has high complexity',
            impact: 'May be difficult to maintain',
          },
          {
            severity: 'low',
            category: 'performance',
            description: 'Large bundle size',
            impact: 'May affect load time',
          },
        ],
      };

      expect(assessment.issues.length).toBe(2);
      expect(assessment.issues[0].severity).toBe('medium');
      expect(assessment.maintainability).toBe(50);
    });
  });
});
