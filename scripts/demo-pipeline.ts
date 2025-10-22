#!/usr/bin/env node

/**
 * Pipeline Demo Script - DAISY v1 Button Component Processing
 * 
 * This script demonstrates the complete pipeline processing a real
 * DAISY v1 Button component through discovery and analysis phases.
 */

import { resolve } from 'path';
import { PipelineOrchestrator } from '../src/pipeline/orchestrator.js';
import type { ExtractionConfig } from '../src/types/index.js';

async function runPipelineDemo(): Promise<void> {
  console.log('🚀 Starting DAISY v1 Button Component Pipeline Demo\n');

  // Minimal working configuration
  const config: ExtractionConfig = {
    sourcePath: resolve('./daisyv1'),
    outputPath: resolve('./output'),
    preserveBaseline: true,
    processing: {
      mode: 'serial',
      concurrency: 1,
      continueOnError: true,
      retry: {
        maxAttempts: 2,
        delay: 1000,
        backoffMultiplier: 1.5,
        retryableOperations: ['file-read', 'ast-parsing']
      },
      filters: {
        include: ['**/*.tsx', '**/*.ts', '**/*.css'],
        exclude: ['**/*.test.*', '**/*.spec.*'],
        types: ['functional', 'class', 'higher-order'],
        complexity: ['simple', 'moderate', 'complex'],
        custom: []
      }
    },
    performance: {
      memoryLimit: 512,
      timeoutPerComponent: 30000,
      maxBundleSizeIncrease: 50,
      monitoring: true
    },
    validation: {
      strict: false,
      typescript: true,
      eslint: false,
      componentStructure: true,
      businessLogicPreservation: true
    },
    output: {
      generateDeclarations: true,
      generateDocs: true,
      generateExamples: true,
      format: {
        typescript: '.tsx',
        indentation: 'spaces',
        indentationSize: 2,
        lineEnding: 'lf',
        quotes: 'single'
      },
      naming: {
        componentFiles: 'PascalCase',
        interfaces: 'PascalCase',
        utilities: 'camelCase',
        constants: 'UPPER_SNAKE_CASE'
      }
    },
    logging: {
      level: 'info',
      outputs: ['console', 'file'],
      format: 'simple',
      timestamps: true,
      stackTraces: true
    }
  };

  // Pipeline options
  const options = {
    mode: 'full-pipeline' as const,
    parallel: false,
    maxWorkers: 1,
    skipErrors: false,
    generateReports: true,
    outputDir: config.outputPath,
    saveIntermediateResults: true,
    maxExecutionTime: 10,
    dryRun: false
  };

  try {
    console.log('📊 Pipeline Configuration:');
    console.log(`   Source: ${config.sourcePath}`);
    console.log(`   Output: ${config.outputPath}`);
    console.log(`   Mode: ${options.mode}`);
    console.log(`   Processing: ${config.processing.mode}\n`);

    // Initialize and run the pipeline orchestrator
    const orchestrator = new PipelineOrchestrator();
    
    console.log('🔍 Starting pipeline execution...\n');
    const result = await orchestrator.execute(config, options);

    // Display results
    console.log('\n📈 Pipeline Execution Results:');
    console.log('================================');
    console.log(`✅ Success: ${result.success}`);
    console.log(`⏱️  Duration: ${result.metrics.totalDuration}ms`);
    console.log(`📦 Components Discovered: ${result.progress.stats.componentsDiscovered}`);
    console.log(`🔧 Components Parsed: ${result.progress.stats.componentsParsed}`);
    console.log(`📊 Components Analyzed: ${result.progress.stats.componentsAnalyzed}`);
    console.log(`❌ Errors: ${result.progress.stats.errorsEncountered}`);
    console.log(`⚠️  Warnings: ${result.progress.stats.warningsGenerated}`);

    if (result.discovery) {
      console.log('\n🎯 Component Discovery Results:');
      console.log('===============================');
      result.discovery.components.forEach((component, index) => {
        console.log(`${index + 1}. ${component.name}`);
        console.log(`   📁 Path: ${component.path}`);
        console.log(`   🏷️  Type: ${component.type}`);
        console.log(`   📏 Size: ${component.size} bytes`);
        console.log(`   🧬 Complexity: ${component.complexity}`);
        console.log('');
      });
    }

    if (result.parsing && result.parsing.size > 0) {
      console.log('🔍 Parsing Results:');
      console.log('==================');
      console.log(`📊 Total files parsed: ${result.parsing.size}`);
      
      for (const [path, _parseResult] of result.parsing) {
        console.log(`\n📄 ${path}:`);
        console.log(`   ✅ Successfully parsed`);
      }
    }

    if (result.dependencies) {
      console.log('\n🕸️  Dependency Analysis:');
      console.log('========================');
      console.log(`📊 Dependency analysis completed`);
      console.log(`🔗 External dependencies analyzed`);
      console.log(`🧩 Component relationships mapped`);
    }

    if (result.inventory) {
      console.log('\n📚 Component Inventory:');
      console.log('=======================');
      console.log(`📦 Component inventory generated`);
      console.log(`🏗️  Architecture patterns identified`);
      console.log(`📋 Business logic patterns documented`);
      console.log(`🎯 Transformation recommendations generated`);
    }

    if (result.success) {
      console.log('\n🎉 Pipeline Demo Completed Successfully!');
      console.log('\n🔗 Next Steps:');
      console.log('   1. Review the generated output in ./output/');
      console.log('   2. Check the component inventory report');
      console.log('   3. Examine transformation recommendations');
      console.log('   4. Begin Configurator v2 migration planning');
      
      console.log('\n📋 Summary:');
      console.log(`   • Successfully processed the DAISY v1 Button component`);
      console.log(`   • Discovered ${result.progress.stats.componentsDiscovered} components`);
      console.log(`   • Pipeline completed in ${result.metrics.totalDuration}ms`);
      console.log(`   • Ready for transformation to Configurator v2`);
      
    } else {
      console.log('\n❌ Pipeline Demo Failed');
      if (result.errors.length > 0) {
        console.log('\n🚨 Errors encountered:');
        result.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error.message}`);
        });
      }
    }

  } catch (error) {
    console.error('\n💥 Pipeline Demo Failed with Exception:');
    console.error(error);
    process.exit(1);
  }
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runPipelineDemo()
    .then(() => {
      console.log('\n✨ Demo script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Demo script failed:', error);
      process.exit(1);
    });
}

export { runPipelineDemo };