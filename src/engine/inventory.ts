/**
 * Component Inventory Generator for DAISY v1 Component Extraction Pipeline
 * 
 * Generates comprehensive component inventories by combining results from
 * discovery, parsing, and dependency analysis. Creates structured reports
 * with extraction recommendations and component readiness assessments.
 * 
 * @version 1.0.0
 * @author DAISY Component Extraction Pipeline
 */

import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { createSimpleLogger, type Logger } from '../utils/logging.js';
import type { ComponentDefinition, ExtractionConfig } from '@/types';
import type { DiscoveryResult } from './discovery.js';
import type { ParseResult } from './parser.js';
import type { DependencyAnalysisResult } from './analyzer.js';

/**
 * Component readiness assessment
 */
export interface ComponentReadiness {
  /** Component identifier */
  componentId: string;
  
  /** Component name */
  name: string;
  
  /** Overall readiness score (0-100) */
  readinessScore: number;
  
  /** Readiness level classification */
  readinessLevel: 'ready' | 'needs-work' | 'complex' | 'high-risk';
  
  /** Individual assessment criteria */
  criteria: ReadinessCriteria;
  
  /** Specific blockers preventing extraction */
  blockers: string[];
  
  /** Required preparation steps */
  prerequisites: string[];
  
  /** Estimated extraction effort */
  effort: 'low' | 'medium' | 'high' | 'very-high';
  
  /** Risk assessment */
  risk: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Readiness assessment criteria
 */
export interface ReadinessCriteria {
  /** Code quality score (0-100) */
  codeQuality: number;
  
  /** Documentation completeness (0-100) */
  documentation: number;
  
  /** Test coverage score (0-100) */
  testCoverage: number;
  
  /** Dependency complexity (0-100, lower is better) */
  dependencyComplexity: number;
  
  /** Props interface clarity (0-100) */
  propsClarity: number;
  
  /** Business logic separation (0-100) */
  businessLogicSeparation: number;
  
  /** React patterns compliance (0-100) */
  reactCompliance: number;
  
  /** Migration compatibility (0-100) */
  migrationCompatibility: number;
}

/**
 * Component inventory section
 */
export interface InventorySection {
  /** Section title */
  title: string;
  
  /** Section description */
  description: string;
  
  /** Components in this section */
  components: ComponentDefinition[];
  
  /** Section-specific metrics */
  metrics: Record<string, number>;
  
  /** Recommendations for this section */
  recommendations: string[];
}

/**
 * Complete component inventory
 */
export interface ComponentInventory {
  /** Inventory metadata */
  metadata: InventoryMetadata;
  
  /** Executive summary */
  summary: InventorySummary;
  
  /** Component readiness assessments */
  readiness: ComponentReadiness[];
  
  /** Organized inventory sections */
  sections: InventorySection[];
  
  /** Migration roadmap */
  roadmap: MigrationRoadmap;
  
  /** Detailed analysis results */
  analysis: {
    discovery: DiscoveryResult;
    parsing: Map<string, ParseResult>;
    dependencies: DependencyAnalysisResult;
  };
}

/**
 * Inventory metadata
 */
export interface InventoryMetadata {
  /** Generation timestamp */
  generatedAt: Date;
  
  /** Pipeline version */
  pipelineVersion: string;
  
  /** Source codebase path */
  sourceBasePath: string;
  
  /** Total analysis duration */
  analysisDuration: number;
  
  /** Configuration used */
  config: ExtractionConfig;
}

/**
 * Executive summary
 */
export interface InventorySummary {
  /** Total components found */
  totalComponents: number;
  
  /** Components by readiness level */
  componentsByReadiness: Record<ComponentReadiness['readinessLevel'], number>;
  
  /** Components by type */
  componentsByType: Record<string, number>;
  
  /** Components by complexity */
  componentsByComplexity: Record<string, number>;
  
  /** Average readiness score */
  averageReadiness: number;
  
