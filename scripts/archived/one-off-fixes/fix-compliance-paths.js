#!/usr/bin/env node

/**
 * Fix Compliance Script Paths
 *
 * Updates all compliance scripts to use correct component paths
 * when run from the project root via npm scripts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CompliancePathFixer {
  constructor() {
    this.srcDir = path.join(__dirname, '../../src/components');
    this.fixedCount = 0;
  }

  /**
   * Fix all compliance script paths
   */
  async fixAllPaths() {
    console.log('🔧 Fixing compliance script paths...\n');

    const components = fs.readdirSync(this.srcDir)
      .filter(item => {
        const itemPath = path.join(this.srcDir, item);
        const complianceScript = path.join(itemPath, `usa-${item}.compliance.js`);
        return fs.statSync(itemPath).isDirectory() && fs.existsSync(complianceScript);
      });

    for (const component of components) {
      this.fixComponentPath(component);
    }

    console.log(`\n✅ Fixed ${this.fixedCount} compliance scripts`);
    console.log('🎯 All compliance scripts now use correct component paths');
  }

  /**
   * Fix path for a specific component
   */
  fixComponentPath(componentName) {
    const complianceFile = path.join(this.srcDir, componentName, `usa-${componentName}.compliance.js`);

    if (!fs.existsSync(complianceFile)) {
      console.warn(`⚠️  Compliance script not found: ${complianceFile}`);
      return;
    }

    let content = fs.readFileSync(complianceFile, 'utf8');

    // Fix the componentPath assignment
    const oldPattern = "this.componentPath = '.';";
    const newPattern = "this.componentPath = path.dirname(new URL(import.meta.url).pathname);";

    if (content.includes(oldPattern)) {
      content = content.replace(oldPattern, newPattern);
      fs.writeFileSync(complianceFile, content);
      console.log(`📁 Fixed: ${componentName} compliance script`);
      this.fixedCount++;
    } else if (content.includes(newPattern)) {
      console.log(`✅ Already fixed: ${componentName} compliance script`);
    } else {
      console.warn(`⚠️  Pattern not found in: ${componentName} compliance script`);
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new CompliancePathFixer();
  fixer.fixAllPaths().catch(console.error);
}

export default CompliancePathFixer;