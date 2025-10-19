#!/usr/bin/env node

/**
 * Pre-Commit Code Quality Review
 *
 * Performs deep code quality analysis to ensure exceptional code standards:
 * - **Architectural Approach Review** (NEW): Birds-eye view analysis to ensure cleanest code approach
 *   - Verifies correct USWDS integration pattern (direct vs mirrored behavior)
 *   - Detects over-engineering and custom implementations of USWDS functionality
 *   - Suggests simpler alternatives when applicable
 *   - Validates alignment with architecture decision documents
 * - No unnecessary code or complexity
 * - Adherence to USWDS patterns
 * - Proper architecture and minimal wrapper pattern
 * - Code duplication detection
 * - Complexity analysis
 * - Best practices enforcement
 * - Security, performance, and accessibility validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ISSUES = [];
const WARNINGS = [];

// Color codes for terminal output
const COLORS = {
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  GREEN: '\x1b[32m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

function error(msg) {
  ISSUES.push(msg);
  console.error(`${COLORS.RED}❌ ${msg}${COLORS.RESET}`);
}

function warning(msg) {
  WARNINGS.push(msg);
  console.warn(`${COLORS.YELLOW}⚠️  ${msg}${COLORS.RESET}`);
}

function success(msg) {
  console.log(`${COLORS.GREEN}✅ ${msg}${COLORS.RESET}`);
}

function info(msg) {
  console.log(`${COLORS.BLUE}ℹ️  ${msg}${COLORS.RESET}`);
}

/**
 * Get modified component files from git staging area
 */
function getModifiedComponents() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
    return output
      .split('\n')
      .filter(file => file.includes('src/components/'))
      .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.stories.ts'))
      .filter(file => fs.existsSync(file));
  } catch (e) {
    return [];
  }
}

/**
 * Check for unnecessary code patterns
 */
function checkUnnecessaryCode(filePath, content) {
  const fileName = path.basename(filePath);
  const issues = [];
  const isBehaviorFile = filePath.includes('-behavior.ts');

  // Check for commented-out code blocks
  const commentedCodePattern = /\/\/ [a-z]+\.[a-z]+\(/gi;
  if (commentedCodePattern.test(content)) {
    issues.push(`${fileName}: Contains commented-out code - should be removed or explained`);
  }

  // Check for TODO/FIXME comments
  const todoPattern = /\/\/\s*(TODO|FIXME|HACK|XXX):/gi;
  const todos = content.match(todoPattern);
  if (todos && todos.length > 0) {
    warning(`${fileName}: Contains ${todos.length} TODO/FIXME comment(s) - consider addressing before commit`);
  }

  // Check for console.log statements (except in behavior files which mirror USWDS)
  if (!isBehaviorFile) {
    const consoleLogPattern = /console\.(log|debug)\(/g;
    const logs = content.match(consoleLogPattern);
    if (logs && logs.length > 0) {
      issues.push(`${fileName}: Contains ${logs.length} console.log/debug statement(s) - should be removed`);
    }
  }

  // Check for overly long functions (>100 lines) - more lenient for behavior files
  const functionPattern = /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:function|\([^)]*\)\s*=>))[^{]*\{/g;
  let match;
  const functionLengthLimit = isBehaviorFile ? 250 : 100; // Behavior files can have longer functions
  while ((match = functionPattern.exec(content)) !== null) {
    const start = match.index;
    const functionBody = extractFunctionBody(content, start);
    const lines = functionBody.split('\n').length;
    if (lines > functionLengthLimit) {
      warning(`${fileName}: Function exceeds ${functionLengthLimit} lines (${lines}) - consider breaking down`);
    }
  }

  // Check for duplicate code patterns (simple string repetition check)
  // Skip for behavior files - they mirror USWDS source which may have repetition
  if (!isBehaviorFile) {
    const lines = content.split('\n');
    const lineMap = {};
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.length > 30) { // Only check substantial lines
        if (!lineMap[trimmed]) {
          lineMap[trimmed] = [];
        }
        lineMap[trimmed].push(idx + 1);
      }
    });

    Object.entries(lineMap).forEach(([line, occurrences]) => {
      if (occurrences.length >= 3) {
        warning(`${fileName}: Potential code duplication at lines ${occurrences.join(', ')}`);
      }
    });
  }

  return issues;
}

/**
 * Extract function body for analysis
 */
function extractFunctionBody(content, startIndex) {
  let braceCount = 0;
  let inFunction = false;
  let body = '';

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    if (char === '{') {
      braceCount++;
      inFunction = true;
    } else if (char === '}') {
      braceCount--;
      if (inFunction && braceCount === 0) {
        body += char;
        break;
      }
    }
    if (inFunction) {
      body += char;
    }
  }

  return body;
}

