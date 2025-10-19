#!/usr/bin/env node

/**
 * 🧠 Intelligent Test Parallelization Optimizer
 *
 * Phase 5 Advanced Testing: Dynamically optimizes test execution using:
 * - Historical execution patterns
 * - Test dependency analysis
 * - Resource usage optimization
 * - Predictive load balancing
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { execSync, spawn } from 'child_process';
import { performance } from 'perf_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

/**
 * Intelligent Test Parallelization Engine
 */
class IntelligentTestParallelizer {
  constructor() {
    this.metricsFile = join(PROJECT_ROOT, 'test-results/parallelization-metrics.json');
    this.configFile = join(PROJECT_ROOT, 'test-results/optimal-config.json');
    this.metrics = this.loadMetrics();
    this.optimalConfig = this.loadOptimalConfig();
  }

  /**
   * Analyze test suite and optimize parallelization
   */
  async optimizeTestExecution(options = {}) {
    console.log('🧠 Intelligent Test Parallelization Analysis...');

    const analysis = await this.analyzeTestSuite();
    const optimization = await this.calculateOptimalStrategy(analysis);
    const executionPlan = this.createExecutionPlan(optimization);

    if (options.dryRun) {
      console.log('📊 Optimization Results (Dry Run):');
      console.log(`- Optimal Worker Count: ${optimization.optimalWorkers}`);
      console.log(`- Test Groups: ${executionPlan.groups.length}`);
      console.log(`- Estimated Time Savings: ${optimization.timeSavings}%`);
      return executionPlan;
    }

    if (options.execute) {
      const results = await this.executeOptimizedTests(executionPlan);
      this.updateMetrics(results);
      return results;
    }

    this.saveOptimalConfig(optimization);
    console.log('✅ Optimal test parallelization configuration saved');
    return executionPlan;
  }

  /**
   * Analyze the current test suite structure and patterns
   */
  async analyzeTestSuite() {
    console.log('📊 Analyzing test suite structure...');

    const testFiles = await this.findTestFiles();
    const testAnalysis = await Promise.all(testFiles.map(file => this.analyzeTestFile(file)));

    const analysis = {
      totalTests: testFiles.length,
      testTypes: this.categorizeTests(testAnalysis),
      dependencies: this.analyzeDependencies(testAnalysis),
      resourceUsage: this.analyzeResourceUsage(testAnalysis),
      executionHistory: this.getExecutionHistory(),
      complexity: this.calculateComplexity(testAnalysis),
    };

    console.log(`📈 Found ${analysis.totalTests} test files`);
    console.log(`🎯 Test Types: ${Object.keys(analysis.testTypes).length}`);
    console.log(`🔗 Dependencies: ${analysis.dependencies.length}`);

    return analysis;
  }

  /**
   * Calculate the optimal parallelization strategy
   */
  async calculateOptimalStrategy(analysis) {
    console.log('🎯 Calculating optimal strategy...');

    const systemResources = await this.getSystemResources();
    const historicalData = this.getHistoricalPerformance();

    // AI-inspired optimization algorithm
    const optimization = {
      optimalWorkers: this.calculateOptimalWorkers(analysis, systemResources),
      groupingStrategy: this.determineGroupingStrategy(analysis),
      prioritization: this.createPrioritization(analysis),
      resourceAllocation: this.optimizeResourceAllocation(analysis, systemResources),
      timeSavings: this.estimateTimeSavings(analysis, historicalData),
    };

    // Machine learning-inspired adjustments based on historical data
    if (historicalData.length > 10) {
      optimization.optimalWorkers = this.adjustBasedOnHistory(optimization.optimalWorkers, historicalData);
    }

    return optimization;
  }

