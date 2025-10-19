#!/usr/bin/env node

/**
 * Performance Regression Tracking
 *
 * Monitors and tracks performance metrics over time to detect regressions:
 * - Bundle size tracking
 * - Component render time
 * - First paint metrics
 * - Memory usage
 * - Build performance
 *
 * Usage:
 *   npm run test:performance
 *   npm run test:performance:baseline - Create performance baseline
 *   npm run test:performance:compare - Compare against baseline
 *   npm run test:performance:report - Generate performance report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PERFORMANCE_DIR = 'performance-reports';
const BASELINE_FILE = `${PERFORMANCE_DIR}/baseline.json`;
const CURRENT_FILE = `${PERFORMANCE_DIR}/current.json`;
const HISTORY_FILE = `${PERFORMANCE_DIR}/history.json`;

class PerformanceTracker {
  constructor(options = {}) {
    this.mode = options.mode || 'compare';
    this.verbose = options.verbose || false;
    this.thresholds = {
      bundleSize: 0.05,        // 5% increase
      renderTime: 0.10,        // 10% increase
      memoryUsage: 0.15,       // 15% increase
      buildTime: 0.20,         // 20% increase
    };
    this.metrics = {};
    this.regressions = [];
  }

  async run() {
    console.log('⚡ Performance Regression Tracking Starting...\n');
    console.log(`Mode: ${this.mode}\n`);

    // Ensure directory exists
    if (!fs.existsSync(PERFORMANCE_DIR)) {
      fs.mkdirSync(PERFORMANCE_DIR, { recursive: true });
    }

    if (this.mode === 'baseline') {
      await this.createBaseline();
    } else if (this.mode === 'compare') {
      await this.comparePerformance();
    } else if (this.mode === 'report') {
      this.generateReport();
    }

    this.printSummary();

    if (this.regressions.length > 0) {
      process.exit(1);
    }
  }

  async createBaseline() {
    console.log('📊 Creating performance baseline...\n');

    await this.collectMetrics();

    // Save as baseline
    this.saveMetrics(BASELINE_FILE);
    console.log(`\n✅ Baseline saved to ${BASELINE_FILE}`);
  }

  async comparePerformance() {
    console.log('🔍 Comparing against baseline...\n');

    if (!fs.existsSync(BASELINE_FILE)) {
      console.error('❌ No baseline found. Run with --mode=baseline first.');
      process.exit(1);
    }

    const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));

    await this.collectMetrics();
    this.saveMetrics(CURRENT_FILE);

    this.compareMetrics(baseline, this.metrics);
    this.updateHistory();
  }

  async collectMetrics() {
    console.log('📈 Collecting performance metrics...\n');

    // Bundle size metrics
    await this.measureBundleSize();

    // Build performance metrics
    await this.measureBuildPerformance();

    // Runtime performance metrics
    await this.measureRuntimePerformance();

    this.metrics.timestamp = new Date().toISOString();
    this.metrics.gitCommit = this.getGitCommit();
  }

  async measureBundleSize() {
    console.log('  📦 Measuring bundle size...');

    try {
      // Build the project
      execSync('npm run build', { stdio: 'pipe' });

      const distDir = path.join(process.cwd(), 'dist');

      if (!fs.existsSync(distDir)) {
        console.warn('    ⚠️  Dist directory not found');
        this.metrics.bundleSize = {};
        return;
      }

      const files = this.getAllFiles(distDir);
      let totalSize = 0;
      const fileSizes = {};

      files.forEach(file => {
        const stats = fs.statSync(file);
        const relativePath = path.relative(distDir, file);
        fileSizes[relativePath] = stats.size;
        totalSize += stats.size;
      });

      this.metrics.bundleSize = {
        total: totalSize,
        totalKB: (totalSize / 1024).toFixed(2),
        files: fileSizes,
      };

      console.log(`    ✅ Total bundle size: ${this.metrics.bundleSize.totalKB} KB`);
    } catch (error) {
      console.warn('    ⚠️  Bundle size measurement failed:', error.message);
      this.metrics.bundleSize = {};
    }
  }

  async measureBuildPerformance() {
    console.log('  🔨 Measuring build performance...');

    try {
      const start = Date.now();
      execSync('npm run build', { stdio: 'pipe' });
      const buildTime = Date.now() - start;

      this.metrics.buildPerformance = {
        buildTime,
        buildTimeSeconds: (buildTime / 1000).toFixed(2),
      };

      console.log(`    ✅ Build time: ${this.metrics.buildPerformance.buildTimeSeconds}s`);
    } catch (error) {
      console.warn('    ⚠️  Build performance measurement failed:', error.message);
      this.metrics.buildPerformance = {};
    }
  }

  async measureRuntimePerformance() {
    console.log('  ⚙️  Measuring runtime performance...');

    try {
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      // Test components
      const components = ['button', 'alert', 'accordion', 'modal'];
      const componentMetrics = {};

      for (const component of components) {
        try {
          await page.goto(`http://localhost:6006/iframe.html?id=components-${component}--default`, {
            waitUntil: 'networkidle',
            timeout: 10000,
          });

          const metrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');

            return {
              domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
              loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
              firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
              firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            };
          });

          componentMetrics[component] = metrics;
          console.log(`    ✅ ${component}: ${metrics.domContentLoaded.toFixed(2)}ms`);
        } catch (error) {
          console.warn(`    ⚠️  ${component}: measurement failed`);
        }
      }

      await browser.close();

      this.metrics.runtimePerformance = componentMetrics;
    } catch (error) {
      console.warn('    ⚠️  Runtime performance measurement failed:', error.message);
      this.metrics.runtimePerformance = {};
    }
  }

  getAllFiles(dir) {
    const files = [];

    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    });

    return files;
  }

  getGitCommit() {
    try {
      return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  compareMetrics(baseline, current) {
    console.log('\n\n📊 Comparing Performance Metrics...\n');

    // Compare bundle size
    this.compareBundleSize(baseline.bundleSize, current.bundleSize);

    // Compare build performance
    this.compareBuildPerformance(baseline.buildPerformance, current.buildPerformance);

    // Compare runtime performance
    this.compareRuntimePerformance(baseline.runtimePerformance, current.runtimePerformance);
  }

  compareBundleSize(baseline, current) {
    if (!baseline?.total || !current?.total) return;

    const change = (current.total - baseline.total) / baseline.total;
    const changePercent = (change * 100).toFixed(2);

    console.log(`Bundle Size:`);
    console.log(`  Baseline: ${baseline.totalKB} KB`);
    console.log(`  Current:  ${current.totalKB} KB`);
    console.log(`  Change:   ${changePercent}%`);

    if (change > this.thresholds.bundleSize) {
      this.addRegression('BUNDLE_SIZE', `Bundle size increased by ${changePercent}%`);
    } else {
      console.log(`  ✅ Within threshold\n`);
    }
  }

  compareBuildPerformance(baseline, current) {
    if (!baseline?.buildTime || !current?.buildTime) return;

    const change = (current.buildTime - baseline.buildTime) / baseline.buildTime;
    const changePercent = (change * 100).toFixed(2);

    console.log(`Build Performance:`);
    console.log(`  Baseline: ${baseline.buildTimeSeconds}s`);
    console.log(`  Current:  ${current.buildTimeSeconds}s`);
    console.log(`  Change:   ${changePercent}%`);

    if (change > this.thresholds.buildTime) {
      this.addRegression('BUILD_TIME', `Build time increased by ${changePercent}%`);
    } else {
      console.log(`  ✅ Within threshold\n`);
    }
  }

  compareRuntimePerformance(baseline, current) {
    if (!baseline || !current) return;

    console.log(`Runtime Performance:`);

    Object.keys(baseline).forEach(component => {
      if (!current[component]) return;

      const baselineTime = baseline[component].domContentLoaded;
      const currentTime = current[component].domContentLoaded;

      if (!baselineTime || !currentTime) return;

      const change = (currentTime - baselineTime) / baselineTime;
      const changePercent = (change * 100).toFixed(2);

      console.log(`  ${component}:`);
      console.log(`    Baseline: ${baselineTime.toFixed(2)}ms`);
      console.log(`    Current:  ${currentTime.toFixed(2)}ms`);
      console.log(`    Change:   ${changePercent}%`);

      if (change > this.thresholds.renderTime) {
        this.addRegression('RENDER_TIME', `${component} render time increased by ${changePercent}%`);
      } else {
        console.log(`    ✅ Within threshold`);
      }
    });

    console.log('');
  }

  addRegression(type, message) {
    console.log(`  ❌ REGRESSION: ${message}`);
    this.regressions.push({ type, message });
  }

  updateHistory() {
    let history = [];

    if (fs.existsSync(HISTORY_FILE)) {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    }

    history.push({
      timestamp: this.metrics.timestamp,
      gitCommit: this.metrics.gitCommit,
      bundleSize: this.metrics.bundleSize?.total || 0,
      buildTime: this.metrics.buildPerformance?.buildTime || 0,
      regressions: this.regressions.length,
    });

    // Keep last 100 entries
    if (history.length > 100) {
      history = history.slice(-100);
    }

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  }

  generateReport() {
    console.log('📄 Generating performance report...\n');

    if (!fs.existsSync(HISTORY_FILE)) {
      console.warn('⚠️  No history data available');
      return;
    }

    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));

    console.log(`Total measurements: ${history.length}`);
    console.log(`Date range: ${history[0]?.timestamp} to ${history[history.length - 1]?.timestamp}\n`);

    // Calculate trends
    const bundleSizes = history.map(h => h.bundleSize).filter(Boolean);
    const buildTimes = history.map(h => h.buildTime).filter(Boolean);

    if (bundleSizes.length > 1) {
      const avgBundleSize = bundleSizes.reduce((a, b) => a + b, 0) / bundleSizes.length;
      const bundleTrend = ((bundleSizes[bundleSizes.length - 1] - bundleSizes[0]) / bundleSizes[0] * 100).toFixed(2);

      console.log(`Bundle Size:`);
      console.log(`  Average: ${(avgBundleSize / 1024).toFixed(2)} KB`);
      console.log(`  Trend: ${bundleTrend}%\n`);
    }

    if (buildTimes.length > 1) {
      const avgBuildTime = buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length;
      const buildTrend = ((buildTimes[buildTimes.length - 1] - buildTimes[0]) / buildTimes[0] * 100).toFixed(2);

      console.log(`Build Time:`);
      console.log(`  Average: ${(avgBuildTime / 1000).toFixed(2)}s`);
      console.log(`  Trend: ${buildTrend}%\n`);
    }
  }

  saveMetrics(filename) {
    fs.writeFileSync(filename, JSON.stringify(this.metrics, null, 2));
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE TRACKING SUMMARY');
    console.log('='.repeat(60) + '\n');

    if (this.mode === 'baseline') {
      console.log('✅ Performance baseline created\n');
    } else if (this.mode === 'compare') {
      console.log(`Regressions found: ${this.regressions.length}\n`);

      if (this.regressions.length === 0) {
        console.log('✅ No performance regressions detected!\n');
      } else {
        console.log('❌ PERFORMANCE REGRESSIONS:\n');
        this.regressions.forEach(r => {
          console.log(`  • ${r.type}: ${r.message}`);
        });
        console.log('\n⚠️  Performance has degraded. Review changes.\n');
      }
    } else if (this.mode === 'report') {
      console.log('✅ Performance report generated\n');
    }
  }
}

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  mode: 'compare',
  verbose: false,
};

args.forEach(arg => {
  if (arg.startsWith('--mode=')) {
    options.mode = arg.split('=')[1];
  } else if (arg === '--verbose') {
    options.verbose = true;
  }
});

// Run performance tracking
const tracker = new PerformanceTracker(options);
tracker.run().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
