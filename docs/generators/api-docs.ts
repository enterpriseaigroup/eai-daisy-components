/**
 * API Documentation Generator
 *
 * Generates API reference documentation from component definitions.
 *
 * @fileoverview API documentation generation
 * @version 1.0.0
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import type { ComponentDefinition } from '@/types';

/**
 * Generate API documentation for component
 */
export async function generateAPIDocumentation(
  component: ComponentDefinition,
  outputDir: string
): Promise<string> {
  const docPath = join(outputDir, `${component.name}-api.md`);

  const markdown = `# ${component.name} API Reference

## Component Type

**${component.type === 'functional' ? 'Functional Component' : 'Class Component'}**

## Props

${generatePropsSection(component)}

## Business Logic

${generateBusinessLogicSection(component)}

## Dependencies

${generateDependenciesSection(component)}

## React Patterns

${component.reactPatterns.map(p => `- \`${p}\``).join('\n')}

## Complexity

**Level**: ${component.complexity}

## Migration Status

**Status**: ${component.migrationStatus}

---

*Generated from DAISY v1 migration pipeline*
`;

  await fs.writeFile(docPath, markdown);
  return docPath;
}

function generatePropsSection(component: ComponentDefinition): string {
  if (component.props.length === 0) {
    return '_No props defined_';
  }

  let section = '| Name | Type | Required | Description |\n';
  section += '|------|------|----------|-------------|\n';

  for (const prop of component.props) {
    section += `| \`${prop.name}\` | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | ${prop.description || '-'} |\n`;
  }

  return section;
}

function generateBusinessLogicSection(component: ComponentDefinition): string {
  if (component.businessLogic.length === 0) {
    return '_No business logic defined_';
  }

  let section = '| Function | Complexity |\n';
  section += '|----------|------------|\n';

  for (const logic of component.businessLogic) {
    section += `| \`${logic.name}\` | ${logic.complexity} |\n`;
  }

  return section;
}

function generateDependenciesSection(component: ComponentDefinition): string {
  if (component.dependencies.length === 0) {
    return '_No external dependencies_';
  }

  return component.dependencies
    .map(dep => `- **${dep.name}** (${dep.type}): \`${dep.importPath}\``)
    .join('\n');
}
