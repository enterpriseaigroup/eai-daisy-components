/**
 * Validation Utilities
 *
 * Comprehensive validation system for component structure, dependencies,
 * and business logic preservation. Provides type-safe validation with
 * detailed error reporting and recovery suggestions.
 *
 * @fileoverview Component and pipeline validation utilities
 * @version 1.0.0
 */

import { resolve, extname, dirname } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import type {
  ComponentDefinition,
  ComponentType,
  ExtractionConfig,
  ValidationConfig,
} from '@/types';
import { ValidationError } from '@/utils/errors';
import { Logger } from '@/utils/logging';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Validation issue details
 */
export interface ValidationIssue {
  /** Unique issue identifier */
  readonly id: string;

  /** Issue severity level */
  readonly severity: ValidationSeverity;

  /** Human-readable issue description */
  readonly message: string;

  /** File path where issue was found */
  readonly filePath?: string;

  /** Line number where issue occurs */
  readonly line?: number;

  /** Column number where issue occurs */
  readonly column?: number;

  /** Suggested fix or resolution */
  readonly suggestion?: string;

  /** Related issues or dependencies */
  readonly relatedIssues?: string[];

  /** Validation rule that triggered this issue */
  readonly rule: string;

  /** Additional context data */
  readonly context?: Record<string, unknown>;
}

/**
 * Validation rule definition
 */
export interface ValidationRule {
  /** Rule identifier */
  readonly id: string;

  /** Rule name for display */
  readonly name: string;

  /** Rule description */
  readonly description: string;

  /** Rule severity */
  readonly severity: ValidationSeverity;

  /** Whether rule is enabled by default */
  readonly enabled: boolean;

  /** Rule categories */
  readonly categories: string[];

  /** Validation function */
  readonly validate: (
    component: ComponentDefinition,
    context: ValidationContext
  ) => Promise<ValidationIssue[]>;
}

/**
 * Validation context with shared data
 */
export interface ValidationContext {
  /** Pipeline configuration */
  readonly config: ExtractionConfig;

  /** Logger instance */
  readonly logger: Logger;

  /** All components being validated */
  readonly allComponents: ComponentDefinition[];

  /** File system root path */
  readonly rootPath: string;

  /** Validation-specific options */
  readonly options: ValidationConfig;

  /** Shared validation cache */
  readonly cache: Map<string, unknown>;
}

/**
 * Comprehensive validation result
 */
export interface ComponentValidationResult {
  /** Component being validated */
  readonly component: ComponentDefinition;

  /** All validation issues found */
  readonly issues: ValidationIssue[];

  /** Whether validation passed */
  readonly isValid: boolean;

  /** Error count by severity */
  readonly errorCount: number;
  readonly warningCount: number;
  readonly infoCount: number;

  /** Total validation time */
  readonly duration: number;

  /** Applied rules */
  readonly appliedRules: string[];

