#!/usr/bin/env node

/**
 * Unused Code Detector
 *
 * Detects unused exports, imports, and dependencies.
 * Helps identify dead code for removal.
 *
 * Usage:
 *   npm run cleanup:unused
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

console.log('\n' + BOLD + BLUE + '🔍 Unused Code Detection' + RESET);
console.log(BLUE + '═'.repeat(80) + RESET + '\n');

let issuesFound = 0;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. Detect Unused Dependencies
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log(BOLD + '1. Checking for unused dependencies...' + RESET + '\n');

try {
  // Check if depcheck is installed
  try {
    execSync('npx depcheck --version', { stdio: 'ignore' });
  } catch {
    console.log(YELLOW + '⚠️  Installing depcheck...' + RESET);
    execSync('npm install -D depcheck', { stdio: 'inherit' });
  }

  const depcheckOutput = execSync('npx depcheck --json', { encoding: 'utf8' });
  const depcheck = JSON.parse(depcheckOutput);

  if (depcheck.dependencies && depcheck.dependencies.length > 0) {
    console.log(YELLOW + `⚠️  Found ${depcheck.dependencies.length} unused dependencies:` + RESET);
    depcheck.dependencies.forEach(dep => {
      console.log(`   - ${dep}`);
      issuesFound++;
    });
    console.log('');
    console.log(BLUE + '   To remove: npm uninstall ' + depcheck.dependencies.join(' ') + RESET + '\n');
  } else {
    console.log(GREEN + '✅ No unused dependencies found' + RESET + '\n');
  }

  if (depcheck.devDependencies && depcheck.devDependencies.length > 0) {
    console.log(YELLOW + `⚠️  Found ${depcheck.devDependencies.length} unused devDependencies:` + RESET);
    depcheck.devDependencies.forEach(dep => {
      console.log(`   - ${dep}`);
      issuesFound++;
    });
    console.log('');
    console.log(BLUE + '   To remove: npm uninstall ' + depcheck.devDependencies.join(' ') + RESET + '\n');
  }
} catch (err) {
  console.log(RED + '❌ Error running depcheck:' + RESET, err.message + '\n');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. Detect Unused Exports (TypeScript)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log(BOLD + '2. Checking for unused exports...' + RESET + '\n');

try {
  // Check if ts-prune is installed
  try {
    execSync('npx ts-prune --version', { stdio: 'ignore' });
  } catch {
    console.log(YELLOW + '⚠️  Installing ts-prune...' + RESET);
    execSync('npm install -D ts-prune', { stdio: 'inherit' });
  }

  const tsPruneOutput = execSync('npx ts-prune --error', { encoding: 'utf8' });
  const unusedExports = tsPruneOutput.trim().split('\n').filter(Boolean);

  if (unusedExports.length > 0) {
    // Filter out common false positives
    const filtered = unusedExports.filter(line =>
      !line.includes('(used in module)') &&
      !line.includes('.d.ts') &&
      !line.includes('stories.ts') &&
      !line.includes('test.ts') &&
      !line.includes('cy.ts')
    );

    if (filtered.length > 0) {
      console.log(YELLOW + `⚠️  Found ${filtered.length} potentially unused exports:` + RESET);
      filtered.slice(0, 20).forEach(line => {
        console.log(`   ${line}`);
        issuesFound++;
      });

      if (filtered.length > 20) {
        console.log(`   ... and ${filtered.length - 20} more`);
      }
      console.log('');
    } else {
      console.log(GREEN + '✅ No unused exports found' + RESET + '\n');
    }
  } else {
    console.log(GREEN + '✅ No unused exports found' + RESET + '\n');
  }
} catch (err) {
  // ts-prune exits with error code when it finds unused exports
  const output = err.stdout ? err.stdout.toString() : '';
  if (output) {
    const lines = output.trim().split('\n').filter(Boolean);
    const filtered = lines.filter(line =>
      !line.includes('(used in module)') &&
      !line.includes('.d.ts') &&
      !line.includes('stories.ts') &&
      !line.includes('test.ts') &&
      !line.includes('cy.ts')
    );

    if (filtered.length > 0) {
      console.log(YELLOW + `⚠️  Found ${filtered.length} potentially unused exports:` + RESET);
      filtered.slice(0, 20).forEach(line => {
        console.log(`   ${line}`);
        issuesFound++;
      });

      if (filtered.length > 20) {
        console.log(`   ... and ${filtered.length - 20} more`);
      }
      console.log('');
    } else {
      console.log(GREEN + '✅ No unused exports found' + RESET + '\n');
    }
  } else {
    console.log(GREEN + '✅ No unused exports found' + RESET + '\n');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. Detect Unreferenced Files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log(BOLD + '3. Checking for unreferenced files...' + RESET + '\n');

try {
  // Check if unimported is installed
  try {
    execSync('npx unimported --version', { stdio: 'ignore' });
  } catch {
    console.log(YELLOW + '⚠️  Installing unimported...' + RESET);
    execSync('npm install -D unimported', { stdio: 'inherit' });
  }

  const unimportedOutput = execSync('npx unimported', { encoding: 'utf8' });

  if (unimportedOutput.includes('unresolved imports') || unimportedOutput.includes('unused files')) {
    console.log(YELLOW + '⚠️  Found unreferenced files:' + RESET);
    console.log(unimportedOutput);
    issuesFound++;
  } else {
    console.log(GREEN + '✅ No unreferenced files found' + RESET + '\n');
  }
} catch (err) {
  const output = err.stdout ? err.stdout.toString() : '';
  if (output && (output.includes('unresolved imports') || output.includes('unused files'))) {
    console.log(YELLOW + '⚠️  Found unreferenced files:' + RESET);
    console.log(output);
    issuesFound++;
  } else {
    console.log(GREEN + '✅ No unreferenced files found' + RESET + '\n');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Summary
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log(BLUE + '═'.repeat(80) + RESET);

if (issuesFound > 0) {
  console.log(YELLOW + `\n⚠️  Found ${issuesFound} potential issues` + RESET);
  console.log('\n' + BLUE + '💡 Recommendations:' + RESET);
  console.log('   1. Review the unused code above');
  console.log('   2. Verify it\'s truly unused (check for dynamic imports)');
  console.log('   3. Remove unused dependencies: npm uninstall <package>');
  console.log('   4. Remove unused exports and files manually');
} else {
  console.log(GREEN + '\n✅ No unused code detected!' + RESET);
}

console.log(BLUE + '═'.repeat(80) + RESET + '\n');
