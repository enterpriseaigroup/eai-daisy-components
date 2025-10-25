/**
 * Pseudo-Code Template Generator
 *
 * Generates constitutional pseudo-code blocks per FR-034 with 6 required fields.
 * Ensures minimum 15 specific statements per SC-003.
 */

import type { PseudoCodeBlock } from '../../types/v2-component.js';
import type { ComponentMetadata, BusinessLogicPattern } from '../../types/ast-analysis.js';

/**
 * Template structure for generating pseudo-code blocks
 */
export interface PseudoCodeTemplate {
  functionName: string;
  purpose: string;
  actions: string[];
  dataFlow: string;
  dependencies: string[];
  specialBehavior?: string;
  context?: ComponentMetadata;
}

/**
 * Generates a complete pseudo-code block from template
 */
export function generatePseudoCodeBlock(template: PseudoCodeTemplate): PseudoCodeBlock {
  const { functionName, purpose, actions, dataFlow, dependencies, specialBehavior, context } =
    template;

  // Validate minimum statement count (SC-003)
  const totalStatements = actions.length;
  if (totalStatements < 3) {
    throw new Error(
      `Function ${functionName} has insufficient actions (${totalStatements} < 3 minimum)`
    );
  }

  // Build WHY EXISTS field
  const whyExists = formatWhyExists(purpose, context);

  // Build WHAT IT DOES field
  const whatItDoes = formatWhatItDoes(actions);

  // Build WHAT IT CALLS field (internal functions called)
  const whatItCalls = dependencies.filter(dep => !dep.includes('/') && !dep.includes('@'));

  // Build DEPENDENCIES field (external packages)
  const formattedDependencies = formatDependencies(dependencies, context);

  return {
    functionName,
    whyExists,
    whatItDoes,
    whatItCalls,
    dataFlow,
    dependencies: formattedDependencies,
    ...(specialBehavior ? { specialBehavior } : {}),
  };
}

/**
 * T028: Formats WHY EXISTS field from component purpose and context
 */
export function formatWhyExists(purpose: string, context?: ComponentMetadata): string {
  if (!context) {
    return purpose;
  }

  const tier = extractTier(context.filePath);
  const complexity = context.complexity || 'unknown';

  return `${purpose} (tier ${tier}, complexity ${complexity}/5) from DAISY v1 baseline`;
}

/**
 * T029: Formats WHAT IT DOES field from business logic patterns
 */
export function formatWhatItDoes(actions: string[]): string[] {
  // Filter out generic phrases
  const genericPhrases = ['TODO', 'implement', 'add logic', 'placeholder', 'TBD'];

  return actions.filter(action => {
    const lowerAction = action.toLowerCase();
    return !genericPhrases.some(phrase => lowerAction.includes(phrase.toLowerCase()));
  });
}

/**
 * T030: Formats DATA FLOW field with transformation pipeline arrows
 */
export function formatDataFlow(patterns: BusinessLogicPattern[]): string {
  const steps: string[] = [];

  // Group patterns by execution order
  const validationPatterns = patterns.filter(p => p.type === 'validation');
  const apiPatterns = patterns.filter(p => p.type === 'api-call');
  const transformPatterns = patterns.filter(p => p.type === 'transformation');
  const conditionalPatterns = patterns.filter(p => p.type === 'conditional');

  // Build flow
  steps.push('User input');

  if (validationPatterns.length > 0) {
    steps.push('Validate input');
  }

  if (apiPatterns.length > 0) {
    apiPatterns.forEach(pattern => {
      if (pattern.description.includes('POST')) {
        steps.push('POST API request');
      } else if (pattern.description.includes('GET')) {
        steps.push('GET API request');
      } else {
        steps.push('API call');
      }
    });
    steps.push('Parse response');
  }

  if (transformPatterns.length > 0) {
    steps.push('Transform data');
  }

  if (conditionalPatterns.length > 0) {
    steps.push('Apply conditional logic');
  }

  steps.push('Update state');
  steps.push('Render UI');

  return steps.join(' → ');
}

/**
 * T031: Formats DEPENDENCIES field from metadata and patterns
 */
export function formatDependencies(
  deps: string[],
  context?: ComponentMetadata
): string[] {
  const dependencies = new Set<string>(deps);

  // Add context dependencies
  if (context?.dependencies) {
    context.dependencies.forEach((dep: string) => dependencies.add(dep));
  }

  // Filter out React and built-in dependencies
  const filtered = Array.from(dependencies).filter(
    dep => !dep.startsWith('react') && !dep.startsWith('node:')
  );

  return filtered.length > 0 ? filtered : ['None'];
}

/**
 * T032: Formats SPECIAL BEHAVIOR field from patterns and comments
 */
