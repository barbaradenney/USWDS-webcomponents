#!/usr/bin/env node

/**
 * USWDS Version Check Script
 *
 * This script checks for new USWDS releases and compares with current version
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class USWDSVersionChecker {
  constructor() {
    this.packageJsonPath = path.join(__dirname, '..', 'package.json');
    this.complianceMatrixPath = path.join(
      __dirname,
      '..',
      'docs',
      'COMPONENT_COMPLIANCE_MATRIX.md'
    );
  }

  /**
   * Main check entry point
   */
  async check() {
    console.log('🔍 Checking USWDS Version Status...\n');

    try {
      const currentVersion = this.getCurrentUSWDSVersion();
      const latestVersion = await this.getLatestUSWDSVersion();

      this.displayVersionInfo(currentVersion, latestVersion);
      this.checkComplianceMatrix();

      if (this.isUpdateAvailable(currentVersion, latestVersion)) {
        this.displayUpdateInstructions(latestVersion);
        process.exit(1); // Exit with code 1 to indicate update available
      } else {
        console.log('✅ USWDS version is up to date!\n');
        process.exit(0);
      }
    } catch (error) {
      console.error('❌ Version check failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Get current USWDS version from package.json
   */
  getCurrentUSWDSVersion() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      const uswdsVersion =
        packageJson.dependencies?.['@uswds/uswds'] || packageJson.devDependencies?.['@uswds/uswds'];

      if (!uswdsVersion) {
        throw new Error('USWDS not found in package.json dependencies');
      }

      // Remove version prefixes (^, ~, etc.)
      return uswdsVersion.replace(/^[\^~>=<]+/, '');
    } catch (error) {
      throw new Error(`Failed to read current USWDS version: ${error.message}`);
    }
  }

  /**
   * Get latest USWDS version from npm registry
   */
  async getLatestUSWDSVersion() {
    try {
      const response = await fetch('https://registry.npmjs.org/@uswds/uswds/latest');

      if (!response.ok) {
        throw new Error(`NPM registry request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.version;
    } catch (error) {
      // Fallback: try alternative method or return null
      console.warn('⚠️  Could not fetch latest version from NPM registry');
      return null;
    }
  }

  /**
   * Check if update is available
   */
  isUpdateAvailable(current, latest) {
    if (!latest) return false;

    // Simple version comparison (works for semantic versioning)
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;

      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }

    return false;
  }

  /**
   * Display version information
   */
  displayVersionInfo(current, latest) {
    console.log('📦 USWDS Version Information:');
    console.log(`   Current: ${current}`);
    console.log(`   Latest:  ${latest || 'Unable to fetch'}`);
    console.log('');

    if (latest && this.isUpdateAvailable(current, latest)) {
      console.log('🆕 New USWDS version available!');
    } else {
      console.log('✅ Using latest USWDS version');
    }
    console.log('');
  }

  /**
   * Check compliance matrix for last sync date
   */
  checkComplianceMatrix() {
    try {
      if (!fs.existsSync(this.complianceMatrixPath)) {
        console.log('⚠️  Compliance matrix not found');
        return;
      }

      const matrixContent = fs.readFileSync(this.complianceMatrixPath, 'utf8');
      const lastSyncMatch = matrixContent.match(/Last Updated.*?(\d{4}-\d{2}-\d{2})/);

      if (lastSyncMatch) {
        const lastSync = lastSyncMatch[1];
        const daysSince = this.daysSince(lastSync);

        console.log('📅 Compliance Status:');
        console.log(`   Last Sync: ${lastSync} (${daysSince} days ago)`);

        if (daysSince > 90) {
          console.log('   ⚠️  Consider reviewing compliance (>90 days since last sync)');
        } else {
          console.log('   ✅ Recently synced');
        }
        console.log('');
      }
    } catch (error) {
      console.log('⚠️  Could not check compliance matrix date');
    }
  }

  /**
   * Calculate days since a date
   */
  daysSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Display update instructions
   */
  displayUpdateInstructions(latestVersion) {
    console.log('🔄 USWDS Update Available!');
    console.log('');
    console.log('To update USWDS and sync components:');
    console.log('');
    console.log('1. Update USWDS package:');
    console.log(`   npm install @uswds/uswds@${latestVersion}`);
    console.log('');
    console.log('2. Test component compatibility:');
    console.log('   npm run test');
    console.log('   npm run test:accessibility');
    console.log('');
    console.log('3. Check for breaking changes:');
    console.log('   npm run uswds:compliance');
    console.log('');
    console.log('4. Review USWDS changelog:');
    console.log(`   https://github.com/uswds/uswds/releases/tag/v${latestVersion}`);
    console.log('');
    console.log('5. Update compliance documentation:');
    console.log('   - Update docs/COMPONENT_COMPLIANCE_MATRIX.md');
    console.log('   - Update component USWDS version references');
    console.log('   - Run comprehensive tests');
    console.log('');
    console.log('For detailed sync process, see:');
    console.log('📖 docs/USWDS_COMPLIANCE_GUIDE.md');
    console.log('');
  }
}

// Run check if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new USWDSVersionChecker();
  checker.check();
}

export default USWDSVersionChecker;
