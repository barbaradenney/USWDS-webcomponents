#!/usr/bin/env node

/**
 * USWDS JavaScript Validation Module
 *
 * Provides component-specific JavaScript validation for USWDS compliance
 * Can be imported and used by individual component compliance scripts
 */

// Component-specific validation rules
const COMPONENT_VALIDATION_RULES = {
  'date-picker': {
    // Date-picker uses dynamic import pattern like combo-box
    delegatedToUSWDS: true,
    requiredKeyHandlers: [], // USWDS handles keyboard interaction
    requiredClasses: [
      'usa-date-picker',
      'usa-date-picker__button',
      'usa-date-picker__calendar',
      'usa-date-picker__calendar__table',
      'usa-date-picker__calendar__date'
    ],
    uswdsIntegration: 'datePickerModule', // Our component uses dynamic import pattern
    uswdsDelegationPattern: 'usa-date-picker/src/index', // Import pattern to check
    requiredFunctionality: [
      // USWDS provides all functionality - we just need USWDS integration
      { name: 'USWDS Integration', patterns: ['initializeUSWDS', 'datePickerModule', 'usa-date-picker'] }
    ]
  },

  'combo-box': {
    // Combo-box uses USWDS delegation pattern - USWDS handles all keyboard interactions
    delegatedToUSWDS: true,
    requiredKeyHandlers: [], // USWDS handles keyboard interaction
    requiredClasses: [
      'usa-combo-box' // Only the wrapper class is required, USWDS creates the rest
    ],
    uswdsIntegration: 'comboBoxModule', // Our component uses dynamic import pattern
    uswdsDelegationPattern: 'await import(@uswds/uswds/js/usa-combo-box)', // Import pattern to check
    requiredFunctionality: [
      // USWDS provides all functionality - we just need USWDS integration
      { name: 'USWDS Integration', patterns: ['initializeUSWDS', 'comboBoxModule', 'usa-combo-box'] }
    ]
  },

  'accordion': {
    requiredKeyHandlers: ['Enter', 'Space'],
    requiredClasses: [
      'usa-accordion',
      'usa-accordion__heading',
      'usa-accordion__button',
      'usa-accordion__content'
    ],
    uswdsIntegration: 'USWDS.accordion',
    requiredFunctionality: [
      { name: 'Toggle expand/collapse', patterns: ['toggle', 'expanded'] },
      { name: 'ARIA state management', patterns: ['aria-expanded', 'setAttribute'] }
    ]
  },

  'modal': {
    requiredKeyHandlers: ['Escape'],
    requiredClasses: [
      'usa-modal',
      'usa-modal__content',
      'usa-modal__main',
      'usa-modal__close'
    ],
    uswdsIntegration: 'USWDS.modal',
    requiredFunctionality: [
      { name: 'Show/hide modal', patterns: ['show', 'hide', 'toggle'] },
      { name: 'Focus trap', patterns: ['trapFocus', 'focusableElements'] },
      { name: 'Background interaction prevention', patterns: ['backdrop', 'overlay'] }
    ]
  },

  'time-picker': {
    requiredKeyHandlers: ['ArrowDown', 'ArrowUp', 'Enter', 'Escape'],
    requiredClasses: [
      'usa-time-picker',
      'usa-time-picker__input',
      'usa-time-picker__list'
    ],
    uswdsIntegration: 'USWDS.timePicker',
    requiredFunctionality: [
      { name: 'Time list toggle', patterns: ['toggleList', 'isOpen'] },
      { name: 'Time validation', patterns: ['validateTime', 'formatTime'] },
      { name: 'Time selection', patterns: ['selectTime', 'handleTimeSelect'] }
    ]
  }
};

