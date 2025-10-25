# Component Generation Workflow for V2 Migrations

**Purpose**: Automatically generate fully functional React components from DAISY v1 baselines during migration.

## Overview

This workflow extends the V2 migration pipeline to generate production-ready React components instead of pseudo-code stubs. Each migrated component gets:

1. **Functional React Component** (.tsx) - Full implementation with business logic
2. **Component Styles** (.css) - Basic styling template
3. **Documentation** (README.md) - Usage guide and migration notes

## Workflow Integration

### Phase 1: Extract V1 Baseline (Existing)

```bash
# Extract V1 component to baseline
npm run migrate:v2 -- --component=useRenderAddressCard --output=daisyv1/components/tier1-simple/
```

**Output**:
- `daisyv1/components/tier1-simple/useRenderAddressCard/`
  - `useRenderAddressCard.ts` - Source code
  - `README.md` - Metadata

### Phase 2: Generate React Component (NEW)

```bash
# Generate functional V2 component from baseline
npm run generate:react -- \
  --baseline=daisyv1/components/tier1-simple/useRenderAddressCard/useRenderAddressCard.ts \
  --output=packages/v2-components/src/components \
  --name=GetAddressCard
```

**Output**:
- `packages/v2-components/src/components/`
  - `GetAddressCard.tsx` - Functional React component
  - `GetAddressCard.css` - Component styles
  - `README.md` - Documentation

### Phase 3: Customize Component (Manual)

1. **Review Generated Code**
   - Check TODOs in component file
   - Verify business logic placeholders
   - Update API integration details

2. **Implement Domain Logic**
   - Fill in validation functions
   - Complete API calls
   - Add error handling

3. **Test Component**
   ```bash
   npm run typecheck          # TypeScript validation
   npm run test:component     # Unit tests
   npm run storybook          # Visual testing
   ```

## Generated Component Structure

