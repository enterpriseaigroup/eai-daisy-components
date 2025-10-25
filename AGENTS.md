# AI Agent Guidelines for TypeScript-Safe Development

## Overview

This document provides comprehensive guidelines for AI agents to ensure all generated content is TypeScript-safe, including code, configuration files, and markdown documentation.

## Core Principles

### 1. TypeScript First

- **Always generate TypeScript files** (`.ts`, `.tsx`) instead of JavaScript unless explicitly required
- **Enable strict mode** in all TypeScript configurations
- **Prefer explicit types** over implicit type inference for public APIs
- **Use type guards** and runtime validation for external data

### 2. Type Safety Requirements

#### For All Generated Code

```typescript
// ✅ GOOD: Explicit types
interface ComponentProps {
  title: string;
  count: number;
  isActive: boolean;
  onClick: (id: string) => void;
}

// ❌ BAD: Implicit any
const handleClick = data => {
  /* ... */
};

// ✅ GOOD: Typed parameters
const handleClick = (data: UserData): void => {
  /* ... */
};
```

#### Required TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Component Generation Guidelines

### React Components

#### Always Use Typed Props

```typescript
// ✅ GOOD: Properly typed component
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  children,
}) => {
  // Implementation
};

// ❌ BAD: Untyped component
export const Button = props => {
  // Implementation
};
```

#### Use Proper Event Types

```typescript
// ✅ GOOD: Typed events
const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
  const value = event.target.value;
  // ...
};

const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
  event.preventDefault();
  // ...
};

// ❌ BAD: Generic or untyped events
const handleChange = (e: any) => {
  /* ... */
};
```

### State Management

#### Typed State

```typescript
// ✅ GOOD: Typed state
interface AppState {
  user: User | null;
  isLoading: boolean;
  errors: Error[];
}

const [state, setState] = useState<AppState>({
  user: null,
  isLoading: false,
  errors: [],
});

// ❌ BAD: Untyped state
const [state, setState] = useState({});
```

#### Typed Context

```typescript
// ✅ GOOD: Typed context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined
);

// Custom hook with type guard
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

## API and Data Handling

### Type-Safe API Calls

```typescript
// ✅ GOOD: Typed API response
interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  // Runtime validation
  if (!isValidUser(data)) {
    throw new Error('Invalid user data received');
  }

  return {
    data,
    status: response.status,
  };
}

// Type guard for runtime validation
function isValidUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).name === 'string'
  );
}
```

### Zod for Runtime Validation

```typescript
import { z } from 'zod';

// Define schema
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

// Infer TypeScript type from schema
type User = z.infer<typeof UserSchema>;

// Use for validation
function parseUserData(data: unknown): User {
  return UserSchema.parse(data); // Throws if invalid
}
```

## Markdown Generation Guidelines

### Type-Safe Markdown Generation

#### Use Template Literals with Type Checking

```typescript
interface MarkdownSection {
  title: string;
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

function generateMarkdownSection(section: MarkdownSection): string {
  const heading = '#'.repeat(section.level);
  return `${heading} ${section.title}\n\n${section.content}\n\n`;
}

// Type-safe markdown builder
class MarkdownBuilder {
  private sections: string[] = [];

  addHeading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 1): this {
    this.sections.push('#'.repeat(level) + ' ' + text);
    return this;
  }

  addParagraph(text: string): this {
    this.sections.push(text);
    return this;
  }

  addCodeBlock(code: string, language: string = 'typescript'): this {
    this.sections.push(`\`\`\`${language}\n${code}\n\`\`\``);
    return this;
  }

  addList(items: string[], ordered: boolean = false): this {
    const listItems = items.map((item, index) =>
      ordered ? `${index + 1}. ${item}` : `- ${item}`
    );
    this.sections.push(listItems.join('\n'));
    return this;
  }

  build(): string {
    return this.sections.join('\n\n');
  }
}
```

#### Validate Markdown Structure

```typescript
interface DocumentStructure {
  title: string;
  description?: string;
  sections: Array<{
    heading: string;
    content: string;
    subsections?: Array<{
      heading: string;
      content: string;
    }>;
  }>;
}

