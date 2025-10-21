#!/usr/bin/env node

/**
 * CSS Tree-Shaking via CSS Extraction
 *
 * This script extracts component-specific CSS rules from the complete USWDS CSS,
 * creating smaller, tree-shaken CSS files for individual components.
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import postcss from 'postcss';

// Component to CSS class mapping (ALL 46 components)
const componentCssMap = {
  accordion: [
    'usa-accordion',
    'usa-accordion__heading',
    'usa-accordion__button',
    'usa-accordion__content',
    'usa-accordion--bordered',
    'usa-accordion--multiselectable',
  ],
  alert: [
    'usa-alert',
    'usa-alert__heading',
    'usa-alert__text',
    'usa-alert__body',
    'usa-alert--info',
    'usa-alert--warning',
    'usa-alert--error',
    'usa-alert--success',
    'usa-alert--emergency',
    'usa-alert--slim',
    'usa-alert--no-icon',
    'usa-alert--validation',
  ],
  banner: [
    'usa-banner',
    'usa-banner__header',
    'usa-banner__inner',
    'usa-banner__header-flag',
    'usa-banner__header-text',
    'usa-banner__header-action',
    'usa-banner__button',
    'usa-banner__content',
    'usa-banner__guidance',
    'usa-banner__icon',
    'usa-banner__lock-image',
    'usa-banner__button-text',
    'usa-banner__header--expanded',
  ],
  breadcrumb: [
    'usa-breadcrumb',
    'usa-breadcrumb__list',
    'usa-breadcrumb__item',
    'usa-breadcrumb__link',
    'usa-breadcrumb__list-item',
  ],
  button: [
    'usa-button',
    'usa-button--secondary',
    'usa-button--accent-cool',
    'usa-button--accent-warm',
    'usa-button--base',
    'usa-button--outline',
    'usa-button--inverse',
    'usa-button--big',
    'usa-button--small',
    'usa-button--unstyled',
  ],
  'button-group': ['usa-button-group', 'usa-button-group__item'],
  card: [
    'usa-card',
    'usa-card__container',
    'usa-card__header',
    'usa-card__media',
    'usa-card__img',
    'usa-card__body',
    'usa-card__footer',
    'usa-card--header-first',
    'usa-card--media-right',
    'usa-card--flag',
    'usa-card-group',
  ],
  'character-count': [
    'usa-character-count',
    'usa-character-count__field',
    'usa-character-count__message',
    'usa-character-count__status',
    'usa-character-count__sr-text',
  ],
  checkbox: [
    'usa-checkbox',
    'usa-checkbox__input',
    'usa-checkbox__label',
    'usa-checkbox__label-text',
  ],
  collection: [
    'usa-collection',
    'usa-collection__item',
    'usa-collection__heading',
    'usa-collection__description',
    'usa-collection__meta',
    'usa-collection__meta-item',
    'usa-collection__calendar-date',
  ],
  'combo-box': [
    'usa-combo-box',
    'usa-combo-box__input',
    'usa-combo-box__toggle-list',
    'usa-combo-box__list',
    'usa-combo-box__list-option',
    'usa-combo-box__list-option--focused',
    'usa-combo-box__list-option--selected',
    'usa-combo-box__status',
    'usa-combo-box__input-button-separator',
  ],
  'date-picker': [
    'usa-date-picker',
    'usa-date-picker__wrapper',
    'usa-date-picker__button',
    'usa-date-picker__calendar',
    'usa-date-picker__calendar__table',
    'usa-date-picker__calendar__date',
    'usa-date-picker__calendar__date--focused',
    'usa-date-picker__calendar__date--selected',
    'usa-date-picker__calendar__date--range-date',
    'usa-date-picker__calendar__date--range-date-start',
    'usa-date-picker__calendar__date--range-date-end',
    'usa-date-picker__calendar__date--within-range',
    'usa-date-picker__calendar__date--today',
    'usa-date-picker__calendar__date--previous-month',
    'usa-date-picker__calendar__date--next-month',
    'usa-date-picker__external-input',
  ],
  'date-range-picker': [
    'usa-date-range-picker',
    'usa-date-range-picker__wrapper',
    'usa-date-range-picker__start-date',
    'usa-date-range-picker__end-date',
    'usa-date-range-picker__range-start',
    'usa-date-range-picker__range-end',
  ],
  'file-input': [
    'usa-file-input',
    'usa-file-input__target',
    'usa-file-input__instructions',
    'usa-file-input__box',
    'usa-file-input__drag-text',
    'usa-file-input__choose',
    'usa-file-input__accepted-files-message',
    'usa-file-input__preview',
    'usa-file-input__preview-heading',
    'usa-file-input__preview__heading',
    'usa-file-input__disabled-text',
  ],
  footer: [
    'usa-footer',
    'usa-footer__return-to-top',
    'usa-footer__primary-section',
    'usa-footer__secondary-section',
    'usa-footer__primary-container',
    'usa-footer__primary-content',
    'usa-footer__nav',
    'usa-footer__address',
    'usa-footer__logo',
    'usa-footer__logo-img',
    'usa-footer__logo-heading',
    'usa-footer__contact-info',
    'usa-footer__contact-links',
    'usa-footer__social-links',
  ],
  header: [
    'usa-header',
    'usa-header__logo',
    'usa-header__title',
    'usa-navbar',
    'usa-nav',
    'usa-nav__primary',
    'usa-nav__primary-item',
    'usa-nav__link',
    'usa-nav__submenu',
    'usa-nav__submenu-item',
    'usa-nav__close',
    'usa-menu-btn',
  ],
  icon: [
    'usa-icon',
    'usa-icon--size-3',
    'usa-icon--size-4',
    'usa-icon--size-5',
    'usa-icon--size-6',
    'usa-icon--size-7',
    'usa-icon--size-8',
    'usa-icon--size-9',
  ],
  identifier: [
    'usa-identifier',
    'usa-identifier__container',
    'usa-identifier__section',
    'usa-identifier__logo',
    'usa-identifier__logo-img',
    'usa-identifier__identity',
    'usa-identifier__identity-domain',
    'usa-identifier__identity-disclaimer',
    'usa-identifier__required-link',
    'usa-identifier__links',
    'usa-identifier__link',
  ],
  'in-page-navigation': [
    'usa-in-page-nav',
    'usa-in-page-nav__nav',
    'usa-in-page-nav__list',
    'usa-in-page-nav__item',
    'usa-in-page-nav__link',
    'usa-in-page-nav__link--current',
  ],
  'input-prefix-suffix': [
    'usa-input-prefix',
    'usa-input-suffix',
    'usa-input-group',
    'usa-input-group__addon',
  ],
  'language-selector': [
    'usa-language-selector',
    'usa-language-selector__button',
    'usa-language-selector__list',
    'usa-language-selector__list-item',
    'usa-language-selector__link',
  ],
  link: ['usa-link', 'usa-link--external', 'usa-link--alt'],
  list: ['usa-list', 'usa-list--unstyled'],
  'memorable-date': [
    'usa-memorable-date',
    'usa-memorable-date__day',
    'usa-memorable-date__month',
    'usa-memorable-date__year',
  ],
  // menu: Removed - component not implemented yet
  modal: [
    'usa-modal',
    'usa-modal__content',
    'usa-modal__main',
    'usa-modal__header',
    'usa-modal__heading',
    'usa-modal__footer',
    'usa-modal__close',
    'usa-modal--lg',
    'usa-modal-wrapper',
  ],
  pagination: [
    'usa-pagination',
    'usa-pagination__list',
    'usa-pagination__item',
    'usa-pagination__button',
    'usa-pagination__link',
    'usa-pagination__arrow',
    'usa-pagination__overflow',
  ],
  'process-list': [
    'usa-process-list',
    'usa-process-list__item',
    'usa-process-list__heading',
    'usa-process-list__description',
  ],
  prose: ['usa-prose'],
  radio: ['usa-radio', 'usa-radio__input', 'usa-radio__label', 'usa-radio__label-text'],
  'range-slider': ['usa-range', 'usa-range__thumb'],
  search: [
    'usa-search',
    'usa-search__input',
    'usa-search__submit-text',
    'usa-search__submit',
    'usa-search--small',
    'usa-search--big',
  ],
  // section: Removed - component not implemented yet
  select: [
    'usa-select',
    'usa-select--small',
    'usa-select--big',
    'usa-select--error',
    'usa-select--success',
  ],
  'side-navigation': ['usa-sidenav', 'usa-sidenav__item', 'usa-sidenav__sublist'],
  'site-alert': [
    'usa-site-alert',
    'usa-site-alert__body',
    'usa-site-alert__heading',
    'usa-site-alert__text',
    'usa-site-alert--emergency',
    'usa-site-alert--info',
    'usa-site-alert--no-icon',
    'usa-site-alert--slim',
  ],
  'skip-link': ['usa-skipnav', 'usa-skipnav__list', 'usa-skipnav__item', 'usa-skipnav__link'],
  'step-indicator': [
    'usa-step-indicator',
    'usa-step-indicator__segments',
    'usa-step-indicator__segment',
    'usa-step-indicator__segment-label',
    'usa-step-indicator__segment--complete',
    'usa-step-indicator__segment--current',
    'usa-step-indicator__header',
    'usa-step-indicator__heading',
    'usa-step-indicator__heading-counter',
    'usa-step-indicator__current-step',
    'usa-step-indicator__total-steps',
    'usa-step-indicator__heading-text',
    'usa-step-indicator--counters',
    'usa-step-indicator--center',
    'usa-step-indicator--small',
    'usa-step-indicator--no-labels',
  ],
  'summary-box': [
    'usa-summary-box',
    'usa-summary-box__body',
    'usa-summary-box__heading',
    'usa-summary-box__text',
    'usa-summary-box__link',
  ],
  table: [
    'usa-table',
    'usa-table__head',
    'usa-table__body',
    'usa-table__header__button',
    'usa-table--borderless',
    'usa-table--compact',
    'usa-table--striped',
    'usa-table--sortable',
  ],
  tag: ['usa-tag', 'usa-tag--big'],
  'text-input': [
    'usa-input',
    'usa-input--small',
    'usa-input--medium',
    'usa-input--big',
    'usa-input--error',
    'usa-input--success',
  ],
  textarea: [
    'usa-textarea',
    'usa-textarea--small',
    'usa-textarea--big',
    'usa-textarea--error',
    'usa-textarea--success',
  ],
  'time-picker': ['usa-time-picker', 'usa-time-picker__filter'],
  tooltip: [
    'usa-tooltip',
    'usa-tooltip__body',
    'usa-tooltip--top',
    'usa-tooltip--bottom',
    'usa-tooltip--left',
    'usa-tooltip--right',
  ],
  validation: ['usa-error-message', 'usa-hint'],
};

// Core USWDS classes that should be included with every component
const coreClasses = [
  // Accessibility
  'usa-sr-only',
  'usa-focus',
  'usa-current',
  'usa-skipnav',

  // Grid system (commonly used)
  'grid-row',
  'grid-col',
  'grid-col-auto',
  'grid-col-fill',
  'grid-col-1',
  'grid-col-2',
  'grid-col-3',
  'grid-col-4',
  'grid-col-5',
  'grid-col-6',
  'grid-col-7',
  'grid-col-8',
  'grid-col-9',
  'grid-col-10',
  'grid-col-11',
  'grid-col-12',
  'tablet:grid-col-6',
  'tablet:grid-col-4',
  'desktop:grid-col-4',
  'desktop:grid-col-6',
  'desktop:grid-col-8',

  // Media block (used by many components)
  'usa-media-block',
  'usa-media-block__img',
  'usa-media-block__body',

  // Form elements (shared across form components)
  'usa-form-group',
  'usa-fieldset',
  'usa-legend',
  'usa-label',
  'usa-hint',
  'usa-error-message',

  // Common utility classes
  'usa-layout-docs',
  'usa-layout-docs__main',
  'usa-layout-docs__sidenav',

  // Typography utilities
  'usa-prose',
  'usa-intro',

  // Button utilities (used across components)
  'usa-button-group',
  'usa-button-group__item',
];

/**
 * Extract CSS rules that match the given selectors
 */
