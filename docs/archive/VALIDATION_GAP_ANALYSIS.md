# USWDS Compliance Validation Gap Analysis

**Date:** 2025-10-12
**Issue:** Custom CSS class modifiers not caught by validation
**Component:** Card (`usa-card__container--actionable`)

## Executive Summary

Our USWDS compliance validation system successfully caught 100% compliance across all components, but missed a critical issue: the card component was adding a **custom modifier class** (`usa-card__container--actionable`) that doesn't exist in official USWDS CSS.

This document analyzes why this wasn't caught and proposes enhancements to prevent similar issues.

## The Issue

### What Happened
```typescript
// Card component was doing this:
const containerClasses = ['usa-card__container'];
if (this.actionable) {
  containerClasses.push('usa-card__container--actionable'); // ❌ Not in USWDS!
}
```

### Why It Matters
- The class has **no styles** (doesn't exist in USWDS CSS)
- Violates our **100% USWDS compliance** standard
- Creates **maintenance burden** (future developers might rely on it)
- Could **mislead** developers into thinking USWDS supports this

### Impact
- **Low functional impact** - No styles meant no visual bugs
- **High compliance impact** - Violated USWDS-First methodology
- **Medium discoverability** - Required manual code review to find

## Root Cause Analysis

### Current Validation Logic

Our validation in `scripts/validate/validate-all-components-compliance.js` checks:

```javascript
// Line 381-387: validateHTMLStructure()
patterns.structure.forEach(className => {
  if (content.includes(className)) {
    successes.push(`✓ Has ${className}`);  // ✅ PASSES for usa-card__container
  } else {
    issues.push(`Missing required USWDS class: ${className}`);
  }
});
```

**What it checks:**
- ✅ Required USWDS classes are present
- ✅ Classes are in correct order
- ✅ Required attributes exist
- ✅ Proper HTML structure

**What it DOESN'T check:**
- ❌ Non-USWDS modifier classes (--actionable, --custom, etc.)
- ❌ Custom BEM variations
- ❌ Classes that exist but have no USWDS styles

### Why This Gap Exists

The validation was designed as a **positive checklist** (ensuring required elements exist) rather than a **negative checklist** (preventing prohibited elements).

**Design Philosophy:**
1. Whitelist approach: "Does it have what USWDS requires?" ✓
2. Missing: Blacklist approach: "Does it only use what USWDS provides?"

**Historical Context:**
- Initial validation focused on preventing **missing** classes
- Did not anticipate developers **adding** non-existent classes
- Assumed adherence to USWDS-First methodology would prevent this

## Detection Strategies

### How It Was Actually Found

**Manual code review during troubleshooting:**
1. User reported seeing `usa-card__container--actionable` class
2. Manual inspection of card component source
3. Comparison with official USWDS source code
4. Confirmed class doesn't exist in USWDS SCSS

**Why automation didn't catch it:**
- Validation looked for `usa-card__container` ✓ (found it)
- Validation didn't look for `usa-card__container--actionable` (wasn't checking)

### Better Detection Approaches

**1. USWDS Class Registry (Recommended)**
```javascript
// Build comprehensive list of all USWDS classes from source
const USWDS_CLASS_REGISTRY = {
  'card': [
    'usa-card',
    'usa-card__container',
    'usa-card__header',
    'usa-card__body',
    // ... all official classes
    // NO usa-card__container--actionable
  ]
};

// Validate that ONLY registered classes are used
function validateNoCustomModifiers(content, componentName) {
  const usedClasses = extractAllClasses(content);
  const allowedClasses = USWDS_CLASS_REGISTRY[componentName];

  const customClasses = usedClasses.filter(cls =>
    !allowedClasses.includes(cls) && cls.startsWith('usa-')
  );

  if (customClasses.length > 0) {
    return {
      issues: [`Custom USWDS-style classes found: ${customClasses.join(', ')}`]
    };
  }
}
```

**2. Pattern Matching for Modifiers**
```javascript
// Check for BEM modifier patterns that aren't in USWDS
function detectCustomModifiers(content) {
  // Match: usa-{component}__{element}--{modifier}
  const modifierPattern = /(usa-[\w-]+__[\w-]+)--([\w-]+)/g;
  const matches = content.matchAll(modifierPattern);

  for (const match of matches) {
    const fullClass = match[0];
    if (!isUSWDSClass(fullClass)) {
      issues.push(`Custom modifier found: ${fullClass}`);
    }
  }
}
```

**3. SCSS File Parsing**
```javascript
// Extract all classes from official USWDS SCSS files
function buildUSWDSClassRegistry() {
  const scssFiles = glob('node_modules/@uswds/uswds/**/*.scss');
  const allClasses = new Set();

  for (const file of scssFiles) {
    const content = readFileSync(file, 'utf8');
    // Parse .usa-* class definitions
    const classes = content.match(/\.usa-[\w-]+/g);
    classes.forEach(cls => allClasses.add(cls.slice(1))); // Remove leading dot
  }

  return allClasses;
}
```

