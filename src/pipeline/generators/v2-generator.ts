/**
 * V2 Component Generator
 *
 * Generates Configurator-compatible components from transformed definitions.
 *
 * @fileoverview Component generator for Configurator v2 output
 * @version 1.0.0
 */

import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import type {
  ComponentDefinition,
  ExtractionConfig,
  GeneratedArtifacts,
  GeneratedFile,
} from '@/types';
import type { TransformationResult } from '@/pipeline/transformers/configurator-transformer';
import { FileSystemManager } from '@/utils/filesystem';
import { getGlobalLogger } from '@/utils/logging';

export interface GenerationOptions {
  readonly generateTypes?: boolean;
  readonly generateTests?: boolean;
  readonly generateDocs?: boolean;
  readonly generateExamples?: boolean;
  readonly includeComments?: boolean;
}

export interface GenerationResult {
  readonly component: ComponentDefinition;
  readonly artifacts: GeneratedArtifacts;
  readonly outputPath: string;
  readonly success: boolean;
  readonly errors: Error[];
}

export class V2ComponentGenerator {
  private readonly config: ExtractionConfig;
  private readonly fileManager: FileSystemManager;
  private readonly logger = getGlobalLogger('V2ComponentGenerator');

  constructor(config: ExtractionConfig) {
    this.config = config;
    this.fileManager = new FileSystemManager();
  }

  public async generate(
    transformationResult: TransformationResult,
    sourceCode: string,
    options: GenerationOptions = {},
  ): Promise<GenerationResult> {
    this.logger.info(
      `Generating V2 component: ${transformationResult.transformed.name}`,
    );

    const artifacts: GeneratedArtifacts = {
      component: await this.generateComponentFile(
        transformationResult,
        sourceCode,
        options,
      ),
      types: options.generateTypes
        ? await this.generateTypeFiles(transformationResult)
        : [],
      tests: options.generateTests
        ? await this.generateTestFiles(transformationResult)
        : [],
      documentation: options.generateDocs
        ? await this.generateDocumentation(transformationResult)
        : [],
      examples: options.generateExamples
        ? await this.generateExamples(transformationResult)
        : [],
      utilities: [],
    };

    const outputPath = join(
      this.config.outputPath,
      'src',
      'components',
      transformationResult.transformed.name,
    );

    await this.writeArtifacts(artifacts, outputPath);

    return {
      component: transformationResult.transformed,
      artifacts,
      outputPath,
      success: true,
      errors: [],
    };
  }

  private generateComponentFile(
    result: TransformationResult,
    _sourceCode: string,
    options: GenerationOptions,
  ): Promise<GeneratedFile> {
    const { transformed } = result;
    const content = this.generateConfiguratorComponent(result, options);

    return Promise.resolve({
      path: `${transformed.name}.tsx`,
      content,
      size: Buffer.from(content).length,
      type: 'component',
      generatedAt: new Date(),
    });
  }

  private generateConfiguratorComponent(
    result: TransformationResult,
    options: GenerationOptions,
  ): string {
    const { transformed, transformations } = result;
    const doc =
      transformed.metadata.documentation || `${transformed.name} component`;

    const propsInterface = `export interface ${transformed.name}Props {
${transformed.props.map(p => `  ${p.name}${p.required ? '' : '?'}: ${p.type};`).join('\n')}
}`;

    return `/**
 * ${transformed.name} - Configurator V2 Component
 *
 * ${doc}
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';

${
  options.includeComments
    ? `/**
 * Props for ${transformed.name}
 */`
    : ''
}
${propsInterface}

export const ${transformed.name}: React.FC<${transformed.name}Props> = (props) => {
  const config = useConfigurator();

${transformations
  .filter(t => t.type === 'state')
  .map(t => `  ${t.transformed};`)
  .join('\n')}

  return (
    <div className="${transformed.name.toLowerCase()}">
      {/* Component implementation */}
    </div>
  );
};

${transformed.name}.displayName = '${transformed.name}';

export default ${transformed.name};
`;
  }

  private generateTypeFiles(
    result: TransformationResult,
  ): Promise<GeneratedFile[]> {
    const content = `export * from './${result.transformed.name}';`;
    return Promise.resolve([
      {
        path: 'index.ts',
        content,
        size: Buffer.from(content).length,
        type: 'types',
        generatedAt: new Date(),
      },
    ]);
  }

  private generateTestFiles(
    result: TransformationResult,
  ): Promise<GeneratedFile[]> {
    const content = `import { render } from '@testing-library/react';
import { ${result.transformed.name} } from './${result.transformed.name}';

describe('${result.transformed.name}', () => {
  it('should render', () => {
    const { container } = render(<${result.transformed.name} />);
    expect(container).toBeInTheDocument();
  });
});
`;

    return Promise.resolve([
      {
        path: `${result.transformed.name}.test.tsx`,
        content,
        size: Buffer.from(content).length,
        type: 'test',
        generatedAt: new Date(),
      },
    ]);
  }

  private generateDocumentation(
    result: TransformationResult,
  ): Promise<GeneratedFile[]> {
    const content = `# ${result.transformed.name}

## Props
${result.transformed.props.map(p => `- **${p.name}** (${p.type}): ${p.description}`).join('\n')}

## Migration
- Strategy: ${result.strategy}
- Business Logic Preserved: ${result.businessLogicPreserved}
`;

    return Promise.resolve([
      {
        path: 'README.md',
        content,
        size: Buffer.from(content).length,
        type: 'documentation',
        generatedAt: new Date(),
      },
    ]);
  }

  private generateExamples(
    result: TransformationResult,
  ): Promise<GeneratedFile[]> {
    const content = `import { ${result.transformed.name} } from './${result.transformed.name}';

export const Example = () => <${result.transformed.name} />;
`;

    return Promise.resolve([
      {
        path: `${result.transformed.name}.examples.tsx`,
        content,
        size: Buffer.from(content).length,
        type: 'example',
        generatedAt: new Date(),
      },
    ]);
  }

  private async writeArtifacts(
    artifacts: GeneratedArtifacts,
    outputPath: string,
  ): Promise<void> {
    await this.fileManager.createDirectory(outputPath);

    const allFiles = [
      artifacts.component,
      ...artifacts.types,
      ...artifacts.tests,
      ...artifacts.documentation,
      ...artifacts.examples,
      ...artifacts.utilities,
    ];

    for (const file of allFiles) {
      const filePath = join(outputPath, file.path);
      await fs.mkdir(dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.content, 'utf-8');
    }
  }
}

export function createV2Generator(
  config: ExtractionConfig,
): V2ComponentGenerator {
  return new V2ComponentGenerator(config);
}