/**
 * Check adherence to USWDS patterns
 */
function checkUSWDSPatterns(filePath, content) {
  const fileName = path.basename(filePath);
  const issues = [];

  // Check for custom CSS in component files (not behavior files)
  if (!filePath.includes('-behavior.ts')) {
    // Look for style definitions beyond minimal :host
    const stylePattern = /static\s+override\s+styles\s*=\s*css`([^`]+)`/;
    const styleMatch = content.match(stylePattern);
    if (styleMatch) {
      const styles = styleMatch[1];
      // Check if styles contain anything beyond :host display
      if (styles.includes('color:') ||
          styles.includes('margin:') ||
          styles.includes('padding:') ||
          styles.includes('background:') ||
          styles.includes('border:')) {
        issues.push(`${fileName}: Contains custom CSS beyond :host display - should use USWDS classes`);
      }
    }
  }

  // Check for proper USWDS integration in component files
  if (!filePath.includes('-behavior.ts') && !filePath.includes('base-component')) {
    // Should have either initializeUSWDSComponent or behavior import
    const hasUSWDSInit = content.includes('initializeUSWDSComponent');
    const hasBehaviorImport = /import.*-behavior\.js/.test(content);

    if (!hasUSWDSInit && !hasBehaviorImport && content.includes('extends USWDSBaseComponent')) {
      warning(`${fileName}: No USWDS integration detected - verify component doesn't need JavaScript`);
    }
  }

  // Check for USWDS-mirrored behavior files following strict patterns
  if (filePath.includes('-behavior.ts')) {
    // Should have @uswds-source comment
    if (!content.includes('@uswds-source')) {
      issues.push(`${fileName}: Behavior file missing @uswds-source documentation`);
    }

    // Should have SOURCE comments for functions
    const exportedFunctions = content.match(/export\s+(?:function|const)\s+\w+/g) || [];
    const sourceComments = content.match(/\*\s*SOURCE:/g) || [];

    if (exportedFunctions.length > 0 && sourceComments.length === 0) {
      issues.push(`${fileName}: Behavior file missing SOURCE attribution comments`);
    }

    // Should not have custom logic warnings
    if (content.includes('DO NOT add custom logic')) {
      success(`${fileName}: Properly documented as USWDS-mirrored behavior`);
    }
  }

  return issues;
}

/**
 * Check for minimal wrapper pattern adherence
 */
function checkMinimalWrapperPattern(filePath, content) {
  const fileName = path.basename(filePath);
  const issues = [];

  if (filePath.includes('-behavior.ts')) {
    return issues; // Behavior files have different patterns
  }

  // Check for over-engineering indicators
  const overEngineeringPatterns = [
    { pattern: /class\s+\w+Helper/, msg: 'Helper classes - should delegate to USWDS' },
    { pattern: /class\s+\w+Manager/, msg: 'Manager classes - should delegate to USWDS' },
    { pattern: /class\s+\w+Service/, msg: 'Service classes - should delegate to USWDS' },
    { pattern: /private\s+state\w+/, msg: 'Custom state management - USWDS should manage state' },
  ];

  overEngineeringPatterns.forEach(({ pattern, msg }) => {
    if (pattern.test(content)) {
      issues.push(`${fileName}: ${msg}`);
    }
  });

  // Check component size - minimal wrappers should be small
  const lines = content.split('\n').filter(line => line.trim().length > 0).length;
  if (lines > 500 && !filePath.includes('table') && !filePath.includes('header')) {
    warning(`${fileName}: Component has ${lines} non-empty lines - consider if all logic is necessary`);
  }

  // Check for proper light DOM usage
  if (!content.includes('createRenderRoot()') && content.includes('extends USWDSBaseComponent')) {
    warning(`${fileName}: May not be using light DOM - verify USWDS compatibility`);
  }

  return issues;
}

/**
 * Check for code complexity
 */
