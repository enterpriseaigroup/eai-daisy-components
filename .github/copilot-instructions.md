# eai-daisy-components Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-22

## Active Technologies
- TypeScript 5.0+ (strict mode with exactOptionalPropertyTypes) (004-v2-getaddress-component)
- File system based (baselines in `/daisyv1/`, generated V2 in `packages/v2-components/src/`) (004-v2-getaddress-component)

- TypeScript 5.0+, Node.js 18+ for pipeline tooling and component developmen + Configurator SDK v2.1.0+, shadcn/ui v0.4.0+, @elevenlabs/ui v1.2.0+, React 18+, React DOM 18+, Vite 4.0+, pnpm 8+ (001-component-extraction-pipeline)
- File system based storage with `/daisyv1/` baseline preservation and transformed component outpu (001-component-extraction-pipeline)

- TypeScript 5.0+, Node.js 18+ (001-component-extraction-pipeline)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.0+, Node.js 18+: Follow standard conventions

## Linting Compliance

### Markdown Files (.md)

**CRITICAL**: All generated markdown must pass markdownlint with zero errors. Configuration: `{"default": true, "MD013": false}`

#### Required Rules

**MD022 (blanks-around-headings)**: Always add blank lines before AND after headings

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

**MD031 (blanks-around-fences)**: Always add blank lines before AND after code blocks

```markdown
<!-- ❌ BAD -->
Some text
```code
example
```
More text

<!-- ✅ GOOD -->
Some text

```code
example
```

More text
```

**MD032 (blanks-around-lists)**: Always add blank lines before AND after lists

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

**MD040 (fenced-code-language)**: Always specify language for code blocks

```markdown
<!-- ❌ BAD -->
```
code here
```

<!-- ✅ GOOD -->
```typescript
code here
```
```

**MD009 (no-trailing-spaces)**: Never leave trailing spaces (unless exactly 2 for line breaks)

**MD029 (ol-prefix)**: Use sequential numbering in ordered lists (1, 2, 3)

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

**MD024 (no-duplicate-heading)**: Avoid duplicate heading text in same document

### TypeScript/JavaScript Files

**CRITICAL**: All generated code must pass ESLint with zero errors

- Follow TypeScript strict mode rules (see AGENTS.md for details)
- No `any` types without explicit justification
- All functions must have explicit return types
- Use const assertions where appropriate
- Prefer interfaces over type aliases for object shapes

### Pre-Generation Checklist

Before generating ANY content:

1. ✅ Identify file type (markdown, TypeScript, JSON, etc.)
2. ✅ Review applicable linting rules
3. ✅ Plan structure with linting in mind
4. ✅ Generate content following rules
5. ✅ Validate output against rules mentally

### Common Violations to Avoid

- Missing blank lines around headings, code blocks, lists
- Missing language specifiers on code blocks
- Trailing spaces at end of lines
- Non-sequential numbering in ordered lists
- Duplicate heading text
- Use of `any` type without justification
- Missing return type annotations

## Recent Changes
- 004-v2-getaddress-component: Added TypeScript 5.0+ (strict mode with exactOptionalPropertyTypes)

- 001-component-extraction-pipeline: Added TypeScript 5.0+, Node.js 18+ for pipeline tooling and component developmen + Configurator SDK v2.1.0+, shadcn/ui v0.4.0+, @elevenlabs/ui v1.2.0+, React 18+, React DOM 18+, Vite 4.0+, pnpm 8+
- 001-component-extraction-pipeline: Added TypeScript 5.0+, Node.js 18+ for pipeline tooling and component developmen + Configurator SDK v2.1.0+, shadcn/ui v0.4.0+, @elevenlabs/ui v1.2.0+, React 18+, React DOM 18+, Vite 4.0+, pnpm 8+


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