**4. Runtime Style Validation**
```javascript
// In tests: Check if applied classes have actual CSS styles
function testClassHasStyles(element, className) {
  element.classList.add(className);
  const computedStyle = window.getComputedStyle(element);

  // Check if any CSS properties are affected
  const hasStyles = /* check for non-default styles */;

  if (!hasStyles) {
    warn(`Class ${className} has no styles - may not exist in USWDS`);
  }
}
```

## Proposed Enhancements

### Enhancement 1: Custom Class Detection (High Priority)

**Implementation:**
```javascript
// Add to validate-all-components-compliance.js

function validateNoCustomUSWDSClasses(content, componentName) {
  const issues = [];
  const successes = [];

  // Extract all class assignments
  const classMatches = content.matchAll(/class=["']([^"']+)["']/g);

  for (const match of classMatches) {
    const classes = match[1].split(/\s+/);

    for (const cls of classes) {
      // Check if it looks like a USWDS class but isn't registered
      if (cls.startsWith('usa-') && !isOfficialUSWDSClass(cls)) {
        issues.push(`Custom USWDS-style class found: ${cls} (not in official USWDS)`);
      }
    }
  }

  if (issues.length === 0) {
    successes.push('✓ No custom USWDS-style classes found');
  }

  return { issues, successes };
}

// Check against official USWDS classes
function isOfficialUSWDSClass(className) {
  // Load from pre-built registry or parse USWDS source
  return USWDS_OFFICIAL_CLASSES.has(className);
}
```

**Where to add:**
- Line ~850 in `validateComponent()` function
- Add as new validation stage alongside HTML, JS, CSS validation

**Validation Flow:**
```javascript
function validateComponent(componentName) {
  // ... existing validations ...
  const customClassResults = validateNoCustomUSWDSClasses(content, componentName);

  const issues = [
    ...htmlResults.issues,
    ...jsResults.issues,
    ...cssResults.issues,
    ...customClassResults.issues  // ← New validation
  ];
}
```

### Enhancement 2: USWDS Class Registry Builder (Medium Priority)

**Goal:** Build authoritative list of all USWDS classes from source

**Implementation:**
```bash
# New script: scripts/build/build-uswds-class-registry.js
```

```javascript
#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function buildUSWDSClassRegistry() {
  const scssFiles = await glob('node_modules/@uswds/uswds/**/*.scss');
  const classRegistry = {};

  for (const file of scssFiles) {
    const content = readFileSync(file, 'utf8');

    // Extract component name from path
    const componentMatch = file.match(/usa-([^/]+)\//);
    if (!componentMatch) continue;

    const componentName = componentMatch[1];
    if (!classRegistry[componentName]) {
      classRegistry[componentName] = new Set();
    }

    // Parse class definitions: .usa-* { }
    const classMatches = content.matchAll(/\.(usa-[\w-]+)(?:\s|:|,|{)/g);
    for (const match of classMatches) {
      classRegistry[componentName].add(match[1]);
    }
  }

  // Convert Sets to Arrays for JSON
  const registryObj = {};
  for (const [component, classes] of Object.entries(classRegistry)) {
    registryObj[component] = Array.from(classes).sort();
  }

  // Write to file
  writeFileSync(
    'scripts/validate/uswds-class-registry.json',
    JSON.stringify(registryObj, null, 2)
  );

  console.log(`✅ Built USWDS class registry: ${Object.keys(registryObj).length} components`);
}

buildUSWDSClassRegistry();
```

**Usage:**
```bash
# Run after installing/updating USWDS
npm run build:uswds-registry

# Use in validation
import classRegistry from './uswds-class-registry.json';
```

### Enhancement 3: Pre-commit Hook Enhancement (High Priority)

**Add to `.husky/pre-commit`:**
```bash
# Validate no custom USWDS classes
node scripts/validate/check-custom-uswds-classes.js
```

**New validator script:**
```javascript
// scripts/validate/check-custom-uswds-classes.js

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

// Get modified files
const modifiedFiles = execSync('git diff --cached --name-only')
  .toString()
  .split('\n')
  .filter(f => f.endsWith('.ts') && f.includes('/components/'));

let issuesFound = false;

for (const file of modifiedFiles) {
  const content = readFileSync(file, 'utf8');

  // Quick check for suspicious patterns
  const suspiciousClasses = content.match(/usa-\w+__\w+--\w+/g);

  if (suspiciousClasses) {
    console.error(`⚠️  Custom USWDS-style modifiers found in ${file}:`);
    suspiciousClasses.forEach(cls => {
      console.error(`   - ${cls}`);
    });
    issuesFound = true;
  }
}

if (issuesFound) {
  console.error('\n❌ Validation failed: Custom USWDS-style classes detected');
  console.error('💡 Verify these classes exist in official USWDS CSS');
  process.exit(1);
}
```

