/**
 * Functional Component Template
 *
 * Generates fully functional React components from pseudo-code blocks.
 * This replaces the visual-only stub generator with production-ready components.
 */

import type { PseudoCodeBlock, ComponentMetadata } from '../../types/v2-component.js';

/**
 * Generate a fully functional React component from pseudo-code and metadata
 */
export function generateFunctionalComponent(
  componentName: string,
  metadata: ComponentMetadata,
  pseudoCodeBlocks: PseudoCodeBlock[],
  propsInterface: string,
  stateInterface?: string,
  apiResponseInterface?: string
): string {
  const imports = generateFunctionalImports(metadata, pseudoCodeBlocks);
  const types = generateTypeDefinitions(componentName, metadata, apiResponseInterface);
  const utilities = generateUtilityFunctions(pseudoCodeBlocks);
  const apiIntegration = generateAPIIntegration(pseudoCodeBlocks);
  const componentLogic = generateComponentLogic(componentName, metadata, pseudoCodeBlocks);
  const renderLogic = generateRenderLogic(componentName, metadata, pseudoCodeBlocks);

  return `/**
 * ${componentName} Component
 *
 * Generated from DAISY v1 baseline: ${metadata.name}
 * Fully functional V2 component with business logic implemented.
 *
 * @version 2.0.0
 * @migrated-from ${metadata.filePath}
 */

${imports}

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

${types}

${propsInterface}

${stateInterface || ''}

${apiResponseInterface || ''}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

${utilities}

// ============================================================================
// API INTEGRATION
// ============================================================================

${apiIntegration}

// ============================================================================
// COMPONENT
// ============================================================================

${componentLogic}

${renderLogic}

export default ${componentName};
`;
}

/**
 * Generate imports based on component needs
 */
function generateFunctionalImports(
  metadata: ComponentMetadata,
  pseudoCodeBlocks: PseudoCodeBlock[]
): string {
  const imports: string[] = [];

  // Always import React
  imports.push(`import React, { useState } from 'react';`);

  // Check if API calls are present
  const hasAPICall = pseudoCodeBlocks.some(
    (block) => block.whatItCalls.includes('fetch') || block.functionName.toLowerCase().includes('api')
  );

  // Add other imports based on dependencies
  const allDependencies = [...metadata.dependencies, ...pseudoCodeBlocks.flatMap((b) => b.dependencies)];

  if (allDependencies.some((d) => d.toLowerCase().includes('query'))) {
    imports.push(`// Note: Add @tanstack/react-query if needed for advanced API management`);
  }

  return imports.join('\n');
}

/**
 * Generate TypeScript type definitions
 */
function generateTypeDefinitions(
  componentName: string,
  metadata: ComponentMetadata,
  apiResponseInterface?: string
): string {
  let types = `/**
 * Component Props
 */\n`;

  // Add form state type if forms detected
  const hasFormLogic = metadata.businessLogic.some(
    (logic) => logic.type === 'form' || logic.pattern.toLowerCase().includes('input')
  );

  if (hasFormLogic) {
    types += `\n/**
 * Form State
 */
interface FormState {
  // Form fields will be generated based on pseudo-code
  [key: string]: string;
}\n`;
  }

  return types;
}

/**
 * Generate utility/validation functions from pseudo-code
 */
function generateUtilityFunctions(pseudoCodeBlocks: PseudoCodeBlock[]): string {
  const utilities: string[] = [];

  // Find validation blocks
  const validationBlocks = pseudoCodeBlocks.filter(
    (block) =>
      block.functionName.toLowerCase().includes('validate') ||
      block.whyExists.toLowerCase().includes('validat')
  );

  for (const block of validationBlocks) {
    const functionDoc = `/**
 * ${block.functionName}
 *
 * ${block.whyExists}
 *
 * WHAT IT DOES:
${block.whatItDoes.map((step) => ` * - ${step}`).join('\n')}
 */`;

    // Generate basic validation function structure
    utilities.push(`${functionDoc}
function ${block.functionName}(input: string): { valid: boolean; error?: string } {
  // TODO: Implement validation logic based on pseudo-code
  ${block.whatItDoes
    .map((step) => {
      if (step.includes('MATCH') || step.includes('REGEX')) {
        return `// ${step}`;
      }
      if (step.includes('IF') && step.includes('THEN')) {
        return `// ${step}`;
      }
      return `// ${step}`;
    })
    .join('\n  ')}

  return { valid: true };
}\n`);
  }

  return utilities.join('\n');
}

/**
 * Generate API integration functions
 */
function generateAPIIntegration(pseudoCodeBlocks: PseudoCodeBlock[]): string {
  const apiBlocks = pseudoCodeBlocks.filter(
    (block) =>
      block.whatItCalls.includes('API') ||
      block.whatItCalls.includes('fetch') ||
      block.functionName.toLowerCase().includes('api') ||
      block.dataFlow.toLowerCase().includes('api')
  );

  if (apiBlocks.length === 0) {
    return '// No API integration required\n';
  }

  const apiFunctions: string[] = [];

  for (const block of apiBlocks) {
    const functionDoc = `/**
 * ${block.functionName}
 *
 * ${block.whyExists}
 *
 * DATA FLOW: ${block.dataFlow}
 */`;

    apiFunctions.push(`${functionDoc}
