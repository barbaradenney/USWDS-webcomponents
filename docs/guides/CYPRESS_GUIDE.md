# Cypress Testing Guide

**Complete guide to Cypress testing in the USWDS Web Components library**

**Status**: ✅ 100% Coverage (46/46 components)
**Last Updated**: 2025-10-07

---

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Writing Cypress Tests](#writing-cypress-tests)
- [Pre-commit Integration](#pre-commit-integration)
- [CI/CD Integration](#cicd-integration)
- [Test Management](#test-management)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Component-Specific Guidance](#component-specific-guidance)

---

## Overview

This project has **100% Cypress test coverage** across all 46 components, providing comprehensive testing for:

- Component rendering and variants
- User interactions and keyboard navigation
- Form integration and validation
- Accessibility compliance (via axe-core)
- Responsive behavior across viewports
- Edge cases and error states

### Current Coverage

- **46/46 components** have Cypress tests ✅
- **58 total test files** (46 component + 12 timing regression)
- **100% automated coverage**
- **Navigation test suite** validates Storybook integration (25/25 passing)

### Test Files Location

All component tests are co-located with components:

```
src/components/[component]/usa-[component].component.cy.ts
```

### Related Documentation

- **Full Coverage Inventory**: `docs/CYPRESS_TESTING_STATUS.md`
- **Achievement Summary**: `docs/CYPRESS_TESTING_SUMMARY.md`
- **Navigation Test Results**: `docs/NAVIGATION_TEST_SUCCESS.md`

---

## Getting Started

### Quick Start Commands

```bash
# Run all component tests (headless)
npm run cypress:component

# Interactive mode for development
npm run cypress:component:open

# Run specific component test
npx cypress run --component --spec "src/components/modal/usa-modal.component.cy.ts"

# Run navigation tests (requires Storybook)
npm run storybook  # In one terminal
npm run cypress:navigation  # In another terminal

# Interactive navigation tests
npm run cypress:navigation:open
```

### Installation

Cypress is included in the project dependencies. If you need to install it:

```bash
npm install
```

### Configuration

Cypress is configured in `cypress.config.ts`:

- Component testing mode enabled
- Browser: Chrome (headless for CI)
- Custom commands available in `cypress/support/`

---

## Writing Cypress Tests

### Generating Test Templates

Use the test generator to create comprehensive test templates:

```bash
# Generate test for a component
npm run cypress:generate -- component-name

# Example
npm run cypress:generate -- modal
npm run cypress:generate -- combo-box
```

**What you get**:
- 6 test suites (Rendering, Accessibility, Interactions, Form, Responsive, Edge Cases)
- TODO comments for customization
- Complete test structure following best practices

### Test Structure Template

```typescript
/**
 * USA Component - Cypress Component Tests
 *
 * Tests component rendering, accessibility, and user interactions.
 *
 * @see src/components/component/README.mdx - Component API
 * @see docs/CYPRESS_GUIDE.md - Test patterns
 */

import { html } from 'lit';

describe('USA Component - Cypress Tests', () => {
  beforeEach(() => {
    cy.mount(html`<usa-component></usa-component>`);
    cy.waitForStorybook(); // CRITICAL - wait for USWDS initialization
  });

  describe('Rendering', () => {
    it('should render component', () => {
      cy.get('usa-component').should('exist');
    });

    it('should render all variants', () => {
      const variants = ['primary', 'secondary', 'accent'];
      variants.forEach(variant => {
        cy.mount(html`<usa-component variant="${variant}"></usa-component>`);
        cy.get('usa-component').should('have.class', `usa-component--${variant}`);
      });
    });
  });

  describe('Accessibility', () => {
    it('should pass axe accessibility tests', () => {
      cy.injectAxe();
      cy.checkA11y('usa-component');
    });

    it('should be keyboard navigable', () => {
      cy.get('usa-component').focus();
      cy.realPress('Tab');
      cy.focused().should('have.attr', 'role');
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', () => {
      cy.get('.usa-component__button').click();
      cy.get('.usa-component').should('have.class', 'active');
    });

    it('should emit custom events', () => {
      cy.get('usa-component').then($el => {
        const el = $el[0];
        const eventSpy = cy.spy();
        el.addEventListener('component-action', eventSpy);

        cy.wrap($el).find('[data-trigger]').click();
        cy.wrap(eventSpy).should('have.been.called');
      });
    });
  });

  describe('Form Integration', () => {
    it('should submit with form', () => {
      cy.mount(html`
        <form data-test-form>
          <usa-component name="field" value="test"></usa-component>
          <button type="submit">Submit</button>
        </form>
      `);

      const formData = [];
      cy.window().then(win => {
        win.document.querySelector('[data-test-form]').addEventListener('submit', e => {
          e.preventDefault();
          formData.push(new FormData(e.target));
        });
      });

      cy.get('button[type="submit"]').click();
      cy.wrap(formData).should('have.length', 1);
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt to mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.get('usa-component').should('be.visible');
    });
  });

  describe('Edge Cases', () => {
    it('should handle disabled state', () => {
      cy.mount(html`<usa-component disabled></usa-component>`);
      cy.get('.usa-component').should('have.attr', 'disabled');
    });
  });
});
```

### Test Implementation Patterns

#### Pattern 1: Interactive Component (Modal, Accordion, Date Picker)

Focus on user interactions, state changes, and USWDS behavior:

```typescript
describe('User Interactions', () => {
  it('should open on button click', () => {
    cy.get('[data-open-modal]').click();
    cy.get('.usa-modal-wrapper').should('be.visible');
    cy.get('.usa-modal').should('have.attr', 'aria-hidden', 'false');
  });

  it('should close on Escape key', () => {
    cy.get('[data-open-modal]').click();
    cy.get('.usa-modal-wrapper').should('be.visible');

    cy.realPress('Escape');
    cy.get('.usa-modal-wrapper').should('not.exist');
  });

  it('should trap focus within modal', () => {
    cy.get('[data-open-modal]').click();
    cy.focused().should('be.visible');

    // Tab through all focusable elements
    cy.realPress('Tab');
    cy.focused().should('be.within', '.usa-modal');
  });
});
```

#### Pattern 2: Form Component (Input, Checkbox, Select)

Focus on form integration, validation, and error states:

```typescript
describe('Form Integration', () => {
  it('should validate required field', () => {
    cy.mount(html`
      <usa-text-input required error="Field is required"></usa-text-input>
    `);

    cy.get('.usa-error-message').should('be.visible');
    cy.get('.usa-error-message').should('contain', 'Field is required');
  });

  it('should clear validation on input', () => {
    cy.mount(html`
      <usa-text-input required></usa-text-input>
    `);

    cy.get('input').type('value');
    cy.get('.usa-error-message').should('not.exist');
  });
});
```

#### Pattern 3: Presentational Component (Alert, Card, Tag)

Focus on rendering variants, content display, and accessibility:

```typescript
describe('Rendering', () => {
  it('should render all variants', () => {
    const variants = ['success', 'warning', 'error', 'info'];

    variants.forEach(variant => {
      cy.mount(html`<usa-alert variant="${variant}">Message</usa-alert>`);
      cy.get('usa-alert').should('have.class', `usa-alert--${variant}`);
    });
  });

  it('should handle slotted content', () => {
    cy.mount(html`
      <usa-card>
        <h3 slot="heading">Card Title</h3>
        <p>Card content</p>
      </usa-card>
    `);

    cy.get('usa-card h3').should('contain', 'Card Title');
    cy.get('usa-card p').should('contain', 'Card content');
  });
});
```

#### Pattern 4: Layout Component (Section, Collection, Grid)

Focus on structure, nesting, and responsive behavior:

```typescript
describe('Responsive Behavior', () => {
  it('should adapt to mobile viewport', () => {
    cy.viewport('iphone-x');
    cy.mount(html`
      <usa-section>
        <div class="grid-container">Content</div>
      </usa-section>
    `);

    cy.get('usa-section').should('be.visible');
    cy.get('.grid-container').should('have.css', 'max-width');
  });

  it('should stack on small screens', () => {
    cy.viewport(375, 667);
    cy.get('.grid-row').should('have.css', 'flex-direction', 'column');
  });
});
```

---

## Pre-commit Integration

### Current Status: ✅ Optional Opt-in

Cypress tests are available as an **optional pre-commit check** via environment variable.

### Usage

```bash
# Fast commits (default, ~30 seconds)
git commit -m "WIP: working on feature"

# Thorough validation with Cypress (~2-5 minutes)
CYPRESS_PRECOMMIT=1 git commit -m "feat: complete feature"
```

### Design Benefits

- ✅ Fast by default (no impact on existing workflow)
- ✅ Comprehensive when needed (before PR creation)
- ✅ Developer choice per commit
- ✅ CI always validates regardless

### What Gets Tested on Pre-commit

**Without CYPRESS_PRECOMMIT=1** (10 Stages, ~30 seconds):

1. Repository organization cleanup validation
2. USWDS script tag validation
3. Component issue detection
4. Component compliance checks
5. Linting (ESLint)
6. TypeScript type checking
7. Component-specific validations (7 checks)
8. Test expectations validation
9. USWDS transformation validation
10. JavaScript integration validation

**With CYPRESS_PRECOMMIT=1** (11 Stages, ~2-5 minutes):

All 10 stages above **PLUS**:

11. Cypress component tests (all 58 test files)

### Rapid Interaction Testing

When you modify component files with `CYPRESS_PRECOMMIT=1`, the pre-commit hook runs:

1. **Rapid clicking tests** - Catches timing bugs with multiple quick interactions
2. **Stress testing** - Tests components under extreme rapid clicking (20+ clicks)
3. **Memory leak tests** - Validates proper cleanup during rapid mounting/unmounting
4. **CSS transition timing** - Catches race conditions during animations

### What This Prevents

- ✅ Timing bugs caught during development before commit
- ✅ Rapid interaction patterns tested for all modified components
- ✅ Critical regression prevention (e.g., accordion expansion/collapse timing)
- ✅ Consistent testing across all 46 components

---

## CI/CD Integration

### GitHub Actions Integration ✅

Cypress tests are **fully integrated** into the CI/CD pipeline and run automatically on every push and pull request.

#### Primary Quality Checks Workflow

**File**: `.github/workflows/quality-checks.yml`

**Runs on**: Every push to `main`/`develop` and all pull requests

**Cypress Integration**:

```yaml
component-tests:
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run Cypress component tests
      run: npm run cypress:component

    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: cypress-results
        path: cypress/results/
```

**What This Tests**:
- ✅ All 46 component Cypress tests
- ✅ All 12 timing regression tests
- ✅ Total: 58 Cypress test files run on every commit

#### Comprehensive Testing Workflow

**File**: `.github/workflows/comprehensive-testing.yml`

**Runs on**: Daily schedule (2 AM UTC) + manual trigger + push/PR

**Includes**:
- Core Tests (unit tests, linting, type checking)
- Accessibility Tests (Storybook test runner with axe-core)
- Security Tests
- Cross-browser Tests (Chromium, Firefox, WebKit, Mobile)
- Integration Tests
- Performance Tests (conditional)
- Visual Tests (conditional)

### Development Workflow

```
Developer writes code
    ↓
git add .
    ↓
Pre-commit hook runs (10-11 validation stages)
    ├─ Linting ✅
    ├─ Type checking ✅
    ├─ USWDS validation ✅
    ├─ Component compliance ✅
    └─ Cypress tests (optional) ✅
    ↓
git commit succeeds
    ↓
git push origin feature-branch
    ↓
GitHub Actions triggered
    ├─ Unit tests ✅
    ├─ Cypress component tests ✅ (ALL 58 test files)
    ├─ Storybook accessibility tests ✅
    ├─ Build validation ✅
    └─ Coverage reports ✅
    ↓
Pull request created
    ↓
Comprehensive testing workflow
    ├─ Cross-browser tests ✅
    ├─ Security tests ✅
    ├─ Performance tests ✅
    └─ Visual regression ✅
    ↓
Code review + merge
```

### Test Execution Times

- **Pre-commit (default)**: ~30 seconds
- **Pre-commit (with Cypress)**: ~2-5 minutes
- **CI Cypress tests**: ~2-5 minutes
- **Full CI pipeline**: ~10-15 minutes

---

## Test Management

### Test Health Monitoring

```bash
# Validate test health
npm run test:validate-health

# Detect flaky tests
npm run test:flaky-detection

# Performance monitoring
npm run test:performance:monitor
```

### Skipped Tests Validation

Some tests are skipped in Cypress due to USWDS event delegation limitations in isolated component environments. These features work correctly in Storybook and production.

**Skipped Tests**:

1. **Date Picker** (2 tests):
   - Month navigation immediate response
   - Min date constraint enforcement

2. **Modal** (3 tests):
   - Force-action mode Escape key blocking
   - Programmatic open on first call
   - Programmatic close on first call

**Validation**: See `docs/CYPRESS_SKIPPED_TESTS_VALIDATION.md` for manual validation steps in Storybook.

**Confidence Level**: **HIGH** - These features work correctly in production environments where USWDS is loaded globally.

### Test Coverage by Component Type

#### Interactive (13 components) ✅

All tested with comprehensive interaction tests:
- Accordion, Combo Box, Date Picker, Date Range Picker, File Input
- Header, Menu, Modal, Search, Side Navigation
- Table, Time Picker, Tooltip

#### Forms (10 components) ✅

All tested with form integration tests:
- Character Count, Checkbox, Input Prefix/Suffix, Memorable Date, Radio
- Range Slider, Select, Text Input, Textarea, Validation

#### Presentational (13 components) ✅

All tested with rendering and accessibility tests:
- Alert, Banner, Breadcrumb, Button, Button Group, Card
- Icon, Identifier, Link, List, Site Alert, Summary Box, Tag

#### Layout (10 components) ✅

All tested with responsive behavior tests:
- Collection, Footer, In-Page Navigation, Language Selector, Pagination
- Process List, Prose, Section, Skip Link, Step Indicator

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Component Not Found

**Problem**: `cy.get('usa-component')` fails immediately

**Solution**: Increase timeout or check selector
```typescript
cy.get('usa-component', { timeout: 10000 }).should('exist');
```

#### Issue: USWDS Features Not Working

**Problem**: USWDS-enhanced behavior not present

**Solution**: Add delay for USWDS initialization
```typescript
cy.waitForStorybook();
cy.wait(100); // Additional wait for USWDS
```

#### Issue: Modal Stays Open Between Tests

**Problem**: Modal persists between test runs

**Solution**: Clean up in afterEach
```typescript
afterEach(() => {
  cy.get('.usa-modal-wrapper').should('not.exist');
  // Or force remove if needed
  cy.get('body').then($body => {
    $body.find('.usa-modal-wrapper').remove();
    $body.find('.usa-overlay').remove();
  });
});
```

#### Issue: Flaky Tests

**Problem**: Tests pass sometimes, fail others

**Solution**: Use proper waits and assertions
```typescript
// ❌ FLAKY
cy.get('.element').click();
cy.get('.result').should('exist');

// ✅ STABLE
cy.get('.element').should('be.visible').click();
cy.get('.result', { timeout: 5000 }).should('be.visible');
```

### Debug Strategies

```bash
# Run single test interactively
npm run cypress:component:open
# Then select your component test file

# Run with verbose logging
DEBUG=cypress:* npm run cypress:component

# Run specific test with video
npx cypress run --component --spec "path/to/test.cy.ts" --config video=true
```

---

## Best Practices

### 1. Always Use cy.waitForStorybook()

**CRITICAL** - Wait for USWDS initialization:

```typescript
beforeEach(() => {
  cy.mount(html`<usa-component></usa-component>`);
  cy.waitForStorybook(); // Wait for double requestAnimationFrame
});
```

**Why**: USWDS components have async initialization that requires proper timing.

### 2. Use Web Component Selectors

Prefer `usa-component` over `.usa-component`:

```typescript
// ✅ GOOD - Component exists immediately
cy.get('usa-modal').should('exist');

// ❌ AVOID - USWDS class appears after initialization
cy.get('.usa-modal').should('exist');
```

### 3. Test Functional Behavior, Not Implementation

```typescript
// ✅ GOOD - Tests user experience
it('should open modal when button clicked', () => {
  cy.get('[data-open-modal]').click();
  cy.get('.usa-modal-wrapper').should('be.visible');
});

// ❌ AVOID - Tests internal state
it('should set isOpen property', () => {
  cy.get('usa-modal').invoke('prop', 'isOpen').should('be.true');
});
```

### 4. Handle USWDS Timing

USWDS components have async initialization:

```typescript
it('should work after USWDS initialization', () => {
  cy.get('usa-component').should('exist');
  cy.wait(100); // Wait for USWDS enhancement
  cy.get('.usa-component__button').click();
});
```

### 5. Clean Up Between Tests

```typescript
afterEach(() => {
  // Remove any USWDS-created elements
  cy.get('body').then($body => {
    $body.find('.usa-modal-wrapper').remove();
    $body.find('.usa-overlay').remove();
  });
});
```

### 6. Test Keyboard Navigation

All interactive components MUST support keyboard:

```typescript
it('should be keyboard navigable', () => {
  cy.get('usa-component').focus();
  cy.realPress('Tab');
  cy.focused().should('have.class', 'usa-component__next-element');

  cy.realPress('Enter');
  // Verify action triggered
});
```

### 7. Use Accessibility Helpers

Leverage cypress-axe for comprehensive a11y testing:

```typescript
it('should pass axe accessibility tests', () => {
  cy.injectAxe();
  cy.checkA11y('usa-component', {
    rules: {
      'color-contrast': { enabled: true },
      'aria-required-attr': { enabled: true },
    },
  });
});
```

---

## Component-Specific Guidance

### Modal

**Key Tests**:
- Open/close via button click
- Force-action modal (no close button)
- Keyboard close (Escape key)
- Focus trap validation
- Backdrop click handling

**Example**:
```typescript
it('should close on Escape key', () => {
  cy.get('[data-open-modal]').click();
  cy.get('.usa-modal-wrapper').should('be.visible');

  cy.realPress('Escape');
  cy.get('.usa-modal-wrapper').should('not.exist');
});
```

### Combo Box

**Key Tests**:
- Typeahead filtering
- Keyboard navigation (Arrow keys)
- Option selection
- Clear functionality
- No results state

**Example**:
```typescript
it('should filter options on type', () => {
  cy.get('input[type="text"]').type('apple');
  cy.get('.usa-combo-box__list-option').should('have.length.lessThan', 10);
  cy.get('.usa-combo-box__list-option').first().should('contain', 'apple');
});
```

### Date Picker

**Key Tests**:
- Calendar open/close
- Date selection
- Keyboard input
- Min/max date validation
- Date format display

**Example**:
```typescript
it('should select date from calendar', () => {
  cy.get('.usa-date-picker__button').click();
  cy.get('.usa-date-picker__calendar').should('not.have.attr', 'hidden');

  cy.get('.usa-date-picker__calendar__date').first().click();
  cy.get('input').should('have.value').and('match', /\d{2}\/\d{2}\/\d{4}/);
});
```

### Header

**Key Tests**:
- Mobile menu toggle
- Mega menu interactions
- Search toggle
- Responsive behavior
- Navigation clicks

**Example**:
```typescript
it('should toggle mobile menu', () => {
  cy.viewport('iphone-x');
  cy.get('.usa-menu-btn').click();
  cy.get('.usa-nav').should('be.visible');

  cy.get('.usa-menu-btn').click();
  cy.get('.usa-nav').should('not.be.visible');
});
```

### Table

**Key Tests**:
- Sorting functionality
- Row selection
- Responsive stacking
- Pagination (if applicable)
- Accessibility (sortable headers)

**Example**:
```typescript
it('should sort columns', () => {
  cy.get('button[data-sortable]').first().click();
  cy.get('button[data-sortable]').first().should('have.attr', 'aria-sort', 'ascending');

  cy.get('button[data-sortable]').first().click();
  cy.get('button[data-sortable]').first().should('have.attr', 'aria-sort', 'descending');
});
```

---

## Test Quality Checklist

For each component test, verify:

- [ ] All 6 test suites implemented (Rendering, Accessibility, Interactions, Form, Responsive, Edge Cases)
- [ ] Accessibility tests pass with axe-core
- [ ] Keyboard navigation tested
- [ ] All component variants covered
- [ ] Tests pass in headless mode
- [ ] No flaky tests (run 5 times successfully)
- [ ] Documentation updated with component specifics
- [ ] TODO comments replaced with real tests

### Coverage Goals

- **Interactive Components**: 10+ tests per component
- **Form Components**: 8+ tests per component
- **Presentational Components**: 6+ tests per component
- **Layout Components**: 4+ tests per component

---

## Success Metrics

### Achieved ✅

- [x] 100% component coverage (46/46)
- [x] Navigation test suite (25/25 passing)
- [x] Timing regression coverage (12 high-risk components)
- [x] Test infrastructure ready
- [x] Documentation complete

### Ongoing

- [ ] >95% test reliability (monitor with `npm run test:validate-health`)
- [ ] <5 minutes total execution time
- [ ] Zero flaky tests (monitor with `npm run test:flaky-detection`)

---

## Resources

- **Cypress Docs**: https://docs.cypress.io/
- **cypress-axe**: https://github.com/component-driven/cypress-axe
- **USWDS Components**: https://designsystem.digital.gov/components/
- **Navigation Test Suite**: `cypress/e2e/storybook-navigation-test.cy.ts` - Reference implementation

---

## Quick Reference

```bash
# Component Testing
npm run cypress:component          # All tests (headless)
npm run cypress:component:open     # Interactive mode

# Navigation Testing (requires Storybook)
npm run cypress:navigation         # All navigation tests
npm run cypress:navigation:open    # Interactive mode

# Specific Component
npx cypress run --component --spec "src/components/modal/usa-modal.component.cy.ts"

# Generate Test Template
npm run cypress:generate -- component-name

# Pre-commit with Cypress
CYPRESS_PRECOMMIT=1 git commit -m "message"

# Test Health
npm run test:validate-health       # Comprehensive validation
npm run test:flaky-detection       # Detect flaky tests
```

---

**Related Guides**:
- `docs/guides/TESTING_GUIDE.md` - Complete testing strategy
- `docs/DEBUGGING_GUIDE.md` - Troubleshooting help
- `docs/CYPRESS_TESTING_STATUS.md` - Detailed coverage inventory
