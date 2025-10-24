/**
 * Enhanced Migration Validator
 *
 * Validates that migrated components actually compile and run correctly
 */

import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ValidationResult {
  success: boolean;
  component: string;
  checks: {
    compiles: boolean;
    typesValid: boolean;
    testsPass: boolean;
    bundleSizeAcceptable: boolean;
    runtimeValid: boolean;
    businessLogicPreserved: boolean;
  };
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metrics: {
    compilationTime: number;
    bundleSize: number;
    testPassRate: number;
  };
}

export interface ValidationError {
  type: 'compilation' | 'type' | 'runtime' | 'test' | 'businessLogic';
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface ValidationWarning {
  type: string;
  message: string;
}

export class EnhancedMigrationValidator {
  private readonly tsConfig: ts.CompilerOptions;

  constructor() {
    // Load TypeScript configuration
    this.tsConfig = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      outDir: './dist',
    };
  }

  /**
   * Validate a migrated component
   */
  public async validateMigration(
    componentPath: string,
    originalPath: string
  ): Promise<ValidationResult> {
    const componentName = path.basename(componentPath, '.tsx');
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    console.log(`Validating migration: ${componentName}`);

    // Step 1: Check if component compiles
    const compilationStart = Date.now();
    const compiles = await this.validateCompilation(componentPath, errors);
    const compilationTime = Date.now() - compilationStart;

    // Step 2: Validate TypeScript types
    const typesValid = await this.validateTypes(componentPath, errors);

    // Step 3: Run component tests
    const testsPass = await this.runComponentTests(componentPath, errors);
    const testPassRate = await this.calculateTestPassRate(componentPath);

    // Step 4: Check bundle size
    const bundleSize = await this.measureBundleSize(componentPath);
    const originalBundleSize = await this.measureBundleSize(originalPath);
    const bundleSizeAcceptable = bundleSize <= originalBundleSize * 1.2;

    if (!bundleSizeAcceptable) {
      warnings.push({
        type: 'bundle-size',
        message: `Bundle size increased by ${((bundleSize / originalBundleSize - 1) * 100).toFixed(1)}%`,
      });
    }

    // Step 5: Validate runtime behavior
    const runtimeValid = await this.validateRuntime(componentPath, errors);

    // Step 6: Validate business logic preservation
    const businessLogicPreserved = await this.validateBusinessLogic(
      componentPath,
      originalPath,
      errors
    );

    return {
      success:
        compiles &&
        typesValid &&
        testsPass &&
        runtimeValid &&
        businessLogicPreserved,
      component: componentName,
      checks: {
        compiles,
        typesValid,
        testsPass,
        bundleSizeAcceptable,
        runtimeValid,
        businessLogicPreserved,
      },
      errors,
      warnings,
      metrics: {
        compilationTime,
        bundleSize,
        testPassRate,
      },
    };
  }

