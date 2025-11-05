#!/usr/bin/env node

/**
 * Analyze Pattern APIs
 *
 * Extracts and compares public API methods across all patterns
 * to identify inconsistencies and missing standard methods.
 */

const fs = require('fs');
const path = require('path');

const PATTERNS_DIR = path.join(__dirname, '../packages/uswds-wc-patterns/src/patterns');

const PATTERNS = [
  'address',
  'phone-number',
  'name',
  'contact-preferences',
  'language-selection',
  'form-summary',
  'multi-step-form',
];

// Standard API methods that should exist on all data collection patterns
const STANDARD_DATA_PATTERN_METHODS = [
  'getData',      // Get current data
  'setData',      // Set data
  'clear',        // Clear data
  'validate',     // Validate data (if required)
];

function extractPublicAPIMethods(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const methods = [];

  // Match Public API comments and the method that follows
  const regex = /\/\*\*\s*\n\s*\*\s*Public API:([^\n]+)\n(?:[^*]|\*(?!\/))*\*\/\s*\n\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    const description = match[1].trim();
    const methodName = match[2];
    methods.push({ name: methodName, description });
  }

  return methods;
}

function analyzePattern(patternName) {
  const fileName = `usa-${patternName}-pattern.ts`;
  const filePath = path.join(PATTERNS_DIR, patternName, fileName);

  if (!fs.existsSync(filePath)) {
    return { name: patternName, error: 'File not found', methods: [] };
  }

  const methods = extractPublicAPIMethods(filePath);

  return {
    name: patternName,
    methods,
    hasGetData: methods.some(m => m.name.match(/^get.*Data$/)),
    hasSetData: methods.some(m => m.name.match(/^set.*Data$/)),
    hasClear: methods.some(m => m.name.match(/^clear/)),
    hasValidate: methods.some(m => m.name.match(/^validate/)),
  };
}

function main() {
  console.log('📊 Pattern Public API Analysis\n');
  console.log('=' .repeat(80));
  console.log('\n');

  const analyses = PATTERNS.map(analyzePattern);

  // Print detailed methods for each pattern
  analyses.forEach(analysis => {
    console.log(`\n### ${analysis.name}`);
    console.log(`Methods: ${analysis.methods.length}`);

    if (analysis.methods.length > 0) {
      analysis.methods.forEach(method => {
        console.log(`  - ${method.name}() - ${method.description}`);
      });
    } else {
      console.log('  (No public API methods found)');
    }
  });

  // Print compliance table
  console.log('\n\n' + '='.repeat(80));
  console.log('\n📋 Standard API Method Compliance\n');
  console.log('Pattern                   | getData | setData | clear | validate');
  console.log('--------------------------|---------|---------|-------|----------');

  analyses.forEach(analysis => {
    const name = analysis.name.padEnd(25);
    const getData = analysis.hasGetData ? '   ✅   ' : '   ❌   ';
    const setData = analysis.hasSetData ? '   ✅   ' : '   ❌   ';
    const clear = analysis.hasClear ? '  ✅   ' : '  ❌   ';
    const validate = analysis.hasValidate ? '    ✅    ' : '    ❌    ';

    console.log(`${name}|${getData}|${setData}|${clear}|${validate}`);
  });

  // Summary statistics
  console.log('\n' + '='.repeat(80));
  console.log('\n📈 Summary Statistics\n');

  const totalPatterns = analyses.length;
  const compliance = {
    getData: analyses.filter(a => a.hasGetData).length,
    setData: analyses.filter(a => a.hasSetData).length,
    clear: analyses.filter(a => a.hasClear).length,
    validate: analyses.filter(a => a.hasValidate).length,
  };

  console.log(`Total Patterns: ${totalPatterns}`);
  console.log(`\nMethod Coverage:`);
  console.log(`  getData():   ${compliance.getData}/${totalPatterns} (${Math.round(compliance.getData / totalPatterns * 100)}%)`);
  console.log(`  setData():   ${compliance.setData}/${totalPatterns} (${Math.round(compliance.setData / totalPatterns * 100)}%)`);
  console.log(`  clear():     ${compliance.clear}/${totalPatterns} (${Math.round(compliance.clear / totalPatterns * 100)}%)`);
  console.log(`  validate():  ${compliance.validate}/${totalPatterns} (${Math.round(compliance.validate / totalPatterns * 100)}%)`);

  // Recommendations
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 Recommendations\n');

  const patternsNeedingStandardization = analyses.filter(a =>
    !a.hasGetData || !a.hasSetData || !a.hasClear || !a.hasValidate
  );

  if (patternsNeedingStandardization.length > 0) {
    console.log('The following patterns need API standardization:\n');

    patternsNeedingStandardization.forEach(analysis => {
      const missing = [];
      if (!analysis.hasGetData) missing.push('getData()');
      if (!analysis.hasSetData) missing.push('setData()');
      if (!analysis.hasClear) missing.push('clear()');
      if (!analysis.hasValidate) missing.push('validate()');

      console.log(`  ${analysis.name}:`);
      console.log(`    Missing: ${missing.join(', ')}`);
      console.log(`    Has: ${analysis.methods.map(m => m.name + '()').join(', ')}`);
      console.log('');
    });
  } else {
    console.log('✅ All patterns have standardized API methods!');
  }

  console.log('\n' + '='.repeat(80));
}

main();
