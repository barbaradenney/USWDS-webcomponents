#!/usr/bin/env node

/**
 * Apply Combo-Box Pattern to Other Components
 *
 * Uses the successful combo-box iframe delegation fix as a template
 * to identify and fix similar issues in other interactive components.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const COMPONENTS_DIR = 'src/components';

// Components that need iframe delegation fixes based on combo-box pattern
const IFRAME_DELEGATION_CANDIDATES = [
  {
    name: 'file-input',
    reason: 'Uses init() method like combo-box, has interactive elements',
    interactiveSelector: '.usa-file-input__target, .usa-file-input__box',
    initMethod: 'init'
  },
  {
    name: 'date-picker',
    reason: 'Uses init() method, has toggle button like combo-box',
    interactiveSelector: '.usa-date-picker__button',
    initMethod: 'init'
  },
  {
    name: 'time-picker',
    reason: 'Similar to date-picker, may have interactive elements',
    interactiveSelector: '.usa-time-picker__button',
    initMethod: 'on'
  },
  {
    name: 'modal',
    reason: 'Uses init() method, has interactive close buttons',
    interactiveSelector: '.usa-modal__close, [data-close-modal]',
    initMethod: 'init'
  },
  {
    name: 'accordion',
    reason: 'Has toggle buttons that may need iframe delegation',
    interactiveSelector: '.usa-accordion__button',
    initMethod: 'on'
  },
  {
    name: 'header',
    reason: 'Has navigation toggle buttons',
    interactiveSelector: '.usa-menu-btn, .usa-nav__toggle',
    initMethod: 'on'
  }
];

// Get component file path
function getComponentFilePath(componentName) {
  return join(COMPONENTS_DIR, componentName, `usa-${componentName}.ts`);
}

// Check if component exists
function componentExists(componentName) {
  return existsSync(getComponentFilePath(componentName));
}

// Read component file content
function readComponentFile(componentName) {
  const filePath = getComponentFilePath(componentName);
  if (!existsSync(filePath)) {
    throw new Error(`Component file not found: ${filePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

// Write component file content
function writeComponentFile(componentName, content) {
  const filePath = getComponentFilePath(componentName);
  writeFileSync(filePath, content);
}

// Check if component already has iframe delegation
function hasIframeDelegation(content) {
  return content.includes('IframeEventDelegationMixin') ||
         content.includes('fixIframeEventDelegation') ||
         content.includes('iframe-delegation-mixin');
}

// Check if component needs ID restoration
function needsIdRestoration(content, componentName) {
  // Components that use init() method typically clear IDs
  const initComponents = ['combo-box', 'date-picker', 'file-input', 'modal'];
  return initComponents.includes(componentName);
}

// Apply iframe delegation pattern to component
function applyIframeDelegationPattern(componentName, config) {
  const content = readComponentFile(componentName);

  // Check if already applied
  if (hasIframeDelegation(content)) {
    console.log(chalk.yellow(`⏭️  ${componentName}: Already has iframe delegation`));
    return false;
  }

  console.log(chalk.blue(`🔧 Applying iframe delegation pattern to ${componentName}...`));

  let updatedContent = content;

  // Add import if not present
  if (!content.includes('iframe-delegation-mixin')) {
    const importRegex = /(import.*from.*['"].*utils.*['"];)/;
    if (importRegex.test(content)) {
      // Add to existing utils import section
      updatedContent = updatedContent.replace(
        importRegex,
        `$1\nimport { IframeEventDelegationMixin } from '../../utils/iframe-delegation-mixin.js';`
      );
    } else {
      // Add new import after other imports
      const lastImportRegex = /(import.*from.*['"].*['"];)(\s*\n)/;
      updatedContent = updatedContent.replace(
        lastImportRegex,
        `$1\nimport { IframeEventDelegationMixin } from '../../utils/iframe-delegation-mixin.js';$2`
      );
    }
  }

  // Update class declaration to extend IframeEventDelegationMixin
  const classRegex = /export class (USA\w+) extends (\w+)/;
  const classMatch = content.match(classRegex);

  if (classMatch) {
    const [fullMatch, className, baseClass] = classMatch;

    // Only apply if not already using mixin
    if (!baseClass.includes('IframeEventDelegationMixin')) {
      updatedContent = updatedContent.replace(
        fullMatch,
        `export class ${className} extends IframeEventDelegationMixin(${baseClass})`
      );
    }
  }

  // Add iframe delegation fix to connectedCallback or create one
  const connectedCallbackRegex = /connectedCallback\(\)\s*\{[\s\S]*?\n\s*\}/;
  const hasConnectedCallback = connectedCallbackRegex.test(content);

  if (hasConnectedCallback) {
    // Add to existing connectedCallback
    updatedContent = updatedContent.replace(
      /(\s+)(await this\.initializeUSWDS\(\);)/,
      `$1$2\n$1\n$1// Apply iframe delegation fix after USWDS initialization\n$1setTimeout(() => {\n$1  this.fixIframeEventDelegation({\n$1    interactiveSelector: '${config.interactiveSelector}',\n$1    checkDelay: 50,\n$1    debug: false\n$1  });\n$1}, 150);`
    );
  } else {
    // Add new connectedCallback
    const classBodyRegex = /(@customElement\(['"]usa-\w+['"]\)\s*export class \w+ extends [\w()]+\s*\{)/;
    updatedContent = updatedContent.replace(
      classBodyRegex,
      `$1\n\n  connectedCallback() {\n    super.connectedCallback();\n\n    // Apply iframe delegation fix after USWDS initialization\n    setTimeout(() => {\n      this.fixIframeEventDelegation({\n        interactiveSelector: '${config.interactiveSelector}',\n        checkDelay: 50,\n        debug: false\n      });\n    }, 150);\n  }`
    );
  }

  // Add ID restoration for components that need it
  if (needsIdRestoration(content, componentName)) {
    // Add restoreUSWDSElementId call
    updatedContent = updatedContent.replace(
      /(this\.fixIframeEventDelegation\({[\s\S]*?\}\);)/,
      `this.restoreUSWDSElementId();\n      $1`
    );
  }

  writeComponentFile(componentName, updatedContent);
  console.log(chalk.green(`✅ ${componentName}: Applied iframe delegation pattern`));
  return true;
}

// Validate iframe delegation was applied correctly
function validateIframeDelegation(componentName) {
  const content = readComponentFile(componentName);

  const checks = {
    hasImport: content.includes('iframe-delegation-mixin'),
    hasMixin: content.includes('IframeEventDelegationMixin'),
    hasFixCall: content.includes('fixIframeEventDelegation'),
    hasInteractiveSelector: content.includes('interactiveSelector')
  };

  const isValid = Object.values(checks).every(Boolean);

  if (isValid) {
    console.log(chalk.green(`✅ ${componentName}: Validation passed`));
  } else {
    console.log(chalk.red(`❌ ${componentName}: Validation failed`));
    console.log(`   Checks: ${JSON.stringify(checks, null, 2)}`);
  }

  return isValid;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const specificComponent = args.find(arg => !arg.startsWith('--'));
  const validateOnly = args.includes('--validate');
  const dryRun = args.includes('--dry-run');

  console.log(chalk.blue('🚀 Applying Combo-Box Pattern to Components\n'));

  if (specificComponent) {
    // Apply to specific component
    const config = IFRAME_DELEGATION_CANDIDATES.find(c => c.name === specificComponent);
    if (!config) {
      console.error(chalk.red(`❌ Component '${specificComponent}' not found in candidates list`));
      process.exit(1);
    }

    if (!componentExists(specificComponent)) {
      console.error(chalk.red(`❌ Component file not found for '${specificComponent}'`));
      process.exit(1);
    }

    if (validateOnly) {
      validateIframeDelegation(specificComponent);
    } else if (dryRun) {
      console.log(chalk.yellow(`🔍 Would apply iframe delegation to ${specificComponent}`));
      console.log(`   Interactive selector: ${config.interactiveSelector}`);
      console.log(`   Init method: ${config.initMethod}`);
      console.log(`   Reason: ${config.reason}`);
    } else {
      applyIframeDelegationPattern(specificComponent, config);
      validateIframeDelegation(specificComponent);
    }
  } else {
    // Apply to all candidates
    let applied = 0;
    let validated = 0;

    for (const config of IFRAME_DELEGATION_CANDIDATES) {
      if (!componentExists(config.name)) {
        console.log(chalk.gray(`⏭️  ${config.name}: Component file not found, skipping`));
        continue;
      }

      if (validateOnly) {
        if (validateIframeDelegation(config.name)) {
          validated++;
        }
      } else if (dryRun) {
        console.log(chalk.yellow(`🔍 Would apply iframe delegation to ${config.name}`));
        console.log(`   Reason: ${config.reason}`);
      } else {
        if (applyIframeDelegationPattern(config.name, config)) {
          applied++;
          if (validateIframeDelegation(config.name)) {
            validated++;
          }
        }
      }
    }

    if (validateOnly) {
      console.log(chalk.blue(`\n📊 Validation Summary: ${validated}/${IFRAME_DELEGATION_CANDIDATES.length} components validated`));
    } else if (dryRun) {
      console.log(chalk.blue(`\n📊 Dry Run Summary: Would apply pattern to ${IFRAME_DELEGATION_CANDIDATES.length} components`));
    } else {
      console.log(chalk.blue(`\n🎉 Application Summary: ${applied} components updated, ${validated} validated`));
    }
  }

  console.log(chalk.blue('\n📖 Next Steps:'));
  console.log('  1. Test components in both dev server and Storybook');
  console.log('  2. Run cross-environment validation: npm run test:cross-environment-functionality');
  console.log('  3. Generate debug pages: npm run generate:debug-pages');
  console.log('  4. Commit changes if everything works correctly');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { applyIframeDelegationPattern, validateIframeDelegation, IFRAME_DELEGATION_CANDIDATES };