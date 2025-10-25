#!/usr/bin/env node

/**
 * Package Health Dashboard
 * Displays comprehensive health metrics for all packages
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');
const packagesDir = join(rootDir, 'packages');

console.log('🏥 USWDS Web Components - Package Health Dashboard\n');
console.log('═'.repeat(80));
console.log('\n');

const packageDirs = readdirSync(packagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

const healthData = [];

packageDirs.forEach(dir => {
  const pkgPath = join(packagesDir, dir, 'package.json');
  if (!existsSync(pkgPath)) return;

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

  // Gather metrics
  const metrics = {
    name: pkg.name,
    version: pkg.version,
    private: pkg.private || false,
    componentCount: countComponents(dir),
    testCount: countTests(dir),
    docCount: countDocs(dir),
    dependencyCount: Object.keys(pkg.dependencies || {}).length,
    devDependencyCount: Object.keys(pkg.devDependencies || {}).length,
    bundleSize: estimateBundleSize(dir),
    lastModified: getLastModified(dir),
    hasReadme: existsSync(join(packagesDir, dir, 'README.md')),
    hasTsConfig: existsSync(join(packagesDir, dir, 'tsconfig.json')),
    hasTests: countTests(dir) > 0,
  };

  // Calculate health score
  metrics.healthScore = calculateHealthScore(metrics);

  healthData.push(metrics);
});

function countComponents(packageDir) {
  const componentsPath = join(packagesDir, packageDir, 'src/components');
  if (!existsSync(componentsPath)) return 0;

  return readdirSync(componentsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .length;
}

function countTests(packageDir) {
  const srcPath = join(packagesDir, packageDir, 'src');
  if (!existsSync(srcPath)) return 0;

  let count = 0;
  function countInDir(dir) {
    const items = readdirSync(dir, { withFileTypes: true });
    items.forEach(item => {
      if (item.isDirectory()) {
        countInDir(join(dir, item.name));
      } else if (item.name.endsWith('.test.ts') || item.name.endsWith('.test.tsx')) {
        count++;
      }
    });
  }

  countInDir(srcPath);
  return count;
}

function countDocs(packageDir) {
  const docsPath = join(packagesDir, packageDir, 'docs');
  if (!existsSync(docsPath)) return 0;

  return readdirSync(docsPath, { withFileTypes: true })
    .filter(dirent => dirent.isFile() && dirent.name.endsWith('.md'))
    .length;
}

function estimateBundleSize(packageDir) {
  const distPath = join(packagesDir, packageDir, 'dist');
  if (!existsSync(distPath)) return 'Not built';

  try {
    let totalSize = 0;
    function calcSize(dir) {
      const items = readdirSync(dir, { withFileTypes: true });
      items.forEach(item => {
        const fullPath = join(dir, item.name);
        if (item.isDirectory()) {
          calcSize(fullPath);
        } else {
          totalSize += statSync(fullPath).size;
        }
      });
    }

    calcSize(distPath);
    return formatBytes(totalSize);
  } catch (e) {
    return 'Error';
  }
}

function getLastModified(packageDir) {
  try {
    const result = execSync(
      `git log -1 --format=%cr -- ${packagesDir}/${packageDir}`,
      { encoding: 'utf8', cwd: rootDir }
    );
    return result.trim() || 'Unknown';
  } catch (e) {
    return 'Unknown';
  }
}

function calculateHealthScore(metrics) {
  let score = 0;

  // Has tests
  if (metrics.hasTests) score += 20;

  // Test coverage (estimated by test count vs component count)
  if (metrics.componentCount > 0) {
    const testsPerComponent = metrics.testCount / metrics.componentCount;
    if (testsPerComponent >= 3) score += 20;
    else if (testsPerComponent >= 2) score += 15;
    else if (testsPerComponent >= 1) score += 10;
  }

  // Has README
  if (metrics.hasReadme) score += 15;

  // Has TypeScript config
  if (metrics.hasTsConfig) score += 10;

  // Recently updated (not stale)
  if (metrics.lastModified !== 'Unknown' && !metrics.lastModified.includes('years')) {
    score += 15;
  }

  // Has documentation
  if (metrics.docCount > 0) score += 10;

  // Not too many dependencies (indicates good architecture)
  if (metrics.dependencyCount <= 3) score += 10;

  return score;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getHealthEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 70) return '🟡';
  if (score >= 50) return '🟠';
  return '🔴';
}

// Sort by health score
healthData.sort((a, b) => b.healthScore - a.healthScore);

// Display dashboard
healthData.forEach((pkg, index) => {
  const emoji = getHealthEmoji(pkg.healthScore);
  const status = pkg.private ? '🔒 PRIVATE' : '📦 PUBLIC';

  console.log(`${emoji} ${pkg.name} ${status}`);
  console.log(`${'─'.repeat(80)}`);
  console.log(`Version: ${pkg.version}`.padEnd(40) + `Health Score: ${pkg.healthScore}/100`);
  console.log(`Components: ${pkg.componentCount}`.padEnd(40) + `Tests: ${pkg.testCount}`);
  console.log(`Bundle Size: ${pkg.bundleSize}`.padEnd(40) + `Dependencies: ${pkg.dependencyCount}`);
  console.log(`Last Modified: ${pkg.lastModified}`);

  // Show issues
  const issues = [];
  if (!pkg.hasTests) issues.push('❌ No tests');
  if (!pkg.hasReadme) issues.push('❌ No README');
  if (pkg.componentCount > 0 && pkg.testCount / pkg.componentCount < 2) {
    issues.push('⚠️  Low test coverage');
  }

  if (issues.length > 0) {
    console.log(`\n  Issues: ${issues.join(', ')}`);
  }

  console.log('\n');
});

// Summary statistics
console.log('═'.repeat(80));
console.log('\n📊 SUMMARY STATISTICS\n');
console.log('═'.repeat(80));
console.log('\n');

const totalPackages = healthData.length;
const publicPackages = healthData.filter(p => !p.private).length;
const avgHealthScore = (healthData.reduce((sum, p) => sum + p.healthScore, 0) / totalPackages).toFixed(1);
const totalComponents = healthData.reduce((sum, p) => sum + p.componentCount, 0);
const totalTests = healthData.reduce((sum, p) => sum + p.testCount, 0);

console.log(`Total Packages: ${totalPackages}`);
console.log(`Public Packages: ${publicPackages}`);
console.log(`Average Health Score: ${avgHealthScore}/100`);
console.log(`Total Components: ${totalComponents}`);
console.log(`Total Tests: ${totalTests}`);
console.log(`Test to Component Ratio: ${(totalTests / totalComponents).toFixed(2)}:1`);

// Health distribution
console.log(`\nHealth Distribution:`);
const excellent = healthData.filter(p => p.healthScore >= 90).length;
const good = healthData.filter(p => p.healthScore >= 70 && p.healthScore < 90).length;
const fair = healthData.filter(p => p.healthScore >= 50 && p.healthScore < 70).length;
const poor = healthData.filter(p => p.healthScore < 50).length;

console.log(`  🟢 Excellent (90-100): ${excellent} packages`);
console.log(`  🟡 Good (70-89): ${good} packages`);
console.log(`  🟠 Fair (50-69): ${fair} packages`);
console.log(`  🔴 Poor (0-49): ${poor} packages`);

// Recommendations
console.log(`\n💡 RECOMMENDATIONS\n`);
console.log('─'.repeat(80));

const packagesNeedingWork = healthData.filter(p => p.healthScore < 70);
if (packagesNeedingWork.length > 0) {
  console.log(`\nPackages needing attention (${packagesNeedingWork.length}):\n`);
  packagesNeedingWork.forEach(pkg => {
    console.log(`  ${pkg.name} (Score: ${pkg.healthScore}/100)`);
    if (!pkg.hasTests) console.log(`    - Add tests`);
    if (!pkg.hasReadme) console.log(`    - Add README.md`);
    if (pkg.componentCount > 0 && pkg.testCount / pkg.componentCount < 2) {
      console.log(`    - Increase test coverage (currently ${(pkg.testCount / pkg.componentCount).toFixed(1)} tests per component)`);
    }
  });
} else {
  console.log(`\n✅ All packages are in good health!`);
}

console.log('\n');
