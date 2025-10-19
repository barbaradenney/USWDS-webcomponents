#!/usr/bin/env node

/**
 * Generate Debug HTML Pages for Components
 *
 * Creates co-located debug HTML pages for each component to enable:
 * - Cross-environment testing
 * - Component development and debugging
 * - Isolated testing without Storybook overhead
 * - Automated validation by prevention systems
 */

import { readdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const COMPONENTS_DIR = 'src/components';

// Get all component directories
function getComponentDirectories() {
  return readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => !name.startsWith('.'));
}

// Component-specific content generators
const COMPONENT_CONTENT = {
  'combo-box': () => `
    <usa-combo-box>
      <label for="combo-box-default">Select or enter a state</label>
      <select id="combo-box-default" name="state">
        <option value="">Select a state</option>
        <option value="AL">Alabama</option>
        <option value="AK">Alaska</option>
        <option value="AZ">Arizona</option>
        <option value="AR">Arkansas</option>
        <option value="CA">California</option>
      </select>
    </usa-combo-box>`,

  'accordion': () => `
    <usa-accordion>
      <div class="usa-accordion__heading">
        <button type="button" class="usa-accordion__button" aria-expanded="false" aria-controls="section-1">
          First Amendment
        </button>
      </div>
      <div id="section-1" class="usa-accordion__content usa-prose" hidden>
        <p>Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances.</p>
      </div>
    </usa-accordion>`,

  'modal': () => `
    <button class="usa-button" data-open-modal="example-modal">Open Modal</button>
    <usa-modal id="example-modal">
      <div class="usa-modal__content">
        <div class="usa-modal__main">
          <h1 class="usa-modal__heading">Modal Title</h1>
          <div class="usa-prose">
            <p>This is a modal dialog.</p>
          </div>
          <div class="usa-modal__footer">
            <ul class="usa-button-group">
              <li class="usa-button-group__item">
                <button type="button" class="usa-button" data-close-modal>Close</button>
              </li>
            </ul>
          </div>
        </div>
        <button class="usa-modal__close" aria-label="Close this window" data-close-modal>
          <svg class="usa-icon" aria-hidden="true" focusable="false" role="img">
            <use xlink:href="#svg-close"></use>
          </svg>
        </button>
      </div>
    </usa-modal>`
};

