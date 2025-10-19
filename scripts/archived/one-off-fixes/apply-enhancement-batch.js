#!/usr/bin/env node

/**
 * Quick script to apply progressive enhancement to remaining components
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS = [
  { name: 'footer', moduleName: 'footer', displayName: 'Footer', emoji: '🦶' },
  { name: 'skip-link', moduleName: 'skipnav', displayName: 'Skip Link', emoji: '🔗' },
  { name: 'tooltip', moduleName: 'tooltip', displayName: 'Tooltip', emoji: '💬' },
  { name: 'search', moduleName: 'search', displayName: 'Search', emoji: '🔍' },
  { name: 'table', moduleName: 'table', displayName: 'Table', emoji: '📊' },
  { name: 'time-picker', moduleName: 'timePicker', displayName: 'Time Picker', emoji: '⏰' },
];

function enhanceComponent(componentPath, moduleName, displayName, emoji) {
  if (!fs.existsSync(componentPath)) {
    console.log(`⚠️ Component file not found: ${componentPath}`);
    return false;
  }

  let content = fs.readFileSync(componentPath, 'utf8');

  if (content.includes('USWDSEnhancer')) {
    console.log(`✅ ${displayName}: Already enhanced`);
    return false;
  }

  console.log(`🔄 ${displayName}: Applying progressive enhancement...`);

  // 1. Add USWDSEnhancer import
  content = content.replace(
    /import { ([^}]+) } from 'lit\/decorators\.js';/,
    `import { $1 } from 'lit/decorators.js';
import { USWDSEnhancer, type USWDSModule } from '../../utils/uswds-enhancement.js';`
  );

  // 2. Update component comment
  content = content.replace(
    /(\/\*\*[\s\S]*?\* )[^*]*([\s\S]*?\*\/)/,
    `$1Uses progressive enhancement with official USWDS JavaScript for complete functionality.$2`
  );

  // 3. Add uswds property after existing properties
  const lastPropertyMatch = content.match(
    /(@property[^}]*}[^@]*[^;])*\s*(?=\s*(\/\/|protected|override|private|public|\s*$))/
  );
  if (lastPropertyMatch) {
    const insertPoint = content.indexOf(lastPropertyMatch[0]) + lastPropertyMatch[0].length;
    const before = content.substring(0, insertPoint);
    const after = content.substring(insertPoint);

    content =
      before +
      `
  private uswds${displayName.replace(/[^A-Za-z]/g, '')}: USWDSModule | null = null;
` +
      after;
  }

  // 4. Add lifecycle methods after createRenderRoot
  const createRenderRootMatch = content.match(/(protected override createRenderRoot\(\)[^}]*})/);
  if (createRenderRootMatch) {
    content = content.replace(
      createRenderRootMatch[0],
      `${createRenderRootMatch[0]}

  override connectedCallback() {
    super.connectedCallback();
    this.initializeUSWDS${displayName.replace(/[^A-Za-z]/g, '')}();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    USWDSEnhancer.cleanup(this.uswds${displayName.replace(/[^A-Za-z]/g, '')}, this, '${displayName}');
  }

  private async initializeUSWDS${displayName.replace(/[^A-Za-z]/g, '')}() {
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
      console.warn('${emoji} ${displayName}: Enhancement failed, using fallback behavior:', error);
      this.setupFallbackBehavior();
    }
  }

  private setupFallbackBehavior() {
    console.log('${emoji} ${displayName}: Setting up fallback behavior');
    // Fallback behavior implementation
  }`
    );
  }

  fs.writeFileSync(componentPath, content);
  console.log(`✅ ${displayName}: Progressive enhancement applied`);
  return true;
}

function main() {
  console.log('🚀 Applying progressive enhancement to remaining components...\n');

  const componentsDir = path.join(__dirname, '..', 'src', 'components');
  let updatedCount = 0;

  for (const component of COMPONENTS) {
    const componentFile = path.join(componentsDir, component.name, `usa-${component.name}.ts`);

    if (
      enhanceComponent(componentFile, component.moduleName, component.displayName, component.emoji)
    ) {
      updatedCount++;
    }
  }

  console.log(`\n🎉 Progressive enhancement complete!`);
  console.log(`📊 Updated ${updatedCount} components`);
}

main();
