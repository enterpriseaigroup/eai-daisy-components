# Quickstart: Component Architecture Migration Pipeline

**Generated**: 2025-10-22  
**Related**: [001-component-extraction-pipeline](./spec.md)

This guide helps developers quickly set up and use the component migration pipeline to transform DAISY v1 components into Configurator-compatible DAISY v2 components.

## Prerequisites

### System Requirements

- **Node.js**: 18.0+ (LTS recommended)
- **Package Manager**: npm 8.0+ (preferred) or npm 9.0+
- **TypeScript**: 5.0+ (installed globally or via project)
- **Git**: 2.30+ for version control and submodule management

### Development Environment

```bash
# Verify system requirements
node --version    # Should be 18.0+
npm --version    # Should be 8.0+
tsc --version     # Should be 5.0+
git --version     # Should be 2.30+
```

### Access Requirements

- **DAISY v1 Repository Access**: Read access to source DAISY v1 components
- **Configurator SDK**: Access to Configurator SDK v2.1.0+
- **Development Environment**: Local development environment with component build tools

## Installation

### Step 1: Clone and Setup Repository

```bash
# Clone the repository
git clone https://github.com/enterpriseaigroup/eai-daisy-components.git
cd eai-daisy-components

# Checkout the migration pipeline branch
git checkout 001-component-extraction-pipeline

# Install dependencies
npm install

# Install migration pipeline tools
npm install -g @eai/migration-cli
```

### Step 2: Configure DAISY v1 Source Access

```bash
# Add DAISY v1 repository as submodule
git submodule add https://github.com/enterpriseaigroup/daisy-v1.git daisyv1-source
git submodule update --init --recursive

# Verify DAISY v1 components are accessible
ls daisyv1-source/components/
```

### Step 3: Configure Configurator SDK

```bash
# Install Configurator SDK
npm add @configurator/sdk@^2.1.0

# Configure SDK credentials (if required)
npx configurator-cli login
```

### Step 4: Initialize Migration Pipeline

```bash
# Initialize migration configuration
npx migration-cli init

# Verify pipeline setup
npx migration-cli status
```

## Basic Usage

### Migrate Your First Component

Let's migrate a simple component to understand the process:

#### Step 1: List Available Components

```bash
# List all DAISY v1 components available for migration
npx migration-cli list --source=daisyv1

# Example output:
# ┌─────────────────┬──────────────┬──────────────┬─────────────────┐
# │ Component       │ Type         │ Complexity   │ Status          │
# ├─────────────────┼──────────────┼──────────────┼─────────────────┤
# │ button          │ form         │ simple       │ ready           │
# │ input           │ form         │ simple       │ ready           │
# │ modal           │ overlay      │ moderate     │ ready           │
# │ data-table      │ data-display │ complex      │ needs-analysis  │
# └─────────────────┴──────────────┴──────────────┴─────────────────┘
```

#### Step 2: Analyze Component

```bash
# Analyze a component before migration
npx migration-cli analyze button

# Example output:
# Component Analysis: button
# ┌─────────────────────────────────────────────────────────────────┐
# │ Business Logic Patterns Found:                                 │
# │ • Event Handling: onClick, onFocus, onBlur                     │
# │ • State Management: Local state (disabled, loading)            │
# │ • Validation: Props validation                                 │
# └─────────────────────────────────────────────────────────────────┘
# 
# Dependencies:
# • react: ^17.0.0 → ^18.0.0 (upgrade required)
# • @daisy/theme: ^1.0.0 → @configurator/theme: ^2.1.0 (replace)
# 
# Migration Complexity: SIMPLE
# Estimated Time: 2-3 minutes
```

#### Step 3: Run Migration

```bash
# Start component migration
npx migration-cli migrate button --target-version=2.0.0

# Example output:
# Starting migration: button (v1.2.3 → v2.0.0)
# 
# [1/6] Extracting DAISY v1 component...               ✓ (15s)
# [2/6] Analyzing business logic patterns...           ✓ (8s)
# [3/6] Transforming to Configurator architecture...   ✓ (32s)
# [4/6] Running equivalency tests...                   ✓ (18s)
# [5/6] Validating component integrity...              ✓ (12s)
# [6/6] Generating documentation...                    ✓ (7s)
# 
# Migration completed successfully!
# 
# Results:
# • DAISY v1 baseline: ./daisyv1/button/
# • DAISY v2 component: ./src/components/button/
# • Migration report: ./migration-reports/button-2024-10-22.json
```

#### Step 4: Verify Migration

```bash
# Run component tests
npx migration-cli test button --type=equivalency

# Example output:
# Running equivalency tests for button...
# 
# ✓ Visual rendering matches DAISY v1 (12 test cases)
# ✓ Event handling behavior preserved (8 test cases)
# ✓ Props interface compatibility (15 test cases)
# ✓ Accessibility features maintained (6 test cases)
# ✓ Performance within acceptable range (+8% bundle size)
# 
# All tests passed! Component migration verified.
```

### Batch Migration

For migrating multiple components:

```bash
# Migrate all simple components
npx migration-cli migrate-batch --complexity=simple

# Migrate specific components
npx migration-cli migrate-batch button input card --parallel=3

# Migrate all components with custom configuration
npx migration-cli migrate-batch --all --config=migration.config.json
```

## Project Structure After Migration

After running migrations, your project will have this structure:

