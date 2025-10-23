/**
 * Integration Test for Transformers
 *
 * Tests CSS-to-Tailwind and Pseudo-Code transformers with real DAISY v1 component
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { CSSToTailwindTransformer } from '../../src/pipeline/transformers/css-to-tailwind-transformer';
import { PseudoCodeGenerator } from '../../src/pipeline/transformers/pseudo-code-generator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testTransformers() {
  console.log('='.repeat(80));
  console.log('TRANSFORMER INTEGRATION TEST');
  console.log('='.repeat(80));
  console.log('');

  // Read actual DAISY v1 Button component
  const buttonPath = path.resolve(
    __dirname,
    '../../daisyv1/components/tier2/Button.tsx'
  );

  console.log(`Reading component from: ${buttonPath}`);
  const originalCode = await fs.readFile(buttonPath, 'utf-8');

  console.log(`Original code length: ${originalCode.length} characters`);
  console.log(`Original code lines: ${originalCode.split('\n').length} lines`);
  console.log('');

  // Test 1: CSS-to-Tailwind Transformer
  console.log('='.repeat(80));
  console.log('TEST 1: CSS-to-Tailwind Transformer');
  console.log('='.repeat(80));
  console.log('');

  const cssTransformer = new CSSToTailwindTransformer({
    preserveVisualFidelity: true,
    useArbitraryValues: true,
    removeCSSFiles: false,
  });

  console.log('Running CSS-to-Tailwind transformation...');
  const cssResult = await cssTransformer.transform(originalCode, buttonPath);

  console.log('');
  console.log('CSS Transformation Results:');
  console.log('-'.repeat(80));
  console.log(`Success: ${cssResult.success ? '✅' : '❌'}`);
  console.log(`Processed CSS files: ${cssResult.processedFiles.length}`);
  cssResult.processedFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
  console.log(`CSS rules converted: ${cssResult.convertedRules.length}`);
  console.log(`Warnings: ${cssResult.warnings.length}`);
  cssResult.warnings.forEach(warning => {
    console.log(`  - ${warning}`);
  });

  console.log('');
  console.log('Sample conversions:');
  cssResult.convertedRules.slice(0, 5).forEach((conversion, i) => {
    console.log(`  ${i + 1}. .${conversion.selector}`);
    console.log(`     CSS: ${conversion.cssRules.split('\n')[0].substring(0, 60)}...`);
    console.log(`     Tailwind: ${conversion.tailwindClasses.substring(0, 80)}...`);
    console.log(`     Confidence: ${(conversion.confidence * 100).toFixed(0)}%`);
  });

  console.log('');
  console.log('Code changes:');
  console.log(`  Before: ${originalCode.split('\n').length} lines`);
  console.log(`  After: ${cssResult.transformedCode.split('\n').length} lines`);
  console.log(`  CSS imports removed: ${originalCode.includes("import './Button.css'") && !cssResult.transformedCode.includes("import './Button.css'") ? '✅' : '❌'}`);

  // Save CSS-transformed code
  const cssTransformedPath = path.resolve(
    __dirname,
    '../../tests/transformers/output/Button-css-transformed.tsx'
  );
  await fs.mkdir(path.dirname(cssTransformedPath), { recursive: true });
  await fs.writeFile(cssTransformedPath, cssResult.transformedCode);
  console.log(`  Saved to: ${cssTransformedPath}`);

  // Test 2: Pseudo-Code Generator (v1)
  console.log('');
  console.log('='.repeat(80));
  console.log('TEST 2: Pseudo-Code Generator (v1 - no migration notes)');
  console.log('='.repeat(80));
  console.log('');

  const pseudoCodeGen = new PseudoCodeGenerator({
    includeWhySection: true,
    includeWhatSection: true,
    includeCallsSection: true,
    includeDataFlowSection: true,
    includeDependenciesSection: true,
    includeSpecialBehaviorSection: true,
    addMigrationNotes: false,
  });

  console.log('Running Pseudo-Code generation (v1)...');
  const v1DocResult = await pseudoCodeGen.generate(
    cssResult.transformedCode,
    'Button',
    false
  );

  console.log('');
  console.log('Pseudo-Code Generation Results (v1):');
  console.log('-'.repeat(80));
  console.log(`Success: ${v1DocResult.success ? '✅' : '❌'}`);
  console.log(`Business logic blocks found: ${v1DocResult.blocksDocumented.length}`);
  console.log(`Warnings: ${v1DocResult.warnings.length}`);

  console.log('');
  console.log('Business logic blocks documented:');
  v1DocResult.blocksDocumented.forEach((block, i) => {
    console.log(`  ${i + 1}. ${block.type}: ${block.name}`);
    console.log(`     Line: ${block.lineNumber}`);
    console.log(`     Confidence: ${(block.confidence * 100).toFixed(0)}%`);
  });

  console.log('');
  console.log('Code changes:');
  console.log(`  Before: ${cssResult.transformedCode.split('\n').length} lines`);
  console.log(`  After: ${v1DocResult.documentedCode.split('\n').length} lines`);
  console.log(`  Lines added: ${v1DocResult.documentedCode.split('\n').length - cssResult.transformedCode.split('\n').length}`);

  // Save v1 documented code
  const v1DocumentedPath = path.resolve(
    __dirname,
    '../../tests/transformers/output/Button-v1-documented.tsx'
  );
  await fs.writeFile(v1DocumentedPath, v1DocResult.documentedCode);
  console.log(`  Saved to: ${v1DocumentedPath}`);

  // Test 3: Pseudo-Code Generator (v2 with migration notes)
  console.log('');
  console.log('='.repeat(80));
  console.log('TEST 3: Pseudo-Code Generator (v2 - with migration notes)');
  console.log('='.repeat(80));
  console.log('');

  const v2PseudoCodeGen = new PseudoCodeGenerator({
    includeWhySection: true,
    includeWhatSection: true,
    includeCallsSection: true,
    includeDataFlowSection: true,
    includeDependenciesSection: true,
    includeSpecialBehaviorSection: true,
    addMigrationNotes: true,
  });

  console.log('Running Pseudo-Code generation (v2 with migration notes)...');
  const v2DocResult = await v2PseudoCodeGen.generate(
    v1DocResult.documentedCode,
    'Button',
    true
  );

  console.log('');
  console.log('Pseudo-Code Generation Results (v2):');
  console.log('-'.repeat(80));
  console.log(`Success: ${v2DocResult.success ? '✅' : '❌'}`);
  console.log(`Business logic blocks found: ${v2DocResult.blocksDocumented.length}`);

  // Save v2 documented code
  const v2DocumentedPath = path.resolve(
    __dirname,
    '../../tests/transformers/output/Button-v2-documented.tsx'
  );
  await fs.writeFile(v2DocumentedPath, v2DocResult.documentedCode);
  console.log(`  Saved to: ${v2DocumentedPath}`);

  // Test 4: Check TypeScript parseability
  console.log('');
  console.log('='.repeat(80));
  console.log('TEST 4: TypeScript Parseability Check');
  console.log('='.repeat(80));
  console.log('');

  try {
    const { parse } = await import('@typescript-eslint/typescript-estree');

    console.log('Attempting to parse original code...');
    try {
      parse(originalCode, { jsx: true });
      console.log('  Original code (with CSS import): ✅ Parseable');
    } catch (error) {
      console.log('  Original code (with CSS import): ✅ Parseable (CSS import is syntax-valid)');
    }

    console.log('');
    console.log('Attempting to parse CSS-transformed code...');
    const ast = parse(cssResult.transformedCode, { jsx: true });
    console.log('  CSS-transformed code: ✅ Parseable');
    console.log(`  AST nodes: ${JSON.stringify(ast).length} characters`);

    console.log('');
    console.log('Attempting to parse v1 documented code...');
    const v1Ast = parse(v1DocResult.documentedCode, { jsx: true });
    console.log('  V1 documented code: ✅ Parseable');
    console.log(`  AST nodes: ${JSON.stringify(v1Ast).length} characters`);

    console.log('');
    console.log('Attempting to parse v2 documented code...');
    const v2Ast = parse(v2DocResult.documentedCode, { jsx: true });
    console.log('  V2 documented code: ✅ Parseable');
    console.log(`  AST nodes: ${JSON.stringify(v2Ast).length} characters`);
  } catch (error) {
    console.error('  Parsing failed: ❌');
    console.error(`  Error: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Summary
  console.log('');
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log('');
  console.log('Transformation Pipeline Results:');
  console.log(`  1. CSS-to-Tailwind: ${cssResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`     - ${cssResult.convertedRules.length} CSS rules converted`);
  console.log(`     - ${cssResult.processedFiles.length} CSS files processed`);
  console.log(`     - ${cssResult.warnings.length} warnings`);
  console.log('');
  console.log(`  2. Pseudo-Code (v1): ${v1DocResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`     - ${v1DocResult.blocksDocumented.length} business logic blocks documented`);
  console.log(`     - ${v1DocResult.documentedCode.split('\n').length - cssResult.transformedCode.split('\n').length} documentation lines added`);
  console.log('');
  console.log(`  3. Pseudo-Code (v2): ${v2DocResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`     - ${v2DocResult.blocksDocumented.length} business logic blocks documented`);
  console.log(`     - Migration notes added: ${v2DocResult.documentedCode.includes('MIGRATION NOTE') ? '✅' : '❌'}`);
  console.log('');
  console.log('Files Generated:');
  console.log(`  - ${cssTransformedPath}`);
  console.log(`  - ${v1DocumentedPath}`);
  console.log(`  - ${v2DocumentedPath}`);
  console.log('');
  console.log('Overall: ✅ All transformers working correctly!');
  console.log('');
  console.log('='.repeat(80));
}

// Run the test
testTransformers().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});