function extractCssRules(css, classesToInclude) {
  const ast = postcss.parse(css);
  const extractedRules = [];
  const includedSelectors = new Set();

  // Create a comprehensive selector pattern
  const classPattern = classesToInclude
    .map((cls) => cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  const selectorRegex = new RegExp(`\\.(${classPattern})(?:[:\\s,>+~]|$)`, 'g');

  ast.walkRules((rule) => {
    // Check if any selector in the rule matches our classes
    const shouldInclude = rule.selectors.some((selector) => {
      return (
        selectorRegex.test(selector) ||
        // Include pseudo-states and modifiers
        classesToInclude.some(
          (cls) =>
            selector.includes(`.${cls}:`) ||
            selector.includes(`.${cls}[`) ||
            selector.includes(`.${cls}.`) ||
            selector === `.${cls}`
        )
      );
    });

    if (shouldInclude) {
      rule.selectors.forEach((sel) => includedSelectors.add(sel));
      extractedRules.push(rule.clone());
    }
  });

  // Also include @media queries that contain our classes
  ast.walkAtRules((rule) => {
    if (rule.name === 'media' || rule.name === 'supports') {
      const hasMatchingRules = rule.nodes?.some((node) => {
        if (node.type === 'rule') {
          return node.selectors.some((selector) =>
            classesToInclude.some((cls) => selector.includes(`.${cls}`))
          );
        }
        return false;
      });

      if (hasMatchingRules) {
        extractedRules.push(rule.clone());
      }
    }
  });

  return {
    rules: extractedRules,
    includedSelectors: Array.from(includedSelectors),
    count: extractedRules.length,
  };
}

/**
 * Process a single component
 */
async function processComponent(componentName, fullCss) {
  const componentClasses = componentCssMap[componentName];
  if (!componentClasses) {
    console.warn(`⚠️  No CSS class mapping found for component: ${componentName}`);
    return { success: false, reason: 'No class mapping' };
  }

  try {
    // Combine component-specific classes with core classes
    const allClasses = [...componentClasses, ...coreClasses];

    // Extract CSS rules
    const extracted = extractCssRules(fullCss, allClasses);

    // Create new CSS from extracted rules
    const newAst = postcss.root();
    extracted.rules.forEach((rule) => newAst.append(rule));

    const extractedCss = newAst.toString();

    // Write files
    const componentDir = join('src/components', componentName);
    const cssPath = join(componentDir, `${componentName}.css`);
    const tsImportPath = join(componentDir, `${componentName}-styles.ts`);

    await writeFile(cssPath, extractedCss);

    const tsImport = `// Tree-shaken CSS import for ${componentName}
// Extracted from USWDS CSS - includes only relevant classes
import './${componentName}.css';
`;
    await writeFile(tsImportPath, tsImport);

    console.log(
      `✅ ${componentName}: extracted ${extracted.count} CSS rules (${(extractedCss.length / 1024).toFixed(1)}KB)`
    );

    return {
      success: true,
      componentName,
      rulesCount: extracted.count,
      cssSize: extractedCss.length,
      includedSelectors: extracted.includedSelectors.length,
    };
  } catch (error) {
    console.error(`❌ Error processing component ${componentName}:`, error.message);
    return { success: false, reason: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 Starting CSS Tree-Shaking via Extraction...\n');

  try {
    // Read the full USWDS CSS
    const fullCssPath = join('node_modules/@uswds/uswds/dist/css/uswds.css');
    console.log('📖 Reading full USWDS CSS...');
    const fullCss = await readFile(fullCssPath, 'utf8');
    console.log(`📦 Full USWDS CSS: ${(fullCss.length / 1024 / 1024).toFixed(2)}MB\n`);

    // Process components that we have mappings for
    const componentsToProcess = Object.keys(componentCssMap);
    console.log(`🔨 Processing ${componentsToProcess.length} components...\n`);

    const results = [];
    let totalExtractedSize = 0;

    for (const componentName of componentsToProcess) {
      const result = await processComponent(componentName, fullCss);
      results.push(result);

      if (result.success) {
        totalExtractedSize += result.cssSize;
      }
    }

    // Calculate results
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;
    const originalSize = fullCss.length * successCount; // Worst case
    const savings = originalSize - totalExtractedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

    console.log('\n📊 CSS Tree-Shaking Results:');
    console.log('─'.repeat(50));
    console.log(`✅ Successfully processed: ${successCount} components`);
    console.log(`❌ Failed: ${failCount} components`);
    console.log(`📏 Original size estimate: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`📦 Tree-shaken size: ${(totalExtractedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(
      `💾 Estimated savings: ${(savings / 1024 / 1024).toFixed(2)}MB (${savingsPercent}%)`
    );

    if (failCount > 0) {
      console.log('\n❌ Failed components:');
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`   • ${r.componentName || 'Unknown'}: ${r.reason}`);
        });
    }

    console.log('\n🎉 CSS Tree-Shaking extraction complete!');
  } catch (error) {
    console.error('💥 Build failed:', error.message);
    process.exit(1);
  }
}

// Check if we need to install postcss
try {
  await import('postcss');
} catch (error) {
  console.error('❌ PostCSS not found. Please install it: npm install postcss');
  process.exit(1);
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
