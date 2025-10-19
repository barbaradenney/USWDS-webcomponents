#!/usr/bin/env node

/**
 * Debug Pages Maintenance and Validation System
 *
 * Ensures debug pages stay current, functional, and useful by:
 * - Validating all debug pages exist and are accessible
 * - Checking for outdated component APIs
 * - Monitoring usage through access logs
 * - Auto-updating when components change
 * - Reporting on debug page health
 */

import { readdirSync, existsSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import puppeteer from 'puppeteer';

const COMPONENTS_DIR = 'src/components';
const USAGE_LOG_FILE = 'test-reports/debug-page-usage.json';
const HEALTH_REPORT_FILE = 'test-reports/debug-page-health.json';

// Get all component directories
function getComponentDirectories() {
  return readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => !name.startsWith('.'));
}

// Check if component has implementation file
function hasComponentImplementation(componentName) {
  const componentTSPath = join(COMPONENTS_DIR, componentName, `usa-${componentName}.ts`);
  return existsSync(componentTSPath);
}

// Check if debug page exists
function hasDebugPage(componentName) {
  const debugPagePath = join(COMPONENTS_DIR, componentName, `usa-${componentName}.debug.html`);
  return existsSync(debugPagePath);
}

// Get file modification times for staleness detection
function getFileStats(componentName) {
  const componentTSPath = join(COMPONENTS_DIR, componentName, `usa-${componentName}.ts`);
  const debugPagePath = join(COMPONENTS_DIR, componentName, `usa-${componentName}.debug.html`);

  const stats = {};

  if (existsSync(componentTSPath)) {
    stats.componentModified = statSync(componentTSPath).mtime;
  }

  if (existsSync(debugPagePath)) {
    stats.debugPageModified = statSync(debugPagePath).mtime;
  }

  return stats;
}

// Check if debug page is stale (component newer than debug page)
function isDebugPageStale(componentName) {
  const stats = getFileStats(componentName);

  if (!stats.componentModified || !stats.debugPageModified) {
    return false; // Can't determine staleness
  }

  return stats.componentModified > stats.debugPageModified;
}

// Validate debug page functionality
async function validateDebugPageFunctionality(componentName) {
  const url = `http://localhost:5173/src/components/${componentName}/usa-${componentName}.debug.html`;

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Collect console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to debug page
    const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });

    if (!response.ok()) {
      return {
        accessible: false,
        error: `HTTP ${response.status()}: ${response.statusText()}`
      };
    }

    // Wait for component initialization
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if components are present
    const componentInfo = await page.evaluate((compName) => {
      const components = document.querySelectorAll(`usa-${compName}`);
      const hasUSWDSClasses = Array.from(document.querySelectorAll('*')).some(el =>
        Array.from(el.classList).some(cls => cls.startsWith(`usa-${compName}`))
      );

      return {
        componentCount: components.length,
        hasUSWDSTransformation: hasUSWDSClasses,
        hasInteractiveElements: Array.from(components).some(comp =>
          comp.querySelector('button, input, select, textarea')
        )
      };
    }, componentName);

    await browser.close();

    return {
      accessible: true,
      errors: errors.length > 0 ? errors : null,
      ...componentInfo
    };

  } catch (error) {
    if (browser) await browser.close();
    return {
      accessible: false,
      error: error.message
    };
  }
}

// Load usage statistics
function loadUsageStats() {
  if (!existsSync(USAGE_LOG_FILE)) {
    return {
      totalAccesses: {},
      lastAccessed: {},
      createdAt: new Date().toISOString()
    };
  }

  try {
    return JSON.parse(readFileSync(USAGE_LOG_FILE, 'utf8'));
  } catch (error) {
    console.warn(chalk.yellow(`⚠️  Could not load usage stats: ${error.message}`));
    return { totalAccesses: {}, lastAccessed: {} };
  }
}

