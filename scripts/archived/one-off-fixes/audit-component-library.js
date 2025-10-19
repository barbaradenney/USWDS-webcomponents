#!/usr/bin/env node

/**
 * Component Library Audit Script
 *
 * Comprehensive audit of all components against minimal wrapper principles.
 * Generates detailed report with prioritized remediation plan.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OverEngineeringDetector } from './detect-over-engineering.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComponentLibraryAuditor {
  constructor() {
    this.auditResults = {
      critical: [],      // Must fix - blocks proper USWDS behavior
      high: [],          // Should fix - violates minimal wrapper principle
      medium: [],        // Consider fixing - improves maintainability
      low: [],           // Nice to have - minor improvements
      compliant: []      // Already following best practices
    };
    this.componentDetails = new Map();
  }

  async conductAudit() {
    console.log('🏥 Starting Comprehensive Component Library Audit');
    console.log('=' .repeat(60));
    console.log('Evaluating all components against minimal wrapper principles...\n');

    await this.analyzeAllComponents();
    await this.generateRemediationPlan();
    await this.createAuditReport();
  }

  async analyzeAllComponents() {
    const componentsDir = path.join(__dirname, '../../src/components');
    const componentDirs = fs.readdirSync(componentsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`📊 Analyzing ${componentDirs.length} components...\n`);

    for (const componentDir of componentDirs) {
      await this.analyzeComponent(componentDir);
    }
  }

  async analyzeComponent(componentName) {
    const componentPath = path.join(__dirname, '../../src/components', componentName);
    const tsFile = path.join(componentPath, `usa-${componentName}.ts`);

    if (!fs.existsSync(tsFile)) {
      return;
    }

    const content = fs.readFileSync(tsFile, 'utf-8');
    const analysis = this.performDetailedAnalysis(componentName, content);

    this.componentDetails.set(componentName, analysis);
    this.categorizeComponent(componentName, analysis);
  }

  performDetailedAnalysis(componentName, content) {
    const lines = content.split('\n');
    const lineCount = lines.length;

    return {
      name: componentName,
      lineCount,
      size: this.getSizeCategory(lineCount),
      patterns: {
        // Over-engineering indicators
        customEventListeners: this.countPattern(content, /addEventListener\(['"](?:click|scroll|keydown|keyup)/g),
        customHandlers: this.countPattern(content, /private\s+(?:handle|setup|manage)(?:Click|Scroll|Key|Navigation|Custom)/g),
        preventDefaults: this.countPattern(content, /event\.preventDefault\(\)/g),
        customScrolling: this.countPattern(content, /window\.scrollTo\(/g),
        positionCalculations: this.countPattern(content, /offsetTop|offsetLeft|getBoundingClientRect/g),
        modeSwitch: this.countPattern(content, /(?:if|switch).*(?:mode|sections?\.length|manual)/g),

        // Good patterns
        uswdsImports: this.countPattern(content, /import.*@uswds\/uswds\/js/g),
        uswdsInitialization: this.countPattern(content, /\.on\(this\)|initializeUSWDS/g),
        webComponentManaged: content.includes('data-web-component-managed'),
        lightDOM: content.includes('createRenderRoot'),

        // Component type
        isInteractive: this.isInteractiveComponent(content),
        isPresentational: this.isPresentationalComponent(componentName),
      },
      violations: this.identifyViolations(componentName, content),
      recommendations: this.generateRecommendations(componentName, content)
    };
  }

  getSizeCategory(lineCount) {
    if (lineCount > 500) return 'oversized';
    if (lineCount > 300) return 'large';
    if (lineCount > 150) return 'medium';
    return 'small';
  }

  countPattern(content, pattern) {
    const matches = content.match(pattern);
    return matches ? matches.length : 0;
  }

  isInteractiveComponent(content) {
    const interactiveIndicators = [
      /accordion|modal|combo-box|date-picker|file-input|menu|in-page-navigation|time-picker/i,
      /@uswds\/uswds\/js/,
      /connectedCallback.*initialize/
    ];
    return interactiveIndicators.some(pattern => pattern.test(content));
  }

  isPresentationalComponent(componentName) {
    const presentationalComponents = [
      'card', 'alert', 'banner', 'breadcrumb', 'button', 'icon', 'tag',
      'list', 'prose', 'section', 'summary-box', 'identifier'
    ];
    return presentationalComponents.includes(componentName);
  }

  identifyViolations(componentName, content) {
    const violations = [];

    // Critical violations - break USWDS behavior
    if (this.countPattern(content, /window\.scrollTo\(/g) > 0) {
      violations.push({
        severity: 'critical',
        type: 'custom-scroll',
        message: 'Custom scroll behavior conflicts with USWDS navigation'
      });
    }

    if (this.countPattern(content, /addEventListener.*click/g) > 0 && this.isInteractiveComponent(content)) {
      violations.push({
        severity: 'critical',
        type: 'custom-click-handlers',
        message: 'Custom click handlers prevent USWDS from managing interactions'
      });
    }

    // High severity - violates minimal wrapper principle
    if (this.countPattern(content, /private\s+handle(?:Click|Scroll|Key)/g) > 0) {
      violations.push({
        severity: 'high',
        type: 'custom-interaction-methods',
        message: 'Custom interaction methods violate minimal wrapper principle'
      });
    }

    // Medium severity - complexity issues
    if (content.split('\n').length > 400) {
      violations.push({
        severity: 'medium',
        type: 'component-size',
        message: 'Component too large - consider simplification or USWDS delegation'
      });
    }

    // Check for mode switching
    if (this.countPattern(content, /if.*(?:sections|manual|mode)/g) > 1) {
      violations.push({
        severity: 'medium',
        type: 'mode-switching',
        message: 'Complex mode switching - consider unified USWDS approach'
      });
    }

    return violations;
  }

  generateRecommendations(componentName, content) {
    const recommendations = [];

    // Missing USWDS integration
    if (this.isInteractiveComponent(content) && !content.includes('@uswds/uswds/js')) {
      recommendations.push({
        priority: 'high',
        action: 'Add USWDS JavaScript integration',
        description: `Import and initialize @uswds/uswds/js/usa-${componentName} module`
      });
    }

    // Remove custom handlers
    if (this.countPattern(content, /addEventListener.*(?:click|scroll|key)/g) > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Remove custom event handlers',
        description: 'Let USWDS handle all user interactions natively'
      });
    }

    // Simplify large components
    if (content.split('\n').length > 400) {
      recommendations.push({
        priority: 'medium',
        action: 'Simplify component structure',
        description: 'Research USWDS capabilities to reduce custom logic'
      });
    }

    // Add missing attributes
    if (!content.includes('data-web-component-managed')) {
      recommendations.push({
        priority: 'low',
        action: 'Add web component managed attribute',
        description: 'Add data-web-component-managed="true" in connectedCallback'
      });
    }

    return recommendations;
  }

  categorizeComponent(componentName, analysis) {
    const criticalViolations = analysis.violations.filter(v => v.severity === 'critical');
    const highViolations = analysis.violations.filter(v => v.severity === 'high');
    const mediumViolations = analysis.violations.filter(v => v.severity === 'medium');

    if (criticalViolations.length > 0) {
      this.auditResults.critical.push(componentName);
    } else if (highViolations.length > 0) {
      this.auditResults.high.push(componentName);
    } else if (mediumViolations.length > 0) {
      this.auditResults.medium.push(componentName);
    } else if (analysis.violations.length > 0) {
      this.auditResults.low.push(componentName);
    } else {
      this.auditResults.compliant.push(componentName);
    }
  }

  async generateRemediationPlan() {
    const plan = {
      phase1: { title: 'Critical Fixes (Week 1)', components: this.auditResults.critical },
      phase2: { title: 'High Priority (Week 2-3)', components: this.auditResults.high },
      phase3: { title: 'Medium Priority (Week 4-6)', components: this.auditResults.medium },
      phase4: { title: 'Low Priority (Ongoing)', components: this.auditResults.low }
    };

    console.log('📋 REMEDIATION PLAN');
    console.log('=' .repeat(60));

    for (const [phase, data] of Object.entries(plan)) {
      if (data.components.length > 0) {
        console.log(`\n${data.title}:`);
        console.log(`Components: ${data.components.join(', ')} (${data.components.length} total)`);

        // Show example violations for first component in each phase
        if (data.components.length > 0) {
          const firstComponent = data.components[0];
          const analysis = this.componentDetails.get(firstComponent);
          console.log(`Example violations in ${firstComponent}:`);
          analysis.violations.slice(0, 2).forEach(v => {
            console.log(`  - ${v.message}`);
          });
        }
      }
    }

    console.log(`\n✅ Already Compliant: ${this.auditResults.compliant.join(', ')} (${this.auditResults.compliant.length} total)\n`);
  }

  async createAuditReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.componentDetails.size,
        critical: this.auditResults.critical.length,
        high: this.auditResults.high.length,
        medium: this.auditResults.medium.length,
        low: this.auditResults.low.length,
        compliant: this.auditResults.compliant.length
      },
      components: Object.fromEntries(this.componentDetails),
      remediationPlan: this.auditResults
    };

    // Write detailed report
    const reportPath = path.join(__dirname, '../audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

    // Generate summary markdown
    const markdownReport = this.generateMarkdownSummary(reportData);
    const markdownPath = path.join(__dirname, '../AUDIT_REPORT.md');
    fs.writeFileSync(markdownPath, markdownReport);

    console.log('📊 AUDIT COMPLETE');
    console.log('=' .repeat(60));
    console.log(`📄 Detailed report saved to: audit-report.json`);
    console.log(`📝 Summary report saved to: AUDIT_REPORT.md`);
    console.log(`🎯 Ready to begin remediation in phases`);
  }

  generateMarkdownSummary(reportData) {
    return `# Component Library Audit Report

Generated: ${new Date(reportData.timestamp).toLocaleString()}

## Executive Summary

- **Total Components**: ${reportData.summary.total}
- **Compliant**: ${reportData.summary.compliant} (${Math.round(reportData.summary.compliant/reportData.summary.total*100)}%)
- **Need Attention**: ${reportData.summary.total - reportData.summary.compliant} (${Math.round((reportData.summary.total - reportData.summary.compliant)/reportData.summary.total*100)}%)

## Priority Breakdown

| Priority | Count | Components |
|----------|-------|------------|
| 🚨 Critical | ${reportData.summary.critical} | ${this.auditResults.critical.join(', ') || 'None'} |
| ⚠️ High | ${reportData.summary.high} | ${this.auditResults.high.join(', ') || 'None'} |
| 📝 Medium | ${reportData.summary.medium} | ${this.auditResults.medium.join(', ') || 'None'} |
| 💡 Low | ${reportData.summary.low} | ${this.auditResults.low.join(', ') || 'None'} |
| ✅ Compliant | ${reportData.summary.compliant} | ${this.auditResults.compliant.join(', ') || 'None'} |

## Remediation Timeline

### Phase 1: Critical Fixes (Week 1)
**Must fix immediately** - These components have patterns that actively conflict with USWDS behavior.

Components: ${this.auditResults.critical.join(', ') || 'None'}

### Phase 2: High Priority (Weeks 2-3)
**Should fix soon** - These violate the minimal wrapper principle significantly.

Components: ${this.auditResults.high.join(', ') || 'None'}

### Phase 3: Medium Priority (Weeks 4-6)
**Consider fixing** - These have complexity or maintainability issues.

Components: ${this.auditResults.medium.join(', ') || 'None'}

### Phase 4: Low Priority (Ongoing)
**Nice to have** - Minor improvements for consistency.

Components: ${this.auditResults.low.join(', ') || 'None'}

## Next Steps

1. **Start with Critical components** - These block proper USWDS functionality
2. **Research USWDS source** for each component before making changes
3. **Remove custom event handlers** and let USWDS manage interactions
4. **Ensure consistent USWDS initialization** across all components
5. **Test thoroughly** after each component remediation
6. **Run \`npm run detect:over-engineering\`** to validate fixes

## Guidelines Reference

See CLAUDE.md Over-Engineering Prevention Guidelines for detailed remediation patterns and examples.
`;
  }
}

// Main execution
async function main() {
  const auditor = new ComponentLibraryAuditor();
  await auditor.conductAudit();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ComponentLibraryAuditor };