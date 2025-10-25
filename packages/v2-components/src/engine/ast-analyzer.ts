/**
 * AST Analyzer
 *
 * Parses DAISY v1 baselines using ts-morph to extract:
 * - React hook usage
 * - Props interface
 * - Component metadata
 * - Business logic patterns
 */

import {
  Project,
  SourceFile,
  SyntaxKind,
  Node,
  ArrayBindingPattern,
  BindingElement,
  ArrayLiteralExpression,
} from 'ts-morph';
import type {
  ComponentMetadata,
  ReactHookUsage,
  PropDefinition,
} from '../types/ast-analysis.js';
import {
  identifyBusinessLogicPatterns,
  detectExternalAPIs,
  preserveInlineComments,
} from '../utils/business-logic-analyzer.js';

/**
 * Analyzes a DAISY v1 baseline component
 */
export async function analyzeBaseline(filePath: string): Promise<ComponentMetadata> {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);

  const hooks = extractReactHooks(sourceFile);
  const props = extractPropInterface(sourceFile);
  const name = extractComponentName(sourceFile);
  const type = detectComponentType(sourceFile);
  const dependencies = extractDependencies(sourceFile);
  const comments = preserveInlineComments(sourceFile);
  const businessLogic = await identifyBusinessLogicPatterns(sourceFile);
  const apiCalls = detectExternalAPIs(sourceFile);

  return {
    name,
    filePath,
    ...(props ? { props } : {}),
    hooks,
    dependencies,
    businessLogic: [...businessLogic, ...apiCalls],
    comments,
    componentType: type,
    loc: sourceFile.getEndLineNumber(),
    complexity: calculateComplexity(sourceFile),
  };
}

/**
 * Extracts React hooks from source file
 */
function extractReactHooks(sourceFile: SourceFile): ReactHookUsage[] {
  const hooks: ReactHookUsage[] = [];
  const hookNames = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext'];

  sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
    const expression = call.getExpression().getText();

    if (hookNames.includes(expression)) {
      const parent = call.getParent();
      let variables: string[] = [];

      // Handle array destructuring for useState
      if (parent && Node.isVariableDeclaration(parent)) {
        const nameNode = parent.getNameNode();
        if (Node.isArrayBindingPattern(nameNode)) {
          (nameNode as ArrayBindingPattern).getElements().forEach((element) => {
            if (Node.isBindingElement(element)) {
              variables.push((element as BindingElement).getName());
            }
          });
        }
      }

      // Extract dependencies for hooks that take dependency arrays
      let dependencies: string[] = [];
      if (expression === 'useEffect' || expression === 'useCallback' || expression === 'useMemo') {
        const args = call.getArguments();
        const depsArg = args[1];
        if (depsArg && Node.isArrayLiteralExpression(depsArg)) {
          dependencies = (depsArg as ArrayLiteralExpression)
            .getElements()
            .map((el) => el.getText());
        }
      }

      const initializer = call.getArguments()[0]?.getText();

      hooks.push({
        name: expression,
        variables,
        dependencies,
        ...(initializer ? { initializer } : {}),
      });
    }
  });

  return hooks;
}

/**
 * Extracts Props interface from source file
 */
function extractPropInterface(sourceFile: SourceFile): PropDefinition[] | undefined {
  const propsInterface = sourceFile
    .getInterfaces()
    .find((iface) => iface.getName().endsWith('Props'));

  if (!propsInterface) {
    return undefined;
  }

  const props: PropDefinition[] = [];

  propsInterface.getProperties().forEach((prop) => {
    const name = prop.getName();
    const type = prop.getType().getText();
    const required = !prop.hasQuestionToken();
    const description = prop
      .getJsDocs()
      .map((doc) => doc.getDescription())
      .join(' ')
      .trim();

    props.push({
      name,
      type,
      required,
      ...(description ? { description } : {}),
    });
  });

  return props;
}

/**
 * Extracts component name
 */
function extractComponentName(sourceFile: SourceFile): string {
  // Try to get default export name
  const defaultExport = sourceFile.getDefaultExportSymbol();
  if (defaultExport) {
    const declarations = defaultExport.getDeclarations();
    if (declarations.length > 0) {
      const decl = declarations[0];
      if (
        Node.isFunctionDeclaration(decl) ||
        Node.isVariableDeclaration(decl) ||
        Node.isArrowFunction(decl)
      ) {
        const name = decl.getSymbol()?.getName();
        if (name && name !== 'default') {
          return name;
        }
      }
    }
  }

  // Fallback to filename
  const baseName = sourceFile.getBaseName();
  return baseName.replace(/\.(tsx?|jsx?)$/, '');
}

/**
 * Detects component type (function/class/hook)
 */
function detectComponentType(sourceFile: SourceFile): 'function' | 'class' | 'hook' {
  const defaultExport = sourceFile.getDefaultExportSymbol();

  if (defaultExport) {
    const declarations = defaultExport.getDeclarations();
    if (declarations.length > 0) {
      const decl = declarations[0];
      if (Node.isClassDeclaration(decl)) {
        return 'class';
      }
    }
  }

  // Check if it's a custom hook (starts with "use")
  const componentName = extractComponentName(sourceFile);
  if (componentName.startsWith('use')) {
    return 'hook';
  }

  return 'function';
}

/**
 * Extracts external dependencies
 */
function extractDependencies(sourceFile: SourceFile): string[] {
  const deps: Set<string> = new Set();

  sourceFile.getImportDeclarations().forEach((importDecl) => {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    // Only include npm packages (not relative imports)
    if (!moduleSpecifier.startsWith('.') && !moduleSpecifier.startsWith('/')) {
      deps.add(moduleSpecifier);
    }
  });

  return Array.from(deps);
}

/**
 * Calculates complexity score (1-5)
 */
function calculateComplexity(sourceFile: SourceFile): number {
  let score = 1;

  const conditionals = sourceFile.getDescendantsOfKind(SyntaxKind.IfStatement).length;
  const loops = [
    ...sourceFile.getDescendantsOfKind(SyntaxKind.ForStatement),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.WhileStatement),
  ].length;
  const functionCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).length;

  if (conditionals > 10 || loops > 5) score = 5;
  else if (conditionals > 7 || loops > 3) score = 4;
  else if (conditionals > 4 || loops > 1) score = 3;
  else if (conditionals > 1 || functionCalls > 20) score = 2;

  return score;
}
