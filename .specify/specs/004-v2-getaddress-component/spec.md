# Feature Specification: GetAddressCard V2 Component Implementation

**Feature Branch**: `004-v2-getaddress-component`  
**Created**: 2025-01-22  
**Status**: Draft  
**Input**: User description: "I want to update 001-component-extraction-pipeline to actually create the first v2 component and use GetAddressCard and review /Users/douglaswross/Code/eai/eai-public-api .specify folder and specifically .specify/memory/prototypesequence.md and sequence 2, to understand what the component will need to do, so that the business pseudo code can be more specific about what it needs to do."

## Definitions

**Business Logic**: Code that implements domain-specific rules, validations, data transformations, or decision-making processes unique to the application's business requirements. This includes: input validation rules (e.g., UK postcode format), data transformation logic (e.g., normalizing API responses), conditional rendering based on business state (e.g., showing error vs success UI), state transition rules (e.g., form submission workflow). Excludes: generic React patterns (useState/useEffect boilerplate), UI styling/layout code, third-party library wrappers without business semantics.

**Baseline Component**: The original DAISY v1 component source code preserved in `daisyv1/components/` directory after extraction by 001-component-extraction-pipeline. Includes: TypeScript/JavaScript source files, associated metadata (tier, dependencies, complexity), extraction README documenting context.

**Extracted Baseline**: Synonym for "Baseline Component". Used interchangeably throughout specification.

### Pseudo-Code

High-level natural language representation of business logic embedded in JSDoc comments, describing WHAT the logic does without implementing HOW. Format: structured statements (IF/THEN, FOR EACH, AWAIT/CATCH, STATE) for consistency across generated components. Purpose: Enable future business logic integration while maintaining visual-only V2 components during Phase 1 migration.

### Visual-Only V2 Component

A React component generated for Configurator SDK v2.1.0+ that implements ONLY visual/UI logic: JSX structure, styling (via shadcn/ui), user interactions (onClick, onChange). Business logic (API calls, validation rules, data transformations) is preserved as pseudo-code documentation in JSDoc comments above function definitions, describing WHAT the business logic DOES without implementing it. This enables incremental migration:

- **Phase 1** (this feature): Generate visual-only V2 components with pseudo-code documentation
- **Phase 2** (future): Integrate business logic from pseudo-code into functional implementations

Aligns with Constitution Principle II (Architecture Migration Protocol): preserve DAISY v1 baselines in /daisyv1/, create visual-first V2 in packages/v2-components/, document business logic for later integration.

**Example**: GetAddressCard V2 component renders form fields, buttons, and loading states using shadcn/ui components. API integration logic (fetch postcode lookup, handle rate limiting, parse response) exists ONLY as pseudo-code comments, NOT as executable TypeScript code.

## Clarifications

**Business Pseudo-Code**: Synonym for "Pseudo-Code" with emphasis on business logic content. Used interchangeably throughout specification.

**Component Structure**: The complete set of files and directories generated for a V2 component, including: main component TypeScript file (`Component.tsx`), type definitions (`Component.types.ts`), test scaffolding (`__tests__/Component.test.tsx`), documentation (`README.md`). Follows standard React component organization patterns.

**Feature Scope**: This feature implements V2 generation for GetAddressCard ONLY as proof-of-concept. Template extensibility (FR-006 Assumption) enables future migration of other tier-1 simple components using the same pipeline, but this feature's acceptance criteria (SC-001 to SC-008) and user stories focus exclusively on GetAddressCard validation.

## Clarification Sessions

### Session 2025-10-24

