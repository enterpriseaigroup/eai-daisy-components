/**
 * Configurator Pattern Transformer
 *
 * Transforms DAISY v1 component business logic to Configurator v2 patterns
 * while preserving functionality and business rules.
 *
 * @fileoverview Component transformation engine for Configurator patterns
 * @version 1.0.0
 */

import type {
  ComponentDefinition,
  MigrationStrategy,
  PropDefinition,
} from '@/types';
import {
  type BusinessLogicAnalysis,
  BusinessLogicAnalyzer,
} from '@/utils/business-logic-analyzer';
import { getGlobalLogger } from '@/utils/logging';
import { TransformationError } from '@/utils/errors';

// ============================================================================
// TRANSFORMATION TYPES
// ============================================================================

/**
 * Transformation result
 */
export interface TransformationResult {
  /** Original component */
  readonly original: ComponentDefinition;

  /** Transformed component definition */
  readonly transformed: ComponentDefinition;

  /** Transformation strategy used */
  readonly strategy: MigrationStrategy;

  /** Code transformations applied */
  readonly transformations: CodeTransformation[];

  /** Pattern mappings */
  readonly patternMappings: PatternMapping[];

  /** Business logic preservation status */
  readonly businessLogicPreserved: boolean;

  /** Transformation warnings */
  readonly warnings: string[];

  /** Manual review required */
  readonly requiresManualReview: boolean;
}

/**
 * Code transformation record
 */
export interface CodeTransformation {
  /** Transformation type */
  readonly type:
    | 'hook'
    | 'prop'
    | 'handler'
    | 'state'
    | 'effect'
    | 'validation';

  /** Original code */
  readonly original: string;

  /** Transformed code */
  readonly transformed: string;

  /** Transformation description */
  readonly description: string;

  /** Configurator pattern used */
  readonly pattern: string;
}

/**
 * Pattern mapping
 */
export interface PatternMapping {
  /** DAISY v1 pattern */
  readonly v1Pattern: string;

  /** Configurator v2 pattern */
  readonly v2Pattern: string;

  /** Mapping rationale */
  readonly rationale: string;

  /** Example code */
  readonly example?: string;
}

// ============================================================================
// CONFIGURATOR TRANSFORMER
// ============================================================================

/**
 * Transforms components to Configurator-compatible patterns
 */
export class ConfiguratorTransformer {
  private readonly analyzer: BusinessLogicAnalyzer;
  private readonly logger = getGlobalLogger('ConfiguratorTransformer');

  constructor() {
    this.analyzer = new BusinessLogicAnalyzer();
  }

  /**
   * Transform component to Configurator patterns
   *
   * @param component - Component to transform
   * @param sourceCode - Component source code
   * @returns Transformation result
   */
  public async transform(
    component: ComponentDefinition,
    sourceCode: string
  ): Promise<TransformationResult> {
    this.logger.info(`Transforming component: ${component.name}`);

    try {
      // Analyze business logic
      const analysis = this.analyzer.analyzeComponent(component, sourceCode);

      // Determine transformation strategy
      const strategy = this.determineStrategy(component, analysis);

      // Apply transformations
      const transformations = await this.applyTransformations(
        component,
        sourceCode,
        analysis,
        strategy
      );

      // Create pattern mappings
      const patternMappings = this.createPatternMappings(component, analysis);

      // Create transformed component definition
      const transformed = this.createTransformedComponent(
        component,
        transformations
      );

      // Validate business logic preservation
      const businessLogicPreserved = this.validateBusinessLogicPreservation(
        analysis,
        transformations
      );

      const warnings = this.collectWarnings(
        transformations,
        businessLogicPreserved
      );
      const requiresManualReview = this.requiresManualReview(
        strategy,
        transformations,
        businessLogicPreserved
      );

      this.logger.info(`Transformation completed: ${component.name}`, {
        strategy,
        transformationCount: transformations.length,
        requiresManualReview,
      });

      return {
        original: component,
        transformed,
        strategy,
        transformations,
        patternMappings,
        businessLogicPreserved,
        warnings,
        requiresManualReview,
      };
    } catch (error) {
      throw new TransformationError(
        `Failed to transform component: ${component.name}`,
        { component, operation: 'transform' },
        error as Error
      );
    }
  }

