/**
 * NPM Package Generator
 *
 * Generates complete NPM packages for migrated components including
 * package.json, README, types, and build configuration.
 *
 * @fileoverview NPM package generation for component distribution
 * @version 1.0.0
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import type { ComponentDefinition } from '@/types';
import {
  type PackageTemplate,
  generatePackageTemplate,
} from './package-template';
import { getGlobalLogger } from '@/utils/logging';

// ============================================================================
// PACKAGE GENERATION TYPES
// ============================================================================

/**
 * Package generation result
 */
export interface PackageGenerationResult {
  /** Package name */
  readonly packageName: string;

  /** Package directory */
  readonly packageDir: string;

  /** Generated files */
  readonly generatedFiles: string[];

  /** Generation success */
  readonly success: boolean;

  /** Generation errors */
  readonly errors: Error[];

  /** Generation warnings */
  readonly warnings: string[];
}

/**
 * NPM package generation options
 */
export interface NPMPackageOptions {
  /** Output directory for packages */
  readonly outputDir: string;

  /** Package scope (e.g., @eai) */
  readonly scope?: string;

  /** Include README */
  readonly includeReadme?: boolean;

  /** Include LICENSE */
  readonly includeLicense?: boolean;

  /** Include TypeScript declarations */
  readonly includeTypes?: boolean;

  /** License type */
  readonly licenseType?: string;

  /** Repository URL */
  readonly repositoryUrl?: string;
}

// ============================================================================
// NPM PACKAGER
// ============================================================================

/**
 * Generates NPM packages from migrated components
 */
export class NPMPackager {
  private readonly options: Required<NPMPackageOptions>;
  private readonly logger = getGlobalLogger('NPMPackager');

  constructor(options: NPMPackageOptions) {
    this.options = {
      scope: '@eai',
      includeReadme: true,
      includeLicense: true,
      includeTypes: true,
      licenseType: 'MIT',
      repositoryUrl: 'https://github.com/eai/eai-daisy-components',
      ...options,
    };
  }

  /**
   * Generate NPM package for component
   */
  public async generatePackage(
    component: ComponentDefinition,
    sourceDir: string,
  ): Promise<PackageGenerationResult> {
    const startTime = Date.now();
    const errors: Error[] = [];
    const warnings: string[] = [];
    const generatedFiles: string[] = [];

    try {
      this.logger.info(`Generating NPM package for: ${component.name}`);

      // Create package directory
      const packageDir = await this.createPackageDirectory(component);

      // Generate package.json
      const packageJsonPath = await this.generatePackageJson(
        component,
        packageDir,
      );
      generatedFiles.push(packageJsonPath);

      // Copy component files
      const componentFiles = await this.copyComponentFiles(
        sourceDir,
        packageDir,
      );
      generatedFiles.push(...componentFiles);

      // Generate README
      if (this.options.includeReadme) {
        const readmePath = await this.generateReadme(component, packageDir);
        generatedFiles.push(readmePath);
      }

      // Generate LICENSE
      if (this.options.includeLicense) {
        const licensePath = await this.generateLicense(packageDir);
        generatedFiles.push(licensePath);
      }

      // Generate TypeScript declarations
      if (this.options.includeTypes) {
        try {
          const typesPath = await this.generateTypes(component, packageDir);
          generatedFiles.push(typesPath);
        } catch (error) {
          warnings.push(
            `Failed to generate types: ${(error as Error).message}`,
          );
        }
      }

      const duration = Date.now() - startTime;
      this.logger.info(`Package generated successfully: ${component.name}`, {
        duration,
        filesGenerated: generatedFiles.length,
      });

      const packageTemplate = generatePackageTemplate(component, {
        scope: this.options.scope,
        repositoryUrl: this.options.repositoryUrl,
      });

      return {
        packageName: packageTemplate.name,
        packageDir,
        generatedFiles,
        success: true,
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error(
        `Package generation failed: ${component.name}`,
        error as Error,
      );

      return {
        packageName: '',
        packageDir: '',
        generatedFiles,
        success: false,
        errors: [error as Error, ...errors],
        warnings,
      };
    }
  }

  /**
   * Create package directory
   */
  private async createPackageDirectory(
    component: ComponentDefinition,
  ): Promise<string> {
    const packageName = component.name
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');

    const packageDir = join(
      this.options.outputDir,
      'packages',
      `daisy-${packageName}`,
    );

    await fs.mkdir(packageDir, { recursive: true });
    await fs.mkdir(join(packageDir, 'src'), { recursive: true });
    await fs.mkdir(join(packageDir, 'dist'), { recursive: true });

    return packageDir;
  }

  /**
   * Generate package.json
   */
  private async generatePackageJson(
    component: ComponentDefinition,
    packageDir: string,
  ): Promise<string> {
    const packageTemplate = generatePackageTemplate(component, {
      scope: this.options.scope,
      repositoryUrl: this.options.repositoryUrl,
    });

    const packageJsonPath = join(packageDir, 'package.json');
    await fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageTemplate, null, 2),
    );

