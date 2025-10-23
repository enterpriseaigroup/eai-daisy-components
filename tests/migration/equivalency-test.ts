/**
 * Component Equivalency Tests
 *
 * Test suite for validating functional equivalency between DAISY v1 and Configurator v2.
 *
 * @fileoverview Equivalency test implementation
 * @version 1.0.0
 */

import { describe, expect, it } from '@jest/globals';
import type { ComponentDefinition } from '@/types';
import { testComponentEquivalency } from '../utils/equivalency-tester';

export interface ComponentEquivalencyTest {
  readonly name: string;
  readonly v1Component: ComponentDefinition;
  readonly v2Component: ComponentDefinition;
  readonly testCases: EquivalencyTestCase[];
}

export interface EquivalencyTestCase {
  readonly description: string;
  readonly props: Record<string, unknown>;
  readonly expectedBehavior: string;
}

export async function runEquivalencyTests(
  test: ComponentEquivalencyTest,
): Promise<void> {
  describe(`${test.name} - Equivalency Tests`, () => {
    it('should have equivalent props', async () => {
      const result = await testComponentEquivalency(
        test.v1Component,
        test.v2Component,
      );

      expect(result.details.propsMatch).toBe(true);
    });

    it('should have equivalent behavior', async () => {
      const result = await testComponentEquivalency(
        test.v1Component,
        test.v2Component,
      );

      expect(result.details.behaviorMatch).toBe(true);
    });

    it('should pass equivalency score threshold', async () => {
      const result = await testComponentEquivalency(
        test.v1Component,
        test.v2Component,
      );

      expect(result.score).toBeGreaterThanOrEqual(80);
    });

    test.testCases.forEach(testCase => {
      it(testCase.description, async () => {
        const result = await testComponentEquivalency(
          test.v1Component,
          test.v2Component,
          testCase.props,
        );

        expect(result.equivalent).toBe(true);
      });
    });
  });
}

export function createEquivalencyTest(
  name: string,
  v1Component: ComponentDefinition,
  v2Component: ComponentDefinition,
  testCases: EquivalencyTestCase[] = [],
): ComponentEquivalencyTest {
  return {
    name,
    v1Component,
    v2Component,
    testCases,
  };
}
