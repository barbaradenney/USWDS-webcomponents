#!/usr/bin/env node

/**
 * Component Audit Script
 *
 * Systematically audits all existing components for USWDS compliance issues
 * and generates actionable reports with fix suggestions.
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// USWDS Reference Patterns (extracted from official USWDS source)
const USWDS_REFERENCE_PATTERNS = {
  'combo-box': {
    officialClasses: [
      'usa-combo-box',
      'usa-combo-box__input',
      'usa-combo-box__toggle-list',
      'usa-combo-box__clear-input',
      'usa-combo-box__list',
      'usa-combo-box__list-option',
    ],
    deprecatedClasses: ['usa-combo-box__toggle-button', 'usa-combo-box__clear-button'],
    buttonContentPattern: '&nbsp;',
    ariaPattern: "aria-expanded=\"${this.isOpen ? 'true' : 'false'}\"",
  },
  'date-picker': {
    officialClasses: ['usa-date-picker', 'usa-date-picker__wrapper', 'usa-date-picker__button'],
    buttonContentPattern: '&nbsp;',
  },
  'file-input': {
    officialClasses: [
      'usa-file-input',
      'usa-file-input__input',
      'usa-file-input__box',
      'usa-file-input__instructions',
    ],
  },
  'time-picker': {
    officialClasses: ['usa-time-picker', 'usa-time-picker__button'],
    buttonContentPattern: '&nbsp;',
  },
};

// Specific issues to look for
const AUDIT_CHECKS = [
  {
    name: 'Custom SVG Icons',
    description: 'Components using custom SVG icons instead of USWDS CSS icons',
    pattern: /<svg[^>]*(?:class="usa-icon"|viewBox=)[^>]*>/g,
    fix: 'Remove custom SVG. Use &nbsp; in buttons - USWDS provides icons via CSS.',
    severity: 'high',
  },
  {
    name: 'Deprecated Class Names',
    description: 'Components using deprecated or non-standard USWDS classes',
    pattern: /usa-combo-box__toggle-button|usa-combo-box__clear-button|usa-date-picker__toggle/g,
    fix: 'Update to official USWDS class names from current specification.',
    severity: 'high',
  },
  {
    name: 'Incorrect ARIA Pattern',
    description: 'Components using incorrect aria-current pattern',
    pattern: /\?aria-current="\$\{[^}]*\? '[^']*' : false\}"/g,
    fix: 'Use `nothing` instead of `false` to properly omit attributes.',
    severity: 'medium',
  },
  {
    name: 'Custom Button Content',
    description: 'Buttons containing content other than &nbsp;',
    check: (content, componentName) => {
      const patterns = USWDS_REFERENCE_PATTERNS[componentName];
      if (!patterns?.buttonContentPattern) return [];

      const issues = [];
      const buttonRegex = /<button[^>]*class="[^"]*usa-[^"]*button[^"]*"[^>]*>([^<]*)<\/button>/g;
      let match;

      while ((match = buttonRegex.exec(content)) !== null) {
        const buttonContent = match[1].trim();
        if (buttonContent && buttonContent !== '&nbsp;') {
          issues.push({
            content: match[0],
            issue: `Button contains "${buttonContent}" instead of "&nbsp;"`,
          });
        }
      }

      return issues;
    },
    fix: 'Replace button content with "&nbsp;" only.',
    severity: 'high',
  },
  {
    name: 'Missing Required Classes',
    description: 'Components missing required USWDS classes',
    check: (content, componentName) => {
      const patterns = USWDS_REFERENCE_PATTERNS[componentName];
      if (!patterns?.officialClasses) return [];

      return patterns.officialClasses
        .filter((className) => !content.includes(className))
        .map((className) => ({ missing: className }));
    },
    fix: 'Add missing required USWDS classes.',
    severity: 'high',
  },
];

class ComponentAuditor {
  constructor() {
    this.componentsPath = join(__dirname, '../../src/components');
    this.auditResults = new Map();
  }

  async auditAllComponents() {
    console.log('🔍 Starting comprehensive component audit...\n');

    const components = readdirSync(this.componentsPath).filter((name) =>
      existsSync(join(this.componentsPath, name, `usa-${name}.ts`))
    );

    for (const componentName of components) {
      await this.auditComponent(componentName);
    }

    this.generateReport();
    this.generateFixScript();
  }

  async auditComponent(componentName) {
    const componentFile = join(this.componentsPath, componentName, `usa-${componentName}.ts`);
    const content = readFileSync(componentFile, 'utf-8');

    const issues = [];

    // Run all audit checks
    for (const check of AUDIT_CHECKS) {
      if (check.pattern) {
        // Regex-based check
        const matches = content.match(check.pattern);
        if (matches) {
          issues.push({
            type: check.name,
            description: check.description,
            matches: matches.slice(0, 3),
            fix: check.fix,
            severity: check.severity,
          });
        }
      } else if (check.check) {
        // Custom function check
        const customIssues = check.check(content, componentName);
        if (customIssues.length > 0) {
          issues.push({
            type: check.name,
            description: check.description,
            customIssues: customIssues.slice(0, 3),
            fix: check.fix,
            severity: check.severity,
          });
        }
      }
    }

    // Store results
    this.auditResults.set(componentName, {
      file: componentFile,
      issues: issues,
      linesOfCode: content.split('\n').length,
    });

    // Progress indicator
    const issueCount = issues.length;
    const status = issueCount === 0 ? '✅' : issueCount <= 2 ? '⚠️' : '❌';
    console.log(`${status} ${componentName}: ${issueCount} issues found`);
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPONENT AUDIT REPORT');
    console.log('='.repeat(80));

    let totalIssues = 0;
    let highSeverityCount = 0;
    let mediumSeverityCount = 0;

    // Summary stats
    for (const [, results] of this.auditResults) {
      totalIssues += results.issues.length;

      for (const issue of results.issues) {
        if (issue.severity === 'high') highSeverityCount++;
        else if (issue.severity === 'medium') mediumSeverityCount++;
      }
    }

    console.log(`\n📈 SUMMARY:`);
    console.log(`   • Components audited: ${this.auditResults.size}`);
    console.log(`   • Total issues: ${totalIssues}`);
    console.log(`   • High severity: ${highSeverityCount} 🔴`);
    console.log(`   • Medium severity: ${mediumSeverityCount} 🟡`);

    // Detailed results
    console.log('\n📋 DETAILED RESULTS:\n');

    for (const [componentName, results] of this.auditResults) {
      if (results.issues.length === 0) continue;

      console.log(`🔍 ${componentName.toUpperCase()}`);
      console.log(`   File: src/components/${componentName}/usa-${componentName}.ts`);
      console.log(`   Issues: ${results.issues.length}`);

      for (const issue of results.issues) {
        const severityIcon = issue.severity === 'high' ? '🔴' : '🟡';
        console.log(`   ${severityIcon} ${issue.type}`);
        console.log(`      ${issue.description}`);
        console.log(`      Fix: ${issue.fix}`);

        if (issue.matches) {
          console.log(`      Examples: ${issue.matches.slice(0, 2).join(', ')}...`);
        }

        if (issue.customIssues) {
          console.log(`      Details: ${JSON.stringify(issue.customIssues.slice(0, 2), null, 2)}`);
        }

        console.log('');
      }
    }

    // Priority recommendations
    console.log('='.repeat(80));
    console.log('🎯 PRIORITY ACTIONS:');

    if (highSeverityCount > 0) {
      console.log('\n1. 🔴 HIGH PRIORITY - Fix these first:');
      console.log('   • Remove custom SVG icons (use USWDS CSS icons)');
      console.log('   • Update deprecated class names');
      console.log('   • Fix button content to use only "&nbsp;"');
    }

    if (mediumSeverityCount > 0) {
      console.log('\n2. 🟡 MEDIUM PRIORITY:');
      console.log('   • Fix ARIA attribute patterns');
      console.log('   • Review custom CSS usage');
    }

    console.log('\n3. 📋 PREVENTION:');
    console.log('   • Run "npm run uswds:validate" before commits');
    console.log('   • Add USWDS compliance checks to CI/CD');

    // Save detailed report
    this.saveDetailedReport();
  }

  saveDetailedReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        componentsAudited: this.auditResults.size,
        totalIssues: Array.from(this.auditResults.values()).reduce(
          (sum, result) => sum + result.issues.length,
          0
        ),
      },
      components: Object.fromEntries(this.auditResults),
    };

    const reportPath = join(__dirname, '../reports/component-audit-report.json');
    writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Detailed report saved: ${reportPath}`);
  }

  generateFixScript() {
    console.log('\n📝 Generating automated fix script...');

    let fixScript = `#!/bin/bash
# Auto-generated USWDS Compliance Fix Script
# Generated: ${new Date().toISOString()}

echo "🔧 Applying USWDS compliance fixes..."

`;

    for (const [componentName, results] of this.auditResults) {
      if (results.issues.length === 0) continue;

      fixScript += `
# Fixes for ${componentName}
echo "Fixing ${componentName}..."
`;

      for (const issue of results.issues) {
        if (issue.type === 'Deprecated Class Names') {
          fixScript += `sed -i '' 's/usa-combo-box__toggle-button/usa-combo-box__toggle-list/g' "${results.file}"
sed -i '' 's/usa-combo-box__clear-button/usa-combo-box__clear-input/g' "${results.file}"
`;
        }

        if (issue.type === 'Custom SVG Icons') {
          fixScript += `# Manual fix required: Remove custom SVG icons from ${results.file}
echo "⚠️  Manual fix needed: Remove custom SVG icons from ${componentName}"
`;
        }
      }
    }

    fixScript += `
echo "✅ Automated fixes applied. Manual review required for some issues."
echo "💡 Run 'npm run uswds:validate' to verify fixes."
`;

    const fixScriptPath = join(__dirname, '../scripts/apply-uswds-fixes.sh');
    writeFileSync(fixScriptPath, fixScript);
    console.log(`💾 Fix script generated: ${fixScriptPath}`);
  }
}

// Run audit
const auditor = new ComponentAuditor();
auditor.auditAllComponents().catch(console.error);
