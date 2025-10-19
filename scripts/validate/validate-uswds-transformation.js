#!/usr/bin/env node

/**
 * USWDS Component Transformation Validation Script
 *
 * This script validates that all USWDS components properly transform
 * from their base HTML elements to fully enhanced USWDS components.
 *
 * It checks:
 * 1. Module imports are properly configured in Vite
 * 2. Components load USWDS JavaScript modules correctly
 * 3. DOM transformation occurs (e.g., select → input for combo box)
 * 4. Required USWDS classes are applied post-transformation
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Components that require USWDS JavaScript transformation
const TRANSFORMING_COMPONENTS = {
  'combo-box': {
    module: 'combo-box',
    beforeSelector: 'select.usa-select',
    afterSelector: '.usa-combo-box__input',
    requiredClasses: ['usa-combo-box__input', 'usa-combo-box__toggle-list'],
    description: 'Transforms select element into typeahead input'
  },
  'date-picker': {
    module: 'date-picker',
    beforeSelector: 'input.usa-input',
    afterSelector: '.usa-date-picker__button',
    requiredClasses: ['usa-date-picker__wrapper', 'usa-date-picker__button'],
    description: 'Adds calendar button and functionality to date input'
  },
  'time-picker': {
    module: 'time-picker',
    beforeSelector: 'input.usa-input',
    afterSelector: '.usa-combo-box__input',
    requiredClasses: ['usa-combo-box__input', 'usa-time-picker'],
    description: 'Transforms input into time picker with dropdown'
  },
  'file-input': {
    module: 'file-input',
    beforeSelector: 'input[type="file"]',
    afterSelector: '.usa-file-input__box',
    requiredClasses: ['usa-file-input__box', 'usa-file-input__instructions'],
    description: 'Enhances file input with drag-and-drop'
  },
  'modal': {
    module: 'modal',
    beforeSelector: '.usa-modal',
    afterSelector: '.usa-modal',
    requiredClasses: ['usa-modal-overlay', 'usa-modal__content'],
    description: 'Adds overlay and focus trap to modal'
  },
  'accordion': {
    module: 'accordion',
    beforeSelector: '.usa-accordion',
    afterSelector: '.usa-accordion__button',
    requiredClasses: ['usa-accordion__button', 'usa-accordion__content'],
    description: 'Enhances accordion with expand/collapse functionality'
  },
  'tooltip': {
    module: 'tooltip',
    beforeSelector: '.usa-tooltip',
    afterSelector: '.usa-tooltip__trigger',
    requiredClasses: ['usa-tooltip__trigger', 'usa-tooltip__body'],
    description: 'Creates tooltip with positioning and arrow'
  }
};

class USWDSTransformationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  // Check if Vite config has proper aliases
  checkViteConfig() {
    console.log('\n📋 Checking Vite Configuration...');

    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    if (!fs.existsSync(viteConfigPath)) {
      this.errors.push('❌ vite.config.ts not found');
      return false;
    }

    const viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');

    // Check for each component's module alias
    Object.entries(TRANSFORMING_COMPONENTS).forEach(([name, config]) => {
      const aliasPattern = `'@uswds/uswds/js/usa-${config.module}':`;
      const optimizePattern = `'@uswds/uswds/js/usa-${config.module}'`;

      if (!viteConfig.includes(aliasPattern)) {
        this.errors.push(`❌ Missing Vite alias for usa-${config.module}`);
      } else {
        this.successes.push(`✅ Vite alias configured for usa-${config.module}`);
      }

      if (!viteConfig.includes(optimizePattern)) {
        this.warnings.push(`⚠️ Missing optimizeDeps entry for usa-${config.module}`);
      }
    });

    return this.errors.length === 0;
  }

  // Check if component files use proper import patterns
  checkComponentImports() {
    console.log('\n📦 Checking Component Import Patterns...');

    const componentsDir = path.join(process.cwd(), 'src', 'components');

    Object.entries(TRANSFORMING_COMPONENTS).forEach(([name, config]) => {
      const componentPath = path.join(componentsDir, name, `usa-${name}.ts`);

      if (!fs.existsSync(componentPath)) {
        this.warnings.push(`⚠️ Component file not found: usa-${name}.ts`);
        return;
      }

      const componentCode = fs.readFileSync(componentPath, 'utf-8');

      // Check for correct import pattern
      const correctPattern = `import('@uswds/uswds/js/usa-${config.module}')`;
      const loaderPattern = `loadUSWDSModule('${config.module}')`;
      const scriptTagPattern = 'ARCHITECTURE: Script Tag Pattern';
      const mirroredBehaviorPattern = 'ARCHITECTURE: USWDS-Mirrored Behavior';

      if (componentCode.includes(correctPattern) ||
          componentCode.includes(loaderPattern) ||
          componentCode.includes(scriptTagPattern) ||
          componentCode.includes(mirroredBehaviorPattern)) {
        this.successes.push(`✅ ${name}: Using correct USWDS import pattern`);
      } else {
        this.warnings.push(`⚠️ ${name}: May not be using standard USWDS import pattern`);
      }

      // Check for module initialization
      if (componentCode.includes('.on(') || componentCode.includes('.init(')) {
        this.successes.push(`✅ ${name}: Properly initializes USWDS module`);
      } else {
        this.warnings.push(`⚠️ ${name}: May not be initializing USWDS module`);
      }

      // NEW: Check DOM structure compliance for critical components
      if (name === 'combo-box') {
        this.checkComboBoxDOMStructure(componentCode);
      } else if (name === 'time-picker') {
        this.checkTimePickerDOMStructure(componentCode);
      } else if (name === 'date-picker') {
        this.checkDatePickerDOMStructure(componentCode);
      } else if (['file-input', 'modal', 'tooltip'].includes(name)) {
        this.checkEnhancedDOMStructure(name, componentCode);
      }
    });
  }

  // NEW: Validate combo box DOM structure for USWDS compliance
  checkComboBoxDOMStructure(componentCode) {
    // Check that combo box renders simple structure without extra attributes
    const problematicPatterns = [
      'data-enhanced="false"',
      'role="combobox"',
      'aria-expanded="false"',
      'aria-controls=',
      'aria-labelledby='
    ];

    const hasProblematicAttributes = problematicPatterns.some(pattern =>
      componentCode.includes(pattern)
    );

    if (hasProblematicAttributes) {
      this.errors.push(`❌ combo-box: Contains problematic attributes that interfere with USWDS transformation`);
      this.errors.push(`   → Remove extra attributes from .usa-combo-box wrapper - USWDS adds these during transformation`);
    } else {
      this.successes.push(`✅ combo-box: Clean DOM structure without interfering attributes`);
    }

    // Check for proper label structure
    if (componentCode.includes('id="${listIdLabel || \'\'}"')) {
      this.errors.push(`❌ combo-box: Label has empty id attribute that could interfere with USWDS`);
    } else {
      this.successes.push(`✅ combo-box: Label structure is clean`);
    }

    // Check that it renders select element inside usa-combo-box
    if (componentCode.includes('<div class="usa-combo-box">') &&
        componentCode.includes('<select')) {
      this.successes.push(`✅ combo-box: Renders select inside .usa-combo-box wrapper as expected`);
    } else {
      this.errors.push(`❌ combo-box: Missing proper select element inside .usa-combo-box wrapper`);
    }
  }

  // NEW: Validate time picker DOM structure (architecturally identical to combo box)
  checkTimePickerDOMStructure(componentCode) {
    // Time picker transforms into combo-box, so similar issues as combo box
    const problematicPatterns = [
      'data-enhanced="false"',
      'role="combobox"',
      'aria-expanded="false"',
      'aria-controls=',
      'aria-labelledby='
    ];

    const hasProblematicAttributes = problematicPatterns.some(pattern =>
      componentCode.includes(pattern)
    );

    if (hasProblematicAttributes) {
      this.errors.push(`❌ time-picker: Contains problematic attributes that interfere with USWDS transformation`);
      this.errors.push(`   → Remove extra attributes from .usa-time-picker wrapper - USWDS adds these during transformation`);
    } else {
      this.successes.push(`✅ time-picker: Clean DOM structure without interfering attributes`);
    }

    // Check for proper label structure
    if (componentCode.includes('id="${listIdLabel || \'\'}"')) {
      this.errors.push(`❌ time-picker: Label has empty id attribute that could interfere with USWDS`);
    } else {
      this.successes.push(`✅ time-picker: Label structure is clean`);
    }

    // Check that it renders input element inside usa-time-picker (flexible for Lit templates)
    if ((componentCode.includes('usa-time-picker') || componentCode.includes('time-picker')) &&
        componentCode.includes('<input')) {
      this.successes.push(`✅ time-picker: Renders input inside .usa-time-picker wrapper as expected`);
    } else {
      this.warnings.push(`⚠️ time-picker: May be missing proper input element inside .usa-time-picker wrapper`);
    }

    // Time picker specific: Check for combo box integration patterns
    if (componentCode.includes('combo-box') && componentCode.includes('time-picker')) {
      this.successes.push(`✅ time-picker: Has proper combo-box integration pattern`);
    } else {
      this.warnings.push(`⚠️ time-picker: May lack proper combo-box integration (time-picker transforms into combo-box)`);
    }
  }

  // NEW: Validate date picker DOM structure
  checkDatePickerDOMStructure(componentCode) {
    // Date picker adds complex elements and calendar functionality
    const problematicPatterns = [
      'data-enhanced="false"',
      'role="datepicker"',
      'aria-expanded="false"'
    ];

    const hasProblematicAttributes = problematicPatterns.some(pattern =>
      componentCode.includes(pattern)
    );

    if (hasProblematicAttributes) {
      this.errors.push(`❌ date-picker: Contains problematic attributes that interfere with USWDS transformation`);
      this.errors.push(`   → Remove extra attributes - USWDS adds these during transformation`);
    } else {
      this.successes.push(`✅ date-picker: Clean DOM structure without interfering attributes`);
    }

    // Check for proper input structure (flexible for Lit templates)
    if ((componentCode.includes('usa-date-picker') || componentCode.includes('date-picker')) &&
        componentCode.includes('<input')) {
      this.successes.push(`✅ date-picker: Renders input inside .usa-date-picker wrapper as expected`);
    } else {
      this.warnings.push(`⚠️ date-picker: May be missing proper input element inside .usa-date-picker wrapper`);
    }

    // Check for label association
    if (componentCode.includes('for=') && componentCode.includes('id=')) {
      this.successes.push(`✅ date-picker: Has proper label association`);
    } else {
      this.warnings.push(`⚠️ date-picker: May lack proper label association`);
    }

    // Date picker specific: Calendar integration
    if (componentCode.includes('calendar') || componentCode.includes('date-picker')) {
      this.successes.push(`✅ date-picker: Has calendar integration patterns`);
    } else {
      this.warnings.push(`⚠️ date-picker: May lack calendar integration patterns`);
    }
  }

  // NEW: Enhanced validation for medium-risk components
  checkEnhancedDOMStructure(componentName, componentCode) {
    const componentConfig = {
      'file-input': {
        wrapperClass: 'usa-file-input',
        expectedElements: ['input[type="file"]', 'label'],
        problematicPatterns: ['data-enhanced="false"', 'role="button"']
      },
      'modal': {
        wrapperClass: 'usa-modal',
        expectedElements: ['.usa-modal__content', '.usa-modal__main'],
        problematicPatterns: ['data-open="false"', 'aria-hidden="false"']
      },
      'tooltip': {
        wrapperClass: 'usa-tooltip',
        expectedElements: ['.usa-tooltip__trigger', '.usa-tooltip__body'],
        problematicPatterns: ['data-position="top"', 'aria-describedby=']
      }
    };

    const config = componentConfig[componentName];
    if (!config) return;

    // Check for problematic attributes
    const hasProblematicAttributes = config.problematicPatterns.some(pattern =>
      componentCode.includes(pattern)
    );

    if (hasProblematicAttributes) {
      this.warnings.push(`⚠️ ${componentName}: Contains attributes that may interfere with USWDS enhancement`);
    } else {
      this.successes.push(`✅ ${componentName}: Clean DOM structure for USWDS enhancement`);
    }

    // Check for proper wrapper (flexible matching for Lit templates)
    const wrapperPatterns = [
      `class="${config.wrapperClass}"`,
      `class="\${.*${config.wrapperClass}`,
      `.${config.wrapperClass}`,
      `${config.wrapperClass}"`
    ];

    if (wrapperPatterns.some(pattern => componentCode.includes(pattern))) {
      this.successes.push(`✅ ${componentName}: Has proper wrapper class`);
    } else {
      this.warnings.push(`⚠️ ${componentName}: May be missing wrapper class .${config.wrapperClass}`);
    }

    // Component-specific checks
    if (componentName === 'tooltip') {
      // Tooltip has had iframe positioning issues
      if (componentCode.includes('iframe') || componentCode.includes('positioning')) {
        this.successes.push(`✅ tooltip: Has iframe-aware positioning patterns`);
      } else {
        this.warnings.push(`⚠️ tooltip: May lack iframe-aware positioning (known issue area)`);
      }
    }
  }

  // Check for test coverage of transformations
  checkTransformationTests() {
    console.log('\n🧪 Checking Transformation Test Coverage...');

    const componentsDir = path.join(process.cwd(), 'src', 'components');

    Object.entries(TRANSFORMING_COMPONENTS).forEach(([name, config]) => {
      const testPath = path.join(componentsDir, name, `usa-${name}.test.ts`);

      if (!fs.existsSync(testPath)) {
        this.warnings.push(`⚠️ Missing test file: usa-${name}.test.ts`);
        return;
      }

      const testCode = fs.readFileSync(testPath, 'utf-8');

      // Check for transformation testing
      if (testCode.includes('querySelector') &&
          (testCode.includes(config.afterSelector) ||
           testCode.includes(config.requiredClasses[0]))) {
        this.successes.push(`✅ ${name}: Has transformation tests`);
      } else {
        this.warnings.push(`⚠️ ${name}: May lack transformation tests`);
      }
    });
  }

  // Generate test file for transformation validation
  generateTransformationTest() {
    console.log('\n🔨 Generating Transformation Test Suite...');

    const testContent = `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitFor } from '@testing-library/dom';

/**
 * USWDS Component Transformation Test Suite
 *
 * Validates that all USWDS components properly transform their DOM structure
 * when USWDS JavaScript modules are loaded.
 *
 * Generated by: scripts/validate-uswds-transformation.js
 */

