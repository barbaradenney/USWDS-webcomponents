#!/usr/bin/env node

/**
 * Bundle Size Validation Script
 *
 * Validates bundle sizes against configured limits from .size-limit.json
 * Used by pre-commit hooks and CI/CD pipelines
 *
 * Usage:
 *   node scripts/validate/check-bundle-size.js [--strict]
 *
 * Options:
 *   --strict  Fail on any size increase (for CI)
 *
 * Exit codes:
 *   0 - All sizes within limits
 *   1 - One or more sizes exceed limits
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { gzipSync, brotliCompressSync } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

// Parse command line arguments
const args = process.argv.slice(2);
const strictMode = args.includes('--strict');

// Load size limits configuration
const configPath = join(rootDir, '.size-limit.json');
if (!existsSync(configPath)) {
  console.error('❌ Error: .size-limit.json not found!');
  console.error('💡 Run: npm run build first');
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, 'utf-8'));
const limits = config.limits || [];

// Helper: Parse size string (e.g., "95 KB") to bytes
function parseSizeToBytes(sizeStr) {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|B)$/i);
  if (!match) {
    throw new Error(`Invalid size format: ${sizeStr}`);
  }

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  switch (unit) {
    case 'B': return value;
    case 'KB': return value * 1024;
    case 'MB': return value * 1024 * 1024;
    default: throw new Error(`Unknown unit: ${unit}`);
  }
}

// Helper: Format bytes to readable size
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Helper: Calculate percentage
function calcPercentage(actual, limit) {
  return ((actual / limit) * 100).toFixed(1);
}

// Main validation
let failed = false;
let warnings = [];

console.log('📦 Bundle Size Validation');
console.log('=========================\n');

for (const entry of limits) {
  const filePath = join(rootDir, entry.path);

  // Check if file exists
  if (!existsSync(filePath)) {
    console.log(`⏭️  ${entry.name}`);
    console.log(`   Path: ${entry.path}`);
    console.log(`   Status: File not found (skipped)\n`);
    continue;
  }

  // Read file and compress
  const content = readFileSync(filePath);
  const rawSize = content.length;
  let compressedSize = rawSize;
  let compressionType = 'raw';

  if (entry.gzip) {
    compressedSize = gzipSync(content).length;
    compressionType = 'gzip';
  } else if (entry.brotli) {
    compressedSize = brotliCompressSync(content).length;
    compressionType = 'brotli';
  }

  // Parse limit
  const limitBytes = parseSizeToBytes(entry.limit);
  const percentage = calcPercentage(compressedSize, limitBytes);
  const diff = compressedSize - limitBytes;

  // Determine status
  const isOver = compressedSize > limitBytes;
  const isNearLimit = percentage >= 90 && percentage <= 100;

  // Format output
  console.log(`${isOver ? '❌' : isNearLimit ? '⚠️ ' : '✅'} ${entry.name}`);
  console.log(`   Path: ${entry.path}`);
  console.log(`   Type: ${compressionType}`);
  console.log(`   Size: ${formatBytes(compressedSize)} / ${entry.limit} (${percentage}%)`);

  if (isOver) {
    console.log(`   Over by: ${formatBytes(diff)} ⚠️`);
    console.log(`   Status: EXCEEDS LIMIT ❌`);
    failed = true;
  } else if (isNearLimit) {
    console.log(`   Status: Near limit (warning) ⚠️`);
    warnings.push({
      name: entry.name,
      percentage: percentage,
      remaining: limitBytes - compressedSize
    });
  } else {
    console.log(`   Under by: ${formatBytes(Math.abs(diff))} ✅`);
    console.log(`   Status: Within budget ✅`);
  }

  console.log('');
}

// Summary
console.log('=========================');
if (failed) {
  console.log('❌ Bundle size check FAILED');
  console.log('One or more files exceed size limits!');
  console.log('');
  console.log('💡 Actions to take:');
  console.log('   1. Review bundle composition: npm run build:analyze:visual');
  console.log('   2. Check for large dependencies');
  console.log('   3. Optimize code and remove unused imports');
  console.log('   4. See docs/BUNDLE_SIZE_OPTIMIZATION_GUIDE.md');
  process.exit(1);
} else if (warnings.length > 0 && strictMode) {
  console.log('⚠️  Bundle size warnings detected (strict mode)');
  for (const warning of warnings) {
    console.log(`   • ${warning.name}: ${warning.percentage}% of limit (${formatBytes(warning.remaining)} remaining)`);
  }
  console.log('');
  console.log('💡 Consider optimizing before these exceed limits');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('⚠️  Bundle size check PASSED (with warnings)');
  for (const warning of warnings) {
    console.log(`   • ${warning.name}: ${warning.percentage}% of limit (${formatBytes(warning.remaining)} remaining)`);
  }
  console.log('');
  console.log('💡 Monitor these files - approaching size limits');
} else {
  console.log('✅ Bundle size check PASSED');
  console.log('All files within size limits!');
}

console.log('');
