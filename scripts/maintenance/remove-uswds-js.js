#!/usr/bin/env node

/**
 * Script to remove USWDS JavaScript imports and initialization from components
 *
 * The web components library should NOT use USWDS JavaScript because:
 * 1. Web components implement their own functionality
 * 2. USWDS JavaScript conflicts with web component implementations
 * 3. USWDS JavaScript causes double initialization when it sees USWDS classes
 */

import fs from 'fs';
// import path from 'path'; // Unused - keeping for potential future use
import { glob } from 'glob';

// Find all TypeScript files in components directory
const componentFiles = glob.sync('src/components/**/*.ts');

let filesModified = 0;
let totalRemoved = 0;

componentFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // Remove import statements for USWDS
  content = content.replace(/import.*from\s+['"]@uswds\/uswds['"];?\n/g, '');

  // Remove USWDS module storage
  content = content.replace(/private\s+uswdsModule:\s*any\s*=\s*null;?\n/g, '');

  // Remove or simplify initialization methods that use USWDS
  content = content.replace(
    /private\s+async\s+initialize[A-Z][A-Za-z]*\(\)[\s\S]*?\{[\s\S]*?USWDS[\s\S]*?\}/g,
    (match) => {
      // If the method contains USWDS initialization, replace with a simple log
      const methodName = match.match(/initialize([A-Z][A-Za-z]*)/);
      if (methodName) {
        return `private async initialize${methodName[1]}() {\n    // Web component implements its own functionality - no USWDS JavaScript needed\n    this.debug?.log?.('Using native web component implementation');\n  }`;
      }
      return match;
    }
  );

  // Remove USWDS cleanup methods
  content = content.replace(
    /private\s+cleanupUSWDS\(\)[\s\S]*?\{[\s\S]*?\}/g,
    `private cleanupUSWDS() {\n    // No USWDS JavaScript to clean up\n  }`
  );

  // Remove loadFullUSWDSLibrary methods
  content = content.replace(
    /private\s+async\s+loadFullUSWDSLibrary\(\)[\s\S]*?\{[\s\S]*?\}\n\n/g,
    ''
  );

  // Remove initializeWithGlobalUSWDS methods
  content = content.replace(
    /private\s+async\s+initializeWithGlobalUSWDS\(\)[\s\S]*?\{[\s\S]*?\}\n\n/g,
    ''
  );

  // Clean up any setupFallbackBehavior calls that are no longer needed
  content = content.replace(
    /this\.setupFallbackBehavior\(\);/g,
    '// Component uses native implementation'
  );

  // Clean up empty lines
  content = content.replace(/\n\n\n+/g, '\n\n');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    filesModified++;

    // Count removals
    const removals = originalContent.split('USWDS').length - content.split('USWDS').length;
    totalRemoved += removals;

    console.log(`✅ Fixed: ${file} (removed ${removals} USWDS references)`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`- Files modified: ${filesModified}`);
console.log(`- Total USWDS references removed: ${totalRemoved}`);
console.log(
  `\n✨ Components now use pure web component implementations without USWDS JavaScript conflicts!`
);