describe('USWDS Component Transformations', () => {
${Object.entries(TRANSFORMING_COMPONENTS).map(([name, config]) => `
  describe('usa-${name}', () => {
    let element;

    beforeEach(async () => {
      // Import component
      await import('../src/components/${name}/usa-${name}.js');
      element = document.createElement('usa-${name}');
      document.body.appendChild(element);
    });

    afterEach(() => {
      element?.remove();
    });

    it('should transform DOM structure after USWDS module loads', async () => {
      // Wait for component to render
      await element.updateComplete;

      // Check initial state
      const beforeElement = element.querySelector('${config.beforeSelector}');
      expect(beforeElement).toBeTruthy();

      // Wait for USWDS transformation
      await waitFor(() => {
        const transformed = element.querySelector('${config.afterSelector}');
        return transformed !== null;
      }, { timeout: 3000 });

      // Verify transformation occurred
      const afterElement = element.querySelector('${config.afterSelector}');
      expect(afterElement).toBeTruthy();
    });

    it('should have required USWDS classes after transformation', async () => {
      await element.updateComplete;

      // Wait for transformation
      await waitFor(() => {
        const transformed = element.querySelector('${config.afterSelector}');
        return transformed !== null;
      }, { timeout: 3000 });

      // Check for required classes
      ${config.requiredClasses.map(cls => `
      const element_${cls.replace(/[^a-zA-Z0-9]/g, '_')} = element.querySelector('.${cls}');
      expect(element_${cls.replace(/[^a-zA-Z0-9]/g, '_')}).toBeTruthy();`).join('')}
    });
  });`).join('\n')}
});`;

    const testPath = path.join(process.cwd(), '__tests__', 'uswds-transformation.test.ts');
    fs.writeFileSync(testPath, testContent);
    this.successes.push(`✅ Generated transformation test suite at ${testPath}`);
  }

  // Create pre-commit hook
  createPreCommitHook() {
    console.log('\n🔒 Creating Pre-commit Hook...');

    const hookContent = `#!/bin/sh