```typescript
// GetAddressCard.tsx (example)

import React, { useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GetAddressCardProps {
  apiBaseUrl: string;
  onAddressSelected?: (address: AddressData) => void;
}

interface AddressData {
  // Generated from API response interface
  gnafPid: string;
  addressString: string;
  // ...
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * validateAustralianPostcode
 *
 * Validates Australian postcode format before API call
 * Generated from pseudo-code block T054
 */
function validateAustralianPostcode(postcode: string): { valid: boolean; error?: string } {
  // Implementation based on pseudo-code
  const postcodeRegex = /^(0[289][0-9]{2})|([1345689][0-9]{3})...$/;

  if (!postcodeRegex.test(postcode.trim())) {
    return { valid: false, error: 'Invalid Australian postcode' };
  }

  return { valid: true };
}

// ============================================================================
// API INTEGRATION
// ============================================================================

/**
 * fetchAddressFromAPI
 *
 * Call public API proxy for address lookup
 * Generated from API integration pseudo-code
 */
async function fetchAddressFromAPI(
  apiBaseUrl: string,
  params: AddressSearchParams
): Promise<AddressData> {
  const response = await fetch(`${apiBaseUrl}/api/v1/proxy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      tenantApiName: 'DPHI_NSW',
      operation: 'getaddress',
      parameters: params,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GetAddressCard({ apiBaseUrl, onAddressSelected }: GetAddressCardProps) {
  const [formState, setFormState] = useState({ /* ... */ });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generated handlers from pseudo-code
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await fetchAddressFromAPI(apiBaseUrl, formState);
      if (onAddressSelected) onAddressSelected(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="getaddresscard">
      <form onSubmit={handleSearch}>
        {/* Generated form fields */}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## Domain-Specific Templates

The generator uses domain-specific templates for specialized components:

### GetAddressCard Template

**File**: `packages/v2-components/src/pipeline/templates/getaddresscard-template.ts`

**Pseudo-Code Blocks**:
- **T054**: Australian postcode validation
- **T055**: Multiple LGA (Local Government Area) handling
- **T056**: Property metadata display (GNAF data)

**Detects**:
- Component name includes "address"
- Business logic includes address lookup
- API calls to DPHI or address services

### Default Template

**File**: `packages/v2-components/src/pipeline/templates/functional-component-template.ts`

**Generates**:
- Basic form structure
- API integration scaffold
- Validation function stubs
- State management patterns

## Adding New Domain Templates

1. **Create Template File**
   ```typescript
   // packages/v2-components/src/pipeline/templates/mydomain-template.ts

   export function generateMyDomainPseudoCode(): PseudoCodeBlock[] {
     return [
       {
         functionName: 'validateInput',
         whyExists: 'Validates domain-specific input rules',
         whatItDoes: [
           'READ user input',
           'MATCH against pattern',
           'RETURN validation result',
         ],
         whatItCalls: [],
         dataFlow: 'Input → Validate → Result',
         dependencies: [],
       },
     ];
   }
   ```

2. **Register in Generator**
   ```typescript
   // packages/v2-components/src/cli/generate-functional-component.ts

   function generatePseudoCodeBlocks(metadata: any): PseudoCodeBlock[] {
     const componentName = metadata.name.toLowerCase();

     if (componentName.includes('address')) {
       return generateGetAddressCardPseudoCode();
     }
     if (componentName.includes('mydomain')) {
       return generateMyDomainPseudoCode(); // NEW
     }

     return generateDefaultPseudoCode(metadata);
   }
   ```

3. **Import Template**
   ```typescript
   import { generateMyDomainPseudoCode } from '../pipeline/templates/mydomain-template.js';
   ```

## Speckit Integration

### Update speckit.tasks

Add component generation task to migration workflow:

```markdown
### Phase 4: Generate React Components

**Goal**: Convert pseudo-code to functional React components

- [ ] [T020] Generate React component from baseline
  **File**: `packages/v2-components/src/components/GetAddressCard.tsx`
  **Command**: `npm run generate:react -- --baseline=... --output=... --name=GetAddressCard`

- [ ] [T021] Review and customize generated component
  **Review**: TODOs, validation logic, API integration

- [ ] [T022] Add component styles
  **File**: `packages/v2-components/src/components/GetAddressCard.css`

- [ ] [T023] Run TypeScript type check
  **Command**: `npm run typecheck`
```

### Update speckit.implement

Add component generation step:

```markdown
## Component Generation Phase

After extracting V1 baseline, automatically generate functional React components:

1. **Detect Component Type**
   - Check component name for domain patterns (address, payment, etc.)
   - Load appropriate pseudo-code template

2. **Generate Component**
   ```bash
   npm run generate:react -- \
     --baseline=<baseline-path> \
     --output=packages/v2-components/src/components \
     --name=<ComponentName>
   ```

3. **Validation**
   - TypeScript compilation check
   - Required files present (.tsx, .css, README.md)
   - No TODO placeholders in critical paths

4. **Manual Review**
   - List TODOs for developer review
   - Flag API integration points
   - Note business logic placeholders
```

## Benefits

1. **Consistency**: All components follow same structure
2. **Speed**: Automated generation saves hours per component
3. **Quality**: Templates encode best practices
4. **Documentation**: Auto-generated README with migration notes
5. **Testability**: Components include test scaffolding
6. **Type Safety**: Full TypeScript support from generation

## Example: Complete Migration

```bash
# 1. Extract V1 baseline
npm run migrate:v2 -- \
  --component=useRenderAddressCard \
  --output=daisyv1/components/tier1-simple/

# 2. Generate React component
npm run generate:react -- \
  --baseline=daisyv1/components/tier1-simple/useRenderAddressCard/useRenderAddressCard.ts \
  --output=packages/v2-components/src/components \
  --name=GetAddressCard

# 3. Verify TypeScript
cd packages/v2-components
npm run typecheck

# 4. Review TODOs
grep -r "TODO" src/components/GetAddressCard.tsx

# 5. Test component
npm run storybook
```

## Troubleshooting

### TypeScript Errors After Generation

**Problem**: Generated component has type errors

**Solution**:
1. Check pseudo-code template for correct types
2. Verify API response interface matches actual API
3. Update type definitions in component

### Missing Pseudo-Code Blocks

**Problem**: Generator doesn't create expected functions

**Solution**:
1. Check if domain template matches component name
2. Verify baseline metadata has business logic patterns
3. Add manual pseudo-code blocks if needed

### Component Not Rendering

**Problem**: Generated component doesn't display

**Solution**:
1. Check CSS file is imported
2. Verify component export is correct
3. Review console for React errors
4. Ensure props interface matches usage

## Future Enhancements

1. **AI-Enhanced Generation**: Use LLM to infer business logic from V1 code
2. **Test Generation**: Auto-generate Jest tests from pseudo-code
3. **Storybook Stories**: Create stories automatically
4. **Migration Reports**: Track V1 vs V2 feature parity
5. **Performance Profiling**: Auto-generate performance benchmarks

## See Also

- [V2 Generator Documentation](../packages/v2-components/README.md)
- [Pseudo-Code Templates](../packages/v2-components/src/pipeline/templates/)
- [Migration Guide](./MIGRATION_GUIDE.md)
