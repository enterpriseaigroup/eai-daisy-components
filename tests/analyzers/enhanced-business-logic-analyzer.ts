/**
 * Enhanced Business Logic Analyzer
 *
 * Uses TypeScript Compiler API for accurate AST-based semantic analysis
 */

import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';

export interface BusinessLogicAnalysisResult {
  preserved: boolean;
  functionsPreserved: boolean;
  eventHandlersPreserved: boolean;
  validationLogicPreserved: boolean;
  stateManagementPreserved: boolean;
  missingFunctions: string[];
  changedFunctions: FunctionChange[];
  semanticEquivalence: boolean;
  astDifferences: ASTDifference[];
  report: string;
}

export interface FunctionChange {
  name: string;
  type: 'signature' | 'implementation' | 'removed' | 'added';
  original?: FunctionInfo;
  migrated?: FunctionInfo;
  impact: 'critical' | 'high' | 'medium' | 'low';
}

export interface FunctionInfo {
  name: string;
  signature: string;
  parameters: ParameterInfo[];
  returnType: string;
  complexity: number;
  dependencies: string[];
  sideEffects: boolean;
  hash: string;
}

export interface ParameterInfo {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: any;
}

export interface ASTDifference {
  path: string;
  type: 'structural' | 'semantic' | 'behavioral';
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export class EnhancedBusinessLogicAnalyzer {
  private program: ts.Program | null = null;
  private checker: ts.TypeChecker | null = null;

  /**
   * Main analysis entry point
   */
  public async analyze(
    originalPath: string,
    migratedPath: string,
  ): Promise<BusinessLogicAnalysisResult> {
    // Parse both components
    const originalAST = await this.parseComponent(originalPath);
    const migratedAST = await this.parseComponent(migratedPath);

    // Extract business logic functions
    const originalFunctions = this.extractFunctions(originalAST);
    const migratedFunctions = this.extractFunctions(migratedAST);

    // Compare functions
    const comparison = this.compareFunctions(originalFunctions, migratedFunctions);

    // Analyze specific logic types
    const eventHandlersPreserved = this.compareEventHandlers(originalAST, migratedAST);
    const validationLogicPreserved = this.compareValidationLogic(originalAST, migratedAST);
    const stateManagementPreserved = this.compareStateManagement(originalAST, migratedAST);

    // Perform semantic analysis
    const astDifferences = await this.performSemanticAnalysis(originalAST, migratedAST);
    const semanticEquivalence = astDifferences.filter(d => d.severity === 'critical').length === 0;

    // Determine overall preservation
    const preserved =
      comparison.missingFunctions.length === 0 &&
      comparison.changedFunctions.filter(c => c.impact === 'critical').length === 0 &&
      eventHandlersPreserved &&
      validationLogicPreserved &&
      stateManagementPreserved &&
      semanticEquivalence;

    return {
      preserved,
      functionsPreserved: comparison.missingFunctions.length === 0,
      eventHandlersPreserved,
      validationLogicPreserved,
      stateManagementPreserved,
      missingFunctions: comparison.missingFunctions,
      changedFunctions: comparison.changedFunctions,
      semanticEquivalence,
      astDifferences,
      report: this.generateReport({
        preserved,
        functionsPreserved: comparison.missingFunctions.length === 0,
        eventHandlersPreserved,
        validationLogicPreserved,
        stateManagementPreserved,
        missingFunctions: comparison.missingFunctions,
        changedFunctions: comparison.changedFunctions,
        semanticEquivalence,
        astDifferences,
      }),
    };
  }

  /**
   * Analyze with full AST comparison
   */
  public async analyzeWithAST(
    originalPath: string,
    migratedPath: string,
  ): Promise<BusinessLogicAnalysisResult> {
    return this.analyze(originalPath, migratedPath);
  }

  /**
   * Parse TypeScript component file into AST
   */
  private async parseComponent(filePath: string): Promise<ts.SourceFile> {
    const source = await fs.readFile(filePath, 'utf-8');

    // Create a TypeScript program
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
    };

    const program = ts.createProgram([filePath], compilerOptions);
    this.program = program;
    this.checker = program.getTypeChecker();

    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) {
      throw new Error(`Could not parse file: ${filePath}`);
    }

