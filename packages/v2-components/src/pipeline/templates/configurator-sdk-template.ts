/**
 * Configurator SDK Template Generator
 *
 * Generates code patterns for Configurator SDK integration per User Story 3.
 * Includes state management, error handling, and shadcn/ui component patterns.
 */

import type { ComponentMetadata } from '../../types/ast-analysis.js';

/**
 * Configurator SDK import structure
 */
export interface ConfiguratorImports {
  sdkImports: string[];
  uiImports: string[];
  reactImports: string[];
}

/**
 * State management pattern structure
 */
export interface StateManagementPattern {
  stateInterface: string;
  initialState: string;
  stateHooks: string[];
}

/**
 * T040: Generates import statements for Configurator SDK
 */
export function generateConfiguratorImports(metadata: ComponentMetadata): string[] {
  const imports: string[] = [];

  // Detect which SDK features are needed based on component patterns
  const needsState = metadata.hooks.some(h => h.name === 'useState');
  const needsEffect = metadata.hooks.some(h => h.name === 'useEffect');
  const hasAPICall = metadata.businessLogic.some(p => p.type === 'api-call');

  // Base SDK import
  imports.push("import { useConfigurator } from '@elevenlabs-ui/configurator-sdk';");

  // Add specific hooks based on usage
  if (hasAPICall) {
    imports.push("import { useConfiguratorAPI } from '@elevenlabs-ui/configurator-sdk';");
  }

  if (needsState || needsEffect) {
    imports.push("import { useConfiguratorState } from '@elevenlabs-ui/configurator-sdk';");
  }

  return imports;
}

/**
 * T041: Generates import statements for shadcn/ui components
 */
export function generateShadcnImports(metadata: ComponentMetadata): string[] {
  const imports: string[] = [];
  const uiComponents = new Set<string>();

  // Detect needed UI components based on patterns
  const hasValidation = metadata.businessLogic.some(p => p.type === 'validation');
  const hasAPICall = metadata.businessLogic.some(p => p.type === 'api-call');
  const hasError = hasAPICall || hasValidation;

  // Base components for most forms
  uiComponents.add('Button');
  uiComponents.add('Card');
  uiComponents.add('CardContent');
  uiComponents.add('CardHeader');
  uiComponents.add('CardTitle');

  // Form-related components
  if (metadata.props && metadata.props.length > 0) {
    uiComponents.add('Input');
    uiComponents.add('Label');
  }

  // Error/loading components
  if (hasError) {
    uiComponents.add('Alert');
    uiComponents.add('AlertDescription');
    uiComponents.add('AlertTitle');
  }

  if (hasAPICall) {
    uiComponents.add('Skeleton');
    uiComponents.add('useToast');
  }

  // Generate import statement
  const componentList = Array.from(uiComponents).sort().join(', ');
  imports.push(`import { ${componentList} } from '@/components/ui';`);

  return imports;
}

/**
 * T042: Generates state management pattern following Configurator conventions
 */
export function generateStateManagementPattern(metadata: ComponentMetadata): StateManagementPattern {
  const hasAPICall = metadata.businessLogic.some(p => p.type === 'api-call');

  // Define state interface based on component needs
  const stateFields: string[] = [];

  if (hasAPICall) {
    stateFields.push('  isLoading: boolean;');
    stateFields.push('  error: Error | null;');
    stateFields.push('  data: TData | null;');
  }

  // Add component-specific state fields from metadata
  if (metadata.props && metadata.props.length > 0) {
    metadata.props.forEach(prop => {
      if (prop.required && !['children', 'className', 'style'].includes(prop.name)) {
        stateFields.push(`  ${prop.name}: ${prop.type};`);
      }
    });
  }

  const stateInterface = `interface ${metadata.name}State {\n${stateFields.join('\n')}\n}`;

  // Generate initial state
  const initialStateFields: string[] = [];
  if (hasAPICall) {
    initialStateFields.push('  isLoading: false');
    initialStateFields.push('  error: null');
    initialStateFields.push('  data: null');
  }

  const initialState = `const initialState: ${metadata.name}State = {\n${initialStateFields.join(',\n')}\n};`;

  // Generate state hooks
  const stateHooks: string[] = [];

  if (hasAPICall) {
    stateHooks.push('const [isLoading, setIsLoading] = useState(false);');
    stateHooks.push('const [error, setError] = useState<Error | null>(null);');
    stateHooks.push('const [data, setData] = useState<TData | null>(null);');
  }

  return {
    stateInterface,
    initialState,
    stateHooks,
  };
}

/**
 * T043: Generates error boundary integration code
 */