  /**
   * Determine transformation strategy
   */
  private determineStrategy(
    component: ComponentDefinition,
    analysis: BusinessLogicAnalysis
  ): MigrationStrategy {
    if (component.complexity === 'simple' && analysis.complexityScore < 20) {
      return 'direct-translation';
    }

    if (component.complexity === 'moderate' && analysis.complexityScore < 50) {
      return 'pattern-mapping';
    }

    if (component.complexity === 'complex' || analysis.complexityScore > 50) {
      return 'manual-review-required';
    }

    return 'hybrid-approach';
  }

  /**
   * Apply component transformations
   */
  private applyTransformations(
    component: ComponentDefinition,
    _sourceCode: string,
    analysis: BusinessLogicAnalysis,
    _strategy: MigrationStrategy
  ): Promise<CodeTransformation[]> {
    const transformations: CodeTransformation[] = [];

    // Transform props
    transformations.push(...this.transformProps(component.props));

    // Transform hooks
    transformations.push(...this.transformHooks(analysis.stateManagement));

    // Transform event handlers
    transformations.push(
      ...this.transformEventHandlers(analysis.eventHandlers)
    );

    // Transform side effects
    transformations.push(...this.transformSideEffects(analysis.sideEffects));

    // Transform validations
    transformations.push(...this.transformValidations(analysis.validations));

    return Promise.resolve(transformations);
  }

  /**
   * Transform component props to Configurator format
   */
  private transformProps(props: PropDefinition[]): CodeTransformation[] {
    return props.map(prop => ({
      type: 'prop' as const,
      original: `${prop.name}: ${prop.type}`,
      transformed: `${prop.name}: ${this.transformType(prop.type)}`,
      description: `Transform prop ${prop.name} to Configurator type system`,
      pattern: 'Configurator Props Interface',
    }));
  }

  /**
   * Transform React hooks to Configurator patterns
   */
  private transformHooks(
    stateManagement: BusinessLogicAnalysis['stateManagement']
  ): CodeTransformation[] {
    return stateManagement.map(state => ({
      type: 'state' as const,
      original: `const [${state.name}, ${state.setter}] = ${state.type}(${state.initialValue})`,
      transformed: `const ${state.name} = useConfiguratorState(${state.initialValue})`,
      description: `Transform ${state.type} to Configurator state management`,
      pattern: 'useConfiguratorState',
    }));
  }

  /**
   * Transform event handlers
   */
  private transformEventHandlers(
    handlers: BusinessLogicAnalysis['eventHandlers']
  ): CodeTransformation[] {
    return handlers.map(handler => ({
      type: 'handler' as const,
      original: `const ${handler.name} = ${handler.signature}`,
      transformed: `const ${handler.name} = useConfiguratorCallback(${handler.signature})`,
      description: `Optimize ${handler.name} with Configurator memoization`,
      pattern: 'useConfiguratorCallback',
    }));
  }

  /**
   * Transform side effects
   */
  private transformSideEffects(
    effects: BusinessLogicAnalysis['sideEffects']
  ): CodeTransformation[] {
    return effects.map((effect, index) => ({
      type: 'effect' as const,
      original: `useEffect(() => { ${effect.code} }, [${effect.dependencies.join(', ')}])`,
      transformed: `useConfiguratorEffect(() => { ${effect.code} }, [${effect.dependencies.join(', ')}])`,
      description: `Transform side effect ${index + 1} to Configurator pattern`,
      pattern: 'useConfiguratorEffect',
    }));
  }