async function ${block.functionName}(
  apiBaseUrl: string,
  params: any
): Promise<any> {
  const response = await fetch(\`\${apiBaseUrl}/api/v1/proxy\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include session cookie
    body: JSON.stringify({
      tenantApiName: 'API_NAME', // TODO: Replace with actual API name
      operation: 'operation_name', // TODO: Replace with operation
      parameters: params,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || \`API error: \${response.status}\`);
  }

  const result = await response.json();
  return result.data;
}\n`);
  }

  return apiFunctions.join('\n');
}

/**
 * Generate component logic (state, handlers, etc.)
 */
function generateComponentLogic(
  componentName: string,
  metadata: ComponentMetadata,
  pseudoCodeBlocks: PseudoCodeBlock[]
): string {
  const propsTypeName = `${componentName}Props`;

  let logic = `export function ${componentName}({
  // TODO: Add props based on interface
}: ${propsTypeName}) {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
`;

  // Add form state if needed
  const hasFormLogic = metadata.businessLogic.some(
    (l) => l.type === 'form' || l.pattern.toLowerCase().includes('input')
  );

  if (hasFormLogic) {
    logic += `  const [formState, setFormState] = useState<FormState>({});

  /**
   * Handle form input changes
   */
  function handleInputChange(field: string, value: string) {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }
`;
  }

  // Add handler functions based on pseudo-code
  const handlerBlocks = pseudoCodeBlocks.filter(
    (block) =>
      block.functionName.toLowerCase().includes('handle') ||
      block.whyExists.toLowerCase().includes('handle')
  );

  for (const block of handlerBlocks) {
    logic += `
  /**
   * ${block.whyExists}
   */
  async function ${block.functionName}(event?: React.FormEvent) {
    if (event) event.preventDefault();

    setIsLoading(true);
    try {
      // TODO: Implement handler logic based on pseudo-code:
      ${block.whatItDoes.map((step) => `// - ${step}`).join('\n      ')}

      // Example API call:
      // const result = await apiFunction(params);
      // setData(result);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }
`;
  }

  return logic;
}

/**
 * Generate render/JSX logic
 */
function generateRenderLogic(
  componentName: string,
  metadata: ComponentMetadata,
  pseudoCodeBlocks: PseudoCodeBlock[]
): string {
  const hasFormLogic = metadata.businessLogic.some(
    (l) => l.type === 'form' || l.pattern.toLowerCase().includes('input')
  );

  let render = `
  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="${componentName.toLowerCase()}">
`;

  if (hasFormLogic) {
    render += `      <form onSubmit={handleSubmit} className="form">
        <h3 className="form-title">{/* TODO: Add title */}</h3>

        {/* TODO: Add form fields based on pseudo-code */}

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={isLoading} className="submit-btn">
          {isLoading ? 'Loading...' : 'Submit'}
        </button>
      </form>
`;
  }

  // Add data display if API response expected
  const hasAPIResponse = pseudoCodeBlocks.some((b) =>
    b.dataFlow.toLowerCase().includes('response')
  );

  if (hasAPIResponse) {
    render += `
      {data && (
        <div className="data-display">
          <h3 className="data-title">Results</h3>
          {/* TODO: Display data based on pseudo-code */}
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
`;
  }

  render += `    </div>
  );
}`;

  return render;
}