  /** Estimated total migration effort */
  totalEstimatedEffort: string;
  
  /** High-level recommendations */
  keyRecommendations: string[];
  
  /** Critical risks identified */
  criticalRisks: string[];
}

/**
 * Migration roadmap phase
 */
export interface MigrationPhase {
  /** Phase number */
  phase: number;
  
  /** Phase name */
  name: string;
  
  /** Phase description */
  description: string;
  
  /** Components to migrate in this phase */
  components: string[];
  
  /** Phase dependencies */
  dependencies: string[];
  
  /** Estimated duration */
  estimatedDuration: string;
  
  /** Success criteria */
  successCriteria: string[];
  
  /** Risk mitigation strategies */
  riskMitigation: string[];
}

/**
 * Complete migration roadmap
 */
export interface MigrationRoadmap {
  /** Recommended approach */
  approach: 'big-bang' | 'incremental' | 'hybrid';
  
  /** Migration phases */
  phases: MigrationPhase[];
  
  /** Overall timeline estimate */
  timelineEstimate: string;
  
  /** Resource requirements */
  resourceRequirements: {
    developers: number;
    duration: string;
    skills: string[];
  };
  
  /** Success metrics */
  successMetrics: string[];
}

/**
 * Inventory generator configuration
 */
export interface InventoryConfig {
  /** Output directory for reports */
  outputDir: string;
  
  /** Generate detailed reports */
  includeDetailedReports: boolean;
  
  /** Include source code snippets */
  includeCodeSnippets: boolean;
  
  /** Generate JSON output */
  generateJson: boolean;
  
  /** Generate markdown reports */
  generateMarkdown: boolean;
  
  /** Generate HTML reports */
  generateHtml: boolean;
  
  /** Minimum readiness score for 'ready' classification */
  readinessThreshold: number;
  
  /** Maximum components per migration phase */
  maxComponentsPerPhase: number;
}

/**
 * Component inventory generator
 */
export class ComponentInventoryGenerator {
  private readonly logger: Logger;
  private readonly config: InventoryConfig;

  constructor(config: Partial<InventoryConfig> = {}) {
    this.logger = createSimpleLogger('InventoryGenerator');
    this.config = {
      outputDir: './output/inventory',
      includeDetailedReports: true,
      includeCodeSnippets: false,
      generateJson: true,
      generateMarkdown: true,
      generateHtml: false,
      readinessThreshold: 75,
      maxComponentsPerPhase: 10,
      ...config
    };
  }

