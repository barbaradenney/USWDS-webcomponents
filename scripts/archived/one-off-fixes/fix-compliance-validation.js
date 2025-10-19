#!/usr/bin/env node

/**
 * Fix Compliance Validation Scripts
 *
 * Updates all compliance scripts to check for class names correctly
 * (without the dot prefix which is CSS selector notation)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComplianceValidationFixer {
  constructor() {
    this.srcDir = path.join(__dirname, '../../src/components');
    this.fixedCount = 0;
  }

  /**
   * Fix all compliance validation patterns
   */
  async fixAllValidation() {
    console.log('🔧 Fixing compliance validation patterns...\n');

    const components = fs.readdirSync(this.srcDir)
      .filter(item => {
        const itemPath = path.join(this.srcDir, item);
        const complianceScript = path.join(itemPath, `usa-${item}.compliance.js`);
        return fs.statSync(itemPath).isDirectory() && fs.existsSync(complianceScript);
      });

    for (const component of components) {
      this.fixValidationPattern(component);
    }

    console.log(`\n✅ Fixed ${this.fixedCount} compliance scripts`);
    console.log('🎯 Compliance scripts now check for class names correctly');
  }

  /**
   * Fix validation pattern for a specific component
   */
  fixValidationPattern(componentName) {
    const complianceFile = path.join(this.srcDir, componentName, `usa-${componentName}.compliance.js`);

    if (!fs.existsSync(complianceFile)) {
      console.warn(`⚠️  Compliance script not found: ${complianceFile}`);
      return;
    }

    let content = fs.readFileSync(complianceFile, 'utf8');
    let modified = false;

    // Fix the validateStructure method to check for class names without dots
    // The scripts are checking for ".usa-class" but should check for "usa-class"

    // Update the checking pattern in validateStructure
    const oldPattern = /content\.includes\(requiredClass\)/g;
    const newPattern = `content.includes(requiredClass.replace(/^\\./, ''))`;

    if (content.match(oldPattern)) {
      content = content.replace(oldPattern, newPattern);
      modified = true;
    }

    // Also update the requirements checking to remove dots when checking
    const structureCheckPattern = /for \(const requiredClass of this\.results\.requirements\.structure\.required\) \{[\s\S]*?\}/g;
    const matches = content.match(structureCheckPattern);

    if (matches) {
      matches.forEach(match => {
        const updatedMatch = match.replace(
          'content.includes(requiredClass)',
          'content.includes(requiredClass.replace(/^\\\\./, \'\'))'
        );
        content = content.replace(match, updatedMatch);
        modified = true;
      });
    }

    if (modified) {
      fs.writeFileSync(complianceFile, content);
      console.log(`📁 Fixed: ${componentName} compliance validation`);
      this.fixedCount++;
    } else {
      console.log(`✅ Already correct: ${componentName} compliance validation`);
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ComplianceValidationFixer();
  fixer.fixAllValidation().catch(console.error);
}

export default ComplianceValidationFixer;