  /**
   * Find all test files in the project
   */
  async findTestFiles() {
    const patterns = [
      'src/**/*.test.ts',
      'src/**/*.test.js',
      '__tests__/**/*.test.ts',
      '__tests__/**/*.test.js',
      'tests/**/*.spec.ts',
      'tests/**/*.spec.js',
    ];

    let allFiles = [];
    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: PROJECT_ROOT });
      allFiles.push(...files.map(f => join(PROJECT_ROOT, f)));
    }

    return [...new Set(allFiles)]; // Remove duplicates
  }

  /**
   * Analyze individual test file
   */
  async analyzeTestFile(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    const relativePath = filePath.replace(PROJECT_ROOT, '');

    return {
      path: relativePath,
      fullPath: filePath,
      type: this.detectTestType(content, filePath),
      complexity: this.calculateFileComplexity(content),
      dependencies: this.extractDependencies(content),
      estimatedDuration: this.estimateDuration(content, filePath),
      resourceIntensive: this.isResourceIntensive(content),
      canParallelize: this.canParallelize(content),
      priority: this.calculatePriority(content, filePath),
    };
  }

  /**
   * Detect test type based on content and file path
   */
  detectTestType(content, filePath) {
    if (filePath.includes('component.cy.ts')) return 'cypress-component';
    if (filePath.includes('e2e.cy.ts')) return 'cypress-e2e';
    if (filePath.includes('integration')) return 'integration';
    if (filePath.includes('accessibility')) return 'accessibility';
    if (filePath.includes('performance')) return 'performance';
    if (filePath.includes('visual')) return 'visual';
    if (content.includes('playwright')) return 'playwright';
    if (content.includes('storybook')) return 'storybook';
    return 'unit';
  }

  /**
   * Calculate file complexity score
   */
  calculateFileComplexity(content) {
    let complexity = 0;

    // Count test cases
    const testCases = (content.match(/it\(|test\(/g) || []).length;
    complexity += testCases * 2;

    // Count describe blocks
    const suites = (content.match(/describe\(/g) || []).length;
    complexity += suites * 5;

    // Count async operations
    const asyncOps = (content.match(/await|async|Promise/g) || []).length;
    complexity += asyncOps * 3;

    // Count DOM operations
    const domOps = (content.match(/document\.|querySelector|createElement/g) || []).length;
    complexity += domOps * 2;

    // Count network operations
    const networkOps = (content.match(/fetch|http|ajax|request/g) || []).length;
    complexity += networkOps * 5;

    return Math.min(complexity, 100); // Cap at 100
  }

  /**
   * Extract dependencies from test file
   */
  extractDependencies(content) {
    const imports = content.match(/import.*from\s+['"`]([^'"`]+)['"`]/g) || [];
    const dependencies = imports.map(imp => {
      const match = imp.match(/from\s+['"`]([^'"`]+)['"`]/);
      return match ? match[1] : null;
    }).filter(Boolean);

    return dependencies;
  }

  /**
   * Estimate test duration based on content analysis
   */
  estimateDuration(content, filePath) {
    const fileType = this.detectTestType(content, filePath);
    const complexity = this.calculateFileComplexity(content);

    const baseDurations = {
      'unit': 100,           // 100ms
      'integration': 1000,   // 1s
      'cypress-component': 2000,  // 2s
      'cypress-e2e': 5000,   // 5s
      'playwright': 3000,    // 3s
      'accessibility': 1500, // 1.5s
      'performance': 4000,   // 4s
      'visual': 6000,        // 6s
      'storybook': 800,      // 800ms
    };

    const baseDuration = baseDurations[fileType] || 1000;
    const complexityMultiplier = 1 + (complexity / 100);

    return Math.round(baseDuration * complexityMultiplier);
  }

  /**
   * Check if test is resource intensive
   */
  isResourceIntensive(content) {
    const intensivePatterns = [
      /performance|benchmark|stress/i,
      /large.*data|big.*file|massive/i,
      /memory.*leak|heap|garbage/i,
      /browser.*automation|headless/i,
      /parallel|concurrent.*test/i,
    ];

    return intensivePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if test can be parallelized safely
   */
  canParallelize(content) {
    const serialPatterns = [
      /\.only\(/,                    // Exclusive tests
      /global.*state|shared.*state/i, // Shared state
      /singleton|static.*var/i,      // Singletons
      /port.*\d+|localhost:\d+/,     // Fixed ports
      /file.*write|fs\.write/i,      // File writes
      /database|db\.connection/i,     // Database access
    ];

    return !serialPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Calculate test priority
   */
  calculatePriority(content, filePath) {
    let priority = 50; // Base priority

    // High priority for critical tests
    if (filePath.includes('critical') || content.includes('critical')) priority += 30;
    if (filePath.includes('smoke') || content.includes('smoke')) priority += 25;
    if (filePath.includes('accessibility')) priority += 20;
    if (filePath.includes('security')) priority += 20;

    // Lower priority for less critical tests
    if (filePath.includes('edge-case')) priority -= 10;
    if (filePath.includes('performance') && !content.includes('critical')) priority -= 5;

    return Math.max(0, Math.min(100, priority));
  }

  /**
   * Categorize tests by type
   */
  categorizeTests(testAnalysis) {
    const categories = {};
    testAnalysis.forEach(test => {
      if (!categories[test.type]) {
        categories[test.type] = [];
      }
      categories[test.type].push(test);
    });
    return categories;
  }

  /**
   * Analyze dependencies between tests
   */
  analyzeDependencies(testAnalysis) {
    const dependencies = [];

    testAnalysis.forEach(test => {
      test.dependencies.forEach(dep => {
        // Check if dependency is another test file
        const dependentTest = testAnalysis.find(t =>
          t.path.includes(dep) || dep.includes(t.path.replace('.test.', '').replace('.spec.', ''))
        );

        if (dependentTest) {
          dependencies.push({
            from: test.path,
            to: dependentTest.path,
            type: 'test-dependency'
          });
        }
      });
    });

    return dependencies;
  }

  /**
   * Analyze resource usage patterns
   */
  analyzeResourceUsage(testAnalysis) {
    const usage = {
      cpuIntensive: testAnalysis.filter(t => t.complexity > 70).length,
      memoryIntensive: testAnalysis.filter(t => t.resourceIntensive).length,
      ioIntensive: testAnalysis.filter(t => t.type.includes('e2e') || t.type.includes('integration')).length,
      networkIntensive: testAnalysis.filter(t => t.dependencies.some(d => d.includes('http') || d.includes('fetch'))).length,
    };

    return usage;
  }

  /**
   * Get execution history from metrics
   */
  getExecutionHistory() {
    return this.metrics.executions || [];
  }

  /**
   * Calculate overall complexity
   */
  calculateComplexity(testAnalysis) {
    const totalComplexity = testAnalysis.reduce((sum, test) => sum + test.complexity, 0);
    return Math.round(totalComplexity / testAnalysis.length);
  }

  /**
   * Get system resources
   */
  async getSystemResources() {
    const os = await import('os');

    return {
      cpuCores: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024)), // GB
      freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024)), // GB
      platform: os.platform(),
      arch: os.arch(),
    };
  }

  /**
   * Get historical performance data
   */
  getHistoricalPerformance() {
    return this.metrics.executions?.slice(-20) || []; // Last 20 executions
  }

  /**
   * Calculate optimal number of workers
   */
  calculateOptimalWorkers(analysis, systemResources) {
    const { cpuCores, freeMemory } = systemResources;

    // Base calculation: Start with CPU cores
    let optimalWorkers = cpuCores;

    // Adjust for test types
    const hasResourceIntensiveTests = analysis.resourceUsage.cpuIntensive > 0 ||
                                    analysis.resourceUsage.memoryIntensive > 0;

    if (hasResourceIntensiveTests) {
      optimalWorkers = Math.max(1, Math.floor(cpuCores * 0.75));
    }

    // Adjust for memory constraints
    const estimatedMemoryPerWorker = 512; // MB
    const maxWorkersByMemory = Math.floor((freeMemory * 1024) / estimatedMemoryPerWorker);
    optimalWorkers = Math.min(optimalWorkers, maxWorkersByMemory);

    // Adjust for test complexity
    if (analysis.complexity > 80) {
      optimalWorkers = Math.max(1, Math.floor(optimalWorkers * 0.8));
    } else if (analysis.complexity < 30) {
      optimalWorkers = Math.min(cpuCores * 2, optimalWorkers * 1.5);
    }

    return Math.max(1, Math.floor(optimalWorkers));
  }

  /**
   * Determine grouping strategy
   */
  determineGroupingStrategy(analysis) {
    const strategies = [];

    // Group by test type
    strategies.push({
      name: 'by-type',
      groups: Object.keys(analysis.testTypes),
      rationale: 'Similar test types have similar resource requirements'
    });

    // Group by complexity
    strategies.push({
      name: 'by-complexity',
      groups: ['low-complexity', 'medium-complexity', 'high-complexity'],
      rationale: 'Balance high and low complexity tests across workers'
    });

    // Group by duration
    strategies.push({
      name: 'by-duration',
      groups: ['fast', 'medium', 'slow'],
      rationale: 'Prevent long-running tests from blocking workers'
    });

    return strategies;
  }

  /**
   * Create test prioritization
   */
  createPrioritization(analysis) {
    // Sort tests by priority, then by estimated duration
    const prioritized = Object.values(analysis.testTypes)
      .flat()
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // High priority first
        }
        return a.estimatedDuration - b.estimatedDuration; // Fast tests first within same priority
      });

    return {
      order: prioritized.map(test => test.path),
      rationale: 'High priority tests first, then fast tests to provide quick feedback'
    };
  }

  /**
   * Optimize resource allocation
   */
  optimizeResourceAllocation(analysis, systemResources) {
    const allocation = {
      cpu: {
        unit: 40,          // % CPU for unit tests
        integration: 70,   // % CPU for integration tests
        e2e: 90,          // % CPU for e2e tests
      },
      memory: {
        unit: 256,         // MB memory for unit tests
        integration: 512,  // MB memory for integration tests
        e2e: 1024,        // MB memory for e2e tests
      },
      concurrency: {
        unit: systemResources.cpuCores * 2,
        integration: systemResources.cpuCores,
        e2e: Math.max(1, Math.floor(systemResources.cpuCores / 2)),
      }
    };

    return allocation;
  }

  /**
   * Estimate time savings from optimization
   */
  estimateTimeSavings(analysis, historicalData) {
    if (historicalData.length === 0) return 25; // Conservative estimate

    const avgHistoricalTime = historicalData.reduce((sum, exec) => sum + exec.duration, 0) / historicalData.length;
    const estimatedOptimalTime = this.estimateOptimalTime(analysis);

    const savings = ((avgHistoricalTime - estimatedOptimalTime) / avgHistoricalTime) * 100;
    return Math.max(0, Math.min(80, Math.round(savings))); // Cap between 0-80%
  }

  /**
   * Estimate optimal execution time
   */
  estimateOptimalTime(analysis) {
    const totalDuration = Object.values(analysis.testTypes)
      .flat()
      .reduce((sum, test) => sum + test.estimatedDuration, 0);

    // Assume optimal parallelization reduces time by the number of workers
    const optimalWorkers = this.calculateOptimalWorkers(analysis, { cpuCores: 8, freeMemory: 8 });
    return totalDuration / optimalWorkers;
  }

  /**
   * Adjust based on historical performance
   */
  adjustBasedOnHistory(optimalWorkers, historicalData) {
    // Simple machine learning: adjust based on what worked well historically
    const successfulRuns = historicalData.filter(run => run.success && run.workers);
    if (successfulRuns.length === 0) return optimalWorkers;

    const avgSuccessfulWorkers = successfulRuns.reduce((sum, run) => sum + run.workers, 0) / successfulRuns.length;
    const avgSuccessfulTime = successfulRuns.reduce((sum, run) => sum + run.duration, 0) / successfulRuns.length;

    // Trend towards historically successful configurations
    const adjustment = (avgSuccessfulWorkers - optimalWorkers) * 0.3; // 30% weight to history
    return Math.max(1, Math.round(optimalWorkers + adjustment));
  }

  /**
   * Create execution plan
   */
  createExecutionPlan(optimization) {
    const plan = {
      strategy: 'intelligent-parallel',
      optimalWorkers: optimization.optimalWorkers,
      groups: this.createTestGroups(optimization),
      prioritization: optimization.prioritization,
      resourceAllocation: optimization.resourceAllocation,
      estimatedDuration: this.estimateOptimalTime({ testTypes: {} }),
      commands: this.generateOptimizedCommands(optimization),
    };

    return plan;
  }

  /**
   * Create optimized test groups
   */
  createTestGroups(optimization) {
    // Implementation would create balanced test groups
    // For now, return a simple structure
    return [
      { name: 'fast-unit', type: 'unit', workers: 2 },
      { name: 'integration', type: 'integration', workers: 1 },
      { name: 'e2e', type: 'e2e', workers: 1 },
    ];
  }

  /**
   * Generate optimized test commands
   */
  generateOptimizedCommands(optimization) {
    const commands = [];

    // Vitest with optimal workers
    commands.push({
      name: 'unit-tests',
      command: `vitest --reporter=json --threads=${optimization.optimalWorkers}`,
      workers: optimization.optimalWorkers,
      type: 'unit'
    });

    // Playwright with optimal concurrency
    commands.push({
      name: 'cross-browser',
      command: `playwright test --workers=${Math.max(1, Math.floor(optimization.optimalWorkers / 2))}`,
      workers: Math.max(1, Math.floor(optimization.optimalWorkers / 2)),
      type: 'playwright'
    });

    return commands;
  }

  /**
   * Execute optimized test suite
   */
  async executeOptimizedTests(executionPlan) {
    console.log('🚀 Executing optimized test suite...');
    const startTime = performance.now();

    const results = {
      startTime: new Date().toISOString(),
      plan: executionPlan,
      executions: [],
      totalDuration: 0,
      success: true,
    };

    try {
      for (const command of executionPlan.commands) {
        console.log(`🏃 Running: ${command.name}`);
        const cmdStart = performance.now();

        try {
          const output = execSync(command.command, {
            encoding: 'utf-8',
            cwd: PROJECT_ROOT,
            timeout: 300000, // 5 minutes
          });

          const cmdEnd = performance.now();
          const duration = cmdEnd - cmdStart;

          results.executions.push({
            name: command.name,
            command: command.command,
            workers: command.workers,
            duration: Math.round(duration),
            success: true,
            output: output.slice(-500), // Last 500 chars
          });

          console.log(`✅ ${command.name} completed in ${Math.round(duration)}ms`);

        } catch (error) {
          const cmdEnd = performance.now();
          const duration = cmdEnd - cmdStart;

          results.executions.push({
            name: command.name,
            command: command.command,
            workers: command.workers,
            duration: Math.round(duration),
            success: false,
            error: error.message.slice(-500),
          });

          console.log(`❌ ${command.name} failed after ${Math.round(duration)}ms`);
          results.success = false;
        }
      }

      const endTime = performance.now();
      results.totalDuration = Math.round(endTime - startTime);

      console.log(`🎉 Test execution completed in ${results.totalDuration}ms`);
      return results;

    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      results.success = false;
      results.error = error.message;
      return results;
    }
  }

  /**
   * Update metrics with execution results
   */
  updateMetrics(results) {
    this.metrics.executions = this.metrics.executions || [];
    this.metrics.executions.push({
      timestamp: results.startTime,
      duration: results.totalDuration,
      workers: results.plan.optimalWorkers,
      success: results.success,
      commands: results.executions.length,
    });

    // Keep only last 50 executions
    if (this.metrics.executions.length > 50) {
      this.metrics.executions = this.metrics.executions.slice(-50);
    }

    this.saveMetrics();
  }

  /**
   * Load metrics from file
   */
  loadMetrics() {
    if (existsSync(this.metricsFile)) {
      try {
        return JSON.parse(readFileSync(this.metricsFile, 'utf-8'));
      } catch (error) {
        console.warn('Warning: Could not load metrics file');
      }
    }
    return { executions: [] };
  }

  /**
   * Save metrics to file
   */
  saveMetrics() {
    try {
      const dir = dirname(this.metricsFile);
      if (!existsSync(dir)) {
        import('fs').then(fs => fs.mkdirSync(dir, { recursive: true }));
      }
      writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      console.warn('Warning: Could not save metrics file');
    }
  }

  /**
   * Load optimal configuration
   */
  loadOptimalConfig() {
    if (existsSync(this.configFile)) {
      try {
        return JSON.parse(readFileSync(this.configFile, 'utf-8'));
      } catch (error) {
        console.warn('Warning: Could not load config file');
      }
    }
    return {};
  }

  /**
   * Save optimal configuration
   */
  saveOptimalConfig(config) {
    try {
      const dir = dirname(this.configFile);
      if (!existsSync(dir)) {
        import('fs').then(fs => fs.mkdirSync(dir, { recursive: true }));
      }
      writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    } catch (error) {
      console.warn('Warning: Could not save config file');
    }
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    execute: args.includes('--execute'),
    analyze: args.includes('--analyze'),
  };

  const parallelizer = new IntelligentTestParallelizer();

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧠 Intelligent Test Parallelization Optimizer v1.0

Usage:
  node scripts/intelligent-test-parallelizer.js [options]

Options:
  --analyze                    Analyze test suite and show recommendations
  --dry-run                    Show optimization without executing
  --execute                    Execute optimized test suite
  --help, -h                   Show this help

Examples:
  node scripts/intelligent-test-parallelizer.js --analyze
  node scripts/intelligent-test-parallelizer.js --dry-run
  node scripts/intelligent-test-parallelizer.js --execute
    `);
    return;
  }

  try {
    const result = await parallelizer.optimizeTestExecution(options);

    if (options.analyze) {
      console.log('\n📊 Optimization Analysis Complete');
      console.log('Run with --dry-run to see execution plan');
      console.log('Run with --execute to apply optimizations');
    }

  } catch (error) {
    console.error('❌ Parallelization optimization failed:', error.message);
    process.exit(1);
  }
}

// Export for testing
export { IntelligentTestParallelizer };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}