```
eai-daisy-components/
├── daisyv1/                          # DAISY v1 baseline components
│   ├── button/
│   │   ├── component.json            # Component definition
│   │   ├── src/                      # Original source files
│   │   ├── tests/                    # Original tests
│   │   └── docs/                     # Original documentation
│   └── input/
│       └── ...
├── src/
│   └── components/                   # Migrated DAISY v2 components
│       ├── button/
│       │   ├── index.ts              # Main export
│       │   ├── Button.tsx            # Component implementation
│       │   ├── Button.test.tsx       # Equivalency tests
│       │   ├── Button.stories.tsx    # Storybook stories
│       │   ├── types.ts              # TypeScript definitions
│       │   └── README.md             # Component documentation
│       └── input/
│           └── ...
├── migration-data/
│   ├── progress.json                 # Overall migration progress
│   ├── issues.json                   # Tracked migration issues
│   └── reports/                      # Detailed migration reports
│       ├── button-2024-10-22.json
│       └── input-2024-10-22.json
└── docs/
    ├── migration-guide.md            # Detailed migration documentation
    └── transformation-patterns.md     # Business logic transformation patterns
```

## Configuration

### Migration Configuration File

Create `migration.config.json` to customize the migration process:

```json
{
  "sourceDirectory": "./daisyv1-source/components",
  "targetDirectory": "./src/components",
  "baselineDirectory": "./daisyv1",
  "configuratorVersion": "2.1.0",
  "migrationOptions": {
    "preserveOriginalStyles": true,
    "generateStorybook": true,
    "runEquivalencyTests": true,
    "generateDocumentation": true,
    "parallelMigrations": 3
  },
  "transformationRules": {
    "themeProvider": "@configurator/theme",
    "stateManagement": "local-first",
    "apiIntegration": "configurator-sdk"
  },
  "testingOptions": {
    "visualRegressionTesting": true,
    "accessibilityTesting": true,
    "performanceTesting": true,
    "equivalencyThreshold": 0.95
  }
}
```

### Environment Variables

```bash
# .env.local
CONFIGURATOR_API_URL=https://api.configurator.dev
CONFIGURATOR_API_KEY=your_api_key_here
MIGRATION_PARALLEL_JOBS=3
MIGRATION_TIMEOUT=300000
VISUAL_REGRESSION_THRESHOLD=0.02
```

## Common Workflows

### Development Workflow

1. **Analyze Before Migration**
   ```bash
   npx migration-cli analyze <component-name>
   ```

2. **Migrate Component**
   ```bash
   npx migration-cli migrate <component-name>
   ```

3. **Test Migration**
   ```bash
   npx migration-cli test <component-name> --type=all
   ```

4. **Review and Iterate**
   ```bash
   npx migration-cli report <component-name>
   ```

### Quality Assurance Workflow

1. **Run Full Test Suite**
   ```bash
   npx migration-cli test --all --type=equivalency
   ```

2. **Check Migration Issues**
   ```bash
   npx migration-cli issues --severity=high
   ```

3. **Generate Migration Report**
   ```bash
   npx migration-cli report --format=html --output=./reports/
   ```

### Continuous Integration Workflow

```yaml
# .github/workflows/migration-ci.yml
name: Migration Pipeline CI
on: [push, pull_request]

jobs:
  migration-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm install
        
      - name: Run migration tests
        run: |
          npx migration-cli test --all --type=equivalency
          npx migration-cli validate --all
```

## Troubleshooting

### Common Issues

**Issue**: Migration fails with "Configurator SDK not found"
```bash
# Solution: Install and configure Configurator SDK
npm add @configurator/sdk@^2.1.0
npx configurator-cli login
```

**Issue**: Component tests fail after migration
```bash
# Solution: Check equivalency test results
npx migration-cli test <component-name> --verbose
npx migration-cli report <component-name> --section=test-failures
```

**Issue**: Business logic transformation incomplete
```bash
# Solution: Check transformation rules and manual review
npx migration-cli analyze <component-name> --detailed
# Review: ./migration-data/reports/<component-name>-analysis.json
```

### Debug Mode

```bash
# Run migration with detailed logging
DEBUG=migration:* npx migration-cli migrate <component-name>

# Export migration logs
npx migration-cli logs --component=<component-name> --export=./debug.log
```

### Getting Help

```bash
# CLI help
npx migration-cli --help
npx migration-cli migrate --help

# Check system status
npx migration-cli doctor

# View migration documentation
npx migration-cli docs
```

## Next Steps

After completing your first migration:

1. **Review Migration Report**: Check `./migration-reports/` for detailed analysis
2. **Test Integration**: Verify the migrated component works in your application
3. **Update Documentation**: Review and update component documentation
4. **Plan Batch Migration**: Use learnings to plan migration of remaining components
5. **Setup CI/CD**: Integrate migration testing into your development workflow

## Advanced Usage

### Custom Transformation Rules

```typescript
// migration.custom.ts
import { TransformationRule } from '@eai/migration-cli';

export const customRules: TransformationRule[] = [
  {
    pattern: /useCustomHook\(/g,
    replacement: 'useConfiguratorHook(',
    reason: 'Replace custom hooks with Configurator equivalents'
  }
];
```

### Component-Specific Configuration

```json
// components/button/migration.json
{
  "transformationRules": {
    "preserveClassName": true,
    "customThemeMapping": "./button-theme-map.json"
  },
  "testingOverrides": {
    "skipVisualRegression": false,
    "additionalTestCases": ["./button-custom-tests.ts"]
  }
}
```

For more detailed information, see the [Migration Guide](../docs/migration-guide.md) and [API Reference](../docs/api-reference.md).