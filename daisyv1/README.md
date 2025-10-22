# DAISY v1 Baseline Components

This directory contains complete copies of DAISY v1 components including:
- Visual implementation
- Business logic
- Component usage patterns

These serve as the baseline for migration to Configurator v2 architecture.

## Directory Structure

```
daisyv1/
├── components/     # Original DAISY v1 components
│   ├── tier1/      # Simple components (buttons, inputs, labels)
│   ├── tier2/      # Moderate complexity (forms, modals, cards)
│   └── tier3/      # Complex components (data tables, charts, wizards)
├── utils/          # Shared utilities
│   ├── tier1/      # Basic utilities (formatters, validators)
│   ├── tier2/      # Moderate utilities (state managers, API helpers)
│   └── tier3/      # Complex utilities (data transformers, orchestrators)
├── types/          # Type definitions
│   ├── tier1/      # Basic type definitions
│   ├── tier2/      # Moderate type definitions
│   └── tier3/      # Complex type definitions
└── docs/           # Original documentation
    ├── tier1/      # Simple component docs
    ├── tier2/      # Moderate component docs
    └── tier3/      # Complex component docs
```

## Purpose

Per Constitution Principle II (Architecture Migration Protocol), this directory:
1. Preserves complete DAISY v1 functionality as reference baseline
2. Enables functional equivalency testing (SC-003)
3. Documents business logic transformation requirements (FR-002)

## Component Tiers

### Tier 1 (Simple) - Target: 30 min/component
- Basic UI components with minimal business logic
- No external dependencies beyond React
- Simple prop interfaces
- Examples: Button, Input, Label, Icon

### Tier 2 (Moderate) - Target: 2 hours/component
- Components with moderate business logic
- May have 1-2 external dependencies
- State management requirements
- Examples: Form, Modal, Card, Dropdown

### Tier 3 (Complex) - Target: 1 day/component
- Complex components with significant business logic
- Multiple external dependencies
- Complex state and data management
- Examples: DataTable, Chart, Wizard, RichTextEditor

## Migration Status

| Tier | Total Components | Migrated | In Progress | Remaining |
|------|------------------|----------|-------------|-----------|
| Tier 1 | 0 | 0 | 0 | 0 |
| Tier 2 | 0 | 0 | 0 | 0 |
| Tier 3 | 0 | 0 | 0 | 0 |

## Usage

1. Components in this directory should NOT be modified
2. They serve as the immutable baseline for comparison
3. All migrations create new components in `/src/components/`
4. Equivalency tests compare baseline vs migrated components

## Component Migration Process

1. **Extract**: Copy DAISY v1 component to appropriate tier folder
2. **Analyze**: Document business logic patterns
3. **Transform**: Create Configurator v2 version in `/src/components/`
4. **Validate**: Run equivalency tests against baseline
5. **Document**: Generate migration report

## Notes

- This directory is excluded from build processes
- Components here use DAISY v1 dependencies
- Tests in this directory validate baseline behavior only
- Documentation preserves original component contracts