function checkComplexity(filePath, content) {
  const fileName = path.basename(filePath);
  const issues = [];
  const isBehaviorFile = filePath.includes('-behavior.ts');

  // Check cyclomatic complexity (simplified) - more lenient for behavior files
  const complexityKeywords = ['if', 'else', 'switch', 'case', 'for', 'while'];
  const complexityOperators = ['&&', '||', '?'];
  const lines = content.split('\n');
  const complexityLimit = isBehaviorFile ? 8 : 5; // Higher limit for behavior files

  lines.forEach((line, idx) => {
    let complexity = 0;

    // Check keywords with word boundaries
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = line.match(regex);
      if (matches) complexity += matches.length;
    });

    // Check operators without word boundaries
    complexityOperators.forEach(operator => {
      const escaped = operator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      const matches = line.match(regex);
      if (matches) complexity += matches.length;
    });

    if (complexity > complexityLimit) {
      warning(`${fileName}:${idx + 1}: High complexity (${complexity}) - consider simplifying`);
    }
  });

  // Check for deeply nested blocks - more lenient for behavior files
  const nestingLimit = isBehaviorFile ? 7 : 4; // Higher limit for behavior files
  let maxNesting = 0;
  let currentNesting = 0;
  for (const char of content) {
    if (char === '{') {
      currentNesting++;
      maxNesting = Math.max(maxNesting, currentNesting);
    } else if (char === '}') {
      currentNesting--;
    }
  }

  if (maxNesting > nestingLimit) {
    warning(`${fileName}: Deep nesting detected (${maxNesting} levels) - consider flattening`);
  }

  return issues;
}

/**
 * Check TypeScript best practices
 */
function checkTypeScriptBestPractices(filePath, content) {
  const fileName = path.basename(filePath);
  const issues = [];

  // Check for 'any' usage (should be minimal)
  const anyPattern = /:\s*any\b/g;
  const anyMatches = content.match(anyPattern) || [];
  if (anyMatches.length > 3) {
    warning(`${fileName}: Excessive use of 'any' type (${anyMatches.length} occurrences) - consider proper typing`);
  }

  // Check for @ts-ignore vs @ts-expect-error
  if (content.includes('@ts-ignore')) {
    issues.push(`${fileName}: Uses @ts-ignore - should use @ts-expect-error instead`);
  }

  // Check for proper JSDoc comments on exported functions
  const exportedItems = content.match(/export\s+(function|const|class|interface|type)\s+\w+/g) || [];
  const jsdocComments = content.match(/\/\*\*[\s\S]*?\*\//g) || [];

  if (exportedItems.length > jsdocComments.length + 2) { // Allow some leeway
    warning(`${fileName}: Some exported items may lack JSDoc documentation`);
  }

  return issues;
}

/**
 * Check for proper error handling
 */
function checkErrorHandling(filePath, content) {
  const fileName = path.basename(filePath);
  const issues = [];

  // Check for empty catch blocks
  const emptyCatchPattern = /catch\s*\([^)]*\)\s*\{\s*\}/g;
  if (emptyCatchPattern.test(content)) {
    issues.push(`${fileName}: Empty catch block detected - should handle or log errors`);
  }

  // Check for console.error usage (should have context)
  const consoleErrorPattern = /console\.error\([^)]*\)/g;
  const errors = content.match(consoleErrorPattern) || [];
  errors.forEach(errorCall => {
    if (!errorCall.includes('error') && !errorCall.includes(':')) {
      warning(`${fileName}: console.error may lack context - ensure error messages are descriptive`);
    }
  });

  return issues;
}

/**
 * Check event naming and dispatch patterns
 */
