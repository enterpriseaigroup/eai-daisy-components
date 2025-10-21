<!--
  Sync Impact Report:
  Version change: 1.0.0 → 1.1.0
  Modified principles: Architecture Migration Protocol (renamed from Clean Extraction Protocol)
  Added sections: DAISY v1 baseline preservation, business logic transformation workflow
  Removed sections: Proprietary code stripping requirements
  Templates requiring updates: 
    ✅ plan-template.md - Updated Constitution Check and directory structure for migration approach
    ✅ spec-template.md - Compatible with component migration specifications
    ✅ tasks-template.md - Compatible with migration development tasks
    ✅ checklist-template.md - Compatible with migration checklists
  Follow-up TODOs: Constitution ratification date needs to be confirmed with team
-->

# EAI Daisy Components Constitution

## Core Principles

### I. Component Independence

Every exported component MUST be self-contained and framework-agnostic. Components cannot depend on internal Configurator business logic, proprietary APIs, or organization-specific implementations. Each component MUST include complete TypeScript definitions, documentation, and usage examples that enable standalone consumption.

**Rationale**: Public components serve diverse consumers who need predictable, isolated functionality without vendor lock-in or internal dependencies.

### II. Architecture Migration Protocol

Component migration from DAISY v1 MUST preserve business logic while transforming it to work with Configurator (DAISY v2) architecture. All DAISY v1 components MUST be copied with complete business logic into `/daisyv1/` directory as reference baseline. New components MUST be created in standard directories with business logic adapted for Configurator patterns, shadcn/ui foundation, and elevenlabs integration.

**Rationale**: Maintains valuable business logic investments while modernizing the underlying architecture and ensuring compatibility with the new Configurator platform.

### III. Semantic Versioning (NON-NEGOTIABLE)

All component releases MUST follow strict semantic versioning: MAJOR for breaking API changes, MINOR for new features/components, PATCH for bug fixes. Breaking changes between private and public versions MUST be documented with migration guides. Version bumps MUST be coordinated between Configurator updates and public releases.

**Rationale**: Public API consumers require predictable upgrade paths and stability guarantees for production systems.

### IV. Documentation-Driven Development

Every component MUST include comprehensive documentation before publication: API reference, usage examples, props interface, accessibility guidelines, and visual regression tests. Documentation MUST be generated from code to prevent drift. No component ships without complete docs.

**Rationale**: Public component libraries succeed through discoverability and ease of adoption, requiring excellent documentation.

### V. Automated Quality Gates

All components MUST pass automated testing including unit tests, integration tests, accessibility audits, and visual regression tests before publication. Build pipeline MUST validate component independence, bundle size limits, and performance benchmarks. Manual review required only for API design changes.

**Rationale**: Public components have higher quality standards since bugs affect multiple external consumers.

## Security & Compliance Requirements

Component migration MUST preserve all business logic while transforming authentication, API integration, and data handling patterns to work with Configurator architecture. Security review required for any component that handles user data, authentication, or external service integration. All published components MUST pass automated security scanning.

**Architecture Transformation**: All components MUST support both DAISY v1 baseline (in `/daisyv1/` directory) and Configurator-compatible versions (in standard directories) to enable comparison and validation during migration.

**OSS License Compliance**: All components MUST be compatible with chosen open source license. No GPL or copyleft dependencies in public components. Third-party licenses MUST be documented and compatible.

## Development Workflow

**Migration Process**: DAISY v1 → Copy with business logic to `/daisyv1/` → Architecture analysis → Business logic transformation → Configurator-compatible implementation → shadcn/elevenlabs integration → Testing → Documentation → Publication

**Review Requirements**: All component migrations require design system team approval for business logic transformation and architecture compatibility review before publication. Automated quality gates MUST pass before human review.

**Release Coordination**: Public component releases MUST be coordinated with Configurator development cycles to ensure internal and external versions remain compatible and business logic transformations align with platform capabilities.

## Governance

Constitution supersedes all other development practices. Amendments require design system team consensus, documentation of rationale, and migration plan for affected components. All PRs MUST verify constitutional compliance before merge.

Component API changes MUST be justified with user research or consumer feedback. Complexity in component interfaces MUST be justified with clear use cases and adoption metrics.

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE): Team confirmation needed | **Last Amended**: 2025-10-22
