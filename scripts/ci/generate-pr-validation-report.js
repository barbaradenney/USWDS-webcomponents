#!/usr/bin/env node

/**
 * PR Validation Report Generator
 *
 * Generates comprehensive validation reports for PR automation
 * Combines results from multiple Puppeteer validation systems
 */

import fs from 'fs';
import path from 'path';

class PRValidationReportGenerator {
  constructor() {
    this.criticalComponents = (process.env.CRITICAL_COMPONENTS || '').split(',').filter(Boolean);
    this.allComponents = (process.env.ALL_COMPONENTS || '').split(',').filter(Boolean);
    this.validationType = process.env.VALIDATION_TYPE || 'basic';
  }

  async generateReport() {
    console.log('📊 Generating PR validation report...');

    const report = {
      timestamp: new Date().toISOString(),
      validationType: this.validationType,
      criticalComponents: this.criticalComponents,
      allComponents: this.allComponents,
      results: {
        transformation: await this.checkTransformationResults(),
        crossBrowser: await this.checkCrossBrowserResults(),
        performance: await this.checkPerformanceResults(),
        visual: await this.checkVisualRegressionResults()
      },
      summary: {}
    };

    // Generate summary
    report.summary = this.generateSummary(report.results);

    // Write report to file
    const reportPath = '__tests__/puppeteer-validation-report.md';
    const markdownReport = this.generateMarkdownReport(report);

    await fs.promises.writeFile(reportPath, markdownReport);

    // Also write JSON report for programmatic access
    const jsonReportPath = '__tests__/puppeteer-validation-report.json';
    await fs.promises.writeFile(jsonReportPath, JSON.stringify(report, null, 2));

    console.log(`✅ Validation report generated: ${reportPath}`);
    return report;
  }

  async checkTransformationResults() {
    const results = {
      status: 'unknown',
      tested: [],
      passed: [],
      failed: [],
      details: {}
    };

    try {
      // Check if transformation validation ran
      const logFiles = await this.findLogFiles(['transformation', 'uswds']);

      if (logFiles.length > 0) {
        // Parse transformation results from log files
        for (const logFile of logFiles) {
          const content = await fs.promises.readFile(logFile, 'utf-8');

          // Extract component results
          const componentMatches = content.match(/🧪 Testing (\w+)[\s\S]*?(?=🧪|$)/g);
          if (componentMatches) {
            for (const match of componentMatches) {
              const componentName = match.match(/🧪 Testing (\w+)/)?.[1];
              if (componentName) {
                results.tested.push(componentName);

                if (match.includes('✅') || match.includes('transformation successful')) {
                  results.passed.push(componentName);
                } else if (match.includes('❌') || match.includes('failed')) {
                  results.failed.push(componentName);
                }
              }
            }
          }
        }

        results.status = results.failed.length === 0 ? 'passed' : 'failed';
      } else {
        results.status = 'skipped';
      }
    } catch (error) {
      results.status = 'error';
      results.details.error = error.message;
    }

    return results;
  }

  async checkCrossBrowserResults() {
    const results = {
      status: 'unknown',
      browsers: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      details: {}
    };

    try {
      const reportPath = '__tests__/cross-browser-report.json';
      if (await this.fileExists(reportPath)) {
        const data = JSON.parse(await fs.promises.readFile(reportPath, 'utf-8'));

        results.browsers = Object.keys(data.results || {});
        results.totalTests = data.totalTests || 0;
        results.passedTests = data.totalPassed || 0;
        results.failedTests = data.totalTests - data.totalPassed || 0;
        results.status = data.allPassed ? 'passed' : 'failed';
        results.details = data.results || {};
      } else {
        results.status = 'skipped';
      }
    } catch (error) {
      results.status = 'error';
      results.details.error = error.message;
    }

    return results;
  }

  async checkPerformanceResults() {
    const results = {
      status: 'unknown',
      metrics: {},
      details: {}
    };

    try {
      const reportPath = '__tests__/performance-report.json';
      if (await this.fileExists(reportPath)) {
        const data = JSON.parse(await fs.promises.readFile(reportPath, 'utf-8'));

        results.metrics = data.metrics || {};
        results.status = data.allPassed ? 'passed' : 'failed';
        results.details = data.results || {};
      } else {
        results.status = 'skipped';
      }
    } catch (error) {
      results.status = 'error';
      results.details.error = error.message;
    }

    return results;
  }

  async checkVisualRegressionResults() {
    const results = {
      status: 'unknown',
      changes: [],
      screenshots: 0,
      details: {}
    };

    try {
      const reportPath = '__tests__/visual-regression-report.json';
      if (await this.fileExists(reportPath)) {
        const data = JSON.parse(await fs.promises.readFile(reportPath, 'utf-8'));

        results.changes = data.changes || [];
        results.screenshots = data.totalScreenshots || 0;
        results.status = data.hasChanges ? 'changes' : 'passed';
        results.details = data.details || {};
      } else {
        results.status = 'skipped';
      }
    } catch (error) {
      results.status = 'error';
      results.details.error = error.message;
    }

    return results;
  }

