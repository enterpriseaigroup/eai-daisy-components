/**
 * Business Logic Analyzer
 *
 * Identifies business logic patterns in DAISY v1 baselines.
 */

import { SourceFile, SyntaxKind, Node } from 'ts-morph';
import type { BusinessLogicPattern } from '../types/ast-analysis.js';

/**
 * Identifies business logic patterns in source code
 */
export async function identifyBusinessLogicPatterns(
  sourceFile: SourceFile
): Promise<BusinessLogicPattern[]> {
  const patterns: BusinessLogicPattern[] = [];

  // Detect validation rules (T049)
  patterns.push(...extractValidationRules(sourceFile));

  // Detect data transformations (T050)
  patterns.push(...extractDataTransformations(sourceFile));

  // Detect conditional rendering (T051)
  patterns.push(...extractConditionalRendering(sourceFile));

  // Detect state machines (T052)
  patterns.push(...extractStateMachines(sourceFile));

  // Detect external APIs
  patterns.push(...detectExternalAPIs(sourceFile));

  return patterns;
}

/**
 * Detects external API calls (fetch/axios)
 */
export function detectExternalAPIs(sourceFile: SourceFile): BusinessLogicPattern[] {
  const patterns: BusinessLogicPattern[] = [];

  sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
    const expression = call.getExpression();
    const expressionText = expression.getText();

    // Detect fetch calls
    if (expressionText === 'fetch' || expressionText.includes('.fetch')) {
      const args = call.getArguments();
      const url = args[0]?.getText() || 'unknown';
      const method = extractMethodFromFetchOptions(args[1]);

      patterns.push({
        type: 'api-call',
        description: `API call to ${url} using ${method}`,
        location: {
          file: sourceFile.getFilePath(),
          startLine: call.getStartLineNumber(),
          endLine: call.getEndLineNumber(),
        },
        code: call.getText().substring(0, 200), // Truncate long calls
        confidence: 0.9,
      });
    }

    // Detect axios calls
    if (expressionText.startsWith('axios.') || expressionText === 'axios') {
      const method = expressionText.split('.')[1] || 'request';
      const args = call.getArguments();
      const url = args[0]?.getText() || 'unknown';

      patterns.push({
        type: 'api-call',
        description: `Axios ${method.toUpperCase()} request to ${url}`,
        location: {
          file: sourceFile.getFilePath(),
          startLine: call.getStartLineNumber(),
          endLine: call.getEndLineNumber(),
        },
        code: call.getText().substring(0, 200),
        confidence: 0.95,
      });
    }
  });

  return patterns;
}

/**
 * Preserves inline comments describing business logic
 */
export function preserveInlineComments(sourceFile: SourceFile): string[] {
  const comments: string[] = [];

  // Get all comment nodes
  sourceFile.forEachDescendant((node) => {
    const leadingComments = node.getLeadingCommentRanges();

    leadingComments.forEach((comment) => {
      const text = comment.getText();
      const cleanText = text
        .replace(/^\/\/\s*/, '')
        .replace(/^\/\*\*?|\*\/$/g, '')
        .replace(/^\s*\*\s?/gm, '')
        .trim();

      // Filter meaningful business logic comments
      if (
        cleanText.length > 15 &&
        !cleanText.startsWith('@') &&
        !cleanText.startsWith('TODO') &&
        !cleanText.startsWith('FIXME') &&
        !cleanText.startsWith('eslint') &&
        !cleanText.startsWith('ts-')
      ) {
        comments.push(cleanText);
      }
    });
  });

  return [...new Set(comments)]; // Remove duplicates
}

