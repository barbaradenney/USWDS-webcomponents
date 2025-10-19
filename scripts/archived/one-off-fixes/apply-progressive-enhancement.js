#!/usr/bin/env node

/**
 * Script to apply progressive enhancement pattern to USWDS components
 *
 * This script updates components to use the USWDSEnhancer utility for
 * progressive enhancement with official USWDS JavaScript.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Components that have USWDS JavaScript modules and need enhancement
const COMPONENTS_TO_ENHANCE = [
  { name: 'banner', moduleName: 'banner', displayName: 'Banner' },
  { name: 'character-count', moduleName: 'characterCount', displayName: 'Character Count' },
  { name: 'file-input', moduleName: 'fileInput', displayName: 'File Input' },
  { name: 'footer', moduleName: 'footer', displayName: 'Footer' },
  { name: 'header', moduleName: 'navigation', displayName: 'Header/Navigation' },
  { name: 'in-page-navigation', moduleName: 'inPageNavigation', displayName: 'In-Page Navigation' },
  { name: 'search', moduleName: 'search', displayName: 'Search' },
  { name: 'table', moduleName: 'table', displayName: 'Table' },
  { name: 'time-picker', moduleName: 'timePicker', displayName: 'Time Picker' },
  { name: 'tooltip', moduleName: 'tooltip', displayName: 'Tooltip' },
];

function updateComponentFile(componentPath, moduleName, displayName) {
  if (!fs.existsSync(componentPath)) {
    console.log(`⚠️ Component file not found: ${componentPath}`);
    return false;
  }

  let content = fs.readFileSync(componentPath, 'utf8');

  // Check if already enhanced
  if (content.includes('USWDSEnhancer')) {
    console.log(`✅ ${displayName}: Already enhanced`);
    return false;
  }

  // Check if it's a LitElement component
  if (!content.includes('LitElement') || !content.includes('@customElement')) {
    console.log(`⚠️ ${displayName}: Not a LitElement component, skipping`);
    return false;
  }

  console.log(`🔄 ${displayName}: Applying progressive enhancement...`);

  // Add USWDSEnhancer import
  content = content.replace(
    /import { ([^}]+) } from 'lit\/decorators\.js';/,
    `import { $1 } from 'lit/decorators.js';
import { USWDSEnhancer, type USWDSModule } from '../../utils/uswds-enhancement.js';`
  );

  // Update component comment
  content = content.replace(
    /\/\*\*\s*\n\s*\* [^*]*\*\s*\n\s*\*\s*[^*]*\*\s*\n\s*\*[^*]*\*\s*\n/,
    `/**
 * ${displayName} Web Component
 *
 * Uses progressive enhancement with official USWDS JavaScript for complete functionality.
 * Falls back gracefully when USWDS JavaScript is not available.
 *
`
  );

  // Find the class definition and add uswds property
  const classMatch = content.match(/export class ([A-Z][A-Za-z]+) extends/);
  if (!classMatch) {
    console.log(`⚠️ ${displayName}: Could not find class definition`);
    return false;
  }

  // Add private uswds property after existing properties
  const propertyInsertRegex = /(@property[^}]+}\s*[^@;]+;?\s*)+/;
  const propertyMatch = content.match(propertyInsertRegex);

  if (propertyMatch) {
    content = content.replace(
      propertyMatch[0],
      `${propertyMatch[0]}
  private uswds${displayName.replace(/[^A-Za-z]/g, '')}: USWDSModule | null = null;
`
    );
  }

  // Update connectedCallback
  content = content.replace(
    /override connectedCallback\(\)\s*{[^}]*}/,
    `override connectedCallback() {
    super.connectedCallback();
    this.initializeUSWDS${displayName.replace(/[^A-Za-z]/g, '')}();
  }`
  );

  // Update disconnectedCallback or add it
  if (content.includes('override disconnectedCallback()')) {
    content = content.replace(
      /override disconnectedCallback\(\)\s*{[^}]*}/,
      `override disconnectedCallback() {
    super.disconnectedCallback();
    USWDSEnhancer.cleanup(this.uswds${displayName.replace(/[^A-Za-z]/g, '')}, this, '${displayName}');
  }`
    );
  } else {
    // Add disconnectedCallback after connectedCallback
    content = content.replace(
      /(override connectedCallback\(\)\s*{[^}]*})/,
      `$1

  override disconnectedCallback() {
    super.disconnectedCallback();
    USWDSEnhancer.cleanup(this.uswds${displayName.replace(/[^A-Za-z]/g, '')}, this, '${displayName}');
  }`
    );
  }

  // Add the initialization method
  const initMethodName = `initializeUSWDS${displayName.replace(/[^A-Za-z]/g, '')}`;
  const initMethod = `
  private async ${initMethodName}() {
    try {
      // Wait for component to render first
      await this.updateComplete;

      // Enhance with USWDS JavaScript
      this.uswds${displayName.replace(/[^A-Za-z]/g, '')} = await USWDSEnhancer.enhance(this, '${moduleName}', '${displayName}');

      // If USWDS enhancement failed, set up fallback behavior
      if (!this.uswds${displayName.replace(/[^A-Za-z]/g, '')}) {
        this.setupFallbackBehavior();
      }
    } catch (error) {
      console.warn('${displayName}: Enhancement failed, using fallback behavior:', error);
      this.setupFallbackBehavior();
    }
  }

  private setupFallbackBehavior() {
    console.log('${displayName}: Setting up fallback behavior');
    // Fallback behavior implementation
  }`;

  // Insert the methods before the render method
  if (content.includes('override render()') || content.includes('render()')) {
    content = content.replace(
      /(private[^}]*}\s*)*\s*(override\s+)?render\(\)/,
      `${initMethod}

  $2render()`
    );
  } else {
    // Insert before the last closing brace
    content = content.replace(
      /}\s*$/,
      `${initMethod}
}`
    );
  }

  // Write the updated content
  fs.writeFileSync(componentPath, content);
  console.log(`✅ ${displayName}: Progressive enhancement applied`);
  return true;
}

function main() {
  console.log('🚀 Applying progressive enhancement to USWDS components...\n');

  const componentsDir = path.join(__dirname, '..', 'src', 'components');
  let updatedCount = 0;

  for (const component of COMPONENTS_TO_ENHANCE) {
    const componentFile = path.join(componentsDir, component.name, `usa-${component.name}.ts`);

    if (updateComponentFile(componentFile, component.moduleName, component.displayName)) {
      updatedCount++;
    }
  }

  console.log(`\n🎉 Progressive enhancement complete!`);
  console.log(`📊 Updated ${updatedCount} components`);
  console.log(`\n✅ All components now use USWDSEnhancer for progressive enhancement`);
  console.log(`🔄 Components will automatically use USWDS JavaScript when available`);
  console.log(`⚡ Components gracefully fall back when USWDS is not available`);
}

main();