  generateSummary(results) {
    const summary = {
      overallStatus: 'passed',
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      warnings: [],
      errors: []
    };

    // Aggregate results
    Object.values(results).forEach(result => {
      if (result.status === 'failed' || result.status === 'error') {
        summary.overallStatus = 'failed';
      }

      if (result.totalTests) {
        summary.totalTests += result.totalTests;
        summary.passedTests += result.passedTests || 0;
        summary.failedTests += result.failedTests || 0;
      }

      if (result.status === 'skipped') {
        summary.skippedTests++;
      }

      if (result.status === 'error') {
        summary.errors.push(result.details?.error || 'Unknown error');
      }

      if (result.status === 'changes') {
        summary.warnings.push('Visual changes detected');
      }
    });

    return summary;
  }

  generateMarkdownReport(report) {
    const { results, summary } = report;

    let markdown = `# 🤖 Puppeteer Validation Report

**Generated:** ${new Date(report.timestamp).toLocaleString()}
**Validation Type:** ${report.validationType}
**Overall Status:** ${this.getStatusEmoji(summary.overallStatus)} **${summary.overallStatus.toUpperCase()}**

## 📋 Component Changes

`;

    if (report.criticalComponents.length > 0) {
      markdown += `### 🚨 Critical Components (require comprehensive validation)
${report.criticalComponents.map(c => `- \`${c}\``).join('\n')}

`;
    }

    if (report.allComponents.length > 0) {
      markdown += `### 📦 All Modified Components
${report.allComponents.map(c => `- \`${c}\``).join('\n')}

`;
    }

    markdown += `## 🧪 Validation Results

### ${this.getStatusEmoji(results.transformation.status)} USWDS Transformation
**Status:** ${results.transformation.status}
**Components Tested:** ${results.transformation.tested.length}
**Passed:** ${results.transformation.passed.length}
**Failed:** ${results.transformation.failed.length}

`;

    if (results.transformation.failed.length > 0) {
      markdown += `**Failed Components:**
${results.transformation.failed.map(c => `- ❌ \`${c}\``).join('\n')}

`;
    }

    markdown += `### ${this.getStatusEmoji(results.crossBrowser.status)} Cross-Browser Testing
**Status:** ${results.crossBrowser.status}
**Browsers:** ${results.crossBrowser.browsers.join(', ')}
**Total Tests:** ${results.crossBrowser.totalTests}
**Passed:** ${results.crossBrowser.passedTests}
**Failed:** ${results.crossBrowser.failedTests}

### ${this.getStatusEmoji(results.performance.status)} Performance Monitoring
**Status:** ${results.performance.status}

`;

    if (Object.keys(results.performance.metrics).length > 0) {
      markdown += `**Metrics:**
${Object.entries(results.performance.metrics).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

`;
    }

    markdown += `### ${this.getStatusEmoji(results.visual.status)} Visual Regression
**Status:** ${results.visual.status}
**Screenshots:** ${results.visual.screenshots}
**Changes Detected:** ${results.visual.changes.length}

`;

    if (results.visual.changes.length > 0) {
      markdown += `**Visual Changes:**
${results.visual.changes.map(c => `- 📸 \`${c}\``).join('\n')}

`;
    }

    // Summary section
    markdown += `## 📊 Summary

- **Overall Status:** ${this.getStatusEmoji(summary.overallStatus)} ${summary.overallStatus.toUpperCase()}
- **Total Tests:** ${summary.totalTests}
- **Passed:** ${summary.passedTests}
- **Failed:** ${summary.failedTests}
- **Skipped:** ${summary.skippedTests}

`;

    if (summary.warnings.length > 0) {
      markdown += `### ⚠️ Warnings
${summary.warnings.map(w => `- ${w}`).join('\n')}

`;
    }

    if (summary.errors.length > 0) {
      markdown += `### ❌ Errors
${summary.errors.map(e => `- ${e}`).join('\n')}

`;
    }

    markdown += `## 🔗 Additional Resources

- [View full CI/CD logs](${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID})
- [USWDS Component Documentation](https://designsystem.digital.gov/components/)
- [Testing Documentation](docs/TESTING_INFRASTRUCTURE_ENHANCEMENT.md)

---
*This report was automatically generated by the Puppeteer validation system.*`;

    return markdown;
  }

  getStatusEmoji(status) {
    const emojis = {
      passed: '✅',
      failed: '❌',
      error: '🚨',
      skipped: '⏭️',
      changes: '📸',
      unknown: '❓'
    };
    return emojis[status] || '❓';
  }

  async findLogFiles(patterns) {
    const logDir = '__tests__';
    const files = [];

    try {
      const dirContents = await fs.promises.readdir(logDir);
      for (const file of dirContents) {
        if (patterns.some(pattern => file.includes(pattern)) && file.endsWith('.log')) {
          files.push(path.join(logDir, file));
        }
      }
    } catch (error) {
      // Directory might not exist
    }

    return files;
  }

  async fileExists(filePath) {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// CLI execution
async function main() {
  try {
    const generator = new PRValidationReportGenerator();
    const report = await generator.generateReport();

    console.log(`\n📊 Validation Report Summary:`);
    console.log(`   Overall Status: ${report.summary.overallStatus}`);
    console.log(`   Total Tests: ${report.summary.totalTests}`);
    console.log(`   Passed: ${report.summary.passedTests}`);
    console.log(`   Failed: ${report.summary.failedTests}`);

    process.exit(report.summary.overallStatus === 'passed' ? 0 : 1);
  } catch (error) {
    console.error('❌ Failed to generate validation report:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default PRValidationReportGenerator;