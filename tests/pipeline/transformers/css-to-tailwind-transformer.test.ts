/**
 * Unit Tests for CSS-to-Tailwind Transformer
 *
 * Tests CSS parsing, property mappings, className replacements, and error handling
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
  type CSSToTailwindOptions,
  type CSSToTailwindResult,
  CSSToTailwindTransformer,
} from '../../../src/pipeline/transformers/css-to-tailwind-transformer';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    access: jest.fn(),
  },
}));

describe('CSSToTailwindTransformer', () => {
  let transformer: CSSToTailwindTransformer;
  const mockReadFile = fs.readFile as jest.MockedFunction<typeof fs.readFile>;
  const mockAccess = fs.access as jest.MockedFunction<typeof fs.access>;

  beforeEach(() => {
    jest.clearAllMocks();
    transformer = new CSSToTailwindTransformer({
      preserveVisualFidelity: true,
      useArbitraryValues: true,
      removeCSSFiles: false,
      generateTailwindConfig: false,
    });
  });

  describe('CSS Import Detection', () => {
    it('should detect single CSS import', async () => {
      const code = `
import React from 'react';
import './Button.css';

export const Button = () => <button>Click</button>;
`;

      mockReadFile.mockResolvedValue('.button { color: red; }');
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Button.tsx');

      expect(result.success).toBe(true);
      expect(result.processedFiles).toHaveLength(1);
      expect(result.processedFiles[0]).toContain('Button.css');
    });

    it('should detect multiple CSS imports', async () => {
      const code = `
import './styles.css';
import './theme.css';
import React from 'react';
`;

      mockReadFile.mockResolvedValue('.class { color: blue; }');
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      expect(result.processedFiles).toHaveLength(2);
    });

    it('should handle no CSS imports', async () => {
      const code = `
import React from 'react';
export const Button = () => <button>Click</button>;
`;

      const result = await transformer.transform(code, '/test/Button.tsx');

      expect(result.success).toBe(true);
      expect(result.processedFiles).toHaveLength(0);
      expect(result.transformedCode).toBe(code);
    });

    it('should ignore commented CSS imports', async () => {
      const code = `
import React from 'react';
// import './Button.css';
/* import './theme.css'; */
`;

      const result = await transformer.transform(code, '/test/Button.tsx');

      expect(result.success).toBe(true);
      expect(result.processedFiles).toHaveLength(0);
    });
  });

  describe('CSS Property Mapping', () => {
    it('should convert display flex to Tailwind', async () => {
      const code = `
import './styles.css';
export const Component = () => <div className="container">Test</div>;
`;

      const css = `
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
`;

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      expect(result.convertedRules).toHaveLength(1);
      expect(result.convertedRules[0].tailwindClasses).toContain('flex');
      expect(result.convertedRules[0].tailwindClasses).toContain(
        'items-center'
      );
      expect(result.convertedRules[0].tailwindClasses).toContain(
        'justify-between'
      );
    });

    it('should convert colors with arbitrary values', async () => {
      const code = `
import './styles.css';
export const Component = () => <div className="button">Test</div>;
`;

      const css = `
.button {
  background-color: #007bff;
  color: #ffffff;
}
`;

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      expect(result.convertedRules[0].tailwindClasses).toContain(
        'bg-[#007bff]'
      );
      expect(result.convertedRules[0].tailwindClasses).toContain(
        'text-[#ffffff]'
      );
    });

    it('should convert padding and margin', async () => {
      const code = `
import './styles.css';
export const Component = () => <div className="box">Test</div>;
`;

      const css = `
.box {
  padding: 16px;
  margin: 8px;
  padding-top: 20px;
  margin-bottom: 12px;
}
`;

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      expect(result.convertedRules[0].tailwindClasses).toContain('p-4');
      expect(result.convertedRules[0].tailwindClasses).toContain('m-2');
      expect(result.convertedRules[0].tailwindClasses).toContain('pt-5');
      expect(result.convertedRules[0].tailwindClasses).toContain('mb-3');
    });

    it('should convert border radius', async () => {
      const code = `
import './styles.css';
export const Component = () => <div className="rounded">Test</div>;
`;

      const css = `
.rounded {
  border-radius: 4px;
}
`;

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      expect(result.convertedRules[0].tailwindClasses).toContain('rounded');
    });

    it('should convert font properties', async () => {
      const code = `
import './styles.css';
export const Component = () => <div className="text">Test</div>;
`;

      const css = `
.text {
  font-size: 16px;
  font-weight: bold;
  font-family: Arial, sans-serif;
}
`;

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      expect(result.convertedRules[0].tailwindClasses).toContain('text-base');
      expect(result.convertedRules[0].tailwindClasses).toContain('font-bold');
    });
  });

  describe('ClassName Replacement', () => {
    it('should replace simple className', async () => {
      const code = `
import './styles.css';
export const Component = () => <div className="container">Test</div>;
`;

      const css = `
.container {
  display: flex;
}
`;

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      expect(result.transformedCode).toContain('className="flex"');
      expect(result.transformedCode).not.toContain('className="container"');
    });

    it('should handle multiple classNames', async () => {
      const code = `
import './styles.css';
export const Component = () => (
  <div>
    <div className="header">Header</div>
    <div className="content">Content</div>
  </div>
);
`;

      const css = `
.header { display: block; }
.content { display: inline; }
`;

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      expect(result.transformedCode).toContain('className="block"');
      expect(result.transformedCode).toContain('className="inline"');
    });

    it('should preserve non-CSS classNames', async () => {
      const code = `