// Generate comprehensive health report
async function generateHealthReport(options = {}) {
  console.log(chalk.blue('🔍 Validating Debug Pages Health\n'));

  const components = getComponentDirectories();
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalComponents: components.length,
      withImplementation: 0,
      withDebugPage: 0,
      staleDebugPages: 0,
      functionalDebugPages: 0,
      issues: 0
    },
    components: {},
    recommendations: []
  };

  const usageStats = loadUsageStats();

  for (const componentName of components) {
    const hasImpl = hasComponentImplementation(componentName);
    const hasDebug = hasDebugPage(componentName);
    const isStale = hasDebug && isDebugPageStale(componentName);

    if (hasImpl) report.summary.withImplementation++;
    if (hasDebug) report.summary.withDebugPage++;
    if (isStale) report.summary.staleDebugPages++;

    const componentReport = {
      hasImplementation: hasImpl,
      hasDebugPage: hasDebug,
      isStale: isStale,
      fileStats: getFileStats(componentName),
      usage: {
        totalAccesses: usageStats.totalAccesses[componentName] || 0,
        lastAccessed: usageStats.lastAccessed[componentName] || null
      }
    };

    // Validate functionality if debug page exists and dev server might be running
    if (hasDebug && options.validateFunctionality) {
      console.log(chalk.gray(`  Testing ${componentName} debug page...`));

      try {
        const functionality = await validateDebugPageFunctionality(componentName);
        componentReport.functionality = functionality;

        if (functionality.accessible && !functionality.errors) {
          report.summary.functionalDebugPages++;
        } else {
          report.summary.issues++;
        }
      } catch (error) {
        componentReport.functionality = {
          accessible: false,
          error: `Validation failed: ${error.message}`
        };
        report.summary.issues++;
      }
    }

    report.components[componentName] = componentReport;

    // Generate recommendations
    if (hasImpl && !hasDebug) {
      report.recommendations.push({
        type: 'missing_debug_page',
        component: componentName,
        message: `Create debug page with: npm run generate:debug-page ${componentName}`
      });
    }

    if (isStale) {
      report.recommendations.push({
        type: 'stale_debug_page',
        component: componentName,
        message: `Update debug page with: npm run generate:debug-page ${componentName} --force`
      });
    }

    if (componentReport.usage?.totalAccesses === 0) {
      report.recommendations.push({
        type: 'unused_debug_page',
        component: componentName,
        message: `Debug page exists but has never been accessed`
      });
    }
  }

  // Save health report
  writeFileSync(HEALTH_REPORT_FILE, JSON.stringify(report, null, 2));

  return report;
}

// Display health report summary
function displayHealthSummary(report) {
  const { summary, recommendations } = report;

  console.log(chalk.blue('\n📊 Debug Pages Health Summary'));
  console.log(`   Total Components: ${summary.totalComponents}`);
  console.log(`   With Implementation: ${summary.withImplementation}`);
  console.log(`   With Debug Page: ${summary.withDebugPage} (${Math.round(summary.withDebugPage / summary.withImplementation * 100)}%)`);

  if (summary.staleDebugPages > 0) {
    console.log(chalk.yellow(`   Stale Debug Pages: ${summary.staleDebugPages}`));
  }

  if (summary.functionalDebugPages > 0) {
    console.log(chalk.green(`   Functional Debug Pages: ${summary.functionalDebugPages}`));
  }

  if (summary.issues > 0) {
    console.log(chalk.red(`   Issues Found: ${summary.issues}`));
  }

  if (recommendations.length > 0) {
    console.log(chalk.yellow(`\n⚠️  Recommendations (${recommendations.length}):`));
    recommendations.slice(0, 5).forEach(rec => {
      console.log(chalk.yellow(`   • ${rec.component}: ${rec.message}`));
    });

    if (recommendations.length > 5) {
      console.log(chalk.gray(`   ... and ${recommendations.length - 5} more (see ${HEALTH_REPORT_FILE})`));
    }
  }

  console.log(chalk.blue(`\n📄 Full report saved to: ${HEALTH_REPORT_FILE}`));
}

// Auto-fix common issues
async function autoFixIssues(report) {
  const { generateComponentDebugPage } = await import('./generate-component-debug-pages.js');

  let fixed = 0;

  for (const [componentName, componentReport] of Object.entries(report.components)) {
    // Create missing debug pages
    if (componentReport.hasImplementation && !componentReport.hasDebugPage) {
      console.log(chalk.blue(`🔧 Creating missing debug page for ${componentName}...`));
      try {
        generateComponentDebugPage(componentName);
        fixed++;
      } catch (error) {
        console.log(chalk.red(`❌ Failed to create debug page for ${componentName}: ${error.message}`));
      }
    }

    // Update stale debug pages
    if (componentReport.isStale) {
      console.log(chalk.blue(`🔄 Updating stale debug page for ${componentName}...`));
      try {
        generateComponentDebugPage(componentName);
        fixed++;
      } catch (error) {
        console.log(chalk.red(`❌ Failed to update debug page for ${componentName}: ${error.message}`));
      }
    }
  }

  console.log(chalk.green(`\n✅ Auto-fixed ${fixed} issues`));
  return fixed;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const validateFunctionality = args.includes('--validate-functionality') || args.includes('--full');
  const autoFix = args.includes('--fix');
  const silent = args.includes('--silent');

  try {
    const report = await generateHealthReport({ validateFunctionality });

    if (!silent) {
      displayHealthSummary(report);
    }

    if (autoFix) {
      await autoFixIssues(report);
    }

    // Exit with error code if issues found (for CI/CD integration)
    const hasIssues = report.summary.staleDebugPages > 0 ||
                     report.summary.issues > 0 ||
                     (report.summary.withDebugPage < report.summary.withImplementation);

    if (hasIssues && !autoFix) {
      console.log(chalk.red('\n❌ Debug page issues detected!'));
      console.log(chalk.blue('   Run with --fix to auto-resolve issues'));
      process.exit(1);
    } else {
      console.log(chalk.green('\n✅ Debug pages are healthy!'));
    }

  } catch (error) {
    console.error(chalk.red(`❌ Validation failed: ${error.message}`));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateHealthReport, validateDebugPageFunctionality };