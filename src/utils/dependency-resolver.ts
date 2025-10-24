/**
 * Component Dependency Resolver
 *
 * Resolves component dependencies to determine optimal migration order.
 * Performs topological sorting to ensure dependencies are migrated first.
 *
 * @fileoverview Dependency resolution for migration ordering
 * @version 1.0.0
 */

import type { ComponentDefinition, ComponentDependency } from '@/types';

/**
 * Dependency graph node
 */
interface DependencyNode {
  component: ComponentDefinition;
  dependencies: string[];
  dependents: string[];
}

/**
 * Dependency resolution result
 */
export interface DependencyResolutionResult {
  success: boolean;
  orderedComponents: ComponentDefinition[];
  cycles: string[][];
  errors: string[];
}

/**
 * Component dependency resolver
 */
export class DependencyResolver {
  private readonly nodes: Map<string, DependencyNode> = new Map();

  /**
   * Resolve component dependencies and return migration order
   */
  public resolve(
    components: ComponentDefinition[]
  ): DependencyResolutionResult {
    // Build dependency graph
    this.buildGraph(components);

    // Detect circular dependencies
    const cycles = this.detectCycles();
    if (cycles.length > 0) {
      return {
        success: false,
        orderedComponents: [],
        cycles,
        errors: [`Found ${cycles.length} circular dependency cycles`],
      };
    }

    // Perform topological sort
    const orderedComponents = this.topologicalSort();

    return {
      success: true,
      orderedComponents,
      cycles: [],
      errors: [],
    };
  }

  /**
   * Build dependency graph from components
   */
  private buildGraph(components: ComponentDefinition[]): void {
    this.nodes.clear();

    // Create nodes
    for (const component of components) {
      this.nodes.set(component.id, {
        component,
        dependencies: this.extractDependencyIds(component),
        dependents: [],
      });
    }

    // Build dependent relationships
    for (const [id, node] of this.nodes.entries()) {
      for (const depId of node.dependencies) {
        const depNode = this.nodes.get(depId);
        if (depNode) {
          depNode.dependents.push(id);
        }
      }
    }
  }

  /**
   * Extract dependency IDs from component
   */
  private extractDependencyIds(component: ComponentDefinition): string[] {
    return component.dependencies
      .filter(dep => dep.type === 'component')
      .map(dep => this.resolveComponentId(dep));
  }

  /**
   * Resolve component ID from dependency
   */
  private resolveComponentId(dependency: ComponentDependency): string {
    // Extract component name from import path
    const match = dependency.importPath.match(/\/([^/]+)$/);
    return match && match[1] ? match[1] : dependency.name;
  }

  /**
   * Detect circular dependencies using DFS
   */
  private detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const currentPath: string[] = [];

    const dfs = (nodeId: string): void => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      currentPath.push(nodeId);

      const node = this.nodes.get(nodeId);
      if (!node) {
        return;
      }

      for (const depId of node.dependencies) {
        if (!visited.has(depId)) {
          dfs(depId);
        } else if (recursionStack.has(depId)) {
          // Found a cycle
          const cycleStart = currentPath.indexOf(depId);
          if (cycleStart !== -1) {
            cycles.push([...currentPath.slice(cycleStart), depId]);
          }
        }
      }

      currentPath.pop();
      recursionStack.delete(nodeId);
    };

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId);
      }
    }

    return cycles;
  }

  /**
   * Perform topological sort using Kahn's algorithm
   */
  private topologicalSort(): ComponentDefinition[] {
    const result: ComponentDefinition[] = [];
    const inDegree = new Map<string, number>();
    const queue: string[] = [];

    // Calculate in-degrees
    for (const [id, node] of this.nodes.entries()) {
      inDegree.set(id, node.dependencies.length);
      if (node.dependencies.length === 0) {
        queue.push(id);
      }
    }

    // Process nodes with no dependencies
    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (!nodeId) {
        continue;
      }
      const node = this.nodes.get(nodeId);

      if (node) {
        result.push(node.component);

        // Reduce in-degree for dependents
        for (const dependentId of node.dependents) {
          const currentDegree = inDegree.get(dependentId) || 0;
          const newDegree = currentDegree - 1;
          inDegree.set(dependentId, newDegree);

          if (newDegree === 0) {
            queue.push(dependentId);
          }
        }
      }
    }

    return result;
  }

  /**
   * Get dependency tree for a component
   */
  public getDependencyTree(componentId: string): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const dfs = (id: string): void => {
      if (visited.has(id)) {
        return;
      }

      visited.add(id);
      const node = this.nodes.get(id);

      if (node) {
        result.push(id);
        for (const depId of node.dependencies) {
          dfs(depId);
        }
      }
    };

    dfs(componentId);
    return result;
  }

  /**
   * Get components that depend on a given component
   */
  public getDependents(componentId: string): string[] {
    const node = this.nodes.get(componentId);
    return node ? [...node.dependents] : [];
  }
}

/**
 * Resolve dependencies for a list of components
 */
export function resolveDependencies(
  components: ComponentDefinition[]
): DependencyResolutionResult {
  const resolver = new DependencyResolver();
  return resolver.resolve(components);
}
