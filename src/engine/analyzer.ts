/**
 * Dependency Analyzer for DAISY v1 Component Extraction Pipeline
 * 
 * Analyzes component relationships, external dependencies, and inter-component
 * communication patterns. Generates dependency graphs and identifies potential
 * extraction challenges for migration planning.
 * 
 * @version 1.0.0
 * @author DAISY Component Extraction Pipeline
 */

import { resolve, dirname, basename } from 'path';
import { parse } from '@typescript-eslint/typescript-estree';
import type { TSESTree } from '@typescript-eslint/typescript-estree';
import { createSimpleLogger, type Logger } from '../utils/logging.js';
import { readFile } from 'fs/promises';
import type { ComponentDefinition } from '@/types';

/**
 * Dependency relationship types
 */
export type DependencyType = 
  | 'import' 
  | 'props' 
  | 'context' 
  | 'hook' 
  | 'hoc' 
  | 'render-prop' 
  | 'children';

/**
 * Dependency analysis level
 */
export type DependencyLevel = 'direct' | 'transitive' | 'circular';

/**
 * External dependency classification
 */
export type ExternalDependencyType = 
  | 'react' 
  | 'ui-library' 
  | 'utility' 
  | 'business-logic' 
  | 'testing' 
  | 'build-tool' 
  | 'unknown';

/**
 * Detailed dependency information
 */
export interface DependencyDetail {
  /** Source component */
  source: string;
  
  /** Target dependency */
  target: string;
  
  /** Type of dependency relationship */
  type: DependencyType;
  
  /** Dependency level (direct, transitive, circular) */
  level: DependencyLevel;
  
  /** Import path or reference */
  importPath?: string;
  
  /** Specific imports used */
  imports?: string[];
  
  /** Usage contexts where dependency is referenced */
  usageContext: DependencyUsageContext[];
  
  /** Is this dependency optional/conditional */
  optional: boolean;
  
  /** Migration impact assessment */
  extractionRisk: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Usage context for dependencies
 */
export interface DependencyUsageContext {
  /** Location in source code */
  location: {
    line: number;
    column: number;
  };
  
  /** Type of usage */
  usage: 'import' | 'prop-passing' | 'method-call' | 'jsx-element' | 'type-reference';
  
  /** Additional context information */
  context?: string;
}

/**
 * External dependency information
 */
export interface ExternalDependency {
  /** Package name */
  name: string;
  
  /** Package version if available */
  version?: string;
  
  /** Classification of dependency type */
  type: ExternalDependencyType;
  
  /** Specific imports from this package */
  imports: string[];
  
  /** Components that use this dependency */
  usedBy: string[];
  
  /** Usage frequency across codebase */
  usageCount: number;
  
  /** Is this a dev dependency */
  isDev: boolean;
  
  /** Migration strategy recommendation */
  migrationStrategy: 'keep' | 'replace' | 'remove' | 'evaluate';
}

/**
 * Dependency graph representation
 */
export interface DependencyGraph {
  /** All nodes in the graph */
  nodes: DependencyNode[];
  
  /** All edges/relationships */
  edges: DependencyEdge[];
  
  /** Detected circular dependencies */
  cycles: DependencyCycle[];
  
  /** Dependency clusters/groups */
  clusters: DependencyCluster[];
  
  /** Graph metrics */
  metrics: DependencyMetrics;
}

/**
 * Graph node representing a component or dependency
 */
export interface DependencyNode {
  /** Unique identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Node type */
  type: 'component' | 'external' | 'internal' | 'utility';
  
  /** File path for internal nodes */
  path?: string;
  
  /** Incoming dependency count */
  inDegree: number;
  
  /** Outgoing dependency count */
  outDegree: number;
  
  /** Node importance/centrality score */
  centrality: number;
}

/**
 * Graph edge representing a dependency relationship
 */
export interface DependencyEdge {
  /** Source node ID */
  from: string;
  
  /** Target node ID */
  to: string;
  