function generateDocument(structure: DocumentStructure): string {
  const builder = new MarkdownBuilder();

  builder.addHeading(structure.title, 1);

  if (structure.description) {
    builder.addParagraph(structure.description);
  }

  structure.sections.forEach(section => {
    builder.addHeading(section.heading, 2);
    builder.addParagraph(section.content);

    section.subsections?.forEach(subsection => {
      builder.addHeading(subsection.heading, 3);
      builder.addParagraph(subsection.content);
    });
  });

  return builder.build();
}
```

## File System Operations

### Type-Safe File Operations

```typescript
import * as fs from 'fs/promises';
import * as path from 'path';

interface FileOperation {
  path: string;
  content: string;
  encoding?: BufferEncoding;
}

async function safeWriteFile(operation: FileOperation): Promise<void> {
  const { path: filePath, content, encoding = 'utf-8' } = operation;

  // Validate path
  if (!path.isAbsolute(filePath)) {
    throw new Error('Path must be absolute');
  }

  // Ensure directory exists
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  // Write file
  await fs.writeFile(filePath, content, encoding);
}

// Type-safe JSON operations
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  await safeWriteFile({ path: filePath, content });
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}
```

## Testing Guidelines

### Type-Safe Testing

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';

// Type your test data
interface TestUser {
  id: string;
  name: string;
  email: string;
}

describe('User Service', () => {
  let testUser: TestUser;

  beforeEach(() => {
    testUser = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
    };
  });

  it('should create a user with valid data', async () => {
    const result = await createUser(testUser);

    expect(result).toMatchObject<Partial<TestUser>>({
      name: testUser.name,
      email: testUser.email,
    });
  });
});
```

### Mock Types

```typescript
// Type-safe mocks
const mockUserService: jest.Mocked<UserService> = {
  getUser: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

// Type-safe mock implementations
mockUserService.getUser.mockImplementation(
  async (id: string): Promise<User> => {
    return { id, name: 'Mock User', email: 'mock@example.com' };
  }
);
```

## Configuration Files

### Package.json Scripts

```json
{
  "scripts": {
    "build": "tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "test": "jest --coverage",
    "test:types": "tsc --noEmit --project tsconfig.test.json"
  }
}
```

### ESLint Configuration for TypeScript

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
  },
};
```

## Common Patterns and Anti-Patterns

### Do's ✅

1. **Always define return types for functions**

   ```typescript
   function calculate(a: number, b: number): number {
     return a + b;
   }
   ```

2. **Use discriminated unions for complex types**

   ```typescript
   type Result<T> =
     | { success: true; data: T }
     | { success: false; error: string };
   ```

3. **Leverage const assertions**

   ```typescript
   const COLORS = ['red', 'green', 'blue'] as const;
   type Color = (typeof COLORS)[number]; // 'red' | 'green' | 'blue'
   ```

4. **Use unknown instead of any for unknown types**

   ```typescript
   function processData(data: unknown): void {
     if (typeof data === 'string') {
       // data is now string
     }
   }
   ```

### Don'ts ❌

1. **Never use `any` type**

   ```typescript
   // ❌ BAD
   let data: any = fetchData();

   // ✅ GOOD
   let data: unknown = fetchData();
   ```

2. **Avoid type assertions without validation**

   ```typescript
   // ❌ BAD
   const user = data as User;

   // ✅ GOOD
   const user = validateUser(data) ? data : null;
   ```

3. **Don't ignore TypeScript errors**

   ```typescript
   // ❌ BAD
   // @ts-ignore
   someFunction(wrongType);

   // ✅ GOOD
   someFunction(properlyTypedValue);
   ```

## Checklist for Generated Content

Before completing any generation task, ensure:

**TypeScript Requirements:**

- [ ] All TypeScript files use `.ts` or `.tsx` extensions
- [ ] No `any` types are used
- [ ] All function parameters have explicit types
- [ ] All function return types are defined
- [ ] Interfaces are defined for all complex objects
- [ ] Props interfaces are defined for all React components
- [ ] Event handlers use proper React event types
- [ ] API responses have defined types
- [ ] Runtime validation is implemented for external data
- [ ] Error handling is type-safe
- [ ] Test files include proper type definitions
- [ ] Configuration files enable strict TypeScript checks
- [ ] Generated markdown uses type-safe builders when programmatic
- [ ] All imports/exports are properly typed

**Markdown Linting Requirements:**

- [ ] Blank lines before AND after all headings (MD022)
- [ ] Blank lines before AND after all code blocks (MD031)
- [ ] Blank lines before AND after all lists (MD032)
- [ ] Language specified for all code blocks (MD040)
- [ ] No trailing spaces except line breaks (MD009)
- [ ] Sequential numbering in ordered lists (MD029)
- [ ] No duplicate heading text in same document (MD024)

**Code Linting Requirements:**

- [ ] ESLint passes with zero errors
- [ ] Prettier formatting applied
- [ ] No TypeScript compilation errors
- [ ] All linting rules from `.markdownlintrc` and `.eslintrc.cjs` followed

## Linting Standards

### Markdown Linting Rules

**Configuration**: `.markdownlintrc` with `{"default": true, "MD013": false}`

#### MD022: Blanks Around Headings

Always add blank lines before AND after headings:

```markdown
<!-- ❌ BAD -->
Some text
## Heading
More text

