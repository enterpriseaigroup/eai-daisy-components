/**
 * Business Logic Analyzer
 *
 * Analyzes component business logic to identify functions, methods, state management,
 * side effects, and other critical business logic that must be preserved during migration.
 *
 * @fileoverview Business logic analysis and extraction utilities
 * @version 1.0.0
 */

import type {
  BusinessLogicDefinition,
  ComplexityLevel,
  ComponentDefinition,
  ParameterDefinition,
} from '@/types';
import { getGlobalLogger } from '@/utils/logging';

// ============================================================================
// ANALYSIS TYPES
// ============================================================================

/**
 * Business logic analysis result
 */
export interface BusinessLogicAnalysis {
  /** Identified business logic functions */
  readonly functions: BusinessLogicDefinition[];

  /** State management patterns */
  readonly stateManagement: StateManagementPattern[];

  /** Side effects identified */
  readonly sideEffects: SideEffect[];

  /** Event handlers */
  readonly eventHandlers: EventHandler[];

  /** Data transformations */
  readonly dataTransformations: DataTransformation[];

  /** Validation logic */
  readonly validations: ValidationLogic[];

  /** Business rules */
  readonly businessRules: BusinessRule[];

  /** Complexity score */
  readonly complexityScore: number;

  /** Preservation requirements */
  readonly preservationRequirements: PreservationRequirement[];
}

/**
 * State management pattern
 */
export interface StateManagementPattern {
  /** Pattern type */
  readonly type: 'useState' | 'useReducer' | 'useContext' | 'custom';

  /** State variable name */
  readonly name: string;

  /** State type */
  readonly stateType: string;

  /** Initial value */
  readonly initialValue?: string;

  /** Setter function name */
  readonly setter?: string;

  /** Dependencies */
  readonly dependencies: string[];
}

/**
 * Side effect definition
 */
export interface SideEffect {
  /** Effect type */
  readonly type:
    | 'useEffect'
    | 'useLayoutEffect'
    | 'api-call'
    | 'dom-manipulation';

  /** Effect description */
  readonly description: string;

  /** Dependencies */
  readonly dependencies: string[];

  /** Cleanup required */
  readonly hasCleanup: boolean;

  /** Effect code */
  readonly code: string;
}

/**
 * Event handler definition
 */
export interface EventHandler {
  /** Handler name */
  readonly name: string;

  /** Event type */
  readonly eventType: string;

  /** Handler signature */
  readonly signature: string;

  /** Business logic in handler */
  readonly businessLogic: string[];

  /** State updates */
  readonly stateUpdates: string[];
}

/**
 * Data transformation
 */
export interface DataTransformation {
  /** Transformation name */
  readonly name: string;

  /** Input type */
  readonly inputType: string;

  /** Output type */
  readonly outputType: string;

  /** Transformation logic */
  readonly logic: string;

  /** Pure function */
  readonly isPure: boolean;
}

/**
 * Validation logic
 */
export interface ValidationLogic {
  /** Validation name */
  readonly name: string;

  /** Field being validated */
  readonly field: string;

  /** Validation rules */
  readonly rules: string[];

  /** Error messages */
  readonly errorMessages: Record<string, string>;
}

/**
 * Business rule
 */
export interface BusinessRule {
  /** Rule name */
  readonly name: string;

  /** Rule description */
  readonly description: string;

  /** Conditions */
  readonly conditions: string[];

  /** Actions */
  readonly actions: string[];

  /** Priority */
  readonly priority: 'high' | 'medium' | 'low';
}

/**
 * Preservation requirement
 */
export interface PreservationRequirement {
  /** Requirement type */
  readonly type: 'function' | 'state' | 'effect' | 'validation' | 'rule';

  /** Element name */
  readonly name: string;

  /** Requirement description */
  readonly description: string;

  /** Critical for functionality */
  readonly critical: boolean;

  /** Migration notes */
  readonly notes?: string;
}

// ============================================================================
// BUSINESS LOGIC ANALYZER
// ============================================================================

/**
 * Analyzes component business logic for preservation
 */
