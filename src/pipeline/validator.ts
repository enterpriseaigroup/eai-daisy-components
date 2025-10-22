/**
 * Equivalency Validator
 *
 * Validates functional equivalency between DAISY v1 baseline components
 * and Configurator v2 migrated versions. Ensures business logic preservation
 * and architectural compliance.
 *
 * @fileoverview Validation logic for migration pipeline
 * @version 1.0.0
 */

import type {
  ComponentDefinition,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  QualityAssessment,
  QualityIssue,
} from '@/types';
import { getGlobalLogger } from '@/utils/logging';

// ============================================================================
// VALIDATOR TYPES
// ============================================================================

/**
 * Validation options
 */
export interface ValidationOptions {
  /** Strict validation mode */
  readonly strict?: boolean;

  /** Validate business logic preservation */
  readonly validateBusinessLogic?: boolean;

  /** Validate type safety */
  readonly validateTypes?: boolean;

  /** Validate component structure */
  readonly validateStructure?: boolean;

  /** Validate performance characteristics */
  readonly validatePerformance?: boolean;

  /** Custom validation rules */
  readonly customValidators?: CustomValidator[];
}

/**
 * Custom validator function
 */
export interface CustomValidator {
  /** Validator name */
  readonly name: string;

  /** Validation function */
  readonly validate: (
    baseline: ComponentDefinition,
    migrated: ComponentDefinition
  ) => Promise<ValidationError[]>;

  /** Validator description */
  readonly description?: string;
}

/**
 * Comparison result between baseline and migrated components
 */
export interface ComparisonResult {
  /** Comparison success status */
  readonly equivalent: boolean;

  /** Business logic equivalency score (0-100) */
  readonly businessLogicScore: number;

  /** Type safety score (0-100) */
  readonly typeSafetyScore: number;

  /** Structure compliance score (0-100) */
  readonly structureScore: number;

  /** Performance score (0-100) */
  readonly performanceScore: number;

  /** Differences found */
  readonly differences: Difference[];

  /** Validation result */
  readonly validation: ValidationResult;
}

/**
 * Difference between baseline and migrated component
 */
export interface Difference {
  /** Difference category */
  readonly category:
    | 'props'
    | 'business-logic'
    | 'dependencies'
    | 'patterns'
    | 'structure';

  /** Difference severity */
  readonly severity: 'info' | 'warning' | 'error' | 'critical';

  /** Difference description */
  readonly description: string;

  /** Baseline value */
  readonly baseline: unknown;

  /** Migrated value */
  readonly migrated: unknown;

  /** Impact assessment */
  readonly impact: string;
}

// ============================================================================
// EQUIVALENCY VALIDATOR CLASS
// ============================================================================

/**
 * Main equivalency validation class
 *
 * Validates that migrated components maintain functional equivalency
 * with DAISY v1 baseline while achieving Configurator v2 compliance.
 */
export class EquivalencyValidator {
  private readonly logger = getGlobalLogger('EquivalencyValidator');

