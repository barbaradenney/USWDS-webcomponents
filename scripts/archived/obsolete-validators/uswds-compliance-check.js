#!/usr/bin/env node

/**
 * USWDS Compliance Validation Script
 *
 * This script validates that components adhere to USWDS specifications:
 * - CSS classes use only official USWDS classes
 * - HTML structure matches USWDS documentation
 * - Components include proper USWDS reference documentation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// USWDS official HTML structures for components
// These define the expected DOM structure for each component type
const USWDS_COMPONENT_STRUCTURES = {
  'side-navigation': {
    container: 'nav',
    mainList: 'ul.usa-sidenav',
    item: 'li.usa-sidenav__item',
    sublist: 'ul.usa-sidenav__sublist',
    link: 'a',
    currentClass: 'usa-current',
  },
  breadcrumb: {
    container: 'nav.usa-breadcrumb',
    mainList: 'ol.usa-breadcrumb__list',
    item: 'li.usa-breadcrumb__list-item',
    link: 'a.usa-breadcrumb__link',
    currentClass: 'usa-current',
  },
  'in-page-navigation': {
    container: 'nav.usa-in-page-nav',
    mainList: 'ul.usa-in-page-nav__list',
    item: 'li.usa-in-page-nav__item',
    link: 'a',
    currentClass: 'usa-in-page-nav__link--current',
  },
  accordion: {
    container: '.usa-accordion',
    heading: '.usa-accordion__heading',
    button: '.usa-accordion__button',
    content: '.usa-accordion__content',
  },
  alert: {
    container: '.usa-alert',
    body: '.usa-alert__body',
    heading: '.usa-alert__heading',
    text: '.usa-alert__text',
  },
  button: {
    element: 'button.usa-button',
    variants: ['usa-button--primary', 'usa-button--secondary', 'usa-button--outline'],
  },
  card: {
    container: '.usa-card',
    body: '.usa-card__body',
    heading: '.usa-card__heading',
    media: '.usa-card__img',
  },
};

// USWDS official CSS classes (subset for validation)
const OFFICIAL_USWDS_CLASSES = new Set([
  // Layout
  'grid-container',
  'grid-row',
  'grid-col',
  'grid-col-auto',
  'grid-col-fill',
  'grid-gap',
  'grid-gap-lg',
  'desktop:grid-col-6',
  'tablet:grid-col-6',

  // Typography
  'usa-prose',
  'usa-sr-only',

  // Components (common patterns)
  'usa-accordion',
  'usa-accordion__heading',
  'usa-accordion__button',
  'usa-accordion__content',
  'usa-alert',
  'usa-banner',
  'usa-banner__header',
  'usa-banner__content',
  'usa-banner__button',
  'usa-breadcrumb',
  'usa-button',
  'usa-card',
  'usa-checkbox',
  'usa-combo-box',
  'usa-date-picker',
  'usa-dropdown',
  'usa-file-input',
  'usa-footer',
  'usa-form-group',
  'usa-header',
  'usa-icon',
  'usa-input',
  'usa-label',
  'usa-link',
  'usa-list',
  'usa-modal',
  'usa-nav',
  'usa-pagination',
  'usa-radio',
  'usa-search',
  'usa-select',
  'usa-table',
  'usa-tag',
  'usa-textarea',
  'usa-tooltip',
  'icon-lock',
  'usa-banner__lock-image',

  // Modifiers (common patterns)
  'usa-button--primary',
  'usa-button--secondary',
  'usa-button--accent-cool',
  'usa-accordion--bordered',
  'usa-accordion--multiselectable',
  'usa-banner__header--expanded',
  'usa-combo-box--enhanced',
  'usa-form-group--error',
  'usa-input--error',
  'usa-label--required',

  // States
  'usa-current',
  'usa-disabled',
  'usa-error-message',
  'usa-hint',

  // Media
  'usa-media-block',
  'usa-media-block__img',
  'usa-media-block__body',
]);

// Known custom classes that are allowed (host styles only) - reserved for future use
// const ALLOWED_CUSTOM_PATTERNS = [
//   /^:host/,
//   /^\.usa-[\w-]+$/  // Must start with usa-
// ];

class USWDSComplianceChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.componentsChecked = 0;
    this.componentsPath = path.join(__dirname, '..', 'src', 'components');
    this.actualUSWDSClasses = this.loadActualUSWDSClasses();
  }

  /**
   * Load actual USWDS classes from compiled CSS file
   */
  loadActualUSWDSClasses() {
    try {
      // Use pre-extracted classes file if it exists, otherwise extract from CSS
      const classesFile = '/tmp/uswds_classes.txt';

      if (fs.existsSync(classesFile)) {
        const classesContent = fs.readFileSync(classesFile, 'utf8');
        const classes = new Set(
          classesContent
            .split('\n')
            .filter((line) => line.trim())
            .map((line) => line.substring(1)) // Remove the dot
        );
        console.log(`💡 Loaded ${classes.size} actual USWDS classes from pre-extracted file`);
        return classes;
      }

      // Fallback to extracting from CSS
      const cssPath = path.join(__dirname, '..', 'src', 'styles', 'styles.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      // Extract all .usa-* classes (but not CSS custom properties)
      const classMatches =
        cssContent.match(
          /(?<![:\w])\.usa-[a-zA-Z0-9_-]+(?:__[a-zA-Z0-9_-]+)*(?:--[a-zA-Z0-9_-]+)*/g
        ) || [];
      const classes = new Set(classMatches.map((match) => match.substring(1))); // Remove the dot

      console.log(`💡 Loaded ${classes.size} actual USWDS classes from compiled CSS`);
      return classes;
    } catch (error) {
      console.warn('⚠️ Could not load USWDS classes from CSS file:', error.message);
      return new Set();
    }
  }

  /**
   * Main validation entry point
   */
  async validate() {
    console.log('🔍 USWDS Compliance Validation Starting...\n');

    try {
      const componentDirs = fs
        .readdirSync(this.componentsPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      for (const componentName of componentDirs) {
        await this.validateComponent(componentName);
      }

      this.printResults();

      // Exit with error code if there are errors
      process.exit(this.errors.length > 0 ? 1 : 0);
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Validate a single component
   */
  async validateComponent(componentName) {
    const componentPath = path.join(this.componentsPath, componentName);
    const tsFile = path.join(componentPath, `usa-${componentName}.ts`);

    if (!fs.existsSync(tsFile)) {
      this.warnings.push(
        `⚠️  Component ${componentName}: TypeScript file not found at expected location`
      );
      return;
    }

    console.log(`🔎 Validating ${componentName}...`);
    this.componentsChecked++;

    const content = fs.readFileSync(tsFile, 'utf8');

    // Check USWDS reference documentation
    this.validateDocumentation(componentName, content);

    // Check CSS class usage
    this.validateCSSClasses(componentName, content);

    // Check for custom styles
    this.validateCustomStyles(componentName, content);

    // Check for inline styles (strict rule)
    this.validateInlineStyles(componentName, content);

    // Check imports
    this.validateImports(componentName, content);

    // Check HTML structure matches USWDS patterns
    this.validateHTMLStructure(componentName, content);

    // NEW: Enhanced validation checks for visual compliance
    this.validateIconCompliance(componentName, content);
    this.validateCSSOverrides(componentName, content);
    this.validateUSWDSIntegration(componentName, content);
    this.validateAccessibilityCompliance(componentName, content);
  }

  /**
   * Validate component documentation includes USWDS references
   */
  validateDocumentation(componentName, content) {
    const hasUSWDSReference =
      content.includes('designsystem.digital.gov') ||
      content.includes('USWDS') ||
      content.includes('U.S. Web Design System');

    if (!hasUSWDSReference) {
      this.errors.push(`❌ ${componentName}: Missing USWDS reference documentation`);
    }

    // Check for JSDoc tags that indicate compliance documentation
    const hasComplianceJSDoc =
      content.includes('@uswds-docs') ||
      content.includes('@uswds-css-reference') ||
      content.includes('@uswds-js-reference') ||
      content.includes('@uswds-guidance') ||
      content.includes('@uswds-accessibility');

    // Check for inline compliance comments
    const hasComplianceDoc =
      content.includes('Compliance') ||
      content.includes('USWDS Version') ||
      content.includes('Last Synced') ||
      hasComplianceJSDoc;

    // Only warn if component lacks both JSDoc tags and inline compliance notes
    if (!hasComplianceDoc && !hasComplianceJSDoc) {
      this.warnings.push(
        `⚠️  ${componentName}: Consider adding @uswds-* JSDoc tags for compliance documentation`
      );
    }
  }

  /**
   * Validate CSS classes are official USWDS classes
   */
  validateCSSClasses(componentName, content) {
    // Extract class assignments (simplified pattern matching)
    const classMatches = content.match(/class=['"`]([^'"`${}]+)['"`]/g) || [];

    for (const match of classMatches) {
      const classString = match.match(/['"`]([^'"`]+)['"`]/)?.[1] || '';

      // Skip template strings and interpolation
      if (classString.includes('${') || classString.includes('?') || classString.includes('===')) {
        continue;
      }

      const classes = classString.split(/\s+/).filter(Boolean);

      for (const cssClass of classes) {
        if (!this.isValidUSWDSClass(cssClass)) {
          this.errors.push(`❌ ${componentName}: Non-USWDS class detected: "${cssClass}"`);
        }
      }
    }
  }

  /**
   * Check if a CSS class is valid USWDS or allowed pattern
   */
  isValidUSWDSClass(cssClass) {
    // Check against actual USWDS classes from compiled CSS
    if (this.actualUSWDSClasses.has(cssClass)) {
      return true;
    }

    // Check grid system classes
    if (cssClass.match(/^(grid-|desktop:|tablet:|mobile:)/)) {
      return true;
    }

    // Check utility classes
    if (
      cssClass.match(
        /^(margin-|padding-|text-|display-|position-|flex-|width-|height-|border-|bg-|color-)/
      )
    ) {
      return true;
    }

    // Template interpolation variables (OK in templates)
    if (cssClass.includes('${') || cssClass.includes('?') || cssClass.includes('===')) {
      return true;
    }

    // Check fallback USWDS classes (in case CSS loading failed)
    if (OFFICIAL_USWDS_CLASSES.has(cssClass)) {
      return true;
    }

    // Allow functional extension classes for component functionality
    const functionalClasses = new Set([
      'usa-character-count__field', // Character count field wrapper
      'usa-date-range-picker__summary', // Date range picker summary display
      'usa-file-input__drag-text', // File input drag and drop text
      'usa-language--unstyled', // Language selector unstyled variant
      'usa-step-indicator__heading-counter', // Step indicator counter display
      'usa-step-indicator__heading-text', // Step indicator text display
      'usa-table__announcement-region', // Table accessibility announcements
      'usa-table__header--sortable', // Table sortable header with cursor pointer
      'usa-table-virtual-container', // Table virtualization container
      'usa-collection__virtual-container', // Collection virtualization container
      'usa-tooltip__body--positioned-top', // Tooltip positioning classes
      'usa-tooltip__body--positioned-bottom',
      'usa-tooltip__body--positioned-left',
      'usa-tooltip__body--positioned-right',
    ]);

    if (functionalClasses.has(cssClass)) {
      return true;
    }

    return false;
  }

  /**
   * Validate custom styles are minimal (host styles only)
   */
  validateCustomStyles(componentName, content) {
    const styleMatch = content.match(/static\s+override\s+styles\s*=\s*css`([^`]+)`/s);

    if (!styleMatch) return;

    const styles = styleMatch[1];
    const lines = styles
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    // Essential host display styles that are allowed for web components
    const essentialHostStyles = [
      'display: block;',
      'display: inline-block;',
      'display: inline;',
      'display: none;',
      'display: flex;',
      'display: grid;',
    ];

    // Check for non-host styles
    for (const line of lines) {
      // Skip empty lines, braces, host selectors, and comments
      if (
        line.startsWith(':host') ||
        line.match(/^\s*[{}]\s*$/) ||
        line === '' ||
        line.trim().startsWith('/*') ||
        line.trim().startsWith('*') ||
        line.trim().endsWith('*/')
      ) {
        continue;
      }

      // Skip essential display styles that are required for web components
      if (essentialHostStyles.includes(line)) {
        continue;
      }

      // Check if this CSS is documented as functional
      const isFunctionalCSS = this.isDocumentedFunctionalCSS(styles, line);

      if (isFunctionalCSS) {
        // Informational message for documented functional CSS
        this.info = this.info || [];
        this.info.push(`ℹ️  ${componentName}: Documented functional CSS: "${line}"`);
      } else {
        // Warn about undocumented custom CSS
        this.warnings.push(
          `⚠️  ${componentName}: Custom CSS detected (should use USWDS classes): "${line}"`
        );
      }
    }

    // Check if component has more than just display styles
    const nonDisplayLines = lines.filter((line) => {
      return (
        !line.startsWith(':host') &&
        !line.match(/^\s*[{}]\s*$/) &&
        line !== '' &&
        !essentialHostStyles.includes(line)
      );
    });

    if (nonDisplayLines.length > 0) {
      // Only warn if there are actual custom styles beyond display
      this.warnings.push(
        `⚠️  ${componentName}: Component has ${nonDisplayLines.length} custom CSS rules beyond essential display styles`
      );
    }
  }

  /**
   * Validate that no inline styles are used (strict rule)
   */
  validateInlineStyles(componentName, content) {
    // Check for style= attributes in template literals
    const styleAttributeMatches = content.match(/style\s*=\s*["'][^"']*["']/g) || [];

    // Filter out acceptable cases (test files, etc.)
    const problematicStyles = styleAttributeMatches.filter((match) => {
      // Allow screen reader positioning (accessibility requirement)
      if (match.includes('position: absolute') && match.includes('left: -9999px')) {
        return false;
      }
      return true;
    });

    if (problematicStyles.length > 0) {
      this.errors.push(
        `❌ ${componentName}: HARD RULE VIOLATION - Inline styles detected: ${problematicStyles.join(', ')}`
      );
    }

    // Check for .style. property assignments
    const stylePropertyMatches = content.match(/\.style\.[a-zA-Z]+\s*=\s*[^;]+/g) || [];

    // Filter out acceptable cases (modal body overflow, etc.)
    const problematicPropertyAssignments = stylePropertyMatches.filter((match) => {
      // Allow document.body.style.overflow for modal functionality
      if (match.includes('document.body.style.overflow')) {
        return false;
      }
      // Allow document.documentElement.style.scrollBehavior for smooth scrolling
      if (match.includes('document.documentElement.style.scrollBehavior')) {
        return false;
      }
      return true;
    });

    if (problematicPropertyAssignments.length > 0) {
      this.errors.push(
        `❌ ${componentName}: HARD RULE VIOLATION - Direct style property assignments detected: ${problematicPropertyAssignments.join(', ')}`
      );
    }
  }

  isDocumentedFunctionalCSS(styles, cssLine) {
    // Look for documentation comments before the CSS rule
    const lines = styles.split('\n');
    const lineIndex = lines.findIndex((line) => line.includes(cssLine));

    if (lineIndex === -1) return false;

    // Look for functional CSS documentation patterns in preceding lines
    const precedingLines = lines.slice(Math.max(0, lineIndex - 10), lineIndex);
    const documentationPatterns = [
      /FUNCTIONAL CSS:/i,
      /JUSTIFICATION:/i,
      /ALTERNATIVE CHECKED:/i,
      /PURPOSE:/i,
      /Required for/i,
      /Enable.*performance/i,
      /Virtual.*scrolling/i,
      /positioning/i,
      /Essential.*functionality/i,
    ];

    return precedingLines.some((line) =>
      documentationPatterns.some((pattern) => pattern.test(line))
    );
  }

  /**
   * Validate proper imports
   */
  validateImports(componentName, content) {
    // Check for required USWDS CSS import
    if (!content.includes("import '../../styles/styles.css'")) {
      this.errors.push(`❌ ${componentName}: Missing required USWDS styles import`);
    }

    // Check for proper Lit imports - more flexible check
    const hasLitImport =
      content.includes("from 'lit'") &&
      (content.includes('import { html') ||
        content.includes('import { css') ||
        content.includes('import { LitElement'));

    if (!hasLitImport) {
      this.errors.push(`❌ ${componentName}: Missing required Lit imports`);
    }
  }

  /**
   * Validate HTML structure matches USWDS patterns
   */
  validateHTMLStructure(componentName, content) {
    const structure = USWDS_COMPONENT_STRUCTURES[componentName];
    if (!structure) {
      // Component doesn't have defined structure expectations
      return;
    }

    // Check for common structural issues
    if (componentName === 'side-navigation') {
      // Check for incorrect usa-sidenav__list class
      if (content.includes('usa-sidenav__list')) {
        this.errors.push(
          `❌ ${componentName}: Using incorrect class 'usa-sidenav__list'. Main list should use 'usa-sidenav' class`
        );
      }
    }

    if (componentName === 'breadcrumb') {
      // Breadcrumb should use <ol> not <ul>
      if (content.includes('<ul class="usa-breadcrumb__list"')) {
        this.errors.push(
          `❌ ${componentName}: Breadcrumb should use <ol> for ordered list, not <ul>`
        );
      }
    }

    // Check for proper list item structure
    if (structure.item && structure.mainList) {
      const listClass = structure.mainList.split('.')[1];
      const itemClass = structure.item.split('.')[1];

      // Verify items are properly nested
      // Support both exact matches and template literal patterns
      const hasListClass =
        content.includes(`class="${listClass}"`) ||
        content.includes(`class="usa-breadcrumb__list"`) ||
        content.includes(`class="usa-in-page-nav__list"`) ||
        content.includes(`class="usa-sidenav"`);

      const hasItemClass =
        content.includes(`class="${itemClass}"`) ||
        content.includes(`class="usa-breadcrumb__list-item `) ||
        content.includes(`class="usa-in-page-nav__item`) ||
        content.includes(`class="usa-sidenav__item"`) ||
        content.includes(`itemClasses = 'usa-sidenav__item'`);

      const hasProperNesting = hasListClass && hasItemClass;

      if (!hasProperNesting && content.includes('render()')) {
        this.warnings.push(
          `⚠️  ${componentName}: Verify component uses correct USWDS structure: ${structure.mainList} > ${structure.item}`
        );
      }
    }
  }

  /**
   * Validate icon compliance - detect custom inline SVGs and verify USWDS icon usage
   */
  validateIconCompliance(componentName, content) {
    // Detect custom inline SVG data URLs (CRITICAL ISSUE)
    const inlineSvgPattern = /src="data:image\/svg\+xml[^"]*"/g;
    const inlineSvgMatches = content.match(inlineSvgPattern);

    if (inlineSvgMatches) {
      inlineSvgMatches.forEach((match) => {
        this.errors.push(
          `❌ ${componentName}: Custom inline SVG detected - use USWDS icons via CSS background-image: ${match.substring(0, 50)}...`
        );
      });
    }

    // Detect custom <img> elements with SVG (should use CSS icons)
    const imgSvgPattern = /<img[^>]+class="usa-icon"[^>]+src="[^"]*svg[^"]*"/g;
    const imgSvgMatches = content.match(imgSvgPattern);

    if (imgSvgMatches) {
      imgSvgMatches.forEach((match) => {
        this.errors.push(
          `❌ ${componentName}: Custom icon img element detected - use USWDS CSS background-image approach: ${match.substring(0, 80)}...`
        );
      });
    }

    // Check for proper USWDS icon button pattern (no content, icon via CSS)
    const iconButtonPattern = /<button[^>]+class="[^"]*usa-[^"]*button[^"]*"[^>]*>[^<]*<img/g;
    const iconButtonMatches = content.match(iconButtonPattern);

    if (iconButtonMatches) {
      iconButtonMatches.forEach((_match) => {
        this.warnings.push(
          `⚠️  ${componentName}: Icon button with img content - USWDS pattern uses empty button with CSS background-image`
        );
      });
    }

    // Verify USWDS icon classes are used correctly
    const uswdsIconPattern = /class="[^"]*usa-icon[^"]*"/g;
    const uswdsIconMatches = content.match(uswdsIconPattern);

    if (uswdsIconMatches) {
      // Check if these are being used with img elements (incorrect pattern)
      uswdsIconMatches.forEach((match) => {
        const context = content.substring(
          content.indexOf(match) - 50,
          content.indexOf(match) + match.length + 100
        );
        if (context.includes('<img')) {
          this.warnings.push(
            `⚠️  ${componentName}: usa-icon class used with img element - USWDS pattern uses CSS sprites or background-image`
          );
        }
      });
    }
  }

  /**
   * Validate CSS compliance - detect non-USWDS style overrides
   */
  validateCSSOverrides(componentName, content) {
    // Detect color overrides (should use USWDS design tokens)
    const colorOverridePattern =
      /(color|background-color|border-color):\s*#[0-9a-fA-F]{3,6}[^;]*;/g;
    const colorMatches = content.match(colorOverridePattern);

    if (colorMatches) {
      colorMatches.forEach((match) => {
        // Skip if it's in a :host selector (allowed for display styles)
        const beforeMatch = content.substring(0, content.indexOf(match));
        const isInHostSelector = beforeMatch.lastIndexOf(':host') > beforeMatch.lastIndexOf('}');

        if (!isInHostSelector) {
          this.warnings.push(
            `⚠️  ${componentName}: Custom color detected - use USWDS design tokens: ${match.trim()}`
          );
        }
      });
    }

    // Detect spacing overrides (should use USWDS spacing)
    const spacingOverridePattern = /(margin|padding):\s*[0-9]+[a-z]*[^;]*;/g;
    const spacingMatches = content.match(spacingOverridePattern);

    if (spacingMatches) {
      spacingMatches.forEach((match) => {
        const beforeMatch = content.substring(0, content.indexOf(match));
        const isInHostSelector = beforeMatch.lastIndexOf(':host') > beforeMatch.lastIndexOf('}');

        if (!isInHostSelector) {
          this.warnings.push(
            `⚠️  ${componentName}: Custom spacing detected - use USWDS utility classes: ${match.trim()}`
          );
        }
      });
    }

    // Detect font/typography overrides
    const typographyOverridePattern = /(font-size|font-weight|line-height|font-family):\s*[^;]+;/g;
    const typographyMatches = content.match(typographyOverridePattern);

    if (typographyMatches) {
      typographyMatches.forEach((match) => {
        const beforeMatch = content.substring(0, content.indexOf(match));
        const isInHostSelector = beforeMatch.lastIndexOf(':host') > beforeMatch.lastIndexOf('}');

        if (!isInHostSelector) {
          this.warnings.push(
            `⚠️  ${componentName}: Custom typography detected - use USWDS typography classes: ${match.trim()}`
          );
        }
      });
    }
  }

  /**
   * Validate USWDS JavaScript integration patterns
   */
  validateUSWDSIntegration(componentName, content) {
    // Check for proper USWDS initialization patterns
    const uswdsInitPattern = /USWDS\.init|uswds\.init|\.on\(this\)|\.off\(this\)/g;
    const hasUSWDSInit = content.match(uswdsInitPattern);

    // Components that should integrate with USWDS JavaScript
    const jsIntegrationComponents = [
      'date-picker',
      'combo-box',
      'file-input',
      'banner',
      'modal',
      'character-count',
      'accordion',
      'navigation',
    ];

    if (jsIntegrationComponents.includes(componentName) && !hasUSWDSInit) {
      this.warnings.push(
        `⚠️  ${componentName}: Missing USWDS JavaScript integration - consider progressive enhancement`
      );
    }

    // Check for progressive enhancement patterns
    const progressiveEnhancementPattern =
      /progressive.*enhancement|enhance.*uswds|fallback.*implementation/gi;
    const hasProgressiveEnhancement = content.match(progressiveEnhancementPattern);

    if (jsIntegrationComponents.includes(componentName) && !hasProgressiveEnhancement) {
      this.warnings.push(
        `⚠️  ${componentName}: Consider implementing progressive enhancement with USWDS JavaScript`
      );
    }
  }

  /**
   * Validate accessibility compliance with USWDS standards
   */
  validateAccessibilityCompliance(componentName, content) {
    // Check for proper ARIA attributes required by USWDS
    const ariaRequirements = {
      modal: ['aria-modal', 'aria-labelledby', 'role="dialog"'],
      'date-picker': ['aria-haspopup', 'aria-controls'],
      'combo-box': ['aria-expanded', 'aria-autocomplete', 'role="combobox"'],
      accordion: ['aria-expanded', 'aria-controls'],
      banner: ['aria-expanded'],
      tab: ['role="tablist"', 'aria-selected'],
      menu: ['role="menu"', 'aria-expanded'],
    };

    const requiredAria = ariaRequirements[componentName];
    if (requiredAria) {
      requiredAria.forEach((ariaAttribute) => {
        if (!content.includes(ariaAttribute)) {
          this.warnings.push(
            `⚠️  ${componentName}: Missing required ARIA attribute for USWDS compliance: ${ariaAttribute}`
          );
        }
      });
    }

    // Check for keyboard navigation support
    const keyboardPatterns = ['keydown', 'keyup', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'Tab'];
    const interactiveComponents = ['modal', 'date-picker', 'combo-box', 'accordion', 'menu', 'tab'];

    if (interactiveComponents.includes(componentName)) {
      const hasKeyboardSupport = keyboardPatterns.some((pattern) => content.includes(pattern));
      if (!hasKeyboardSupport) {
        this.warnings.push(
          `⚠️  ${componentName}: Missing keyboard navigation support required by USWDS accessibility standards`
        );
      }
    }
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 USWDS COMPLIANCE VALIDATION RESULTS');
    console.log('='.repeat(60));

    console.log(`\n📈 Summary:`);
    console.log(`   Components Checked: ${this.componentsChecked}`);
    console.log(`   Errors: ${this.errors.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORS (${this.errors.length}):`);
      this.errors.forEach((error) => console.log(`   ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
      this.warnings.forEach((warning) => console.log(`   ${warning}`));
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ All components pass USWDS compliance validation!');
    } else if (this.errors.length === 0) {
      console.log('\n✅ No compliance errors found. Review warnings for improvements.');
    } else {
      console.log('\n❌ Compliance errors found. Please fix before proceeding.');
    }

    console.log('\n💡 For detailed compliance guidelines, see:');
    console.log('   docs/USWDS_COMPLIANCE_GUIDE.md');
    console.log('   docs/COMPONENT_COMPLIANCE_MATRIX.md');
    console.log('');
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new USWDSComplianceChecker();
  checker.validate();
}

export default USWDSComplianceChecker;