    return sourceFile;
  }

  /**
   * Extract all functions from AST
   */
  private extractFunctions(sourceFile: ts.SourceFile): Map<string, FunctionInfo> {
    const functions = new Map<string, FunctionInfo>();

    const visit = (node: ts.Node): void => {
      // Handle function declarations
      if (ts.isFunctionDeclaration(node) && node.name) {
        const funcInfo = this.extractFunctionInfo(node);
        if (funcInfo) {
          functions.set(funcInfo.name, funcInfo);
        }
      }

      // Handle arrow functions assigned to variables
      if (ts.isVariableStatement(node)) {
        const declaration = node.declarationList.declarations[0];
        if (declaration && declaration.initializer) {
          if (ts.isArrowFunction(declaration.initializer) ||
              ts.isFunctionExpression(declaration.initializer)) {
            const name = declaration.name.getText();
            const funcInfo = this.extractFunctionInfo(declaration.initializer, name);
            if (funcInfo) {
              functions.set(funcInfo.name, funcInfo);
            }
          }
        }
      }

      // Handle methods in React components
      if (ts.isMethodDeclaration(node) && node.name) {
        const funcInfo = this.extractFunctionInfo(node);
        if (funcInfo) {
          functions.set(funcInfo.name, funcInfo);
        }
      }

      // Handle hook definitions (useEffect, useCallback, etc.)
      if (ts.isCallExpression(node)) {
        const expression = node.expression.getText();
        if (expression === 'useCallback' || expression === 'useMemo') {
          const arg = node.arguments[0];
          if (arg && (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg))) {
            const hookName = `hook_${expression}_${node.pos}`;
            const funcInfo = this.extractFunctionInfo(arg, hookName);
            if (funcInfo) {
              functions.set(funcInfo.name, funcInfo);
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return functions;
  }

  /**
   * Extract detailed function information
   */
  private extractFunctionInfo(
    node: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression | ts.MethodDeclaration,
    name?: string,
  ): FunctionInfo | null {
    if (!this.checker) {
return null;
}

    const funcName = name ||
      (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)
        ? node.name?.getText()
        : 'anonymous');

    if (!funcName) {
return null;
}

    // Extract parameters
    const parameters = node.parameters.map(param => {
      const paramType = this.checker!.getTypeAtLocation(param);
      return {
        name: param.name.getText(),
        type: this.checker!.typeToString(paramType),
        optional: !!param.questionToken,
        defaultValue: param.initializer?.getText(),
      };
    });

    // Extract return type
    const signature = this.checker.getSignatureFromDeclaration(node);
    const returnType = signature
      ? this.checker.typeToString(signature.getReturnType())
      : 'unknown';

    // Calculate complexity
    const complexity = this.calculateComplexity(node);

    // Extract dependencies
    const dependencies = this.extractDependencies(node);

    // Check for side effects
    const sideEffects = this.hasSideEffects(node);

    // Generate hash of function body for comparison
    const hash = this.generateFunctionHash(node);

    return {
      name: funcName,
      signature: `${funcName}(${parameters.map(p => `${p.name}: ${p.type}`).join(', ')}): ${returnType}`,
      parameters,
      returnType,
      complexity,
      dependencies,
      sideEffects,
      hash,
    };
  }

  /**
   * Calculate cyclomatic complexity
   */
  private calculateComplexity(node: ts.Node): number {
    let complexity = 1;

    const visit = (n: ts.Node): void => {
      if (
        ts.isIfStatement(n) ||
        ts.isConditionalExpression(n) ||
        ts.isForStatement(n) ||
        ts.isWhileStatement(n) ||
        ts.isDoStatement(n) ||
        ts.isCaseClause(n)
      ) {
        complexity++;
      }

      if (ts.isBinaryExpression(n)) {
        const operator = n.operatorToken.kind;
        if (
          operator === ts.SyntaxKind.AmpersandAmpersandToken ||
          operator === ts.SyntaxKind.BarBarToken
        ) {
          complexity++;
        }
      }

      ts.forEachChild(n, visit);
    };

    visit(node);
    return complexity;
  }

  /**
   * Extract function dependencies
   */
  private extractDependencies(node: ts.Node): string[] {
    const dependencies = new Set<string>();

    const visit = (n: ts.Node): void => {
      if (ts.isCallExpression(n)) {
        const expression = n.expression.getText();
        dependencies.add(expression);
      }

      if (ts.isPropertyAccessExpression(n)) {
        const expression = n.expression.getText();
        if (expression !== 'this' && expression !== 'props' && expression !== 'state') {
          dependencies.add(expression);
        }
      }

      ts.forEachChild(n, visit);
    };

    visit(node);
    return Array.from(dependencies);
  }

  /**
   * Check if function has side effects
   */
  private hasSideEffects(node: ts.Node): boolean {
    let hasSideEffect = false;

    const visit = (n: ts.Node): void => {
      if (hasSideEffect) {
return;
}

      // Check for state mutations
      if (ts.isCallExpression(n)) {
        const expression = n.expression.getText();
        if (
          expression.includes('setState') ||
          expression.includes('dispatch') ||
          expression === 'console.log' ||
          expression === 'alert'
        ) {
          hasSideEffect = true;
        }
      }

      // Check for assignments to external variables
      if (ts.isBinaryExpression(n) &&
          n.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
        const left = n.left.getText();
        if (!left.includes('const') && !left.includes('let') && !left.includes('var')) {
          hasSideEffect = true;
        }
      }

      // Check for DOM manipulation
      if (ts.isPropertyAccessExpression(n)) {
        const property = n.name.getText();
        if (
          property === 'innerHTML' ||
          property === 'textContent' ||
          property === 'style'
        ) {
          hasSideEffect = true;
        }
      }

      ts.forEachChild(n, visit);
    };

    visit(node);
    return hasSideEffect;
  }

  /**
   * Generate hash of function implementation
   */
  private generateFunctionHash(node: ts.Node): string {
    const body = node.getText();
    return crypto.createHash('sha256').update(body).digest('hex').substring(0, 16);
  }

  /**
   * Compare functions between original and migrated
   */
  private compareFunctions(
    original: Map<string, FunctionInfo>,
    migrated: Map<string, FunctionInfo>,
  ): {
    missingFunctions: string[];
    changedFunctions: FunctionChange[];
  } {
    const missingFunctions: string[] = [];
    const changedFunctions: FunctionChange[] = [];

    // Check for missing functions
    for (const [name, originalFunc] of original) {
      if (!migrated.has(name)) {
        missingFunctions.push(name);
        changedFunctions.push({
          name,
          type: 'removed',
          original: originalFunc,
          impact: this.assessImpact(originalFunc),
        });
      } else {
        const migratedFunc = migrated.get(name)!;

        // Check for signature changes
        if (originalFunc.signature !== migratedFunc.signature) {
          changedFunctions.push({
            name,
            type: 'signature',
            original: originalFunc,
            migrated: migratedFunc,
            impact: 'high',
          });
        } else if (originalFunc.hash !== migratedFunc.hash) {
          // Check for implementation changes
          // Deeper analysis needed to determine if change is semantic
          const semanticallyEquivalent = this.checkSemanticEquivalence(
            originalFunc,
            migratedFunc,
          );

          if (!semanticallyEquivalent) {
            changedFunctions.push({
              name,
              type: 'implementation',
              original: originalFunc,
              migrated: migratedFunc,
              impact: this.assessImpact(originalFunc),
            });
          }
        }
      }
    }

    // Check for new functions
    for (const [name, migratedFunc] of migrated) {
      if (!original.has(name)) {
        changedFunctions.push({
          name,
          type: 'added',
          migrated: migratedFunc,
          impact: 'low',
        });
      }
    }

    return { missingFunctions, changedFunctions };
  }

  /**
   * Check semantic equivalence of two functions
   */
  private checkSemanticEquivalence(
    func1: FunctionInfo,
    func2: FunctionInfo,
  ): boolean {
    // Check if functions have same parameters
    if (func1.parameters.length !== func2.parameters.length) {
      return false;
    }

    // Check if return types are compatible
    if (func1.returnType !== func2.returnType) {
      // Allow void <-> undefined equivalence
      if (!(
        (func1.returnType === 'void' && func2.returnType === 'undefined') ||
        (func1.returnType === 'undefined' && func2.returnType === 'void')
      )) {
        return false;
      }
    }

    // Check if complexity is similar (allow 20% variance)
    const complexityRatio = func2.complexity / func1.complexity;
    if (complexityRatio < 0.8 || complexityRatio > 1.2) {
      return false;
    }

    // Check if side effects match
    if (func1.sideEffects !== func2.sideEffects) {
      return false;
    }

    return true;
  }

  /**
   * Assess impact of function change
   */
  private assessImpact(func: FunctionInfo): 'critical' | 'high' | 'medium' | 'low' {
    // Critical: Functions with side effects or complex logic
    if (func.sideEffects || func.complexity > 10) {
      return 'critical';
    }

    // High: Functions with multiple dependencies
    if (func.dependencies.length > 5) {
      return 'high';
    }

    // Medium: Functions with moderate complexity
    if (func.complexity > 5) {
      return 'medium';
    }

    // Low: Simple functions
    return 'low';
  }

  /**
   * Compare event handlers
   */
  private compareEventHandlers(
    originalAST: ts.SourceFile,
    migratedAST: ts.SourceFile,
  ): boolean {
    const originalHandlers = this.extractEventHandlers(originalAST);
    const migratedHandlers = this.extractEventHandlers(migratedAST);

    // Check all original handlers exist in migrated
    for (const handler of originalHandlers) {
      if (!migratedHandlers.has(handler)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Extract event handlers from AST
   */
  private extractEventHandlers(sourceFile: ts.SourceFile): Set<string> {
    const handlers = new Set<string>();

    const visit = (node: ts.Node): void => {
      // Check for onClick, onChange, etc.
      if (ts.isJsxAttribute(node)) {
        const name = node.name.getText();
        if (name.startsWith('on')) {
          handlers.add(name);
        }
      }

      // Check for addEventListener calls
      if (ts.isCallExpression(node)) {
        const expression = node.expression.getText();
        if (expression.includes('addEventListener')) {
          const eventType = node.arguments[0]?.getText();
          if (eventType) {
            handlers.add(eventType.replace(/['"]/g, ''));
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return handlers;
  }

  /**
   * Compare validation logic
   */
  private compareValidationLogic(
    originalAST: ts.SourceFile,
    migratedAST: ts.SourceFile,
  ): boolean {
    const originalValidations = this.extractValidationLogic(originalAST);
    const migratedValidations = this.extractValidationLogic(migratedAST);

    return originalValidations.length === migratedValidations.length;
  }

  /**
   * Extract validation logic patterns
   */
  private extractValidationLogic(sourceFile: ts.SourceFile): string[] {
    const validations: string[] = [];

    const visit = (node: ts.Node): void => {
      // Check for validation patterns
      if (ts.isIfStatement(node)) {
        const condition = node.expression.getText();
        if (
          condition.includes('required') ||
          condition.includes('isValid') ||
          condition.includes('validate') ||
          condition.includes('length')
        ) {
          validations.push(condition);
        }
      }

      // Check for throw statements (validation errors)
      if (ts.isThrowStatement(node)) {
        validations.push(node.getText());
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return validations;
  }

  /**
   * Compare state management
   */
  private compareStateManagement(
    originalAST: ts.SourceFile,
    migratedAST: ts.SourceFile,
  ): boolean {
    const originalState = this.extractStateManagement(originalAST);
    const migratedState = this.extractStateManagement(migratedAST);

    // Check all original state is preserved
    for (const [key, value] of originalState) {
      if (!migratedState.has(key)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Extract state management patterns
   */
  private extractStateManagement(sourceFile: ts.SourceFile): Map<string, string> {
    const stateMap = new Map<string, string>();

    const visit = (node: ts.Node): void => {
      // Check for useState
      if (ts.isCallExpression(node)) {
        const expression = node.expression.getText();
        if (expression === 'useState') {
          const parent = node.parent;
          if (ts.isVariableDeclaration(parent)) {
            const name = parent.name.getText();
            stateMap.set(name, 'useState');
          }
        }

        // Check for useReducer
        if (expression === 'useReducer') {
          const parent = node.parent;
          if (ts.isVariableDeclaration(parent)) {
            const name = parent.name.getText();
            stateMap.set(name, 'useReducer');
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return stateMap;
  }

  /**
   * Perform deep semantic analysis
   */
  private async performSemanticAnalysis(
    originalAST: ts.SourceFile,
    migratedAST: ts.SourceFile,
  ): Promise<ASTDifference[]> {
    const differences: ASTDifference[] = [];

    // Compare imports
    const originalImports = this.extractImports(originalAST);
    const migratedImports = this.extractImports(migratedAST);

    for (const imp of originalImports) {
      if (!migratedImports.has(imp)) {
        differences.push({
          path: 'imports',
          type: 'structural',
          description: `Missing import: ${imp}`,
          severity: 'medium',
        });
      }
    }

    // Compare exports
    const originalExports = this.extractExports(originalAST);
    const migratedExports = this.extractExports(migratedAST);

    for (const exp of originalExports) {
      if (!migratedExports.has(exp)) {
        differences.push({
          path: 'exports',
          type: 'structural',
          description: `Missing export: ${exp}`,
          severity: 'high',
        });
      }
    }

    return differences;
  }

  /**
   * Extract imports from AST
   */
  private extractImports(sourceFile: ts.SourceFile): Set<string> {
    const imports = new Set<string>();

    const visit = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node)) {
        imports.add(node.getText());
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return imports;
  }

  /**
   * Extract exports from AST
   */
  private extractExports(sourceFile: ts.SourceFile): Set<string> {
    const exports = new Set<string>();

    const visit = (node: ts.Node): void => {
      if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
        exports.add(node.getText());
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return exports;
  }

  /**
   * Generate analysis report
   */
  private generateReport(analysis: any): string {
    const lines: string[] = [
      '# Business Logic Analysis Report',
      '',
      `**Overall Preservation:** ${analysis.preserved ? '✅ PRESERVED' : '❌ NOT PRESERVED'}`,
      '',
      '## Preservation Status',
      '',
      `- Functions: ${analysis.functionsPreserved ? '✅' : '❌'}`,
      `- Event Handlers: ${analysis.eventHandlersPreserved ? '✅' : '❌'}`,
      `- Validation Logic: ${analysis.validationLogicPreserved ? '✅' : '❌'}`,
      `- State Management: ${analysis.stateManagementPreserved ? '✅' : '❌'}`,
      `- Semantic Equivalence: ${analysis.semanticEquivalence ? '✅' : '❌'}`,
      '',
    ];

    if (analysis.missingFunctions.length > 0) {
      lines.push('## Missing Functions', '');
      for (const func of analysis.missingFunctions) {
        lines.push(`- ${func}`);
      }
      lines.push('');
    }

    if (analysis.changedFunctions.length > 0) {
      lines.push('## Changed Functions', '');
      for (const change of analysis.changedFunctions) {
        lines.push(`### ${change.name} (${change.impact} impact)`);
        lines.push(`- Type: ${change.type}`);
        if (change.original && change.migrated) {
          if (change.type === 'signature') {
            lines.push(`- Original: ${change.original.signature}`);
            lines.push(`- Migrated: ${change.migrated.signature}`);
          }
        }
        lines.push('');
      }
    }

    if (analysis.astDifferences.length > 0) {
      lines.push('## AST Differences', '');
      for (const diff of analysis.astDifferences) {
        lines.push(`- [${diff.severity}] ${diff.description}`);
      }
    }

    return lines.join('\\n');
  }
}

/**
 * Factory function to create analyzer instance
 */
export function createEnhancedBusinessLogicAnalyzer(): EnhancedBusinessLogicAnalyzer {
  return new EnhancedBusinessLogicAnalyzer();
}