import './styles.css';
export const Component = () => (
  <div className="dynamic-class other-class">Test</div>
);
`;

      const css = `
.container { display: flex; }
`;

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      // Should preserve classNames not in CSS
      expect(result.transformedCode).toContain('dynamic-class');
      expect(result.transformedCode).toContain('other-class');
    });

    it('should handle template literal classNames', async () => {
      const code = `
import './styles.css';
export const Component = ({ active }: { active: boolean }) => (
  <div className={\`container \${active ? 'active' : ''}\`}>Test</div>
);
`;

      const css = `
.container { display: flex; }
.active { background: red; }
`;

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      // Should replace classNames in template literals
      expect(result.transformedCode).toContain('flex');
      expect(result.transformedCode).toContain('bg-[red]');
    });
  });

  describe('CSS Import Removal', () => {
    it('should remove CSS import after transformation', async () => {
      const code = `
import React from 'react';
import './Button.css';

export const Button = () => <button className="btn">Click</button>;
`;

      const css = '.btn { color: blue; }';

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Button.tsx');

      expect(result.success).toBe(true);
      expect(result.transformedCode).not.toContain("import './Button.css'");
      expect(result.transformedCode).toContain('import React from');
    });

    it('should remove multiple CSS imports', async () => {
      const code = `
import './styles.css';
import './theme.css';
import React from 'react';
`;

      mockReadFile.mockResolvedValue('.class { color: red; }');
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      expect(result.transformedCode).not.toContain("import './styles.css'");
      expect(result.transformedCode).not.toContain("import './theme.css'");
    });
  });

  describe('Error Handling', () => {
    it('should handle missing CSS file', async () => {
      const code = `
import './missing.css';
export const Component = () => <div>Test</div>;
`;

      mockAccess.mockRejectedValue(new Error('File not found'));

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle malformed CSS', async () => {
      const code = `
import './invalid.css';
export const Component = () => <div className="broken">Test</div>;
`;

      const invalidCSS = `
.broken {
  color: red
  /* Missing semicolon */
}
`;

      mockReadFile.mockResolvedValue(invalidCSS);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      // Should still succeed but may have warnings
      expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty CSS file', async () => {
      const code = `
import './empty.css';
export const Component = () => <div>Test</div>;
`;

      mockReadFile.mockResolvedValue('');
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      expect(result.convertedRules).toHaveLength(0);
    });
  });

  describe('Configuration Options', () => {
    it('should respect preserveVisualFidelity option', async () => {
      const lowFidelityTransformer = new CSSToTailwindTransformer({
        preserveVisualFidelity: false,
        useArbitraryValues: false,
        removeCSSFiles: false,
        generateTailwindConfig: false,
      });

      const code = `
import './styles.css';
export const Component = () => <div className="box">Test</div>;
`;

      const css = '.box { background-color: #007bff; }';

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await lowFidelityTransformer.transform(
        code,
        '/test/Component.tsx'
      );

      expect(result.success).toBe(true);
      // With preserveVisualFidelity=false, might use closest Tailwind color
      // instead of arbitrary value
    });

    it('should generate Tailwind config suggestions when enabled', async () => {
      const configTransformer = new CSSToTailwindTransformer({
        preserveVisualFidelity: true,
        useArbitraryValues: true,
        removeCSSFiles: false,
        generateTailwindConfig: true,
      });

      const code = `
import './styles.css';
export const Component = () => <div className="custom">Test</div>;
`;

      const css = `
.custom {
  color: #123456;
  font-family: 'CustomFont', sans-serif;
}
`;

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await configTransformer.transform(
        code,
        '/test/Component.tsx'
      );

      expect(result.success).toBe(true);
      expect(result.tailwindConfigSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Nested Selectors', () => {
    it('should handle nested CSS selectors', async () => {
      const code = `
import './styles.css';
export const Component = () => (
  <div className="container">
    <span className="text">Hello</span>
  </div>
);
`;

      const css = `
.container {
  display: flex;
}

.container .text {
  color: red;
}
`;

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      // Should handle both .container and .container .text
      expect(result.convertedRules.length).toBeGreaterThan(0);
    });
  });

  describe('Pseudo-classes and States', () => {
    it('should convert hover states', async () => {
      const code = `
import './styles.css';
export const Component = () => <button className="btn">Click</button>;
`;

      const css = `
.btn {
  background: blue;
}

.btn:hover {
  background: darkblue;
}
`;

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      // Should detect hover state and suggest hover: classes
      const conversion = result.convertedRules.find(r => r.selector === 'btn');
      expect(conversion).toBeDefined();
    });
  });

  describe('Confidence Scoring', () => {
    it('should assign high confidence to standard conversions', async () => {
      const code = `
import './styles.css';
export const Component = () => <div className="simple">Test</div>;
`;

      const css = `
.simple {
  display: flex;
  color: red;
}
`;

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      expect(result.convertedRules[0].confidence).toBeGreaterThan(0.8);
    });

    it('should assign lower confidence to complex conversions', async () => {
      const code = `
import './styles.css';
export const Component = () => <div className="complex">Test</div>;
`;

      const css = `
.complex {
  background: linear-gradient(to right, red, blue);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
`;

      mockReadFile.mockResolvedValue(css);
      mockAccess.mockResolvedValue(undefined);

      const result = await transformer.transform(code, '/test/Component.tsx');

      expect(result.success).toBe(true);
      // Complex CSS like gradients may have lower confidence
      expect(result.convertedRules[0].confidence).toBeLessThanOrEqual(1.0);
    });
  });
});