  /**
   * Generate complete component inventory
   */
  async generateInventory(
    discovery: DiscoveryResult,
    parsing: Map<string, ParseResult>,
    dependencies: DependencyAnalysisResult,
    extractionConfig: ExtractionConfig
  ): Promise<ComponentInventory> {
    try {
      this.logger.info('Generating component inventory...');

      const startTime = Date.now();

      // Step 1: Assess component readiness
      const readiness = this.assessComponentReadiness(discovery, parsing, dependencies);

      // Step 2: Create inventory sections
      const sections = this.createInventorySections(discovery.components, readiness);

      // Step 3: Generate migration roadmap
      const roadmap = this.generateMigrationRoadmap(readiness, dependencies);

      // Step 4: Create executive summary
      const summary = this.createExecutiveSummary(discovery, readiness, dependencies);

      // Step 5: Compile complete inventory
      const inventory: ComponentInventory = {
        metadata: {
          generatedAt: new Date(),
          pipelineVersion: '1.0.0',
          sourceBasePath: extractionConfig.sourcePath,
          analysisDuration: Date.now() - startTime,
          config: extractionConfig
        },
        summary,
        readiness,
        sections,
        roadmap,
        analysis: {
          discovery,
          parsing,
          dependencies
        }
      };

      this.logger.info('Component inventory generated successfully');
      return inventory;

    } catch (error) {
      this.logger.error('Failed to generate inventory:', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  /**
   * Export inventory to various formats
   */
  async exportInventory(inventory: ComponentInventory): Promise<void> {
    try {
      this.logger.info('Exporting inventory to output formats...');

      // Ensure output directory exists
      await mkdir(this.config.outputDir, { recursive: true });

      // Export JSON
      if (this.config.generateJson) {
        await this.exportToJson(inventory);
      }

      // Export Markdown
      if (this.config.generateMarkdown) {
        await this.exportToMarkdown(inventory);
      }

      // Export HTML (if enabled)
      if (this.config.generateHtml) {
        await this.exportToHtml(inventory);
      }

      this.logger.info('Inventory export completed');

    } catch (error) {
      this.logger.error('Failed to export inventory:', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  /**
   * Assess readiness for each component
   */
  private assessComponentReadiness(
    discovery: DiscoveryResult,
    parsing: Map<string, ParseResult>,
    dependencies: DependencyAnalysisResult
  ): ComponentReadiness[] {
    return discovery.components.map(component => {
      const parseResult = parsing.get(component.sourcePath);
      const componentDeps = dependencies.dependencies.filter(d => d.source === component.sourcePath);

      const criteria = this.calculateReadinessCriteria(component, parseResult, componentDeps);
      const readinessScore = this.calculateOverallReadiness(criteria);
      const readinessLevel = this.classifyReadinessLevel(readinessScore);

      const blockers = this.identifyBlockers(component, parseResult, componentDeps);
      const prerequisites = this.generatePrerequisites(blockers, criteria);

      return {
        componentId: component.id,
        name: component.name,
        readinessScore,
        readinessLevel,
        criteria,
        blockers,
        prerequisites,
        effort: this.estimateEffort(component, parseResult, componentDeps),
        risk: this.assessRisk(component, parseResult, componentDeps)
      };
    });
  }

  /**
   * Calculate individual readiness criteria
   */
  private calculateReadinessCriteria(
    component: ComponentDefinition,
    parseResult?: ParseResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _dependencies: any[] = []
  ): ReadinessCriteria {
    // Code quality based on complexity and parsing success
    const codeQuality = parseResult?.success ? 
      Math.max(0, 100 - (parseResult.complexity.cyclomaticComplexity * 5)) : 50;

    // Documentation score (simplified)
    const documentation = component.metadata.documentation ? 80 : 20;

    // Test coverage (simplified)
    const testCoverage = component.metadata.testing?.coverage || 0;

    // Dependency complexity (lower complexity = higher score)
    const dependencyComplexity = Math.max(0, 100 - (component.dependencies.length * 10));

    // Props clarity based on prop definitions
    const propsClarity = component.props.length > 0 ? 
      Math.min(100, component.props.length * 20) : 80;

    // Business logic separation
    const businessLogicSeparation = component.businessLogic.length > 0 ? 70 : 90;

    // React patterns compliance
    const reactCompliance = component.reactPatterns.length > 0 ? 85 : 60;

    // Migration compatibility (based on component type and patterns)
    const migrationCompatibility = this.assessMigrationCompatibility(component);

    return {
      codeQuality,
      documentation,
      testCoverage,
      dependencyComplexity,
      propsClarity,
      businessLogicSeparation,
      reactCompliance,
      migrationCompatibility
    };
  }

  /**
   * Calculate overall readiness score
   */
  private calculateOverallReadiness(criteria: ReadinessCriteria): number {
    const weights = {
      codeQuality: 0.20,
      documentation: 0.10,
      testCoverage: 0.15,
      dependencyComplexity: 0.20,
      propsClarity: 0.10,
      businessLogicSeparation: 0.10,
      reactCompliance: 0.10,
      migrationCompatibility: 0.05
    };

    return Math.round(
      Object.entries(criteria).reduce((total, [key, value]) => {
        const weight = weights[key as keyof ReadinessCriteria] || 0;
        return total + (value * weight);
      }, 0)
    );
  }

  /**
   * Classify readiness level based on score
   */
  private classifyReadinessLevel(score: number): ComponentReadiness['readinessLevel'] {
    if (score >= this.config.readinessThreshold) return 'ready';
    if (score >= 60) return 'needs-work';
    if (score >= 40) return 'complex';
    return 'high-risk';
  }

  /**
   * Assess migration compatibility
   */
  private assessMigrationCompatibility(component: ComponentDefinition): number {
    let score = 80; // Base score

    // Functional components are easier to migrate
    if (component.type === 'functional') score += 10;
    if (component.type === 'class') score -= 10;

    // Modern React patterns are good
    if (component.reactPatterns.includes('useState')) score += 5;
    if (component.reactPatterns.includes('useEffect')) score += 5;

    // High complexity is problematic
    if (component.complexity === 'complex') score -= 15;
    if (component.complexity === 'critical') score -= 25;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Identify extraction blockers
   */
  private identifyBlockers(
    component: ComponentDefinition,
    parseResult?: ParseResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _dependencies: any[] = []
  ): string[] {
    const blockers: string[] = [];

    // Complex components need refactoring
    if (component.complexity === 'critical') {
      blockers.push('Critical complexity level requires refactoring');
    }

    // Missing props definitions
    if (component.props.length === 0 && component.type === 'functional') {
      blockers.push('Missing TypeScript props interface definition');
    }

    // Parse errors
    if (parseResult && !parseResult.success) {
      blockers.push('Component contains syntax errors or parse failures');
    }

    // High cyclomatic complexity
    if (parseResult && parseResult.complexity.cyclomaticComplexity > 15) {
      blockers.push('High cyclomatic complexity requires simplification');
    }

    // Missing documentation
    if (!component.metadata.documentation) {
      blockers.push('Missing component documentation');
    }

    return blockers;
  }

  /**
   * Generate prerequisites for component extraction
   */
  private generatePrerequisites(blockers: string[], criteria: ReadinessCriteria): string[] {
    const prerequisites: string[] = [];

    if (blockers.length > 0) {
      prerequisites.push('Resolve identified blockers');
    }

    if (criteria.testCoverage < 50) {
      prerequisites.push('Improve test coverage to at least 50%');
    }

    if (criteria.documentation < 50) {
      prerequisites.push('Add comprehensive component documentation');
    }

    if (criteria.codeQuality < 60) {
      prerequisites.push('Refactor to improve code quality');
    }

    if (criteria.dependencyComplexity < 60) {
      prerequisites.push('Simplify dependency structure');
    }

    return prerequisites;
  }

  /**
   * Estimate extraction effort
   */
  private estimateEffort(
    component: ComponentDefinition,
    parseResult?: ParseResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _dependencies: any[] = []
  ): ComponentReadiness['effort'] {
    let effort = 0;

    // Base effort by component type
    if (component.type === 'functional') effort += 1;
    if (component.type === 'class') effort += 2;
    if (component.type === 'higher-order') effort += 3;

    // Complexity impact
    if (component.complexity === 'moderate') effort += 1;
    if (component.complexity === 'complex') effort += 2;
    if (component.complexity === 'critical') effort += 3;

    // Dependencies impact
    effort += Math.min(2, Math.floor(component.dependencies.length / 3));

    // Business logic impact
    effort += Math.min(2, Math.floor(component.businessLogic.length / 2));

    // Parse complexity impact
    if (parseResult?.complexity.cyclomaticComplexity) {
      effort += Math.min(2, Math.floor(parseResult.complexity.cyclomaticComplexity / 10));
    }

    // Convert to effort level
    if (effort <= 2) return 'low';
    if (effort <= 4) return 'medium';
    if (effort <= 6) return 'high';
    return 'very-high';
  }

  /**
   * Assess extraction risk
   */
  private assessRisk(
    component: ComponentDefinition,
    parseResult?: ParseResult,
    dependencies: any[] = []
  ): ComponentReadiness['risk'] {
    let risk = 0;

    // Critical complexity is high risk
    if (component.complexity === 'critical') risk += 3;
    if (component.complexity === 'complex') risk += 2;

    // Many dependencies increase risk
    if (dependencies.length > 5) risk += 2;
    if (dependencies.length > 10) risk += 3;

    // Parse failures are risky
    if (parseResult && !parseResult.success) risk += 2;

    // High cyclomatic complexity
    if (parseResult && parseResult.complexity.cyclomaticComplexity > 20) risk += 3;

    // Missing tests increase risk
    if (!component.metadata.testing?.coverage || component.metadata.testing.coverage < 30) {
      risk += 2;
    }

    // Convert to risk level
    if (risk <= 2) return 'low';
    if (risk <= 4) return 'medium';
    if (risk <= 6) return 'high';
    return 'critical';
  }

  /**
   * Create organized inventory sections
   */
  private createInventorySections(
    components: ComponentDefinition[],
    readiness: ComponentReadiness[]
  ): InventorySection[] {
    const sections: InventorySection[] = [];

    // Group by readiness level
    const readinessGroups = this.groupBy(readiness, r => r.readinessLevel);

    Object.entries(readinessGroups).forEach(([level, readinessItems]) => {
      const sectionComponents = components.filter(c =>
        readinessItems.some(r => r.componentId === c.id)
      );

      sections.push({
        title: this.getReadinessTitle(level as ComponentReadiness['readinessLevel']),
        description: this.getReadinessDescription(level as ComponentReadiness['readinessLevel']),
        components: sectionComponents,
        metrics: {
          count: sectionComponents.length,
          averageScore: readinessItems.reduce((sum, r) => sum + r.readinessScore, 0) / readinessItems.length
        },
        recommendations: this.getReadinessRecommendations(level as ComponentReadiness['readinessLevel'])
      });
    });

    return sections;
  }

  /**
   * Group array by key function
   */
  private groupBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return groups;
    }, {} as Record<K, T[]>);
  }

  /**
   * Get title for readiness level
   */
  private getReadinessTitle(level: ComponentReadiness['readinessLevel']): string {
    const titles = {
      ready: 'Ready for Extraction',
      'needs-work': 'Needs Preparation',
      complex: 'Complex Components',
      'high-risk': 'High-Risk Components'
    };
    return titles[level];
  }

  /**
   * Get description for readiness level
   */
  private getReadinessDescription(level: ComponentReadiness['readinessLevel']): string {
    const descriptions = {
      ready: 'Components that are well-structured and ready for immediate extraction',
      'needs-work': 'Components that require some preparation before extraction',
      complex: 'Components with significant complexity that need careful planning',
      'high-risk': 'Components that pose significant extraction challenges'
    };
    return descriptions[level];
  }

  /**
   * Get recommendations for readiness level
   */
  private getReadinessRecommendations(level: ComponentReadiness['readinessLevel']): string[] {
    const recommendations = {
      ready: [
        'Extract these components first to establish baseline',
        'Use as reference examples for other components',
        'Validate extraction process with these components'
      ],
      'needs-work': [
        'Focus on improving test coverage',
        'Add missing documentation',
        'Simplify prop interfaces'
      ],
      complex: [
        'Break down into smaller components',
        'Separate business logic from presentation',
        'Consider refactoring before extraction'
      ],
      'high-risk': [
        'Requires significant refactoring',
        'Consider complete rewrite in target framework',
        'Extensive testing required before migration'
      ]
    };
    return recommendations[level];
  }

  /**
   * Generate migration roadmap
   */
  private generateMigrationRoadmap(
    readiness: ComponentReadiness[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _dependencies: DependencyAnalysisResult
  ): MigrationRoadmap {
    // Sort components by readiness for phased approach
    const sortedComponents = readiness.sort((a, b) => b.readinessScore - a.readinessScore);

    const phases: MigrationPhase[] = [];
    let currentPhase = 1;
    let currentPhaseComponents: string[] = [];

    sortedComponents.forEach(component => {
      if (currentPhaseComponents.length >= this.config.maxComponentsPerPhase) {
        // Create phase
        phases.push(this.createMigrationPhase(currentPhase, currentPhaseComponents));
        currentPhase++;
        currentPhaseComponents = [];
      }
      currentPhaseComponents.push(component.name);
    });

    // Add remaining components to final phase
    if (currentPhaseComponents.length > 0) {
      phases.push(this.createMigrationPhase(currentPhase, currentPhaseComponents));
    }

    return {
      approach: 'incremental',
      phases,
      timelineEstimate: this.estimateOverallTimeline(phases),
      resourceRequirements: {
        developers: Math.ceil(readiness.length / 20),
        duration: this.estimateOverallTimeline(phases),
        skills: ['React', 'TypeScript', 'Component Architecture', 'Testing']
      },
      successMetrics: [
        'All components successfully migrated',
        'No functionality regression',
        'Performance maintained or improved',
        'Test coverage maintained'
      ]
    };
  }

  /**
   * Create a migration phase
   */
  private createMigrationPhase(phase: number, components: string[]): MigrationPhase {
    return {
      phase,
      name: `Phase ${phase}: ${this.getPhaseName(phase)}`,
      description: this.getPhaseDescription(phase),
      components,
      dependencies: phase > 1 ? [`Phase ${phase - 1} completion`] : [],
      estimatedDuration: this.estimatePhaseDuration(components.length),
      successCriteria: [
        'All phase components migrated successfully',
        'Integration tests passing',
        'Performance benchmarks met'
      ],
      riskMitigation: [
        'Thorough testing before deployment',
        'Rollback plan prepared',
        'Monitoring in place'
      ]
    };
  }

  /**
   * Get phase name
   */
  private getPhaseName(phase: number): string {
    if (phase === 1) return 'Foundation';
    if (phase === 2) return 'Core Components';
    return 'Advanced Components';
  }

  /**
   * Get phase description
   */
  private getPhaseDescription(phase: number): string {
    if (phase === 1) return 'Extract ready components to establish migration foundation';
    if (phase === 2) return 'Migrate core functionality components';
    return 'Handle complex and high-risk components';
  }

  /**
   * Estimate phase duration
   */
  private estimatePhaseDuration(componentCount: number): string {
    const weeksPerComponent = 0.5; // Average 2-3 days per component
    const totalWeeks = Math.ceil(componentCount * weeksPerComponent);
    
    if (totalWeeks <= 1) return '1 week';
    if (totalWeeks <= 4) return `${totalWeeks} weeks`;
    return `${Math.ceil(totalWeeks / 4)} months`;
  }

  /**
   * Estimate overall timeline
   */
  private estimateOverallTimeline(phases: MigrationPhase[]): string {
    // Simple heuristic: add up phase durations with some overlap
    const totalPhases = phases.length;
    const averagePhaseWeeks = 3;
    const totalWeeks = Math.ceil(totalPhases * averagePhaseWeeks * 0.8); // 20% overlap
    
    if (totalWeeks <= 4) return `${totalWeeks} weeks`;
    return `${Math.ceil(totalWeeks / 4)} months`;
  }

  /**
   * Create executive summary
   */
  private createExecutiveSummary(
    discovery: DiscoveryResult,
    readiness: ComponentReadiness[],
    dependencies: DependencyAnalysisResult
  ): InventorySummary {
    const componentsByReadiness = this.groupBy(readiness, r => r.readinessLevel);
    const componentsByType = this.groupBy(discovery.components, c => c.type);
    const componentsByComplexity = this.groupBy(discovery.components, c => c.complexity);

    const averageReadiness = readiness.reduce((sum, r) => sum + r.readinessScore, 0) / readiness.length;

    // Calculate total effort
    const effortCounts = this.groupBy(readiness, r => r.effort);
    const totalEffort = Object.entries(effortCounts).reduce((total, [effort, components]) => {
      const effortMultipliers: Record<ComponentReadiness['effort'], number> = { 
        low: 1, medium: 2, high: 4, 'very-high': 8 
      };
      const multiplier = effortMultipliers[effort as ComponentReadiness['effort']] || 1;
      return total + (components.length * multiplier);
    }, 0);

    const totalEstimatedEffort = `${Math.ceil(totalEffort / 4)} person-months`;

    return {
      totalComponents: discovery.components.length,
      componentsByReadiness: Object.fromEntries(
        Object.entries(componentsByReadiness).map(([key, value]) => [key, value.length])
      ) as Record<ComponentReadiness['readinessLevel'], number>,
      componentsByType: Object.fromEntries(
        Object.entries(componentsByType).map(([key, value]) => [key, value.length])
      ),
      componentsByComplexity: Object.fromEntries(
        Object.entries(componentsByComplexity).map(([key, value]) => [key, value.length])
      ),
      averageReadiness: Math.round(averageReadiness),
      totalEstimatedEffort,
      keyRecommendations: this.generateKeyRecommendations(readiness, dependencies),
      criticalRisks: this.identifyCriticalRisks(readiness, dependencies)
    };
  }

  /**
   * Generate key recommendations
   */
  private generateKeyRecommendations(
    readiness: ComponentReadiness[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _dependencies: DependencyAnalysisResult
  ): string[] {
    const recommendations: string[] = [];

    const readyCount = readiness.filter(r => r.readinessLevel === 'ready').length;
    const highRiskCount = readiness.filter(r => r.readinessLevel === 'high-risk').length;

    if (readyCount > 0) {
      recommendations.push(`Start with ${readyCount} ready components to establish migration process`);
    }

    if (highRiskCount > 0) {
      recommendations.push(`${highRiskCount} high-risk components require significant refactoring`);
    }

    const lowTestCoverage = readiness.filter(r => r.criteria.testCoverage < 50).length;
    if (lowTestCoverage > readiness.length * 0.3) {
      recommendations.push('Improve test coverage across the codebase before migration');
    }

    const complexComponents = readiness.filter(r => r.criteria.dependencyComplexity < 50).length;
    if (complexComponents > 0) {
      recommendations.push('Simplify dependency structures for easier extraction');
    }

    return recommendations;
  }

  /**
   * Identify critical risks
   */
  private identifyCriticalRisks(
    readiness: ComponentReadiness[],
    dependencies: DependencyAnalysisResult
  ): string[] {
    const risks: string[] = [];

    const criticalRiskComponents = readiness.filter(r => r.risk === 'critical').length;
    if (criticalRiskComponents > 0) {
      risks.push(`${criticalRiskComponents} components have critical extraction risks`);
    }

    if (dependencies.graph.cycles.length > 0) {
      risks.push(`${dependencies.graph.cycles.length} circular dependencies detected`);
    }

    const noTestComponents = readiness.filter(r => r.criteria.testCoverage === 0).length;
    if (noTestComponents > readiness.length * 0.5) {
      risks.push('Over 50% of components lack test coverage');
    }

    const undocumentedComponents = readiness.filter(r => r.criteria.documentation < 30).length;
    if (undocumentedComponents > readiness.length * 0.4) {
      risks.push('Significant portion of components lack proper documentation');
    }

    return risks;
  }

  /**
   * Export inventory to JSON format
   */
  private async exportToJson(inventory: ComponentInventory): Promise<void> {
    const filePath = join(this.config.outputDir, 'component-inventory.json');
    const jsonContent = JSON.stringify(inventory, null, 2);
    await writeFile(filePath, jsonContent, 'utf-8');
    this.logger.info(`JSON inventory exported to ${filePath}`);
  }

  /**
   * Export inventory to Markdown format
   */
  private async exportToMarkdown(inventory: ComponentInventory): Promise<void> {
    const filePath = join(this.config.outputDir, 'component-inventory.md');
    const markdownContent = this.generateMarkdownReport(inventory);
    await writeFile(filePath, markdownContent, 'utf-8');
    this.logger.info(`Markdown inventory exported to ${filePath}`);
  }

  /**
   * Generate markdown report content
   */
  private generateMarkdownReport(inventory: ComponentInventory): string {
    const md: string[] = [];

    // Header
    md.push('# Component Migration Inventory');
    md.push('');
    md.push(`Generated on: ${inventory.metadata.generatedAt.toISOString()}`);
    md.push(`Source: ${inventory.metadata.sourceBasePath}`);
    md.push(`Pipeline Version: ${inventory.metadata.pipelineVersion}`);
    md.push('');

    // Executive Summary
    md.push('## Executive Summary');
    md.push('');
    md.push(`- **Total Components**: ${inventory.summary.totalComponents}`);
    md.push(`- **Average Readiness**: ${inventory.summary.averageReadiness}%`);
    md.push(`- **Estimated Effort**: ${inventory.summary.totalEstimatedEffort}`);
    md.push('');

    // Readiness Distribution
    md.push('### Component Readiness Distribution');
    md.push('');
    Object.entries(inventory.summary.componentsByReadiness).forEach(([level, count]) => {
      md.push(`- **${level}**: ${count} components`);
    });
    md.push('');

    // Key Recommendations
    md.push('### Key Recommendations');
    md.push('');
    inventory.summary.keyRecommendations.forEach(rec => {
      md.push(`- ${rec}`);
    });
    md.push('');

    // Critical Risks
    if (inventory.summary.criticalRisks.length > 0) {
      md.push('### Critical Risks');
      md.push('');
      inventory.summary.criticalRisks.forEach(risk => {
        md.push(`- ⚠️ ${risk}`);
      });
      md.push('');
    }

    // Migration Roadmap
    md.push('## Migration Roadmap');
    md.push('');
    md.push(`**Approach**: ${inventory.roadmap.approach}`);
    md.push(`**Timeline**: ${inventory.roadmap.timelineEstimate}`);
    md.push('');

    inventory.roadmap.phases.forEach(phase => {
      md.push(`### ${phase.name}`);
      md.push('');
      md.push(phase.description);
      md.push('');
      md.push(`**Duration**: ${phase.estimatedDuration}`);
      md.push(`**Components**: ${phase.components.length}`);
      md.push('');
      phase.components.forEach(comp => {
        md.push(`- ${comp}`);
      });
      md.push('');
    });

    // Component Sections
    md.push('## Component Inventory');
    md.push('');

    inventory.sections.forEach(section => {
      md.push(`### ${section.title}`);
      md.push('');
      md.push(section.description);
      md.push('');
      md.push(`**Count**: ${section.metrics['count']}`);
      if (section.metrics['averageScore']) {
        md.push(`**Average Score**: ${Math.round(section.metrics['averageScore'] as number)}%`);
      }
      md.push('');

      // Component list
      section.components.forEach(component => {
        const readinessInfo = inventory.readiness.find(r => r.componentId === component.id);
        const score = readinessInfo ? ` (${readinessInfo.readinessScore}%)` : '';
        md.push(`- **${component.name}**${score} - ${component.type}`);
      });
      md.push('');
    });

    return md.join('\n');
  }

  /**
   * Export inventory to HTML format
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async exportToHtml(_inventory: ComponentInventory): Promise<void> {
    // HTML export implementation would go here
    this.logger.info('HTML export not yet implemented');
  }
}

export default ComponentInventoryGenerator;