/**
 * Usage Example Generator
 *
 * Generates working code examples with Configurator SDK patterns.
 *
 * @fileoverview Usage example generation
 * @version 1.0.0
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import type { ComponentDefinition } from '@/types';

/**
 * Generate usage examples for component
 */
export async function generateUsageExamples(
  component: ComponentDefinition,
  outputDir: string,
): Promise<string> {
  const examplePath = join(outputDir, `${component.name}-examples.tsx`);

  const code = `/**
 * ${component.name} Usage Examples
 * Generated from DAISY v1 migration
 */

import React from 'react';
import { ${component.name} } from './${component.name}';
${generateConfiguratorImports(component)}

/**
 * Basic usage example
 */
export const BasicExample: React.FC = () => {
  return (
    <${component.name}
${generateBasicProps(component)}    />
  );
};

/**
 * With Configurator SDK integration
 */
export const ConfiguratorExample: React.FC = () => {
  ${generateConfiguratorSetup(component)}

  return (
    <${component.name}
${generateConfiguratorProps(component)}    />
  );
};

/**
 * Advanced usage with all features
 */
export const AdvancedExample: React.FC = () => {
  ${generateAdvancedSetup(component)}

  return (
    <${component.name}
${generateAdvancedProps(component)}    />
  );
};
`;

  await fs.writeFile(examplePath, code);
  return examplePath;
}

function generateConfiguratorImports(component: ComponentDefinition): string {
  const imports: string[] = [];

  if (component.dependencies.some(d => d.name.includes('useConfigurator'))) {
    imports.push("import { useConfigurator } from '@11x/configurator-sdk';");
  }

  return imports.length > 0 ? '\n' + imports.join('\n') : '';
}

function generateBasicProps(component: ComponentDefinition): string {
  const required = component.props.filter(p => p.required);

  if (required.length === 0) {
    return '';
  }

  return (
    required
      .map(p => `      ${p.name}={${getExampleValue(p.type)}}`)
      .join('\n') + '\n'
  );
}

function generateConfiguratorSetup(_component: ComponentDefinition): string {
  return `const configurator = useConfigurator();
  
  const handleAction = (action: string): void => {
    configurator.executeAction(action);
  };`;
}

function generateConfiguratorProps(_component: ComponentDefinition): string {
  return `      onAction={handleAction}
      configuratorContext={configurator}
`;
}

function generateAdvancedSetup(_component: ComponentDefinition): string {
  return `const [state, setState] = React.useState({});
  
  const handleChange = (value: unknown): void => {
    setState(prev => ({ ...prev, value }));
  };`;
}

function generateAdvancedProps(component: ComponentDefinition): string {
  return (
    component.props
      .map(p => `      ${p.name}={${getExampleValue(p.type)}}`)
      .join('\n') + '\n'
  );
}

function getExampleValue(type: string): string {
  if (type.includes('string')) {
    return '"example"';
  }
  if (type.includes('number')) {
    return '42';
  }
  if (type.includes('boolean')) {
    return 'true';
  }
  if (type.includes('function') || type.includes('=>')) {
    return 'handleChange';
  }
  if (type.includes('[]')) {
    return '[]';
  }
  if (type.includes('{}')) {
    return '{}';
  }
  return 'undefined';
}