/**
 * Detects validation rules (regex, conditions, type checks)
 * @deprecated Legacy - use extractValidationRules for enhanced detection
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-expect-error - Legacy function kept for backwards compatibility
function detectValidationRules(sourceFile: SourceFile): BusinessLogicPattern[] {
  const patterns: BusinessLogicPattern[] = [];

  // Detect regex patterns
  sourceFile.getDescendantsOfKind(SyntaxKind.RegularExpressionLiteral).forEach((regex) => {
    const parent = regex.getParent();
    if (Node.isCallExpression(parent)) {
      const method = parent.getExpression().getText();
      if (method.includes('test') || method.includes('match')) {
        patterns.push({
          type: 'validation',
          description: `Regex validation: ${regex.getText()}`,
          location: {
            file: sourceFile.getFilePath(),
            startLine: regex.getStartLineNumber(),
            endLine: regex.getEndLineNumber(),
          },
          code: parent.getText(),
          confidence: 0.85,
        });
      }
    }
  });

  // Detect type checking
  sourceFile.getDescendantsOfKind(SyntaxKind.TypeOfExpression).forEach((typeOf) => {
    const parent = typeOf.getParent();
    if (Node.isBinaryExpression(parent)) {
      patterns.push({
        type: 'validation',
        description: `Type validation: ${parent.getText()}`,
        location: {
          file: sourceFile.getFilePath(),
          startLine: typeOf.getStartLineNumber(),
          endLine: typeOf.getEndLineNumber(),
        },
        code: parent.getText(),
        confidence: 0.7,
      });
    }
  });

  return patterns;
}

/**
 * Detects data transformations (map, filter, reduce)
 * @deprecated Legacy - use extractDataTransformations for enhanced detection
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-expect-error - Legacy function kept for backwards compatibility
function detectDataTransformations(sourceFile: SourceFile): BusinessLogicPattern[] {
  const patterns: BusinessLogicPattern[] = [];

  sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
    const expression = call.getExpression();
    if (Node.isPropertyAccessExpression(expression)) {
      const methodName = expression.getName();

      if (['map', 'filter', 'reduce', 'find', 'some', 'every'].includes(methodName)) {
        patterns.push({
          type: 'transformation',
          description: `Data transformation using .${methodName}()`,
          location: {
            file: sourceFile.getFilePath(),
            startLine: call.getStartLineNumber(),
            endLine: call.getEndLineNumber(),
          },
          code: call.getText().substring(0, 150),
          confidence: 0.8,
        });
      }
    }
  });

  return patterns;
}

/**
 * Detects conditional rendering patterns
 * @deprecated Legacy - use extractConditionalRendering for enhanced detection
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-expect-error - Legacy function kept for backwards compatibility
function detectConditionalRendering(sourceFile: SourceFile): BusinessLogicPattern[] {
  const patterns: BusinessLogicPattern[] = [];

  // Detect ternary operators in JSX
  sourceFile.getDescendantsOfKind(SyntaxKind.ConditionalExpression).forEach((ternary) => {
    const parent = ternary.getParent();
    if (Node.isJsxExpression(parent) || Node.isJsxElement(parent)) {
      patterns.push({
        type: 'conditional',
        description: 'Conditional rendering with ternary operator',
        location: {
          file: sourceFile.getFilePath(),
          startLine: ternary.getStartLineNumber(),
          endLine: ternary.getEndLineNumber(),
        },
        code: ternary.getText().substring(0, 100),
        confidence: 0.75,
      });
    }
  });

  // Detect logical AND rendering
  sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach((binary) => {
    if (binary.getOperatorToken().getKind() === SyntaxKind.AmpersandAmpersandToken) {
      const parent = binary.getParent();
      if (Node.isJsxExpression(parent)) {
        patterns.push({
          type: 'conditional',
          description: 'Conditional rendering with && operator',
          location: {
            file: sourceFile.getFilePath(),
            startLine: binary.getStartLineNumber(),
            endLine: binary.getEndLineNumber(),
          },
          code: binary.getText().substring(0, 100),
          confidence: 0.8,
        });
      }
    }
  });

  return patterns;
}

/**
 * Extracts HTTP method from fetch options
 */
function extractMethodFromFetchOptions(optionsArg: Node | undefined): string {
  if (!optionsArg || !Node.isObjectLiteralExpression(optionsArg)) {
    return 'GET';
  }

  const methodProp = optionsArg.getProperty('method');
  if (methodProp && Node.isPropertyAssignment(methodProp)) {
    const initializer = methodProp.getInitializer();
    if (initializer) {
      return initializer.getText().replace(/['"]/g, '').toUpperCase();
    }
  }

  return 'GET';
}

/**
 * T049: Extracts validation rules from source code
 */
export function extractValidationRules(sourceFile: SourceFile): BusinessLogicPattern[] {
  const patterns: BusinessLogicPattern[] = [];

  // Detect regex patterns for validation
  sourceFile.getDescendantsOfKind(SyntaxKind.RegularExpressionLiteral).forEach((regex) => {
    const regexText = regex.getText();
    
    // UK postcode pattern detection
    if (regexText.toLowerCase().includes('postcode') || 
        regexText.match(/[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}/i)) {
      patterns.push({
        type: 'validation',
        description: `UK postcode validation: ${regexText}`,
        location: {
          file: sourceFile.getFilePath(),
          startLine: regex.getStartLineNumber(),
          endLine: regex.getEndLineNumber(),
        },
        code: regex.getText(),
        confidence: 0.95,
      });
    }
    // Email pattern detection
    else if (regexText.includes('@') || regexText.toLowerCase().includes('email')) {
      patterns.push({
        type: 'validation',
        description: `Email validation: ${regexText}`,
        location: {
          file: sourceFile.getFilePath(),
          startLine: regex.getStartLineNumber(),
          endLine: regex.getEndLineNumber(),
        },
        code: regex.getText(),
        confidence: 0.9,
      });
    }
    // Phone number pattern detection
    else if (regexText.match(/\d{3,}/) && (regexText.includes('+') || regexText.includes('\\d'))) {
      patterns.push({
        type: 'validation',
        description: `Phone number validation: ${regexText}`,
        location: {
          file: sourceFile.getFilePath(),
          startLine: regex.getStartLineNumber(),
          endLine: regex.getEndLineNumber(),
        },
        code: regex.getText(),
        confidence: 0.85,
      });
    }
    // Generic regex validation
    else {
      patterns.push({
        type: 'validation',
        description: `Format validation: ${regexText}`,
        location: {
          file: sourceFile.getFilePath(),
          startLine: regex.getStartLineNumber(),
          endLine: regex.getEndLineNumber(),
        },
        code: regex.getText(),
        confidence: 0.7,
      });
    }
  });

  // Detect validation function calls (validate*, check*, verify*)
  sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
    const expression = call.getExpression();
    const functionName = expression.getText().toLowerCase();

    if (functionName.includes('validate') || 
        functionName.includes('check') || 
        functionName.includes('verify') ||
        functionName.includes('isvalid')) {
      patterns.push({
        type: 'validation',
        description: `Validation function: ${expression.getText()}`,
        location: {
          file: sourceFile.getFilePath(),
          startLine: call.getStartLineNumber(),
          endLine: call.getEndLineNumber(),
        },
        code: call.getText().substring(0, 100),
        confidence: 0.8,
      });
    }
  });

  return patterns;
}

