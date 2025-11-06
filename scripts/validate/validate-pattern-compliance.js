#!/usr/bin/env node

/**
 * Pattern Compliance Audit Script
 *
 * Audits all patterns to identify discrepancies with established standards.
 * This script checks:
 * - Component composition patterns (.options vs slotted content)
 * - Public API consistency (getData, setData, clear, validate methods)
 * - Event emission patterns (pattern-ready, pattern-*-change)
 * - Documentation existence (README.mdx)
 * - Test coverage
 * - USWDS component usage (no inline HTML duplication)
 * - Light DOM usage
 *
 * Usage: node scripts/validate/audit-pattern-compliance.js
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');
const PATTERNS_DIR = join(ROOT_DIR, 'packages/uswds-wc-patterns/src/patterns');

class PatternAuditor {
  constructor() {
    this.results = {};
    this.summary = {
      total: 0,
      compliant: 0,
      issues: 0,
    };
  }

  /**
   * Get all pattern directories
   */
  getPatterns() {
    return readdirSync(PATTERNS_DIR)
      .filter(name => {
        const path = join(PATTERNS_DIR, name);
        return existsSync(path) && readdirSync(path).some(f => f.endsWith('.ts'));
      });
  }

  /**
   * Audit a single pattern
   */
  auditPattern(patternName) {
    const patternDir = join(PATTERNS_DIR, patternName);
    const result = {
      name: patternName,
      issues: [],
      warnings: [],
      passed: [],
    };

    // Find main pattern file
    const files = readdirSync(patternDir);
    const mainFile = files.find(f => f.startsWith('usa-') && f.endsWith('-pattern.ts'));

    if (!mainFile) {
      result.issues.push('❌ No main pattern file found (usa-*-pattern.ts)');
      return result;
    }

    const filePath = join(patternDir, mainFile);
    const content = readFileSync(filePath, 'utf-8');
    const testFile = mainFile.replace('.ts', '.test.ts');
    const testPath = join(patternDir, testFile);
    const testContent = existsSync(testPath) ? readFileSync(testPath, 'utf-8') : '';

    // 1. Check component composition (CRITICAL)
    this.checkComposition(content, result);

    // 2. Check public API methods
    this.checkPublicAPI(content, result);

    // 3. Check event patterns
    this.checkEvents(content, result);

    // 4. Check documentation
    this.checkDocumentation(patternDir, result);

    // 5. Check test coverage
    this.checkTests(testContent, result);

    // 6. Check Light DOM usage
    this.checkLightDOM(content, result);

    // 7. Check USWDS component imports
    this.checkImports(content, result);

    return result;
  }

  /**
   * Check component composition patterns
   */
  checkComposition(content, result) {
    // Check for slotted content anti-pattern
    const slottedOptionPattern = /html`[^`]*<option[^>]*>[^<]*<\/option>[^`]*`/g;
    const hasSlottedOptions = slottedOptionPattern.test(content);

    if (hasSlottedOptions) {
      result.issues.push('❌ Uses slotted <option> elements instead of .options property');
      result.issues.push('   Fix: Use .options="${[...]}" property pattern');
    } else {
      result.passed.push('✅ Uses .options property (not slotted content)');
    }

    // Check for .options property usage
    const optionsPropertyPattern = /\.options="\${/;
    const hasOptionsProperty = optionsPropertyPattern.test(content);

    if (hasOptionsProperty) {
      result.passed.push('✅ Uses .options property pattern for selects');
    }

    // Check for inline component HTML duplication
    const inlineHTMLPatterns = [
      { pattern: /class="usa-input"[^>]*type="text"/, component: 'usa-text-input' },
      { pattern: /class="usa-select"/, component: 'usa-select' },
      { pattern: /class="usa-checkbox__input"/, component: 'usa-checkbox' },
      { pattern: /class="usa-radio__input"/, component: 'usa-radio' },
    ];

    inlineHTMLPatterns.forEach(({ pattern, component }) => {
      if (pattern.test(content)) {
        result.warnings.push(`⚠️  Possible inline HTML duplication (use <${component}> component)`);
      }
    });
  }

  /**
   * Check public API methods
   */
  checkPublicAPI(content, result) {
    const requiredMethods = [
      { name: 'get.*Data', description: 'getData() method' },
      { name: 'set.*Data', description: 'setData() method' },
      { name: 'clear', description: 'clear() method' },
      { name: 'validate', description: 'validate() method' },
    ];

    requiredMethods.forEach(({ name, description }) => {
      const pattern = new RegExp(`\\b${name}\\s*\\(`);
      if (pattern.test(content)) {
        result.passed.push(`✅ Has ${description}`);
      } else {
        result.warnings.push(`⚠️  Missing ${description}`);
      }
    });
  }

  /**
   * Check event emission patterns
   */
  checkEvents(content, result) {
    // Check for pattern-ready event
    if (content.includes('pattern-ready')) {
      result.passed.push('✅ Emits pattern-ready event');
    } else {
      result.warnings.push('⚠️  Missing pattern-ready event');
    }

    // Check for pattern-level change events
    const changeEventPattern = /pattern-.*-change/;
    if (changeEventPattern.test(content)) {
      result.passed.push('✅ Emits pattern-level change events');
    } else {
      result.warnings.push('⚠️  No pattern-level change events found');
    }
  }

  /**
   * Check documentation
   */
  checkDocumentation(patternDir, result) {
    const readmePath = join(patternDir, 'README.mdx');
    if (existsSync(readmePath)) {
      result.passed.push('✅ Has README.mdx documentation');
    } else {
      result.issues.push('❌ Missing README.mdx documentation');
    }
  }

  /**
   * Check test coverage
   */
  checkTests(testContent, result) {
    if (!testContent) {
      result.issues.push('❌ No test file found');
      return;
    }

    const testCategories = [
      { name: 'Pattern Initialization', required: true },
      { name: 'Public API', required: true },
      { name: 'Data Changes', required: true },
      { name: 'Pattern Composition', required: false },
      { name: 'Component Integration', required: false },
    ];

    testCategories.forEach(({ name, required }) => {
      if (testContent.includes(name)) {
        result.passed.push(`✅ Has ${name} tests`);
      } else if (required) {
        result.issues.push(`❌ Missing ${name} tests`);
      } else {
        result.warnings.push(`⚠️  Missing ${name} tests (recommended)`);
      }
    });
  }

  /**
   * Check Light DOM usage
   */
  checkLightDOM(content, result) {
    if (content.includes('createRenderRoot')) {
      result.passed.push('✅ Uses Light DOM (createRenderRoot)');
    } else {
      result.issues.push('❌ Missing Light DOM implementation');
    }
  }

  /**
   * Check component imports
   */
  checkImports(content, result) {
    // Check for proper component imports
    const componentImportPattern = /import.*from.*@uswds-wc/g;
    const imports = content.match(componentImportPattern);

    if (imports && imports.length > 0) {
      result.passed.push(`✅ Imports ${imports.length} USWDS component(s)`);
    } else {
      result.warnings.push('⚠️  No USWDS component imports found');
    }

    // Check for relative imports of components
    const relativeComponentPattern = /import.*from\s+['"]\.\.\/\.\./g;
    if (relativeComponentPattern.test(content)) {
      result.warnings.push('⚠️  Uses relative imports (prefer @uswds-wc package imports)');
    }
  }

  /**
   * Run audit on all patterns
   */
  async run() {
    console.log('🔍 Pattern Compliance Audit\n');
    console.log('Auditing patterns in:', PATTERNS_DIR);
    console.log('─'.repeat(80));

    const patterns = this.getPatterns();
    this.summary.total = patterns.length;

    for (const pattern of patterns) {
      const result = this.auditPattern(pattern);
      this.results[pattern] = result;

      // Determine if pattern is compliant
      const hasIssues = result.issues.length > 0;
      if (!hasIssues) {
        this.summary.compliant++;
      } else {
        this.summary.issues++;
      }
    }

    this.printResults();
  }

  /**
   * Print audit results
   */
  printResults() {
    console.log('\n📊 Audit Results:\n');

    Object.entries(this.results).forEach(([name, result]) => {
      const status = result.issues.length === 0 ? '✅' : '❌';
      console.log(`${status} ${name.toUpperCase()}`);
      console.log('─'.repeat(80));

      // Print issues first (most important)
      if (result.issues.length > 0) {
        console.log('\n  Issues:');
        result.issues.forEach(issue => console.log(`    ${issue}`));
      }

      // Then warnings
      if (result.warnings.length > 0) {
        console.log('\n  Warnings:');
        result.warnings.forEach(warning => console.log(`    ${warning}`));
      }

      // Then what's passing
      if (result.passed.length > 0) {
        console.log('\n  Passing:');
        result.passed.forEach(pass => console.log(`    ${pass}`));
      }

      console.log('\n');
    });

    // Summary
    console.log('═'.repeat(80));
    console.log('📈 Summary:');
    console.log(`   Total Patterns: ${this.summary.total}`);
    console.log(`   ✅ Compliant: ${this.summary.compliant}`);
    console.log(`   ❌ With Issues: ${this.summary.issues}`);
    console.log(`   Compliance Rate: ${Math.round((this.summary.compliant / this.summary.total) * 100)}%`);
    console.log('═'.repeat(80));

    // Exit code
    process.exit(this.summary.issues > 0 ? 1 : 0);
  }
}

// Run audit
const auditor = new PatternAuditor();
auditor.run().catch(error => {
  console.error('Audit failed:', error);
  process.exit(1);
});