    return packageJsonPath;
  }

  /**
   * Copy component files to package
   */
  private async copyComponentFiles(
    sourceDir: string,
    packageDir: string,
  ): Promise<string[]> {
    const copiedFiles: string[] = [];

    try {
      const files = await fs.readdir(sourceDir, { recursive: true });

      for (const file of files) {
        const sourcePath = join(sourceDir, file);
        const stat = await fs.stat(sourcePath);

        if (stat.isFile() && this.shouldIncludeFile(file)) {
          const destPath = join(packageDir, 'src', file);
          await fs.mkdir(join(destPath, '..'), { recursive: true });
          await fs.copyFile(sourcePath, destPath);
          copiedFiles.push(destPath);
        }
      }
    } catch (error) {
      this.logger.warn('Failed to copy some component files', {
        error: (error as Error).message,
      });
    }

    return copiedFiles;
  }

  /**
   * Determine if file should be included in package
   */
  private shouldIncludeFile(filename: string): boolean {
    const excludePatterns = [
      /\.test\.(ts|tsx|js|jsx)$/,
      /\.spec\.(ts|tsx|js|jsx)$/,
      /__tests__/,
      /node_modules/,
      /\.d\.ts$/,
    ];

    return !excludePatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Generate README.md
   */
  private async generateReadme(
    component: ComponentDefinition,
    packageDir: string,
  ): Promise<string> {
    const packageTemplate = generatePackageTemplate(component, {
      scope: this.options.scope,
    });

    const readme = this.createReadmeContent(component, packageTemplate);
    const readmePath = join(packageDir, 'README.md');

    await fs.writeFile(readmePath, readme);

    return readmePath;
  }

  /**
   * Create README content
   */
  private createReadmeContent(
    component: ComponentDefinition,
    packageTemplate: PackageTemplate,
  ): string {
    return `# ${packageTemplate.name}

${packageTemplate.description}

## Installation

\`\`\`bash
npm install ${packageTemplate.name}
\`\`\`

## Usage

\`\`\`tsx
import { ${component.name} } from '${packageTemplate.name}';

function App() {
  return (
    <${component.name} 
      // Add props here
    />
  );
}
\`\`\`

## Props

${this.generatePropsTable(component)}

## Features

- ✅ Migrated from DAISY v1 with business logic preservation
- ✅ Full TypeScript support
- ✅ Configurator v2 compatible
- ✅ ${component.reactPatterns.length} React patterns implemented
- ✅ ${component.businessLogic.length} business logic functions preserved

## Complexity

**Level**: ${component.complexity.charAt(0).toUpperCase() + component.complexity.slice(1)}

## Requirements

${Object.entries(packageTemplate.peerDependencies)
  .map(([dep, version]) => `- ${dep}: ${version}`)
  .join('\n')}

## License

${packageTemplate.license}

## Repository

${packageTemplate.repository.url}
`;
  }

  /**
   * Generate props documentation table
   */
  private generatePropsTable(component: ComponentDefinition): string {
    if (component.props.length === 0) {
      return '_No props defined_';
    }

    let table = '| Prop | Type | Required | Description |\n';
    table += '|------|------|----------|-------------|\n';

    for (const prop of component.props) {
      table += `| \`${prop.name}\` | \`${prop.type}\` | ${prop.required ? '✅' : '❌'} | ${prop.description || '-'} |\n`;
    }

    return table;
  }

  /**
   * Generate LICENSE file
   */
  private async generateLicense(packageDir: string): Promise<string> {
    const licensePath = join(packageDir, 'LICENSE');
    const licenseContent = this.getLicenseContent();

    await fs.writeFile(licensePath, licenseContent);

    return licensePath;
  }

  /**
   * Get license content
   */
  private getLicenseContent(): string {
    const year = new Date().getFullYear();

    switch (this.options.licenseType) {
      case 'MIT':
        return `MIT License

Copyright (c) ${year} EAI Development Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

      default:
        return `Copyright (c) ${year} EAI Development Team. All rights reserved.`;
    }
  }

  /**
   * Generate TypeScript declaration files
   */
  private async generateTypes(
    component: ComponentDefinition,
    packageDir: string,
  ): Promise<string> {
    const typesPath = join(packageDir, 'src', 'index.d.ts');

    const types = `/**
 * Type definitions for ${component.name}
 * Generated from DAISY v1 migration
 */

import * as React from 'react';

${component.props.length > 0 ? this.generatePropsInterface(component) : ''}

export declare const ${component.name}: React.${component.type === 'functional' ? 'FC' : 'ComponentClass'}${component.props.length > 0 ? `<${component.name}Props>` : ''};

export default ${component.name};
`;

    await fs.writeFile(typesPath, types);

    return typesPath;
  }

  /**
   * Generate props interface for types
   */
  private generatePropsInterface(component: ComponentDefinition): string {
    let interfaceCode = `export interface ${component.name}Props {\n`;

    for (const prop of component.props) {
      const optional = prop.required ? '' : '?';
      const description = prop.description
        ? `  /** ${prop.description} */\n`
        : '';
      interfaceCode += `${description}  ${prop.name}${optional}: ${prop.type};\n`;
    }

    interfaceCode += '}\n\n';

    return interfaceCode;
  }

  /**
   * Generate packages for multiple components
   */
  public async generatePackages(
    components: ComponentDefinition[],
    sourceDirs: Map<string, string>,
  ): Promise<PackageGenerationResult[]> {
    const results: PackageGenerationResult[] = [];

    for (const component of components) {
      const sourceDir = sourceDirs.get(component.id);
      if (!sourceDir) {
        this.logger.warn(`No source directory found for: ${component.name}`);
        continue;
      }

      const result = await this.generatePackage(component, sourceDir);
      results.push(result);
    }

    return results;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Create NPM packager
 */
export function createNPMPackager(options: NPMPackageOptions): NPMPackager {
  return new NPMPackager(options);
}

/**
 * Generate NPM package for component
 */
export async function generateNPMPackage(
  component: ComponentDefinition,
  sourceDir: string,
  options: NPMPackageOptions,
): Promise<PackageGenerationResult> {
  const packager = createNPMPackager(options);
  return packager.generatePackage(component, sourceDir);
}
