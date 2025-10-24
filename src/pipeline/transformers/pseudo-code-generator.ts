/**
 * Pseudo-Code Documentation Generator
 *
 * Automatically generates comprehensive pseudo-code documentation for business
 * logic blocks in React components. Documents what/why/how/calls/dependencies
 * for all useEffect, useCallback, and function declarations.
 *
 * @version 1.0.0
 * @author DAISY Component Extraction Pipeline
 */

import { parse } from '@typescript-eslint/typescript-estree';
import type { TSESTree } from '@typescript-eslint/typescript-estree';
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import { type Logger, createSimpleLogger } from '../../utils/logging.js';

export interface PseudoCodeGeneratorOptions {
  /** Include WHY THIS EXISTS section */
  includeWhySection: boolean;

  /** Include WHAT IT DOES section */
  includeWhatSection: boolean;

  /** Include WHAT IT CALLS section */
  includeCallsSection: boolean;

  /** Include DATA FLOW section */
  includeDataFlowSection: boolean;

  /** Include DEPENDENCIES section */
  includeDependenciesSection: boolean;

  /** Include SPECIAL BEHAVIOR section */
  includeSpecialBehaviorSection: boolean;

  /** Add MIGRATION NOTE for v2 components */
  addMigrationNotes: boolean;
}

export interface PseudoCodeResult {
  /** Success status */
  success: boolean;

  /** Original code */
  originalCode: string;

  /** Code with documentation added */
  documentedCode: string;

  /** Business logic blocks found */
  blocksDocumented: BusinessLogicBlock[];

  /** Warnings */
  warnings: string[];
}

export interface BusinessLogicBlock {
  /** Block type */
  type: 'useEffect' | 'useCallback' | 'useMemo' | 'function' | 'handler';

  /** Block name/description */
  name: string;

  /** Generated documentation */
  documentation: string;

  /** Line number in original code */
  lineNumber: number;

  /** Confidence level (0-1) */
  confidence: number;
}

/**
 * Pseudo-Code Documentation Generator
 *
 * Analyzes React component code and generates comprehensive pseudo-code
 * documentation for all business logic blocks.
 */
export class PseudoCodeGenerator {
  private readonly logger: Logger;
  private readonly options: PseudoCodeGeneratorOptions;

  constructor(
    options: Partial<PseudoCodeGeneratorOptions> = {},
    logger?: Logger
  ) {
    this.logger = logger || createSimpleLogger('PseudoCodeGenerator');
    this.options = {
      includeWhySection: true,
      includeWhatSection: true,
      includeCallsSection: true,
      includeDataFlowSection: true,
      includeDependenciesSection: true,
      includeSpecialBehaviorSection: true,
      addMigrationNotes: false,
      ...options,
    };
  }

