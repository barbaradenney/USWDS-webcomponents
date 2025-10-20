#!/usr/bin/env node

/**
 * Simple Build Metrics Generator
 *
 * Analyzes the dist folder to generate build metrics for Storybook
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';

// Configuration constants
const METRICS_CONFIG = {
  // Compression simulation based on real-world gzip performance
  COMPRESSION: {
    JS_RATIO: 0.25,      // JavaScript typically compresses to ~25% of original
    CSS_RATIO: 0.20,     // CSS typically compresses to ~20% of original
    DEFAULT_RATIO: 0.30, // Fallback for other files
  },
  // File size thresholds for optimization assessment
  THRESHOLDS: {
    OPTIMAL_FILE_SIZE: 50 * 1024,    // 50KB - truly optimal
    GOOD_FILE_SIZE: 100 * 1024,      // 100KB - good
    WARNING_FILE_SIZE: 250 * 1024,   // 250KB - warning
    SEVERE_FILE_SIZE: 500 * 1024,    // 500KB - severe
    TOTAL_SIZE: {
      EXCELLENT: 0.5,  // <500KB total
      GOOD: 1.0,       // <1MB total
      POOR: 2.0,       // <2MB total
    },
  },
  // Scoring system weights
  SCORING: {
    BUNDLE_SIZE_MAX: 40,
    COMPRESSION_MAX: 25,
    FILE_COUNT_MAX: 20,
    PENALTY_MAX: 15,
  }
};

function getGitInfo() {
  try {
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    const author = execSync('git log -1 --pretty=%an', { encoding: 'utf8' }).trim();
    const date = execSync('git log -1 --pretty=%ad --date=iso', { encoding: 'utf8' }).trim();
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();

    return {
      commitHash: commitHash.substring(0, 8), // Short hash
      commitMessage,
      author,
      date,
      branch
    };
  } catch (error) {
    return {
      commitHash: 'unknown',
      commitMessage: 'No commit info available',
      author: 'unknown',
      date: new Date().toISOString(),
      branch: 'unknown'
    };
  }
}

async function analyzeComponentCoverage() {
  try {
    // Find all component TypeScript files
    const componentFiles = await glob('src/components/**/usa-*.ts', { ignore: ['**/*.test.ts', '**/*.stories.ts'] });

    // Find all story files
    const storyFiles = await glob('src/components/**/*.stories.ts');

    // Find all test files
    const testFiles = await glob('src/components/**/*.test.ts');

    // Find layout test files
    const layoutTestFiles = await glob('src/components/**/*.layout.test.ts');

    const totalComponents = componentFiles.length;
    const componentsWithStories = new Set();
    const componentsWithTests = new Set();
    const componentsWithLayoutTests = new Set();

    // Extract component names from story files
    storyFiles.forEach(storyFile => {
      const componentName = path.basename(storyFile, '.stories.ts');
      componentsWithStories.add(componentName);
    });

    // Extract component names from test files
    testFiles.forEach(testFile => {
      const componentName = path.basename(testFile, '.test.ts');
      componentsWithTests.add(componentName);
    });

    // Extract component names from layout test files
    layoutTestFiles.forEach(testFile => {
      const componentName = path.basename(testFile, '.layout.test.ts');
      componentsWithLayoutTests.add(componentName);
    });

    const storyCoverage = (componentsWithStories.size / totalComponents) * 100;
    const testCoverage = (componentsWithTests.size / totalComponents) * 100;
    const layoutTestCoverage = (componentsWithLayoutTests.size / totalComponents) * 100;

    // Generate component-level quality analysis
    const componentQuality = {};

    componentFiles.forEach(componentFile => {
      const componentName = path.basename(componentFile, '.ts');
      const componentDir = path.dirname(componentFile);

      // Check for various quality indicators
      const hasStory = componentsWithStories.has(componentName);
      const hasTest = componentsWithTests.has(componentName);
      const hasLayoutTest = componentsWithLayoutTests.has(componentName);

      // Check for README/documentation
      const hasReadme = fs.existsSync(path.join(componentDir, 'README.mdx')) ||
                       fs.existsSync(path.join(componentDir, 'README.md'));

      // Check for changelog
      const hasChangelog = fs.existsSync(path.join(componentDir, 'CHANGELOG.mdx')) ||
                          fs.existsSync(path.join(componentDir, 'CHANGELOG.md'));

      // Calculate component quality score (0-100)
      let qualityScore = 0;
      qualityScore += hasStory ? 25 : 0;        // Stories (25 points)
      qualityScore += hasTest ? 25 : 0;         // Unit tests (25 points)
      qualityScore += hasLayoutTest ? 20 : 0;   // Layout tests (20 points)
      qualityScore += hasReadme ? 20 : 0;       // Documentation (20 points)
      qualityScore += hasChangelog ? 10 : 0;    // Changelog (10 points)

      // Determine quality tier
      let qualityTier = 'Incomplete';
      if (qualityScore >= 80) qualityTier = 'Excellent';
      else if (qualityScore >= 60) qualityTier = 'Good';
      else if (qualityScore >= 40) qualityTier = 'Fair';
      else if (qualityScore >= 20) qualityTier = 'Basic';

      componentQuality[componentName] = {
        name: componentName,
        qualityScore,
        qualityTier,
        hasStory,
        hasTest,
        hasLayoutTest,
        hasReadme,
        hasChangelog,
        missingItems: [
          !hasStory && 'Story',
          !hasTest && 'Unit Test',
          !hasLayoutTest && 'Layout Test',
          !hasReadme && 'README',
          !hasChangelog && 'Changelog'
        ].filter(Boolean)
      };
    });

    // Calculate quality distribution
    const qualityDistribution = {
      Excellent: Object.values(componentQuality).filter(c => c.qualityTier === 'Excellent').length,
      Good: Object.values(componentQuality).filter(c => c.qualityTier === 'Good').length,
      Fair: Object.values(componentQuality).filter(c => c.qualityTier === 'Fair').length,
      Basic: Object.values(componentQuality).filter(c => c.qualityTier === 'Basic').length,
      Incomplete: Object.values(componentQuality).filter(c => c.qualityTier === 'Incomplete').length
    };

    // Calculate average quality score
    const averageQualityScore = Object.values(componentQuality)
      .reduce((sum, comp) => sum + comp.qualityScore, 0) / totalComponents;

    return {
      totalComponents,
      componentsWithStories: componentsWithStories.size,
      componentsWithTests: componentsWithTests.size,
      componentsWithLayoutTests: componentsWithLayoutTests.size,
      storyCoverage: Math.round(storyCoverage * 100) / 100,
      testCoverage: Math.round(testCoverage * 100) / 100,
      layoutTestCoverage: Math.round(layoutTestCoverage * 100) / 100,
      averageQualityScore: Math.round(averageQualityScore * 100) / 100,
      componentQuality,
      qualityDistribution,
      missingStories: componentFiles.filter(file => {
        const componentName = path.basename(file, '.ts');
        return !componentsWithStories.has(componentName);
      }).map(file => path.basename(file, '.ts')),
      missingTests: componentFiles.filter(file => {
        const componentName = path.basename(file, '.ts');
        return !componentsWithTests.has(componentName);
      }).map(file => path.basename(file, '.ts'))
    };
  } catch (error) {
    console.warn('Could not analyze component coverage:', error.message);
    return {
      totalComponents: 0,
      componentsWithStories: 0,
      componentsWithTests: 0,
      componentsWithLayoutTests: 0,
      storyCoverage: 0,
      testCoverage: 0,
      layoutTestCoverage: 0,
      averageQualityScore: 0,
      componentQuality: {},
      qualityDistribution: {},
      missingStories: [],
      missingTests: []
    };
  }
}

function analyzeDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    const totalDeps = Object.keys(dependencies).length;
    const totalDevDeps = Object.keys(devDependencies).length;

    // Calculate dependency sizes (rough estimation)
    const nodeModulesPath = 'node_modules';
    let dependencySize = 0;

    if (fs.existsSync(nodeModulesPath)) {
      try {
        const nodeModulesStats = execSync(`du -sh ${nodeModulesPath}`, { encoding: 'utf8' });
        const sizeMatch = nodeModulesStats.match(/^([0-9.]+)([KMGT]?)/);
        if (sizeMatch) {
          const [, size, unit] = sizeMatch;
          const multipliers = { '': 1, 'K': 1024, 'M': 1024*1024, 'G': 1024*1024*1024 };
          dependencySize = parseFloat(size) * (multipliers[unit] || 1);
        }
      } catch (error) {
        // Fallback: estimate based on number of dependencies
        dependencySize = (totalDeps + totalDevDeps) * 1024 * 1024; // 1MB per dependency average
      }
    }

    return {
      production: totalDeps,
      development: totalDevDeps,
      total: totalDeps + totalDevDeps,
      estimatedSize: dependencySize,
      majorFrameworks: {
        lit: !!dependencies.lit,
        typescript: !!(devDependencies.typescript || dependencies.typescript),
        vite: !!(devDependencies.vite || dependencies.vite),
        storybook: !!(devDependencies['@storybook/web-components-vite'] || dependencies['@storybook/web-components-vite'])
      }
    };
  } catch (error) {
    console.warn('Could not analyze dependencies:', error.message);
    return {
      production: 0,
      development: 0,
      total: 0,
      estimatedSize: 0,
      majorFrameworks: {}
    };
  }
}

