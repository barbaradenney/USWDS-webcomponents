#!/usr/bin/env node

/**
 * Cypress Test Pattern Validation
 *
 * Validates that Cypress E2E tests follow Storybook 9 + Lit architecture best practices.
 * Prevents regression to deprecated Storybook 6 patterns.
 *
 * Created: Session 8 - Phase 5 (2025-10-16)
 * Documentation: cypress/TESTING_BEST_PRACTICES.md
 *
 * Validates:
 * 1. No Storybook 6 URL patterns (/?path=/story/)
 * 2. No #storybook-root references (doesn't exist in Storybook 9)
 * 3. Warns about innerHTML on web components (usa-* elements)
 * 4. Validates use of Storybook 9 iframe pattern
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Validation patterns
const PATTERNS = {
  storybook6Url: {
    regex: /['"]\?path=\/story\//g,
    severity: 'error',
    message: 'Deprecated Storybook 6 URL pattern detected',
    fix: 'Use Storybook 9 iframe pattern: /iframe.html?id=component--story&viewMode=story',
    docs: 'See cypress/TESTING_BEST_PRACTICES.md#storybook-9-iframe-pattern',
  },
  storybookRoot: {
    regex: /#storybook-root/g,
    severity: 'error',
    message: '#storybook-root does not exist in Storybook 9',
    fix: 'Use cy.get("body") instead - components render directly in body',
    docs: 'See cypress/TESTING_BEST_PRACTICES.md#storybook-9-iframe-pattern',
  },
  innerHTMLOnWebComponent: {
    // Match: element.innerHTML = ... or doc.body.innerHTML = '<usa-...'
    // But allow: regularDiv.innerHTML = ... (regular HTML elements)
    regex: /(\.innerHTML\s*=\s*[`'"][\s\S]*?<usa-[\w-]+)|(\.(body|documentElement)\.innerHTML\s*=\s*[`'"][\s\S]*?<usa-[\w-]+)/g,
    severity: 'warning',
    message: 'innerHTML on web component may break Lit ChildPart tracking',
    fix: 'Use createElement() + appendChild() for web components (usa-* elements)',
    docs: 'See cypress/TESTING_BEST_PRACTICES.md#lit-and-innerhtml-constraints',
  },
  goodIframePattern: {
    regex: /\/iframe\.html\?id=/,
    severity: 'info',
    message: 'Using correct Storybook 9 iframe pattern',
  },
};

// Results tracking
const results = {
  errors: [],
  warnings: [],
  filesChecked: 0,
  filesWithIssues: 0,
  filesWithGoodPatterns: 0,
};

/**
 * Remove comments from TypeScript/JavaScript code
 */
function removeComments(content) {
  // Remove single-line comments
  let cleaned = content.replace(/\/\/.*$/gm, '');
  // Remove multi-line comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  return cleaned;
}

/**
 * Check if a file should be excluded from validation
 */
function shouldExcludeFile(filePath) {
  // Exclude regression test files that intentionally test old patterns
  const excludePatterns = [
    'storybook-navigation-regression.cy.ts', // Tests layout forcing with SB6 patterns
  ];

  return excludePatterns.some(pattern => filePath.includes(pattern));
}

/**
 * Validate a single test file
 */
function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(process.cwd(), filePath);
  const fileIssues = [];
  let hasGoodPattern = false;

  // Skip excluded files
  if (shouldExcludeFile(filePath)) {
    results.filesChecked++;
    return {
      hasIssues: false,
      hasGoodPattern: false,
      issues: [],
      excluded: true,
    };
  }

  // Remove comments for validation (but keep original for line numbers)
  const codeOnly = removeComments(content);

  // Check for good pattern (in full content, comments OK)
  if (PATTERNS.goodIframePattern.regex.test(content)) {
    hasGoodPattern = true;
    results.filesWithGoodPatterns++;
  }

  // Check each pattern (in code only, comments excluded)
  Object.entries(PATTERNS).forEach(([key, pattern]) => {
    if (pattern.severity === 'info') return; // Skip info patterns in issue checking

    const matches = [...codeOnly.matchAll(pattern.regex)];

    if (matches.length > 0) {
      matches.forEach((match) => {
        // Get line number from original content
        const beforeMatch = content.substring(0, content.indexOf(match[0]));
        const lines = beforeMatch.split('\n');
        const lineNumber = lines.length;
        const lineContent = lines[lines.length - 1] + match[0];

        fileIssues.push({
          severity: pattern.severity,
          pattern: key,
          message: pattern.message,
          fix: pattern.fix,
          docs: pattern.docs,
          line: lineNumber,
          content: lineContent.trim().substring(0, 100), // First 100 chars
        });
      });
    }
  });

  // Record results
  if (fileIssues.length > 0) {
    results.filesWithIssues++;

    fileIssues.forEach((issue) => {
      const entry = {
        file: relativePath,
        ...issue,
      };

      if (issue.severity === 'error') {
        results.errors.push(entry);
      } else if (issue.severity === 'warning') {
        results.warnings.push(entry);
      }
    });
  }

  results.filesChecked++;

  return {
    hasIssues: fileIssues.length > 0,
    hasGoodPattern,
    issues: fileIssues,
  };
}