  /**
   * Generate pseudo-code documentation for component
   */
  public generate(
    componentCode: string,
    componentName: string,
    isV2Component: boolean = false
  ): Promise<PseudoCodeResult> {
    return Promise.resolve().then(() => {
      this.logger.info(
        `Generating pseudo-code documentation for: ${componentName}`
      );

      const result: PseudoCodeResult = {
        success: false,
        originalCode: componentCode,
        documentedCode: componentCode,
        blocksDocumented: [],
        warnings: [],
      };

      try {
        // Parse AST
        const ast = parse(componentCode, {
          loc: true,
          range: true,
          tokens: true,
          comment: true,
          jsx: true,
        });

        // Find business logic blocks
        const blocks = this.findBusinessLogicBlocks(ast, componentCode);
        this.logger.debug(`Found ${blocks.length} business logic blocks`);

        // Generate documentation for each block
        let documentedCode = componentCode;
        const blocksDocumented: BusinessLogicBlock[] = [];

        // Process blocks in reverse order to maintain line numbers
        for (const block of blocks.reverse()) {
          const documentation = this.generateDocumentation(
            block,
            isV2Component
          );
          documentedCode = this.insertDocumentation(
            documentedCode,
            block.startLine,
            documentation
          );

          blocksDocumented.push({
            type: block.type,
            name: block.name,
            documentation,
            lineNumber: block.startLine,
            confidence: block.confidence,
          });
        }

        result.documentedCode = documentedCode;
        result.blocksDocumented = blocksDocumented.reverse();
        result.success = true;

        this.logger.info(
          `Generated documentation for ${blocks.length} business logic blocks`
        );
      } catch (error) {
        const errorObj = error instanceof Error ? error : undefined;
        this.logger.error('Pseudo-code generation failed', errorObj);
        result.warnings.push(
          `Generation failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      return result;
    });
  }

  /**
   * Find all business logic blocks in AST
   */
  private findBusinessLogicBlocks(
    ast: TSESTree.Program,
    sourceCode: string
  ): AnalyzedBlock[] {
    const blocks: AnalyzedBlock[] = [];

    const visit = (node: TSESTree.Node, parent?: TSESTree.Node): void => {
      // useEffect blocks
      if (
        node.type === AST_NODE_TYPES.CallExpression &&
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === 'useEffect'
      ) {
        blocks.push(this.analyzeUseEffect(node, sourceCode));
      }

      // useCallback blocks
      if (
        node.type === AST_NODE_TYPES.CallExpression &&
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === 'useCallback'
      ) {
        blocks.push(this.analyzeUseCallback(node, sourceCode, parent));
      }

      // useMemo blocks
      if (
        node.type === AST_NODE_TYPES.CallExpression &&
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === 'useMemo'
      ) {
        blocks.push(this.analyzeUseMemo(node, sourceCode, parent));
      }

      // Function declarations
      if (node.type === AST_NODE_TYPES.FunctionDeclaration && node.id) {
        blocks.push(this.analyzeFunctionDeclaration(node, sourceCode));
      }

      // Arrow function expressions (exported helpers)
      if (
        node.type === AST_NODE_TYPES.VariableDeclaration &&
        node.declarations.length > 0
      ) {
        const firstDecl = node.declarations[0];
        if (firstDecl.init?.type === AST_NODE_TYPES.ArrowFunctionExpression) {
          blocks.push(this.analyzeExportedFunction(node, sourceCode));
        }
      }

      // Recurse
      for (const key in node) {
        const child = (node as any)[key];
        if (child && typeof child === 'object') {
          if (Array.isArray(child)) {
            child.forEach(c => c && typeof c === 'object' && visit(c, node));
          } else if (child.type) {
            visit(child, node);
          }
        }
      }
    };

    visit(ast);
    return blocks;
  }

  /**
   * Analyze useEffect block
   */
  private analyzeUseEffect(
    node: TSESTree.CallExpression,
    _sourceCode: string
  ): AnalyzedBlock {
    const callback = node.arguments[0];
    const deps = node.arguments[1];

    if (!callback) {
      return {
        type: 'useEffect',
        name: 'Unknown Effect',
        startLine: node.loc.start.line,
        node,
        calls: [],
        dependencies: [],
        confidence: 0.3,
      };
    }

    return {
      type: 'useEffect',
      name: this.inferUseEffectPurpose(callback, ''),
      startLine: node.loc.start.line,
      node,
      calls: this.findFunctionCalls(callback),
      dependencies: this.extractDependencies(deps),
      confidence: 0.8,
    };
  }

  /**
   * Analyze useCallback block
   */
  private analyzeUseCallback(
    node: TSESTree.CallExpression,
    _sourceCode: string,
    parent?: TSESTree.Node
  ): AnalyzedBlock {
    const callback = node.arguments[0];
    const deps = node.arguments[1];

    // Try to get function name from variable declaration
    let name = 'Anonymous Callback';
    if (
      parent?.type === AST_NODE_TYPES.VariableDeclarator &&
      parent.id.type === AST_NODE_TYPES.Identifier
    ) {
      name = parent.id.name;
    }

    if (!callback) {
      return {
        type: 'useCallback',
        name,
        startLine: node.loc.start.line,
        node,
        calls: [],
        dependencies: [],
        confidence: 0.5,
      };
    }

    return {
      type: 'useCallback',
      name,
      startLine: node.loc.start.line,
      node,
      calls: this.findFunctionCalls(callback),
      dependencies: this.extractDependencies(deps),
      confidence: 0.9,
    };
  }

  /**
   * Analyze useMemo block
   */
  private analyzeUseMemo(
    node: TSESTree.CallExpression,
    _sourceCode: string,
    parent?: TSESTree.Node
  ): AnalyzedBlock {
    const callback = node.arguments[0];
    const deps = node.arguments[1];

    let name = 'Memoized Value';
    if (
      parent?.type === AST_NODE_TYPES.VariableDeclarator &&
      parent.id.type === AST_NODE_TYPES.Identifier
    ) {
      name = parent.id.name;
    }

    if (!callback) {
      return {
        type: 'useMemo',
        name,
        startLine: node.loc.start.line,
        node,
        calls: [],
        dependencies: [],
        confidence: 0.5,
      };
    }

    return {
      type: 'useMemo',
      name,
      startLine: node.loc.start.line,
      node,
      calls: this.findFunctionCalls(callback),
      dependencies: this.extractDependencies(deps),
      confidence: 0.85,
    };
  }

  /**
   * Analyze function declaration
   */
  private analyzeFunctionDeclaration(
    node: TSESTree.FunctionDeclaration,
    _sourceCode: string
  ): AnalyzedBlock {
    return {
      type: 'function',
      name: node.id?.name || 'Anonymous',
      startLine: node.loc.start.line,
      node,
      calls: this.findFunctionCalls(node.body),
      dependencies: [],
      confidence: 0.9,
    };
  }

  /**
   * Analyze exported function
   */
  private analyzeExportedFunction(
    node: TSESTree.VariableDeclaration,
    _sourceCode: string
  ): AnalyzedBlock {
    const declarator = node.declarations[0];
    const name =
      declarator.id.type === AST_NODE_TYPES.Identifier
        ? declarator.id.name
        : 'Anonymous';

    return {
      type: 'function',
      name,
      startLine: node.loc.start.line,
      node,
      calls: declarator.init ? this.findFunctionCalls(declarator.init) : [],
      dependencies: [],
      confidence: 0.9,
    };
  }

  /**
   * Infer useEffect purpose from callback code
   */
  private inferUseEffectPurpose(
    callback: TSESTree.Node,
    sourceCode: string
  ): string {
    // Look for common patterns
    const code = sourceCode.substring(callback.range[0], callback.range[1]);

    if (code.includes('track') || code.includes('analytics')) {
      return 'Analytics Tracking';
    }
    if (code.includes('validat')) {
      return 'Validation';
    }
    if (
      code.includes('fetch') ||
      code.includes('api') ||
      code.includes('load')
    ) {
      return 'Data Fetching';
    }
    if (code.includes('subscribe') || code.includes('listener')) {
      return 'Event Subscription';
    }
    if (code.includes('cleanup') || code.includes('return')) {
      return 'Cleanup Effect';
    }

    return 'Side Effect';
  }

  /**
   * Find all function calls in node
   */
  private findFunctionCalls(node: TSESTree.Node): string[] {
    const calls: string[] = [];

    const visit = (n: TSESTree.Node): void => {
      if (n.type === AST_NODE_TYPES.CallExpression) {
        if (n.callee.type === AST_NODE_TYPES.Identifier) {
          calls.push(n.callee.name);
        } else if (n.callee.type === AST_NODE_TYPES.MemberExpression) {
          const obj =
            n.callee.object.type === AST_NODE_TYPES.Identifier
              ? n.callee.object.name
              : '';
          const prop =
            n.callee.property.type === AST_NODE_TYPES.Identifier
              ? n.callee.property.name
              : '';
          calls.push(`${obj}.${prop}`);
        }
      }

      for (const key in n) {
        const child = (n as any)[key];
        if (child && typeof child === 'object') {
          if (Array.isArray(child)) {
            child.forEach(c => c && typeof c === 'object' && visit(c));
          } else if (child.type) {
            visit(child);
          }
        }
      }
    };

    visit(node);
    return calls;
  }

  /**
   * Extract dependencies from useEffect/useCallback deps array
   */
  private extractDependencies(deps: TSESTree.Node | undefined): string[] {
    if (!deps || deps.type !== AST_NODE_TYPES.ArrayExpression) {
      return [];
    }

    return deps.elements
      .filter(
        (el): el is TSESTree.Identifier =>
          el?.type === AST_NODE_TYPES.Identifier
      )
      .map(el => el.name);
  }

  /**
   * Generate documentation for a business logic block
   */
  private generateDocumentation(block: AnalyzedBlock, isV2: boolean): string {
    const sections: string[] = [];

    // Header
    sections.push('  /**');
    sections.push(`   * BUSINESS LOGIC: ${block.name}`);
    sections.push('   *');

    // WHY THIS EXISTS
    if (this.options.includeWhySection) {
      sections.push('   * WHY THIS EXISTS:');
      sections.push(`   * - ${this.generateWhySection(block)}`);
      sections.push('   *');
    }

    // WHAT IT DOES
    if (this.options.includeWhatSection) {
      sections.push('   * WHAT IT DOES:');
      const steps = this.generateWhatSection(block);
      steps.forEach((step, i) => {
        sections.push(`   * ${i + 1}. ${step}`);
      });
      sections.push('   *');
    }

    // WHAT IT CALLS
    if (this.options.includeCallsSection && block.calls.length > 0) {
      sections.push('   * WHAT IT CALLS:');
      block.calls.forEach(call => {
        sections.push(`   * - ${call}() - Function call`);
      });
      sections.push('   *');
    }

    // WHY IT CALLS THEM
    if (this.options.includeCallsSection && block.calls.length > 0) {
      sections.push('   * WHY IT CALLS THEM:');
      block.calls.forEach(call => {
        sections.push(`   * - ${call}: ${this.inferCallPurpose(call, block)}`);
      });
      sections.push('   *');
    }

    // DATA FLOW
    if (this.options.includeDataFlowSection) {
      sections.push('   * DATA FLOW:');
      sections.push(`   * Input: ${this.inferInputs(block)}`);
      sections.push(`   * Processing: ${this.inferProcessing(block)}`);
      sections.push(`   * Output: ${this.inferOutput(block)}`);
      sections.push('   *');
    }

    // DEPENDENCIES
    if (
      this.options.includeDependenciesSection &&
      block.dependencies.length > 0
    ) {
      sections.push('   * DEPENDENCIES:');
      block.dependencies.forEach(dep => {
        sections.push(`   * - ${dep}: Triggers when ${dep} changes`);
      });
      sections.push('   *');
    }

    // SPECIAL BEHAVIOR
    if (this.options.includeSpecialBehaviorSection) {
      const specialBehavior = this.inferSpecialBehavior(block);
      if (specialBehavior) {
        sections.push('   * SPECIAL BEHAVIOR:');
        sections.push(`   * - ${specialBehavior}`);
        sections.push('   *');
      }
    }

    // MIGRATION NOTE (v2 only)
    if (isV2 && this.options.addMigrationNotes) {
      sections.push('   * MIGRATION NOTE:');
      sections.push(
        '   * - This logic is PRESERVED from v1 - no changes during migration'
      );
      sections.push('   *');
    }

    sections.push('   */');

    return sections.join('\n');
  }

  /**
   * Generate WHY THIS EXISTS section
   */
  private generateWhySection(block: AnalyzedBlock): string {
    const purposes: Record<string, string> = {
      'Analytics Tracking':
        'Product analytics requirement to track user interactions',
      Validation: 'Ensures data integrity and catches errors early',
      'Data Fetching': 'Loads required data from external sources',
      'Event Subscription': 'Listens for and responds to system events',
      'Cleanup Effect': 'Prevents memory leaks and cleans up resources',
    };

    return purposes[block.name] || 'Implements business logic requirement';
  }

  /**
   * Generate WHAT IT DOES section
   */
  private generateWhatSection(block: AnalyzedBlock): string[] {
    const steps: string[] = [];

    if (block.type === 'useEffect') {
      if (block.dependencies.length > 0) {
        steps.push(`Monitors ${block.dependencies.join(', ')} for changes`);
      }
      if (block.calls.length > 0) {
        steps.push(`Executes ${block.calls.join(', ')} functions`);
      }
      steps.push('Runs side effect logic');
    } else if (block.type === 'useCallback') {
      steps.push('Handles user interaction or event');
      if (block.calls.length > 0) {
        steps.push(`Calls ${block.calls.join(', ')} functions`);
      }
      steps.push('Updates state or triggers effects');
    } else if (block.type === 'function') {
      steps.push(`Implements ${block.name} logic`);
      if (block.calls.length > 0) {
        steps.push(`Calls helper functions: ${block.calls.join(', ')}`);
      }
      steps.push('Returns computed result');
    }

    return steps.length > 0 ? steps : ['Implements business logic'];
  }

  /**
   * Infer why a function is called
   */
  private inferCallPurpose(
    functionName: string,
    _block: AnalyzedBlock
  ): string {
    const purposes: Record<string, string> = {
      track: 'Analytics tracking',
      validate: 'Data validation',
      fetch: 'Data fetching',
      set: 'State update',
      preventDefault: 'Prevent default behavior',
      'console.log': 'Debugging output',
      'console.warn': 'Warning notification',
      'console.error': 'Error logging',
    };

    for (const [key, purpose] of Object.entries(purposes)) {
      if (functionName.toLowerCase().includes(key)) {
        return purpose;
      }
    }

    return 'Required functionality';
  }

  /**
   * Infer inputs to block
   */
  private inferInputs(block: AnalyzedBlock): string {
    if (block.dependencies.length > 0) {
      return block.dependencies.join(', ') + ' state/props';
    }
    return 'Component state and props';
  }

  /**
   * Infer processing done in block
   */
  private inferProcessing(block: AnalyzedBlock): string {
    if (block.calls.length > 0) {
      return `Calls ${block.calls.slice(0, 3).join(', ')} to process data`;
    }
    return 'Processes data and applies business logic';
  }

  /**
   * Infer output from block
   */
  private inferOutput(block: AnalyzedBlock): string {
    if (block.type === 'useEffect') {
      return 'Side effects executed, cleanup registered';
    }
    if (block.type === 'useCallback') {
      return 'Event handled, state updated';
    }
    return 'Computed value or side effect';
  }

  /**
   * Infer special behavior
   */
  private inferSpecialBehavior(block: AnalyzedBlock): string | null {
    if (block.type === 'useCallback' || block.type === 'useMemo') {
      return 'Memoized for performance optimization';
    }
    if (block.dependencies.length === 0 && block.type === 'useEffect') {
      return 'Runs only on component mount';
    }
    return null;
  }

  /**
   * Insert documentation before a line
   */
  private insertDocumentation(
    code: string,
    lineNumber: number,
    documentation: string
  ): string {
    const lines = code.split('\n');
    const targetIndex = lineNumber - 1;

    // Find proper indentation
    const targetLine = lines[targetIndex];
    const indent = targetLine?.match(/^(\s*)/)?.[1] || '';

    // Indent documentation
    const indentedDoc = documentation
      .split('\n')
      .map(line => indent + line)
      .join('\n');

    // Insert documentation
    lines.splice(targetIndex, 0, indentedDoc);

    return lines.join('\n');
  }
}

// Internal types
interface AnalyzedBlock {
  type: 'useEffect' | 'useCallback' | 'useMemo' | 'function' | 'handler';
  name: string;
  startLine: number;
  node: TSESTree.Node;
  calls: string[];
  dependencies: string[];
  confidence: number;
}

/**
 * Factory function
 */
export function createPseudoCodeGenerator(
  options?: Partial<PseudoCodeGeneratorOptions>,
  logger?: Logger
): PseudoCodeGenerator {
  return new PseudoCodeGenerator(options, logger);
}