### Enhancement 4: Test-Time Validation (Medium Priority)

**Add to component tests:**
```typescript
// __tests__/uswds-class-validation.test.ts

describe('USWDS Class Validation', () => {
  it('should only use official USWDS classes', async () => {
    const element = document.createElement('usa-card');
    element.actionable = true;
    await element.updateComplete;

    // Get all classes from rendered component
    const allClasses = Array.from(element.querySelectorAll('*'))
      .flatMap(el => Array.from(el.classList))
      .filter(cls => cls.startsWith('usa-'));

    // Check each class against official registry
    const invalidClasses = allClasses.filter(cls =>
      !USWDS_OFFICIAL_CLASSES.includes(cls)
    );

    expect(invalidClasses).toEqual([]);
  });
});
```

## Recommendations

### Immediate Actions (Week 1)
1. ✅ **Fixed:** Remove `usa-card__container--actionable` (commit 2719dd6b)
2. ✅ **Added:** Quick pattern check in pre-commit hook (commit d8ef20bd)
3. ✅ **Added:** Custom class detection validator script (commit d8ef20bd)

### Short-Term (Month 1)
4. 📋 Build USWDS class registry from source
5. 📋 Add comprehensive custom class validation
6. 📋 Update validation documentation

### Long-Term (Quarter 1)
7. 📋 Automated registry updates on USWDS version change
8. 📋 Runtime style validation in tests
9. 📋 CI/CD integration with detailed reports

## Prevention Strategy

### Developer Education
- **Document:** "Only use classes that exist in USWDS CSS"
- **Examples:** Show correct vs incorrect patterns
- **Training:** Code review focus on USWDS compliance

### Tooling
- **IDE Hints:** VS Code extension warning about non-USWDS classes
- **Linting:** ESLint rule to detect custom USWDS-style classes
- **CI/CD:** Block PRs with custom classes

### Process
- **Code Review:** Mandatory USWDS class verification
- **Testing:** Automated class validation in test suite
- **Documentation:** Clear guidance on adding classes

## Success Metrics

**Validation Effectiveness:**
- ✅ Catch 100% of custom USWDS-style classes
- ✅ Zero false positives
- ✅ Fast execution (< 5 seconds)

**Developer Experience:**
- ✅ Clear error messages
- ✅ Suggested fixes
- ✅ Documentation links

**Maintainability:**
- ✅ Auto-updates with USWDS versions
- ✅ Minimal manual maintenance
- ✅ Well-documented

## Conclusion

The card component issue revealed a blind spot in our validation: we check for **presence** of required classes but not **absence** of prohibited classes.

**Root Cause:** Whitelist-only validation approach
**Solution:** Add blacklist validation for custom USWDS-style classes
**Priority:** High (prevents future compliance violations)
**Effort:** Medium (requires USWDS class registry + validation logic)

By implementing these enhancements, we can ensure true 100% USWDS compliance and catch issues like this automatically in the future.

---

**Last Updated:** 2025-10-12
**Status:** Analysis Complete, Enhancement 3 Implemented
**Next Action:** Consider Enhancement 2 (USWDS Class Registry Builder)

## Implementation Status

### ✅ Enhancement 3: Pre-commit Hook Enhancement (COMPLETED)

**Commit:** d8ef20bd
**Date:** 2025-10-12

**Implementation:**
- Created `scripts/validate/validate-no-custom-uswds-classes.js` (270 lines)
- Integrated into `.husky/pre-commit` at stage 4a/9
- Only scans modified components for performance
- Comprehensive false positive filtering
- Clear error reporting with USWDS verification guidance

**Key Features:**
```javascript
// FALSE_POSITIVE_PATTERNS - Filters legitimate cases
- Behavior imports: /-behavior$/
- Template literals: /\$\{/
- Known USWDS modifiers: /^usa-alert--(slim|no-icon|validation)$/
- 66 patterns total

// REAL_ISSUE_PATTERNS - Catches problematic patterns
- Custom container modifiers: /__container--\w+/
- Custom wrapper modifiers: /__wrapper--(?!sm|md|lg|xl)\w+/
- Custom suffixes: /-custom$/, /-new$/, /-modified$/, /-temp$/
```

**Validation Results:**
- Exits with error on custom class detection (blocks commit)
- Exits with warning on suspicious patterns (allows commit with notice)
- Skips validation when no components modified
- Fast execution (pattern-based, no SCSS parsing)

**Coverage:**
This implementation addresses the card component issue (`usa-card__container--actionable`) and prevents similar issues from being committed in the future.
