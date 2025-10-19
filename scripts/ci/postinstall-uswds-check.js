#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Post-install USWDS Class List Update Hook
 *
 * This script runs after npm install to automatically detect if
 * USWDS has been updated and refresh the compliance class list.
 *
 * Called by: npm's postinstall hook
 * Features:
 * - Silent operation (only outputs when updates are needed)
 * - Automatic detection of USWDS changes
 * - Non-breaking (fails gracefully)
 */

/**
 * Check if we're in a CI environment
 */
function isCI() {
  return !!(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.BUILD_NUMBER ||
    process.env.RUN_ID ||
    process.env.GITHUB_ACTIONS ||
    process.env.TRAVIS ||
    process.env.CIRCLECI ||
    process.env.JENKINS_URL
  );
}

/**
 * Check if USWDS is available
 */
function isUSWDSAvailable() {
  const uswdsPath = path.join(projectRoot, 'node_modules', '@uswds', 'uswds');
  return fs.existsSync(uswdsPath);
}

/**
 * Main post-install check
 */
function main() {
  // Skip in CI environments to avoid unnecessary builds
  if (isCI()) {
    return;
  }

  // Skip if USWDS is not installed
  if (!isUSWDSAvailable()) {
    return;
  }

  try {
    // Run the class update check (silent mode)
    const updateScript = path.join(__dirname, 'auto-update-uswds-classes.js');
    execSync(`node "${updateScript}" --check-only`, {
      cwd: projectRoot,
      stdio: 'pipe' // Suppress output
    });

    // If we get here, no update was needed
  } catch (error) {
    // Exit code 1 means update is needed
    if (error.status === 1) {
      console.log('📦 USWDS version changed - updating compliance class list...');

      try {
        execSync(`node "${updateScript}"`, {
          cwd: projectRoot,
          stdio: 'inherit' // Show output for actual update
        });

        console.log('✅ USWDS class list updated successfully');
      } catch (updateError) {
        console.warn('⚠️  Failed to update USWDS class list automatically');
        console.warn('💡 Run "npm run uswds:update-classes" manually when convenient');
      }
    }
    // Other errors are ignored (script not found, etc.)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { isCI, isUSWDSAvailable };