/**
 * Package.json Template Generator
 *
 * Generates package.json files for migrated components with proper
 * dependencies, metadata, and configuration.
 *
 * @fileoverview NPM package.json template generation
 * @version 1.0.0
 */

import type { ComponentDefinition } from '@/types';

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

/**
 * Package.json template
 */
export interface PackageTemplate {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly main: string;
  readonly module: string;
  readonly types: string;
  readonly files: string[];
  readonly keywords: string[];
  readonly author: string;
  readonly license: string;
  readonly repository: RepositoryInfo;
  readonly bugs: BugsInfo;
  readonly homepage: string;
  readonly peerDependencies: Record<string, string>;
  readonly dependencies: Record<string, string>;
  readonly devDependencies: Record<string, string>;
  readonly scripts: Record<string, string>;
  readonly publishConfig: PublishConfig;
  readonly sideEffects: boolean | string[];
}

/**
 * Repository information
 */
export interface RepositoryInfo {
  readonly type: string;
  readonly url: string;
  readonly directory?: string;
}

/**
 * Bug tracking information
 */
export interface BugsInfo {
  readonly url: string;
  readonly email?: string;
}

/**
 * NPM publish configuration
 */
export interface PublishConfig {
  readonly access: 'public' | 'restricted';
  readonly registry?: string;
  readonly tag?: string;
}

/**
 * Package generation options
 */
export interface PackageGenerationOptions {
  /** Package scope (e.g., @eai) */
  readonly scope?: string;

  /** Package version */
  readonly version?: string;

  /** Package author */
  readonly author?: string;

  /** Package license */
  readonly license?: string;

  /** Repository URL */
  readonly repositoryUrl?: string;

  /** Include source maps */
  readonly includeSourceMaps?: boolean;

  /** Custom dependencies */
  readonly customDependencies?: Record<string, string>;

  /** Custom peer dependencies */
  readonly customPeerDependencies?: Record<string, string>;
}

// ============================================================================
// PACKAGE TEMPLATE GENERATOR
// ============================================================================

/**
 * Generates package.json templates for migrated components
 */
export class PackageTemplateGenerator {
  private readonly defaultOptions: Required<PackageGenerationOptions>;

  constructor(options: PackageGenerationOptions = {}) {
    this.defaultOptions = {
      scope: '@eai',
      version: '1.0.0',
      author: 'EAI Development Team',
      license: 'MIT',
      repositoryUrl: 'https://github.com/eai/eai-daisy-components',
      includeSourceMaps: true,
      customDependencies: {},
      customPeerDependencies: {},
      ...options,
    };
  }

  /**
   * Generate package.json template for component
   */
  public generateTemplate(
    component: ComponentDefinition,
    options: Partial<PackageGenerationOptions> = {},
  ): PackageTemplate {
    const opts = { ...this.defaultOptions, ...options };
    const packageName = this.generatePackageName(component, opts.scope);

    return {
      name: packageName,
      version: opts.version,
      description: this.generateDescription(component),
      main: './dist/index.js',
      module: './dist/index.esm.js',
      types: './dist/index.d.ts',
      files: this.generateFiles(opts.includeSourceMaps),
      keywords: this.generateKeywords(component),
      author: opts.author,
      license: opts.license,
      repository: this.generateRepositoryInfo(component, opts.repositoryUrl),
      bugs: {
        url: `${opts.repositoryUrl}/issues`,
      },
      homepage: `${opts.repositoryUrl}#readme`,
      peerDependencies: this.generatePeerDependencies(component, opts),
      dependencies: this.generateDependencies(component, opts),
      devDependencies: this.generateDevDependencies(),
      scripts: this.generateScripts(),
      publishConfig: {
        access: 'public',
      },
      sideEffects: this.determineSideEffects(component),
    };
  }

  /**
   * Generate package name
   */
  private generatePackageName(
    component: ComponentDefinition,
    scope?: string,
  ): string {
    const baseName = component.name
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');

    return scope ? `${scope}/daisy-${baseName}` : `daisy-${baseName}`;
  }

  /**
   * Generate package description
   */
  private generateDescription(component: ComponentDefinition): string {
    const typeLabel = component.type === 'functional' ? 'Functional' : 'Class';
    const complexityLabel =
      component.complexity.charAt(0).toUpperCase() +
      component.complexity.slice(1);

    return `${typeLabel} React component (${complexityLabel} complexity) migrated from DAISY v1 to Configurator v2 architecture with business logic preservation.`;
  }

