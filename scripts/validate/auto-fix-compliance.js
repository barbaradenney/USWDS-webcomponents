#!/usr/bin/env node

/**
 * Auto-fix Common USWDS Compliance Issues
 *
 * This script automatically fixes the most common compliance issues:
 * 1. Add data-web-component-managed attribute
 * 2. Add light DOM implementation
 * 3. Add USWDS styles import
 * 4. Remove excessive custom CSS
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const componentsDir = join(__dirname, '../../src/components');

// Color helpers
const colors = {
  bold: text => `\x1b[1m${text}\x1b[0m`,
  green: text => `\x1b[32m${text}\x1b[0m`,
  yellow: text => `\x1b[33m${text}\x1b[0m`,
  red: text => `\x1b[31m${text}\x1b[0m`,
  cyan: text => `\x1b[36m${text}\x1b[0m`
};

/**
 * Fix light DOM implementation
 */
function fixLightDOM(content) {
  if (content.includes('createRenderRoot') && content.includes('return this')) {
    return { content, changed: false };
  }

  if (content.includes('extends LitElement') && !content.includes('createRenderRoot')) {
    const insertPoint = content.indexOf('override render()') || content.indexOf('render()');
    if (insertPoint > -1) {
      const insertion = `
  // Use light DOM for USWDS compatibility
  protected createRenderRoot(): HTMLElement {
    return this as any;
  }

  `;
      const newContent = content.slice(0, insertPoint) + insertion + content.slice(insertPoint);
      return { content: newContent, changed: true };
    }
  }

  return { content, changed: false };
}

/**
 * Fix USWDS styles import
 */
function fixStylesImport(content) {
  if (content.includes('styles.css')) {
    return { content, changed: false };
  }

  if (content.includes("import { html, css } from 'lit';")) {
    const newContent = content.replace(
      "import { html, css } from 'lit';",
      `import { html, css } from 'lit';

// Import official USWDS compiled CSS
import '../../styles/styles.css';`
    );
    return { content: newContent, changed: true };
  }

  return { content, changed: false };
}

/**
 * Add data-web-component-managed attribute
 */
function fixWebComponentManaged(content) {
  if (content.includes('data-web-component-managed')) {
    return { content, changed: false };
  }

  if (content.includes('connectedCallback()')) {
    const insertPoint = content.indexOf('super.connectedCallback();');
    if (insertPoint > -1) {
      const endPoint = insertPoint + 'super.connectedCallback();'.length;
      const insertion = `

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');`;

      const newContent = content.slice(0, endPoint) + insertion + content.slice(endPoint);
      return { content: newContent, changed: true };
    }
  }

  return { content, changed: false };
}

/**
 * Simplify excessive CSS to only :host styles
 */
function simplifyCSS(content) {
  const styleMatch = content.match(/(static\s+(?:override\s+)?styles\s*=\s*css`)([^`]*)(`)/);

  if (!styleMatch) {
    return { content, changed: false };
  }

  const [fullMatch, beforeStyles, styles, afterStyles] = styleMatch;

  // Count non-host CSS lines
  const lines = styles.split('\n');
  const nonHostLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed &&
           !trimmed.includes(':host') &&
           trimmed !== '}' &&
           trimmed !== '{' &&
           !trimmed.startsWith('//') &&
           !trimmed.startsWith('*');
  });

  // If there's excessive non-host CSS, simplify it
  if (nonHostLines.length > 3) {
    const simplifiedStyles = `
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  `;

    const newContent = content.replace(fullMatch, beforeStyles + simplifiedStyles + afterStyles);
    return { content: newContent, changed: true };
  }

  return { content, changed: false };
}

/**
 * Fix a single component
 */
function fixComponent(componentName) {
  const componentFile = join(componentsDir, componentName, `usa-${componentName}.ts`);

  if (!existsSync(componentFile)) {
    return null;
  }

  let content = readFileSync(componentFile, 'utf-8');
  let totalChanges = 0;

  console.log(colors.cyan(`\n🔧 Fixing ${componentName}...`));

  // Apply fixes
  const fixes = [
    { name: 'USWDS styles import', fn: fixStylesImport },
    { name: 'Light DOM implementation', fn: fixLightDOM },
    { name: 'Web component managed attribute', fn: fixWebComponentManaged },
    { name: 'Simplified CSS', fn: simplifyCSS }
  ];

  fixes.forEach(fix => {
    const result = fix.fn(content);
    if (result.changed) {
      content = result.content;
      totalChanges++;
      console.log(colors.green(`  ✅ Fixed: ${fix.name}`));
    }
  });

  if (totalChanges > 0) {
    writeFileSync(componentFile, content, 'utf-8');
    console.log(colors.green(`  💾 Saved ${totalChanges} fixes`));
  } else {
    console.log(colors.yellow(`  ✨ No fixes needed`));
  }

  return { name: componentName, changes: totalChanges };
}

/**
 * Main execution
 */
function autoFixCompliance() {
  console.log(colors.bold(colors.cyan('\n🔧 USWDS Compliance Auto-Fix\n')));
  console.log('=' .repeat(50));

  const components = readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort();

  const results = [];
  let totalComponents = 0;
  let totalChanges = 0;

  components.forEach(componentName => {
    const result = fixComponent(componentName);
    if (result) {
      results.push(result);
      totalComponents++;
      totalChanges += result.changes;
    }
  });

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log(colors.bold(colors.cyan('\n📊 Auto-Fix Summary\n')));

  const fixedComponents = results.filter(r => r.changes > 0);

  console.log(`  Components Processed: ${totalComponents}`);
  console.log(colors.green(`  Components Fixed: ${fixedComponents.length}`));
  console.log(colors.green(`  Total Fixes Applied: ${totalChanges}`));

  if (fixedComponents.length > 0) {
    console.log(colors.green('\n  Fixed Components:'));
    fixedComponents.forEach(result => {
      console.log(colors.green(`    ✅ ${result.name} (${result.changes} fixes)`));
    });
  }

  console.log(colors.yellow('\n💡 Next Steps:'));
  console.log('  1. Run validation again: npm run validate:uswds-compliance');
  console.log('  2. Test components in Storybook');
  console.log('  3. Run tests to ensure nothing broke');
  console.log('  4. Manual review for component-specific USWDS patterns');

  console.log('\n' + '=' .repeat(50));
}

// Run auto-fix
autoFixCompliance();