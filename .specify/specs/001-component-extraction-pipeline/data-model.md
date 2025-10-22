# Data Model: Component Architecture Migration Pipeline

**Generated**: 2025-10-22  
**Related**: [001-component-extraction-pipeline](./spec.md)

This document defines the core data entities and their relationships for the component migration pipeline.

## Core Entities

### ComponentDefinition

Represents a complete component specification including source code, metadata, and business logic.

```typescript
interface ComponentDefinition {
  id: string;                          // Unique component identifier
  name: string;                        // Human-readable component name
  version: string;                     // Semantic version (e.g., "1.2.3")
  type: ComponentType;                 // Component classification
  source: ComponentSource;             // Source code and assets
  metadata: ComponentMetadata;         // Component metadata
  businessLogic: BusinessLogicDefinition; // Business logic specification
  dependencies: ComponentDependency[]; // Component dependencies
  tests: TestDefinition[];            // Test specifications
  migration: MigrationStatus;          // Migration tracking
}

enum ComponentType {
  DAISY_V1 = 'daisy-v1',              // Original DAISY v1 component
  DAISY_V2 = 'daisy-v2',              // Migrated Configurator-compatible component
  UTILITY = 'utility',                // Shared utility component
  FOUNDATION = 'foundation'            // Base/foundation component
}
```

### ComponentSource

Contains the actual source code, styles, and assets for a component.

```typescript
interface ComponentSource {
  entryPoint: string;                  // Main component file path
  sourceFiles: SourceFile[];          // All source files
  styleFiles: StyleFile[];            // CSS/SCSS files
  assets: AssetFile[];                // Images, icons, etc.
  documentation: DocumentationFile[]; // Component documentation
}

interface SourceFile {
  path: string;                        // Relative file path
  content: string;                     // File content
  language: 'typescript' | 'javascript' | 'tsx' | 'jsx';
  hash: string;                        // Content hash for change detection
}

interface StyleFile {
  path: string;                        // Relative file path
  content: string;                     // Style content
  type: 'css' | 'scss' | 'sass' | 'less';
  hash: string;                        // Content hash
}

interface AssetFile {
  path: string;                        // Relative file path
  type: string;                        // MIME type
  size: number;                        // File size in bytes
  hash: string;                        // Content hash
}

interface DocumentationFile {
  path: string;                        // Relative file path
  content: string;                     // Markdown content
  type: 'readme' | 'story' | 'api' | 'changelog';
  hash: string;                        // Content hash
}
```

### BusinessLogicDefinition

Defines the business logic patterns and API integrations for a component.

```typescript
interface BusinessLogicDefinition {
  patterns: BusinessLogicPattern[];   // Identified business logic patterns
  apiIntegrations: ApiIntegration[];  // External API dependencies
  stateManagement: StateManagement;   // State management approach
  eventHandlers: EventHandler[];      // Component event handlers
  computedProperties: ComputedProperty[]; // Derived values
}

interface BusinessLogicPattern {
  type: PatternType;                   // Pattern classification
  description: string;                 // Pattern description
  sourceLocation: SourceLocation;     // Where pattern is implemented
  configuratorMapping?: ConfiguratorMapping; // How to map to Configurator
}

enum PatternType {
  DATA_FETCHING = 'data-fetching',     // API data retrieval
  STATE_MUTATION = 'state-mutation',   // State updates
  EVENT_HANDLING = 'event-handling',   // User interaction handling
  VALIDATION = 'validation',           // Input validation
  TRANSFORMATION = 'transformation',   // Data transformation
  SIDE_EFFECT = 'side-effect'         // External side effects
}

interface ApiIntegration {
  name: string;                        // API name/identifier
  baseUrl: string;                     // API base URL
  endpoints: ApiEndpoint[];            // Used endpoints
  authentication: AuthenticationMethod; // Auth requirements
  configuratorEquivalent?: string;    // Configurator API equivalent
}

interface StateManagement {
  type: 'local' | 'context' | 'redux' | 'zustand' | 'custom';
  stateShape: Record<string, StateProperty>; // State structure
  actions: StateAction[];              // Available actions
}
```

### MigrationStatus

Tracks the progress and status of component migration.

```typescript
interface MigrationStatus {
  phase: MigrationPhase;               // Current migration phase
  progress: number;                    // Progress percentage (0-100)
  startedAt: Date;                     // Migration start timestamp
  lastUpdated: Date;                   // Last progress update
  completedAt?: Date;                  // Migration completion timestamp
  issues: MigrationIssue[];           // Identified issues
  validations: ValidationResult[];     // Validation results
}

enum MigrationPhase {
  NOT_STARTED = 'not-started',         // Migration not yet begun
  EXTRACTING = 'extracting',           // Extracting from DAISY v1
  ANALYZING = 'analyzing',             // Analyzing business logic
  TRANSFORMING = 'transforming',       // Creating V2 component
  TESTING = 'testing',                 // Running equivalency tests
  VALIDATING = 'validating',           // Final validation
  COMPLETED = 'completed',             // Migration finished
  FAILED = 'failed'                    // Migration failed
}

interface MigrationIssue {
  id: string;                          // Issue identifier
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: IssueCategory;             // Issue classification
  message: string;                     // Issue description
  sourceLocation?: SourceLocation;    // Where issue occurs
  suggestion?: string;                 // Suggested resolution
  resolved: boolean;                   // Resolution status
}

enum IssueCategory {
  COMPATIBILITY = 'compatibility',     // API compatibility issues
  PERFORMANCE = 'performance',         // Performance concerns
  SECURITY = 'security',               // Security considerations
  ACCESSIBILITY = 'accessibility',     // A11y issues
  BUSINESS_LOGIC = 'business-logic',   // Business logic transformation issues
  DEPENDENCIES = 'dependencies'        // Dependency conflicts
}
```