/**
 * Print validation results
 */
function printResults() {
  console.log(`\n${colors.cyan}${colors.bold}Cypress Test Pattern Validation${colors.reset}\n`);

  // Summary
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Files checked: ${results.filesChecked}`);
  console.log(`  Files with good patterns: ${colors.green}${results.filesWithGoodPatterns}${colors.reset}`);
  console.log(`  Files with issues: ${results.filesWithIssues > 0 ? colors.yellow : colors.green}${results.filesWithIssues}${colors.reset}`);
  console.log(`  Errors: ${results.errors.length > 0 ? colors.red : colors.green}${results.errors.length}${colors.reset}`);
  console.log(`  Warnings: ${results.warnings.length > 0 ? colors.yellow : colors.green}${results.warnings.length}${colors.reset}`);
  console.log('');

  // Errors
  if (results.errors.length > 0) {
    console.log(`${colors.red}${colors.bold}❌ ERRORS (must fix):${colors.reset}\n`);

    results.errors.forEach((error, index) => {
      console.log(`${colors.red}${index + 1}. ${error.file}:${error.line}${colors.reset}`);
      console.log(`   ${colors.bold}Issue:${colors.reset} ${error.message}`);
      console.log(`   ${colors.bold}Pattern:${colors.reset} ${error.pattern}`);
      console.log(`   ${colors.bold}Code:${colors.reset} ${error.content}`);
      console.log(`   ${colors.bold}Fix:${colors.reset} ${error.fix}`);
      console.log(`   ${colors.bold}Docs:${colors.reset} ${error.docs}`);
      console.log('');
    });
  }

  // Warnings
  if (results.warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bold}⚠️  WARNINGS (review recommended):${colors.reset}\n`);

    results.warnings.forEach((warning, index) => {
      console.log(`${colors.yellow}${index + 1}. ${warning.file}:${warning.line}${colors.reset}`);
      console.log(`   ${colors.bold}Issue:${colors.reset} ${warning.message}`);
      console.log(`   ${colors.bold}Pattern:${colors.reset} ${warning.pattern}`);
      console.log(`   ${colors.bold}Code:${colors.reset} ${warning.content}`);
      console.log(`   ${colors.bold}Fix:${colors.reset} ${warning.fix}`);
      console.log(`   ${colors.bold}Docs:${colors.reset} ${warning.docs}`);
      console.log('');
    });
  }

  // Success
  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log(`${colors.green}${colors.bold}✅ All Cypress tests follow Storybook 9 + Lit best practices!${colors.reset}\n`);
  }

  // Documentation reference
  console.log(`${colors.cyan}📖 Documentation:${colors.reset} cypress/TESTING_BEST_PRACTICES.md`);
  console.log(`${colors.cyan}🔧 Custom Commands:${colors.reset} cypress/support/commands.ts`);
  console.log('');
}

/**
 * Main validation
 */
function main() {
  console.log(`${colors.cyan}Validating Cypress E2E test patterns...${colors.reset}`);

  // Find all Cypress E2E test files
  const testFiles = glob.sync('cypress/e2e/**/*.cy.{ts,js}', {
    cwd: process.cwd(),
    absolute: true,
  });

  if (testFiles.length === 0) {
    console.log(`${colors.yellow}⚠️  No Cypress E2E test files found${colors.reset}`);
    process.exit(0);
  }

  // Also check custom commands file
  const commandsFile = path.join(process.cwd(), 'cypress/support/commands.ts');
  if (fs.existsSync(commandsFile)) {
    testFiles.push(commandsFile);
  }

  // Validate each file
  testFiles.forEach((file) => {
    validateFile(file);
  });

  // Print results
  printResults();

  // Exit code
  // Errors fail the validation, warnings do not
  if (results.errors.length > 0) {
    console.log(`${colors.red}${colors.bold}❌ Validation failed - fix errors before committing${colors.reset}\n`);
    process.exit(1);
  } else if (results.warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bold}⚠️  Validation passed with warnings - review recommended${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.green}${colors.bold}✅ Validation passed - all patterns correct${colors.reset}\n`);
    process.exit(0);
  }
}

// Run validation
main();
