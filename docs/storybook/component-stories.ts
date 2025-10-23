/**
 * Storybook Stories Generator
 *
 * Generates Storybook CSF3 stories for migrated components.
 *
 * @fileoverview Storybook story generation
 * @version 1.0.0
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import type { ComponentDefinition } from '@/types';

/**
 * Generate Storybook stories file
 */
export async function generateStorybookStories(
  component: ComponentDefinition,
  outputDir: string,
): Promise<string> {
  const storyPath = join(outputDir, `${component.name}.stories.tsx`);

  const stories = `/**
 * ${component.name} Storybook Stories
 * Generated from DAISY v1 migration
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ${component.name} } from './${component.name}';

const meta: Meta<typeof ${component.name}> = {
  title: 'Migrated Components/${component.name}',
  component: ${component.name},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Migrated from DAISY v1 to Configurator v2. All business logic preserved.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
${generateArgTypes(component)}
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story showing component in default state
 */
export const Default: Story = {
  args: {
${generateDefaultArgs(component)}
  },
};

/**
 * Interactive story with all controls enabled
 */
export const Interactive: Story = {
  args: {
${generateInteractiveArgs(component)}
  },
};

/**
 * With Configurator integration
 */
export const WithConfigurator: Story = {
  args: {
${generateConfiguratorArgs(component)}
  },
  parameters: {
    docs: {
      description: {
        story: 'Component integrated with Configurator SDK v2.1.0+',
      },
    },
  },
};

/**
 * Edge cases and error states
 */
export const EdgeCases: Story = {
  args: {
${generateEdgeCaseArgs(component)}
  },
};
`;

  await fs.writeFile(storyPath, stories);
  return storyPath;
}

function generateArgTypes(component: ComponentDefinition): string {
  return component.props
    .map(p => {
      const control = getControlType(p.type);
      return `    ${p.name}: {
      description: '${p.description || 'Component prop'}',
      control: '${control}',
    },`;
    })
    .join('\n');
}

function generateDefaultArgs(component: ComponentDefinition): string {
  const required = component.props.filter(p => p.required);

  return required
    .map(p => `    ${p.name}: ${getDefaultValue(p.type)},`)
    .join('\n');
}

function generateInteractiveArgs(component: ComponentDefinition): string {
  return component.props
    .map(p => `    ${p.name}: ${getInteractiveValue(p.type)},`)
    .join('\n');
}

function generateConfiguratorArgs(component: ComponentDefinition): string {
  return component.props
    .map(p => `    ${p.name}: ${getConfiguratorValue(p.type, p.name)},`)
    .join('\n');
}

function generateEdgeCaseArgs(component: ComponentDefinition): string {
  return component.props
    .map(p => `    ${p.name}: ${getEdgeCaseValue(p.type)},`)
    .join('\n');
}

function getControlType(type: string): string {
  if (type.includes('string')) {
return 'text';
}
  if (type.includes('number')) {
return 'number';
}
  if (type.includes('boolean')) {
return 'boolean';
}
  if (type.includes('function')) {
return 'action';
}
  if (type.includes('|')) {
return 'select';
}
  return 'object';
}

function getDefaultValue(type: string): string {
  if (type.includes('string')) {
return "'Default value'";
}
  if (type.includes('number')) {
return '0';
}
  if (type.includes('boolean')) {
return 'false';
}
  if (type.includes('function')) {
return '() => {}';
}
  return 'undefined';
}

function getInteractiveValue(type: string): string {
  if (type.includes('string')) {
return "'Interactive example'";
}
  if (type.includes('number')) {
return '42';
}
  if (type.includes('boolean')) {
return 'true';
}
  if (type.includes('function')) {
return '(e) => console.log(e)';
}
  return '{}';
}

function getConfiguratorValue(type: string, name: string): string {
  if (name.toLowerCase().includes('configurator')) {
    return 'mockConfiguratorContext';
  }
  if (type.includes('function')) {
return '(data) => configurator.executeAction(data)';
}
  return getDefaultValue(type);
}

function getEdgeCaseValue(type: string): string {
  if (type.includes('string')) {
return "''";
}
  if (type.includes('number')) {
return 'Number.MAX_SAFE_INTEGER';
}
  if (type.includes('boolean')) {
return 'true';
}
  if (type.includes('function')) {
return '() => { throw new Error("Edge case"); }';
}
  return 'null';
}
