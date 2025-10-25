/**
 * TypeScript Compilation Validator
 *
 * Validates generated V2 components using TypeScript Compiler API.
 */

import * as ts from 'typescript';
import type { V2Component } from '../types/v2-component.js';

/**
 * Validates that generated component compiles without errors
 */
export async function validateCompilation(component: V2Component): Promise<V2Component> {
  try {
    // Create in-memory TypeScript program
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      noEmit: true,
    };

    // Create virtual source file
    const sourceFile = ts.createSourceFile(
      component.filePath,
      component.sourceCode,
      ts.ScriptTarget.ES2020,
      true,
      ts.ScriptKind.TSX
    );

    // Create program
    const host = createCompilerHost(compilerOptions, component);
    const program = ts.createProgram([component.filePath], compilerOptions, host);

    // Get diagnostics
    const diagnostics = [
      ...program.getSyntacticDiagnostics(sourceFile),
      ...program.getSemanticDiagnostics(sourceFile),
    ];

    if (diagnostics.length > 0) {
      const errors = diagnostics.map((diagnostic) => {
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        if (diagnostic.file && diagnostic.start !== undefined) {
          const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
            diagnostic.start
          );
          return `${diagnostic.file.fileName}(${line + 1},${character + 1}): ${message}`;
        }
        return message;
      });

      return {
        ...component,
        compilationStatus: 'error',
        compilationErrors: errors,
      };
    }

    return {
      ...component,
      compilationStatus: 'success',
    };
  } catch (error) {
    const err = error as Error;
    return {
      ...component,
      compilationStatus: 'error',
      compilationErrors: [`Compilation validation failed: ${err.message}`],
    };
  }
}

/**
 * Creates a custom compiler host for in-memory compilation
 */
function createCompilerHost(
  options: ts.CompilerOptions,
  component: V2Component
): ts.CompilerHost {
  const host = ts.createCompilerHost(options);

  // Override file reading to use in-memory component source
  const originalGetSourceFile = host.getSourceFile;
  host.getSourceFile = (
    fileName: string,
    languageVersion: ts.ScriptTarget,
    onError?: (message: string) => void
  ) => {
    if (fileName === component.filePath) {
      return ts.createSourceFile(
        fileName,
        component.sourceCode,
        languageVersion,
        true,
        ts.ScriptKind.TSX
      );
    }

    // For other files, use default behavior
    return originalGetSourceFile(fileName, languageVersion, onError);
  };

  // Override file existence check
  const originalFileExists = host.fileExists;
  host.fileExists = (fileName: string) => {
    if (fileName === component.filePath) {
      return true;
    }
    return originalFileExists(fileName);
  };

  // Override read file
  const originalReadFile = host.readFile;
  host.readFile = (fileName: string) => {
    if (fileName === component.filePath) {
      return component.sourceCode;
    }
    return originalReadFile(fileName);
  };

  return host;
}

/**
 * Validates that pseudo-code blocks meet constitutional requirements
 */
export function validatePseudoCode(component: V2Component): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check minimum number of blocks
  if (component.pseudoCodeBlocks.length === 0) {
    errors.push('No pseudo-code blocks generated');
  }

  // Validate each block has required 6 constitutional fields
  for (let i = 0; i < component.pseudoCodeBlocks.length; i++) {
    const block = component.pseudoCodeBlocks[i];
    if (!block) continue;

    const blockPrefix = `Block ${i + 1} (${block.functionName})`;

    if (!block.whyExists || block.whyExists.trim().length === 0) {
      errors.push(`${blockPrefix}: Missing WHY EXISTS field`);
    }

    if (!block.whatItDoes || block.whatItDoes.length === 0) {
      errors.push(`${blockPrefix}: Missing WHAT IT DOES field`);
    }

    if (!block.dataFlow || block.dataFlow.trim().length === 0) {
      errors.push(`${blockPrefix}: Missing DATA FLOW field`);
    }

    // whatItCalls and dependencies are optional but should be arrays
    if (!Array.isArray(block.whatItCalls)) {
      errors.push(`${blockPrefix}: WHAT IT CALLS must be an array`);
    }

    if (!Array.isArray(block.dependencies)) {
      errors.push(`${blockPrefix}: DEPENDENCIES must be an array`);
    }

    // Check for placeholder/generic content
    const genericPhrases = ['TODO', 'implement', 'add logic', 'placeholder'];
    for (const phrase of genericPhrases) {
      if (block.whatItDoes.some((item) => item.toLowerCase().includes(phrase))) {
        errors.push(`${blockPrefix}: Contains generic placeholder in WHAT IT DOES`);
        break;
      }
    }
  }

  // Count total specific statements (SC-003 requires ≥15)
  const totalStatements = component.pseudoCodeBlocks.reduce(
    (sum, block) => sum + block.whatItDoes.length,
    0
  );

  if (totalStatements < 15) {
    errors.push(
      `Insufficient specific statements: ${totalStatements} found, 15 required (SC-003)`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
