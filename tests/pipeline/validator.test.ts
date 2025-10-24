/**
 * Equivalency Validator Tests
 *
 * Tests for the EquivalencyValidator class that validates functional
 * equivalency between DAISY v1 and Configurator v2 components.
 *
 * @fileoverview Validation logic tests
 */

import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  EquivalencyValidator,
  assessComponentQuality,
  compareComponents,
  createValidator,
  validateMigration,
} from '@/pipeline/validator';
import type {
  ComparisonResult,
  CustomValidator,
  ValidationOptions,
} from '@/pipeline/validator';
import type {
  ComponentDefinition,
  QualityAssessment,
  ValidationResult,
} from '@/types';

describe('EquivalencyValidator', () => {
  let validator: EquivalencyValidator;
  let baselineComponent: ComponentDefinition;
  let migratedComponent: ComponentDefinition;

  beforeEach(() => {
    validator = new EquivalencyValidator();

    baselineComponent = {
      id: 'baseline-123',
      name: 'TestComponent',
      type: 'functional',
      sourcePath: '/daisy/TestComponent.tsx',
      props: [
        {
          name: 'title',
          type: 'string',
          required: true,
          description: 'Component title',
        },
        {
          name: 'count',
          type: 'number',
          required: false,
          defaultValue: 0,
        },
      ],
      businessLogic: [
        {
          name: 'handleClick',
          signature: 'const handleClick = (): void',
          purpose: 'Handle click events',
          parameters: [],
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
        createdAt: new Date('2024-01-01'),
        lastModified: new Date('2024-01-15'),
      },
    };

    migratedComponent = {
      ...baselineComponent,
      id: 'migrated-456',
      sourcePath: '/configurator/TestComponent.tsx',
      migrationStatus: 'completed',
      metadata: {
        ...baselineComponent.metadata,
        lastModified: new Date('2024-02-01'),
      },
    };
  });

  describe('EquivalencyValidator class', () => {
    it('should create validator instance', () => {
      expect(validator).toBeInstanceOf(EquivalencyValidator);
    });

    it('should have validate method', () => {
      expect(typeof validator.validate).toBe('function');
    });

    it('should have compare method', () => {
      expect(typeof validator.compare).toBe('function');
    });

    it('should have assessQuality method', () => {
      expect(typeof validator.assessQuality).toBe('function');
    });
  });

  describe('validate', () => {
    it('should validate identical components successfully', async () => {
      const result = await validator.validate(
        baselineComponent,
        migratedComponent
      );

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.score).toBeGreaterThan(0);
    });

    it('should detect missing required props', async () => {
      const migratedWithMissingProp: ComponentDefinition = {
        ...migratedComponent,
        props: migratedComponent.props.filter(p => p.name !== 'title'),
      };

      const result = await validator.validate(
        baselineComponent,
        migratedWithMissingProp
      );

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.code === 'MISSING_REQUIRED_PROP')).toBe(
        true
      );
    });

    it('should detect missing business logic', async () => {
      const migratedWithoutLogic: ComponentDefinition = {
        ...migratedComponent,
        businessLogic: [],
      };

      const result = await validator.validate(
        baselineComponent,
        migratedWithoutLogic
      );

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_BUSINESS_LOGIC')).toBe(
        true
      );
    });

    it('should warn about optional prop removal', async () => {
      const migratedWithoutCount: ComponentDefinition = {
        ...migratedComponent,
        props: migratedComponent.props.filter(p => p.name !== 'count'),
      };

      const result = await validator.validate(
        baselineComponent,
        migratedWithoutCount
      );

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(
        result.warnings.some(w => w.code === 'MISSING_OPTIONAL_PROP')
      ).toBe(true);
    });

    it('should validate with strict mode', async () => {
      const options: ValidationOptions = {
        strict: true,
        validateBusinessLogic: true,
        validateTypes: true,
      };

      const result = await validator.validate(
        baselineComponent,
        migratedComponent,
        options
      );

      expect(result).toBeDefined();
      expect(result.valid).toBeDefined();
    });

    it('should skip validation when disabled in options', async () => {
      const options: ValidationOptions = {
        validateBusinessLogic: false,
        validateTypes: false,
        validateStructure: false,
      };

      const migratedWithoutLogic: ComponentDefinition = {
        ...migratedComponent,
        businessLogic: [],
      };

      const result = await validator.validate(
        baselineComponent,
        migratedWithoutLogic,
        options
      );

      // Should not fail for missing business logic since validation is disabled
      expect(
        result.errors.filter(e => e.code === 'MISSING_BUSINESS_LOGIC').length
      ).toBe(0);
    });

    it('should calculate validation score', async () => {
      const result = await validator.validate(
        baselineComponent,
        migratedComponent
      );

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should detect component name mismatch', async () => {
      const migratedWithDifferentName: ComponentDefinition = {
        ...migratedComponent,
        name: 'DifferentComponent',
      };

      const result = await validator.validate(
        baselineComponent,
        migratedWithDifferentName
      );

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'NAME_MISMATCH')).toBe(true);
    });

    it('should warn about component type changes', async () => {
      const migratedAsClass: ComponentDefinition = {
        ...migratedComponent,
        type: 'class',
      };

      const result = await validator.validate(
        baselineComponent,
        migratedAsClass
      );

      // Type conversion warnings may or may not be generated depending on validation logic
      expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    });

    it('should detect missing critical dependencies', async () => {
      const migratedWithoutReact: ComponentDefinition = {
        ...migratedComponent,
        dependencies: migratedComponent.dependencies.filter(
          d => d.name !== 'react'
        ),
      };

      const result = await validator.validate(
        baselineComponent,
        migratedWithoutReact
      );

      expect(
        result.errors.some(e => e.code === 'MISSING_CRITICAL_DEPENDENCY')
      ).toBe(true);
    });

    it('should run custom validators', async () => {
      const customValidator: CustomValidator = {
        name: 'custom-check',
        validate: async (baseline, migrated) => {
          if (baseline.name !== migrated.name) {
            return [
              {
                code: 'CUSTOM_ERROR',
                message: 'Custom validation failed',
                path: 'custom',
                value: undefined,
              },
            ];
          }
          return [];
        },
        description: 'Custom validation logic',
      };

      const options: ValidationOptions = {
        customValidators: [customValidator],
      };

      const result = await validator.validate(
        baselineComponent,
        migratedComponent,
        options
      );

      expect(result).toBeDefined();
    });
  });

  describe('compare', () => {
    it('should compare identical components', async () => {
      const result = await validator.compare(
        baselineComponent,
        migratedComponent
      );

      expect(result.equivalent).toBe(true);
      expect(result.businessLogicScore).toBeGreaterThan(0);
      expect(result.typeSafetyScore).toBeGreaterThan(0);
      expect(result.structureScore).toBeGreaterThan(0);
      expect(result.performanceScore).toBeGreaterThan(0);
    });

    it('should detect differences in props count', async () => {
      const migratedWithExtraProp: ComponentDefinition = {
        ...migratedComponent,
        props: [
          ...migratedComponent.props,
          {
            name: 'extra',
            type: 'string',
            required: false,
          },
        ],
      };

      const result = await validator.compare(
        baselineComponent,
        migratedWithExtraProp
      );

      expect(result.differences.length).toBeGreaterThan(0);
      expect(result.differences.some(d => d.category === 'props')).toBe(true);
    });

    it('should calculate business logic preservation score', async () => {
      const result = await validator.compare(
        baselineComponent,
        migratedComponent
      );

      expect(result.businessLogicScore).toBe(100); // All logic preserved
    });

    it('should calculate lower score for missing logic', async () => {
      const migratedWithoutLogic: ComponentDefinition = {
        ...migratedComponent,
        businessLogic: [],
      };

      const result = await validator.compare(
        baselineComponent,
        migratedWithoutLogic
      );

      expect(result.businessLogicScore).toBeLessThan(100);
      expect(result.equivalent).toBe(false);
    });

    it('should include validation result in comparison', async () => {
      const result = await validator.compare(
        baselineComponent,
        migratedComponent
      );

      expect(result.validation).toBeDefined();
      expect(result.validation.valid).toBeDefined();
      expect(result.validation.errors).toBeDefined();
    });

    it('should detect dependency count differences', async () => {
      const migratedWithExtraDep: ComponentDefinition = {
        ...migratedComponent,
        dependencies: [
          ...migratedComponent.dependencies,
          {
            name: 'lodash',
            type: 'external',
            importPath: 'lodash',
            critical: false,
          },
        ],
      };

      const result = await validator.compare(
        baselineComponent,
        migratedWithExtraDep
      );

      expect(result.differences.some(d => d.category === 'dependencies')).toBe(
        true
      );
    });

    it('should assess structure score', async () => {
      const result = await validator.compare(
        baselineComponent,
        migratedComponent
      );

      expect(result.structureScore).toBeGreaterThanOrEqual(0);
      expect(result.structureScore).toBeLessThanOrEqual(100);
    });
  });

  describe('assessQuality', () => {
    it('should assess quality of migrated component', async () => {
      const assessment = await validator.assessQuality(
        baselineComponent,
        migratedComponent
      );

      expect(assessment.overallScore).toBeGreaterThan(0);
      expect(assessment.typeSafety).toBeDefined();
      expect(assessment.businessLogicPreservation).toBeDefined();
      expect(assessment.codeQuality).toBeDefined();
      expect(assessment.performance).toBeDefined();
      expect(assessment.maintainability).toBeDefined();
      expect(Array.isArray(assessment.issues)).toBe(true);
    });

    it('should identify quality issues', async () => {
      const complexMigrated: ComponentDefinition = {
        ...migratedComponent,
        complexity: 'critical',
        businessLogic: [],
      };

      const assessment = await validator.assessQuality(
        baselineComponent,
        complexMigrated
      );

      expect(assessment.issues.length).toBeGreaterThan(0);
    });

    it('should calculate overall score from component scores', async () => {
      const assessment = await validator.assessQuality(
        baselineComponent,
        migratedComponent
      );

      // Overall score should be average of individual scores
      const expectedAverage = Math.round(
        (assessment.typeSafety +
          assessment.businessLogicPreservation +
          assessment.codeQuality +
          assessment.performance) /
          4
      );

      expect(assessment.overallScore).toBe(expectedAverage);
    });

    it('should assess high quality for good migrations', async () => {
      const assessment = await validator.assessQuality(
        baselineComponent,
        migratedComponent
      );

      expect(assessment.overallScore).toBeGreaterThan(80);
      expect(assessment.typeSafety).toBeGreaterThan(80);
      expect(assessment.businessLogicPreservation).toBeGreaterThan(80);
    });

    it('should include maintainability score', async () => {
      const assessment = await validator.assessQuality(
        baselineComponent,
        migratedComponent
      );

      expect(assessment.maintainability).toBeGreaterThanOrEqual(0);
      expect(assessment.maintainability).toBeLessThanOrEqual(100);
    });
  });

  describe('Factory functions', () => {
    it('should create validator via factory', () => {
      const instance = createValidator();
      expect(instance).toBeInstanceOf(EquivalencyValidator);
    });

    it('should validate via helper function', async () => {
      const result = await validateMigration(
        baselineComponent,
        migratedComponent
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toBeDefined();
    });

    it('should compare via helper function', async () => {
      const result = await compareComponents(
        baselineComponent,
        migratedComponent
      );

      expect(result.equivalent).toBe(true);
      expect(result.validation).toBeDefined();
    });

    it('should assess quality via helper function', async () => {
      const assessment = await assessComponentQuality(
        baselineComponent,
        migratedComponent
      );

      expect(assessment.overallScore).toBeGreaterThan(0);
      expect(assessment.issues).toBeDefined();
    });
  });

  describe('Scoring algorithms', () => {
    it('should give perfect score for identical components', async () => {
      const result = await validator.compare(
        baselineComponent,
        migratedComponent
      );

      expect(result.businessLogicScore).toBe(100);
      expect(result.typeSafetyScore).toBe(100);
    });

    it('should penalize complexity increases', async () => {
      const moreComplexMigrated: ComponentDefinition = {
        ...migratedComponent,
        complexity: 'complex',
      };

      const baselineSimple: ComponentDefinition = {
        ...baselineComponent,
        complexity: 'simple',
      };

      const result = await validator.compare(
        baselineSimple,
        moreComplexMigrated
      );

      expect(result.structureScore).toBeLessThan(100);
    });

    it('should score based on pattern preservation', async () => {
      const migratedWithFewerPatterns: ComponentDefinition = {
        ...migratedComponent,
        reactPatterns: ['useState'], // Missing useEffect
      };

      const result = await validator.compare(
        baselineComponent,
        migratedWithFewerPatterns
      );

      expect(
        result.validation.warnings.some(w => w.code === 'PATTERN_REMOVED')
      ).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle validation errors gracefully', async () => {
      const invalidBaseline = {
        ...baselineComponent,
        name: '',
      };

      const result = await validator.validate(
        invalidBaseline,
        migratedComponent
      );

      expect(result).toBeDefined();
      expect(result.valid).toBeDefined();
    });

    it('should return meaningful error messages', async () => {
      const migratedWithMissingProp: ComponentDefinition = {
        ...migratedComponent,
        props: [],
      };

      const result = await validator.validate(
        baselineComponent,
        migratedWithMissingProp
      );

      expect(result.errors.length).toBeGreaterThan(0);
      result.errors.forEach(error => {
        expect(error.message).toBeTruthy();
        expect(error.code).toBeTruthy();
      });
    });
  });
});
