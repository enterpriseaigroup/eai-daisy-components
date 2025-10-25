# Implementation Plan: GetAddressCard V2 Component Implementation

**Branch**: `004-v2-getaddress-component` | **Date**: 2025-10-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `.specify/specs/004-v2-getaddress-component/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature extends the existing component extraction pipeline (001-component-extraction-pipeline) to generate production-ready Configurator V2 components from extracted DAISY v1 baselines. Using GetAddressCard as the first implementation, the pipeline will generate compilable V2 components with business pseudo-code that accurately reflects the Public API integration patterns from sequence 2 (session-based auth, FastAPI proxy, APIM rate limiting). The generated components must preserve DAISY v1 business logic while adapting to Configurator SDK v2.1.0+ patterns and shadcn/ui conventions.

## Technical Context

**Language/Version**: TypeScript 5.0+ (strict mode with exactOptionalPropertyTypes)

**Primary Dependencies**:

- Existing: @typescript-eslint/parser, @typescript-eslint/utils, ts-morph (AST manipulation)
- New: @elevenlabs-ui/configurator-sdk v2.1.0+, shadcn/ui v0.4.0+, React 18+

**Storage**: File system based (baselines in `/daisyv1/`, generated V2 in `packages/v2-components/src/`)

**Testing**: Jest (existing suite: 390/438 passing), new test fixtures for V2 generation validation

**Target Platform**: Node.js 18+ (CLI tooling), Browser (generated React components)

**Project Type**: CLI tool + component library (hybrid structure)

**Performance Goals**:

- V2 component generation: < 30 seconds per component (SC-001)
- Zero TypeScript compilation errors in generated output (SC-002)
- Business logic preservation: ≥15 specific statements in pseudo-code (SC-003)

**Constraints**:

- Must use existing pipeline infrastructure from 001-component-extraction-pipeline
- Generated components must compile with TypeScript 5.0+ strict mode
- Pseudo-code format: JSDoc block comments for IDE integration (clarification #2)
- Output location: `packages/v2-components/src/` to isolate during migration (clarification #1)

**Scale/Scope**:

- Phase 1: 1 component (GetAddressCard) as proof-of-concept
- Future: 170 extracted components from DAISY v1 baseline
- Generated artifacts per component: TypeScript source, README.md, **tests**/ scaffold

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Component Independence**: GetAddressCard can be generated as self-contained V2 component with Configurator SDK integration, business logic preserved in pseudo-code
- [x] **Architecture Migration Protocol**: DAISY v1 baseline preserved in `daisyv1/components/tier1-simple/useRenderAddressCard/`, V2 generation creates visual-only implementation in `packages/v2-components/src/`, business logic documented in pseudo-code for later integration
- [x] **Semantic Versioning**: Feature adds new V2 generation capability (MINOR version bump), no breaking changes to existing pipeline, migration path: use existing baselines → generate V2 → integrate business logic
- [x] **Documentation-Driven Development**: Plan includes README generation (FR-010), component documentation, pseudo-code documentation (FR-004), API reference for props/state interfaces (FR-006)
- [x] **Automated Quality Gates**: Testing strategy includes TypeScript compilation validation (SC-002), pseudo-code statement counting (SC-003), business logic preservation tests comparing to baseline (SC-008), integration with existing Jest suite

## Project Structure

### Documentation (this feature)

```text
.specify/specs/004-v2-getaddress-component/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (already complete)
├── checklists/
│   └── requirements.md  # Validation checklist (already complete)
├── research.md          # Phase 0 output (generated below)
├── data-model.md        # Phase 1 output (generated below)
├── quickstart.md        # Phase 1 output (generated below)
├── contracts/           # Phase 1 output (generated below)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Existing pipeline infrastructure (from 001-component-extraction-pipeline)
src/
├── pipeline/
│   ├── generators/
│   │   ├── v2-generator.ts         # EXTEND: Add pseudo-code generation logic
│   │   └── baseline-generator.ts   # Existing: Generates baselines
│   ├── transformers/
│   │   └── component-transformer.ts # EXTEND: Add business logic extraction
│   ├── extractor.ts                # Existing: Extracts DAISY v1 components
│   └── orchestrator.ts             # EXTEND: Add V2 generation orchestration
├── engine/
│   ├── analyzer.ts                 # EXTEND: Add business logic pattern detection
│   └── parser.ts                   # Existing: AST parsing utilities
├── utils/
│   └── business-logic-analyzer.ts  # NEW: Semantic function analysis
└── cli/
    ├── migrate-component.ts        # EXTEND: Add --generate-v2 flag
    └── main.ts                     # EXTEND: Add v2-generate command

# New V2 component output structure (per clarification #1)
packages/
└── v2-components/
    ├── package.json                # NEW: NPM package configuration
    ├── tsconfig.json               # NEW: TypeScript config for V2 components
    ├── README.md                   # NEW: Package documentation
    └── src/
        └── components/
            └── GetAddressCard/     # NEW: First V2 component
                ├── GetAddressCard.tsx       # Generated component with pseudo-code
                ├── GetAddressCard.types.ts  # Generated TypeScript interfaces
                ├── README.md                # Generated component documentation
                └── __tests__/
                    └── GetAddressCard.test.tsx # Generated test scaffold

