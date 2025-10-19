#!/usr/bin/env node

/**
 * Minimal Wrapper Pattern Validator
 *
 * Ensures all components follow the minimal wrapper approach that made combo-box successful:
 * 1. Trust USWDS completely for behavior
 * 2. Minimal custom event handling
 * 3. No recreation of USWDS functionality
 * 4. Clean delegation to USWDS modules
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';
import chalk from 'chalk';

const COMPONENTS_DIR = 'src/components';

// Warning patterns that suggest over-engineering
const OVER_ENGINEERING_PATTERNS = [
  {
    pattern: /event\.preventDefault\(\)/g,
    severity: 'warning',
    message: 'Manual event.preventDefault() - USWDS should handle this',
    exception: 'Unless absolutely necessary for web component lifecycle'
  },
  {
    pattern: /window\.scroll/g,
    severity: 'error',
    message: 'Manual scroll manipulation - USWDS should handle this',
    exception: 'None - always let USWDS handle scrolling'
  },
  {
    pattern: /addEventListener.*click/g,
    severity: 'warning',
    message: 'Manual click event listeners - USWDS should handle interactions',
    exception: 'Only for web component-specific needs (like property updates)'
  },
  {
    pattern: /\.focus\(\)/g,
    severity: 'warning',
    message: 'Manual focus management - USWDS handles accessibility',
    exception: 'Only when required for web component lifecycle'
  },
  {
    pattern: /aria-/g,
    severity: 'info',
    message: 'Manual ARIA attributes - verify USWDS doesn\'t handle this',
    exception: 'When USWDS doesn\'t provide the specific ARIA pattern'
  },
  {
    pattern: /setTimeout.*\d{3,}/g,
    severity: 'warning',
    message: 'Long timeouts suggest timing-dependent fixes - may indicate over-engineering',
    exception: 'iframe delegation fixes (150ms) are acceptable'
  },
  {
    pattern: /querySelector.*addEventListener/g,
    severity: 'error',
    message: 'Querying DOM to add event listeners - USWDS should handle this',
    exception: 'None - use USWDS event delegation'
  },
  {
    pattern: /\.classList\.(add|remove|toggle).*usa-/g,
    severity: 'error',
    message: 'Manually manipulating USWDS classes - USWDS should control its own classes',
    exception: 'Only for component state reflection (disabled, open, etc.)'
  },
  {
    pattern: /new CustomEvent/g,
    severity: 'info',
    message: 'Custom events - ensure not duplicating USWDS events',
    exception: 'Web component-specific events are fine'
  },
  {
    pattern: /handleClick|handleKeydown|handleFocus|handleBlur/g,
    severity: 'warning',
    message: 'Custom interaction handlers - USWDS should handle interactions',
    exception: 'Only for web component property synchronization'
  }
];

// Good patterns that indicate minimal wrapper approach
const GOOD_PATTERNS = [
  {
    pattern: /initializeUSWDSComponent/g,
    message: '✅ Using standard USWDS initialization'
  },
  {
    pattern: /this\.uswdsModule = await/g,
    message: '✅ Storing USWDS module reference'
  },
  {
    pattern: /import.*uswds-loader/g,
    message: '✅ Using standardized USWDS loader'
  },
  {
    pattern: /cleanupUSWDSComponent/g,
    message: '✅ Proper USWDS cleanup'
  },
  {
    pattern: /fixIframeEventDelegation/g,
    message: '✅ Using iframe delegation mixin'
  }
];

// Components that should be minimal wrappers (have USWDS JavaScript)
const INTERACTIVE_COMPONENTS = [
  'accordion', 'combo-box', 'date-picker', 'file-input', 'header',
  'modal', 'time-picker', 'tooltip', 'in-page-navigation', 'search'
];

// Components that are presentational (no USWDS JavaScript expected)
const PRESENTATIONAL_COMPONENTS = [
  'alert', 'button', 'card', 'tag', 'breadcrumb', 'link', 'prose',
  'section', 'summary-box', 'pagination'
];

async function getComponentFiles() {
  const pattern = join(COMPONENTS_DIR, '**/usa-*.ts');
  const files = await glob(pattern);
  return files.filter(file =>
    !file.includes('.test.') &&
    !file.includes('.stories.') &&
    !file.includes('.cy.')
  );
}

function getComponentName(filePath) {
  const match = filePath.match(/usa-([^.]+)\.ts$/);
  return match ? match[1] : null;
}

function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const componentName = getComponentName(filePath);
  const isInteractive = INTERACTIVE_COMPONENTS.includes(componentName);
  const isPresentational = PRESENTATIONAL_COMPONENTS.includes(componentName);

  const analysis = {
    componentName,
    filePath,
    isInteractive,
    isPresentational,
    lineCount: content.split('\n').length,
    issues: [],
    goodPatterns: [],
    complexity: 'unknown'
  };

  // Check for over-engineering patterns
  for (const { pattern, severity, message, exception } of OVER_ENGINEERING_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      analysis.issues.push({
        severity,
        pattern: pattern.source,
        count: matches.length,
        message,
        exception,
        lines: getLineNumbers(content, pattern)
      });
    }
  }

  // Check for good patterns
  for (const { pattern, message } of GOOD_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      analysis.goodPatterns.push({
        pattern: pattern.source,
        count: matches.length,
        message
      });
    }
  }

  // Determine complexity
  if (analysis.lineCount < 150) {
    analysis.complexity = 'minimal';
  } else if (analysis.lineCount < 300) {
    analysis.complexity = 'moderate';
  } else {
    analysis.complexity = 'complex';
  }

  // Special validation for interactive components
  if (isInteractive) {
    if (!content.includes('initializeUSWDSComponent')) {
      analysis.issues.push({
        severity: 'error',
        message: 'Interactive component missing USWDS initialization',
        pattern: 'Missing initializeUSWDSComponent'
      });
    }
  }

  return analysis;
}

