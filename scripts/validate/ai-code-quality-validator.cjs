#!/usr/bin/env node

/**
 * AI Code Quality Validator
 *
 * Detects common AI code generation anti-patterns that human developers dislike.
 * Enforces clean, efficient code before commit.
 *
 * Common AI Issues Detected:
 * 1. Console.log statements left in
 * 2. Generic error messages
 * 3. Memory leaks (event listeners, timers without cleanup)
 * 4. Overly verbose variable names
 * 5. Magic numbers without constants
 * 6. TODO comments without issue references
 * 7. Copy-paste duplication
 * 8. Over-engineering simple solutions
 * 9. Deeply nested code
 * 10. Inefficient array/string operations
 * 11. Inconsistent error handling
 *
 * Note: Comment quality is subjective and context-dependent, so comment
 * checking has been removed. Focus is on actual code issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI Anti-Pattern Detection Rules
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const AI_ANTI_PATTERNS = {
  // Overly verbose variable names (AI loves these)
  verboseNames: {
    severity: 'warning',
    patterns: [
      { regex: /const (get|set|is|has|should|will|can)[A-Z][a-zA-Z]{20,}/g, message: 'Overly verbose name (>20 chars)' },
      { regex: /function (get|set|is|has|should|will|can)[A-Z][a-zA-Z]{25,}/g, message: 'Overly verbose function name' },
    ],
  },

  // Console.log statements (debugging leftovers)
  debugStatements: {
    severity: 'error',
    patterns: [
      { regex: /console\.log\(/g, message: 'Remove console.log before commit' },
      { regex: /console\.debug\(/g, message: 'Remove console.debug before commit' },
      { regex: /console\.dir\(/g, message: 'Remove console.dir before commit' },
      { regex: /debugger;/g, message: 'Remove debugger statement before commit' },
    ],
    exceptions: [
      /console\.(error|warn)\(/, // Allow error and warn
      /\/\/ TODO: remove console\.log/, // Documented TODO
    ],
  },

  // Generic error messages (AI default)
  genericErrors: {
    severity: 'warning',
    patterns: [
      { regex: /throw new Error\(['"]Error['"]\)/g, message: 'Generic error message' },
      { regex: /throw new Error\(['"]An error occurred['"]\)/g, message: 'Generic error message' },
      { regex: /throw new Error\(['"]Something went wrong['"]\)/g, message: 'Generic error message' },
      { regex: /catch \(e\) \{\s*\}/g, message: 'Empty catch block' },
      { regex: /catch \(error\) \{\s*\}/g, message: 'Empty catch block' },
    ],
  },

  // Magic numbers without constants
  magicNumbers: {
    severity: 'warning',
    patterns: [
      { regex: /setTimeout\([^,]+,\s*(\d{4,})\)/g, message: 'Magic number in setTimeout - use named constant' },
      { regex: /\w+\s*===\s*(\d{3,})/g, message: 'Magic number comparison - use named constant' },
      { regex: /\[\s*(\d{2,})\s*\]/g, message: 'Magic array index - consider named constant' },
    ],
    exceptions: [
      /0/, /1/, /2/, /100/, /1000/, // Common numbers
      /-1/, // Common return value
    ],
  },

  // TODO comments without issue tracking
  todoComments: {
    severity: 'warning',
    patterns: [
      { regex: /\/\/ TODO(?!:.*#\d+)(?!:.*http)/gi, message: 'TODO without issue reference' },
      { regex: /\/\/ FIXME(?!:.*#\d+)(?!:.*http)/gi, message: 'FIXME without issue reference' },
      { regex: /\/\/ HACK(?!:.*#\d+)(?!:.*http)/gi, message: 'HACK without issue reference' },
    ],
  },

  // Over-engineering indicators
  overEngineering: {
    severity: 'warning',
    patterns: [
      { regex: /class.*Factory.*\{[\s\S]{0,200}\}/g, message: 'Unnecessary factory pattern for simple object' },
      { regex: /interface I[A-Z]\w+\s*\{[\s\S]{0,100}\}/g, message: 'Consider if interface is needed (Hungarian notation)' },
      { regex: /abstract class.*\{[\s\S]{0,200}\}/g, message: 'Consider if abstract class is needed' },
    ],
  },

  // Deeply nested code (AI loves nesting)
  deepNesting: {
    severity: 'warning',
    patterns: [
      { regex: /\{\s*if.*\{\s*if.*\{\s*if.*\{/g, message: '4+ levels of nesting - refactor' },
      { regex: /\{\s*for.*\{\s*for.*\{\s*for/g, message: 'Triple nested loops - consider refactoring' },
    ],
  },

  // Unnecessary early returns
  unnecessaryReturns: {
    severity: 'info',
    patterns: [
      { regex: /if \(.+\) \{\s*return true;\s*\}\s*return false;/g, message: 'Simplify: return (condition)' },
      { regex: /if \(.+\) \{\s*return false;\s*\}\s*return true;/g, message: 'Simplify: return !(condition)' },
    ],
  },

  // Copy-paste duplication indicators
  duplication: {
    severity: 'warning',
    patterns: [
      { regex: /(function|const) (\w+)1\s*=/g, message: 'Numbered variable suggests duplication (foo1, foo2)' },
      { regex: /(function|const) (\w+)2\s*=/g, message: 'Numbered variable suggests duplication' },
    ],
    exceptions: [
      /const value1 =/, // Legitimate in comparison functions
      /const value2 =/, // Legitimate in comparison functions
      /const item1 =/,  // Legitimate in comparison functions
      /const item2 =/,  // Legitimate in comparison functions
    ],
  },

  // Inconsistent error handling
  inconsistentErrors: {
    severity: 'info',
    patterns: [
      { regex: /catch \(\w+\) \{\s*console\.error/g, message: 'Mix of error handling styles - be consistent' },
      { regex: /catch \(\w+\) \{\s*return;/g, message: 'Silent error - consider logging or re-throwing' },
    ],
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Efficiency Patterns
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const EFFICIENCY_PATTERNS = {
  // Inefficient string operations
  inefficientStrings: {
    severity: 'warning',
    patterns: [
      { regex: /\+=.*['"`]/g, message: 'String concatenation in loop - use array.join()' },
      { regex: /str\.replace\([^,]+,[^)]+\)\.replace\(/g, message: 'Multiple replace() calls - use regex or single pass' },
    ],
  },

  // Inefficient array operations
  inefficientArrays: {
    severity: 'warning',
    patterns: [
      { regex: /\.filter\([^)]+\)\.map\(/g, message: 'filter().map() - consider reduce() or single pass' },
      { regex: /\.map\([^)]+\)\.filter\(/g, message: 'map().filter() - consider reduce() or single pass' },
      { regex: /indexOf.*>.*-1/g, message: 'Use .includes() instead of indexOf()' },
      { regex: /\.length === 0/g, message: 'Consider using !array.length' },
    ],
  },

  // Memory leak indicators
  memoryLeaks: {
    severity: 'error',
    patterns: [
      { regex: /addEventListener\([^)]+\)(?![\s\S]{0,500}removeEventListener)/g, message: 'addEventListener without cleanup' },
      { regex: /setInterval\([^)]+\)(?![\s\S]{0,500}clearInterval)/g, message: 'setInterval without cleanup' },
      { regex: /setTimeout\([^)]+\)(?![\s\S]{0,500}clearTimeout)/g, message: 'setTimeout without cleanup consideration' },
    ],
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Validator Class
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AICodeQualityValidator {
  constructor() {
    this.issues = {
      error: [],
      warning: [],
      info: [],
    };
    this.filesChecked = 0;
  }

  /**
   * Get staged TypeScript/JavaScript files
   */
  getStagedFiles() {
    try {
      const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' });
      return staged
        .split('\n')
        .filter(f => f.match(/\.(ts|js|tsx|jsx)$/) && !f.includes('.test.') && !f.includes('.cy.') && !f.includes('.spec.') && !f.includes('.stories.'))
        .filter(f => !f.startsWith('scripts/')) // Exclude CLI scripts (legitimate console output)
        .filter(f => !f.includes('.setup.')) // Exclude test setup files (legitimate setTimeout for infrastructure)
        .filter(f => fs.existsSync(f));
    } catch (e) {
      return [];
    }
  }

  /**
   * Check if pattern matches exception
   */
  matchesException(line, exceptions) {
    if (!exceptions) return false;
    return exceptions.some(exp => exp.test(line));
  }

  /**
   * Validate a file for AI anti-patterns
   */
  validateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const fileIssues = [];

    // Check AI anti-patterns
    for (const [category, config] of Object.entries(AI_ANTI_PATTERNS)) {
      // Memory leak patterns need full file context (multi-line analysis)
      if (category === 'memoryLeaks') {
        for (const pattern of config.patterns) {
          // Find all addEventListener/setInterval/setTimeout
          const regex = new RegExp(pattern.regex.source, 'g');
          let match;
          while ((match = regex.exec(content)) !== null) {
            const matchPos = match.index;
            const beforeMatch = content.substring(0, matchPos);
            const afterMatch = content.substring(matchPos);

            // Check if cleanup exists within reasonable scope
            const hasCleanup = /removeEventListener|clearInterval|clearTimeout/.test(afterMatch.substring(0, 1000));

            // Check if inside a function that returns cleanup
            const inCleanupFunction = /return\s*\(\s*\)\s*=>\s*\{[\s\S]{0,500}(removeEventListener|clearInterval|clearTimeout)/.test(afterMatch.substring(0, 1000));

            if (!hasCleanup && !inCleanupFunction) {
              const lineNumber = beforeMatch.split('\n').length;
              fileIssues.push({
                file: filePath,
                line: lineNumber,
                severity: config.severity,
                category,
                message: pattern.message,
                code: lines[lineNumber - 1]?.trim(),
              });
            }
          }
        }
      } else {
        // Other patterns check line-by-line
        for (const pattern of config.patterns) {
          lines.forEach((line, index) => {
            // Skip if matches exception
            if (this.matchesException(line, config.exceptions)) {
              return;
            }

            const matches = line.match(pattern.regex);
            if (matches) {
              fileIssues.push({
                file: filePath,
                line: index + 1,
                severity: config.severity,
                category,
                message: pattern.message,
                code: line.trim(),
              });
            }
          });
        }
      }
    }

    // Check efficiency patterns
    for (const [category, config] of Object.entries(EFFICIENCY_PATTERNS)) {
      for (const pattern of config.patterns) {
        lines.forEach((line, index) => {
          const matches = line.match(pattern.regex);
          if (matches) {
            fileIssues.push({
              file: filePath,
              line: index + 1,
              severity: config.severity,
              category,
              message: pattern.message,
              code: line.trim(),
            });
          }
        });
      }
    }

    return fileIssues;
  }

  /**
   * Run validation on all staged files
   */
  validate() {
    const files = this.getStagedFiles();

    if (files.length === 0) {
      return { hasIssues: false, summary: 'No TypeScript/JavaScript files to validate' };
    }

    this.filesChecked = files.length;

    files.forEach(file => {
      const issues = this.validateFile(file);
      issues.forEach(issue => {
        this.issues[issue.severity].push(issue);
      });
    });

    return {
      hasIssues: this.issues.error.length > 0 || this.issues.warning.length > 0,
      hasErrors: this.issues.error.length > 0,
      summary: this.generateSummary(),
    };
  }

  /**
   * Generate validation summary
   */
  generateSummary() {
    const total = this.issues.error.length + this.issues.warning.length + this.issues.info.length;

    if (total === 0) {
      return `✅ ${this.filesChecked} file(s) checked - No AI code quality issues found`;
    }

    let summary = `\n🤖 AI Code Quality Issues Found:\n\n`;
    summary += `Files checked: ${this.filesChecked}\n`;
    summary += `Errors: ${this.issues.error.length}\n`;
    summary += `Warnings: ${this.issues.warning.length}\n`;
    summary += `Info: ${this.issues.info.length}\n\n`;

    // Group by file
    const byFile = {};
    ['error', 'warning', 'info'].forEach(severity => {
      this.issues[severity].forEach(issue => {
        if (!byFile[issue.file]) byFile[issue.file] = [];
        byFile[issue.file].push({ ...issue, severity });
      });
    });

    // Report by file
    Object.entries(byFile).forEach(([file, issues]) => {
      summary += `📄 ${file}\n`;
      issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        summary += `   ${icon} Line ${issue.line}: ${issue.message}\n`;
        summary += `      ${issue.code.substring(0, 80)}${issue.code.length > 80 ? '...' : ''}\n`;
      });
      summary += '\n';
    });

    return summary;
  }

  /**
   * Print report
   */
  printReport() {
    console.log(this.generateSummary());

    if (this.issues.error.length > 0) {
      console.log('\n❌ Commit blocked due to code quality errors');
      console.log('\n💡 Common fixes:');
      console.log('   • Remove console.log() statements');
      console.log('   • Clean up debugging code');
      console.log('   • Add error handling to event listeners');
      console.log('   • Add cleanup to timers');
      console.log('\n📖 See: docs/AI_CODE_QUALITY_GUIDE.md\n');
    } else if (this.issues.warning.length > 0) {
      console.log('\n⚠️  Code quality warnings - consider addressing before commit');
      console.log('\n💡 To bypass warnings: AI_QUALITY_STRICT=0 git commit\n');
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Execution
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function main() {
  const strict = process.env.AI_QUALITY_STRICT !== '0';
  const validator = new AICodeQualityValidator();

  console.log('🤖 Validating AI Code Quality...\n');

  const result = validator.validate();

  if (!result.hasIssues) {
    console.log(result.summary);
    return 0;
  }

  validator.printReport();

  // Errors always block
  if (result.hasErrors) {
    return 1;
  }

  // Warnings block in strict mode
  if (strict && result.hasIssues) {
    return 1;
  }

  return 0;
}

if (require.main === module) {
  try {
    process.exit(main());
  } catch (error) {
    console.error('❌ Validation error:', error.message);
    process.exit(1);
  }
}

module.exports = { AICodeQualityValidator, AI_ANTI_PATTERNS, EFFICIENCY_PATTERNS };
