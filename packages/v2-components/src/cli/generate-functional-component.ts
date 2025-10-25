#!/usr/bin/env node
/**
 * Generate Functional React Component from V1 Baseline
 *
 * Usage:
 *   npm run generate:component -- --baseline=path/to/baseline --output=output/dir --name=ComponentName
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { analyzeBaseline } from '../engine/ast-analyzer.js';
import { generateFunctionalComponent } from '../pipeline/templates/functional-component-template.js';
import { generateTypeInterfaces } from '../pipeline/v2-generator.js';
import type { PseudoCodeBlock } from '../types/v2-component.js';

// Import domain-specific templates
import { generateGetAddressCardPseudoCode } from '../pipeline/templates/getaddresscard-template.js';

interface GenerateOptions {
  baselinePath: string;
  outputPath: string;
  componentName?: string;
  apiBaseUrl?: string;
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  console.log('🔧 Generating Functional React Component...\n');
  console.log(`Baseline: ${options.baselinePath}`);
  console.log(`Output: ${options.outputPath}`);
  console.log(`Component: ${options.componentName || '[auto-detect]'}\n`);

  try {
    // Step 1: Analyze V1 baseline
    console.log('📊 Analyzing V1 baseline...');
    const metadata = await analyzeBaseline(options.baselinePath);
    console.log(`✓ Analyzed ${metadata.name} (${metadata.type})\n`);

    // Step 2: Generate pseudo-code blocks
    console.log('📝 Generating pseudo-code blocks...');
    const pseudoCodeBlocks = generatePseudoCodeBlocks(metadata);
    console.log(`✓ Generated ${pseudoCodeBlocks.length} pseudo-code blocks\n`);

    // Step 3: Generate TypeScript interfaces
    console.log('🔤 Generating TypeScript interfaces...');
    const { propsInterface, stateInterface, apiResponseInterface } = generateTypeInterfaces(metadata);
    console.log('✓ Generated interfaces\n');

    // Step 4: Generate component name
    const componentName = options.componentName || metadata.name;

    // Step 5: Generate functional component
    console.log('⚛️  Generating functional React component...');
    const sourceCode = generateFunctionalComponent(
      componentName,
      metadata,
      pseudoCodeBlocks,
      propsInterface,
      stateInterface,
      apiResponseInterface
    );

    // Step 6: Write component file
    const outputDir = path.resolve(options.outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    const componentFile = path.join(outputDir, `${componentName}.tsx`);
    await fs.writeFile(componentFile, sourceCode, 'utf-8');
    console.log(`✓ Wrote ${componentFile}\n`);

    // Step 7: Generate CSS file (basic template)
    const cssFile = path.join(outputDir, `${componentName}.css`);
    const cssContent = generateBasicCSS(componentName);
    await fs.writeFile(cssFile, cssContent, 'utf-8');
    console.log(`✓ Wrote ${cssFile}\n`);

    // Step 8: Generate README
    const readmeFile = path.join(outputDir, 'README.md');
    const readmeContent = generateReadme(componentName, metadata);
    await fs.writeFile(readmeFile, readmeContent, 'utf-8');
    console.log(`✓ Wrote ${readmeFile}\n`);

    console.log('✅ Component generation complete!\n');
    console.log('Next steps:');
    console.log('  1. Review generated component for TODOs');
    console.log('  2. Implement business logic placeholders');
    console.log('  3. Test component with Storybook');
    console.log('  4. Run TypeScript type check: npm run typecheck');
  } catch (error) {
    console.error('❌ Error generating component:', error);
    process.exit(1);
  }
}

/**
 * Parse command-line arguments
 */
function parseArgs(args: string[]): GenerateOptions {
  const options: Partial<GenerateOptions> = {};

  for (const arg of args) {
    if (arg.startsWith('--baseline=')) {
      options.baselinePath = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.outputPath = arg.split('=')[1];
    } else if (arg.startsWith('--name=')) {
      options.componentName = arg.split('=')[1];
    } else if (arg.startsWith('--api-url=')) {
      options.apiBaseUrl = arg.split('=')[1];
    }
  }

  if (!options.baselinePath || !options.outputPath) {
    console.error('Usage: generate-functional-component --baseline=<path> --output=<path> [--name=<name>]');
    process.exit(1);
  }

  return options as GenerateOptions;
}

/**
 * Generate pseudo-code blocks (domain-specific templates)
 */
function generatePseudoCodeBlocks(metadata: any): PseudoCodeBlock[] {
  const componentName = metadata.name.toLowerCase();

  // Check for domain-specific templates
  if (componentName.includes('address')) {
    return generateGetAddressCardPseudoCode();
  }

  // Default: generate from metadata patterns
  return generateDefaultPseudoCode(metadata);
}

/**
 * Generate default pseudo-code from metadata
 */
function generateDefaultPseudoCode(metadata: any): PseudoCodeBlock[] {
  const blocks: PseudoCodeBlock[] = [];

  for (const logic of metadata.businessLogic) {
    blocks.push({
      functionName: logic.functionName || 'businessLogic',
      whyExists: logic.description || 'Business logic from V1 component',
      whatItDoes: [logic.pattern || 'Implement business logic'],
      whatItCalls: [],
      dataFlow: 'User input → Processing → Output',
      dependencies: metadata.dependencies,
    });
  }

  if (blocks.length === 0) {
    blocks.push({
      functionName: 'render',
      whyExists: 'Display component UI',
      whatItDoes: ['Render component', 'Handle user interaction'],
      whatItCalls: [],
      dataFlow: 'Props → Render → UI',
      dependencies: [],
    });
  }

  return blocks;
}

/**
 * Generate basic CSS template
 */
function generateBasicCSS(componentName: string): string {
  const className = componentName.toLowerCase();

  return `/**
 * ${componentName} Component Styles
 */

.${className} {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-title {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.error-message {
  padding: 0.75rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
  font-size: 0.875rem;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.data-display {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.data-title {
  margin: 0 0 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}
`;
}

/**
 * Generate README template
 */
function generateReadme(componentName: string, metadata: any): string {
  return `# ${componentName} Component

**Version**: 2.0.0
**Migration Status**: Migrated from DAISY v1 \`${metadata.name}\`

## Overview

[TODO: Add component description]

## Usage

\`\`\`tsx
import { ${componentName} } from '@eai/v2-components';

function MyComponent() {
  return (
    <${componentName}
      // TODO: Add props
    />
  );
}
\`\`\`

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| TODO | - | - | - | - |

## Features

- [TODO: List features]

## Migration Notes

### Changes from DAISY v1

- [TODO: Document changes]

## Resources

- [Component Documentation](#)
- [Storybook](#)
`;
}

main();