# USWDS Transformation Validation Pre-commit Hook

echo "🔍 Validating USWDS component transformations..."

# Run transformation validation
node scripts/validate-uswds-transformation.js --quiet

if [ $? -ne 0 ]; then
  echo "❌ USWDS transformation validation failed!"
  echo "Please fix the issues above before committing."
  exit 1
fi

echo "✅ USWDS transformation validation passed!"
`;

    const hookPath = path.join(process.cwd(), '.husky', 'pre-commit-uswds');

    if (!fs.existsSync(path.dirname(hookPath))) {
      fs.mkdirSync(path.dirname(hookPath), { recursive: true });
    }

    fs.writeFileSync(hookPath, hookContent);
    fs.chmodSync(hookPath, '755');

    // Add to existing pre-commit if exists
    const mainHookPath = path.join(process.cwd(), '.husky', 'pre-commit');
    if (fs.existsSync(mainHookPath)) {
      const mainHook = fs.readFileSync(mainHookPath, 'utf-8');
      if (!mainHook.includes('pre-commit-uswds')) {
        fs.appendFileSync(mainHookPath, '\n.husky/pre-commit-uswds\n');
        this.successes.push('✅ Added USWDS validation to existing pre-commit hook');
      }
    } else {
      fs.writeFileSync(mainHookPath, '#!/bin/sh\n. "$(dirname "$0")/_/husky.sh"\n\n.husky/pre-commit-uswds\n');
      fs.chmodSync(mainHookPath, '755');
      this.successes.push('✅ Created pre-commit hook with USWDS validation');
    }
  }

  // Run all validations
  async run(options = {}) {
    console.log('🚀 USWDS Component Transformation Validator\n');
    console.log('=' .repeat(50));

    // Run checks
    this.checkViteConfig();
    this.checkComponentImports();
    this.checkTransformationTests();

    // Generate files if requested
    if (options.generate) {
      this.generateTransformationTest();
      this.createPreCommitHook();
    }

    // Report results
    console.log('\n' + '='.repeat(50));
    console.log('📊 Validation Results:\n');

    if (this.successes.length > 0) {
      console.log('✅ Successes:');
      this.successes.forEach(s => console.log(`   ${s}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.warnings.forEach(w => console.log(`   ${w}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(e => console.log(`   ${e}`));
    }

    // Summary
    console.log('\n📈 Summary:');
    console.log(`   ✅ ${this.successes.length} checks passed`);
    console.log(`   ⚠️ ${this.warnings.length} warnings`);
    console.log(`   ❌ ${this.errors.length} errors`);

    // Exit code
    const exitCode = this.errors.length > 0 ? 1 : 0;

    if (!options.quiet && exitCode === 0) {
      console.log('\n🎉 All critical checks passed!');
    } else if (exitCode !== 0) {
      console.log('\n💔 Validation failed! Please fix errors above.');
    }

    process.exit(exitCode);
  }
}

// CLI handling
const validator = new USWDSTransformationValidator();
const args = process.argv.slice(2);

const options = {
  quiet: args.includes('--quiet'),
  generate: args.includes('--generate') || args.includes('-g')
};

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
USWDS Component Transformation Validator

Usage: node scripts/validate-uswds-transformation.js [options]

Options:
  --generate, -g    Generate test files and hooks
  --quiet           Suppress success messages
  --help, -h        Show this help message

Examples:
  node scripts/validate-uswds-transformation.js
  node scripts/validate-uswds-transformation.js --generate
  npm run validate:transformations
`);
  process.exit(0);
}

validator.run(options);