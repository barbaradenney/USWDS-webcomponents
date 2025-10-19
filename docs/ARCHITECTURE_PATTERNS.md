# Architecture Patterns Guide

**Complete guide to component architecture and testing strategies in the USWDS Web Components library**

**Last Updated**: 2025-10-07

---

## Table of Contents

- [Overview](#overview)
- [Component Architecture](#component-architecture)
- [Testing Strategies](#testing-strategies)
  - [Behavioral Testing](#behavioral-testing)
  - [Browser Testing](#browser-testing)
  - [Critical Path Testing](#critical-path-testing)
  - [Interaction Testing](#interaction-testing)
  - [Overall Testing Strategy](#overall-testing-strategy)
- [Best Practices](#best-practices)
- [Component Templates](#component-templates)

---

## Overview

This guide consolidates all architecture patterns and testing strategies used in the USWDS Web Components library. It provides comprehensive guidance on component structure, testing approaches, and quality assurance practices.

### Key Principles

1. **USWDS First**: All components follow USWDS patterns and behaviors
2. **Multi-layer Testing**: Comprehensive testing across all layers
3. **Behavioral Validation**: Test what users experience, not just structure
4. **Critical Path Coverage**: Ensure essential functionality never breaks
5. **Accessibility**: Built-in a11y validation at all levels

---

## Component Architecture

### Component Structure Requirements

Each component must follow this standardized structure:

```
src/components/[component]/
├── usa-[component].ts                    # Component implementation
├── usa-[component].test.ts               # Unit tests
├── usa-[component].component.cy.ts       # Cypress tests
├── usa-[component].stories.ts            # Storybook stories
├── usa-[component]-behavior.ts           # USWDS behavior (if complex)
├── README.mdx                            # Component documentation
├── CHANGELOG.mdx                         # Version history
├── TESTING.mdx                           # Testing documentation
└── index.ts                              # Component exports
```

### USWDS Component Template

```typescript
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '../../utils/base-component.js';

// Import official USWDS compiled CSS
import '../../styles/styles.css';

/**
 * USA Component Web Component
 *
 * @element usa-component
 * @fires component-event - Dispatched when component state changes
 *
 * @see README.mdx - Complete API documentation and usage examples
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-component/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-component/src/styles/_usa-component.scss
 * @uswds-docs https://designsystem.digital.gov/components/component/
 */
@customElement('usa-component')
export class USAComponent extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  variant = 'primary';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  // Store USWDS module for proper cleanup
  private uswdsModule: any = null;
  private uswdsInitialized = false;

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag
    this.setAttribute('data-web-component-managed', 'true');

    // Apply attributes BEFORE USWDS reads them
    setTimeout(() => {
      this.applyComponentAttributes();
    }, 0);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupUSWDS();
  }

  override firstUpdated() {
    super.firstUpdated();

    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    // Apply attributes immediately if children are available
    this.applyComponentAttributes();

    // Initialize USWDS after attributes are applied
    setTimeout(() => {
      this.initializeUSWDS();
    }, 10);
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Always re-apply attributes to handle DOM changes
    this.applyComponentAttributes();

    // Update transformed elements if USWDS already initialized
    if (changedProperties.has('variant') && this.uswdsInitialized) {
      this.updateTransformedElements();
    }
  }

  /**
   * Apply component attributes to handle both pre and post-USWDS initialization
   */
  private applyComponentAttributes() {
    // Strategy 1: Handle USWDS-transformed elements (post-initialization)
    const transformedElements = Array.from(
      this.querySelectorAll('.usa-component__trigger')
    ) as HTMLElement[];

    // Strategy 2: Handle pre-initialization elements
    const preInitElements = Array.from(
      this.querySelectorAll('.usa-component')
    ) as HTMLElement[];

    // Strategy 3: Handle original trigger elements
    const directChildren = Array.from(this.children).filter(
      child => child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'SLOT'
    ) as HTMLElement[];

    // Combine all possible elements, avoiding duplicates
    const allElements = [...new Set([
      ...transformedElements,
      ...preInitElements,
      ...directChildren
    ])];

    // Apply attributes to all discovered elements
    allElements.forEach(element => {
      if (element.classList.contains('usa-component__trigger')) {
        this.updateTransformedElement(element);
      } else {
        this.setupPreInitElement(element);
      }
    });
  }

  /**
   * Setup element before USWDS initialization
   */
  private setupPreInitElement(element: HTMLElement) {
    element.classList.add('usa-component');
    element.setAttribute('data-variant', this.variant);

    if (this.disabled) {
      element.setAttribute('disabled', '');
    }
  }

  /**
   * Update element after USWDS transformation
   */
  private updateTransformedElement(element: HTMLElement) {
    element.setAttribute('data-variant', this.variant);

    if (this.disabled) {
      element.setAttribute('disabled', '');
    } else {
      element.removeAttribute('disabled');
    }
  }

  /**
   * Update all transformed elements (for property changes)
   */
  private updateTransformedElements() {
    const transformedElements = [
      ...Array.from(this.querySelectorAll('.usa-component__trigger'))
    ] as HTMLElement[];

    transformedElements.forEach(element => {
      this.updateTransformedElement(element);
    });
  }

  /**
   * Initialize USWDS module
   */
  private async initializeUSWDS() {
    if (this.uswdsInitialized) {
      return;
    }

    try {
      const { initializeUSWDSComponent } = await import('../../utils/uswds-loader.js');
      await this.updateComplete;

      const element = this.querySelector('.usa-component');
      if (element) {
        await initializeUSWDSComponent(element, 'component');
        this.uswdsInitialized = true;
        this.setupEventHandlers();
      }
    } catch (error) {
      console.warn('USWDS module initialization failed:', error);
    }
  }

  /**
   * Setup event handlers for USWDS integration
   */
  private setupEventHandlers() {
    // Listen for USWDS events and sync component state
  }

  /**
   * Clean up USWDS module
   */
  private cleanupUSWDS() {
    if (this.uswdsModule && typeof this.uswdsModule.off === 'function') {
      try {
        const triggerElements = this.querySelectorAll('.usa-component__trigger, .usa-component');
        triggerElements.forEach(trigger => {
          this.uswdsModule.off(trigger);
        });
      } catch (error) {
        console.warn('Error cleaning up USWDS module:', error);
      }
    }

    this.uswdsModule = null;
    this.uswdsInitialized = false;
  }

  render() {
    return html`<slot></slot>`;
  }
}
```

### Component Lifecycle Checklist

- [ ] Research USWDS source implementation first
- [ ] Implement multi-phase attribute application
- [ ] Add USWDS module to build optimization
- [ ] Test in both Storybook and standalone environments
- [ ] Handle both pre and post-initialization DOM states
- [ ] Include proper cleanup in disconnectedCallback
- [ ] Add adequate spacing in Storybook stories
- [ ] Test DOM transformation scenarios
- [ ] Document USWDS interaction patterns
- [ ] Verify attributes persist through USWDS changes

### Component Composition Pattern

**Purpose**: Components should reuse other USWDS web components instead of duplicating their HTML markup.

#### Why Component Composition Matters

**Problem**: Components that duplicate other component's HTML markup cause:
- **Maintenance burden** - Updates must be made in multiple places
- **Inconsistency** - Behavior diverges between copies
- **Broken links** - Hardcoded paths may not work in all environments
- **Architectural violations** - Goes against DRY (Don't Repeat Yourself) principle

**Solution**: Use actual web components to compose larger components.

#### Examples of Component Composition

##### Good: Using usa-search in header ✅

```typescript
// Header component using the usa-search web component
import '../search/index.js';  // Import the search component

render() {
  return html`
    <header class="usa-header">
      <nav class="usa-nav">
        ${this.showSearch ? html`
          <usa-search
            size="small"
            placeholder="${this.searchPlaceholder}"
            submit-icon-src="/img/usa-icons-bg/search--white.svg"
            @search-submit="${this.handleSearch}"
          ></usa-search>
        ` : ''}
      </nav>
    </header>
  `;
}
```

##### Bad: Duplicating search HTML inline ❌

```typescript
// Header component duplicating search HTML
render() {
  return html`
    <header class="usa-header">
      <nav class="usa-nav">
        ${this.showSearch ? html`
          <form class="usa-search usa-search--small" role="search">
            <label class="usa-sr-only" for="search-field">Search</label>
            <input
              class="usa-input"
              id="search-field"
              type="search"
              placeholder="${this.searchPlaceholder}"
            />
            <button class="usa-button" type="submit">
              <img src="/assets/img/search.svg" alt="Search" />
            </button>
          </form>
        ` : ''}
      </nav>
    </header>
  `;
}
```

**Problems with inline approach**:
- Duplicates usa-search component's HTML
- Hardcoded image paths may break
- No access to usa-search's behavior and events
- Must manually update when USWDS changes

#### Common Composition Patterns

##### Header → Search

Header component should use `<usa-search>` for search functionality:
```typescript
shouldUseComponents: ['usa-search']
```

##### Modal → Icon + Button

Modal component should use `<usa-icon>` and `<usa-button>`:
```typescript
shouldUseComponents: ['usa-icon', 'usa-button']
```

##### Card → Button

Card component should use `<usa-button>` for actions:
```typescript
shouldUseComponents: ['usa-button']
```

#### Validation

The validation script (`validate-all-components-compliance.js`) automatically checks for proper component composition:

```javascript
// In USWDS_HTML_PATTERNS
header: {
  structure: ['usa-header', 'usa-navbar', 'usa-nav'],
  shouldUseComponents: ['usa-search'],
  compositionNote: 'Use usa-search web component instead of inline search HTML markup'
}
```

**What the validator checks**:
1. If component uses the web component tag (`<usa-search>`) ✅
2. If component has inline HTML instead (`class="usa-search"`) ❌
3. Provides helpful error messages with guidance

#### Implementation Checklist

When composing components:

- [ ] Import the child component at the top of the file
- [ ] Use the web component tag (e.g., `<usa-search>`) not inline HTML
- [ ] Pass properties using Lit property binding (`.prop` or `?bool`)
- [ ] Listen to component events using `@event` syntax
- [ ] Update validation pattern to check composition
- [ ] Document the composition relationship in README
- [ ] Test that child component works correctly

#### Benefits

- ✅ **Consistency** - All instances behave identically
- ✅ **Maintainability** - Fix once, works everywhere
- ✅ **Events** - Proper event handling through web component API
- ✅ **Encapsulation** - Child component manages its own state
- ✅ **USWDS Compliance** - Follows USWDS component architecture
- ✅ **Validation** - Automated checks prevent violations

---

## Testing Strategies

### Behavioral Testing

**Purpose**: Verify components render visually and behave as expected from a user perspective.

#### Overview

Behavioral testing focuses on ensuring components not only have correct DOM structure but actually work from the user's viewpoint. This approach catches issues like popups not appearing visually despite having correct DOM structure.

#### Testing Layers

##### 1. Cypress Component Tests (`.component.cy.ts`)

**Purpose**: Visual rendering and interaction verification in real browser environment

**Key Focus Areas**:
- Visual appearance verification
- Computed styles checking
- Positioning validation
- Z-index layering
- Interaction triggers
- Focus management

**Example Pattern**:
```typescript
it('should have calendar popup that is actually visible when opened', () => {
  cy.mount(`<usa-date-picker label="Test Date"></usa-date-picker>`);

  // Verify initial state
  cy.get('.usa-date-picker__calendar').should('not.exist');

  // Trigger action
  cy.get('.usa-date-picker__button').click();

  // Verify visual result
  cy.get('.usa-date-picker__calendar').should('exist').and('be.visible');

  // Verify actual content
  cy.get('.usa-date-picker__calendar__date').should('have.length.greaterThan', 0);
  cy.get('.usa-date-picker__calendar__date').first().should('be.visible');
});
```

##### 2. Visual Unit Tests (`.test.ts`)

**Purpose**: DOM structure and state verification in jsdom environment

**Key Focus Areas**:
- DOM structure verification
- State management validation
- Event handling tests
- Accessibility attributes
- Component lifecycle

**Example Pattern**:
```typescript
it('should create calendar DOM structure when opened', async () => {
  await waitForUpdate(element);

  // Initially no calendar
  expect(element.querySelector('.usa-date-picker__calendar')).toBeNull();

  // Open calendar
  element.toggleCalendar();
  await waitForUpdate(element);

  // Calendar should exist with proper structure
  const calendar = element.querySelector('.usa-date-picker__calendar');
  expect(calendar).toBeTruthy();
  expect(calendar?.getAttribute('role')).toBe('dialog');
  expect(calendar?.getAttribute('aria-modal')).toBe('true');
});
```

#### Key Testing Categories

##### Visual Rendering Verification

**What We Test**:
- Elements actually appear visually (not just in DOM)
- Components have reasonable dimensions
- Content is rendered correctly
- Interactive elements are visually clickable

**Why This Matters**:
- DOM presence doesn't guarantee visual appearance
- CSS issues can hide elements while keeping DOM structure
- Zero-height/width elements indicate rendering problems

**Example Checks**:
```typescript
cy.get('.usa-date-picker__calendar').then(($calendar) => {
  const computedStyle = window.getComputedStyle($calendar[0]);

  // Should have background (not transparent)
  expect(computedStyle.backgroundColor).to.not.equal('rgba(0, 0, 0, 0)');

  // Should have high z-index for layering
  expect(parseInt(computedStyle.zIndex) || 0).to.be.greaterThan(100);

  // Should not be hidden
  expect(computedStyle.display).to.not.equal('none');
  expect(computedStyle.visibility).to.not.equal('hidden');
});
```

##### Computed Styles and CSS Verification

**What We Test**:
- Z-index values for proper layering
- Positioning properties (not off-screen)
- Background colors and borders
- Font and text properties

##### Interaction Triggers and Focus Management

**What We Test**:
- Multiple activation methods (click, keyboard, touch)
- Keyboard shortcuts
- Focus movement
- Event handler functionality

**Example Patterns**:
```typescript
it('should verify calendar opens on multiple trigger methods', () => {
  // Test mouse click
  cy.get('.usa-date-picker__button').click();
  cy.get('.usa-date-picker__calendar').should('be.visible');

  // Test keyboard activation
  cy.get('.usa-date-picker__button').focus().type(' ');
  cy.get('.usa-date-picker__calendar').should('be.visible');

  // Test F4 shortcut from input
  cy.get('.usa-input').focus().type('{f4}');
  cy.get('.usa-date-picker__calendar').should('be.visible');
});
```

#### Best Practices

##### 1. Test Visual Behavior, Not Just DOM

```typescript
// ❌ Only tests DOM presence
expect(element.querySelector('.calendar')).toBeTruthy();

// ✅ Tests actual visibility
cy.get('.calendar').should('be.visible');
cy.get('.calendar').should('have.css', 'display').and('not.equal', 'none');
```

##### 2. Verify Computed Styles

```typescript
// ❌ Assumes styles are applied
expect(calendar.classList.contains('open')).toBe(true);

// ✅ Verifies actual visual styling
cy.get('.calendar').then(($el) => {
  const style = window.getComputedStyle($el[0]);
  expect(style.visibility).to.not.equal('hidden');
  expect(style.opacity).to.not.equal('0');
});
```

##### 3. Test Multiple Interaction Methods

```typescript
// ❌ Only tests one interaction method
cy.get('.button').click();

// ✅ Tests all user interaction patterns
cy.get('.button').click(); // Mouse
cy.get('.button').focus().type(' '); // Keyboard space
cy.get('.button').focus().type('{enter}'); // Keyboard enter
cy.get('.input').focus().type('{f4}'); // Shortcut key
```

### Browser Testing

**Purpose**: Handle browser-dependent functionality that cannot be properly simulated in jsdom.

#### Test Categories

##### Unit Tests (`*.test.ts`)
- **Environment**: jsdom (fast, lightweight)
- **Focus**: Component logic, properties, events, basic functionality
- **Run with**: `npm run test`

##### Browser Tests (`*.browser.test.ts`)
- **Environment**: Browser-like (happy-dom or real browser)
- **Focus**: USWDS integration, DOM restructuring, visual regression
- **Run with**: `npm run test:browser`
- **Use for**: USWDS JavaScript behavior, getBoundingClientRect, mouse/focus events

##### Storybook Tests
- **Environment**: Real browser via Storybook Test Runner
- **Focus**: Visual regression, component rendering, accessibility
- **Run with**: `npm run test:storybook`

##### Cypress Tests
- **Environment**: Real browser
- **Focus**: User interactions, E2E workflows, integration testing
- **Run with**: `npm run cypress:run` or `npm run e2e`

#### Adding New Browser Tests

##### 1. Identify Browser Dependencies

Tests need browser environment if they:
- Use `getBoundingClientRect()`
- Depend on USWDS JavaScript initialization
- Test mouse/focus/keyboard events
- Require actual DOM rendering calculations

##### 2. Create Browser Test File

```typescript
// src/components/my-component/usa-my-component.browser.test.ts
import { describe, it, expect } from 'vitest';
import './index.ts';

describe('USAMyComponent Browser Tests', () => {
  it('should handle browser-specific behavior', async () => {
    // Browser-dependent test logic here
  });
});
```

##### 3. Update Unit Tests

```typescript
// Skip browser-dependent tests in unit test file
describe.skip('Browser-Dependent Tests (See *.browser.test.ts)', () => {
  // Tests moved to browser test file
});
```

#### Best Practices

**DO**:
- ✅ Keep unit tests focused on component logic
- ✅ Use browser tests for USWDS integration
- ✅ Document why tests are moved to browser environment
- ✅ Maintain clear separation of concerns
- ✅ Use appropriate test environment for each test type

**DON'T**:
- ❌ Mix browser-dependent tests with unit tests
- ❌ Skip tests without documentation
- ❌ Lose test coverage when refactoring
- ❌ Use browser environment for simple unit tests
- ❌ Leave broken tests in the codebase

### Critical Path Testing

**Purpose**: Ensure essential component functionality never breaks.

#### Problem Statement

After discovering the critical auto-dismiss bug in `usa-alert`, we found that only **2.2%** of our 46 components have lifecycle stability tests.

**What We Found**:
- Alert Component Bug: Components auto-dismissing on property updates
- Test Gap: 97.8% of components lacked critical stability tests
- Storybook Issues: Blank frames caused by components removing themselves
- No Detection: Comprehensive functional tests missed this critical bug

#### Implementation Plan

##### Phase 1: HIGH PRIORITY (15 components)

**Complete IMMEDIATELY**:

```
accordion, button, checkbox, combo-box, date-picker, file-input,
footer, header, modal, radio, search, select, text-input,
textarea, tooltip
```

##### Phase 2: MEDIUM PRIORITY (15 components)

**Complete within 4 weeks**:

```
alert, banner, breadcrumb, card, character-count, collection,
date-range-picker, icon, identifier, in-page-navigation,
input-prefix-suffix, language-selector, link, list,
memorable-date, menu
```

##### Phase 3: REMAINING COMPONENTS (16 components)

**Complete within 6 weeks** - All remaining components to achieve 100% coverage

#### Implementation Checklist

For each component:

##### 1. Add Critical Lifecycle Tests

```typescript
describe('Component Lifecycle Stability (CRITICAL)', () => {
  it('should remain in DOM after property updates (not auto-dismiss)', async () => {
    element.variant = 'primary';
    await element.updateComplete;
    expect(document.body.contains(element)).toBe(true);

    element.variant = 'secondary';
    await element.updateComplete;
    expect(document.body.contains(element)).toBe(true);
  });

  it('should not fire unintended events on property changes', async () => {
    const dismissSpy = vi.fn();
    element.addEventListener('dismiss', dismissSpy);

    element.variant = 'secondary';
    await element.updateComplete;

    expect(dismissSpy).not.toHaveBeenCalled();
  });

  it('should handle rapid property updates without breaking', async () => {
    for (let i = 0; i < 10; i++) {
      element.variant = i % 2 === 0 ? 'primary' : 'secondary';
      await element.updateComplete;
    }

    expect(document.body.contains(element)).toBe(true);
    expect(element.variant).toBe('primary');
  });
});
```

##### 2. Add Storybook Integration Tests

```typescript
describe('Storybook Integration Tests (CRITICAL)', () => {
  it('should render correctly when created via Storybook patterns', async () => {
    // Test Storybook's component instantiation
    await element.updateComplete;
    expect(document.body.contains(element)).toBe(true);
  });

  it('should handle Storybook controls updates without breaking', async () => {
    element.setAttribute('variant', 'primary');
    await element.updateComplete;
    expect(document.body.contains(element)).toBe(true);

    element.setAttribute('variant', 'secondary');
    await element.updateComplete;
    expect(document.body.contains(element)).toBe(true);
  });
});
```

##### 3. Verify Tests Pass

```bash
npm test src/components/[component]/usa-[component].test.ts
```

#### Bug Prevention

**What These Tests Catch**:
1. Auto-dismiss bugs - Components removing themselves unintentionally
2. Blank frames - Components disappearing in Storybook
3. Event pollution - Unintended events firing on property changes
4. Lifecycle instability - Components breaking during rapid updates
5. Hot reload issues - Components not surviving development updates

**What They Don't Replace**:
- Functional testing (still needed)
- Accessibility testing (still needed)
- Visual regression testing (still needed)
- Integration testing (still needed)

### Interaction Testing

**Purpose**: Automatically detect JavaScript interaction issues.

#### 4-Layer Testing Architecture

##### Layer 1: Enhanced Unit Tests with Real Browser Behavior

**File**: `__tests__/component-interaction.test.ts`

**What it catches**:
- ✅ Unresponsive buttons
- ✅ Event handler conflicts
- ✅ Keyboard accessibility failures
- ✅ USWDS integration issues
- ✅ State synchronization problems

**Key Tests**:
```typescript
it('should actually expand component when button is clicked', async () => {
  const button = element.querySelector('.usa-component__button');
  const initialState = button.getAttribute('aria-expanded');

  button.click();
  await waitForStateChange();

  const finalState = button.getAttribute('aria-expanded');
  expect(finalState).not.toBe(initialState);
});
```

##### Layer 2: Cypress Component Tests (Real Browser)

**File**: `cypress/component/component-interaction.cy.ts`

**What it catches**:
- ✅ Real browser interaction failures
- ✅ Event propagation issues
- ✅ Focus management problems
- ✅ Accessibility violations
- ✅ Rapid clicking edge cases

**Key Tests**:
```typescript
it('should detect if buttons are completely unresponsive', () => {
  for (let i = 0; i < 3; i++) {
    cy.get('.usa-component__button').click();
    cy.wait(50);
  }

  cy.get('.usa-component__button').should('have.attr', 'aria-expanded', 'true');
});
```

##### Layer 3: Storybook Interaction Testing

**File**: `src/components/component/usa-component.interaction.stories.ts`

**What it catches**:
- ✅ Storybook-specific issues
- ✅ Module loading failures
- ✅ Visual regression
- ✅ Hot reload problems

**Key Tests**:
```typescript
export const ClickInteractionTest: Story = {
  play: async ({ canvasElement, step }) => {
    await step('Test Click Functionality', async () => {
      const button = canvasElement.querySelector('.usa-component__button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(button.getAttribute('aria-expanded')).toBe('true');
      });
    });
  },
};
```

##### Layer 4: Automated Browser Testing Script

**File**: `scripts/test-component-interactions.js`

**What it catches**:
- ✅ Cross-environment consistency
- ✅ Server dependency problems
- ✅ Integration regression
- ✅ Console error detection

#### Test Categories

##### Click Interaction Testing
- Button responsiveness to mouse clicks
- State changes after click events
- Multiple rapid clicks (race conditions)
- Mode behavior (single vs multi-select)

##### Keyboard Interaction Testing
- Enter key functionality
- Space key functionality
- Arrow key non-interaction
- Focus management

##### USWDS Integration Testing
- Console message detection
- Pre-loaded module verification
- Fallback behavior
- DOM structure compliance

##### Event Dispatching Testing
- Custom event firing
- Event detail accuracy
- Event bubbling behavior
- Event timing and sequence

##### Accessibility Testing
- ARIA attribute updates
- Focus management
- Screen reader compatibility
- Keyboard navigation patterns

### Overall Testing Strategy

#### Testing Layers

##### Layer 1: Unit Tests (Vitest + jsdom)

**Purpose**: Test component logic, properties, and basic rendering

**Files**: `src/components/*/usa-*.test.ts`

```typescript
it('should have default properties', () => {
  const element = document.createElement('usa-modal');
  expect(element.forceAction).toBe(false);
  expect(element.showSecondaryButton).toBe(true);
});
```

**What It Catches**:
- Property defaults
- Property changes
- Event dispatching
- Basic DOM structure

##### Layer 2: DOM Structure Validation

**Purpose**: Validate that components render correct USWDS DOM structures

**Files**: `__tests__/*-dom-validation.test.ts`

```typescript
import { validateDOMStructure, USWDS_DOM_SPECS } from './dom-structure-validation.js';

it('should render complete USWDS structure', async () => {
  await element.updateComplete;
  validateDOMStructure(element, USWDS_DOM_SPECS['usa-component']);
});
```

**What It Catches**:
- ✅ Missing USWDS elements
- ✅ Incorrect CSS classes
- ✅ Conditional rendering failures
- ✅ Attribute binding issues

##### Layer 3: USWDS Integration Tests

**Purpose**: Validate USWDS JavaScript transformation and behavior

```typescript
it('should have USWDS JavaScript initialized', async () => {
  await element.updateComplete;
  await new Promise(resolve => setTimeout(resolve, 500));

  expect(element.querySelector('.usa-component__transformed')).toBeTruthy();
});
```

**What It Catches**:
- USWDS transformation applied
- Event listeners attached
- Wrapper elements created
- DOM moved to proper location

##### Layer 4: Component Tests (Cypress)

**Purpose**: Test interactive behavior in real browser

```typescript
it('should open modal when button clicked', () => {
  cy.get('[data-open-modal]').click();
  cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');
});
```

**What It Catches**:
- User interactions work
- Keyboard navigation
- Focus management
- Accessibility

##### Layer 5: Storybook Tests

**Purpose**: Visual regression and story validation

**What It Catches**:
- Stories render without errors
- All variants display correctly
- Interactive controls work

#### Running Tests

```bash
# Run all DOM validation tests
npm test -- dom-validation

# Run specific component validation
npm test -- component-dom-validation.test.ts

# Run complete test suite
npm run test:complete

# Run Cypress tests
npm run cypress:component

# Run Storybook tests
npm run test:storybook
```

#### Coverage Goals

- **Unit Tests**: >80% code coverage
- **DOM Validation**: 100% of interactive components
- **USWDS Integration**: 100% of USWDS-dependent components
- **Cypress Tests**: All user-facing interactions
- **Storybook Tests**: All stories render without errors

---

## Best Practices

### Component Development

1. **Research USWDS First**: Always check USWDS source implementation
2. **Multi-phase Attributes**: Implement attributes for pre and post-USWDS initialization
3. **Proper Cleanup**: Always clean up USWDS modules in disconnectedCallback
4. **Test All States**: Test both pre and post-initialization DOM states
5. **Document Patterns**: Document USWDS interaction patterns clearly

### Testing Best Practices

1. **Test Visual Behavior**: Test what users see, not just DOM structure
2. **Use Appropriate Environment**: Match test to appropriate environment (jsdom vs browser)
3. **Test Critical Paths**: Ensure essential functionality is covered
4. **Test Interactions**: Validate all user interaction methods
5. **Test Accessibility**: Include accessibility tests in all layers

### Code Quality

1. **No Skip Without Documentation**: Document why tests are skipped
2. **Maintain Coverage**: Don't lose coverage when refactoring
3. **Separate Concerns**: Keep unit tests separate from browser tests
4. **Clear Naming**: Use descriptive test and file names
5. **Consistent Patterns**: Follow established patterns across components

---

## Related Guides

- **`docs/CYPRESS_GUIDE.md`** - Complete Cypress testing guide
- **`docs/guides/TESTING_GUIDE.md`** - Comprehensive testing documentation
- **`docs/DEBUGGING_GUIDE.md`** - Troubleshooting help
- **`docs/guides/COMPLIANCE_GUIDE.md`** - USWDS compliance requirements
- **`CLAUDE.md`** - Project overview and development guidelines

---

**Source Files Merged**:
1. `BEHAVIORAL_TESTING_METHODOLOGY.md` - Behavioral testing approach
2. `BROWSER_TESTING_STRATEGY.md` - Browser-specific testing patterns
3. `CRITICAL_TESTING_STRATEGY.md` - Critical path testing requirements
4. `INTERACTION_TESTING_STRATEGY.md` - User interaction validation
5. `TESTING_STRATEGY.md` - Overall testing strategy
6. `COMPONENT_TEMPLATE_PATTERNS.md` - Component structure templates

**Content Intentionally Omitted**: None - all important content from source files has been preserved and consolidated.
