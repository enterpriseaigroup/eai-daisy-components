# Quickstart: Public Storybook Deployment

**Feature**: 002-storybook-deployment
**Prerequisites**: Node.js 18+, Git, GitHub repository access
**Estimated Time**: 30 minutes for basic setup, 2 hours for full configuration

## Overview

This guide walks through setting up a public Storybook documentation site for the EAI Daisy component library with automated GitHub Pages deployment.

## Step 1: Environment Setup

### Install Dependencies

```bash
# Install Storybook and core dependencies
npm install --save-dev @storybook/react-webpack5 @storybook/addon-essentials
npm install --save-dev @storybook/addon-a11y @storybook/addon-docs
npm install --save-dev @storybook/addon-controls @storybook/addon-viewport

# Install testing and deployment tools
npm install --save-dev chromatic @storybook/test-runner
npm install --save-dev gh-pages
```

### Initialize Storybook

```bash
# Initialize Storybook configuration
npx storybook@latest init

# Install additional addons for component documentation
npm install --save-dev @storybook/addon-docs @storybook/addon-storysource
```

## Step 2: Configuration

### Storybook Configuration (.storybook/main.js)

```javascript
module.exports = {
  stories: [
    '../stories/daisyv1/**/*.stories.@(js|jsx|ts|tsx)',
    '../stories/configurator/**/*.stories.@(js|jsx|ts|tsx)',
    '../stories/shared/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-storysource'
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: true
  }
};
```

### Preview Configuration (.storybook/preview.js)

```javascript
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
  docs: {
    toc: true,
  },
  a11y: {
    config: {},
    options: {},
    manual: false,
  },
};

export const globalTypes = {
  componentType: {
    name: 'Component Type',
    description: 'Filter components by type',
    defaultValue: 'all',
    toolbar: {
      icon: 'component',
      items: [
        { value: 'all', title: 'All Components' },
        { value: 'daisyv1', title: 'DAISY v1 Baseline' },
        { value: 'configurator', title: 'Configurator Compatible' },
        { value: 'shared', title: 'Shared Utilities' }
      ],
    },
  },
};
```

## Step 3: Story Creation

### DAISY v1 Baseline Component Story

```typescript
// stories/daisyv1/Button/Button.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../../daisyv1/components/Button';

const meta: Meta<typeof Button> = {
  title: 'DAISY v1/Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Original DAISY v1 button component with baseline business logic.'
      }
    },
    migration: {
      status: 'baseline',
      configuratorVersion: 'Button',
      transformationNotes: [
        'Event handling patterns updated for Configurator architecture',
        'Theme integration migrated to use design tokens',
        'Accessibility improvements added'
      ]
    }
  },
  tags: ['autodocs', 'daisyv1', 'baseline'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary']
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'DAISY v1 Button'
  }
};
```

### Configurator Component Story

```typescript
// stories/configurator/Button/Button.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../../src/components/Button';

const meta: Meta<typeof Button> = {
  title: 'Configurator/Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Configurator-compatible button with transformed business logic and modern architecture patterns.'
      }
    },
    migration: {
      status: 'completed',
      baselineVersion: 'DAISY v1 Button',
      transformationNotes: [
        'Business logic preserved with architectural updates',
        'Enhanced accessibility compliance',
        'Performance optimizations applied'
      ]
    }
  },
  tags: ['autodocs', 'configurator', 'migrated'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'ghost']
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Configurator Button'
  }
};
```

## Step 4: GitHub Actions Deployment

### Deployment Workflow (.github/workflows/storybook-deploy.yml)

```yaml
name: Deploy Storybook to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'daisyv1/**'
      - 'stories/**'
      - '.storybook/**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Storybook
        run: npm run build-storybook

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./storybook-static

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

## Step 5: Package.json Scripts

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test-storybook": "test-storybook",
    "chromatic": "chromatic --project-token=<token>"
  }
}
```

## Step 6: Local Development

### Start Development Server

```bash
# Start Storybook development server
npm run storybook
```

### Build for Production

```bash
# Build static Storybook site
npm run build-storybook
```

### Run Tests

```bash
# Run visual regression tests
npm run test-storybook

# Run accessibility tests
npm run test-storybook -- --testNamePattern="a11y"
```

## Step 7: Deployment Verification

### Post-Deployment Checklist

- [ ] Site loads successfully at GitHub Pages URL
- [ ] Component categories display correctly
- [ ] Migration status indicators work
- [ ] Search functionality operates
- [ ] Accessibility tests pass
- [ ] Mobile responsiveness verified
- [ ] Performance metrics meet targets

### Monitoring Setup

```bash
# Install performance monitoring
npm install --save-dev lighthouse-ci

# Configure performance budgets in .lighthouserc.js
```

## Common Issues and Solutions

### Build Failures

- **Issue**: TypeScript compilation errors
- **Solution**: Ensure all component props have proper TypeScript definitions

### Deployment Issues

- **Issue**: GitHub Pages not updating
- **Solution**: Check repository settings and GitHub Actions permissions

### Performance Issues

- **Issue**: Slow page load times
- **Solution**: Enable code splitting and lazy loading in Storybook configuration

## Next Steps

1. Add visual regression testing with Chromatic
2. Set up automated accessibility testing
3. Configure custom domain for professional URL
4. Implement migration progress tracking dashboard
5. Add automated component documentation generation