  /**
   * Generate files array
   */
  private generateFiles(includeSourceMaps: boolean): string[] {
    const files = ['dist/', 'README.md', 'LICENSE'];

    if (includeSourceMaps) {
      files.push('dist/**/*.map');
    }

    return files;
  }

  /**
   * Generate keywords
   */
  private generateKeywords(component: ComponentDefinition): string[] {
    const keywords = [
      'react',
      'component',
      'typescript',
      'daisy',
      'configurator',
      'ui',
      component.name.toLowerCase(),
      component.complexity,
      component.type,
    ];

    // Add react patterns as keywords
    keywords.push(...component.reactPatterns.map(p => p.toLowerCase()));

    return Array.from(new Set(keywords));
  }

  /**
   * Generate repository info
   */
  private generateRepositoryInfo(
    component: ComponentDefinition,
    repositoryUrl: string,
  ): RepositoryInfo {
    return {
      type: 'git',
      url: `${repositoryUrl}.git`,
      directory: `packages/${component.name}`,
    };
  }

  /**
   * Generate peer dependencies
   */
  private generatePeerDependencies(
    component: ComponentDefinition,
    options: Required<PackageGenerationOptions>,
  ): Record<string, string> {
    const peerDeps: Record<string, string> = {
      react: '^18.0.0',
      'react-dom': '^18.0.0',
      '@configurator/sdk': '^2.1.0',
      ...options.customPeerDependencies,
    };

    // Add specific peer dependencies based on component dependencies
    for (const dep of component.dependencies) {
      if (dep.type === 'external' && !dep.importPath.startsWith('.')) {
        const packageName = this.extractPackageName(dep.importPath);
        if (packageName && !peerDeps[packageName]) {
          peerDeps[packageName] = '*';
        }
      }
    }

    return peerDeps;
  }

  /**
   * Generate runtime dependencies
   */
  private generateDependencies(
    component: ComponentDefinition,
    options: Required<PackageGenerationOptions>,
  ): Record<string, string> {
    const deps: Record<string, string> = {
      ...options.customDependencies,
    };

    // Add utility dependencies if component has complex business logic
    if (component.businessLogic.length > 5) {
      deps['lodash-es'] = '^4.17.21';
    }

    return deps;
  }

  /**
   * Generate dev dependencies
   */
  private generateDevDependencies(): Record<string, string> {
    return {
      '@types/react': '^18.0.0',
      '@types/react-dom': '^18.0.0',
      typescript: '^5.0.0',
      vite: '^4.0.0',
    };
  }

  /**
   * Generate package scripts
   */
  private generateScripts(): Record<string, string> {
    return {
      build: 'vite build',
      'build:types': 'tsc --declaration --emitDeclarationOnly --outDir dist',
      dev: 'vite',
      typecheck: 'tsc --noEmit',
      prepublishOnly: 'npm run build && npm run build:types',
    };
  }

  /**
   * Determine if component has side effects
   */
  private determineSideEffects(component: ComponentDefinition): boolean {
    // Check if component has side effects based on business logic names and external dependencies
    const hasSideEffects = component.businessLogic.some(
      bl =>
        bl.name.toLowerCase().includes('effect') ||
        bl.name.toLowerCase().includes('fetch') ||
        bl.externalDependencies.length > 0,
    );

    return hasSideEffects;
  }

  /**
   * Extract package name from import path
   */
  private extractPackageName(importPath: string): string | null {
    // Handle scoped packages (@scope/package)
    if (importPath.startsWith('@')) {
      const parts = importPath.split('/');
      return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null;
    }

    // Handle regular packages
    const parts = importPath.split('/');
    return parts[0] || null;
  }

  /**
   * Generate package.json string
   */
  public generatePackageJson(
    component: ComponentDefinition,
    options: Partial<PackageGenerationOptions> = {},
  ): string {
    const template = this.generateTemplate(component, options);
    return JSON.stringify(template, null, 2);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Create package template generator
 */
export function createPackageTemplateGenerator(
  options?: PackageGenerationOptions,
): PackageTemplateGenerator {
  return new PackageTemplateGenerator(options);
}

/**
 * Generate package template for component
 */
export function generatePackageTemplate(
  component: ComponentDefinition,
  options?: PackageGenerationOptions,
): PackageTemplate {
  const generator = createPackageTemplateGenerator(options);
  return generator.generateTemplate(component);
}

/**
 * Generate package.json string for component
 */
export function generatePackageJson(
  component: ComponentDefinition,
  options?: PackageGenerationOptions,
): string {
  const generator = createPackageTemplateGenerator(options);
  return generator.generatePackageJson(component);
}
