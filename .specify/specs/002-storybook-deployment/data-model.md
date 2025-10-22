# Data Model: Public Storybook Deployment

**Feature**: 002-storybook-deployment
**Created**: 2025-10-22

## Core Entities

### Component Story

**Purpose**: Individual documentation page for a component with interactive examples

**Attributes**:

- `id`: Unique identifier (string)
- `title`: Display name (string)
- `category`: Component category (daisyv1 | configurator | shared)
- `migrationStatus`: Migration progress (baseline | in-progress | completed | n/a)
- `description`: Component purpose and functionality (string)
- `props`: Component properties interface (TypeScript interface)
- `examples`: Array of usage examples with code snippets
- `transformationNotes`: Migration documentation (string, optional)
- `accessibilityInfo`: Accessibility compliance status (object)

**Relationships**:

- Has many: Component Examples
- Belongs to: Component Category
- References: Migration Comparison (optional)

### Component Category

**Purpose**: Organizational structure for grouping related components

**Attributes**:

- `id`: Category identifier (string)
- `name`: Display name (string)
- `type`: Category type (daisyv1 | configurator | shared)
- `description`: Category purpose (string)
- `sortOrder`: Display order (number)
- `componentCount`: Number of components in category (number)

**Relationships**:

- Has many: Component Stories
- Belongs to: Documentation Structure

### Migration Comparison

**Purpose**: Side-by-side comparison between DAISY v1 baseline and Configurator version

**Attributes**:

- `id`: Comparison identifier (string)
- `baselineComponentId`: DAISY v1 component reference (string)
- `migratedComponentId`: Configurator component reference (string)
- `transformationSummary`: High-level changes description (string)
- `businessLogicChanges`: Detailed transformation notes (array of strings)
- `apiChanges`: Interface modifications (object)
- `performanceImpact`: Migration performance notes (string)

**Relationships**:

- References: Component Story (baseline)
- References: Component Story (migrated)

### Component Example

**Purpose**: Interactive usage example with code and preview

**Attributes**:

- `id`: Example identifier (string)
- `title`: Example name (string)
- `code`: Source code snippet (string)
- `description`: Example purpose (string)
- `props`: Example-specific props (object)
- `variations`: Alternative configurations (array)

**Relationships**:

- Belongs to: Component Story

### Deployment Package

**Purpose**: Built Storybook site ready for GitHub Pages deployment

**Attributes**:

- `buildId`: Unique build identifier (string)
- `timestamp`: Build creation time (ISO date string)
- `version`: Component library version (semver string)
- `commitHash`: Git commit reference (string)
- `buildStatus`: Deployment status (building | success | failed)
- `siteUrl`: Deployed site URL (string)
- `performanceMetrics`: Site performance data (object)

**Relationships**:

- Contains: All Component Stories
- References: Git Commit

## State Transitions

### Component Migration Status

```text
baseline → in-progress → completed
         ↓
        n/a (for Configurator-only components)
```

### Deployment Status

```text
building → success
        ↓
       failed → retry → building
```

## Validation Rules

### Component Story Validation

- `id` must be unique across all stories
- `category` must be valid enum value
- `props` must contain valid TypeScript interface
- If `migrationStatus` is "completed", `transformationNotes` is required
- `accessibilityInfo` must include compliance status

### Migration Comparison Validation

- Both `baselineComponentId` and `migratedComponentId` must reference valid components
- `baselineComponentId` must have category "daisyv1"
- `migratedComponentId` must have category "configurator"
- `businessLogicChanges` array cannot be empty if components have different functionality

### Deployment Package Validation

- `version` must follow semantic versioning
- `commitHash` must be valid Git SHA
- `siteUrl` must be valid HTTPS URL
- `performanceMetrics` must include core web vitals if available

## Data Sources

### Component Metadata

- Source: Component source files and documentation comments
- Format: TypeScript interfaces and JSDoc comments
- Update frequency: On component file changes

### Migration Documentation

- Source: Manual documentation and automated analysis
- Format: Markdown files and structured metadata
- Update frequency: On migration completion

### Build Information

- Source: GitHub Actions workflow data
- Format: JSON build artifacts
- Update frequency: On each deployment

### Performance Data

- Source: Lighthouse and Core Web Vitals reports
- Format: JSON performance metrics
- Update frequency: Daily automated testing