  /** Skipped rules with reasons */
  readonly skippedRules: Array<{ rule: string; reason: string }>;
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Component structure validation rules
 */
export const STRUCTURE_RULES: ValidationRule[] = [
  {
    id: 'component-name-valid',
    name: 'Valid Component Name',
    description: 'Component name must follow naming conventions',
    severity: 'error',
    enabled: true,
    categories: ['structure', 'naming'],
    async validate(component: ComponentDefinition): Promise<ValidationIssue[]> {
      const issues: ValidationIssue[] = [];
      const namePattern = /^[A-Z][a-zA-Z0-9]*$/;

      if (!namePattern.test(component.name)) {
        issues.push({
          id: `${component.id}-invalid-name`,
          severity: 'error',
          message: `Component name '${component.name}' must start with uppercase letter and contain only alphanumeric characters`,
          filePath: component.sourcePath,
          suggestion:
            'Rename component to follow PascalCase convention (e.g., MyComponent)',
          rule: 'component-name-valid',
          context: { componentName: component.name },
        });
      }

      return issues;
    },
  },

  {
    id: 'component-file-exists',
    name: 'Component File Exists',
    description: 'Component file must exist on filesystem',
    severity: 'error',
    enabled: true,
    categories: ['structure', 'filesystem'],
    async validate(
      component: ComponentDefinition,
      context: ValidationContext
    ): Promise<ValidationIssue[]> {
      const issues: ValidationIssue[] = [];
      const fullPath = resolve(context.rootPath, component.sourcePath);

      if (!existsSync(fullPath)) {
        issues.push({
          id: `${component.id}-file-missing`,
          severity: 'error',
          message: `Component file does not exist: ${component.sourcePath}`,
          filePath: component.sourcePath,
          suggestion:
            'Check if file path is correct or if file was moved/deleted',
          rule: 'component-file-exists',
          context: { fullPath, relativePath: component.sourcePath },
        });
      }

      return issues;
    },
  },

  {
    id: 'component-has-business-logic',
    name: 'Component Has Business Logic',
    description: 'Component should have documented business logic',
    severity: 'warning',
    enabled: true,
    categories: ['structure', 'business-logic'],
    async validate(component: ComponentDefinition): Promise<ValidationIssue[]> {
      const issues: ValidationIssue[] = [];

      if (!component.businessLogic || component.businessLogic.length === 0) {
        issues.push({
          id: `${component.id}-no-business-logic`,
          severity: 'warning',
          message: `Component '${component.name}' has no documented business logic`,
          filePath: component.sourcePath,
          suggestion:
            'Review component for business logic and document methods',
          rule: 'component-has-business-logic',
          context: { businessLogicCount: 0 },
        });
      }

      return issues;
    },
  },

  {
    id: 'component-type-valid',
    name: 'Valid Component Type',
    description: 'Component type must be correctly identified',
    severity: 'warning',
    enabled: true,
    categories: ['structure', 'type'],
    async validate(component: ComponentDefinition): Promise<ValidationIssue[]> {
      const issues: ValidationIssue[] = [];
      const validTypes: ComponentType[] = [
        'functional',
        'class',
        'higher-order',
        'hook',
        'utility',
      ];

      if (!validTypes.includes(component.type)) {
        issues.push({
          id: `${component.id}-invalid-type`,
          severity: 'warning',
          message: `Component type '${component.type}' is not recognized`,
          filePath: component.sourcePath,
          suggestion: `Use one of: ${validTypes.join(', ')}`,
          rule: 'component-type-valid',
          context: { componentType: component.type, validTypes },
        });
      }

      return issues;
    },
  },
];

/**
 * Dependency validation rules
 */
export const DEPENDENCY_RULES: ValidationRule[] = [
  {
    id: 'dependencies-resolvable',
    name: 'Resolvable Dependencies',
    description: 'All component dependencies must be resolvable',
    severity: 'error',
    enabled: true,
    categories: ['dependencies', 'imports'],
    async validate(component: ComponentDefinition): Promise<ValidationIssue[]> {
      const issues: ValidationIssue[] = [];

      for (const dep of component.dependencies) {
        if (dep.type === 'component' && dep.importPath.startsWith('./')) {
          const depPath = resolve(
            dirname(component.sourcePath),
            dep.importPath
          );

          if (
            !existsSync(depPath) &&
            !existsSync(`${depPath}.ts`) &&
            !existsSync(`${depPath}.tsx`)
          ) {
            issues.push({
              id: `${component.id}-unresolvable-dep-${dep.name}`,
              severity: 'error',
              message: `Cannot resolve dependency '${dep.name}' from path '${dep.importPath}'`,
              filePath: component.sourcePath,
              suggestion: 'Check if dependency path is correct and file exists',
              rule: 'dependencies-resolvable',
              context: { dependency: dep, resolvedPath: depPath },
            });
          }
        }
      }

      return issues;
    },
  },

  {
    id: 'no-circular-dependencies',
    name: 'No Circular Dependencies',
    description: 'Components must not have circular dependency chains',
    severity: 'error',
    enabled: true,
    categories: ['dependencies', 'circular'],
    async validate(
      component: ComponentDefinition,
      context: ValidationContext
    ): Promise<ValidationIssue[]> {
      const issues: ValidationIssue[] = [];
      const visited = new Set<string>();
      const recursionStack = new Set<string>();

      const findCircularDeps = (
        currentId: string,
        path: string[]
      ): string[] | null => {
        if (recursionStack.has(currentId)) {
          const circleStart = path.indexOf(currentId);
          return path.slice(circleStart);
        }

        if (visited.has(currentId)) {
          return null;
        }

        visited.add(currentId);
        recursionStack.add(currentId);

        const currentComponent = context.allComponents.find(
          c => c.id === currentId
        );
        if (!currentComponent) return null;

        for (const dep of currentComponent.dependencies) {
          if (dep.type === 'component') {
            const depComponent = context.allComponents.find(
              c => c.name === dep.name
            );
            if (depComponent) {
              const cycle = findCircularDeps(depComponent.id, [
                ...path,
                currentId,
              ]);
              if (cycle) return cycle;
            }
          }
        }

        recursionStack.delete(currentId);
        return null;
      };

      const cycle = findCircularDeps(component.id, []);
      if (cycle) {
        const cyclePath = cycle
          .map(id => {
            const comp = context.allComponents.find(c => c.id === id);
            return comp?.name || id;
          })
          .join(' → ');

        issues.push({
          id: `${component.id}-circular-dependency`,
          severity: 'error',
          message: `Circular dependency detected: ${cyclePath}`,
          filePath: component.sourcePath,
          suggestion: 'Refactor components to break circular dependency chain',
          rule: 'no-circular-dependencies',
          context: { cycle, cyclePath },
        });
      }

      return issues;
    },
  },
];

/**
 * Business logic preservation rules
 */
export const BUSINESS_LOGIC_RULES: ValidationRule[] = [
  {
    id: 'preserve-business-logic',
    name: 'Preserve Business Logic',
    description: 'Component business logic must be documented and preserved',
    severity: 'warning',
    enabled: true,
    categories: ['business-logic', 'documentation'],
    async validate(component: ComponentDefinition): Promise<ValidationIssue[]> {
      const issues: ValidationIssue[] = [];

      if (!component.businessLogic || component.businessLogic.length === 0) {
        issues.push({
          id: `${component.id}-no-business-logic`,
          severity: 'warning',
          message: `Component '${component.name}' has no documented business logic`,
          filePath: component.sourcePath,
          suggestion:
            'Review component for business logic and document methods',
          rule: 'preserve-business-logic',
          context: { businessLogicCount: 0 },
        });
      }

      return issues;
    },
  },

  {
    id: 'preserve-react-patterns',
    name: 'Preserve React Patterns',
    description: 'React patterns must be documented for migration',
    severity: 'info',
    enabled: true,
    categories: ['business-logic', 'react'],
    async validate(component: ComponentDefinition): Promise<ValidationIssue[]> {
      const issues: ValidationIssue[] = [];

      if (component.reactPatterns && component.reactPatterns.length > 0) {
        const complexPatterns = component.reactPatterns.filter(pattern =>
          [
            'useReducer',
            'custom-hook',
            'render-props',
            'children-as-function',
          ].includes(pattern)
        );

        if (complexPatterns.length > 0) {
          issues.push({
            id: `${component.id}-complex-patterns`,
            severity: 'info',
            message: `Component uses complex React patterns: ${complexPatterns.join(', ')}`,
            filePath: component.sourcePath,
            suggestion:
              'Review patterns to ensure they are preserved during migration',
            rule: 'preserve-react-patterns',
            context: { complexPatterns },
          });
        }
      }

      return issues;
    },
  },

  {
    id: 'complexity-assessment',
    name: 'Complexity Assessment',
    description: 'High complexity components need careful migration planning',
    severity: 'warning',
    enabled: true,
    categories: ['business-logic', 'complexity'],
    async validate(component: ComponentDefinition): Promise<ValidationIssue[]> {
      const issues: ValidationIssue[] = [];

      if (
        component.complexity === 'complex' ||
        component.complexity === 'critical'
      ) {
        issues.push({
          id: `${component.id}-high-complexity`,
          severity: component.complexity === 'critical' ? 'error' : 'warning',
          message: `Component has ${component.complexity} complexity and requires careful migration`,
          filePath: component.sourcePath,
          suggestion:
            'Plan migration carefully, consider breaking into smaller components',
          rule: 'complexity-assessment',
          context: { complexity: component.complexity },
        });
      }

      return issues;
    },
  },
];

// ============================================================================
// VALIDATION MANAGER
// ============================================================================

/**
 * Component validation manager
 */
export class ComponentValidator {
  private readonly rules: Map<string, ValidationRule> = new Map();
  private readonly context: ValidationContext;

