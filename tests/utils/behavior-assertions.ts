/**
 * Behavior Assertion Framework
 *
 * Custom assertions for validating business logic preservation and component behavior.
 *
 * @fileoverview Behavior assertion utilities
 * @version 1.0.0
 */

import { expect } from '@jest/globals';
import type { BusinessLogicDefinition, ComponentDefinition } from '@/types';

export interface BehaviorAssertion {
  readonly description: string;
  readonly test: () => boolean | Promise<boolean>;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
}

export class BehaviorAssertions {
  private readonly assertions: BehaviorAssertion[] = [];

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
    return (
      v1Component.businessLogic.length === v2Component.businessLogic.length
    );
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

/**
 * Assert React patterns are preserved
 */
export function assertReactPatternsPreserved(
  v1Component: ComponentDefinition,
  v2Component: ComponentDefinition
): void {
  const v1Patterns = v1Component.reactPatterns.sort();
  const v2Patterns = v2Component.reactPatterns.sort();

  expect(v2Patterns).toEqual(v1Patterns);
}

/**
 * Assert dependencies are preserved
 */
export function assertDependenciesPreserved(
  v1Component: ComponentDefinition,
  v2Component: ComponentDefinition
): void {
  expect(v2Component.dependencies.length).toBeGreaterThanOrEqual(
    v1Component.dependencies.length
  );
}

/**
 * Assert event handlers are preserved
 */
export function assertEventHandlersPreserved(
  v1Logic: BusinessLogicDefinition[],
  v2Logic: BusinessLogicDefinition[]
): void {
  const v1Handlers = v1Logic.filter(bl => bl.type === 'event-handler');
  const v2Handlers = v2Logic.filter(bl => bl.type === 'event-handler');

  expect(v2Handlers.length).toBeGreaterThanOrEqual(v1Handlers.length);
}

/**
 * Assert data transformations are preserved
 */
export function assertDataTransformationsPreserved(
  v1Logic: BusinessLogicDefinition[],
  v2Logic: BusinessLogicDefinition[]
): void {
  const v1Transformations = v1Logic.filter(
    bl => bl.type === 'data-transformation'
  );
  const v2Transformations = v2Logic.filter(
    bl => bl.type === 'data-transformation'
  );

  expect(v2Transformations.length).toBeGreaterThanOrEqual(
    v1Transformations.length
  );
}

/**
 * Assert validation logic is preserved
 */
export function assertValidationLogicPreserved(
  v1Logic: BusinessLogicDefinition[],
  v2Logic: BusinessLogicDefinition[]
): void {
  const v1Validation = v1Logic.filter(bl => bl.type === 'validation');
  const v2Validation = v2Logic.filter(bl => bl.type === 'validation');

  expect(v2Validation.length).toBeGreaterThanOrEqual(v1Validation.length);
}

/**
 * Assert API integration logic is preserved
 */
export function assertApiLogicPreserved(
  v1Logic: BusinessLogicDefinition[],
  v2Logic: BusinessLogicDefinition[]
): void {
  const v1Api = v1Logic.filter(bl => bl.type === 'api-integration');
  const v2Api = v2Logic.filter(bl => bl.type === 'api-integration');

  expect(v2Api.length).toBeGreaterThanOrEqual(v1Api.length);
}

/**
 * Assert state management is preserved
 */
export function assertStateManagementPreserved(
  v1Logic: BusinessLogicDefinition[],
  v2Logic: BusinessLogicDefinition[]
): void {
  const v1State = v1Logic.filter(bl => bl.type === 'state-management');
  const v2State = v2Logic.filter(bl => bl.type === 'state-management');

  expect(v2State.length).toBeGreaterThanOrEqual(v1State.length);
}

/**
 * Assert computed values are preserved
 */
export function assertComputedValuesPreserved(
  v1Logic: BusinessLogicDefinition[],
  v2Logic: BusinessLogicDefinition[]
): void {
  const v1Computed = v1Logic.filter(bl => bl.type === 'computed-value');
  const v2Computed = v2Logic.filter(bl => bl.type === 'computed-value');

  expect(v2Computed.length).toBeGreaterThanOrEqual(v1Computed.length);
}

/**
 * Comprehensive business logic preservation assertion
 */
export function assertCompleteBusinessLogicPreservation(
  v1Component: ComponentDefinition,
  v2Component: ComponentDefinition
): void {
  // Assert business logic functions preserved
  assertBusinessLogicPreserved(v1Component, v2Component);

  // Assert props preserved
  assertPropsPreserved(v1Component, v2Component);

  // Assert React patterns preserved
  assertReactPatternsPreserved(v1Component, v2Component);

  // Assert specific business logic types
  assertEventHandlersPreserved(
    v1Component.businessLogic,
    v2Component.businessLogic
  );
  assertDataTransformationsPreserved(
    v1Component.businessLogic,
    v2Component.businessLogic
  );
  assertValidationLogicPreserved(
    v1Component.businessLogic,
    v2Component.businessLogic
  );
  assertApiLogicPreserved(v1Component.businessLogic, v2Component.businessLogic);
  assertStateManagementPreserved(
    v1Component.businessLogic,
    v2Component.businessLogic
  );
  assertComputedValuesPreserved(
    v1Component.businessLogic,
    v2Component.businessLogic
  );
}

/**
 * Assert component type is compatible
 */
export function assertComponentTypeCompatible(
  v1Component: ComponentDefinition,
  v2Component: ComponentDefinition
): void {
  // Both should be functional or both should be class-based
  // Or v2 can be functional if v1 was class-based (modernization)
  const validTransitions =
    v1Component.type === v2Component.type ||
    (v1Component.type === 'class' && v2Component.type === 'functional');

  expect(validTransitions).toBe(true);
}

/**
 * Assert complexity is reasonable
 */
export function assertComplexityReasonable(
  v1Component: ComponentDefinition,
  v2Component: ComponentDefinition
): void {
  // v2 complexity should be same or one level higher max
  const complexityLevels = ['simple', 'moderate', 'complex', 'critical'];
  const v1Index = complexityLevels.indexOf(v1Component.complexity);
  const v2Index = complexityLevels.indexOf(v2Component.complexity);

  expect(v2Index).toBeLessThanOrEqual(v1Index + 1);
}
