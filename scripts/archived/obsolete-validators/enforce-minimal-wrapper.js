#!/usr/bin/env node

/**
 * Refined Minimal Wrapper Enforcement Script
 *
 * Enforces that components remain minimal wrappers around USWDS functionality
 * without creating overlapping JavaScript that can cause bugs.
 *
 * REFINEMENTS:
 * - Only analyzes actual component files (excludes tests, stories, utilities)
 * - More precise regex patterns to reduce false positives
 * - Context-aware validation that understands legitimate patterns
 * - Better handling of essential web component functionality
 */

import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`🔧 ${message}`, 'bold');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Determine if a file is an actual component (not test, story, or utility)
 */
function isActualComponentFile(filename) {
  // Exclude test files
  if (filename.includes('.test.') || filename.includes('.spec.')) {
    return false;
  }

  // Exclude story files
  if (filename.includes('.stories.') || filename.includes('.story.')) {
    return false;
  }

  // Exclude Cypress test files
  if (filename.includes('.cy.') || filename.includes('.e2e.')) {
    return false;
  }

  // Exclude utility and setup files
  if (filename.includes('utils') || filename.includes('setup') || filename.includes('config')) {
    return false;
  }

  // Include component files (usa-*.ts)
  return filename.startsWith('usa-') && filename.endsWith('.ts');
}

/**
 * Get only actual component files (not tests, stories, utilities)
 */
function getActualComponentFiles(componentPaths = null) {
  if (componentPaths) {
    // Filter provided paths to only include actual component files
    return componentPaths.filter((path) => {
      const filename = path.split('/').pop();
      return isActualComponentFile(filename);
    });
  }

  // Get all component files, filtering out tests and stories
  const pattern = join(rootDir, 'src/components/*/usa-*.ts');
  const allFiles = glob.sync(pattern);

  return allFiles.filter((path) => {
    const filename = path.split('/').pop();
    return isActualComponentFile(filename);
  });
}

/**
 * Refined patterns that indicate JavaScript overlap/duplication
 * More precise patterns that reduce false positives
 */
