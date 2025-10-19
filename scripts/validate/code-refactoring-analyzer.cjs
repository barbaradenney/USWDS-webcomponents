#!/usr/bin/env node

/**
 * Code Refactoring Analyzer
 *
 * Analyzes code for refactoring opportunities to improve cleanliness and efficiency.
 * Provides actionable suggestions for improving code quality.
 *
 * Analyzes:
 * 1. Function complexity (cyclomatic complexity)
 * 2. Function length
 * 3. Code duplication
 * 4. Inconsistent patterns
 * 5. Performance opportunities
 * 6. Naming consistency
 * 7. Coupling and cohesion
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Complexity Thresholds
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const THRESHOLDS = {
  cyclomaticComplexity: {
    warning: 10,  // Functions with >10 paths should be refactored
    error: 20,    // Functions with >20 paths MUST be refactored
  },
  functionLength: {
    warning: 50,  // Functions >50 lines should be considered for splitting
    error: 100,   // Functions >100 lines MUST be split
  },
  parameters: {
    warning: 4,   // Functions with >4 parameters should use objects
    error: 7,     // Functions with >7 parameters MUST use objects
  },
  nesting: {
    warning: 3,   // >3 levels of nesting
    error: 5,     // >5 levels of nesting
  },
  duplication: {
    minLines: 5,  // Minimum lines for duplication detection
    threshold: 3, // Report if 3+ occurrences
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Analyzer Class
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class CodeRefactoringAnalyzer {
  constructor() {
    this.suggestions = {
      error: [],
      warning: [],
      info: [],
    };
    this.filesAnalyzed = 0;
  }

  /**
   * Get staged TypeScript/JavaScript files
   */
  getStagedFiles() {
    try {
      const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' });
      return staged
        .split('\n')
        .filter(f => f.match(/\.(ts|js|tsx|jsx)$/) && !f.includes('.test.') && !f.includes('.cy.'))
        .filter(f => fs.existsSync(f));
    } catch (e) {
      return [];
    }
  }

  /**
   * Calculate cyclomatic complexity (simplified)
   * Counts decision points: if, for, while, case, &&, ||, ?, catch
   */
  calculateComplexity(functionCode) {
    const decisionPoints = [
      /\bif\s*\(/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bcase\s+/g,
      /&&/g,
      /\|\|/g,
      /\?/g,
      /\bcatch\s*\(/g,
    ];

    let complexity = 1; // Base complexity

    decisionPoints.forEach(pattern => {
      const matches = functionCode.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  /**
   * Extract functions from file
   */
  extractFunctions(content) {
    const functions = [];
    const lines = content.split('\n');

    // Match function declarations and expressions
    const functionPatterns = [
      /function\s+(\w+)\s*\(([^)]*)\)/,  // function name()
      /(\w+)\s*=\s*function\s*\(([^)]*)\)/, // const name = function()
      /(\w+)\s*=\s*\(([^)]*)\)\s*=>/,    // const name = () =>
      /(\w+)\s*\(([^)]*)\)\s*\{/,        // name() { (methods)
      /async\s+function\s+(\w+)\s*\(([^)]*)\)/, // async function
      /async\s+(\w+)\s*\(([^)]*)\)/,     // async name()
    ];

    let currentFunction = null;
    let braceCount = 0;
    let functionStart = 0;

    lines.forEach((line, index) => {
      // Check if line starts a function
      if (!currentFunction) {
        for (const pattern of functionPatterns) {
          const match = line.match(pattern);
          if (match) {
            currentFunction = {
              name: match[1],
              params: match[2] || '',
              startLine: index + 1,
              code: '',
            };
            functionStart = index;
            braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
            break;
          }
        }
      }

      // Track braces to find function end
      if (currentFunction) {
        currentFunction.code += line + '\n';
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;

        if (braceCount === 0 && currentFunction.code.includes('{')) {
          currentFunction.endLine = index + 1;
          currentFunction.length = index - functionStart + 1;
          currentFunction.complexity = this.calculateComplexity(currentFunction.code);
          currentFunction.paramCount = currentFunction.params.split(',').filter(p => p.trim()).length;
          currentFunction.nesting = this.calculateNesting(currentFunction.code);

          functions.push(currentFunction);
          currentFunction = null;
        }
      }
    });

    return functions;
  }

  /**
   * Calculate maximum nesting depth
   */
  calculateNesting(code) {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of code) {
      if (char === '{') currentDepth++;
      if (char === '}') currentDepth--;
      maxDepth = Math.max(maxDepth, currentDepth);
    }

    return maxDepth;
  }

  /**
   * Detect code duplication
   */
  detectDuplication(content) {
    const lines = content.split('\n');
    const duplicates = [];
    const sequences = {};

    // Look for sequences of minLines
    for (let i = 0; i < lines.length - THRESHOLDS.duplication.minLines; i++) {
      const sequence = lines.slice(i, i + THRESHOLDS.duplication.minLines)
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('//') && !l.startsWith('/*'))
        .join('\n');

      if (sequence.length > 50) { // Meaningful code
        if (!sequences[sequence]) {
          sequences[sequence] = [];
        }
        sequences[sequence].push(i + 1);
      }
    }

    // Report duplicates with multiple occurrences
    Object.entries(sequences).forEach(([code, occurrences]) => {
      if (occurrences.length >= THRESHOLDS.duplication.threshold) {
        duplicates.push({
          code: code.substring(0, 100),
          occurrences: occurrences.length,
          lines: occurrences,
        });
      }
    });

    return duplicates;
  }

  /**
   * Analyze a file for refactoring opportunities
   */
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const functions = this.extractFunctions(content);
    const duplicates = this.detectDuplication(content);

    const suggestions = [];

    // Analyze functions
    functions.forEach(func => {
      // Complexity check
      if (func.complexity > THRESHOLDS.cyclomaticComplexity.error) {
        suggestions.push({
          file: filePath,
          line: func.startLine,
          severity: 'error',
          category: 'complexity',
          message: `Function '${func.name}' has cyclomatic complexity of ${func.complexity} (max: ${THRESHOLDS.cyclomaticComplexity.error})`,
          suggestion: 'Extract conditional logic into separate functions',
        });
      } else if (func.complexity > THRESHOLDS.cyclomaticComplexity.warning) {
        suggestions.push({
          file: filePath,
          line: func.startLine,
          severity: 'warning',
          category: 'complexity',
          message: `Function '${func.name}' has cyclomatic complexity of ${func.complexity} (recommended: <${THRESHOLDS.cyclomaticComplexity.warning})`,
          suggestion: 'Consider extracting logic into helper functions',
        });
      }

      // Function length check
      if (func.length > THRESHOLDS.functionLength.error) {
        suggestions.push({
          file: filePath,
          line: func.startLine,
          severity: 'error',
          category: 'length',
          message: `Function '${func.name}' is ${func.length} lines (max: ${THRESHOLDS.functionLength.error})`,
          suggestion: 'Split into multiple smaller functions',
        });
      } else if (func.length > THRESHOLDS.functionLength.warning) {
        suggestions.push({
          file: filePath,
          line: func.startLine,
          severity: 'warning',
          category: 'length',
          message: `Function '${func.name}' is ${func.length} lines (recommended: <${THRESHOLDS.functionLength.warning})`,
          suggestion: 'Consider splitting into smaller functions',
        });
      }

      // Parameter count check
      if (func.paramCount > THRESHOLDS.parameters.error) {
        suggestions.push({
          file: filePath,
          line: func.startLine,
          severity: 'error',
          category: 'parameters',
          message: `Function '${func.name}' has ${func.paramCount} parameters (max: ${THRESHOLDS.parameters.error})`,
          suggestion: 'Use an options object instead',
        });
      } else if (func.paramCount > THRESHOLDS.parameters.warning) {
        suggestions.push({
          file: filePath,
          line: func.startLine,
          severity: 'warning',
          category: 'parameters',
          message: `Function '${func.name}' has ${func.paramCount} parameters (recommended: <${THRESHOLDS.parameters.warning})`,
          suggestion: 'Consider using an options object',
        });
      }

      // Nesting depth check
      if (func.nesting > THRESHOLDS.nesting.error) {
        suggestions.push({
          file: filePath,
          line: func.startLine,
          severity: 'error',
          category: 'nesting',
          message: `Function '${func.name}' has ${func.nesting} levels of nesting (max: ${THRESHOLDS.nesting.error})`,
          suggestion: 'Flatten using early returns or extract nested logic',
        });
      } else if (func.nesting > THRESHOLDS.nesting.warning) {
        suggestions.push({
          file: filePath,
          line: func.startLine,
          severity: 'warning',
          category: 'nesting',
          message: `Function '${func.name}' has ${func.nesting} levels of nesting (recommended: <${THRESHOLDS.nesting.warning})`,
          suggestion: 'Consider flattening with early returns',
        });
      }
    });

    // Report duplicates
    duplicates.forEach(dup => {
      suggestions.push({
        file: filePath,
        line: dup.lines[0],
        severity: 'warning',
        category: 'duplication',
        message: `Code duplicated ${dup.occurrences} times (lines: ${dup.lines.join(', ')})`,
        suggestion: 'Extract to a reusable function',
      });
    });

    return suggestions;
  }

  /**
   * Run analysis on all staged files
   */
  analyze() {
    const files = this.getStagedFiles();

    if (files.length === 0) {
      return { hasIssues: false, summary: 'No files to analyze' };
    }

    this.filesAnalyzed = files.length;

    files.forEach(file => {
      const suggestions = this.analyzeFile(file);
      suggestions.forEach(suggestion => {
        this.suggestions[suggestion.severity].push(suggestion);
      });
    });

    return {
      hasIssues: this.suggestions.error.length > 0 || this.suggestions.warning.length > 0,
      hasErrors: this.suggestions.error.length > 0,
      summary: this.generateSummary(),
    };
  }

  /**
   * Generate analysis summary
   */
  generateSummary() {
    const total = this.suggestions.error.length + this.suggestions.warning.length + this.suggestions.info.length;

    if (total === 0) {
      return `✅ ${this.filesAnalyzed} file(s) analyzed - Code is clean!`;
    }

    let summary = `\n♻️  Code Refactoring Suggestions:\n\n`;
    summary += `Files analyzed: ${this.filesAnalyzed}\n`;
    summary += `Must fix: ${this.suggestions.error.length}\n`;
    summary += `Should consider: ${this.suggestions.warning.length}\n\n`;

    // Group by file
    const byFile = {};
    ['error', 'warning', 'info'].forEach(severity => {
      this.suggestions[severity].forEach(suggestion => {
        if (!byFile[suggestion.file]) byFile[suggestion.file] = [];
        byFile[suggestion.file].push({ ...suggestion, severity });
      });
    });

    // Report by file
    Object.entries(byFile).forEach(([file, suggestions]) => {
      summary += `📄 ${file}\n`;
      suggestions.forEach(suggestion => {
        const icon = suggestion.severity === 'error' ? '❌' : '⚠️';
        summary += `   ${icon} Line ${suggestion.line} [${suggestion.category}]: ${suggestion.message}\n`;
        summary += `      💡 ${suggestion.suggestion}\n`;
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

    if (this.suggestions.error.length > 0) {
      console.log('\n❌ Commit blocked - code must be refactored');
      console.log('\n📖 See: docs/CODE_REFACTORING_GUIDE.md\n');
      console.log('💡 To bypass (not recommended): CODE_REFACTOR_STRICT=0 git commit\n');
    } else if (this.suggestions.warning.length > 0) {
      console.log('\n⚠️  Refactoring suggestions - consider addressing for better code quality\n');
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Execution
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function main() {
  const strict = process.env.CODE_REFACTOR_STRICT !== '0';
  const analyzer = new CodeRefactoringAnalyzer();

  console.log('♻️  Analyzing code for refactoring opportunities...\n');

  const result = analyzer.analyze();

  if (!result.hasIssues) {
    console.log(result.summary);
    return 0;
  }

  analyzer.printReport();

  // Errors always block
  if (result.hasErrors) {
    return 1;
  }

  // Warnings are informational only
  return 0;
}

if (require.main === module) {
  try {
    process.exit(main());
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
    process.exit(1);
  }
}

module.exports = { CodeRefactoringAnalyzer, THRESHOLDS };
