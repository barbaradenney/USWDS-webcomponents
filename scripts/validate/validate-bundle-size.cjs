#!/usr/bin/env node

/**
 * Bundle Size Validator
 *
 * Enforces performance budgets for bundle sizes.
 * Fails if any bundle exceeds its configured limit.
 *
 * Usage:
 *   npm run validate:bundle-size
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

// Performance Budgets (in KB)
const BUDGETS = {
  'dist/index.js': 250, // Main bundle
  'dist/forms/index.js': 50,
  'dist/navigation/index.js': 50,
  'dist/data-display/index.js': 50,
  'dist/feedback/index.js': 50,
  'dist/actions/index.js': 50,
  'dist/layout/index.js': 50,
  'dist/structure/index.js': 50,
};

console.log('\n' + BOLD + BLUE + '📦 Bundle Size Validation' + RESET);
console.log(BLUE + '═'.repeat(80) + RESET + '\n');

let totalViolations = 0;
let totalBudget = 0;
let totalActual = 0;

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024); // KB
  } catch (err) {
    return null;
  }
}

function formatSize(kb) {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(2)} MB`;
  }
  return `${kb} KB`;
}

Object.entries(BUDGETS).forEach(([file, budget]) => {
  const size = getFileSize(file);

  totalBudget += budget;

  if (size === null) {
    console.log(YELLOW + `⚠️  ${file}` + RESET);
    console.log(`   ${YELLOW}File not found (run 'npm run build')${RESET}\n`);
    return;
  }

  totalActual += size;

  const percentage = Math.round((size / budget) * 100);
  const remaining = budget - size;

  if (size > budget) {
    console.log(RED + `❌ ${file}` + RESET);
    console.log(`   ${RED}Size: ${formatSize(size)} / Budget: ${formatSize(budget)} (${percentage}%)${RESET}`);
    console.log(`   ${RED}EXCEEDED by ${formatSize(Math.abs(remaining))}${RESET}\n`);
    totalViolations++;
  } else if (percentage >= 90) {
    console.log(YELLOW + `⚠️  ${file}` + RESET);
    console.log(`   ${YELLOW}Size: ${formatSize(size)} / Budget: ${formatSize(budget)} (${percentage}%)${RESET}`);
    console.log(`   ${YELLOW}${formatSize(remaining)} remaining (close to limit)${RESET}\n`);
  } else {
    console.log(GREEN + `✅ ${file}` + RESET);
    console.log(`   Size: ${formatSize(size)} / Budget: ${formatSize(budget)} (${percentage}%)`);
    console.log(`   ${formatSize(remaining)} remaining\n`);
  }
});

// Summary
console.log(BLUE + '═'.repeat(80) + RESET);
console.log(BOLD + 'Summary:' + RESET);
console.log(`  Total Budget: ${formatSize(totalBudget)}`);
console.log(`  Total Actual: ${formatSize(totalActual)}`);
console.log(`  Utilization: ${Math.round((totalActual / totalBudget) * 100)}%`);

if (totalViolations > 0) {
  console.log('\n' + RED + `❌ ${totalViolations} budget(s) exceeded!` + RESET);
  console.log(BLUE + '═'.repeat(80) + RESET + '\n');
  process.exit(1);
} else {
  console.log('\n' + GREEN + '✅ All bundles within budget!' + RESET);
  console.log(BLUE + '═'.repeat(80) + RESET + '\n');
}