const OVERLAP_PATTERNS = {
  // Custom event handlers that might conflict with USWDS (but allow essential ones)
  customEventHandlers: [
    // Flag addEventListener on interaction events, but allow if USWDS is mentioned
    /addEventListener\s*\(\s*['"`](?:click|change|input|focus|blur)['"`](?![^;]*USWDS)/g,
    // Only flag obvious custom event handler assignments (exclude property assignments)
    /\bon[A-Z]\w+\s*=/g, // onSomething = (but not regular properties)
  ],

  // Custom scroll/intersection logic (like our threshold issue) - CRITICAL
  customScrollLogic: [
    /new\s+IntersectionObserver/g,
    /\.scrollTo|scrollIntoView(?!\(\)$)/g, // Allow simple scrollIntoView()
    /scroll.*Top\s*=|scroll.*Left\s*=/g,
    /scroll.*event.*listener/gi,
  ],

  // Custom DOM manipulation that USWDS should handle (focus on problematic patterns)
  customDOMManipulation: [
    /\.innerHTML\s*=(?![^;]*template|[^;]*slot|[^;]*html)/g, // Allow template/slot/html usage
    // Only flag appendChild for non-essential use cases
    /\.appendChild\((?![^)]*\.createElement|[^)]*document\.)/g, // Allow basic DOM creation
    /\.removeChild|\.insertBefore/g,
    // Only flag problematic class manipulation (non-USWDS)
    /\.classList\.(?:add|remove|toggle)\([^)]*['"`][^'"`]*(?!usa-|is-)[a-zA-Z]/g,
    // Only flag problematic setAttribute calls
    /\.setAttribute\(['"`](?:class|style)['"`](?![^)]*usa-)/g,
  ],

  // Custom positioning/styling logic
  customPositioning: [
    /\.style\.(?:left|right|top|bottom|width|height|position)\s*=(?![^;]*var\()/g, // Allow CSS custom properties
    /\.offsetTop|\.offsetLeft|\.offsetWidth|\.offsetHeight/g,
    /position\s*:\s*(?:absolute|fixed)(?![^}]*tooltip|[^}]*dropdown)/g, // Allow for tooltips/dropdowns
  ],

  // Custom validation logic (be more specific)
  customValidation: [
    // Exclude legitimate test utilities and property validation
    /(?<!validateComponent|testComponent|@property[^}]*)\bvalidate\b(?!ComponentJavaScript|ComponentAccessibility)/gi,
    /(?<!@property[^}]*|this\.)\bisValid\b(?!ationResult)/gi,
    /(?<!@property[^}]*)\bcheckValid\b/gi,
    /\berror[\\s-]*message\b(?![^;]*usa-error-message)/gi, // Allow USWDS error messages
    /\.setCustomValidity/g,
  ],

  // Custom ARIA management (allow essential ARIA attributes)
  customARIA: [
    /\.setAttribute\([^)]*aria-(?!describedby|labelledby|expanded|hidden|current|live)/g,
    /aria-(?!describedby|labelledby|expanded|hidden|current|live).*=.*['"]/g,
    /role\s*=\s*['"`](?!alert|button|tabpanel|dialog|listbox|option|menuitem)/g,
  ],

  // Complex state management (allow simple properties)
  complexStateLogic: [
    /state.*machine|reducer\s*\(/gi,
    /(?<!event)\\bdispatch(?!Event)/gi,
    // Only flag complex state objects (more than 50 characters)
    /this\.[a-zA-Z]*State\s*=\s*{[^}]{50,}/g,
    /useState|useEffect|useReducer/g,
  ],

  // Custom form handling (allow basic form operations)
  customFormHandling: [
    /\.submit\(\)|\.reset\(\)/g,
    /new\s+FormData(?!\(this\))/g, // Allow FormData(this)
    /\.checkValidity\(\)(?![^;]*USWDS)/g,
  ],

  // Shadow DOM usage (critical violation)
  shadowDOMUsage: [/createShadowRoot|attachShadow/g, /this\.shadowRoot/g],

  // Non-USWDS CSS classes (only flag obviously problematic patterns)
  nonUSWDSClasses: [
    // Only flag classes that are clearly custom and not USWDS-related
    /class.*=.*['"`][^'"`]*(?!usa-|display-|text-|margin-|padding-|border-|bg-|flex-|grid-|sr-only)[a-zA-Z-]+(?<!usa-[a-zA-Z-]+)[^'"`]*['"`]/g,
  ],

  // Form structure violations (allow hidden/submit inputs)
  formStructureViolations: [
    /<input(?![^>]*(?:usa-input|type=['"'](?:hidden|submit|button)['"]))/g,
    /<label(?![^>]*usa-label)/g,
    /<select(?![^>]*usa-select)/g,
    /<textarea(?![^>]*usa-textarea)/g,
  ],

  // Complex keyboard handling (allow basic key checks)
  customKeyboardHandling: [
    // Only flag complex keyboard handling with preventDefault/stopPropagation
    /(?:ArrowDown|ArrowUp|ArrowLeft|ArrowRight|F4).*(?:preventDefault|stopPropagation)/gi,
    /(?:Enter|Space).*keydown.*(?:preventDefault|stopPropagation)(?![^}]*USWDS)/gi,
    /keyCode\s*===?\s*(?:112|37|38|39|40)(?![^}]*USWDS)/g, // F4 and arrow keys
  ],

  // Missing USWDS integration for interactive components
  missingUSWDSIntegration: [
    // This is handled separately in analysis function
  ],
};

/**
 * Analyze a component file for minimal wrapper compliance
 */
function analyzeComponent(filePath) {
  if (!existsSync(filePath)) {
    return { isValid: false, errors: ['File does not exist'], warnings: [] };
  }

  const content = readFileSync(filePath, 'utf8');
  const componentName = filePath.match(/usa-([^/]+)\.ts$/)?.[1] || 'unknown';

  const errors = [];
  const warnings = [];
  const violations = [];

  // Check for overlap patterns
  Object.entries(OVERLAP_PATTERNS).forEach(([category, patterns]) => {
    patterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          violations.push({
            category,
            pattern: pattern.toString(),
            match: match.trim(),
            severity: getViolationSeverity(category, match, content),
          });
        });
      }
    });
  });

  // Categorize violations
  violations.forEach((violation) => {
    const message = `${violation.category}: "${violation.match}"`;

    if (violation.severity === 'error') {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  });

  // Check for missing USWDS integration
  const hasUSWDSIntegration =
    /USWDS\.\w+\.on\(/.test(content) ||
    /uswdsModule/.test(content) ||
    /initializeUSWDS/.test(content);

  // Special handling for interactive components
  const isInteractiveComponent = isComponentInteractive(componentName, content);

  if (isInteractiveComponent && !hasUSWDSIntegration) {
    errors.push(
      'Missing USWDS JavaScript integration - interactive component without USWDS.componentName.on()'
    );
  }

  // Check component complexity
  const complexity = analyzeComplexity(content);
  if (complexity.score > 100) {
    // Raised threshold for refined validation
    warnings.push(`High complexity score (${complexity.score}) - component may be doing too much`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    complexity: complexity.score,
    hasUSWDSIntegration,
    isInteractive: isInteractiveComponent,
  };
}

/**
 * Determine violation severity with more context awareness
 */
function getViolationSeverity(category, match, _fullContent) {
  // Critical violations that break minimal wrapper principle (FAIL BUILD)
  const criticalPatterns = [
    'customScrollLogic', // Like our threshold issue
    'shadowDOMUsage', // Violates USWDS light DOM requirement
    'complexStateLogic', // Components doing too much
  ];

  // High risk violations (FAIL BUILD unless clearly legitimate)
  const highRiskPatterns = [
    'customEventHandlers', // Conflicts with USWDS event handling
    'customDOMManipulation', // USWDS should manage DOM
    'customPositioning', // Manual positioning conflicts
    'customKeyboardHandling', // Reimplements USWDS keyboard navigation
  ];

  // Contextual violations (WARN unless clearly problematic)
  const contextualPatterns = [
    'customValidation', // May be legitimate for form components
    'customARIA', // Some ARIA is essential
    'nonUSWDSClasses', // Some custom classes may be needed
    'formStructureViolations', // May have valid exceptions
  ];

  // Critical - always fail
  if (criticalPatterns.includes(category)) {
    return 'error';
  }

  // High risk - fail unless clearly legitimate
  if (highRiskPatterns.includes(category)) {
    // Allow essential patterns
    if (
      match.includes('data-') ||
      match.includes('console.') ||
      match.includes('usa-') ||
      match.includes('USWDS')
    ) {
      return 'warning';
    }
    return 'error';
  }

  // Contextual - warn but allow
  if (contextualPatterns.includes(category)) {
    // Check if this appears to be intentional/necessary
    if (
      match.length > 100 || // Very long matches are likely problematic
      match.includes('custom-') ||
      match.includes('my-')
    ) {
      return 'error';
    }
    return 'warning';
  }

  return 'warning';
}

/**
 * Check if component should have USWDS integration
 */
function isComponentInteractive(componentName, content) {
  // Explicitly presentational components (no USWDS JS required)
  const presentationalComponents = [
    'tag',
    'card',
    'alert',
    'button',
    'breadcrumb',
    'icon',
    'link',
    'summary-box',
    'site-alert',
    'prose',
    'process-list',
  ];

  // Interactive components that require USWDS JavaScript
  const interactiveComponents = [
    'accordion',
    'modal',
    'combo-box',
    'date-picker',
    'file-input',
    'character-count',
    'tooltip',
    'in-page-navigation',
    'side-navigation',
    'step-indicator',
    'table',
    'header',
    'banner',
    'search',
  ];

  // Explicitly presentational - no USWDS JS needed
  if (presentationalComponents.includes(componentName)) {
    return false;
  }

  // Explicitly interactive - USWDS JS required
  if (interactiveComponents.includes(componentName)) {
    return true;
  }

  // For unknown components, check if they have truly interactive elements
  const hasInteractiveElements = [
    'addEventListener',
    'USWDS.',
    'keydown',
    'input',
    'select',
    'textarea',
  ].some((element) => content.includes(element));

  return hasInteractiveElements;
}

/**
 * Analyze component complexity
 */
function analyzeComplexity(content) {
  let score = 0;
  const metrics = {};

  // Count various complexity indicators
  metrics.methods = (content.match(/^\s*\w+\s*\([^)]*\)\s*\{/gm) || []).length;
  metrics.conditions = (content.match(/if\s*\(|else|switch|case/g) || []).length;
  metrics.loops = (content.match(/for\s*\(|while\s*\(|forEach|map|filter/g) || []).length;
  metrics.eventListeners = (content.match(/addEventListener/g) || []).length;
  metrics.domQueries = (content.match(/querySelector|getElementById/g) || []).length;
  metrics.lines = content.split('\n').length;

  // Calculate complexity score (adjusted weights)
  score += metrics.methods * 2;
  score += metrics.conditions * 2; // Reduced weight
  score += metrics.loops * 3; // Reduced weight
  score += metrics.eventListeners * 5; // High weight - should be minimal
  score += metrics.domQueries * 3;
  score += Math.floor(metrics.lines / 100); // Less penalty for long files

  return { score, metrics };
}

/**
 * Generate remediation suggestions
 */
function generateRemediation(componentName, analysis) {
  const suggestions = [];

  // Core USWDS integration
  if (!analysis.hasUSWDSIntegration && analysis.isInteractive) {
    suggestions.push(`Add USWDS JavaScript integration: USWDS.${componentName}.on(this)`);
  }

  // Key violations with specific guidance
  if (analysis.errors.some((e) => e.includes('customScrollLogic'))) {
    suggestions.push(
      '🚨 CRITICAL: Remove custom scroll/intersection logic - use USWDS data attributes (this caused our threshold bug)'
    );
  }

  if (analysis.errors.some((e) => e.includes('shadowDOMUsage'))) {
    suggestions.push(
      '🚨 CRITICAL: Remove Shadow DOM - use light DOM with createRenderRoot(): HTMLElement { return this; }'
    );
  }

  if (analysis.errors.some((e) => e.includes('customEventHandlers'))) {
    suggestions.push('Remove custom event handlers - let USWDS handle all interactions');
  }

  if (analysis.errors.some((e) => e.includes('customDOMManipulation'))) {
    suggestions.push('Remove custom DOM manipulation - let USWDS manage the DOM');
  }

  // Complexity reduction
  if (analysis.complexity > 100) {
    suggestions.push(
      'Simplify component - focus only on web component lifecycle and USWDS integration'
    );
  }

  return suggestions;
}

/**
 * Main validation function
 */
function enforceMinimalWrapper(componentPaths = null) {
  logHeader('Refined Minimal Wrapper Enforcement Validation');

  const components = getActualComponentFiles(componentPaths);

  if (components.length === 0) {
    logInfo('No actual component files found to validate.');
    return true;
  }

  log(
    `\nValidating ${components.length} actual component files for minimal wrapper compliance...`,
    'cyan'
  );

  let allValid = true;
  const results = [];

  for (const componentPath of components) {
    const componentName = componentPath.match(/usa-([^/]+)\.ts$/)?.[1] || 'unknown';
    log(`\n🔍 Analyzing ${componentName}...`, 'blue');

    const analysis = analyzeComponent(componentPath);
    results.push({ componentName, componentPath, analysis });

    if (analysis.errors.length > 0) {
      allValid = false;
      logError(`${componentName}: ${analysis.errors.length} violations found`);
      analysis.errors.forEach((error) => {
        log(`   💥 ${error}`, 'red');
      });
    } else {
      logSuccess(`${componentName}: Minimal wrapper compliance verified`);
    }

    if (analysis.warnings.length > 0) {
      logWarning(`${componentName}: ${analysis.warnings.length} warnings`);
      analysis.warnings.forEach((warning) => {
        log(`   ⚠️  ${warning}`, 'yellow');
      });
    }

    // Show remediation suggestions
    const suggestions = generateRemediation(componentName, analysis);
    if (suggestions.length > 0) {
      log(`   💡 Remediation suggestions:`, 'cyan');
      suggestions.forEach((suggestion) => {
        log(`      • ${suggestion}`, 'cyan');
      });
    }
  }

  // Summary report
  logHeader('Refined Minimal Wrapper Compliance Summary');

  const totalErrors = results.reduce((sum, r) => sum + r.analysis.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.analysis.warnings.length, 0);
  const violatingComponents = results.filter((r) => r.analysis.errors.length > 0);

  log(`Components analyzed: ${results.length}`, 'blue');
  log(`Violations found: ${totalErrors}`, totalErrors > 0 ? 'red' : 'green');
  log(`Warnings: ${totalWarnings}`, totalWarnings > 0 ? 'yellow' : 'green');

  if (violatingComponents.length > 0) {
    log(`\n🚨 Components violating minimal wrapper principle:`, 'red');
    violatingComponents.forEach(({ componentName, analysis }) => {
      log(
        `   ❌ ${componentName} (${analysis.errors.length} errors, complexity: ${analysis.complexity})`,
        'red'
      );
    });

    log(`\n📚 Refined Minimal Wrapper Guidelines:`, 'cyan');
    log(`   1. Components should only handle web component lifecycle`, 'cyan');
    log(`   2. All functionality must come from USWDS JavaScript`, 'cyan');
    log(`   3. No custom event handlers, scroll logic, or DOM manipulation`, 'cyan');
    log(`   4. Use USWDS.componentName.on(this) for interactive components`, 'cyan');
    log(`   5. Keep components simple and focused`, 'cyan');
    log(`   6. This validation now excludes test files and stories`, 'cyan');
  } else {
    logSuccess('\n🎉 All components comply with minimal wrapper principle!');
  }

  return allValid;
}

/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Refined Minimal Wrapper Enforcement Script

Usage: node scripts/enforce-minimal-wrapper-refined.js [options] [component-paths...]

Options:
  --help                Show this help message

Examples:
  node scripts/enforce-minimal-wrapper-refined.js                           # Check all actual components
  node scripts/enforce-minimal-wrapper-refined.js src/components/modal/usa-modal.ts    # Check specific component

Refinements:
  - Only analyzes actual component files (excludes tests, stories, utilities)
  - More precise regex patterns to reduce false positives
  - Context-aware validation that understands legitimate patterns
  - Better handling of essential web component functionality

Purpose:
  Enforces that components remain minimal wrappers around USWDS functionality
  without creating overlapping JavaScript that can cause bugs.
`);
    process.exit(0);
  }

  const componentPaths = args.length > 0 ? args : null;
  const isValid = enforceMinimalWrapper(componentPaths);
  process.exit(isValid ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { enforceMinimalWrapper, analyzeComponent, isActualComponentFile, getActualComponentFiles };