export class BusinessLogicAnalyzer {
  private readonly logger = getGlobalLogger('BusinessLogicAnalyzer');

  /**
   * Analyze component business logic
   *
   * @param component - Component to analyze
   * @param sourceCode - Component source code
   * @returns Business logic analysis
   */
  public analyzeComponent(
    component: ComponentDefinition,
    sourceCode: string,
  ): BusinessLogicAnalysis {
    this.logger.debug(`Analyzing business logic: ${component.name}`);

    const functions = this.analyzeFunctions(sourceCode, component);
    const stateManagement = this.analyzeStateManagement(sourceCode);
    const sideEffects = this.analyzeSideEffects(sourceCode);
    const eventHandlers = this.analyzeEventHandlers(sourceCode);
    const dataTransformations = this.analyzeDataTransformations(sourceCode);
    const validations = this.analyzeValidations(sourceCode);
    const businessRules = this.analyzeBusinessRules(sourceCode);

    const complexityScore = this.calculateComplexityScore({
      functions,
      stateManagement,
      sideEffects,
      eventHandlers,
      dataTransformations,
      validations,
      businessRules,
    });

    const preservationRequirements = this.identifyPreservationRequirements({
      functions,
      stateManagement,
      sideEffects,
      eventHandlers,
      dataTransformations,
      validations,
      businessRules,
    });

    return {
      functions,
      stateManagement,
      sideEffects,
      eventHandlers,
      dataTransformations,
      validations,
      businessRules,
      complexityScore,
      preservationRequirements,
    };
  }

