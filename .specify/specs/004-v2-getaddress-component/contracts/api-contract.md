# V2 Component Generation API Contract

**Feature**: 004-v2-getaddress-component  
**Version**: 1.0.0  
**Generated**: 2025-10-24

## Overview

This contract defines the programmatic interface for generating Configurator V2 components from DAISY v1 baselines. The API is exposed through CLI commands and TypeScript modules.

---

## CLI Interface

### Command: `npm run migrate:v2`

**Purpose**: Generate V2 component from extracted baseline

**Syntax**:

```bash
npm run migrate:v2 -- --component=<ComponentName> [OPTIONS]
```

**Required Arguments**:

| Argument | Type | Description | Example |
|----------|------|-------------|---------|
| `--component` | string | Component name (PascalCase) | `--component=GetAddressCard` |

**Optional Arguments**:

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `--dry-run` | boolean | false | Preview generation without writing files |
| `--output` | string | `packages/v2-components/src/` | Override output directory |
| `--skip-tests` | boolean | false | Skip test scaffold generation |
| `--verbose` | boolean | false | Enable detailed logging |

**Exit Codes**:

| Code | Meaning | Example Scenario |
|------|---------|------------------|
| 0 | Success | Component generated and compiled successfully |
| 1 | Validation Error | Component name invalid or baseline not found |
| 2 | Compilation Error | Generated TypeScript code has type errors |
| 3 | Business Logic Error | Insufficient business logic extracted (<15 statements) |
| 4 | File System Error | Output directory not writable |

**Example Usage**:

```bash
# Standard generation
npm run migrate:v2 -- --component=GetAddressCard

# Dry run to preview
npm run migrate:v2 -- --component=GetAddressCard --dry-run

# Generate with verbose logging
npm run migrate:v2 -- --component=GetAddressCard --verbose

# Skip test generation
npm run migrate:v2 -- --component=GetAddressCard --skip-tests
```

**Output**:

```json
{
  "success": true,
  "component": "GetAddressCard",
  "outputPath": "/Users/.../packages/v2-components/src/components/GetAddressCard/GetAddressCard.tsx",
  "compilationStatus": "success",
  "pseudoCodeStatements": 18,
  "generationTimeMs": 2847,
  "filesGenerated": [
    "GetAddressCard.tsx",
    "GetAddressCard.types.ts",
    "README.md",
    "__tests__/GetAddressCard.test.tsx"
  ]
}
```

---

## TypeScript Module Interface

### Module: `src/pipeline/generators/v2-generator.ts`

#### Interface: `V2GeneratorOptions`

```typescript
interface V2GeneratorOptions {
  /** Component name in PascalCase */
  componentName: string;

  /** Absolute path to DAISY v1 baseline directory */
  baselinePath: string;

  /** Output directory for generated component */
  outputDir?: string; // Default: 'packages/v2-components/src/components'

  /** Whether to skip test scaffold generation */
  skipTests?: boolean; // Default: false

  /** Dry run mode - return generated code without writing files */
  dryRun?: boolean; // Default: false
}
```

#### Interface: `V2GenerationResult`

```typescript
interface V2GenerationResult {
  /** Generation success status */
  success: boolean;

  /** Component name */
  componentName: string;

  /** Absolute path to generated component file */
  outputPath?: string;

  /** Generated TypeScript source code */
  sourceCode?: string;

  /** TypeScript compilation status */
  compilationStatus: 'pending' | 'success' | 'error';

  /** TypeScript compilation errors if any */
  compilationErrors?: string[];

  /** Number of pseudo-code statements generated */
  pseudoCodeStatements?: number;

  /** Generation time in milliseconds */
  generationTimeMs: number;

  /** List of generated file paths */
  filesGenerated?: string[];

  /** Error message if generation failed */
  error?: string;
}
```

#### Function: `generateV2Component`

