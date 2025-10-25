# Phase 0: Research & Technical Decisions

**Feature**: 004-v2-getaddress-component  
**Generated**: 2025-10-24  
**Status**: Complete

## Research Tasks

### 1. Output Location Resolution (Clarification #1)

**Question**: Should V2 components be generated in `packages/v2-components/` or `src/components/`?

**Research Approach**:

- Analyzed existing project structure from 001-component-extraction-pipeline
- Reviewed Constitution Principle I (Component Independence) and II (Architecture Migration Protocol)
- Evaluated import path complexity and build configuration impact

**Decision**: `packages/v2-components/src/`

**Rationale**:

1. **Isolation during migration**: Separating V2 components into dedicated package prevents mixing with existing pipeline source code
2. **NPM packaging**: Constitution requires V2 components be "packaged as NPM components" - dedicated package directory aligns with this requirement
3. **Build independence**: Separate `tsconfig.json` for V2 components prevents build conflicts with CLI tooling
4. **Import clarity**: `@daisy/v2-components/GetAddressCard` vs `@daisy/pipeline/components/GetAddressCard` - former is clearer for component library consumers
5. **Scalability**: When migrating 170 components, isolated package structure prevents source tree pollution

**Alternatives Considered**:

- `src/components/`: Rejected - mixes component library output with pipeline tooling, violates separation of concerns
- Root `components/`: Rejected - conflicts with existing component discovery logic in pipeline
- `output/v2-components/`: Rejected - "output" directory suggests temporary artifacts, not production code

**Implementation Impact**:

- Create `packages/v2-components/package.json` with `@daisy/v2-components` package name
- Add `packages/v2-components/tsconfig.json` extending root tsconfig with React JSX settings
- Update v2-generator.ts to write to `packages/v2-components/src/components/{ComponentName}/`
- Add `packages/v2-components/` to root tsconfig `references` for project references

---

### 2. Pseudo-Code Format Resolution (Clarification #2)

**Question**: JSDoc-style block comments, inline comments, or separate `.pseudo.md` sidecar files?

**Research Approach**:

- Analyzed developer workflow for implementing components from generated pseudo-code
- Evaluated IDE integration capabilities (VS Code, WebStorm)
- Reviewed Constitution Principle IV (Documentation-Driven Development)
- Tested readability in each format using GetAddressCard example

**Decision**: JSDoc block comments above each function/section

**Rationale**:

1. **IDE integration**: JSDoc comments appear in hover tooltips and IntelliSense, providing context during implementation
2. **Co-location**: Business logic documentation lives with code, not in separate file requiring context switching
3. **Tooling support**: JSDoc parsers can extract documentation for generated API reference
4. **Standard practice**: React/TypeScript ecosystem heavily uses JSDoc for component documentation
5. **Maintainability**: Single file to update when pseudo-code needs refinement during implementation

**Format Example**:

```typescript
/**
 * BUSINESS LOGIC: Address Validation
 *
 * WHY THIS EXISTS:
 * UK postcodes must be validated before sending to DPHI API to reduce
 * unnecessary API calls and provide immediate user feedback.
 *
 * WHAT IT DOES:
 * - Validates postcode format using UK postcode regex pattern
 * - Normalizes postcode (uppercase, remove extra spaces)
 * - Returns validation result with error message if invalid
 *
 * WHAT IT CALLS:
 * - validateUKPostcode() from @/utils/validation
 * - normalizePostcode() from @/utils/formatting
 *
 * WHY IT CALLS THEM:
 * - validateUKPostcode: Centralized regex validation prevents duplicating
 *   complex UK postcode rules across components
 * - normalizePostcode: API expects uppercase without extra spaces
 *
 * DATA FLOW:
 * User input (string) → Validation → Normalization → Return {valid, normalized, error}
 *
 * DEPENDENCIES:
 * - @/utils/validation (shared utility)
 * - UK postcode regex pattern (from DAISY v1 baseline)
 *
 * SPECIAL BEHAVIOR:
 * - Empty string is valid (allows clearing input)
 * - Partial postcodes (e.g., "SW1") are invalid (must be complete)
 */
function validateAddressInput(input: string): ValidationResult {
  // Implementation will be added here
}
```

