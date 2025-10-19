#!/usr/bin/env node

/**
 * Clean up duplicate usingUSWDSEnhancement property declarations
 */

import fs from 'fs';

const componentsToFix = [
  'header', 'language-selector', 'pagination', 'search',
  'select', 'skip-link', 'step-indicator', 'table', 'tooltip'
];

class PropertyCleaner {
  constructor() {
    this.filesFixed = 0;
  }

  log(message, color = 'reset') {
    const colors = {
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      green: '\x1b[32m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async cleanupProperties() {
    this.log('\n🧹 Cleaning up duplicate property declarations', 'cyan');

    for (const componentName of componentsToFix) {
      const filePath = `src/components/${componentName}/usa-${componentName}.ts`;
      if (fs.existsSync(filePath)) {
        await this.processComponent(filePath, componentName);
      }
    }

    this.log(`\n✅ Cleaned up ${this.filesFixed} components`, 'green');
  }

  async processComponent(filePath, componentName) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Remove duplicate property declarations
      const lines = content.split('\n');
      const cleanedLines = [];
      let foundFirstProperty = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if this is a usingUSWDSEnhancement property declaration
        if (line.trim().includes('private usingUSWDSEnhancement = false;')) {
          if (!foundFirstProperty) {
            // Keep the first one
            cleanedLines.push(line);
            foundFirstProperty = true;
          } else {
            // Skip duplicates
            modified = true;
            this.log(`   Removed duplicate property declaration`, 'yellow');
          }
        }
        // Fix malformed lines that got property declarations mixed in
        else if (line.includes('private usingUSWDSEnhancement = false;') && line.trim() !== 'private usingUSWDSEnhancement = false;') {
          // Split the line and clean it up
          const parts = line.split('private usingUSWDSEnhancement = false;');
          if (parts.length > 1) {
            // Keep the non-property part and add the property separately if needed
            const cleanPart = parts[0] + parts[1];
            if (cleanPart.trim()) {
              cleanedLines.push(cleanPart);
            }

            // Add the property declaration if we haven't found one yet
            if (!foundFirstProperty) {
              cleanedLines.push('  private usingUSWDSEnhancement = false;');
              foundFirstProperty = true;
            }
            modified = true;
            this.log(`   Fixed malformed line`, 'yellow');
          }
        } else {
          cleanedLines.push(line);
        }
      }

      if (modified) {
        const newContent = cleanedLines.join('\n');
        fs.writeFileSync(filePath, newContent, 'utf8');
        this.filesFixed++;
        this.log(`✅ ${componentName} - Cleaned up duplicates`, 'green');
      } else {
        this.log(`✅ ${componentName} - No cleanup needed`, 'green');
      }

    } catch (error) {
      this.log(`❌ Error processing ${componentName}: ${error.message}`, 'red');
    }
  }
}

// Self-executing cleanup
const cleaner = new PropertyCleaner();
cleaner.cleanupProperties().catch(error => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});

export default PropertyCleaner;