function checkEventPatterns(filePath, content) {
  const fileName = path.basename(filePath);
  const issues = [];
  const isBehaviorFile = filePath.includes('-behavior.ts');

  // Skip behavior files
  if (isBehaviorFile || !filePath.includes('src/components/')) {
    return issues;
  }

  // Check for dispatchEvent calls
  const dispatchPattern = /dispatchEvent\s*\(\s*new\s+CustomEvent\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;

  while ((match = dispatchPattern.exec(content)) !== null) {
    const eventName = match[1];

    // Check if event name is kebab-case
    if (!/^[a-z]+(-[a-z]+)*$/.test(eventName)) {
      warning(`${fileName}: Event '${eventName}' should use kebab-case naming (e.g., 'item-selected')`);
    }

    // Check for generic event names
    const genericNames = ['change', 'input', 'click', 'update', 'event'];
    if (genericNames.includes(eventName)) {
      warning(`${fileName}: Event '${eventName}' is too generic - use descriptive name (e.g., 'item-changed')`);
    }
  }

  // Check for CustomEvent without detail typing
  const customEventPattern = /new\s+CustomEvent(?!<)/g;
  if (customEventPattern.test(content)) {
    warning(`${fileName}: CustomEvent without TypeScript generic - consider CustomEvent<DetailType> for type safety`);
  }

  return issues;
}

/**
 * Check for performance anti-patterns
 */
function checkPerformancePatterns(filePath, content) {
  const fileName = path.basename(filePath);
  const issues = [];
  const isBehaviorFile = filePath.includes('-behavior.ts');

  // Skip behavior files
  if (isBehaviorFile) {
    return issues;
  }

  // Check for expensive operations in render()
  if (content.includes('render()')) {
    const renderStart = content.indexOf('render()');
    const renderMethod = content.substring(renderStart);

    // Check for querySelectorAll in render
    if (renderMethod.includes('querySelectorAll') || renderMethod.includes('querySelector')) {
      warning(`${fileName}: DOM queries in render() - move to firstUpdated() or updated() lifecycle`);
    }

    // Check for array.map/filter/reduce in render
    const arrayMethodsPattern = /\.(map|filter|reduce|sort)\(/g;
    const arrayMethods = renderMethod.match(arrayMethodsPattern);
    if (arrayMethods && arrayMethods.length > 3) {
      warning(`${fileName}: Multiple array operations in render() - consider computing in willUpdate() or using @state()`);
    }
  }

  // Check for excessive requestUpdate() calls
  const requestUpdatePattern = /this\.requestUpdate\(/g;
  const updateCalls = content.match(requestUpdatePattern);
  if (updateCalls && updateCalls.length > 5) {
    warning(`${fileName}: Excessive requestUpdate() calls (${updateCalls.length}) - Lit auto-updates on property changes`);
  }

  // Check for missing cleanup of event listeners
  if (content.includes('addEventListener')) {
    if (!content.includes('removeEventListener') && !content.includes('disconnectedCallback')) {
      warning(`${fileName}: addEventListener without cleanup - may cause memory leaks`);
    }
  }

  return issues;
}

/**
 * Check for security issues
 */
function checkSecurityPatterns(filePath, content) {
  const fileName = path.basename(filePath);
  const issues = [];

  // Check for innerHTML usage
  if (content.includes('innerHTML')) {
    if (!content.includes('sanitiz')) {
      issues.push(`${fileName}: innerHTML usage detected - use sanitizer or unsafeHTML directive with caution`);
    }
  }

  // Check for eval or Function constructor
  if (content.includes('eval(') || content.includes('new Function(')) {
    issues.push(`${fileName}: eval() or Function constructor detected - severe security risk`);
  }

  // Check for string concatenation in URLs
  const urlConcatPattern = /['"`]https?:\/\/[^'"`]*\$\{/;
  if (urlConcatPattern.test(content)) {
    warning(`${fileName}: URL construction via string concatenation - use URL constructor for safety`);
  }

  return issues;
}

/**
 * Check import statement patterns
 */
function checkImportPatterns(filePath, content) {
  const fileName = path.basename(filePath);
  const issues = [];
  const isBehaviorFile = filePath.includes('-behavior.ts');

  // Get all imports
  const importPattern = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;

  while ((match = importPattern.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // Check for circular dependencies (basic check)
  const componentDir = path.dirname(filePath);
  const componentName = path.basename(filePath, '.ts');

  imports.forEach(importPath => {
    // Skip behavior file imports (expected pattern)
    if (importPath.includes('-behavior.js')) {
      return;
    }

    if (importPath.includes(componentName) && !importPath.includes('.css')) {
      warning(`${fileName}: Potential circular dependency detected - importing '${importPath}'`);
    }
  });

  // Check behavior files only import from USWDS utils
  if (isBehaviorFile) {
    imports.forEach(importPath => {
      // Allow relative imports from utils and type imports
      if (
        !importPath.startsWith('../../utils/') &&
        !importPath.startsWith('../../../utils/') &&
        !importPath.includes('.css') &&
        !content.includes(`import type`)
      ) {
        warning(`${fileName}: Behavior file should primarily import from utils - found '${importPath}'`);
      }
    });
  }

  return issues;
}

/**
 * Check ARIA and accessibility patterns
 */
function checkAccessibilityPatterns(filePath, content) {
  const fileName = path.basename(filePath);
  const issues = [];
  const isBehaviorFile = filePath.includes('-behavior.ts');

  // Skip behavior files
  if (isBehaviorFile || !filePath.includes('src/components/')) {
    return issues;
  }

  // Check for interactive elements without proper ARIA
  const buttonPattern = /<button\s+/g;
  const hasButtons = buttonPattern.test(content);

  if (hasButtons) {
    // Check if buttons have aria-label or text content
    const buttonWithoutLabelPattern = /<button(?![^>]*aria-label)(?![^>]*>[\s\S]*?<\/button>)/;
    if (buttonWithoutLabelPattern.test(content)) {
      warning(`${fileName}: Some buttons may lack aria-label or text content - ensure accessibility`);
    }
  }

  // Check for custom role attributes
  const rolePattern = /role=["'](\w+)["']/g;
  let match;

  while ((match = rolePattern.exec(content)) !== null) {
    const role = match[1];

    // Common roles that need additional ARIA attributes
    const rolesNeedingAria = {
      dialog: ['aria-labelledby', 'aria-modal'],
      tablist: ['aria-label'],
      tab: ['aria-selected', 'aria-controls'],
      tabpanel: ['aria-labelledby'],
      combobox: ['aria-expanded', 'aria-controls'],
      listbox: ['aria-label'],
    };

    if (rolesNeedingAria[role]) {
      const requiredAttrs = rolesNeedingAria[role];
      const missingAttrs = requiredAttrs.filter(attr => !content.includes(attr));

      if (missingAttrs.length > 0) {
        warning(`${fileName}: role="${role}" may need ${missingAttrs.join(', ')} attributes`);
      }
    }
  }

  // Check for tabindex usage
  const tabindexPattern = /tabindex=["'](-?\d+)["']/g;

  while ((match = tabindexPattern.exec(content)) !== null) {
    const tabindex = parseInt(match[1]);

    // Warn on positive tabindex values (bad practice)
    if (tabindex > 0) {
      warning(`${fileName}: Positive tabindex="${tabindex}" detected - use tabindex="0" or "-1" instead`);
    }
  }

  // Check for form inputs without labels
  const inputPattern = /<input\s+/g;
  const hasInputs = inputPattern.test(content);

  if (hasInputs) {
    // Check for aria-label, aria-labelledby, or associated label
    if (!content.includes('aria-label') && !content.includes('aria-labelledby')) {
      warning(`${fileName}: Inputs detected - ensure proper label associations or aria-label attributes`);
    }
  }

  return issues;
}

/**
 * Check documentation completeness
 */
function checkDocumentation(filePath, content) {
  const fileName = path.basename(filePath);
  const issues = [];
  const isBehaviorFile = filePath.includes('-behavior.ts');

  // Skip behavior files and non-component files
  if (isBehaviorFile || !filePath.includes('src/components/')) {
    return issues;
  }

  // Check for README.md in component directory
  const componentDir = path.dirname(filePath);
  const readmePath = path.join(componentDir, 'README.md');
  const hasReadme = fs.existsSync(readmePath);

  if (!hasReadme) {
    warning(`${fileName}: No README.md found - component should have documentation`);
  }

  // Check for JSDoc on exported class
  const classPattern = /export\s+class\s+(\w+)/;
  const classMatch = content.match(classPattern);

  if (classMatch) {
    const className = classMatch[1];
    const classIndex = content.indexOf(classMatch[0]);

    // Look for JSDoc comment before class
    const precedingContent = content.substring(Math.max(0, classIndex - 500), classIndex);
    const hasJSDoc = precedingContent.includes('/**') && precedingContent.includes('*/');

    if (!hasJSDoc) {
      warning(`${fileName}: Class ${className} missing JSDoc comment - add component description`);
    }

    // Check for @element tag in JSDoc
    if (hasJSDoc && !precedingContent.includes('@element')) {
      warning(`${fileName}: JSDoc missing @element tag - specify custom element name`);
    }
  }

  // Check for JSDoc on public methods
  const publicMethodPattern = /(?:^|\n)\s+(async\s+)?(\w+)\([^)]*\)\s*(?::\s*\w+)?\s*\{/g;
  let match;
  let methodsWithoutDocs = 0;

  while ((match = publicMethodPattern.exec(content)) !== null) {
    const methodName = match[2];

    // Skip lifecycle methods and private methods
    if (
      methodName.startsWith('_') ||
      ['constructor', 'connectedCallback', 'disconnectedCallback', 'render', 'firstUpdated', 'updated'].includes(methodName)
    ) {
      continue;
    }

    // Look for JSDoc before method
    const methodIndex = match.index;
    const precedingContent = content.substring(Math.max(0, methodIndex - 300), methodIndex);

    if (!precedingContent.includes('/**') || !precedingContent.includes('*/')) {
      methodsWithoutDocs++;
    }
  }

  if (methodsWithoutDocs > 0) {
    warning(`${fileName}: ${methodsWithoutDocs} public method(s) missing JSDoc comments`);
  }

  return issues;
}

/**
 * Check component property validation
 */
function checkComponentProperties(filePath, content) {
  const fileName = path.basename(filePath);
  const issues = [];
  const isBehaviorFile = filePath.includes('-behavior.ts');

  // Skip behavior files and non-component files
  if (isBehaviorFile || !filePath.includes('src/components/')) {
    return issues;
  }

  // Check for @property decorators without types
  const propertyPattern = /@property\(\s*\{([^}]+)\}\s*\)/g;
  let match;

  while ((match = propertyPattern.exec(content)) !== null) {
    const decoratorContent = match[1];

    // Check if type is specified
    if (!decoratorContent.includes('type:')) {
      warning(`${fileName}: @property decorator missing type specification - always specify type`);
    }

    // Check for boolean properties without reflect: true
    if (decoratorContent.includes('type: Boolean') && !decoratorContent.includes('reflect:')) {
      warning(`${fileName}: Boolean @property should include reflect: true for attribute sync`);
    }
  }

  // Check for properties that might need @state() instead
  const privatePropertyPattern = /private\s+(\w+)(?:\s*:\s*\w+)?\s*=/g;
  const privateProps = [];

  while ((match = privatePropertyPattern.exec(content)) !== null) {
    privateProps.push(match[1]);
  }

  // Check if private properties are being used in render() without @state()
  if (content.includes('render()') && privateProps.length > 0) {
    const renderMethod = content.substring(content.indexOf('render()'));
    privateProps.forEach(prop => {
      if (renderMethod.includes(`this.${prop}`) && !content.includes(`@state()`)) {
        warning(`${fileName}: Private property '${prop}' used in render() - consider using @state() decorator`);
      }
    });
  }

  // Check for improper property naming (should be camelCase)
  const propertyDeclarationPattern = /@property\([^)]+\)\s+(\w+)/g;

  while ((match = propertyDeclarationPattern.exec(content)) !== null) {
    const propName = match[1];

    // Check if property name is kebab-case or snake_case
    if (propName.includes('-') || propName.includes('_')) {
      issues.push(`${fileName}: Property '${propName}' should use camelCase naming convention`);
    }

    // Check if property starts with uppercase (should be lowercase)
    if (propName[0] === propName[0].toUpperCase()) {
      issues.push(`${fileName}: Property '${propName}' should start with lowercase letter`);
    }
  }

  return issues;
}

/**
 * Check for test coverage requirements
 */
function checkTestCoverage(filePath) {
  const fileName = path.basename(filePath);
  const issues = [];

  // Skip behavior files and non-component files
  const isBehaviorFile = filePath.includes('-behavior.ts');
  const isUtilFile = filePath.includes('src/utils/');

  if (isBehaviorFile || isUtilFile) {
    return issues;
  }

  // Check for corresponding test file
  const testFilePath = filePath.replace('.ts', '.test.ts');
  const hasTestFile = fs.existsSync(testFilePath);

  if (!hasTestFile) {
    warning(`${fileName}: No test file found - should have ${path.basename(testFilePath)}`);
  }

  // Check for behavior test file if this is a behavior component
  const componentDir = path.dirname(filePath);
  const behaviorFilePath = path.join(componentDir, fileName.replace('.ts', '-behavior.ts'));
  const hasBehaviorFile = fs.existsSync(behaviorFilePath);

  if (hasBehaviorFile) {
    const behaviorTestPath = behaviorFilePath.replace('.ts', '.test.ts');
    const hasBehaviorTest = fs.existsSync(behaviorTestPath);

    if (!hasBehaviorTest) {
      warning(`${fileName}: Behavior file exists but no behavior test file found - should have ${path.basename(behaviorTestPath)}`);
    }
  }

  return issues;
}

/**
 * Architectural Approach Review
 *
 * Performs "birds-eye view" analysis to ensure cleanest code approach
 */
function checkArchitecturalApproach(filePath, content) {
  const fileName = path.basename(filePath);
  const issues = [];
  const isBehaviorFile = filePath.includes('-behavior.ts');

  // Skip behavior files and non-component files
  if (isBehaviorFile || !filePath.includes('src/components/')) {
    return issues;
  }

  // 1. Check if component is using correct USWDS integration pattern
  const hasDirectIntegration = content.includes('initializeUSWDSComponent');
  const hasMirroredBehavior = content.includes('-behavior.js');
  const componentName = fileName.replace('usa-', '').replace('.ts', '');

  // Components that typically need mirrored behavior (complex interactions)
  const complexComponents = ['accordion', 'modal', 'date-picker', 'time-picker', 'combo-box', 'tooltip', 'character-count', 'table', 'file-input'];
  const isComplexComponent = complexComponents.includes(componentName);

  if (isComplexComponent && hasDirectIntegration && !hasMirroredBehavior) {
    warning(`${fileName}: Complex component using direct integration - consider USWDS-mirrored behavior pattern for better control (see ARCHITECTURE_DECISION_ACCORDION_BEHAVIOR_APPROACH.md)`);
  }

  if (!isComplexComponent && hasMirroredBehavior) {
    warning(`${fileName}: Simple component using mirrored behavior - direct integration may be simpler (see JAVASCRIPT_INTEGRATION_STRATEGY.md)`);
  }

  // 2. Check for over-engineering: custom implementations of USWDS functionality
  const overEngineeredPatterns = [
    {
      pattern: /private\s+handle(Click|Focus|Blur|KeyDown|KeyUp)\s*\([^)]*\)\s*{[\s\S]{50,}/,
      msg: 'Custom event handlers with substantial logic - USWDS should handle most behavior',
      exclude: ['accordion', 'modal'] // Allowed for mirrored behavior components
    },
    {
      pattern: /private\s+toggle\w+\s*\([^)]*\)\s*{[\s\S]{30,}/,
      msg: 'Custom toggle logic - verify USWDS doesn\'t provide this functionality'
    },
    {
      pattern: /classList\.(add|remove|toggle)\([^)]*\)/g,
      msg: 'Manual class manipulation detected - USWDS typically manages classes automatically',
      threshold: 5 // Warn if more than 5 occurrences
    },
    {
      pattern: /setAttribute\s*\(\s*['"]aria-/g,
      msg: 'Manual ARIA attribute management - USWDS should handle accessibility',
      threshold: 3
    }
  ];

  overEngineeredPatterns.forEach(({ pattern, msg, exclude, threshold }) => {
    // Check if component is excluded
    if (exclude && exclude.includes(componentName)) {
      return;
    }

    const matches = content.match(pattern);
    if (threshold) {
      if (matches && matches.length > threshold) {
        warning(`${fileName}: ${msg} (${matches.length} occurrences - threshold: ${threshold})`);
      }
    } else if (pattern.test(content)) {
      warning(`${fileName}: ${msg}`);
    }
  });

  // 3. Check for simpler alternatives

  // 3a. Multiple event.preventDefault() suggests reimplementing browser behavior
  const preventDefaultCount = (content.match(/event\.preventDefault\(\)/g) || []).length;
  if (preventDefaultCount > 3) {
    warning(`${fileName}: Multiple event.preventDefault() calls (${preventDefaultCount}) - may be reimplementing browser/USWDS behavior`);
  }

  // 3b. Custom state management when USWDS manages state
  const stateManagementPatterns = [
    'private isOpen',
    'private isExpanded',
    'private isActive',
    'private isSelected',
    'private currentState'
  ];

  stateManagementPatterns.forEach(pattern => {
    if (content.includes(pattern) && hasDirectIntegration) {
      warning(`${fileName}: Custom state property '${pattern}' - USWDS manages component state automatically`);
    }
  });

  // 3c. Complex lifecycle logic that could be simplified
  const firstUpdatedMatch = content.match(/firstUpdated\([^)]*\)\s*{([\s\S]*?)(?=\n\s{2}\w|\n\s{0,2}})/);
  if (firstUpdatedMatch) {
    const firstUpdatedBody = firstUpdatedMatch[1];
    const lines = firstUpdatedBody.split('\n').filter(line => line.trim().length > 0).length;

    if (lines > 20 && !hasMirroredBehavior) {
      warning(`${fileName}: firstUpdated() has ${lines} lines - consider if all initialization logic is necessary`);
    }
  }

  // 4. Check for unnecessary abstraction layers
  const helperMethodPattern = /private\s+(\w+Helper|\w+Util|\w+Manager)\s*\(/g;
  const helperMethods = content.match(helperMethodPattern);
  if (helperMethods && helperMethods.length > 0) {
    warning(`${fileName}: Helper/util/manager methods detected (${helperMethods.length}) - may indicate over-abstraction for a wrapper component`);
  }

  // 5. Verify architecture decision alignment
  const componentDir = path.dirname(filePath);
  const architectureDecisionPath = path.join(componentDir, `ARCHITECTURE_DECISION_${componentName.toUpperCase()}_*.md`);

  // Check if there's an architecture decision document
  const files = fs.readdirSync(componentDir);
  const hasArchitectureDecision = files.some(file => file.startsWith('ARCHITECTURE_DECISION_'));

  if (hasArchitectureDecision) {
    // If there's an architecture decision, verify implementation matches
    success(`${fileName}: Has architecture decision document - verify implementation aligns with documented approach`);
  }

  // 6. Check for code that suggests alternative patterns

  // 6a. Lots of DOM queries suggest component might need refs or better structure
  const domQueryCount = (content.match(/this\.querySelector(?:All)?\(/g) || []).length;
  if (domQueryCount > 8) {
    warning(`${fileName}: Excessive DOM queries (${domQueryCount}) - consider using refs or restructuring component`);
  }

  // 6b. Many setTimeout/setInterval suggest timing issues that might have better solutions
  const timingCount = (content.match(/set(Timeout|Interval)\(/g) || []).length;
  if (timingCount > 4) {
    warning(`${fileName}: Multiple setTimeout/setInterval calls (${timingCount}) - may indicate race conditions or timing dependencies that need better architecture`);
  }

  return issues;
}

/**
 * Get commit message to understand what issue is being fixed
 */
function getCommitContext() {
  try {
    // Get staged changes summary
    const diffStat = execSync('git diff --cached --stat', { encoding: 'utf-8' });

    // Try to get commit message if available (from git commit -m or editor)
    let commitMsg = '';
    try {
      commitMsg = execSync('git log -1 --pretty=%B 2>/dev/null', { encoding: 'utf-8' }).trim();
    } catch (e) {
      // No commit message yet (pre-commit hook)
      commitMsg = 'Pre-commit validation';
    }

    return {
      message: commitMsg,
      diffStat: diffStat.trim()
    };
  } catch (e) {
    return {
      message: 'Unknown',
      diffStat: 'No changes'
    };
  }
}

/**
 * Run all quality checks
 */
function runQualityChecks() {
  console.log(`\n${COLORS.BOLD}${COLORS.BLUE}🔍 Code Quality Review${COLORS.RESET}\n`);

  const modifiedFiles = getModifiedComponents();

  if (modifiedFiles.length === 0) {
    info('No component files modified - skipping code quality review');
    return { passed: true, issues: 0, warnings: 0 };
  }

  // Show commit context for architectural review
  const commitContext = getCommitContext();
  if (commitContext.message !== 'Pre-commit validation' && commitContext.message !== 'Unknown') {
    info(`Commit: ${commitContext.message}`);
  }
  info(`Reviewing ${modifiedFiles.length} component file(s)...\n`);

  modifiedFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);

    console.log(`\n${COLORS.BOLD}📄 ${fileName}${COLORS.RESET}`);

    // Run all checks
    const unnecessaryIssues = checkUnnecessaryCode(filePath, content);
    const uswdsIssues = checkUSWDSPatterns(filePath, content);
    const wrapperIssues = checkMinimalWrapperPattern(filePath, content);
    const complexityIssues = checkComplexity(filePath, content);
    const tsIssues = checkTypeScriptBestPractices(filePath, content);
    const errorIssues = checkErrorHandling(filePath, content);
    const eventIssues = checkEventPatterns(filePath, content);
    const performanceIssues = checkPerformancePatterns(filePath, content);
    const securityIssues = checkSecurityPatterns(filePath, content);
    const importIssues = checkImportPatterns(filePath, content);
    const accessibilityIssues = checkAccessibilityPatterns(filePath, content);
    const documentationIssues = checkDocumentation(filePath, content);
    const propertyIssues = checkComponentProperties(filePath, content);
    const testCoverageIssues = checkTestCoverage(filePath);
    const architecturalIssues = checkArchitecturalApproach(filePath, content);

    const allIssues = [
      ...unnecessaryIssues,
      ...uswdsIssues,
      ...wrapperIssues,
      ...complexityIssues,
      ...tsIssues,
      ...errorIssues,
      ...eventIssues,
      ...performanceIssues,
      ...securityIssues,
      ...importIssues,
      ...accessibilityIssues,
      ...documentationIssues,
      ...propertyIssues,
      ...testCoverageIssues,
      ...architecturalIssues
    ];

    if (allIssues.length === 0 && WARNINGS.filter(w => w.includes(fileName)).length === 0) {
      success(`No issues found`);
    }
  });

  return {
    passed: ISSUES.length === 0,
    issues: ISSUES.length,
    warnings: WARNINGS.length
  };
}

/**
 * Main execution
 */
function main() {
  const result = runQualityChecks();

  console.log(`\n${COLORS.BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.RESET}\n`);

  if (result.passed) {
    if (result.warnings === 0) {
      console.log(`${COLORS.GREEN}${COLORS.BOLD}✅ Code Quality: EXCELLENT${COLORS.RESET}`);
      console.log(`${COLORS.GREEN}   No issues or warnings detected${COLORS.RESET}\n`);
    } else {
      console.log(`${COLORS.YELLOW}${COLORS.BOLD}⚠️  Code Quality: GOOD (with warnings)${COLORS.RESET}`);
      console.log(`${COLORS.YELLOW}   ${result.warnings} warning(s) - consider addressing${COLORS.RESET}\n`);
    }
    process.exit(0);
  } else {
    console.log(`${COLORS.RED}${COLORS.BOLD}❌ Code Quality: NEEDS IMPROVEMENT${COLORS.RESET}`);
    console.log(`${COLORS.RED}   ${result.issues} issue(s) must be fixed${COLORS.RESET}`);
    if (result.warnings > 0) {
      console.log(`${COLORS.YELLOW}   ${result.warnings} warning(s) to consider${COLORS.RESET}`);
    }
    console.log(`\n${COLORS.BLUE}💡 Review issues above and improve code before committing${COLORS.RESET}\n`);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { runQualityChecks };
