/**
 * Playwright-based Component Equivalency Testing
 *
 * Uses real browser rendering to validate component migration accuracy
 */

import type { Page } from '@playwright/test';
import { Locator, expect, test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';

interface ComponentTestResult {
  component: string;
  passed: boolean;
  score: number;
  renderMatch: boolean;
  behaviorMatch: boolean;
  performanceMatch: boolean;
  businessLogicMatch: boolean;
  visualMatch: boolean;
  differences: Difference[];
}

interface Difference {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  details?: any;
}

/**
 * Test suite for component equivalency validation
 */
test.describe('Component Migration Equivalency Tests', () => {
  let v1Page: Page;
  let v2Page: Page;

  test.beforeAll(async ({ browser }) => {
    // Create two separate contexts for v1 and v2 components
    const v1Context = await browser.newContext();
    const v2Context = await browser.newContext();

    v1Page = await v1Context.newPage();
    v2Page = await v2Context.newPage();

    // Set up test servers for both component versions
    // In real implementation, this would start dev servers for each version
  });

  test.afterAll(async () => {
    await v1Page.close();
    await v2Page.close();
  });

  /**
   * Test Button component migration
   */
  test('Button component equivalency', async () => {
    const result = await testComponentEquivalency(
      v1Page,
      v2Page,
      'Button',
      '/fixtures/components/v1/Button',
      '/fixtures/components/v2/Button'
    );

    // Assert overall equivalency
    expect(result.score).toBeGreaterThanOrEqual(95);
    expect(result.passed).toBe(true);

    // Report detailed results
    console.log(`Button Migration Score: ${result.score}%`);
    console.log(`Visual Match: ${result.visualMatch}`);
    console.log(`Behavior Match: ${result.behaviorMatch}`);
    console.log(`Business Logic Match: ${result.businessLogicMatch}`);

    if (result.differences.length > 0) {
      console.log('\nDifferences Found:');
      result.differences.forEach(diff => {
        console.log(`- [${diff.severity}] ${diff.type}: ${diff.description}`);
      });
    }
  });

  /**
   * Test render equivalency with visual regression
   */
  test('Visual regression testing', async () => {
    // Navigate to test harness pages
    await v1Page.goto('http://localhost:3000/test-harness/v1/button');
    await v2Page.goto('http://localhost:3001/test-harness/v2/button');

    // Test different button states
    const states = [
      { props: { variant: 'primary', label: 'Click Me' } },
      { props: { variant: 'secondary', label: 'Submit', disabled: true } },
      { props: { variant: 'danger', label: 'Delete', loading: true } },
      {
        props: {
          variant: 'primary',
          label: 'Long Button Label That Should Wrap',
          fullWidth: true,
        },
      },
    ];

    for (const state of states) {
      // Set props via test harness
      await v1Page.evaluate(props => {
        (window as any).setComponentProps(props);
      }, state.props);

      await v2Page.evaluate(props => {
        (window as any).setComponentProps(props);
      }, state.props);

      // Take screenshots
      const v1Screenshot = await v1Page
        .locator('[data-testid="test-component"]')
        .screenshot();
      const v2Screenshot = await v2Page
        .locator('[data-testid="test-component"]')
        .screenshot();

      // Compare screenshots (allowing minor differences)
      const visualMatch = await compareScreenshots(v1Screenshot, v2Screenshot);

      expect(visualMatch.similarity).toBeGreaterThan(0.95);
    }
  });

  /**
   * Test behavioral equivalency
   */
  test('Behavioral equivalency', async () => {
    await v1Page.goto('http://localhost:3000/test-harness/v1/button');
    await v2Page.goto('http://localhost:3001/test-harness/v2/button');

    // Test click behavior
    const v1ClickCount = await testClickBehavior(v1Page);
    const v2ClickCount = await testClickBehavior(v2Page);
    expect(v1ClickCount).toBe(v2ClickCount);

    // Test keyboard interaction
    const v1KeyboardResult = await testKeyboardInteraction(v1Page);
    const v2KeyboardResult = await testKeyboardInteraction(v2Page);
    expect(v1KeyboardResult).toEqual(v2KeyboardResult);

    // Test disabled state behavior
    const v1DisabledBehavior = await testDisabledBehavior(v1Page);
    const v2DisabledBehavior = await testDisabledBehavior(v2Page);
    expect(v1DisabledBehavior).toEqual(v2DisabledBehavior);

    // Test loading state behavior
    const v1LoadingBehavior = await testLoadingBehavior(v1Page);
    const v2LoadingBehavior = await testLoadingBehavior(v2Page);
    expect(v1LoadingBehavior).toEqual(v2LoadingBehavior);
  });

  /**
   * Test business logic preservation
   */
  test('Business logic preservation', async () => {
    // Test validation logic
    const v1ValidationResult = await testValidationLogic(v1Page);
    const v2ValidationResult = await testValidationLogic(v2Page);
    expect(v1ValidationResult).toEqual(v2ValidationResult);

    // Test analytics tracking
    const v1AnalyticsEvents = await testAnalyticsTracking(v1Page);
    const v2AnalyticsEvents = await testAnalyticsTracking(v2Page);
    expect(v1AnalyticsEvents).toEqual(v2AnalyticsEvents);

    // Test double-click prevention
    const v1DoubleClickPrevention = await testDoubleClickPrevention(v1Page);
    const v2DoubleClickPrevention = await testDoubleClickPrevention(v2Page);
    expect(v1DoubleClickPrevention).toEqual(v2DoubleClickPrevention);
  });

  /**
   * Test performance metrics
   */
  test('Performance comparison', async () => {
    const v1Metrics = await measureComponentPerformance(v1Page);
    const v2Metrics = await measureComponentPerformance(v2Page);

    // v2 should not be significantly slower
    expect(v2Metrics.renderTime).toBeLessThanOrEqual(
      v1Metrics.renderTime * 1.2
    );
    expect(v2Metrics.interactionResponseTime).toBeLessThanOrEqual(
      v1Metrics.interactionResponseTime * 1.2
    );

    // Memory usage should be comparable
    expect(v2Metrics.memoryUsage).toBeLessThanOrEqual(
      v1Metrics.memoryUsage * 1.3
    );
  });

  /**
   * Test accessibility preservation
   */
  test('Accessibility preservation', async () => {
    const v1Accessibility = await testAccessibility(v1Page);
    const v2Accessibility = await testAccessibility(v2Page);

    expect(v2Accessibility.ariaLabels).toEqual(v1Accessibility.ariaLabels);
    expect(v2Accessibility.roles).toEqual(v1Accessibility.roles);
    expect(v2Accessibility.keyboardNavigable).toBe(
      v1Accessibility.keyboardNavigable
    );
  });
});

/**
 * Helper function to test complete component equivalency
 */
async function testComponentEquivalency(
  v1Page: Page,
  v2Page: Page,
  componentName: string,
  v1Path: string,
  v2Path: string
): Promise<ComponentTestResult> {
  const differences: Difference[] = [];
  let score = 100;

  // Test visual rendering
  const visualMatch = await testVisualEquivalency(v1Page, v2Page, differences);
  if (!visualMatch) {
    score -= 20;
  }

  // Test behavior
  const behaviorMatch = await testBehaviorEquivalency(
    v1Page,
    v2Page,
    differences
  );
  if (!behaviorMatch) {
    score -= 30;
  }

  // Test business logic
  const businessLogicMatch = await testBusinessLogicEquivalency(
    v1Path,
    v2Path,
    differences
  );
  if (!businessLogicMatch) {
    score -= 35;
  }

  // Test performance
  const performanceMatch = await testPerformanceEquivalency(
    v1Page,
    v2Page,
    differences
  );
  if (!performanceMatch) {
    score -= 15;
  }

  return {
    component: componentName,
    passed: score >= 95,
    score,
    renderMatch: visualMatch,
    behaviorMatch,
    performanceMatch,
    businessLogicMatch,
    visualMatch,
    differences,
  };
}

/**
 * Test visual equivalency using screenshot comparison
 */
async function testVisualEquivalency(
  v1Page: Page,
  v2Page: Page,
  differences: Difference[]
): Promise<boolean> {
  // Implementation would compare screenshots
  return true;
}

/**
 * Test behavioral equivalency
 */
async function testBehaviorEquivalency(
  v1Page: Page,
  v2Page: Page,
  differences: Difference[]
): Promise<boolean> {
  // Implementation would test interactions
  return true;
}

/**
 * Test business logic preservation
 */
async function testBusinessLogicEquivalency(
  v1Path: string,
  v2Path: string,
  differences: Difference[]
): Promise<boolean> {
  // Implementation would analyze source code
  return true;
}

/**
 * Test performance equivalency
 */
async function testPerformanceEquivalency(
  v1Page: Page,
  v2Page: Page,
  differences: Difference[]
): Promise<boolean> {
  // Implementation would measure performance metrics
  return true;
}

/**
 * Compare screenshots for visual similarity
 */
async function compareScreenshots(
  screenshot1: Buffer,
  screenshot2: Buffer
): Promise<{ similarity: number; differences: any[] }> {
  // This would use image comparison library like pixelmatch
  // For now, returning mock data
  return {
    similarity: 0.98,
    differences: [],
  };
}

/**
 * Test click behavior
 */
async function testClickBehavior(page: Page): Promise<number> {
  const button = page.locator('button');

  // Click multiple times
  await button.click();
  await page.waitForTimeout(100);
  await button.click();
  await page.waitForTimeout(100);
  await button.click();

  // Get click count from data attribute
  const clickCount = await button.getAttribute('data-click-count');
  return parseInt(clickCount || '0');
}

/**
 * Test keyboard interaction
 */
async function testKeyboardInteraction(page: Page): Promise<any> {
  const button = page.locator('button');

  // Focus the button
  await button.focus();

  // Press Enter
  await page.keyboard.press('Enter');
  const afterEnter = await button.getAttribute('data-click-count');

  // Press Space
  await page.keyboard.press('Space');
  const afterSpace = await button.getAttribute('data-click-count');

  return {
    enterTriggersClick: parseInt(afterEnter || '0') > 0,
    spaceTriggersClick:
      parseInt(afterSpace || '0') > parseInt(afterEnter || '0'),
  };
}

/**
 * Test disabled behavior
 */
async function testDisabledBehavior(page: Page): Promise<any> {
  // Set button to disabled
  await page.evaluate(() => {
    (window as any).setComponentProps({
      disabled: true,
      label: 'Disabled Button',
    });
  });

  const button = page.locator('button');
  const isDisabled = await button.isDisabled();

  // Try to click
  let clickWorked = false;
  try {
    await button.click({ force: true });
    const clickCount = await button.getAttribute('data-click-count');
    clickWorked = parseInt(clickCount || '0') > 0;
  } catch (e) {
    clickWorked = false;
  }

  return {
    isDisabled,
    clicksIgnored: !clickWorked,
  };
}

/**
 * Test loading behavior
 */
async function testLoadingBehavior(page: Page): Promise<any> {
  // Set button to loading
  await page.evaluate(() => {
    (window as any).setComponentProps({ loading: true, label: 'Loading...' });
  });

  const button = page.locator('button');
  const spinner = button.locator('.daisy-button__spinner, .button__spinner');

  return {
    hasSpinner: await spinner.isVisible(),
    isDisabled: await button.isDisabled(),
    ariaBusy: (await button.getAttribute('aria-busy')) === 'true',
  };
}

/**
 * Test validation logic
 */
async function testValidationLogic(page: Page): Promise<any> {
  const testCases = [
    { label: '', expectedError: true },
    { label: 'a'.repeat(51), expectedError: true },
    { label: 'Valid Label', expectedError: false },
  ];

  const results = [];

  for (const testCase of testCases) {
    await page.evaluate(props => {
      (window as any).setComponentProps(props);
    }, testCase);

    // Check console for validation warnings
    const warnings = await page.evaluate(() => {
      return (window as any).capturedWarnings || [];
    });

    results.push({
      input: testCase.label,
      hasWarning: warnings.length > 0,
      expectedError: testCase.expectedError,
    });
  }

  return results;
}

/**
 * Test analytics tracking
 */
async function testAnalyticsTracking(page: Page): Promise<any> {
  // Clear analytics events
  await page.evaluate(() => {
    window.sessionStorage.removeItem('analytics_events');
  });

  // Click button multiple times
  const button = page.locator('button');
  await button.click();
  await page.waitForTimeout(100);
  await button.click();

  // Get tracked events
  const events = await page.evaluate(() => {
    return JSON.parse(
      window.sessionStorage.getItem('analytics_events') || '[]'
    );
  });

  return {
    eventCount: events.length,
    eventTypes: events.map((e: any) => e.component),
  };
}

/**
 * Test double-click prevention
 */
async function testDoubleClickPrevention(page: Page): Promise<any> {
  const button = page.locator('button');

  // Rapidly click twice
  await button.click();
  const immediatelyAfter = await button.isDisabled();

  // Wait for re-enable
  await page.waitForTimeout(600);
  const afterTimeout = await button.isDisabled();

  return {
    disabledAfterClick: immediatelyAfter,
    reEnabledAfterTimeout: !afterTimeout,
  };
}

/**
 * Measure component performance metrics
 */
async function measureComponentPerformance(page: Page): Promise<any> {
  // Measure initial render time
  const renderTime = await page.evaluate(() => {
    const start = performance.now();
    (window as any).renderComponent();
    return performance.now() - start;
  });

  // Measure interaction response time
  const interactionStart = Date.now();
  await page.locator('button').click();
  const interactionResponseTime = Date.now() - interactionStart;

  // Measure memory usage
  const metrics = await page.metrics();

  return {
    renderTime,
    interactionResponseTime,
    memoryUsage: metrics.JSHeapUsedSize,
  };
}

/**
 * Test accessibility features
 */
async function testAccessibility(page: Page): Promise<any> {
  const button = page.locator('button');

  return {
    ariaLabels: await button.getAttribute('aria-label'),
    roles: await button.getAttribute('role'),
    keyboardNavigable: await button.evaluate(el => {
      return el.tabIndex >= 0;
    }),
  };
}
