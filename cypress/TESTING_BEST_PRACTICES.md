# Cypress Testing Best Practices for USWDS Web Components

**Last Updated**: 2025-10-18
**Version**: 1.0
**Status**: Official Testing Guide

This guide documents best practices for writing Cypress E2E tests for USWDS web components built with Lit. Following these patterns ensures tests are reliable, maintainable, and work correctly with our architecture.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Storybook 9 Iframe Pattern](#storybook-9-iframe-pattern)
3. [Component Creation Patterns](#component-creation-patterns)
4. [Lit and innerHTML Constraints](#lit-and-innerhtml-constraints)
5. [Component API Patterns](#component-api-patterns)
6. [Common Anti-Patterns](#common-anti-patterns)
7. [Test Organization](#test-organization)
8. [Debugging Failed Tests](#debugging-failed-tests)

---

## Quick Start

### ✅ Correct Test Template

```typescript
describe('Component Name - Test Suite', () => {
  beforeEach(() => {
    // ALWAYS use Storybook iframe pattern
    cy.visit('/iframe.html?id=components-component-name--default&viewMode=story');
    cy.wait(1000); // Wait for USWDS initialization

    // Inject accessibility testing
    cy.injectAxe();
  });

  it('should test component behavior', () => {
    // Get component reference
    cy.get('usa-component-name').should('exist');

    // Test functionality
    cy.get('usa-component-name').within(() => {
      cy.get('.usa-component__element').should('be.visible');
    });

    // Run accessibility checks
    cy.checkA11y('usa-component-name');
  });
});
```

### ❌ Incorrect Patterns (DO NOT USE)

```typescript
// DON'T: Use Storybook 6 pattern
cy.visit('/?path=/story/components-component-name--default');

// DON'T: Wait for #storybook-root (doesn't exist in Storybook 9)
cy.get('#storybook-root').should('be.visible');

// DON'T: Create components with innerHTML
cy.document().then((doc) => {
  doc.body.innerHTML = '<usa-component>...</usa-component>';
});
```

---

## Storybook 9 Iframe Pattern

### Why Iframe Pattern?

Storybook 9 renders stories in an iframe for isolation. The iframe pattern is the **official best practice** for testing Storybook components.

**Official Documentation**: https://storybook.js.org/docs/writing-tests/integrations/stories-in-end-to-end-tests

### Pattern Details

#### ✅ Correct: Iframe Pattern

```typescript
// Visit story using iframe.html direct rendering
cy.visit('/iframe.html?id=components-modal--default&viewMode=story');

// Wait for component mount + USWDS initialization
cy.wait(1000);

// Components render directly in body (no #storybook-root)
cy.get('body').should('be.visible');
```

#### ❌ Incorrect: Storybook 6 Pattern (Deprecated)

```typescript
// DON'T: This loads the docs page, not the component
cy.visit('/?path=/story/components-modal--default');

// DON'T: This element doesn't exist in Storybook 9
cy.get('#storybook-root').should('be.visible');
```

### Story ID Format

Story IDs follow the pattern: `category-component-name--story-name`

Examples:
- `components-modal--default`
- `components-character-count--textarea`
- `components-footer--medium`

To find a story ID:
1. Open the story in Storybook
2. Look at the URL: `/iframe.html?id=STORY-ID-HERE&viewMode=story`
3. Use that ID in your test

### Custom Commands

We provide custom commands that handle the iframe pattern:

```typescript
// Use cy.selectStory() for convenience
cy.selectStory('components-modal', 'default');

// Equivalent to:
cy.visit('/iframe.html?id=components-modal--default&viewMode=story');
cy.wait(1000);
cy.waitForStorybook();
```

**Implementation**: See `cypress/support/commands.ts`

---

## Component Creation Patterns

### Use Stories as Fixtures (Recommended)

**✅ Best Practice**: Use existing Storybook stories as test fixtures

```typescript
beforeEach(() => {
  // Use the story that matches your test scenario
  cy.visit('/iframe.html?id=components-modal--default&viewMode=story');
  cy.wait(1000);
});

it('should test modal functionality', () => {
  // Component is already rendered by story
  cy.get('usa-modal').should('exist');

  // Test interactions
  cy.get('[data-open-modal]').click();
  cy.get('.usa-modal-wrapper').should('be.visible');
});
```

**Advantages**:
- Consistent with production usage
- Tests real component configuration
- Matches Storybook documentation
- No manual component creation needed

### Programmatic Creation (Advanced)

**⚠️ Use Only When Necessary**: For dynamic test scenarios that can't use stories

```typescript
beforeEach(() => {
  cy.visit('/iframe.html?id=components-blank--default&viewMode=story');
  cy.wait(500);
});

it('should handle programmatic creation', () => {
  cy.document().then((doc) => {
    // Use createElement + appendChild (Lit-compatible)
    const component = doc.createElement('usa-component-name');
    component.setAttribute('property', 'value');

    // For property-based APIs
    (component as any).sections = [{title: 'Test', links: []}];

    // Append to body
    doc.body.appendChild(component);
  });

  cy.wait(500); // Allow component to initialize

  cy.get('usa-component-name').should('exist');
});
```

**When to Use Programmatic Creation**:
- Testing dynamic component creation/destruction
- Testing component lifecycle edge cases
- No suitable story exists for the scenario

**When NOT to Use**:
- Testing standard component features (use stories)
- Testing component variations (create stories instead)
- When you're unsure (default to using stories)

---

## Lit and innerHTML Constraints

### The Problem with innerHTML

Lit uses comment markers (`<!-- lit-part -->`) to track where to update content in Light DOM. Using `innerHTML` on a web component **destroys these markers**, breaking the component.

### Rules

#### ✅ Correct: createElement + appendChild for Web Components

```typescript
cy.document().then((doc) => {
  // Create the web component
  const component = doc.createElement('usa-component-name');

  // Set properties (NOT innerHTML)
  (component as any).property = 'value';

  // Create content elements
  const content = doc.createElement('div');
  content.innerHTML = '<p>Regular HTML is OK here</p>'; // innerHTML on regular HTML is fine

  // Append using DOM APIs
  component.appendChild(content);
  doc.body.appendChild(component);
});
```

#### ❌ Incorrect: innerHTML on Web Components

```typescript
cy.document().then((doc) => {
  // DON'T: This breaks Lit's ChildPart tracking
  doc.body.innerHTML = `
    <usa-component-name>
      <div>Content</div>
    </usa-component-name>
  `;
});
```

### When innerHTML Is OK

innerHTML is **safe to use** on regular HTML elements (not web components):

```typescript
// ✅ OK: innerHTML on regular div
const wrapper = doc.createElement('div');
wrapper.innerHTML = '<p>Regular HTML content</p>';

// ✅ OK: innerHTML for non-component slot content
const nav = doc.createElement('nav');
nav.innerHTML = '<ul><li>Item</li></ul>';
component.appendChild(nav);
```

### Reference

**Lit Documentation**: https://lit.dev/docs/tools/testing/
**Open-WC Patterns**: https://open-wc.org/docs/testing/testing-package/

---

## Component API Patterns

### Property-Based APIs

Some components use **property-based APIs** instead of or in addition to slotted content.

#### Example: Footer Component

```typescript
// ✅ Correct: Use property API
cy.document().then((doc) => {
  const footer = doc.createElement('usa-footer');

  // Set properties
  footer.variant = 'medium';
  footer.agencyName = 'Example Agency';
  footer.sections = [
    {
      title: 'About',
      links: [
        { label: 'Mission', href: '/about/mission' },
        { label: 'History', href: '/about/history' }
      ]
    }
  ];

  doc.body.appendChild(footer);
});

// ❌ Incorrect: Try to use slots (footer doesn't support this)
cy.document().then((doc) => {
  doc.body.innerHTML = `
    <usa-footer>
      <nav slot="primary">
        <a href="/about">About</a>
      </nav>
    </usa-footer>
  `;
});
```

### How to Determine Component API

**Before writing tests**:

1. **Check Storybook stories** (`src/components/[component]/[component].stories.ts`)
   - Look at how stories create the component
   - Property-based: Uses `.property=${value}` syntax
   - Slot-based: Uses HTML children

2. **Check component README** (`src/components/[component]/README.mdx`)
   - Documents API and usage patterns

3. **Check component implementation** (`src/components/[component]/[component].ts`)
   - Look for `@property()` decorators (property-based)
   - Look for `<slot>` in render method (slot-based)

### Mixed APIs

Some components support both:

```typescript
// Modal: Supports both properties and slots
const modal = doc.createElement('usa-modal');
modal.heading = 'Title';  // Property
modal.forceAction = true;  // Property

// Also accepts slotted content
const content = doc.createElement('div');
content.innerHTML = '<p>Modal content</p>';
modal.appendChild(content); // Slot
```

---

## Common Anti-Patterns

### 1. Nested Cypress Commands in .then()

❌ **Anti-Pattern**: Causes timing issues

```typescript
cy.get('usa-footer a').then(($links) => {
  const count = $links.length;

  // DON'T: Nested Cypress commands create timing problems
  for (let i = 0; i < count; i++) {
    cy.wrap($links.eq(i)).click();
  }
});
```

✅ **Correct Pattern**: Keep commands in chain

```typescript
// Store count as alias
cy.get('usa-footer a').its('length').as('linkCount');

// Use direct Cypress commands
for (let i = 0; i < 5; i++) {
  cy.get('usa-footer a').eq(i).click();
  cy.wait(50);
}
```

### 2. Assuming All Components Work the Same

❌ **Anti-Pattern**: Use same pattern for all components

```typescript
// Assuming all components accept slotted HTML
doc.body.innerHTML = '<usa-footer><nav>...</nav></usa-footer>';
doc.body.innerHTML = '<usa-modal><div>...</div></usa-modal>';
```

✅ **Correct Pattern**: Check component API first

```typescript
// Footer: Uses property API
const footer = doc.createElement('usa-footer');
footer.sections = [{...}];

// Modal: Accepts slotted content
const modal = doc.createElement('usa-modal');
modal.appendChild(content);
```

### 3. Not Preventing Navigation

❌ **Anti-Pattern**: Clicking links navigates away

```typescript
it('should handle link clicks', () => {
  cy.get('usa-footer a').first().click();
  // Test navigation away from story, causing timeout
});
```

✅ **Correct Pattern**: Use stories with event handlers or prevent default

```typescript
// Option 1: Use story with event handlers (best)
cy.visit('/iframe.html?id=components-footer--interactive-demo');

// Option 2: Prevent navigation in test
beforeEach(() => {
  cy.window().then((win) => {
    win.document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        e.preventDefault();
      }
    }, true);
  });
});
```

### 4. Testing Implementation Details

❌ **Anti-Pattern**: Test internal state

```typescript
cy.get('usa-modal').then(($modal) => {
  const modal = $modal[0] as any;
  expect(modal._internalState).to.equal('open'); // Testing private state
});
```

✅ **Correct Pattern**: Test observable behavior

```typescript
// Test what users see and interact with
cy.get('.usa-modal-wrapper')
  .should('be.visible')
  .and('have.class', 'is-visible');
```

### 5. Insufficient Wait Times

❌ **Anti-Pattern**: Not waiting for USWDS initialization

```typescript
beforeEach(() => {
  cy.visit('/iframe.html?id=components-modal--default');
  // Immediately test - USWDS may not be initialized
});
```

✅ **Correct Pattern**: Wait for initialization

```typescript
beforeEach(() => {
  cy.visit('/iframe.html?id=components-modal--default&viewMode=story');
  cy.wait(1000); // Wait for component mount + USWDS initialization
});
```

---

## Test Organization

### File Naming

```
cypress/e2e/[component-name]-[test-type].cy.ts
```

Examples:
- `modal-focus-management.cy.ts`
- `character-count-accessibility.cy.ts`
- `footer-rapid-clicks.cy.ts`

### Test Structure

```typescript
/**
 * Component Name - Test Type
 *
 * Brief description of what these tests cover and why they need E2E testing.
 *
 * Migrated from: [source if applicable]
 * Related: [links to related tests or docs]
 */

describe('Component Name - Test Type', () => {
  beforeEach(() => {
    // Setup code here
    cy.visit('/iframe.html?id=...');
    cy.wait(1000);
    cy.injectAxe();
  });

  describe('Feature Group 1', () => {
    it('should test specific behavior', () => {
      // Test code
    });
  });

  describe('Feature Group 2', () => {
    it('should test another behavior', () => {
      // Test code
    });
  });
});
```

### When to Create E2E Tests

**✅ Create E2E Tests For**:
- Browser-specific behavior (focus management, scroll)
- ARIA live region announcements
- Complex user interactions (drag and drop)
- Integration between components
- Accessibility validation (axe-core)

**❌ Don't Create E2E Tests For**:
- Simple property changes (unit test)
- Render output (unit test)
- Isolated component logic (unit test)
- Fast-running validations (unit test)

---

## Debugging Failed Tests

### Step 1: Identify Failure Type

#### Infrastructure Failure

**Symptoms**:
- Component not found
- Timeout waiting for elements
- Many unrelated tests failing

**Check**:
```typescript
// Is the story loading?
cy.visit('/iframe.html?id=components-modal--default&viewMode=story');
cy.get('usa-modal').should('exist'); // Does this pass?
```

**Common Causes**:
- Wrong story ID
- Story doesn't exist
- Storybook not running
- Using old Storybook 6 pattern

#### Component Behavior Failure

**Symptoms**:
- Component exists but doesn't behave correctly
- Specific assertions fail
- Related tests in other files pass

**Check**:
- Open the story in Storybook manually
- Does the component work there?
- Does the test match how the component actually works?

**Common Causes**:
- Component bug
- Test expects wrong behavior
- Missing USWDS initialization
- Timing issue (add waits)

#### Test Design Failure

**Symptoms**:
- Test works in isolation but fails in suite
- Flaky (sometimes passes, sometimes fails)
- Test navigation causing issues

**Common Causes**:
- Not using story as fixture
- Incorrect component API usage
- innerHTML on web components
- Navigation not prevented

### Step 2: Common Fixes

#### Fix: Component Not Found

```typescript
// Check story ID is correct
cy.visit('/iframe.html?id=components-modal--default&viewMode=story');

// Verify in browser: Open Storybook and check URL

// Ensure proper wait time
cy.wait(1000);
```

#### Fix: USWDS Not Initialized

```typescript
// Increase wait time
cy.wait(1500);

// Or check for specific element that indicates initialization
cy.get('.usa-modal').should('exist');
```

#### Fix: innerHTML Breaking Component

```typescript
// Change from innerHTML
doc.body.innerHTML = '<usa-modal>content</usa-modal>';

// To createElement + appendChild
const modal = doc.createElement('usa-modal');
const content = doc.createElement('div');
content.innerHTML = '<p>Content</p>'; // OK on regular elements
modal.appendChild(content);
doc.body.appendChild(modal);
```

### Step 3: Verify With Working Examples

Compare your test with known working tests:

**Perfect Examples** (100% passing):
- `modal-programmatic-api.cy.ts`
- `language-selector-behavior.cy.ts`
- `combo-box-dom-structure.cy.ts`

**Check**:
1. How do they visit stories?
2. How do they wait for initialization?
3. How do they interact with components?
4. Copy their patterns

---

## Summary

### Core Principles

1. **Use Storybook iframe pattern** - `/iframe.html?id=...&viewMode=story`
2. **Use stories as fixtures** - Don't create components manually unless necessary
3. **Check component API** - Property-based vs slot-based
4. **No innerHTML on web components** - Use `createElement()` + `appendChild()`
5. **Wait for initialization** - `cy.wait(1000)` after visiting story
6. **Test behavior, not implementation** - Focus on user-observable behavior

### Quick Reference

```typescript
// ✅ Perfect test template
describe('Component - Feature', () => {
  beforeEach(() => {
    cy.visit('/iframe.html?id=components-name--story&viewMode=story');
    cy.wait(1000);
    cy.injectAxe();
  });

  it('should test feature', () => {
    cy.get('usa-component').should('exist');
    cy.get('usa-component').within(() => {
      cy.get('.element').should('be.visible');
    });
    cy.checkA11y('usa-component');
  });
});
```

### When In Doubt

1. Check existing tests (especially 100% passing ones)
2. Check component Storybook stories
3. Check this guide
4. Ask for review

---

## References

- **Storybook 9 Testing**: https://storybook.js.org/docs/writing-tests/integrations/stories-in-end-to-end-tests
- **Lit Testing**: https://lit.dev/docs/tools/testing/
- **Open-WC**: https://open-wc.org/docs/testing/testing-package/
- **Cypress Best Practices**: https://docs.cypress.io/guides/references/best-practices

---

**Document Status**: Official guide as of Session 8 (2025-10-18)
**Maintainer**: Testing team
**Questions**: See project documentation or ask team
