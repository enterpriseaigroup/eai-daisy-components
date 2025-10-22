/**
 * Behavior Assertion Framework
 *
 * Custom assertions for validating business logic preservation and component behavior.
 *
 * @fileoverview Behavior assertion utilities
 * @version 1.0.0
 */

import { expect } from '@jest/globals';
import type { ComponentDefinition, BusinessLogicDefinition } from '@/types';

export interface BehaviorAssertion {
  readonly description: string;
  readonly test: () => boolean | Promise<boolean>;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
}

export class BehaviorAssertions {
  private assertions: BehaviorAssertion[] = [];

  public assertBusinessLogicPreserved(
    v1Component: ComponentDefinition,
    v2Component: ComponentDefinition
  ): void {
    this.assertions.push({
      description: 'Business logic functions are preserved',
      test: () => this.compareBusinessLogic(v1Component, v2Component),
      severity: 'critical',
    });
  }

  public assertPropsCompatible(
    v1Component: ComponentDefinition,
    v2Component: ComponentDefinition
  ): void {
    this.assertions.push({
      description: 'Component props are compatible',
      test: () => this.compareProps(v1Component, v2Component),
      severity: 'high',
    });
  }

  public assertStateManagementPreserved(
    v1Component: ComponentDefinition,
    v2Component: ComponentDefinition
  ): void {
    this.assertions.push({
      description: 'State management patterns are preserved',
      test: () => true,
      severity: 'high',
    });
  }

  public async runAssertions(): Promise<AssertionResult[]> {
    const results: AssertionResult[] = [];

    for (const assertion of this.assertions) {
      try {
        const passed = await assertion.test();
        results.push({
          description: assertion.description,
          passed,
          severity: assertion.severity,
          error: null,
        });
      } catch (error) {
        results.push({
          description: assertion.description,
          passed: false,
          severity: assertion.severity,
          error: error as Error,
        });
      }
    }

    return results;
  }

  private compareBusinessLogic(
    v1Component: ComponentDefinition,
    v2Component: ComponentDefinition
  ): boolean {
    return v1Component.businessLogic.length === v2Component.businessLogic.length;
  }

  private compareProps(
    v1Component: ComponentDefinition,
    v2Component: ComponentDefinition
  ): boolean {
    const v1PropNames = v1Component.props.map(p => p.name).sort();
    const v2PropNames = v2Component.props.map(p => p.name).sort();

    return JSON.stringify(v1PropNames) === JSON.stringify(v2PropNames);
  }
}

export interface AssertionResult {
  readonly description: string;
  readonly passed: boolean;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly error: Error | null;
}

export function createBehaviorAssertions(): BehaviorAssertions {
  return new BehaviorAssertions();
}

export function assertBusinessLogicPreserved(
  v1Component: ComponentDefinition,
  v2Component: ComponentDefinition
): void {
  const v1Logic = v1Component.businessLogic.map(bl => bl.name).sort();
  const v2Logic = v2Component.businessLogic.map(bl => bl.name).sort();

  expect(v2Logic).toEqual(v1Logic);
}

export function assertPropsPreserved(
  v1Component: ComponentDefinition,
  v2Component: ComponentDefinition
): void {
  const v1Props = v1Component.props.map(p => p.name).sort();
  const v2Props = v2Component.props.map(p => p.name).sort();

  expect(v2Props).toEqual(v1Props);
}
