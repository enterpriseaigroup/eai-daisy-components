/**
 * Migration Completion Certifier
 *
 * Certifies that migration is complete and meets all quality requirements.
 * Generates sign-off documentation and validation reports.
 *
 * @fileoverview Migration certification and sign-off
 * @version 1.0.0
 */

import { promises as fs } from 'fs';

/**
 * Certification criteria
 */
export interface CertificationCriteria {
  minimumSuccessRate: number;
  minimumEquivalencyScore: number;
  requireAllComponentsMigrated: boolean;
  requireNoFailures: boolean;
  requireValidation: boolean;
}

/**
 * Certification result
 */
export interface CertificationResult {
  certified: boolean;
  timestamp: Date;
  criteria: CertificationCriteria;
  results: {
    totalComponents: number;
    migratedComponents: number;
    successRate: number;
    averageEquivalencyScore: number;
    failedComponents: string[];
    criticalIssues: string[];
  };
  signOff: {
    certifiedBy: string;
    certificationDate: Date;
    expiryDate: Date;
    notes: string;
  };
  recommendations: string[];
}

/**
 * Component validation summary
 */
export interface ComponentValidation {
  componentId: string;
  componentName: string;
  migrated: boolean;
  equivalencyScore: number;
  businessLogicPreserved: boolean;
  testsPass: boolean;
  issues: string[];
}

/**
 * Migration completion certifier
 */
export class MigrationCertifier {
  private readonly criteria: CertificationCriteria;

  constructor(criteria?: Partial<CertificationCriteria>) {
    this.criteria = {
      minimumSuccessRate: 95,
      minimumEquivalencyScore: 0.95,
      requireAllComponentsMigrated: true,
      requireNoFailures: false,
      requireValidation: true,
      ...criteria,
    };
  }

  /**
   * Certify migration completion
   */
  public certify(
    validations: ComponentValidation[],
    certifiedBy: string
  ): CertificationResult {
    const results = this.analyzeResults(validations);
    const criticalIssues = this.identifyCriticalIssues(validations, results);
    const certified = this.evaluateCertification(results, criticalIssues);
    const recommendations = this.generateRecommendations(
      results,
      criticalIssues
    );

    const certificationResult: CertificationResult = {
      certified,
      timestamp: new Date(),
      criteria: this.criteria,
      results: {
        ...results,
        criticalIssues,
      },
      signOff: {
        certifiedBy,
        certificationDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        notes: certified
          ? 'Migration completed successfully and meets all criteria'
          : 'Migration does not meet certification criteria',
      },
      recommendations,
    };

    return certificationResult;
  }

  /**
   * Analyze migration results
   */
  private analyzeResults(validations: ComponentValidation[]): {
    totalComponents: number;
    migratedComponents: number;
    successRate: number;
    averageEquivalencyScore: number;
    failedComponents: string[];
  } {
    const totalComponents = validations.length;
    const migratedComponents = validations.filter(v => v.migrated).length;
    const successRate = (migratedComponents / totalComponents) * 100;

    const equivalencyScores = validations
      .filter(v => v.migrated)
      .map(v => v.equivalencyScore);

    const averageEquivalencyScore =
      equivalencyScores.length > 0
        ? equivalencyScores.reduce((sum, score) => sum + score, 0) /
          equivalencyScores.length
        : 0;

    const failedComponents = validations
      .filter(v => !v.migrated || !v.businessLogicPreserved || !v.testsPass)
      .map(v => v.componentName);

    return {
      totalComponents,
      migratedComponents,
      successRate,
      averageEquivalencyScore,
      failedComponents,
    };
  }

  /**
   * Identify critical issues
   */
  private identifyCriticalIssues(
    validations: ComponentValidation[],
    results: ReturnType<typeof this.analyzeResults>
  ): string[] {
    const issues: string[] = [];

    // Check success rate
    if (results.successRate < this.criteria.minimumSuccessRate) {
      issues.push(
        `Success rate (${results.successRate.toFixed(1)}%) below minimum (${this.criteria.minimumSuccessRate}%)`
      );
    }

    // Check equivalency score
    if (
      results.averageEquivalencyScore < this.criteria.minimumEquivalencyScore
    ) {
      issues.push(
        `Average equivalency score (${(results.averageEquivalencyScore * 100).toFixed(1)}%) below minimum (${(this.criteria.minimumEquivalencyScore * 100).toFixed(1)}%)`
      );
    }

    // Check for failed components
    if (
      this.criteria.requireNoFailures &&
      results.failedComponents.length > 0
    ) {
      issues.push(
        `${results.failedComponents.length} components failed migration`
      );
    }

    // Check for business logic preservation
    const logicIssues = validations.filter(
      v => v.migrated && !v.businessLogicPreserved
    );
    if (logicIssues.length > 0) {
      issues.push(
        `${logicIssues.length} components have business logic preservation issues`
      );
    }

    // Check for test failures
    const testFailures = validations.filter(v => v.migrated && !v.testsPass);
    if (testFailures.length > 0) {
      issues.push(`${testFailures.length} components have failing tests`);
    }

    return issues;
  }