```typescript
/**
 * Generate Configurator V2 component from DAISY v1 baseline
 *
 * @param options - Generation options
 * @returns Promise resolving to generation result
 * @throws {ValidationError} If component name or baseline path invalid
 * @throws {GenerationError} If AST parsing or code generation fails
 * @throws {CompilationError} If generated code has TypeScript errors
 */
export async function generateV2Component(
  options: V2GeneratorOptions
): Promise<V2GenerationResult>;
```

**Example Usage**:

```typescript
import { generateV2Component } from '@/pipeline/generators/v2-generator';

const result = await generateV2Component({
  componentName: 'GetAddressCard',
  baselinePath: '/path/to/daisyv1/components/tier1-simple/useRenderAddressCard',
  dryRun: false,
});

if (result.success) {
  console.log(`Generated ${result.componentName} at ${result.outputPath}`);
  console.log(`Pseudo-code statements: ${result.pseudoCodeStatements}`);
} else {
  console.error(`Generation failed: ${result.error}`);
}
```

---

## Business Logic Analyzer Interface

### Module: `src/utils/business-logic-analyzer.ts`

#### Interface: `BusinessLogicPattern`

```typescript
interface BusinessLogicPattern {
  /** Unique pattern identifier */
  patternId: string;

  /** Pattern category */
  patternType: 'validation' | 'api-call' | 'state-mgmt' | 'transform' | 'render';

  /** High-level purpose */
  purpose: string;

  /** When this logic executes */
  triggerCondition?: string;

  /** Functions called in this pattern */
  functionsCalled: string[];

  /** Data flow description */
  dataFlow: string;

  /** External dependencies */
  dependencies: string[];

  /** Special behavior notes */
  specialBehavior?: string;
}
```

#### Interface: `PseudoCodeBlock`

```typescript
interface PseudoCodeBlock {
  /** Unique block identifier */
  blockId: string;

  /** Function this documents */
  functionName: string;

  /** WHY THIS EXISTS explanation */
  purpose: string;

  /** WHAT IT DOES bullet points */
  whatItDoes: string[];

  /** WHAT IT CALLS function names */
  whatItCalls: string[];

  /** WHY IT CALLS THEM explanations */
  whyItCallsThem: string[];

  /** DATA FLOW description */
  dataFlow: string;

  /** DEPENDENCIES list */
  dependencies: string[];

  /** SPECIAL BEHAVIOR notes */
  specialBehavior?: string;
}
```

#### Class: `BusinessLogicAnalyzer`

```typescript
export class BusinessLogicAnalyzer {
  /**
   * Analyze DAISY v1 baseline to extract business logic patterns
   *
   * @param baselinePath - Absolute path to baseline component
   * @returns Array of extracted business logic patterns
   * @throws {ParseError} If baseline cannot be parsed
   */
  async analyzeBaseline(baselinePath: string): Promise<BusinessLogicPattern[]>;

  /**
   * Generate pseudo-code JSDoc blocks from business logic patterns
   *
   * @param patterns - Extracted business logic patterns
   * @returns Array of pseudo-code blocks
   */
  generatePseudoCode(patterns: BusinessLogicPattern[]): PseudoCodeBlock[];

  /**
   * Validate pseudo-code meets success criteria
   *
   * @param pseudoCode - Generated pseudo-code blocks
   * @returns Validation result with statement count and coverage
   */
  validatePseudoCode(pseudoCode: PseudoCodeBlock[]): {
    isValid: boolean;
    statementCount: number;
    hasSequence2Coverage: boolean;
    missingCoverage: string[];
  };
}
```

---

## Generated Component Structure

### File: `GetAddressCard.tsx`

**Structure**:

```typescript
/**
 * COMPONENT: GetAddressCard
 *
 * Migrated from DAISY v1 useRenderAddressCard hook
 * Reference baseline: daisyv1/components/tier1-simple/useRenderAddressCard
 *
 * @see README.md for usage examples
 * @see GetAddressCard.types.ts for type definitions
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import type { GetAddressCardProps, AddressData, RequestState } from './GetAddressCard.types';

/**
 * BUSINESS LOGIC: {Purpose}
 *
 * WHY THIS EXISTS: {Explanation}
 * WHAT IT DOES: {Bullet points}
 * WHAT IT CALLS: {Function names}
 * WHY IT CALLS THEM: {Explanations}
 * DATA FLOW: {Input → Processing → Output}
 * DEPENDENCIES: {External utilities}
 * SPECIAL BEHAVIOR: {Edge cases}
 */
function businessLogicFunction() {
  // Implementation placeholder
}

export const GetAddressCard: React.FC<GetAddressCardProps> = (props) => {
  // Component implementation with pseudo-code
  return <div>{/* JSX */}</div>;
};

GetAddressCard.displayName = 'GetAddressCard';
```

### File: `GetAddressCard.types.ts`

**Structure**:

```typescript
/**
 * Type definitions for GetAddressCard component
 */

export interface GetAddressCardProps {
  /** Callback when address is selected */
  onAddressSelected?: (address: AddressData) => void;

  /** Default address value */
  defaultValue?: string;

  /** Whether component is disabled */
  disabled?: boolean;
}

export interface AddressData {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  uprn: string;
  councilName: string;
}

export type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: AddressData }
  | { status: 'error'; error: string };
```

### File: `README.md`

**Structure**:

```markdown
# GetAddressCard

Configurator V2 component for address lookup and validation.

## Purpose

Allows users to search for UK addresses using postcode and displays property information from DPHI API.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onAddressSelected | (address: AddressData) => void | No | Callback when address selected |
| defaultValue | string | No | Default postcode value |
| disabled | boolean | No | Whether component is disabled |

## Usage Example

\`\`\`tsx
import { GetAddressCard } from '@daisy/v2-components/GetAddressCard';

function MyPage() {
  const handleAddress = (address) => {
    console.log('Selected:', address);
  };

  return <GetAddressCard onAddressSelected={handleAddress} />;
}
\`\`\`

## API Dependencies

- **DPHI API** via Public API proxy (`/api/v1/proxy`)
- Authentication: Session cookie (automatic)

## Migration Notes from DAISY v1

- Original hook: `useRenderAddressCard`
- Business logic preserved in pseudo-code
- State management migrated to React hooks
- UI components use shadcn/ui replacements
```

---

## Success Criteria Validation

### Endpoint: `/validate-generation`

**Purpose**: Internal validation endpoint for testing success criteria

**Request**:

```typescript
interface ValidationRequest {
  componentName: string;
  outputPath: string;
}
```

**Response**:

```typescript
interface ValidationResponse {
  success: boolean;
  criteria: {
    SC001_GenerationTime: { passed: boolean; actualMs: number; targetMs: 30000 };
    SC002_Compilation: { passed: boolean; errors: number };
    SC003_StatementCount: { passed: boolean; actual: number; target: 15 };
    SC004_Sequence2Coverage: { passed: boolean; missingPoints: string[] };
    SC005_ImplementationTime: { passed: boolean; estimatedHours: number };
    SC006_READMELength: { passed: boolean; wordCount: number; target: 500 };
  };
  overallPassed: boolean;
}
```

---

## Error Handling

### Error Types

```typescript
class ValidationError extends Error {
  constructor(
    public field: string,
    public value: unknown,
    public constraint: string
  ) {
    super(`Validation failed for ${field}: ${constraint}`);
  }
}

class GenerationError extends Error {
  constructor(
    public phase: 'parsing' | 'analysis' | 'generation' | 'compilation',
    public details: string
  ) {
    super(`Generation failed during ${phase}: ${details}`);
  }
}

class CompilationError extends Error {
  constructor(public errors: string[]) {
    super(`TypeScript compilation failed with ${errors.length} errors`);
  }
}
```

### Error Responses

All API functions return structured errors:

```typescript
{
  success: false,
  error: string,
  errorType: 'validation' | 'generation' | 'compilation' | 'filesystem',
  details: Record<string, unknown>
}
```

---

Contract complete. Ready for quickstart.md generation.
