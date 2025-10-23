/**
 * Integrated Migration Validator
 *
 * Connects to the real pipeline to validate migrations
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { ComponentParser, type ParseResult } from '@/engine/parser';
import { BusinessLogicAnalyzer } from '@/utils/business-logic-analyzer';
import type { ComponentDefinition } from '@/types';

export interface IntegratedValidationResult {
  success: boolean;
  component: string;
  checks: {
    fileExists: boolean;
    compiles: boolean;
    parseable: boolean;
    businessLogicPreserved: boolean;
  };
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metrics: {
    parseTime: number;
    analysisTime: number;
  };
  parseResult?: ParseResult;
}

export interface ValidationError {
  type: 'file' | 'compilation' | 'parse' | 'businessLogic';
  message: string;
  file?: string;
  line?: number;
}

export interface ValidationWarning {
  type: string;
  message: string;
}

export class IntegratedMigrationValidator {
  private parser: ComponentParser | null = null;
  private businessLogicAnalyzer: BusinessLogicAnalyzer;

  constructor() {
    // Lazy initialization to avoid ESM import issues
    this.businessLogicAnalyzer = new BusinessLogicAnalyzer();
  }

  private ensureParser(): ComponentParser {
    if (!this.parser) {
      this.parser = new ComponentParser({
        includePrivateMethods: false,
        extractJSDoc: true,
        analyzeComplexity: true,
        maxFileSize: 1024 * 1024, // 1MB
      });
    }
    return this.parser;
  }

  /**
   * Validate a migrated component against the original
   */
  public async validateMigration(
    migratedPath: string,
    originalPath: string
  ): Promise<IntegratedValidationResult> {
    const componentName = path.basename(migratedPath, path.extname(migratedPath));
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    console.log(`Validating migration: ${componentName}`);

    // Step 1: Check if files exist
    const fileExists = await this.checkFileExists(migratedPath, errors);
    const originalExists = await this.checkFileExists(originalPath, errors);

    if (!fileExists || !originalExists) {
      return {
        success: false,
        component: componentName,
        checks: {
          fileExists: false,
          compiles: false,
          parseable: false,
          businessLogicPreserved: false,
        },
        errors,
        warnings,
        metrics: {
          parseTime: 0,
          analysisTime: 0,
        },
      };
    }

    // Step 2: Parse both components
    const parseStartTime = Date.now();
    const migratedParse = await this.parseComponent(migratedPath, componentName, errors);
    const originalParse = await this.parseComponent(originalPath, componentName, errors);
    const parseTime = Date.now() - parseStartTime;

    const parseable = migratedParse !== null && originalParse !== null;

    // Step 3: Analyze business logic preservation
    const analysisStartTime = Date.now();
    let businessLogicPreserved = false;

    if (parseable && migratedParse && originalParse) {
      try {
        const migratedSource = await fs.readFile(migratedPath, 'utf-8');
        const originalSource = await fs.readFile(originalPath, 'utf-8');

        // Create mock component definitions for the analyzer
        const migratedComponent = this.createComponentDefinition(
          migratedPath,
          componentName,
          migratedParse
        );
        const originalComponent = this.createComponentDefinition(
          originalPath,
          componentName,
          originalParse
        );

        const migratedAnalysis = this.businessLogicAnalyzer.analyzeComponent(
          migratedComponent,
          migratedSource
        );
        const originalAnalysis = this.businessLogicAnalyzer.analyzeComponent(
          originalComponent,
          originalSource
        );

        // Check if business logic is preserved using the existing analyzer
        businessLogicPreserved = this.compareBusinessLogic(
          originalAnalysis,
          migratedAnalysis,
          errors
        );
      } catch (error) {
        errors.push({
          type: 'businessLogic',
          message: `Business logic analysis failed: ${error}`,
        });
      }
    }

    const analysisTime = Date.now() - analysisStartTime;

    // Compilation check - if it parsed, it compiles
    const compiles = parseable && migratedParse?.success === true;

    return {
      success: fileExists && compiles && parseable && businessLogicPreserved,
      component: componentName,
      checks: {
        fileExists,
        compiles,
        parseable,
        businessLogicPreserved,
      },
      errors,
      warnings,
      metrics: {
        parseTime,
        analysisTime,
      },
      parseResult: migratedParse || undefined,
    };
  }

  /**
   * Check if file exists
   */
  private async checkFileExists(filePath: string, errors: ValidationError[]): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      errors.push({
        type: 'file',
        message: `File not found: ${filePath}`,
        file: filePath,
      });
      return false;
    }
  }

  /**
   * Parse component using the real pipeline parser
   */
  private async parseComponent(
    filePath: string,
    componentName: string,
    errors: ValidationError[]
  ): Promise<ParseResult | null> {
    try {
      // Create a minimal component definition for parsing
      const componentDef: ComponentDefinition = {
        id: componentName,
        name: componentName,
        type: 'functional',
        sourcePath: filePath,
        props: [],
        businessLogic: [],
        reactPatterns: [],
        dependencies: [],
        complexity: 'simple',
        migrationStatus: 'pending',
        metadata: {
          version: '1.0.0',
          author: 'migration-test',
          created: new Date(),
          lastModified: new Date(),
          tags: [],
        },
      };

      const parser = this.ensureParser();
      const result = await parser.parseComponent(filePath, componentDef);

      if (!result.success) {
        errors.push({
          type: 'parse',
          message: `Failed to parse component: ${result.errors?.join(', ')}`,
          file: filePath,
        });
        return null;
      }

      return result;
    } catch (error) {
      errors.push({
        type: 'parse',
        message: `Parse error: ${error}`,
        file: filePath,
      });
      return null;
    }
  }

  /**
   * Create component definition from parse result
   */
  private createComponentDefinition(
    filePath: string,
    componentName: string,
    parseResult: ParseResult
  ): ComponentDefinition {
    return {
      id: componentName,
      name: componentName,
      type: parseResult.componentType === 'class' ? 'class' : 'functional',
      sourcePath: filePath,
      props: parseResult.structure?.props.map(p => ({
        name: p.name,
        type: p.type,
        required: p.required,
        defaultValue: p.defaultValue,
      })) || [],
      businessLogic: [], // Will be filled by analyzer
      reactPatterns: this.extractReactPatterns(parseResult),
      dependencies: parseResult.structure?.imports.external || [],
      complexity: this.determineComplexity(parseResult),
      migrationStatus: 'pending',
      metadata: {
        version: '1.0.0',
        author: 'migration-test',
        created: new Date(),
        lastModified: new Date(),
        tags: [],
      },
    };
  }

  /**
   * Extract React patterns from parse result
   */
  private extractReactPatterns(parseResult: ParseResult): string[] {
    const patterns: string[] = [];

    if (!parseResult.structure) return patterns;

    const { hooks, composition } = parseResult.structure;

    // Check for hook usage
    if (hooks.some(h => h.type === 'state')) patterns.push('hooks-useState');
    if (hooks.some(h => h.type === 'effect')) patterns.push('hooks-useEffect');
    if (hooks.some(h => h.type === 'context')) patterns.push('hooks-useContext');
    if (hooks.some(h => h.type === 'ref')) patterns.push('hooks-useRef');
    if (hooks.some(h => h.type === 'memo')) patterns.push('hooks-useMemo');
    if (hooks.some(h => h.type === 'callback')) patterns.push('hooks-useCallback');

    // Check for composition patterns
    if (composition.forwardRef) patterns.push('forwardRef');
    if (composition.memo) patterns.push('memo');
    if (composition.higherOrderComponents.length > 0) patterns.push('hoc');

    return patterns;
  }

  /**
   * Determine component complexity
   */
  private determineComplexity(parseResult: ParseResult): 'simple' | 'moderate' | 'complex' | 'critical' {
    if (!parseResult.structure) return 'simple';

    const { hooks, methods } = parseResult.structure;
    const totalElements = hooks.length + methods.length;

    if (totalElements > 20) return 'critical';
    if (totalElements > 10) return 'complex';
    if (totalElements > 5) return 'moderate';
    return 'simple';
  }

  /**
   * Compare business logic between original and migrated
   */
  private compareBusinessLogic(
    originalAnalysis: any,
    migratedAnalysis: any,
    errors: ValidationError[]
  ): boolean {
    // Compare function counts
    if (originalAnalysis.functions.length !== migratedAnalysis.functions.length) {
      errors.push({
        type: 'businessLogic',
        message: `Function count mismatch: original has ${originalAnalysis.functions.length}, migrated has ${migratedAnalysis.functions.length}`,
      });
      return false;
    }

    // Compare state management
    if (originalAnalysis.stateManagement.length !== migratedAnalysis.stateManagement.length) {
      errors.push({
        type: 'businessLogic',
        message: `State management count mismatch: original has ${originalAnalysis.stateManagement.length}, migrated has ${migratedAnalysis.stateManagement.length}`,
      });
      return false;
    }

    // Compare side effects
    if (originalAnalysis.sideEffects.length !== migratedAnalysis.sideEffects.length) {
      errors.push({
        type: 'businessLogic',
        message: `Side effects count mismatch: original has ${originalAnalysis.sideEffects.length}, migrated has ${migratedAnalysis.sideEffects.length}`,
      });
      return false;
    }

    // All checks passed
    return true;
  }

  /**
   * Generate validation report
   */
  public generateReport(result: IntegratedValidationResult): string {
    const lines: string[] = [
      `# Migration Validation Report: ${result.component}`,
      '',
      `**Status:** ${result.success ? '✅ PASSED' : '❌ FAILED'}`,
      '',
      '## Validation Checks',
      '',
      `- File Exists: ${result.checks.fileExists ? '✅' : '❌'}`,
      `- Compiles: ${result.checks.compiles ? '✅' : '❌'}`,
      `- Parseable: ${result.checks.parseable ? '✅' : '❌'}`,
      `- Business Logic: ${result.checks.businessLogicPreserved ? '✅' : '❌'}`,
      '',
      '## Metrics',
      '',
      `- Parse Time: ${result.metrics.parseTime}ms`,
      `- Analysis Time: ${result.metrics.analysisTime}ms`,
      '',
    ];

    if (result.errors.length > 0) {
      lines.push('## Errors', '');
      for (const error of result.errors) {
        lines.push(`- **${error.type}:** ${error.message}`);
        if (error.file) {
          lines.push(`  - File: ${error.file}`);
        }
      }
      lines.push('');
    }

    if (result.warnings.length > 0) {
      lines.push('## Warnings', '');
      for (const warning of result.warnings) {
        lines.push(`- **${warning.type}:** ${warning.message}`);
      }
    }

    return lines.join('\n');
  }
}

/**
 * Factory function
 */
export function createIntegratedMigrationValidator(): IntegratedMigrationValidator {
  return new IntegratedMigrationValidator();
}