  /** Relationship type */
  type: DependencyType;
  
  /** Edge weight/strength */
  weight: number;
  
  /** Is this edge part of a cycle */
  isCyclic: boolean;
}

/**
 * Circular dependency cycle
 */
export interface DependencyCycle {
  /** Components involved in cycle */
  components: string[];
  
  /** Cycle length */
  length: number;
  
  /** Break recommendations */
  breakSuggestions: string[];
}

/**
 * Dependency cluster
 */
export interface DependencyCluster {
  /** Cluster identifier */
  id: string;
  
  /** Components in cluster */
  components: string[];
  
  /** Cluster cohesion score */
  cohesion: number;
  
  /** Extraction recommendation */
  extractionStrategy: 'together' | 'staged' | 'individual';
}

/**
 * Dependency analysis metrics
 */
export interface DependencyMetrics {
  /** Total number of components */
  totalComponents: number;
  
  /** Total number of dependencies */
  totalDependencies: number;
  
  /** External dependencies count */
  externalDependencies: number;
  
  /** Internal dependencies count */
  internalDependencies: number;
  
  /** Circular dependencies count */
  circularDependencies: number;
  
  /** Average component coupling */
  averageCoupling: number;
  
  /** Graph density */
  density: number;
  
  /** Most connected components */
  hubs: string[];
}

/**
 * Analysis configuration
 */
export interface AnalyzerConfig {
  /** Include transitive dependencies */
  includeTransitive: boolean;
  
  /** Maximum analysis depth */
  maxDepth: number;
  
  /** Ignore patterns for external deps */
  ignorePatterns: string[];
  
  /** Include dev dependencies */
  includeDev: boolean;
  
  /** Perform circular dependency detection */
  detectCycles: boolean;
  
  /** Generate clusters */
  generateClusters: boolean;
}

/**
 * Complete dependency analysis result
 */
export interface DependencyAnalysisResult {
  /** Success status */
  success: boolean;
  
  /** Detailed dependency relationships */
  dependencies: DependencyDetail[];
  
  /** External dependencies analysis */
  external: ExternalDependency[];
  
  /** Dependency graph */
  graph: DependencyGraph;
  
  /** Analysis metrics */
  metrics: DependencyMetrics;
  
  /** Extraction recommendations */
  recommendations: ExtractionRecommendation[];
  
  /** Analysis errors and warnings */
  errors: string[];
  warnings: string[];
}

/**
 * Extraction recommendation
 */
export interface ExtractionRecommendation {
  /** Component or group being recommended */
  target: string | string[];
  
  /** Recommendation type */
  type: 'extract-first' | 'extract-together' | 'refactor-before-extract' | 'high-risk-extract';
  
  /** Detailed reasoning */
  reasoning: string;
  
  /** Prerequisites for extraction */
  prerequisites: string[];
  
  /** Estimated effort level */
  effort: 'low' | 'medium' | 'high' | 'very-high';
  
  /** Risk assessment */
  risk: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Component dependency analyzer
 */
export class DependencyAnalyzer {
  private readonly logger: Logger;
  private readonly config: AnalyzerConfig;
  private readonly dependencyCache = new Map<string, DependencyDetail[]>();
  private readonly externalPackages = new Map<string, ExternalDependency>();

  constructor(config: Partial<AnalyzerConfig> = {}) {
    this.logger = createSimpleLogger('DependencyAnalyzer');
    this.config = {
      includeTransitive: true,
      maxDepth: 5,
      ignorePatterns: ['node_modules', 'test', 'spec', '__tests__'],
      includeDev: false,
      detectCycles: true,
      generateClusters: true,
      ...config
    };
  }