**Alternatives Considered**:

- **Inline comments**: Rejected - too verbose for complex logic, disrupts code readability
- **Sidecar `.pseudo.md` files**: Rejected - requires separate file management, no IDE integration, context switching overhead
- **README-only documentation**: Rejected - too far from implementation site, won't be consulted during coding

**Implementation Impact**:

- v2-generator.ts must parse baseline business logic into structured JSDoc format
- Template for JSDoc pseudo-code blocks: `/** BUSINESS LOGIC: {purpose} ... */`
- Minimum 15 statements per component (SC-003) distributed across JSDoc blocks
- Test validation: Parse JSDoc blocks, count non-empty lines excluding markers

---

### 3. Business Logic Extraction Depth Resolution (Clarification #3)

**Question**: High-level flow or detailed parsing (conditionals, regex, state dependencies)?

**Research Approach**:

- Analyzed GetAddressCard baseline complexity: 150 lines with validation, API calls, state management
- Reviewed Constitution Principle VI (Test Accuracy & Business Logic Validation)
- Evaluated AST parsing capabilities of existing ts-morph infrastructure
- Estimated development effort: deep parsing = 40+ hours, high-level = 10-15 hours

**Decision**: High-level flow + explicit validation rules (defer detailed logic parsing to Phase 2)

**Rationale**:

1. **MVP validation**: High-level pseudo-code sufficient to test if developers can implement in 4 hours (SC-005)
2. **Constitution compliance**: Principle VI requires "semantic function analysis" - high-level captures function purposes, not implementation minutiae
3. **Development velocity**: GetAddressCard as proof-of-concept must validate approach quickly before committing to deep parsing investment
4. **Incremental complexity**: Can add detailed parsing in future iterations based on developer feedback
5. **Test fixture quality**: Constitution requires comprehensive documentation - high-level flow meets this while detailed parsing risks analysis paralysis

**Scope for Phase 1**:

**INCLUDE**:

- Function purposes and call graph (what functions call what)
- Validation rules (regex patterns, required fields, format requirements)
- API integration points (endpoint, payload structure, error handling)
- State transitions (loading → success → error)
- Data transformations (input → normalized → API format → display format)
- Conditional rendering logic (if address valid, show results)

**EXCLUDE (defer to Phase 2)**:

- Line-by-line code translation
- Complex conditional logic trees (nested if/else with >3 levels)
- Loop unrolling and iteration patterns
- Helper function implementation details
- Performance optimization strategies (memoization, debouncing)

**Example - High-Level Flow**:

```typescript
/**
 * BUSINESS LOGIC: GetAddressCard Main Flow
 *
 * 1. User enters address in input field
 *    → Validate UK postcode format (regex: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i)
 *    → If invalid: Show inline error "Please enter a valid UK postcode"
 *
 * 2. User clicks "Search" button
 *    → Set loading state (disable button, show spinner)
 *    → Call FastAPI proxy: POST /api/v1/proxy
 *       Payload: { tenantApiName: "DPHI", operation: "getaddress", parameters: { address: normalizedPostcode } }
 *
 * 3. Handle API response
 *    → 200 Success: Extract address data, display in card format (address lines, UPRN, council name)
 *    → 429 Rate Limit: Extract Retry-After header, show "Too many requests, try again in {seconds}s"
 *    → 401 Unauthorized: Show "Session expired, please log in again"
 *    → Other errors: Show generic "Unable to fetch address, please try again"
 *
 * 4. User can clear results and search again
 *    → Reset button clears address input and results
 *    → New search repeats flow from step 1
 */
```

**Alternatives Considered**:

- **Minimal (function names only)**: Rejected - insufficient for 4-hour implementation target (SC-005)
- **Detailed (line-by-line translation)**: Rejected - excessive effort for proof-of-concept, risks over-engineering
- **Hybrid (detailed for tier-1, high-level for tier-3)**: Rejected - inconsistent developer experience, complex to test

**Implementation Impact**:

- business-logic-analyzer.ts will use AST traversal to identify:
  - Function declarations and calls
  - Conditional statements (if/switch)
  - API call patterns (fetch/axios)
  - State setter calls (setState, useState)
  - Validation patterns (regex, type guards)
