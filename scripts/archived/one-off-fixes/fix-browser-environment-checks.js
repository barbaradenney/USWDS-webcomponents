#!/usr/bin/env node

/**
 * Fix Browser Environment Checks
 *
 * This script adds browser environment checks to all components that access
 * window.USWDS to prevent "window is not defined" errors in test environments.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

console.log('🔧 Fixing browser environment checks in components...');

// Find all component files that check for window.USWDS
const componentFiles = glob.sync('src/components/**/*.ts', {
  ignore: ['**/*.test.ts', '**/*.spec.ts', '**/*.stories.ts'],
});

let fixedCount = 0;
let skippedCount = 0;

for (const filePath of componentFiles) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check if this file has the problematic pattern
  const hasWindowCheck = content.includes("if (typeof (window as any).USWDS !== 'undefined')");
  const hasDocument = content.includes('document.createElement');

  if (!hasWindowCheck) {
    skippedCount++;
    continue;
  }

  console.log(`🔧 Fixing ${filePath}...`);

  // Pattern 1: Fix the window.USWDS check
  let fixedContent = content.replace(
    /if \(typeof \(window as any\)\.USWDS !== 'undefined'\)/g,
    "if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined')"
  );

  // Pattern 2: Add browser environment check before document.createElement if loading scripts
  if (hasDocument && content.includes('loadFullUSWDSLibrary')) {
    // Look for the loadFullUSWDSLibrary method and add browser check
    fixedContent = fixedContent.replace(
      /(return new Promise\(\(resolve, reject\) => \{[\s\S]*?)(\s+console\.log\(`📦 Loading full USWDS library)/,
      (match, beforeLog, logLine) => {
        // Check if browser environment check already exists
        if (beforeLog.includes("typeof window === 'undefined'")) {
          return match; // Already has the check
        }

        return (
          beforeLog +
          `
      // If not in browser environment, resolve immediately
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.log(\`📦 Not in browser environment, skipping USWDS library load\`);
        this.setupFallbackBehavior();
        resolve();
        return;
      }
` +
          logLine
        );
      }
    );
  }

  // Only write if content changed
  if (fixedContent !== content) {
    fs.writeFileSync(filePath, fixedContent);
    fixedCount++;
    console.log(`✅ Fixed ${path.basename(filePath)}`);
  } else {
    skippedCount++;
    console.log(`⚪ Already fixed ${path.basename(filePath)}`);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Files fixed: ${fixedCount}`);
console.log(`   Files skipped: ${skippedCount}`);
console.log(`   Total files: ${componentFiles.length}`);

if (fixedCount > 0) {
  console.log(`\n✅ Browser environment checks have been added to prevent test failures.`);
} else {
  console.log(`\n⚪ No files needed fixing.`);
}
