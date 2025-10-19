#!/usr/bin/env node

/**
 * PR Comment Generator
 *
 * Generates automated PR comments with Puppeteer validation results
 * Provides actionable feedback and guidance for developers
 */

import fs from 'fs';
import { Octokit } from '@octokit/rest';

class PRCommentGenerator {
  constructor() {
    this.github = new Octokit({ auth: process.env.GITHUB_TOKEN });
    this.prNumber = process.env.PR_NUMBER;
    this.validationSuccess = process.env.VALIDATION_SUCCESS === 'true';
    this.criticalComponents = (process.env.CRITICAL_COMPONENTS || '').split(',').filter(Boolean);
    this.allComponents = (process.env.ALL_COMPONENTS || '').split(',').filter(Boolean);
    this.validationType = process.env.VALIDATION_TYPE || 'basic';
  }

  async generateComment() {
    console.log('💬 Generating PR comment...');

    // Load validation report
    const report = await this.loadValidationReport();

    // Generate comment content
    const comment = this.createCommentContent(report);

    // Write comment to file for GitHub Actions
    await fs.promises.writeFile('__tests__/pr-comment.md', comment);

    console.log('✅ PR comment generated successfully');
    return comment;
  }

  async loadValidationReport() {
    try {
      const reportPath = '__tests__/puppeteer-validation-report.json';
      const content = await fs.promises.readFile(reportPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('⚠️ Could not load validation report, generating basic comment');
      return this.createBasicReport();
    }
  }

  createBasicReport() {
    return {
      timestamp: new Date().toISOString(),
      validationType: this.validationType,
      criticalComponents: this.criticalComponents,
      allComponents: this.allComponents,
      summary: {
        overallStatus: this.validationSuccess ? 'passed' : 'failed',
        totalTests: 0,
        passedTests: 0,
        failedTests: 0
      }
    };
  }

  createCommentContent(report) {
    const { summary } = report;
    const statusEmoji = this.getStatusEmoji(summary.overallStatus);
    const isSuccess = summary.overallStatus === 'passed';

    let comment = `# 🤖 Puppeteer Validation Report

${statusEmoji} **${summary.overallStatus.toUpperCase()}** - ${this.getStatusMessage(summary.overallStatus)}

`;

    // Component analysis section
    if (this.criticalComponents.length > 0 || this.allComponents.length > 0) {
      comment += `## 📦 Component Analysis

`;

      if (this.criticalComponents.length > 0) {
        comment += `### 🚨 Critical Components Modified
These components require comprehensive validation due to complex USWDS integration:

${this.criticalComponents.map(component => `- \`${component}\` - [View Documentation](src/components/${component}/README.md)`).join('\n')}

**Validation Level:** Comprehensive (Cross-browser + Performance + Visual)

`;
      }

      if (this.allComponents.length > 0 && this.allComponents.some(c => !this.criticalComponents.includes(c))) {
        const standardComponents = this.allComponents.filter(c => !this.criticalComponents.includes(c));
        comment += `### 📋 Standard Components Modified
${standardComponents.map(component => `- \`${component}\` - [View Documentation](src/components/${component}/README.md)`).join('\n')}

**Validation Level:** Standard (USWDS compliance + Basic testing)

`;
      }
    }

    // Results summary
    comment += `## 🧪 Validation Results

| Test Type | Status | Details |
|-----------|--------|---------|
`;

    if (report.results) {
      const { transformation, crossBrowser, performance, visual } = report.results;

      comment += `| USWDS Transformation | ${this.getStatusEmoji(transformation.status)} | ${transformation.tested.length} components tested, ${transformation.failed.length} failed |
`;

      comment += `| Cross-Browser | ${this.getStatusEmoji(crossBrowser.status)} | ${crossBrowser.browsers.join(', ')} (${crossBrowser.passedTests}/${crossBrowser.totalTests}) |
`;

      comment += `| Performance | ${this.getStatusEmoji(performance.status)} | ${Object.keys(performance.metrics).length} metrics checked |
`;

      comment += `| Visual Regression | ${this.getStatusEmoji(visual.status)} | ${visual.screenshots} screenshots, ${visual.changes.length} changes |
`;
    } else {
      comment += `| Basic Validation | ${statusEmoji} | ${this.validationType} validation completed |
`;
    }

    // Success section
    if (isSuccess) {
      comment += `
## ✅ All Validations Passed!

Your changes have successfully passed all Puppeteer validations:

- ✅ **USWDS Transformation**: All components transform correctly
- ✅ **Cross-Browser Compatibility**: Components work across all supported browsers
- ✅ **Performance Standards**: No performance regressions detected
- ✅ **Visual Consistency**: No unexpected visual changes

### 🎉 Ready for Review!

Your PR is ready for code review. The automated validation confirms that:

1. **USWDS Integration**: Components properly integrate with USWDS JavaScript
2. **Browser Support**: Components function correctly in Chrome, Firefox, Edge, and Safari
3. **Performance Impact**: Changes don't negatively impact performance metrics
4. **Visual Stability**: No unintended visual regressions introduced

`;
    } else {
      // Failure section with guidance
      comment += `
## ❌ Validation Issues Detected

Your changes have encountered validation issues that need attention:

`;

      if (report.results) {
        const { transformation, crossBrowser, performance, visual } = report.results;

        if (transformation.failed.length > 0) {
          comment += `### 🏛️ USWDS Transformation Issues

The following components failed USWDS transformation validation:

${transformation.failed.map(component => `- ❌ \`${component}\` - Check that DOM structure matches USWDS patterns`).join('\n')}

**How to Fix:**
1. Review [USWDS Transformation Patterns](docs/USWDS_TRANSFORMATION_PATTERNS.md)
2. Ensure components use proper USWDS CSS classes
3. Verify no interfering attributes or styles are added
4. Test locally: \`npm run validate:uswds-transformation\`

`;
        }

        if (crossBrowser.failedTests > 0) {
          comment += `### 🌐 Cross-Browser Issues

Cross-browser testing detected ${crossBrowser.failedTests} failed tests across browsers.

**How to Fix:**
1. Test locally: \`npm run test:cross-browser\`
2. Check browser-specific console errors
3. Verify USWDS JavaScript loads correctly in all browsers
4. Review [Cross-Browser Testing Guide](docs/DEBUGGING_GUIDE.md#cross-browser-issues)

`;
        }

        if (performance.status === 'failed') {
          comment += `### ⚡ Performance Issues

Performance monitoring detected issues with component initialization or runtime.

**How to Fix:**
1. Test locally: \`npm run test:performance:monitor\`
2. Review performance report: \`__tests__/performance-report.json\`
3. Optimize USWDS integration patterns
4. Consider lazy loading for heavy components

`;
        }

        if (visual.changes.length > 0) {
          comment += `### 📸 Visual Changes Detected

Visual regression testing detected ${visual.changes.length} visual changes:

${visual.changes.map(change => `- 📸 \`${change}\``).join('\n')}

**How to Fix:**
1. Review visual changes: \`npm run test:visual:regression\`
2. If changes are intentional, update baselines: \`npm run test:visual:update-baseline\`
3. If unintentional, review CSS and USWDS class usage
4. Test in Storybook to verify expected appearance

`;
        }
      }

      comment += `### 🛠️ Next Steps

1. **Fix Issues**: Address the specific validation failures listed above
2. **Test Locally**: Run the suggested commands to verify fixes
3. **Re-run Validation**: Push new commits to trigger re-validation
4. **Ask for Help**: If you need assistance, reference the [Debugging Guide](docs/DEBUGGING_GUIDE.md)

`;
    }

    // Footer with useful links
    comment += `## 🔗 Useful Resources

- [🏛️ USWDS Component Documentation](https://designsystem.digital.gov/components/)
- [📖 Project Testing Guide](docs/TESTING_INFRASTRUCTURE_ENHANCEMENT.md)
- [🐛 Debugging Guide](docs/DEBUGGING_GUIDE.md)
- [🤖 View Full CI/CD Logs](${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID})

---

**Automation Details:**
- **Report Generated:** ${new Date(report.timestamp).toLocaleString()}
- **Validation Type:** ${this.validationType}
- **Components:** ${this.allComponents.length} modified
- **Critical Components:** ${this.criticalComponents.length}

*This comment is automatically updated by the Puppeteer validation system. Results reflect the latest commit.*`;

    return comment;
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

  getStatusMessage(status) {
    const messages = {
      passed: 'All validations passed successfully',
      failed: 'Validation issues detected',
      error: 'Validation encountered errors',
      skipped: 'Validation was skipped',
      changes: 'Visual changes detected',
      unknown: 'Validation status unknown'
    };
    return messages[status] || 'Unknown validation status';
  }
}

// CLI execution
async function main() {
  try {
    const generator = new PRCommentGenerator();
    await generator.generateComment();
    console.log('💬 PR comment generation completed');
  } catch (error) {
    console.error('❌ Failed to generate PR comment:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default PRCommentGenerator;