#!/usr/bin/env node

/**
 * USWDS Component Transformation Performance Monitoring
 *
 * Monitors and reports performance metrics for component transformations:
 * - Transformation timing
 * - Bundle size impact
 * - Memory usage
 * - JavaScript execution time
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceMonitor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {};
    this.performanceThresholds = {
      transformationTime: 1000,   // ms
      bundleLoadTime: 2000,       // ms
      memoryUsage: 50,            // MB
      jsExecutionTime: 500        // ms
    };
  }

  async setup() {
    console.log('⚡ Starting USWDS Performance Monitoring...\n');

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=TranslateUI'
      ]
    });

    this.page = await this.browser.newPage();

    // Enable performance monitoring
    await this.page.evaluateOnNewDocument(() => {
      window.performanceMetrics = {
        transformationTimes: [],
        componentLoadTimes: [],
        memorySnapshots: []
      };

      // Override component registration to measure timing
      const originalCustomElements = window.customElements.define;
      window.customElements.define = function(name, constructor, options) {
        const startTime = performance.now();
        const result = originalCustomElements.call(this, name, constructor, options);
        const endTime = performance.now();

        window.performanceMetrics.componentLoadTimes.push({
          component: name,
          loadTime: endTime - startTime,
          timestamp: Date.now()
        });

        return result;
      };

      // Track memory usage
      if ('memory' in performance) {
        setInterval(() => {
          window.performanceMetrics.memorySnapshots.push({
            used: performance.memory.usedJSHeapSize / 1024 / 1024, // MB
            total: performance.memory.totalJSHeapSize / 1024 / 1024, // MB
            timestamp: Date.now()
          });
        }, 1000);
      }
    });
  }

  async measureComponentPerformance(componentName, testConfig) {
    console.log(`📊 Measuring ${componentName} performance...`);

    const startTime = Date.now();

    try {
      // Clear previous metrics
      await this.page.evaluate(() => {
        window.performanceMetrics = {
          transformationTimes: [],
          componentLoadTimes: [],
          memorySnapshots: []
        };
      });

      // Start performance monitoring
      await this.page.evaluate(() => {
        performance.mark('test-start');
      });

      // Load component
      await this.page.setContent(testConfig.html);

      // Wait for component to load
      await this.page.waitForSelector(componentName, { timeout: 5000 });

      // Mark component loaded
      await this.page.evaluate(() => {
        performance.mark('component-loaded');
      });

      // Wait for USWDS transformation
      let transformationCompleted = false;
      const transformationStartTime = Date.now();

      if (testConfig.waitForSelector) {
        try {
          await this.page.waitForSelector(testConfig.waitForSelector, { timeout: 3000 });
          transformationCompleted = true;
        } catch (e) {
          console.log(`  ⚠️ Transformation timeout for ${componentName}`);
        }
      }

      const transformationEndTime = Date.now();
      const transformationTime = transformationEndTime - transformationStartTime;

      // Mark transformation completed
      await this.page.evaluate(() => {
        performance.mark('transformation-completed');
      });

      // Measure additional interactions if specified
      let interactionTime = 0;
      if (testConfig.interactionSteps && transformationCompleted) {
        const interactionStartTime = Date.now();

        for (const step of testConfig.interactionSteps) {
          await this.executeInteractionStep(step);
        }

        interactionTime = Date.now() - interactionStartTime;
      }

      // Collect performance metrics
      const metrics = await this.page.evaluate(() => {
        const entries = performance.getEntriesByType('navigation')[0];
        const marks = performance.getEntriesByType('mark');
        const measures = performance.getEntriesByType('measure');

        return {
          navigation: {
            domContentLoaded: entries.domContentLoadedEventEnd - entries.domContentLoadedEventStart,
            loadComplete: entries.loadEventEnd - entries.loadEventStart,
            totalTime: entries.loadEventEnd - entries.navigationStart
          },
          marks: marks.map(mark => ({ name: mark.name, time: mark.startTime })),
          measures: measures.map(measure => ({
            name: measure.name,
            duration: measure.duration,
            start: measure.startTime
          })),
          memory: window.performanceMetrics.memorySnapshots,
          componentLoad: window.performanceMetrics.componentLoadTimes,
          customMetrics: window.performanceMetrics
        };
      });

      // Calculate bundle size impact
      const resourceMetrics = await this.page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        let totalSize = 0;
        let jsSize = 0;
        let cssSize = 0;

        resources.forEach(resource => {
          if (resource.transferSize) {
            totalSize += resource.transferSize;
            if (resource.name.includes('.js')) {
              jsSize += resource.transferSize;
            } else if (resource.name.includes('.css')) {
              cssSize += resource.transferSize;
            }
          }
        });

        return { totalSize, jsSize, cssSize, resourceCount: resources.length };
      });

      // Compile results
      const componentResults = {
        component: componentName,
        timestamp: new Date().toISOString(),
        performance: {
          transformationTime,
          transformationCompleted,
          interactionTime,
          totalTestTime: Date.now() - startTime,
          navigation: metrics.navigation,
          bundleImpact: resourceMetrics,
          memoryUsage: this.calculateMemoryMetrics(metrics.memory),
          componentLoadTime: metrics.componentLoad.find(c => c.component === componentName)?.loadTime || 0
        },
        thresholds: this.evaluateThresholds(componentName, transformationTime, resourceMetrics, metrics.memory)
      };

      this.results[componentName] = componentResults;

      // Report immediate results
      this.reportComponentResults(componentResults);

      return componentResults;

    } catch (error) {
      console.log(`  ❌ Performance measurement failed for ${componentName}:`, error.message);
      return null;
    }
  }

  async executeInteractionStep(step) {
    switch (step.action) {
      case 'click':
        await this.page.click(step.selector);
        break;
      case 'type':
        await this.page.type(step.selector, step.text);
        break;
      case 'hover':
        await this.page.hover(step.selector);
        break;
      case 'wait':
        await this.page.waitForDelay(step.duration);
        break;
    }
  }

  calculateMemoryMetrics(memorySnapshots) {
    if (!memorySnapshots || memorySnapshots.length === 0) {
      return { peak: 0, average: 0, growth: 0 };
    }

    const used = memorySnapshots.map(s => s.used);
    const peak = Math.max(...used);
    const average = used.reduce((a, b) => a + b, 0) / used.length;
    const growth = used[used.length - 1] - used[0];

    return { peak, average, growth, snapshots: memorySnapshots.length };
  }

  evaluateThresholds(componentName, transformationTime, resourceMetrics, memorySnapshots) {
    const memoryMetrics = this.calculateMemoryMetrics(memorySnapshots);

    return {
      transformationTime: {
        value: transformationTime,
        threshold: this.performanceThresholds.transformationTime,
        passed: transformationTime <= this.performanceThresholds.transformationTime,
        status: transformationTime <= this.performanceThresholds.transformationTime ? 'PASS' : 'WARN'
      },
      bundleSize: {
        value: resourceMetrics.jsSize,
        threshold: 100000, // 100KB
        passed: resourceMetrics.jsSize <= 100000,
        status: resourceMetrics.jsSize <= 100000 ? 'PASS' : 'WARN'
      },
      memoryUsage: {
        value: memoryMetrics.peak,
        threshold: this.performanceThresholds.memoryUsage,
        passed: memoryMetrics.peak <= this.performanceThresholds.memoryUsage,
        status: memoryMetrics.peak <= this.performanceThresholds.memoryUsage ? 'PASS' : 'WARN'
      }
    };
  }

  reportComponentResults(results) {
    const perf = results.performance;
    const thresh = results.thresholds;

    console.log(`  📈 Performance Results for ${results.component}:`);
    console.log(`    ⏱️ Transformation: ${perf.transformationTime}ms (${thresh.transformationTime.status})`);
    console.log(`    📦 Bundle Impact: ${Math.round(perf.bundleImpact.jsSize / 1024)}KB (${thresh.bundleSize.status})`);
    console.log(`    🧠 Memory Peak: ${perf.memoryUsage.peak.toFixed(1)}MB (${thresh.memoryUsage.status})`);
    console.log(`    🎯 Component Load: ${perf.componentLoadTime.toFixed(1)}ms`);
    console.log(`    🔄 Interaction: ${perf.interactionTime}ms`);

    if (!perf.transformationCompleted) {
      console.log(`    ⚠️ Warning: Transformation did not complete within timeout`);
    }
  }

  async runPerformanceTests() {
    const testConfigs = {
      'usa-combo-box': {
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <base href="http://localhost:5173/">
            <script type="module">import './src/components/combo-box/index.ts';</script>
          </head>
          <body>
            <usa-combo-box label="Performance Test" name="perf-test"></usa-combo-box>
            <script>
              const combo = document.querySelector('usa-combo-box');
              combo.options = Array.from({length: 100}, (_, i) => ({
                value: \`option-\${i}\`,
                label: \`Option \${i + 1}\`
              }));
            </script>
          </body>
          </html>
        `,
        waitForSelector: '.usa-combo-box__input',
        interactionSteps: [
          { action: 'click', selector: '.usa-combo-box__input' },
          { action: 'type', selector: '.usa-combo-box__input', text: 'Option' },
          { action: 'wait', duration: 200 }
        ]
      },

      'usa-time-picker': {
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <base href="http://localhost:5173/">
            <script type="module">import './src/components/time-picker/index.ts';</script>
          </head>
          <body>
            <usa-time-picker label="Performance Test" name="perf-test"></usa-time-picker>
          </body>
          </html>
        `,
        waitForSelector: '.usa-combo-box__input',
        interactionSteps: [
          { action: 'click', selector: '.usa-combo-box__input' },
          { action: 'type', selector: '.usa-combo-box__input', text: '2:30' },
          { action: 'wait', duration: 200 }
        ]
      },

      'usa-date-picker': {
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <base href="http://localhost:5173/">
            <script type="module">import './src/components/date-picker/index.ts';</script>
          </head>
          <body>
            <usa-date-picker label="Performance Test" name="perf-test"></usa-date-picker>
          </body>
          </html>
        `,
        waitForSelector: '.usa-date-picker__button',
        interactionSteps: [
          { action: 'click', selector: '.usa-date-picker__button' },
          { action: 'wait', duration: 300 }
        ]
      }
    };

    for (const [componentName, config] of Object.entries(testConfigs)) {
      await this.measureComponentPerformance(componentName, config);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('⚡ USWDS Component Performance Report');
    console.log('='.repeat(60));

    let allPassed = true;
    const summary = {
      totalComponents: Object.keys(this.results).length,
      passedThresholds: 0,
      warnings: [],
      recommendations: []
    };

    for (const [component, results] of Object.entries(this.results)) {
      console.log(`\n📦 ${component.toUpperCase()}`);

      let componentPassed = true;
      const thresholds = results.thresholds;

      for (const [metric, result] of Object.entries(thresholds)) {
        const status = result.status === 'PASS' ? '✅' : '⚠️';
        console.log(`   ${status} ${metric}: ${result.value}${metric === 'transformationTime' ? 'ms' : metric === 'bundleSize' ? 'B' : 'MB'} (threshold: ${result.threshold})`);

        if (result.status !== 'PASS') {
          componentPassed = false;
          summary.warnings.push(`${component}: ${metric} exceeded threshold`);
        }
      }

      if (componentPassed) {
        summary.passedThresholds++;
      } else {
        allPassed = false;
      }

      // Add recommendations
      if (results.performance.transformationTime > 500) {
        summary.recommendations.push(`${component}: Consider optimizing USWDS initialization`);
      }
      if (results.performance.bundleImpact.jsSize > 50000) {
        summary.recommendations.push(`${component}: Bundle size impact is significant`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Components Tested: ${summary.totalComponents}`);
    console.log(`   Passed All Thresholds: ${summary.passedThresholds}`);
    console.log(`   Performance Status: ${allPassed ? '✅ EXCELLENT' : '⚠️ NEEDS ATTENTION'}`);

    if (summary.warnings.length > 0) {
      console.log('\n⚠️ Performance Warnings:');
      summary.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    if (summary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      summary.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }

    // Save detailed report
    this.saveDetailedReport();

    return allPassed ? 0 : 1;
  }

  saveDetailedReport() {
    const reportPath = path.join(process.cwd(), '__tests__', 'performance-report.json');
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalComponents: Object.keys(this.results).length,
        testDuration: Date.now()
      },
      results: this.results,
      thresholds: this.performanceThresholds
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📁 Detailed report saved: ${reportPath}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.setup();
      await this.runPerformanceTests();
      return this.generateReport();
    } catch (error) {
      console.error('❌ Performance monitoring failed:', error);
      return 1;
    } finally {
      await this.cleanup();
    }
  }
}

// Run performance monitoring
async function runPerformanceMonitoring() {
  const monitor = new PerformanceMonitor();
  const exitCode = await monitor.run();
  process.exit(exitCode);
}

// CLI handling
if (process.argv.includes('--help')) {
  console.log(`
USWDS Component Performance Monitoring

Usage:
  node scripts/performance-monitoring.js

Monitors and reports:
- Component transformation timing
- Bundle size impact
- Memory usage patterns
- JavaScript execution performance

Generates detailed performance report in __tests__/performance-report.json
`);
  process.exit(0);
}

// Check if we're being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceMonitoring();
}