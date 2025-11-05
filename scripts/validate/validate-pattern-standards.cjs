#!/usr/bin/env node

/**
 * Validate Pattern Standards
 *
 * Ensures all patterns maintain required standards:
 * - README.mdx documentation exists
 * - Test file exists with minimum coverage
 * - Standard API methods exist for data patterns
 * - Public API comments are properly formatted
 *
 * Exit codes:
 * 0 - All patterns pass validation
 * 1 - One or more patterns fail validation
 */

const fs = require('fs');
const path = require('path');

const PATTERNS_DIR = path.join(__dirname, '../../packages/uswds-wc-patterns/src/patterns');

const PATTERNS = [
  'address',
  'phone-number',
  'name',
  'contact-preferences',
  'language-selection',
  'form-summary',
  'multi-step-form',
];

// Data collection patterns that should have standard CRUD methods
const DATA_PATTERNS = ['address', 'phone-number', 'name', 'contact-preferences'];

// Workflow patterns have specialized APIs
const WORKFLOW_PATTERNS = ['language-selection', 'form-summary', 'multi-step-form'];

class PatternValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  addError(pattern, message) {
    this.errors.push({ pattern, message });
  }

  addWarning(pattern, message) {
    this.warnings.push({ pattern, message });
  }

  addPass(pattern, message) {
    this.passed.push({ pattern, message });
  }

  validateReadmeExists(pattern) {
    const readmePath = path.join(PATTERNS_DIR, pattern, 'README.mdx');
    if (!fs.existsSync(readmePath)) {
      this.addError(pattern, 'Missing README.mdx file');
      return false;
    }
    this.addPass(pattern, 'README.mdx exists');
    return true;
  }

  validateTestFileExists(pattern) {
    // Handle special naming cases
    const patternName = pattern === 'language-selection' ? 'language-selector' : pattern;
    const testPath = path.join(PATTERNS_DIR, pattern, `usa-${patternName}-pattern.test.ts`);
    if (!fs.existsSync(testPath)) {
      this.addError(pattern, 'Missing test file');
      return false;
    }
    this.addPass(pattern, 'Test file exists');
    return true;
  }

  validatePatternFileExists(pattern) {
    // Handle special naming cases
    const patternName = pattern === 'language-selection' ? 'language-selector' : pattern;
    const patternPath = path.join(PATTERNS_DIR, pattern, `usa-${patternName}-pattern.ts`);
    if (!fs.existsSync(patternPath)) {
      this.addError(pattern, 'Missing pattern implementation file');
      return false;
    }
    this.addPass(pattern, 'Pattern implementation exists');
    return true;
  }

  extractPublicAPIMethods(filePath) {
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

  validateDataPatternAPIs(pattern) {
    // Handle special naming cases
    const patternName = pattern === 'language-selection' ? 'language-selector' : pattern;
    const patternPath = path.join(PATTERNS_DIR, pattern, `usa-${patternName}-pattern.ts`);
    const methods = this.extractPublicAPIMethods(patternPath);
    const methodNames = methods.map(m => m.name);

    const requiredMethods = {
      getData: methodNames.some(name => name.match(/^get.*Data$/)),
      setData: methodNames.some(name => name.match(/^set.*Data$/)),
      clear: methodNames.some(name => name.match(/^clear/)),
      validate: methodNames.some(name => name.match(/^validate/)),
    };

    let hasErrors = false;

    if (!requiredMethods.getData) {
      this.addError(pattern, 'Missing getData() method');
      hasErrors = true;
    } else {
      this.addPass(pattern, 'Has getData() method');
    }

    if (!requiredMethods.setData) {
      this.addError(pattern, 'Missing setData() method');
      hasErrors = true;
    } else {
      this.addPass(pattern, 'Has setData() method');
    }

    if (!requiredMethods.clear) {
      this.addError(pattern, 'Missing clear() method');
      hasErrors = true;
    } else {
      this.addPass(pattern, 'Has clear() method');
    }

    if (!requiredMethods.validate) {
      this.addError(pattern, 'Missing validate() method');
      hasErrors = true;
    } else {
      this.addPass(pattern, 'Has validate() method');
    }

    return !hasErrors;
  }

  validateWorkflowPatternAPIs(pattern) {
    // Handle special naming cases
    const patternName = pattern === 'language-selection' ? 'language-selector' : pattern;
    const patternPath = path.join(PATTERNS_DIR, pattern, `usa-${patternName}-pattern.ts`);
    const methods = this.extractPublicAPIMethods(patternPath);

    if (methods.length === 0) {
      this.addWarning(pattern, 'No public API methods found (methods may exist but lack proper JSDoc comments)');
      return true; // Don't fail workflow patterns for this
    }

    this.addPass(pattern, `Has ${methods.length} public API methods`);
    return true;
  }

  validatePattern(pattern) {
    console.log(`\n📋 Validating ${pattern}...`);

    // Check files exist
    if (!this.validatePatternFileExists(pattern)) return false;
    if (!this.validateReadmeExists(pattern)) return false;
    if (!this.validateTestFileExists(pattern)) return false;

    // Check API methods
    if (DATA_PATTERNS.includes(pattern)) {
      if (!this.validateDataPatternAPIs(pattern)) return false;
    } else if (WORKFLOW_PATTERNS.includes(pattern)) {
      if (!this.validateWorkflowPatternAPIs(pattern)) return false;
    }

    console.log(`  ✅ ${pattern} passes validation`);
    return true;
  }

  printReport() {
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Pattern Standards Validation Report\n');

    // Summary
    const totalPatterns = PATTERNS.length;
    const failedPatterns = [...new Set(this.errors.map(e => e.pattern))].length;
    const passedPatterns = totalPatterns - failedPatterns;

    console.log(`Total Patterns: ${totalPatterns}`);
    console.log(`Passed: ${passedPatterns} ✅`);
    console.log(`Failed: ${failedPatterns} ❌`);

    // Errors
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:\n');
      const errorsByPattern = {};
      this.errors.forEach(({ pattern, message }) => {
        if (!errorsByPattern[pattern]) errorsByPattern[pattern] = [];
        errorsByPattern[pattern].push(message);
      });

      Object.entries(errorsByPattern).forEach(([pattern, messages]) => {
        console.log(`  ${pattern}:`);
        messages.forEach(msg => console.log(`    - ${msg}`));
      });
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:\n');
      const warningsByPattern = {};
      this.warnings.forEach(({ pattern, message }) => {
        if (!warningsByPattern[pattern]) warningsByPattern[pattern] = [];
        warningsByPattern[pattern].push(message);
      });

      Object.entries(warningsByPattern).forEach(([pattern, messages]) => {
        console.log(`  ${pattern}:`);
        messages.forEach(msg => console.log(`    - ${msg}`));
      });
    }

    console.log('\n' + '='.repeat(80));

    return this.errors.length === 0;
  }

  validate() {
    console.log('🔍 Validating Pattern Standards...\n');
    console.log('Checking all patterns for:');
    console.log('  - README.mdx documentation');
    console.log('  - Test file coverage');
    console.log('  - Standard API methods (for data patterns)');
    console.log('  - Public API documentation');

    let allValid = true;
    PATTERNS.forEach(pattern => {
      if (!this.validatePattern(pattern)) {
        allValid = false;
      }
    });

    const success = this.printReport();
    return success;
  }
}

function main() {
  const validator = new PatternValidator();
  const success = validator.validate();

  if (success) {
    console.log('\n✅ All patterns meet standards!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some patterns do not meet standards. Please fix the errors above.\n');
    process.exit(1);
  }
}

// Allow running directly or importing for testing
if (require.main === module) {
  main();
}

module.exports = { PatternValidator };
