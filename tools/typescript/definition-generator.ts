/**
 * TypeScript Definition Generator
 *
 * Generates .d.ts files for migrated components.
 *
 * @fileoverview TypeScript definition generation
 * @version 1.0.0
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import type { ComponentDefinition } from '@/types';

/**
 * Generate TypeScript definition file
 */
export async function generateTypeDefinitions(
  component: ComponentDefinition,
  outputDir: string,
): Promise<string> {
  const defPath = join(outputDir, `${component.name}.d.ts`);

  const definitions = `/**
 * Type definitions for ${component.name}
 * Generated from DAISY v1 migration
 * @version 2.0.0
 */

import * as React from 'react';
${generateImports(component)}

${generatePropsInterface(component)}

${generateComponentDeclaration(component)}

export default ${component.name};
`;

  await fs.writeFile(defPath, definitions);
  return defPath;
}

function generateImports(component: ComponentDefinition): string {
  const imports: string[] = [];

  if (component.dependencies.some(d => d.name.includes('Configurator'))) {
    imports.push(
      "import type { ConfiguratorContext } from '@11x/configurator-sdk';",
    );
  }

  return imports.length > 0 ? imports.join('\n') + '\n' : '';
}

function generatePropsInterface(component: ComponentDefinition): string {
  if (component.props.length === 0) {
    return 'export interface ' + component.name + 'Props {}';
  }

  const props = component.props.map(p => {
    const optional = p.required ? '' : '?';
    const doc = p.description ? `  /**\n   * ${p.description}\n   */\n` : '';
    return `${doc}  ${p.name}${optional}: ${p.type};`;
  });

  return `/**
 * Props for ${component.name} component
 */
export interface ${component.name}Props {
${props.join('\n')}
}`;
}

function generateComponentDeclaration(component: ComponentDefinition): string {
  if (component.type === 'functional') {
    return `/**
 * ${component.name} - Migrated from DAISY v1
 * 
 * @remarks
 * This component has been migrated to Configurator v2 architecture.
 * All business logic has been preserved and validated.
 * 
 * @param props - Component properties
 * @returns React component
 */
export declare const ${component.name}: React.FC<${component.name}Props>;`;
  } else {
    return `/**
 * ${component.name} - Migrated from DAISY v1
 * 
 * @remarks
 * This component has been migrated to Configurator v2 architecture.
 * All business logic has been preserved and validated.
 */
export declare class ${component.name} extends React.Component<${component.name}Props> {
  render(): React.ReactNode;
}`;
  }
}