  /**
   * Transform validation logic
   */
  private transformValidations(
    validations: BusinessLogicAnalysis['validations']
  ): CodeTransformation[] {
    return validations.map(validation => ({
      type: 'validation' as const,
      original: `validate${validation.name}`,
      transformed: `useConfiguratorValidation('${validation.field}', ${JSON.stringify(validation.rules)})`,
      description: 'Transform validation logic to Configurator pattern',
      pattern: 'useConfiguratorValidation',
    }));
  }

  /**
   * Transform TypeScript type
   */
  private transformType(type: string): string {
    // Map DAISY v1 types to Configurator types
    const typeMap: Record<string, string> = {
      string: 'ConfigString',
      number: 'ConfigNumber',
      boolean: 'ConfigBoolean',
      Date: 'ConfigDateTime',
      function: 'ConfigCallback',
      object: 'ConfigObject',
    };

    return typeMap[type] || type;
  }

  /**
   * Create pattern mappings
   */
  private createPatternMappings(
    _component: ComponentDefinition,
    analysis: BusinessLogicAnalysis
  ): PatternMapping[] {
    const mappings: PatternMapping[] = [];

    // State management mappings
    if (analysis.stateManagement.length > 0) {
      mappings.push({
        v1Pattern: 'useState',
        v2Pattern: 'useConfiguratorState',
        rationale:
          'Configurator provides optimized state management with automatic memoization',
        example: 'const count = useConfiguratorState(0);',
      });
    }

    // Effect mappings
    if (analysis.sideEffects.length > 0) {
      mappings.push({
        v1Pattern: 'useEffect',
        v2Pattern: 'useConfiguratorEffect',
        rationale:
          'Configurator effects integrate with the configuration lifecycle',
        example: 'useConfiguratorEffect(() => { /* effect */ }, [deps]);',
      });
    }

    return mappings;
  }

  /**
   * Create transformed component definition
   */
  private createTransformedComponent(
    component: ComponentDefinition,
    _transformations: CodeTransformation[] // TODO: Use transformations to update component metadata
  ): ComponentDefinition {
    return {
      ...component,
      migrationStatus: 'completed',
      metadata: {
        ...component.metadata,
        lastModified: new Date(),
      },
    };
  }

  /**
   * Validate business logic preservation
   */
  private validateBusinessLogicPreservation(
    analysis: BusinessLogicAnalysis,
    transformations: CodeTransformation[]
  ): boolean {
    // Check if all critical business logic has transformations
    const criticalRequirements = analysis.preservationRequirements.filter(
      r => r.critical
    );

    for (const requirement of criticalRequirements) {
      const hasTransformation = transformations.some(t =>
        t.description.includes(requirement.name)
      );

      if (!hasTransformation) {
        return false;
      }
    }

    return true;
  }

  /**
   * Collect transformation warnings
   */
  private collectWarnings(
    _transformations: CodeTransformation[],
    businessLogicPreserved: boolean
  ): string[] {
    const warnings: string[] = [];

    if (!businessLogicPreserved) {
      warnings.push('Business logic preservation could not be fully verified');
    }

    if (_transformations.length === 0) {
      warnings.push('No transformations were applied');
    }

    return warnings;
  }

  /**
   * Check if manual review is required
   */
  private requiresManualReview(
    strategy: MigrationStrategy,
    transformations: CodeTransformation[],
    businessLogicPreserved: boolean
  ): boolean {
    if (strategy === 'manual-review-required') {
      return true;
    }

    if (!businessLogicPreserved) {
      return true;
    }

    if (transformations.some(t => t.type === 'validation')) {
      return true;
    }

    return false;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create Configurator transformer
 */
export function createConfiguratorTransformer(): ConfiguratorTransformer {
  return new ConfiguratorTransformer();
}

/**
 * Transform component to Configurator patterns
 *
 * @param component - Component to transform
 * @param sourceCode - Component source code
 * @returns Transformation result
 */
export async function transformToConfigurator(
  component: ComponentDefinition,
  sourceCode: string
): Promise<TransformationResult> {
  const transformer = createConfiguratorTransformer();
  return transformer.transform(component, sourceCode);
}
