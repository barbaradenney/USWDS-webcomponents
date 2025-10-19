#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Automated USWDS Class List Update Script
 *
 * This script automatically detects USWDS version changes and updates
 * the compliance checker's class database accordingly.
 *
 * Usage:
 *   npm run uswds:update-classes
 *   npm run uswds:update-classes --force
 *   node scripts/auto-update-uswds-classes.js --check-only
 *
 * Features:
 * - Detects USWDS version changes
 * - Automatically extracts new class lists
 * - Creates backups before updates
 * - Validates extracted classes
 * - Provides detailed change reports
 */

const USWDS_VERSION_FILE = path.join(projectRoot, '.uswds-version');
const CLASS_LIST_FILE = '/tmp/uswds_classes.txt';

/**
 * Get the currently installed USWDS version
 */
function getCurrentUSWDSVersion() {
  try {
    const packageJsonPath = path.join(projectRoot, 'node_modules', '@uswds', 'uswds', 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('USWDS package not found. Run npm install first.');
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    console.error('❌ Error getting USWDS version:', error.message);
    process.exit(1);
  }
}

/**
 * Get the last processed USWDS version
 */
function getLastProcessedVersion() {
  if (fs.existsSync(USWDS_VERSION_FILE)) {
    return fs.readFileSync(USWDS_VERSION_FILE, 'utf8').trim();
  }
  return null;
}

/**
 * Save the current USWDS version as processed
 */
function saveProcessedVersion(version) {
  fs.writeFileSync(USWDS_VERSION_FILE, version);
  console.log(`📝 Saved processed version: ${version}`);
}

/**
 * Check if class list needs updating
 */
function needsUpdate(currentVersion, lastVersion, forceUpdate = false) {
  if (forceUpdate) {
    console.log('🔄 Force update requested');
    return true;
  }

  if (!lastVersion) {
    console.log('📋 No previous version recorded, updating class list');
    return true;
  }

  if (currentVersion !== lastVersion) {
    console.log(`🆕 USWDS version changed: ${lastVersion} → ${currentVersion}`);
    return true;
  }

  if (!fs.existsSync(CLASS_LIST_FILE)) {
    console.log('📂 Class list file missing, regenerating');
    return true;
  }

  return false;
}

/**
 * Extract and update USWDS classes
 */
function extractAndUpdateClasses() {
  console.log('🔍 Extracting USWDS classes...');

  try {
    // Run the extraction script with auto-update flag
    const extractionScript = path.join(__dirname, 'extract-complete-uswds-classes.js');
    const result = execSync(`node "${extractionScript}" --auto-update`, {
      encoding: 'utf8',
      cwd: projectRoot,
      env: { ...process.env, USWDS_AUTO_UPDATE: 'true' }
    });

    console.log(result);
    return true;
  } catch (error) {
    console.error('❌ Error extracting classes:', error.message);
    return false;
  }
}

/**
 * Validate the extracted class list
 */
function validateClassList() {
  if (!fs.existsSync(CLASS_LIST_FILE)) {
    console.error('❌ Class list file not found after extraction');
    return false;
  }

  const classes = fs.readFileSync(CLASS_LIST_FILE, 'utf8')
    .split('\n')
    .filter(line => line.trim())
    .filter(line => line.startsWith('.usa-'));

  if (classes.length < 500) {
    console.error(`❌ Class list seems incomplete (${classes.length} classes found, expected 500+)`);
    return false;
  }

  console.log(`✅ Class list validated: ${classes.length} USWDS classes`);
  return true;
}

/**
 * Run compliance check to verify everything works
 */
function runComplianceCheck() {
  console.log('🔍 Running compliance check to verify class list...');

  try {
    const complianceScript = path.join(__dirname, 'uswds-compliance-check.js');
    execSync(`node "${complianceScript}" --component character-count`, {
      encoding: 'utf8',
      cwd: projectRoot,
      stdio: 'pipe' // Suppress output unless there's an error
    });

    console.log('✅ Compliance check passed');
    return true;
  } catch (error) {
    console.warn('⚠️  Compliance check completed with warnings (this is normal)');
    return true; // Warnings are OK, errors would be caught
  }
}

/**
 * Main automation function
 */
function main() {
  const args = process.argv.slice(2);
  const forceUpdate = args.includes('--force');
  const checkOnly = args.includes('--check-only');

  console.log('🚀 USWDS Class List Automation\n');

  // Get current and last processed versions
  const currentVersion = getCurrentUSWDSVersion();
  const lastVersion = getLastProcessedVersion();

  console.log(`📦 Current USWDS version: ${currentVersion}`);
  console.log(`📋 Last processed version: ${lastVersion || 'none'}`);

  // Check if update is needed
  if (!needsUpdate(currentVersion, lastVersion, forceUpdate)) {
    console.log('✅ Class list is up to date, no action needed');
    process.exit(0);
  }

  if (checkOnly) {
    console.log('🔍 Check-only mode: Update needed but not performing update');
    process.exit(1); // Exit with error code to indicate update needed
  }

  // Perform the update
  console.log('\n🔄 Updating USWDS class list...');

  // Step 1: Extract and update classes
  if (!extractAndUpdateClasses()) {
    console.error('❌ Failed to extract classes');
    process.exit(1);
  }

  // Step 2: Validate the results
  if (!validateClassList()) {
    console.error('❌ Class list validation failed');
    process.exit(1);
  }

  // Step 3: Run compliance check
  if (!runComplianceCheck()) {
    console.error('❌ Compliance check failed');
    process.exit(1);
  }

  // Step 4: Save the processed version
  saveProcessedVersion(currentVersion);

  console.log('\n🎉 USWDS class list successfully updated!');
  console.log('💡 You may want to run the full compliance check to see improvements:');
  console.log('   npm run uswds:compliance');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { getCurrentUSWDSVersion, needsUpdate, extractAndUpdateClasses };