#!/usr/bin/env node

/**
 * Test Complex Components Against USWDS Behavior
 *
 * Tests the functionality of complex components to identify
 * where they differ from USWDS behavior.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComplexComponentTester {
  constructor() {
    this.srcDir = path.join(__dirname, '../../src/components');
    this.complexComponents = [
      'in-page-navigation',
      'date-picker',
      'combo-box',
      'file-input',
      'accordion',
      'modal',
      'header',
      'step-indicator',
      'side-navigation'
    ];
    this.issues = [];
  }

  /**
   * Test all complex components for USWDS alignment issues
   */
  async testAllComponents() {
    console.log('🔍 Testing complex components for USWDS behavioral alignment...\n');

    for (const component of this.complexComponents) {
      await this.testComponent(component);
    }

    this.generateReport();
  }

  /**
   * Test a specific component for USWDS behavioral issues
   */
  async testComponent(componentName) {
    console.log(`📊 Testing ${componentName}...`);

    const componentFile = path.join(this.srcDir, componentName, `usa-${componentName}.ts`);

    if (!fs.existsSync(componentFile)) {
      console.log(`  ⚠️  Component file not found`);
      return;
    }

    const content = fs.readFileSync(componentFile, 'utf8');
    const issues = [];

    // Test 1: Check for proper USWDS JavaScript integration
    const hasUSWDSIntegration = this.testUSWDSIntegration(content, componentName);
    if (!hasUSWDSIntegration.passing) {
      issues.push(...hasUSWDSIntegration.issues);
    }

    // Test 2: Check for proper event handling
    const hasEventHandling = this.testEventHandling(content, componentName);
    if (!hasEventHandling.passing) {
      issues.push(...hasEventHandling.issues);
    }

    // Test 3: Check for accessibility implementation
    const hasAccessibility = this.testAccessibilityFeatures(content, componentName);
    if (!hasAccessibility.passing) {
      issues.push(...hasAccessibility.issues);
    }

    // Test 4: Check for component-specific behavior
    const hasBehavior = this.testComponentSpecificBehavior(content, componentName);
    if (!hasBehavior.passing) {
      issues.push(...hasBehavior.issues);
    }

    if (issues.length > 0) {
      console.log(`  ❌ Found ${issues.length} issue(s)`);
      this.issues.push({
        component: componentName,
        issues: issues
      });
    } else {
      console.log(`  ✅ No major issues found`);
    }
  }

  /**
   * Test USWDS JavaScript integration
   */
  testUSWDSIntegration(content, componentName) {
    const issues = [];
    let passing = true;

    // Check for USWDS integration pattern
    if (!content.includes('USWDS') || !content.includes('.on(this)')) {
      issues.push('Missing USWDS JavaScript integration pattern');
      passing = false;
    }

    // Check for proper cleanup
    if (!content.includes('disconnectedCallback') || !content.includes('.off(this)')) {
      issues.push('Missing USWDS cleanup in disconnectedCallback');
      passing = false;
    }

    return { passing, issues };
  }

  /**
   * Test event handling implementation
   */
  testEventHandling(content, componentName) {
    const issues = [];
    let passing = true;

    // Component-specific event requirements
    const eventRequirements = {
      'in-page-navigation': ['scroll', 'click'],
      'date-picker': ['input', 'change', 'keydown'],
      'combo-box': ['input', 'keydown', 'blur'],
      'file-input': ['change', 'dragover', 'drop'],
      'accordion': ['click', 'keydown'],
      'modal': ['click', 'keydown', 'keyup'],
      'header': ['click', 'keydown'],
      'step-indicator': ['click'],
      'side-navigation': ['click', 'keydown']
    };

    const required = eventRequirements[componentName] || [];

    for (const event of required) {
      if (!content.includes(`${event}`) && !content.includes(`@${event}`)) {
        issues.push(`Missing ${event} event handling`);
        passing = false;
      }
    }

    return { passing, issues };
  }

  /**
   * Test accessibility features
   */
  testAccessibilityFeatures(content, componentName) {
    const issues = [];
    let passing = true;

    // Check for essential ARIA attributes
    const ariaPatterns = ['aria-', 'role=', 'tabindex'];
    let ariaCount = 0;

    for (const pattern of ariaPatterns) {
      if (content.includes(pattern)) {
        ariaCount++;
      }
    }

    if (ariaCount === 0) {
      issues.push('No ARIA attributes found - accessibility may be incomplete');
      passing = false;
    }

    // Check for keyboard navigation
    if (!content.includes('keydown') && !content.includes('keyup')) {
      issues.push('No keyboard event handling found');
      passing = false;
    }

    return { passing, issues };
  }

  /**
   * Test component-specific behavior requirements
   */
  testComponentSpecificBehavior(content, componentName) {
    const issues = [];
    let passing = true;

    // Component-specific behavior checks
    switch (componentName) {
      case 'in-page-navigation':
        if (!content.includes('IntersectionObserver')) {
          issues.push('Missing IntersectionObserver for scroll tracking');
          passing = false;
        }
        if (!content.includes('setActiveSection') && !content.includes('_activeSection')) {
          issues.push('Missing active section state management');
          passing = false;
        }
        break;

      case 'date-picker':
        if (!content.includes('calendar') && !content.includes('Calendar')) {
          issues.push('Missing calendar functionality');
          passing = false;
        }
        break;

      case 'combo-box':
        if (!content.includes('filter') && !content.includes('search')) {
          issues.push('Missing filtering/search functionality');
          passing = false;
        }
        break;

      case 'file-input':
        if (!content.includes('FileList') || !content.includes('files')) {
          issues.push('Missing file handling functionality');
          passing = false;
        }
        break;

      case 'accordion':
        if (!content.includes('expanded') && !content.includes('toggle')) {
          issues.push('Missing expand/collapse functionality');
          passing = false;
        }
        break;

      case 'modal':
        if (!content.includes('dialog') && !content.includes('showModal')) {
          issues.push('Missing modal dialog functionality');
          passing = false;
        }
        break;
    }

    return { passing, issues };
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n============================================================');
    console.log('📊 COMPLEX COMPONENTS BEHAVIORAL ANALYSIS');
    console.log('============================================================\n');

    if (this.issues.length === 0) {
      console.log('✅ All complex components appear to be functioning correctly');
      return;
    }

    console.log(`🚨 Found issues in ${this.issues.length} component(s):\n`);

    for (const componentIssue of this.issues) {
      console.log(`📋 ${componentIssue.component.toUpperCase()}:`);
      for (const issue of componentIssue.issues) {
        console.log(`   • ${issue}`);
      }
      console.log('');
    }

    console.log('💡 RECOMMENDATIONS:\n');
    console.log('1. Focus on components with the most critical missing functionality');
    console.log('2. Compare implementations with official USWDS JavaScript source');
    console.log('3. Test actual user interactions in Storybook/browser');
    console.log('4. Ensure progressive enhancement works properly');

    // Save detailed report
    const reportPath = path.join(__dirname, '../compliance/complex-components-analysis.json');
    const report = {
      timestamp: new Date().toISOString(),
      componentsAnalyzed: this.complexComponents,
      issuesFound: this.issues,
      summary: {
        totalComponents: this.complexComponents.length,
        componentsWithIssues: this.issues.length,
        totalIssues: this.issues.reduce((sum, comp) => sum + comp.issues.length, 0)
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📋 Detailed report saved: ${reportPath}`);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ComplexComponentTester();
  tester.testAllComponents().catch(console.error);
}

export default ComplexComponentTester;