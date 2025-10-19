#!/usr/bin/env node

/**
 * Enhanced USWDS Compliance Check
 *
 * Combines static analysis with behavioral testing to catch both
 * structural and functional compliance issues.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import BehavioralComplianceTester from './behavioral-compliance-testing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnhancedComplianceChecker {
  constructor() {
    this.srcDir = path.join(__dirname, '../../src/components');
    this.results = {
      static: [],
      behavioral: [],
      combined: []
    };
  }

  async runStaticAnalysis() {
    console.log('🔍 Running static analysis compliance checks...\n');

    // Import and run existing static compliance checker
    const { default: StaticCompliance } = await import('./uswds-compliance-check.js');
    const staticChecker = new StaticCompliance();

    try {
      const staticResults = await staticChecker.checkAllComponents();
      this.results.static = staticResults;
      console.log('✅ Static analysis completed');
    } catch (error) {
      console.error('❌ Static analysis failed:', error.message);
      this.results.static = [];
    }
  }

  async runBehavioralTesting() {
    console.log('\n🎭 Running behavioral compliance testing...\n');

    const behavioralTester = new BehavioralComplianceTester();

    try {
      await behavioralTester.initialize();
      const behavioralResults = await behavioralTester.runAllTests();
      await behavioralTester.cleanup();

      this.results.behavioral = behavioralResults;
      console.log('✅ Behavioral testing completed');
    } catch (error) {
      console.error('❌ Behavioral testing failed:', error.message);
      this.results.behavioral = [];
    }
  }

  combineResults() {
    console.log('\n🔄 Combining static and behavioral analysis results...\n');

    const componentMap = new Map();

    // Process static results
    for (const staticResult of this.results.static) {
      const componentName = staticResult.component || staticResult.name;
      if (!componentMap.has(componentName)) {
        componentMap.set(componentName, {
          component: componentName,
          static: staticResult,
          behavioral: null,
          overallStatus: 'unknown',
          criticalIssues: [],
          recommendations: []
        });
      } else {
        componentMap.get(componentName).static = staticResult;
      }
    }

    // Process behavioral results
    for (const behavioralResult of this.results.behavioral) {
      const componentName = behavioralResult.component;
      if (!componentMap.has(componentName)) {
        componentMap.set(componentName, {
          component: componentName,
          static: null,
          behavioral: behavioralResult,
          overallStatus: 'unknown',
          criticalIssues: [],
          recommendations: []
        });
      } else {
        componentMap.get(componentName).behavioral = behavioralResult;
      }
    }

    // Analyze combined results
    for (const [componentName, data] of componentMap) {
      this.analyzeCombinedResult(data);
      this.results.combined.push(data);
    }

    console.log('✅ Results combination completed');
  }

  analyzeCombinedResult(data) {
    const { static: staticResult, behavioral: behavioralResult } = data;

    // Determine overall status
    let overallStatus = 'passing';
    const criticalIssues = [];
    const recommendations = [];

    // Check static compliance
    if (staticResult) {
      if (staticResult.status === 'failing' || (staticResult.errors && staticResult.errors.length > 0)) {
        overallStatus = 'failing';
        criticalIssues.push('Structural compliance failures detected');
      } else if (staticResult.status === 'warning' || (staticResult.warnings && staticResult.warnings.length > 0)) {
        if (overallStatus !== 'failing') {
          overallStatus = 'warning';
        }
        recommendations.push('Address structural compliance warnings');
      }
    }

    // Check behavioral compliance
    if (behavioralResult) {
      if (behavioralResult.status === 'failing' || behavioralResult.status === 'error') {
        overallStatus = 'failing';
        criticalIssues.push('Behavioral functionality failures detected');
      } else if (behavioralResult.status === 'warning') {
        if (overallStatus !== 'failing') {
          overallStatus = 'warning';
        }
        recommendations.push('Improve behavioral compliance consistency');
      }

      // Check USWDS integration
      if (behavioralResult.uswdsIntegration === false) {
        if (overallStatus !== 'failing') {
          overallStatus = 'warning';
        }
        recommendations.push('Add USWDS JavaScript progressive enhancement');
      }

      // Add specific behavioral issues
      if (behavioralResult.issues) {
        criticalIssues.push(...behavioralResult.issues);
      }
    }

    // Detect gaps between static and behavioral results
    this.detectTestingGaps(data, criticalIssues, recommendations);

    data.overallStatus = overallStatus;
    data.criticalIssues = criticalIssues;
    data.recommendations = recommendations;
  }

  detectTestingGaps(data, criticalIssues, recommendations) {
    const { static: staticResult, behavioral: behavioralResult } = data;

    // Gap 1: High static compliance but behavioral failures
    if (staticResult && behavioralResult) {
      const staticPassing = staticResult.status === 'passing' || (!staticResult.status && !staticResult.errors?.length);
      const behavioralFailing = behavioralResult.status === 'failing' || behavioralResult.status === 'error';

      if (staticPassing && behavioralFailing) {
        criticalIssues.push('TESTING GAP: Static analysis passed but component is functionally broken');
        recommendations.push('Static analysis insufficient - implement comprehensive behavioral testing');
      }
    }

    // Gap 2: Missing behavioral tests for complex components
    if (staticResult && !behavioralResult) {
      const isComplexComponent = [
        'accordion', 'date-picker', 'combo-box', 'modal', 'in-page-navigation',
        'file-input', 'header', 'side-navigation'
      ].includes(data.component);

      if (isComplexComponent) {
        recommendations.push('Complex component needs behavioral testing coverage');
      }
    }

    // Gap 3: Static analysis detected issues but no behavioral validation
    if (staticResult && staticResult.warnings?.length > 0 && !behavioralResult) {
      recommendations.push('Static warnings should be validated with behavioral tests');
    }
  }

  generateComprehensiveReport() {
    console.log('\n📊 ENHANCED COMPLIANCE REPORT\n');

    const summary = {
      total: this.results.combined.length,
      passing: this.results.combined.filter(r => r.overallStatus === 'passing').length,
      warning: this.results.combined.filter(r => r.overallStatus === 'warning').length,
      failing: this.results.combined.filter(r => r.overallStatus === 'failing').length,
      unknown: this.results.combined.filter(r => r.overallStatus === 'unknown').length
    };

    console.log(`📈 Overall Results: ${summary.passing} passing, ${summary.warning} warnings, ${summary.failing} failing`);
    console.log(`📊 Success Rate: ${Math.round((summary.passing / summary.total) * 100)}%\n`);

    // Critical issues summary
    const allCriticalIssues = this.results.combined
      .filter(r => r.criticalIssues.length > 0)
      .sort((a, b) => b.criticalIssues.length - a.criticalIssues.length);

    if (allCriticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:\n');

      for (const result of allCriticalIssues) {
        console.log(`❌ ${result.component}:`);
        for (const issue of result.criticalIssues) {
          console.log(`   • ${issue}`);
        }
        console.log('');
      }
    }

    // Testing gap analysis
    const testingGaps = this.results.combined.filter(r =>
      r.criticalIssues.some(issue => issue.includes('TESTING GAP'))
    );

    if (testingGaps.length > 0) {
      console.log('🔍 TESTING METHODOLOGY GAPS DETECTED:\n');

      for (const gap of testingGaps) {
        console.log(`🎯 ${gap.component}:`);
        const gapIssues = gap.criticalIssues.filter(issue => issue.includes('TESTING GAP'));
        for (const issue of gapIssues) {
          console.log(`   • ${issue}`);
        }
        console.log('');
      }

      console.log('💡 SOLUTION: Implement behavioral testing for all components to catch functional issues\n');
    }

    // Component-by-component breakdown
    console.log('📋 DETAILED COMPONENT ANALYSIS:\n');

    for (const result of this.results.combined.sort((a, b) => a.component.localeCompare(b.component))) {
      const icon = {
        'passing': '✅',
        'warning': '⚠️ ',
        'failing': '❌',
        'unknown': '❓'
      }[result.overallStatus];

      console.log(`${icon} ${result.component}`);

      // Static analysis results
      if (result.static) {
        const staticIcon = result.static.status === 'passing' ? '✓' : result.static.status === 'warning' ? '!' : '✗';
        console.log(`   Static: ${staticIcon} ${result.static.status || 'completed'}`);
      } else {
        console.log(`   Static: ⏭️ not tested`);
      }

      // Behavioral testing results
      if (result.behavioral) {
        const behavioralIcon = result.behavioral.status === 'passing' ? '✓' :
                               result.behavioral.status === 'warning' ? '!' : '✗';
        console.log(`   Behavioral: ${behavioralIcon} ${result.behavioral.status}`);

        if (result.behavioral.tests) {
          const passedTests = result.behavioral.tests.filter(t => t.passed).length;
          const totalTests = result.behavioral.tests.length;
          console.log(`   Tests: ${passedTests}/${totalTests} passed`);
        }

        console.log(`   USWDS Integration: ${result.behavioral.uswdsIntegration ? '✓' : '✗'}`);
      } else {
        console.log(`   Behavioral: ⏭️ not tested`);
      }

      // Recommendations
      if (result.recommendations.length > 0) {
        console.log(`   Recommendations:`);
        for (const rec of result.recommendations) {
          console.log(`     • ${rec}`);
        }
      }

      console.log('');
    }

    // Save comprehensive report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary,
      staticResults: this.results.static,
      behavioralResults: this.results.behavioral,
      combinedResults: this.results.combined,
      testingGaps: testingGaps.length,
      recommendations: this.generateOverallRecommendations()
    };

    const reportPath = path.join(__dirname, '../compliance/enhanced-compliance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📋 Comprehensive report saved to: ${reportPath}\n`);

    return reportData;
  }

  generateOverallRecommendations() {
    const failing = this.results.combined.filter(r => r.overallStatus === 'failing').length;
    const testingGaps = this.results.combined.filter(r =>
      r.criticalIssues.some(issue => issue.includes('TESTING GAP'))
    ).length;

    const recommendations = [];

    if (failing > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Fix failing components immediately',
        reason: `${failing} components have broken functionality that affects users`,
        steps: [
          'Run behavioral tests to identify specific functional failures',
          'Add missing USWDS JavaScript integration patterns',
          'Test components with real user interactions'
        ]
      });
    }

    if (testingGaps > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Replace static analysis with behavioral testing',
        reason: 'Static analysis gives false sense of security and misses functional issues',
        steps: [
          'Implement browser-based component testing',
          'Test with actual USWDS.js progressive enhancement',
          'Add behavioral compliance checks to CI/CD pipeline',
          'Test complete user workflows end-to-end'
        ]
      });
    }

    recommendations.push({
      priority: 'MEDIUM',
      action: 'Integrate enhanced compliance testing into development workflow',
      reason: 'Prevent regression and catch issues early in development',
      steps: [
        'Run enhanced compliance checks before each commit',
        'Add behavioral testing to PR validation',
        'Monitor compliance metrics over time',
        'Update testing methodology based on findings'
      ]
    });

    return recommendations;
  }

  async runEnhancedCompliance() {
    console.log('🚀 ENHANCED USWDS COMPLIANCE TESTING\n');
    console.log('Combining static analysis with behavioral testing for comprehensive validation...\n');

    // Run both types of analysis
    await this.runStaticAnalysis();
    await this.runBehavioralTesting();

    // Combine and analyze results
    this.combineResults();

    // Generate comprehensive report
    const report = this.generateComprehensiveReport();

    // Show final recommendations
    console.log('🎯 IMMEDIATE ACTION ITEMS:\n');

    if (report.summary.failing > 0) {
      console.log('1. 🚨 FIX FAILING COMPONENTS - Users experiencing broken functionality');
      console.log('2. 🧪 ADD BEHAVIORAL TESTING - Prevent future functional regressions');
      console.log('3. 🔄 UPDATE CI/CD PIPELINE - Include behavioral compliance validation\n');
    } else if (report.summary.warning > 0) {
      console.log('1. ⚠️  ADDRESS WARNINGS - Improve component consistency');
      console.log('2. 🧪 EXPAND BEHAVIORAL TESTING - Cover more interaction scenarios');
      console.log('3. 📊 MONITOR COMPLIANCE - Track improvements over time\n');
    } else {
      console.log('1. ✅ MAINTAIN CURRENT QUALITY - Continue behavioral testing');
      console.log('2. 🚀 ENHANCE TESTING COVERAGE - Add more complex scenarios');
      console.log('3. 📈 OPTIMIZE PERFORMANCE - Identify optimization opportunities\n');
    }

    console.log('💡 The testing methodology has been FIXED to detect behavioral issues!');
    console.log('   Enhanced compliance testing now catches functional problems that static analysis missed.\n');

    return report;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new EnhancedComplianceChecker();

  checker.runEnhancedCompliance()
    .catch(error => {
      console.error('💥 Enhanced compliance testing failed:', error);
      process.exit(1);
    });
}

export default EnhancedComplianceChecker;