  constructor(context: ValidationContext) {
    this.context = context;
    this.loadDefaultRules();
  }

  /**
   * Load default validation rules
   */
  private loadDefaultRules(): void {
    const allRules = [
      ...STRUCTURE_RULES,
      ...DEPENDENCY_RULES,
      ...BUSINESS_LOGIC_RULES,
    ];

    allRules.forEach(rule => {
      if (this.shouldEnableRule(rule)) {
        this.rules.set(rule.id, rule);
      }
    });

    this.context.logger.debug('Loaded validation rules', {
      totalRules: allRules.length,
      enabledRules: this.rules.size,
      disabledRules: allRules.length - this.rules.size,
    });
  }

  /**
   * Check if rule should be enabled based on configuration
   */
  private shouldEnableRule(rule: ValidationRule): boolean {
    const config = this.context.options;

    // Check if strict mode disables non-error rules
    if (config.strict && rule.severity !== 'error') {
      return false;
    }

    // Check category-specific configuration
    if (rule.categories.includes('structure') && !config.componentStructure) {
      return false;
    }

    if (
      rule.categories.includes('business-logic') &&
      !config.businessLogicPreservation
    ) {
      return false;
    }

    return rule.enabled;
  }

  /**
   * Validate single component
   */
  public async validateComponent(
    component: ComponentDefinition
  ): Promise<ComponentValidationResult> {
    const startTime = Date.now();
    const issues: ValidationIssue[] = [];
    const appliedRules: string[] = [];
    const skippedRules: Array<{ rule: string; reason: string }> = [];

    this.context.logger.debug('Validating component', {
      componentId: component.id,
      componentName: component.name,
      rulesCount: this.rules.size,
    });

    for (const [ruleId, rule] of this.rules) {
      try {
        const ruleIssues = await rule.validate(component, this.context);
        issues.push(...ruleIssues);
        appliedRules.push(ruleId);

        this.context.logger.debug('Applied validation rule', {
          ruleId,
          componentId: component.id,
          issuesFound: ruleIssues.length,
        });
      } catch (error) {
        skippedRules.push({
          rule: ruleId,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });

        this.context.logger.warn('Skipped validation rule due to error', {
          ruleId,
          componentId: component.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const duration = Date.now() - startTime;
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    const result: ComponentValidationResult = {
      component,
      issues,
      isValid: errorCount === 0,
      errorCount,
      warningCount,
      infoCount,
      duration,
      appliedRules,
      skippedRules,
    };

    this.context.logger.info('Component validation completed', {
      componentId: component.id,
      isValid: result.isValid,
      totalIssues: issues.length,
      errorCount,
      warningCount,
      infoCount,
      duration: `${duration}ms`,
    });

    return result;
  }

  /**
   * Validate multiple components
   */
  public async validateComponents(
    components: ComponentDefinition[]
  ): Promise<ComponentValidationResult[]> {
    const results: ComponentValidationResult[] = [];

    this.context.logger.info('Starting batch component validation', {
      componentCount: components.length,
      enabledRules: this.rules.size,
    });

    for (const component of components) {
      try {
        const result = await this.validateComponent(component);
        results.push(result);
      } catch (error) {
        const errorResult: ComponentValidationResult = {
          component,
          issues: [
            {
              id: `${component.id}-validation-error`,
              severity: 'error',
              message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
              filePath: component.sourcePath,
              rule: 'validation-error',
              context: { error: String(error) },
            },
          ],
          isValid: false,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          duration: 0,
          appliedRules: [],
          skippedRules: [],
        };

        results.push(errorResult);

        this.context.logger.error(
          'Component validation failed',
          error as Error,
          {
            componentId: component.id,
            componentName: component.name,
          }
        );
      }
    }

    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    const validComponents = results.filter(r => r.isValid).length;

    this.context.logger.info('Batch validation completed', {
      totalComponents: components.length,
      validComponents,
      invalidComponents: components.length - validComponents,
      totalIssues,
      totalDuration: `${results.reduce((sum, r) => sum + r.duration, 0)}ms`,
    });

    return results;
  }

  /**
   * Add custom validation rule
   */
  public addRule(rule: ValidationRule): void {
    if (this.shouldEnableRule(rule)) {
      this.rules.set(rule.id, rule);
      this.context.logger.debug('Added custom validation rule', {
        ruleId: rule.id,
        ruleName: rule.name,
      });
    }
  }

  /**
   * Remove validation rule
   */
  public removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      this.context.logger.debug('Removed validation rule', { ruleId });
    }
    return removed;
  }

  /**
   * Get enabled rules
   */
  public getEnabledRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create validation context
 */
export function createValidationContext(
  config: ExtractionConfig,
  logger: Logger,
  allComponents: ComponentDefinition[],
  rootPath: string
): ValidationContext {
  return {
    config,
    logger,
    allComponents,
    rootPath,
    options: config.validation,
    cache: new Map(),
  };
}

/**
 * Format validation results for display
 */
export function formatValidationResults(
  results: ComponentValidationResult[]
): string {
  const lines: string[] = [];

  // Summary
  const totalComponents = results.length;
  const validComponents = results.filter(r => r.isValid).length;
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);

  lines.push('='.repeat(60));
  lines.push('VALIDATION RESULTS SUMMARY');
  lines.push('='.repeat(60));
  lines.push(`Components validated: ${totalComponents}`);
  lines.push(`Valid components: ${validComponents}`);
  lines.push(`Invalid components: ${totalComponents - validComponents}`);
  lines.push(`Total issues: ${totalIssues}`);
  lines.push(`Errors: ${totalErrors}, Warnings: ${totalWarnings}`);
  lines.push('');

  // Details for components with issues
  results.forEach(result => {
    if (result.issues.length > 0) {
      lines.push(
        `Component: ${result.component.name} (${result.component.sourcePath})`
      );
      lines.push('-'.repeat(40));

      result.issues.forEach(issue => {
        const prefix =
          issue.severity === 'error'
            ? '❌'
            : issue.severity === 'warning'
              ? '⚠️'
              : 'ℹ️';
        lines.push(`${prefix} ${issue.message}`);
        if (issue.suggestion) {
          lines.push(`   💡 ${issue.suggestion}`);
        }
      });
      lines.push('');
    }
  });

  return lines.join('\n');
}

/**
 * Validate component configuration
 */
export function validateExtractionConfig(config: unknown): ExtractionConfig {
  try {
    // This would use the same Zod schema from ConfigurationManager
    // For now, we'll do basic validation
    if (!config || typeof config !== 'object') {
      throw new ValidationError('Configuration must be an object');
    }

    return config as ExtractionConfig;
  } catch (error) {
    throw new ValidationError(
      'Invalid extraction configuration',
      {
        operation: 'config-validation',
        data: { configType: typeof config },
      },
      error as Error
    );
  }
}

/**
 * Check if file is a valid component file
 */
export async function isValidComponentFile(filePath: string): Promise<boolean> {
  try {
    const ext = extname(filePath);
    const validExtensions = ['.ts', '.tsx', '.js', '.jsx'];

    if (!validExtensions.includes(ext)) {
      return false;
    }

    const content = await readFile(filePath, 'utf-8');

    // Basic checks for component patterns
    const hasExport = /export\s+(default\s+)?/.test(content);
    const hasComponent = /function\s+\w+|class\s+\w+|const\s+\w+\s*=/.test(
      content
    );

    return hasExport && hasComponent;
  } catch {
    return false;
  }
}

// ============================================================================
// ADDITIONAL UTILITY EXPORTS
// ============================================================================

/**
 * ValidationEngine type alias for backward compatibility
 */
export type ValidationEngine = ComponentValidator;

/**
 * Create a validation engine (alias for creating validator)
 */
export function createValidationEngine(
  context: ValidationContext
): ValidationEngine {
  return new ComponentValidator(context);
}

/**
 * Validate a single component definition
 */
export async function validateComponentDefinition(
  component: ComponentDefinition,
  context: ValidationContext
): Promise<ComponentValidationResult> {
  const validator = new ComponentValidator(context);
  return validator.validateComponent(component);
}

/**
 * Validate migration result (placeholder for future implementation)
 */
export async function validateMigrationResult(
  component: ComponentDefinition,
  transformedCode: string,
  context: ValidationContext
): Promise<ComponentValidationResult> {
  // For now, validate the component definition
  // In the future, this would also validate the transformed code
  const validator = new ComponentValidator(context);
  const result = await validator.validateComponent(component);

  // Add validation for transformed code
  if (transformedCode.length === 0) {
    result.issues.push({
      id: `${component.id}-empty-transformation`,
      severity: 'error',
      message: 'Transformed code is empty',
      filePath: component.sourcePath,
      rule: 'migration-validation',
      suggestion: 'Check transformation process for errors',
    });
  }

  return result;
}
