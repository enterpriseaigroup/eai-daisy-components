# Required Dependencies for Enhanced Test Suite

## Installation Command

```bash
npm install --save-dev \
  webpack@^5.89.0 \
  webpack-cli@^5.1.4 \
  terser-webpack-plugin@^5.3.9 \
  compression-webpack-plugin@^10.0.0 \
  webpack-bundle-analyzer@^4.10.1 \
  ts-loader@^9.5.1 \
  @playwright/test@^1.40.0 \
  @testing-library/react@^14.1.2 \
  @testing-library/jest-dom@^6.1.5 \
  jsdom@^23.0.1 \
  pixelmatch@^5.3.0 \
  pngjs@^7.0.0
```

## Dependency Breakdown

### Webpack & Bundling (Bundle Size Tests)
- **webpack** - Module bundler for measuring actual bundle sizes
- **webpack-cli** - Command line interface for webpack
- **terser-webpack-plugin** - Minification plugin for production builds
- **compression-webpack-plugin** - Gzip and Brotli compression
- **webpack-bundle-analyzer** - Analyze bundle composition
- **ts-loader** - TypeScript loader for webpack

### Playwright (Visual Regression & Equivalency Tests)
- **@playwright/test** - End-to-end testing framework with browser automation

### Testing Library (Component Rendering Tests)
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM
- **jsdom** - JavaScript DOM implementation for Node.js

### Image Comparison (Visual Regression)
- **pixelmatch** - Pixel-level image comparison
- **pngjs** - PNG encoder/decoder for screenshot comparison

### Already Installed
The following should already be in your project:
- **typescript** - TypeScript compiler (for AST analysis)
- **@types/node** - Node.js type definitions
- **jest** - Test framework
- **@jest/globals** - Jest global functions

## Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test:integration:enhanced": "jest tests/integration/enhanced-production-readiness.test.ts",
    "test:equivalency": "playwright test tests/equivalency",
    "test:equivalency:chromium": "playwright test tests/equivalency --project=chromium",
    "test:production": "npm run test:integration:enhanced && npm run test:equivalency",
    "test:performance": "jest tests/profilers --verbose",
    "test:bundles": "jest tests/analyzers/real-bundle-analyzer",
    "test:business-logic": "jest tests/analyzers/enhanced-business-logic-analyzer",
    "test:all-metrics": "jest tests/integration/enhanced-production-readiness.test.ts --verbose",
    "test:server:v1": "PORT=3000 npm run dev -- tests/fixtures/components/v1",
    "test:server:v2": "PORT=3001 npm run dev -- tests/fixtures/components/v2"
  }
}
```

## Configuration Files Needed

### 1. Jest Configuration Update

Add to your `jest.config.js` or create if it doesn't exist:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
```

### 2. Playwright Config

Already created at `playwright.config.ts`

### 3. TypeScript Config for Tests

Add or update `tsconfig.test.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jest", "@testing-library/jest-dom", "@playwright/test"],
    "jsx": "react"
  },
  "include": [
    "tests/**/*",
    "src/**/*"
  ]
}
```

## Environment Setup

### 1. Install Playwright Browsers

After installing @playwright/test:

```bash
npx playwright install
```

### 2. Enable Node.js GC Monitoring (Optional)

For memory profiling:

```bash
node --expose-gc node_modules/.bin/jest tests/profilers
```

### 3. Verify Installation

```bash
# Check webpack
npx webpack --version

# Check playwright
npx playwright --version

# Run a simple test
npm run test:integration:enhanced -- --testNamePattern="should validate component compilation"
```

## Troubleshooting

### Issue: "Cannot find module 'webpack'"

```bash
npm install webpack webpack-cli --save-dev
```

### Issue: "Playwright browsers not installed"

```bash
npx playwright install chromium
```

### Issue: "Module parse failed" with CSS files

Add to webpack config:
```javascript
{
  test: /\.css$/,
  use: ['style-loader', 'css-loader']
}
```

### Issue: "jsdom not found"

```bash
npm install jsdom @types/jsdom --save-dev
```

## CI/CD Considerations

For GitHub Actions or similar CI:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run enhanced tests
  run: npm run test:production
  env:
    CI: true
```

## Estimated Installation Time

- Dependencies download: ~2-3 minutes
- Playwright browsers: ~1-2 minutes
- Total: ~5 minutes

## Estimated Disk Space

- webpack + plugins: ~50 MB
- Playwright + browsers: ~300 MB (chromium only), ~800 MB (all browsers)
- Testing libraries: ~20 MB
- Total: ~370 MB (chromium only), ~870 MB (all browsers)

## Optional Dependencies

For advanced scenarios:

```bash
# For better image diff visualization
npm install --save-dev looks-same

# For bundle size trending
npm install --save-dev bundlesize

# For performance visualization
npm install --save-dev clinic

# For AST visualization
npm install --save-dev @babel/parser @babel/traverse
```