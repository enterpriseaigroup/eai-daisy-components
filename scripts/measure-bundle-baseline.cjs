#!/usr/bin/env node

/**
 * @fileoverview Script to measure and establish bundle size baselines for components
 * This script analyzes component files and establishes baseline metrics for migration targets
 */

const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');

// Configuration
const BASELINE_METRICS_PATH = path.join(process.cwd(), '.baseline-metrics.json');
const DAISYV1_PATH = path.join(process.cwd(), 'daisyv1');
const SRC_COMPONENTS_PATH = path.join(process.cwd(), 'src', 'components');

/**
 * Get file size in bytes
 * @param {string} filePath - Path to file
 * @returns {number} Size in bytes
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Get gzipped size of content
 * @param {string} content - File content
 * @returns {number} Gzipped size in bytes
 */
function getGzippedSize(content) {
  const gzipped = gzipSync(content);
  return gzipped.length;
}

/**
 * Analyze a component file
 * @param {string} filePath - Path to component file
 * @returns {Object} Component metrics
 */
function analyzeComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rawSize = getFileSize(filePath);
  const gzippedSize = getGzippedSize(content);

  // Count lines of code
  const lines = content.split('\n').length;

  // Count imports
  const imports = (content.match(/import .* from/g) || []).length;

  // Detect complexity indicators
  const hasState = content.includes('useState') || content.includes('this.state');
  const hasEffects = content.includes('useEffect') || content.includes('componentDidMount');
  const hasContext = content.includes('useContext') || content.includes('Context');
  const hasReducer = content.includes('useReducer');

  // Estimate complexity tier
  let tier = 1;
  if (hasReducer || (hasState && hasEffects && hasContext)) {
    tier = 3;
  } else if ((hasState && hasEffects) || hasContext) {
    tier = 2;
  }

  return {
    path: filePath,
    rawSize,
    gzippedSize,
    lines,
    imports,
    hasState,
    hasEffects,
    hasContext,
    hasReducer,
    tier,
    timestamp: new Date().toISOString()
  };
}

/**
 * Find all component files in a directory
 * @param {string} dir - Directory to search
 * @param {Array} files - Accumulator for files
 * @returns {Array} List of component file paths
 */
function findComponentFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findComponentFiles(fullPath, files);
    } else if (
      (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js')) &&
      !item.includes('.test.') &&
      !item.includes('.spec.') &&
      !item.includes('.d.ts')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Calculate average metrics for a tier
 * @param {Array} components - Components in tier
 * @returns {Object} Average metrics
 */
function calculateTierAverages(components) {
  if (components.length === 0) {
    return {
      count: 0,
      averageRawSize: 0,
      averageGzippedSize: 0,
      averageLines: 0,
      averageImports: 0
    };
  }

  const totals = components.reduce((acc, comp) => ({
    rawSize: acc.rawSize + comp.rawSize,
    gzippedSize: acc.gzippedSize + comp.gzippedSize,
    lines: acc.lines + comp.lines,
    imports: acc.imports + comp.imports
  }), { rawSize: 0, gzippedSize: 0, lines: 0, imports: 0 });

  return {
    count: components.length,
    averageRawSize: Math.round(totals.rawSize / components.length),
    averageGzippedSize: Math.round(totals.gzippedSize / components.length),
    averageLines: Math.round(totals.lines / components.length),
    averageImports: Math.round(totals.imports / components.length)
  };
}

/**
 * Main function to establish baselines
 */
function establishBaselines() {
  console.log('🔍 Analyzing components for bundle size baselines...\n');

  // Load existing metrics
  let metrics = {};
  if (fs.existsSync(BASELINE_METRICS_PATH)) {
    metrics = JSON.parse(fs.readFileSync(BASELINE_METRICS_PATH, 'utf8'));
  }

  // Find and analyze DAISY v1 components
  console.log('📂 Searching for DAISY v1 components...');
  const v1Files = findComponentFiles(path.join(DAISYV1_PATH, 'components'));
  console.log(`  Found ${v1Files.length} DAISY v1 components\n`);

  // Find and analyze migrated v2 components
  console.log('📂 Searching for migrated v2 components...');
  const v2Files = findComponentFiles(SRC_COMPONENTS_PATH);
  console.log(`  Found ${v2Files.length} migrated components\n`);

  // Analyze all components
  const v1Components = v1Files.map(analyzeComponent);
  const v2Components = v2Files.map(analyzeComponent);

  // Group by tier
  const v1Tiers = {
    tier1: v1Components.filter(c => c.tier === 1),
    tier2: v1Components.filter(c => c.tier === 2),
    tier3: v1Components.filter(c => c.tier === 3)
  };

  const v2Tiers = {
    tier1: v2Components.filter(c => c.tier === 1),
    tier2: v2Components.filter(c => c.tier === 2),
    tier3: v2Components.filter(c => c.tier === 3)
  };

  // Calculate averages
  const v1Averages = {
    tier1: calculateTierAverages(v1Tiers.tier1),
    tier2: calculateTierAverages(v1Tiers.tier2),
    tier3: calculateTierAverages(v1Tiers.tier3)
  };

  const v2Averages = {
    tier1: calculateTierAverages(v2Tiers.tier1),
    tier2: calculateTierAverages(v2Tiers.tier2),
    tier3: calculateTierAverages(v2Tiers.tier3)
  };

  // Update metrics
  metrics.version = metrics.version || '1.0.0';
  metrics.timestamp = new Date().toISOString();
  metrics.baseline = metrics.baseline || {};

  // Update bundle size baselines
  if (v1Components.length > 0) {
    const totalV1Size = v1Components.reduce((sum, c) => sum + c.gzippedSize, 0);
    const averageV1Size = Math.round(totalV1Size / v1Components.length);

    metrics.baseline.bundleSize = {
      description: 'Based on analyzed DAISY v1 components',
      v1Average: averageV1Size,
      v1Total: totalV1Size,
      target: Math.round(averageV1Size * 1.2), // 120% of v1
      maxIncrease: '20%',
      notes: 'Target is ≤120% of DAISY v1 baseline as per specification'
    };
  } else {
    // Set default targets if no v1 components yet
    metrics.baseline.bundleSize = {
      description: 'Default targets - will be updated after first DAISY v1 component',
      v1Average: 5000, // 5KB gzipped default
      v1Total: 0,
      target: 6000, // 6KB gzipped (120% of default)
      maxIncrease: '20%',
      notes: 'Using default targets until DAISY v1 components are available'
    };
  }

  // Update component baselines
  metrics.componentBaselines = {
    tier1: {
      v1: v1Averages.tier1,
      v2: v2Averages.tier1,
      components: v1Tiers.tier1.map(c => path.basename(c.path))
    },
    tier2: {
      v1: v1Averages.tier2,
      v2: v2Averages.tier2,
      components: v1Tiers.tier2.map(c => path.basename(c.path))
    },
    tier3: {
      v1: v1Averages.tier3,
      v2: v2Averages.tier3,
      components: v1Tiers.tier3.map(c => path.basename(c.path))
    }
  };

  // Calculate size increase if both v1 and v2 exist
  if (v1Components.length > 0 && v2Components.length > 0) {
    const v1TotalGzipped = v1Components.reduce((sum, c) => sum + c.gzippedSize, 0);
    const v2TotalGzipped = v2Components.reduce((sum, c) => sum + c.gzippedSize, 0);
    const increase = ((v2TotalGzipped / v1TotalGzipped) - 1) * 100;

    metrics.migrationMetrics = {
      v1TotalSize: v1TotalGzipped,
      v2TotalSize: v2TotalGzipped,
      sizeIncrease: `${increase.toFixed(2)}%`,
      withinTarget: increase <= 20
    };
  }

  // Keep other baseline sections
  metrics.baseline.performance = metrics.baseline.performance || {
    migrationTime: {
      tier1: '30min',
      tier2: '2hours',
      tier3: '1day'
    },
    memoryLimit: '500MB',
    processingTargets: {
      componentsPerHour: 10,
      batchSize: 5
    }
  };

  metrics.baseline.testCoverage = {
    minimum: '80%',
    target: '95%',
    current: '25.32%' // Updated from test run
  };

  metrics.baseline.qualityThresholds = metrics.baseline.qualityThresholds || {
    typeScoreSafetyScore: 0.9,
    businessLogicPreservation: 1.0,
    structuralSimilarity: 0.95,
    performanceRegression: 0.2
  };

  // Save updated metrics
  fs.writeFileSync(BASELINE_METRICS_PATH, JSON.stringify(metrics, null, 2));

  // Print summary
  console.log('📊 Bundle Size Baseline Summary:\n');
  console.log('═══════════════════════════════════════════');

  if (v1Components.length > 0) {
    console.log('DAISY v1 Components:');
    console.log(`  Total: ${v1Components.length} components`);
    console.log(`  Tier 1: ${v1Tiers.tier1.length} (avg ${v1Averages.tier1.averageGzippedSize} bytes gzipped)`);
    console.log(`  Tier 2: ${v1Tiers.tier2.length} (avg ${v1Averages.tier2.averageGzippedSize} bytes gzipped)`);
    console.log(`  Tier 3: ${v1Tiers.tier3.length} (avg ${v1Averages.tier3.averageGzippedSize} bytes gzipped)`);
    console.log('');
  }

  if (v2Components.length > 0) {
    console.log('Migrated v2 Components:');
    console.log(`  Total: ${v2Components.length} components`);
    console.log(`  Tier 1: ${v2Tiers.tier1.length} (avg ${v2Averages.tier1.averageGzippedSize} bytes gzipped)`);
    console.log(`  Tier 2: ${v2Tiers.tier2.length} (avg ${v2Averages.tier2.averageGzippedSize} bytes gzipped)`);
    console.log(`  Tier 3: ${v2Tiers.tier3.length} (avg ${v2Averages.tier3.averageGzippedSize} bytes gzipped)`);
    console.log('');
  }

  console.log('Bundle Size Targets:');
  console.log(`  Baseline: ${metrics.baseline.bundleSize.v1Average} bytes (gzipped)`);
  console.log(`  Target: ${metrics.baseline.bundleSize.target} bytes (≤120% of baseline)`);
  console.log(`  Max Increase: ${metrics.baseline.bundleSize.maxIncrease}`);

  if (metrics.migrationMetrics) {
    console.log('');
    console.log('Migration Metrics:');
    console.log(`  Size Increase: ${metrics.migrationMetrics.sizeIncrease}`);
    console.log(`  Within Target: ${metrics.migrationMetrics.withinTarget ? '✅ Yes' : '❌ No'}`);
  }

  console.log('═══════════════════════════════════════════');
  console.log('\n✅ Baseline metrics updated in .baseline-metrics.json');
}

// Run the script
establishBaselines();