### ComponentDependency

Represents dependencies between components and external libraries.

```typescript
interface ComponentDependency {
  name: string;                        // Dependency name
  version: string;                     // Required version
  type: DependencyType;                // Dependency classification
  source: DependencySource;            // Where dependency comes from
  optional: boolean;                   // Whether dependency is optional
  migrationImpact: MigrationImpact;   // How migration affects this dependency
}

enum DependencyType {
  COMPONENT = 'component',             // Other components
  LIBRARY = 'library',                 // External libraries
  UTILITY = 'utility',                 // Utility functions
  API = 'api',                         // API dependencies
  STYLE = 'style'                      // Style dependencies
}

enum DependencySource {
  NPM = 'npm',                         // NPM package
  INTERNAL = 'internal',               // Internal component/utility
  CDN = 'cdn',                         // CDN resource
  LOCAL = 'local'                      // Local file
}

interface MigrationImpact {
  action: 'keep' | 'replace' | 'remove' | 'upgrade';
  replacement?: string;                // Replacement dependency if applicable
  reason: string;                      // Why this action is needed
}
```

### TestDefinition

Defines test specifications for component validation.

```typescript
interface TestDefinition {
  id: string;                          // Test identifier
  name: string;                        // Test name
  type: TestType;                      // Test classification
  category: TestCategory;              // Test category
  specification: TestSpecification;   // Test details
  expectedResult: TestResult;          // Expected outcome
  actualResult?: TestResult;           // Actual test result
}

enum TestType {
  UNIT = 'unit',                       // Unit tests
  INTEGRATION = 'integration',         // Integration tests
  EQUIVALENCY = 'equivalency',         // V1 vs V2 equivalency tests
  VISUAL = 'visual',                   // Visual regression tests
  ACCESSIBILITY = 'accessibility',     // A11y tests
  PERFORMANCE = 'performance'          // Performance tests
}

enum TestCategory {
  RENDERING = 'rendering',             // Component rendering
  INTERACTION = 'interaction',         // User interactions
  STATE = 'state',                     // State management
  PROPS = 'props',                     // Props handling
  EVENTS = 'events',                   // Event handling
  BUSINESS_LOGIC = 'business-logic'    // Business logic validation
}

interface TestSpecification {
  description: string;                 // Test description
  setup: TestSetup;                    // Test setup requirements
  actions: TestAction[];               // Test actions to perform
  assertions: TestAssertion[];         // Expected outcomes
}

interface TestResult {
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  executionTime: number;               // Test execution time in ms
  details?: string;                    // Additional result details
  artifacts?: TestArtifact[];          // Generated test artifacts
}
```

## Entity Relationships

### Component Hierarchy

```
ComponentDefinition
├── ComponentSource (1:1)
│   ├── SourceFile[] (1:many)
│   ├── StyleFile[] (1:many)
│   ├── AssetFile[] (1:many)
│   └── DocumentationFile[] (1:many)
├── BusinessLogicDefinition (1:1)
│   ├── BusinessLogicPattern[] (1:many)
│   ├── ApiIntegration[] (1:many)
│   └── StateManagement (1:1)
├── ComponentDependency[] (1:many)
├── TestDefinition[] (1:many)
└── MigrationStatus (1:1)
    ├── MigrationIssue[] (1:many)
    └── ValidationResult[] (1:many)
```

### Migration Workflow States

```
ComponentDefinition (DAISY_V1)
    ↓ [extraction]
MigrationStatus (EXTRACTING)
    ↓ [analysis]
BusinessLogicDefinition (populated)
    ↓ [transformation]
ComponentDefinition (DAISY_V2)
    ↓ [testing]
TestDefinition[] (executed)
    ↓ [validation]
MigrationStatus (COMPLETED)
```

## Data Validation Rules

### ComponentDefinition Validation

- `id` must be unique across all components
- `name` must follow kebab-case naming convention
- `version` must be valid semantic version
- DAISY_V2 components must have corresponding DAISY_V1 baseline

### BusinessLogicDefinition Validation

- At least one BusinessLogicPattern must be defined
- All ApiIntegrations must have valid configuratorEquivalent for V2 components
- StateManagement type must be compatible with Configurator architecture

### MigrationStatus Validation

- Progress must be between 0-100
- Phase transitions must follow valid sequence
- Critical issues must be resolved before COMPLETED phase

### TestDefinition Validation

- All EQUIVALENCY tests must pass before migration completion
- ACCESSIBILITY tests must meet WCAG 2.1 AA standards
- PERFORMANCE tests must not exceed baseline component performance by >20%

## Storage Considerations

### File System Organization

```
components/
├── daisy-v1/                        # DAISY v1 baseline components
│   └── [component-name]/
│       ├── component.json           # ComponentDefinition
│       ├── src/                     # Source files
│       ├── styles/                  # Style files
│       ├── assets/                  # Asset files
│       └── docs/                    # Documentation
├── daisy-v2/                        # Migrated V2 components
│   └── [component-name]/
│       ├── component.json           # ComponentDefinition
│       ├── src/                     # Transformed source
│       ├── tests/                   # Test files
│       └── migration/               # Migration artifacts
└── migration-data/                  # Migration pipeline data
    ├── progress.json                # Overall migration progress
    ├── issues.json                  # Aggregated issues
    └── reports/                     # Migration reports
```

### Data Persistence

- ComponentDefinition: JSON files with component metadata
- Source files: Original file formats preserved
- Migration status: JSON with timestamped progress tracking
- Test results: JSON with execution artifacts and screenshots
- Issues: JSON with structured issue tracking and resolution status