// Generate debug HTML template for a component
function generateDebugHTML(componentName) {
  const componentTag = `usa-${componentName}`;
  const getComponentContent = COMPONENT_CONTENT[componentName] || (() => `<${componentTag}></${componentTag}>`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName} - Debug Page</title>

  <!-- USWDS CSS -->
  <link rel="stylesheet" href="/node_modules/@uswds/uswds/dist/css/uswds.min.css">

  <!-- Component Styles -->
  <style>
    body {
      margin: 2rem;
      font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    .debug-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .debug-section {
      margin: 2rem 0;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .debug-info {
      background: #f8f9fa;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="debug-container">
    <h1>${componentName.charAt(0).toUpperCase() + componentName.slice(1)} Component Debug</h1>

    <div class="debug-info">
      <strong>Debug Page Info:</strong><br>
      Component: ${componentTag}<br>
      Environment: Development Server<br>
      URL: <span id="current-url"></span><br>
      Timestamp: <span id="timestamp"></span>
    </div>

    <div class="debug-section">
      <h2>Default Component</h2>
      ${getComponentContent()}
    </div>

    <div class="debug-section">
      <h2>Component with Content</h2>
      ${getComponentContent()}
    </div>

    <div class="debug-section">
      <h2>Multiple Instances</h2>
      <div id="instance-1">${getComponentContent()}</div>
      <br><br>
      <div id="instance-2">${getComponentContent()}</div>
    </div>

    <div class="debug-section">
      <h2>Component State Info</h2>
      <button onclick="logComponentState()">Log Component State</button>
      <div id="state-output" class="debug-info" style="display: none;"></div>
    </div>
  </div>

  <!-- Component Import -->
  <script type="module">
    import '../index.js';

    // Debug utilities
    window.logComponentState = function() {
      const components = document.querySelectorAll('${componentTag}');
      const stateOutput = document.getElementById('state-output');

      const info = Array.from(components).map((comp, index) => {
        return {
          index,
          id: comp.id || 'no-id',
          classes: Array.from(comp.classList),
          attributes: Array.from(comp.attributes).map(attr => \`\${attr.name}="\${attr.value}"\`),
          innerHTML: comp.innerHTML.substring(0, 100) + (comp.innerHTML.length > 100 ? '...' : ''),
          properties: Object.getOwnPropertyNames(comp).filter(prop =>
            !prop.startsWith('_') && typeof comp[prop] !== 'function'
          ).reduce((props, prop) => {
            props[prop] = comp[prop];
            return props;
          }, {})
        };
      });

      stateOutput.style.display = 'block';
      stateOutput.innerHTML = '<strong>Component State:</strong><br>' +
        JSON.stringify(info, null, 2).replace(/\\n/g, '<br>').replace(/ /g, '&nbsp;');
    };

    // Set debug info
    document.getElementById('current-url').textContent = window.location.href;
    document.getElementById('timestamp').textContent = new Date().toISOString();

    // Auto-log when components are ready
    setTimeout(() => {
      console.log('🔍 ${componentName} Debug Page Loaded');
      console.log('Components found:', document.querySelectorAll('${componentTag}').length);

      // Check for USWDS transformation
      setTimeout(() => {
        const hasUSWDSClasses = Array.from(document.querySelectorAll('*')).some(el =>
          Array.from(el.classList).some(cls => cls.startsWith('usa-${componentName}'))
        );
        console.log('USWDS transformation detected:', hasUSWDSClasses);
      }, 1000);
    }, 100);
  </script>
</body>
</html>`;
}

// Generate debug page for a specific component
function generateComponentDebugPage(componentName) {
  const componentDir = join(COMPONENTS_DIR, componentName);
  const debugPagePath = join(componentDir, `usa-${componentName}.debug.html`);

  // Check if component has TypeScript file
  const componentTSPath = join(componentDir, `usa-${componentName}.ts`);
  if (!existsSync(componentTSPath)) {
    console.log(chalk.yellow(`⚠️  Skipping ${componentName}: no TypeScript file found`));
    return false;
  }

  // Generate HTML content
  const htmlContent = generateDebugHTML(componentName);

  // Write debug page
  writeFileSync(debugPagePath, htmlContent);
  console.log(chalk.green(`✅ Created debug page: ${debugPagePath}`));
  return true;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const specificComponent = args.find(arg => !arg.startsWith('--'));
  const force = args.includes('--force');

  console.log(chalk.blue('🚀 Generating Component Debug Pages\n'));

  if (specificComponent) {
    // Generate for specific component
    console.log(chalk.blue(`Generating debug page for: ${specificComponent}`));
    const success = generateComponentDebugPage(specificComponent);
    if (success) {
      console.log(chalk.green(`\n✅ Debug page created for ${specificComponent}`));
      console.log(chalk.blue(`   Access at: http://localhost:5173/${COMPONENTS_DIR}/${specificComponent}/usa-${specificComponent}.debug.html`));
    }
  } else {
    // Generate for all components
    const components = getComponentDirectories();
    console.log(chalk.blue(`Found ${components.length} components`));

    let generated = 0;
    let skipped = 0;

    components.forEach(componentName => {
      const debugPagePath = join(COMPONENTS_DIR, componentName, `usa-${componentName}.debug.html`);

      if (existsSync(debugPagePath) && !force) {
        console.log(chalk.gray(`⏭️  Skipping ${componentName}: debug page exists (use --force to overwrite)`));
        skipped++;
      } else {
        if (generateComponentDebugPage(componentName)) {
          generated++;
        } else {
          skipped++;
        }
      }
    });

    console.log(chalk.green(`\n🎉 Generation Complete!`));
    console.log(`   Generated: ${generated} debug pages`);
    console.log(`   Skipped: ${skipped} components`);

    if (generated > 0) {
      console.log(chalk.blue(`\n📖 Usage:`));
      console.log(`   1. Start dev server: npm run dev`);
      console.log(`   2. Access debug pages: http://localhost:5173/src/components/[component]/usa-[component].debug.html`);
      console.log(`   3. Example: http://localhost:5173/src/components/combo-box/usa-combo-box.debug.html`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateComponentDebugPage, generateDebugHTML };