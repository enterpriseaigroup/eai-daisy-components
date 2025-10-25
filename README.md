# EAI DAISY Components

Component extraction pipeline for migrating DAISY v1 components to Configurator v2 architecture with business logic preservation.

## Overview

This project implements a comprehensive pipeline for extracting and migrating components from the legacy DAISY v1 system to the modern Configurator v2 architecture. The pipeline preserves all business logic while upgrading the technology stack and improving maintainability.

## Features

### 🔄 Component Migration Pipeline

- **Automated Extraction**: Scan and identify DAISY v1 components
- **Business Logic Preservation**: Maintain all existing functionality
- **Modern Architecture**: Upgrade to Configurator v2 with React 18+
- **Type Safety**: Full TypeScript integration with strict mode

### 📊 Performance Targets

- ≤ 30 minutes processing time per component
- ≤ 120% bundle size vs V1 baseline
- ≤ 500MB memory usage during processing
- Serial processing for reliability

### 🏗️ Architecture

- **Source Preservation**: `/daisyv1/` baseline maintained
- **Modern Stack**: TypeScript 5.0+, React 18+, Vite 4.0+
- **Quality Assurance**: Automated testing and quality gates
- **Documentation-Driven**: Comprehensive docs and examples

## Quick Start

### Prerequisites

- **Node.js**: ≥18.0.0
- **pnpm**: ≥8.0.0
- **Git**: For version control

### Installation

```bash
# Clone the repository
git clone https://github.com/eai/eai-daisy-components.git
cd eai-daisy-components

# Install dependencies
pnpm install

# Run type checking
pnpm run typecheck

# Run tests
pnpm test

# Start development mode
pnpm run dev
```

### V2 Component Generation

Generate modern V2 components from DAISY v1 baselines with full business logic preservation:

```bash
# Generate a V2 component
npm run migrate:v2 -- --component=GetAddressCard

# Preview pseudo-code without creating files
npm run migrate:v2 -- --component=GetAddressCard --dry-run

# Generate with verbose logging
npm run migrate:v2 -- --component=GetAddressCard --verbose

# Generate to custom output directory
npm run migrate:v2 -- --component=GetAddressCard --output=./custom/path
```

#### Recovery Commands

If generation fails or needs to be reset:

```bash
# Resume failed components from previous run
npm run migrate:v2 -- --resume

# Clean up incomplete/orphaned directories
npm run migrate:v2 -- --cleanup

# Rollback all generated components
npm run migrate:v2 -- --rollback

# Regenerate a specific component
npm run migrate:v2 -- --regenerate GetAddressCard
```

#### Generation Features

- ✅ **Configurator SDK Integration**: Automatic SDK v2.1.0+ integration with state management
- ✅ **shadcn/ui Components**: Modern UI components (Button, Card, Alert, Spinner)
- ✅ **Business Logic Preservation**: Full pseudo-code documentation with 6 constitutional fields
- ✅ **TypeScript Type Safety**: Strict mode with comprehensive type definitions
- ✅ **Error Boundaries**: Automatic error handling and recovery patterns
- ✅ **Accessibility**: WCAG 2.1 AA compliant components
- ✅ **Atomic File Operations**: Safe file writes prevent corruption
- ✅ **Path Validation**: Security against path traversal attacks
- ✅ **Sensitive Data Redaction**: Automatic masking of API keys, tokens, PII in logs

#### Exit Codes

The V2 generation CLI uses specific exit codes for automation:

- `0`: Success - Component generated successfully
- `1`: Validation error - Invalid input or missing baseline
- `2`: Compilation error - Generated code doesn't compile
- `3`: Business logic incomplete - Missing required pseudo-code fields
- `4`: Filesystem error - Permission denied or disk full

### Basic Usage

```typescript
import { ComponentExtractor } from '@/pipeline';

const extractor = new ComponentExtractor({
  sourcePath: '/path/to/daisyv1',
  outputPath: './output',
  preserveBaseline: true,
});

// Extract a single component
const result = await extractor.extractComponent('MyComponent');

// Batch extraction
const results = await extractor.extractBatch(['Component1', 'Component2']);
```

## Project Structure

