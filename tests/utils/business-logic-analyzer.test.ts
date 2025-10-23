/**
 * Business Logic Analyzer Tests
 */

import { describe, expect, it } from '@jest/globals';
import {
  BusinessLogicAnalyzer,
  analyzeBusinessLogic,
  createBusinessLogicAnalyzer,
  isBusinessLogicPreserved,
} from '@/utils/business-logic-analyzer';
import type { ComponentDefinition } from '@/types';

const mockComponent: ComponentDefinition = {
  id: 'test-123',
  name: 'TestComponent',
  type: 'functional',
  sourcePath: '/test/Component.tsx',
  props: [],
  businessLogic: [],
  reactPatterns: [],
  dependencies: [],
  complexity: 'simple',
  migrationStatus: 'pending',
  metadata: { createdAt: new Date(), lastModified: new Date() },
};

describe('BusinessLogicAnalyzer', () => {
  let analyzer: BusinessLogicAnalyzer;

  beforeEach(() => {
    analyzer = new BusinessLogicAnalyzer();
  });

  describe('analyzeComponent', () => {
    it('should analyze basic component', () => {
      const code = `
        import React from 'react';
        const TestComponent = () => <div>Test</div>;
        export default TestComponent;
      `;

      const result = analyzer.analyzeComponent(mockComponent, code);
      expect(result).toBeDefined();
      expect(result.functions).toBeDefined();
      expect(result.stateManagement).toBeDefined();
    });

    it('should detect useState patterns', () => {
      const code = `
        const [count, setCount] = useState(0);
        const [name, setName] = useState('test');
      `;

      const result = analyzer.analyzeComponent(mockComponent, code);
      expect(result.stateManagement.length).toBe(2);
      expect(result.stateManagement[0].type).toBe('useState');
    });

    it('should detect useReducer patterns', () => {
      const code = 'const [state, dispatch] = useReducer(reducer, initialState);';
      const result = analyzer.analyzeComponent(mockComponent, code);
      expect(result.stateManagement.some(s => s.type === 'useReducer')).toBe(
        true,
      );
    });

    it('should detect useEffect patterns', () => {
      const code = 'useEffect(() => { fetchData(); }, [dependency]);';
      const result = analyzer.analyzeComponent(mockComponent, code);
      expect(result.sideEffects.length).toBeGreaterThan(0);
    });

    it('should detect event handlers', () => {
      const code = 'const handleClick = () => { console.log(\'clicked\'); };';
      const result = analyzer.analyzeComponent(mockComponent, code);
      expect(result.eventHandlers.length).toBeGreaterThan(0);
    });

    it('should detect data transformations', () => {
      const code = 'const mapped = data.map(x => x * 2);';
      const result = analyzer.analyzeComponent(mockComponent, code);
      expect(result.dataTransformations.length).toBeGreaterThan(0);
    });

    it('should calculate complexity score', () => {
      const code = `
        const [state, setState] = useState(0);
        useEffect(() => {}, []);
        const handleClick = () => {};
      `;

      const result = analyzer.analyzeComponent(mockComponent, code);
      expect(result.complexityScore).toBeGreaterThan(0);
    });

    it('should identify preservation requirements', () => {
      const code = `
        const [count, setCount] = useState(0);
        const handleClick = () => setCount(count + 1);
      `;

      const result = analyzer.analyzeComponent(mockComponent, code);
      expect(result.preservationRequirements.length).toBeGreaterThan(0);
    });
  });
});

describe('Utility Functions', () => {
  it('should create analyzer via factory', () => {
    const analyzer = createBusinessLogicAnalyzer();
    expect(analyzer).toBeInstanceOf(BusinessLogicAnalyzer);
  });

  it('should analyze via helper function', () => {
    const code = 'const [state, setState] = useState(0);';
    const result = analyzeBusinessLogic(mockComponent, code);
    expect(result).toBeDefined();
  });

  it('should check if business logic is preserved', () => {
    const original = {
      functions: [
        {
          name: 'test',
          signature: 'test()',
          purpose: '',
          parameters: [],
          returnType: '',
          complexity: 'simple' as const,
          externalDependencies: [],
        },
      ],
      stateManagement: [],
      sideEffects: [],
      eventHandlers: [],
      dataTransformations: [],
      validations: [],
      businessRules: [],
      complexityScore: 5,
      preservationRequirements: [],
    };

    const migrated = { ...original };
    expect(isBusinessLogicPreserved(original, migrated)).toBe(true);

    const modified = { ...original, functions: [] };
    expect(isBusinessLogicPreserved(original, modified)).toBe(false);
  });
});