<!-- ✅ GOOD -->
Some text

## Heading

More text
```

#### MD031: Blanks Around Fences

Always add blank lines before AND after code blocks:

````markdown
<!-- ❌ BAD -->
Some text
```typescript
code
```
More text

<!-- ✅ GOOD -->
Some text

```typescript
code
```

More text
````

#### MD032: Blanks Around Lists

Always add blank lines before AND after lists:

```markdown
<!-- ❌ BAD -->
Some text
- Item 1
- Item 2
More text

<!-- ✅ GOOD -->
Some text

- Item 1
- Item 2

More text
```

#### MD040: Fenced Code Language

Always specify language for code blocks:

````markdown
<!-- ❌ BAD -->
```text
code here
```

<!-- ✅ GOOD -->
```typescript
code here
```
````

#### MD009: No Trailing Spaces

Never leave trailing spaces at end of lines (unless exactly 2 for line breaks):

```markdown
<!-- ❌ BAD -->
Line with trailing spaces    

<!-- ✅ GOOD -->
Line without trailing spaces
```

#### MD029: Ordered List Prefix

Use sequential numbering (1, 2, 3) in ordered lists:

```markdown
<!-- ❌ BAD -->
1. First
1. Second
1. Third

<!-- ✅ GOOD -->
1. First
2. Second
3. Third
```

#### MD024: No Duplicate Heading

Avoid duplicate heading text in same document:

```markdown
<!-- ❌ BAD -->
## Introduction
Content...

## Introduction
More content...

<!-- ✅ GOOD -->
## Introduction
Content...

## Background
More content...
```

### Pre-Generation Workflow

Before generating ANY markdown or code content:

1. **Identify File Type**: Markdown (.md), TypeScript (.ts/.tsx), JSON, etc.
2. **Review Applicable Rules**: Markdown rules for .md, TypeScript rules for .ts/.tsx
3. **Plan Structure**: Design content structure with linting rules in mind
4. **Generate Content**: Follow rules during generation (don't fix later)
5. **Mental Validation**: Check output against rules before returning to user

### Common Violations to Avoid

**Markdown:**

- Missing blank lines around headings, code blocks, lists
- Missing language specifiers on code blocks (use `typescript`, `bash`, `json`, etc.)
- Trailing spaces at end of lines
- Non-sequential numbering in ordered lists (1, 1, 1 instead of 1, 2, 3)
- Duplicate heading text within same document

**TypeScript:**

- Using `any` type without explicit justification
- Missing return type annotations on functions
- Implicit types where explicit types are better
- Missing interfaces for complex objects
- Untyped event handlers in React components

### Automated Validation

Use project scripts to validate before committing:

```bash
# Lint and fix markdown
npm run format

# Lint TypeScript
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Zod - Runtime Validation](https://zod.dev/)
- [Type Guards Documentation](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)

## Version History

- **v1.1.0** (2025-10-25): Added comprehensive linting compliance guidelines for markdown and TypeScript
- **v1.0.0** (2025-01-22): Initial version with comprehensive TypeScript safety guidelines