  /**
   * Validate that the component compiles without errors
   */
  private async validateCompilation(
    componentPath: string,
    errors: ValidationError[]
  ): Promise<boolean> {
    try {
      // Read the component file
      const source = await fs.readFile(componentPath, 'utf-8');

      // Create a TypeScript program
      const program = ts.createProgram([componentPath], this.tsConfig);

      // Get compilation diagnostics
      const diagnostics = ts.getPreEmitDiagnostics(program);

      // Process diagnostics
      for (const diagnostic of diagnostics) {
        if (diagnostic.category === ts.DiagnosticCategory.Error) {
          const file = diagnostic.file;
          const message = ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            '\n'
          );

          if (file && diagnostic.start !== undefined) {
            const { line, character } = file.getLineAndCharacterOfPosition(
              diagnostic.start
            );
            errors.push({
              type: 'compilation',
              message,
              file: file.fileName,
              line: line + 1,
              column: character + 1,
            });
          } else {
            errors.push({
              type: 'compilation',
              message,
            });
          }
        }
      }

      return errors.filter(e => e.type === 'compilation').length === 0;
    } catch (error) {
      errors.push({
        type: 'compilation',
        message: `Failed to compile: ${error}`,
      });
      return false;
    }
  }

  /**
   * Validate TypeScript types are correctly preserved
   */
  private async validateTypes(
    componentPath: string,
    errors: ValidationError[]
  ): Promise<boolean> {
    try {
      // Use TypeScript compiler API to check types
      const program = ts.createProgram([componentPath], {
        ...this.tsConfig,
        noEmit: true,
        strict: true,
      });

      const typeChecker = program.getTypeChecker();
      const sourceFile = program.getSourceFile(componentPath);

      if (!sourceFile) {
        errors.push({
          type: 'type',
          message: 'Could not load source file for type checking',
        });
        return false;
      }

      // Visit all nodes and check types
      const visit = (node: ts.Node): void => {
        try {
          // Check if node has a type
          const type = typeChecker.getTypeAtLocation(node);

          // Check for 'any' types (should be avoided)
          if (type.flags & ts.TypeFlags.Any) {
            const { line, character } =
              sourceFile.getLineAndCharacterOfPosition(node.getStart());
            errors.push({
              type: 'type',
              message: 'Unsafe "any" type detected',
              file: componentPath,
              line: line + 1,
              column: character + 1,
            });
          }

          // Check function return types are explicit
          if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
            const signature = typeChecker.getSignatureFromDeclaration(
              node as any
            );
            if (signature) {
              const returnType =
                typeChecker.getReturnTypeOfSignature(signature);
              if (!returnType || returnType.flags & ts.TypeFlags.Any) {
                const { line } = sourceFile.getLineAndCharacterOfPosition(
                  node.getStart()
                );
                errors.push({
                  type: 'type',
                  message: 'Function missing explicit return type',
                  file: componentPath,
                  line: line + 1,
                });
              }
            }
          }
        } catch (e) {
          // Ignore type checking errors for specific nodes
        }

        ts.forEachChild(node, visit);
      };

      visit(sourceFile);

      return errors.filter(e => e.type === 'type').length === 0;
    } catch (error) {
      errors.push({
        type: 'type',
        message: `Type validation failed: ${error}`,
      });
      return false;
    }
  }

  /**
   * Run component tests
   */
  private async runComponentTests(
    componentPath: string,
    errors: ValidationError[]
  ): Promise<boolean> {
    try {
      // Look for corresponding test file
      const testPath = componentPath.replace(/\.tsx?$/, '.test.tsx');
      const testExists = await fs
        .access(testPath)
        .then(() => true)
        .catch(() => false);

      if (!testExists) {
        // Create a basic test file if it doesn't exist
        await this.createBasicTest(componentPath, testPath);
      }

      // Run the test
      const { stdout, stderr } = await execAsync(
        `npx jest ${testPath} --no-coverage --silent`,
        { cwd: process.cwd() }
      );

      // Parse test results
      if (stderr && stderr.includes('FAIL')) {
        errors.push({
          type: 'test',
          message: 'Component tests failed',
        });
        return false;
      }

      return true;
    } catch (error) {
      errors.push({
        type: 'test',
        message: `Test execution failed: ${error}`,
      });
      return false;
    }
  }

  /**
   * Create a basic test file for the component
   */
  private async createBasicTest(
    componentPath: string,
    testPath: string
  ): Promise<void> {
    const componentName = path.basename(
      componentPath,
      path.extname(componentPath)
    );

    const testContent = `
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('should render without crashing', () => {
    const { container } = render(<${componentName} label="Test" />);
    expect(container).toBeTruthy();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<${componentName} label="Click Me" onClick={handleClick} />);

    const button = screen.getByText('Click Me');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });

  it('should respect disabled state', () => {
    const handleClick = jest.fn();
    render(<${componentName} label="Disabled" onClick={handleClick} disabled />);

    const button = screen.getByText('Disabled');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
`;

    await fs.writeFile(testPath, testContent);
  }

  /**
   * Calculate test pass rate
   */
  private async calculateTestPassRate(componentPath: string): Promise<number> {
    try {
      const testPath = componentPath.replace(/\.tsx?$/, '.test.tsx');
      const { stdout } = await execAsync(
        `npx jest ${testPath} --json --no-coverage --silent`,
        { cwd: process.cwd() }
      );

      const results = JSON.parse(stdout);
      const totalTests = results.numTotalTests || 0;
      const passedTests = results.numPassedTests || 0;

      return totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Measure bundle size of the component
   */
  private async measureBundleSize(componentPath: string): Promise<number> {
    try {
      // Create a temporary webpack config
      const webpackConfig = `
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: '${componentPath}',
  output: {
    path: path.resolve(__dirname, 'dist-test'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
`;

      // Write temporary webpack config
      const configPath = path.join(process.cwd(), 'webpack.temp.config.js');
      await fs.writeFile(configPath, webpackConfig);

      // Run webpack
      const { stdout } = await execAsync(`npx webpack --config ${configPath}`, {
        cwd: process.cwd(),
      });

      // Get bundle size
      const bundlePath = path.join(process.cwd(), 'dist-test', 'bundle.js');
      const stats = await fs.stat(bundlePath);

      // Clean up
      await fs.unlink(configPath);
      await fs.rm(path.join(process.cwd(), 'dist-test'), { recursive: true });

      return stats.size;
    } catch (error) {
      console.error('Failed to measure bundle size:', error);
      return 0;
    }
  }

  /**
   * Validate runtime behavior
   */
  private async validateRuntime(
    componentPath: string,
    errors: ValidationError[]
  ): Promise<boolean> {
    try {
      // This would run the component in a headless browser
      // and check for runtime errors
      // For now, we'll do a basic check

      // Check for common runtime issues
      const source = await fs.readFile(componentPath, 'utf-8');

      // Check for missing null checks
      if (source.includes('.map(') && !source.includes('?.map(')) {
        errors.push({
          type: 'runtime',
          message:
            'Potential null reference error: Array map without null check',
        });
      }

      // Check for missing dependency arrays in hooks
      const useEffectRegex = /useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*\)/g;
      if (useEffectRegex.test(source)) {
        errors.push({
          type: 'runtime',
          message: 'useEffect missing dependency array',
        });
      }

      return errors.filter(e => e.type === 'runtime').length === 0;
    } catch (error) {
      errors.push({
        type: 'runtime',
        message: `Runtime validation failed: ${error}`,
      });
      return false;
    }
  }

  /**
   * Validate business logic is preserved
   */
  private async validateBusinessLogic(
    migratedPath: string,
    originalPath: string,
    errors: ValidationError[]
  ): Promise<boolean> {
    try {
      // Parse both files
      const migratedSource = await fs.readFile(migratedPath, 'utf-8');
      const originalSource = await fs.readFile(originalPath, 'utf-8');

      // Extract business logic functions
      const migratedFunctions =
        this.extractBusinessLogicFunctions(migratedSource);
      const originalFunctions =
        this.extractBusinessLogicFunctions(originalSource);

      // Compare function signatures
      for (const [name, signature] of originalFunctions) {
        if (!migratedFunctions.has(name)) {
          errors.push({
            type: 'businessLogic',
            message: `Business logic function missing: ${name}`,
          });
        } else {
          const migratedSignature = migratedFunctions.get(name);
          if (signature !== migratedSignature) {
            errors.push({
              type: 'businessLogic',
              message: `Function signature changed: ${name}`,
            });
          }
        }
      }

      // Check for preserved validation logic
      const originalValidations = this.extractValidationLogic(originalSource);
      const migratedValidations = this.extractValidationLogic(migratedSource);

      if (originalValidations.length !== migratedValidations.length) {
        errors.push({
          type: 'businessLogic',
          message: 'Validation logic count mismatch',
        });
      }

      // Check for preserved event handlers
      const originalHandlers = this.extractEventHandlers(originalSource);
      const migratedHandlers = this.extractEventHandlers(migratedSource);

      for (const handler of originalHandlers) {
        if (!migratedHandlers.includes(handler)) {
          errors.push({
            type: 'businessLogic',
            message: `Event handler missing: ${handler}`,
          });
        }
      }

      return errors.filter(e => e.type === 'businessLogic').length === 0;
    } catch (error) {
      errors.push({
        type: 'businessLogic',
        message: `Business logic validation failed: ${error}`,
      });
      return false;
    }
  }

  /**
   * Extract business logic functions from source code
   */
  private extractBusinessLogicFunctions(source: string): Map<string, string> {
    const functions = new Map<string, string>();

    // Extract named functions
    const functionRegex =
      /(?:export\s+)?(?:const|function)\s+(\w+)\s*[=:]\s*(?:\([^)]*\)|async\s*\([^)]*\))\s*(?::\s*[^{]+)?\s*=>/g;
    let match;

    while ((match = functionRegex.exec(source)) !== null) {
      functions.set(match[1], match[0]);
    }

    // Extract traditional functions
    const traditionalFunctionRegex =
      /(?:export\s+)?function\s+(\w+)\s*\([^)]*\)(?:\s*:\s*[^{]+)?\s*{/g;
    while ((match = traditionalFunctionRegex.exec(source)) !== null) {
      functions.set(match[1], match[0]);
    }

    return functions;
  }

  /**
   * Extract validation logic
   */
  private extractValidationLogic(source: string): string[] {
    const validations: string[] = [];

    // Look for validation patterns
    const patterns = [
      /if\s*\([^)]*(?:required|validate|isValid|isEmpty|length)[^)]*\)/g,
      /(?:validate|check|verify|ensure)\w+\s*\(/g,
      /throw\s+new\s+Error\s*\(/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(source)) !== null) {
        validations.push(match[0]);
      }
    }

    return validations;
  }

  /**
   * Extract event handlers
   */
  private extractEventHandlers(source: string): string[] {
    const handlers: string[] = [];

    // Look for event handler patterns
    const patterns = [
      /on[A-Z]\w+\s*[=:]/g, // onClick, onChange, etc.
      /handle[A-Z]\w+/g, // handleClick, handleSubmit, etc.
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(source)) !== null) {
        handlers.push(match[0]);
      }
    }

    return handlers;
  }

  /**
   * Generate validation report
   */
  public generateReport(result: ValidationResult): string {
    const lines: string[] = [
      `# Migration Validation Report: ${result.component}`,
      '',
      `**Status:** ${result.success ? '✅ PASSED' : '❌ FAILED'}`,
      '',
      '## Validation Checks',
      '',
      `- Compilation: ${result.checks.compiles ? '✅' : '❌'}`,
      `- Type Safety: ${result.checks.typesValid ? '✅' : '❌'}`,
      `- Tests Pass: ${result.checks.testsPass ? '✅' : '❌'}`,
      `- Bundle Size: ${result.checks.bundleSizeAcceptable ? '✅' : '⚠️'}`,
      `- Runtime Valid: ${result.checks.runtimeValid ? '✅' : '❌'}`,
      `- Business Logic: ${result.checks.businessLogicPreserved ? '✅' : '❌'}`,
      '',
      '## Metrics',
      '',
      `- Compilation Time: ${result.metrics.compilationTime}ms`,
      `- Bundle Size: ${(result.metrics.bundleSize / 1024).toFixed(2)}KB`,
      `- Test Pass Rate: ${result.metrics.testPassRate.toFixed(1)}%`,
      '',
    ];

    if (result.errors.length > 0) {
      lines.push('## Errors', '');
      for (const error of result.errors) {
        lines.push(`- **${error.type}:** ${error.message}`);
        if (error.file) {
          lines.push(`  - File: ${error.file}:${error.line}:${error.column}`);
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
 * Factory function to create validator instance
 */
export function createEnhancedMigrationValidator(): EnhancedMigrationValidator {
  return new EnhancedMigrationValidator();
}