export function formatSpecialBehavior(
  patterns: BusinessLogicPattern[],
  context?: ComponentMetadata
): string | undefined {
  const specialBehaviors: string[] = [];

  // Extract edge cases from low-confidence patterns
  patterns
    .filter(p => p.confidence < 0.8)
    .forEach(pattern => {
      if (pattern.description) {
        specialBehaviors.push(pattern.description);
      }
    });

  // Extract from inline comments if available
  if (context) {
    const edgeCaseComments = extractEdgeCaseComments(patterns);
    specialBehaviors.push(...edgeCaseComments);
  }

  return specialBehaviors.length > 0 ? specialBehaviors.join('. ') : undefined;
}

/**
 * Helper: Extracts tier from file path
 */
function extractTier(filePath: string): number {
  const match = filePath.match(/tier(\d+)/i);
  return match && match[1] ? parseInt(match[1], 10) : 1;
}

/**
 * Helper: Extracts edge case comments from patterns
 */
function extractEdgeCaseComments(patterns: BusinessLogicPattern[]): string[] {
  const edgeCases: string[] = [];

  patterns.forEach(pattern => {
    // Look for patterns with descriptions that mention edge cases
    const edgeCaseKeywords = ['edge case', 'special case', 'note:', 'important:', 'warning:'];

    if (pattern.description) {
      const description = pattern.description.toLowerCase();
      if (edgeCaseKeywords.some(keyword => description.includes(keyword))) {
        edgeCases.push(pattern.description);
      }
    }
  });

  return edgeCases;
}

/**
 * Generates pseudo-code blocks from business logic patterns
 */
export function generatePseudoCodeFromPatterns(
  patterns: BusinessLogicPattern[],
  context: ComponentMetadata
): PseudoCodeBlock[] {
  const blocks: PseudoCodeBlock[] = [];

  // Group patterns by function type
  const patternGroups = groupPatternsByFunction(patterns);

  patternGroups.forEach((group, functionName) => {
    const specialBehaviorValue = formatSpecialBehavior(group, context);

    const template: PseudoCodeTemplate = {
      functionName,
      purpose: derivePurpose(functionName, group),
      actions: deriveActions(group),
      dataFlow: formatDataFlow(group),
      dependencies: deriveDependencies(group),
      ...(specialBehaviorValue ? { specialBehavior: specialBehaviorValue } : {}),
      context,
    };

    blocks.push(generatePseudoCodeBlock(template));
  });

  return blocks;
}

/**
 * Groups patterns by function name
 */
function groupPatternsByFunction(
  patterns: BusinessLogicPattern[]
): Map<string, BusinessLogicPattern[]> {
  const groups = new Map<string, BusinessLogicPattern[]>();

  patterns.forEach(pattern => {
    const functionName = deriveFunctionName(pattern);
    const existing = groups.get(functionName) || [];
    existing.push(pattern);
    groups.set(functionName, existing);
  });

  return groups;
}

/**
 * Derives function name from pattern type
 */
function deriveFunctionName(pattern: BusinessLogicPattern): string {
  switch (pattern.type) {
    case 'validation':
      return 'validateInput';
    case 'api-call':
      return 'fetchData';
    case 'transformation':
      return 'transformData';
    case 'conditional':
      return 'renderConditional';
    default:
      return 'processData';
  }
}

/**
 * Derives purpose from function name and patterns
 */
function derivePurpose(functionName: string, patterns: BusinessLogicPattern[]): string {
  const firstPattern = patterns[0];
  if (!firstPattern) {
    return `Implements ${functionName} logic`;
  }

  switch (firstPattern.type) {
    case 'validation':
      return 'Validates user input before processing';
    case 'api-call':
      return 'Fetches data from external API';
    case 'transformation':
      return 'Transforms data into display format';
    case 'conditional':
      return 'Renders UI based on state conditions';
    default:
      return `Implements ${functionName} logic`;
  }
}

/**
 * Derives actions from patterns
 */
function deriveActions(patterns: BusinessLogicPattern[]): string[] {
  const actions: string[] = [];

  patterns.forEach(pattern => {
    switch (pattern.type) {
      case 'validation':
        actions.push('IF input invalid THEN return error');
        actions.push('IF input valid THEN proceed');
        break;
      case 'api-call':
        actions.push(`CALL ${pattern.description || 'API'}`);
        actions.push('AWAIT response');
        actions.push('IF error THEN handle error');
        break;
      case 'transformation':
        actions.push(`TRANSFORM ${pattern.description || 'data'}`);
        actions.push('MAP to display format');
        break;
      case 'conditional':
        actions.push(`IF ${pattern.description || 'condition'} THEN render A`);
        actions.push('ELSE render B');
        break;
    }
  });

  return actions;
}

/**
 * Derives dependencies from patterns
 */
function deriveDependencies(patterns: BusinessLogicPattern[]): string[] {
  const dependencies = new Set<string>();

  patterns.forEach(pattern => {
    if (pattern.type === 'api-call' && pattern.description) {
      if (pattern.description.includes('fetch')) {
        dependencies.add('Fetch API');
      }
      if (pattern.description.includes('axios')) {
        dependencies.add('axios library');
      }
    }
  });

  return Array.from(dependencies);
}
