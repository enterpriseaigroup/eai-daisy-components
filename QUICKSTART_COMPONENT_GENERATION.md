# Quickstart: Automated V2 Component Generation

**Generate production-ready React components from DAISY v1 baselines in minutes!**

---

## One-Command Migration

```bash
# Complete migration: Extract V1 → Generate V2 → Verify
./scripts/migrate-and-generate.sh useRenderAddressCard GetAddressCard
```

---

## Step-by-Step Migration

### 1. Extract V1 Baseline

```bash
npm run migrate:v2 -- \
  --component=useRenderAddressCard \
  --output=daisyv1/components/tier1-simple/
```

**Output**: `daisyv1/components/tier1-simple/useRenderAddressCard/`

---

### 2. Generate V2 Component

```bash
npm run generate:react -- \
  --baseline=daisyv1/components/tier1-simple/useRenderAddressCard/useRenderAddressCard.ts \
  --output=packages/v2-components/src/components \
  --name=GetAddressCard
```

**Output**:
- `packages/v2-components/src/components/GetAddressCard.tsx` ✅
- `packages/v2-components/src/components/GetAddressCard.css` ✅
- `packages/v2-components/src/components/README.md` ✅

---

### 3. Verify TypeScript

```bash
cd packages/v2-components
npm run typecheck
```

**Expected**: ✅ No errors

---

### 4. Review TODOs

```bash
grep -n "TODO" packages/v2-components/src/components/GetAddressCard.tsx
```

**Customize**:
- API integration details
- Validation logic
- Error handling
- Business logic placeholders

---

### 5. Test Component

```bash
npm run storybook
```

**Navigate to**: GetAddressCard story

---

## Generated Component Structure

```
packages/v2-components/src/components/
└── GetAddressCard/
    ├── GetAddressCard.tsx    # 596 lines - Full React component
    ├── GetAddressCard.css    # 212 lines - Styles
    └── README.md             # 343 lines - Documentation
```

**Component Includes**:
- ✅ TypeScript interfaces
- ✅ Validation functions
- ✅ API integration
- ✅ State management
- ✅ Error handling
- ✅ Form logic
- ✅ Event handlers
- ✅ Render logic

---

## Domain Templates

The generator automatically detects component types:

| Component Type | Template | Detection |
|----------------|----------|-----------|
| Address Lookup | `getaddresscard-template.ts` | Name includes "address" |
| Payment Forms | `payment-template.ts` | Name includes "payment" or "card" |
| Search | `search-template.ts` | Name includes "search" |
| Default | `functional-component-template.ts` | Fallback |

---

## Example: GetAddressCard

**V1 Component**: `useRenderAddressCard` (42 lines - chat display)

**V2 Component**: `GetAddressCard` (596 lines - full address lookup)

**Generated Features**:
- Australian postcode validation
- Address search (street + suburb/postcode)
- Lot/DP number search
- GNAF data display
- LGA (council) information
- Copy to clipboard
- Error handling
- Loading states

**Time**: 5 seconds to generate, 2 hours to customize

---

## Adding New Domain Template

### 1. Create Template

```typescript
// packages/v2-components/src/pipeline/templates/mydomain-template.ts

import type { PseudoCodeBlock } from '../../types/v2-component.js';

export function generateMyDomainPseudoCode(): PseudoCodeBlock[] {
  return [
    {
      functionName: 'validateInput',
      whyExists: 'Validates domain-specific input',
      whatItDoes: [
        'READ user input from form',
        'MATCH against validation rules',
        'RETURN validation result',
      ],
      whatItCalls: [],
      dataFlow: 'Input → Validate → Result',
      dependencies: [],
    },
  ];
}
```

### 2. Register Template

```typescript
// packages/v2-components/src/cli/generate-functional-component.ts

import { generateMyDomainPseudoCode } from '../pipeline/templates/mydomain-template.js';

function generatePseudoCodeBlocks(metadata: any): PseudoCodeBlock[] {
  const componentName = metadata.name.toLowerCase();

  if (componentName.includes('mydomain')) {
    return generateMyDomainPseudoCode();
  }

  return generateDefaultPseudoCode(metadata);
}
```

### 3. Generate Component

```bash
npm run generate:react -- \
  --baseline=daisyv1/components/.../MyDomainComponent.ts \
  --output=packages/v2-components/src/components \
  --name=MyDomainCard
```

---

## Troubleshooting

### TypeScript Errors

**Problem**: `npm run typecheck` fails

**Solution**:
```bash
# Check specific file
cd packages/v2-components
npx tsc --noEmit src/components/GetAddressCard.tsx
```

**Common Issues**:
- Missing type imports
- Incorrect interface names
- API response type mismatch

---

### Missing Pseudo-Code

**Problem**: Generator doesn't create expected functions

**Solution**:
1. Check component name matches domain pattern
2. Verify baseline has business logic patterns
3. Create custom template for component type

---

### Component Not Rendering

**Problem**: Storybook shows blank component

**Solution**:
1. Check CSS import: `import './GetAddressCard.css';`
2. Verify export: `export function GetAddressCard({ ... })`
3. Check console for React errors
4. Ensure props interface matches usage

---

## Best Practices

### ✅ DO

- Run `npm run typecheck` after generation
- Review all TODO comments before deployment
- Test component in Storybook
- Customize validation logic for domain requirements
- Update README with actual component usage

### ❌ DON'T

- Skip TypeScript type checking
- Deploy components with TODO placeholders in critical paths
- Ignore generated CSS (customize for your design system)
- Forget to update API integration details
- Remove migration notes from comments

---

## Migration Checklist

```markdown
- [ ] Extract V1 baseline
- [ ] Generate V2 component
- [ ] TypeScript type check passes
- [ ] Review and complete TODOs
- [ ] Update API integration
- [ ] Customize validation logic
- [ ] Test in Storybook
- [ ] Update documentation
- [ ] Add unit tests
- [ ] Commit to version control
```

---

## Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm run migrate:v2` | Extract V1 baseline |
| `npm run generate:react` | Generate V2 component |
| `npm run typecheck` | Verify TypeScript |
| `npm run storybook` | Visual testing |
| `npm run test:component` | Run unit tests |

---

## Resources

- [Full Workflow Documentation](./.claude/COMPONENT_GENERATION_WORKFLOW.md)
- [Functional Component Template](./packages/v2-components/src/pipeline/templates/functional-component-template.ts)
- [GetAddress Example](./packages/v2-components/src/components/GetAddressCard.tsx)
- [CLI Tool](./packages/v2-components/src/cli/generate-functional-component.ts)

---

**Ready to migrate all 170 components? Start with the one-command migration!** 🚀

```bash
./scripts/migrate-and-generate.sh <V1ComponentName> <V2ComponentName>
```
