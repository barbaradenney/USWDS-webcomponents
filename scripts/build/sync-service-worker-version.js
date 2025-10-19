#!/usr/bin/env node

/**
 * Service Worker Version Sync
 *
 * Automatically syncs the Service Worker cache version with package.json version.
 * This ensures cache invalidation happens correctly when the package is updated.
 *
 * Runs automatically during build process.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

console.log(`${colors.cyan}🔄 Service Worker Version Sync${colors.reset}\n`);

/**
 * Get version from package.json
 */
function getPackageVersion() {
  const packagePath = join(ROOT_DIR, 'package.json');

  if (!existsSync(packagePath)) {
    throw new Error('package.json not found');
  }

  try {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    throw new Error(`Failed to read package.json: ${error.message}`);
  }
}

/**
 * Update service worker version
 */
function updateServiceWorkerVersion(version) {
  const swPath = join(ROOT_DIR, 'public/service-worker.js');

  if (!existsSync(swPath)) {
    console.log(`${colors.yellow}⚠️  Service worker not found at ${swPath}${colors.reset}`);
    console.log(`${colors.blue}ℹ️  Skipping version sync${colors.reset}`);
    return false;
  }

  try {
    let content = readFileSync(swPath, 'utf8');

    // Check current version
    const versionMatch = content.match(/const CACHE_VERSION = ['"]([^'"]+)['"]/);
    const currentVersion = versionMatch ? versionMatch[1] : null;

    if (currentVersion === version) {
      console.log(`${colors.blue}ℹ️  Service worker version already up-to-date: ${version}${colors.reset}`);
      return false;
    }

    console.log(`${colors.blue}📝 Updating service worker version...${colors.reset}`);
    console.log(`   Current: ${currentVersion || 'unknown'}`);
    console.log(`   New:     ${version}`);

    // Update CACHE_VERSION constant
    content = content.replace(
      /const CACHE_VERSION = ['"][^'"]+['"]/,
      `const CACHE_VERSION = '${version}'`
    );

    // Update version in header comment
    content = content.replace(
      / \* Version: [^\n]+/,
      ` * Version: ${version}`
    );

    // Update auto-generated date
    const today = new Date().toISOString().split('T')[0];
    content = content.replace(
      / \* Auto-generated on: [^\n]+/,
      ` * Auto-generated on: ${today}`
    );

    writeFileSync(swPath, content, 'utf8');
    console.log(`${colors.green}✅ Service worker version synced to ${version}${colors.reset}`);

    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Failed to update service worker: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Update service worker registration with version info
 */
function updateServiceWorkerRegistration(version) {
  const regPath = join(ROOT_DIR, 'public/service-worker-registration.js');

  if (!existsSync(regPath)) {
    console.log(`${colors.blue}ℹ️  Service worker registration not found${colors.reset}`);
    return false;
  }

  try {
    let content = readFileSync(regPath, 'utf8');

    // Update version in comment if it exists
    const versionCommentMatch = content.match(/Version: [^\n]+/);
    if (versionCommentMatch) {
      content = content.replace(
        /Version: [^\n]+/,
        `Version: ${version}`
      );
      writeFileSync(regPath, content, 'utf8');
      console.log(`${colors.green}✅ Updated service worker registration${colors.reset}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`${colors.yellow}⚠️  Could not update registration: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Generate version sync report
 */
function generateReport(version, updated) {
  const report = {
    timestamp: new Date().toISOString(),
    packageVersion: version,
    serviceWorkerUpdated: updated,
    cachePrefix: 'uswds-wc',
    cacheNames: [
      `uswds-wc-static-v${version}`,
      `uswds-wc-uswds-v${version}`,
      `uswds-wc-assets-v${version}`,
      `uswds-wc-runtime-v${version}`,
    ],
  };

  const reportPath = join(ROOT_DIR, 'test-reports/service-worker-version.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`${colors.blue}📄 Version report: test-reports/service-worker-version.json${colors.reset}`);

  return report;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log(`${colors.blue}📦 Reading package.json version...${colors.reset}`);
    const version = getPackageVersion();
    console.log(`   Package version: ${version}\n`);

    console.log(`${colors.blue}🔧 Updating service worker files...${colors.reset}`);
    const swUpdated = updateServiceWorkerVersion(version);
    const regUpdated = updateServiceWorkerRegistration(version);

    console.log(`\n${colors.blue}📊 Generating version report...${colors.reset}`);
    const report = generateReport(version, swUpdated);

    if (swUpdated || regUpdated) {
      console.log(`\n${colors.cyan}✨ Service worker version sync complete!${colors.reset}\n`);
      console.log(`${colors.blue}Summary:${colors.reset}`);
      console.log(`  Version: ${version}`);
      console.log(`  Service Worker: ${swUpdated ? colors.green + '✓ Updated' : colors.blue + '◯ No change'}${colors.reset}`);
      console.log(`  Registration: ${regUpdated ? colors.green + '✓ Updated' : colors.blue + '◯ No change'}${colors.reset}`);
      console.log(`  Cache Names:`);
      report.cacheNames.forEach(name => console.log(`    - ${name}`));
      console.log();
    } else {
      console.log(`\n${colors.blue}ℹ️  No updates needed - versions already match${colors.reset}\n`);
    }

    return swUpdated || regUpdated;
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`${colors.red}❌ Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

export { getPackageVersion, updateServiceWorkerVersion, updateServiceWorkerRegistration, generateReport };
