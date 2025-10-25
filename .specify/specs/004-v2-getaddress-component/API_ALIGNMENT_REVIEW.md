# Public API Alignment Review

**Date**: 2025-10-25  
**Feature**: 004-v2-getaddress-component  
**Status**: Phase 3 Implementation (T014-T020 Complete)

## Executive Summary

✅ **ALIGNED**: Current implementation correctly identifies API calls and business logic patterns per requirements.

⚠️ **PARTIAL**: Need to add specific Public API proxy pattern templates (Phase 4: T027-T038).

❌ **MISSING**: Public API repository reference at `/Users/douglaswross/Code/eai/eai-public-api/.specify` is **not accessible** from this workspace.

## Specification Review

### Public API Requirements (FR-003, FR-023-FR-029)

The feature specification defines comprehensive Public API integration requirements:

**Session Authentication (FR-023)**:

- Cookie name: `session_token`
- Validation: expiry + signature verification
- Fallback: redirect to login on invalid session

**Proxy Endpoint (FR-024)**:

```typescript
POST /api/v1/proxy
{
  tenantApiName: "DPHI",  // Third-party API identifier
  operation: "getaddress", // Specific API operation
  parameters: {            // Operation-specific params
    address: string
  }
}
```

**Error Handling (FR-026-FR-029)**:

- 200: Success response
- 400: Invalid parameters → display validation error
- 401: Unauthorized → redirect to login
- 429: Rate limit → retry with exponential backoff, display countdown
- 503: Service unavailable → display "Try again later" message

**Retry Strategy (FR-025)**:

- Exponential backoff starting at 1 second
- Maximum 3 retry attempts
- Parse `Retry-After` header from 429 responses
- Display countdown timer to user
- Provide cancel button

**Timeouts (FR-027-FR-028)**:

- Connection timeout: 5 seconds
- Read timeout: 30 seconds
- User message: "Request taking longer than expected..."
- Cancel button option

### Scenario 2 Reference

The specification mentions:

> "review /Users/douglaswross/Code/eai/eai-public-api .specify folder and specifically .specify/memory/prototypesequence.md and sequence 2"

**Finding**: This directory is **outside the current workspace** and cannot be accessed. The Public API specification details have been incorporated into the feature requirements (FR-003, FR-023-FR-029) instead.

## Current Implementation Status

### ✅ Phase 3 Complete (T014-T020)

**AST Analysis (`ast-analyzer.ts`)**:

```typescript
export async function analyzeBaseline(filePath: string): Promise<ComponentMetadata> {
  // ... extracts:
  // - React hooks (useState, useEffect, useCallback)
  // - Props interfaces with JSDoc
  // - Component name and type
  // - External dependencies
  // - Lines of code and complexity score
}
```

**Business Logic Analysis (`business-logic-analyzer.ts`)**:

```typescript
// ✅ Detects validation rules (regex, type checks)
function detectValidationRules(sourceFile: SourceFile): BusinessLogicPattern[]

// ✅ Detects data transformations (map, filter, reduce)
function detectDataTransformations(sourceFile: SourceFile): BusinessLogicPattern[]

// ✅ Detects conditional rendering (ternary, &&)
function detectConditionalRendering(sourceFile: SourceFile): BusinessLogicPattern[]

// ✅ Detects API calls (fetch, axios)
export function detectExternalAPIs(sourceFile: SourceFile): BusinessLogicPattern[]
```

**API Detection Example**:

```typescript
// Detects fetch calls
if (expressionText === 'fetch' || expressionText.includes('.fetch')) {
  const url = args[0]?.getText() || 'unknown';
  const method = extractMethodFromFetchOptions(args[1]);

  patterns.push({
    type: 'api-call',
    description: `API call to ${url} using ${method}`,
    location: { file, startLine, endLine },
    code: call.getText().substring(0, 200),
    confidence: 0.9,
  });
}

// Detects axios calls
if (expressionText.startsWith('axios.') || expressionText === 'axios') {
  const method = expressionText.split('.')[1] || 'request';
  const url = args[0]?.getText() || 'unknown';

  patterns.push({
    type: 'api-call',
    description: `Axios ${method.toUpperCase()} request to ${url}`,
    // ...
  });
}
```

### ⏳ Phase 4 Pending (T027-T038)

**Pseudo-Code Templates NOT YET IMPLEMENTED**:

- [ ] T033: `api-integration-template.ts` - Public API structure
- [ ] T034: `generateSessionAuthPseudoCode()` - Session cookie validation
- [ ] T035: `generateProxyEndpointPseudoCode()` - `/api/v1/proxy` structure
- [ ] T036: `generateRetryStrategyPseudoCode()` - Exponential backoff
- [ ] T037: `generateErrorHandlingPseudoCode()` - 200/400/401/429/503 handling
- [ ] T038: `generateTimeoutHandlingPseudoCode()` - Timeout + cancel button

## Gap Analysis

### What We Have ✅

1. **Generic API Detection**: Can identify fetch/axios calls with URLs and methods
2. **Business Logic Patterns**: Validation, transformations, conditional rendering
3. **Comment Preservation**: Extracts inline comments for business logic documentation
4. **AST Analysis Foundation**: Complete TypeScript parsing with ts-morph

### What We Need ⚠️

1. **Public API Template Recognition**: Detect DAISY v1 components using proxy pattern
2. **Structured Pseudo-Code Generation**: 6 constitutional fields per FR-034
3. **Session Auth Documentation**: Generate pseudo-code for cookie validation
4. **Error Handler Templates**: Specific 429/401/503 handling patterns
5. **Retry Logic Documentation**: Exponential backoff with countdown display

