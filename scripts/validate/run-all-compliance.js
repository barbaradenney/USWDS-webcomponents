#!/usr/bin/env node

/**
 * Run All Component Compliance Scripts
 *
 * This script runs compliance validation for all components
 * using their co-located compliance scripts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AllComplianceRunner {
  constructor() {
    this.srcDir = path.join(__dirname, '../../src/components');
    this.results = {};
  }

  /**
   * Run compliance for all components
   */
  async runAllCompliance() {
    console.log('🔍 Running compliance validation for all components...\n');

    const components = this.getComponentsWithCompliance();
    let passing = 0;
    let failing = 0;
    let warnings = 0;

    for (const component of components) {
      console.log(`📊 Checking ${component}...`);

      try {
        const complianceScript = path.join(this.srcDir, component, `usa-${component}.compliance.js`);
        const result = execSync(`node "${complianceScript}"`, {
          encoding: 'utf8',
          cwd: path.join(this.srcDir, component)
        });

        // Parse result to determine status
        if (result.includes('Overall Status: PASSING')) {
          passing++;
          console.log(`  ✅ Passing`);
        } else if (result.includes('Overall Status: FAILING')) {
          failing++;
          console.log(`  ❌ Failing`);
        } else {
          warnings++;
          console.log(`  ⚠️  Warning`);
        }

      } catch (error) {
        failing++;
        console.log(`  ❌ Error: ${error.message.split('\n')[0]}`);
      }
    }

    console.log(`\n============================================================`);
    console.log(`📊 COMPONENT COMPLIANCE SUMMARY`);
    console.log(`============================================================`);
    console.log(`📈 Total Components: ${components.length}`);
    console.log(`✅ Passing: ${passing}`);
    console.log(`❌ Failing: ${failing}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`📊 Success Rate: ${Math.round((passing / components.length) * 100)}%`);

    if (failing > 0) {
      console.log(`\n🚨 ${failing} components have critical compliance issues.`);
      console.log(`💡 Run individual compliance scripts to see details.`);
      process.exit(1);
    }
  }

  /**
   * Get list of components with compliance scripts
   */
  getComponentsWithCompliance() {
    return fs.readdirSync(this.srcDir)
      .filter(item => {
        const itemPath = path.join(this.srcDir, item);
        const complianceScript = path.join(itemPath, `usa-${item}.compliance.js`);
        return fs.statSync(itemPath).isDirectory() && fs.existsSync(complianceScript);
      });
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new AllComplianceRunner();
  runner.runAllCompliance().catch(console.error);
}

export default AllComplianceRunner;