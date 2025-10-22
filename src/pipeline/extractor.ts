/**
 * Component Extractor
 *
 * Extracts component definitions from DAISY v1 source files, analyzing
 * structure, props, business logic, dependencies, and React patterns.
 *
 * @fileoverview Component extraction logic for migration pipeline
 * @version 1.0.0
 */

import { resolve, basename, extname } from 'path';
import type {
  ComponentDefinition,
  ComponentType,
  ComponentMetadata,
  PropDefinition,
  BusinessLogicDefinition,
  ComponentDependency,
  ComplexityLevel,
  ReactPattern,
  ParameterDefinition,
  MigrationStatus,
} from '@/types';
import { FileSystemManager, type ComponentFileInfo } from '@/utils/filesystem';
import { getGlobalLogger } from '@/utils/logging';

// ============================================================================
// EXTRACTOR TYPES
// ============================================================================

/**
 * Extraction options
 */
export interface ExtractorOptions {
  /** Whether to analyze business logic deeply */
  readonly deepAnalysis?: boolean;

  /** Whether to extract documentation */
  readonly extractDocs?: boolean;

  /** Whether to analyze dependencies */
  readonly analyzeDependencies?: boolean;

  /** Timeout for extraction in milliseconds */
  readonly timeout?: number;
}

/**
 * Extraction result with component definition
 */
export interface ExtractionResult {
  /** Extracted component definition */
  readonly component: ComponentDefinition;

  /** Extraction success status */
  readonly success: boolean;

  /** Extraction warnings */
  readonly warnings: string[];

  /** Extraction errors */
  readonly errors: string[];

  /** Extraction duration in milliseconds */
  readonly duration: number;
}

// ============================================================================
// COMPONENT EXTRACTOR CLASS
// ============================================================================

/**
 * Main component extraction class
 *
 * Analyzes DAISY v1 component files and extracts comprehensive
 * component definitions for migration pipeline processing.
 */
export class ComponentExtractor {
  private readonly logger = getGlobalLogger('ComponentExtractor');
  private readonly fileSystem = new FileSystemManager();

