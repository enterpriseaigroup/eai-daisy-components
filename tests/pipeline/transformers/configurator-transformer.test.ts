/**
 * Configurator Transformer Tests
 */

import { describe, it, expect, jest } from '@jest/globals';
import {
  ConfiguratorTransformer,
  createConfiguratorTransformer,
  transformToConfigurator,
} from '@/pipeline/transformers/configurator-transformer';
import type { ComponentDefinition } from '@/types';

jest.mock('@/utils/business-logic-analyzer');
jest.mock('@/utils/logging');

const mockComponent: ComponentDefinition = {
  id: 'test',
  name: 'TestComponent',
  type: 'functional',
  sourcePath: '/test.tsx',
  props: [{ name: 'title', type: 'string', required: true }],
  businessLogic: [],
  reactPatterns: ['useState'],
  dependencies: [],
  complexity: 'simple',
  migrationStatus: 'pending',
  metadata: { createdAt: new Date(), lastModified: new Date() },
};

describe('ConfiguratorTransformer', () => {
  let transformer: ConfiguratorTransformer;

  beforeEach(() => {
    transformer = new ConfiguratorTransformer();

    const { BusinessLogicAnalyzer } = require('@/utils/business-logic-analyzer');
    BusinessLogicAnalyzer.prototype.analyzeComponent = jest.fn().mockReturnValue({
      functions: [],
      stateManagement: [{ type: 'useState', name: 'count', stateType: 'number', setter: 'setCount', dependencies: [] }],
      sideEffects: [],
      eventHandlers: [],
      dataTransformations: [],
      validations: [],
      businessRules: [],
      complexityScore: 10,
      preservationRequirements: [],
    });
  });

  describe('transform', () => {
    it('should transform simple component', async () => {
      const code = 'const [count, setCount] = useState(0);';
      const result = await transformer.transform(mockComponent, code);

      expect(result.strategy).toBe('direct-translation');
      expect(result.transformations.length).toBeGreaterThan(0);
    });

    it('should determine correct strategy based on complexity', async () => {
      const simpleCode = 'const Component = () => <div>Test</div>;';
      const result = await transformer.transform(mockComponent, simpleCode);

      expect(result.strategy).toBe('direct-translation');
    });

    it('should preserve business logic', async () => {
      const code = 'const handleClick = () => console.log("clicked");';
      const result = await transformer.transform(mockComponent, code);

      expect(result.businessLogicPreserved).toBeDefined();
    });

    it('should create pattern mappings', async () => {
      const code = 'const [state, setState] = useState(0);';
      const result = await transformer.transform(mockComponent, code);

      expect(result.patternMappings.length).toBeGreaterThan(0);
    });

    it('should flag manual review when needed', async () => {
      const complexComponent = { ...mockComponent, complexity: 'critical' as const };
      const { BusinessLogicAnalyzer } = require('@/utils/business-logic-analyzer');
      BusinessLogicAnalyzer.prototype.analyzeComponent = jest.fn().mockReturnValue({
        functions: [],
        stateManagement: [],
        sideEffects: [],
        eventHandlers: [],
        dataTransformations: [],
        validations: [],
        businessRules: [],
        complexityScore: 100,
        preservationRequirements: [],
      });

      const result = await transformer.transform(complexComponent, 'complex code');
      expect(result.strategy).toBe('manual-review-required');
    });

    it('should handle errors gracefully', async () => {
      const { BusinessLogicAnalyzer } = require('@/utils/business-logic-analyzer');
      BusinessLogicAnalyzer.prototype.analyzeComponent = jest.fn().mockImplementation(() => {
        throw new Error('Analysis failed');
      });

      await expect(transformer.transform(mockComponent, 'code')).rejects.toThrow();
    });
  });

  describe('transformation types', () => {
    beforeEach(() => {
      const { BusinessLogicAnalyzer } = require('@/utils/business-logic-analyzer');
      BusinessLogicAnalyzer.prototype.analyzeComponent = jest.fn().mockReturnValue({
        functions: [],
        stateManagement: [{ type: 'useState', name: 'count', stateType: 'number', setter: 'setCount', dependencies: [] }],
        sideEffects: [{ type: 'useEffect', description: 'effect', dependencies: [], hasCleanup: false, code: '' }],
        eventHandlers: [{ name: 'handleClick', eventType: 'click', signature: '()', businessLogic: [], stateUpdates: [] }],
        dataTransformations: [],
        validations: [{ name: 'validate', field: 'email', rules: [], errorMessages: {} }],
        businessRules: [],
        complexityScore: 20,
        preservationRequirements: [],
      });
    });

    it('should transform props', async () => {
      const result = await transformer.transform(mockComponent, '');
      const propTransforms = result.transformations.filter(t => t.type === 'prop');
      expect(propTransforms.length).toBeGreaterThan(0);
    });

    it('should transform hooks', async () => {
      const result = await transformer.transform(mockComponent, '');
      const hookTransforms = result.transformations.filter(t => t.type === 'state');
      expect(hookTransforms.length).toBeGreaterThan(0);
    });

    it('should transform event handlers', async () => {
      const result = await transformer.transform(mockComponent, '');
      const handlerTransforms = result.transformations.filter(t => t.type === 'handler');
      expect(handlerTransforms.length).toBeGreaterThan(0);
    });

    it('should transform side effects', async () => {
      const result = await transformer.transform(mockComponent, '');
      const effectTransforms = result.transformations.filter(t => t.type === 'effect');
      expect(effectTransforms.length).toBeGreaterThan(0);
    });

    it('should transform validations', async () => {
      const result = await transformer.transform(mockComponent, '');
      const validationTransforms = result.transformations.filter(t => t.type === 'validation');
      expect(validationTransforms.length).toBeGreaterThan(0);
    });
  });
});

describe('Utility Functions', () => {
  it('should create transformer via factory', () => {
    const transformer = createConfiguratorTransformer();
    expect(transformer).toBeInstanceOf(ConfiguratorTransformer);
  });

  it('should transform via helper function', async () => {
    const { BusinessLogicAnalyzer } = require('@/utils/business-logic-analyzer');
    BusinessLogicAnalyzer.prototype.analyzeComponent = jest.fn().mockReturnValue({
      functions: [],
      stateManagement: [],
      sideEffects: [],
      eventHandlers: [],
      dataTransformations: [],
      validations: [],
      businessRules: [],
      complexityScore: 5,
      preservationRequirements: [],
    });

    const result = await transformToConfigurator(mockComponent, 'code');
    expect(result).toBeDefined();
  });
});
