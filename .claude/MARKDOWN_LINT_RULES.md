# Markdown Linting Rules for AI-Generated Content

This project uses markdownlint to ensure consistent markdown formatting. All AI-generated markdown files MUST comply with these rules.

## Configuration

See [`.markdownlintrc`](../.markdownlintrc) for the current configuration.

## Critical Rules

### MD032: Lists should be surrounded by blank lines

**Rule**: All lists (ordered and unordered) MUST have a blank line before and after them.

```markdown
<!-- ❌ WRONG -->
Some text
- List item 1
- List item 2
More text

<!-- ✅ CORRECT -->
Some text

- List item 1
- List item 2

More text
```

### MD029: Ordered list item prefix

**Rule**: Ordered lists MUST use sequential numbering (1, 2, 3, ...).

```markdown
<!-- ❌ WRONG -->
1. First item
4. Second item
5. Third item

<!-- ✅ CORRECT -->
1. First item
2. Second item
3. Third item
```

### MD024: Multiple headings with the same content

**Rule**: Headings with identical text are not allowed (unless they are in different sections).

```markdown
<!-- ❌ WRONG -->
## Introduction
...
## Introduction

<!-- ✅ CORRECT -->
## Introduction
...
## Clarification Sessions
```

### MD009: No trailing spaces

**Rule**: Lines MUST NOT end with trailing whitespace (unless exactly 2 spaces for line break).

```markdown
<!-- ❌ WRONG -->
This line has trailing spaces

<!-- ✅ CORRECT -->
This line has no trailing spaces
```

### MD026: No trailing punctuation in headings

**Rule**: Headings MUST NOT end with punctuation marks (.,;:!?).

```markdown
<!-- ❌ WRONG -->
## My Heading:

<!-- ✅ CORRECT -->
## My Heading
```

### MD022: Headings should be surrounded by blank lines

**Rule**: Headings MUST have a blank line before and after them.

```markdown
<!-- ❌ WRONG -->
Some text
## Heading
More text

<!-- ✅ CORRECT -->
Some text

## Heading

More text
```

### MD031: Fenced code blocks should be surrounded by blank lines

**Rule**: Fenced code blocks (```) MUST have a blank line before and after them.

```markdown
<!-- ❌ WRONG -->
Some text
\`\`\`typescript
code here
\`\`\`
More text

<!-- ✅ CORRECT -->
Some text

\`\`\`typescript
code here
\`\`\`

More text
```

### MD040: Fenced code blocks should have a language specified

**Rule**: Fenced code blocks MUST specify a language.

```markdown
<!-- ❌ WRONG -->
\`\`\`
code without language
\`\`\`

<!-- ✅ CORRECT -->
\`\`\`typescript
code with language
\`\`\`

\`\`\`text
plain text content
\`\`\`
```

## Running the Linter

```bash
# Check all markdown files
npx markdownlint-cli2 "**/*.md"

# Check specific files
npx markdownlint-cli2 ".specify/specs/004-v2-getaddress-component/**/*.md"

# Auto-fix (may not fix all issues)
npx markdownlint-cli2 --fix "**/*.md"
```

## AI Assistant Instructions

When generating markdown content:

1. Always surround lists with blank lines
2. Use sequential numbering for ordered lists (1, 2, 3, ...)
3. Ensure headings are unique or contextualized
4. Remove trailing whitespace from all lines
5. Don't end headings with punctuation
6. Surround headings with blank lines
7. Surround code blocks with blank lines
8. Always specify language for code blocks (use `text` for plain text)

## Disabled Rules

- **MD013** (line-length): Disabled to allow longer lines in documentation
- **MD041** (first-line-heading): Disabled because command files have YAML frontmatter
- **MD033** (no-inline-html): Disabled to allow necessary HTML elements

## Ignored Files

- `.claude/commands/*.md` - Command template files with special formatting requirements