export function generateErrorBoundaryIntegration(componentName: string): string {
  return `
/**
 * Error Boundary Wrapper for ${componentName}
 * 
 * WHY EXISTS: Catches React errors and prevents component crashes per User Story 3 acceptance #2
 * 
 * WHAT IT DOES:
 * - Wrap ${componentName} in ErrorBoundary
 * - Catch rendering errors
 * - Display fallback UI
 * - Log errors to monitoring service
 * 
 * WHAT IT CALLS:
 * - ErrorBoundary component from Configurator SDK
 * - Error logging service
 * 
 * DATA FLOW: Render attempt → Error caught → Log error → Display fallback
 * 
 * DEPENDENCIES:
 * - @elevenlabs-ui/configurator-sdk (ErrorBoundary)
 * - Error monitoring service
 */
export function ${componentName}WithErrorBoundary(props: ${componentName}Props) {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {error.message || 'An unexpected error occurred. Please try again.'}
          </AlertDescription>
        </Alert>
      )}
      onError={(error, errorInfo) => {
        console.error('${componentName} error:', error, errorInfo);
        // TODO: Send to monitoring service (e.g., Sentry)
      }}
    >
      <${componentName} {...props} />
    </ErrorBoundary>
  );
}
`.trim();
}

/**
 * T044: Generates loading state pattern with skeleton screens
 */
export function generateLoadingStatePattern(componentName: string): string {
  return `
/**
 * Loading State Pattern for ${componentName}
 * 
 * WHY EXISTS: Provides visual feedback during async operations per Configurator conventions
 * 
 * WHAT IT DOES:
 * - Display skeleton screen while loading
 * - Match skeleton structure to final UI
 * - Smooth transition to loaded state
 * 
 * WHAT IT CALLS:
 * - Skeleton component from shadcn/ui
 * 
 * DATA FLOW: Loading start → Display skeleton → Data loaded → Render content
 * 
 * DEPENDENCIES:
 * - @/components/ui (Skeleton)
 */
function ${componentName}Loading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  );
}
`.trim();
}

/**
 * T045: Generates error display pattern with appropriate shadcn/ui components
 */
export function generateErrorDisplayPattern(componentName: string): string {
  return `
/**
 * Error Display Pattern for ${componentName}
 * 
 * WHY EXISTS: Provides user-friendly error feedback per User Story 3 acceptance #3
 * 
 * WHAT IT DOES:
 * - IF validation error THEN display Alert (persistent)
 * - IF transient error (network) THEN display Toast (auto-dismiss)
 * - IF critical error (auth) THEN display Dialog (requires action)
 * - Include actionable error messages
 * 
 * WHAT IT CALLS:
 * - Alert, Toast, Dialog components from shadcn/ui
 * - Error message formatter
 * 
 * DATA FLOW: Error → Classify type → Select UI component → Display with context
 * 
 * DEPENDENCIES:
 * - @/components/ui (Alert, Toast, Dialog)
 * 
 * SPECIAL BEHAVIOR:
 * - Validation errors persist until user corrects input
 * - Network errors auto-dismiss after 5s with retry button
 * - Auth errors block interaction until resolved
 */
function ${componentName}Error({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  // Classify error type
  const isValidationError = error.message.includes('validation') || error.message.includes('invalid');
  const isNetworkError = error.message.includes('network') || error.message.includes('fetch');
  const isAuthError = error.message.includes('401') || error.message.includes('unauthorized');

  // Validation error: persistent Alert
  if (isValidationError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Validation Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  // Network error: Toast with retry
  if (isNetworkError) {
    const { toast } = useToast();
    toast({
      title: 'Connection Error',
      description: error.message,
      variant: 'destructive',
      action: onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      ) : undefined,
    });
    return null;
  }

  // Auth error: blocking Alert
  if (isAuthError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          {error.message}
          <Button variant="link" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Generic error: simple Alert
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}
`.trim();
}

/**
 * Generates complete Configurator SDK integration code
 */
export function generateConfiguratorIntegration(metadata: ComponentMetadata): {
  imports: string;
  stateManagement: string;
  errorBoundary: string;
  loadingState: string;
  errorDisplay: string;
} {
  const sdkImports = generateConfiguratorImports(metadata);
  const uiImports = generateShadcnImports(metadata);
  
  // Sort imports alphabetically for idempotent generation (NFR-010)
  const allImports = [...sdkImports, ...uiImports, "import { useState, useEffect } from 'react';"];
  const sortedImports = allImports.sort((a, b) => a.localeCompare(b));
  const imports = sortedImports.join('\n');

  const statePattern = generateStateManagementPattern(metadata);
  const stateManagement = `${statePattern.stateInterface}\n\n${statePattern.initialState}\n\n// Inside component:\n${statePattern.stateHooks.join('\n')}`;

  const errorBoundary = generateErrorBoundaryIntegration(metadata.name);
  const loadingState = generateLoadingStatePattern(metadata.name);
  const errorDisplay = generateErrorDisplayPattern(metadata.name);

  return {
    imports,
    stateManagement,
    errorBoundary,
    loadingState,
    errorDisplay,
  };
}