```text
eai-daisy-components/
├── src/                    # Source code
│   ├── pipeline/          # Core extraction pipeline
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── tests/                 # Test files
├── docs/                  # Documentation
├── examples/              # Usage examples
├── packages/              # Sub-packages
└── .specify/              # Specification artifacts
```

## Development

### Available Scripts

```bash
# Development
pnpm run dev              # Start development server
pnpm run build            # Build for production
pnpm run preview          # Preview production build

# Code Quality
pnpm run typecheck        # TypeScript type checking
pnpm run lint             # Lint code
pnpm run lint:fix         # Fix linting issues
pnpm run format           # Format code
pnpm run format:check     # Check code formatting

# Testing
pnpm test                 # Run tests
pnpm run test:watch       # Run tests in watch mode
pnpm run test:types       # Type-only testing

# CI/CD
pnpm run ci               # Full CI pipeline
```

### Code Quality Standards

This project follows strict TypeScript safety guidelines:

- **No `any` types**: All code must be properly typed
- **Strict mode enabled**: TypeScript strict mode enforced
- **Runtime validation**: External data validated with Zod
- **Comprehensive testing**: 80%+ code coverage required
- **Documentation-driven**: All features documented

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/component-extraction

# Make changes with proper commit messages
git commit -m "feat: add component extraction pipeline"

# Run quality checks before push
pnpm run ci

# Push and create PR
git push origin feature/component-extraction
```

## Configuration

### TypeScript Configuration

The project uses strict TypeScript configuration in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
    // ... other strict options
  }
}
```

### Build Configuration

Vite configuration optimizes for:

- Bundle size ≤120% of V1 baseline
- Modern ES2022 target
- Proper chunk splitting
- Source maps for debugging

## Constitutional Principles

This project follows five core constitutional principles:

1. **Component Independence**: Components are self-contained with minimal dependencies
2. **Visual-First Development**: UI/UX considerations drive technical decisions
3. **Semantic Versioning**: Strict version management for compatibility
4. **Documentation-Driven Development**: Comprehensive documentation for all features
5. **Automated Quality Gates**: Continuous integration and quality assurance

## Performance

### Benchmarks

| Metric          | Target           | Current |
| --------------- | ---------------- | ------- |
| Processing Time | ≤30min/component | TBD     |
| Bundle Size     | ≤120% vs V1      | TBD     |
| Memory Usage    | ≤500MB           | TBD     |
| Test Coverage   | ≥80%             | TBD     |

### Optimization

- **Serial Processing**: Reliable component-by-component migration
- **Memory Management**: Careful resource cleanup
- **Bundle Optimization**: Tree shaking and code splitting
- **Type Safety**: Compile-time error prevention

## API Reference

### ComponentExtractor

Main pipeline class for component extraction:

```typescript
interface ComponentExtractor {
  extractComponent(name: string): Promise<ExtractionResult>;
  extractBatch(names: string[]): Promise<ExtractionResult[]>;
  validateComponent(component: ComponentDefinition): boolean;
}
```

### Configuration Options

```typescript
interface ExtractorConfig {
  sourcePath: string; // DAISY v1 source directory
  outputPath: string; // Output directory for migrated components
  preserveBaseline: boolean; // Keep original /daisyv1/ structure
  strictMode: boolean; // Enable strict validation
  memoryLimit: number; // Memory usage limit in MB
}
```

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Setup

1. Fork the repository
2. Create your feature branch
3. Install dependencies: `pnpm install`
4. Make your changes
5. Run tests: `pnpm test`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [docs/](./docs/)
- **Examples**: [examples/](./examples/)
- **Issues**: [GitHub Issues](https://github.com/eai/eai-daisy-components/issues)
- **Discussions**: [GitHub Discussions](https://github.com/eai/eai-daisy-components/discussions)

## Roadmap

- [x] Project setup and configuration
- [x] TypeScript strict mode implementation
- [ ] Core pipeline development
- [ ] Component extraction algorithms
- [ ] Configurator v2 integration
- [ ] Performance optimization
- [ ] Production deployment

## Acknowledgments

- EAI Development Team
- DAISY v1 Legacy System Contributors
- Configurator v2 Architecture Team
- Open Source Community
