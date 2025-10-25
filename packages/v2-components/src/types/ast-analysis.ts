/**
 * AST Analysis Types
 *
 * Types for analyzing TypeScript AST structures from DAISY v1 baselines.
 */

export interface ReactHookUsage {
  /** Hook name (useState, useEffect, etc.) */
  name: string;
  /** Variable names assigned from hook */
  variables: string[];
  /** Hook dependencies (for useEffect, useCallback, etc.) */
  dependencies?: string[];
  /** Initial value or function body */
  initializer?: string;
}

export interface PropDefinition {
  /** Property name */
  name: string;
  /** TypeScript type annotation */
  type: string;
  /** Whether property is required */
  required: boolean;
  /** Default value if any */
  defaultValue?: string;
  /** JSDoc comment describing the prop */
  description?: string;
}

export interface BusinessLogicPattern {
  /** Type of business logic (validation, transformation, conditional) */
  type: 'validation' | 'transformation' | 'conditional' | 'api-call' | 'state-transition';
  /** Description of what the logic does */
  description: string;
  /** Source code location */
  location: {
    file: string;
    startLine: number;
    endLine: number;
  };
  /** Extracted code snippet */
  code?: string;
  /** Confidence level (0-1) */
  confidence: number;
}

export interface ComponentMetadata {
  /** Component name */
  name: string;
  /** File path */
  filePath: string;
  /** Component type (function, class, hook) */
  componentType: 'function' | 'class' | 'hook';
  /** Props interface if detected */
  props?: PropDefinition[];
  /** React hooks used */
  hooks: ReactHookUsage[];
  /** Detected business logic patterns */
  businessLogic: BusinessLogicPattern[];
  /** External dependencies (imports) */
  dependencies: string[];
  /** Lines of code */
  loc: number;
  /** Complexity score (1-5) */
  complexity: number;
  /** Inline comments describing business logic */
  comments: string[];
}