  /**
   * Extract component definition from file
   *
   * @param filePath - Path to component file
   * @param options - Extraction options
   * @returns Extraction result with component definition
   */
  public async extractComponent(
    filePath: string,
    options: ExtractorOptions = {}
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      this.logger.info(`Extracting component from ${filePath}`);

      const {
        deepAnalysis = true,
        extractDocs = true,
        analyzeDependencies = true,
      } = options;

      // Read and validate file
      const resolvedPath = resolve(filePath);
      const content = await this.fileSystem.readFile(resolvedPath);
      const fileInfo = await this.fileSystem.getFileInfo(resolvedPath);

      // Generate component ID
      const componentId = this.generateComponentId(filePath);

      // Extract component name
      const componentName = this.extractComponentName(content, fileInfo.name);

      // Detect component type
      const componentType = this.detectComponentType(content);

      // Extract props
      const props = this.extractProps(content);
      if (props.length === 0) {
        warnings.push('No props definitions found');
      }

      // Extract business logic
      const businessLogic = this.extractBusinessLogic(content);

      // Detect React patterns
      const reactPatterns = this.detectReactPatterns(content);

      // Analyze dependencies
      const dependencies = analyzeDependencies
        ? this.extractDependencies(content)
        : [];

      // Calculate complexity
      const complexity = this.calculateComplexity(content, businessLogic, reactPatterns);

      // Extract metadata
      const metadata = this.extractMetadata(content, fileInfo, extractDocs);

      // Build component definition
      const component: ComponentDefinition = {
        id: componentId,
        name: componentName,
        type: componentType,
        sourcePath: resolvedPath,
        props,
        businessLogic,
        reactPatterns,
        dependencies,
        complexity,
        migrationStatus: 'pending' as MigrationStatus,
        metadata,
      };

      const duration = Date.now() - startTime;

      this.logger.info(`Successfully extracted component ${componentName}`, {
        duration,
        complexity,
        propsCount: props.length,
        businessLogicCount: businessLogic.length,
      });

      return {
        component,
        success: true,
        warnings,
        errors,
        duration,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);

      this.logger.error(`Failed to extract component from ${filePath}`, error as Error);

      // Return minimal component definition for failed extraction
      const failedComponent: ComponentDefinition = {
        id: this.generateComponentId(filePath),
        name: basename(filePath, extname(filePath)),
        type: 'functional',
        sourcePath: resolve(filePath),
        props: [],
        businessLogic: [],
        reactPatterns: [],
        dependencies: [],
        complexity: 'simple',
        migrationStatus: 'failed',
        metadata: {
          createdAt: new Date(),
          lastModified: new Date(),
        },
      };

      return {
        component: failedComponent,
        success: false,
        warnings,
        errors,
        duration,
      };
    }
  }

  /**
   * Extract multiple components from directory
   *
   * @param directoryPath - Directory containing components
   * @param options - Extraction options
   * @returns Array of extraction results
   */
  public async extractFromDirectory(
    directoryPath: string,
    options: ExtractorOptions = {}
  ): Promise<ExtractionResult[]> {
    this.logger.info(`Extracting components from directory ${directoryPath}`);

    const scanResult = await this.fileSystem.scanDirectory(directoryPath);
    const componentFiles = scanResult.componentFiles as ComponentFileInfo[];

    this.logger.info(`Found ${componentFiles.length} component files`);

    const results: ExtractionResult[] = [];

    for (const file of componentFiles) {
      const result = await this.extractComponent(file.path, options);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    this.logger.info(`Extracted ${successCount}/${componentFiles.length} components successfully`);

    return results;
  }

  // ==========================================================================
  // PRIVATE EXTRACTION METHODS
  // ==========================================================================

  /**
   * Generate unique component ID from file path
   */
  private generateComponentId(filePath: string): string {
    const normalized = filePath.replace(/\\/g, '/');
    const hash = this.simpleHash(normalized);
    const name = basename(filePath, extname(filePath));
    return `${name}-${hash}`;
  }

  /**
   * Simple string hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  /**
   * Extract component name from content or filename
   */
  private extractComponentName(content: string, fileName: string): string {
    // Try export default
    const defaultExportMatch = content.match(/export\s+default\s+(?:function\s+)?([A-Z][a-zA-Z0-9]*)/);
    if (defaultExportMatch?.[1]) {
      return defaultExportMatch[1];
    }

    // Try named export
    const namedExportMatch = content.match(/export\s+(?:const|function|class)\s+([A-Z][a-zA-Z0-9]*)/);
    if (namedExportMatch?.[1]) {
      return namedExportMatch[1];
    }

    // Try function/class declaration
    const declarationMatch = content.match(/(?:function|class)\s+([A-Z][a-zA-Z0-9]*)/);
    if (declarationMatch?.[1]) {
      return declarationMatch[1];
    }

    // Fallback to filename
    const baseName = basename(fileName, extname(fileName));
    return baseName.charAt(0).toUpperCase() + baseName.slice(1);
  }

  /**
   * Detect component type from content
   */
  private detectComponentType(content: string): ComponentType {
    if (content.includes('React.Component') || content.includes('extends Component')) {
      return 'class';
    }

    if (content.includes('useState') || content.includes('useEffect')) {
      return 'functional';
    }

    if (content.includes('withRouter') || content.includes('connect(') || /export\s+default\s+\w+\(/.test(content)) {
      return 'higher-order';
    }

    if (/export\s+(?:function|const)\s+use[A-Z]/.test(content)) {
      return 'hook';
    }

    return 'utility';
  }

  /**
   * Extract prop definitions from component
   */
  private extractProps(content: string): PropDefinition[] {
    const props: PropDefinition[] = [];

    // Extract interface/type definitions for props
    const interfaceMatch = content.match(/interface\s+\w*Props\s*{([^}]+)}/s);
    const typeMatch = content.match(/type\s+\w*Props\s*=\s*{([^}]+)}/s);

    const propsDefinition = interfaceMatch?.[1] || typeMatch?.[1];

    if (propsDefinition) {
      const propLines = propsDefinition.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//') && !line.startsWith('/*'));

      for (const line of propLines) {
        const propMatch = line.match(/(\w+)(\?)?:\s*([^;,]+)/);
        if (propMatch) {
          const [, name, optional, typeStr] = propMatch;

          if (!name || !typeStr) continue;

          const propDef: PropDefinition = {
            name,
            type: typeStr.trim(),
            required: !optional,
          };

          const description = this.extractPropDescription(content, name);
          if (description !== undefined) {
            propDef.description = description;
          }

          props.push(propDef);
        }
      }
    }

    return props;
  }

  /**
   * Extract prop description from JSDoc comments
   */
  private extractPropDescription(content: string, propName: string): string | undefined {
    const regex = new RegExp(`\\*\\s*@param\\s+${propName}\\s+-?\\s*(.+)`, 'i');
    const match = content.match(regex);
    return match?.[1]?.trim();
  }

  /**
   * Extract business logic functions
   */
  private extractBusinessLogic(content: string): BusinessLogicDefinition[] {
    const businessLogic: BusinessLogicDefinition[] = [];

    // Extract function declarations
    const functionRegex = /(?:const|function)\s+(\w+)\s*=?\s*(?:async\s*)?\([^)]*\)\s*(?::\s*[^{]+)?\s*(?:=>)?\s*{/g;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      const functionName = match[1];

      if (!functionName) continue;

      // Skip React lifecycle methods and hooks
      if (this.isReactMethod(functionName)) {
        continue;
      }

      const signature = this.extractFunctionSignature(content, functionName);
      const parameters = this.extractParameters(signature);
      const returnType = this.extractReturnType(signature);
      const complexity = this.estimateFunctionComplexity(content, functionName);

      businessLogic.push({
        name: functionName,
        signature,
        purpose: this.extractFunctionPurpose(content, functionName),
        parameters,
        returnType,
        complexity,
        externalDependencies: this.extractExternalDependencies(content, functionName),
      });
    }

    return businessLogic;
  }

  /**
   * Check if function name is a React method
   */
  private isReactMethod(name: string): boolean {
    const reactMethods = [
      'render', 'componentDidMount', 'componentDidUpdate', 'componentWillUnmount',
      'shouldComponentUpdate', 'getSnapshotBeforeUpdate', 'componentDidCatch',
    ];
    return reactMethods.includes(name) || name.startsWith('use');
  }

  /**
   * Extract function signature
   */
  private extractFunctionSignature(content: string, functionName: string): string {
    const regex = new RegExp(`(?:const|function)\\s+${functionName}\\s*=?\\s*(?:async\\s*)?\\([^)]*\\)(?:\\s*:\\s*[^{]+)?`, 'g');
    const match = regex.exec(content);
    return match?.[0] || `function ${functionName}()`;
  }

  /**
   * Extract function parameters
   */
  private extractParameters(signature: string): ParameterDefinition[] {
    const paramsMatch = signature.match(/\(([^)]*)\)/);
    if (!paramsMatch?.[1]) return [];

    const params = paramsMatch[1].split(',').map(p => p.trim()).filter(Boolean);

    return params.map(param => {
      const [namePart, typePart] = param.split(':').map(s => s.trim());

      if (!namePart) {
        return {
          name: 'unknown',
          type: 'unknown',
          optional: false,
        };
      }

      const optional = namePart.includes('?');
      const name = namePart.replace('?', '').trim();
      const type = typePart || 'unknown';

      return {
        name,
        type,
        optional,
      };
    });
  }

  /**
   * Extract return type from signature
   */
  private extractReturnType(signature: string): string {
    const returnMatch = signature.match(/\):\s*([^{]+)/);
    return returnMatch?.[1]?.trim() || 'void';
  }

  /**
   * Extract function purpose from JSDoc
   */
  private extractFunctionPurpose(content: string, functionName: string): string {
    const regex = new RegExp(`\\/\\*\\*([^*]*(?:\\*(?!\\/)[^*]*)*)\\*\\/\\s*(?:const|function)\\s+${functionName}`, 's');
    const match = content.match(regex);

    if (match?.[1]) {
      const lines = match[1].split('\n')
        .map(line => line.replace(/^\s*\*\s?/, '').trim())
        .filter(line => line && !line.startsWith('@'));

      return lines.join(' ');
    }

    return `Function ${functionName}`;
  }

  /**
   * Estimate function complexity
   */
  private estimateFunctionComplexity(content: string, functionName: string): ComplexityLevel {
    const functionRegex = new RegExp(`(?:const|function)\\s+${functionName}[\\s\\S]*?(?=\\n(?:const|function|export|$))`, 'g');
    const functionMatch = content.match(functionRegex);

    if (!functionMatch) return 'simple';

    const functionBody = functionMatch[0];
    const lines = functionBody.split('\n').length;
    const cyclomaticComplexity = (functionBody.match(/if|else|while|for|switch|case|\?|&&|\|\|/g) || []).length;

    if (lines > 50 || cyclomaticComplexity > 10) return 'critical';
    if (lines > 30 || cyclomaticComplexity > 5) return 'complex';
    if (lines > 15 || cyclomaticComplexity > 2) return 'moderate';
    return 'simple';
  }

  /**
   * Extract external dependencies for function
   */
  private extractExternalDependencies(content: string, _functionName: string): string[] {
    const dependencies: string[] = [];

    // Extract API calls
    const apiCalls = content.match(/(?:fetch|axios|api)\.[a-z]+/gi) || [];
    dependencies.push(...apiCalls);

    // Extract service imports
    const serviceImports = content.match(/from\s+['"].*(?:service|api)['"]/gi) || [];
    dependencies.push(...serviceImports);

    return [...new Set(dependencies)];
  }

  /**
   * Detect React patterns used in component
   */
  private detectReactPatterns(content: string): ReactPattern[] {
    const patterns: ReactPattern[] = [];

    if (content.includes('useState')) patterns.push('useState');
    if (content.includes('useEffect')) patterns.push('useEffect');
    if (content.includes('useContext')) patterns.push('useContext');
    if (content.includes('useReducer')) patterns.push('useReducer');
    if (content.includes('useMemo')) patterns.push('useMemo');
    if (content.includes('useCallback')) patterns.push('useCallback');
    if (/use[A-Z]\w+/.test(content) && !patterns.length) patterns.push('custom-hook');
    if (content.includes('render={(') || content.includes('render={function')) patterns.push('render-props');
    if (content.includes('children(') || content.includes('children:{')) patterns.push('children-as-function');

    return patterns;
  }

  /**
   * Extract component dependencies
   */
  private extractDependencies(content: string): ComponentDependency[] {
    const dependencies: ComponentDependency[] = [];
    const importRegex = /import\s+(?:{[^}]+}|[^{}\s]+)\s+from\s+['"]([^'"]+)['"]/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];

      if (!importPath) continue;

      const name = importPath.split('/').pop() || importPath;

      dependencies.push({
        name,
        type: this.classifyDependency(importPath),
        importPath,
        critical: this.isDependencyCritical(importPath),
      });
    }

    return dependencies;
  }

  /**
   * Classify dependency type
   */
  private classifyDependency(importPath: string): 'component' | 'utility' | 'service' | 'external' {
    if (importPath.startsWith('.') || importPath.startsWith('/')) {
      if (importPath.includes('component')) return 'component';
      if (importPath.includes('service') || importPath.includes('api')) return 'service';
      return 'utility';
    }
    return 'external';
  }

  /**
   * Determine if dependency is critical
   */
  private isDependencyCritical(importPath: string): boolean {
    const criticalPatterns = ['react', 'react-dom', '@configurator/sdk'];
    return criticalPatterns.some(pattern => importPath.includes(pattern));
  }

  /**
   * Calculate overall component complexity
   */
  private calculateComplexity(
    content: string,
    businessLogic: BusinessLogicDefinition[],
    reactPatterns: ReactPattern[]
  ): ComplexityLevel {
    const lines = content.split('\n').length;
    const logicComplexity = businessLogic.filter(bl => bl.complexity === 'complex' || bl.complexity === 'critical').length;
    const patternCount = reactPatterns.length;

    if (lines > 300 || logicComplexity > 3 || patternCount > 5) return 'critical';
    if (lines > 200 || logicComplexity > 1 || patternCount > 3) return 'complex';
    if (lines > 100 || logicComplexity > 0 || patternCount > 1) return 'moderate';
    return 'simple';
  }

  /**
   * Extract component metadata
   */
  private extractMetadata(content: string, fileInfo: { size: number; modifiedAt: Date; createdAt: Date }, extractDocs: boolean): ComponentMetadata {
    const author = this.extractAuthor(content);
    const documentation = extractDocs ? this.extractDocumentation(content) : undefined;

    const metadata: ComponentMetadata = {
      createdAt: fileInfo.createdAt,
      lastModified: fileInfo.modifiedAt,
      ...(author !== undefined && { author }),
      ...(documentation !== undefined && { documentation }),
      performance: {
        bundleSize: fileInfo.size,
      },
    };

    return metadata;
  }

  /**
   * Extract author from JSDoc or comments
   */
  private extractAuthor(content: string): string | undefined {
    const authorMatch = content.match(/@author\s+(.+)/i);
    return authorMatch?.[1]?.trim();
  }

  /**
   * Extract component documentation
   */
  private extractDocumentation(content: string): string | undefined {
    const docMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
    if (docMatch?.[1]) {
      return docMatch[1]
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, '').trim())
        .filter(line => !line.startsWith('@'))
        .join('\n')
        .trim();
    }
    return undefined;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a component extractor instance
 */
export function createExtractor(): ComponentExtractor {
  return new ComponentExtractor();
}

/**
 * Quick component extraction from file
 */
export async function extractComponent(
  filePath: string,
  options?: ExtractorOptions
): Promise<ExtractionResult> {
  const extractor = createExtractor();
  return extractor.extractComponent(filePath, options);
}

/**
 * Extract components from directory
 */
export async function extractFromDirectory(
  directoryPath: string,
  options?: ExtractorOptions
): Promise<ExtractionResult[]> {
  const extractor = createExtractor();
  return extractor.extractFromDirectory(directoryPath, options);
}