- Generate JSDoc pseudo-code from extracted patterns using templates
- Test coverage: Validate pseudo-code includes ≥15 statements (SC-003), covers sequence 2 integration points (SC-004)

---

## Technology Best Practices

### Configurator SDK v2.1.0+ Integration

**Research Source**: Reviewed sequence 2 architecture, shadcn/ui patterns, React 18+ hooks

**Best Practices**:

1. **State Management**:
   - Use `useState` for component-local state (address input, loading, error)
   - Use `useEffect` for side effects (API calls, validation)
   - Avoid Redux/Zustand for single-component state (violates Component Independence)

2. **Error Handling**:
   - Use shadcn/ui Alert component for validation errors
   - Use Toast component for transient errors (rate limiting)
   - Implement error boundary for API failures

3. **API Integration**:
   - Use native `fetch` with async/await (no axios dependency)
   - Implement retry logic for 429 errors with exponential backoff
   - Use session cookie automatically (no manual auth header)

4. **Type Safety**:
   - Define Props interface for component inputs
   - Define State interface for internal state
   - Define APIResponse interface for DPHI response structure
   - Use discriminated unions for loading/success/error states

**Code Pattern**:

```typescript
interface GetAddressCardProps {
  onAddressSelected?: (address: AddressData) => void;
  defaultValue?: string;
}

type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: AddressData }
  | { status: 'error'; error: string };

export const GetAddressCard: React.FC<GetAddressCardProps> = ({ ... }) => {
  const [input, setInput] = useState('');
  const [state, setState] = useState<RequestState>({ status: 'idle' });
  // Implementation with pseudo-code
};
```

---

### TypeScript AST Analysis for Business Logic Extraction

**Research Source**: Analyzed existing analyzer.ts patterns, ts-morph documentation

**Best Practices**:

1. **Function Analysis**:
   - Use `ts-morph` SourceFile.getFunctions() to enumerate functions
   - Extract JSDoc comments if present in baseline
   - Identify function calls using CallExpression traversal
   - Build call graph to understand dependencies

2. **Pattern Detection**:
   - Validation: Detect regex literals, type guards, conditional returns
   - API Calls: Detect fetch/axios patterns, extract URL and payload
   - State Management: Detect useState/setState patterns
   - Error Handling: Detect try/catch, error state updates

3. **Pseudo-Code Generation**:
   - Use template system for consistent JSDoc format
   - Extract variable names and preserve semantic meaning
   - Annotate extracted patterns with WHAT/WHY/HOW sections
   - Include references to sequence 2 architecture where applicable

**Implementation Approach**:

```typescript
// business-logic-analyzer.ts (new file)
export class BusinessLogicAnalyzer {
  analyzeFunctionPurpose(func: FunctionDeclaration): BusinessLogicPurpose {
    // Detect validation patterns
    if (this.hasRegexValidation(func)) {
      return { type: 'validation', patterns: this.extractRegexPatterns(func) };
    }
    // Detect API call patterns
    if (this.hasAPICall(func)) {
      return { type: 'api-integration', endpoint: this.extractEndpoint(func) };
    }
    // Detect state management
    if (this.hasStateUpdate(func)) {
      return { type: 'state-management', stateVars: this.extractStateVars(func) };
    }
  }

  generatePseudoCode(purpose: BusinessLogicPurpose): string {
    // Use template based on purpose.type
    return this.renderTemplate(purpose);
  }
}
```

---

## Decisions Summary

| Decision | Choice | Impact |
|----------|--------|--------|
| **Output Location** | `packages/v2-components/src/` | Create new package, isolated build, NPM-ready |
| **Pseudo-Code Format** | JSDoc block comments | IDE integration, co-located with code |
| **Extraction Depth** | High-level flow + validation rules | 10-15 hour implementation, sufficient for SC-005 |
| **State Management** | React hooks (useState, useEffect) | No external dependencies, standard patterns |
| **API Integration** | Native fetch with async/await | No axios, session cookie auto-included |
| **Type Safety** | Discriminated unions for state | Exhaustive checking, no runtime errors |

All clarifications resolved. Ready for Phase 1: Design & Contracts.
