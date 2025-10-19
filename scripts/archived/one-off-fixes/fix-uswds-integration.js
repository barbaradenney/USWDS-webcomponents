#!/usr/bin/env node

/**
 * Fix USWDS JavaScript Integration for Complex Components
 *
 * Adds proper USWDS progressive enhancement patterns to components
 * that need to behave identically to official USWDS components.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class USWDSIntegrationFixer {
  constructor() {
    this.srcDir = path.join(__dirname, '../../src/components');
    this.fixedCount = 0;

    // Map component names to their USWDS JavaScript module names
    this.uswdsModules = {
      'accordion': 'accordion',
      'combo-box': 'comboBox',
      'date-picker': 'datePicker',
      'file-input': 'fileInput',
      'header': 'header',
      'modal': 'modal',
      'navigation': 'navigation',
      'side-navigation': 'navigation',
      'step-indicator': 'stepIndicator',
      'tooltip': 'tooltip',
      'character-count': 'characterCount'
    };
  }

  /**
   * Fix USWDS integration for all complex components
   */
  async fixAllComponents() {
    console.log('🔄 Adding USWDS JavaScript integration to complex components...\n');

    const components = Object.keys(this.uswdsModules);

    for (const component of components) {
      this.fixComponentIntegration(component);
    }

    console.log(`\n✅ Fixed USWDS integration for ${this.fixedCount} components`);
    console.log('🎯 Components now have proper progressive enhancement with USWDS');
  }

  /**
   * Fix USWDS integration for a specific component
   */
  fixComponentIntegration(componentName) {
    const componentFile = path.join(this.srcDir, componentName, `usa-${componentName}.ts`);

    if (!fs.existsSync(componentFile)) {
      console.log(`⚠️  Component file not found: ${componentFile}`);
      return;
    }

    let content = fs.readFileSync(componentFile, 'utf8');
    let modified = false;

    // Skip if already has proper USWDS integration
    if (content.includes(`initializeUSWDS`) && content.includes('.on(this)') && content.includes('web component behavior')) {
      console.log(`✅ Already has USWDS integration: ${componentName}`);
      return;
    }

    // Add initialization call to connectedCallback
    if (content.includes('override connectedCallback()') && !content.includes('initializeUSWDS')) {
      const initCall = `    // Initialize progressive enhancement with USWDS\n    this.initializeUSWDS${this.toTitleCase(componentName)}();\n`;

      content = content.replace(
        /(override connectedCallback\(\) \{[^}]*?)(\n\s*})/,
        `$1\n${initCall}$2`
      );
      modified = true;
    }

    // Add cleanup to disconnectedCallback
    if (!content.includes('USWDS cleanup') || !content.includes('.off(this)')) {
      const uswdsModuleName = this.uswdsModules[componentName];
      const titleName = this.toTitleCase(componentName);

      const cleanupCode = `
    // Clean up USWDS ${componentName} if enhanced
    try {
      if (typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS.${uswdsModuleName} && typeof USWDS.${uswdsModuleName}.off === 'function') {
          USWDS.${uswdsModuleName}.off(this);
        }
      }
    } catch (error) {
      console.warn('📋 ${titleName}: USWDS cleanup failed:', error);
    }`;

      if (content.includes('override disconnectedCallback()')) {
        // Add to existing disconnectedCallback
        content = content.replace(
          /(override disconnectedCallback\(\) \{[^}]*?)(\n\s*})/,
          `$1${cleanupCode}$2`
        );
      } else {
        // Create disconnectedCallback
        const newDisconnectedCallback = `
  override disconnectedCallback() {
    super.disconnectedCallback();${cleanupCode}
  }`;

        content = content.replace(
          /(\n\s+\/\/ Public methods|\n\s+override render\(\))/,
          `${newDisconnectedCallback}$1`
        );
      }
      modified = true;
    }

    // Add USWDS initialization method
    if (!content.includes(`initializeUSWDS${this.toTitleCase(componentName)}`)) {
      const uswdsModuleName = this.uswdsModules[componentName];
      const titleName = this.toTitleCase(componentName);

      const initMethod = `
  private async initializeUSWDS${titleName}() {
    try {
      // Wait for component to render first
      await this.updateComplete;

      // Check if USWDS is available globally (progressive enhancement)
      if (typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS.${uswdsModuleName} && typeof USWDS.${uswdsModuleName}.on === 'function') {
          // Initialize USWDS ${componentName} behavior on this element
          USWDS.${uswdsModuleName}.on(this);
          console.log('📋 ${titleName}: Enhanced with USWDS JavaScript');
          return;
        }
      }

      // Fallback: Use web component behavior if USWDS not available
      console.log('📋 ${titleName}: Using web component behavior fallback');
    } catch (error) {
      console.warn('📋 ${titleName}: Progressive enhancement failed, using web component behavior fallback:', error);
    }
  }`;

      // Insert before render method
      content = content.replace(
        /(\n\s+override render\(\))/,
        `${initMethod}$1`
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(componentFile, content);
      console.log(`📁 Fixed USWDS integration: ${componentName}`);
      this.fixedCount++;
    } else {
      console.log(`ℹ️  No changes needed: ${componentName}`);
    }
  }

  /**
   * Convert kebab-case to TitleCase
   */
  toTitleCase(str) {
    return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\s/g, '');
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new USWDSIntegrationFixer();
  fixer.fixAllComponents().catch(console.error);
}

export default USWDSIntegrationFixer;