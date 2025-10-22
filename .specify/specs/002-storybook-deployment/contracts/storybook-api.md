# Storybook API Contracts

## GitHub Actions Workflow API

### Deployment Trigger

```yaml
name: Deploy Storybook
on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'daisyv1/**'
      - 'stories/**'
      - '.storybook/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    outputs:
      deployment-url: ${{ steps.deploy.outputs.url }}
      build-status: ${{ steps.deploy.outputs.status }}
```

### Build Status API

```json
{
  "buildId": "string",
  "status": "building" | "success" | "failed",
  "timestamp": "ISO 8601 date string",
  "commitHash": "string",
  "deploymentUrl": "string",
  "performanceMetrics": {
    "buildTime": "number (seconds)",
    "bundleSize": "number (bytes)",
    "pageLoadTime": "number (milliseconds)"
  }
}
```

## Storybook Configuration API

### Story Metadata Interface

```typescript
/**
 * Metadata for a Storybook story including migration status and documentation
 */
interface StoryMetadata {
  /** Unique identifier for the story */
  id: string;
  /** Display title of the story */
  title: string;
  /** Category classification for the component */
  category: 'daisyv1' | 'configurator' | 'shared';
  /** Current migration status of the component */
  migrationStatus: 'baseline' | 'in-progress' | 'completed' | 'n/a';
  /** React component type */
  component: React.ComponentType;
  /** Story parameters for documentation and migration tracking */
  parameters: {
    docs: {
      description: {
        story: string;
        component: string;
      };
    };
    migration?: {
      /** Reference to baseline component */
      baseline?: string;
      /** List of transformation notes */
      transformationNotes: string[];
      /** API changes during migration */
      apiChanges: string[];
    };
    accessibility: {
      /** Accessibility compliance status */
      status: 'compliant' | 'partial' | 'non-compliant';
      /** List of accessibility issues */
      issues: string[];
      /** ISO date string of last accessibility test */
      lastTested: string;
    };
  };
}
```

### Component Props Interface

```typescript
/**
 * Type definitions for component property types
 */
type PropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'function'
  | 'node'
  | 'element'
  | 'symbol'
  | 'any'
  | 'custom';

/**
 * Definition of a single component property
 */
interface ComponentPropDefinition {
  /** The TypeScript type of the prop */
  type: PropType;
  /** Whether the prop is required */
  required: boolean;
  /** Default value for the prop (use unknown for type safety) */
  defaultValue?: unknown;
  /** Description of the prop's purpose */
  description: string;
  /** Migration notes if prop changed during migration */
  migrationNotes?: string;
}

/**
 * Component props interface with type-safe property definitions
 */
interface ComponentProps {
  [propName: string]: ComponentPropDefinition;
}
```

## Component Documentation API

### Migration Comparison Interface

```typescript
/**
 * Business logic item with categorized documentation
 */
interface BusinessLogicItem {
  /** Unique identifier for the business logic item */
  id: string;
  /** Description of the business logic */
  description: string;
  /** Category of the business logic */
  category: 'validation' | 'calculation' | 'transformation' | 'state-management' | 'api-interaction';
}

/**
 * API reference with detailed documentation
 */
interface ApiReference {
  /** API endpoint or method name */
  name: string;
  /** HTTP method if applicable */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** API version */
  version: string;
  /** Whether API is deprecated */
  deprecated?: boolean;
}

/**
 * Semantic version string (e.g., "1.2.3")
 */
type SemanticVersion = `${number}.${number}.${number}`;

/**
 * Interface for comparing baseline and migrated components
 */
interface MigrationComparison {
  baselineComponent: {
    /** Unique component identifier */
    id: string;
    /** Semantic version of the baseline component */
    version: SemanticVersion;
    /** Documented business logic items */
    businessLogic: BusinessLogicItem[];
    /** API references used by the component */
    apis: ApiReference[];
  };
  migratedComponent: {
    /** Unique component identifier */
    id: string;
    /** Semantic version of the migrated component */
    version: SemanticVersion;
    /** Documented business logic items after migration */
    businessLogic: BusinessLogicItem[];
    /** API references after migration */
    apis: ApiReference[];
  };
  transformations: {
    /** Summary of the transformation */
    summary: string;
    businessLogicChanges: {
      /** Description of the change */
      description: string;
      /** Reason for the change */
      reason: string;
      /** Impact assessment of the change */
      impact: 'breaking' | 'compatible' | 'enhancement';
    }[];
    apiChanges: {
      /** Type of API change */
      type: 'added' | 'removed' | 'modified';
      /** Element that changed */
      element: string;
      /** Description of the change */
      description: string;
      /** Migration path for breaking changes */
      migrationPath?: string;
    }[];
  };
}
```

