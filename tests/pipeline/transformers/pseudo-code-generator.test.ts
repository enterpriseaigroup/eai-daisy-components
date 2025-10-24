/**
 * Unit Tests for Pseudo-Code Generator
 *
 * Tests AST parsing, business logic detection, documentation generation, and edge cases
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  PseudoCodeGenerator,
  type PseudoCodeOptions,
  type PseudoCodeResult,
} from '../../../src/pipeline/transformers/pseudo-code-generator';

describe('PseudoCodeGenerator', () => {
  let generator: PseudoCodeGenerator;

  beforeEach(() => {
    jest.clearAllMocks();
    generator = new PseudoCodeGenerator({
      includeWhySection: true,
      includeWhatSection: true,
      includeCallsSection: true,
      includeDataFlowSection: true,
      includeDependenciesSection: true,
      includeSpecialBehaviorSection: true,
      addMigrationNotes: false,
    });
  });

  describe('Business Logic Detection', () => {
    it('should detect useEffect hooks', async () => {
      const code = `
import React, { useEffect, useState } from 'react';

export const Component = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);

  return <div>{count}</div>;
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      expect(result.blocksDocumented.length).toBeGreaterThan(0);
      expect(result.blocksDocumented.some(b => b.type === 'useEffect')).toBe(
        true,
      );
    });

    it('should detect useCallback hooks', async () => {
      const code = `
import React, { useCallback } from 'react';

export const Component = () => {
  const handleClick = useCallback((event) => {
    console.log('Clicked!', event);
  }, []);

  return <button onClick={handleClick}>Click</button>;
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      expect(result.blocksDocumented.some(b => b.type === 'useCallback')).toBe(
        true,
      );
    });

    it('should detect useMemo hooks', async () => {
      const code = `
import React, { useMemo } from 'react';

export const Component = ({ items }: { items: number[] }) => {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item, 0);
  }, [items]);

  return <div>{total}</div>;
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      expect(result.blocksDocumented.some(b => b.type === 'useMemo')).toBe(
        true,
      );
    });

    it('should detect function declarations', async () => {
      const code = `
export function calculateTotal(items: number[]): number {
  return items.reduce((sum, item) => sum + item, 0);
}

export function formatCurrency(amount: number): string {
  return \`$\${amount.toFixed(2)}\`;
}
`;

      const result = await generator.generate(code, 'Utils', false);

      expect(result.success).toBe(true);
      expect(
        result.blocksDocumented.filter(b => b.type === 'function').length,
      ).toBe(2);
    });

    it('should detect arrow function expressions', async () => {
      const code = `
export const multiply = (a: number, b: number): number => {
  return a * b;
};

export const divide = (a: number, b: number): number => {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
};
`;

      const result = await generator.generate(code, 'MathUtils', false);

      expect(result.success).toBe(true);
      expect(result.blocksDocumented.length).toBeGreaterThan(0);
    });

    it('should skip simple getter/setter functions', async () => {
      const code = `
export const Component = () => {
  const getName = () => 'John';
  const getAge = () => 30;

  return <div>{getName()}</div>;
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      // Simple getters might be skipped based on complexity heuristics
    });

    it('should detect nested business logic', async () => {
      const code = `
import React, { useEffect } from 'react';

export const Component = () => {
  useEffect(() => {
    const handleResize = () => {
      console.log('Window resized');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div>Component</div>;
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      expect(result.blocksDocumented.some(b => b.type === 'useEffect')).toBe(
        true,
      );
    });
  });

  describe('Documentation Generation', () => {
    it('should generate WHY section', async () => {
      const code = `
import React, { useEffect } from 'react';

export const Component = () => {
  useEffect(() => {
    console.log('Component mounted');
  }, []);

  return <div>Component</div>;
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      expect(result.documentedCode).toContain('WHY THIS EXISTS:');
    });

    it('should generate WHAT section', async () => {
      const code = `
import React, { useCallback } from 'react';

export const Component = () => {
  const handleClick = useCallback(() => {
    console.log('Button clicked');
  }, []);

  return <button onClick={handleClick}>Click</button>;
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      expect(result.documentedCode).toContain('WHAT IT DOES:');
    });

    it('should generate CALLS section', async () => {
      const code = `
import { trackEvent } from './analytics';

export const logAction = (action: string) => {
  console.log('Action:', action);
  trackEvent({ type: 'action', name: action });
};
`;

      const result = await generator.generate(code, 'Logger', false);

      expect(result.success).toBe(true);
      expect(result.documentedCode).toContain('WHAT IT CALLS:');
    });

    it('should generate DATA FLOW section', async () => {
      const code = `
export function processData(input: string): string {
  const trimmed = input.trim();
  const uppercase = trimmed.toUpperCase();
  return uppercase;
}
`;

      const result = await generator.generate(code, 'DataProcessor', false);

      expect(result.success).toBe(true);
      expect(result.documentedCode).toContain('DATA FLOW:');
    });

    it('should generate DEPENDENCIES section for hooks', async () => {
      const code = `
import React, { useEffect } from 'react';

export const Component = ({ userId }: { userId: string }) => {
  useEffect(() => {
    console.log('User changed:', userId);
  }, [userId]);

  return <div>User: {userId}</div>;
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      expect(result.documentedCode).toContain('DEPENDENCIES:');
    });

    it('should generate SPECIAL BEHAVIOR section', async () => {
      const code = `
export function safeDivide(a: number, b: number): number {
  if (b === 0) {
    console.warn('Division by zero, returning 0');
    return 0;
  }
  return a / b;
}
`;

      const result = await generator.generate(code, 'MathUtils', false);

      expect(result.success).toBe(true);
      expect(result.documentedCode).toContain('SPECIAL BEHAVIOR:');
    });

    it('should add MIGRATION NOTE for v2 components', async () => {
      const v2Generator = new PseudoCodeGenerator({
        includeWhySection: true,
        includeWhatSection: true,
        includeCallsSection: true,
        includeDataFlowSection: true,
        includeDependenciesSection: true,
        includeSpecialBehaviorSection: true,
        addMigrationNotes: true,
      });

      const code = `
import React, { useEffect } from 'react';

export const Component = () => {
  useEffect(() => {
    console.log('Mounted');
  }, []);

  return <div>Component</div>;
};
`;

      const result = await v2Generator.generate(code, 'Component', true);

      expect(result.success).toBe(true);
      expect(result.documentedCode).toContain('MIGRATION NOTE:');
      expect(result.documentedCode).toContain('PRESERVED from v1');
    });
  });

  describe('Configuration Options', () => {
    it('should respect includeWhySection=false', async () => {
      const minimalGenerator = new PseudoCodeGenerator({
        includeWhySection: false,
        includeWhatSection: true,
        includeCallsSection: false,
        includeDataFlowSection: false,
        includeDependenciesSection: false,
        includeSpecialBehaviorSection: false,
        addMigrationNotes: false,
      });

      const code = `
export function add(a: number, b: number): number {
  return a + b;
}
`;

      const result = await minimalGenerator.generate(code, 'MathUtils', false);

      expect(result.success).toBe(true);
      expect(result.documentedCode).not.toContain('WHY THIS EXISTS:');
      expect(result.documentedCode).toContain('WHAT IT DOES:');
    });

    it('should generate minimal docs with all sections disabled except WHAT', async () => {
      const minimalGenerator = new PseudoCodeGenerator({
        includeWhySection: false,
        includeWhatSection: true,
        includeCallsSection: false,
        includeDataFlowSection: false,
        includeDependenciesSection: false,
        includeSpecialBehaviorSection: false,
        addMigrationNotes: false,
      });

      const code = `
export function multiply(a: number, b: number): number {
  return a * b;
}
`;

      const result = await minimalGenerator.generate(code, 'MathUtils', false);

      expect(result.success).toBe(true);
      expect(result.documentedCode).toContain('WHAT IT DOES:');
      expect(result.documentedCode).not.toContain('WHY THIS EXISTS:');
      expect(result.documentedCode).not.toContain('WHAT IT CALLS:');
      expect(result.documentedCode).not.toContain('DATA FLOW:');
    });
  });

  describe('Complex Business Logic Patterns', () => {
    it('should handle useEffect with cleanup', async () => {
      const code = `
import React, { useEffect } from 'react';

export const Component = () => {
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Tick');
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <div>Component</div>;
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      expect(result.blocksDocumented.some(b => b.type === 'useEffect')).toBe(
        true,
      );
      expect(result.documentedCode).toContain('cleanup');
    });

    it('should handle multiple dependencies in hooks', async () => {
      const code = `
import React, { useEffect } from 'react';

export const Component = ({ userId, organizationId }: any) => {
  useEffect(() => {
    console.log('User or org changed', userId, organizationId);
  }, [userId, organizationId]);

  return <div>Component</div>;
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      expect(result.documentedCode).toContain('userId');
      expect(result.documentedCode).toContain('organizationId');
    });

    it('should handle async functions', async () => {
      const code = `
export async function fetchUserData(userId: string): Promise<any> {
  const response = await fetch(\`/api/users/\${userId}\`);
  const data = await response.json();
  return data;
}
`;

      const result = await generator.generate(code, 'API', false);

      expect(result.success).toBe(true);
      expect(
        result.blocksDocumented.some(b => b.name === 'fetchUserData'),
      ).toBe(true);
    });

    it('should handle error handling patterns', async () => {
      const code = `
export function processPayment(amount: number): void {
  try {
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }
    console.log('Processing payment:', amount);
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}
`;

      const result = await generator.generate(code, 'PaymentService', false);

      expect(result.success).toBe(true);
      expect(result.documentedCode).toContain('error');
    });

    it('should handle conditional logic', async () => {
      const code = `
export function calculateDiscount(price: number, isPremium: boolean): number {
  if (isPremium) {
    return price * 0.8; // 20% discount
  } else {
    return price * 0.95; // 5% discount
  }
}
`;

      const result = await generator.generate(code, 'PricingService', false);

      expect(result.success).toBe(true);
      expect(
        result.blocksDocumented.some(b => b.name === 'calculateDiscount'),
      ).toBe(true);
    });
  });

  describe('TypeScript Parseability', () => {
    it('should handle TypeScript-specific syntax', async () => {
      const code = `
interface User {
  id: string;
  name: string;
}

export function getUserName(user: User): string {
  return user.name;
}
`;

      const result = await generator.generate(code, 'UserService', false);

      expect(result.success).toBe(true);
      expect(result.blocksDocumented.some(b => b.name === 'getUserName')).toBe(
        true,
      );
    });

    it('should handle generics', async () => {
      const code = `
export function identity<T>(value: T): T {
  return value;
}

export function map<T, U>(items: T[], fn: (item: T) => U): U[] {
  return items.map(fn);
}
`;

      const result = await generator.generate(code, 'Generics', false);

      expect(result.success).toBe(true);
      expect(result.blocksDocumented.length).toBeGreaterThan(0);
    });

    it('should preserve JSX syntax', async () => {
      const code = `
import React from 'react';

export const Component = () => {
  return (
    <div>
      <h1>Title</h1>
      <p>Content</p>
    </div>
  );
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      expect(result.documentedCode).toContain('<div>');
      expect(result.documentedCode).toContain('<h1>');
    });
  });

  describe('Confidence Scoring', () => {
    it('should assign high confidence to simple hooks', async () => {
      const code = `
import React, { useEffect } from 'react';

export const Component = () => {
  useEffect(() => {
    console.log('Mounted');
  }, []);

  return <div>Component</div>;
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      const effectBlock = result.blocksDocumented.find(
        b => b.type === 'useEffect',
      );
      expect(effectBlock?.confidence).toBeGreaterThan(0.7);
    });

    it('should assign high confidence to simple functions', async () => {
      const code = `
export function add(a: number, b: number): number {
  return a + b;
}
`;

      const result = await generator.generate(code, 'MathUtils', false);

      expect(result.success).toBe(true);
      const funcBlock = result.blocksDocumented.find(b => b.name === 'add');
      expect(funcBlock?.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty component', async () => {
      const code = `
export const Component = () => {
  return <div>Empty</div>;
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      expect(result.blocksDocumented.length).toBe(0);
      expect(result.documentedCode).toBe(code);
    });

    it('should handle component with only JSX', async () => {
      const code = `
import React from 'react';

export const Component = () => <div>Simple</div>;
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      // No business logic to document
      expect(result.blocksDocumented.length).toBe(0);
    });

    it('should handle malformed code gracefully', async () => {
      const code = `
export function broken() {
  // Missing closing brace
`;

      const result = await generator.generate(code, 'Broken', false);

      expect(result.success).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle very long functions', async () => {
      const code = `
export function longFunction() {
  ${Array(100).fill('console.log("line");').join('\n  ')}
}
`;

      const result = await generator.generate(code, 'Long', false);

      expect(result.success).toBe(true);
      expect(result.blocksDocumented.some(b => b.name === 'longFunction')).toBe(
        true,
      );
    });

    it('should handle anonymous functions', async () => {
      const code = `
export const handlers = {
  onClick: () => {
    console.log('Clicked');
  },
  onHover: () => {
    console.log('Hovered');
  },
};
`;

      const result = await generator.generate(code, 'Handlers', false);

      expect(result.success).toBe(true);
      // Should detect anonymous functions in object
    });
  });

  describe('Line Number Accuracy', () => {
    it('should report correct line numbers for blocks', async () => {
      const code = `
import React, { useEffect } from 'react';

export const Component = () => {
  // Line 5
  useEffect(() => {
    console.log('Effect');
  }, []);

  return <div>Component</div>;
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      const effectBlock = result.blocksDocumented.find(
        b => b.type === 'useEffect',
      );
      expect(effectBlock?.lineNumber).toBeGreaterThan(0);
      expect(effectBlock?.lineNumber).toBeLessThan(15);
    });
  });

  describe('Documentation Insertion', () => {
    it('should insert documentation above business logic', async () => {
      const code = `
import React, { useEffect } from 'react';

export const Component = () => {
  useEffect(() => {
    console.log('Mounted');
  }, []);

  return <div>Component</div>;
};
`;

      const result = await generator.generate(code, 'Component', false);

      expect(result.success).toBe(true);
      // Documentation should appear before useEffect
      const lines = result.documentedCode.split('\n');
      const effectLineIndex = lines.findIndex(l => l.includes('useEffect'));
      const docLineIndex = lines.findIndex(l => l.includes('BUSINESS LOGIC'));

      expect(docLineIndex).toBeLessThan(effectLineIndex);
    });

    it('should preserve original code formatting', async () => {
      const code = `
export function add(a: number, b: number): number {
  return a + b;
}
`;

      const result = await generator.generate(code, 'MathUtils', false);

      expect(result.success).toBe(true);
      expect(result.documentedCode).toContain('return a + b;');
      expect(result.documentedCode).toContain('export function add');
    });

    it('should not duplicate documentation', async () => {
      const code = `
/**
 * Existing docs
 */
export function add(a: number, b: number): number {
  return a + b;
}
`;

      const result = await generator.generate(code, 'MathUtils', false);

      expect(result.success).toBe(true);
      // Should add new docs but preserve existing ones
      expect(result.documentedCode).toContain('Existing docs');
    });
  });
});