function measureBuildTime() {
  // This will be populated during the build process
  return {
    start: new Date().toISOString(),
    // We'll measure actual build time in the main function
  };
}

async function generateBuildMetrics() {
  console.log('🚀 Generating Build Metrics...');
  const buildStartTime = Date.now();

  const distDir = 'dist';

  if (!fs.existsSync(distDir)) {
    console.error('❌ dist directory not found. Run "npm run build" first.');
    return;
  }

  const gitInfo = getGitInfo();

  // Collect additional metrics
  console.log('📊 Analyzing component coverage...');
  const componentCoverage = await analyzeComponentCoverage();

  console.log('📦 Analyzing dependencies...');
  const dependencyInfo = analyzeDependencies();

  const metrics = {
    bundleSize: {},
    optimizationScore: 0, // Will be calculated after analyzing files
    optimizationBreakdown: {
      bundleSizeScore: 0,
      compressionScore: 0,
      fileCountScore: 0,
      largeFilesPenalty: 0,
      details: {}
    },
    // New enhanced metrics
    componentCoverage,
    dependencies: dependencyInfo,
    qualityScore: 0, // Will be calculated based on coverage and dependencies
    lastUpdated: new Date().toISOString(),
    commit: gitInfo,
    performance: {
      buildTime: new Date().toISOString(),
      totalBundles: 0,
      totalSize: 0,
      totalGzipSize: 0,
      buildDuration: 0 // Will be set at the end
    }
  };

  // Analyze dist files
  const files = fs.readdirSync(distDir);

  for (const file of files) {
    const filePath = path.join(distDir, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile() && (file.endsWith('.js') || file.endsWith('.css'))) {
      // Simulate gzip compression based on file type
      let compressionRatio;
      if (file.endsWith('.js')) {
        compressionRatio = METRICS_CONFIG.COMPRESSION.JS_RATIO;
      } else if (file.endsWith('.css')) {
        compressionRatio = METRICS_CONFIG.COMPRESSION.CSS_RATIO;
      } else {
        compressionRatio = METRICS_CONFIG.COMPRESSION.DEFAULT_RATIO;
      }

      const gzippedSize = Math.round(stats.size * compressionRatio);

      metrics.bundleSize[file] = {
        originalSize: stats.size,
        gzippedSize: gzippedSize,
        compressionRatio: ((stats.size - gzippedSize) / stats.size) * 100,
        isOptimal: stats.size < METRICS_CONFIG.THRESHOLDS.OPTIMAL_FILE_SIZE
      };

      // Update totals
      metrics.performance.totalBundles++;
      metrics.performance.totalSize += stats.size;
      metrics.performance.totalGzipSize += gzippedSize;
    }
  }

  // Calculate optimization score based on actual metrics
  function calculateOptimizationScore() {
    const breakdown = metrics.optimizationBreakdown;

    // 1. Bundle Size Score (configurable max points)
    const totalSizeMB = metrics.performance.totalSize / (1024 * 1024);
    const { EXCELLENT, GOOD, POOR } = METRICS_CONFIG.THRESHOLDS.TOTAL_SIZE;
    const maxPoints = METRICS_CONFIG.SCORING.BUNDLE_SIZE_MAX;

    if (totalSizeMB > POOR) {
      breakdown.bundleSizeScore = 0; // Severely penalize >2MB
      breakdown.details.bundleSize = `Severe: ${totalSizeMB.toFixed(1)}MB total (target: <${GOOD}MB)`;
    } else if (totalSizeMB > GOOD) {
      breakdown.bundleSizeScore = Math.round(maxPoints * 0.5); // 50% of points
      breakdown.details.bundleSize = `Poor: ${totalSizeMB.toFixed(1)}MB total (target: <${GOOD}MB)`;
    } else if (totalSizeMB > EXCELLENT) {
      breakdown.bundleSizeScore = Math.round(maxPoints * 0.875); // 87.5% of points
      breakdown.details.bundleSize = `Good: ${totalSizeMB.toFixed(1)}MB total (target: <${EXCELLENT}MB)`;
    } else {
      breakdown.bundleSizeScore = maxPoints; // Full points
      breakdown.details.bundleSize = `Excellent: ${totalSizeMB.toFixed(1)}MB total`;
    }

    // 2. Compression Score (configurable max points)
    const compressionRatio = metrics.performance.totalSize > 0 ?
      ((metrics.performance.totalSize - metrics.performance.totalGzipSize) / metrics.performance.totalSize) * 100 : 0;
    const compressionMaxPoints = METRICS_CONFIG.SCORING.COMPRESSION_MAX;

    if (compressionRatio > 75) {
      breakdown.compressionScore = compressionMaxPoints; // Excellent compression
      breakdown.details.compression = `Excellent: ${compressionRatio.toFixed(1)}% compression`;
    } else if (compressionRatio > 65) {
      breakdown.compressionScore = Math.round(compressionMaxPoints * 0.8); // 80% of points
      breakdown.details.compression = `Good: ${compressionRatio.toFixed(1)}% compression`;
    } else if (compressionRatio > 50) {
      breakdown.compressionScore = Math.round(compressionMaxPoints * 0.6); // 60% of points
      breakdown.details.compression = `Fair: ${compressionRatio.toFixed(1)}% compression`;
    } else {
      breakdown.compressionScore = Math.round(compressionMaxPoints * 0.2); // 20% of points
      breakdown.details.compression = `Poor: ${compressionRatio.toFixed(1)}% compression`;
    }

    // 3. File Count Score (configurable max points)
    const fileCount = metrics.performance.totalBundles;
    const fileCountMaxPoints = METRICS_CONFIG.SCORING.FILE_COUNT_MAX;

    if (fileCount < 10) {
      breakdown.fileCountScore = fileCountMaxPoints; // Excellent bundling
      breakdown.details.fileCount = `Excellent: ${fileCount} bundles (well optimized)`;
    } else if (fileCount < 25) {
      breakdown.fileCountScore = Math.round(fileCountMaxPoints * 0.75); // 75% of points
      breakdown.details.fileCount = `Good: ${fileCount} bundles`;
    } else if (fileCount < 50) {
      breakdown.fileCountScore = Math.round(fileCountMaxPoints * 0.5); // 50% of points
      breakdown.details.fileCount = `Fair: ${fileCount} bundles (consider consolidation)`;
    } else {
      breakdown.fileCountScore = 0; // No points
      breakdown.details.fileCount = `Poor: ${fileCount} bundles (too fragmented)`;
    }

    // 4. Large Files Penalty (configurable max penalty)
    let largeFilePenalty = 0;
    let largeFiles = [];
    const { SEVERE_FILE_SIZE, WARNING_FILE_SIZE, GOOD_FILE_SIZE } = METRICS_CONFIG.THRESHOLDS;
    const maxPenalty = METRICS_CONFIG.SCORING.PENALTY_MAX;

    Object.entries(metrics.bundleSize).forEach(([filename, data]) => {
      const fileSize = data.originalSize;
      const sizeKB = fileSize / 1024;

      if (fileSize > SEVERE_FILE_SIZE) {
        largeFilePenalty += 10;
        largeFiles.push(`${filename}: ${sizeKB.toFixed(0)}KB (>${(SEVERE_FILE_SIZE/1024).toFixed(0)}KB limit)`);
      } else if (fileSize > WARNING_FILE_SIZE) {
        largeFilePenalty += 5;
        largeFiles.push(`${filename}: ${sizeKB.toFixed(0)}KB (>${(WARNING_FILE_SIZE/1024).toFixed(0)}KB warning)`);
      } else if (fileSize > GOOD_FILE_SIZE) {
        largeFilePenalty += 1;
        largeFiles.push(`${filename}: ${sizeKB.toFixed(0)}KB (>${(GOOD_FILE_SIZE/1024).toFixed(0)}KB watch)`);
      }
    });

    breakdown.largeFilesPenalty = Math.min(largeFilePenalty, maxPenalty);
    breakdown.details.largeFiles = largeFiles.length > 0 ?
      largeFiles.slice(0, 5).join('; ') : `All files under ${(GOOD_FILE_SIZE/1024).toFixed(0)}KB`;

    // Calculate final score
    const finalScore = Math.max(0, Math.min(100,
      breakdown.bundleSizeScore +
      breakdown.compressionScore +
      breakdown.fileCountScore -
      breakdown.largeFilesPenalty
    ));

    breakdown.details.calculation =
      `${breakdown.bundleSizeScore} (size) + ${breakdown.compressionScore} (compression) + ${breakdown.fileCountScore} (files) - ${breakdown.largeFilesPenalty} (penalties) = ${finalScore}`;

    return Math.round(finalScore);
  }

  // Calculate the optimization score
  metrics.optimizationScore = calculateOptimizationScore();

  // Calculate quality score based on coverage and best practices
  function calculateQualityScore() {
    let qualityScore = 0;

    // Component coverage scoring (40 points max)
    const storyCoveragePoints = Math.round((componentCoverage.storyCoverage / 100) * 20);
    const testCoveragePoints = Math.round((componentCoverage.testCoverage / 100) * 20);

    // Dependency health scoring (30 points max)
    const depHealthPoints = Math.min(30, Math.max(0, 30 - Math.floor(dependencyInfo.total / 10))); // Penalize for too many deps

    // Framework adoption scoring (20 points max)
    const frameworkPoints = Object.values(dependencyInfo.majorFrameworks).filter(Boolean).length * 5;

    // Build efficiency scoring (10 points max)
    const buildEfficiencyPoints = metrics.performance.buildDuration < 10000 ? 10 :
                                 metrics.performance.buildDuration < 30000 ? 7 :
                                 metrics.performance.buildDuration < 60000 ? 4 : 0;

    qualityScore = storyCoveragePoints + testCoveragePoints + depHealthPoints + frameworkPoints + buildEfficiencyPoints;

    return {
      total: Math.min(100, qualityScore),
      breakdown: {
        storyCoverage: storyCoveragePoints,
        testCoverage: testCoveragePoints,
        dependencyHealth: depHealthPoints,
        frameworkAdoption: frameworkPoints,
        buildEfficiency: buildEfficiencyPoints
      }
    };
  }

  // Calculate build duration and quality score
  const buildEndTime = Date.now();
  metrics.performance.buildDuration = buildEndTime - buildStartTime;
  const qualityResult = calculateQualityScore();
  metrics.qualityScore = qualityResult.total;
  metrics.qualityBreakdown = qualityResult.breakdown;

  // Create Storybook build metrics directory
  const storybookMetricsDir = '.storybook/build-metrics';
  if (!fs.existsSync(storybookMetricsDir)) {
    fs.mkdirSync(storybookMetricsDir, { recursive: true });
  }

  // Write metrics for Storybook addon
  fs.writeFileSync(
    path.join(storybookMetricsDir, 'build-metrics.json'),
    JSON.stringify(metrics, null, 2)
  );

  // Also copy to public directory for Storybook to serve
  const publicMetricsDir = 'public/build-metrics';
  if (!fs.existsSync(publicMetricsDir)) {
    fs.mkdirSync(publicMetricsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(publicMetricsDir, 'build-metrics.json'),
    JSON.stringify(metrics, null, 2)
  );

  console.log('✅ Build metrics generated successfully!');
  console.log(`📊 Total bundles: ${metrics.performance.totalBundles}`);
  console.log(`📦 Total size: ${(metrics.performance.totalSize / 1024).toFixed(1)}KB (${(metrics.performance.totalGzipSize / 1024).toFixed(1)}KB gzipped)`);
  console.log(`🎯 Optimization score: ${metrics.optimizationScore}/100`);
  console.log(`⭐ Quality score: ${metrics.qualityScore}/100`);
  console.log(`📚 Components: ${componentCoverage.totalComponents} total, avg quality ${componentCoverage.averageQualityScore}/100`);
  console.log(`  - Stories: ${componentCoverage.storyCoverage.toFixed(1)}% coverage (${componentCoverage.componentsWithStories}/${componentCoverage.totalComponents})`);
  console.log(`  - Tests: ${componentCoverage.testCoverage.toFixed(1)}% coverage (${componentCoverage.componentsWithTests}/${componentCoverage.totalComponents})`);
  console.log(`  - Quality Distribution: ${componentCoverage.qualityDistribution.Excellent} excellent, ${componentCoverage.qualityDistribution.Good} good, ${componentCoverage.qualityDistribution.Fair} fair, ${componentCoverage.qualityDistribution.Basic} basic`);
  console.log(`📦 Dependencies: ${dependencyInfo.total} total (${dependencyInfo.production} prod + ${dependencyInfo.development} dev)`);
  console.log(`⚡ Build time: ${(metrics.performance.buildDuration / 1000).toFixed(2)}s`);
  console.log(`🔗 Commit: ${gitInfo.commitHash} on ${gitInfo.branch}`);
  console.log(`👤 Author: ${gitInfo.author}`);
  console.log('📚 View enhanced dashboard in Storybook Build Metrics panel');
}

generateBuildMetrics().catch(console.error);