# Existing DAISY v1 baselines (unchanged)
daisyv1/
└── components/
    └── tier1-simple/
        └── useRenderAddressCard/   # Existing: Baseline for GetAddressCard
            ├── useRenderAddressCard.tsx
            └── README.md

# Testing infrastructure
tests/
├── pipeline/
│   └── v2-generation.test.ts       # NEW: V2 generation validation tests
├── integration/
│   └── pseudo-code-validation.test.ts # NEW: Pseudo-code quality tests
└── fixtures/
    └── getaddress-card/            # NEW: Test fixtures for GetAddressCard
        ├── baseline.tsx            # Test input (DAISY v1 baseline)
        └── expected-v2.tsx         # Test output (expected V2 component)
```

**Structure Decision**: Hybrid structure combining existing pipeline infrastructure with new V2 component output. This approach:

- **Preserves existing investment**: Reuses 001-component-extraction-pipeline infrastructure (AST parsing, baseline generation, CLI framework)
- **Isolates V2 components**: New `packages/v2-components/` directory keeps generated components separate during migration phase
- **Enables incremental rollout**: GetAddressCard is first component, validates approach before scaling to 170 components
- **Supports testing strategy**: Clear test fixture structure for baseline → V2 validation
- **Aligns with Constitution**: Maintains DAISY v1 baselines in `/daisyv1/`, creates visual-only V2 implementations in dedicated package

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - All Constitution principles satisfied:

- Component Independence: V2 components self-contained with Configurator SDK
- Architecture Migration: DAISY v1 baselines preserved, V2 visual-only generation
- Semantic Versioning: MINOR bump, no breaking changes
- Documentation-Driven: README generation, pseudo-code documentation, API contracts
- Automated Quality Gates: TypeScript compilation, pseudo-code validation, Jest integration

No complexity violations to justify.

---

## Post-Design Constitution Re-Check

> Executed after Phase 1 (design, data model, contracts)

- [x] **Component Independence**: Data model ensures each V2 component has self-contained Props/State/Response interfaces
- [x] **Architecture Migration Protocol**: Contracts specify baseline preservation and V2 generation workflow  
- [x] **Semantic Versioning**: Quickstart documents versioning as MINOR (0.1.0 for v2-components package)
- [x] **Documentation-Driven Development**: Generated artifacts include README, API contracts, quickstart guide
- [x] **Automated Quality Gates**: Validation matrix in data-model.md covers all success criteria checks

**Principle VI - Test Accuracy Compliance**:

- [x] Real TypeScript compilation validation (not mocked)
- [x] Semantic function analysis for business logic (not count-only)
- [x] Test fixtures will use Tailwind CSS only (no external CSS imports)
- [x] Comprehensive pseudo-code documentation required (WHY/WHAT/HOW blocks)

**Final Assessment**: ✅ All Constitution principles satisfied post-design.

---

## Phase 0-1 Completion Summary

### Artifacts Generated

**Phase 0 - Research** (`research.md`):

- ✅ Resolved 3 clarification questions with suggested defaults
- ✅ Established technology best practices (Configurator SDK, TypeScript AST)
- ✅ Made key decisions: output location, pseudo-code format, extraction depth

**Phase 1 - Design & Contracts**:

- ✅ `data-model.md`: 5 entities with validation rules, relationships, state transitions
- ✅ `contracts/api-contract.md`: CLI interface, TypeScript API, generated component structure
- ✅ `quickstart.md`: Step-by-step guide (15 minutes, 5 steps)
- ✅ Agent context updated: TypeScript 5.0+ added to copilot-instructions.md

### Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Output Location** | `packages/v2-components/src/` | NPM packaging, build independence, scalability |
| **Pseudo-Code Format** | JSDoc block comments | IDE integration, co-location, tooling support |
| **Extraction Depth** | High-level flow + validation rules | MVP velocity, sufficient for 4-hour implementation |
| **Component Structure** | Hybrid (CLI tool + component library) | Reuses pipeline infrastructure, isolates V2 output |
| **Testing Strategy** | Jest + TypeScript compilation + statement counting | Leverages existing test suite, validates quality |

### Technical Approach

**Pipeline Extensions**:

1. Add `BusinessLogicAnalyzer` for pattern extraction
2. Extend `v2-generator.ts` with pseudo-code generation
3. Add CLI `--generate-v2` flag to migrate-component
4. Create `packages/v2-components/` package structure

**Quality Validation**:

- TypeScript 5.0+ strict mode compilation (SC-002)
- Pseudo-code statement counting ≥15 (SC-003)
- Sequence 2 keyword detection (SC-004)
- Generation time tracking <30s (SC-001)

**Architecture Alignment**:

- Preserves DAISY v1 baselines in `/daisyv1/` (Constitution Principle II)
- Generates visual-only V2 components (Constitution architecture note)
- Documents business logic in pseudo-code for later integration
- Follows Component Independence principle (Constitution Principle I)
