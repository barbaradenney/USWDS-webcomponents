#!/usr/bin/env node

/**
 * USWDS Story Alignment Validator
 *
 * Validates that all Storybook stories align with official USWDS patterns:
 * - Uses correct USWDS examples and variants
 * - Has proper property binding (no string interpolation for boolean/objects)
 * - Includes all required USWDS variants
 * - Uses USWDS-compliant default values
 * - Has accurate component descriptions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(process.cwd(), 'src/components');

// USWDS component reference URLs for validation
const USWDS_REFS = {
  'accordion': 'https://designsystem.digital.gov/components/accordion/',
  'alert': 'https://designsystem.digital.gov/components/alert/',
  'banner': 'https://designsystem.digital.gov/components/banner/',
  'breadcrumb': 'https://designsystem.digital.gov/components/breadcrumb/',
  'button': 'https://designsystem.digital.gov/components/button/',
  'button-group': 'https://designsystem.digital.gov/components/button-group/',
  'card': 'https://designsystem.digital.gov/components/card/',
  'character-count': 'https://designsystem.digital.gov/components/character-count/',
  'checkbox': 'https://designsystem.digital.gov/components/checkbox/',
  'collection': 'https://designsystem.digital.gov/components/collection/',
  'combo-box': 'https://designsystem.digital.gov/components/combo-box/',
  'date-picker': 'https://designsystem.digital.gov/components/date-picker/',
  'date-range-picker': 'https://designsystem.digital.gov/components/date-range-picker/',
  'file-input': 'https://designsystem.digital.gov/components/file-input/',
  'footer': 'https://designsystem.digital.gov/components/footer/',
  'header': 'https://designsystem.digital.gov/components/header/',
  'icon': 'https://designsystem.digital.gov/components/icon/',
  'identifier': 'https://designsystem.digital.gov/components/identifier/',
  'in-page-navigation': 'https://designsystem.digital.gov/components/in-page-navigation/',
  'input-prefix-suffix': 'https://designsystem.digital.gov/components/input-prefix-suffix/',
  'language-selector': 'https://designsystem.digital.gov/components/language-selector/',
  'link': 'https://designsystem.digital.gov/components/link/',
  'list': 'https://designsystem.digital.gov/components/list/',
  'modal': 'https://designsystem.digital.gov/components/modal/',
  'pagination': 'https://designsystem.digital.gov/components/pagination/',
  'process-list': 'https://designsystem.digital.gov/components/process-list/',
  'radio': 'https://designsystem.digital.gov/components/radio-buttons/',
  'search': 'https://designsystem.digital.gov/components/search/',
  'select': 'https://designsystem.digital.gov/components/select/',
  'side-navigation': 'https://designsystem.digital.gov/components/side-navigation/',
  'site-alert': 'https://designsystem.digital.gov/components/site-alert/',
  'step-indicator': 'https://designsystem.digital.gov/components/step-indicator/',
  'summary-box': 'https://designsystem.digital.gov/components/summary-box/',
  'table': 'https://designsystem.digital.gov/components/table/',
  'tag': 'https://designsystem.digital.gov/components/tag/',
  'text-input': 'https://designsystem.digital.gov/components/text-input/',
  'textarea': 'https://designsystem.digital.gov/components/textarea/',
  'time-picker': 'https://designsystem.digital.gov/components/time-picker/',
  'tooltip': 'https://designsystem.digital.gov/components/tooltip/',
};

// Required stories for each component type
const REQUIRED_STORIES = {
  'form': ['Default', 'Required', 'Disabled', 'Error'], // Form components
  'interactive': ['Default', 'States'], // Interactive components
  'presentational': ['Default'], // Simple presentational components
};

class StoryAlignmentValidator {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.successes = [];
  }

  async validateAllStories() {
    console.log('\n🔍 USWDS Story Alignment Validator\n');
    console.log('=' .repeat(60));

    const components = fs.readdirSync(COMPONENTS_DIR)
      .filter(name => {
        const componentPath = path.join(COMPONENTS_DIR, name);
        return fs.statSync(componentPath).isDirectory();
      });

    for (const component of components) {
      await this.validateComponentStory(component);
    }

    this.printReport();
  }

  async validateComponentStory(componentName) {
    const storyPath = path.join(COMPONENTS_DIR, componentName, `usa-${componentName}.stories.ts`);

    if (!fs.existsSync(storyPath)) {
      this.issues.push({
        component: componentName,
        type: 'missing-story',
        message: 'Story file does not exist'
      });
      return;
    }

    const storyContent = fs.readFileSync(storyPath, 'utf-8');

    // Check 1: Property binding patterns
    this.checkPropertyBinding(componentName, storyContent);

    // Check 2: USWDS reference in description
    this.checkUSWDSReference(componentName, storyContent);

    // Check 3: Default export and meta
    this.checkStoryStructure(componentName, storyContent);

    // Check 4: Story variants
    this.checkStoryVariants(componentName, storyContent);

    // Check 5: Args binding
    this.checkArgsBinding(componentName, storyContent);

    // Check 6: Interactive controls configuration
    this.checkControlsConfiguration(componentName, storyContent);

    // Check 7: USWDS component usage in render functions
    this.checkUSWDSComponentUsage(componentName, storyContent);

    // Check 8: Modal-specific button structure validation
    if (componentName === 'modal') {
      this.checkModalButtonStructure(componentName, storyContent);
    }

    // Check 9: Button component-specific validation
    if (componentName === 'button') {
      this.checkButtonComponentStructure(componentName, storyContent);
    }

    // Check 10: Form component-specific validation
    const formComponents = ['text-input', 'textarea', 'select', 'checkbox', 'radio', 'file-input'];
    if (formComponents.includes(componentName)) {
      this.checkFormComponentStructure(componentName, storyContent);
    }

    // Check 11: Interactive component-specific validation
    const interactiveComponents = ['accordion', 'tooltip', 'language-selector'];
    if (interactiveComponents.includes(componentName)) {
      this.checkInteractiveComponentStructure(componentName, storyContent);
    }

    // Check 12: Universal unstyled button validation
    this.checkUnstyledButtonsAcrossAllComponents(componentName, storyContent);
  }

  checkPropertyBinding(componentName, content) {
    // Check for incorrect boolean binding (should use ?)
    // Pattern: looks for boolean attributes WITHOUT the ? prefix
    // Bad: disabled="${args.disabled}" or disabled=${args.disabled}
    // Good: ?disabled=${args.disabled}
    const badBooleanPattern = /(?<!\?)(disabled|required|checked|selected|open|expanded|hidden)=["']?\$\{args\.\1\}["']?/g;
    const badBooleanMatches = [...content.matchAll(badBooleanPattern)];

    if (badBooleanMatches.length > 0) {
      this.issues.push({
        component: componentName,
        type: 'incorrect-boolean-binding',
        message: `Found ${badBooleanMatches.length} incorrect boolean bindings. Use ?${badBooleanMatches[0][1]}=\${args.${badBooleanMatches[0][1]}} instead`,
        line: this.getLineNumber(content, badBooleanMatches[0].index)
      });
    }

    // Check for incorrect object/array binding (should use .)
    const badObjectPattern = /="\$\{args\.(options|items|data|config)\}"/g;
    const badObjectMatches = [...content.matchAll(badObjectPattern)];

    if (badObjectMatches.length > 0) {
      this.issues.push({
        component: componentName,
        type: 'incorrect-object-binding',
        message: `Found ${badObjectMatches.length} incorrect object bindings. Use .${badObjectMatches[0][1]}=\${args.${badObjectMatches[0][1]}} instead`,
        line: this.getLineNumber(content, badObjectMatches[0].index)
      });
    }

    // Success if no issues
    if (badBooleanMatches.length === 0 && badObjectMatches.length === 0) {
      this.successes.push({
        component: componentName,
        check: 'Property binding patterns are correct'
      });
    }
  }

  checkUSWDSReference(componentName, content) {
    const uswdsUrl = USWDS_REFS[componentName];

    if (!uswdsUrl) {
      this.warnings.push({
        component: componentName,
        type: 'no-uswds-ref',
        message: 'No USWDS reference URL defined'
      });
      return;
    }

    if (!content.includes(uswdsUrl)) {
      this.warnings.push({
        component: componentName,
        type: 'missing-uswds-link',
        message: `Story description should reference USWDS docs: ${uswdsUrl}`
      });
    } else {
      this.successes.push({
        component: componentName,
        check: 'USWDS reference link present'
      });
    }
  }

  checkStoryStructure(componentName, content) {
    // Check for default export
    if (!content.includes('export default meta')) {
      this.issues.push({
        component: componentName,
        type: 'missing-default-export',
        message: 'Story must export default meta object'
      });
      return;
    }

    // Check for Meta type
    if (!content.includes('Meta<')) {
      this.issues.push({
        component: componentName,
        type: 'missing-meta-type',
        message: 'Story should use Meta<ComponentType> type'
      });
    }

    // Check for title
    if (!content.includes('title:')) {
      this.issues.push({
        component: componentName,
        type: 'missing-title',
        message: 'Story meta must include title'
      });
    } else {
      this.successes.push({
        component: componentName,
        check: 'Story structure is correct'
      });
    }
  }

  checkStoryVariants(componentName, content) {
    const hasDefault = content.includes('export const Default');

    if (!hasDefault) {
      this.issues.push({
        component: componentName,
        type: 'missing-default-story',
        message: 'Story must have a Default export'
      });
    }

    // Count story exports
    const storyExports = content.match(/export const \w+: Story/g) || [];

    if (storyExports.length === 1 && hasDefault) {
      this.warnings.push({
        component: componentName,
        type: 'limited-variants',
        message: 'Only has Default story. Consider adding more variants (disabled, error, etc.)'
      });
    } else if (storyExports.length > 1) {
      this.successes.push({
        component: componentName,
        check: `Has ${storyExports.length} story variants`
      });
    }
  }

  checkArgsBinding(componentName, content) {
    // Check if render function uses args
    const hasRenderFn = content.includes('render:');

    if (hasRenderFn) {
      if (!content.includes('(args)')) {
        this.warnings.push({
          component: componentName,
          type: 'render-no-args',
          message: 'Render function should accept args parameter'
        });
      } else {
        this.successes.push({
          component: componentName,
          check: 'Render function uses args binding'
        });
      }
    }

    // Check for argTypes
    if (!content.includes('argTypes:')) {
      this.warnings.push({
        component: componentName,
        type: 'missing-argtypes',
        message: 'Consider adding argTypes for better Storybook controls'
      });
    }
  }

  checkControlsConfiguration(componentName, content) {
    // Extract argTypes section
    const argTypesMatch = content.match(/argTypes:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);

    if (!argTypesMatch) {
      // Already warned in checkArgsBinding
      return;
    }

    const argTypesContent = argTypesMatch[1];

    // Check for control types on argType properties
    const argTypeProperties = argTypesContent.match(/(\w+):\s*\{/g);

    if (!argTypeProperties || argTypeProperties.length === 0) {
      return;
    }

    // Extract individual argType configurations
    const argTypeBlocks = [];
    let currentPos = 0;
    let braceCount = 0;
    let currentBlock = '';
    let currentProp = '';

    for (let i = 0; i < argTypesContent.length; i++) {
      const char = argTypesContent[i];

      if (char === '{') {
        if (braceCount === 0) {
          // Find property name before this brace
          const beforeBrace = argTypesContent.substring(currentPos, i);
          const propMatch = beforeBrace.match(/(\w+):\s*$/);
          if (propMatch) {
            currentProp = propMatch[1];
          }
        }
        braceCount++;
        currentBlock += char;
      } else if (char === '}') {
        braceCount--;
        currentBlock += char;

        if (braceCount === 0 && currentBlock) {
          argTypeBlocks.push({ name: currentProp, content: currentBlock });
          currentBlock = '';
          currentPos = i + 1;
        }
      } else if (braceCount > 0) {
        currentBlock += char;
      }
    }

    // Validate each argType has proper control configuration
    let controlIssues = [];
    let controlWarnings = [];

    argTypeBlocks.forEach(({ name, content }) => {
      // Check if control is defined
      if (!content.includes('control:')) {
        controlWarnings.push(name);
        return;
      }

      // Check for control type specification
      const hasControlType = content.match(/control:\s*['"](\w+)['"]/);
      const hasControlObject = content.match(/control:\s*\{[^}]*type:\s*['"](\w+)['"]/);

      if (!hasControlType && !hasControlObject) {
        controlIssues.push({
          property: name,
          issue: 'control defined but missing type'
        });
      }

      // Check for description
      if (!content.includes('description:')) {
        controlWarnings.push(`${name} (missing description)`);
      }

      // Boolean properties should use boolean control
      if (['disabled', 'required', 'checked', 'selected', 'open', 'expanded', 'hidden', 'readonly'].includes(name)) {
        const controlType = hasControlType ? hasControlType[1] : (hasControlObject ? hasControlObject[1] : '');
        if (controlType && controlType !== 'boolean') {
          controlIssues.push({
            property: name,
            issue: `boolean property should use control: 'boolean', found: '${controlType}'`
          });
        }
      }

      // Select controls should have options
      const selectMatch = content.match(/control:\s*(?:['"]select['"]|\{\s*type:\s*['"]select['"])/);
      if (selectMatch && !content.includes('options:')) {
        controlIssues.push({
          property: name,
          issue: 'select control missing options array'
        });
      }
    });

    // Report issues
    if (controlIssues.length > 0) {
      controlIssues.forEach(({ property, issue }) => {
        this.issues.push({
          component: componentName,
          type: 'invalid-control-config',
          message: `Property '${property}': ${issue}`,
        });
      });
    }

    // Report warnings for missing controls/descriptions
    if (controlWarnings.length > 0 && controlWarnings.length < argTypeBlocks.length) {
      // Only warn if some (but not all) are missing - if all missing, already warned
      this.warnings.push({
        component: componentName,
        type: 'incomplete-controls',
        message: `Some properties missing controls or descriptions: ${controlWarnings.slice(0, 3).join(', ')}${controlWarnings.length > 3 ? '...' : ''}`
      });
    }

    // Success if no issues
    if (controlIssues.length === 0 && argTypeBlocks.length > 0) {
      this.successes.push({
        component: componentName,
        check: `${argTypeBlocks.length} argTypes with valid control configuration`
      });
    }
  }

  checkUSWDSComponentUsage(componentName, content) {
    // Map of HTML elements that should use USWDS components instead
    const htmlToUSWDSComponents = {
      'select': 'usa-select or usa-language-selector',
      '<button[^>]*class="[^"]*usa-button': 'usa-button',
      '<input[^>]*type="text"[^>]*class="[^"]*usa-input': 'usa-text-input',
      '<input[^>]*type="search"[^>]*class="[^"]*usa-input': 'usa-search',
      '<textarea[^>]*class="[^"]*usa-textarea': 'usa-textarea',
      '<input[^>]*type="checkbox"[^>]*class="[^"]*usa-checkbox': 'usa-checkbox',
      '<input[^>]*type="radio"[^>]*class="[^"]*usa-radio': 'usa-radio',
    };

    // Extract render functions from the story
    const renderFunctions = content.match(/render:\s*\(args\)\s*=>\s*html`([^`]*(?:`[^`]*`[^`]*)*)`/gs) || [];

    renderFunctions.forEach((renderFn) => {
      // Check for custom select elements (not usa-select or usa-language-selector)
      const customSelectPattern = /<select[^>]*(?!usa-select|usa-language-selector)/g;
      const customSelects = [...renderFn.matchAll(customSelectPattern)];

      if (customSelects.length > 0) {
        // Check if it's for language selection
        const isLanguageSelect = renderFn.includes('language') || renderFn.includes('lang');
        const recommendedComponent = isLanguageSelect ? 'usa-language-selector' : 'usa-select';

        this.warnings.push({
          component: componentName,
          type: 'custom-html-element',
          message: `Found custom <select> element in render function. Consider using <${recommendedComponent}> component for USWDS compliance.`,
        });
      }

      // Check for other non-USWDS HTML elements with USWDS classes
      Object.entries(htmlToUSWDSComponents).forEach(([pattern, component]) => {
        if (pattern === 'select') return; // Already handled above

        const regex = new RegExp(pattern, 'g');
        const matches = [...renderFn.matchAll(regex)];

        if (matches.length > 0) {
          this.warnings.push({
            component: componentName,
            type: 'non-component-usage',
            message: `Found HTML element with USWDS classes. Consider using <${component}> web component instead.`,
          });
        }
      });
    });
  }

  checkModalButtonStructure(componentName, content) {
    // Check for usa-button--unstyled buttons in modal stories
    const unstyledButtonPattern = /class="[^"]*usa-button--unstyled[^"]*"/g;
    const unstyledButtons = [...content.matchAll(unstyledButtonPattern)];

    unstyledButtons.forEach((match) => {
      const buttonContext = content.substring(
        Math.max(0, match.index - 100),
        Math.min(content.length, match.index + 200)
      );

      // Check if this unstyled button has required USWDS classes
      const hasPadding105 = buttonContext.includes('padding-105');
      const hasTextCenter = buttonContext.includes('text-center');

      if (!hasPadding105 || !hasTextCenter) {
        this.issues.push({
          component: componentName,
          type: 'incomplete-modal-button-classes',
          message: `usa-button--unstyled button missing required USWDS classes. Must include: padding-105 text-center`,
          line: this.getLineNumber(content, match.index)
        });
      }
    });

    // Check for data-close-modal buttons in button groups
    const buttonGroupPattern = /<(?:div|ul)[^>]*class="[^"]*usa-button-group[^"]*"[^>]*>([\s\S]*?)<\/(?:div|ul)>/g;
    const buttonGroups = [...content.matchAll(buttonGroupPattern)];

    buttonGroups.forEach((match) => {
      const buttonGroupContent = match[1];
      const buttonsInGroup = buttonGroupContent.match(/<button[^>]*data-close-modal[^>]*>/g);

      if (buttonsInGroup) {
        buttonsInGroup.forEach((button) => {
          // Check if button has aria-controls (will be added by USWDS, but good practice)
          if (!button.includes('aria-controls')) {
            // This is OK - aria-controls is added by USWDS behavior
          }

          // Check for proper class structure
          if (button.includes('usa-button--unstyled')) {
            if (!button.includes('padding-105') || !button.includes('text-center')) {
              this.warnings.push({
                component: componentName,
                type: 'modal-button-missing-classes',
                message: 'Secondary modal button (usa-button--unstyled) should include padding-105 and text-center classes'
              });
            }
          }
        });
      }
    });

    // Success if no issues found
    if (unstyledButtons.length > 0 && unstyledButtons.every((match) => {
      const buttonContext = content.substring(
        Math.max(0, match.index - 100),
        Math.min(content.length, match.index + 200)
      );
      return buttonContext.includes('padding-105') && buttonContext.includes('text-center');
    })) {
      this.successes.push({
        component: componentName,
        check: `Modal buttons have correct USWDS classes (${unstyledButtons.length} buttons checked)`
      });
    }
  }

  checkButtonComponentStructure(componentName, content) {
    // Check for required button variants
    const requiredVariants = ['Default', 'Secondary', 'Accent', 'Base', 'Outline', 'Unstyled'];
    const missingVariants = requiredVariants.filter(variant =>
      !content.includes(`export const ${variant}`)
    );

    if (missingVariants.length > 0) {
      this.warnings.push({
        component: componentName,
        type: 'missing-button-variants',
        message: `Missing USWDS button variants: ${missingVariants.join(', ')}`
      });
    } else {
      this.successes.push({
        component: componentName,
        check: 'All USWDS button variants present'
      });
    }

    // Check for size variants
    const sizeVariants = ['Big', 'Default', 'Small'];
    const hasSizeStory = sizeVariants.some(size => content.includes(`export const ${size}`));

    if (!hasSizeStory && !content.includes('size')) {
      this.warnings.push({
        component: componentName,
        type: 'missing-size-variants',
        message: 'Consider adding button size variants (big, default, small)'
      });
    }

    // Check for icon integration
    if (!content.includes('icon') && !content.includes('Icon')) {
      this.warnings.push({
        component: componentName,
        type: 'missing-icon-examples',
        message: 'Consider adding button examples with icons'
      });
    }
  }

  checkFormComponentStructure(componentName, content) {
    // Check for required form states
    const requiredStates = ['Default', 'Disabled', 'Error'];
    const missingStates = requiredStates.filter(state =>
      !content.includes(`export const ${state}`)
    );

    if (missingStates.length > 0) {
      this.warnings.push({
        component: componentName,
        type: 'missing-form-states',
        message: `Missing required form states: ${missingStates.join(', ')}`
      });
    } else {
      this.successes.push({
        component: componentName,
        check: 'All required form states present'
      });
    }

    // Check for label association patterns
    const labelPattern = /<label[^>]*for="[^"]+"/g;
    const labels = [...content.matchAll(labelPattern)];

    if (labels.length === 0) {
      this.warnings.push({
        component: componentName,
        type: 'missing-label-examples',
        message: 'Form component should demonstrate label association with for/id attributes'
      });
    }

    // Check for error message patterns
    if (content.includes('Error') && !content.includes('error-message')) {
      this.warnings.push({
        component: componentName,
        type: 'incomplete-error-pattern',
        message: 'Error state should demonstrate error message display'
      });
    }

    // Check for aria-describedby in error states
    // Only flag if stories manually render HTML with error states (not using component props)
    const hasManualErrorHTML = content.match(/<(input|select|textarea)[^>]*error[^>]*>/i);
    const hasAriaDescribedby = content.includes('aria-describedby');

    if (hasManualErrorHTML && !hasAriaDescribedby) {
      this.issues.push({
        component: componentName,
        type: 'missing-aria-describedby',
        message: 'Manually rendered error state must include aria-describedby for accessibility',
        line: this.getLineNumber(content, hasManualErrorHTML.index || 0)
      });
    }

    // Check for required attribute demonstration
    if (!content.includes('required') && !content.includes('Required')) {
      this.warnings.push({
        component: componentName,
        type: 'missing-required-example',
        message: 'Form component should demonstrate required field pattern'
      });
    }
  }

  checkInteractiveComponentStructure(componentName, content) {
    // Check for data-* attributes required by USWDS
    const dataAttributePatterns = {
      'accordion': ['data-allow-multiple', 'data-multi-selectable'],
      'tooltip': ['data-position'],
      'language-selector': ['data-i18n']
    };

    const requiredAttributes = dataAttributePatterns[componentName];
    if (requiredAttributes) {
      const missingAttributes = requiredAttributes.filter(attr =>
        !content.includes(attr)
      );

      if (missingAttributes.length > 0) {
        this.warnings.push({
          component: componentName,
          type: 'missing-data-attributes',
          message: `Consider demonstrating USWDS data attributes: ${missingAttributes.join(', ')}`
        });
      }
    }

    // Check for event handler examples
    if (!content.includes('@') && !content.includes('addEventListener') && !content.includes('on')) {
      this.warnings.push({
        component: componentName,
        type: 'missing-event-examples',
        message: 'Interactive component should demonstrate event handling'
      });
    }

    // Check for aria-expanded for expandable components
    if (componentName === 'accordion' && !content.includes('aria-expanded')) {
      this.issues.push({
        component: componentName,
        type: 'missing-aria-expanded',
        message: 'Accordion must include aria-expanded for accessibility'
      });
    }

    // Check for aria-controls for interactive triggers
    if (!content.includes('aria-controls')) {
      this.warnings.push({
        component: componentName,
        type: 'missing-aria-controls',
        message: 'Interactive component should demonstrate aria-controls for trigger elements'
      });
    }
  }

  checkUnstyledButtonsAcrossAllComponents(componentName, content) {
    // Skip modal since it has its own specific check
    if (componentName === 'modal') {
      return;
    }

    // Check for usa-button--unstyled usage
    const unstyledButtonPattern = /class="[^"]*usa-button--unstyled[^"]*"/g;
    const unstyledButtons = [...content.matchAll(unstyledButtonPattern)];

    if (unstyledButtons.length === 0) {
      // No unstyled buttons, nothing to check
      return;
    }

    unstyledButtons.forEach((match) => {
      const buttonContext = content.substring(
        Math.max(0, match.index - 100),
        Math.min(content.length, match.index + 200)
      );

      // Check if this unstyled button has required USWDS classes
      const hasPadding105 = buttonContext.includes('padding-105');
      const hasTextCenter = buttonContext.includes('text-center');

      if (!hasPadding105 || !hasTextCenter) {
        this.issues.push({
          component: componentName,
          type: 'incomplete-unstyled-button-classes',
          message: `usa-button--unstyled button missing required USWDS classes. Must include: padding-105 text-center`,
          line: this.getLineNumber(content, match.index)
        });
      }
    });

    // Success if all unstyled buttons have correct classes
    if (unstyledButtons.length > 0 && unstyledButtons.every((match) => {
      const buttonContext = content.substring(
        Math.max(0, match.index - 100),
        Math.min(content.length, match.index + 200)
      );
      return buttonContext.includes('padding-105') && buttonContext.includes('text-center');
    })) {
      this.successes.push({
        component: componentName,
        check: `Unstyled buttons have correct USWDS classes (${unstyledButtons.length} buttons checked)`
      });
    }
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  printReport() {
    console.log('\n📊 Validation Results:\n');

    // Issues (blocking)
    if (this.issues.length > 0) {
      console.log('❌ Issues Found:\n');
      this.issues.forEach(issue => {
        console.log(`   ${issue.component}:`);
        console.log(`      Type: ${issue.type}`);
        console.log(`      ${issue.message}`);
        if (issue.line) console.log(`      Line: ${issue.line}`);
        console.log();
      });
    }

    // Warnings (non-blocking)
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:\n');
      this.warnings.forEach(warning => {
        console.log(`   ${warning.component}: ${warning.message}`);
      });
    }

    // Successes
    if (this.successes.length > 0) {
      console.log(`\n✅ ${this.successes.length} checks passed`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Successes: ${this.successes.length}`);
    console.log(`   ⚠️  Warnings: ${this.warnings.length}`);
    console.log(`   ❌ Issues: ${this.issues.length}`);

    if (this.issues.length > 0) {
      console.log('\n💔 Validation failed! Please fix issues above.\n');
      process.exit(1);
    } else {
      console.log('\n✨ All stories are USWDS-aligned!\n');
    }
  }
}

// Run validation
const validator = new StoryAlignmentValidator();
validator.validateAllStories();
