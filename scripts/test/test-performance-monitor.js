#!/usr/bin/env node

/**
 * Test Performance Monitor
 *
 * Automatically monitors test performance and suggests optimizations
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

class TestPerformanceMonitor {
  constructor() {
    this.thresholds = {
      maxTestFiles: 300,
      maxSingleTestTime: 10000, // 10 seconds
      maxTotalTestTime: 120000, // 2 minutes
      recommendedConcurrency: 10
    };
  }

  async analyzeTestSuite() {
    console.log('📊 Analyzing test suite performance...\n');

    // Count test files
    const testFiles = await glob('**/*.test.ts');
    const testFileCount = testFiles.length;

    console.log(`📄 Test Files: ${testFileCount}`);

    if (testFileCount > this.thresholds.maxTestFiles) {
      console.log(`⚠️  Warning: ${testFileCount} test files exceed recommended ${this.thresholds.maxTestFiles}`);
      this.suggestBatchTesting();
    }

    // Check vitest configuration
    this.analyzeVitestConfig();

    // Run a sample test to check performance
    await this.benchmarkTestPerformance();

    return {
      testFileCount,
      performance: 'analyzed',
      recommendations: this.generateRecommendations(testFileCount)
    };
  }

  analyzeVitestConfig() {
    console.log('\n⚙️  Analyzing Vitest configuration...');

    const configFile = 'vitest.config.ts';
    if (!existsSync(configFile)) {
      console.log('❌ No vitest.config.ts found');
      return;
    }

    const content = readFileSync(configFile, 'utf-8');
    const optimizations = {
      maxConcurrency: content.includes('maxConcurrency'),
      slowTestThreshold: content.includes('slowTestThreshold'),
      isolate: content.includes('isolate: false'),
      poolOptions: content.includes('poolOptions'),
      cacheDir: content.includes('cacheDir')
    };

    console.log('Current optimizations:');
    Object.entries(optimizations).forEach(([key, enabled]) => {
      console.log(`  ${enabled ? '✅' : '❌'} ${key}`);
    });

    const missingOptimizations = Object.entries(optimizations)
      .filter(([_, enabled]) => !enabled)
      .map(([key]) => key);

    if (missingOptimizations.length > 0) {
      console.log(`\n💡 Missing optimizations: ${missingOptimizations.join(', ')}`);
    }
  }

  async benchmarkTestPerformance() {
    console.log('\n🏃 Running test performance benchmark...');

    try {
      // Run a single fast test to measure baseline
      const startTime = Date.now();
      execSync('npm run test src/components/button/usa-button.test.ts --run', {
        stdio: 'ignore',
        timeout: 30000
      });
      const singleTestTime = Date.now() - startTime;

      console.log(`⏱️  Single test time: ${singleTestTime}ms`);

      if (singleTestTime > this.thresholds.maxSingleTestTime) {
        console.log('⚠️  Single test is slower than expected');
      } else {
        console.log('✅ Single test performance looks good');
      }

      return { singleTestTime };
    } catch (error) {
      console.log('❌ Could not benchmark test performance:', error.message);
      return { error: error.message };
    }
  }

  generateRecommendations(testFileCount) {
    const recommendations = [];

    if (testFileCount > 200) {
      recommendations.push({
        issue: 'Large test suite',
        suggestion: 'Consider running tests in batches with npm run test:critical for faster feedback',
        priority: 'medium'
      });
    }

    if (testFileCount > 300) {
      recommendations.push({
        issue: 'Very large test suite',
        suggestion: 'Implement test sharding or parallel execution strategies',
        priority: 'high'
      });
    }

    // Add vitest config recommendations
    const vitestConfigExists = existsSync('vitest.config.ts');
    if (vitestConfigExists) {
      const content = readFileSync('vitest.config.ts', 'utf-8');

      if (!content.includes('maxConcurrency')) {
        recommendations.push({
          issue: 'Missing concurrency limit',
          suggestion: 'Add maxConcurrency: 10 to vitest config',
          priority: 'low'
        });
      }

      if (!content.includes('isolate: false') && testFileCount > 100) {
        recommendations.push({
          issue: 'Test isolation overhead',
          suggestion: 'Consider isolate: false for better performance with many tests',
          priority: 'medium'
        });
      }
    }

    return recommendations;
  }

  suggestBatchTesting() {
    console.log('\n💡 Suggested batch testing approach:');
    console.log('  npm run test:critical     # Fast feedback (key components)');
    console.log('  npm run test src/components/button/  # Single component');
    console.log('  npm run test:browser      # Browser-dependent tests');
    console.log('  npm run test              # Full suite (when needed)');
  }

  generateOptimizedConfig(testFileCount) {
    const cpuCount = require('os').cpus().length;
    const maxThreads = Math.min(Math.ceil(cpuCount / 2), 4);
    const maxConcurrency = testFileCount > 200 ? 8 : 15;

    return `
// Auto-generated optimized configuration for ${testFileCount} test files
export default defineConfig({
  test: {
    testTimeout: ${testFileCount > 200 ? 30000 : 15000},
    hookTimeout: ${testFileCount > 200 ? 15000 : 10000},
    maxConcurrency: ${maxConcurrency},
    slowTestThreshold: 5000,
    bail: 5,
    isolate: ${testFileCount > 100 ? 'false' : 'true'},
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: ${maxThreads}
      }
    },
    // Performance optimizations
    cache: {
      dir: 'node_modules/.vitest'
    }
  }
});`;
  }

  async monitorAndSuggest() {
    const analysis = await this.analyzeTestSuite();

    console.log('\n📋 Performance Recommendations:');

    if (analysis.recommendations.length === 0) {
      console.log('✅ No performance issues detected');
    } else {
      analysis.recommendations.forEach((rec, i) => {
        const emoji = rec.priority === 'high' ? '🚨' : rec.priority === 'medium' ? '⚠️' : 'ℹ️';
        console.log(`${emoji} ${i + 1}. ${rec.issue}: ${rec.suggestion}`);
      });
    }

    // Save performance report
    const report = {
      timestamp: new Date().toISOString(),
      analysis,
      thresholds: this.thresholds
    };

    writeFileSync('test-performance-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Performance report saved to test-performance-report.json');

    return analysis.recommendations.length;
  }
}

async function main() {
  const monitor = new TestPerformanceMonitor();
  const issueCount = await monitor.monitorAndSuggest();

  process.exit(issueCount > 0 ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}