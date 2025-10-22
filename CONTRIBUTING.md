# Contributing to EAI DAISY Components

We welcome contributions to the EAI DAISY Components project! This document provides guidelines for contributing to ensure consistent code quality and collaboration.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Code Standards](#code-standards)
- [TypeScript Guidelines](#typescript-guidelines)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)
- [Pull Request Process](#pull-request-process)
- [Constitutional Principles](#constitutional-principles)

## Code of Conduct

This project adheres to a code of conduct that promotes a welcoming and inclusive environment. By participating, you agree to:

- Be respectful and professional in all interactions
- Focus on constructive feedback and solutions
- Help maintain a positive learning environment
- Report any inappropriate behavior to project maintainers

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js**: ≥18.0.0
- **pnpm**: ≥8.0.0 (required package manager)
- **Git**: Latest stable version
- **TypeScript**: Experience with TypeScript 5.0+

### Development Setup

1. **Fork the repository**
   ```bash
   # Via GitHub UI or CLI
   gh repo fork eai/eai-daisy-components
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/eai-daisy-components.git
   cd eai-daisy-components
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Verify setup**
   ```bash
   pnpm run typecheck
   pnpm test
   pnpm run lint
   ```

5. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

### Workflow Overview

1. **Issue Creation**: Create or claim an issue describing the work
2. **Branch Creation**: Create a feature branch from `main`
3. **Development**: Implement changes following code standards
4. **Testing**: Ensure all tests pass and coverage requirements met
5. **Documentation**: Update relevant documentation
6. **Pull Request**: Submit PR with detailed description
7. **Code Review**: Address feedback and iterate
8. **Merge**: Maintainer merges after approval

### Branch Naming

Use descriptive branch names with prefixes:

```bash
feature/component-extraction-pipeline
bugfix/memory-leak-in-parser
docs/api-reference-update
refactor/type-safety-improvements
```

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (no logic changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(pipeline): add component extraction algorithm
fix(parser): resolve memory leak in large file processing
docs(api): add ComponentExtractor usage examples
```

## Code Standards

### TypeScript Requirements

This project enforces **strict TypeScript safety**. All code must comply with:

#### 1. No `any` Types
```typescript
// ❌ BAD
function processData(data: any): void {
  // Implementation
}

// ✅ GOOD
function processData(data: ComponentData): void {
  // Implementation
}
```

#### 2. Explicit Return Types
```typescript
// ❌ BAD
function extractComponent(name) {
  return componentParser.parse(name);
}

// ✅ GOOD
function extractComponent(name: string): Promise<ExtractionResult> {
  return componentParser.parse(name);
}
```

#### 3. Runtime Validation
```typescript
// ✅ GOOD: Use Zod for external data
import { z } from 'zod';

const ComponentSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['functional', 'class']),
  props: z.record(z.unknown()),
});

function validateComponent(data: unknown): ComponentDefinition {
  return ComponentSchema.parse(data);
}
```

#### 4. Type Guards
```typescript
// ✅ GOOD: Proper type narrowing
function isValidComponent(data: unknown): data is ComponentDefinition {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'type' in data
  );
}
```

### React Component Standards

#### 1. Proper Props Typing
```typescript
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
}) => {
  // Implementation
};
```

#### 2. Event Handler Types
```typescript
// ✅ GOOD: Specific event types
const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
  const value = event.target.value;
  // Handle change
};
```

### Code Quality Rules

#### 1. Linting
All code must pass ESLint with no errors:
```bash
pnpm run lint
```

#### 2. Formatting
Use Prettier for consistent formatting:
```bash
pnpm run format
```

#### 3. Type Checking
All TypeScript must compile without errors:
```bash
pnpm run typecheck
```

## Testing Requirements

### Test Coverage

- **Minimum Coverage**: 80% for all metrics (lines, functions, branches, statements)
- **Test Types**: Unit tests for all public APIs, integration tests for pipelines
- **Test Files**: Co-located with source files or in `/tests` directory

### Testing Standards

#### 1. Test Structure
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { ComponentExtractor } from '@/pipeline';

describe('ComponentExtractor', () => {
  let extractor: ComponentExtractor;

  beforeEach(() => {
    extractor = new ComponentExtractor({
      sourcePath: '/test/path',
      outputPath: '/test/output',
    });
  });

  it('should extract component with valid configuration', async () => {
    const result = await extractor.extractComponent('TestComponent');
    
    expect(result).toMatchObject({
      success: true,
      componentName: 'TestComponent',
    });
  });
});
```

#### 2. Mock Typing
```typescript
// ✅ GOOD: Typed mocks
const mockParser: jest.Mocked<ComponentParser> = {
  parse: jest.fn(),
  validate: jest.fn(),
};

mockParser.parse.mockResolvedValue({
  name: 'TestComponent',
  type: 'functional',
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test ComponentExtractor.test.ts
```

## Documentation Standards

### 1. Code Documentation

All public APIs must have JSDoc comments:

```typescript
/**
 * Extracts a component from DAISY v1 to Configurator v2 architecture.
 * 
 * @param name - The component name to extract
 * @param options - Extraction configuration options
 * @returns Promise resolving to extraction result
 * 
 * @example
 * ```typescript
 * const result = await extractor.extractComponent('MyComponent', {
 *   preserveBaseline: true,
 * });
 * ```
 */
async extractComponent(
  name: string, 
  options?: ExtractionOptions
): Promise<ExtractionResult> {
  // Implementation
}
```

### 2. README Updates

When adding features, update the README.md:
- Add feature to the features list
- Update API reference if applicable
- Add usage examples
- Update roadmap if needed

### 3. Architecture Documentation

For significant changes, update documentation in `/docs`:
- Architecture decisions
- Design patterns
- Performance considerations
- Migration guides

## Pull Request Process

### 1. Before Submitting

Ensure your PR is ready:

```bash
# Run the full CI pipeline
pnpm run ci

# Check for merge conflicts
git fetch upstream
git rebase upstream/main
```

### 2. PR Description Template

Use this template for PR descriptions:

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed
- [ ] All tests pass locally

## Checklist
- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Code is properly commented
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] All linting passes
- [ ] Test coverage ≥80%

## Constitutional Compliance
- [ ] Component Independence maintained
- [ ] Visual-First Development principles followed
- [ ] Semantic Versioning respected
- [ ] Documentation-Driven Development completed
- [ ] Automated Quality Gates pass
```

### 3. Code Review Process

1. **Automated Checks**: All CI checks must pass
2. **Peer Review**: At least one maintainer approval required
3. **Constitutional Review**: Ensure adherence to project principles
4. **Final Testing**: Maintainer performs final verification

## Constitutional Principles

All contributions must align with our five constitutional principles:

### 1. Component Independence
- Components must be self-contained
- Minimal external dependencies
- Clear separation of concerns

### 2. Visual-First Development
- UI/UX considerations drive technical decisions
- Design system compliance
- Accessibility requirements

### 3. Semantic Versioning
- Strict version management
- Breaking changes properly documented
- Backward compatibility considerations

### 4. Documentation-Driven Development
- Features documented before implementation
- API documentation complete
- Usage examples provided

### 5. Automated Quality Gates
- All code must pass CI/CD pipeline
- Type safety enforced
- Test coverage requirements met

## Getting Help

### Resources

- **Documentation**: [docs/](./docs/)
- **API Reference**: [README.md](./README.md#api-reference)
- **Examples**: [examples/](./examples/)

### Communication

- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Code Review**: Provide constructive feedback in PR reviews

### Common Issues

**TypeScript Errors**: 
- Ensure strict mode compliance
- Use proper type annotations
- Avoid `any` types

**Test Failures**:
- Check test coverage requirements
- Verify mock implementations
- Ensure proper cleanup

**Linting Issues**:
- Run `pnpm run lint:fix` for auto-fixable issues
- Follow ESLint configuration
- Use Prettier for formatting

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Project acknowledgments

Thank you for contributing to EAI DAISY Components! 🎉