  /**
   * Evaluate if certification should be granted
   */
  private evaluateCertification(
    results: ReturnType<typeof this.analyzeResults>,
    criticalIssues: string[]
  ): boolean {
    // No critical issues
    if (criticalIssues.length > 0) {
      return false;
    }

    // Meet minimum success rate
    if (results.successRate < this.criteria.minimumSuccessRate) {
      return false;
    }

    // Meet minimum equivalency score
    if (
      results.averageEquivalencyScore < this.criteria.minimumEquivalencyScore
    ) {
      return false;
    }

    // All components migrated if required
    if (
      this.criteria.requireAllComponentsMigrated &&
      results.migratedComponents < results.totalComponents
    ) {
      return false;
    }

    return true;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    results: ReturnType<typeof this.analyzeResults>,
    criticalIssues: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (criticalIssues.length > 0) {
      recommendations.push('Address all critical issues before deployment');
    }

    if (results.failedComponents.length > 0) {
      recommendations.push(
        `Review and remediate ${results.failedComponents.length} failed components`
      );
    }

    if (results.averageEquivalencyScore < 1.0) {
      recommendations.push(
        'Review components with lower equivalency scores for potential improvements'
      );
    }

    if (results.successRate < 100) {
      recommendations.push(
        'Consider implementing retry mechanism for failed migrations'
      );
    }

    recommendations.push(
      'Implement monitoring for migrated components in production'
    );
    recommendations.push('Schedule follow-up review 30 days after deployment');
    recommendations.push('Document any known limitations or workarounds');

    return recommendations;
  }

  /**
   * Generate certification document
   */
  public async generateCertificationDocument(
    result: CertificationResult,
    outputPath: string
  ): Promise<string> {
    const document = `# Component Migration Certification

**Status**: ${result.certified ? '✅ CERTIFIED' : '❌ NOT CERTIFIED'}  
**Date**: ${result.timestamp.toISOString()}  
**Certified By**: ${result.signOff.certifiedBy}  
**Expiry Date**: ${result.signOff.expiryDate.toISOString()}

## Executive Summary

${result.certified ? 'The component migration has been successfully completed and meets all certification criteria.' : 'The component migration does not currently meet certification criteria and requires remediation.'}

## Migration Results

- **Total Components**: ${result.results.totalComponents}
- **Migrated Components**: ${result.results.migratedComponents}
- **Success Rate**: ${result.results.successRate.toFixed(1)}%
- **Average Equivalency Score**: ${(result.results.averageEquivalencyScore * 100).toFixed(1)}%

## Certification Criteria

| Criterion | Required | Actual | Status |
|-----------|----------|--------|--------|
| Success Rate | ≥${result.criteria.minimumSuccessRate}% | ${result.results.successRate.toFixed(1)}% | ${result.results.successRate >= result.criteria.minimumSuccessRate ? '✅' : '❌'} |
| Equivalency Score | ≥${(result.criteria.minimumEquivalencyScore * 100).toFixed(1)}% | ${(result.results.averageEquivalencyScore * 100).toFixed(1)}% | ${result.results.averageEquivalencyScore >= result.criteria.minimumEquivalencyScore ? '✅' : '❌'} |
| All Components Migrated | ${result.criteria.requireAllComponentsMigrated ? 'Yes' : 'No'} | ${result.results.migratedComponents === result.results.totalComponents ? 'Yes' : 'No'} | ${!result.criteria.requireAllComponentsMigrated || result.results.migratedComponents === result.results.totalComponents ? '✅' : '❌'} |

## Critical Issues

${result.results.criticalIssues.length === 0 ? '_No critical issues identified_' : result.results.criticalIssues.map(issue => `- ⚠️ ${issue}`).join('\n')}

## Failed Components

${result.results.failedComponents.length === 0 ? '_No failed components_' : result.results.failedComponents.map(name => `- ${name}`).join('\n')}

## Recommendations

${result.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

## Sign-Off

**Certification Notes**: ${result.signOff.notes}

**Certified By**: ${result.signOff.certifiedBy}  
**Date**: ${result.signOff.certificationDate.toISOString()}  
**Signature**: _________________________

---

*This certification is valid until ${result.signOff.expiryDate.toISOString()}*

*Generated by DAISY v1 Migration Pipeline*
`;

    await fs.writeFile(outputPath, document);
    return document;
  }

  /**
   * Generate JSON certification
   */
  public async generateJSONCertification(
    result: CertificationResult,
    outputPath: string
  ): Promise<void> {
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
  }
}

/**
 * Create certifier with default criteria
 */
export function createCertifier(
  criteria?: Partial<CertificationCriteria>
): MigrationCertifier {
  return new MigrationCertifier(criteria);
}
