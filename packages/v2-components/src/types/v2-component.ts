/**
 * V2 Component Types
 *
 * Types for generated Configurator V2 components.
 */

/**
 * Pseudo-code block with 6 constitutional fields
 */
export interface PseudoCodeBlock {
  /** Function or section this documents */
  functionName: string;
  /** WHY EXISTS: Purpose and rationale */
  whyExists: string;
  /** WHAT DOES: Bullet points of actions */
  whatItDoes: string[];
  /** WHAT CALLS: Functions invoked */
  whatItCalls: string[];
  /** DATA FLOW: Input → Processing → Output */
  dataFlow: string;
  /** DEPENDENCIES: External utilities/libraries */
  dependencies: string[];
  /** SPECIAL BEHAVIOR: Edge cases and non-obvious logic */
  specialBehavior?: string;
}

/**
 * Generated V2 component
 */
export interface V2Component {
  /** Component name (PascalCase) */
  name: string;
  /** Output file path */
  filePath: string;
  /** Generated TypeScript source code */
  sourceCode: string;
  /** Props interface TypeScript code */
  propsInterface: string;
  /** State interface TypeScript code (if needed) */
  stateInterface?: string;
  /** API Response interface TypeScript code (if needed) */
  apiResponseInterface?: string;
  /** Generated pseudo-code blocks */
  pseudoCodeBlocks: PseudoCodeBlock[];
  /** Generated test file content */
  testScaffold?: string;
  /** Generated README content */
  readme: string;
  /** TypeScript compilation status */
  compilationStatus: 'pending' | 'success' | 'error';
  /** Compilation errors if any */
  compilationErrors?: string[];
}

/**
 * Options for component generation
 */
export interface GenerationOptions {
  /** Baseline component file path */
  baselinePath: string;
  /** Output directory for V2 components */
  outputPath: string;
  /** Component name override (optional) */
  componentName?: string;
  /** Preview generation without creating files */
  dryRun?: boolean;
  /** Skip test file generation */
  skipTests?: boolean;
  /** Enable verbose logging */
  verbose?: boolean;
}

/**
 * Generation result
 */
export interface GenerationResult {
  /** Whether generation succeeded */
  success: boolean;
  /** Generated component (if successful) */
  component?: V2Component;
  /** Error message (if failed) */
  error?: string;
  /** Detailed error information */
  errorDetails?: {
    phase: 'analysis' | 'generation' | 'compilation' | 'validation';
    message: string;
    stack?: string;
  };
}