  /**
   * Analyze functions in component
   */
  private analyzeFunctions(
    sourceCode: string,
    component: ComponentDefinition,
  ): BusinessLogicDefinition[] {
    // Start with component's existing business logic
    const functions: BusinessLogicDefinition[] = [...component.businessLogic];

    // Look for additional function patterns
    const functionPatterns = [
      /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g,
      /function\s+(\w+)\s*\([^)]*\)/g,
      /async\s+function\s+(\w+)\s*\([^)]*\)/g,
    ];

    for (const pattern of functionPatterns) {
      const matches = sourceCode.matchAll(pattern);
      for (const match of matches) {
        const functionName = match[1];
        if (functionName && !functions.find(f => f.name === functionName)) {
          const params = this.extractParameters(sourceCode, match.index || 0);

          functions.push({
            name: functionName,
            signature: `${functionName}(${params.map(p => p.name).join(', ')})`,
            purpose: `Business logic function in ${component.name}`,
            parameters: params,
            returnType: 'unknown',
            complexity: this.assessFunctionComplexity(sourceCode, functionName),
            externalDependencies: this.extractDependencies(
              sourceCode,
              functionName,
            ),
          });
        }
      }
    }

    return functions;
  }

  /**
   * Analyze state management patterns
   */
  private analyzeStateManagement(sourceCode: string): StateManagementPattern[] {
    const patterns: StateManagementPattern[] = [];

    // useState patterns
    const useStateMatches = sourceCode.matchAll(
      /const\s*\[(\w+),\s*(\w+)\]\s*=\s*useState(?:<([^>]+)>)?\s*\(([^)]*)\)/g,
    );

    for (const match of useStateMatches) {
      const initialValue = match[4];
      const setter = match[2];
      patterns.push({
        type: 'useState',
        name: match[1] || 'state',
        stateType: match[3] || 'unknown',
        ...(initialValue ? { initialValue } : {}),
        ...(setter ? { setter } : {}),
        dependencies: [],
      });
    }

    // useReducer patterns
    const useReducerMatches = sourceCode.matchAll(
      /const\s*\[(\w+),\s*(\w+)\]\s*=\s*useReducer\s*\(([^,]+),\s*([^)]+)\)/g,
    );

    for (const match of useReducerMatches) {
      const initialValue = match[4];
      const setter = match[2];
      patterns.push({
        type: 'useReducer',
        name: match[1] || 'state',
        stateType: 'unknown',
        ...(initialValue ? { initialValue } : {}),
        ...(setter ? { setter } : {}),
        dependencies: [match[3] || ''],
      });
    }

    return patterns;
  }

  /**
   * Analyze side effects
   */
  private analyzeSideEffects(sourceCode: string): SideEffect[] {
    const effects: SideEffect[] = [];

    // useEffect patterns
    const effectMatches = sourceCode.matchAll(
      /useEffect\s*\(\s*\(\)\s*=>\s*\{([^}]+)\}(?:,\s*\[([^\]]*)\])?\)/gs,
    );

    for (const match of effectMatches) {
      const code = match[1] || '';
      const deps =
        match[2]
          ?.split(',')
          .map(d => d.trim())
          .filter(Boolean) || [];

      effects.push({
        type: 'useEffect',
        description: 'Side effect in component',
        dependencies: deps,
        hasCleanup: code.includes('return'),
        code,
      });
    }

    return effects;
  }

  /**
   * Analyze event handlers
   */
  private analyzeEventHandlers(sourceCode: string): EventHandler[] {
    const handlers: EventHandler[] = [];

    // onClick, onChange, etc.
    const handlerPatterns = [
      /const\s+(handle\w+)\s*=\s*\([^)]*\)\s*=>\s*\{([^}]+)\}/g,
      /const\s+(on\w+)\s*=\s*\([^)]*\)\s*=>\s*\{([^}]+)\}/g,
    ];

    for (const pattern of handlerPatterns) {
      const matches = sourceCode.matchAll(pattern);
      for (const match of matches) {
        handlers.push({
          name: match[1] || 'handler',
          eventType: 'unknown',
          signature: `${match[1]}()`,
          businessLogic: this.extractBusinessLogic(match[2] || ''),
          stateUpdates: this.extractStateUpdates(match[2] || ''),
        });
      }
    }

    return handlers;
  }

  /**
   * Analyze data transformations
   */
  private analyzeDataTransformations(sourceCode: string): DataTransformation[] {
    const transformations: DataTransformation[] = [];

    // map, filter, reduce operations
    const transformPatterns = [
      /\.map\s*\(([^)]+)\)/g,
      /\.filter\s*\(([^)]+)\)/g,
      /\.reduce\s*\(([^)]+)\)/g,
    ];

    for (const pattern of transformPatterns) {
      const matches = sourceCode.matchAll(pattern);
      for (const match of matches) {
        transformations.push({
          name: 'Data transformation',
          inputType: 'unknown',
          outputType: 'unknown',
          logic: match[1] || '',
          isPure:
            !match[1]?.includes('setState') && !match[1]?.includes('dispatch'),
        });
      }
    }

    return transformations;
  }

  /**
   * Analyze validation logic
   */
  private analyzeValidations(sourceCode: string): ValidationLogic[] {
    const validations: ValidationLogic[] = [];

    // Look for validation patterns
    if (sourceCode.includes('validate') || sourceCode.includes('isValid')) {
      validations.push({
        name: 'Component validation',
        field: 'unknown',
        rules: [],
        errorMessages: {},
      });
    }

    return validations;
  }

  /**
   * Analyze business rules
   */
  private analyzeBusinessRules(sourceCode: string): BusinessRule[] {
    const rules: BusinessRule[] = [];

    // Look for conditional logic that represents business rules
    const conditionalMatches = sourceCode.matchAll(
      /if\s*\(([^)]+)\)\s*\{([^}]+)\}/g,
    );

    for (const match of conditionalMatches) {
      const condition = match[1] || '';
      const action = match[2] || '';

      if (condition.length > 10 && action.length > 10) {
        rules.push({
          name: 'Business rule',
          description: `Conditional logic: ${condition.substring(0, 50)}...`,
          conditions: [condition],
          actions: [action],
          priority: 'medium',
        });
      }
    }

    return rules;
  }

  /**
   * Calculate complexity score
   */
  private calculateComplexityScore(
    analysis: Partial<BusinessLogicAnalysis>,
  ): number {
    let score = 0;

    score += (analysis.functions?.length || 0) * 5;
    score += (analysis.stateManagement?.length || 0) * 3;
    score += (analysis.sideEffects?.length || 0) * 4;
    score += (analysis.eventHandlers?.length || 0) * 2;
    score += (analysis.dataTransformations?.length || 0) * 2;
    score += (analysis.validations?.length || 0) * 3;
    score += (analysis.businessRules?.length || 0) * 3;

    return score;
  }

  /**
   * Identify preservation requirements
   */
  private identifyPreservationRequirements(
    analysis: Partial<BusinessLogicAnalysis>,
  ): PreservationRequirement[] {
    const requirements: PreservationRequirement[] = [];

    // Critical functions
    analysis.functions?.forEach(func => {
      requirements.push({
        type: 'function',
        name: func.name,
        description: func.purpose,
        critical:
          func.complexity === 'complex' || func.complexity === 'critical',
        notes: `Preserve ${func.name} business logic`,
      });
    });

    // State management
    analysis.stateManagement?.forEach(state => {
      requirements.push({
        type: 'state',
        name: state.name,
        description: `State management using ${state.type}`,
        critical: true,
        notes: 'Preserve state initialization and updates',
      });
    });

    // Side effects
    analysis.sideEffects?.forEach((effect, index) => {
      requirements.push({
        type: 'effect',
        name: `Effect ${index + 1}`,
        description: effect.description,
        critical: effect.hasCleanup,
        notes: 'Preserve effect logic and cleanup',
      });
    });

    return requirements;
  }

  /**
   * Extract function parameters
   */
  private extractParameters(
    _sourceCode: string,
    _startIndex: number,
  ): ParameterDefinition[] {
    // Simplified parameter extraction - reserved for future enhancement
    return [];
  }

  /**
   * Assess function complexity
   */
  private assessFunctionComplexity(
    sourceCode: string,
    functionName: string,
  ): ComplexityLevel {
    const functionStart = sourceCode.indexOf(functionName);
    if (functionStart === -1) {
return 'simple';
}

    const functionCode = sourceCode.substring(
      functionStart,
      functionStart + 500,
    );
    const lines = functionCode.split('\n').length;

    if (lines > 50) {
return 'critical';
}
    if (lines > 20) {
return 'complex';
}
    if (lines > 10) {
return 'moderate';
}
    return 'simple';
  }

  /**
   * Extract function dependencies
   */
  private extractDependencies(
    _sourceCode: string,
    _functionName: string,
  ): string[] {
    // Reserved for future dependency analysis enhancement
    return [];
  }

  /**
   * Extract business logic from code
   */
  private extractBusinessLogic(code: string): string[] {
    return code
      .split(';')
      .map(line => line.trim())
      .filter(Boolean);
  }

  /**
   * Extract state updates from code
   */
  private extractStateUpdates(code: string): string[] {
    const updates: string[] = [];
    const setStateMatches = code.matchAll(/set(\w+)\s*\(/g);

    for (const match of setStateMatches) {
      updates.push(match[1] || '');
    }

    return updates;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create business logic analyzer
 */
export function createBusinessLogicAnalyzer(): BusinessLogicAnalyzer {
  return new BusinessLogicAnalyzer();
}

/**
 * Analyze component business logic
 *
 * @param component - Component to analyze
 * @param sourceCode - Component source code
 * @returns Business logic analysis
 */
export function analyzeBusinessLogic(
  component: ComponentDefinition,
  sourceCode: string,
): BusinessLogicAnalysis {
  const analyzer = createBusinessLogicAnalyzer();
  return analyzer.analyzeComponent(component, sourceCode);
}

/**
 * Check if business logic is preserved
 *
 * @param original - Original business logic analysis
 * @param migrated - Migrated business logic analysis
 * @returns Whether business logic is preserved
 */
export function isBusinessLogicPreserved(
  original: BusinessLogicAnalysis,
  migrated: BusinessLogicAnalysis,
): boolean {
  // Check function count
  if (original.functions.length !== migrated.functions.length) {
    return false;
  }

  // Check state management
  if (original.stateManagement.length !== migrated.stateManagement.length) {
    return false;
  }

  // Check side effects
  if (original.sideEffects.length !== migrated.sideEffects.length) {
    return false;
  }

  return true;
}