function getLineNumbers(content, pattern) {
  const lines = content.split('\n');
  const lineNumbers = [];

  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      lineNumbers.push(index + 1);
    }
  });

  return lineNumbers.slice(0, 3); // Limit to first 3 matches
}

function generateReport(analyses) {
  console.log(chalk.blue('🔍 Minimal Wrapper Pattern Analysis\n'));

  // Summary statistics
  const totalComponents = analyses.length;
  const interactiveCount = analyses.filter(a => a.isInteractive).length;
  const presentationalCount = analyses.filter(a => a.isPresentational).length;
  const minimalCount = analyses.filter(a => a.complexity === 'minimal').length;
  const complexCount = analyses.filter(a => a.complexity === 'complex').length;

  console.log(chalk.blue('📊 Summary Statistics:'));
  console.log(`   Total components: ${totalComponents}`);
  console.log(`   Interactive components: ${interactiveCount}`);
  console.log(`   Presentational components: ${presentationalCount}`);
  console.log(`   Minimal complexity: ${minimalCount}`);
  console.log(`   Complex components: ${complexCount}\n`);

  // Analyze each component
  for (const analysis of analyses) {
    const { componentName, complexity, issues, goodPatterns, lineCount, isInteractive } = analysis;

    let statusIcon = '✅';
    let statusColor = chalk.green;

    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    if (errorCount > 0) {
      statusIcon = '❌';
      statusColor = chalk.red;
    } else if (warningCount > 2) {
      statusIcon = '⚠️';
      statusColor = chalk.yellow;
    }

    console.log(statusColor(`${statusIcon} ${componentName} (${complexity}, ${lineCount} lines)`));

    if (isInteractive) {
      console.log(chalk.blue('   📱 Interactive component - should be minimal wrapper'));
    }

    // Show good patterns
    goodPatterns.forEach(good => {
      console.log(chalk.green(`   ${good.message} (${good.count}x)`));
    });

    // Show issues
    issues.forEach(issue => {
      let color = chalk.gray;
      if (issue.severity === 'error') color = chalk.red;
      if (issue.severity === 'warning') color = chalk.yellow;
      if (issue.severity === 'info') color = chalk.blue;

      console.log(color(`   ${issue.severity.toUpperCase()}: ${issue.message}`));
      if (issue.count) {
        console.log(color(`      Found ${issue.count} instances`));
      }
      if (issue.lines?.length) {
        console.log(color(`      Lines: ${issue.lines.join(', ')}`));
      }
      if (issue.exception) {
        console.log(chalk.gray(`      Exception: ${issue.exception}`));
      }
    });

    console.log('');
  }

  // Recommendations
  const problematicComponents = analyses.filter(a =>
    a.issues.some(i => i.severity === 'error') ||
    a.issues.filter(i => i.severity === 'warning').length > 2
  );

  if (problematicComponents.length > 0) {
    console.log(chalk.red('🚨 Components needing attention:'));
    problematicComponents.forEach(comp => {
      console.log(chalk.red(`   • ${comp.componentName}: ${comp.issues.length} issues`));
    });
    console.log('');
  }

  // Minimal wrapper guidelines
  console.log(chalk.blue('📖 Minimal Wrapper Guidelines:'));
  console.log('   1. Trust USWDS completely for all behavior');
  console.log('   2. Use initializeUSWDSComponent() for setup');
  console.log('   3. Avoid manual event handling');
  console.log('   4. Let USWDS control its own DOM and classes');
  console.log('   5. Keep components under 200 lines when possible');
  console.log('   6. Only add web component-specific logic');
  console.log('');

  return {
    totalComponents,
    problematicComponents: problematicComponents.length,
    minimalCount,
    complexCount
  };
}

async function main() {
  const args = process.argv.slice(2);
  const specificComponent = args.find(arg => !arg.startsWith('--'));
  const showAll = args.includes('--all');
  const onlyProblems = args.includes('--problems');

  try {
    const componentFiles = await getComponentFiles();
    let analyses = await Promise.all(
      componentFiles.map(file => analyzeFile(file))
    );

    // Filter results based on arguments
    if (specificComponent) {
      analyses = analyses.filter(a => a.componentName === specificComponent);
    } else if (onlyProblems) {
      analyses = analyses.filter(a =>
        a.issues.some(i => i.severity === 'error') ||
        a.issues.filter(i => i.severity === 'warning').length > 2
      );
    }

    const report = generateReport(analyses);

    // Exit with error code if problems found
    if (report.problematicComponents > 0) {
      console.log(chalk.red(`\n❌ Found ${report.problematicComponents} components that may not follow minimal wrapper pattern`));
      process.exit(1);
    } else {
      console.log(chalk.green(`\n✅ All components follow minimal wrapper pattern!`));
    }

  } catch (error) {
    console.error(chalk.red('Error analyzing components:'), error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { analyzeFile, generateReport };