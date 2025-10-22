/**
 * DAISY v1 Component Library - Tier 2 Components
 *
 * This index exports all Tier 2 components from the original DAISY v1 system.
 * These components represent the baseline that needs to be preserved while
 * transforming to Configurator v2 architecture.
 */

import React from 'react';

export { Button, withDaisyTheme, ButtonUtils } from './Button';
export type { ButtonProps } from './Button';

// Test component for discovery verification
export function TestComponent() {
  return React.createElement('div', null, 'Test component for discovery');
}

// Export component metadata for pipeline discovery
export const DAISY_V1_COMPONENTS = {
  Button: {
    tier: 2,
    category: 'interactive',
    complexity: 'high',
    dependencies: ['React', 'CSS'],
    businessLogic: [
      'theme management',
      'analytics tracking',
      'accessibility features',
      'loading states',
      'tooltip functionality',
      'keyboard navigation',
      'haptic feedback',
    ],
    transformationChallenges: [
      'HOC pattern to functional composition',
      'Custom event tracking to standard analytics',
      'CSS theming to design tokens',
      'Direct DOM manipulation to React patterns',
      'Custom tooltip to standard tooltip system',
    ],
  },
} as const;
