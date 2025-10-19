#!/usr/bin/env node

/**
 * Fix Progressive Enhancement Patterns
 *
 * Adds proper USWDS progressive enhancement patterns to components
 * that are missing them, including cleanup for memory leak prevention.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProgressiveEnhancementFixer {
  constructor() {
    this.srcDir = path.join(__dirname, '../../src/components');
    this.fixedCount = 0;
    this.componentPatterns = {
      // Components that need USWDS JavaScript integration
      'accordion': 'accordion',
      'alert': 'alert',
      'banner': 'banner',
      'combo-box': 'comboBox',
      'date-picker': 'datePicker',
      'file-input': 'fileInput',
      'header': 'header',
      'modal': 'modal',
      'navigation': 'navigation',
      'search': 'search',
      'time-picker': 'timePicker',
      'tooltip': 'tooltip'
    };
  }

  /**
   * Fix progressive enhancement for all components
   */
  async fixAllComponents() {
    console.log('🔄 Fixing progressive enhancement patterns...\n');

    const components = fs.readdirSync(this.srcDir)
      .filter(item => {
        const itemPath = path.join(this.srcDir, item);
        return fs.statSync(itemPath).isDirectory();
      });

    for (const component of components) {
      this.fixComponentProgressive(component);
    }

    console.log(`\n✅ Fixed ${this.fixedCount} components with progressive enhancement`);
    console.log('🎯 Components now have proper USWDS integration and cleanup');
  }

  /**
   * Fix progressive enhancement for a specific component
   */
  fixComponentProgressive(componentName) {
    const componentFile = path.join(this.srcDir, componentName, `usa-${componentName}.ts`);

    if (!fs.existsSync(componentFile)) {
      console.log(`⚠️  Component file not found: ${componentFile}`);
      return;
    }

    let content = fs.readFileSync(componentFile, 'utf8');
    let modified = false;

    // Check if already has progressive enhancement
    if (content.includes('initializeUSWDS') && content.includes('.on(this)') && content.includes('web component behavior')) {
      console.log(`✅ Already enhanced: ${componentName}`);
      return;
    }

    // Add progressive enhancement if missing
    if (!content.includes('initializeUSWDS')) {
      modified = this.addProgressiveEnhancement(content, componentName);
      if (modified) {
        content = modified;
      }
    }

    // Add cleanup if missing
    if (!content.includes('disconnectedCallback') || !content.includes('removeEventListener')) {
      const cleanupAdded = this.addCleanupMethod(content, componentName);
      if (cleanupAdded) {
        content = cleanupAdded;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(componentFile, content);
      console.log(`📁 Fixed: ${componentName} progressive enhancement`);
      this.fixedCount++;
    } else {
      console.log(`ℹ️  No changes needed: ${componentName}`);
    }
  }

  /**
   * Add progressive enhancement method to component
   */
  addProgressiveEnhancement(content, componentName) {
    const uswdsName = this.componentPatterns[componentName] || componentName;
    const titleName = this.toTitleCase(componentName);

    // Find connectedCallback and add initialization
    if (content.includes('override connectedCallback()')) {
      const updatedCallback = content.replace(
        /(override connectedCallback\(\) \{[^}]*)(}\s*$)/m,
        `$1    // Initialize progressive enhancement
    this.initializeUSWDS${titleName}();
  $2`
      );

      // Add the initialization method before the render method
      const initMethod = `
  private async initializeUSWDS${titleName}() {
    try {
      // Check if USWDS is available globally (progressive enhancement)
      if (typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS.${uswdsName} && typeof USWDS.${uswdsName}.on === 'function') {
          // Initialize USWDS ${componentName} behavior on this element
          USWDS.${uswdsName}.on(this);
          console.log('📋 ${titleName}: Enhanced with USWDS JavaScript');
          return;
        }
      }

      // Fallback: Use web component behavior if USWDS not available
      console.log('📋 ${titleName}: Using web component behavior fallback');
    } catch (error) {
      console.warn('📋 ${titleName}: Progressive enhancement failed, using web component behavior fallback:', error);
    }
  }
`;

      return updatedCallback.replace(/(\s+override render\(\))/m, `${initMethod}$1`);
    }

    return false;
  }

  /**
   * Add cleanup method to component
   */
  addCleanupMethod(content, componentName) {
    const uswdsName = this.componentPatterns[componentName] || componentName;
    const titleName = this.toTitleCase(componentName);

    // Add or enhance disconnectedCallback
    if (!content.includes('disconnectedCallback')) {
      const cleanupMethod = `
  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up USWDS behavior
    try {
      if (typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS.${uswdsName} && typeof USWDS.${uswdsName}.off === 'function') {
          USWDS.${uswdsName}.off(this);
        }
      }
    } catch (error) {
      console.warn('📋 ${titleName}: Cleanup failed:', error);
    }
    // Additional cleanup for event listeners would go here
  }
`;

      return content.replace(/(\s+\/\/ Public methods|override render\(\))/m, `${cleanupMethod}$1`);
    }

    return false;
  }

  /**
   * Utility function to convert kebab-case to TitleCase
   */
  toTitleCase(str) {
    return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\s/g, '');
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ProgressiveEnhancementFixer();
  fixer.fixAllComponents().catch(console.error);
}

export default ProgressiveEnhancementFixer;