- Q: If generation fails (TypeScript compilation errors, insufficient pseudo-code), what recovery strategy should be used? → A: Continue generation, mark failed components in manifest (best-effort approach, generate what's possible)

- Q: How should the generator be monitored in production use (processing 170 components)? → A: Structured logging to file with console progress indicators (JSON logs for parsing, real-time terminal feedback for developers)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Creates First V2 Component from Extracted Baseline (Priority: P1)

A developer who has successfully run the component extraction pipeline now wants to transform the extracted GetAddressCard baseline component into a fully functional Configurator V2 component that integrates with the Public API architecture described in sequence 2.

**Why this priority**: This is the foundational capability that validates the entire extraction pipeline's value proposition. Without the ability to create real V2 components from extracted baselines, the migration pipeline delivers no production value.

**Independent Test**: Developer can run a migration command that takes the extracted `useRenderAddressCard` baseline and generates a working GetAddressCard V2 component that compiles, passes type checking, and has correct Configurator SDK integration scaffolding. The component should include the business pseudo-code that reflects sequence 2's API proxy pattern.

**Acceptance Scenarios**:

1. **Given** an extracted GetAddressCard baseline exists in `daisyv1/components/tier1-simple/useRenderAddressCard/`, **When** developer runs the V2 component generation command, **Then** a new V2 component is created in `packages/v2-components/src/components/GetAddressCard/` with proper Configurator SDK imports and structure.

2. **Given** the generated V2 component file, **When** TypeScript compilation is run, **Then** zero type errors are produced and all Configurator SDK types resolve correctly.

3. **Given** the generated V2 component contains business pseudo-code, **When** developer reviews the pseudo-code, **Then** it accurately describes the sequence 2 flow: validate session → call FastAPI proxy → handle APIM rate limiting → display results.

---

### User Story 2 - Component Integrates with Public API Proxy Pattern (Priority: P2)

A developer implementing the GetAddressCard component needs the pseudo-code to guide integration with the Public API's generic proxy endpoint (`/api/v1/proxy`), matching the session-based authentication and error handling patterns from sequence 2.

**Why this priority**: The pseudo-code must reflect real-world API integration requirements. Generic pseudo-code that ignores the established Public API architecture will mislead developers and require rewriting.

**Independent Test**: The generated pseudo-code in the V2 component includes specific references to: session cookie validation, FastAPI proxy endpoint structure (`{ tenantApiName, operation, parameters }`), APIM rate limiting (429 errors), and usage logging. Developer can use this pseudo-code as implementation guidance without needing to cross-reference other documentation.

**Acceptance Scenarios**:

1. **Given** the generated GetAddressCard V2 component's pseudo-code section, **When** developer reads the API integration logic, **Then** pseudo-code shows POST request to `/api/v1/proxy` with structure `{ tenantApiName: "DPHI", operation: "getaddress", parameters: { address: string } }`.

2. **Given** the component receives a 429 rate limit response, **When** error handling pseudo-code executes, **Then** it specifies extracting `Retry-After` header and displaying appropriate user message.

3. **Given** API call succeeds, **When** response processing pseudo-code executes, **Then** it describes transforming the third-party API response into component display state.

---

### User Story 3 - Component Follows Configurator V2 Patterns (Priority: P2)

The generated V2 component must conform to Configurator SDK v2.1.0+ patterns for state management, error handling, and UI composition, ensuring consistency with the broader Configurator ecosystem.

**Why this priority**: Components that don't follow Configurator conventions create maintenance burden and won't integrate properly with the rest of the application. This priority is slightly lower than P1 because a component that compiles but doesn't perfectly match conventions still has MVP value.

**Independent Test**: Generated component structure includes: Configurator SDK state hooks, shadcn/ui component imports, proper TypeScript interfaces for props and state, error boundary integration, and loading state patterns. A developer familiar with Configurator can recognize the component as following established patterns.

**Acceptance Scenarios**:

1. **Given** the generated V2 component, **When** developer inspects the imports section, **Then** it includes `@elevenlabs-ui/configurator-sdk`, `@/components/ui/*` (shadcn), and React 18+ hooks.

2. **Given** component has asynchronous API operations, **When** developer reviews state management pseudo-code, **Then** it describes using proper loading/error/success state patterns consistent with Configurator conventions.

3. **Given** component needs to display validation errors, **When** developer reviews error handling, **Then** pseudo-code references appropriate shadcn/ui components (Alert, Toast, etc.) for user feedback.

---

### User Story 4 - Business Logic is Preserved from DAISY v1 Baseline (Priority: P3)

The generated V2 component includes pseudo-code that captures the original DAISY v1 GetAddressCard's business logic (address validation, council lookup, property information display), not just generic API calling patterns.

**Why this priority**: While important for feature completeness, this is lower priority because developers can manually add business logic if the infrastructure (P1-P2) is correct. The reverse (fixing infrastructure after writing business logic) is harder.

**Independent Test**: Generated pseudo-code includes specific GetAddressCard behaviors like address format validation, handling multiple council results, and displaying property metadata. A developer can compare the pseudo-code to the original DAISY v1 component and confirm key business rules are represented.

**Acceptance Scenarios**:

1. **Given** the original DAISY v1 GetAddressCard validates UK postcode format, **When** developer reviews V2 pseudo-code, **Then** it includes address validation logic specific to UK postcode rules.

2. **Given** DAISY v1 component handles multiple council results, **When** V2 pseudo-code describes result handling, **Then** it specifies UI patterns for displaying and selecting from multiple matches.

3. **Given** DAISY v1 displays property metadata (address lines, UPRN, council name), **When** V2 pseudo-code describes rendering, **Then** it lists the specific data fields to display.

---

### Edge Cases

- What happens when the extracted baseline component has no detectable business logic (pure presentational component)? Pseudo-code should document this and focus on props/rendering patterns only.
- How does the system handle extracted baselines that use DAISY v1-specific patterns no longer valid in V2 (e.g., legacy context providers)? Generation should include [MIGRATION_NOTE] comments explaining breaking changes.
- What if the component references other DAISY v1 components that haven't been migrated yet? Pseudo-code should document dependencies and suggest migration order.
- How does the generator handle components with complex state machines or multi-step workflows? Pseudo-code should preserve state transition logic from baseline analysis.
- What happens if APIM returns errors other than 429 (e.g., 401 auth failure, 503 service unavailable)? Pseudo-code should include comprehensive error handling patterns.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Pipeline MUST generate a valid V2 component file from an extracted GetAddressCard baseline that compiles without errors using TypeScript 5.0+ strict mode.

- **FR-002**: Generated V2 component MUST include imports for Configurator SDK v2.1.0+, React 18+, and shadcn/ui components.

- **FR-003**: Generated pseudo-code MUST describe the Public API integration pattern from sequence 2: session-based auth, FastAPI proxy endpoint structure, APIM error handling.

- **FR-004**: Generator MUST embed business pseudo-code as JSDoc block comments above function/component definitions, including 6 required semantic fields per Constitution Principle VI:
  1. **WHY EXISTS**: Business justification and origin (e.g., "DPHI API contract requirement")
  2. **WHAT DOES**: Functional behavior and outcomes (e.g., "Validates UK postcode format")
  3. **WHAT CALLS**: API endpoints, functions, library dependencies (e.g., "regex from validation-utils.ts")
  4. **DATA FLOW**: Input types → transformations → output types (e.g., "string → regex validation → boolean + error")
  5. **DEPENDENCIES**: External services, libraries, configuration requirements (e.g., "None - pure function")
  6. **SPECIAL BEHAVIOR**: Edge cases, error handling, performance considerations (e.g., "Handles optional space in middle")
  
  Example: UK postcode validation includes all 6 fields in structured JSDoc format for IDE integration and future implementation reference.

- **FR-005**: Generator MUST analyze the extracted baseline's original implementation to identify business logic patterns (validation rules, data transformations, conditional rendering).

- **FR-006**: Generated component MUST include TypeScript interfaces for Props, State, and API Response types specific to GetAddressCard use case.

- **FR-007**: Pipeline MUST preserve the original DAISY v1 component's file structure as a reference, creating the V2 version as a new file (not overwriting baseline).

- **FR-008**: Generated pseudo-code MUST include specific API payload structure: `{ tenantApiName: "DPHI", operation: "getaddress", parameters: { address: string } }`.

- **FR-009**: Pseudo-code MUST describe rate limiting handling: detect 429 responses, extract Retry-After header, display user-friendly retry message.

- **FR-010**: Generator MUST create a component README documenting: purpose, props, usage example, API dependencies, and migration notes from DAISY v1.

- **FR-011**: Pipeline MUST support dry-run mode where developers can preview generated pseudo-code before committing to file creation.

- **FR-012**: Generated component structure MUST follow established patterns: `src/` for implementation, `__tests__/` for test scaffolding, `README.md` for documentation.

- **FR-013**: Generator MUST use best-effort approach for failures: continue generating remaining components, record failed components in generation manifest with error details, allow successful components to be used while failures are addressed.

- **FR-014**: Generator MUST implement structured logging with: JSON-formatted log file for parsing/analysis (include timestamp, component name, operation, duration, status, errors), console progress indicators for real-time developer feedback (component count, current processing, success/failure status), and log file location reported at completion.

#### AST Analysis Requirements

- **FR-015**: Generator MUST analyze TypeScript AST to identify React hooks (useState, useEffect, useCallback, useMemo, custom hooks) and preserve their usage patterns in pseudo-code with state flow descriptions.

- **FR-016**: Generator MUST extract component prop interfaces from baseline TypeScript definitions, including JSDoc comments, type constraints (required/optional), and default values.

- **FR-017**: Generator MUST preserve inline comment documentation from baseline code when it describes business logic intent, integrating it into generated pseudo-code blocks.

- **FR-018**: Generator MUST detect external API integration points by analyzing fetch/axios calls, identifying endpoint URLs, HTTP methods, and payload structures.

#### Pseudo-Code Representation Requirements

- **FR-019**: Pseudo-code MUST represent conditional logic using structured format: `IF <condition> THEN <action> ELSE <alternative>`, preserving business rule semantics from baseline.

- **FR-020**: Pseudo-code MUST represent loop/iteration patterns using format: `FOR EACH <item> IN <collection>: <action>`, indicating data transformations (map/filter/reduce operations).

- **FR-021**: Pseudo-code MUST represent async/await patterns using format: `AWAIT <operation> THEN <success-handler> CATCH <error-handler>`, showing error handling flow.

- **FR-022**: Pseudo-code MUST represent state transitions using format: `STATE <name>: <initial> -> <transition-event> -> <new-state>`, documenting state machine logic.

#### API Integration Requirements (Enhanced)

- **FR-023**: Generated pseudo-code MUST specify session authentication mechanism: cookie name (`session_token`), validation approach (check expiry, verify signature), and fallback behavior (redirect to login if invalid).

- **FR-024**: Generated pseudo-code MUST document complete API payload structure with field-level constraints: `tenantApiName` (enum: ["DPHI", "OTHER"]), `operation` (string, required), `parameters` (object, validated against schema).

- **FR-025**: Generated pseudo-code MUST specify retry strategy for rate limiting: exponential backoff starting at 1s, max 3 retries, respect `Retry-After` header value, display retry countdown to user.

- **FR-026**: Generated pseudo-code MUST document error handling for all HTTP status codes: 200 (success), 400 (validation error), 401 (auth failure → redirect), 429 (rate limit → retry), 503 (service unavailable → show maintenance message).

- **FR-027**: Generated pseudo-code MUST document timeout handling: connection timeout (5s), read timeout (30s), display "Request taking longer than expected" message, allow user to cancel.

- **FR-028**: Generated pseudo-code MUST specify network error handling: DNS failure, connection refused, network timeout → display "Unable to connect" message with retry option.

- **FR-029**: Generated pseudo-code MUST define "user-friendly retry message" format: "Rate limit reached. Retrying in {seconds} seconds..." with visual countdown indicator and cancel button.

#### Recovery Flow Requirements

- **FR-030**: Generator MUST support resuming generation from manifest after partial failure: read failed component list, skip successfully generated components, retry only failed components with same configuration.

- **FR-031**: Generator MUST support rollback mode: delete generated files listed in manifest, restore original state, clean up partial artifacts (incomplete files, empty directories).

- **FR-032**: Generator MUST clean up orphaned files from failed generations: detect incomplete component directories (missing README or types file), prompt user for cleanup confirmation, log cleanup actions.

- **FR-033**: Generator MUST support regenerating specific components from manifest: accept component name filter, regenerate only specified components, preserve other successful generations.

- **FR-034**: Generator MUST validate pseudo-code completeness, ensuring all 6 constitutional fields (WHY EXISTS, WHAT DOES, WHAT CALLS, DATA FLOW, DEPENDENCIES, SPECIAL BEHAVIOR) are present in generated JSDoc blocks. If any field is missing or empty, generation MUST fail with exit code 3 (business-logic-incomplete) per API contract, logging specific missing fields to error output.

### Non-Functional Requirements

#### Performance Requirements

- **NFR-001**: Generator MUST complete single component generation in under 30 seconds on standard hardware (16GB RAM, 4-core CPU, SSD storage) with baseline file under 1000 LOC.

- **NFR-002**: Generator MUST support batch generation of all 170 components in under 90 minutes (average 32 seconds per component) with parallel processing disabled to ensure deterministic output.

- **NFR-003**: Generator MUST limit memory consumption to under 2GB during AST analysis of large baseline files (>5000 LOC), using streaming parsing when necessary.

- **NFR-004**: Generator MUST support parallel generation with configurable concurrency (default: 4 concurrent processes), ensuring thread-safe file operations and manifest updates.

#### Observability Requirements (Enhanced)

- **NFR-005**: JSON log schema MUST include fields: `timestamp` (ISO 8601), `level` (info/warn/error), `componentName`, `operation` (analyze/transform/generate/validate), `duration` (milliseconds), `status` (success/failure/partial), `errorDetails`, `metadata` (LOC, complexity, dependencies).

- **NFR-006**: Log files MUST use naming convention: `v2-generation-{timestamp}.jsonl` (JSON Lines format), stored in `.specify/logs/` directory, with automatic rotation after 10MB or 1000 entries.

- **NFR-007**: Console progress indicators MUST display: component count (X/Y), current component name, elapsed time, estimated remaining time, success/failure/skip counts, using ANSI color codes (green=success, red=failure, yellow=warning).

- **NFR-008**: Generator MUST support verbose/debug logging mode (--verbose flag) that includes: AST traversal details, template variable substitution, pseudo-code generation steps, file write operations.

#### Reliability Requirements

- **NFR-009**: Generator MUST ensure idempotent generation: same baseline input with same configuration produces identical V2 component output (deterministic template rendering, sorted imports, consistent formatting).

- **NFR-010**: Generator MUST prevent concurrent generation conflicts: acquire file lock on manifest, detect concurrent processes, exit with error if lock cannot be acquired within 10 seconds.

- **NFR-011**: Generator MUST ensure atomic file writes: write to temporary file first, validate generated code compiles, rename to final location only on success, preserving previous version if present.

#### Security Requirements

- **NFR-012**: Generator MUST validate baseline file paths to prevent path traversal attacks: reject paths containing `..`, restrict to `daisyv1/components/` subdirectories, canonicalize paths before access.

- **NFR-013**: Generator MUST sanitize CLI input to prevent command injection: validate component names against whitelist pattern (alphanumeric + hyphen/underscore), reject special shell characters.

- **NFR-014**: Generator MUST handle sensitive data in logs: redact API keys/tokens from logged payloads, mask session cookie values, avoid logging PII from component props.

### Key Entities

- **Extracted Baseline Component**: The original DAISY v1 GetAddressCard component preserved in `daisyv1/components/tier1-simple/useRenderAddressCard/` directory, including source code, metadata JSON, and extraction README describing context. Source for AST analysis (FR-015 to FR-018).

- **V2 Component**: The generated Configurator V2 component in `packages/v2-components/src/components/GetAddressCard/`, containing: main TypeScript file with pseudo-code (FR-001, FR-004, FR-019 to FR-022), Props/State/API interfaces (FR-006, FR-016), test scaffolding (FR-012), and README (FR-010).

- **Pseudo-Code Block**: JSDoc-formatted comment sections within V2 component describing business logic. Includes sections for: validation rules, API integration, data transformation, error handling, state transitions. Each block follows structured format with WHY/WHAT/CALLS sections (FR-004, FR-019 to FR-022).

- **Generation Manifest**: JSON file (`generation-manifest.json`) tracking generation status: successful components list, failed components with error details, generation timestamp, configuration used. Enables recovery operations (FR-013, FR-030 to FR-033).

- **Component Metadata**: Information extracted during baseline analysis (FR-005, FR-015 to FR-018) including: component tier (1-4), dependencies on other components, external API integrations (DPHI per FR-024), state complexity level, detected React hooks, migration warnings.

- **API Configuration**: Description of Public API integration requirements: endpoint URL (`/api/v1/proxy` per FR-003), authentication method (session cookie `session_token` per FR-023), payload structure (FR-024), retry strategy (FR-025), error codes and handling (FR-026 to FR-029).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developer can generate a V2 GetAddressCard component from the extracted baseline in under 30 seconds using a single CLI command.

- **SC-002**: Generated V2 component passes TypeScript compilation with zero errors and zero type-safety warnings in strict mode.

- **SC-003**: Pseudo-code in generated component contains at least 15 specific business logic statements (not generic placeholders like "// TODO: implement logic"), AND all pseudo-code blocks MUST include 6 constitutional fields (WHY EXISTS, WHAT DOES, WHAT CALLS, DATA FLOW, DEPENDENCIES, SPECIAL BEHAVIOR) per Constitution Principle VI.

- **SC-004**: Generated pseudo-code includes all 5 key sequence 2 integration points: session validation, proxy endpoint structure, rate limit handling, usage logging, error boundaries.

- **SC-005**: Developer reviewing generated pseudo-code can implement the real component in 4 hours or less without needing to reference external documentation for API integration patterns.

- **SC-006**: Generated component README accurately describes the component's purpose, props, and migration differences from DAISY v1 in under 500 words.

- **SC-007**: Dry-run mode allows developers to preview pseudo-code output without file creation, enabling iterative refinement of generation templates.

- **SC-008**: 90% of developers (3 out of 3 in initial validation) confirm the pseudo-code accurately reflects GetAddressCard's business logic when compared to original DAISY v1 implementation.

## Implementation Assumptions

1. **Baseline Quality**: The extracted GetAddressCard baseline in `daisyv1/components/tier1-simple/useRenderAddressCard/` contains sufficient information (original source code, extracted metadata) to identify business logic patterns. If baseline is incomplete, pseudo-code will note gaps with [NEEDS_ANALYSIS] markers. (Referenced by: FR-001, FR-005, FR-015 to FR-018)

2. **Configurator SDK Stability**: Configurator SDK v2.1.0+ API is stable and documented. Component generation templates will use current SDK patterns (state hooks, error boundaries, async handling). If SDK changes, templates must be updated. (Referenced by: FR-002, User Story 3)

3. **Public API Architecture**: Sequence 2's Public API architecture (FastAPI proxy, APIM rate limiting, session-based auth) is implemented and stable. Generated pseudo-code assumes this infrastructure exists. If API patterns change, pseudo-code templates must be updated. (Referenced by: FR-003, FR-008, FR-023 to FR-029, User Story 2)

4. **Developer Context**: Developers using this feature have completed the baseline extraction phase (001-component-extraction-pipeline) and understand DAISY v1 component architecture. They have access to both `daisyv1/` baselines and will create V2 components in `packages/v2-components/`. (Referenced by: User Story 1, SC-001, SC-005)

5. **Migration Order**: GetAddressCard is chosen as the first V2 component because it has clear API dependencies (DPHI), well-defined business logic (address validation), and is a tier-1 simple component, making it an ideal proof-of-concept. More complex components will be migrated after validating this approach. (Referenced by: Feature Scope definition)

6. **Template Extensibility**: The pseudo-code generation templates are designed to be reusable for other components beyond GetAddressCard. Templates will be parameterized to handle different API endpoints, component tiers, and business logic patterns. (Referenced by: FR-012, Assumption 5, Feature Scope definition)

## Traceability Matrix

### User Stories → Functional Requirements

| User Story | Priority | Related Functional Requirements |
|------------|----------|--------------------------------|
| US-1: Developer Creates First V2 Component | P1 | FR-001 (compilation), FR-002 (imports), FR-003 (API pattern), FR-004 (pseudo-code format), FR-006 (interfaces), FR-007 (baseline preservation) |
| US-2: Component Integrates with Public API | P2 | FR-003 (API pattern), FR-008 (payload structure), FR-009 (rate limiting), FR-023 (session auth), FR-024 (payload constraints), FR-025 (retry strategy), FR-026 to FR-029 (error handling) |
| US-3: Component Follows Configurator Patterns | P2 | FR-002 (SDK/shadcn imports), FR-006 (interfaces), FR-012 (component structure), FR-015 (React hooks), FR-021 (async patterns), FR-022 (state transitions) |
| US-4: Business Logic Preserved from Baseline | P3 | FR-005 (business logic analysis), FR-015 to FR-018 (AST analysis), FR-019 to FR-022 (pseudo-code representation) |

### Success Criteria → Functional Requirements

| Success Criterion | Related Functional Requirements | Validation Method |
|-------------------|--------------------------------|-------------------|
| SC-001: Generate in <30s | NFR-001 (performance), NFR-003 (memory), NFR-004 (parallelization) | Automated timing tests |
| SC-002: Zero type errors | FR-001 (strict mode), FR-006 (interfaces), FR-016 (prop extraction) | TypeScript compiler check |
| SC-003: ≥15 specific statements | FR-004 (format), FR-019 to FR-022 (representation), FR-005 (business logic) | Automated statement counter |
| SC-004: 5 integration points | FR-003, FR-008, FR-009, FR-023 to FR-029 (API requirements) | Manual checklist review |
| SC-005: Implement in ≤4 hours | FR-003 to FR-004, FR-010 (README), FR-019 to FR-022 (clear pseudo-code) | Developer time tracking |
| SC-006: README <500 words | FR-010 (README generation) | Automated word counter |
| SC-007: Dry-run preview | FR-011 (dry-run mode) | Manual feature test |
| SC-008: 90% accuracy confirmation | FR-005, FR-015 to FR-018 (baseline analysis), FR-019 to FR-022 (representation) | Developer survey |

### Edge Cases → Requirements Coverage

| Edge Case | Covered By | Gap Analysis |
|-----------|-----------|--------------|
| No detectable business logic | FR-005 (analysis), Assumption 1 ([NEEDS_ANALYSIS] markers) | ✅ Covered |
| DAISY v1-specific patterns | FR-017 (preserve comments), FR-010 (migration notes) | ⚠️ Partial - needs [MIGRATION_NOTE] marker spec |
| Unresolved dependencies | FR-016 (prop extraction), FR-010 (document dependencies) | ⚠️ Partial - needs dependency resolution strategy |
| Complex state machines | FR-022 (state transitions), FR-015 (React hooks) | ✅ Covered |
| APIM errors beyond 429 | FR-026 to FR-029 (comprehensive error handling) | ✅ Covered |

### Non-Functional Requirements → Validation

| NFR Category | Requirements | Validation Strategy |
|--------------|--------------|---------------------|
| Performance | NFR-001 to NFR-004 | Load testing with 170 components, profiling |
| Observability | NFR-005 to NFR-008, FR-014 | Log analysis, manual inspection |
| Reliability | NFR-009 to NFR-011 | Chaos testing, concurrent execution tests |
| Security | NFR-012 to NFR-014 | Security audit, penetration testing |

## Open Questions

*All original questions resolved during planning and clarification phases. See Clarifications section for details.*

### Resolved in Planning (research.md)

1. **[RESOLVED: Output Location]** - V2 components will be generated in `packages/v2-components/src/` to maintain isolation during migration, enable independent NPM packaging, and simplify build configuration.

2. **[RESOLVED: Pseudo-Code Format]** - JSDoc-style block comments above each function/section. Provides IDE integration, hover documentation, and maintains code-documentation proximity without separate sidecar files.

3. **[RESOLVED: Business Logic Extraction Depth]** - High-level flow + explicit validation rules. Captures primary business logic patterns (validation, data transformations, conditional rendering) without deep AST parsing. Balances implementation time (10-15 hours) with utility.

### Resolved in Clarification Session (Session 2025-10-24)

1. **[RESOLVED: Failure Recovery Strategy]** - Best-effort approach: continue generating successful components, record failed components in generation manifest with error details, allow partial success for iterative fixing.

2. **[RESOLVED: Observability Strategy]** - Structured JSON logging to file with console progress indicators. Enables parsing/analysis of generation runs while providing real-time developer feedback during processing.
