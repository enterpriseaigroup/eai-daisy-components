<!--
  Sync Impact Report:
  Version change: 1.1.0 → 1.2.0
  Modified principles: Component Independence - clarified API integration for embeddable UI components
  Added sections: API version alignment (1:1 with Configurator major versions), fallback strategies
  Removed sections: None
  Templates requiring updates:
    ✅ plan-template.md - Updated Constitution Check and directory structure for migration approach
    ✅ spec-template.md - Compatible with component migration specifications
    ✅ tasks-template.md - Compatible with migration development tasks
    ✅ checklist-template.md - Compatible with migration checklists
  Follow-up TODOs: Constitution ratification date needs to be confirmed with team
-->

# EAI Daisy Components Constitution

**Architecture Note**: This repository provides complete DAISY v1 component copies (visual + usage + business logic) in `/daisyv1/` directory and visual-only V2 components based on shadcn/elevenlabs baseline. V2 components are packaged as NPM components with visual consistency only - business logic integration with Configurator public APIs is added in later development phases.

## Core Principles

### I. Component Independence & Visual-First Development

Every exported V2 component MUST be self-contained and visually consistent as NPM packages. Components provide complete DAISY v1 copies (visual + usage + business logic) in `/daisyv1/` for reference and visual-only V2 components based on shadcn/elevenlabs foundation. V2 components focus on visual consistency and can have business logic integration with Configurator public APIs added in later phases. Components MUST include complete TypeScript interfaces, visual documentation, and NPM packaging configuration.

**Rationale**: This visual-first approach allows rapid V2 component development focused on UI/UX consistency while enabling business logic integration as a separate development phase.

### II. Architecture Migration Protocol

Component development MUST preserve DAISY v1 complete functionality (visual + usage + business logic) in `/daisyv1/` directory as reference baseline. V2 components MUST be created as visual-only implementations based on shadcn/elevenlabs foundation, packaged as NPM components with visual consistency maintained. Business logic integration with Configurator public APIs is added in subsequent development phases while preserving visual design.

**Rationale**: Maintains complete DAISY v1 functionality as reference while enabling rapid visual component development with business logic integration as an iterative enhancement.

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

V2 component development MUST preserve DAISY v1 visual design patterns while creating visual-only implementations based on shadcn/elevenlabs foundation. Security considerations focus on NPM package integrity and visual component safety. Business logic security review is deferred to later phases when Configurator public API integration is added. All published NPM components MUST pass automated security scanning for visual component dependencies.

**Architecture Transformation**: All components MUST support both DAISY v1 complete baseline (visual + usage + business logic in `/daisyv1/` directory) and V2 visual-only versions (in standard directories) to enable visual comparison and consistency validation during development.

**OSS License Compliance**: All V2 visual components MUST be compatible with chosen open source license. No GPL or copyleft dependencies in NPM packages. Third-party licenses MUST be documented and compatible, including shadcn/elevenlabs foundation licenses.

## Development Workflow

**Migration Process**: DAISY v1 → Complete copy (visual + usage + business logic) to `/daisyv1/` → Visual analysis → Visual-only V2 implementation using shadcn/elevenlabs foundation → NPM packaging → Visual consistency testing → Documentation → Publication. Business logic integration with Configurator public APIs added in subsequent development phases.

**Review Requirements**: All V2 visual component implementations require design system team approval for visual consistency and shadcn/elevenlabs foundation compliance before NPM publication. Automated quality gates MUST pass before human review. Business logic integration review deferred to later development phases.

**Release Coordination**: NPM package releases focus on visual component distribution. Business logic integration coordination with Configurator public APIs handled in subsequent development phases as components evolve from visual-only to functionally integrated.

## Governance

Constitution supersedes all other development practices. Amendments require design system team consensus, documentation of rationale, and migration plan for affected components. All PRs MUST verify constitutional compliance before merge.

Component API changes MUST be justified with user research or consumer feedback. Complexity in component interfaces MUST be justified with clear use cases and adoption metrics.

**Version**: 1.2.0 | **Ratified**: TODO(RATIFICATION_DATE): Team confirmation needed | **Last Amended**: 2025-10-22