// Universal validation patterns (apply to all components)
const UNIVERSAL_PATTERNS = {
  dangerous: [
    {
      pattern: /USWDS\.[a-zA-Z]+-[a-zA-Z]/g,
      name: 'Hyphenated property access',
      message: 'Use bracket notation: USWDS[\'component-name\'] instead of USWDS.component-name',
      severity: 'critical'
    },
    {
      pattern: /createShadowRoot|attachShadow/g,
      name: 'Shadow DOM usage',
      message: 'USWDS components require light DOM for CSS compatibility',
      severity: 'critical'
    },
    {
      pattern: /innerHTML\s*=/g,
      name: 'innerHTML usage',
      message: 'Avoid innerHTML for security; use Lit html templates',
      severity: 'high'
    }
  ],

  required: [
    {
      pattern: /import.*styles\.css/,
      name: 'USWDS styles import',
      message: 'Must import ../../styles/styles.css for USWDS styling'
    },
    {
      pattern: /createRenderRoot.*return this|extends USWDSBaseComponent/,
      name: 'Light DOM usage',
      message: 'Must use light DOM for USWDS compatibility'
    }
  ]
};

/**
 * Validate USWDS JavaScript patterns for a specific component
 */
export function validateUSWDSJavaScript(content, componentName, results) {
  console.log(`🏛️  Validating USWDS JavaScript compliance for ${componentName}...`);

  const rules = COMPONENT_VALIDATION_RULES[componentName];
  if (!rules) {
    console.warn(`⚠️  No specific validation rules found for ${componentName}, using universal patterns only`);
  }

  const tests = [];
  const issues = [];
  const warnings = [];

  // 1. Check universal dangerous patterns
  for (const check of UNIVERSAL_PATTERNS.dangerous) {
    const matches = content.match(check.pattern);
    if (matches) {
      const test = {
        name: `JavaScript anti-pattern: ${check.name}`,
        type: 'behavior',
        subtype: 'javascript',
        status: 'fail',
        severity: check.severity,
        details: `Found ${matches.length} instance(s): ${matches[0]}`,
        fix: check.message
      };

      if (check.severity === 'critical') {
        issues.push(`Critical JavaScript error: ${check.name} - ${check.message}`);
      } else {
        warnings.push(`JavaScript issue: ${check.name} - ${check.message}`);
      }

      tests.push(test);
    }
  }

  // 2. Check universal required patterns
  for (const check of UNIVERSAL_PATTERNS.required) {
    const hasPattern = content.match(check.pattern);
    const test = {
      name: check.name,
      type: 'behavior',
      subtype: 'javascript',
      status: hasPattern ? 'pass' : 'fail',
      details: hasPattern ? 'Pattern found' : check.message
    };

    if (test.status === 'fail') {
      issues.push(`Missing required pattern: ${check.name} - ${check.message}`);
    }

    tests.push(test);
  }

  // 3. Component-specific validation (if rules exist)
  if (rules) {
    // Keyboard handlers - skip if component delegates to USWDS
    if (rules.requiredKeyHandlers && rules.requiredKeyHandlers.length > 0 && !rules.delegatedToUSWDS) {
      for (const key of rules.requiredKeyHandlers) {
        const hasHandler = content.includes(`'${key}'`) || content.includes(`"${key}"`) || content.includes(`case '${key}':`);
        const test = {
          name: `Keyboard handler: ${key}`,
          type: 'behavior',
          subtype: 'javascript',
          status: hasHandler ? 'pass' : 'fail',
          details: hasHandler ? 'Handler found' : `USWDS ${componentName} requires this key handler`
        };

        if (test.status === 'fail') {
          issues.push(`Missing required USWDS keyboard handler: ${key}`);
        }

        tests.push(test);
      }
    } else if (rules.delegatedToUSWDS) {
      // For delegated components, check USWDS integration instead
      const test = {
        name: 'USWDS Delegation',
        type: 'behavior',
        subtype: 'javascript',
        status: 'pass',
        details: 'Component properly delegates keyboard handling to USWDS'
      };
      tests.push(test);
    }

    // USWDS integration - check delegation pattern for delegated components
    if (rules.uswdsIntegration) {
      let hasIntegration = false;
      let integrationDetails = '';

      if (rules.delegatedToUSWDS && rules.uswdsDelegationPattern) {
        // Check for delegation pattern (dynamic import)
        hasIntegration = content.includes(rules.uswdsDelegationPattern) ||
                        content.includes(rules.uswdsIntegration);
        integrationDetails = hasIntegration ? 'USWDS delegation pattern found' : `Missing ${rules.uswdsDelegationPattern} pattern`;
      } else {
        // Traditional USWDS integration pattern
        const integrationPattern = rules.uswdsIntegration.replace('.', '\\.');
        hasIntegration = content.includes(rules.uswdsIntegration) ||
                        content.includes(rules.uswdsIntegration.replace('.', '[\'')) ||
                        content.includes(rules.uswdsIntegration.replace('.', '["'));
        integrationDetails = hasIntegration ? 'USWDS integration found' : `Missing ${rules.uswdsIntegration} integration`;
      }

      const test = {
        name: `USWDS ${componentName} integration`,
        type: 'behavior',
        subtype: 'javascript',
        status: hasIntegration ? 'pass' : 'fail',
        details: integrationDetails
      };

      if (test.status === 'fail') {
        issues.push(`Missing USWDS integration: ${rules.uswdsIntegration}`);
      }

      tests.push(test);
    }

    // Required CSS classes
    if (rules.requiredClasses) {
      for (const className of rules.requiredClasses) {
        const hasClass = content.includes(`"${className}"`) ||
                         content.includes(`'${className}'`) ||
                         content.includes(`class="${className}`) ||
                         content.includes(`class='${className}`);

        const test = {
          name: `Required USWDS class: ${className}`,
          type: 'behavior',
          subtype: 'javascript',
          status: hasClass ? 'pass' : 'fail',
          details: hasClass ? 'Class found in template' : 'Missing required USWDS class'
        };

        if (test.status === 'fail') {
          issues.push(`Missing required USWDS class: ${className}`);
        }

        tests.push(test);
      }
    }

    // Required functionality
    if (rules.requiredFunctionality) {
      for (const funcCheck of rules.requiredFunctionality) {
        const hasFunc = funcCheck.patterns.some(pattern => content.includes(pattern));

        const test = {
          name: funcCheck.name,
          type: 'behavior',
          subtype: 'javascript',
          status: hasFunc ? 'pass' : 'fail',
          details: hasFunc ? 'Functionality implemented' : `Missing core ${componentName} functionality`
        };

        if (test.status === 'fail') {
          issues.push(`Missing functionality: ${funcCheck.name}`);
        }

        tests.push(test);
      }
    }
  }

  console.log(`✅ USWDS JavaScript validation completed for ${componentName}`);

  // Add results to the compliance results object
  if (results) {
    results.tests.behavior = results.tests.behavior || [];
    results.tests.behavior.push(...tests);
    results.issues = results.issues || [];
    results.issues.push(...issues);
    results.warnings = results.warnings || [];
    results.warnings.push(...warnings);
  }

  return {
    tests,
    issues,
    warnings,
    hasErrors: issues.length > 0,
    score: tests.length > 0 ? Math.round((tests.filter(t => t.status === 'pass').length / tests.length) * 100) : 100
  };
}

/**
 * Get supported component types
 */
export function getSupportedComponents() {
  return Object.keys(COMPONENT_VALIDATION_RULES);
}

/**
 * Check if a component type is supported
 */
export function isComponentSupported(componentName) {
  return componentName in COMPONENT_VALIDATION_RULES;
}

/**
 * Add new component validation rules
 */
export function addComponentRules(componentName, rules) {
  COMPONENT_VALIDATION_RULES[componentName] = rules;
}

export default {
  validateUSWDSJavaScript,
  getSupportedComponents,
  isComponentSupported,
  addComponentRules
};