/**
 * T050: Extracts data transformation operations
 */
export function extractDataTransformations(sourceFile: SourceFile): BusinessLogicPattern[] {
  const patterns: BusinessLogicPattern[] = [];

  // Detect .map() transformations
  sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
    const expression = call.getExpression();
    
    if (Node.isPropertyAccessExpression(expression)) {
      const methodName = expression.getName();
      const objectText = expression.getExpression().getText();

      // Array transformation methods
      if (methodName === 'map') {
        patterns.push({
          type: 'transformation',
          description: `Transform ${objectText} with map operation`,
          location: {
            file: sourceFile.getFilePath(),
            startLine: call.getStartLineNumber(),
            endLine: call.getEndLineNumber(),
          },
          code: call.getText().substring(0, 150),
          confidence: 0.9,
        });
      }
      else if (methodName === 'filter') {
        patterns.push({
          type: 'transformation',
          description: `Filter ${objectText} with filter operation`,
          location: {
            file: sourceFile.getFilePath(),
            startLine: call.getStartLineNumber(),
            endLine: call.getEndLineNumber(),
          },
          code: call.getText().substring(0, 150),
          confidence: 0.9,
        });
      }
      else if (methodName === 'reduce') {
        patterns.push({
          type: 'transformation',
          description: `Aggregate ${objectText} with reduce operation`,
          location: {
            file: sourceFile.getFilePath(),
            startLine: call.getStartLineNumber(),
            endLine: call.getEndLineNumber(),
          },
          code: call.getText().substring(0, 150),
          confidence: 0.85,
        });
      }
      // Property mapping methods
      else if (methodName === 'flatMap' || methodName === 'flat') {
        patterns.push({
          type: 'transformation',
          description: `Flatten ${objectText} with ${methodName} operation`,
          location: {
            file: sourceFile.getFilePath(),
            startLine: call.getStartLineNumber(),
            endLine: call.getEndLineNumber(),
          },
          code: call.getText().substring(0, 150),
          confidence: 0.85,
        });
      }
      // String transformations
      else if (['toLowerCase', 'toUpperCase', 'trim', 'replace', 'normalize'].includes(methodName)) {
        patterns.push({
          type: 'transformation',
          description: `String normalization: ${objectText}.${methodName}()`,
          location: {
            file: sourceFile.getFilePath(),
            startLine: call.getStartLineNumber(),
            endLine: call.getEndLineNumber(),
          },
          code: call.getText().substring(0, 100),
          confidence: 0.8,
        });
      }
    }
  });

  // Detect object spreading for property mapping
  sourceFile.getDescendantsOfKind(SyntaxKind.SpreadAssignment).forEach((spread) => {
    patterns.push({
      type: 'transformation',
      description: `Property mapping with spread operator`,
      location: {
        file: sourceFile.getFilePath(),
        startLine: spread.getStartLineNumber(),
        endLine: spread.getEndLineNumber(),
      },
      code: spread.getText().substring(0, 100),
      confidence: 0.7,
    });
  });

  return patterns;
}

/**
 * T051: Extracts conditional rendering patterns
 */