  /**
   * Validate component migration
   *
   * @param baseline - Original DAISY v1 component
   * @param migrated - Migrated Configurator v2 component
   * @param options - Validation options
   * @returns Validation result
   */
  public async validate(
    baseline: ComponentDefinition,
    migrated: ComponentDefinition,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    this.logger.info(`Validating migration for ${baseline.name}`);

    const {
      strict = true,
      validateBusinessLogic = true,
      validateTypes = true,
      validateStructure = true,
      validatePerformance = true,
      customValidators = [],
    } = options;

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Validate component identity
      this.validateIdentity(baseline, migrated, errors);

      // Validate props equivalency
      if (validateTypes) {
        this.validateProps(baseline, migrated, errors, warnings, strict);
      }

      // Validate business logic preservation
      if (validateBusinessLogic) {
        this.validateBusinessLogic(
          baseline,
          migrated,
          errors,
          warnings,
          strict
        );
      }

      // Validate component structure
      if (validateStructure) {
        this.validateStructure(baseline, migrated, errors, warnings);
      }

      // Validate dependencies
      this.validateDependencies(baseline, migrated, errors, warnings);

      // Validate React patterns
      this.validateReactPatterns(baseline, migrated, warnings);

      // Run custom validators
      for (const validator of customValidators) {
        const customErrors = await validator.validate(baseline, migrated);
        errors.push(...customErrors);
      }

      // Calculate validation score
      const score = this.calculateValidationScore(errors, warnings);

      const result: ValidationResult = {
        valid: errors.length === 0,
        errors,
        warnings,
        score,
      };

      this.logger.info(`Validation completed for ${baseline.name}`, {
        valid: result.valid,
        errors: errors.length,
        warnings: warnings.length,
        score,
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Validation failed for ${baseline.name}`,
        error as Error
      );

      return {
        valid: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            message:
              error instanceof Error
                ? error.message
                : 'Unknown validation error',
            path: baseline.name,
            value: undefined,
          },
        ],
        warnings,
        score: 0,
      };
    }
  }

  /**
   * Compare baseline and migrated components
   *
   * @param baseline - Original component
   * @param migrated - Migrated component
   * @param options - Validation options
   * @returns Comparison result
   */
  public async compare(
    baseline: ComponentDefinition,
    migrated: ComponentDefinition,
    options: ValidationOptions = {}
  ): Promise<ComparisonResult> {
    this.logger.info(
      `Comparing baseline and migrated versions of ${baseline.name}`
    );

    const validation = await this.validate(baseline, migrated, options);
    const differences = this.findDifferences(baseline, migrated);

    // Calculate individual scores
    const businessLogicScore = this.calculateBusinessLogicScore(
      baseline,
      migrated
    );
    const typeSafetyScore = this.calculateTypeSafetyScore(baseline, migrated);
    const structureScore = this.calculateStructureScore(baseline, migrated);
    const performanceScore = this.calculatePerformanceScore(baseline, migrated);

    const equivalent =
      validation.valid &&
      differences.filter(
        d => d.severity === 'critical' || d.severity === 'error'
      ).length === 0;

    return {
      equivalent,
      businessLogicScore,
      typeSafetyScore,
      structureScore,
      performanceScore,
      differences,
      validation,
    };
  }

  /**
   * Assess quality of migrated component
   *
   * @param baseline - Original component
   * @param migrated - Migrated component
   * @returns Quality assessment
   */
  public async assessQuality(
    baseline: ComponentDefinition,
    migrated: ComponentDefinition
  ): Promise<QualityAssessment> {
    const comparison = await this.compare(baseline, migrated);

    const issues: QualityIssue[] = comparison.differences.map(diff => ({
      severity:
        diff.severity === 'critical'
          ? 'critical'
          : diff.severity === 'error'
            ? 'high'
            : diff.severity === 'warning'
              ? 'medium'
              : 'low',
      category: this.mapDifferenceToQualityCategory(diff.category),
      description: diff.description,
      impact: diff.impact,
    }));

    const overallScore = Math.round(
      (comparison.businessLogicScore +
        comparison.typeSafetyScore +
        comparison.structureScore +
        comparison.performanceScore) /
        4
    );

    return {
      overallScore,
      typeSafety: comparison.typeSafetyScore,
      businessLogicPreservation: comparison.businessLogicScore,
      codeQuality: comparison.structureScore,
      performance: comparison.performanceScore,
      maintainability: this.calculateMaintainabilityScore(migrated),
      issues,
    };
  }

  // ==========================================================================
  // VALIDATION METHODS
  // ==========================================================================

  /**
   * Validate component identity
   */
  private validateIdentity(
    baseline: ComponentDefinition,
    migrated: ComponentDefinition,
    errors: ValidationError[]
  ): void {
    if (baseline.name !== migrated.name) {
      errors.push({
        code: 'NAME_MISMATCH',
        message: `Component names do not match: baseline=${baseline.name}, migrated=${migrated.name}`,
        path: 'name',
        value: { baseline: baseline.name, migrated: migrated.name },
      });
    }
  }

  /**
   * Validate props equivalency
   */
  private validateProps(
    baseline: ComponentDefinition,
    migrated: ComponentDefinition,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    strict: boolean
  ): void {
    const baselineProps = new Map(baseline.props.map(p => [p.name, p]));
    const migratedProps = new Map(migrated.props.map(p => [p.name, p]));

    // Check for missing props
    for (const [name, baseProp] of baselineProps) {
      if (!migratedProps.has(name)) {
        if (baseProp.required) {
          errors.push({
            code: 'MISSING_REQUIRED_PROP',
            message: `Required prop '${name}' is missing in migrated component`,
            path: `props.${name}`,
            value: baseProp,
          });
        } else {
          warnings.push({
            code: 'MISSING_OPTIONAL_PROP',
            message: `Optional prop '${name}' is missing in migrated component`,
            path: `props.${name}`,
            suggestion: 'Consider adding this prop for full equivalency',
          });
        }
      } else {
        // Validate prop type compatibility
        const migratedProp = migratedProps.get(name)!;
        if (strict && baseProp.type !== migratedProp.type) {
          warnings.push({
            code: 'PROP_TYPE_CHANGED',
            message: `Prop '${name}' type changed from '${baseProp.type}' to '${migratedProp.type}'`,
            path: `props.${name}.type`,
            suggestion: 'Verify type compatibility',
          });
        }
      }
    }

    // Check for new props
    for (const [name] of migratedProps) {
      if (!baselineProps.has(name)) {
        warnings.push({
          code: 'NEW_PROP_ADDED',
          message: `New prop '${name}' added in migrated component`,
          path: `props.${name}`,
          suggestion: 'Ensure new prop does not break existing usage',
        });
      }
    }
  }

  /**
   * Validate business logic preservation
   */
  private validateBusinessLogic(
    baseline: ComponentDefinition,
    migrated: ComponentDefinition,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    strict: boolean
  ): void {
    const baselineLogic = new Map(
      baseline.businessLogic.map(bl => [bl.name, bl])
    );
    const migratedLogic = new Map(
      migrated.businessLogic.map(bl => [bl.name, bl])
    );

    // Check for missing business logic
    for (const [name, baseLogic] of baselineLogic) {
      if (!migratedLogic.has(name)) {
        errors.push({
          code: 'MISSING_BUSINESS_LOGIC',
          message: `Business logic function '${name}' is missing in migrated component`,
          path: `businessLogic.${name}`,
          value: baseLogic,
          fix: 'Ensure all business logic is preserved during migration',
        });
      } else if (strict) {
        // Validate function signature
        const migratedFunc = migratedLogic.get(name)!;
        if (baseLogic.signature !== migratedFunc.signature) {
          warnings.push({
            code: 'SIGNATURE_CHANGED',
            message: `Function '${name}' signature changed`,
            path: `businessLogic.${name}.signature`,
            suggestion: 'Verify signature compatibility',
          });
        }
      }
    }

    // Check for new business logic
    for (const [name] of migratedLogic) {
      if (!baselineLogic.has(name)) {
        warnings.push({
          code: 'NEW_BUSINESS_LOGIC',
          message: `New business logic function '${name}' added in migrated component`,
          path: `businessLogic.${name}`,
        });
      }
    }
  }

  /**
   * Validate component structure
   */
  private validateStructure(
    baseline: ComponentDefinition,
    migrated: ComponentDefinition,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Validate component type compatibility
    if (baseline.type === 'class' && migrated.type !== 'functional') {
      warnings.push({
        code: 'TYPE_CONVERSION',
        message: `Component type changed from '${baseline.type}' to '${migrated.type}'`,
        path: 'type',
        suggestion: 'Verify behavior is preserved after type conversion',
      });
    }

    // Validate complexity hasn't increased dramatically
    const complexityLevels = {
      simple: 1,
      moderate: 2,
      complex: 3,
      critical: 4,
    };
    const baselineLevel = complexityLevels[baseline.complexity];
    const migratedLevel = complexityLevels[migrated.complexity];

    if (migratedLevel > baselineLevel + 1) {
      warnings.push({
        code: 'COMPLEXITY_INCREASED',
        message: `Complexity increased from '${baseline.complexity}' to '${migrated.complexity}'`,
        path: 'complexity',
        suggestion: 'Consider refactoring to reduce complexity',
      });
    }
  }

  /**
   * Validate dependencies
   */
  private validateDependencies(
    baseline: ComponentDefinition,
    migrated: ComponentDefinition,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const baselineDeps = new Set(baseline.dependencies.map(d => d.name));
    const migratedDeps = new Set(migrated.dependencies.map(d => d.name));

    // Check for removed critical dependencies
    for (const dep of baseline.dependencies) {
      if (dep.critical && !migratedDeps.has(dep.name)) {
        errors.push({
          code: 'MISSING_CRITICAL_DEPENDENCY',
          message: `Critical dependency '${dep.name}' is missing in migrated component`,
          path: `dependencies.${dep.name}`,
          value: dep,
          fix: 'Add missing critical dependency or provide alternative',
        });
      }
    }
  }

  /**
   * Validate React patterns
   */
  private validateReactPatterns(
    baseline: ComponentDefinition,
    migrated: ComponentDefinition,
    warnings: ValidationWarning[]
  ): void {
    const baselinePatterns = new Set(baseline.reactPatterns);
    const migratedPatterns = new Set(migrated.reactPatterns);

    for (const pattern of baselinePatterns) {
      if (!migratedPatterns.has(pattern)) {
        warnings.push({
          code: 'PATTERN_REMOVED',
          message: `React pattern '${pattern}' used in baseline but not in migrated component`,
          path: `reactPatterns.${pattern}`,
          suggestion:
            'Verify pattern is replaced with equivalent functionality',
        });
      }
    }
  }

  // ==========================================================================
  // COMPARISON METHODS
  // ==========================================================================

  /**
   * Find differences between baseline and migrated components
   */
  private findDifferences(
    baseline: ComponentDefinition,
    migrated: ComponentDefinition
  ): Difference[] {
    const differences: Difference[] = [];

    // Props differences
    if (baseline.props.length !== migrated.props.length) {
      differences.push({
        category: 'props',
        severity: 'warning',
        description: 'Props count differs between baseline and migrated',
        baseline: baseline.props.length,
        migrated: migrated.props.length,
        impact: 'May affect component API compatibility',
      });
    }

    // Business logic differences
    if (baseline.businessLogic.length !== migrated.businessLogic.length) {
      differences.push({
        category: 'business-logic',
        severity: 'error',
        description: 'Business logic function count differs',
        baseline: baseline.businessLogic.length,
        migrated: migrated.businessLogic.length,
        impact: 'Business logic may not be fully preserved',
      });
    }

    // Dependencies differences
    if (baseline.dependencies.length !== migrated.dependencies.length) {
      differences.push({
        category: 'dependencies',
        severity: 'info',
        description: 'Dependency count differs',
        baseline: baseline.dependencies.length,
        migrated: migrated.dependencies.length,
        impact: 'May affect bundle size and external integrations',
      });
    }

    // React patterns differences
    if (baseline.reactPatterns.length !== migrated.reactPatterns.length) {
      differences.push({
        category: 'patterns',
        severity: 'warning',
        description: 'React pattern usage differs',
        baseline: baseline.reactPatterns.length,
        migrated: migrated.reactPatterns.length,
        impact: 'Component implementation approach may have changed',
      });
    }

    return differences;
  }

  // ==========================================================================
  // SCORING METHODS
  // ==========================================================================

  /**
   * Calculate business logic preservation score
   */
  private calculateBusinessLogicScore(
    baseline: ComponentDefinition,
    migrated: ComponentDefinition
  ): number {
    if (baseline.businessLogic.length === 0) return 100;

    const baselineNames = new Set(baseline.businessLogic.map(bl => bl.name));
    const migratedNames = new Set(migrated.businessLogic.map(bl => bl.name));

    const preserved = [...baselineNames].filter(name =>
      migratedNames.has(name)
    ).length;
    return Math.round((preserved / baseline.businessLogic.length) * 100);
  }

  /**
   * Calculate type safety score
   */
  private calculateTypeSafetyScore(
    baseline: ComponentDefinition,
    migrated: ComponentDefinition
  ): number {
    if (baseline.props.length === 0) return 100;

    const baselineProps = new Set(baseline.props.map(p => p.name));
    const migratedProps = new Set(migrated.props.map(p => p.name));

    const preserved = [...baselineProps].filter(name =>
      migratedProps.has(name)
    ).length;
    return Math.round((preserved / baseline.props.length) * 100);
  }

  /**
   * Calculate structure compliance score
   */
  private calculateStructureScore(
    baseline: ComponentDefinition,
    migrated: ComponentDefinition
  ): number {
    let score = 100;

    // Penalize complexity increase
    const complexityLevels = {
      simple: 1,
      moderate: 2,
      complex: 3,
      critical: 4,
    };
    const complexityDiff =
      complexityLevels[migrated.complexity] -
      complexityLevels[baseline.complexity];
    score -= Math.max(0, complexityDiff * 10);

    // Penalize type changes
    if (baseline.type !== migrated.type) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(
    _baseline: ComponentDefinition,
    migrated: ComponentDefinition
  ): number {
    // Simple heuristic based on complexity
    const complexityScores = {
      simple: 100,
      moderate: 85,
      complex: 70,
      critical: 50,
    };
    return complexityScores[migrated.complexity];
  }

  /**
   * Calculate maintainability score
   */
  private calculateMaintainabilityScore(
    component: ComponentDefinition
  ): number {
    let score = 100;

    // Factor in complexity
    const complexityPenalty = {
      simple: 0,
      moderate: 10,
      complex: 25,
      critical: 40,
    };
    score -= complexityPenalty[component.complexity];

    // Factor in documentation
    if (!component.metadata.documentation) {
      score -= 10;
    }

    // Factor in business logic count
    if (component.businessLogic.length > 10) {
      score -= 15;
    }

    return Math.max(0, score);
  }

  /**
   * Calculate overall validation score
   */
  private calculateValidationScore(
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    let score = 100;

    // Deduct points for errors and warnings
    score -= errors.length * 20;
    score -= warnings.length * 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Map difference category to quality category
   */
  private mapDifferenceToQualityCategory(
    category: Difference['category']
  ): QualityIssue['category'] {
    const mapping: Record<Difference['category'], QualityIssue['category']> = {
      props: 'type-safety',
      'business-logic': 'business-logic',
      dependencies: 'maintainability',
      patterns: 'maintainability',
      structure: 'maintainability',
    };

    return mapping[category];
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create an equivalency validator instance
 */
export function createValidator(): EquivalencyValidator {
  return new EquivalencyValidator();
}

/**
 * Quick validation
 */
export async function validateMigration(
  baseline: ComponentDefinition,
  migrated: ComponentDefinition,
  options?: ValidationOptions
): Promise<ValidationResult> {
  const validator = createValidator();
  return validator.validate(baseline, migrated, options);
}

/**
 * Quick comparison
 */
export async function compareComponents(
  baseline: ComponentDefinition,
  migrated: ComponentDefinition,
  options?: ValidationOptions
): Promise<ComparisonResult> {
  const validator = createValidator();
  return validator.compare(baseline, migrated, options);
}

/**
 * Quick quality assessment
 */
export async function assessComponentQuality(
  baseline: ComponentDefinition,
  migrated: ComponentDefinition
): Promise<QualityAssessment> {
  const validator = createValidator();
  return validator.assessQuality(baseline, migrated);
}
