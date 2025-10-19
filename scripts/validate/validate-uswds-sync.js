#!/usr/bin/env node

/**
 * USWDS Sync Validation Pre-commit Hook
 *
 * Validates that USWDS-mirrored behavior files maintain proper source attribution
 * and are kept in sync with official USWDS source code.
 *
 * BLOCKING VALIDATIONS:
 * - Required metadata (@uswds-source, @uswds-version, @last-synced)
 * - Source attribution (SOURCE: comments with line numbers)
 * - Component integration (cleanup pattern)
 *
 * NON-BLOCKING WARNINGS:
 * - Stale sync dates (>90 days)
 * - Version mismatches with package.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ANSI color codes
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

/**
 * Find all behavior files in the codebase
 */
function findBehaviorFiles() {
  const componentsDir = path.join(ROOT_DIR, 'src', 'components');
  const behaviorFiles = [];

  if (!fs.existsSync(componentsDir)) {
    return behaviorFiles;
  }

  const componentDirs = fs.readdirSync(componentsDir);

  for (const dir of componentDirs) {
    const componentPath = path.join(componentsDir, dir);
    if (!fs.statSync(componentPath).isDirectory()) continue;

    const behaviorFile = path.join(componentPath, `usa-${dir}-behavior.ts`);
    if (fs.existsSync(behaviorFile)) {
      behaviorFiles.push({
        component: dir,
        path: behaviorFile,
        relativePath: path.relative(ROOT_DIR, behaviorFile),
      });
    }
  }

  return behaviorFiles;
}

/**
 * Validate a single behavior file
 */
function validateBehaviorFile(file) {
  const content = fs.readFileSync(file.path, 'utf-8');
  const errors = [];
  const warnings = [];

  // Check for required metadata
  const uswdsSourceMatch = content.match(/@uswds-source\s+(.+)/);
  const uswdsVersionMatch = content.match(/@uswds-version\s+(.+)/);
  const lastSyncedMatch = content.match(/@last-synced\s+(\d{4}-\d{2}-\d{2})/);

  if (!uswdsSourceMatch) {
    errors.push('Missing @uswds-source metadata with GitHub link');
  } else {
    const sourceUrl = uswdsSourceMatch[1].trim();
    if (!sourceUrl.includes('github.com/uswds/uswds')) {
      errors.push(`Invalid @uswds-source URL: ${sourceUrl}`);
    }
  }

  if (!uswdsVersionMatch) {
    errors.push('Missing @uswds-version metadata');
  } else {
    // Check if version matches package.json
    const packageJsonPath = path.join(ROOT_DIR, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const uswdsVersion = packageJson.dependencies?.['@uswds/uswds'] || '';
      const behaviorVersion = uswdsVersionMatch[1].trim();

      if (uswdsVersion && !uswdsVersion.includes(behaviorVersion)) {
        warnings.push(
          `@uswds-version (${behaviorVersion}) doesn't match package.json (${uswdsVersion})`
        );
      }
    }
  }

  if (!lastSyncedMatch) {
    errors.push('Missing @last-synced date in YYYY-MM-DD format');
  } else {
    const lastSynced = new Date(lastSyncedMatch[1]);
    const daysSinceSync = Math.floor((Date.now() - lastSynced.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceSync > 90) {
      warnings.push(
        `Behavior file is ${daysSinceSync} days old (last synced: ${lastSyncedMatch[1]})`
      );
      warnings.push('Consider running: npm run uswds:check-behavior-sync');
    }
  }

  // Check for SOURCE comments on exported functions
  const exportedFunctions = content.match(/export\s+function\s+\w+/g) || [];
  const sourceComments = content.match(/SOURCE:\s+.+\(Lines?\s+\d+-?\d*\)/gi) || [];

  if (exportedFunctions.length > 0 && sourceComments.length === 0) {
    errors.push('No SOURCE: comments found for exported functions');
  }

  // Check for proper cleanup pattern in corresponding component file
  const componentFile = path.join(path.dirname(file.path), `usa-${file.component}.ts`);
  if (fs.existsSync(componentFile)) {
    const componentContent = fs.readFileSync(componentFile, 'utf-8');

    if (!componentContent.includes(`from './usa-${file.component}-behavior.js'`)) {
      errors.push(`Component doesn't import behavior file`);
    }

    if (!componentContent.includes('this.cleanup')) {
      errors.push(`Component doesn't use cleanup pattern`);
    }

    if (!componentContent.includes('this.cleanup?.()')) {
      errors.push(`Component doesn't call cleanup in disconnectedCallback`);
    }
  }

  return { errors, warnings };
}

/**
 * Main validation function
 */
function main() {
  console.log(`${BLUE}=== USWDS Sync Validation ===${RESET}\n`);

  const behaviorFiles = findBehaviorFiles();

  if (behaviorFiles.length === 0) {
    console.log(`${GREEN}✓${RESET} No USWDS-mirrored behavior files found (all components use direct integration)\n`);
    return 0;
  }

  console.log(`Found ${behaviorFiles.length} USWDS-mirrored behavior file(s):\n`);

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of behaviorFiles) {
    console.log(`${BLUE}Validating:${RESET} ${file.relativePath}`);

    const { errors, warnings } = validateBehaviorFile(file);

    if (errors.length === 0 && warnings.length === 0) {
      console.log(`  ${GREEN}✓${RESET} All validations passed\n`);
    } else {
      if (errors.length > 0) {
        console.log(`  ${RED}✗ ${errors.length} error(s):${RESET}`);
        errors.forEach((error) => console.log(`    • ${error}`));
        totalErrors += errors.length;
      }

      if (warnings.length > 0) {
        console.log(`  ${YELLOW}⚠ ${warnings.length} warning(s):${RESET}`);
        warnings.forEach((warning) => console.log(`    • ${warning}`));
        totalWarnings += warnings.length;
      }

      console.log();
    }
  }

  // Summary
  console.log(`${BLUE}=== Summary ===${RESET}`);
  console.log(`Total files checked: ${behaviorFiles.length}`);
  console.log(`Total errors: ${totalErrors > 0 ? RED : GREEN}${totalErrors}${RESET}`);
  console.log(`Total warnings: ${totalWarnings > 0 ? YELLOW : GREEN}${totalWarnings}${RESET}\n`);

  if (totalErrors > 0) {
    console.log(`${RED}✗ VALIDATION FAILED${RESET}`);
    console.log(`Fix errors above before committing.\n`);
    console.log(`See CLAUDE.md for USWDS-mirrored behavior requirements.\n`);
    return 1;
  }

  if (totalWarnings > 0) {
    console.log(`${YELLOW}⚠ VALIDATION PASSED WITH WARNINGS${RESET}`);
    console.log(`Consider addressing warnings above.\n`);
  } else {
    console.log(`${GREEN}✓ ALL VALIDATIONS PASSED${RESET}\n`);
  }

  return 0;
}

// Run validation
const exitCode = main();
process.exit(exitCode);