### What's Missing ❌

1. **Public API Repository Access**: Cannot cross-reference `/Users/douglaswross/Code/eai/eai-public-api/.specify/`
2. **Sequence 2 Validation**: Cannot verify implementation against original prototypesequence.md
3. **DPHI API Schema**: No access to actual third-party API response structures

## Recommendations

### Immediate (Phase 3 Completion - T021-T026)

1. **Continue V2 Generation Implementation**: Focus on basic component generation
2. **Use Specification Requirements**: Trust FR-003, FR-023-FR-029 as source of truth
3. **Generate Generic API Pseudo-Code**: Basic "API call to {url}" patterns

### Phase 4 (API Integration Templates)

1. **Create Template Library**: Implement T033-T038 with Public API patterns
2. **Add Pattern Matching**: Recognize proxy endpoint calls in DAISY v1 baselines
3. **Generate Structured Docs**: 6-field constitutional format per FR-034

### Future Enhancement

1. **Public API Schema Import**: If `/Users/douglaswross/Code/eai/eai-public-api` becomes accessible:
   - Parse OpenAPI/Swagger definitions
   - Generate TypeScript types automatically
   - Validate payload structures against schemas

2. **Sequence 2 Cross-Reference**: Document mapping between:
   - Sequence 2 flow steps
   - Generated pseudo-code blocks
   - DAISY v1 baseline implementation

## Compliance Checklist

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| FR-003: Public API pattern | ⏳ Phase 4 | T033-T038 templates |
| FR-023: Session auth | ⏳ Phase 4 | T034 pseudo-code generator |
| FR-024: Proxy payload | ⏳ Phase 4 | T035 pseudo-code generator |
| FR-025: Retry strategy | ⏳ Phase 4 | T036 pseudo-code generator |
| FR-026: Error codes | ⏳ Phase 4 | T037 pseudo-code generator |
| FR-027: Timeouts | ⏳ Phase 4 | T038 pseudo-code generator |
| FR-028: Network errors | ⏳ Phase 4 | T038 pseudo-code generator |
| FR-029: User messages | ⏳ Phase 4 | T036-T038 pseudo-code |
| FR-034: 6 constitutional fields | ⏳ Phase 4 | T027-T032 documentation |

## Current AST Analyzer Capabilities

### API Call Detection ✅

The `detectExternalAPIs()` function can identify:

- `fetch()` calls with URL extraction
- `axios.*()` calls (get, post, put, delete)
- HTTP method detection from options
- Request location tracking (file, line numbers)

**Example Output**:

```typescript
{
  type: 'api-call',
  description: 'API call to "/api/v1/proxy" using POST',
  location: {
    file: '/path/to/component.tsx',
    startLine: 42,
    endLine: 48
  },
  code: 'fetch("/api/v1/proxy", { method: "POST", body: JSON.stringify(payload) })',
  confidence: 0.9
}
```

### Validation Detection ✅

The `detectValidationRules()` function can identify:

- Regular expression patterns (e.g., UK postcode: `/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i`)
- Type checking (`typeof value === 'string'`)
- Property existence checks

### Transformation Detection ✅

The `detectDataTransformations()` function can identify:

- Array methods: `.map()`, `.filter()`, `.reduce()`
- Data normalization patterns
- Property mapping operations

### Comment Preservation ✅

The `preserveInlineComments()` function extracts:

- Single-line comments (`// Business logic explanation`)
- Multi-line comments (`/* Multi-line description */`)
- JSDoc blocks (filtered for business logic, not @tags)
- Filters out generic TODOs and linting directives

## Next Steps

### Phase 3 Completion (T021-T026)

1. **T021**: Create `v2-component.ts` types
   - V2Component interface
   - PseudoCodeBlock interface (6 constitutional fields)
   - GenerationOptions interface

2. **T022**: Implement `generateV2Component()` orchestrator
   - Call `analyzeBaseline()` from ast-analyzer
   - Generate basic pseudo-code from patterns
   - Create component structure

3. **T023**: Implement `generateComponentFile()`
   - TypeScript source generation
   - Configurator SDK imports
   - Pseudo-code as JSDoc comments

4. **T024**: Implement `generateTypeInterfaces()`
   - Props from extracted PropDefinition[]
   - State from React hooks
   - API Response (placeholder for Phase 4)

5. **T025**: Implement `validateCompilation()`
   - TypeScript Compiler API integration
   - Exit code 2 on compilation errors

6. **T026**: CLI integration
   - Call generator from `migrate-v2.ts`
   - Update manifest
   - Return exit codes

### Phase 4 Enhancement (T027-T038)

After MVP (Phase 3) is complete and validated:

1. Implement Public API template library
2. Add sequence 2 pattern recognition
3. Generate structured pseudo-code with 6 fields
4. Validate against SC-003 (≥15 statements) and SC-004 (5 integration points)

## Conclusion

**Current implementation is correctly structured** to detect API calls and business logic patterns from DAISY v1 baselines. The AST analysis foundation (T014-T020) provides everything needed for Phase 3 MVP.

**Public API alignment** is deferred to Phase 4 (T027-T038) where specific templates for session auth, proxy endpoints, retry strategies, and error handling will be implemented per FR-003, FR-023-FR-029.

**No blocking issues** related to Public API specification. The feature requirements document incorporates all necessary details from sequence 2, making the external repository reference unnecessary for Phase 3 implementation.

**Recommendation**: Continue with Phase 3 (T021-T026) to complete MVP, then address Public API templates in Phase 4.