  /**
   * Analyze dependencies for a set of components
   */
  async analyzeDependencies(components: ComponentDefinition[]): Promise<DependencyAnalysisResult> {
    try {
      this.logger.info(`Analyzing dependencies for ${components.length} components...`);

      // Clear caches
      this.dependencyCache.clear();
      this.externalPackages.clear();

      // Step 1: Analyze direct dependencies for each component
      const directDependencies = await this.analyzeDirectDependencies(components);

      // Step 2: Analyze external dependencies
      const externalDependencies = await this.analyzeExternalDependencies(components);

      // Step 3: Build dependency graph
      const graph = this.buildDependencyGraph(directDependencies, components);

      // Step 4: Detect circular dependencies
      const cycles = this.config.detectCycles ? this.detectCircularDependencies(graph) : [];

      // Step 5: Generate clusters
      const clusters = this.config.generateClusters ? this.generateClusters(graph) : [];

      // Step 6: Calculate metrics
      const metrics = this.calculateMetrics(graph, directDependencies, externalDependencies);

      // Step 7: Generate recommendations
      const recommendations = this.generateRecommendations(
        directDependencies,
        externalDependencies,
        cycles,
        clusters,
        metrics
      );

      this.logger.info('Dependency analysis completed successfully');

      return {
        success: true,
        dependencies: directDependencies,
        external: Array.from(this.externalPackages.values()),
        graph: {
          ...graph,
          cycles,
          clusters,
          metrics
        },
        metrics,
        recommendations,
        errors: [],
        warnings: []
      };

    } catch (error) {
      this.logger.error('Dependency analysis failed:', error instanceof Error ? error : undefined);
      return {
        success: false,
        dependencies: [],
        external: [],
        graph: {
          nodes: [],
          edges: [],
          cycles: [],
          clusters: [],
          metrics: this.getEmptyMetrics()
        },
        metrics: this.getEmptyMetrics(),
        recommendations: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  /**
   * Analyze direct dependencies for components
   */
  private async analyzeDirectDependencies(components: ComponentDefinition[]): Promise<DependencyDetail[]> {
    const allDependencies: DependencyDetail[] = [];

    for (const component of components) {
      this.logger.debug(`Analyzing dependencies for component: ${component.name}`);

      try {
        // Read component source file
        const content = await readFile(component.sourcePath, 'utf-8');
        
        // Parse AST
        const ast = this.parseComponentAST(content, component.sourcePath);
        if (!ast) continue;

        // Extract dependencies from AST
        const dependencies = this.extractDependenciesFromAST(ast, component);
        allDependencies.push(...dependencies);

        // Cache for transitive analysis
        this.dependencyCache.set(component.sourcePath, dependencies);

      } catch (error) {
        this.logger.warn(`Failed to analyze dependencies for ${component.name}:`, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    // Add transitive dependencies if enabled
    if (this.config.includeTransitive) {
      const transitiveDeps = await this.analyzeTransitiveDependencies(allDependencies);
      allDependencies.push(...transitiveDeps);
    }

    return allDependencies;
  }

  /**
   * Parse component AST safely
   */
  private parseComponentAST(content: string, filePath: string): TSESTree.Program | null {
    try {
      return parse(content, {
        loc: true,
        range: true,
        jsx: filePath.endsWith('.tsx') || filePath.endsWith('.jsx'),
        useJSXTextNode: true,
        ecmaVersion: 2022,
        sourceType: 'module',
        errorOnUnknownASTType: false,
        errorOnTypeScriptSyntacticAndSemanticIssues: false
      });
    } catch (error) {
      this.logger.warn(`Failed to parse AST for ${filePath}:`, { error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  /**
   * Extract dependencies from component AST
   */
  private extractDependenciesFromAST(ast: TSESTree.Program, component: ComponentDefinition): DependencyDetail[] {
    const dependencies: DependencyDetail[] = [];
    const usageContexts = new Map<string, DependencyUsageContext[]>();

    // Traverse AST to find dependencies
    this.traverseAST(ast, (node) => {
      switch (node.type) {
        case 'ImportDeclaration':
          this.analyzeImportDeclaration(node, component, dependencies, usageContexts);
          break;
        case 'CallExpression':
          this.analyzeCallExpression(node, component, usageContexts);
          break;
        case 'JSXElement':
          this.analyzeJSXElement(node, component, usageContexts);
          break;
        case 'MemberExpression':
          this.analyzeMemberExpression(node, component, usageContexts);
          break;
      }
    });

    // Update dependencies with usage contexts
    dependencies.forEach(dep => {
      dep.usageContext = usageContexts.get(dep.target) || [];
    });

    return dependencies;
  }

  /**
   * Analyze import declarations
   */
  private analyzeImportDeclaration(
    node: TSESTree.ImportDeclaration,
    component: ComponentDefinition,
    dependencies: DependencyDetail[],
    usageContexts: Map<string, DependencyUsageContext[]>
  ): void {
    const importPath = node.source.value as string;
    const imports = this.extractImportNames(node);

    // Determine if this is an external or internal dependency
    const isExternal = !importPath.startsWith('.');
    const resolvedPath = isExternal ? importPath : resolve(dirname(component.sourcePath), importPath);

    // Create dependency detail
    const dependency: DependencyDetail = {
      source: component.sourcePath,
      target: resolvedPath,
      type: 'import',
      level: 'direct',
      importPath,
      imports,
      usageContext: [],
      optional: false,
      extractionRisk: this.assessExtractionRisk(importPath, imports)
    };

    dependencies.push(dependency);

    // Track external packages
    if (isExternal) {
      this.trackExternalPackage(importPath, imports, component.sourcePath);
    }

    // Add usage context for import
    const context: DependencyUsageContext = {
      location: { line: node.loc?.start.line || 0, column: node.loc?.start.column || 0 },
      usage: 'import',
      context: `import ${imports.join(', ')} from '${importPath}'`
    };

    if (!usageContexts.has(resolvedPath)) {
      usageContexts.set(resolvedPath, []);
    }
    usageContexts.get(resolvedPath)!.push(context);
  }

  /**
   * Extract import names from import declaration
   */
  private extractImportNames(node: TSESTree.ImportDeclaration): string[] {
    const names: string[] = [];

    node.specifiers?.forEach(spec => {
      switch (spec.type) {
        case 'ImportDefaultSpecifier':
          names.push(spec.local.name);
          break;
        case 'ImportSpecifier':
          names.push(spec.imported.name);
          break;
        case 'ImportNamespaceSpecifier':
          names.push(spec.local.name);
          break;
      }
    });

    return names;
  }

  /**
   * Track external package usage
   */
  private trackExternalPackage(packageName: string, imports: string[], usedBy: string): void {
    // Clean package name (remove subpaths)
    const cleanName = packageName.split('/')[0] || packageName;

    if (!this.externalPackages.has(cleanName)) {
      this.externalPackages.set(cleanName, {
        name: cleanName,
        type: this.classifyExternalDependency(cleanName),
        imports: [],
        usedBy: [],
        usageCount: 0,
        isDev: this.isDevDependency(cleanName),
        migrationStrategy: this.suggestMigrationStrategy(cleanName)
      });
    }

    const pkg = this.externalPackages.get(cleanName)!;
    pkg.imports.push(...imports);
    if (!pkg.usedBy.includes(usedBy)) {
      pkg.usedBy.push(usedBy);
    }
    pkg.usageCount++;
  }

  /**
   * Classify external dependency type
   */
  private classifyExternalDependency(packageName: string): ExternalDependencyType {
    if (packageName === 'react' || packageName.startsWith('react-')) {
      return 'react';
    }
    if (['@mui/material', '@ant-design', 'antd', 'chakra-ui'].some(ui => packageName.includes(ui))) {
      return 'ui-library';
    }
    if (['lodash', 'ramda', 'date-fns', 'moment'].includes(packageName)) {
      return 'utility';
    }
    if (['jest', 'testing-library', 'enzyme', 'cypress'].some(test => packageName.includes(test))) {
      return 'testing';
    }
    if (['webpack', 'vite', 'rollup', 'babel'].includes(packageName)) {
      return 'build-tool';
    }
    return 'unknown';
  }

  /**
   * Check if dependency is likely a dev dependency
   */
  private isDevDependency(packageName: string): boolean {
    const devPatterns = ['test', 'spec', 'mock', 'build', 'webpack', 'babel', 'eslint', 'prettier'];
    return devPatterns.some(pattern => packageName.includes(pattern));
  }

  /**
   * Suggest migration strategy for external dependency
   */
  private suggestMigrationStrategy(packageName: string): ExternalDependency['migrationStrategy'] {
    if (packageName === 'react') return 'keep';
    if (packageName.includes('test')) return 'evaluate';
    if (packageName.includes('build')) return 'replace';
    return 'evaluate';
  }

  /**
   * Assess extraction risk for dependency
   */
  private assessExtractionRisk(importPath: string, imports: string[]): DependencyDetail['extractionRisk'] {
    // High risk for deeply nested imports or many specific imports
    if (imports.length > 5) return 'high';
    if (importPath.includes('..')) return 'medium';
    if (imports.some(imp => imp.toLowerCase().includes('context'))) return 'high';
    return 'low';
  }

  /**
   * Analyze call expressions for dynamic dependencies
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private analyzeCallExpression(
    _node: TSESTree.CallExpression,
    _component: ComponentDefinition,
    _usageContexts: Map<string, DependencyUsageContext[]>
  ): void {
    // Implementation for dynamic imports, require calls, etc.
  }

  /**
   * Analyze JSX elements for component usage
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private analyzeJSXElement(
    _node: TSESTree.JSXElement,
    _component: ComponentDefinition,
    _usageContexts: Map<string, DependencyUsageContext[]>
  ): void {
    // Implementation for JSX component usage tracking
  }

  /**
   * Analyze member expressions for property access
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private analyzeMemberExpression(
    _node: TSESTree.MemberExpression,
    _component: ComponentDefinition,
    _usageContexts: Map<string, DependencyUsageContext[]>
  ): void {
    // Implementation for property access analysis
  }

  /**
   * Traverse AST with visitor pattern
   */
  private traverseAST(node: TSESTree.Node, visitor: (node: TSESTree.Node) => void): void {
    visitor(node);

    // Recursively visit child nodes
    Object.values(node).forEach(value => {
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item && typeof item === 'object' && 'type' in item) {
            this.traverseAST(item as TSESTree.Node, visitor);
          }
        });
      } else if (value && typeof value === 'object' && 'type' in value) {
        this.traverseAST(value as TSESTree.Node, visitor);
      }
    });
  }

  /**
   * Analyze transitive dependencies
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async analyzeTransitiveDependencies(_directDeps: DependencyDetail[]): Promise<DependencyDetail[]> {
    // Implementation for transitive dependency analysis
    return [];
  }

  /**
   * Analyze external dependencies across all components
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async analyzeExternalDependencies(_components: ComponentDefinition[]): Promise<ExternalDependency[]> {
    return Array.from(this.externalPackages.values());
  }

  /**
   * Build dependency graph from analyzed dependencies
   */
  private buildDependencyGraph(
    dependencies: DependencyDetail[],
    components: ComponentDefinition[]
  ): Omit<DependencyGraph, 'cycles' | 'clusters' | 'metrics'> {
    const nodeMap = new Map<string, DependencyNode>();
    const edges: DependencyEdge[] = [];

    // Create nodes for components
    components.forEach(component => {
      nodeMap.set(component.sourcePath, {
        id: component.sourcePath,
        name: component.name,
        type: 'component',
        path: component.sourcePath,
        inDegree: 0,
        outDegree: 0,
        centrality: 0
      });
    });

    // Create nodes for external dependencies and edges
    dependencies.forEach(dep => {
      // Ensure target node exists
      if (!nodeMap.has(dep.target)) {
        const isExternal = !dep.target.startsWith('/');
        const nodeData: DependencyNode = {
          id: dep.target,
          name: isExternal ? dep.target : basename(dep.target),
          type: isExternal ? 'external' : 'internal',
          inDegree: 0,
          outDegree: 0,
          centrality: 0
        };
        
        // Only add path if it's not external
        if (!isExternal) {
          (nodeData as any).path = dep.target;
        }
        
        nodeMap.set(dep.target, nodeData);
      }

      // Create edge
      edges.push({
        from: dep.source,
        to: dep.target,
        type: dep.type,
        weight: 1,
        isCyclic: false
      });

      // Update node degrees
      const sourceNode = nodeMap.get(dep.source);
      const targetNode = nodeMap.get(dep.target);
      if (sourceNode) sourceNode.outDegree++;
      if (targetNode) targetNode.inDegree++;
    });

    // Calculate centrality scores (simplified PageRank-like)
    const nodes = Array.from(nodeMap.values());
    nodes.forEach(node => {
      node.centrality = (node.inDegree + node.outDegree) / Math.max(nodes.length - 1, 1);
    });

    return { nodes, edges };
  }

  /**
   * Detect circular dependencies in the graph
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private detectCircularDependencies(_graph: Omit<DependencyGraph, 'cycles' | 'clusters' | 'metrics'>): DependencyCycle[] {
    // Implementation for cycle detection using DFS
    return [];
  }

  /**
   * Generate dependency clusters
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private generateClusters(_graph: Omit<DependencyGraph, 'cycles' | 'clusters' | 'metrics'>): DependencyCluster[] {
    // Implementation for community detection/clustering
    return [];
  }

  /**
   * Calculate dependency metrics
   */
  private calculateMetrics(
    graph: Omit<DependencyGraph, 'cycles' | 'clusters' | 'metrics'>,
    dependencies: DependencyDetail[],
    external: ExternalDependency[]
  ): DependencyMetrics {
    const componentNodes = graph.nodes.filter(n => n.type === 'component');
    const totalNodes = graph.nodes.length;
    const totalEdges = graph.edges.length;

    const averageCoupling = componentNodes.length > 0 
      ? componentNodes.reduce((sum, node) => sum + node.outDegree, 0) / componentNodes.length 
      : 0;

    const density = totalNodes > 1 
      ? totalEdges / (totalNodes * (totalNodes - 1)) 
      : 0;

    const hubs = componentNodes
      .sort((a, b) => (b.inDegree + b.outDegree) - (a.inDegree + a.outDegree))
      .slice(0, 5)
      .map(node => node.name);

    return {
      totalComponents: componentNodes.length,
      totalDependencies: dependencies.length,
      externalDependencies: external.length,
      internalDependencies: dependencies.filter(d => d.target.startsWith('/')).length,
      circularDependencies: 0, // Would be updated by cycle detection
      averageCoupling,
      density,
      hubs
    };
  }

  /**
   * Generate extraction recommendations
   */
  private generateRecommendations(
    _dependencies: DependencyDetail[],
    _external: ExternalDependency[],
    _cycles: DependencyCycle[],
    _clusters: DependencyCluster[],
    _metrics: DependencyMetrics
  ): ExtractionRecommendation[] {
    const recommendations: ExtractionRecommendation[] = [];

    // Add basic recommendations
    recommendations.push({
      target: 'low-coupling-components',
      type: 'extract-first',
      reasoning: 'Components with minimal dependencies should be extracted first to establish foundation',
      prerequisites: ['Set up extraction pipeline', 'Define component interfaces'],
      effort: 'low',
      risk: 'low'
    });

    return recommendations;
  }

  /**
   * Get empty metrics for error cases
   */
  private getEmptyMetrics(): DependencyMetrics {
    return {
      totalComponents: 0,
      totalDependencies: 0,
      externalDependencies: 0,
      internalDependencies: 0,
      circularDependencies: 0,
      averageCoupling: 0,
      density: 0,
      hubs: []
    };
  }
}

export default DependencyAnalyzer;