#!/usr/bin/env node

/**
 * Bundle Size Test Script for Monorepo
 * Analyzes bundle sizes across all packages in the monorepo structure
 */

const fs = require('fs');
const path = require('path');

// Bundle size thresholds (in KB)
const THRESHOLDS = {
  js: 250,  // Max 250KB for JavaScript bundles
  css: 600, // Max 600KB for CSS bundles
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function formatSize(bytes) {
  return (bytes / 1024).toFixed(2) + ' KB';
}

function analyzeBundle(filePath) {
  const stats = fs.statSync(filePath);
  const ext = path.extname(filePath).slice(1);
  const sizeKB = stats.size / 1024;
  const threshold = THRESHOLDS[ext] || 1000;

  return {
    path: filePath,
    size: stats.size,
    sizeKB: sizeKB.toFixed(2),
    ext,
    threshold,
    exceedsThreshold: sizeKB > threshold,
  };
}

function scanPackageDir(packagePath) {
  const distPath = path.join(packagePath, 'dist');

  if (!fs.existsSync(distPath)) {
    return [];
  }

  const files = fs.readdirSync(distPath);
  const bundles = [];

  for (const file of files) {
    if (file.endsWith('.js') || file.endsWith('.css')) {
      const filePath = path.join(distPath, file);
      bundles.push(analyzeBundle(filePath));
    }
  }

  return bundles;
}

function main() {
  console.log(`${colors.blue}📦 Bundle Size Analysis for Monorepo${colors.reset}\n`);

  const packagesDir = path.join(process.cwd(), 'packages');

  if (!fs.existsSync(packagesDir)) {
    console.error(`${colors.red}❌ Error: packages/ directory not found${colors.reset}`);
    process.exit(1);
  }

  const packages = fs.readdirSync(packagesDir);
  let allBundles = [];
  let hasErrors = false;

  for (const pkg of packages) {
    const packagePath = path.join(packagesDir, pkg);
    const stat = fs.statSync(packagePath);

    if (!stat.isDirectory()) continue;

    const bundles = scanPackageDir(packagePath);

    if (bundles.length > 0) {
      console.log(`${colors.blue}Package: ${pkg}${colors.reset}`);

      for (const bundle of bundles) {
        const fileName = path.relative(process.cwd(), bundle.path);
        const statusColor = bundle.exceedsThreshold ? colors.red : colors.green;
        const statusSymbol = bundle.exceedsThreshold ? '❌' : '✅';

        console.log(`  ${statusSymbol} ${fileName}: ${statusColor}${bundle.sizeKB} KB${colors.reset} (threshold: ${bundle.threshold} KB)`);

        if (bundle.exceedsThreshold) {
          hasErrors = true;
        }
      }

      allBundles = allBundles.concat(bundles);
      console.log('');
    }
  }

  // Summary
  console.log(`${colors.blue}📊 Summary${colors.reset}`);
  console.log(`Total bundles analyzed: ${allBundles.length}`);

  const totalSize = allBundles.reduce((sum, bundle) => sum + bundle.size, 0);
  console.log(`Total bundle size: ${formatSize(totalSize)}`);

  const exceedingBundles = allBundles.filter(b => b.exceedsThreshold);
  if (exceedingBundles.length > 0) {
    console.log(`\n${colors.red}⚠️  ${exceedingBundles.length} bundle(s) exceed size thresholds!${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}✅ All bundles are within size thresholds${colors.reset}`);
    process.exit(0);
  }
}

main();