export function extractConditionalRendering(sourceFile: SourceFile): BusinessLogicPattern[] {
  const patterns: BusinessLogicPattern[] = [];

  // Detect if/else statements in JSX
  sourceFile.getDescendantsOfKind(SyntaxKind.IfStatement).forEach((ifStmt) => {
    // Check if it's within a JSX context
    let parent: Node | undefined = ifStmt.getParent();
    let inJsxContext = false;
    
    while (parent !== undefined) {
      if (Node.isJsxElement(parent) || Node.isJsxFragment(parent) || Node.isJsxExpression(parent)) {
        inJsxContext = true;
        break;
      }
      parent = parent.getParent();
    }

    if (inJsxContext) {
      const condition = ifStmt.getExpression().getText();
      patterns.push({
        type: 'conditional',
        description: `Conditional UI rendering: if (${condition})`,
        location: {
          file: sourceFile.getFilePath(),
          startLine: ifStmt.getStartLineNumber(),
          endLine: ifStmt.getEndLineNumber(),
        },
        code: ifStmt.getText().substring(0, 200),
        confidence: 0.9,
      });
    }
  });

  // Detect ternary operators in JSX
  sourceFile.getDescendantsOfKind(SyntaxKind.ConditionalExpression).forEach((ternary) => {
    const parent = ternary.getParent();
    if (Node.isJsxExpression(parent) || Node.isJsxElement(parent)) {
      const condition = ternary.getCondition().getText();
      patterns.push({
        type: 'conditional',
        description: `Ternary conditional rendering: ${condition} ? ... : ...`,
        location: {
          file: sourceFile.getFilePath(),
          startLine: ternary.getStartLineNumber(),
          endLine: ternary.getEndLineNumber(),
        },
        code: ternary.getText().substring(0, 150),
        confidence: 0.85,
      });
    }
  });

  // Detect logical AND (&&) rendering
  sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach((binary) => {
    if (binary.getOperatorToken().getKind() === SyntaxKind.AmpersandAmpersandToken) {
      const parent = binary.getParent();
      if (Node.isJsxExpression(parent)) {
        const condition = binary.getLeft().getText();
        patterns.push({
          type: 'conditional',
          description: `Short-circuit conditional rendering: ${condition} && ...`,
          location: {
            file: sourceFile.getFilePath(),
            startLine: binary.getStartLineNumber(),
            endLine: binary.getEndLineNumber(),
          },
          code: binary.getText().substring(0, 100),
          confidence: 0.9,
        });
      }
    }
  });

  return patterns;
}

/**
 * T052: Extracts state machine patterns
 */
export function extractStateMachines(sourceFile: SourceFile): BusinessLogicPattern[] {
  const patterns: BusinessLogicPattern[] = [];

  // Detect state enum or union types
  sourceFile.getDescendantsOfKind(SyntaxKind.EnumDeclaration).forEach((enumDecl) => {
    const name = enumDecl.getName().toLowerCase();
    if (name.includes('state') || name.includes('status') || name.includes('step')) {
      const members = enumDecl.getMembers().map(m => m.getName());
      patterns.push({
        type: 'conditional',
        description: `State machine: ${enumDecl.getName()} with states: ${members.join(', ')}`,
        location: {
          file: sourceFile.getFilePath(),
          startLine: enumDecl.getStartLineNumber(),
          endLine: enumDecl.getEndLineNumber(),
        },
        code: enumDecl.getText().substring(0, 200),
        confidence: 0.95,
      });
    }
  });

  // Detect switch statements (often used for state transitions)
  sourceFile.getDescendantsOfKind(SyntaxKind.SwitchStatement).forEach((switchStmt) => {
    const expression = switchStmt.getExpression().getText();
    const caseCount = switchStmt.getClauses().length;
    
    if (expression.toLowerCase().includes('state') || 
        expression.toLowerCase().includes('status') ||
        expression.toLowerCase().includes('step') ||
        caseCount >= 3) {
      patterns.push({
        type: 'conditional',
        description: `State transition logic: switch(${expression}) with ${caseCount} cases`,
        location: {
          file: sourceFile.getFilePath(),
          startLine: switchStmt.getStartLineNumber(),
          endLine: switchStmt.getEndLineNumber(),
        },
        code: switchStmt.getText().substring(0, 300),
        confidence: 0.85,
      });
    }
  });

  // Detect multi-step workflow patterns (step counters, page numbers)
  sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach((varDecl) => {
    const name = varDecl.getName().toLowerCase();
    if (name.includes('step') || name.includes('page') || name.includes('stage') || name.includes('phase')) {
      const initializer = varDecl.getInitializer();
      if (initializer && Node.isCallExpression(initializer)) {
        const callText = initializer.getExpression().getText();
        if (callText === 'useState') {
          patterns.push({
            type: 'conditional',
            description: `Multi-step workflow state: ${varDecl.getName()}`,
            location: {
              file: sourceFile.getFilePath(),
              startLine: varDecl.getStartLineNumber(),
              endLine: varDecl.getEndLineNumber(),
            },
            code: varDecl.getText(),
            confidence: 0.8,
          });
        }
      }
    }
  });

  return patterns;
}