### Progress Tracking Interface

```typescript
/**
 * Migration progress tracking for the component library
 */
interface MigrationProgress {
  /** Total number of components in the library */
  totalComponents: number;
  /** Components grouped by migration status */
  byStatus: {
    baseline: number;
    'in-progress': number;
    completed: number;
    'n/a': number;
  };
  /** Category-specific progress tracking */
  categories: {
    daisyv1: {
      total: number;
      documented: number;
    };
    configurator: {
      total: number;
      migrated: number;
      documented: number;
    };
  };
  /** ISO date string of last update */
  lastUpdated: string;
}
```

## GitHub Pages Deployment API

### Site Configuration

```json
{
  "baseUrl": "https://enterpriseaigroup.github.io/eai-daisy-components/",
  "buildDir": "storybook-static",
  "deployBranch": "gh-pages",
  "customDomain": "components.daisy.ai",
  "sslEnabled": true
}
```

### Performance Monitoring

```typescript
/**
 * Core Web Vitals metrics
 */
interface CoreWebVitals {
  /** Largest Contentful Paint (ms) */
  lcp: number;
  /** First Input Delay (ms) */
  fid: number;
  /** Cumulative Layout Shift (score) */
  cls: number;
}

/**
 * Page load timing metrics
 */
interface LoadTimes {
  /** Time to initial page render (ms) */
  initial: number;
  /** Time to interactive (ms) */
  interactive: number;
  /** Time to complete page load (ms) */
  complete: number;
}

/**
 * Bundle analysis metrics
 */
interface BundleAnalysis {
  /** Total bundle size in bytes */
  totalSize: number;
  /** Size of individual chunks */
  chunkSizes: Map<string, number>;
  /** Amount of unused code in bytes */
  unusedCode: number;
}

/**
 * Complete performance metrics interface
 */
interface PerformanceMetrics {
  /** Core Web Vitals measurements */
  coreWebVitals: CoreWebVitals;
  /** Page load time metrics */
  loadTimes: LoadTimes;
  /** Bundle size analysis */
  bundleAnalysis: BundleAnalysis;
}
```

## Search and Navigation API

### Search Interface

```typescript
/**
 * Search result item from documentation search
 */
interface SearchResult {
  /** Unique identifier for the result */
  id: string;
  /** Display title of the result */
  title: string;
  /** Category of the result */
  category: string;
  /** Type of search result */
  type: 'component' | 'story' | 'documentation';
  /** Description of the result */
  description: string;
  /** URL to the result page */
  url: string;
  /** Migration status if applicable */
  migrationStatus?: 'baseline' | 'in-progress' | 'completed' | 'n/a';
  /** Tags for categorization */
  tags: string[];
  /** Relevance score (0-100) */
  relevanceScore: number;
}

/**
 * Search query parameters
 */
interface SearchQuery {
  /** Search query string */
  query: string;
  /** Optional filters to apply */
  filters?: {
    /** Filter by category */
    category?: string[];
    /** Filter by migration status */
    migrationStatus?: Array<'baseline' | 'in-progress' | 'completed' | 'n/a'>;
    /** Filter by result type */
    type?: Array<'component' | 'story' | 'documentation'>;
  };
  /** Sort order for results */
  sortBy?: 'relevance' | 'alphabetical' | 'category';
  /** Maximum number of results to return */
  limit?: number;
}
```

### Navigation Structure

```typescript
/**
 * Navigation node in the documentation tree
 */
interface NavigationNode {
  /** Unique identifier for the node */
  id: string;
  /** Display title of the node */
  title: string;
  /** Type of navigation node */
  type: 'category' | 'component' | 'documentation';
  /** URL if this is a leaf node */
  url?: string;
  /** Child navigation nodes */
  children?: NavigationNode[];
  /** Metadata about the node */
  metadata?: {
    /** Number of components in this category */
    componentCount?: number;
    /** Migration progress percentage (0-100) */
    migrationProgress?: number;
    /** ISO date string of last update */
    lastUpdated?: string;
  };
}
```